interface SectionTitleProps {
  children: string;
  className?: string;
}

export default function SectionTitle({ children, className = "" }: SectionTitleProps) {
  return <h4 className={`text-base font-bold md:text-lg ${className}`}>{children}</h4>;
}
