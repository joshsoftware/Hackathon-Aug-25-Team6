"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, CheckCircle, AlertCircle, X } from "lucide-react"
import { CVParser } from "@/lib/parsers"
import type { ParsedCV } from "@/lib/types"

interface CVUploadProps {
  onCVParsed?: (parsedCV: ParsedCV) => void
  className?: string
}

export function CVUpload({ onCVParsed, className }: CVUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [parsedCV, setParsedCV] = useState<ParsedCV | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file.type.includes("pdf") && !file.type.includes("text") && !file.name.endsWith(".txt")) {
      setError("Please upload a PDF or text file")
      return
    }

    setIsUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      // Simulate file upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Mock file reading - in real app, would extract text from PDF
      const mockCVText = `
        John Doe
        Email: john.doe@email.com
        Phone: (555) 123-4567
        Location: San Francisco, CA
        LinkedIn: linkedin.com/in/johndoe
        GitHub: github.com/johndoe

        Summary:
        Experienced Full Stack Developer with 5+ years of experience building scalable web applications using modern technologies. Passionate about creating efficient, user-friendly solutions and staying up-to-date with the latest industry trends.

        Experience:
        Senior Frontend Developer at TechCorp Inc. (2022 - Present)
        - Led development of React-based dashboard serving 10,000+ users
        - Implemented TypeScript migration reducing bugs by 40%
        - Collaborated with design team to improve user experience
        - Technologies: React, TypeScript, Next.js, Tailwind CSS

        Full Stack Developer at StartupXYZ (2020 - 2022)
        - Built and maintained Node.js APIs handling 1M+ requests daily
        - Developed responsive web applications using React and Vue.js
        - Implemented CI/CD pipelines reducing deployment time by 60%
        - Technologies: Node.js, React, Vue.js, PostgreSQL, Docker

        Junior Developer at WebSolutions (2019 - 2020)
        - Developed WordPress themes and plugins for client websites
        - Assisted in database design and optimization
        - Technologies: PHP, MySQL, JavaScript, HTML, CSS

        Education:
        Bachelor of Science in Computer Science at University of California, Berkeley (2019)
        GPA: 3.8

        Skills:
        JavaScript, TypeScript, React, Vue.js, Node.js, Python, HTML, CSS, PostgreSQL, MongoDB, Docker, AWS, Git, Agile

        Projects:
        E-commerce Platform: Built a full-stack e-commerce solution using React and Node.js
        Technologies: React, Node.js, PostgreSQL, Stripe API
        URL: https://github.com/johndoe/ecommerce

        Task Management App: Developed a collaborative task management application
        Technologies: Vue.js, Express, MongoDB
        URL: https://github.com/johndoe/taskmanager

        Certifications:
        AWS Certified Developer Associate by Amazon Web Services (2023)
        React Developer Certification by Meta (2022)

        Languages:
        English - Native
        Spanish - Intermediate
      `

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const parsed = CVParser.parseCV(mockCVText)
      setParsedCV(parsed)
      setUploadProgress(100)
      onCVParsed?.(parsed)
    } catch (err) {
      setError("Failed to parse CV. Please try again.")
      console.error("CV parsing error:", err)
    } finally {
      setIsUploading(false)
    }
  }

  const clearCV = () => {
    setParsedCV(null)
    setUploadProgress(0)
    setError(null)
  }

  if (parsedCV) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              CV Parsed Successfully
            </CardTitle>
            <CardDescription>Your CV has been analyzed and key information extracted</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={clearCV}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Personal Information</h4>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Name:</strong> {parsedCV.personalInfo.name}
                </p>
                <p>
                  <strong>Email:</strong> {parsedCV.personalInfo.email}
                </p>
                {parsedCV.personalInfo.phone && (
                  <p>
                    <strong>Phone:</strong> {parsedCV.personalInfo.phone}
                  </p>
                )}
                {parsedCV.personalInfo.location && (
                  <p>
                    <strong>Location:</strong> {parsedCV.personalInfo.location}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Experience</h4>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Positions:</strong> {parsedCV.experience.length}
                </p>
                <p>
                  <strong>Latest Role:</strong> {parsedCV.experience[0]?.position || "N/A"}
                </p>
                <p>
                  <strong>Company:</strong> {parsedCV.experience[0]?.company || "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Skills ({parsedCV.skills.length})</h4>
            <div className="flex flex-wrap gap-1">
              {parsedCV.skills.slice(0, 10).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {parsedCV.skills.length > 10 && (
                <Badge variant="outline" className="text-xs">
                  +{parsedCV.skills.length - 10} more
                </Badge>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Education</h4>
            {parsedCV.education.length > 0 ? (
              <div className="text-sm">
                <p>
                  <strong>{parsedCV.education[0].degree}</strong> in {parsedCV.education[0].field}
                </p>
                <p>
                  {parsedCV.education[0].institution} ({parsedCV.education[0].year})
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No education information found</p>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Upload CV</CardTitle>
        <CardDescription>Upload your CV to automatically extract and analyze your information</CardDescription>
      </CardHeader>
      <CardContent>
        {isUploading ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span className="text-sm">Processing your CV...</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">Extracting information from your CV using AI parsing</p>
          </div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <div className="space-y-2">
              <p className="text-lg font-medium">Drop your CV here</p>
              <p className="text-sm text-muted-foreground">or click to browse files</p>
              <p className="text-xs text-muted-foreground">Supports PDF and text files (max 10MB)</p>
            </div>
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
