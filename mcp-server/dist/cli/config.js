import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { homedir } from "node:os";
export const DEFAULT_BASE_URL = "https://api-public.smartmoving.com/v1";
export const DEFAULT_API_KEY_ENV = "SMARTMOVING_API_KEY";
export const CONFIG_VERSION = 1;
export const CREDENTIALS_VERSION = 1;
export function configPath() {
    return process.env.SMARTMOVING_CONFIG_PATH ?? join(homedir(), ".config", "smartmoving", "config.json");
}
export function credentialsPath() {
    return process.env.SMARTMOVING_CREDENTIALS_PATH ?? join(homedir(), ".config", "smartmoving", "credentials.json");
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
export function normalizeApiKeySource(value) {
    return value ?? "env";
}
export async function readConfig(path = configPath()) {
    const raw = await readFile(path, "utf8");
    const parsed = JSON.parse(raw);
    if (parsed.version !== CONFIG_VERSION || !parsed.defaultProfile || typeof parsed.profiles !== "object") {
        throw new Error(`Invalid SmartMoving CLI config at ${path}. Run smartmoving init to recreate it.`);
    }
    for (const profile of Object.values(parsed.profiles)) {
        profile.apiKeySource = normalizeApiKeySource(profile.apiKeySource);
    }
    return parsed;
}
export async function writeInitialConfig(options, path = configPath()) {
    const profile = assertProfileName(options.profile ?? "default");
    const apiKeyEnv = assertSafeEnvName(options.apiKeyEnv ?? DEFAULT_API_KEY_ENV);
    const baseUrl = normalizeBaseUrl(options.baseUrl ?? DEFAULT_BASE_URL);
    const apiKeySource = normalizeApiKeySource(options.apiKeySource);
    const config = {
        version: CONFIG_VERSION,
        defaultProfile: profile,
        profiles: {
            [profile]: { baseUrl, apiKeyEnv, apiKeySource },
        },
    };
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, `${JSON.stringify(config, null, 2)}\n`, { mode: 0o600 });
    await chmod(path, 0o600).catch(() => undefined);
    return config;
}
export function selectProfile(config, profileName) {
    const name = profileName ?? config.defaultProfile;
    const profile = config.profiles[name];
    if (!profile) {
        throw new Error(`Profile '${name}' was not found in SmartMoving CLI config.`);
    }
    return { name, ...profile, apiKeySource: normalizeApiKeySource(profile.apiKeySource) };
}
export async function readCredentials(path = credentialsPath()) {
    const raw = await readFile(path, "utf8");
    const parsed = JSON.parse(raw);
    if (parsed.version !== CREDENTIALS_VERSION || typeof parsed.profiles !== "object") {
        throw new Error(`Invalid SmartMoving CLI credentials at ${path}. Run smartmoving init to recreate them.`);
    }
    return parsed;
}
export async function writeStoredApiKey(profile, apiKey, path = credentialsPath()) {
    const name = assertProfileName(profile);
    const trimmed = apiKey.trim();
    if (!trimmed) {
        throw new Error("API key cannot be empty.");
    }
    let credentials = { version: CREDENTIALS_VERSION, profiles: {} };
    try {
        credentials = await readCredentials(path);
    }
    catch {
        credentials = { version: CREDENTIALS_VERSION, profiles: {} };
    }
    const now = new Date().toISOString();
    const existing = credentials.profiles[name];
    credentials.profiles[name] = {
        apiKey: trimmed,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
    };
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, `${JSON.stringify(credentials, null, 2)}\n`, { mode: 0o600 });
    await chmod(path, 0o600).catch(() => undefined);
    return credentials;
}
export async function readStoredApiKey(profile, path = credentialsPath()) {
    const credentials = await readCredentials(path);
    return credentials.profiles[profile]?.apiKey;
}
export async function resolveProfileAuth(profileName) {
    const config = await readConfig(configPath());
    const profile = selectProfile(config, profileName);
    const baseUrl = process.env.SMARTMOVING_BASE_URL ?? profile.baseUrl;
    const envKey = process.env[profile.apiKeyEnv];
    if (envKey) {
        return {
            profile,
            apiKey: envKey,
            apiKeyDetail: `present via ${profile.apiKeyEnv}`,
            baseUrl,
        };
    }
    if (profile.apiKeySource === "local") {
        try {
            const localKey = await readStoredApiKey(profile.name, credentialsPath());
            if (localKey) {
                return {
                    profile,
                    apiKey: localKey,
                    apiKeyDetail: `present in local credentials for profile ${profile.name}`,
                    baseUrl,
                };
            }
        }
        catch {
            // Doctor reports missing auth cleanly; command callers get the same stable message.
        }
    }
    return {
        profile,
        apiKey: undefined,
        apiKeyDetail: profile.apiKeySource === "local" ? `local credentials for profile ${profile.name} are missing` : `${profile.apiKeyEnv} is missing`,
        baseUrl,
    };
}
//# sourceMappingURL=config.js.map