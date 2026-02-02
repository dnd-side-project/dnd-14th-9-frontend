/**
 * Unit Converter Helper
 *
 * 역할:
 * - 숫자/문자열 토큰 값을 px 단위로 정규화
 * - Token Studio 참조 표기("{color.primary.50}")를 CSS 변수로 변환
 *
 * 사용처:
 * - style-dictionary/formats/tailwind-v4.mjs에서 토큰 값 보정에 사용
 */

const numberOnly = /^-?\d+(\.\d+)?$/;

/**
 * 값에 px 단위를 추가
 * @param {string|number} value - 변환할 값
 * @returns {string} px 단위가 추가된 값
 */
export function withPx(value) {
  if (typeof value === "number") return `${value}px`;
  if (typeof value !== "string") return value;
  if (value.startsWith("var(")) return `calc(${value} * 1px)`;
  if (numberOnly.test(value)) return `${value}px`;
  return value;
}

/**
 * 토큰 참조를 CSS 변수로 변환
 * @param {string} originalValue - 원본 토큰 값 (예: "{color.primary.50}")
 * @returns {string} CSS 변수 형식 (예: "var(--color-primary-50)")
 */
export function convertTokenReference(originalValue) {
  if (!originalValue || typeof originalValue !== "string") return null;
  if (!originalValue.startsWith("{")) return null;

  const refName = originalValue.replace(/[{}]/g, "").replace(/\./g, "-");
  return `var(--${refName})`;
}
