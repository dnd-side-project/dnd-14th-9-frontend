import { WaitingRoomSkeleton } from "./WaitingRoomSkeleton";

export function WaitingRoomRouteLoading() {
  return (
    <WaitingRoomSkeleton
      infoCardHeightClassName="h-52"
      participantCardHeightClassName="h-[320px]"
    />
  );
}
