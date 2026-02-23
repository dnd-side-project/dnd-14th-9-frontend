export default function StatsSkeleton() {
  return (
    <div className="gap-lg grid grid-cols-2">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}

function CardSkeleton() {
  return <div className="h-[200px] animate-pulse rounded-lg bg-gray-200" />;
}
