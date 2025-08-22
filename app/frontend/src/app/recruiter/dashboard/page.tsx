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
import { mockJobs, mockApplications } from "@/app/(lib)/mock-data";
import {
  Briefcase,
  Users,
  TrendingUp,
  Plus,
  Clock,
  AlertCircle,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { Breadcrumb } from "@/app/(components)/ui/breadcrumb";

export default function RecruiterDashboard() {
  const activeJobs = mockJobs.filter((job) => job.status === "active");
  const totalApplications = mockApplications.length;
  const pendingReviews = mockApplications.filter(
    (app) => app.status === "pending"
  ).length;
  const interviewsScheduled = mockApplications.filter(
    (app) => app.status === "interview"
  ).length;

  const matchScores = mockApplications
    .filter((app) => app.matchScore)
    .map((app) => app.matchScore!);
  const avgMatchScore =
    matchScores.length > 0
      ? Math.round(matchScores.reduce((a, b) => a + b, 0) / matchScores.length)
      : 0;

  const urgentItems = [
    ...mockApplications
      .filter(
        (app) =>
          app.status === "pending" &&
          new Date().getTime() - new Date(app.appliedDate).getTime() >
            7 * 24 * 60 * 60 * 1000
      )
      .slice(0, 3),
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumb items={[{ label: "Dashboard" }]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here&apos;s your recruitment overview.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/recruiter/reports">
              <Button variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Reports
              </Button>
            </Link>
            <Link href="/recruiter/jobs/new">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Job Opening
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeJobs.length}</div>
              <p className="text-xs text-muted-foreground">
                Currently recruiting
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Applications
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalApplications}</div>
              <p className="text-xs text-muted-foreground">
                Across all positions
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Reviews
              </CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {pendingReviews}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting your review
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg. Match Score
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {avgMatchScore}%
              </div>
              <p className="text-xs text-muted-foreground">
                Quality candidates
              </p>
            </CardContent>
          </Card>
        </div>

        {urgentItems.length > 0 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <AlertCircle className="h-5 w-5" />
                Needs Attention
              </CardTitle>
              <CardDescription className="text-amber-700">
                Applications that have been pending for over a week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {urgentItems.map((app) => {
                  const job = mockJobs.find((j) => j.id === app.jobId);
                  return (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border"
                    >
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">
                          {app.candidateName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Applied for {job?.title} •{" "}
                          {Math.floor(
                            (new Date().getTime() -
                              new Date(app.appliedDate).getTime()) /
                              (24 * 60 * 60 * 1000)
                          )}{" "}
                          days ago
                        </p>
                      </div>
                      <Link
                        href={`/recruiter/candidates/${app.candidateId}/report?jobId=${app.jobId}`}
                      >
                        <Button size="sm" variant="outline">
                          Review Now
                        </Button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Job Openings */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Job Openings</CardTitle>
                  <CardDescription>
                    Your latest job postings and their performance
                  </CardDescription>
                </div>
                <Link href="/recruiter/jobs">
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
                        <span className="text-sm text-muted-foreground">
                          {job.applicantCount} applications
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/recruiter/jobs/${job.id}/candidates`}>
                        <Button size="sm">View Candidates</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Upcoming Interviews</CardTitle>
                  <CardDescription>
                    Scheduled interviews for this week
                  </CardDescription>
                </div>
                <Link href="/recruiter/candidates">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {interviewsScheduled > 0 ? (
                <div className="space-y-4">
                  {mockApplications
                    .filter((app) => app.status === "interview")
                    .slice(0, 3)
                    .map((app) => {
                      const job = mockJobs.find((j) => j.id === app.jobId);
                      return (
                        <div
                          key={app.id}
                          className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="space-y-1">
                            <h3 className="font-medium text-foreground">
                              {app.candidateName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {job?.title} • Match: {app.matchScore}%
                            </p>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              Tomorrow at 2:00 PM
                            </div>
                          </div>
                          <Link
                            href={`/recruiter/candidates/${app.candidateId}/report?jobId=${app.jobId}`}
                          >
                            <Button size="sm" variant="outline">
                              View Profile
                            </Button>
                          </Link>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">
                    No interviews scheduled
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
