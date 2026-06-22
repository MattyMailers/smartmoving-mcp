export declare const DEFAULT_BASE_URL = "https://api-public.smartmoving.com/v1";
export declare const DEFAULT_API_KEY_ENV = "SMARTMOVING_API_KEY";
export declare const CONFIG_VERSION = 1;
export declare const CREDENTIALS_VERSION = 1;
export type ApiKeySource = "env" | "local";
export interface SmartMovingProfileConfig {
    baseUrl: string;
    apiKeyEnv: string;
    apiKeySource?: ApiKeySource;
}
export interface SmartMovingCliConfig {
    version: number;
    defaultProfile: string;
    profiles: Record<string, SmartMovingProfileConfig>;
}
export interface SmartMovingCredentialsProfile {
    apiKey: string;
    createdAt: string;
    updatedAt: string;
}
export interface SmartMovingCredentials {
    version: number;
    profiles: Record<string, SmartMovingCredentialsProfile>;
}
export interface InitConfigOptions {
    profile?: string;
    apiKeyEnv?: string;
    apiKeySource?: ApiKeySource;
    baseUrl?: string;
}
export interface ResolvedProfileAuth {
    profile: SmartMovingProfileConfig & {
        name: string;
        apiKeySource: ApiKeySource;
    };
    apiKey?: string;
    apiKeyDetail: string;
    baseUrl: string;
}
export declare function configPath(): string;
export declare function credentialsPath(): string;
export declare function assertSafeEnvName(value: string): string;
export declare function assertProfileName(value: string): string;
export declare function normalizeBaseUrl(value: string): string;
export declare function normalizeApiKeySource(value: ApiKeySource | undefined): ApiKeySource;
export declare function readConfig(path?: string): Promise<SmartMovingCliConfig>;
export declare function writeInitialConfig(options: InitConfigOptions, path?: string): Promise<SmartMovingCliConfig>;
export declare function selectProfile(config: SmartMovingCliConfig, profileName?: string): SmartMovingProfileConfig & {
    name: string;
    apiKeySource: ApiKeySource;
};
export declare function readCredentials(path?: string): Promise<SmartMovingCredentials>;
export declare function writeStoredApiKey(profile: string, apiKey: string, path?: string): Promise<SmartMovingCredentials>;
export declare function readStoredApiKey(profile: string, path?: string): Promise<string | undefined>;
export declare function resolveProfileAuth(profileName?: string): Promise<ResolvedProfileAuth>;
//# sourceMappingURL=config.d.ts.map