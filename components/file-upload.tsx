"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onFileUpload?: (file: File, extractedData?: any) => void
  acceptedTypes?: string[]
  maxSize?: number
  multiple?: boolean
  className?: string
}

interface UploadedFile {
  file: File
  id: string
  status: "uploading" | "processing" | "completed" | "error"
  progress: number
  extractedData?: any
  error?: string
}

export default function FileUpload({
  onFileUpload,
  acceptedTypes = [".pdf", ".doc", ".docx", ".txt"],
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = false,
  className,
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  const processFile = async (file: File): Promise<any> => {
    // Simulate file processing and data extraction
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock extracted data based on file type
    if (file.name.toLowerCase().includes("cv") || file.name.toLowerCase().includes("resume")) {
      return {
        type: "cv",
        personalInfo: {
          name: "John Doe",
          email: "john.doe@example.com",
          phone: "+1 (555) 123-4567",
        },
        skills: ["JavaScript", "React", "Node.js", "Python", "SQL"],
        experience: [
          {
            company: "Tech Corp",
            position: "Senior Developer",
            duration: "2020-2023",
            description: "Led development of web applications using React and Node.js",
          },
        ],
        education: [
          {
            degree: "Bachelor of Computer Science",
            institution: "University of Technology",
            year: "2018",
          },
        ],
      }
    } else {
      return {
        type: "document",
        content: `Processed content from ${file.name}`,
        wordCount: Math.floor(Math.random() * 1000) + 500,
        keyTerms: ["technology", "development", "experience", "skills"],
      }
    }
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
        file,
        id: Math.random().toString(36).substr(2, 9),
        status: "uploading",
        progress: 0,
      }))

      setUploadedFiles((prev) => [...prev, ...newFiles])

      // Process each file
      for (const uploadedFile of newFiles) {
        try {
          // Simulate upload progress
          for (let progress = 0; progress <= 100; progress += 20) {
            await new Promise((resolve) => setTimeout(resolve, 200))
            setUploadedFiles((prev) =>
              prev.map((f) =>
                f.id === uploadedFile.id
                  ? { ...f, progress, status: progress === 100 ? "processing" : "uploading" }
                  : f,
              ),
            )
          }

          // Process file and extract data
          const extractedData = await processFile(uploadedFile.file)

          setUploadedFiles((prev) =>
            prev.map((f) => (f.id === uploadedFile.id ? { ...f, status: "completed", extractedData } : f)),
          )

          onFileUpload?.(uploadedFile.file, extractedData)
        } catch (error) {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === uploadedFile.id ? { ...f, status: "error", error: "Failed to process file" } : f,
            ),
          )
        }
      }
    },
    [onFileUpload],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    multiple,
  })

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const getStatusIcon = (status: UploadedFile["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <File className="h-4 w-4 text-blue-600" />
    }
  }

  const getStatusColor = (status: UploadedFile["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "processing":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
            )}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-lg font-medium">Drop files here...</p>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2">Drag & drop files here, or click to select</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Supported formats: {acceptedTypes.join(", ")} (max {Math.round(maxSize / 1024 / 1024)}MB)
                </p>
                <Button variant="outline">Choose Files</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {uploadedFiles.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-medium mb-4">Uploaded Files</h3>
            <div className="space-y-3">
              {uploadedFiles.map((uploadedFile) => (
                <div key={uploadedFile.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0">{getStatusIcon(uploadedFile.status)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium truncate">{uploadedFile.file.name}</p>
                      <Badge className={getStatusColor(uploadedFile.status)}>
                        {uploadedFile.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    {(uploadedFile.status === "uploading" || uploadedFile.status === "processing") && (
                      <Progress value={uploadedFile.progress} className="h-1" />
                    )}
                    {uploadedFile.extractedData && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        <p>✓ Data extracted successfully</p>
                        {uploadedFile.extractedData.type === "cv" && (
                          <p>
                            Found: {uploadedFile.extractedData.skills?.length || 0} skills,{" "}
                            {uploadedFile.extractedData.experience?.length || 0} experiences
                          </p>
                        )}
                      </div>
                    )}
                    {uploadedFile.error && <p className="text-xs text-red-600 mt-1">{uploadedFile.error}</p>}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(uploadedFile.id)}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
