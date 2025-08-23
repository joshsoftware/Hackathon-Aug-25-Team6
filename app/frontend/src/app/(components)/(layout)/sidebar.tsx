"use client";

import { cn } from "@/app/(lib)/utils";
import { Button } from "@/app/(components)/ui/button";
import { getCurrentUser } from "@/app/(lib)/auth";
import {
  Briefcase,
  Users,
  FileText,
  BarChart3,
  Plus,
  Search,
  Upload,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const recruiterNavItems = [
  {
    title: "Dashboard",
    href: "/recruiter/dashboard",
    icon: BarChart3,
  },
  {
    title: "Job Openings",
    href: "/recruiter/jobs",
    icon: Briefcase,
  },
  {
    title: "Add Job",
    href: "/recruiter/jobs/new",
    icon: Plus,
  },
  {
    title: "Candidates",
    href: "/recruiter/candidates",
    icon: Users,
  },
  {
    title: "Reports",
    href: "/recruiter/reports",
    icon: FileText,
  },
];

const candidateNavItems = [
  {
    title: "Dashboard",
    href: "/candidate/dashboard",
    icon: Search,
  },
  {
    title: "Job Openings",
    href: "/candidate/jobs",
    icon: Briefcase,
  },
  {
    title: "My Applications",
    href: "/candidate/applications",
    icon: FileText,
  },
  // {
  //   title: "Upload Resume",
  //   href: "/candidate/resume",
  //   icon: Upload,
  // },
  // {
  //   title: "Messages",
  //   href: "/candidate/messages",
  //   icon: MessageSquare,
  // },
];

export function Sidebar() {
  const { user } = getCurrentUser();
  const pathname = usePathname();

  if (!user) return null;

  const navItems =
    user.role === "hr" ? recruiterNavItems : candidateNavItems;

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border">
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  isActive
                    ? "bg-sidebar-primary cursor-pointer text-sidebar-primary-foreground"
                    : "cursor-pointer text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Button>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
