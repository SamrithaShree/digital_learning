"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import api from "@/lib/api/api"
import { useToast } from "@/lib/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  Trophy,
  BookOpen,
  Play,
} from "lucide-react"

interface Question {
  id: number
  text_en: string
  text_pa: string
  options: Record<string, string>
  subject: string
}

interface Quiz {
  id: number
  name: string
  subject: string
  time_limit: number
  questions: Question[]
}

export function QuizPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const quizId = params.id as string

  const [language, setLanguage] = useState<"en" | "pa">("en")
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)

  useEffect(() => {
    if (quizId) {
      fetchQuiz()
    }
  }, [quizId])

  useEffect(() => {
    if (quizStarted && timeLeft > 0 && !quizCompleted) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmitQuiz()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [quizStarted, timeLeft, quizCompleted])

  const fetchQuiz = async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching quiz:', quizId)
      
      const response = await api.get(`/quizzes/${quizId}/`)
      
      console.log('✅ Quiz API Response:', response.data)
      
      // Handle the response format {"quiz": {...}}
      const quizData = response.data.quiz || response.data
      
      if (!quizData.questions || quizData.questions.length === 0) {
        throw new Error('No questions found in quiz')
      }
      
      setQuiz(quizData)
      setTimeLeft(quizData.time_limit * 60) // Convert minutes to seconds
      
      console.log('✅ Quiz loaded:', quizData.name, 'Questions:', quizData.questions.length)
    } catch (error: any) {
      console.error('❌ Failed to fetch quiz:', error)
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to load quiz",
        variant: "destructive",
      })
      router.push('/student/quiz-center')
    } finally {
      setLoading(false)
    }
  }

  const handleStartQuiz = () => {
    setQuizStarted(true)
    toast({
      title: "Quiz Started!",
      description: `You have ${quiz?.time_limit} minutes to complete the quiz.`,
    })
  }

  const handleAnswerSelect = (answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: answer,
    }))
  }

  const handleNext = () => {
    if (currentQuestion < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestion((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  const handleSubmitQuiz = async () => {
    if (!quiz) return

    try {
      console.log('📤 Submitting quiz...', { quizId, answers })
      
      // Submit to backend using the custom action endpoint
      const response = await api.post(`/quizzes/${quizId}/submit/`, {
        answers,
        offline_mode: false,
      })

      console.log('✅ Quiz submission response:', response.data)

      setScore(response.data.score)
      setCorrectCount(response.data.correct_answers)
      setQuizCompleted(true)

      toast({
        title: "Quiz Submitted!",
        description: `You scored ${response.data.score.toFixed(1)}%`,
      })
    } catch (error: any) {
      console.error('❌ Failed to submit quiz:', error)
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to submit quiz",
        variant: "destructive",
      })
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getText = (en: string, pa: string) => {
    return language === 'pa' && pa ? pa : en
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Quiz Not Found</CardTitle>
            <CardDescription>The quiz you're looking for doesn't exist.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/student/quiz-center')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Quiz Center
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Quiz Completed Screen
  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Trophy className="w-16 h-16 text-yellow-500" />
            </div>
            <CardTitle className="text-3xl">Quiz Completed!</CardTitle>
            <CardDescription>Here are your results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-6xl font-bold text-primary mb-2">
                {score.toFixed(1)}%
              </div>
              <p className="text-muted-foreground">
                {correctCount} / {quiz.questions.length} correct
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Performance</span>
                <span>{score >= 70 ? '✅ Passed' : '❌ Need Improvement'}</span>
              </div>
              <Progress value={score} />
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => router.push('/student/quiz-center')}
                className="flex-1"
                variant="outline"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Quizzes
              </Button>
              <Button
                onClick={() => window.location.reload()}
                className="flex-1"
              >
                Retake Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Quiz Start Screen
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="text-3xl">{quiz.name}</CardTitle>
            <CardDescription>Read the instructions before starting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-semibold">{quiz.time_limit} minutes</p>
                  <p className="text-sm text-muted-foreground">Time limit</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-semibold">{quiz.questions.length} questions</p>
                  <p className="text-sm text-muted-foreground">Total questions</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm">
                  <p className="font-semibold text-yellow-900">Instructions:</p>
                  <ul className="list-disc list-inside space-y-1 text-yellow-800">
                    <li>Answer all questions before submitting</li>
                    <li>You can navigate between questions</li>
                    <li>Quiz will auto-submit when time runs out</li>
                    <li>Make sure you have a stable connection</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {(['en', 'pa'] as const).map((lang) => (
                <Button
                  key={lang}
                  variant={language === lang ? "default" : "outline"}
                  onClick={() => setLanguage(lang)}
                  size="sm"
                >
                  {lang === 'en' ? 'English' : 'ਪੰਜਾਬੀ'}
                </Button>
              ))}
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => router.push('/student/quiz-center')}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleStartQuiz} className="flex-1">
                <Play className="w-4 h-4 mr-2" />
                Start Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Quiz Taking Screen
  const currentQ = quiz.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{quiz.name}</h1>
            <p className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </p>
          </div>
          <Badge variant={timeLeft < 60 ? "destructive" : "secondary"} className="text-lg px-4 py-2">
            <Clock className="w-4 h-4 mr-2" />
            {formatTime(timeLeft)}
          </Badge>
        </div>

        <Progress value={progress} />

        {/* Question Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              {getText(currentQ.text_en, currentQ.text_pa)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(currentQ.options).map(([key, value]) => (
              <button
                key={key}
                onClick={() => handleAnswerSelect(key)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  answers[currentQuestion] === key
                    ? 'border-primary bg-primary/10'
                    : 'border-gray-200 hover:border-primary/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    answers[currentQuestion] === key
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-300'
                  }`}>
                    {answers[currentQuestion] === key && <CheckCircle className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="font-semibold">{key}. </span>
                    <span>{value}</span>
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between gap-4">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            variant="outline"
          >
            Previous
          </Button>

          <div className="flex gap-2">
            {currentQuestion === quiz.questions.length - 1 ? (
              <Button onClick={handleSubmitQuiz} className="px-8">
                Submit Quiz
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
              </Button>
            )}
          </div>
        </div>

        {/* Question Navigator */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Question Navigator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-10 gap-2">
              {quiz.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`aspect-square rounded-lg border-2 text-sm font-semibold ${
                    answers[index]
                      ? 'bg-green-100 border-green-500'
                      : currentQuestion === index
                      ? 'bg-primary text-white border-primary'
                      : 'border-gray-200 hover:border-primary/50'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
