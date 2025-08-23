import { Card, CardHeader, CardContent } from "@/app/(components)/ui/card";
import { Skeleton } from "@/app/(components)/ui/skeleton";

export function JobCardSkeleton() {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" /> {/* Title */}
            <Skeleton className="h-5 w-36" /> {/* Company */}
          </div>
          <Skeleton className="h-6 w-16" /> {/* Status Badge */}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-6 flex-wrap">
          <Skeleton className="h-5 w-28" /> {/* Location */}
          <Skeleton className="h-5 w-24" /> {/* Job Type */}
          <Skeleton className="h-5 w-32" /> {/* Applications */}
          <Skeleton className="h-5 w-36" /> {/* Posted Date */}
        </div>

        <div>
          <Skeleton className="h-4 w-full mb-2" /> {/* Description line 1 */}
          <Skeleton className="h-4 w-3/4" /> {/* Description line 2 */}
        </div>

        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-6 w-16" /> /* Skill badges */
          ))}
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Skeleton className="h-9 w-28" /> {/* View Details button */}
          <Skeleton className="h-9 w-44" /> {/* View Candidates button */}
          <Skeleton className="h-8 w-16" /> {/* Edit button */}
        </div>
      </CardContent>
    </Card>
  );
}