import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/Badge/Badge";
import { CalendarIcon } from "@/components/Icon/CalendarIcon";
import { ClockIcon } from "@/components/Icon/ClockIcon";
import { UsersIcon } from "@/components/Icon/UsersIcon";
import { cn } from "@/lib/utils/utils";

export interface CardProps {
  id: string | number;
  title: string;
  summary?: string;
  author: string;
  imageUrl: string;
  currentMembers: number;
  maxMembers: number;
  timeLeft: string;
  date: string;
  category: string;
  status: "recruiting" | "closing" | "inProgress" | "closed";
  statusText?: string;
  className?: string;
  /**
   * Layout mode for the card.
   * - `vertical`: Always vertical layout.
   * - `horizontal`: Always horizontal layout.
   * @default "vertical"
   */
  layout?: "vertical" | "horizontal";
}

export function Card({
  id,
  title,
  author,
  imageUrl,
  currentMembers,
  maxMembers,
  timeLeft,
  date,
  category,
  status,
  statusText,
  className,
  layout = "vertical",
}: CardProps) {
  // Mapping status to Badge status
  const getBadgeStatus = (status: CardProps["status"]) => {
    switch (status) {
      case "closing":
        return "closing";
      case "inProgress":
        return "inProgress";
      case "closed":
        return "closed";
      default:
        return "recruiting";
    }
  };

  const isVertical = layout === "vertical";
  const isHorizontal = layout === "horizontal";

  return (
    <Link
      href={`/meeting/${id}`}
      className={cn(
        "group flex transition-all active:scale-[0.99]",

        // --- Layout Styles ---

        // Vertical Layout
        isVertical && "flex-col gap-4",

        // Horizontal Layout
        isHorizontal && "flex-row gap-4 p-4",

        className
      )}
    >
      {/* Image Section */}
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-xs",

          // Vertical Style
          isVertical && "h-[170px] w-full",

          // Horizontal Style
          isHorizontal && "h-[180px] w-[290px]"
        )}
      >
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 120px, 320px"
        />
      </div>

      {/* Content Section */}
      <div
        className={cn(
          "gap-md py-xs flex flex-1 flex-col",

          // Horizontal Style
          isHorizontal && "py-xs p-0"
        )}
      >
        <div className="gap-xs flex flex-col">
          {/* Header (Badges) */}
          <div className="flex items-center gap-2">
            <Badge radius="xs" status="recruiting" className="border-0 px-2 py-1">
              {category}
            </Badge>
            <Badge radius="max" status={getBadgeStatus(status)} className="px-3 py-1">
              {statusText || status}
            </Badge>
          </div>

          {/* Title & Author */}
          <div className="gap-2xs flex flex-col">
            <h3 className="text-text-primary group-hover:text-text-brand-default line-clamp-2 text-lg leading-tight font-bold text-balance transition-colors">
              {title}
            </h3>
            <span className="text-text-muted text-xs font-medium">{author}</span>
          </div>
        </div>

        {/* Info Footer */}
        <div className="text-text-disabled flex items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1">
            <UsersIcon className="h-[14px] w-[14px]" />
            <span>
              {currentMembers} / {maxMembers}명
            </span>
          </div>
          <div className="flex items-center gap-1">
            <ClockIcon className="h-[14px] w-[14px]" />
            <span>{timeLeft}</span>
          </div>
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-[14px] w-[14px]" />
            <span>{date}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
