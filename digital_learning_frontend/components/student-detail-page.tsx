"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { NavigationHeader } from "@/components/navigation-header"
import { User, BookOpen, Award, TrendingUp, Clock, CheckCircle } from "lucide-react"

interface StudentDetailPageProps {
  studentId: string
}

export function StudentDetailPage({ studentId }: StudentDetailPageProps) {
  const [loading, setLoading] = useState(false)

  // Mock student data - in real app, fetch based on studentId
  const student = {
    id: studentId,
    name: "Rajesh Kumar",
    email: "rajesh@example.com",
    class: "Class 8A",
    lessonsCompleted: 8,
    totalLessons: 12,
    lastActive: "2 hours ago",
    status: "active" as const,
    achievements: 5,
    averageScore: 85,
    joinedDate: "2024-01-15",
    totalStudyTime: "24 hours",
    streakDays: 7,
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader title="Student Details" showBack={true} backUrl="/teacher" />

      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Student Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold">{student.name}</h1>
                  <p className="text-muted-foreground">{student.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="default">{student.class}</Badge>
                    <Badge variant={student.status === "active" ? "default" : "destructive"}>
                      {student.status === "active" ? "Active" : "Needs Help"}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">
                    {Math.round((student.lessonsCompleted / student.totalLessons) * 100)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Overall Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lessons Completed</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {student.lessonsCompleted}/{student.totalLessons}
                </div>
                <Progress value={(student.lessonsCompleted / student.totalLessons) * 100} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">{student.averageScore}%</div>
                <p className="text-xs text-muted-foreground">Above class average</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Achievements</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">{student.achievements}</div>
                <p className="text-xs text-muted-foreground">Badges earned</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">{student.streakDays}</div>
                <p className="text-xs text-muted-foreground">Days in a row</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    action: "Completed lesson",
                    subject: "Basic Computer Skills",
                    time: "2 hours ago",
                    icon: CheckCircle,
                  },
                  { action: "Earned achievement", subject: "First Week Complete", time: "1 day ago", icon: Award },
                  { action: "Started lesson", subject: "Internet Basics", time: "2 days ago", icon: BookOpen },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <activity.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {activity.action}: {activity.subject}
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
