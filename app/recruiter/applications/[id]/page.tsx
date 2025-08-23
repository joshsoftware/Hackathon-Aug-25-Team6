"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { mockApplications, mockJobs, mockUsers } from "@/lib/mock-data"
import { generateCandidateReport } from "@/lib/report-generator"
import type { Application, Job, User, CandidateReport } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Download, CheckCircle, XCircle, AlertCircle, TrendingUp, Brain, Target } from "lucide-react"
import Link from "next/link"
import {
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function CandidateReportPage() {
  const params = useParams()
  const [application, setApplication] = useState<Application | null>(null)
  const [job, setJob] = useState<Job | null>(null)
  const [candidate, setCandidate] = useState<User | null>(null)
  const [report, setReport] = useState<CandidateReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const applicationId = params.id as string
    const foundApplication = mockApplications.find((app) => app.id === applicationId)

    if (foundApplication) {
      setApplication(foundApplication)
      const foundJob = mockJobs.find((j) => j.id === foundApplication.jobId)
      const foundCandidate = mockUsers.find((u) => u.id === foundApplication.candidateId)

      setJob(foundJob || null)
      setCandidate(foundCandidate || null)

      if (foundJob && foundCandidate) {
        const generatedReport = generateCandidateReport(foundApplication, foundJob, foundCandidate)
        setReport(generatedReport)
      }
    }

    setLoading(false)
  }, [params.id])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!application || !job || !candidate || !report) {
    return <div className="flex items-center justify-center min-h-screen">Application not found</div>
  }

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case "Proceed to Next Round":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "Reject":
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
    }
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "Proceed to Next Round":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "Reject":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/recruiter/applications">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Applications
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Candidate Report</h1>
              <p className="text-sm text-muted-foreground">
                {candidate.name} - {job.title}
              </p>
            </div>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Overall Assessment */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Overall Assessment
                </CardTitle>
                <CardDescription>Comprehensive evaluation based on screening performance</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">{report.overallScore}%</div>
                <div className="text-sm text-muted-foreground">Overall Score</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  {getRecommendationIcon(report.recommendation)}
                  <Badge className={getRecommendationColor(report.recommendation)}>{report.recommendation}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{report.summary}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Technical Skills</span>
                    <span>{report.skillsAssessment.technical}%</span>
                  </div>
                  <Progress value={report.skillsAssessment.technical} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span>Communication</span>
                    <span>{report.skillsAssessment.communication}%</span>
                  </div>
                  <Progress value={report.skillsAssessment.communication} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span>Problem Solving</span>
                    <span>{report.skillsAssessment.problemSolving}%</span>
                  </div>
                  <Progress value={report.skillsAssessment.problemSolving} className="h-2" />
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">Performance Distribution</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Technical", value: report.skillsAssessment.technical },
                        { name: "Communication", value: report.skillsAssessment.communication },
                        { name: "Problem Solving", value: report.skillsAssessment.problemSolving },
                        { name: "Experience", value: report.skillsAssessment.experience },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="performance">Performance Analysis</TabsTrigger>
            <TabsTrigger value="responses">Question Responses</TabsTrigger>
            <TabsTrigger value="skills">Skills Assessment</TabsTrigger>
            <TabsTrigger value="next-round">Next Round</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Question Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={report.questionPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="question" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="score" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Skills Radar</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart
                      data={[
                        { skill: "Technical", score: report.skillsAssessment.technical },
                        { skill: "Communication", score: report.skillsAssessment.communication },
                        { skill: "Problem Solving", score: report.skillsAssessment.problemSolving },
                        { skill: "Experience", score: report.skillsAssessment.experience },
                        { skill: "Cultural Fit", score: report.skillsAssessment.culturalFit },
                      ]}
                    >
                      <PolarGrid />
                      <PolarAngleAxis dataKey="skill" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar name="Score" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Strengths & Areas for Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium text-green-700 dark:text-green-400 mb-3">Strengths</h4>
                    <ul className="space-y-2">
                      {report.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-orange-700 dark:text-orange-400 mb-3">Areas for Improvement</h4>
                    <ul className="space-y-2">
                      {report.areasForImprovement.map((area, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{area}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="responses" className="space-y-4">
            {application.responses.map((response, index) => {
              const question = application.questions[index]
              const performance = report.questionPerformance.find((p) => p.question === `Q${index + 1}`)

              return (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                        <CardDescription className="mt-2">{question.text}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{performance?.score || 0}%</div>
                        <div className="text-xs text-muted-foreground">Score</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Candidate Response:</h4>
                        <p className="text-sm bg-muted p-3 rounded-md">{response.answer}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">AI Analysis:</h4>
                        <p className="text-sm text-muted-foreground">{response.feedback}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Technical Skills Match</CardTitle>
                  <CardDescription>How well candidate skills align with job requirements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {job.requirements.slice(0, 5).map((requirement, index) => {
                      const score = Math.floor(Math.random() * 40) + 60 // Mock score between 60-100
                      return (
                        <div key={index}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{requirement}</span>
                            <span>{score}%</span>
                          </div>
                          <Progress value={score} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Experience Level</CardTitle>
                  <CardDescription>Years of relevant experience</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">{Math.floor(Math.random() * 5) + 3}+</div>
                    <div className="text-sm text-muted-foreground">Years of Experience</div>
                    <div className="mt-4 text-sm">
                      <Badge variant="outline" className="mr-2">
                        Senior Level
                      </Badge>
                      <Badge variant="outline">Industry Expert</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="next-round" className="space-y-6">
            {report.recommendation === "Proceed to Next Round" ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                      <CheckCircle className="h-5 w-5" />
                      Recommended for Next Round
                    </CardTitle>
                    <CardDescription>
                      Based on the screening performance, this candidate is ready to proceed to the technical interview
                      round.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{report.overallScore}%</div>
                        <div className="text-sm text-muted-foreground">Overall Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{report.skillsAssessment.technical}%</div>
                        <div className="text-sm text-muted-foreground">Technical Skills</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {report.skillsAssessment.communication}%
                        </div>
                        <div className="text-sm text-muted-foreground">Communication</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Suggested Next Round Questions
                    </CardTitle>
                    <CardDescription>
                      AI-generated technical questions based on candidate's profile and job requirements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {report.nextRoundQuestions?.map((question, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <Badge variant="outline" className="text-xs">
                              {question.type.charAt(0).toUpperCase() + question.type.slice(1)}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {question.difficulty}
                            </Badge>
                          </div>
                          <h4 className="font-medium mb-2">Question {index + 1}:</h4>
                          <p className="text-sm mb-3">{question.question}</p>
                          <div className="text-xs text-muted-foreground">
                            <strong>Focus Area:</strong> {question.focusArea}
                          </div>
                          {question.expectedAnswer && (
                            <details className="mt-2">
                              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                                Expected Answer Guidelines
                              </summary>
                              <p className="text-xs text-muted-foreground mt-2 pl-4 border-l-2 border-muted">
                                {question.expectedAnswer}
                              </p>
                            </details>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                    <XCircle className="h-5 w-5" />
                    Not Recommended for Next Round
                  </CardTitle>
                  <CardDescription>
                    Based on the screening performance, this candidate needs improvement before proceeding.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="font-medium mb-2">Key Issues:</h4>
                        <ul className="space-y-1">
                          {report.areasForImprovement.slice(0, 3).map((area, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                              {area}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Recommendations:</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li>• Consider additional training or experience</li>
                          <li>• Re-evaluate after skill development</li>
                          <li>• Provide feedback for future applications</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
