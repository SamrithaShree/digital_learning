"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { NavigationHeader } from "@/components/navigation-header"
import { Play, Pause, CheckCircle, Download, Volume2 } from "lucide-react"

interface LessonDetailPageProps {
  lessonId: string
}

export function LessonDetailPage({ lessonId }: LessonDetailPageProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [language, setLanguage] = useState("english")
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(300) // 5 minutes
  const [volume, setVolume] = useState(50)

  // Mock lesson data - in real app, fetch from API
  const lesson = {
    id: lessonId,
    title:
      language === "hindi"
        ? "कंप्यूटर का परिचय"
        : language === "punjabi"
          ? "ਕੰਪਿਊਟਰ ਦੀ ਜਾਣ-ਪਛਾਣ"
          : "Introduction to Computers",
    description:
      language === "hindi"
        ? "कंप्यूटर के बुनियादी भागों और उनके कार्यों को समझें"
        : language === "punjabi"
          ? "ਕੰਪਿਊਟਰ ਦੇ ਬੁਨਿਆਦੀ ਹਿੱਸਿਆਂ ਅਤੇ ਉਨ੍ਹਾਂ ਦੇ ਕੰਮਾਂ ਨੂੰ ਸਮਝੋ"
          : "Learn about basic computer parts and their functions",
    duration: "15 min",
    difficulty: "Beginner",
    content: [
      {
        type: "video",
        title: language === "hindi" ? "कंप्यूटर क्या है?" : language === "punjabi" ? "ਕੰਪਿਊਟਰ ਕੀ ਹੈ?" : "What is a Computer?",
        duration: "5 min",
      },
      {
        type: "text",
        title: language === "hindi" ? "कंप्यूटर के भाग" : language === "punjabi" ? "ਕੰਪਿਊਟਰ ਦੇ ਹਿੱਸੇ" : "Computer Parts",
        duration: "7 min",
      },
      {
        type: "quiz",
        title: language === "hindi" ? "अभ्यास प्रश्न" : language === "punjabi" ? "ਅਭਿਆਸ ਸਵਾਲ" : "Practice Questions",
        duration: "3 min",
      },
    ],
  }

  const handleComplete = () => {
    setIsCompleted(true)
    setProgress(100)
    // In real app, save progress to backend
    console.log("[v0] Lesson completed:", lessonId)
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
    if (!isPlaying) {
      // Simulate video progress
      const interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false)
            setProgress(100)
            clearInterval(interval)
            return duration
          }
          const newTime = prev + 1
          setProgress((newTime / duration) * 100)
          return newTime
        })
      }, 1000)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-teal-50">
      <NavigationHeader title={lesson.title} backUrl="/get-started" />

      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 mb-4">{lesson.description}</p>
                <div className="flex items-center gap-4">
                  <Badge variant="secondary">{lesson.duration}</Badge>
                  <Badge variant="outline">{lesson.difficulty}</Badge>
                  {isCompleted && (
                    <Badge className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {language === "hindi" ? "पूर्ण" : language === "punjabi" ? "ਪੂਰਾ" : "Completed"}
                    </Badge>
                  )}
                </div>
              </div>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                {language === "hindi" ? "डाउनलोड" : language === "punjabi" ? "ਡਾਊਨਲੋਡ" : "Download"}
              </Button>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">
                  {language === "hindi" ? "प्रगति" : language === "punjabi" ? "ਤਰੱਕੀ" : "Progress"}
                </span>
                <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {language === "hindi" ? "पाठ सामग्री" : language === "punjabi" ? "ਪਾਠ ਸਮੱਗਰੀ" : "Lesson Content"}
                    <Button variant="outline" size="sm" onClick={togglePlayPause}>
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-gray-900 rounded-lg flex flex-col justify-between p-4 mb-4">
                    <div className="flex-1 flex items-center justify-center">
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={togglePlayPause}
                        className="text-white hover:bg-white/20"
                      >
                        {isPlaying ? <Pause className="h-16 w-16" /> : <Play className="h-16 w-16" />}
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-white text-sm">
                        <span>{formatTime(currentTime)}</span>
                        <Progress value={(currentTime / duration) * 100} className="flex-1" />
                        <span>{formatTime(duration)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Volume2 className="h-4 w-4 text-white" />
                          <Progress value={volume} className="w-20" />
                        </div>
                        <Badge variant="secondary">
                          {language === "hindi" ? "HD गुणवत्ता" : language === "punjabi" ? "HD ਗੁਣਵੱਤਾ" : "HD Quality"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg mb-4">
                    <Button variant="outline" size="sm" onClick={togglePlayPause}>
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Volume2 className="h-4 w-4" />
                    <span className="text-sm">
                      {language === "hindi"
                        ? "ऑडियो संस्करण उपलब्ध"
                        : language === "punjabi"
                          ? "ਆਡੀਓ ਸੰਸਕਰਣ ਉਪਲਬਧ"
                          : "Audio version available"}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4" />
                      <span className="text-sm">
                        {language === "hindi"
                          ? "ऑडियो उपलब्ध"
                          : language === "punjabi"
                            ? "ਆਡੀਓ ਉਪਲਬਧ"
                            : "Audio Available"}
                      </span>
                    </div>

                    <div className="prose max-w-none">
                      <h3>{lesson.content[1].title}</h3>
                      <p>
                        {language === "hindi"
                          ? "कंप्यूटर एक इलेक्ट्रॉनिक मशीन है जो डेटा को प्रोसेस करती है। इसके मुख्य भाग हैं: मॉनिटर, कीबोर्ड, माउस, और सीपीयू।"
                          : language === "punjabi"
                            ? "ਕੰਪਿਊਟਰ ਇੱਕ ਇਲੈਕਟ੍ਰਾਨਿਕ ਮਸ਼ੀਨ ਹੈ ਜੋ ਡੇਟਾ ਨੂੰ ਪ੍ਰੋਸੈਸ ਕਰਦੀ ਹੈ। ਇਸਦੇ ਮੁੱਖ ਹਿੱਸੇ ਹਨ: ਮਾਨੀਟਰ, ਕੀਬੋਰਡ, ਮਾਊਸ, ਅਤੇ ਸੀਪੀਯੂ।"
                            : "A computer is an electronic machine that processes data. Its main parts are: monitor, keyboard, mouse, and CPU."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === "hindi" ? "पाठ की रूपरेखा" : language === "punjabi" ? "ਪਾਠ ਦੀ ਰੂਪਰੇਖਾ" : "Lesson Outline"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {lesson.content.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.title}</h4>
                          <p className="text-xs text-gray-600">{item.duration}</p>
                        </div>
                        {index === 0 && <CheckCircle className="h-4 w-4 text-green-500" />}
                      </div>
                    ))}
                  </div>

                  <Button
                    className="w-full mt-4 bg-orange-500 hover:bg-orange-600"
                    onClick={handleComplete}
                    disabled={isCompleted}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {language === "hindi" ? "पूर्ण" : language === "punjabi" ? "ਪੂਰਾ" : "Completed"}
                      </>
                    ) : language === "hindi" ? (
                      "पाठ पूरा करें"
                    ) : language === "punjabi" ? (
                      "ਪਾਠ ਪੂਰਾ ਕਰੋ"
                    ) : (
                      "Complete Lesson"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
