import { ApiError } from "@/lib/api/api-client";
import { getQueryClient } from "@/lib/getQueryClient";
import { toast } from "@/lib/toast";

jest.mock("@/lib/toast", () => ({
  toast: { error: jest.fn() },
}));

const mockedToastError = jest.mocked(toast.error);
const MESSAGE = "안내 문구";

async function failQuery(key: string, error: unknown, meta?: Record<string, unknown>) {
  await getQueryClient()
    .fetchQuery({
      queryKey: [key],
      queryFn: () => Promise.reject(error),
      retry: false,
      meta,
    })
    .catch(() => {});
}

describe("QueryCache 일시 실패 토스트", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("meta에 안내 문구가 있는 쿼리가 일시 실패하면 토스트를 한 번 띄워야 한다", async () => {
    await failQuery("transient", new ApiError("서버 오류", 500), { transientErrorToast: MESSAGE });

    expect(mockedToastError).toHaveBeenCalledTimes(1);
    expect(mockedToastError).toHaveBeenCalledWith(MESSAGE);
  });

  it("인증 거부(401)는 토스트를 띄우지 않아야 한다", async () => {
    await failQuery("rejected", new ApiError("인증이 필요합니다.", 401), {
      transientErrorToast: MESSAGE,
    });

    expect(mockedToastError).not.toHaveBeenCalled();
  });

  it("meta에 안내 문구가 없는 쿼리는 토스트를 띄우지 않아야 한다", async () => {
    await failQuery("no-meta", new ApiError("서버 오류", 500));

    expect(mockedToastError).not.toHaveBeenCalled();
  });
});
