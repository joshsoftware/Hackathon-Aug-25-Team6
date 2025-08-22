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
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";

export default function CandidateJobsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [locationFilters, setLocationFilters] = useState<string[]>([]);
  const [typeFilters, setTypeFilters] = useState<string[]>([]);
  const [salaryFilters, setSalaryFilters] = useState<string[]>([]);

  const activeJobs = mockJobs.filter((job) => job.status === "active");

  const filteredJobs = useMemo(() => {
    return activeJobs.filter((job) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.mustHaveSkills.some((skill) =>
          skill.toLowerCase().includes(searchQuery.toLowerCase())
        );

      // Location filter
      const matchesLocation =
        locationFilters.length === 0 || locationFilters.includes(job.location);

      // Type filter
      const matchesType =
        typeFilters.length === 0 || typeFilters.includes(job.type);

      // Salary filter
      const matchesSalary =
        salaryFilters.length === 0 ||
        salaryFilters.some((range) => {
          if (!job.salary) return false;
          const minSalary = job.salary.min;
          switch (range) {
            case "0-50k":
              return minSalary < 50000;
            case "50k-100k":
              return minSalary >= 50000 && minSalary < 100000;
            case "100k-150k":
              return minSalary >= 100000 && minSalary < 150000;
            case "150k+":
              return minSalary >= 150000;
            default:
              return true;
          }
        });

      return matchesSearch && matchesLocation && matchesType && matchesSalary;
    });
  }, [activeJobs, searchQuery, locationFilters, typeFilters, salaryFilters]);

  const locationOptions = Array.from(
    new Set(activeJobs.map((job) => job.location))
  ).map((location) => ({
    label: location,
    value: location,
    checked: locationFilters.includes(location),
  }));

  const typeOptions = Array.from(
    new Set(activeJobs.map((job) => job.type))
  ).map((type) => ({
    label: type,
    value: type,
    checked: typeFilters.includes(type),
  }));

  const salaryOptions = [
    {
      label: "Under $50k",
      value: "0-50k",
      checked: salaryFilters.includes("0-50k"),
    },
    {
      label: "$50k - $100k",
      value: "50k-100k",
      checked: salaryFilters.includes("50k-100k"),
    },
    {
      label: "$100k - $150k",
      value: "100k-150k",
      checked: salaryFilters.includes("100k-150k"),
    },
    {
      label: "$150k+",
      value: "150k+",
      checked: salaryFilters.includes("150k+"),
    },
  ];

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

  const handleSalaryFilter = (value: string, checked: boolean) => {
    setSalaryFilters((prev) =>
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
              {filteredJobs.length} jobs found
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
                <FilterDropdown
                  title="Salary Range"
                  options={salaryOptions}
                  onFilterChange={handleSalaryFilter}
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
                {salaryFilters.map((filter) => (
                  <Badge
                    key={filter}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleSalaryFilter(filter, false)}
                  >
                    {salaryOptions.find((opt) => opt.value === filter)?.label} ×
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                      <CardDescription className="text-base">
                        {job.company}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">New</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSaveJob(job.id)}
                        className="h-8 w-8 p-0"
                      >
                        {savedJobs.includes(job.id) ? (
                          <BookmarkCheck className="h-4 w-4 text-primary" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </div>
                    {job.salary && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />$
                        {job.salary.min.toLocaleString()} - $
                        {job.salary.max.toLocaleString()}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Apply by{" "}
                      {new Date(job.applicationDeadline).toLocaleDateString()}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {job.description}
                  </p>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-foreground">
                      Required Skills:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {job.mustHaveSkills.slice(0, 5).map((skill) => (
                        <Badge key={skill} variant="default">
                          {skill}
                        </Badge>
                      ))}
                      {job.mustHaveSkills.length > 5 && (
                        <Badge variant="outline">
                          +{job.mustHaveSkills.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {job.goodToHaveSkills.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-foreground">
                        Preferred Skills:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {job.goodToHaveSkills.slice(0, 4).map((skill) => (
                          <Badge key={skill} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                        {job.goodToHaveSkills.length > 4 && (
                          <Badge variant="outline">
                            +{job.goodToHaveSkills.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <Link href={`/candidate/jobs/${job.id}`} className="flex-1">
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
