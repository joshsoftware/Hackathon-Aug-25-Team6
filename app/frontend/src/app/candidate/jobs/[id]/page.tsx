import { DashboardLayout } from "@/app/(components)/(layout)/dashboard-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/(components)/ui/card";
import { Button } from "@/app/(components)/ui/button";
import { Badge } from "@/app/(components)/ui/badge";
import { Separator } from "@/app/(components)/ui/separator";
import { mockJobs } from "@/app/(lib)/mock-data";
import {
  MapPin,
  DollarSign,
  Calendar,
  Building2,
  Clock,
  Users,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface JobDetailPageProps {
  params: {
    id: string;
  };
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const job = mockJobs.find((j) => j.id === params.id);

  if (!job) {
    notFound();
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">
                {job.title}
              </h1>
              <div className="flex items-center gap-2 text-lg text-muted-foreground">
                <Building2 className="h-5 w-5" />
                {job.company}
              </div>
            </div>
            <Badge
              variant={job.status === "active" ? "default" : "secondary"}
              className="text-sm"
            >
              {job.status}
            </Badge>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {job.location}
            </div>
            {job.salary && (
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />$
                {job.salary.min.toLocaleString()} - $
                {job.salary.max.toLocaleString()} {job.salary.currency}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {job.type}
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {job.applicantCount} applicants
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Apply by {new Date(job.applicationDeadline).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Apply Button */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">
                  Ready to apply?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Upload your resume and complete our pre-screening questions
                </p>
              </div>
              <Link href={`/candidate/jobs/${job.id}/apply`}>
                <Button size="lg" className="px-8">
                  Apply Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {job.description}
                </p>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {job.requirements.map((requirement, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <p className="text-muted-foreground">{requirement}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Skills & Qualifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">
                    Must-have Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {job.mustHaveSkills.map((skill) => (
                      <Badge key={skill} variant="default">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {job.goodToHaveSkills.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="font-medium text-foreground">
                        Good-to-have Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {job.goodToHaveSkills.map((skill) => (
                          <Badge key={skill} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/candidate/jobs/${job.id}/apply`}>
                  <Button className="w-full">Apply for this Job</Button>
                </Link>
                <Button variant="outline" className="w-full bg-transparent">
                  Save Job
                </Button>
                <Button variant="ghost" className="w-full">
                  Share Job
                </Button>
              </CardContent>
            </Card>

            {/* Job Details */}
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-foreground">
                    Posted Date
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(job.postedDate).toLocaleDateString()}
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="text-sm font-medium text-foreground">
                    Application Deadline
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(job.applicationDeadline).toLocaleDateString()}
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="text-sm font-medium text-foreground">
                    Job Type
                  </div>
                  <Badge variant="secondary">{job.type}</Badge>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="text-sm font-medium text-foreground">
                    Applicants
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {job.applicantCount} candidates applied
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Similar Jobs */}
            <Card>
              <CardHeader>
                <CardTitle>Similar Jobs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockJobs
                  .filter((j) => j.id !== job.id && j.status === "active")
                  .slice(0, 2)
                  .map((similarJob) => (
                    <Link
                      key={similarJob.id}
                      href={`/candidate/jobs/${similarJob.id}`}
                    >
                      <div className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                        <h4 className="font-medium text-sm text-foreground">
                          {similarJob.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {similarJob.company}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {similarJob.location}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
