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
import { Input } from "@/app/(components)/ui/input";
import { Label } from "@/app/(components)/ui/label";
import { Textarea } from "@/app/(components)/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/(components)/ui/select";
import { Badge } from "@/app/(components)/ui/badge";
import { Slider } from "@/app/(components)/ui/slider";
import type {
  Question,
  QuestionType,
  QuestionCategory,
} from "@/app/(lib)/question-types";
import { Plus, X, Save, Eye } from "lucide-react";

interface QuestionBuilderProps {
  onSave: (question: Question) => void;
  onPreview: (question: Question) => void;
  initialQuestion?: Question;
}

export function QuestionBuilder({
  onSave,
  onPreview,
  initialQuestion,
}: QuestionBuilderProps) {
  const [questionType, setQuestionType] = useState<QuestionType>(
    initialQuestion?.type || "text"
  );
  const [category, setCategory] = useState<QuestionCategory>(
    initialQuestion?.category || "technical"
  );
  const [questionText, setQuestionText] = useState(
    initialQuestion?.question || ""
  );
  const [required, setRequired] = useState<boolean>(initialQuestion?.required || true);
  const [weight, setWeight] = useState([initialQuestion?.weight || 5]);
  const [options, setOptions] = useState<
    Array<{ text: string; score: number }>
  >(
    initialQuestion?.type === "multiple-choice"
      ? (initialQuestion as any).options || []
      : []
  );

  const addOption = () => {
    setOptions([...options, { text: "", score: 50 }]);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (
    index: number,
    field: "text" | "score",
    value: string | number
  ) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const buildQuestion = (): Question => {
    const baseQuestion = {
      id: initialQuestion?.id || `q-${Date.now()}`,
      type: questionType,
      question: questionText,
      required,
      weight: weight[0],
      category,
      createdAt: initialQuestion?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    switch (questionType) {
      case "multiple-choice":
        return {
          ...baseQuestion,
          type: "multiple-choice",
          options: options.map((opt, i) => ({
            id: i.toString(),
            text: opt.text,
            score: opt.score,
          })),
          allowMultiple: false,
        };
      case "rating":
        return {
          ...baseQuestion,
          type: "rating",
          scale: 5,
          labels: { low: "Poor", high: "Excellent" },
        };
      case "yes-no":
        return {
          ...baseQuestion,
          type: "yes-no",
          positiveWeight: 100,
        };
      case "text":
      default:
        return {
          ...baseQuestion,
          type: "text",
          minLength: 10,
          maxLength: 500,
          placeholder: "Please provide your answer...",
        };
    }
  };

  const handleSave = () => {
    const question = buildQuestion();
    onSave(question);
  };

  const handlePreview = () => {
    const question = buildQuestion();
    onPreview(question);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Question Builder</CardTitle>
        <CardDescription>
          Create custom pre-screening questions for your job openings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Question Type and Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Question Type</Label>
            <Select
              value={questionType}
              onValueChange={(value: string) => setQuestionType(value as QuestionType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text Response</SelectItem>
                <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                <SelectItem value="rating">Rating Scale</SelectItem>
                <SelectItem value="yes-no">Yes/No</SelectItem>
                <SelectItem value="skill-assessment">
                  Skill Assessment
                </SelectItem>
                <SelectItem value="scenario">Scenario Question</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={category}
              onValueChange={(value: string) => setCategory(value as QuestionCategory)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="experience">Experience</SelectItem>
                <SelectItem value="behavioral">Behavioral</SelectItem>
                <SelectItem value="availability">Availability</SelectItem>
                <SelectItem value="cultural-fit">Cultural Fit</SelectItem>
                <SelectItem value="job-specific">Job Specific</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Question Text */}
        <div className="space-y-2">
          <Label>Question</Label>
          <Textarea
            placeholder="Enter your question here..."
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            rows={3}
          />
        </div>

        {/* Question Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="required"
                checked={required}
                onChange={(e) => setRequired(e.target.checked)}
                className="rounded border-border"
              />
              <Label htmlFor="required">Required</Label>
            </div>
            <Badge variant={required ? "default" : "secondary"}>
              {required ? "Required" : "Optional"}
            </Badge>
          </div>

          <div className="space-y-2">
            <Label>Question Weight (Importance): {weight[0]}</Label>
            <Slider
              value={weight}
              onValueChange={setWeight}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Low Impact</span>
              <span>High Impact</span>
            </div>
          </div>
        </div>

        {/* Question Type Specific Options */}
        {questionType === "multiple-choice" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Answer Options</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>
            <div className="space-y-3">
              {options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 border border-border rounded-lg"
                >
                  <Input
                    placeholder="Option text"
                    value={option.text}
                    onChange={(e) =>
                      updateOption(index, "text", e.target.value)
                    }
                    className="flex-1"
                  />
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Score:</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={option.score}
                      onChange={(e) =>
                        updateOption(
                          index,
                          "score",
                          Number.parseInt(e.target.value) || 0
                        )
                      }
                      className="w-20"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4">
          <Button onClick={handleSave} disabled={!questionText.trim()}>
            <Save className="h-4 w-4 mr-2" />
            Save Question
          </Button>
          <Button
            variant="outline"
            onClick={handlePreview}
            disabled={!questionText.trim()}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
