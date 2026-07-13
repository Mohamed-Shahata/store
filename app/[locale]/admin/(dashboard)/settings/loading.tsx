import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function FieldSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export default function AdminSettingsLoading() {
  return (
    <div className="space-y-10">
      <div>
        <Skeleton className="h-9 w-40 mb-8" />
        <div className="space-y-6 max-w-3xl">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              <FieldSkeleton />
              <FieldSkeleton />
              <FieldSkeleton />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <FieldSkeleton />
              <FieldSkeleton />
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <Skeleton className="h-7 w-44 mb-2" />
        <Skeleton className="h-4 w-64 mb-6" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-28" />
            </CardHeader>
            <CardContent className="space-y-4">
              <FieldSkeleton />
              <FieldSkeleton />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <FieldSkeleton />
              <FieldSkeleton />
              <FieldSkeleton />
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <Skeleton className="h-7 w-36 mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
