"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, ArrowRight, RotateCcw } from "lucide-react"
import { useRouter } from "next/navigation"

export function QuizPage() {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const [showResult, setShowResult] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [language, setLanguage] = useState("english")

  const questions = [
    {
      question:
        language === "hindi"
          ? "कंप्यूटर का मुख्य भाग कौन सा है?"
          : language === "punjabi"
            ? "ਕੰਪਿਊਟਰ ਦਾ ਮੁੱਖ ਹਿੱਸਾ ਕਿਹੜਾ ਹੈ?"
            : "What is the main part of a computer?",
      options: [
        language === "hindi" ? "मॉनिटर" : language === "punjabi" ? "ਮਾਨੀਟਰ" : "Monitor",
        language === "hindi" ? "सीपीयू" : language === "punjabi" ? "ਸੀਪੀਯੂ" : "CPU",
        language === "hindi" ? "कीबोर्ड" : language === "punjabi" ? "ਕੀਬੋਰਡ" : "Keyboard",
        language === "hindi" ? "माउस" : language === "punjabi" ? "ਮਾਊਸ" : "Mouse",
      ],
      correct: 1,
    },
    {
      question:
        language === "hindi"
          ? "इंटरनेट का उपयोग करते समय सबसे महत्वपूर्ण बात क्या है?"
          : language === "punjabi"
            ? "ਇੰਟਰਨੈਟ ਦੀ ਵਰਤੋਂ ਕਰਦੇ ਸਮੇਂ ਸਭ ਤੋਂ ਮਹੱਤਵਪੂਰਨ ਗੱਲ ਕੀ ਹੈ?"
            : "What is most important when using the internet?",
      options: [
        language === "hindi" ? "तेज़ी से काम करना" : language === "punjabi" ? "ਤੇਜ਼ੀ ਨਾਲ ਕੰਮ ਕਰਨਾ" : "Working fast",
        language === "hindi" ? "सुरक्षा" : language === "punjabi" ? "ਸੁਰੱਖਿਆ" : "Safety",
        language === "hindi" ? "मनोरंजन" : language === "punjabi" ? "ਮਨੋਰੰਜਨ" : "Entertainment",
        language === "hindi" ? "खरीदारी" : language === "punjabi" ? "ਖਰੀਦਦਾਰੀ" : "Shopping",
      ],
      correct: 1,
    },
    {
      question:
        language === "hindi"
          ? "फ़ाइल को सेव करने के लिए कौन सा शॉर्टकट उपयोग करते हैं?"
          : language === "punjabi"
            ? "ਫਾਈਲ ਨੂੰ ਸੇਵ ਕਰਨ ਲਈ ਕਿਹੜਾ ਸ਼ਾਰਟਕੱਟ ਵਰਤਦੇ ਹਾਂ?"
            : "Which shortcut is used to save a file?",
      options: ["Ctrl + S", "Ctrl + C", "Ctrl + V", "Ctrl + Z"],
      correct: 0,
    },
  ]

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
  }

  const handleNext = () => {
    if (selectedAnswer !== null) {
      const newAnswers = [...answers, selectedAnswer]
      setAnswers(newAnswers)

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(null)
      } else {
        setQuizCompleted(true)
        setShowResult(true)
      }
    }
  }

  const calculateScore = () => {
    return answers.reduce((score, answer, index) => {
      return score + (answer === questions[index].correct ? 1 : 0)
    }, 0)
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setAnswers([])
    setShowResult(false)
    setQuizCompleted(false)
  }

  if (showResult) {
    const score = calculateScore()
    const percentage = Math.round((score / questions.length) * 100)
    const passed = percentage >= 70

    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-teal-50 p-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div
                className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${passed ? "bg-green-100" : "bg-red-100"}`}
              >
                {passed ? (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-500" />
                )}
              </div>
              <CardTitle className="text-2xl">
                {language === "hindi" ? "क्विज़ पूर्ण!" : language === "punjabi" ? "ਕਵਿਜ਼ ਪੂਰਾ!" : "Quiz Complete!"}
              </CardTitle>
              <CardDescription>
                {language === "hindi"
                  ? `आपका स्कोर: ${score}/${questions.length} (${percentage}%)`
                  : language === "punjabi"
                    ? `ਤੁਹਾਡਾ ਸਕੋਰ: ${score}/${questions.length} (${percentage}%)`
                    : `Your Score: ${score}/${questions.length} (${percentage}%)`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Badge className={passed ? "bg-green-500" : "bg-red-500"}>
                {passed
                  ? language === "hindi"
                    ? "पास!"
                    : language === "punjabi"
                      ? "ਪਾਸ!"
                      : "Passed!"
                  : language === "hindi"
                    ? "फेल"
                    : language === "punjabi"
                      ? "ਫੇਲ"
                      : "Failed"}
              </Badge>

              <div className="space-y-2">
                {questions.map((question, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    {answers[index] === question.correct ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span>
                      {language === "hindi"
                        ? `प्रश्न ${index + 1}`
                        : language === "punjabi"
                          ? `ਸਵਾਲ ${index + 1}`
                          : `Question ${index + 1}`}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button onClick={resetQuiz} variant="outline" className="flex-1 bg-transparent">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {language === "hindi" ? "फिर से कोशिश करें" : language === "punjabi" ? "ਫਿਰ ਕੋਸ਼ਿਸ਼ ਕਰੋ" : "Try Again"}
                </Button>
                <Button onClick={() => router.push("/")} className="flex-1 bg-orange-500 hover:bg-orange-600">
                  {language === "hindi" ? "होम पर जाएं" : language === "punjabi" ? "ਘਰ ਜਾਓ" : "Go Home"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-teal-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">
              {language === "hindi"
                ? "डिजिटल साक्षरता क्विज़"
                : language === "punjabi"
                  ? "ਡਿਜੀਟਲ ਸਾਖਰਤਾ ਕਵਿਜ਼"
                  : "Digital Literacy Quiz"}
            </h1>
            <Badge variant="outline">
              {currentQuestion + 1}/{questions.length}
            </Badge>
          </div>
          <Progress value={((currentQuestion + 1) / questions.length) * 100} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{questions[currentQuestion].question}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full p-4 text-left rounded-lg border transition-colors ${
                    selectedAnswer === index
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${
                        selectedAnswer === index ? "border-orange-500 bg-orange-500" : "border-gray-300"
                      }`}
                    >
                      {selectedAnswer === index && <div className="w-full h-full rounded-full bg-white scale-50"></div>}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>

            <Button
              onClick={handleNext}
              disabled={selectedAnswer === null}
              className="w-full mt-6 bg-orange-500 hover:bg-orange-600"
            >
              {currentQuestion === questions.length - 1
                ? language === "hindi"
                  ? "समाप्त करें"
                  : language === "punjabi"
                    ? "ਖਤਮ ਕਰੋ"
                    : "Finish"
                : language === "hindi"
                  ? "अगला"
                  : language === "punjabi"
                    ? "ਅਗਲਾ"
                    : "Next"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
