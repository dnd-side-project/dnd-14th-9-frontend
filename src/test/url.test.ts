import { getSessionShareUrl, buildQueryString, parseQueryString } from "@/lib/utils/url";

describe("getSessionShareUrl", () => {
  it("sessionId를 포함한 URL을 생성해야 합니다", () => {
    const url = getSessionShareUrl("abc123");
    expect(url).toContain("/session/abc123");
    expect(url).toMatch(/^https?:\/\/.+\/session\/abc123$/);
  });

  it("다양한 sessionId 형식을 처리해야 합니다", () => {
    expect(getSessionShareUrl("simple")).toContain("/session/simple");
    expect(getSessionShareUrl("with-dash")).toContain("/session/with-dash");
    expect(getSessionShareUrl("123456")).toContain("/session/123456");
  });

  it("URL 형식이 올바른지 확인해야 합니다", () => {
    const url = getSessionShareUrl("test-id");
    expect(url).toMatch(/^https?:\/\/.+\/session\/test-id$/);
  });
});

describe("buildQueryString", () => {
  it("기본 파라미터를 query string으로 변환해야 합니다", () => {
    const params = { name: "test", age: 25 };
    expect(buildQueryString(params)).toBe("name=test&age=25");
  });

  it("boolean 값을 문자열로 변환해야 합니다", () => {
    const params = { active: true, disabled: false };
    expect(buildQueryString(params)).toBe("active=true&disabled=false");
  });

  it("undefined 값을 제외해야 합니다", () => {
    const params = { name: "test", value: undefined };
    expect(buildQueryString(params)).toBe("name=test");
  });

  it("null 값을 제외해야 합니다", () => {
    const params = { name: "test", value: null };
    expect(buildQueryString(params)).toBe("name=test");
  });

  it("빈 문자열을 제외해야 합니다", () => {
    const params = { name: "test", empty: "" };
    expect(buildQueryString(params)).toBe("name=test");
  });

  it("모든 값이 제외되면 빈 문자열을 반환해야 합니다", () => {
    const params = { a: undefined, b: null, c: "" };
    expect(buildQueryString(params)).toBe("");
  });

  it("빈 객체는 빈 문자열을 반환해야 합니다", () => {
    expect(buildQueryString({})).toBe("");
  });

  it("숫자 0을 포함해야 합니다", () => {
    const params = { count: 0 };
    expect(buildQueryString(params)).toBe("count=0");
  });

  it("복합 파라미터를 처리해야 합니다", () => {
    const params = {
      name: "test",
      age: 25,
      active: true,
      skip: undefined,
      value: null,
      empty: "",
    };
    expect(buildQueryString(params)).toBe("name=test&age=25&active=true");
  });
});

describe("parseQueryString", () => {
  it("기본 query string을 파싱해야 합니다", () => {
    const result = parseQueryString("name=test&age=25");
    expect(result).toEqual({ name: "test", age: "25" });
  });

  it("빈 문자열은 빈 객체를 반환해야 합니다", () => {
    const result = parseQueryString("");
    expect(result).toEqual({});
  });

  it("단일 파라미터를 파싱해야 합니다", () => {
    const result = parseQueryString("name=test");
    expect(result).toEqual({ name: "test" });
  });

  it("URL 인코딩된 값을 디코딩해야 합니다", () => {
    const result = parseQueryString("message=hello%20world");
    expect(result).toEqual({ message: "hello world" });
  });

  it("특수 문자를 처리해야 합니다", () => {
    const result = parseQueryString("email=test%40example.com");
    expect(result).toEqual({ email: "test@example.com" });
  });

  it("여러 파라미터를 파싱해야 합니다", () => {
    const result = parseQueryString("name=test&age=25&active=true");
    expect(result).toEqual({ name: "test", age: "25", active: "true" });
  });

  it("? 접두사가 있는 query string을 파싱해야 합니다", () => {
    const result = parseQueryString("?name=test&age=25");
    expect(result).toEqual({ name: "test", age: "25" });
  });

  it("값이 없는 파라미터를 처리해야 합니다", () => {
    const result = parseQueryString("name=&age=25");
    expect(result).toEqual({ name: "", age: "25" });
  });

  it("타입 매개변수를 사용할 수 있어야 합니다", () => {
    type QueryParams = {
      name: string;
      age: string;
      [key: string]: string;
    };
    const result = parseQueryString<QueryParams>("name=test&age=25");
    expect(result).toEqual({ name: "test", age: "25" });
  });
});
