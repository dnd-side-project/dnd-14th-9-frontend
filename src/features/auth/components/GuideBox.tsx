interface GuideBoxProps {
  children: React.ReactNode;
}

export function GuideBox({ children }: GuideBoxProps) {
  return (
    <span className="relative inline-block min-h-[24px] rounded-[4px] bg-[#322F35] px-[8px] py-[4px] text-xs leading-[140%] font-normal text-[#F5EFF7] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:translate-y-full after:border-4 after:border-transparent after:border-t-[#322F35] after:content-['']">
      {children}
    </span>
  );
}
