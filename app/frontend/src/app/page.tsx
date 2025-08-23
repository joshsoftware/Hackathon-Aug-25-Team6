"use client"

import type React from "react"

import { useState } from "react"
import { Users, Building2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/(components)/ui/card"
import { Button } from "@/app/(components)/ui/button"
import { Input } from "@/app/(components)/ui/input"
import { Label } from "@/app/(components)/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/(components)/ui/tabs"
import Link from "next/link"
import { useLogin } from "./signup/query/query"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userType, setUserType] = useState<"candidate" | "hr">("candidate")

  const { loginMutation } = useLogin()

  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    loginMutation({
      email,
      password
    })
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">RecruitIQ</h1>
          <p className="text-muted-foreground">Professional Candidate Pre-screening System</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Access your account to continue with the screening process</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={userType} onValueChange={(value: any) => setUserType(value as "candidate" | "hr")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="candidate" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Candidate
                </TabsTrigger>
                <TabsTrigger value="hr" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Recruiter
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  {`Sign in as ${userType === "candidate" ? "Candidate" : "Recruiter"}`}
                </Button>
              </form>

              <TabsContent value="candidate" className="mt-6">
                <div className="text-sm text-muted-foreground text-center">
                  <p>New candidate? <Link href="/signup" className="text-blue-600 hover:bg-blue-700 hover:text-white"> Create account.</Link></p>
                </div>
              </TabsContent>

              <TabsContent value="hr" className="mt-6">
                <div className="text-sm text-muted-foreground text-center">
                  <p>New Recruiter ?  <Link href="/signup" className="text-blue-600 hover:bg-blue-700 hover:text-white">Create Account.</Link></p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Secure • Professional • Efficient</p>
        </div>
      </div>
    </div>
  )
}