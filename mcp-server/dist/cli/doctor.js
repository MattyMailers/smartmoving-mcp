import { access } from "node:fs/promises";
import { SmartMovingClient } from "../client.js";
import { configPath, DEFAULT_API_KEY_ENV, DEFAULT_BASE_URL, readConfig, resolveProfileAuth, selectProfile } from "./config.js";
import { formatError } from "./format.js";
function envFlag(name) {
    return process.env[name]?.toLowerCase() === "true";
}
function packageVersion() {
    return process.env.npm_package_version ?? "0.1.0";
}
function errorFromCheck(checks, apiKeyLabel) {
    const missingApiKey = checks.find((check) => check.name === "apiKey" && !check.ok);
    if (missingApiKey) {
        return {
            code: "AUTH_MISSING",
            message: `${apiKeyLabel} is required`,
            hint: `Run smartmoving init or export ${apiKeyLabel}.`,
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
    let apiKeyLabel = DEFAULT_API_KEY_ENV;
    let apiKey;
    let baseUrl = process.env.SMARTMOVING_BASE_URL ?? DEFAULT_BASE_URL;
    try {
        await access(path);
        const config = await readConfig(path);
        checks.push({ name: "config", ok: true, detail: path });
        const profile = selectProfile(config, options.profile);
        checks.push({ name: "profile", ok: true, detail: profile.name });
        apiKeyLabel = profile.apiKeyEnv;
        const auth = await resolveProfileAuth(profile.name);
        apiKey = auth.apiKey;
        baseUrl = auth.baseUrl;
        checks.push({ name: "apiKey", ok: Boolean(apiKey), detail: auth.apiKeyDetail });
    }
    catch (error) {
        checks.push({ name: "config", ok: false, detail: formatError(error) });
        checks.push({ name: "profile", ok: false, detail: `profile ${options.profile ?? "default"} not available` });
        apiKey = process.env[apiKeyLabel];
        checks.push({ name: "apiKey", ok: Boolean(apiKey), detail: apiKey ? `present via ${apiKeyLabel}` : `${apiKeyLabel} is missing` });
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
        error: ok ? undefined : errorFromCheck(operationalChecks, apiKeyLabel),
    };
}
//# sourceMappingURL=doctor.js.map