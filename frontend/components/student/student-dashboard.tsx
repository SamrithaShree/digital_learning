"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "../../lib/hooks/use-toast"
import {
  BookOpen,
  Trophy,
  Star,
  Play,
  CheckCircle,
  Clock,
  Wifi,
  WifiOff,
  User,
  Award,
  Target,
  Download,
  HelpCircle,
  LogOut,
  Monitor,
  Code,
  Brain,
  ArrowRight,
  TrendingUp,
} from "lucide-react"

// Real backend interfaces
interface QuizAttempt {
  id: number;
  quiz: {
    id: number;
    name: string;
  };
  score: number;
  completed_at: string;
  attempt_number: number;
}

interface StudentBadge {
  id: number;
  badge: {
    id: number;
    name: string;
    description: string;
    icon: string;
  };
  earned_at: string;
}

interface StudentProgress {
  total_quizzes: number;
  completed_quizzes: number;
  average_score: number;
  recent_attempts: QuizAttempt[];
  badges: StudentBadge[];
}

// Learning modules interface
interface LearningModule {
  id: string;
  title: string;
  titleHi: string;
  titlePa: string;
  description: string;
  descriptionHi: string;
  descriptionPa: string;
  icon: React.ReactNode;
  color: string;
  path: string;
  completed: boolean;
  progress: number;
}

