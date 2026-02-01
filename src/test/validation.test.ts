import { isEmpty, isValidNickname, isValidGoal, isValidSessionTitle } from "@/lib/utils/validation";

describe("isEmpty", () => {
  it("null 값은 true를 반환해야 합니다", () => {
    expect(isEmpty(null)).toBe(true);
  });

  it("undefined 값은 true를 반환해야 합니다", () => {
    expect(isEmpty(undefined)).toBe(true);
  });

  it("빈 문자열은 true를 반환해야 합니다", () => {
    expect(isEmpty("")).toBe(true);
  });

  it("공백만 있는 문자열은 true를 반환해야 합니다", () => {
    expect(isEmpty("   ")).toBe(true);
    expect(isEmpty("\t")).toBe(true);
    expect(isEmpty("\n")).toBe(true);
    expect(isEmpty(" \t\n ")).toBe(true);
  });

  it("값이 있는 문자열은 false를 반환해야 합니다", () => {
    expect(isEmpty("test")).toBe(false);
    expect(isEmpty("a")).toBe(false);
  });

  it("앞뒤 공백이 있어도 내용이 있으면 false를 반환해야 합니다", () => {
    expect(isEmpty("  test  ")).toBe(false);
    expect(isEmpty("\tvalue\n")).toBe(false);
  });
});

describe("isValidNickname", () => {
  it("유효한 한글 닉네임을 허용해야 합니다", () => {
    expect(isValidNickname("홍길동")).toBe(true);
    expect(isValidNickname("김")).toBe(true);
    expect(isValidNickname("테스트유저")).toBe(true);
  });

  it("유효한 영문 닉네임을 허용해야 합니다", () => {
    expect(isValidNickname("John")).toBe(true);
    expect(isValidNickname("a")).toBe(true);
    expect(isValidNickname("Test")).toBe(true);
    expect(isValidNickname("ABCDE")).toBe(true);
  });

  it("유효한 숫자 닉네임을 허용해야 합니다", () => {
    expect(isValidNickname("123")).toBe(true);
    expect(isValidNickname("12345")).toBe(true);
    expect(isValidNickname("1")).toBe(true);
  });

  it("한글, 영문, 숫자 조합 닉네임을 허용해야 합니다", () => {
    expect(isValidNickname("홍길1")).toBe(true);
    expect(isValidNickname("Test1")).toBe(true);
    expect(isValidNickname("김ab")).toBe(true);
  });

  it("1글자 닉네임을 허용해야 합니다", () => {
    expect(isValidNickname("a")).toBe(true);
    expect(isValidNickname("김")).toBe(true);
    expect(isValidNickname("1")).toBe(true);
  });

  it("5글자 닉네임을 허용해야 합니다", () => {
    expect(isValidNickname("abcde")).toBe(true);
    expect(isValidNickname("가나다라마")).toBe(true);
    expect(isValidNickname("12345")).toBe(true);
  });

  it("6글자 이상 닉네임을 거부해야 합니다", () => {
    expect(isValidNickname("abcdef")).toBe(false);
    expect(isValidNickname("가나다라마바")).toBe(false);
    expect(isValidNickname("123456")).toBe(false);
  });

  it("빈 문자열을 거부해야 합니다", () => {
    expect(isValidNickname("")).toBe(false);
  });

  it("특수문자를 포함한 닉네임을 거부해야 합니다", () => {
    expect(isValidNickname("test!")).toBe(false);
    expect(isValidNickname("홍길@동")).toBe(false);
    expect(isValidNickname("user_1")).toBe(false);
    expect(isValidNickname("test-name")).toBe(false);
    expect(isValidNickname("test.com")).toBe(false);
  });

  it("공백을 포함한 닉네임을 거부해야 합니다", () => {
    expect(isValidNickname("hello world")).toBe(false);
    expect(isValidNickname("홍 길동")).toBe(false);
    expect(isValidNickname(" test")).toBe(false);
    expect(isValidNickname("test ")).toBe(false);
  });
});

