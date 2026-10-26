import { render, screen } from "@testing-library/react";

import { getGradientVector, TimerCircular } from "@/components/TimerCircular/TimerCircular";

type VariantProps =
  | { scope: "my"; state: "default" | "running" | "paused" | "completed" }
  | { scope: "all"; state: "running" | "warning" | "completed" };

interface GradientCase {
  name: string;
  props: VariantProps;
  /** 링 중앙에 보여야 하는 문구 */
  text: string;
  textClass: string;
  /** stop 색 클래스 (시작, 끝) */
  stops: string[];
}

interface SolidCase {
  name: string;
  props: VariantProps;
  text: string;
  textClass: string;
  /** 단색 호의 stroke 클래스 */
  solid: string;
}

const PRIMARY_STOPS = ["text-border-primary-subtler", "text-border-primary-default"];
const NEUTRAL_STOPS = ["text-border-strong", "text-border-stronger"];

// Figma 변형 매트릭스. 컴포넌트의 매핑 표와 별개로 적어 한쪽만 바뀌면 실패하게 한다.
const GRADIENT_CASES: GradientCase[] = [
  {
    name: "my / default",
    props: { scope: "my", state: "default" },
    text: "12:34",
    textClass: "text-text-tertiary",
    stops: PRIMARY_STOPS,
  },
  {
    name: "my / running",
    props: { scope: "my", state: "running" },
    text: "12:34",
    textClass: "text-text-brand-default",
    stops: PRIMARY_STOPS,
  },
  {
    name: "my / completed",
    props: { scope: "my", state: "completed" },
    text: "세션 종료!",
    textClass: "text-text-brand-default",
    stops: PRIMARY_STOPS,
  },
  {
    name: "all / running",
    props: { scope: "all", state: "running" },
    text: "12:34",
    textClass: "text-text-primary",
    stops: NEUTRAL_STOPS,
  },
  {
    name: "all / completed",
    props: { scope: "all", state: "completed" },
    text: "세션 종료!",
    textClass: "text-text-primary",
    stops: NEUTRAL_STOPS,
  },
];

const SOLID_CASES: SolidCase[] = [
  {
    name: "my / paused",
    props: { scope: "my", state: "paused" },
    text: "12:34",
    textClass: "text-text-disabled",
    solid: "stroke-border-disabled/50",
  },
  {
    name: "all / warning",
    props: { scope: "all", state: "warning" },
    text: "12:34",
    textClass: "text-text-status-negative-default",
    solid: "stroke-border-error-default",
  },
];

