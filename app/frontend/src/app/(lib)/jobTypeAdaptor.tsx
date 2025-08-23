import { IJob } from "@/app/recruiter/jobs/query/query";

// This is the Job type your components expect
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  mustHaveSkills: string[];
  goodToHaveSkills: string[];
  postedDate: string;
  applicationDeadline?: string;
  status?: string;
  applicantCount?: number;
  recruiterId?: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
}

// Convert API job (IJob) to component job (Job)
export function adaptJobForComponents(apiJob: IJob): import("@/app/(lib)/types").Job {
  // Parse skills if they are strings
  const mustHaveSkills = Array.isArray(apiJob.must_have_skills)
    ? apiJob.must_have_skills
    : String(apiJob.must_have_skills || "")
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);

  const goodToHaveSkills = Array.isArray(apiJob.good_to_have_skills)
    ? apiJob.good_to_have_skills
    : String(apiJob.good_to_have_skills || "")
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);

  // Generate requirements from key_responsibilities
  const requirements = apiJob.key_responsibilities
    ? apiJob.key_responsibilities.split('\n').filter(Boolean)
    : [];

  // Calculate a default deadline 30 days from posted date
  const postedDate = apiJob.posted_date || new Date().toISOString().split('T')[0];
  const deadlineDate = new Date(postedDate);
  deadlineDate.setDate(deadlineDate.getDate() + 30);
  const applicationDeadline = deadlineDate.toISOString().split('T')[0];

  return {
    id: apiJob.job_id || String(apiJob.job_id),
    title: apiJob.title || "",
    company: apiJob.company || "",
    location: apiJob.location || "",
    type: apiJob.job_type || "",
    description: apiJob.job_overview || "",
    requirements: requirements,
    mustHaveSkills: mustHaveSkills,
    goodToHaveSkills: goodToHaveSkills,
    postedDate: postedDate,
    applicationDeadline: applicationDeadline, // Now always has a value
    status: "active", // Default status as a valid enum value
    applicantCount: apiJob.applications_count || 0,
    recruiterId: apiJob.recruiter_id || "",
  };
}