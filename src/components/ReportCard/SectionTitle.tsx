interface SectionTitleProps {
  children: string;
  className?: string;
}

export default function SectionTitle({ children, className = "" }: SectionTitleProps) {
  return <h4 className={`text-lg font-bold ${className}`}>{children}</h4>;
}
