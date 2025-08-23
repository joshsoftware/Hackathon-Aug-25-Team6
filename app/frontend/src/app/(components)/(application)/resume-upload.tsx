"use client";

import type React from "react";

import { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/(components)/ui/card";
import { Button } from "@/app/(components)/ui/button";
import { Input } from "@/app/(components)/ui/input";
import { Label } from "@/app/(components)/ui/label";
import { Alert, AlertDescription } from "@/app/(components)/ui/alert";
import type { Job } from "@/app/(lib)/types";
import { Upload, FileText, X, CheckCircle } from "lucide-react";
import { useApplyForJob } from "@/app/candidate/jobs/[id]/apply/query/query";
import { toast } from "react-toastify";

interface ResumeUploadProps {
  job: Job;
  onUpload: (file: File) => void;
}

export function ResumeUpload({ job, onUpload }: ResumeUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { applyForJobMutation, isApplyPending } = useApplyForJob();

  
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    setUploadError(null);

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Please upload a PDF or Word document");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size must be less than 5MB");
      return;
    }

    setSelectedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

// In the handleUpload function

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);

    try {
      // Create FormData just for the resume file
      const formData = new FormData();
      formData.append('resume', selectedFile);
      
      // Add job_id to FormData temporarily - it will be extracted and used in query params
      formData.append('job_id', job.id.toString());
      
      // Call the mutation with just the FormData
      await applyForJobMutation(formData, {
        onSuccess: (data) => {
          toast.success("Resume uploaded and application started!");
          onUpload(selectedFile);
        },
        onError: (error: any) => {
          let message = "Failed to upload resume. Please try again.";
          const detail = error?.response?.data?.detail || error?.response?.data?.error_msg;

          if (typeof detail === "string") {
            message = detail;
          } else if (Array.isArray(detail)) {
            // FastAPI validation errors: array of {loc, msg, ...}
            message = detail.map((d) => d.msg).join(", ");
          } else if (typeof detail === "object" && detail !== null) {
            // If it's an object, try to extract a message
            message = detail.msg || JSON.stringify(detail);
          }

          setUploadError(message);
        },
      });
    } catch (error) {
      setUploadError("Failed to upload resume. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadError(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Your Resume</CardTitle>
          <CardDescription>
            Upload your resume to automatically match your skills with the job
            requirements for {job.title} <span className="text-destructive font-medium">*Required</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!selectedFile ? (
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-foreground">
                  Drop your resume here
                </h3>
                <p className="text-sm text-muted-foreground">
                  or click to browse files
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports PDF, DOC, DOCX (max 5MB)
                </p>
              </div>
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileInputChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={removeFile}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Resume selected successfully. We&apos;ll analyze your skills and
                  experience to generate personalized pre-screening questions.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {uploadError && (
            <Alert variant="destructive">
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-4">
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="flex-1 md:flex-none"
            >
              {isUploading
                ? "Processing Resume..."
                : "Continue to Pre-screening"}
            </Button>
            {selectedFile && (
              <Button variant="outline" onClick={removeFile}>
                Choose Different File
              </Button>
            )}
          </div>
          
          {!selectedFile && (
            <p className="text-sm text-destructive">
              A resume is required to apply for this position. Your resume will be used to evaluate your qualifications against the job requirements.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Job Requirements Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Job Requirements</CardTitle>
          <CardDescription>
            We&apos;ll match your resume against these requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-foreground">
                Must-have Skills
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {job.mustHaveSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            {job.goodToHaveSkills.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-foreground">
                  Good-to-have Skills
                </Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {job.goodToHaveSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}