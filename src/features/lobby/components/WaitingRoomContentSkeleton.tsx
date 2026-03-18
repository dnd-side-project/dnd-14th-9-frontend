import { WaitingRoomSkeleton } from "@/features/session/components/WaitingRoomSkeleton";

export function WaitingRoomContentSkeleton() {
  return (
    <WaitingRoomSkeleton
      infoCardHeightClassName="h-[360px]"
      participantCardHeightClassName="h-[628px]"
      ariaHidden={true}
    />
  );
}
