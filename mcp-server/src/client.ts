// ============================================================================
// SmartMoving API HTTP Client
// ============================================================================

import { ApiError } from "./types.js";

const DEFAULT_BASE_URL = "https://api-public.smartmoving.com/v1";

export interface SmartMovingClientOptions {
  apiKey: string;
  baseUrl?: string;
}

export class SmartMovingClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(options: SmartMovingClientOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
  }

  // -------------------------------------------------------------------------
  // Internal helpers
  // -------------------------------------------------------------------------

  private buildUrl(
    path: string,
    queryParams?: Record<string, string | number | boolean | null | undefined>,
  ): string {
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

  private defaultHeaders(): Record<string, string> {
    return {
      "x-api-key": this.apiKey,
      Accept: "application/json",
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 204) {
      return {} as T;
    }

    const contentType = response.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");

    if (!response.ok) {
      let errorBody: string;
      try {
        errorBody = isJson
          ? JSON.stringify(await response.json(), null, 2)
          : await response.text();
      } catch {
        errorBody = `HTTP ${response.status} ${response.statusText}`;
      }

      const apiError: ApiError = {
        statusCode: response.status,
        message: `SmartMoving API error: HTTP ${response.status} - ${errorBody}`,
      };
      throw apiError;
    }

    if (isJson) {
      return (await response.json()) as T;
    }

    // Some endpoints may return plain text
    return (await response.text()) as unknown as T;
  }

  // -------------------------------------------------------------------------
  // Public HTTP methods
  // -------------------------------------------------------------------------

  async get<T = unknown>(
    path: string,
    queryParams?: Record<string, string | number | boolean | null | undefined>,
  ): Promise<T> {
    const url = this.buildUrl(path, queryParams);
    const response = await fetch(url, {
      method: "GET",
      headers: this.defaultHeaders(),
    });
    return this.handleResponse<T>(response);
  }

  async post<T = unknown>(
    path: string,
    body?: unknown,
    queryParams?: Record<string, string | number | boolean | null | undefined>,
  ): Promise<T> {
    const url = this.buildUrl(path, queryParams);
    const headers: Record<string, string> = {
      ...this.defaultHeaders(),
      "Content-Type": "application/json",
    };
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async put<T = unknown>(
    path: string,
    body?: unknown,
    queryParams?: Record<string, string | number | boolean | null | undefined>,
  ): Promise<T> {
    const url = this.buildUrl(path, queryParams);
    const headers: Record<string, string> = {
      ...this.defaultHeaders(),
      "Content-Type": "application/json",
    };
    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async patch<T = unknown>(
    path: string,
    body?: unknown,
    queryParams?: Record<string, string | number | boolean | null | undefined>,
  ): Promise<T> {
    const url = this.buildUrl(path, queryParams);
    const headers: Record<string, string> = {
      ...this.defaultHeaders(),
      "Content-Type": "application/json",
    };
    const response = await fetch(url, {
      method: "PATCH",
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async delete<T = unknown>(
    path: string,
    queryParams?: Record<string, string | number | boolean | null | undefined>,
  ): Promise<T> {
    const url = this.buildUrl(path, queryParams);
    const response = await fetch(url, {
      method: "DELETE",
      headers: this.defaultHeaders(),
    });
    return this.handleResponse<T>(response);
  }
}
