module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "test",
        "chore",
        "design",
        "comment",
        "rename",
        "remove",
        "hotfix",
      ],
    ],
    "subject-empty": [2, "never"],
    "type-empty": [2, "never"],
    // 한국어 커밋 메시지 및 고유명사 사용을 위해 비활성화
    "subject-case": [0],
  },
};
