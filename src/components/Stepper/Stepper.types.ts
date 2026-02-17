export interface StepperProps {
  /** 라벨 텍스트 */
  label: string;
  /** 힌트 텍스트 (우측 상단) */
  hint?: string;
  /** 현재 값 */
  value: number;
  /** 값 변경 콜백 */
  onChange: (value: number) => void;
  /** 최소값 */
  min: number;
  /** 최대값 */
  max: number;
  /** 증감 단위 */
  step?: number;
  /** 값 표시 형식 함수 */
  formatDisplay: (value: number) => string;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 컨테이너 클래스 */
  className?: string;
}
