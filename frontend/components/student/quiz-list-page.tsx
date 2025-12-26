"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api/api"
import { useToast } from "@/lib/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Trophy,
  Star,
  Play,
  Clock,
  Target,
  ArrowLeft,
  TrendingUp,
} from "lucide-react"

interface Quiz {
  id: number
  title: string
  description: string
  duration: number
  total_marks: number
  passing_marks: number
  difficulty_level: 'easy' | 'medium' | 'hard'
  is_active: boolean
}

export function QuizListPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [language, setLanguage] = useState<"en" | "hi" | "pa">("en")
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const fetchQuizzes = async () => {
    try {
      const response = await api.get('/quizzes/')
      
      if (Array.isArray(response.data)) {
        setQuizzes(response.data)
      } else if (response.data?.results) {
        setQuizzes(response.data.results)
      } else {
        setQuizzes([])
      }
    } catch (error: any) {
      console.error('Quiz fetch error:', error)
      setQuizzes([])
      toast({
        title: "Error",
        description: "Failed to load quizzes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getText = (en: string, hi: string, pa: string) => {
    if (language === 'hi') return hi
    if (language === 'pa') return pa
    return en
  }

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy':
        return 'bg-green-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'hard':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getDifficultyText = (level: string) => {
    switch (level) {
      case 'easy':
        return getText('Easy', 'आसान', 'ਆਸਾਨ')
      case 'medium':
        return getText('Medium', 'मध्यम', 'ਮੱਧਮ')
      case 'hard':
        return getText('Hard', 'कठिन', 'ਮੁਸ਼ਕਿਲ')
      default:
        return level
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{getText("Loading quizzes...", "क्विज़ लोड हो रहे हैं...", "ਕੁਇਜ਼ ਲੋਡ ਹੋ ਰਹੇ ਹਨ...")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push('/student/dashboard')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-primary flex items-center gap-2">
                <Trophy className="w-10 h-10" />
                {getText("Quiz Center", "क्विज़ केंद्र", "ਕੁਇਜ਼ ਸੈਂਟਰ")}
              </h1>
              <p className="text-muted-foreground mt-2">
                {getText(
                  "Choose a quiz to test your knowledge",
                  "अपने ज्ञान का परीक्षण करने के लिए एक क्विज़ चुनें",
                  "ਆਪਣੇ ਗਿਆਨ ਦੀ ਜਾਂਚ ਕਰਨ ਲਈ ਇੱਕ ਕੁਇਜ਼ ਚੁਣੋ"
                )}
              </p>
            </div>
          </div>

          {/* Language Selector */}
          <div className="flex gap-2">
            {(['en', 'hi', 'pa'] as const).map((lang) => (
              <Button
                key={lang}
                variant={language === lang ? "default" : "outline"}
                onClick={() => setLanguage(lang)}
                className="text-xs px-3"
              >
                {lang === 'en' ? 'EN' : lang === 'hi' ? 'हि' : 'ਪਾ'}
              </Button>
            ))}
          </div>
        </div>

        {/* Available Quizzes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              {getText("Available Quizzes", "उपलब्ध क्विज़", "ਉਪਲਬਧ ਕੁਇਜ਼")}
            </CardTitle>
            <CardDescription>
              {quizzes.length} {getText("quizzes available", "क्विज़ उपलब्ध", "ਕੁਇਜ਼ ਉਪਲਬਧ")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {quizzes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{getText("No quizzes available yet", "अभी कोई क्विज़ उपलब्ध नहीं", "ਅਜੇ ਕੋਈ ਕੁਇਜ਼ ਉਪਲਬਧ ਨਹੀਂ")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quizzes.map((quiz) => (
                  <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{quiz.title}</CardTitle>
                        <Badge className={getDifficultyColor(quiz.difficulty_level)}>
                          {getDifficultyText(quiz.difficulty_level)}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {quiz.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{quiz.duration} {getText("min", "मिनट", "ਮਿੰਟ")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          <span>{quiz.total_marks} {getText("marks", "अंक", "ਅੰਕ")}</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => router.push(`/student/quiz/${quiz.id}`)}
                        className="w-full"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {getText("Start Quiz", "क्विज़ शुरू करें", "ਕੁਇਜ਼ ਸ਼ੁਰੂ ਕਰੋ")}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
