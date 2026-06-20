// ============================================================================
// SmartMoving API HTTP Client
// ============================================================================
const DEFAULT_BASE_URL = "https://api-public.smartmoving.com/v1";
const TRUTHY_VALUES = new Set(["1", "true", "yes", "on"]);
function envFlag(name) {
    const value = process.env[name];
    return value ? TRUTHY_VALUES.has(value.trim().toLowerCase()) : false;
}
function redactSecrets(value, apiKey) {
    let redacted = value;
    if (apiKey) {
        redacted = redacted.split(apiKey).join("[REDACTED_API_KEY]");
    }
    return redacted
        .replace(/(x-api-key\s*[:=]\s*)[^\s,"'}]+/gi, "$1[REDACTED]")
        .replace(/(api[-_ ]?key\s*[:=]\s*)[^\s,"'}]+/gi, "$1[REDACTED]")
        .replace(/(authorization\s*[:=]\s*bearer\s+)[^\s,"'}]+/gi, "$1[REDACTED]");
}
export class SmartMovingClient {
    apiKey;
    baseUrl;
    allowWrites;
    allowDestructive;
    constructor(options) {
        this.apiKey = options.apiKey;
        this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
        this.allowWrites = options.allowWrites ?? envFlag("SMARTMOVING_ALLOW_WRITES");
        this.allowDestructive = options.allowDestructive ?? envFlag("SMARTMOVING_ALLOW_DESTRUCTIVE");
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
    assertWritesAllowed(method, path) {
        if (!this.allowWrites) {
            const error = {
                statusCode: 403,
                message: `SmartMoving MCP is running in read-only mode. Refused ${method} ${path}. ` +
                    "Set SMARTMOVING_ALLOW_WRITES=true only after you are ready for this agent to change CRM data.",
            };
            throw error;
        }
        if (method === "DELETE" && !this.allowDestructive) {
            const error = {
                statusCode: 403,
                message: `SmartMoving destructive operations are disabled. Refused ${method} ${path}. ` +
                    "Set SMARTMOVING_ALLOW_DESTRUCTIVE=true only when you intentionally want to allow delete-style operations.",
            };
            throw error;
        }
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
                message: redactSecrets(`SmartMoving API error: HTTP ${response.status} - ${errorBody}`, this.apiKey),
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
        this.assertWritesAllowed("POST", path);
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
        this.assertWritesAllowed("PUT", path);
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
        this.assertWritesAllowed("PATCH", path);
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
        this.assertWritesAllowed("DELETE", path);
        const url = this.buildUrl(path, queryParams);
        const response = await fetch(url, {
            method: "DELETE",
            headers: this.defaultHeaders(),
        });
        return this.handleResponse(response);
    }
}
//# sourceMappingURL=client.js.map