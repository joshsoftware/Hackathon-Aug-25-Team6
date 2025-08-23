"use client"

import { useState, useEffect } from "react"
import { mockApplications, mockJobs } from "@/lib/mock-data"
import type { Application, Job } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [jobs, setJobs] = useState<Job[]>([])

  useEffect(() => {
    setApplications(mockApplications)
    setJobs(mockJobs)
  }, [])

  const getJobDetails = (jobId: string) => {
    return jobs.find((job) => job.id === jobId)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "under_review":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-blue-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "under_review":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">My Applications</h1>
            <p className="text-sm text-muted-foreground">Track your job applications and screening status</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {applications.map((application) => {
            const job = getJobDetails(application.jobId)
            if (!job) return null

            return (
              <Card key={application.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                      <CardDescription className="flex items-center gap-4">
                        <span>{job.company}</span>
                        <span>•</span>
                        <span>{job.location}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Applied {new Date(application.appliedAt).toLocaleDateString()}</span>
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(application.status)}
                      <Badge className={getStatusColor(application.status)}>
                        {application.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="font-medium mb-2">Screening Status</h4>
                        <div className="flex items-center gap-2">
                          {application.screeningCompleted ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-sm">Completed</span>
                              {application.screeningScore && (
                                <Badge variant="outline">Score: {application.screeningScore}%</Badge>
                              )}
                            </>
                          ) : (
                            <>
                              <Clock className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm">Pending</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Questions Answered</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {application.responses.length} / {application.questions.length}
                          </span>
                          {application.responses.length === application.questions.length ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        Last updated: {new Date(application.appliedAt).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/candidate/jobs/${job.id}`}>
                          <Button variant="outline" size="sm">
                            View Job
                          </Button>
                        </Link>
                        {!application.screeningCompleted && (
                          <Link href={`/candidate/interview/${job.id}`}>
                            <Button size="sm">Continue Screening</Button>
                          </Link>
                        )}
                        {application.screeningCompleted && application.status === "accepted" && (
                          <Button size="sm">Schedule Interview</Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {applications.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No Applications Yet</p>
              <p>Start by browsing available jobs and applying to positions that interest you.</p>
            </div>
            <Link href="/candidate/jobs">
              <Button>Browse Jobs</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
