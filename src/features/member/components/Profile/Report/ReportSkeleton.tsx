export default function ReportSkeleton() {
  return (
    <div className="flex flex-col gap-[80px]">
      <div className="gap-lg grid grid-cols-2">
        <CardSkeleton />
        <CardSkeleton />
      </div>

      <div className="gap-lg grid grid-cols-2">
        <CardSkeleton />
        <CardSkeleton />
      </div>

      <HistorySkeleton />
    </div>
  );
}

function CardSkeleton() {
  return <div className="h-[200px] animate-pulse rounded-lg bg-gray-200" />;
}

function HistorySkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-[100px] animate-pulse rounded-lg bg-gray-200" />
      ))}
    </div>
  );
}
