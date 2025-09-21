"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  Target,
  Award,
  AlertTriangle,
  Download,
  Filter,
  Eye,
  ThumbsUp,
  Brain,
  Zap,
  Globe,
  Smartphone,
  Wifi,
  WifiOff,
  Activity,
} from "lucide-react"

interface AnalyticsData {
  totalStudents: number
  activeStudents: number
  completedLessons: number
  averageProgress: number
  engagementRate: number
  offlineUsage: number
  deviceTypes: { mobile: number; tablet: number; desktop: number }
  languagePreference: { en: number; hi: number; pa: number }
}

interface StudentProgress {
  id: string
  name: string
  nameHi: string
  namePa: string
  progress: number
  lessonsCompleted: number
  totalLessons: number
  lastActive: Date
  strugglingAreas: string[]
  achievements: number
  timeSpent: number
}

interface LessonAnalytics {
  id: string
  title: string
  titleHi: string
  titlePa: string
  completionRate: number
  averageScore: number
  timeSpent: number
  dropoffPoint: number
  difficulty: "easy" | "medium" | "hard"
  engagement: number
}

const mockAnalyticsData: AnalyticsData = {
  totalStudents: 156,
  activeStudents: 89,
  completedLessons: 1247,
  averageProgress: 67,
  engagementRate: 78,
  offlineUsage: 45,
  deviceTypes: { mobile: 78, tablet: 15, desktop: 7 },
  languagePreference: { en: 35, hi: 45, pa: 20 },
}

const mockStudentProgress: StudentProgress[] = [
  {
    id: "1",
    name: "Priya Sharma",
    nameHi: "प्रिया शर्मा",
    namePa: "ਪ੍ਰਿਆ ਸ਼ਰਮਾ",
    progress: 85,
    lessonsCompleted: 12,
    totalLessons: 15,
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
    strugglingAreas: ["Math", "Science"],
    achievements: 8,
    timeSpent: 145,
  },
  {
    id: "2",
    name: "Rajesh Kumar",
    nameHi: "राजेश कुमार",
    namePa: "ਰਾਜੇਸ਼ ਕੁਮਾਰ",
    progress: 92,
    lessonsCompleted: 18,
    totalLessons: 20,
    lastActive: new Date(Date.now() - 30 * 60 * 1000),
    strugglingAreas: ["English"],
    achievements: 15,
    timeSpent: 234,
  },
  {
    id: "3",
    name: "Simran Kaur",
    nameHi: "सिमरन कौर",
    namePa: "ਸਿਮਰਨ ਕੌਰ",
    progress: 45,
    lessonsCompleted: 6,
    totalLessons: 15,
    lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000),
    strugglingAreas: ["Digital Literacy", "Math"],
    achievements: 3,
    timeSpent: 67,
  },
  {
    id: "4",
    name: "Arjun Singh",
    nameHi: "अर्जुन सिंह",
    namePa: "ਅਰਜੁਨ ਸਿੰਘ",
    progress: 73,
    lessonsCompleted: 11,
    totalLessons: 15,
    lastActive: new Date(Date.now() - 4 * 60 * 60 * 1000),
    strugglingAreas: ["Science"],
    achievements: 9,
    timeSpent: 189,
  },
]

const mockLessonAnalytics: LessonAnalytics[] = [
  {
    id: "1",
    title: "Basic Computer Skills",
    titleHi: "बुनियादी कंप्यूटर कौशल",
    titlePa: "ਬੁਨਿਆਦੀ ਕੰਪਿਊਟਰ ਹੁਨਰ",
    completionRate: 89,
    averageScore: 85,
    timeSpent: 25,
    dropoffPoint: 15,
    difficulty: "easy",
    engagement: 92,
  },
  {
    id: "2",
    title: "Internet Safety",
    titleHi: "इंटरनेट सुरक्षा",
    titlePa: "ਇੰਟਰਨੈੱਟ ਸੁਰੱਖਿਆ",
    completionRate: 67,
    averageScore: 78,
    timeSpent: 35,
    dropoffPoint: 45,
    difficulty: "medium",
    engagement: 74,
  },
  {
    id: "3",
    title: "Advanced Digital Skills",
    titleHi: "उन्नत डिजिटल कौशल",
    titlePa: "ਉੱਨਤ ਡਿਜੀਟਲ ਹੁਨਰ",
    completionRate: 45,
    averageScore: 72,
    timeSpent: 45,
    dropoffPoint: 65,
    difficulty: "hard",
    engagement: 58,
  },
]

