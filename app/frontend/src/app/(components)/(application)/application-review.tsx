"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/(components)/ui/card";
import { Button } from "@/app/(components)/ui/button";
import { Separator } from "@/app/(components)/ui/separator";
import { Badge } from "@/app/(components)/ui/badge";
import type { Job } from "@/app/(lib)/types";
import { FileText, MessageSquare, ChevronLeft, Send } from "lucide-react";

interface ApplicationReviewProps {
  job: Job;
  resumeFile: File | null;
  answers: Record<string, string>;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export function ApplicationReview({
  job,
  resumeFile,
  answers,
  onSubmit,
  onBack,
  isSubmitting,
}: ApplicationReviewProps) {
  const answerEntries = Object.entries(answers);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Review Your Application</CardTitle>
          <CardDescription>
            Please review your application details before submitting for the{" "}
            {job.title} position at {job.company}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Job Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">
              Position Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <span className="text-sm font-medium text-foreground">
                  Job Title:
                </span>
                <p className="text-sm text-muted-foreground">{job.title}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-foreground">
                  Company:
                </span>
                <p className="text-sm text-muted-foreground">{job.company}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-foreground">
                  Location:
                </span>
                <p className="text-sm text-muted-foreground">{job.location}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-foreground">
                  Job Type:
                </span>
                <Badge variant="secondary">{job.type}</Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Resume */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Resume</h3>
            {resumeFile && (
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium text-foreground">
                    {resumeFile.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {(resumeFile.size / 1024 / 1024).toFixed(2)} MB • Uploaded
                    successfully
                  </p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Pre-screening Answers */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">
              Pre-screening Responses
            </h3>
            <div className="space-y-4">
              {answerEntries.map(([questionId, answer], index) => (
                <div key={questionId} className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="space-y-2 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        Question {index + 1}
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Application Summary */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">
              Application Summary
            </h3>
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Ready to Submit
                </p>
                <p className="text-sm text-muted-foreground">
                  Your application includes your resume and{" "}
                  {answerEntries.length} pre-screening responses. Once
                  submitted, the recruiter will review your application and
                  contact you if you&apos;re selected for the next stage.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <Button variant="outline" onClick={onBack}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Questions
            </Button>

            <Button
              onClick={onSubmit}
              disabled={isSubmitting}
              size="lg"
              className="px-8"
            >
              {isSubmitting ? (
                "Submitting Application..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
