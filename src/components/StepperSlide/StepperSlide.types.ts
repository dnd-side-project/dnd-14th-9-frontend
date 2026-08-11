export interface StepperSlideProps {
  /** 현재 값 (0-100) */
  value: number;
  /** 값 변경 콜백 */
  onChange: (value: number) => void;
  /** "내 집중도" 값 (0-100) - 별도 마커로 표시 */
  myFocusValue?: number;
  /** 마커 말풍선 라벨 (기본값: "내 집중도") */
  myFocusLabel?: string;
  /**
   * 선택 가능한 상한값 (예: 내 달성률/집중률).
   * 눈금 스케일(min~max)은 그대로 두고 이 값을 넘는 선택만 막는다.
   */
  limit?: number;
  /** 최소값 (기본값: 0) */
  min?: number;
  /** 최대값 (기본값: 100) */
  max?: number;
  /** 비활성화 상태 */
  disabled?: boolean;
  /** 커스텀 클래스명 */
  className?: string;
}
