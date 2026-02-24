export default function SessionHistorySkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-[100px] animate-pulse rounded-lg bg-gray-200" />
      ))}
    </div>
  );
}
