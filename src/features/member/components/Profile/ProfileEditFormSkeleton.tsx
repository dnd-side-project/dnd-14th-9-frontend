import { SkeletonBlock } from "@/components/Skeleton/SkeletonBlock";

function FieldSkeleton({
  labelWidth,
  inputClassName,
}: {
  labelWidth: string;
  inputClassName: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <SkeletonBlock className={`h-5 ${labelWidth}`} />
      <SkeletonBlock className={inputClassName} />
    </div>
  );
}

export function ProfileEditFormSkeleton() {
  return (
    <div className="flex w-full flex-col gap-20" aria-hidden="true">
      <div className="gap-2xl flex flex-col">
        <SkeletonBlock className="h-7 w-28" />
        <FieldSkeleton labelWidth="w-16" inputClassName="h-13.5 w-full" />
        <FieldSkeleton labelWidth="w-20" inputClassName="h-[260px] w-full" />
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <SkeletonBlock className="h-7 w-36" />
          <SkeletonBlock className="h-5 w-72 max-w-full" />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-11 w-[136px] rounded-full" />
          ))}
        </div>
      </div>

      <div className="flex w-full items-center justify-center gap-4">
        <SkeletonBlock className="h-12 w-32 rounded-md" />
        <SkeletonBlock className="h-12 w-32 rounded-md" />
      </div>
    </div>
  );
}
