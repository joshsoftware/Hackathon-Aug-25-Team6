"use client";

import { useState } from "react";
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
import { Input } from "@/app/(components)/ui/input";
import { Search, Plus, MapPin, Briefcase, Users, Calendar } from "lucide-react";
import Link from "next/link";
import { useGetJobs, IJob } from "./query/query";
import { JobCardSkeleton } from "./(components)/JobCardSkeleton";
import { StatsCardSkeleton } from "./(components)/StatsCardSkeleton";

export default function RecruiterJobsPage() {
  const { data: jobs, isLoading, isError } = useGetJobs();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter jobs based on search query
  const filteredJobs = jobs?.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Job Openings</h1>
            <p className="text-muted-foreground">
              Manage your job postings and track applications
            </p>
          </div>

          <Link href="/recruiter/jobs/new">
            <Button className="flex items-center gap-2" disabled={isLoading}>
              <Plus className="h-4 w-4" />
              Add Job Opening
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search job openings..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button variant="outline" disabled={isLoading}>Filter</Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards (Optional) - Add if you have stats in your design */}
        {isLoading && (
          <div className="grid gap-4 md:grid-cols-4">
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </div>
        )}

        {/* Error State */}
        {isError && (
          <Card className="bg-destructive/10">
            <CardContent className="p-6">
              <p className="text-center text-destructive">
                Failed to load jobs. Please try again later.
              </p>
            </CardContent>
          </Card>
        )}

        {/* No Results */}
        {!isLoading && !isError && filteredJobs?.length === 0 && (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                No job openings found.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Job Listings with Skeleton Loading */}
        <div className="grid gap-6">
          {isLoading ? (
            // Skeleton Loading State
            Array(3).fill(0).map((_, index) => (
              <JobCardSkeleton key={`skeleton-${index}`} />
            ))
          ) : !isError && filteredJobs ? (
            // Actual Job Listings
            filteredJobs.map((job) => (
              <Card key={job.job_id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                      <CardDescription className="text-base">
                        {job.company}
                      </CardDescription>
                    </div>
                    <Badge variant="default">
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-6 text-sm text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </div>
                    
                    {job.job_type && (
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {job.job_type}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {job.applications_count} applications
                    </div>
                    {job.posted_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Posted: {new Date(job.posted_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {job.job_overview}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {job.must_have_skills.slice(0, 4).map((skill) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                    {job.must_have_skills.length > 4 && (
                      <Badge variant="outline">
                        +{job.must_have_skills.length - 4} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Link href={`/recruiter/jobs/${job.job_id}`}>
                      <Button variant="outline">View Details</Button>
                    </Link>
                    <Link href={`/recruiter/jobs/${job.job_id}/candidates`}>
                      <Button>View Candidates ({job.applications_count})</Button>
                    </Link>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : null}
        </div>
      </div>
    </DashboardLayout>
  );
}