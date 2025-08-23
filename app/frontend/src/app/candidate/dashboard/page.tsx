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
import { MatchPerformanceCard } from "./(components)/MatchPerformanceCard";
import { ProfileCompletionCard } from "./(components)/ProfileCompletionCard";
import { SuccessRateCard } from "./(components)/SuccessRateCard";

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

        {/* <div className="grid gap-6 lg:grid-cols-3">
          <ProfileCompletionCard profileCompletion={profileCompletion} />
          <MatchPerformanceCard avgMatchScore={avgMatchScore} />
          <SuccessRateCard 
            myApplications={myApplications} 
            interviewApplications={interviewApplications} 
          />
        </div> */}

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
