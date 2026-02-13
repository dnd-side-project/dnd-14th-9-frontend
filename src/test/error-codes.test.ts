import { getApiErrorMessageByCode } from "@/lib/error/error-codes";

describe("error-codes", () => {
  it("OAuth2 에러 코드를 스펙 메시지로 매핑해야 함", () => {
    expect(getApiErrorMessageByCode("OAUTH401_1")).toBe("OAuth2 로그인에 실패했습니다.");
    expect(getApiErrorMessageByCode("OAUTH401_2")).toBe("소셜 로그인 인증이 거부되었습니다.");
    expect(getApiErrorMessageByCode("OAUTH401_3")).toBe(
      "소셜 로그인 제공자 처리 중 오류가 발생했습니다."
    );
    expect(getApiErrorMessageByCode("OAUTH401_4")).toBe("OAuth2 요청이 올바르지 않습니다.");
    expect(getApiErrorMessageByCode("OAUTH401_5")).toBe("지원하지 않는 소셜 로그인 제공자입니다.");
    expect(getApiErrorMessageByCode("OAUTH500_1")).toBe("예상치 못한 오류가 발생했습니다.");
  });

  it("인증 에러 코드를 스펙 메시지로 매핑해야 함", () => {
    expect(getApiErrorMessageByCode("AUTH401_1")).toBe("올바르지 않은 Authorization 헤더입니다.");
    expect(getApiErrorMessageByCode("AUTH401_2")).toBe("토큰 형식이 올바르지 않습니다.");
    expect(getApiErrorMessageByCode("AUTH401_3")).toBe("기한이 만료된 Access 토큰입니다.");
    expect(getApiErrorMessageByCode("AUTH401_4")).toBe("기한이 만료된 Refresh 토큰입니다.");
    expect(getApiErrorMessageByCode("AUTH401_5")).toBe("존재하지 않는 Refresh 토큰입니다.");
    expect(getApiErrorMessageByCode("AUTH401_6")).toBe("Refresh 토큰이 전달되지 않았습니다.");
    expect(getApiErrorMessageByCode("AUTH401_7")).toBe("Refresh 토큰 정보가 일치하지 않습니다.");
  });

  it("도메인별 추가 에러 코드도 스펙 메시지로 매핑해야 함", () => {
    expect(getApiErrorMessageByCode("COMMON500")).toBe("서버 처리 중 오류가 발생했습니다.");
    expect(getApiErrorMessageByCode("COMMON400_1")).toBe("잘못된 요청입니다.");
    expect(getApiErrorMessageByCode("AWS500_1")).toBe("S3 업로드에 실패했습니다.");
    expect(getApiErrorMessageByCode("AWS500_2")).toBe("S3 파일 삭제에 실패했습니다.");
    expect(getApiErrorMessageByCode("AWS500_3")).toBe("S3 파일 조회에 실패했습니다.");
    expect(getApiErrorMessageByCode("MEMBER404_1")).toBe("존재하지 않는 사용자입니다.");
    expect(getApiErrorMessageByCode("MEMBER409_1")).toBe(
      "완료되지 않은 세션이 존재하여 탈퇴할 수 없습니다."
    );
    expect(getApiErrorMessageByCode("SESSION400_1")).toBe(
      "세션 시작 시간은 현재 시각 기준 5분 이후로 설정해야 합니다."
    );
    expect(getApiErrorMessageByCode("FILE400_1")).toBe("허용되지 않은 이미지 형식입니다.");
    expect(getApiErrorMessageByCode("FILE400_2")).toBe("이미지 파일 크기가 너무 큽니다.");
    expect(getApiErrorMessageByCode("FILE400_3")).toBe("파일 검증에 실패했습니다.");
  });

  it("정의되지 않은 코드는 null을 반환해야 함", () => {
    expect(getApiErrorMessageByCode("AUTH401_8")).toBeNull();
    expect(getApiErrorMessageByCode("UNKNOWN_CODE")).toBeNull();
    expect(getApiErrorMessageByCode("")).toBeNull();
    expect(getApiErrorMessageByCode(null)).toBeNull();
    expect(getApiErrorMessageByCode(undefined)).toBeNull();
  });
});
