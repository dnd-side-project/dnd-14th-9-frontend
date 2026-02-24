import { Badge } from "@/components/Badge/Badge";
import { getCategoryLabel } from "@/lib/constants/category";
import type { Category } from "@/lib/constants/category";

import { INTEREST_RANKS } from "./constants";

import type { MemberProfileView } from "../../types";

export function InterestBadges({ profile }: { profile: MemberProfileView }) {
  const badges = INTEREST_RANKS.map(({ rank, key }) => {
    const value = profile[key];
    return value ? { rank, label: getCategoryLabel(value as Category) } : null;
  }).filter((item): item is NonNullable<typeof item> => item !== null);

  if (badges.length === 0) return null;

  return (
    <div className="gap-xs flex">
      {badges.map(({ rank, label }) => (
        <div key={rank} className="gap-xs flex items-center">
          <p className="text-text-primary text-xs font-semibold">{rank}</p>
          <Badge>{label}</Badge>
        </div>
      ))}
    </div>
  );
}
