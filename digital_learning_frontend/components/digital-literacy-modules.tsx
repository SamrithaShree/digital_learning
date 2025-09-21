"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Monitor,
  Mouse,
  Keyboard,
  Wifi,
  Mail,
  Search,
  ImageIcon,
  Play,
  CheckCircle,
  Star,
  Trophy,
  Clock,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Lightbulb,
  Target,
  Award,
} from "lucide-react"

interface MicroLesson {
  id: string
  title: string
  titleHi: string
  titlePa: string
  description: string
  descriptionHi: string
  descriptionPa: string
  icon: React.ReactNode
  duration: number
  difficulty: "beginner" | "intermediate" | "advanced"
  steps: Step[]
  completed: boolean
  score?: number
  badge?: string
}

interface Step {
  id: string
  title: string
  titleHi: string
  titlePa: string
  content: string
  contentHi: string
  contentPa: string
  type: "instruction" | "practice" | "quiz" | "demonstration"
  media?: string
  interactive?: boolean
  completed: boolean
}

const mockMicroLessons: MicroLesson[] = [
  {
    id: "1",
    title: "Using a Computer Mouse",
    titleHi: "कंप्यूटर माउस का उपयोग",
    titlePa: "ਕੰਪਿਊਟਰ ਮਾਊਸ ਦੀ ਵਰਤੋਂ",
    description: "Learn how to use a computer mouse effectively",
    descriptionHi: "कंप्यूटर माउस का प्रभावी रूप से उपयोग करना सीखें",
    descriptionPa: "ਕੰਪਿਊਟਰ ਮਾਊਸ ਦੀ ਪ੍ਰਭਾਵਸ਼ਾਲੀ ਵਰਤੋਂ ਸਿੱਖੋ",
    icon: <Mouse className="w-6 h-6" />,
    duration: 5,
    difficulty: "beginner",
    completed: true,
    score: 95,
    badge: "Mouse Master",
    steps: [
      {
        id: "1-1",
        title: "Hold the Mouse",
        titleHi: "माउस को पकड़ें",
        titlePa: "ਮਾਊਸ ਨੂੰ ਫੜੋ",
        content: "Place your hand gently on the mouse with your index finger on the left button",
        contentHi: "अपना हाथ माउस पर धीरे से रखें और तर्जनी को बाएं बटन पर रखें",
        contentPa: "ਆਪਣਾ ਹੱਥ ਮਾਊਸ ਉੱਤੇ ਹੌਲੀ ਨਾਲ ਰੱਖੋ ਅਤੇ ਤਰਜਨੀ ਨੂੰ ਖੱਬੇ ਬਟਨ ਉੱਤੇ ਰੱਖੋ",
        type: "instruction",
        media: "/mouse-hold-demo.gif",
        completed: true,
      },
      {
        id: "1-2",
        title: "Move the Cursor",
        titleHi: "कर्सर को हिलाएं",
        titlePa: "ਕਰਸਰ ਨੂੰ ਹਿਲਾਓ",
        content: "Gently move the mouse to control the cursor on screen",
        contentHi: "स्क्रीन पर कर्सर को नियंत्रित करने के लिए माउस को धीरे से हिलाएं",
        contentPa: "ਸਕ੍ਰੀਨ ਉੱਤੇ ਕਰਸਰ ਨੂੰ ਕੰਟਰੋਲ ਕਰਨ ਲਈ ਮਾਊਸ ਨੂੰ ਹੌਲੀ ਨਾਲ ਹਿਲਾਓ",
        type: "practice",
        interactive: true,
        completed: true,
      },
      {
        id: "1-3",
        title: "Click Practice",
        titleHi: "क्लिक अभ्यास",
        titlePa: "ਕਲਿੱਕ ਅਭਿਆਸ",
        content: "Practice clicking on different targets to improve accuracy",
        contentHi: "सटीकता में सुधार के लिए विभिन्न लक्ष्यों पर क्लिक करने का अभ्यास करें",
        contentPa: "ਸਟੀਕਤਾ ਵਿੱਚ ਸੁਧਾਰ ਲਈ ਵੱਖ-ਵੱਖ ਟਾਰਗੇਟਾਂ ਉੱਤੇ ਕਲਿੱਕ ਕਰਨ ਦਾ ਅਭਿਆਸ ਕਰੋ",
        type: "practice",
        interactive: true,
        completed: true,
      },
    ],
  },
  {
    id: "2",
    title: "Keyboard Basics",
    titleHi: "कीबोर्ड की मूल बातें",
    titlePa: "ਕੀਬੋਰਡ ਦੀਆਂ ਬੁਨਿਆਦੀ ਗੱਲਾਂ",
    description: "Learn to type and use keyboard shortcuts",
    descriptionHi: "टाइप करना और कीबोर्ड शॉर्टकट का उपयोग करना सीखें",
    descriptionPa: "ਟਾਈਪ ਕਰਨਾ ਅਤੇ ਕੀਬੋਰਡ ਸ਼ਾਰਟਕੱਟ ਦੀ ਵਰਤੋਂ ਸਿੱਖੋ",
    icon: <Keyboard className="w-6 h-6" />,
    duration: 8,
    difficulty: "beginner",
    completed: false,
    steps: [
      {
        id: "2-1",
        title: "Home Row Position",
        titleHi: "होम रो स्थिति",
        titlePa: "ਹੋਮ ਰੋ ਸਥਿਤੀ",
        content: "Place your fingers on the home row keys: ASDF for left hand, JKL; for right hand",
        contentHi: "अपनी उंगलियों को होम रो कीज़ पर रखें: बाएं हाथ के लिए ASDF, दाएं हाथ के लिए JKL;",
        contentPa: "ਆਪਣੀਆਂ ਉਂਗਲਾਂ ਨੂੰ ਹੋਮ ਰੋ ਕੀਜ਼ ਉੱਤੇ ਰੱਖੋ: ਖੱਬੇ ਹੱਥ ਲਈ ASDF, ਸੱਜੇ ਹੱਥ ਲਈ JKL;",
        type: "instruction",
        completed: false,
      },
      {
        id: "2-2",
        title: "Basic Typing",
        titleHi: "बुनियादी टाइपिंग",
        titlePa: "ਬੁਨਿਆਦੀ ਟਾਈਪਿੰਗ",
        content: "Practice typing simple words and sentences",
        contentHi: "सरल शब्दों और वाक्यों को टाइप करने का अभ्यास करें",
        contentPa: "ਸਧਾਰਨ ਸ਼ਬਦਾਂ ਅਤੇ ਵਾਕਾਂ ਨੂੰ ਟਾਈਪ ਕਰਨ ਦਾ ਅਭਿਆਸ ਕਰੋ",
        type: "practice",
        interactive: true,
        completed: false,
      },
    ],
  },
  {
    id: "3",
    title: "Internet Browsing",
    titleHi: "इंटरनेट ब्राउज़िंग",
    titlePa: "ਇੰਟਰਨੈੱਟ ਬ੍ਰਾਊਜ਼ਿੰਗ",
    description: "Navigate the web safely and effectively",
    descriptionHi: "वेब को सुरक्षित और प्रभावी रूप से नेविगेट करें",
    descriptionPa: "ਵੈੱਬ ਨੂੰ ਸੁਰੱਖਿਅਤ ਅਤੇ ਪ੍ਰਭਾਵਸ਼ਾਲੀ ਤਰੀਕੇ ਨਾਲ ਨੈਵੀਗੇਟ ਕਰੋ",
    icon: <Wifi className="w-6 h-6" />,
    duration: 12,
    difficulty: "intermediate",
    completed: false,
    steps: [
      {
        id: "3-1",
        title: "Opening a Browser",
        titleHi: "ब्राउज़र खोलना",
        titlePa: "ਬ੍ਰਾਊਜ਼ਰ ਖੋਲ਼ਣਾ",
        content: "Learn how to open and navigate a web browser",
        contentHi: "वेब ब्राउज़र को खोलना और नेविगेट करना सीखें",
        contentPa: "ਵੈੱਬ ਬ੍ਰਾਊਜ਼ਰ ਨੂੰ ਖੋਲ਼ਣਾ ਅਤੇ ਨੈਵੀਗੇਟ ਕਰਨਾ ਸਿੱਖੋ",
        type: "demonstration",
        completed: false,
      },
    ],
  },
  {
    id: "4",
    title: "Email Basics",
    titleHi: "ईमेल की मूल बातें",
    titlePa: "ਈਮੇਲ ਦੀਆਂ ਬੁਨਿਆਦੀ ਗੱਲਾਂ",
    description: "Send and receive emails safely",
    descriptionHi: "ईमेल सुरक्षित रूप से भेजें और प्राप्त करें",
    descriptionPa: "ਈਮੇਲ ਸੁਰੱਖਿਅਤ ਤਰੀਕੇ ਨਾਲ ਭੇਜੋ ਅਤੇ ਪ੍ਰਾਪਤ ਕਰੋ",
    icon: <Mail className="w-6 h-6" />,
    duration: 10,
    difficulty: "intermediate",
    completed: false,
    steps: [],
  },
]

