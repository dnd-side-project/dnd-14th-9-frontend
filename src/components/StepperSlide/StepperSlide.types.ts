export interface StepperSlideProps {
  /** 현재 값 (0-100) */
  value: number;
  /** 값 변경 콜백 */
  onChange: (value: number) => void;
  /** "내 집중도" 값 (0-100) - 별도 마커로 표시 */
  myFocusValue?: number;
  /** 최소값 (기본값: 0) */
  min?: number;
  /** 최대값 (기본값: 100) */
  max?: number;
  /** 비활성화 상태 */
  disabled?: boolean;
  /** 커스텀 클래스명 */
  className?: string;
}
