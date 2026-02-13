interface GuideBoxProps {
  children: React.ReactNode;
  /**
   * Direction of the arrow tail
   * - 'up': Arrow points upward (badge below the target)
   * - 'down': Arrow points downward (badge above the target)
   */
  arrowDirection: "up" | "down";
}

export function GuideBox({ children, arrowDirection }: GuideBoxProps) {
  const arrowClasses =
    arrowDirection === "down"
      ? "after:bottom-0 after:translate-y-full after:border-t-[#322F35]"
      : "after:top-0 after:-translate-y-full after:border-b-[#322F35]";

  return (
    <span
      className={`font-pretendard relative inline-block min-h-[24px] rounded-[4px] bg-[#322F35] px-[8px] py-[4px] text-xs leading-[140%] font-normal text-[#F5EFF7] after:absolute after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:content-[''] ${arrowClasses}`}
    >
      {children}
    </span>
  );
}
