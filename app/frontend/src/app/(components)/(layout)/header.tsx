"use client";

import { Button } from "@/app/(components)/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/(components)/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/(components)/ui/dropdown-menu";
import { getCurrentUser } from "@/app/(lib)/auth";
import { LogOut, Settings, User } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export function Header() {
  const { user, authToken } = getCurrentUser();
  const router = useRouter()
  // const { logoutMutation } = useLogout(); // Use logout mutation

   const logoutApplication = () => {
    router.push('/')
    localStorage.clear();
    toast.success("Logged out successfully");
    
   }
  
  // If no user or no token, don't render the header
  if (!user || !authToken) return null;

  return (
    <header className="border-b border-border bg-card">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-foreground">
            RecruitIQ
          </h1>
          <div className="text-sm text-muted-foreground">
            {user.role === "hr"
              ? "Recruiter Portal"
              : "Candidate Portal"}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={user.avatar || "/placeholder.svg"}
                  alt={user.name}
                />
                <AvatarFallback>
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            
            <DropdownMenuItem onClick={() => logoutApplication()}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}