import { getSessionShareUrl, buildQueryString, parseQueryString } from "@/lib/utils/url";

describe("getSessionShareUrl", () => {
  it("sessionId를 base62 인코딩한 단축 URL을 생성해야 합니다", () => {
    const url = getSessionShareUrl(12345);
    expect(url).toContain("/s/");
    expect(url).toMatch(/^https?:\/\/.+\/s\/[0-9a-zA-Z]+$/);
  });

  it("다양한 sessionId를 처리해야 합니다", () => {
    expect(getSessionShareUrl(1)).toContain("/s/");
    expect(getSessionShareUrl(0)).toContain("/s/");
    expect(getSessionShareUrl(999999)).toContain("/s/");
  });

  it("URL 형식이 올바른지 확인해야 합니다", () => {
    const url = getSessionShareUrl(42);
    expect(url).toMatch(/^https?:\/\/.+\/s\/[0-9a-zA-Z]+$/);
  });
});

describe("buildQueryString", () => {
  it("기본 파라미터를 query string으로 변환해야 합니다", () => {
    const params = { name: "test", age: 25 };
    expect(buildQueryString(params)).toBe("?name=test&age=25");
  });

  it("boolean 값을 문자열로 변환해야 합니다", () => {
    const params = { active: true, disabled: false };
    expect(buildQueryString(params)).toBe("?active=true&disabled=false");
  });

  it("undefined 값을 제외해야 합니다", () => {
    const params = { name: "test", value: undefined };
    expect(buildQueryString(params)).toBe("?name=test");
  });

  it("null 값을 제외해야 합니다", () => {
    const params = { name: "test", value: null };
    expect(buildQueryString(params)).toBe("?name=test");
  });

  it("빈 문자열을 제외해야 합니다", () => {
    const params = { name: "test", empty: "" };
    expect(buildQueryString(params)).toBe("?name=test");
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
    expect(buildQueryString(params)).toBe("?count=0");
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
    expect(buildQueryString(params)).toBe("?name=test&age=25&active=true");
  });

  it("배열 값을 콤마로 구분된 문자열로 변환해야 합니다", () => {
    const params = { timeSlots: ["MORNING", "AFTERNOON", "EVENING"] };
    expect(buildQueryString(params)).toBe("?timeSlots=MORNING%2CAFTERNOON%2CEVENING");
  });

  it("배열에서 undefined, null, 빈 문자열을 제외해야 합니다", () => {
    const params = { items: ["a", undefined, "b", null, "", "c"] };
    expect(buildQueryString(params)).toBe("?items=a%2Cb%2Cc");
  });

  it("빈 배열은 파라미터에서 제외해야 합니다", () => {
    const params = { name: "test", items: [] };
    expect(buildQueryString(params)).toBe("?name=test");
  });

  it("필터링 후 빈 배열은 파라미터에서 제외해야 합니다", () => {
    const params = { name: "test", items: [undefined, null, ""] };
    expect(buildQueryString(params)).toBe("?name=test");
  });

  it("SessionListParams 형태의 파라미터를 처리해야 합니다", () => {
    const params = {
      requiredFocusRate: 80,
      requiredAchievementRate: 90,
      sort: "LATEST",
      page: 2,
      size: 5,
    };
    const result = buildQueryString(params);
    expect(result).toBe(
      "?requiredFocusRate=80&requiredAchievementRate=90&sort=LATEST&page=2&size=5"
    );
  });

  it("배열과 일반 파라미터를 함께 처리해야 합니다", () => {
    const params = {
      keyword: "스터디",
      category: "DEVELOPMENT",
      sort: "POPULAR",
      timeSlots: ["MORNING", "EVENING"],
      page: 1,
      size: 10,
    };
    const result = buildQueryString(params);
    expect(result).toContain("keyword=%EC%8A%A4%ED%84%B0%EB%94%94");
    expect(result).toContain("category=DEVELOPMENT");
    expect(result).toContain("sort=POPULAR");
    expect(result).toContain("timeSlots=MORNING%2CEVENING");
    expect(result).toContain("page=1");
    expect(result).toContain("size=10");
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
