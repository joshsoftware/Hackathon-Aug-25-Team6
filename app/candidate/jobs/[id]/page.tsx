"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { mockJobs, mockApplications } from "@/lib/mock-data"
import type { Job, Application } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, MapPin, Clock, DollarSign, Building, Users, Calendar } from "lucide-react"
import Link from "next/link"

export default function JobDetailPage() {
  const params = useParams()
  const [job, setJob] = useState<Job | null>(null)
  const [hasApplied, setHasApplied] = useState(false)
  const [application, setApplication] = useState<Application | null>(null)

  useEffect(() => {
    const jobId = params.id as string
    const foundJob = mockJobs.find((j) => j.id === jobId)
    setJob(foundJob || null)

    // Check if user has already applied
    const existingApplication = mockApplications.find((app) => app.jobId === jobId)
    if (existingApplication) {
      setHasApplied(true)
      setApplication(existingApplication)
    }
  }, [params.id])

  const handleApply = () => {
    if (job) {
      // In a real app, this would create an application
      setHasApplied(true)
      const newApplication: Application = {
        id: `app-${Date.now()}`,
        jobId: job.id,
        candidateId: "candidate-1",
        status: "applied",
        appliedAt: new Date().toISOString(),
        screeningCompleted: false,
        screeningScore: null,
        questions: [],
        responses: [],
      }
      setApplication(newApplication)
    }
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
          <p className="text-muted-foreground mb-4">The job you're looking for doesn't exist.</p>
          <Link href="/candidate/jobs">
            <Button>Back to Jobs</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/candidate/jobs">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{job.title}</h1>
            <p className="text-sm text-muted-foreground">{job.company}</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl">{job.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        <span>{job.company}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{job.type}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={job.status === "active" ? "default" : "secondary"}>{job.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Job Description</h3>
                    <p className="text-muted-foreground leading-relaxed">{job.description}</p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-3">Requirements</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.requirements.map((req, index) => (
                        <Badge key={index} variant="outline">
                          {req}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {job.responsibilities && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold mb-3">Responsibilities</h3>
                        <ul className="space-y-2 text-muted-foreground">
                          {job.responsibilities.map((resp, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-primary mt-1">•</span>
                              <span>{resp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {job.salary && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{job.salary}</p>
                      <p className="text-sm text-muted-foreground">Salary Range</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{new Date(job.createdAt).toLocaleDateString()}</p>
                    <p className="text-sm text-muted-foreground">Posted Date</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">5-10 applicants</p>
                    <p className="text-sm text-muted-foreground">Application Count</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Application Status</CardTitle>
              </CardHeader>
              <CardContent>
                {hasApplied ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Applied</Badge>
                      <span className="text-sm text-muted-foreground">
                        {application && new Date(application.appliedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Your application has been submitted. You'll be contacted for the next steps.
                    </p>
                    <Link href={`/candidate/interview/${job.id}`}>
                      <Button className="w-full">Start Pre-screening</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Ready to apply? Click below to submit your application and start the AI-powered pre-screening
                      process.
                    </p>
                    <Button className="w-full" onClick={handleApply}>
                      Apply Now
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
