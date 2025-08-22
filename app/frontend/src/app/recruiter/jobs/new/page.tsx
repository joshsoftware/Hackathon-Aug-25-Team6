"use client";

import type React from "react";

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
import { X } from "lucide-react";

export default function NewJobPage() {
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    type: "",
    salaryMin: "",
    salaryMax: "",
    description: "",
    requirements: "",
    applicationDeadline: "",
  });

  const [mustHaveSkills, setMustHaveSkills] = useState<string[]>([]);
  const [goodToHaveSkills, setGoodToHaveSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const addSkill = (skillType: "must" | "good") => {
    if (!currentSkill.trim()) return;

    if (skillType === "must") {
      setMustHaveSkills([...mustHaveSkills, currentSkill.trim()]);
    } else {
      setGoodToHaveSkills([...goodToHaveSkills, currentSkill.trim()]);
    }
    setCurrentSkill("");
  };

  const removeSkill = (skillType: "must" | "good", index: number) => {
    if (skillType === "must") {
      setMustHaveSkills(mustHaveSkills.filter((_, i) => i !== index));
    } else {
      setGoodToHaveSkills(goodToHaveSkills.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Redirect to jobs list
    window.location.href = "/recruiter/jobs";
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Add New Job Opening
          </h1>
          <p className="text-muted-foreground">
            Create a new job posting to attract qualified candidates
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the fundamental details about the position
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Senior Frontend Developer"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company *</Label>
                  <Input
                    id="company"
                    placeholder="e.g., TechCorp Inc."
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="e.g., San Francisco, CA or Remote"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Job Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salaryMin">Minimum Salary (USD)</Label>
                  <Input
                    id="salaryMin"
                    type="number"
                    placeholder="e.g., 80000"
                    value={formData.salaryMin}
                    onChange={(e) =>
                      setFormData({ ...formData, salaryMin: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salaryMax">Maximum Salary (USD)</Label>
                  <Input
                    id="salaryMax"
                    type="number"
                    placeholder="e.g., 120000"
                    value={formData.salaryMax}
                    onChange={(e) =>
                      setFormData({ ...formData, salaryMax: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="applicationDeadline">
                  Application Deadline *
                </Label>
                <Input
                  id="applicationDeadline"
                  type="date"
                  value={formData.applicationDeadline}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      applicationDeadline: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
              <CardDescription>
                Provide detailed information about the role and requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Job Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                  rows={6}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  placeholder="List the key requirements, qualifications, and experience needed..."
                  rows={4}
                  value={formData.requirements}
                  onChange={(e) =>
                    setFormData({ ...formData, requirements: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Skills & Qualifications</CardTitle>
              <CardDescription>
                Add the skills and qualifications needed for this position
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Must-have Skills */}
              <div className="space-y-3">
                <Label>Must-have Skills *</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter a skill and press Enter"
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill("must");
                      }
                    }}
                  />
                  <Button type="button" onClick={() => addSkill("must")}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {mustHaveSkills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="default"
                      className="flex items-center gap-1"
                    >
                      {skill}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeSkill("must", index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Good-to-have Skills */}
              <div className="space-y-3">
                <Label>Good-to-have Skills</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter a skill and press Enter"
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill("good");
                      }
                    }}
                  />
                  <Button type="button" onClick={() => addSkill("good")}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {goodToHaveSkills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      {skill}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeSkill("good", index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex items-center gap-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 md:flex-none"
            >
              {isLoading ? "Creating Job..." : "Create Job Opening"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
