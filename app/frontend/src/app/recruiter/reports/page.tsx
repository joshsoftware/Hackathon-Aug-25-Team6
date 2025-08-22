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
import { Progress } from "@/app/(components)/ui/progress";
import { mockJobs, mockApplications } from "@/app/(lib)/mock-data";
import {
  TrendingUp,
  Users,
  Briefcase,
  Calendar,
  Download,
  Filter,
  AlertCircle,
} from "lucide-react";
import { ChartContainer, ChartTooltip } from "@/app/(components)/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useMemo } from "react";

export default function ReportsPage() {
  const processedData = useMemo(() => {
    try {
      // Safely get data with fallbacks
      const jobs = Array.isArray(mockJobs) ? mockJobs : [];
      const applications = Array.isArray(mockApplications)
        ? mockApplications
        : [];

      console.log(
        "[v0] Processing data - Jobs:",
        jobs.length,
        "Applications:",
        applications.length
      );

      const totalJobs = jobs.length;
      const activeJobs = jobs.filter((job) => job?.status === "active").length;
      const totalApplications = applications.length;

      // Calculate application status distribution with safety checks
      const statusCounts = applications.reduce((acc, app) => {
        if (app?.status) {
          acc[app.status] = (acc[app.status] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      // Calculate match score distribution with comprehensive filtering
      const validMatchScores = applications
        .filter(
          (app) =>
            app?.matchScore != null &&
            typeof app.matchScore === "number" &&
            !isNaN(app.matchScore)
        )
        .map((app) => app.matchScore!);

      const averageMatchScore =
        validMatchScores.length > 0
          ? Math.round(
              validMatchScores.reduce((a, b) => a + b, 0) /
                validMatchScores.length
            )
          : 0;

      // Job performance with comprehensive error handling
      const jobPerformance = jobs
        .map((job) => {
          if (!job?.id) return null;

          const jobApplications = applications.filter(
            (app) => app?.jobId === job.id
          );
          const validScores = jobApplications.filter(
            (app) => app?.matchScore != null && !isNaN(app.matchScore!)
          );

          const avgScore =
            validScores.length > 0
              ? Math.round(
                  validScores.reduce(
                    (sum, app) => sum + (app.matchScore || 0),
                    0
                  ) / validScores.length
                )
              : 0;

          const interviewCount = jobApplications.filter(
            (app) => app?.status === "interview"
          ).length;
          const interviewRate =
            jobApplications.length > 0
              ? Math.round((interviewCount / jobApplications.length) * 100)
              : 0;

          return {
            id: job.id,
            title: job.title || "Untitled Job",
            company: job.company || "Unknown Company",
            applicationCount: jobApplications.length,
            averageMatchScore: avgScore,
            interviewRate,
          };
        })
        .filter(Boolean);

      // Generate application trends data with error handling
      const applicationTrends = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        const applications = Math.floor(Math.random() * 8) + 2;
        return {
          date: date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          applications,
        };
      });

      // Generate match score distribution with proper structure
      const matchScoreRanges = [
        {
          name: "90-100%",
          range: "90-100%",
          count: validMatchScores.filter((score) => score >= 90).length,
          color: "#10b981",
        },
        {
          name: "80-89%",
          range: "80-89%",
          count: validMatchScores.filter((score) => score >= 80 && score < 90)
            .length,
          color: "#3b82f6",
        },
        {
          name: "70-79%",
          range: "70-79%",
          count: validMatchScores.filter((score) => score >= 70 && score < 80)
            .length,
          color: "#f59e0b",
        },
        {
          name: "60-69%",
          range: "60-69%",
          count: validMatchScores.filter((score) => score >= 60 && score < 70)
            .length,
          color: "#ef4444",
        },
        {
          name: "Below 60%",
          range: "Below 60%",
          count: validMatchScores.filter((score) => score < 60).length,
          color: "#6b7280",
        },
      ];

      // Generate skills demand data
      const skillsDemand = [
        { skill: "React", demand: 85, jobs: 12 },
        { skill: "TypeScript", demand: 78, jobs: 10 },
        { skill: "Node.js", demand: 72, jobs: 9 },
        { skill: "Python", demand: 68, jobs: 8 },
        { skill: "AWS", demand: 65, jobs: 7 },
        { skill: "Docker", demand: 58, jobs: 6 },
      ];

      // Calculate interview rate safely
      const interviewApplications = applications.filter(
        (app) => app?.status === "interview"
      ).length;
      const overallInterviewRate =
        totalApplications > 0
          ? Math.round((interviewApplications / totalApplications) * 100)
          : 0;

      console.log("[v0] Data processed successfully");

      return {
        totalJobs,
        activeJobs,
        totalApplications,
        statusCounts,
        averageMatchScore,
        jobPerformance,
        applicationTrends,
        matchScoreRanges,
        skillsDemand,
        overallInterviewRate,
        hasData: totalJobs > 0 || totalApplications > 0,
      };
    } catch (error) {
      console.error("[v0] Error processing data:", error);
      return {
        totalJobs: 0,
        activeJobs: 0,
        totalApplications: 0,
        statusCounts: {},
        averageMatchScore: 0,
        jobPerformance: [],
        applicationTrends: [],
        matchScoreRanges: [],
        skillsDemand: [],
        overallInterviewRate: 0,
        hasData: false,
        error: true,
      };
    }
  }, []);

  if (processedData.error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-xl font-semibold">Error Loading Reports</h2>
            <p className="text-muted-foreground">
              There was an error processing the reports data.
            </p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!processedData.hasData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-semibold">No Data Available</h2>
            <p className="text-muted-foreground">
              Create some jobs and receive applications to see reports.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Reports & Analytics
            </h1>
            <p className="text-muted-foreground">
              Insights into your recruitment performance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {processedData.totalJobs}
              </div>
              <p className="text-xs text-muted-foreground">
                {processedData.activeJobs} currently active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Applications
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {processedData.totalApplications}
              </div>
              <p className="text-xs text-muted-foreground">
                {processedData.totalJobs > 0
                  ? Math.round(
                      processedData.totalApplications / processedData.totalJobs
                    )
                  : 0}{" "}
                avg per job
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Match Score
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {processedData.averageMatchScore}%
              </div>
              <p className="text-xs text-muted-foreground">
                Quality of candidates
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Interview Rate
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {processedData.overallInterviewRate}%
              </div>
              <p className="text-xs text-muted-foreground">
                Applications to interview
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Application Status Distribution */}
        {Object.keys(processedData.statusCounts).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Application Status Distribution</CardTitle>
              <CardDescription>
                Current status of all applications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(processedData.statusCounts).map(
                ([status, count]) => {
                  const percentage =
                    processedData.totalApplications > 0
                      ? Math.round(
                          (count / processedData.totalApplications) * 100
                        )
                      : 0;
                  return (
                    <div key={status} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {count} applications
                          </span>
                        </div>
                        <span className="text-sm font-medium">
                          {percentage}%
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                }
              )}
            </CardContent>
          </Card>
        )}

        {/* Job Performance */}
        {processedData.jobPerformance.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Job Performance</CardTitle>
              <CardDescription>
                Performance metrics for each job opening
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {processedData.jobPerformance.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                  >
                    <div className="space-y-1">
                      <h3 className="font-medium text-foreground">
                        {job.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {job.company}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {job.applicationCount} applications
                        </Badge>
                        <Badge variant="outline">
                          {job.interviewRate}% interview rate
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-lg font-semibold text-foreground">
                        {job.averageMatchScore}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Avg Match Score
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Time-based Analytics */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Application Trends</CardTitle>
              <CardDescription>
                Applications received over the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  applications: {
                    label: "Applications",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={processedData.applicationTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <ChartTooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-background border border-border rounded-lg p-2 shadow-md">
                              <p className="text-sm font-medium">{label}</p>
                              <p className="text-sm text-muted-foreground">
                                {payload[0].value} applications
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="applications"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--chart-1))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Match Score Distribution</CardTitle>
              <CardDescription>
                Distribution of candidate match scores
              </CardDescription>
            </CardHeader>
            <CardContent>
              {processedData.matchScoreRanges.some(
                (range) => range.count > 0
              ) ? (
                <ChartContainer
                  config={{
                    count: {
                      label: "Candidates",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={processedData.matchScoreRanges.filter(
                          (range) => range.count > 0
                        )}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, count }) =>
                          count > 0 ? `${name}: ${count}` : ""
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {processedData.matchScoreRanges
                          .filter((range) => range.count > 0)
                          .map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                      </Pie>
                      <ChartTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-background border border-border rounded-lg p-2 shadow-md">
                                <p className="text-sm font-medium">
                                  {data.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {data.count} candidates
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  <p>No match score data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Skills in Demand</CardTitle>
            <CardDescription>
              Most requested skills across job openings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                demand: {
                  label: "Demand %",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={processedData.skillsDemand} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    dataKey="skill"
                    type="category"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={80}
                  />
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border border-border rounded-lg p-2 shadow-md">
                            <p className="text-sm font-medium">{data.skill}</p>
                            <p className="text-sm text-muted-foreground">
                              {data.demand}% demand ({data.jobs} jobs)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="demand"
                    fill="hsl(var(--chart-2))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
