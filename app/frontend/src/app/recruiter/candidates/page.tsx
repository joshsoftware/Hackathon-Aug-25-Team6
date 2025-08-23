"use client";

import { useState } from "react";
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
import { Search, TrendingUp, Briefcase } from "lucide-react";
import Link from "next/link";
import { useGetApplicants, ICandidate } from "./query/query";
import { Skeleton } from "@/app/(components)/ui/skeleton";

export default function AllCandidatesPage() {
  const { data: allApplicants, isLoading, isError } = useGetApplicants();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter candidates based on search
  const filteredCandidates = allApplicants?.filter(
    (candidate) =>
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get only candidate users (role === "candidate")
  const candidates = filteredCandidates?.filter(
    (applicant) => applicant.role === "candidate"
  );

  // Calculate total applications across all candidates
  const totalApplications = candidates?.reduce(
    (sum, candidate) => sum + candidate.job_applications.length,
    0
  ) || 0;

  // Calculate number of candidates in interview stage (if status is available)
  const inInterviewCount = candidates?.reduce(
    (sum, candidate) =>
      sum +
      candidate.job_applications.filter(
        (app) => app.status === "interview"
      ).length,
    0
  ) || 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  // Helper function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
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

          {/* Stats with Skeleton Loading */}
          <div className="grid gap-4 md:grid-cols-4">
            {isLoading ? (
              // Skeleton Loaders for Stats Cards
              <>
                <Card>
                  <CardContent className="pt-6">
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </CardContent>
                </Card>
              </>
            ) : !isError && candidates ? (
              // Actual Stats Content
              <>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{candidates.length}</div>
                    <p className="text-xs text-muted-foreground">
                      Total Candidates
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{totalApplications}</div>
                    <p className="text-xs text-muted-foreground">
                      Total Applications
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{inInterviewCount}</div>
                    <p className="text-xs text-muted-foreground">In Interview</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {/* If you have match scores in your API, calculate average here */}
                      -
                    </div>
                    <p className="text-xs text-muted-foreground">Avg Match Score</p>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search candidates..." 
                  className="pl-10" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button variant="outline" disabled={isLoading}>Filter</Button>
              <Button variant="outline" disabled={isLoading}>Export</Button>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {isError && (
          <Card className="bg-destructive/10">
            <CardContent className="p-6">
              <p className="text-center text-destructive">
                Failed to load candidates. Please try again later.
              </p>
            </CardContent>
          </Card>
        )}

        {/* No Results */}
        {!isLoading && !isError && candidates?.length === 0 && (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                No candidates found.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Skeleton Loader for Candidates */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-60" />
                        <Skeleton className="h-6 w-32" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-9 w-32" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Candidates List */}
        {!isLoading && !isError && candidates && (
          <div className="space-y-4">
            {candidates.map((candidate) => (
              <Card
                key={candidate.user_id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={`/abstract-geometric-shapes.png?height=48&width=48&query=${candidate.name}`}
                        />
                        <AvatarFallback>
                          {getInitials(candidate.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-foreground">
                          {candidate.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {candidate.email}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {candidate.job_applications.length} applications
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Add match score display if you have that data */}

                      <div className="space-y-2">
                        {candidate.job_applications.slice(0, 2).map((app) => (
                          <div
                            key={app.application_id}
                            className="flex items-center gap-2 text-sm"
                          >
                            <Briefcase className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {app.job_title}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {app.status || "pending"}
                            </Badge>
                          </div>
                        ))}
                        {candidate.job_applications.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{candidate.job_applications.length - 2} more applications
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Link href={`/recruiter/candidates/${candidate.user_id}`}>
                          <Button variant="outline" size="sm">
                            <TrendingUp className="h-4 w-4 mr-2" />
                            View Profile
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}