import { ReactNode } from "react";

interface ReportCardProps {
  children: ReactNode;
  className?: string;
}

export default function ReportCard({ children, className = "" }: ReportCardProps) {
  return <div className={`flex flex-col ${className}`}>{children}</div>;
}
