import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDiscountsLoading() {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-10 w-36" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border bg-card p-4 flex items-center justify-between gap-3"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-12 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              <Skeleton className="h-3 w-2/3" />
            </div>
            <div className="flex gap-1 shrink-0">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
