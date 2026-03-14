import robots from "@/app/robots";

function getSingleRulesDisallow() {
  const rules = robots().rules;

  expect(rules).not.toBeInstanceOf(Array);

  if (Array.isArray(rules)) {
    throw new Error("Expected robots rules to be a single rule object");
  }

  return rules.disallow;
}

describe("robots", () => {
  it("공유된 인증 경로 그룹을 disallow에 반영해야 함", () => {
    expect(getSingleRulesDisallow()).toEqual(
      expect.arrayContaining([
        "/api/",
        "/profile/",
        "/session/create",
        "/session/*/waiting",
        "/session/*/result",
        "/session/*/reports",
      ])
    );
  });

  it("/feedback는 공개 페이지여도 SEO disallow는 유지해야 함", () => {
    expect(getSingleRulesDisallow()).toEqual(expect.arrayContaining(["/feedback"]));
  });
});
