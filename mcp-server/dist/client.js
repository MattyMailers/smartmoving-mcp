// ============================================================================
// SmartMoving API HTTP Client
// ============================================================================
const DEFAULT_BASE_URL = "https://api-public.smartmoving.com/v1";
export class SmartMovingClient {
    apiKey;
    baseUrl;
    constructor(options) {
        this.apiKey = options.apiKey;
        this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    }
    // -------------------------------------------------------------------------
    // Internal helpers
    // -------------------------------------------------------------------------
    buildUrl(path, queryParams) {
        // Ensure path starts with /
        const normalizedPath = path.startsWith("/") ? path : `/${path}`;
        const url = new URL(`${this.baseUrl}${normalizedPath}`);
        if (queryParams) {
            for (const [key, value] of Object.entries(queryParams)) {
                if (value !== null && value !== undefined && value !== "") {
                    url.searchParams.set(key, String(value));
                }
            }
        }
        return url.toString();
    }
    defaultHeaders() {
        return {
            "x-api-key": this.apiKey,
            Accept: "application/json",
        };
    }
    async handleResponse(response) {
        if (response.status === 204) {
            return {};
        }
        const contentType = response.headers.get("content-type") ?? "";
        const isJson = contentType.includes("application/json");
        if (!response.ok) {
            let errorBody;
            try {
                errorBody = isJson
                    ? JSON.stringify(await response.json(), null, 2)
                    : await response.text();
            }
            catch {
                errorBody = `HTTP ${response.status} ${response.statusText}`;
            }
            const apiError = {
                statusCode: response.status,
                message: `SmartMoving API error: HTTP ${response.status} - ${errorBody}`,
            };
            throw apiError;
        }
        const text = await response.text();
        // Some successful SmartMoving write endpoints return HTTP 200 with an empty body.
        // Treat that as a successful empty object instead of an empty string so MCP tools
        // don't look like they failed just because there was no response payload.
        if (!text.trim()) {
            return {};
        }
        if (isJson) {
            return JSON.parse(text);
        }
        // Some endpoints may return plain text
        return text;
    }
    // -------------------------------------------------------------------------
    // Public HTTP methods
    // -------------------------------------------------------------------------
    async get(path, queryParams) {
        const url = this.buildUrl(path, queryParams);
        const response = await fetch(url, {
            method: "GET",
            headers: this.defaultHeaders(),
        });
        return this.handleResponse(response);
    }
    async post(path, body, queryParams) {
        const url = this.buildUrl(path, queryParams);
        const headers = {
            ...this.defaultHeaders(),
            "Content-Type": "application/json",
        };
        const response = await fetch(url, {
            method: "POST",
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
        return this.handleResponse(response);
    }
    async put(path, body, queryParams) {
        const url = this.buildUrl(path, queryParams);
        const headers = {
            ...this.defaultHeaders(),
            "Content-Type": "application/json",
        };
        const response = await fetch(url, {
            method: "PUT",
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
        return this.handleResponse(response);
    }
    async patch(path, body, queryParams) {
        const url = this.buildUrl(path, queryParams);
        const headers = {
            ...this.defaultHeaders(),
            "Content-Type": "application/json",
        };
        const response = await fetch(url, {
            method: "PATCH",
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
        return this.handleResponse(response);
    }
    async delete(path, queryParams) {
        const url = this.buildUrl(path, queryParams);
        const response = await fetch(url, {
            method: "DELETE",
            headers: this.defaultHeaders(),
        });
        return this.handleResponse(response);
    }
}
//# sourceMappingURL=client.js.map