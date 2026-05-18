import Link from "next/link";

import { ShareIcon } from "@/components/Icon/ShareIcon";

import { Card } from "../Card/Card";

import type { SessionListItem } from "../../types";

interface SessionCardItemProps {
  session: SessionListItem;
  onShare: (sessionId: number) => void;
}

export function SessionCardItem({ session, onShare }: SessionCardItemProps) {
  return (
    <div className="relative mx-auto w-full xl:max-w-69">
      <Link href={`/session/${session.sessionId}`} scroll={false} className="block">
        <Card
          size="responsive"
          thumbnailSrc={session.imageUrl}
          category={session.category}
          createdAt={session.startTime}
          title={session.title}
          nickname={session.hostNickname}
          currentParticipants={session.currentParticipants}
          maxParticipants={session.maxParticipants}
          durationMinutes={session.sessionDurationMinutes}
          sessionDate={session.startTime}
        />
      </Link>
      <button
        type="button"
        className="bg-surface-default/80 hover:bg-surface-default absolute top-2 right-2 flex cursor-pointer items-center justify-center rounded-full p-1.5 backdrop-blur-sm transition-colors"
        onClick={() => onShare(session.sessionId)}
        aria-label="세션 링크 복사"
      >
        <ShareIcon size="small" className="text-text-secondary" />
      </button>
    </div>
  );
}
