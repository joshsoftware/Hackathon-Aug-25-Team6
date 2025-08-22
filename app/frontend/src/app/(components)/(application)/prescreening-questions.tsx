"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/(components)/ui/card";
import { Button } from "@/app/(components)/ui/button";
import { Textarea } from "@/app/(components)/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/app/(components)/ui/radio-group";
import { Label } from "@/app/(components)/ui/label";
import { Progress } from "@/app/(components)/ui/progress";
import type { Job } from "@/app/(lib)/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Question {
  id: string;
  type: "text" | "multiple-choice" | "rating";
  question: string;
  options?: string[];
  required: boolean;
}

interface PrescreeningQuestionsProps {
  job: Job;
  resumeFile: File | null;
  onComplete: (answers: Record<string, string>) => void;
  onBack: () => void;
}

// Mock questions generated based on job and resume
const generateQuestions = (job: Job): Question[] => [
  {
    id: "1",
    type: "multiple-choice",
    question: `How many years of experience do you have with ${job.mustHaveSkills[0]}?`,
    options: ["Less than 1 year", "1-2 years", "3-5 years", "5+ years"],
    required: true,
  },
  {
    id: "2",
    type: "text",
    question: `Describe a challenging project where you used ${job.mustHaveSkills[1]}. What was your role and how did you overcome the challenges?`,
    required: true,
  },
  {
    id: "3",
    type: "multiple-choice",
    question: "What is your preferred work environment?",
    options: ["Remote", "Hybrid", "On-site", "Flexible"],
    required: true,
  },
  {
    id: "4",
    type: "text",
    question: `This role requires ${job.requirements[0]}. Can you provide an example of how you meet this requirement?`,
    required: true,
  },
  {
    id: "5",
    type: "multiple-choice",
    question: "How soon can you start if selected?",
    options: [
      "Immediately",
      "2 weeks notice",
      "1 month notice",
      "More than 1 month",
    ],
    required: true,
  },
];

export function PrescreeningQuestions({
  job,
  resumeFile,
  onComplete,
  onBack,
}: PrescreeningQuestionsProps) {
  const questions = generateQuestions(job);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isCompleting, setIsCompleting] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const canProceed =
    answers[currentQuestion.id] && answers[currentQuestion.id].trim() !== "";

  const handleAnswerChange = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      handleComplete();
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);

    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    onComplete(answers);
  };

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case "multiple-choice":
        return (
          <RadioGroup
            value={answers[currentQuestion.id] || ""}
            onValueChange={handleAnswerChange}
            className="space-y-3"
          >
            {currentQuestion.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={option} />
                <Label
                  htmlFor={option}
                  className="text-sm font-normal cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );
      case "text":
        return (
          <Textarea
            placeholder="Please provide a detailed answer..."
            value={answers[currentQuestion.id] || ""}
            onChange={(e) => handleAnswerChange(e.target.value)}
            rows={6}
            className="resize-none"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pre-screening Questions</CardTitle>
              <CardDescription>
                Answer these questions to help us better understand your fit for
                the {job.title} position
              </CardDescription>
            </div>
            <div className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                Progress
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground leading-relaxed">
                {currentQuestion.question}
              </h3>
              {currentQuestion.required && (
                <span className="text-sm text-destructive">* Required</span>
              )}
            </div>

            {renderQuestion()}
          </div>

          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={currentQuestionIndex === 0 ? onBack : handlePrevious}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              {currentQuestionIndex === 0 ? "Back to Resume" : "Previous"}
            </Button>

            <Button onClick={handleNext} disabled={!canProceed || isCompleting}>
              {isCompleting ? (
                "Processing..."
              ) : isLastQuestion ? (
                "Complete Pre-screening"
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Question Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  index === currentQuestionIndex
                    ? "bg-primary text-primary-foreground"
                    : answers[questions[index].id]
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
