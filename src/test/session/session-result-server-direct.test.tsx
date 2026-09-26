import { sessionApi } from "@/features/session/api";
import { ParticipantsReportContent } from "@/features/session/components/SessionResult/ParticipantsReportContent";
import { SessionResultContent } from "@/features/session/components/SessionResult/SessionResultContent";
import { sessionServerApi } from "@/features/session/server/api";

jest.mock("@/features/session/server/api", () => ({
  sessionServerApi: {
    getDetail: jest.fn(),
    getMyReport: jest.fn(),
    getReport: jest.fn(),
  },
}));

const serverDetail = sessionServerApi.getDetail as jest.Mock;
const serverMyReport = sessionServerApi.getMyReport as jest.Mock;
const serverReport = sessionServerApi.getReport as jest.Mock;

describe("session result server direct reads", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    serverDetail.mockResolvedValue({ isSuccess: true, result: null });
    serverMyReport.mockResolvedValue({ isSuccess: true, result: null });
    serverReport.mockResolvedValue({ isSuccess: true, result: null });
    jest.spyOn(sessionApi, "getDetail").mockResolvedValue({
      isSuccess: true,
      code: "COMMON200",
      message: "client",
      result: null,
    } as unknown as Awaited<ReturnType<typeof sessionApi.getDetail>>);
    jest.spyOn(sessionApi, "getMyReport").mockResolvedValue({
      isSuccess: true,
      code: "COMMON200",
      message: "client",
      result: null,
    } as unknown as Awaited<ReturnType<typeof sessionApi.getMyReport>>);
    jest.spyOn(sessionApi, "getReport").mockResolvedValue({
      isSuccess: true,
      code: "COMMON200",
      message: "client",
      result: null,
    } as unknown as Awaited<ReturnType<typeof sessionApi.getReport>>);
  });

  it("내 리포트는 서버 상세와 내 리포트를 조회한다", async () => {
    await SessionResultContent({ sessionId: "9" });

    expect(serverDetail).toHaveBeenCalledWith("9");
    expect(serverMyReport).toHaveBeenCalledWith("9");
    expect(sessionApi.getDetail).not.toHaveBeenCalled();
    expect(sessionApi.getMyReport).not.toHaveBeenCalled();
  });

  it("참여자 리포트는 서버 상세, 내 리포트, 전체 리포트를 조회한다", async () => {
    await ParticipantsReportContent({ sessionId: "9" });

    expect(serverDetail).toHaveBeenCalledWith("9");
    expect(serverMyReport).toHaveBeenCalledWith("9");
    expect(serverReport).toHaveBeenCalledWith("9");
    expect(sessionApi.getDetail).not.toHaveBeenCalled();
    expect(sessionApi.getMyReport).not.toHaveBeenCalled();
    expect(sessionApi.getReport).not.toHaveBeenCalled();
  });
});
