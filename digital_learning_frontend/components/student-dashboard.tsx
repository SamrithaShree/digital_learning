"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
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
} from "lucide-react"

interface Quiz {
  id: number
  name: string
  subject: string
  questions: any[]
}

export function StudentDashboard() {
  const [language, setLanguage] = useState<"en" | "hi" | "pa">("en")
  const [isOffline, setIsOffline] = useState(false)
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await api.get('/quizzes/');
        setQuizzes(response.data.quizzes);
      } catch (error) {
        console.error("Failed to fetch quizzes:", error)
        toast({
          title: "Error",
          description: "Failed to load quizzes. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchQuizzes();

    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const handleQuizAction = (quizId: number) => {
    router.push(`/quiz/${quizId}`);
  }

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading your learning dashboard...</p>
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
                  {getText("Digital Learning", "डिजिटल शिक्षा", "ਡਿਜੀਟਲ ਸਿੱਖਿਆ")}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {getText("Learn at your own pace", "अपनी गति से सीखें", "ਆਪਣੀ ਰਫਤਾਰ ਨਾਲ ਸਿੱਖੋ")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
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
              <Button variant="ghost" size="sm" className="gap-2" onClick={() => router.push("/profile")}>
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{getText("Profile", "प्रोफ़ाइल", "ਪ੍ਰੋਫਾਈਲ")}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
            <Star className="w-4 h-4" />
            {getText("Welcome back!", "वापस स्वागत है!", "ਵਾਪਸ ਜੀ ਆਇਆਂ ਨੂੰ!")}
          </div>
          <h2 className="text-2xl font-bold text-balance">
            {getText("Test Your Knowledge", "अपने ज्ञान का परीक्षण करें", "ਆਪਣੇ ਗਿਆਨ ਦੀ ਜਾਂਚ ਕਰੋ")}
          </h2>
        </div>

        {/* Quizzes Grid */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            {getText("Available Quizzes", "उपलब्ध क्विज़", "ਉਪਲਬਧ ਕਵਿਜ਼")}
          </h3>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <Card
                key={quiz.id}
                className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 hover:border-primary/50"
                onClick={() => handleQuizAction(quiz.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-base text-balance">{quiz.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs">{quiz.subject}</Badge>
                    </div>
                    <Play className="w-6 h-6 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-3 text-pretty">
                    {`This quiz has ${quiz.questions.length} questions.`}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {/* Placeholder for duration */}
                      {`${quiz.questions.length * 0.5} min`}
                    </div>
                    <Button size="sm" variant="default">
                      {getText("Start", "शुरू करें", "ਸ਼ੁਰੂ ਕਰੋ")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions and other sections remain the same */}
        {/* ... */}
      </main>
    </div>
  )
}

// "use client"

// import { useState, useEffect } from "react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Progress } from "@/components/ui/progress"
// import { useToast } from "@/hooks/use-toast"
// import {
//   BookOpen,
//   Trophy,
//   Star,
//   Play,
//   CheckCircle,
//   Clock,
//   Wifi,
//   WifiOff,
//   User,
//   Award,
//   Target,
//   Download,
//   HelpCircle,
// } from "lucide-react"

// interface Lesson {
//   id: string
//   title: string
//   titleHi: string
//   titlePa: string
//   description: string
//   descriptionHi: string
//   descriptionPa: string
//   duration: number
//   completed: boolean
//   difficulty: "beginner" | "intermediate" | "advanced"
//   category: string
//   categoryHi: string
//   categoryPa: string
// }

// interface Achievement {
//   id: string
//   title: string
//   titleHi: string
//   titlePa: string
//   description: string
//   descriptionHi: string
//   descriptionPa: string
//   icon: string
//   earned: boolean
//   progress: number
// }

// export function StudentDashboard() {
//   const [language, setLanguage] = useState<"en" | "hi" | "pa">("en")
//   const [isOffline, setIsOffline] = useState(false)
//   const [lessons, setLessons] = useState<Lesson[]>([])
//   const [achievements, setAchievements] = useState<Achievement[]>([])
//   const [loading, setLoading] = useState(true)
//   const { toast } = useToast()

//   useEffect(() => {
//     fetchLessons()
//     fetchAchievements()

//     // Check online status
//     const handleOnline = () => setIsOffline(false)
//     const handleOffline = () => setIsOffline(true)

//     window.addEventListener("online", handleOnline)
//     window.addEventListener("offline", handleOffline)

//     return () => {
//       window.removeEventListener("online", handleOnline)
//       window.removeEventListener("offline", handleOffline)
//     }
//   }, [])

//   const fetchLessons = async () => {
//     try {
//       const response = await fetch("/api/lessons")
//       const data = await response.json()
//       setLessons(data)
//     } catch (error) {
//       console.error("Failed to fetch lessons:", error)
//       toast({
//         title: "Error",
//         description: "Failed to load lessons. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setLoading(false)
//     }
//   }

//   const fetchAchievements = async () => {
//     try {
//       const response = await fetch("/api/achievements")
//       const data = await response.json()
//       setAchievements(data)
//     } catch (error) {
//       console.error("Failed to fetch achievements:", error)
//     }
//   }

//   const handleLessonAction = async (lesson: Lesson) => {
//     try {
//       toast({
//         title: getText("Opening lesson...", "पाठ खोला जा रहा है...", "ਪਾਠ ਖੋਲਿਆ ਜਾ ਰਿਹਾ ਹੈ..."),
//         description: getText(
//           lesson.completed ? "Reviewing your completed lesson." : "Loading lesson content.",
//           lesson.completed ? "आपके पूरे किए गए पाठ की समीक्षा।" : "पाठ सामग्री लोड हो रही है।",
//           lesson.completed ? "ਤੁਹਾਡੇ ਪੂਰੇ ਕੀਤੇ ਪਾਠ ਦੀ ਸਮੀਖਿਆ।" : "ਪਾਠ ਸਮੱਗਰੀ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ।",
//         ),
//       })

//       setTimeout(() => {
//         window.location.href = `/lessons/${lesson.id}`
//       }, 500)
//     } catch (error) {
//       console.error("Failed to handle lesson action:", error)
//       toast({
//         title: "Error",
//         description: "Failed to process lesson. Please try again.",
//         variant: "destructive",
//       })
//     }
//   }

//   const completeLessonManually = async (lessonId: string) => {
//     try {
//       const response = await fetch("/api/lessons", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ action: "complete", lessonId }),
//       })

//       if (response.ok) {
//         setLessons((prev) => prev.map((l) => (l.id === lessonId ? { ...l, completed: true } : l)))

//         toast({
//           title: getText("Lesson Completed!", "पाठ पूरा हुआ!", "ਪਾਠ ਪੂਰਾ ਹੋਇਆ!"),
//           description: getText("Great job! Keep learning.", "बहुत बढ़िया! सीखते रहें।", "ਬਹੁਤ ਵਧੀਆ! ਸਿੱਖਦੇ ਰਹੋ।"),
//         })

//         checkAchievements()
//       }
//     } catch (error) {
//       console.error("Failed to complete lesson:", error)
//     }
//   }

//   const checkAchievements = async () => {
//     const completedCount = lessons.filter((l) => l.completed).length

//     // First Steps achievement
//     if (completedCount >= 1) {
//       await updateAchievement("1", 100)
//     }

//     // Digital Explorer achievement
//     if (completedCount >= 5) {
//       await updateAchievement("2", 100)
//     } else if (completedCount > 0) {
//       await updateAchievement("2", (completedCount / 5) * 100)
//     }
//   }

//   const updateAchievement = async (achievementId: string, progress: number) => {
//     try {
//       const response = await fetch("/api/achievements", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ achievementId, progress }),
//       })

//       if (response.ok) {
//         const { achievement } = await response.json()
//         setAchievements((prev) => prev.map((a) => (a.id === achievementId ? achievement : a)))

//         if (achievement.earned) {
//           toast({
//             title: getText("Achievement Unlocked!", "उपलब्धि अनलॉक!", "ਪ੍ਰਾਪਤੀ ਅਨਲਾਕ!"),
//             description: getText(achievement.title, achievement.titleHi, achievement.titlePa),
//           })
//         }
//       }
//     } catch (error) {
//       console.error("Failed to update achievement:", error)
//     }
//   }

//   const handleDownloadLessons = async () => {
//     setLoading(true)

//     toast({
//       title: getText("Downloading...", "डाउनलोड हो रहा है...", "ਡਾਊਨਲੋਡ ਹੋ ਰਿਹਾ ਹੈ..."),
//       description: getText(
//         "Preparing lessons for offline use.",
//         "ऑफ़लाइन उपयोग के लिए पाठ तैयार कर रहे हैं।",
//         "ਔਫਲਾਈਨ ਵਰਤੋਂ ਲਈ ਪਾਠ ਤਿਆਰ ਕਰ ਰਹੇ ਹਾਂ।",
//       ),
//     })

//     try {
//       const response = await fetch("/api/lessons/download", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ lessons: lessons.map((l) => l.id) }),
//       })

//       if (response.ok) {
//         localStorage.setItem("offline_lessons", JSON.stringify(lessons))

//         setTimeout(() => {
//           toast({
//             title: getText("Download Complete!", "डाउनलोड पूरा!", "ਡਾਊਨਲੋਡ ਪੂਰਾ!"),
//             description: getText(
//               "Lessons are now available offline.",
//               "पाठ अब ऑफ़लाइन उपलब्ध हैं।",
//               "ਪਾਠ ਹੁਣ ਔਫਲਾਈਨ ਉਪਲਬਧ ਹਨ।",
//             ),
//           })
//           setLoading(false)
//         }, 2000)
//       }
//     } catch (error) {
//       console.error("Download failed:", error)
//       toast({
//         title: "Download Failed",
//         description: "Please check your connection and try again.",
//         variant: "destructive",
//       })
//       setLoading(false)
//     }
//   }

//   const handleTakeQuiz = () => {
//     if (lessons.filter((l) => l.completed).length === 0) {
//       toast({
//         title: getText("Complete Lessons First", "पहले पाठ पूरे करें", "ਪਹਿਲਾਂ ਪਾਠ ਪੂਰੇ ਕਰੋ"),
//         description: getText(
//           "You need to complete at least one lesson to take a quiz.",
//           "क्विज़ लेने के लिए कम से कम एक पाठ पूरा करना होगा।",
//           "ਕਵਿਜ਼ ਲੈਣ ਲਈ ਘੱਟੋ-ਘੱਟ ਇੱਕ ਪਾਠ ਪੂਰਾ ਕਰਨਾ ਹੋਵੇਗਾ।",
//         ),
//         variant: "destructive",
//       })
//       return
//     }

//     toast({
//       title: getText("Quiz Starting...", "प्रश्नोत्तरी शुरू हो रही है...", "ਕਵਿਜ਼ ਸ਼ੁਰੂ ਹੋ ਰਿਹਾ ਹੈ..."),
//       description: getText("Test your knowledge!", "अपने ज्ञान का परीक्षण करें!", "ਆਪਣੇ ਗਿਆਨ ਦੀ ਜਾਂਚ ਕਰੋ!"),
//     })

//     setTimeout(() => {
//       window.location.href = "/quiz"
//     }, 1000)
//   }

//   const handleViewProfile = () => {
//     toast({
//       title: getText("Opening Profile...", "प्रोफ़ाइल खोला जा रहा है...", "ਪ੍ਰੋਫਾਈਲ ਖੋਲਿਆ ਜਾ ਰਿਹਾ ਹੈ..."),
//       description: getText("View your learning progress.", "अपनी सीखने की प्रगति देखें।", "ਆਪਣੀ ਸਿੱਖਣ ਦੀ ਤਰੱਕੀ ਵੇਖੋ।"),
//     })

//     setTimeout(() => {
//       window.location.href = "/profile"
//     }, 1000)
//   }

//   const handleHelp = () => {
//     toast({
//       title: getText("Help Center", "सहायता केंद्र", "ਮਦਦ ਕੇਂਦਰ"),
//       description: getText(
//         "Get assistance with your learning.",
//         "अपनी सीखने में सहायता प्राप्त करें।",
//         "ਆਪਣੀ ਸਿੱਖਣ ਵਿੱਚ ਸਹਾਇਤਾ ਪ੍ਰਾਪਤ ਕਰੋ।",
//       ),
//     })

//     setTimeout(() => {
//       window.location.href = "/help"
//     }, 1000)
//   }

//   const getText = (en: string, hi: string, pa: string) => {
//     switch (language) {
//       case "hi":
//         return hi
//       case "pa":
//         return pa
//       default:
//         return en
//     }
//   }

//   const completedLessons = lessons.filter((lesson) => lesson.completed).length
//   const totalLessons = lessons.length
//   const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center">
//         <div className="text-center space-y-4">
//           <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
//           <p className="text-muted-foreground">Loading your learning dashboard...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       {/* Header */}
//       <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
//         <div className="container mx-auto px-4 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
//                 <BookOpen className="w-6 h-6 text-primary-foreground" />
//               </div>
//               <div>
//                 <h1 className="text-xl font-bold text-balance">
//                   {getText("Digital Learning", "डिजिटल शिक्षा", "ਡਿਜੀਟਲ ਸਿੱਖਿਆ")}
//                 </h1>
//                 <p className="text-sm text-muted-foreground">
//                   {getText("Learn at your own pace", "अपनी गति से सीखें", "ਆਪਣੀ ਰਫਤਾਰ ਨਾਲ ਸਿੱਖੋ")}
//                 </p>
//               </div>
//             </div>

//             <div className="flex items-center gap-3">
//               {/* Language Selector */}
//               <div className="flex bg-muted rounded-lg p-1">
//                 {(["en", "hi", "pa"] as const).map((lang) => (
//                   <Button
//                     key={lang}
//                     variant={language === lang ? "default" : "ghost"}
//                     size="sm"
//                     onClick={() => setLanguage(lang)}
//                     className="text-xs px-3"
//                   >
//                     {lang === "en" ? "EN" : lang === "hi" ? "हि" : "ਪਾ"}
//                   </Button>
//                 ))}
//               </div>

//               {/* Offline Status */}
//               <div className="flex items-center gap-2">
//                 {isOffline ? (
//                   <WifiOff className="w-4 h-4 text-muted-foreground" />
//                 ) : (
//                   <Wifi className="w-4 h-4 text-success" />
//                 )}
//                 <span className="text-xs text-muted-foreground">
//                   {isOffline ? getText("Offline", "ऑफ़लाइन", "ਔਫਲਾਈਨ") : getText("Online", "ऑनलाइन", "ਔਨਲਾਈਨ")}
//                 </span>
//               </div>

//               {/* Profile */}
//               <Button variant="ghost" size="sm" className="gap-2" onClick={handleViewProfile}>
//                 <User className="w-4 h-4" />
//                 <span className="hidden sm:inline">{getText("Profile", "प्रोफ़ाइल", "ਪ੍ਰੋਫਾਈਲ")}</span>
//               </Button>
//             </div>
//           </div>
//         </div>
//       </header>

//       <main className="container mx-auto px-4 py-6 space-y-6">
//         {/* Welcome Section */}
//         <div className="text-center space-y-4">
//           <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
//             <Star className="w-4 h-4" />
//             {getText("Welcome back!", "वापस स्वागत है!", "ਵਾਪਸ ਜੀ ਆਇਆਂ ਨੂੰ!")}
//           </div>
//           <h2 className="text-2xl font-bold text-balance">
//             {getText("Continue Your Learning Journey", "अपनी सीखने की यात्रा जारी रखें", "ਆਪਣੀ ਸਿੱਖਣ ਦੀ ਯਾਤਰਾ ਜਾਰੀ ਰੱਖੋ")}
//           </h2>
//         </div>

//         {/* Progress Overview */}
//         <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Target className="w-5 h-5 text-primary" />
//               {getText("Your Progress", "आपकी प्रगति", "ਤੁਹਾਡੀ ਤਰੱਕੀ")}
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="flex items-center justify-between">
//               <span className="text-sm text-muted-foreground">
//                 {getText("Lessons Completed", "पूरे किए गए पाठ", "ਪੂਰੇ ਕੀਤੇ ਪਾਠ")}
//               </span>
//               <span className="font-semibold">
//                 {completedLessons}/{totalLessons}
//               </span>
//             </div>
//             <Progress value={progressPercentage} className="h-3" />
//             <div className="flex items-center justify-between text-sm">
//               <span className="text-muted-foreground">
//                 {Math.round(progressPercentage)}% {getText("Complete", "पूर्ण", "ਪੂਰਾ")}
//               </span>
//               <div className="flex items-center gap-1 text-primary">
//                 <Trophy className="w-4 h-4" />
//                 <span>
//                   {achievements.filter((a) => a.earned).length} {getText("Badges", "बैज", "ਬੈਜ")}
//                 </span>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Lessons Grid */}
//         <div className="space-y-4">
//           <h3 className="text-lg font-semibold flex items-center gap-2">
//             <BookOpen className="w-5 h-5 text-primary" />
//             {getText("Available Lessons", "उपलब्ध पाठ", "ਉਪਲਬਧ ਪਾਠ")}
//           </h3>

//           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//             {lessons.map((lesson) => (
//               <Card
//                 key={lesson.id}
//                 className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
//                   lesson.completed ? "bg-success/5 border-success/20" : "hover:border-primary/50"
//                 }`}
//                 onClick={() => handleLessonAction(lesson)}
//               >
//                 <CardHeader className="pb-3">
//                   <div className="flex items-start justify-between">
//                     <div className="space-y-1 flex-1">
//                       <CardTitle className="text-base text-balance">
//                         {getText(lesson.title, lesson.titleHi, lesson.titlePa)}
//                       </CardTitle>
//                       <Badge
//                         variant={
//                           lesson.difficulty === "beginner"
//                             ? "secondary"
//                             : lesson.difficulty === "intermediate"
//                               ? "default"
//                               : "destructive"
//                         }
//                         className="text-xs"
//                       >
//                         {getText(lesson.category, lesson.categoryHi, lesson.categoryPa)}
//                       </Badge>
//                     </div>
//                     {lesson.completed ? (
//                       <CheckCircle className="w-6 h-6 text-success animate-bounce-gentle" />
//                     ) : (
//                       <Play className="w-6 h-6 text-primary" />
//                     )}
//                   </div>
//                 </CardHeader>
//                 <CardContent className="pt-0">
//                   <p className="text-sm text-muted-foreground mb-3 text-pretty">
//                     {getText(lesson.description, lesson.descriptionHi, lesson.descriptionPa)}
//                   </p>
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-1 text-xs text-muted-foreground">
//                       <Clock className="w-3 h-3" />
//                       {lesson.duration} {getText("min", "मिनट", "ਮਿੰਟ")}
//                     </div>
//                     <Button size="sm" variant={lesson.completed ? "secondary" : "default"}>
//                       {lesson.completed ? getText("Review", "समीक्षा", "ਸਮੀਖਿਆ") : getText("Start", "शुरू करें", "ਸ਼ੁਰੂ ਕਰੋ")}
//                     </Button>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </div>

//         {/* Achievements */}
//         <div className="space-y-4">
//           <h3 className="text-lg font-semibold flex items-center gap-2">
//             <Award className="w-5 h-5 text-accent" />
//             {getText("Your Achievements", "आपकी उपलब्धियां", "ਤੁਹਾਡੀਆਂ ਪ੍ਰਾਪਤੀਆਂ")}
//           </h3>

//           <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//             {achievements.map((achievement) => (
//               <Card
//                 key={achievement.id}
//                 className={`${achievement.earned ? "bg-accent/5 border-accent/20 animate-pulse-glow" : "opacity-60"}`}
//               >
//                 <CardContent className="p-4">
//                   <div className="flex items-center gap-3">
//                     <div className={`text-2xl ${achievement.earned ? "animate-bounce-gentle" : "grayscale"}`}>
//                       {achievement.icon}
//                     </div>
//                     <div className="flex-1">
//                       <h4 className="font-semibold text-sm text-balance">
//                         {getText(achievement.title, achievement.titleHi, achievement.titlePa)}
//                       </h4>
//                       <p className="text-xs text-muted-foreground text-pretty">
//                         {getText(achievement.description, achievement.descriptionHi, achievement.descriptionPa)}
//                       </p>
//                       {!achievement.earned && achievement.progress > 0 && (
//                         <Progress value={achievement.progress} className="h-1 mt-2" />
//                       )}
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </div>

//         {/* Quick Actions */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="text-base">{getText("Quick Actions", "त्वरित कार्य", "ਤੇਜ਼ ਕਾਰਵਾਈਆਂ")}</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
//               <Button
//                 variant="outline"
//                 className="justify-start gap-2 h-auto p-4 bg-transparent"
//                 onClick={handleDownloadLessons}
//               >
//                 <Download className="w-4 h-4 text-secondary" />
//                 <div className="text-left">
//                   <div className="font-medium text-sm">
//                     {getText("Download Lessons", "पाठ डाउनलोड करें", "ਪਾਠ ਡਾਊਨਲੋਡ ਕਰੋ")}
//                   </div>
//                   <div className="text-xs text-muted-foreground">
//                     {getText("For offline use", "ऑफ़लाइन उपयोग के लिए", "ਔਫਲਾਈਨ ਵਰਤੋਂ ਲਈ")}
//                   </div>
//                 </div>
//               </Button>

//               <Button
//                 variant="outline"
//                 className="justify-start gap-2 h-auto p-4 bg-transparent"
//                 onClick={handleTakeQuiz}
//               >
//                 <Trophy className="w-4 h-4 text-warning" />
//                 <div className="text-left">
//                   <div className="font-medium text-sm">{getText("Take Quiz", "प्रश्नोत्तरी लें", "ਕਵਿਜ਼ ਲਓ")}</div>
//                   <div className="text-xs text-muted-foreground">
//                     {getText("Test your knowledge", "अपने ज्ञान का परीक्षण करें!", "ਆਪਣੇ ਗਿਆਨ ਦੀ ਜਾਂਚ ਕਰੋ!")}
//                   </div>
//                 </div>
//               </Button>

//               <Button
//                 variant="outline"
//                 className="justify-start gap-2 h-auto p-4 bg-transparent"
//                 onClick={handleViewProfile}
//               >
//                 <User className="w-4 h-4 text-accent" />
//                 <div className="text-left">
//                   <div className="font-medium text-sm">{getText("View Profile", "प्रोफ़ाइल देखें", "ਪ੍ਰੋਫਾਈਲ ਵੇਖੋ")}</div>
//                   <div className="text-xs text-muted-foreground">
//                     {getText("Track progress", "प्रगति ट्रैक करें", "ਤਰੱਕੀ ਦਾ ਪਤਾ ਲਗਾਓ")}
//                   </div>
//                 </div>
//               </Button>

//               <Button variant="outline" className="justify-start gap-2 h-auto p-4 bg-transparent" onClick={handleHelp}>
//                 <HelpCircle className="w-4 h-4 text-primary" />
//                 <div className="text-left">
//                   <div className="font-medium text-sm">
//                     {getText("Help & Support", "सहायता और समर्थन", "ਮਦਦ ਅਤੇ ਸਹਾਇਤਾ")}
//                   </div>
//                   <div className="text-xs text-muted-foreground">
//                     {getText("Get assistance", "सहायता प्राप्त करें", "ਸਹਾਇਤਾ ਪ੍ਰਾਪਤ ਕਰੋ")}
//                   </div>
//                 </div>
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       </main>
//     </div>
//   )
// }
