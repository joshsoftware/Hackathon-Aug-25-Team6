import { DashboardLayout } from "@/app/(components)/(layout)/dashboard-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/(components)/ui/card";
import { Button } from "@/app/(components)/ui/button";
import { Badge } from "@/app/(components)/ui/badge";
import { Input } from "@/app/(components)/ui/input";
import { mockJobs, mockApplications } from "@/app/(lib)/mock-data";
import { Search, Calendar, Building2, MapPin, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function ApplicationsPage() {
  const myApplications = mockApplications.filter(
    (app) => app.candidateId === "2"
  );

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              My Applications
            </h1>
            <p className="text-muted-foreground">
              Track the status of your job applications
            </p>
          </div>
          <Link href="/candidate/jobs">
            <Button>Browse More Jobs</Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search applications..." className="pl-10" />
              </div>
              <Button variant="outline">Filter by Status</Button>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        {myApplications.length > 0 ? (
          <div className="space-y-4">
            {myApplications.map((application) => {
              const job = mockJobs.find((j) => j.id === application.jobId);
              if (!job) return null;

              return (
                <Card
                  key={application.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                            {new Date(
                              application.appliedDate
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <Badge variant={getStatusColor(application.status)}>
                        {getStatusText(application.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {job.description}
                    </p>

                    {application.matchScore && (
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-foreground">
                          {application.matchScore}% Match Score
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Based on your resume and pre-screening responses
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Link href={`/candidate/applications/${application.id}`}>
                        <Button variant="outline">View Details</Button>
                      </Link>
                      <Link href={`/candidate/jobs/${job.id}`}>
                        <Button variant="ghost" size="sm">
                          View Job
                        </Button>
                      </Link>
                      {application.status === "interview" && (
                        <Button size="sm" className="ml-auto">
                          Schedule Interview
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground">
                  No Applications Yet
                </h3>
                <p className="text-muted-foreground">
                  You haven&apos;t applied to any jobs yet. Start browsing available
                  positions to find your next opportunity.
                </p>
                <Link href="/candidate/jobs">
                  <Button>Browse Job Openings</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
