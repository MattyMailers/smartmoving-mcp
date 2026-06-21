import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { homedir } from "node:os";
export const DEFAULT_BASE_URL = "https://api-public.smartmoving.com/v1";
export const DEFAULT_API_KEY_ENV = "SMARTMOVING_API_KEY";
export const CONFIG_VERSION = 1;
export function configPath() {
    return process.env.SMARTMOVING_CONFIG_PATH ?? join(homedir(), ".config", "smartmoving", "config.json");
}
export function assertSafeEnvName(value) {
    if (!/^[A-Z_][A-Z0-9_]*$/.test(value)) {
        throw new Error("API key environment variable must use uppercase letters, numbers, and underscores, and cannot start with a number.");
    }
    return value;
}
export function assertProfileName(value) {
    if (!/^[a-zA-Z0-9._-]+$/.test(value)) {
        throw new Error("Profile name may only contain letters, numbers, dots, underscores, and hyphens.");
    }
    return value;
}
export function normalizeBaseUrl(value) {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error("Base URL must use http or https.");
    }
    return url.toString().replace(/\/$/, "");
}
export async function readConfig(path = configPath()) {
    const raw = await readFile(path, "utf8");
    const parsed = JSON.parse(raw);
    if (parsed.version !== CONFIG_VERSION || !parsed.defaultProfile || typeof parsed.profiles !== "object") {
        throw new Error(`Invalid SmartMoving CLI config at ${path}. Run smartmoving init to recreate it.`);
    }
    return parsed;
}
export async function writeInitialConfig(options, path = configPath()) {
    const profile = assertProfileName(options.profile ?? "default");
    const apiKeyEnv = assertSafeEnvName(options.apiKeyEnv ?? DEFAULT_API_KEY_ENV);
    const baseUrl = normalizeBaseUrl(options.baseUrl ?? DEFAULT_BASE_URL);
    const config = {
        version: CONFIG_VERSION,
        defaultProfile: profile,
        profiles: {
            [profile]: { baseUrl, apiKeyEnv },
        },
    };
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, `${JSON.stringify(config, null, 2)}\n`, { mode: 0o600 });
    return config;
}
export function selectProfile(config, profileName) {
    const name = profileName ?? config.defaultProfile;
    const profile = config.profiles[name];
    if (!profile) {
        throw new Error(`Profile '${name}' was not found in SmartMoving CLI config.`);
    }
    return { name, ...profile };
}
//# sourceMappingURL=config.js.map