export function StudentDashboard() {
  const [language, setLanguage] = useState<"en" | "hi" | "pa">("en")
  const [isOffline, setIsOffline] = useState(false)
  const [loading, setLoading] = useState(true)
  const [studentProgress, setStudentProgress] = useState<StudentProgress | null>(null)
  const [currentStudent, setCurrentStudent] = useState<any>(null)
  
  const { toast } = useToast()
  const router = useRouter()

  // Learning modules data
  const learningModules: LearningModule[] = [
    {
      id: "digital-literacy",
      title: "Digital Literacy",
      titleHi: "डिजिटल साक्षरता",
      titlePa: "ਡਿਜੀਟਲ ਸਾਖਰਤਾ",
      description: "Learn essential digital skills and computer basics",
      descriptionHi: "आवश्यक डिजिटल कौशल और कंप्यूटर की बुनियादी बातें सीखें",
      descriptionPa: "ਜ਼ਰੂਰੀ ਡਿਜੀਟਲ ਹੁਨਰ ਅਤੇ ਕੰਪਿਊਟਰ ਦੀਆਂ ਬੁਨਿਆਦੀ ਗੱਲਾਂ ਸਿੱਖੋ",
      icon: <Monitor className="w-8 h-8" />,
      color: "from-blue-500 to-cyan-500",
      path: "/student/lessons/digital-literacy",
      completed: false,
      progress: 0
    },
    {
      id: "stem-languages",
      title: "STEM Languages",
      titleHi: "STEM भाषाएं",
      titlePa: "STEM ਭਾਸ਼ਾਵਾਂ",
      description: "Explore programming and technical languages",
      descriptionHi: "प्रोग्रामिंग और तकनीकी भाषाओं का अन्वेषण करें",
      descriptionPa: "ਪ੍ਰੋਗਰਾਮਿੰਗ ਅਤੇ ਤਕਨੀਕੀ ਭਾਸ਼ਾਵਾਂ ਦੀ ਖੋਜ ਕਰੋ",
      icon: <Code className="w-8 h-8" />,
      color: "from-green-500 to-emerald-500",
      path: "/student/stem-learning",
      completed: false,
      progress: 0
    },
    {
      id: "quiz-center",
      title: "Quiz Center",
      titleHi: "प्रश्नोत्तरी केंद्र",
      titlePa: "ਕਵਿਜ਼ ਕੇਂਦਰ",
      description: "Test your knowledge with interactive quizzes",
      descriptionHi: "इंटरैक्टिव प्रश्नोत्तरी के साथ अपने ज्ञान का परीक्षण करें",
      descriptionPa: "ਇੰਟਰਐਕਟਿਵ ਕਵਿਜ਼ਾਂ ਨਾਲ ਆਪਣੇ ਗਿਆਨ ਦੀ ਜਾਂਚ ਕਰੋ",
      icon: <Brain className="w-8 h-8" />,
      color: "from-purple-500 to-pink-500",
      path: "/student/quiz-center/",
      completed: false,
      progress: 0
    }
  ]

  useEffect(() => {
    fetchStudentData()
    checkOnlineStatus()
    
    // Online/offline listeners
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const checkOnlineStatus = () => {
    setIsOffline(!navigator.onLine)
  }

  const fetchStudentData = async () => {
    try {
      setLoading(true)
      
      // Get current student info
      const userInfo = localStorage.getItem('user_info')
      if (userInfo) {
        setCurrentStudent(JSON.parse(userInfo))
      }
      
      // Fetch student progress from backend
      const response = await api.get('/my-progress/')
      setStudentProgress(response.data)
      
    } catch (error) {
      console.error("Failed to fetch student data:", error)
      toast({
        title: "Error",
        description: "Could not load your progress data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    setLoading(true)
    try {
      await api.post('/auth/logout/')
      localStorage.removeItem('token')
      localStorage.removeItem('user_info')
      localStorage.removeItem('role')
      toast({ 
        title: "Logged Out Successfully", 
        description: "You have been securely logged out." 
      })
      router.push('/get-started')
    } catch (error) {
      console.error("Logout error:", error)
      // Force logout even if API fails
      localStorage.clear()
      toast({ 
        title: "Logged Out", 
        description: "Session ended successfully." 
      })
      router.push('/get-started')
    } finally {
      setLoading(false)
    }
  }

  const handleModuleClick = (module: LearningModule) => {
    toast({
      title: getText("Loading Module...", "मॉड्यूल लोड हो रहा है...", "ਮਾਡਿਊਲ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ..."),
      description: getText(module.title, module.titleHi, module.titlePa),
    })

    setTimeout(() => {
      router.push(module.path)
    }, 500)
  }

  const handleViewProfile = () => {
    toast({
      title: getText("Opening Profile...", "प्रोफ़ाइल खोला जा रहा है...", "ਪ੍ਰੋਫਾਈਲ ਖੋਲਿਆ ਜਾ ਰਿਹਾ ਹੈ..."),
      description: getText("View your learning progress.", "अपनी सीखने की प्रगति देखें।", "ਆਪਣੀ ਸਿੱਖਣ ਦੀ ਤਰੱਕੀ ਵੇਖੋ।"),
    })

    setTimeout(() => {
      router.push('/student/profile')  // Redirect to student profile, not login
    }, 1000)
  }

  const handleTakeQuiz = () => {
    toast({
      title: getText("Quiz Center", "प्रश्नोत्तरी केंद्र", "ਕਵਿਜ਼ ਕੇਂਦਰ"),
      description: getText("Opening quiz selection...", "प्रश्नोत्तरी चयन खोला जा रहा है...", "ਕਵਿਜ਼ ਚੋਣ ਖੋਲੀ ਜਾ ਰਹੀ ਹੈ..."),
    })

    setTimeout(() => {
      router.push('/quizzes')
    }, 1000)
  }

  const handleHelp = () => {
    toast({
      title: getText("Help Center", "सहायता केंद्र", "ਮਦਦ ਕੇਂਦਰ"),
      description: getText(
        "Get assistance with your learning.",
        "अपनी सीखने में सहायता प्राप्त करें।",
        "ਆਪਣੀ ਸਿੱਖਣ ਵਿੱਚ ਸਹਾਇਤਾ ਪ੍ਰਾਪਤ ਕਰੋ।",
      ),
    })

    setTimeout(() => {
      router.push('/help')
    }, 1000)
  }

  const getText = (en: string, hi: string, pa: string) => {
    return language === "hi" ? hi : language === "pa" ? pa : en
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">
            {getText("Loading your learning hub...", "आपका शिक्षा केंद्र लोड हो रहा है...", "ਤੁਹਾਡਾ ਸਿੱਖਣ ਕੇਂਦਰ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...")}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-balance">
                  {getText("Learning Hub", "शिक्षा केंद्र", "ਸਿੱਖਣ ਕੇਂਦਰ")}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {getText("Your personalized learning journey", "आपकी व्यक्तिगत शिक्षा यात्रा", "ਤੁਹਾਡੀ ਵਿਅਕਤੀਗਤ ਸਿੱਖਣ ਯਾਤਰਾ")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
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

              {/* Offline Status */}
              <div className="flex items-center gap-2">
                {isOffline ? (
                  <WifiOff className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Wifi className="w-4 h-4 text-success" />
                )}
                <span className="text-xs text-muted-foreground">
                  {isOffline ? getText("Offline", "ऑफ़लाइन", "ਔਫਲਾਈਨ") : getText("Online", "ऑनलाइन", "ਔਨਲਾਈਨ")}
                </span>
              </div>

              {/* Profile + Logout (matching teacher dashboard style) */}
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="gap-2" onClick={handleViewProfile}>
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{getText("Profile", "प्रोफ़ाइल", "ਪ੍ਰੋਫਾਈਲ")}</span>
                </Button>
                
                {/* Logout Button (exact same style as teacher dashboard) */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10" 
                  onClick={handleLogout}
                  disabled={loading}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {loading ? getText("Logging out...", "लॉगआउट हो रहा है...", "ਲਾਗਆਊਟ ਹੋ ਰਿਹਾ ਹੈ...") : getText("Logout", "लॉगआउट", "ਲਾਗਆਊਟ")}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
            <Star className="w-4 h-4" />
            {getText(
              `Welcome back${currentStudent?.user?.first_name ? `, ${currentStudent.user.first_name}` : ''}!`,
              `वापस स्वागत है${currentStudent?.user?.first_name ? `, ${currentStudent.user.first_name}` : ''}!`,
              `ਵਾਪਸ ਜੀ ਆਇਆਂ ਨੂੰ${currentStudent?.user?.first_name ? `, ${currentStudent.user.first_name}` : ''}!`
            )}
          </div>
          <h2 className="text-2xl font-bold text-balance">
            {getText("Continue Your Learning Journey", "अपनी सीखने की यात्रा जारी रखें", "ਆਪਣੀ ਸਿੱਖਣ ਦੀ ਯਾਤਰਾ ਜਾਰੀ ਰੱਖੋ")}
          </h2>
        </div>

        {/* Progress Overview (Real Data) */}
        {studentProgress && (
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                {getText("Your Progress", "आपकी प्रगति", "ਤੁਹਾਡੀ ਤਰੱਕੀ")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{studentProgress.completed_quizzes}</div>
                  <div className="text-sm text-muted-foreground">
                    {getText("Quizzes Completed", "पूरी की गई प्रश्नोत्तरी", "ਪੂਰੀ ਕੀਤੀ ਕਵਿਜ਼")}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">{Math.round(studentProgress.average_score)}%</div>
                  <div className="text-sm text-muted-foreground">
                    {getText("Average Score", "औसत स्कोर", "ਔਸਤ ਸਕੋਰ")}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">{studentProgress.badges.length}</div>
                  <div className="text-sm text-muted-foreground">
                    {getText("Badges Earned", "अर्जित बैज", "ਪ੍ਰਾਪਤ ਬੈਜ")}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {getText("Overall Progress", "कुल प्रगति", "ਕੁੱਲ ਤਰੱਕੀ")}
                </span>
                <div className="flex items-center gap-1 text-primary">
                  <TrendingUp className="w-4 h-4" />
                  <span>{Math.round((studentProgress.completed_quizzes / Math.max(studentProgress.total_quizzes, 1)) * 100)}%</span>
                </div>
              </div>
              <Progress value={(studentProgress.completed_quizzes / Math.max(studentProgress.total_quizzes, 1)) * 100} className="h-3" />
            </CardContent>
          </Card>
        )}

        {/* Learning Modules (Main Navigation) */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            {getText("Learning Modules", "शिक्षा मॉड्यूल", "ਸਿੱਖਣ ਮਾਡਿਊਲ")}
          </h3>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {learningModules.map((module) => (
              <Card
                key={module.id}
                className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 overflow-hidden"
                onClick={() => handleModuleClick(module)}
              >
                <div className={`h-2 bg-gradient-to-r ${module.color}`}></div>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r ${module.color} text-white`}>
                        {module.icon}
                      </div>
                      <CardTitle className="text-base text-balance">
                        {getText(module.title, module.titleHi, module.titlePa)}
                      </CardTitle>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-4 text-pretty">
                    {getText(module.description, module.descriptionHi, module.descriptionPa)}
                  </p>
                  <Button size="sm" className="w-full">
                    {getText("Start Learning", "सीखना शुरू करें", "ਸਿੱਖਣਾ ਸ਼ੁਰੂ ਕਰੋ")}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Achievements (Real Data) */}
        {studentProgress && studentProgress.badges.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Award className="w-5 h-5 text-accent" />
              {getText("Recent Achievements", "हाल की उपलब्धियां", "ਹਾਲ ਦੀਆਂ ਪ੍ਰਾਪਤੀਆਂ")}
            </h3>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {studentProgress.badges.slice(0, 6).map((badge) => (
                <Card key={badge.id} className="bg-accent/5 border-accent/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{badge.badge.icon || '🏆'}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-balance">
                          {badge.badge.name}
                        </h4>
                        <p className="text-xs text-muted-foreground text-pretty">
                          {badge.badge.description}
                        </p>
                        <p className="text-xs text-accent mt-1">
                          {getText("Earned", "अर्जित", "ਪ੍ਰਾਪਤ")}: {new Date(badge.earned_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{getText("Quick Actions", "त्वरित कार्य", "ਤੇਜ਼ ਕਾਰਵਾਈਆਂ")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Button
                variant="outline"
                className="justify-start gap-2 h-auto p-4 bg-transparent"
                onClick={handleTakeQuiz}
              >
                <Trophy className="w-4 h-4 text-warning" />
                <div className="text-left">
                  <div className="font-medium text-sm">{getText("Take Quiz", "प्रश्नोत्तरी लें", "ਕਵਿਜ਼ ਲਓ")}</div>
                  <div className="text-xs text-muted-foreground">
                    {getText("Test your knowledge", "अपने ज्ञान का परीक्षण करें", "ਆਪਣੇ ਗਿਆਨ ਦੀ ਜਾਂਚ ਕਰੋ")}
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start gap-2 h-auto p-4 bg-transparent"
                onClick={handleViewProfile}
              >
                <User className="w-4 h-4 text-accent" />
                <div className="text-left">
                  <div className="font-medium text-sm">{getText("View Profile", "प्रोफ़ाइल देखें", "ਪ੍ਰੋਫਾਈਲ ਵੇਖੋ")}</div>
                  <div className="text-xs text-muted-foreground">
                    {getText("Track progress", "प्रगति ट्रैक करें", "ਤਰੱਕੀ ਦਾ ਪਤਾ ਲਗਾਓ")}
                  </div>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="justify-start gap-2 h-auto p-4 bg-transparent" 
                onClick={handleHelp}
              >
                <HelpCircle className="w-4 h-4 text-primary" />
                <div className="text-left">
                  <div className="font-medium text-sm">
                    {getText("Help & Support", "सहायता और समर्थन", "ਮਦਦ ਅਤੇ ਸਹਾਇਤਾ")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {getText("Get assistance", "सहायता प्राप्त करें", "ਸਹਾਇਤਾ ਪ੍ਰਾਪਤ ਕਰੋ")}
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
