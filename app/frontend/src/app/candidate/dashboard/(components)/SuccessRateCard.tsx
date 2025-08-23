import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/(components)/ui/card"
import { Star } from "lucide-react"

interface SuccessRateCardProps {
  myApplications: any[];
  interviewApplications: any[];
}

export function SuccessRateCard({ 
  myApplications, 
  interviewApplications 
}: SuccessRateCardProps) {
  const successRate = myApplications.length > 0
    ? Math.round(
        (interviewApplications.length / myApplications.length) * 100
      )
    : 0;

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-800">
          <Star className="h-5 w-5" />
          Success Rate
        </CardTitle>
        <CardDescription className="text-purple-700">
          Interview conversion rate
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {successRate}%
            </div>
            <p className="text-sm text-purple-700">Interview Rate</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}