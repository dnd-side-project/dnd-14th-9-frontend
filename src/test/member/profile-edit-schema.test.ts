import { profileEditSchema } from "@/features/member/schemas";

const validValues = {
  nickname: "테스터",
  email: "tester@example.com",
  bio: "소개",
  interestCategories: ["DEVELOPMENT"],
};

function firstMessage(overrides: Partial<typeof validValues>) {
  const result = profileEditSchema.safeParse({ ...validValues, ...overrides });
  return result.success ? null : result.error.issues[0].message;
}

describe("profileEditSchema", () => {
  it("올바른 값은 통과한다", () => {
    expect(profileEditSchema.safeParse(validValues).success).toBe(true);
  });

  describe("interestCategories", () => {
    it.each([
      [0, "관심 카테고리는 최소 1개 이상 선택해야 합니다."],
      [4, "관심 카테고리는 최대 3개까지 선택 가능합니다."],
    ])("%i개는 거부한다", (count, message) => {
      expect(firstMessage({ interestCategories: Array(count).fill("DEVELOPMENT") })).toBe(message);
    });

    it.each([1, 2, 3])("%i개는 허용한다", (count) => {
      expect(firstMessage({ interestCategories: Array(count).fill("DEVELOPMENT") })).toBeNull();
    });
  });

  describe("nickname", () => {
    it("비어 있으면 입력 안내를 보여준다", () => {
      expect(firstMessage({ nickname: "" })).toBe("닉네임을 입력해주세요");
    });

    it.each(["가", "a", "가".repeat(11), "테스터!", "테 스터"])("%s는 거부한다", (nickname) => {
      expect(firstMessage({ nickname })).toBe("특수문자와 공백을 제외한 2~10자리여야 합니다.");
    });

    it.each(["가나", "가".repeat(10), "abc123"])("%s는 허용한다", (nickname) => {
      expect(firstMessage({ nickname })).toBeNull();
    });
  });

  describe("bio", () => {
    it("100자까지 허용하고 101자부터 거부한다", () => {
      expect(firstMessage({ bio: "가".repeat(100) })).toBeNull();
      expect(firstMessage({ bio: "가".repeat(101) })).toBe(
        "한 줄 소개는 최대 100자까지 입력 가능합니다"
      );
    });
  });

  describe("email", () => {
    it.each(["", "tester@example.com", " tester@example.com "])("%j는 허용한다", (email) => {
      expect(firstMessage({ email })).toBeNull();
    });

    it("형식이 올바르지 않으면 거부한다", () => {
      expect(firstMessage({ email: "not-an-email" })).toBe("올바른 이메일 형식을 입력해주세요");
    });
  });
});
