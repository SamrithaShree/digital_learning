"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, GraduationCap, ArrowRight, Star, Globe, Wifi } from "lucide-react"

export function GetStartedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 text-center space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
            <Star className="w-4 h-4" />
            Welcome to Digital Learning
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-balance">
            Learn Digital Skills
            <span className="text-primary block">Anytime, Anywhere</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Empowering rural students and teachers with offline-first digital literacy education in local languages.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center space-y-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                <Wifi className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold">Offline Learning</h3>
              <p className="text-sm text-muted-foreground">Download lessons and learn without internet connection</p>
            </CardContent>
          </Card>

          <Card className="border-secondary/20 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center space-y-3">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto">
                <Globe className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold">Local Languages</h3>
              <p className="text-sm text-muted-foreground">Learn in English, Hindi, or Punjabi - your choice</p>
            </CardContent>
          </Card>

          <Card className="border-accent/20 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center space-y-3">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto">
                <GraduationCap className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold">Interactive Learning</h3>
              <p className="text-sm text-muted-foreground">Gamified lessons with achievements and progress tracking</p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Choose Your Learning Path</h2>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-primary/20">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">I'm a Student</CardTitle>
                <p className="text-muted-foreground">Start learning digital skills at your own pace</p>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="w-full gap-2" onClick={() => (window.location.href = "/auth/student")}>
                  Get Started Learning
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-secondary/20">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-secondary" />
                </div>
                <CardTitle className="text-xl">I'm a Teacher</CardTitle>
                <p className="text-muted-foreground">Manage students and track their learning progress</p>
              </CardHeader>
              <CardContent className="text-center">
                <Button
                  variant="secondary"
                  className="w-full gap-2"
                  onClick={() => (window.location.href = "/auth/teacher")}
                >
                  Start Teaching
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