export function AnalyticsReporting() {
  const [language, setLanguage] = useState<"en" | "hi" | "pa">("en")
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter" | "year">("month")
  const [selectedMetric, setSelectedMetric] = useState<"progress" | "engagement" | "completion">("progress")

  const getText = (en: string, hi: string, pa: string) => {
    switch (language) {
      case "hi":
        return hi
      case "pa":
        return pa
      default:
        return en
    }
  }

  const formatTimeSpent = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      return getText("Just now", "अभी", "ਹੁਣੇ")
    } else if (diffInHours < 24) {
      return `${diffInHours} ${getText("hr ago", "घंटे पहले", "ਘੰਟੇ ਪਹਿਲਾਂ")}`
    } else {
      const days = Math.floor(diffInHours / 24)
      return `${days} ${getText("days ago", "दिन पहले", "ਦਿਨ ਪਹਿਲਾਂ")}`
    }
  }

  const getDifficultyColor = (difficulty: LessonAnalytics["difficulty"]) => {
    switch (difficulty) {
      case "easy":
        return "text-success"
      case "medium":
        return "text-warning"
      case "hard":
        return "text-destructive"
      default:
        return "text-muted-foreground"
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-success"
    if (progress >= 60) return "text-warning"
    return "text-destructive"
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-balance">
                  {getText("Analytics & Reporting", "विश्लेषण और रिपोर्टिंग", "ਵਿਸ਼ਲੇਸ਼ਣ ਅਤੇ ਰਿਪੋਰਟਿੰਗ")}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {getText(
                    "Track learning progress and platform insights",
                    "सीखने की प्रगति और प्लेटफॉर्म अंतर्दृष्टि को ट्रैक करें",
                    "ਸਿੱਖਣ ਦੀ ਪ੍ਰਗਤੀ ਅਤੇ ਪਲੇਟਫਾਰਮ ਸੂਝ ਨੂੰ ਟਰੈਕ ਕਰੋ",
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Time Range Selector */}
              <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">{getText("Week", "सप्ताह", "ਹਫ਼ਤਾ")}</SelectItem>
                  <SelectItem value="month">{getText("Month", "महीना", "ਮਹੀਨਾ")}</SelectItem>
                  <SelectItem value="quarter">{getText("Quarter", "तिमाही", "ਤਿਮਾਹੀ")}</SelectItem>
                  <SelectItem value="year">{getText("Year", "साल", "ਸਾਲ")}</SelectItem>
                </SelectContent>
              </Select>

              {/* Language Selector */}
              <div className="flex bg-muted rounded-lg p-1">
                {(["en", "hi", "pa"] as const).map((lang) => (
                  <Button
                    key={lang}
                    variant={language === lang ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setLanguage(lang)}
                    className="text-xs px-3"
                  >
                    {lang === "en" ? "EN" : lang === "hi" ? "हि" : "ਪਾ"}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Key Metrics Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {getText("Active Students", "सक्रिय छात्र", "ਸਰਗਰਮ ਵਿਦਿਆਰਥੀ")}
                  </p>
                  <p className="text-2xl font-bold">
                    {mockAnalyticsData.activeStudents}
                    <span className="text-sm text-muted-foreground">/{mockAnalyticsData.totalStudents}</span>
                  </p>
                  <div className="flex items-center gap-1 text-xs text-success">
                    <TrendingUp className="w-3 h-3" />
                    +12% {getText("vs last month", "पिछले महीने की तुलना में", "ਪਿਛਲੇ ਮਹੀਨੇ ਦੇ ਮੁਕਾਬਲੇ")}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-success/5 to-success/10 border-success/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{getText("Lessons Completed", "पूर्ण पाठ", "ਪੂਰੇ ਪਾਠ")}</p>
                  <p className="text-2xl font-bold">{mockAnalyticsData.completedLessons.toLocaleString()}</p>
                  <div className="flex items-center gap-1 text-xs text-success">
                    <TrendingUp className="w-3 h-3" />
                    +8% {getText("vs last month", "पिछले महीने की तुलना में", "ਪਿਛਲੇ ਮਹੀਨੇ ਦੇ ਮੁਕਾਬਲੇ")}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-warning/5 to-warning/10 border-warning/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-warning/20 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {getText("Average Progress", "औसत प्रगति", "ਔਸਤ ਪ੍ਰਗਤੀ")}
                  </p>
                  <p className="text-2xl font-bold">{mockAnalyticsData.averageProgress}%</p>
                  <div className="flex items-center gap-1 text-xs text-success">
                    <TrendingUp className="w-3 h-3" />
                    +5% {getText("vs last month", "पिछले महीने की तुलना में", "ਪਿਛਲੇ ਮਹੀਨੇ ਦੇ ਮੁਕਾਬਲੇ")}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-info/5 to-info/10 border-info/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-info/20 rounded-lg flex items-center justify-center">
                  <ThumbsUp className="w-5 h-5 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {getText("Engagement Rate", "सहभागिता दर", "ਸਹਿਭਾਗਤਾ ਦਰ")}
                  </p>
                  <p className="text-2xl font-bold">{mockAnalyticsData.engagementRate}%</p>
                  <div className="flex items-center gap-1 text-xs text-success">
                    <TrendingUp className="w-3 h-3" />
                    +3% {getText("vs last month", "पिछले महीने की तुलना में", "ਪਿਛਲੇ ਮਹੀਨੇ ਦੇ ਮੁਕਾਬਲੇ")}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Insights */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                {getText("Device Usage", "डिवाइस उपयोग", "ਡਿਵਾਈਸ ਵਰਤੋਂ")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{getText("Mobile", "मोबाइल", "ਮੋਬਾਈਲ")}</span>
                  <span className="font-semibold">{mockAnalyticsData.deviceTypes.mobile}%</span>
                </div>
                <Progress value={mockAnalyticsData.deviceTypes.mobile} className="h-2" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{getText("Tablet", "टैबलेट", "ਟੈਬਲੇਟ")}</span>
                  <span className="font-semibold">{mockAnalyticsData.deviceTypes.tablet}%</span>
                </div>
                <Progress value={mockAnalyticsData.deviceTypes.tablet} className="h-2" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{getText("Desktop", "डेस्कटॉप", "ਡੈਸਕਟਾਪ")}</span>
                  <span className="font-semibold">{mockAnalyticsData.deviceTypes.desktop}%</span>
                </div>
                <Progress value={mockAnalyticsData.deviceTypes.desktop} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                {getText("Language Preference", "भाषा प्राथमिकता", "ਭਾਸ਼ਾ ਤਰਜੀਹ")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{getText("Hindi", "हिंदी", "ਹਿੱਸੇਦਾਰਾਂ ਲਈ ਵਿਆਪਕ ਰਿਪੋਰਟ")}</span>
                  <span className="font-semibold">{mockAnalyticsData.languagePreference.hi}%</span>
                </div>
                <Progress value={mockAnalyticsData.languagePreference.hi} className="h-2" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{getText("English", "अंग्रेजी", "ਅੰਗਰੇਜ਼ੀ")}</span>
                  <span className="font-semibold">{mockAnalyticsData.languagePreference.en}%</span>
                </div>
                <Progress value={mockAnalyticsData.languagePreference.en} className="h-2" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{getText("Punjabi", "पंजाबी", "ਪੰਜਾਬੀ")}</span>
                  <span className="font-semibold">{mockAnalyticsData.languagePreference.pa}%</span>
                </div>
                <Progress value={mockAnalyticsData.languagePreference.pa} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <WifiOff className="w-5 h-5" />
                {getText("Offline Usage", "ऑफलाइन उपयोग", "ਆਫਲਾਈਨ ਵਰਤੋਂ")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{mockAnalyticsData.offlineUsage}%</div>
                <p className="text-sm text-muted-foreground">
                  {getText("of learning happens offline", "सीखना ऑफलाइन होता है", "ਸਿੱਖਣਾ ਆਫਲਾਈਨ ਹੁੰਦਾ ਹੈ")}
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Wifi className="w-4 h-4" />
                <span>
                  {100 - mockAnalyticsData.offlineUsage}% {getText("online", "ऑनलाइन", "ਆਨਲਾਈਨ")}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="students">{getText("Student Progress", "छात्र प्रगति", "ਵਿਦਿਆਰਥੀ ਪ੍ਰਗਤੀ")}</TabsTrigger>
            <TabsTrigger value="lessons">{getText("Lesson Analytics", "पाठ विश्लेषण", "ਪਾਠ ਵਿਸ਼ਲੇਸ਼ਣ")}</TabsTrigger>
            <TabsTrigger value="reports">{getText("Reports", "रिपोर्ट", "ਰਿਪੋਰਟ")}</TabsTrigger>
          </TabsList>

          {/* Student Progress Tab */}
          <TabsContent value="students" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {getText("Individual Student Progress", "व्यक्तिगत छात्र प्रगति", "ਵਿਅਕਤੀਗਤ ਵਿਦਿਆਰਥੀ ਪ੍ਰਗਤੀ")}
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Filter className="w-4 h-4" />
                  {getText("Filter", "फ़िल्टर", "ਫਿਲਟਰ")}
                </Button>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Download className="w-4 h-4" />
                  {getText("Export", "निर्यात", "ਨਿਰਯਾਤ")}
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {mockStudentProgress.map((student) => (
                <Card key={student.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="font-semibold text-primary">
                            {getText(student.name, student.nameHi, student.namePa)
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-semibold text-balance">
                            {getText(student.name, student.nameHi, student.namePa)}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>
                              {student.lessonsCompleted}/{student.totalLessons} {getText("lessons", "पाठ", "ਪਾਠ")}
                            </span>
                            <span>•</span>
                            <span>
                              {formatTimeSpent(student.timeSpent)} {getText("spent", "बिताया", "ਬਿਤਾਇਆ")}
                            </span>
                            <span>•</span>
                            <span>{formatTimeAgo(student.lastActive)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className={`text-lg font-bold ${getProgressColor(student.progress)}`}>
                            {student.progress}%
                          </div>
                          <div className="text-xs text-muted-foreground">{getText("Progress", "प्रगति", "ਪ੍ਰਗਤੀ")}</div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-accent">
                            <Award className="w-4 h-4" />
                            <span className="font-semibold">{student.achievements}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">{getText("Badges", "बैज", "ਬੈਜ")}</div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <Progress value={student.progress} className="h-2" />
                      {student.strugglingAreas.length > 0 && (
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-warning" />
                          <span className="text-sm text-muted-foreground">
                            {getText("Struggling with:", "संघर्ष कर रहा है:", "ਸੰਘਰਸ਼ ਕਰ ਰਿਹਾ ਹੈ:")}{" "}
                            {student.strugglingAreas.join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Lesson Analytics Tab */}
          <TabsContent value="lessons" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {getText("Lesson Performance Analytics", "पाठ प्रदर्शन विश्लेषण", "ਪਾਠ ਪ੍ਰਦਰਸ਼ਨ ਵਿਸ਼ਲੇਸ਼ਣ")}
              </h2>
              <Select value={selectedMetric} onValueChange={(value: any) => setSelectedMetric(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="progress">{getText("Progress", "प्रगति", "ਪ੍ਰਗਤੀ")}</SelectItem>
                  <SelectItem value="engagement">{getText("Engagement", "सहभागिता", "ਸਹਿਭਾਗਤਾ")}</SelectItem>
                  <SelectItem value="completion">{getText("Completion", "पूर्णता", "ਪੂਰਨਤਾ")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4">
              {mockLessonAnalytics.map((lesson) => (
                <Card key={lesson.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-semibold text-balance">
                            {getText(lesson.title, lesson.titleHi, lesson.titlePa)}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <Badge
                              variant={
                                lesson.difficulty === "easy"
                                  ? "secondary"
                                  : lesson.difficulty === "medium"
                                    ? "default"
                                    : "destructive"
                              }
                              className="text-xs"
                            >
                              {lesson.difficulty === "easy"
                                ? getText("Easy", "आसान", "ਆਸਾਨ")
                                : lesson.difficulty === "medium"
                                  ? getText("Medium", "मध्यम", "ਮੱਧਮ")
                                  : getText("Hard", "कठिन", "ਔਖਾ")}
                            </Badge>
                            <span>•</span>
                            <span>
                              {formatTimeSpent(lesson.timeSpent)} {getText("avg time", "औसत समय", "ਔਸਤ ਸਮਾਂ")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-lg font-bold text-success">{lesson.completionRate}%</div>
                          <div className="text-xs text-muted-foreground">{getText("Completion", "पूर्णता", "ਪੂਰਨਤਾ")}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-primary">{lesson.averageScore}%</div>
                          <div className="text-xs text-muted-foreground">
                            {getText("Avg Score", "औसत स्कोर", "ਔਸਤ ਸਕੋਰ")}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-info">{lesson.engagement}%</div>
                          <div className="text-xs text-muted-foreground">
                            {getText("Engagement", "सहभागिता", "ਸਹਿਭਾਗਤਾ")}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {getText("Completion Rate", "पूर्णता दर", "ਪੂਰਨਤਾ ਦਰ")}
                        </span>
                        <span className="font-medium">{lesson.completionRate}%</span>
                      </div>
                      <Progress value={lesson.completionRate} className="h-2" />
                      {lesson.dropoffPoint > 50 && (
                        <div className="flex items-center gap-2 text-warning">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-sm">
                            {getText(
                              `High dropout at ${lesson.dropoffPoint}% mark`,
                              `${lesson.dropoffPoint}% पर उच्च ड्रॉपआउट`,
                              `${lesson.dropoffPoint}% 'ਤੇ ਉੱਚ ਛੱਡਣਾ`,
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">{getText("Comprehensive Reports", "व्यापक रिपोर्ट", "ਵਿਆਪਕ ਰਿਪੋਰਟ")}</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                {getText(
                  "Generate detailed reports for stakeholders and administrators",
                  "हितधारकों और प्रशासकों के लिए विस्तृत रिपोर्ट तैयार करें",
                  "ਹਿੱਸੇਦਾਰਾਂ ਅਤੇ ਪ੍ਰਸ਼ਾਸਕਾਂ ਲਈ ਵਿਸਤ੍ਰਿਤ ਰਿਪੋਰਟ ਤਿਆਰ ਕਰੋ",
                )}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Student Progress Report",
                  titleHi: "छात्र प्रगति रिपोर्ट",
                  titlePa: "ਵਿਦਿਆਰਥੀ ਪ੍ਰਗਤੀ ਰਿਪੋਰਟ",
                  description: "Individual and class-wise progress analysis",
                  descriptionHi: "व्यक्तिगत और कक्षा-वार प्रगति विश्लेषण",
                  descriptionPa: "ਵਿਅਕਤੀਗਤ ਅਤੇ ਕਲਾਸ-ਵਾਰ ਪ੍ਰਗਤੀ ਵਿਸ਼ਲੇਸ਼ਣ",
                  icon: <Users className="w-6 h-6" />,
                  color: "bg-blue-500",
                },
                {
                  title: "Learning Outcomes",
                  titleHi: "सीखने के परिणाम",
                  titlePa: "ਸਿੱਖਣ ਦੇ ਨਤੀਜੇ",
                  description: "Achievement and competency tracking",
                  descriptionHi: "उपलब्धि और दक्षता ट्रैकिंग",
                  descriptionPa: "ਪ੍ਰਾਪਤੀ ਅਤੇ ਯੋਗਤਾ ਟਰੈਕਿੰਗ",
                  icon: <Target className="w-6 h-6" />,
                  color: "bg-green-500",
                },
                {
                  title: "Platform Usage",
                  titleHi: "प्लेटफॉर्म उपयोग",
                  titlePa: "ਪਲੇਟਫਾਰਮ ਵਰਤੋਂ",
                  description: "Device, time, and engagement metrics",
                  descriptionHi: "डिवाइस, समय और सहभागिता मेट्रिक्स",
                  descriptionPa: "ਡਿਵਾਈਸ, ਸਮਾਂ ਅਤੇ ਸਹਿਭਾਗਤਾ ਮੈਟ੍ਰਿਕਸ",
                  icon: <Activity className="w-6 h-6" />,
                  color: "bg-purple-500",
                },
                {
                  title: "Content Effectiveness",
                  titleHi: "सामग्री प्रभावशीलता",
                  titlePa: "ਸਮੱਗਰੀ ਪ੍ਰਭਾਵਸ਼ੀਲਤਾ",
                  description: "Lesson performance and improvement areas",
                  descriptionHi: "पाठ प्रदर्शन और सुधार क्षेत्र",
                  descriptionPa: "ਪਾਠ ਪ੍ਰਦਰਸ਼ਨ ਅਤੇ ਸੁਧਾਰ ਖੇਤਰ",
                  icon: <Brain className="w-6 h-6" />,
                  color: "bg-orange-500",
                },
                {
                  title: "Digital Literacy Impact",
                  titleHi: "डिजिटल साक्षरता प्रभाव",
                  titlePa: "ਡਿਜੀਟਲ ਸਾਖਰਤਾ ਪ੍ਰਭਾਵ",
                  description: "Skills development and confidence metrics",
                  descriptionHi: "कौशल विकास और आत्मविश्वास मेट्रिक्स",
                  descriptionPa: "ਹੁਨਰ ਵਿਕਾਸ ਅਤੇ ਆਤਮਵਿਸ਼ਵਾਸ ਮੈਟ੍ਰਿਕਸ",
                  icon: <Zap className="w-6 h-6" />,
                  color: "bg-teal-500",
                },
                {
                  title: "Offline Learning",
                  titleHi: "ऑफलाइन सीखना",
                  titlePa: "ਆਫਲਾਈਨ ਸਿੱਖਣਾ",
                  description: "Rural connectivity and offline usage patterns",
                  descriptionHi: "ग्रामीण कनेक्टिविटी और ऑफलाइन उपयोग पैटर्न",
                  descriptionPa: "ਪੇਂਡੂ ਕਨੈਕਟਿਵਿਟੀ ਅਤੇ ਆਫਲਾਈਨ ਵਰਤੋਂ ਪੈਟਰਨ",
                  icon: <WifiOff className="w-6 h-6" />,
                  color: "bg-red-500",
                },
              ].map((report, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className={`w-12 h-12 ${report.color} rounded-xl flex items-center justify-center text-white`}
                      >
                        {report.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-balance">
                          {getText(report.title, report.titleHi, report.titlePa)}
                        </h3>
                        <p className="text-sm text-muted-foreground text-pretty">
                          {getText(report.description, report.descriptionHi, report.descriptionPa)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 gap-2">
                        <Eye className="w-4 h-4" />
                        {getText("View", "देखें", "ਵੇਖੋ")}
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                        <Download className="w-4 h-4" />
                        {getText("Export", "निर्यात", "ਨਿਰਯਾਤ")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
