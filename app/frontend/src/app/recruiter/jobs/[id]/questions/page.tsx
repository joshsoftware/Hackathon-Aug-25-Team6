"use client";

import { useState } from "react";
import { DashboardLayout } from "@/app/(components)/(layout)/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/(components)/ui/card";
import { Button } from "@/app/(components)/ui/button";
import { Badge } from "@/app/(components)/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/(components)/ui/tabs";
import { QuestionBuilder } from "@/app/(components)/(questions)/question-builder";
import { QuestionPreview } from "@/app/(components)/(questions)/question-preview";
import { mockJobs } from "@/app/(lib)/mock-data";
import { QuestionGenerator } from "@/app/(lib)/question-generator";
import type { Question, QuestionSet } from "@/app/(lib)/question-types";
import { Wand2, Plus, Edit, Trash2, Eye } from "lucide-react";
import { notFound } from "next/navigation";

interface JobQuestionsPageProps {
  params: {
    id: string;
  };
}

export default function JobQuestionsPage({ params }: JobQuestionsPageProps) {
  const job = mockJobs.find((j) => j.id === params.id);
  const [questionSet, setQuestionSet] = useState<QuestionSet | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);

  if (!job) {
    notFound();
  }

  const generateQuestions = () => {
    const generated = QuestionGenerator.generateQuestionsForJob(job);
    setQuestionSet(generated);
  };

  const handleSaveQuestion = (question: Question) => {
    if (questionSet) {
      const updatedQuestions = editingQuestion
        ? questionSet.questions.map((q) =>
            q.id === question.id ? question : q
          )
        : [...questionSet.questions, question];

      setQuestionSet({
        ...questionSet,
        questions: updatedQuestions,
        customized: true,
      });
    }
    setIsBuilding(false);
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (questionSet) {
      setQuestionSet({
        ...questionSet,
        questions: questionSet.questions.filter((q) => q.id !== questionId),
        customized: true,
      });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      technical: "bg-blue-100 text-blue-800",
      experience: "bg-green-100 text-green-800",
      behavioral: "bg-purple-100 text-purple-800",
      availability: "bg-orange-100 text-orange-800",
      "cultural-fit": "bg-pink-100 text-pink-800",
      "job-specific": "bg-indigo-100 text-indigo-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Pre-screening Questions
            </h1>
            <p className="text-muted-foreground">
              Manage questions for {job.title} at {job.company}
            </p>
          </div>

          {!questionSet && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Generate AI-Powered Questions
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Create personalized pre-screening questions based on your
                      job requirements
                    </p>
                  </div>
                  <Button
                    onClick={generateQuestions}
                    className="flex items-center gap-2"
                  >
                    <Wand2 className="h-4 w-4" />
                    Generate Questions
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {questionSet && (
          <Tabs defaultValue="questions" className="space-y-6">
            <TabsList>
              <TabsTrigger value="questions">
                Questions ({questionSet.questions.length})
              </TabsTrigger>
              <TabsTrigger value="builder">Question Builder</TabsTrigger>
              <TabsTrigger value="preview">Preview Experience</TabsTrigger>
            </TabsList>

            <TabsContent value="questions" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Question Set
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {questionSet.customized ? "Customized" : "AI Generated"} •{" "}
                    {new Date(questionSet.generatedAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setIsBuilding(true);
                    setEditingQuestion(null);
                  }}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Question
                </Button>
              </div>

              <div className="grid gap-4">
                {questionSet.questions.map((question, index) => (
                  <Card key={question.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <CardTitle className="text-lg">
                            {index + 1}. {question.question}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={getCategoryColor(question.category)}
                            >
                              {question.category}
                            </Badge>
                            <Badge variant="outline">{question.type}</Badge>
                            {question.required && (
                              <Badge variant="destructive">Required</Badge>
                            )}
                            <Badge variant="secondary">
                              Weight: {question.weight}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPreviewQuestion(question)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingQuestion(question);
                              setIsBuilding(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteQuestion(question.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {question.type === "multiple-choice" && (
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-foreground">
                            Options:
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {(question as any).options?.map(
                              (option: any, optIndex: number) => (
                                <div
                                  key={optIndex}
                                  className="text-sm text-muted-foreground"
                                >
                                  • {option.text}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="builder">
              {isBuilding ? (
                <QuestionBuilder
                  onSave={handleSaveQuestion}
                  onPreview={setPreviewQuestion}
                  initialQuestion={editingQuestion || undefined}
                />
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Question Builder
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Create custom questions for your job opening
                    </p>
                    <Button
                      onClick={() => {
                        setIsBuilding(true);
                        setEditingQuestion(null);
                      }}
                    >
                      Start Building
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="preview">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Candidate Experience Preview</CardTitle>
                    <CardDescription>
                      See how candidates will experience your pre-screening
                      questions
                    </CardDescription>
                  </CardHeader>
                </Card>

                <div className="space-y-6">
                  {questionSet.questions.map((question, index) => (
                    <div key={question.id} className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Question {index + 1} of {questionSet.questions.length}
                      </div>
                      <QuestionPreview question={question} showScoring={true} />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Preview Modal */}
        {previewQuestion && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    Question Preview
                  </h3>
                  <Button
                    variant="ghost"
                    onClick={() => setPreviewQuestion(null)}
                  >
                    ×
                  </Button>
                </div>
                <QuestionPreview
                  question={previewQuestion}
                  showScoring={true}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
