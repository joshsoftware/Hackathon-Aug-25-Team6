/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/(components)/ui/card";
import { Input } from "@/app/(components)/ui/input";
import { Textarea } from "@/app/(components)/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/app/(components)/ui/radio-group";
import { Label } from "@/app/(components)/ui/label";
import { Badge } from "@/app/(components)/ui/badge";
import type { Question } from "@/app/(lib)/question-types";
import { QuestionScorer } from "@/app/(lib)/question-generator";

interface QuestionPreviewProps {
  question: Question;
  showScoring?: boolean;
}

export function QuestionPreview({
  question,
  showScoring = false,
}: QuestionPreviewProps) {
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState<number | null>(null);

  const handleAnswerChange = (value: string) => {
    setAnswer(value);
    if (showScoring) {
      const calculatedScore = QuestionScorer.scoreAnswer(question, value);
      setScore(calculatedScore);
    }
  };

  const renderQuestionInput = () => {
    switch (question.type) {
      case "multiple-choice":
        const mcq = question as any;
        return (
          <RadioGroup
            value={answer}
            onValueChange={handleAnswerChange}
            className="space-y-3"
          >
            {mcq.options?.map((option: any) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.id} id={option.id} />
                <Label
                  htmlFor={option.id}
                  className="text-sm font-normal cursor-pointer"
                >
                  {option.text}
                  {showScoring && (
                    <Badge variant="outline" className="ml-2">
                      {option.score}pts
                    </Badge>
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "rating":
        const ratingq = question as any;
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{ratingq.labels?.low || "Low"}</span>
              <span>{ratingq.labels?.high || "High"}</span>
            </div>
            <RadioGroup
              value={answer}
              onValueChange={handleAnswerChange}
              className="flex space-x-4"
            >
              {Array.from({ length: ratingq.scale || 5 }, (_, i) => (
                <div
                  key={i + 1}
                  className="flex flex-col items-center space-y-2"
                >
                  <RadioGroupItem
                    value={(i + 1).toString()}
                    id={`rating-${i + 1}`}
                  />
                  <Label
                    htmlFor={`rating-${i + 1}`}
                    className="text-sm cursor-pointer"
                  >
                    {i + 1}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case "yes-no":
        return (
          <RadioGroup
            value={answer}
            onValueChange={handleAnswerChange}
            className="flex space-x-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="yes" />
              <Label htmlFor="yes" className="cursor-pointer">
                Yes
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="no" />
              <Label htmlFor="no" className="cursor-pointer">
                No
              </Label>
            </div>
          </RadioGroup>
        );

      case "text":
      case "scenario":
        const textq = question as any;
        return (
          <Textarea
            placeholder={textq.placeholder || "Please provide your answer..."}
            value={answer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            rows={question.type === "scenario" ? 6 : 4}
            className="resize-none"
          />
        );

      case "skill-assessment":
        const skillq = question as any;
        if (skillq.options) {
          return (
            <RadioGroup
              value={answer}
              onValueChange={handleAnswerChange}
              className="space-y-3"
            >
              {skillq.options.map((option: any) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label
                    htmlFor={option.id}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          );
        }
        return (
          <Input
            placeholder="Enter your answer"
            value={answer}
            onChange={(e) => handleAnswerChange(e.target.value)}
          />
        );

      default:
        return (
          <Input
            placeholder="Enter your answer"
            value={answer}
            onChange={(e) => handleAnswerChange(e.target.value)}
          />
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg">{question.question}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{question.category}</Badge>
              <Badge variant="outline">{question.type}</Badge>
              {question.required && (
                <Badge variant="destructive">Required</Badge>
              )}
              {showScoring && (
                <Badge variant="secondary">Weight: {question.weight}</Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {question.type === "scenario" && (question as any).scenario && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-foreground mb-2">Scenario:</h4>
            <p className="text-sm text-muted-foreground">
              {(question as any).scenario}
            </p>
          </div>
        )}

        {renderQuestionInput()}

        {showScoring && score !== null && (
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                Score:
              </span>
              <Badge variant="default">{score}/100</Badge>
            </div>
          </div>
        )}

        {question.type === "scenario" &&
          (question as any).evaluationCriteria && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">
                Evaluation Criteria:
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {(question as any).evaluationCriteria.map(
                  (criteria: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                      {criteria}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
