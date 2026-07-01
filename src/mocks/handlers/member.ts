import { http, HttpResponse } from "msw";

import { MEMBER_PROFILE_IMAGE_FORM_KEY } from "@/features/member/api";
import type {
  MemberEditInfo,
  MemberProfileView,
  MemberReportSessions,
  MemberReportStats,
} from "@/features/member/types";

import { MockJsonParseError, readRequiredJson, requireMultipartPart } from "./json";
import { fail, ok } from "./utils";

const MOCK_ME: MemberProfileView = {
  id: 1,
  nickname: "모각작러",
  profileImageUrl: null,
  email: "mock@gak.today",
  bio: "MSW 테스트 계정",
  socialProvider: "google",
  totalParticipationTime: 7200,
  focusedTime: 5400,
  focusRate: 75,
  totalTodoCount: 8,
  completedTodoCount: 5,
  todoCompletionRate: 63,
  participationSessionCount: 1,
  firstLogin: false,
  firstInterestCategory: "DEVELOPMENT",
  secondInterestCategory: "DESIGN",
  thirdInterestCategory: "PLANNING_PM",
};

const MOCK_ME_EDIT: MemberEditInfo = {
  id: MOCK_ME.id,
  nickname: MOCK_ME.nickname,
  profileImageUrl: MOCK_ME.profileImageUrl ?? "",
  email: MOCK_ME.email,
  bio: MOCK_ME.bio,
  firstInterestCategory: "DEVELOPMENT",
  secondInterestCategory: "DESIGN",
  thirdInterestCategory: "PLANNING_PM",
};

const MOCK_REPORT_STATS: MemberReportStats = {
  focusedTime: MOCK_ME.focusedTime,
  totalParticipationTime: MOCK_ME.totalParticipationTime,
  todoCompletionRate: MOCK_ME.todoCompletionRate,
  focusRate: MOCK_ME.focusRate,
  sessionParticipationStats: [{ categoryName: "DEVELOPMENT", count: 1, rate: 100 }],
  receivedEmojis: [
    { emojiName: "HEART", count: 3 },
    { emojiName: "STAR", count: 1 },
  ],
};

const MOCK_REPORT_SESSIONS: MemberReportSessions = {
  sessions: [
    {
      sessionId: "900",
      title: "같이 사이드 프로젝트 완성해봐요",
      category: "DEVELOPMENT",
      currentCount: 3,
      maxCapacity: 6,
      durationTime: 7200,
      startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      focusedTime: 5400,
      focusRate: 75,
      todoCompletionRate: 63,
    },
  ],
  totalPage: 1,
  listSize: 1,
  totalElements: 1,
  first: true,
  last: true,
};

function badRequestJson(error: unknown) {
  if (error instanceof MockJsonParseError) {
    return HttpResponse.json(fail("COMMON400", error.message, "BAD_REQUEST"), { status: 400 });
  }

  throw error;
}

export const memberHandlers = [
  http.get("*/api/members/me/profile", () => {
    return HttpResponse.json(ok(MOCK_ME));
  }),

  http.get("*/api/members/me/edit", () => {
    return HttpResponse.json(ok(MOCK_ME_EDIT));
  }),

  http.patch("*/api/members/me/profile-image", async ({ request }) => {
    try {
      await requireMultipartPart(
        request,
        MEMBER_PROFILE_IMAGE_FORM_KEY,
        "member profile image update"
      );
      return HttpResponse.json(ok(MOCK_ME_EDIT));
    } catch (error) {
      return badRequestJson(error);
    }
  }),

  http.delete("*/api/members/me/profile-image", () => {
    return HttpResponse.json(ok(null));
  }),

  http.patch("*/api/members/me/nickname", async ({ request }) => {
    try {
      const body = await readRequiredJson<{ nickname: string }>(request, "member nickname update");
      return HttpResponse.json(ok({ ...MOCK_ME_EDIT, nickname: body.nickname }));
    } catch (error) {
      return badRequestJson(error);
    }
  }),

  http.patch("*/api/members/me", async ({ request }) => {
    try {
      const body = await readRequiredJson<Partial<MemberEditInfo>>(
        request,
        "member profile update"
      );
      return HttpResponse.json(ok({ ...MOCK_ME_EDIT, ...body }));
    } catch (error) {
      return badRequestJson(error);
    }
  }),

  http.patch("*/api/members/me/email", async ({ request }) => {
    try {
      const body = await readRequiredJson<{ email: string | null }>(request, "member email update");
      return HttpResponse.json(ok({ ...MOCK_ME_EDIT, email: body.email }));
    } catch (error) {
      return badRequestJson(error);
    }
  }),

  http.patch("*/api/members/me/interest-categories", async ({ request }) => {
    try {
      const body = await readRequiredJson<Partial<MemberEditInfo>>(
        request,
        "member interest categories update"
      );
      return HttpResponse.json(ok({ ...MOCK_ME_EDIT, ...body }));
    } catch (error) {
      return badRequestJson(error);
    }
  }),

  http.get("*/api/members/me/report-stats", () => {
    return HttpResponse.json(ok(MOCK_REPORT_STATS));
  }),

  http.get("*/api/members/me/report-sessions", () => {
    return HttpResponse.json(ok(MOCK_REPORT_SESSIONS));
  }),

  http.delete("*/api/members/me", () => {
    return HttpResponse.json(ok(null));
  }),
];