const achievements = [
  {
    id: "1",
    title: "First Click",
    titleHi: "पहला क्लिक",
    titlePa: "ਪਹਿਲਾ ਕਲਿੱਕ",
    description: "Complete your first mouse lesson",
    descriptionHi: "अपना पहला माउस पाठ पूरा करें",
    descriptionPa: "ਆਪਣਾ ਪਹਿਲਾ ਮਾਊਸ ਪਾਠ ਪੂਰਾ ਕਰੋ",
    icon: "🖱️",
    earned: true,
  },
  {
    id: "2",
    title: "Digital Explorer",
    titleHi: "डिजिटल खोजकर्ता",
    titlePa: "ਡਿਜੀਟਲ ਖੋਜੀ",
    description: "Complete 3 digital literacy modules",
    descriptionHi: "3 डिजिटल साक्षरता मॉड्यूल पूरे करें",
    descriptionPa: "3 ਡਿਜੀਟਲ ਸਾਖਰਤਾ ਮਾਡਿਊਲ ਪੂਰੇ ਕਰੋ",
    icon: "🚀",
    earned: false,
  },
  {
    id: "3",
    title: "Safety Champion",
    titleHi: "सुरक्षा चैंपियन",
    titlePa: "ਸੁਰੱਖਿਆ ਚੈਂਪੀਅਨ",
    description: "Master internet safety practices",
    descriptionHi: "इंटरनेट सुरक्षा प्रथाओं में महारत हासिल करें",
    descriptionPa: "ਇੰਟਰਨੈੱਟ ਸੁਰੱਖਿਆ ਅਭਿਆਸਾਂ ਵਿੱਚ ਮਾਹਰ ਬਣੋ",
    icon: "🛡️",
    earned: false,
  },
]

