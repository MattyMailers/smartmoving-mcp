export interface SmartMovingClientOptions {
    apiKey: string;
    baseUrl?: string;
}
export declare class SmartMovingClient {
    private readonly apiKey;
    private readonly baseUrl;
    constructor(options: SmartMovingClientOptions);
    private buildUrl;
    private defaultHeaders;
    private handleResponse;
    get<T = unknown>(path: string, queryParams?: Record<string, string | number | boolean | null | undefined>): Promise<T>;
    post<T = unknown>(path: string, body?: unknown, queryParams?: Record<string, string | number | boolean | null | undefined>): Promise<T>;
    put<T = unknown>(path: string, body?: unknown, queryParams?: Record<string, string | number | boolean | null | undefined>): Promise<T>;
    patch<T = unknown>(path: string, body?: unknown, queryParams?: Record<string, string | number | boolean | null | undefined>): Promise<T>;
    delete<T = unknown>(path: string, queryParams?: Record<string, string | number | boolean | null | undefined>): Promise<T>;
}
//# sourceMappingURL=client.d.ts.map