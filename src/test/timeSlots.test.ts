import { formatTimeSlotsParam, parseTimeSlotsParam } from "@/features/session/utils/timeSlots";

describe("timeSlots utils", () => {
  it("콤마 문자열을 TimeSlot 배열로 파싱해야 합니다", () => {
    expect(parseTimeSlotsParam("DAWN,MORNING,AFTERNOON,EVENING")).toEqual([
      "DAWN",
      "MORNING",
      "AFTERNOON",
      "EVENING",
    ]);
  });

  it("중복/공백/잘못된 값을 제거하고 정의된 순서로 정렬해야 합니다", () => {
    expect(parseTimeSlotsParam("EVENING, DAWN, DAWN,INVALID")).toEqual(["DAWN", "EVENING"]);
  });

  it("TimeSlot 배열을 콤마 문자열로 변환해야 합니다", () => {
    expect(formatTimeSlotsParam(["EVENING", "MORNING", "MORNING"])).toBe("MORNING,EVENING");
  });

  it("비어있는 배열은 null을 반환해야 합니다", () => {
    expect(formatTimeSlotsParam([])).toBeNull();
  });
});
