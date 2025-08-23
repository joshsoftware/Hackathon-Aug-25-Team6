"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { mockJobs, mockAuth } from "@/lib/mock-data"
import { AIQuestionEngine } from "@/lib/ai-question-engine"
import { CVParser, JDParser } from "@/lib/parsers"
import type { Job, ParsedCV, InterviewSession } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, CheckCircle, AlertCircle, Brain, Lightbulb, Target } from "lucide-react"
import Link from "next/link"

export default function InterviewPage() {
  const params = useParams()
  const [job, setJob] = useState<Job | null>(null)
  const [session, setSession] = useState<InterviewSession | null>(null)
  const [currentResponse, setCurrentResponse] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(1800) // 30 minutes
  const [showFeedback, setShowFeedback] = useState(false)

  useEffect(() => {
    const jobId = params.jobId as string
    const foundJob = mockJobs.find((j) => j.id === jobId)
    setJob(foundJob || null)

    if (foundJob) {
      initializeAISession(foundJob)
    }
  }, [params.jobId])

  useEffect(() => {
    if (timeRemaining > 0 && session && !session.isCompleted) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeRemaining, session])

  const initializeAISession = async (job: Job) => {
    setIsProcessing(true)

    try {
      // Parse job description
      const parsedJD = JDParser.parseJD(`
        Job Title: ${job.title}
        Company: ${job.company}
        Location: ${job.location}
        Experience: ${job.experience}
        
        Description: ${job.description}
        
        Requirements:
        ${job.requirements.map((req) => `- ${req}`).join("\n")}
        
        Skills:
        ${job.skills?.map((skill) => `- ${skill}`).join("\n") || ""}
      `)

      // Get current user's CV (mock)
      const currentUser = mockAuth.getCurrentUser()
      let parsedCV: ParsedCV | undefined

      if (currentUser) {
        // Mock CV data - in real app, would fetch from database
        const mockCVText = `
          ${currentUser.name}
          Email: ${currentUser.email}
          
          Summary: Experienced developer with strong background in modern web technologies.
          
          Skills: ${currentUser.skills?.join(", ") || "JavaScript, React, Node.js"}
          
          Experience:
          Senior Developer at Tech Company (2022 - Present)
          - Led development of scalable web applications
          - Implemented modern development practices
          
          Education:
          Bachelor of Computer Science (2020)
        `
        parsedCV = CVParser.parseCV(mockCVText)
      }

      // Generate AI-powered questions
      const questions = AIQuestionEngine.generateQuestions(parsedJD, parsedCV, [], {
        adaptiveFlow: true,
        questionCount: 5,
      })

      const newSession: InterviewSession = {
        id: `session_${Date.now()}`,
        jobId: job.id,
        candidateId: currentUser?.id || "anonymous",
        questions,
        responses: [],
        currentQuestionIndex: 0,
        overallScore: 0,
        isCompleted: false,
        adaptiveFlow: true,
        createdAt: new Date(),
      }

      setSession(newSession)
    } catch (error) {
      console.error("Failed to initialize AI session:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSubmitResponse = async () => {
    if (!session || !currentResponse.trim()) return

    setIsProcessing(true)
    setShowFeedback(false)

    try {
      const currentQuestion = session.questions[session.currentQuestionIndex]

      // Get current user's CV for context
      const currentUser = mockAuth.getCurrentUser()
      let parsedCV: ParsedCV | undefined

      if (currentUser) {
        const mockCVText = `${currentUser.name}\nSkills: ${currentUser.skills?.join(", ") || ""}`
        parsedCV = CVParser.parseCV(mockCVText)
      }

      // Score the response using AI
      const aiResponse = AIQuestionEngine.scoreResponse(currentQuestion, currentResponse, parsedCV)

      const updatedResponses = [...session.responses, aiResponse]

      // Check if we need to generate follow-up questions
      const updatedQuestions = [...session.questions]
      if (session.adaptiveFlow && aiResponse.score < 60 && session.currentQuestionIndex < 3) {
        // Generate a clarifying follow-up question
        const parsedJD = JDParser.parseJD(`${job?.title} at ${job?.company}`)
        const followUps = AIQuestionEngine.generateQuestions(parsedJD, parsedCV, updatedResponses, {
          adaptiveFlow: true,
          questionCount: 1,
        })
        if (followUps.length > 0) {
          updatedQuestions.push(followUps[0])
        }
      }

      const updatedSession: InterviewSession = {
        ...session,
        questions: updatedQuestions,
        responses: updatedResponses,
        currentQuestionIndex: session.currentQuestionIndex + 1,
        overallScore: Math.round(updatedResponses.reduce((sum, r) => sum + r.score, 0) / updatedResponses.length),
        isCompleted: session.currentQuestionIndex + 1 >= updatedQuestions.length,
      }

      setSession(updatedSession)
      setCurrentResponse("")
      setShowFeedback(true)

      // Hide feedback after 5 seconds and move to next question
      setTimeout(() => {
        setShowFeedback(false)
      }, 5000)
    } catch (error) {
      console.error("Failed to process response:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (!job || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Brain className="h-12 w-12 mx-auto text-primary animate-pulse" />
          <div>
            <h2 className="text-xl font-semibold">Initializing AI Interview</h2>
            <p className="text-muted-foreground">Generating personalized questions based on your profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (session.isCompleted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-2xl w-full mx-4">
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <CardTitle>AI Interview Completed!</CardTitle>
            <CardDescription>Thank you for completing the AI-powered pre-screening for {job.title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{session.overallScore}%</div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{session.responses.length}</div>
                <p className="text-sm text-muted-foreground">Questions Answered</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {session.responses.filter((r) => r.score >= 70).length}
                </div>
                <p className="text-sm text-muted-foreground">Strong Responses</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">AI Analysis Summary</h3>
              <div className="grid gap-3">
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Target className="h-4 w-4 text-green-600" />
                  <span className="text-sm">
                    <strong>Strengths:</strong>{" "}
                    {session.responses
                      .flatMap((r) => r.strengths)
                      .slice(0, 3)
                      .join(", ")}
                  </span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Lightbulb className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">
                    <strong>Areas for Growth:</strong>{" "}
                    {session.responses
                      .flatMap((r) => r.improvements)
                      .slice(0, 3)
                      .join(", ")}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Your responses have been analyzed by our AI system and sent to the hiring team.
              </p>
              <p className="text-sm text-muted-foreground">
                You'll receive detailed feedback and next steps within 24 hours.
              </p>
            </div>

            <div className="flex gap-2">
              <Link href="/candidate/applications" className="flex-1">
                <Button variant="outline" className="w-full bg-transparent">
                  View Applications
                </Button>
              </Link>
              <Link href="/candidate/jobs" className="flex-1">
                <Button className="w-full">Browse More Jobs</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = session.questions[session.currentQuestionIndex]
  const progress = ((session.currentQuestionIndex + 1) / session.questions.length) * 100
  const lastResponse = session.responses[session.responses.length - 1]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/candidate/jobs/${job.id}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Job
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI Pre-screening Interview
              </h1>
              <p className="text-sm text-muted-foreground">
                {job.title} at {job.company}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-primary">{session.overallScore}%</div>
              <div className="text-xs text-muted-foreground">Current Score</div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <span className={timeRemaining < 300 ? "text-red-500" : "text-muted-foreground"}>
                {formatTime(timeRemaining)}
              </span>
            </div>
            {timeRemaining < 300 && <AlertCircle className="h-4 w-4 text-red-500" />}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>
                  Question {session.currentQuestionIndex + 1} of {session.questions.length}
                </span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Current Question */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Question {session.currentQuestionIndex + 1}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      {currentQuestion.type}
                    </Badge>
                    <Badge
                      variant={
                        currentQuestion.difficulty === "hard"
                          ? "destructive"
                          : currentQuestion.difficulty === "medium"
                            ? "default"
                            : "secondary"
                      }
                      className="text-xs"
                    >
                      {currentQuestion.difficulty}
                    </Badge>
                  </div>
                </div>
                <CardDescription>AI-generated question based on your profile and job requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
                  <p className="text-foreground leading-relaxed">{currentQuestion.text}</p>
                </div>

                <div className="space-y-2">
                  <Textarea
                    value={currentResponse}
                    onChange={(e) => setCurrentResponse(e.target.value)}
                    placeholder="Type your response here... Be specific and provide examples where possible."
                    rows={8}
                    className="resize-none"
                    disabled={isProcessing}
                  />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{currentResponse.length} characters</span>
                    <span>Recommended: 200-500 words</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    disabled={session.currentQuestionIndex === 0 || isProcessing}
                    onClick={() =>
                      setSession({
                        ...session,
                        currentQuestionIndex: session.currentQuestionIndex - 1,
                      })
                    }
                  >
                    Previous
                  </Button>
                  <Button onClick={handleSubmitResponse} disabled={!currentResponse.trim() || isProcessing}>
                    {isProcessing
                      ? "Processing..."
                      : session.currentQuestionIndex === session.questions.length - 1
                        ? "Complete Interview"
                        : "Next Question"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* AI Feedback */}
            {showFeedback && lastResponse && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    AI Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{lastResponse.score}%</div>
                      <div className="text-xs text-muted-foreground">Score</div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{lastResponse.feedback}</p>
                    </div>
                  </div>

                  {lastResponse.strengths.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2 text-green-700 dark:text-green-400">Strengths:</h4>
                      <div className="flex flex-wrap gap-1">
                        {lastResponse.strengths.map((strength, index) => (
                          <Badge key={index} variant="secondary" className="text-xs bg-green-100 text-green-800">
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Interview Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Interview Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {session.questions.map((q, index) => (
                  <div key={q.id} className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        index < session.currentQuestionIndex
                          ? "bg-green-500 text-white"
                          : index === session.currentQuestionIndex
                            ? "bg-primary text-white"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-medium capitalize">{q.type}</div>
                      <div className="text-xs text-muted-foreground">{q.category}</div>
                    </div>
                    {index < session.responses.length && (
                      <Badge variant="outline" className="text-xs">
                        {session.responses[index].score}%
                      </Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* AI Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  AI Interview Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Provide specific examples from your experience</li>
                  <li>• Use technical terminology when appropriate</li>
                  <li>• Structure your responses clearly</li>
                  <li>• Explain your thought process</li>
                  <li>• Be honest about your experience level</li>
                </ul>
              </CardContent>
            </Card>

            {/* Question Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Question Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {["technical", "behavioral", "experience", "company_specific"].map((type) => {
                    const count = session.questions.filter((q) => q.type === type).length
                    const answered = session.responses.filter((_, i) => session.questions[i]?.type === type).length
                    return (
                      <div key={type} className="flex items-center justify-between text-sm">
                        <span className="capitalize">{type.replace("_", " ")}</span>
                        <span className="text-muted-foreground">
                          {answered}/{count}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
