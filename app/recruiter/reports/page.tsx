"use client"

import { useState, useEffect } from "react"
import { mockApplications, mockJobs, mockUsers } from "@/lib/mock-data"
import { ReportGenerator } from "@/lib/report-generator"
import type { ReportMetrics, CandidateReport, JobReport } from "@/lib/report-generator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, TrendingUp, Users, Target, Clock, BarChart3, PieChart } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import Link from "next/link"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function ReportsPage() {
  const [metrics, setMetrics] = useState<ReportMetrics | null>(null)
  const [selectedJob, setSelectedJob] = useState<string>("all")
  const [jobReports, setJobReports] = useState<JobReport[]>([])
  const [candidateReports, setCandidateReports] = useState<CandidateReport[]>([])
  const [skillsGap, setSkillsGap] = useState<any[]>([])

  useEffect(() => {
    // Generate reports
    const overallMetrics = ReportGenerator.generateOverallMetrics(mockApplications, mockJobs)
    setMetrics(overallMetrics)

    // Generate job reports
    const jobReportData = mockJobs.map((job) => ReportGenerator.generateJobReport(job, mockApplications))
    setJobReports(jobReportData)

    // Generate candidate reports
    const candidateReportData = mockApplications
      .map((app) => {
        const job = mockJobs.find((j) => j.id === app.jobId)
        const candidate = mockUsers.find((u) => u.id === app.candidateId)
        if (job && candidate) {
          return ReportGenerator.generateCandidateReport(app, job, candidate)
        }
        return null
      })
      .filter(Boolean) as CandidateReport[]
    setCandidateReports(candidateReportData)

    // Generate skills gap analysis
    const skillsGapData = ReportGenerator.generateSkillsGapAnalysis(mockJobs, mockApplications)
    setSkillsGap(skillsGapData)
  }, [])

  if (!metrics) {
    return <div className="min-h-screen flex items-center justify-center">Loading reports...</div>
  }

  const filteredJobReport = selectedJob === "all" ? null : jobReports.find((jr) => jr.jobId === selectedJob)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/recruiter/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Analytics & Reports</h1>
              <p className="text-sm text-muted-foreground">Comprehensive insights into your hiring process</p>
            </div>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="skills">Skills Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalApplications}</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.averageScore}%</div>
                  <p className="text-xs text-muted-foreground">+5% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.completionRate}%</div>
                  <p className="text-xs text-muted-foreground">+8% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.timeToComplete}m</div>
                  <p className="text-xs text-muted-foreground">-2m from last month</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Monthly Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Application Trends
                  </CardTitle>
                  <CardDescription>Applications and average scores over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={metrics.monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Bar yAxisId="left" dataKey="applications" fill="#8884d8" name="Applications" />
                      <Line yAxisId="right" type="monotone" dataKey="averageScore" stroke="#82ca9d" name="Avg Score" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Score Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Score Distribution
                  </CardTitle>
                  <CardDescription>Distribution of candidate screening scores</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={metrics.scoreDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Question Type Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Question Type Performance
                  </CardTitle>
                  <CardDescription>Average scores by question category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={metrics.questionTypePerformance}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="type" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar
                        name="Average Score"
                        dataKey="averageScore"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.6}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Skills */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Most Requested Skills
                  </CardTitle>
                  <CardDescription>Skills most frequently required in job postings</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={metrics.topSkills}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ skill, percent }) => `${skill} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {metrics.topSkills.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="candidates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Candidate Performance Reports</CardTitle>
                <CardDescription>Detailed analysis of individual candidate screenings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {candidateReports.map((report) => (
                    <div key={report.candidateId} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">{report.candidateName}</h3>
                          <p className="text-sm text-muted-foreground">{report.jobTitle}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">{report.overallScore}%</div>
                          <Badge
                            variant={
                              report.recommendation === "hire"
                                ? "default"
                                : report.recommendation === "maybe"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {report.recommendation}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-blue-600">{report.technicalScore}%</div>
                          <div className="text-xs text-muted-foreground">Technical</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-600">{report.behavioralScore}%</div>
                          <div className="text-xs text-muted-foreground">Behavioral</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-purple-600">{report.experienceScore}%</div>
                          <div className="text-xs text-muted-foreground">Experience</div>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">Strengths</h4>
                          <div className="flex flex-wrap gap-1">
                            {report.strengths.map((strength, index) => (
                              <Badge key={index} variant="secondary" className="text-xs bg-green-100 text-green-800">
                                {strength}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-orange-700 dark:text-orange-400 mb-2">Areas for Growth</h4>
                          <div className="flex flex-wrap gap-1">
                            {report.weaknesses.map((weakness, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {weakness}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <div className="flex items-center gap-4">
              <Select value={selectedJob} onValueChange={setSelectedJob}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select a job to analyze" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jobs Overview</SelectItem>
                  {mockJobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {filteredJobReport ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{filteredJobReport.jobTitle} - Performance Report</CardTitle>
                    <CardDescription>Detailed analysis for this specific job posting</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-3 mb-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">{filteredJobReport.totalApplications}</div>
                        <div className="text-sm text-muted-foreground">Total Applications</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">{filteredJobReport.averageScore}%</div>
                        <div className="text-sm text-muted-foreground">Average Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">{filteredJobReport.qualifiedCandidates}</div>
                        <div className="text-sm text-muted-foreground">Qualified Candidates</div>
                      </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                      <div>
                        <h3 className="font-semibold mb-4">Top Candidates</h3>
                        <div className="space-y-3">
                          {filteredJobReport.topCandidates.map((candidate, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <div className="font-medium">{candidate.name}</div>
                                <div className="text-sm text-muted-foreground">{candidate.recommendation}</div>
                              </div>
                              <div className="text-lg font-semibold text-primary">{candidate.score}%</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-4">Skills Analysis</h3>
                        <div className="space-y-3">
                          {filteredJobReport.skillsAnalysis.map((skill, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{skill.required}</span>
                                <span className="text-sm text-muted-foreground">
                                  {skill.candidatesWithSkill}/{filteredJobReport.totalApplications} candidates
                                </span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full"
                                  style={{
                                    width: `${(skill.candidatesWithSkill / filteredJobReport.totalApplications) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="grid gap-6">
                {jobReports.map((jobReport) => (
                  <Card key={jobReport.jobId}>
                    <CardHeader>
                      <CardTitle>{jobReport.jobTitle}</CardTitle>
                      <CardDescription>Performance summary</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-4">
                        <div className="text-center">
                          <div className="text-xl font-bold">{jobReport.totalApplications}</div>
                          <div className="text-xs text-muted-foreground">Applications</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-primary">{jobReport.averageScore}%</div>
                          <div className="text-xs text-muted-foreground">Avg Score</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-green-600">{jobReport.qualifiedCandidates}</div>
                          <div className="text-xs text-muted-foreground">Qualified</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-blue-600">
                            {Math.round(jobReport.timeMetrics.averageCompletionTime)}m
                          </div>
                          <div className="text-xs text-muted-foreground">Avg Time</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Skills Gap Analysis</CardTitle>
                <CardDescription>Comparison between skill demand and candidate supply</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={skillsGap.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="skill" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="demand" fill="#8884d8" name="Demand" />
                    <Bar dataKey="supply" fill="#82ca9d" name="Supply" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>High Demand Skills</CardTitle>
                  <CardDescription>Skills most requested by employers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {skillsGap.slice(0, 8).map((skill, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="font-medium">{skill.skill}</span>
                        <Badge variant="outline">{skill.demand} jobs</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Skills Gap Priority</CardTitle>
                  <CardDescription>Skills with the largest supply-demand gap</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {skillsGap
                      .filter((skill) => skill.gap > 0)
                      .slice(0, 8)
                      .map((skill, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="font-medium">{skill.skill}</span>
                          <Badge variant="destructive">Gap: {skill.gap}</Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
