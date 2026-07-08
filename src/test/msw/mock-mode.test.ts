import { isMockModeEnabled } from "@/mocks/is-mock-mode-enabled";

function setNodeEnv(value: string | undefined) {
  Object.defineProperty(process.env, "NODE_ENV", {
    value,
    configurable: true,
    writable: true,
  });
}

describe("isMockModeEnabled", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalUseMock = process.env.NEXT_PUBLIC_USE_MOCK;

  afterEach(() => {
    setNodeEnv(originalNodeEnv);
    if (originalUseMock === undefined) {
      delete process.env.NEXT_PUBLIC_USE_MOCK;
    } else {
      process.env.NEXT_PUBLIC_USE_MOCK = originalUseMock;
    }
  });

  it("non-production에서 NEXT_PUBLIC_USE_MOCK=true이면 mock mode를 활성화한다", () => {
    setNodeEnv("test");
    process.env.NEXT_PUBLIC_USE_MOCK = "true";

    expect(isMockModeEnabled()).toBe(true);
  });

  it("production에서는 NEXT_PUBLIC_USE_MOCK=true여도 mock mode를 비활성화한다", () => {
    setNodeEnv("production");
    process.env.NEXT_PUBLIC_USE_MOCK = "true";

    expect(isMockModeEnabled()).toBe(false);
  });

  it("NEXT_PUBLIC_USE_MOCK=true가 아니면 mock mode를 비활성화한다", () => {
    setNodeEnv("test");
    process.env.NEXT_PUBLIC_USE_MOCK = "false";

    expect(isMockModeEnabled()).toBe(false);
  });
});
