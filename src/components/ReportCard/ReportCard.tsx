import { ReactNode } from "react";

import { cn } from "@/lib/utils/utils";

interface ReportCardProps {
  children: ReactNode;
  className?: string;
}

export default function ReportCard({ children, className = "" }: ReportCardProps) {
  return <div className={cn("gap-lg flex flex-1 flex-col", className)}>{children}</div>;
}
