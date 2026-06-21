export declare const DEFAULT_BASE_URL = "https://api-public.smartmoving.com/v1";
export declare const DEFAULT_API_KEY_ENV = "SMARTMOVING_API_KEY";
export declare const CONFIG_VERSION = 1;
export interface SmartMovingProfileConfig {
    baseUrl: string;
    apiKeyEnv: string;
}
export interface SmartMovingCliConfig {
    version: number;
    defaultProfile: string;
    profiles: Record<string, SmartMovingProfileConfig>;
}
export interface InitConfigOptions {
    profile?: string;
    apiKeyEnv?: string;
    baseUrl?: string;
}
export declare function configPath(): string;
export declare function assertSafeEnvName(value: string): string;
export declare function assertProfileName(value: string): string;
export declare function normalizeBaseUrl(value: string): string;
export declare function readConfig(path?: string): Promise<SmartMovingCliConfig>;
export declare function writeInitialConfig(options: InitConfigOptions, path?: string): Promise<SmartMovingCliConfig>;
export declare function selectProfile(config: SmartMovingCliConfig, profileName?: string): SmartMovingProfileConfig & {
    name: string;
};
//# sourceMappingURL=config.d.ts.map