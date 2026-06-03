import { WaitingRoomSkeleton } from "./WaitingRoomSkeleton";

export function WaitingRoomRouteLoading() {
  return (
    <WaitingRoomSkeleton
      infoCardHeightClassName="h-[560px] xl:h-[360px]"
      participantCardHeightClassName="h-[360px] xl:h-[628px]"
    />
  );
}
