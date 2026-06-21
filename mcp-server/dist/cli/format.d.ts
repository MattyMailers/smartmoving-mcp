export interface CliErrorLike {
    message?: string;
    statusCode?: number;
}
export declare function redactSecrets(value: string): string;
export declare function formatJson(value: unknown): string;
export declare function formatHuman(label: string, value: unknown): string;
export declare function formatError(error: unknown): string;
//# sourceMappingURL=format.d.ts.map