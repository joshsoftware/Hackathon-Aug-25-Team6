import { Card, CardContent } from "@/app/(components)/ui/card";
import { Skeleton } from "@/app/(components)/ui/skeleton";

export function StatsCardSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-4 w-24" />
      </CardContent>
    </Card>
  );
}