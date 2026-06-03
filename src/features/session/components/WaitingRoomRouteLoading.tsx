import { WaitingRoomSkeleton } from "./WaitingRoomSkeleton";

export function WaitingRoomRouteLoading() {
  return (
    <WaitingRoomSkeleton
      infoCardHeightClassName="h-52"
      participantCardHeightClassName="h-[280px] xl:h-[320px]"
    />
  );
}
