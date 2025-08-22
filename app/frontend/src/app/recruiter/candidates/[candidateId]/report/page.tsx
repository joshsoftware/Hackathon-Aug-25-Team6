"use client"

import { DashboardLayout } from "@/app/(components)/(layout)/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/(components)/ui/card"
import { Button } from "@/app/(components)/ui/button"
import { Badge } from "@/app/(components)/ui/badge"
import { Progress } from "@/app/(components)/ui/progress"
import { Separator } from "@/app/(components)/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/(components)/ui/avatar"
import { mockJobs, mockApplications, mockCandidateReports } from "@/app/(lib)/mock-data"
import { MessageSquare, Calendar, Download, Mail, CheckCircle, XCircle, Briefcase } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import { notFound } from "next/navigation"
import { ChartContainer, ChartTooltip } from "@/app/(components)/ui/chart"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { useEffect, useState } from "react"

interface CandidateReportPageProps {
  params: {
    candidateId: string
  }
}

export default function CandidateReportPage({ params }: CandidateReportPageProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const jobId = searchParams.get("jobId")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  console.log("[v0] CandidateReportPage - candidateId:", params.candidateId, "jobId:", jobId)

  useEffect(() => {
    try {
      console.log("[v0] Starting data processing...")
      setIsLoading(true)
      setError(null)

      const candidateApplications = mockApplications.filter((app) => app.candidateId === params.candidateId)
      console.log("[v0] Found candidate applications:", candidateApplications.length, candidateApplications)

      if (!jobId && candidateApplications.length > 0) {
        // Redirect to the first application's report
        const firstApp = candidateApplications[0]
        console.log("[v0] Redirecting to first application:", firstApp)
        router.replace(`/recruiter/candidates/${params.candidateId}/report?jobId=${firstApp.jobId}`)
        return
      }

      if (candidateApplications.length === 0) {
        console.log("[v0] No applications found for candidate:", params.candidateId)
        setError("No applications found for this candidate")
        return
      }

      if (!jobId) {
        console.log("[v0] No jobId provided, staying in loading state")
        return
      }

      // Validate data exists
      const application = mockApplications.find((app) => app.candidateId === params.candidateId && app.jobId === jobId)
      const job = jobId ? mockJobs.find((j) => j.id === jobId) : null
      const report = mockCandidateReports.find((r) => r.candidateId === params.candidateId && r.jobId === jobId)

      console.log("[v0] Data validation results:")
      console.log("[v0] - Application found:", !!application, application)
      console.log("[v0] - Job found:", !!job, job)
      console.log("[v0] - Report found:", !!report, report)

      if (!application || !job || !report) {
        console.log("[v0] Missing required data")
        setError("Required data not found")
        return
      }

      console.log("[v0] All data validated successfully")
      setIsLoading(false)
    } catch (err) {
      console.error("[v0] Error in useEffect:", err)
      setError("An error occurred while loading the report")
      setIsLoading(false)
    }
  }, [jobId, params.candidateId, router])

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <XCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-semibold text-foreground">Error Loading Report</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (isLoading || !jobId) {
    console.log("[v0] Showing loading state")
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading candidate report...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Get data after loading is complete
  const candidateApplications = mockApplications.filter((app) => app.candidateId === params.candidateId)
  const application = mockApplications.find((app) => app.candidateId === params.candidateId && app.jobId === jobId)
  const job = mockJobs.find((j) => j.id === jobId)
  const report = mockCandidateReports.find((r) => r.candidateId === params.candidateId && r.jobId === jobId)

  // Final safety check
  if (!application || !job || !report) {
    console.log("[v0] Final safety check failed")
    notFound()
  }

  console.log("[v0] Rendering report page with data:", { application: !!application, job: !!job, report: !!report })

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBackground = (score: number) => {
    if (score >= 80) return "bg-green-100"
    if (score >= 60) return "bg-yellow-100"
    return "bg-red-100"
  }

  const skillsRadarData = [
    { skill: "Technical Skills", candidate: report?.skillsMatch || 0, required: 85 },
    { skill: "Experience", candidate: report?.experienceMatch || 0, required: 75 },
    { skill: "Communication", candidate: report?.softSkillsScore || 0, required: 80 },
    { skill: "Problem Solving", candidate: 88, required: 90 },
    { skill: "Leadership", candidate: 72, required: 70 },
    { skill: "Adaptability", candidate: report?.confidenceScore || 0, required: 75 },
  ]

  const prescreeningData = [
    { question: "React Experience", score: 95, maxScore: 100 },
    { question: "TypeScript Project", score: 88, maxScore: 100 },
    { question: "Availability", score: 90, maxScore: 100 },
    { question: "Team Collaboration", score: 85, maxScore: 100 },
    { question: "Problem Solving", score: 92, maxScore: 100 },
  ]

  const CustomRadarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium text-foreground">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}%
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium text-foreground">{label}</p>
          <p className="text-sm" style={{ color: payload[0]?.color }}>
            Score: {payload[0]?.value}/100
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={`/abstract-geometric-shapes.png?height=64&width=64&query=${application.candidateName}`}
                />
                <AvatarFallback className="text-lg">
                  {application.candidateName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-foreground">{application.candidateName}</h1>
                <p className="text-muted-foreground">
                  Applied for {job.title} at {job.company}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {application.candidateEmail}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Applied {new Date(application.appliedDate).toLocaleDateString()}
                  </div>
                </div>
                {candidateApplications.length > 1 && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-muted-foreground">Other applications:</span>
                    {candidateApplications
                      .filter((app) => app.jobId !== jobId)
                      .slice(0, 2)
                      .map((app) => {
                        const otherJob = mockJobs.find((j) => j.id === app.jobId)
                        return (
                          <Button
                            key={app.id}
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/recruiter/candidates/${params.candidateId}/report?jobId=${app.jobId}`)
                            }
                          >
                            <Briefcase className="h-3 w-3 mr-1" />
                            {otherJob?.title}
                          </Button>
                        )
                      })}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Resume
              </Button>
              <Button variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Message Candidate
              </Button>
              <Button>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Interview
              </Button>
            </div>
          </div>
        </div>

        {/* Overall Match Score */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Overall Match Score</h3>
                <p className="text-sm text-muted-foreground">
                  Based on resume analysis, skills match, and pre-screening responses
                </p>
              </div>
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(report.overallMatch)}`}>{report.overallMatch}%</div>
                <div className="text-sm text-muted-foreground">Match Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Skills & Experience Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Skills & Experience Analysis</CardTitle>
                <CardDescription>Detailed breakdown of candidate qualifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Skills Match</span>
                      <span className={`text-sm font-semibold ${getScoreColor(report.skillsMatch)}`}>
                        {report.skillsMatch}%
                      </span>
                    </div>
                    <Progress value={report.skillsMatch} className="h-2" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Experience Level</span>
                      <span className={`text-sm font-semibold ${getScoreColor(report.experienceMatch)}`}>
                        {report.experienceMatch}%
                      </span>
                    </div>
                    <Progress value={report.experienceMatch} className="h-2" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Confidence Score</span>
                      <span className={`text-sm font-semibold ${getScoreColor(report.confidenceScore)}`}>
                        {report.confidenceScore}%
                      </span>
                    </div>
                    <Progress value={report.confidenceScore} className="h-2" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Soft Skills</span>
                      <span className={`text-sm font-semibold ${getScoreColor(report.softSkillsScore)}`}>
                        {report.softSkillsScore}%
                      </span>
                    </div>
                    <Progress value={report.softSkillsScore} className="h-2" />
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium text-foreground mb-4">Skills Radar Analysis</h4>
                  <div className="h-[300px] w-full">
                    <ChartContainer
                      config={{
                        candidate: {
                          label: "Candidate Score",
                          color: "hsl(var(--chart-1))",
                        },
                        required: {
                          label: "Required Level",
                          color: "hsl(var(--chart-2))",
                        },
                      }}
                      className="h-full w-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={skillsRadarData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="skill" fontSize={12} />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} fontSize={10} tickCount={5} />
                          <Radar
                            name="Required Level"
                            dataKey="required"
                            stroke="hsl(var(--chart-2))"
                            fill="hsl(var(--chart-2))"
                            fillOpacity={0.1}
                            strokeWidth={2}
                          />
                          <Radar
                            name="Candidate Score"
                            dataKey="candidate"
                            stroke="hsl(var(--chart-1))"
                            fill="hsl(var(--chart-1))"
                            fillOpacity={0.3}
                            strokeWidth={2}
                          />
                          <ChartTooltip content={<CustomRadarTooltip />} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Match Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Match Analysis</CardTitle>
                <CardDescription>Why this candidate is a good fit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Strengths & Match Reasons
                    </h4>
                    <div className="space-y-2">
                      {report.matchReasons.map((reason, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                          <p className="text-sm text-green-800">{reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      Areas for Consideration
                    </h4>
                    <div className="space-y-2">
                      {report.mismatchReasons.map((reason, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                          <p className="text-sm text-red-800">{reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pre-screening Responses */}
            <Card>
              <CardHeader>
                <CardTitle>Pre-screening Responses</CardTitle>
                <CardDescription>
                  Candidate&apos;s answers to pre-screening questions (Score: {report.prescreeningScore}%)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium text-foreground mb-4">Pre-screening Performance</h4>
                  <div className="h-[200px] w-full">
                    <ChartContainer
                      config={{
                        score: {
                          label: "Score",
                          color: "hsl(var(--chart-3))",
                        },
                      }}
                      className="h-full w-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={prescreeningData} margin={{ top: 20, right: 20, bottom: 60, left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="question"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                          <ChartTooltip content={<CustomBarTooltip />} />
                          <Bar dataKey="score" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-foreground">Experience with React</h4>
                      <Badge variant="default">95/100</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Question:</strong> How many years of experience do you have with React?
                    </p>
                    <p className="text-sm text-foreground">
                      <strong>Answer:</strong> 5+ years of professional React development experience
                    </p>
                  </div>

                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-foreground">TypeScript Project Experience</h4>
                      <Badge variant="default">88/100</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Question:</strong> Describe a challenging project where you used TypeScript.
                    </p>
                    <p className="text-sm text-foreground">
                      <strong>Answer:</strong> I led the migration of a large e-commerce platform from JavaScript to
                      TypeScript, involving over 200 components. The project improved code quality and reduced runtime
                      errors by 40%. I established type definitions for complex data structures and implemented strict
                      type checking across the entire codebase.
                    </p>
                  </div>

                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-foreground">Availability</h4>
                      <Badge variant="default">90/100</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Question:</strong> When can you start if selected?
                    </p>
                    <p className="text-sm text-foreground">
                      <strong>Answer:</strong> 2 weeks notice
                    </p>
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
                <Button className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Interview
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Download Resume
                </Button>
                <Separator />
                <Button variant="outline" className="w-full bg-transparent">
                  Move to Interview
                </Button>
                <Button variant="destructive" className="w-full">
                  Reject Application
                </Button>
              </CardContent>
            </Card>

            {/* Application Status */}
            <Card>
              <CardHeader>
                <CardTitle>Application Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-foreground">Current Status</div>
                  <Badge variant="default">{application.status}</Badge>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="text-sm font-medium text-foreground">Application Date</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(application.appliedDate).toLocaleDateString()}
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="text-sm font-medium text-foreground">Match Score</div>
                  <div className={`text-lg font-bold ${getScoreColor(report.overallMatch)}`}>
                    {report.overallMatch}%
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Details */}
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-foreground">Position</div>
                  <div className="text-sm text-muted-foreground">{job.title}</div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="text-sm font-medium text-foreground">Company</div>
                  <div className="text-sm text-muted-foreground">{job.company}</div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="text-sm font-medium text-foreground">Location</div>
                  <div className="text-sm text-muted-foreground">{job.location}</div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="text-sm font-medium text-foreground">Total Applicants</div>
                  <div className="text-sm text-muted-foreground">{job.applicantCount} candidates</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
