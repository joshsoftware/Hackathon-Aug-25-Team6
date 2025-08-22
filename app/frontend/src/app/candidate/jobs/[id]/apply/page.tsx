"use client";

import { useState } from "react";
import { DashboardLayout } from "@/app/(components)/(layout)/dashboard-layout";
import { Card, CardContent } from "@/app/(components)/ui/card";
import { Button } from "@/app/(components)/ui/button";
import { Progress } from "@/app/(components)/ui/progress";
import { mockJobs } from "@/app/(lib)/mock-data";
import { ResumeUpload } from "@/app/(components)/(application)/resume-upload";
import { PrescreeningQuestions } from "@/app/(components)/(application)/prescreening-questions";
import { ApplicationReview } from "@/app/(components)/(application)/application-review";
import { CheckCircle, Upload, MessageSquare, Eye } from "lucide-react";
import { notFound } from "next/navigation";

interface ApplyPageProps {
  params: {
    id: string;
  };
}

type ApplicationStep = "resume" | "questions" | "review" | "submitted";

export default function ApplyPage({ params }: ApplyPageProps) {
  const [currentStep, setCurrentStep] = useState<ApplicationStep>("resume");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [prescreeningAnswers, setPrescreeningAnswers] = useState<
    Record<string, string>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const job = mockJobs.find((j) => j.id === params.id);

  if (!job) {
    notFound();
  }

  const steps = [
    { id: "resume", title: "Upload Resume", icon: Upload },
    { id: "questions", title: "Pre-screening", icon: MessageSquare },
    { id: "review", title: "Review", icon: Eye },
    { id: "submitted", title: "Submitted", icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleResumeUpload = (file: File) => {
    setResumeFile(file);
    setCurrentStep("questions");
  };

  const handleQuestionsComplete = (answers: Record<string, string>) => {
    setPrescreeningAnswers(answers);
    setCurrentStep("review");
  };

  const handleSubmitApplication = async () => {
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setCurrentStep("submitted");
    setIsSubmitting(false);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "resume":
        return <ResumeUpload job={job} onUpload={handleResumeUpload} />;
      case "questions":
        return (
          <PrescreeningQuestions
            job={job}
            resumeFile={resumeFile}
            onComplete={handleQuestionsComplete}
            onBack={() => setCurrentStep("resume")}
          />
        );
      case "review":
        return (
          <ApplicationReview
            job={job}
            resumeFile={resumeFile}
            answers={prescreeningAnswers}
            onSubmit={handleSubmitApplication}
            onBack={() => setCurrentStep("questions")}
            isSubmitting={isSubmitting}
          />
        );
      case "submitted":
        return (
          <Card className="text-center">
            <CardContent className="pt-8 pb-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Application Submitted!
              </h2>
              <p className="text-muted-foreground mb-6">
                Thank you for applying to {job.title} at {job.company}. We'll
                review your application and get back to you soon.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() =>
                    (window.location.href = "/candidate/applications")
                  }
                >
                  View My Applications
                </Button>
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = "/candidate/jobs")}
                >
                  Browse More Jobs
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  if (currentStep === "submitted") {
    return <DashboardLayout>{renderStepContent()}</DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Apply for {job.title}
            </h1>
            <p className="text-muted-foreground">
              {job.company} • {job.location}
            </p>
          </div>

          {/* Progress */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    Application Progress
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(progress)}% Complete
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="flex items-center justify-between">
                  {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = step.id === currentStep;
                    const isCompleted = index < currentStepIndex;
                    const isDisabled = index > currentStepIndex;

                    return (
                      <div
                        key={step.id}
                        className="flex flex-col items-center gap-2"
                      >
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                            isCompleted
                              ? "bg-primary border-primary text-primary-foreground"
                              : isActive
                              ? "border-primary text-primary bg-primary/10"
                              : isDisabled
                              ? "border-muted text-muted-foreground"
                              : "border-border text-muted-foreground"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <span
                          className={`text-xs font-medium ${
                            isActive
                              ? "text-primary"
                              : isCompleted
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {step.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Step Content */}
        {renderStepContent()}
      </div>
    </DashboardLayout>
  );
}
