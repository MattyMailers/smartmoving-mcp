import { access } from "node:fs/promises";
import { SmartMovingClient } from "../client.js";
import { configPath, DEFAULT_API_KEY_ENV, DEFAULT_BASE_URL, readConfig, selectProfile } from "./config.js";
import { formatError } from "./format.js";
function envFlag(name) {
    return process.env[name]?.toLowerCase() === "true";
}
function packageVersion() {
    return process.env.npm_package_version ?? "0.1.0";
}
function errorFromCheck(checks, apiKeyEnv) {
    const missingApiKey = checks.find((check) => check.name === "apiKey" && !check.ok);
    if (missingApiKey) {
        return {
            code: "AUTH_MISSING",
            message: `${apiKeyEnv} is required`,
            hint: `Run smartmoving init or export ${apiKeyEnv}.`,
        };
    }
    const failed = checks.find((check) => !check.ok);
    if (!failed) {
        return undefined;
    }
    return {
        code: `CHECK_${failed.name.toUpperCase()}_FAILED`,
        message: failed.detail ?? `${failed.name} check failed`,
        hint: "Run smartmoving doctor --json for details, then fix the failed check.",
    };
}
export async function runDoctor(options = {}) {
    const checks = [];
    const safety = {
        writesEnabled: envFlag("SMARTMOVING_ALLOW_WRITES"),
        destructiveEnabled: envFlag("SMARTMOVING_ALLOW_DESTRUCTIVE"),
    };
    checks.push({ name: "node", ok: true, detail: process.version });
    checks.push({ name: "package", ok: true, detail: packageVersion() });
    const path = configPath();
    let apiKeyEnv = DEFAULT_API_KEY_ENV;
    let baseUrl = process.env.SMARTMOVING_BASE_URL ?? DEFAULT_BASE_URL;
    try {
        await access(path);
        const config = await readConfig(path);
        checks.push({ name: "config", ok: true, detail: path });
        const profile = selectProfile(config, options.profile);
        checks.push({ name: "profile", ok: true, detail: profile.name });
        apiKeyEnv = profile.apiKeyEnv;
        baseUrl = process.env.SMARTMOVING_BASE_URL ?? profile.baseUrl;
    }
    catch (error) {
        checks.push({ name: "config", ok: false, detail: formatError(error) });
        checks.push({ name: "profile", ok: false, detail: `profile ${options.profile ?? "default"} not available` });
    }
    const apiKey = process.env[apiKeyEnv];
    if (apiKey) {
        checks.push({ name: "apiKey", ok: true, detail: `present via ${apiKeyEnv}` });
    }
    else {
        checks.push({ name: "apiKey", ok: false, detail: `${apiKeyEnv} is missing` });
    }
    try {
        const parsedBaseUrl = new URL(baseUrl);
        checks.push({ name: "baseUrl", ok: parsedBaseUrl.protocol === "http:" || parsedBaseUrl.protocol === "https:", detail: baseUrl });
    }
    catch (error) {
        checks.push({ name: "baseUrl", ok: false, detail: formatError(error) });
    }
    if (apiKey && checks.find((check) => check.name === "baseUrl")?.ok) {
        try {
            const client = new SmartMovingClient({ apiKey, baseUrl });
            await client.get("/api/ping");
            checks.push({ name: "ping", ok: true });
        }
        catch (error) {
            checks.push({ name: "ping", ok: false, detail: formatError(error) });
        }
    }
    else {
        checks.push({ name: "ping", ok: false, detail: "skipped until API key and base URL are valid" });
    }
    checks.push({ name: "mcpBinary", ok: true, detail: "smartmoving-mcp-server" });
    checks.push({ name: "safetyWrites", ok: !safety.writesEnabled, detail: safety.writesEnabled ? "writes enabled" : "writes disabled" });
    checks.push({ name: "safetyDestructive", ok: !safety.destructiveEnabled, detail: safety.destructiveEnabled ? "destructive operations enabled" : "destructive operations disabled" });
    const operationalChecks = checks.filter((check) => !check.name.startsWith("safety"));
    const ok = operationalChecks.every((check) => check.ok);
    return {
        ok,
        checks,
        safety,
        error: ok ? undefined : errorFromCheck(operationalChecks, apiKeyEnv),
    };
}
//# sourceMappingURL=doctor.js.map