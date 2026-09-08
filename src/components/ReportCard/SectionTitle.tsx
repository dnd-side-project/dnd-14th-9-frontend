interface SectionTitleProps {
  children: string;
  className?: string;
}

export default function SectionTitle({ children, className = "" }: SectionTitleProps) {
  return (
    <h4 className={`text-base leading-[1.4] font-bold md:text-lg ${className}`}>{children}</h4>
  );
}
