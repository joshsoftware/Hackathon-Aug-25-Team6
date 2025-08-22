"use client";

import { useState } from "react";
import { DashboardLayout } from "@/app/(components)/(layout)/dashboard-layout";
import { Card, CardContent } from "@/app/(components)/ui/card";
import { Button } from "@/app/(components)/ui/button";
import { Badge } from "@/app/(components)/ui/badge";
import { Input } from "@/app/(components)/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/(components)/ui/select";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/(components)/ui/avatar";
import { mockJobs, mockApplications } from "@/app/(lib)/mock-data";
import {
  Search,
  TrendingUp,
  Calendar,
  MessageSquare,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/(components)/ui/dropdown-menu";
import Link from "next/link";
import { notFound } from "next/navigation";

interface JobCandidatesPageProps {
  params: {
    id: string;
  };
}

export default function JobCandidatesPage({ params }: JobCandidatesPageProps) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("match-score");

  const job = mockJobs.find((j) => j.id === params.id);
  const jobApplications = mockApplications.filter(
    (app) => app.jobId === params.id
  );

  if (!job) {
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
        return "New Application";
      case "screening":
        return "Under Review";
      case "interview":
        return "Interview";
      case "rejected":
        return "Rejected";
      case "hired":
        return "Hired";
      default:
        return status;
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const filteredApplications = jobApplications.filter((app) => {
    if (statusFilter === "all") return true;
    return app.status === statusFilter;
  });

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    switch (sortBy) {
      case "match-score":
        return (b.matchScore || 0) - (a.matchScore || 0);
      case "applied-date":
        return (
          new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()
        );
      case "name":
        return a.candidateName.localeCompare(b.candidateName);
      default:
        return 0;
    }
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Candidates</h1>
            <p className="text-muted-foreground">
              {job.title} at {job.company} • {jobApplications.length}{" "}
              applications
            </p>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {jobApplications.length}
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
                    jobApplications.filter((app) => app.status === "pending")
                      .length
                  }
                </div>
                <p className="text-xs text-muted-foreground">Pending Review</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {
                    jobApplications.filter((app) => app.status === "interview")
                      .length
                  }
                </div>
                <p className="text-xs text-muted-foreground">Interviews</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {Math.round(
                    jobApplications.reduce(
                      (sum, app) => sum + (app.matchScore || 0),
                      0
                    ) / jobApplications.length || 0
                  )}
                  %
                </div>
                <p className="text-xs text-muted-foreground">Avg Match Score</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search candidates..." className="pl-10" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">New Applications</SelectItem>
                  <SelectItem value="screening">Under Review</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="hired">Hired</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="match-score">Match Score</SelectItem>
                  <SelectItem value="applied-date">Application Date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Candidates List */}
        <div className="space-y-4">
          {sortedApplications.map((application) => (
            <Card
              key={application.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={`/abstract-geometric-shapes.png?height=48&width=48&query=${application.candidateName}`}
                      />
                      <AvatarFallback>
                        {application.candidateName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-foreground">
                        {application.candidateName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {application.candidateEmail}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(application.status)}>
                          {getStatusText(application.status)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Applied{" "}
                          {new Date(
                            application.appliedDate
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {application.matchScore && (
                      <div className="text-center">
                        <div
                          className={`text-2xl font-bold ${getMatchScoreColor(
                            application.matchScore
                          )}`}
                        >
                          {application.matchScore}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Match Score
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/recruiter/candidates/${application.candidateId}/report?jobId=${job.id}`}
                      >
                        <Button variant="outline" size="sm">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          View Report
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule Interview
                          </DropdownMenuItem>
                          <DropdownMenuItem>Move to Interview</DropdownMenuItem>
                          <DropdownMenuItem>
                            Reject Application
                          </DropdownMenuItem>
                          <DropdownMenuItem>Download Resume</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {sortedApplications.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-medium text-foreground mb-2">
                No candidates found
              </h3>
              <p className="text-muted-foreground">
                {statusFilter === "all"
                  ? "No applications have been submitted for this job yet."
                  : `No candidates match the selected filter: ${statusFilter}`}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
