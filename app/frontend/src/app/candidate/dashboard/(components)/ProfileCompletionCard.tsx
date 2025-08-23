import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/(components)/ui/card"
import { Button } from "@/app/(components)/ui/button"
import { Progress } from "@/app/(components)/ui/progress"
import { Target } from "lucide-react"

interface ProfileCompletionCardProps {
  profileCompletion: number
}

export function ProfileCompletionCard({ profileCompletion }: ProfileCompletionCardProps) {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Target className="h-5 w-5" />
          Profile Completion
        </CardTitle>
        <CardDescription className="text-blue-700">
          Complete your profile to get better matches
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800">
              Progress
            </span>
            <span className="text-sm font-bold text-blue-800">
              {profileCompletion}%
            </span>
          </div>
          <Progress value={profileCompletion} className="h-2" />
          <Button
            size="sm"
            variant="outline"
            className="w-full bg-transparent"
          >
            Complete Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}