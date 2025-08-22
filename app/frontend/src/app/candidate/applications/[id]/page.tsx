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
import { Separator } from "@/app/(components)/ui/separator";
import { mockJobs, mockApplications } from "@/app/(lib)/mock-data";
import {
  Calendar,
  Building2,
  MapPin,
  FileText,
  MessageSquare,
  TrendingUp,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ApplicationDetailPageProps {
  params: {
    id: string;
  };
}

export default function ApplicationDetailPage({
  params,
}: ApplicationDetailPageProps) {
  const application = mockApplications.find((app) => app.id === params.id);
  const job = application
    ? mockJobs.find((j) => j.id === application.jobId)
    : null;

  if (!application || !job) {
    notFound();
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "screening":
        return "default";
      case "interview":
        return "default";
      case "rejected":
        return "destructive";
      case "hired":
        return "default";
      default:
        return "secondary";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Under Review";
      case "screening":
        return "Pre-screening";
      case "interview":
        return "Interview Stage";
      case "rejected":
        return "Not Selected";
      case "hired":
        return "Hired";
      default:
        return status;
    }
  };

  const getNextSteps = (status: string) => {
    switch (status) {
      case "pending":
        return "Your application is being reviewed by the recruitment team. We'll contact you soon with updates.";
      case "screening":
        return "Your pre-screening responses are being evaluated. If you're a good fit, we'll schedule an interview.";
      case "interview":
        return "Congratulations! You've been selected for an interview. Check your email for scheduling details.";
      case "rejected":
        return "Thank you for your interest. While you weren't selected for this role, we encourage you to apply for other positions.";
      case "hired":
        return "Congratulations! You've been selected for this position. HR will contact you with next steps.";
      default:
        return "We'll keep you updated on your application status.";
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">
                {job.title}
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {job.company}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Applied{" "}
                  {new Date(application.appliedDate).toLocaleDateString()}
                </div>
              </div>
            </div>
            <Badge
              variant={getStatusColor(application.status)}
              className="text-sm"
            >
              {getStatusText(application.status)}
            </Badge>
          </div>
        </div>

        {/* Status Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Clock className="h-6 w-6 text-primary mt-1" />
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">
                  Application Status: {getStatusText(application.status)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {getNextSteps(application.status)}
                </p>
                {application.status === "interview" && (
                  <Button size="sm" className="mt-2">
                    Schedule Interview
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Application Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Application Timeline</CardTitle>
                <CardDescription>
                  Track your application progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-primary rounded-full" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        Application Submitted
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(application.appliedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {application.status !== "pending" && (
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 bg-primary rounded-full" />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          Under Review
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(
                            Date.now() - 24 * 60 * 60 * 1000
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {application.status === "interview" && (
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 bg-primary rounded-full" />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          Interview Scheduled
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Check your email for details
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-muted rounded-full" />
                    <div className="flex-1">
                      <p className="font-medium text-muted-foreground">
                        Final Decision
                      </p>
                      <p className="text-sm text-muted-foreground">Pending</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Match Score */}
            {application.matchScore && (
              <Card>
                <CardHeader>
                  <CardTitle>Match Analysis</CardTitle>
                  <CardDescription>
                    How well your profile matches this position
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {application.matchScore}%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Overall Match Score
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        Skills Match
                      </span>
                      <span className="text-sm text-muted-foreground">90%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        Experience Level
                      </span>
                      <span className="text-sm text-muted-foreground">85%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        Requirements Met
                      </span>
                      <span className="text-sm text-muted-foreground">80%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pre-screening Responses */}
            <Card>
              <CardHeader>
                <CardTitle>Pre-screening Responses</CardTitle>
                <CardDescription>
                  Your answers to the pre-screening questions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">
                          How many years of experience do you have with React?
                        </p>
                        <p className="text-sm text-muted-foreground">
                          5+ years
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">
                          Describe a challenging project where you used
                          TypeScript.
                        </p>
                        <p className="text-sm text-muted-foreground">
                          I led the migration of a large e-commerce platform
                          from JavaScript to TypeScript, which involved
                          refactoring over 200 components and establishing type
                          safety across the entire codebase...
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/candidate/jobs/${job.id}`}>
                  <Button variant="outline" className="w-full bg-transparent">
                    <FileText className="h-4 w-4 mr-2" />
                    View Job Details
                  </Button>
                </Link>
                <Button variant="outline" className="w-full bg-transparent">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Recruiter
                </Button>
                <Button variant="ghost" className="w-full">
                  Withdraw Application
                </Button>
              </CardContent>
            </Card>

            {/* Application Details */}
            <Card>
              <CardHeader>
                <CardTitle>Application Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-foreground">
                    Application ID
                  </div>
                  <div className="text-sm text-muted-foreground font-mono">
                    {application.id}
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="text-sm font-medium text-foreground">
                    Submitted
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(application.appliedDate).toLocaleDateString()}
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="text-sm font-medium text-foreground">
                    Status
                  </div>
                  <Badge variant={getStatusColor(application.status)}>
                    {getStatusText(application.status)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
