export const PATHS = {
  PROFILE_REPORT: "/profile/report",
  FEEDBACK: "/feedback",
} as const;

export const INTEREST_RANKS = [
  { rank: "1순위", key: "firstInterestCategory" },
  { rank: "2순위", key: "secondInterestCategory" },
  { rank: "3순위", key: "thirdInterestCategory" },
] as const;