describe("TimerCircular 상태별 스타일", () => {
  it.each(GRADIENT_CASES)(
    "$name 상태는 그라디언트 호와 상태 색 텍스트를 보여준다",
    ({ props, text, textClass, stops }) => {
      // Given: 진행률 50%, 시간 12:34
      // When: scope/state를 지정해 렌더링하면
      const { container } = render(<TimerCircular {...props} progress={50} time="12:34" />);

      // Then: 트랙은 공통 색, 호는 그라디언트(stop 색 2개), 텍스트는 상태 색
      const [track, progress] = Array.from(container.querySelectorAll("circle"));
      const stopClasses = Array.from(container.querySelectorAll("stop")).map((stop) =>
        stop.getAttribute("class")
      );
      expect(track).toHaveClass("stroke-border-default");
      expect(progress.getAttribute("stroke")).toMatch(/^url\(#.+\)$/);
      expect(stopClasses).toEqual(stops);
      expect(screen.getByText(text)).toHaveClass(textClass);
    }
  );

  it.each(SOLID_CASES)(
    "$name 상태는 단색 호와 상태 색 텍스트를 보여준다",
    ({ props, text, textClass, solid }) => {
      // Given: 진행률 50%, 시간 12:34
      // When: scope/state를 지정해 렌더링하면
      const { container } = render(<TimerCircular {...props} progress={50} time="12:34" />);

      // Then: 트랙은 공통 색, 호는 단색 클래스(그라디언트 없음), 텍스트는 상태 색
      const [track, progress] = Array.from(container.querySelectorAll("circle"));
      expect(track).toHaveClass("stroke-border-default");
      expect(progress).toHaveClass(solid);
      expect(progress).not.toHaveAttribute("stroke");
      expect(container.querySelector("stop")).toBeNull();
      expect(screen.getByText(text)).toHaveClass(textClass);
    }
  );

  it("scope/state 없이 쓰면 기존 진행 링처럼 동작한다", () => {
    // Given: ImageUploader처럼 scope/state를 넘기지 않는 사용
    // When: 진행률 45%로 렌더링하면
    const { container } = render(<TimerCircular progress={45} />);

    // Then: 퍼센트 텍스트와 기본 색 클래스를 쓰고 그라디언트는 없다
    const [track, progress] = Array.from(container.querySelectorAll("circle"));
    expect(screen.getByText("45%")).toBeInTheDocument();
    expect(track).toHaveClass("stroke-gray-700");
    expect(progress).toHaveClass("stroke-green-600");
    expect(container.querySelector("stop")).toBeNull();
  });
});

describe("getGradientVector", () => {
  // 150px / 6px 링: 중심 (75, 75), 호 중심선 반지름 72
  const CX = 75;
  const CY = 75;
  const RADIUS = 72;

  type Vector = ReturnType<typeof getGradientVector>;

  const vectorAt = (progress: number) => getGradientVector(CX, CY, RADIUS, progress);

  /** CSS linear-gradient 각도 (0deg = 위쪽, 시계 방향) */
  const cssAngle = ({ x1, y1, x2, y2 }: Vector) =>
    ((Math.atan2(x2 - x1, -(y2 - y1)) * 180) / Math.PI + 360) % 360;

  const length = ({ x1, y1, x2, y2 }: Vector) => Math.hypot(x2 - x1, y2 - y1);

  /** 점 (x, y)의 그라디언트 위치 (0 = 시작색, 1 = 끝색) */
  const colorAt = ({ x1, y1, x2, y2 }: Vector, x: number, y: number) => {
    const [ex, ey] = [x2 - x1, y2 - y1];
    return Math.min(1, Math.max(0, ((x - x1) * ex + (y - y1) * ey) / (ex * ex + ey * ey)));
  };

  it("완료(100%)는 Figma 완료 샘플처럼 아래에서 위로 가는 수직선이다", () => {
    // Given: 진행률 100%
    // When: 그라디언트 벡터를 구하면
    const v = vectorAt(100);

    // Then: (75,147) → (75,3) 수직선
    expect(v.x1).toBeCloseTo(75);
    expect(v.y1).toBeCloseTo(147);
    expect(v.x2).toBeCloseTo(75);
    expect(v.y2).toBeCloseTo(3);
  });

  it("진행 중(70%)은 Figma 진행 중 샘플(304도)과 방향이 거의 같다", () => {
    // Given: 진행률 70%
    // When: 그라디언트 벡터를 구하면
    const v = vectorAt(70);

    // Then: CSS 각도가 304도에서 3도 이내
    expect(Math.abs(cssAngle(v) - 304)).toBeLessThan(3);
  });

  it("반원 이하(50%까지)는 호의 시작이 시작색, 끝이 끝색이다", () => {
    for (const progress of [10, 30, 50]) {
      // Given: 반원 이하의 진행률과 그 호의 시작점·끝점
      const theta = (2 * Math.PI * progress) / 100;
      const [startX, startY] = [CX + RADIUS, CY];
      const [headX, headY] = [CX + RADIUS * Math.cos(theta), CY + RADIUS * Math.sin(theta)];

      // When: 그라디언트 벡터를 구하면
      const v = vectorAt(progress);

      // Then: 시작점은 시작색(0), 끝점은 끝색(1)
      expect(colorAt(v, startX, startY)).toBeCloseTo(0);
      expect(colorAt(v, headX, headY)).toBeCloseTo(1);
    }
  });

  it("진행률이 바뀔 때 값이 끊기지 않는다", () => {
    for (let progress = 0; progress < 100; progress += 0.5) {
      // Given: 0.5%p 차이 나는 두 진행률
      // When: 각각 그라디언트 벡터를 구하면
      const [a, b] = [vectorAt(progress), vectorAt(progress + 0.5)];

      // Then: 좌표가 3px 넘게 튀지 않는다
      for (const key of ["x1", "y1", "x2", "y2"] as const) {
        expect(Math.abs(a[key] - b[key])).toBeLessThan(3);
      }
    }
  });

  it("호가 거의 한 바퀴여도 직선이 짧게 뭉치지 않는다", () => {
    // Given: 진행률 99%
    // When: 그라디언트 벡터를 구하면
    const v = vectorAt(99);

    // Then: 지름에 가까운 길이를 유지한다
    expect(length(v)).toBeGreaterThan(100);
  });
});
