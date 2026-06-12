import { WaitingRoomSkeleton } from "@/features/session/components/WaitingRoomSkeleton";

export function WaitingRoomContentSkeleton() {
  return (
    <WaitingRoomSkeleton
      infoCardHeightClassName="h-[560px] xl:h-[360px]"
      participantCardHeightClassName="h-[360px] xl:h-[628px]"
      ariaHidden={true}
    />
  );
}
