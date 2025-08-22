import { DashboardLayout } from "@/app/(components)/(layout)/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/(components)/ui/card";
import { Button } from "@/app/(components)/ui/button";
import { Badge } from "@/app/(components)/ui/badge";
import { Progress } from "@/app/(components)/ui/progress";
import { mockJobs, mockApplications } from "@/app/(lib)/mock-data";
import {
  Briefcase,
  FileText,
  Clock,
  CheckCircle,
  TrendingUp,
  Star,
  Target,
} from "lucide-react";
import Link from "next/link";
import { Breadcrumb } from "@/app/(components)/ui/breadcrumb";

export default function CandidateDashboard() {
  const activeJobs = mockJobs.filter((job) => job.status === "active");
  const myApplications = mockApplications.filter(
    (app) => app.candidateId === "2"
  );
  const pendingApplications = myApplications.filter(
    (app) => app.status === "pending"
  );
  const interviewApplications = myApplications.filter(
    (app) => app.status === "interview"
  );

  const profileCompletion = 85; // Mock profile completion percentage
  const avgMatchScore =
    myApplications.filter((app) => app.matchScore).length > 0
      ? Math.round(
          myApplications
            .filter((app) => app.matchScore)
            .reduce((sum, app) => sum + (app.matchScore || 0), 0) /
            myApplications.filter((app) => app.matchScore).length
        )
      : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumb items={[{ label: "Dashboard" }]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's your job search overview.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/candidate/applications">
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                My Applications
              </Button>
            </Link>
            <Link href="/candidate/jobs">
              <Button className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Browse Jobs
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Available Jobs
              </CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeJobs.length}</div>
              <p className="text-xs text-muted-foreground">Open positions</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                My Applications
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myApplications.length}</div>
              <p className="text-xs text-muted-foreground">Total submitted</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Review
              </CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {pendingApplications.length}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting response</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Interviews</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {interviewApplications.length}
              </div>
              <p className="text-xs text-muted-foreground">Scheduled</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
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
                    {myApplications.length > 0
                      ? Math.round(
                          (interviewApplications.length /
                            myApplications.length) *
                            100
                        )
                      : 0}
                    %
                  </div>
                  <p className="text-sm text-purple-700">Interview Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Applications */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>My Recent Applications</CardTitle>
                  <CardDescription>
                    Track the status of your job applications
                  </CardDescription>
                </div>
                <Link href="/candidate/applications">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {myApplications.length > 0 ? (
                <div className="space-y-4">
                  {myApplications.slice(0, 3).map((application) => {
                    const job = mockJobs.find(
                      (j) => j.id === application.jobId
                    );
                    if (!job) return null;

                    return (
                      <div
                        key={application.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="space-y-1">
                          <h3 className="font-medium text-foreground">
                            {job.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {job.company} • Applied{" "}
                            {new Date(
                              application.appliedDate
                            ).toLocaleDateString()}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                application.status === "interview"
                                  ? "default"
                                  : application.status === "pending"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {application.status}
                            </Badge>
                            {application.matchScore && (
                              <span className="text-sm text-muted-foreground">
                                Match: {application.matchScore}%
                              </span>
                            )}
                          </div>
                        </div>
                        <Link
                          href={`/candidate/applications/${application.id}`}
                        >
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mb-4">
                    You haven't applied to any jobs yet.
                  </p>
                  <Link href="/candidate/jobs">
                    <Button>Browse Available Jobs</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommended Jobs */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recommended for You</CardTitle>
                  <CardDescription>
                    Jobs that match your profile and interests
                  </CardDescription>
                </div>
                <Link href="/candidate/jobs">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeJobs.slice(0, 3).map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <h3 className="font-medium text-foreground">
                        {job.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {job.company} • {job.location}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{job.type}</Badge>
                        {job.salary && (
                          <span className="text-sm text-muted-foreground">
                            ${job.salary.min.toLocaleString()} - $
                            {job.salary.max.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link href={`/candidate/jobs/${job.id}`}>
                      <Button size="sm">View & Apply</Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