export function DigitalLiteracyModules() {
  const [language, setLanguage] = useState<"en" | "hi" | "pa">("en")
  const [selectedLesson, setSelectedLesson] = useState<MicroLesson | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false)

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

  const completedLessons = mockMicroLessons.filter((lesson) => lesson.completed).length
  const totalLessons = mockMicroLessons.length
  const overallProgress = (completedLessons / totalLessons) * 100

  const startLesson = (lesson: MicroLesson) => {
    setSelectedLesson(lesson)
    setCurrentStep(0)
    setIsLessonDialogOpen(true)
  }

  const nextStep = () => {
    if (selectedLesson && currentStep < selectedLesson.steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Monitor className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-balance">
                  {getText("Digital Literacy", "डिजिटल साक्षरता", "ਡਿਜੀਟਲ ਸਾਖਰਤਾ")}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {getText(
                    "Master essential digital skills step by step",
                    "आवश्यक डिजिटल कौशल को चरणबद्ध तरीके से सीखें",
                    "ਜ਼ਰੂਰੀ ਡਿਜੀਟਲ ਹੁਨਰ ਕਦਮ-ਦਰ-ਕਦਮ ਸਿੱਖੋ",
                  )}
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
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Progress Overview */}
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              {getText("Your Digital Journey", "आपकी डिजिटल यात्रा", "ਤੁਹਾਡੀ ਡਿਜੀਟਲ ਯਾਤਰਾ")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {getText("Modules Completed", "पूर्ण मॉड्यूल", "ਪੂਰੇ ਮਾਡਿਊਲ")}
              </span>
              <span className="font-semibold">
                {completedLessons}/{totalLessons}
              </span>
            </div>
            <Progress value={overallProgress} className="h-3" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {Math.round(overallProgress)}% {getText("Complete", "पूर्ण", "ਪੂਰਾ")}
              </span>
              <div className="flex items-center gap-1 text-accent">
                <Trophy className="w-4 h-4" />
                <span>
                  {achievements.filter((a) => a.earned).length} {getText("Achievements", "उपलब्धियां", "ਪ੍ਰਾਪਤੀਆਂ")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="modules" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="modules">{getText("Modules", "मॉड्यूल", "ਮਾਡਿਊਲ")}</TabsTrigger>
            <TabsTrigger value="practice">{getText("Practice", "अभ्यास", "ਅਭਿਆਸ")}</TabsTrigger>
            <TabsTrigger value="achievements">{getText("Achievements", "उपलब्धियां", "ਪ੍ਰਾਪਤੀਆਂ")}</TabsTrigger>
          </TabsList>

          {/* Modules Tab */}
          <TabsContent value="modules" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mockMicroLessons.map((lesson) => (
                <Card
                  key={lesson.id}
                  className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                    lesson.completed ? "bg-success/5 border-success/20" : "hover:border-primary/50"
                  }`}
                  onClick={() => startLesson(lesson)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            lesson.completed ? "bg-success text-success-foreground" : "bg-primary/10 text-primary"
                          }`}
                        >
                          {lesson.completed ? <CheckCircle className="w-6 h-6" /> : lesson.icon}
                        </div>
                        <div className="space-y-1">
                          <CardTitle className="text-base text-balance">
                            {getText(lesson.title, lesson.titleHi, lesson.titlePa)}
                          </CardTitle>
                          <Badge
                            variant={
                              lesson.difficulty === "beginner"
                                ? "secondary"
                                : lesson.difficulty === "intermediate"
                                  ? "default"
                                  : "destructive"
                            }
                            className="text-xs"
                          >
                            {lesson.difficulty === "beginner"
                              ? getText("Beginner", "शुरुआती", "ਸ਼ੁਰੂਆਤੀ")
                              : lesson.difficulty === "intermediate"
                                ? getText("Intermediate", "मध्यम", "ਮੱਧਮ")
                                : getText("Advanced", "उन्नत", "ਉੱਨਤ")}
                          </Badge>
                        </div>
                      </div>
                      {lesson.completed && lesson.score && (
                        <div className="text-center">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-warning text-warning" />
                            <span className="text-sm font-bold">{lesson.score}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-3 text-pretty">
                      {getText(lesson.description, lesson.descriptionHi, lesson.descriptionPa)}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {lesson.duration} {getText("min", "मिनट", "ਮਿੰਟ")}
                      </div>
                      <Button size="sm" variant={lesson.completed ? "secondary" : "default"} className="gap-1">
                        <Play className="w-3 h-3" />
                        {lesson.completed ? getText("Review", "समीक्षा", "ਸਮੀਖਿਆ") : getText("Start", "शुरू करें", "ਸ਼ੁਰੂ ਕਰੋ")}
                      </Button>
                    </div>
                    {lesson.completed && lesson.badge && (
                      <div className="mt-3 p-2 bg-accent/10 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-accent" />
                          <span className="text-xs font-medium text-accent">
                            {getText("Badge Earned:", "बैज अर्जित:", "ਬੈਜ ਪ੍ਰਾਪਤ:")} {lesson.badge}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Practice Tab */}
          <TabsContent value="practice" className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">{getText("Practice Zone", "अभ्यास क्षेत्र", "ਅਭਿਆਸ ਖੇਤਰ")}</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                {getText(
                  "Reinforce your learning with interactive practice exercises",
                  "इंटरैक्टिव अभ्यास अभ्यासों के साथ अपनी शिक्षा को मजबूत करें",
                  "ਇੰਟਰਐਕਟਿਵ ਅਭਿਆਸ ਅਭਿਆਸਾਂ ਨਾਲ ਆਪਣੀ ਸਿੱਖਿਆ ਨੂੰ ਮਜ਼ਬੂਤ ਕਰੋ",
                )}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Mouse Accuracy",
                  titleHi: "माउस सटीकता",
                  titlePa: "ਮਾਊਸ ਸਟੀਕਤਾ",
                  description: "Click targets to improve mouse precision",
                  descriptionHi: "माउस की सटीकता में सुधार के लिए लक्ष्यों पर क्लिक करें",
                  descriptionPa: "ਮਾਊਸ ਦੀ ਸਟੀਕਤਾ ਵਿੱਚ ਸੁਧਾਰ ਲਈ ਟਾਰਗੇਟਾਂ ਉੱਤੇ ਕਲਿੱਕ ਕਰੋ",
                  icon: <Mouse className="w-6 h-6" />,
                  color: "bg-blue-500",
                },
                {
                  title: "Typing Speed",
                  titleHi: "टाइपिंग गति",
                  titlePa: "ਟਾਈਪਿੰਗ ਸਪੀਡ",
                  description: "Practice typing to increase your speed",
                  descriptionHi: "अपनी गति बढ़ाने के लिए टाइपिंग का अभ्यास करें",
                  descriptionPa: "ਆਪਣੀ ਸਪੀਡ ਵਧਾਉਣ ਲਈ ਟਾਈਪਿੰਗ ਦਾ ਅਭਿਆਸ ਕਰੋ",
                  icon: <Keyboard className="w-6 h-6" />,
                  color: "bg-green-500",
                },
                {
                  title: "Web Navigation",
                  titleHi: "वेब नेवीगेशन",
                  titlePa: "ਵੈੱਬ ਨੈਵੀਗੇਸ਼ਨ",
                  description: "Practice browsing websites safely",
                  descriptionHi: "वेबसाइटों को सुरक्षित रूप से ब्राउज़ करने का अभ्यास करें",
                  descriptionPa: "ਵੈੱਬਸਾਈਟਾਂ ਨੂੰ ਸੁਰੱਖਿਅਤ ਤਰੀਕੇ ਨਾਲ ਬ੍ਰਾਊਜ਼ ਕਰਨ ਦਾ ਅਭਿਆਸ ਕਰੋ",
                  icon: <Search className="w-6 h-6" />,
                  color: "bg-purple-500",
                },
              ].map((practice, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 ${practice.color} rounded-xl flex items-center justify-center text-white`}
                      >
                        {practice.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-balance">
                          {getText(practice.title, practice.titleHi, practice.titlePa)}
                        </h3>
                        <p className="text-sm text-muted-foreground text-pretty">
                          {getText(practice.description, practice.descriptionHi, practice.descriptionPa)}
                        </p>
                      </div>
                    </div>
                    <Button className="w-full mt-4 gap-2">
                      <Play className="w-4 h-4" />
                      {getText("Practice", "अभ्यास", "ਅਭਿਆਸ")}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-2xl font-bold">{getText("Your Achievements", "आपकी उपलब्धियां", "ਤੁਹਾਡੀਆਂ ਪ੍ਰਾਪਤੀਆਂ")}</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                {getText(
                  "Celebrate your digital learning milestones",
                  "अपनी डिजिटल शिक्षा की उपलब्धियों का जश्न मनाएं",
                  "ਆਪਣੀ ਡਿਜੀਟਲ ਸਿੱਖਿਆ ਦੀਆਂ ਪ੍ਰਾਪਤੀਆਂ ਦਾ ਜਸ਼ਨ ਮਨਾਓ",
                )}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {achievements.map((achievement) => (
                <Card
                  key={achievement.id}
                  className={`${
                    achievement.earned ? "bg-accent/5 border-accent/20 animate-pulse-glow" : "opacity-60 border-dashed"
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`text-3xl ${achievement.earned ? "animate-bounce-gentle" : "grayscale"}`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-balance">
                          {getText(achievement.title, achievement.titleHi, achievement.titlePa)}
                        </h3>
                        <p className="text-sm text-muted-foreground text-pretty">
                          {getText(achievement.description, achievement.descriptionHi, achievement.descriptionPa)}
                        </p>
                        {achievement.earned && (
                          <Badge variant="secondary" className="mt-2">
                            {getText("Earned", "अर्जित", "ਪ੍ਰਾਪਤ")}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Lesson Dialog */}
        <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedLesson?.icon}
                {selectedLesson && getText(selectedLesson.title, selectedLesson.titleHi, selectedLesson.titlePa)}
              </DialogTitle>
            </DialogHeader>
            {selectedLesson && selectedLesson.steps.length > 0 && (
              <div className="space-y-6">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {getText("Step", "चरण", "ਕਦਮ")} {currentStep + 1} {getText("of", "का", "ਦਾ")}{" "}
                      {selectedLesson.steps.length}
                    </span>
                    <span className="font-medium">
                      {Math.round(((currentStep + 1) / selectedLesson.steps.length) * 100)}%{" "}
                      {getText("Complete", "पूर्ण", "ਪੂਰਾ")}
                    </span>
                  </div>
                  <Progress value={((currentStep + 1) / selectedLesson.steps.length) * 100} />
                </div>

                {/* Current Step */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                      {currentStep + 1}
                    </div>
                    <h3 className="text-lg font-semibold">
                      {getText(
                        selectedLesson.steps[currentStep].title,
                        selectedLesson.steps[currentStep].titleHi,
                        selectedLesson.steps[currentStep].titlePa,
                      )}
                    </h3>
                    <Badge variant="outline">
                      {selectedLesson.steps[currentStep].type === "instruction"
                        ? getText("Learn", "सीखें", "ਸਿੱਖੋ")
                        : selectedLesson.steps[currentStep].type === "practice"
                          ? getText("Practice", "अभ्यास", "ਅਭਿਆਸ")
                          : selectedLesson.steps[currentStep].type === "quiz"
                            ? getText("Quiz", "प्रश्नोत्तरी", "ਕਵਿਜ਼")
                            : getText("Demo", "डेमो", "ਡੈਮੋ")}
                    </Badge>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-6">
                    {selectedLesson.steps[currentStep].media && (
                      <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    <p className="text-pretty">
                      {getText(
                        selectedLesson.steps[currentStep].content,
                        selectedLesson.steps[currentStep].contentHi,
                        selectedLesson.steps[currentStep].contentPa,
                      )}
                    </p>
                    {selectedLesson.steps[currentStep].interactive && (
                      <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                        <div className="flex items-center gap-2 text-primary">
                          <Lightbulb className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {getText("Interactive Practice", "इंटरैक्टिव अभ्यास", "ਇੰਟਰਐਕਟਿਵ ਅਭਿਆਸ")}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {getText(
                            "Try the interactive exercise to practice this skill",
                            "इस कौशल का अभ्यास करने के लिए इंटरैक्टिव अभ्यास आज़माएं",
                            "ਇਸ ਹੁਨਰ ਦਾ ਅਭਿਆਸ ਕਰਨ ਲਈ ਇੰਟਰਐਕਟਿਵ ਅਭਿਆਸ ਦੀ ਕੋਸ਼ਿਸ਼ ਕਰੋ",
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="gap-2 bg-transparent"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {getText("Previous", "पिछला", "ਪਿਛਲਾ")}
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => setIsLessonDialogOpen(false)} className="gap-2">
                      <RotateCcw className="w-4 h-4" />
                      {getText("Exit", "बाहर निकलें", "ਬਾਹਰ ਨਿਕਲੋ")}
                    </Button>
                    <Button
                      onClick={
                        currentStep === selectedLesson.steps.length - 1 ? () => setIsLessonDialogOpen(false) : nextStep
                      }
                      className="gap-2"
                    >
                      {currentStep === selectedLesson.steps.length - 1
                        ? getText("Complete", "पूर्ण", "ਪੂਰਾ")
                        : getText("Next", "अगला", "ਅਗਲਾ")}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
