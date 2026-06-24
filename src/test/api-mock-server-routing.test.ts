/**
 * @jest-environment node
 */

function mockJsonResponse(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("server api mock routing", () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  it("starts the MSW server before server-side mock requests and rewrites backend paths to /api", async () => {
    process.env.NEXT_PUBLIC_USE_MOCK = "true";
    process.env.FRONTEND_ORIGIN = "http://localhost:3000";
    const ensureMockServer = jest.fn().mockResolvedValue(undefined);
    jest.doMock("@/mocks/server-control", () => ({ ensureMockServer }));
    const fetchMock = jest.fn().mockResolvedValue(mockJsonResponse({ isSuccess: true }));
    global.fetch = fetchMock as typeof fetch;

    const { api } = await import("@/lib/api/api");

    await api.server.get("/sessions/900", { skipAuth: true });

    expect(ensureMockServer).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/sessions/900",
      expect.objectContaining({ method: "GET" })
    );
  });

  it("keeps existing /api paths on the frontend origin in mock mode", async () => {
    process.env.NEXT_PUBLIC_USE_MOCK = "true";
    process.env.FRONTEND_ORIGIN = "http://localhost:3000";
    jest.doMock("@/mocks/server-control", () => ({ ensureMockServer: jest.fn() }));
    const fetchMock = jest.fn().mockResolvedValue(mockJsonResponse({ isSuccess: true }));
    global.fetch = fetchMock as typeof fetch;

    const { api } = await import("@/lib/api/api");

    await api.get("/api/sessions/900", { skipAuth: true });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/sessions/900",
      expect.objectContaining({ method: "GET" })
    );
  });

  it("uses the backend base URL when mock mode is disabled", async () => {
    process.env.NEXT_PUBLIC_USE_MOCK = "false";
    process.env.BACKEND_API_BASE = "https://backend.example.com";
    const fetchMock = jest.fn().mockResolvedValue(mockJsonResponse({ isSuccess: true }));
    global.fetch = fetchMock as typeof fetch;

    const { api } = await import("@/lib/api/api");

    await api.server.get("/sessions/900", { skipAuth: true });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://backend.example.com/sessions/900",
      expect.objectContaining({ method: "GET" })
    );
  });
});
