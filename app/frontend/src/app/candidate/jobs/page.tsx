"use client";

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
import { SearchInput } from "@/app/(components)/ui/search-input";
import { FilterDropdown } from "@/app/(components)/ui/filter-dropdown";
import { Breadcrumb } from "@/app/(components)/ui/breadcrumb";
import { mockJobs } from "@/app/(lib)/mock-data";
import {
  MapPin,
  DollarSign,
  Calendar,
  Bookmark,
  BookmarkCheck,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { useGetJobs, IJob } from "@/app/recruiter/jobs/query/query";

export default function CandidateJobsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [locationFilters, setLocationFilters] = useState<string[]>([]);
  const [typeFilters, setTypeFilters] = useState<string[]>([]);
  const [salaryFilters, setSalaryFilters] = useState<string[]>([]);
  const { data: jobs, isLoading, isError } = useGetJobs();


  const activeJobs = jobs;

  const filteredJobs = useMemo(() => {
    return activeJobs?.filter((job) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.must_have_skills.some((skill) =>
          skill.toLowerCase().includes(searchQuery.toLowerCase())
        );
      // Location filter
      const matchesLocation = locationFilters.length === 0 || locationFilters.includes(job.location);

      // Type filter
      const matchesType = typeFilters.length === 0 || typeFilters.includes(job.job_type);

      return matchesSearch && matchesLocation && matchesType;
    });
  }, [activeJobs, searchQuery, locationFilters, typeFilters]);

  const locationOptions = Array.from(
    new Set(activeJobs?.map((job) => job.location))
  ).map((location) => ({
    label: location,
    value: location,
    checked: locationFilters.includes(location),
  }));

  const typeOptions = Array.from(
    new Set(activeJobs?.map((job) => job.job_type))
  ).map((type) => ({
    label: type,
    value: type,
    checked: typeFilters.includes(type),
  }));

  const handleLocationFilter = (value: string, checked: boolean) => {
    setLocationFilters((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value)
    );
  };

  const handleTypeFilter = (value: string, checked: boolean) => {
    setTypeFilters((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value)
    );
  };

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs((prev) =>
      prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId]
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumb items={[{ label: "Jobs" }]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Job Openings</h1>
            <p className="text-muted-foreground">
              Discover opportunities that match your skills and interests •{" "}
              {filteredJobs?.length} jobs found
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex-1">
                <SearchInput
                  placeholder="Search jobs by title, company, or skills..."
                  onSearch={setSearchQuery}
                  value={searchQuery}
                />
              </div>
              <div className="flex items-center gap-2">
                <FilterDropdown
                  title="Location"
                  options={locationOptions}
                  onFilterChange={handleLocationFilter}
                />
                <FilterDropdown
                  title="Job Type"
                  options={typeOptions}
                  onFilterChange={handleTypeFilter}
                />                
              </div>
            </div>

            {(locationFilters.length > 0 ||
              typeFilters.length > 0 ||
              salaryFilters.length > 0) && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                <span className="text-sm font-medium text-muted-foreground">
                  Active filters:
                </span>
                {locationFilters.map((filter) => (
                  <Badge
                    key={filter}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleLocationFilter(filter, false)}
                  >
                    {filter} ×
                  </Badge>
                ))}
                {typeFilters.map((filter) => (
                  <Badge
                    key={filter}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleTypeFilter(filter, false)}
                  >
                    {filter} ×
                  </Badge>
                ))}               
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6">
          {(filteredJobs || []).length > 0 ? (
            filteredJobs?.map((job) => (
              <Card key={job.job_id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                      <CardDescription className="text-base">                        
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                           {job.company}
                          <MapPin className="h-4 w-4" />
                           {job.location}
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">New</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSaveJob(job.job_id)}
                        className="h-8 w-8 p-0"
                      >
                        {savedJobs.includes(job.job_id) ? (
                          <BookmarkCheck className="h-4 w-4 text-primary" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* <div className="flex items-center gap-6 text-sm text-muted-foreground"> */}
                    {/* <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </div> */}
                    {/* {job.salary && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />$
                        {job.salary.min.toLocaleString()} - $
                        {job.salary.max.toLocaleString()}
                      </div>
                    )} */}
                    {/* <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Apply by{" "}
                      {new Date(job.applicationDeadline).toLocaleDateString()}
                    </div> */}
                  {/* </div> */}

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {job.job_overview}
                  </p>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-foreground">
                      Required Skills:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {job.must_have_skills.slice(0, 5).map((skill) => (
                        <Badge key={skill} variant="default">
                          {skill}
                        </Badge>
                      ))}
                      {job.must_have_skills.length > 5 && (
                        <Badge variant="outline">
                          +{job.must_have_skills.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {job.good_to_have_skills.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-foreground">
                        Preferred Skills:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {job.good_to_have_skills.slice(0, 4).map((skill) => (
                          <Badge key={skill} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                        {job.good_to_have_skills.length > 4 && (
                          <Badge variant="outline">
                            +{job.good_to_have_skills.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <Link href={`/candidate/jobs/${job.job_id}`} className="flex-1">
                      <Button className="w-full">View Details & Apply</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <div className="space-y-4">
                  <div className="text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium">No jobs found</h3>
                    <p>Try adjusting your search criteria or filters</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setLocationFilters([]);
                      setTypeFilters([]);
                      setSalaryFilters([]);
                    }}
                  >
                    Clear all filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
