import { joinSessionFormSchema } from "@/features/session/schemas";

describe("joinSessionFormSchema", () => {
  it("공백만 있는 목표 또는 투두를 거부한다", () => {
    expect(joinSessionFormSchema.safeParse({ goal: "   ", todos: ["할 일"] }).success).toBe(false);
    expect(joinSessionFormSchema.safeParse({ goal: "목표", todos: ["   ", "\t"] }).success).toBe(
      false
    );
  });

  it("앞뒤 공백을 제거하고 빈 투두를 제외한다", () => {
    expect(
      joinSessionFormSchema.parse({
        goal: "  테스트 목표  ",
        todos: ["  첫 번째 투두  ", "   ", "두 번째 투두\t"],
      })
    ).toEqual({
      goal: "테스트 목표",
      todos: ["첫 번째 투두", "두 번째 투두"],
    });
  });

  it.each([
    ["목표", { goal: "a".repeat(51), todos: ["할 일"] }],
    ["투두", { goal: "목표", todos: ["a".repeat(51)] }],
  ])("50자를 초과한 %s를 거부한다", (_field, data) => {
    expect(joinSessionFormSchema.safeParse(data).success).toBe(false);
  });
});