describe("isValidGoal", () => {
  it("유효한 목표 문자열을 허용해야 합니다", () => {
    expect(isValidGoal("운동하기")).toBe(true);
    expect(isValidGoal("Learn TypeScript")).toBe(true);
    expect(isValidGoal("a")).toBe(true);
  });

  it("기본 최대 길이(50자) 미만의 문자열을 허용해야 합니다", () => {
    const goal49 = "a".repeat(49);
    expect(isValidGoal(goal49)).toBe(true);
  });

  it("기본 최대 길이(50자) 이상의 문자열을 거부해야 합니다", () => {
    const goal50 = "a".repeat(50);
    expect(isValidGoal(goal50)).toBe(false);
  });

  it("빈 문자열을 거부해야 합니다", () => {
    expect(isValidGoal("")).toBe(false);
  });

  it("공백만 있는 문자열을 거부해야 합니다", () => {
    expect(isValidGoal("   ")).toBe(false);
    expect(isValidGoal("\t\n")).toBe(false);
  });

  it("앞뒤 공백은 trim되어 검증되어야 합니다", () => {
    expect(isValidGoal("  valid  ")).toBe(true);
    const goalWithSpaces = "  " + "a".repeat(48) + "  ";
    expect(isValidGoal(goalWithSpaces)).toBe(true);
  });

  it("커스텀 최대 길이를 지정할 수 있어야 합니다", () => {
    expect(isValidGoal("12345", 10)).toBe(true);
    expect(isValidGoal("1234567890", 10)).toBe(false);
  });

  it("커스텀 최대 길이 경계값을 올바르게 처리해야 합니다", () => {
    const goal9 = "a".repeat(9);
    const goal10 = "a".repeat(10);
    expect(isValidGoal(goal9, 10)).toBe(true);
    expect(isValidGoal(goal10, 10)).toBe(false);
  });

  it("매우 짧은 최대 길이도 올바르게 처리해야 합니다", () => {
    expect(isValidGoal("ab", 3)).toBe(true);
    expect(isValidGoal("abc", 3)).toBe(false);
  });
});

describe("isValidSessionTitle", () => {
  it("유효한 세션 제목을 허용해야 합니다", () => {
    expect(isValidSessionTitle("스터디")).toBe(true);
    expect(isValidSessionTitle("Study Session")).toBe(true);
    expect(isValidSessionTitle("모각코 세션")).toBe(true);
  });

  it("2글자 제목을 허용해야 합니다 (최소 길이)", () => {
    expect(isValidSessionTitle("ab")).toBe(true);
    expect(isValidSessionTitle("가나")).toBe(true);
    expect(isValidSessionTitle("12")).toBe(true);
  });

  it("20글자 제목을 허용해야 합니다 (최대 길이)", () => {
    const title20 = "a".repeat(20);
    expect(isValidSessionTitle(title20)).toBe(true);
  });

  it("1글자 제목을 거부해야 합니다", () => {
    expect(isValidSessionTitle("a")).toBe(false);
    expect(isValidSessionTitle("가")).toBe(false);
  });

  it("21글자 이상 제목을 거부해야 합니다", () => {
    const title21 = "a".repeat(21);
    expect(isValidSessionTitle(title21)).toBe(false);
  });

  it("빈 문자열을 거부해야 합니다", () => {
    expect(isValidSessionTitle("")).toBe(false);
  });

  it("공백만 있는 문자열을 거부해야 합니다", () => {
    expect(isValidSessionTitle("   ")).toBe(false);
  });

  it("앞뒤 공백이 있어도 trim된 길이가 2 이상이면 허용해야 합니다", () => {
    expect(isValidSessionTitle("  ab  ")).toBe(true);
    expect(isValidSessionTitle("  가나  ")).toBe(true);
  });

  it("앞뒤 공백을 포함한 전체 길이가 20 이하여야 합니다", () => {
    const title18WithSpaces = " " + "a".repeat(18) + " ";
    expect(isValidSessionTitle(title18WithSpaces)).toBe(true);

    const title19WithSpaces = " " + "a".repeat(19) + " ";
    expect(isValidSessionTitle(title19WithSpaces)).toBe(false);
  });

  it("trim 후 1글자만 남으면 거부해야 합니다", () => {
    expect(isValidSessionTitle("  a  ")).toBe(false);
    expect(isValidSessionTitle("\t가\n")).toBe(false);
  });
});
