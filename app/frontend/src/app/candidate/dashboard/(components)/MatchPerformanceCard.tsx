import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/(components)/ui/card"
import { TrendingUp } from "lucide-react"

interface MatchPerformanceCardProps {
  avgMatchScore: number
}

export function MatchPerformanceCard({ avgMatchScore }: MatchPerformanceCardProps) {
  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <TrendingUp className="h-5 w-5" />
          Match Performance
        </CardTitle>
        <CardDescription className="text-green-700">
          Your average compatibility score
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {avgMatchScore}%
            </div>
            <p className="text-sm text-green-700">Average Match Score</p>
          </div>
          {avgMatchScore > 0 && (
            <div className="text-xs text-green-600 text-center">
              {avgMatchScore >= 80
                ? "Excellent matches!"
                : avgMatchScore >= 60
                ? "Good compatibility"
                : "Room for improvement"}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}