import { afterEach, describe, expect, it, vi } from "vitest";
import { SmartMovingClient } from "./client.js";

const apiKey = "test-smartmoving-api-key";

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
    ...init,
  });
}

describe("SmartMovingClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("sends read requests with API key and query params", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    const client = new SmartMovingClient({ apiKey, baseUrl: "https://example.test/v1" });
    const result = await client.get("/api/leads", { page: 2, pageSize: 25, empty: "" });

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith("https://example.test/v1/api/leads?page=2&pageSize=25", {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
        Accept: "application/json",
      },
    });
  });

  it("blocks write requests by default", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const client = new SmartMovingClient({ apiKey, baseUrl: "https://example.test/v1" });

    await expect(client.post("/api/premium/leads", { name: "Synthetic Lead" })).rejects.toMatchObject({
      statusCode: 403,
      message: expect.stringContaining("read-only mode"),
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("allows write requests when explicitly enabled", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ leadId: "00000000-0000-0000-0000-000000000001" }));
    vi.stubGlobal("fetch", fetchMock);

    const client = new SmartMovingClient({
      apiKey,
      baseUrl: "https://example.test/v1",
      allowWrites: true,
    });

    const result = await client.post("/api/premium/leads", { name: "Synthetic Lead" });

    expect(result).toEqual({ leadId: "00000000-0000-0000-0000-000000000001" });
    expect(fetchMock).toHaveBeenCalledWith("https://example.test/v1/api/premium/leads", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ name: "Synthetic Lead" }),
    }));
  });

  it("requires destructive permission for delete requests", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const client = new SmartMovingClient({
      apiKey,
      baseUrl: "https://example.test/v1",
      allowWrites: true,
    });

    await expect(client.delete("/api/premium/opportunities/opp/jobs/job")).rejects.toMatchObject({
      statusCode: 403,
      message: expect.stringContaining("destructive operations are disabled"),
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("redacts API keys from SmartMoving error responses", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ message: `bad key ${apiKey}` }, { status: 401 }));
    vi.stubGlobal("fetch", fetchMock);

    const client = new SmartMovingClient({ apiKey, baseUrl: "https://example.test/v1" });

    await expect(client.get("/api/ping")).rejects.toMatchObject({
      statusCode: 401,
      message: expect.not.stringContaining(apiKey),
    });
  });
});
