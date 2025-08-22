import { DashboardLayout } from "@/app/(components)/(layout)/dashboard-layout";
import { Card, CardContent } from "@/app/(components)/ui/card";
import { Button } from "@/app/(components)/ui/button";
import { Badge } from "@/app/(components)/ui/badge";
import { Input } from "@/app/(components)/ui/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/(components)/ui/avatar";
import { mockJobs, mockApplications } from "@/app/(lib)/mock-data";
import { Search, TrendingUp, MessageSquare, Briefcase } from "lucide-react";

export default function AllCandidatesPage() {
  // Get all unique candidates across all jobs
  const allCandidates = mockApplications.reduce(
    (acc, app) => {
      const existing = acc.find((c) => c.candidateId === app.candidateId);
      if (existing) {
        existing.applications.push(app);
      } else {
        acc.push({
          candidateId: app.candidateId,
          candidateName: app.candidateName,
          candidateEmail: app.candidateEmail,
          applications: [app],
          averageMatchScore: app.matchScore || 0,
          lastActivity: app.appliedDate,
        });
      }
      return acc;
    },
    [] as Array<{
      candidateId: string;
      candidateName: string;
      candidateEmail: string;
      applications: typeof mockApplications;
      averageMatchScore: number;
      lastActivity: string;
    }>
  );

  // Calculate average match scores
  allCandidates.forEach((candidate) => {
    const scores = candidate.applications
      .filter((app) => app.matchScore)
      .map((app) => app.matchScore!);
    candidate.averageMatchScore =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              All Candidates
            </h1>
            <p className="text-muted-foreground">
              Manage candidates across all your job openings
            </p>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{allCandidates.length}</div>
                <p className="text-xs text-muted-foreground">
                  Total Candidates
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {mockApplications.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total Applications
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {
                    mockApplications.filter((app) => app.status === "interview")
                      .length
                  }
                </div>
                <p className="text-xs text-muted-foreground">In Interview</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {Math.round(
                    allCandidates.reduce(
                      (sum, candidate) => sum + candidate.averageMatchScore,
                      0
                    ) / allCandidates.length || 0
                  )}
                  %
                </div>
                <p className="text-xs text-muted-foreground">Avg Match Score</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search candidates..." className="pl-10" />
              </div>
              <Button variant="outline">Filter</Button>
              <Button variant="outline">Export</Button>
            </div>
          </CardContent>
        </Card>

        {/* Candidates List */}
        <div className="space-y-4">
          {allCandidates.map((candidate) => (
            <Card
              key={candidate.candidateId}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={`/abstract-geometric-shapes.png?height=48&width=48&query=${candidate.candidateName}`}
                      />
                      <AvatarFallback>
                        {candidate.candidateName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-foreground">
                        {candidate.candidateName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {candidate.candidateEmail}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {candidate.applications.length} applications
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Last activity:{" "}
                          {new Date(
                            candidate.lastActivity
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {candidate.averageMatchScore > 0 && (
                      <div className="text-center">
                        <div
                          className={`text-2xl font-bold ${getScoreColor(
                            candidate.averageMatchScore
                          )}`}
                        >
                          {candidate.averageMatchScore}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Avg Match
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      {candidate.applications.slice(0, 2).map((app) => {
                        const job = mockJobs.find((j) => j.id === app.jobId);
                        return (
                          <div
                            key={app.id}
                            className="flex items-center gap-2 text-sm"
                          >
                            <Briefcase className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {job?.title}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {app.status}
                            </Badge>
                          </div>
                        );
                      })}
                      {candidate.applications.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{candidate.applications.length - 2} more applications
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button variant="outline" size="sm">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
