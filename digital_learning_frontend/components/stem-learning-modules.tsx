"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Calculator, Atom, FlaskConical, Microscope, Zap, TreePine, BookOpen, Play, Users, Award } from "lucide-react"

export function StemLanguagesDashboard() {
  const [language, setLanguage] = useState<"en" | "hi" | "pa">("en")
  const [selectedStream, setSelectedStream] = useState<"pcm" | "pcb" | "all">("all")
  const router = useRouter()

  const getText = (en: string, hi: string, pa: string) => {
    return language === "hi" ? hi : language === "pa" ? pa : en
  }

  // STEM subjects for rural higher secondary students (Classes 11-12)
  const stemSubjects = [
    {
      id: "mathematics",
      title: "Mathematics",
      titleHi: "गणित",
      titlePa: "ਗਣਿਤ",
      description: "Advanced mathematics for competitive exams (JEE, NEET)",
      descriptionHi: "प्रतियोगी परीक्षाओं के लिए उन्नत गणित (JEE, NEET)",
      descriptionPa: "ਪ੍ਰਤੀਯੋਗੀ ਪ੍ਰੀਖਿਆਵਾਂ ਲਈ ਉੱਨਤ ਗਣਿਤ (JEE, NEET)",
      icon: <Calculator className="w-6 h-6" />,
      color: "from-blue-500 to-indigo-600",
      chapters: 15,
      completed: 8,
      difficulty: "Advanced",
      stream: ["pcm", "pcb"],
      topics: ["Calculus", "Algebra", "Trigonometry", "Coordinate Geometry"]
    },
    {
      id: "physics",
      title: "Physics",
      titleHi: "भौतिकी",
      titlePa: "ਭੌਤਿਕ ਵਿਗਿਆਨ",
      description: "Applied Physics with practical experiments and theory",
      descriptionHi: "व्यावहारिक प्रयोगों और सिद्धांत के साथ अनुप्रयुक्त भौतिकी",
      descriptionPa: "ਪ੍ਰਯੋਗਾਤਮਕ ਅਤੇ ਸਿਧਾਂਤਕ ਭੌਤਿਕ ਵਿਗਿਆਨ",
      icon: <Atom className="w-6 h-6" />,
      color: "from-purple-500 to-pink-600",
      chapters: 18,
      completed: 12,
      difficulty: "Advanced",
      stream: ["pcm"],
      topics: ["Mechanics", "Thermodynamics", "Optics", "Modern Physics"]
    },
    {
      id: "chemistry",
      title: "Chemistry",
      titleHi: "रसायन विज्ञान",
      titlePa: "ਰਸਾਇਣ ਵਿਗਿਆਨ",
      description: "Organic, Inorganic & Physical Chemistry fundamentals",
      descriptionHi: "कार्बनिक, अकार्बनिक और भौतिक रसायन की मूल बातें",
      descriptionPa: "ਕਾਰਬਨਿਕ, ਅਕਾਰਬਨਿਕ ਅਤੇ ਭੌਤਿਕ ਰਸਾਇਣ ਦੀਆਂ ਬੁਨਿਆਦਾਂ",
      icon: <FlaskConical className="w-6 h-6" />,
      color: "from-green-500 to-teal-600",
      chapters: 16,
      completed: 10,
      difficulty: "Advanced",
      stream: ["pcm", "pcb"],
      topics: ["Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry"]
    },
    {
      id: "biology",
      title: "Biology",
      titleHi: "जीव विज्ञान",
      titlePa: "ਜੀਵ ਵਿਗਿਆਨ",
      description: "Life sciences for NEET and medical entrance preparation",
      descriptionHi: "NEET और मेडिकल प्रवेश की तैयारी के लिए जीव विज्ञान",
      descriptionPa: "NEET ਅਤੇ ਮੈਡੀਕਲ ਪ੍ਰਵੇਸ਼ ਦੀ ਤਿਆਰੀ ਲਈ ਜੀਵ ਵਿਗਿਆਨ",
      icon: <Microscope className="w-6 h-6" />,
      color: "from-emerald-500 to-green-600",
      chapters: 20,
      completed: 14,
      difficulty: "Advanced",
      stream: ["pcb"],
      topics: ["Botany", "Zoology", "Human Physiology", "Genetics"]
    },
    {
      id: "english",
      title: "English Communication",
      titleHi: "अंग्रेजी संचार",
      titlePa: "ਅੰਗਰੇਜ਼ੀ ਸੰਚਾਰ",
      description: "Technical English for STEM careers and higher studies",
      descriptionHi: "STEM करियर और उच्च शिक्षा के लिए तकनीकी अंग्रेजी",
      descriptionPa: "STEM ਕਰੀਅਰ ਅਤੇ ਉੱਚ ਸਿੱਖਿਆ ਲਈ ਤਕਨੀਕੀ ਅੰਗਰੇਜ਼ੀ",
      icon: <BookOpen className="w-6 h-6" />,
      color: "from-orange-500 to-red-600",
      chapters: 12,
      completed: 9,
      difficulty: "Intermediate",
      stream: ["pcm", "pcb"],
      topics: ["Scientific Writing", "Technical Vocabulary", "Communication Skills"]
    },
    {
      id: "computer-science",
      title: "Computer Science",
      titleHi: "कंप्यूटर साइंस",
      titlePa: "ਕੰਪਿਊਟਰ ਸਾਇੰਸ",
      description: "Programming basics and computational thinking",
      descriptionHi: "प्रोग्रामिंग की बुनियादी बातें और कम्प्यूटेशनल सोच",
      descriptionPa: "ਪ੍ਰੋਗਰਾਮਿੰਗ ਦੀਆਂ ਬੁਨਿਆਦਾਂ ਅਤੇ ਕੰਪਿਊਟੇਸ਼ਨਲ ਸੋਚ",
      icon: <Zap className="w-6 h-6" />,
      color: "from-cyan-500 to-blue-600",
      chapters: 10,
      completed: 6,
      difficulty: "Beginner",
      stream: ["pcm"],
      topics: ["Python Basics", "Problem Solving", "Logic Building"]
    }
  ]

  // Filter subjects based on selected stream
  const filteredSubjects = selectedStream === "all" 
    ? stemSubjects 
    : stemSubjects.filter(subject => subject.stream.includes(selectedStream))

  const handleSubjectClick = (subjectId: string) => {
    // For now, show a message. Later, navigate to individual subject pages
    const subject = stemSubjects.find(s => s.id === subjectId)
    if (subject) {
      alert(getText(
        `Opening ${subject.title} - ${subject.chapters} chapters available`,
        `${subject.titleHi} खोला जा रहा है - ${subject.chapters} अध्याय उपलब्ध हैं`,
        `${subject.titlePa} ਖੋਲਿਆ ਜਾ ਰਿਹਾ ਹੈ - ${subject.chapters} ਅਧਿਆਇ ਉਪਲਬਧ ਹਨ`
      ))
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/student/dashboard')}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {getText("Back to Hub", "हब पर वापस", "ਹੱਬ ਵਿੱਚ ਵਾਪਸ")}
              </Button>
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <TreePine className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-balance">
                  {getText("STEM Subjects", "STEM विषय", "STEM ਵਿਸ਼ੇ")}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {getText("Higher Secondary (Classes 11-12) for Rural Students", "ग्रामीण छात्रों के लिए उच्चतर माध्यमिक (कक्षा 11-12)", "ਪੇਂਡੂ ਵਿਦਿਆਰਥੀਆਂ ਲਈ ਉੱਚ ਸਿੱਖਿਆ (ਜਮਾਤ 11-12)")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Stream Filter */}
              <div className="flex bg-muted rounded-lg p-1">
                <Button
                  variant={selectedStream === "all" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedStream("all")}
                  className="text-xs px-3"
                >
                  {getText("All", "सभी", "ਸਭ")}
                </Button>
                <Button
                  variant={selectedStream === "pcm" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedStream("pcm")}
                  className="text-xs px-3"
                >
                  PCM
                </Button>
                <Button
                  variant={selectedStream === "pcb" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedStream("pcb")}
                  className="text-xs px-3"
                >
                  PCB
                </Button>
              </div>

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
        {/* Stream Information */}
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              {getText("Stream Information", "स्ट्रीम जानकारी", "ਸਟਰੀਮ ਜਾਣਕਾਰੀ")}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-600">PCM (Physics, Chemistry, Mathematics)</h4>
              <p className="text-sm text-muted-foreground">
                {getText(
                  "For Engineering, Architecture, and Technology careers",
                  "इंजीनियरिंग, आर्किटेक्चर और प्रौद्योगिकी करियर के लिए",
                  "ਇੰਜੀਨੀਅਰਿੰਗ, ਆਰਕੀਟੈਕਚਰ ਅਤੇ ਤਕਨਾਲੋਜੀ ਕਰੀਅਰ ਲਈ"
                )}
              </p>
              <Badge variant="secondary">JEE Preparation</Badge>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">PCB (Physics, Chemistry, Biology)</h4>
              <p className="text-sm text-muted-foreground">
                {getText(
                  "For Medical, Pharmacy, and Life Sciences careers",
                  "मेडिकल, फार्मेसी और जीव विज्ञान करियर के लिए",
                  "ਮੈਡੀਕਲ, ਫਾਰਮੇਸੀ ਅਤੇ ਲਾਇਫ ਸਾਇੰਸ ਕਰੀਅਰ ਲਈ"
                )}
              </p>
              <Badge variant="secondary">NEET Preparation</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Subjects Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {getText("Available Subjects", "उपलब्ध विषय", "ਉਪਲਬਧ ਵਿਸ਼ੇ")} 
              {selectedStream !== "all" && (
                <span className="text-primary ml-2">({selectedStream.toUpperCase()} Stream)</span>
              )}
            </h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              {getText("Designed for Rural Students", "ग्रामीण छात्रों के लिए डिज़ाइन किया गया", "ਪੇਂਡੂ ਵਿਦਿਆਰਥੀਆਂ ਲਈ ਡਿਜ਼ਾਈਨ ਕੀਤਾ ਗਿਆ")}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredSubjects.map((subject) => {
              const progressPercentage = (subject.completed / subject.chapters) * 100

              return (
                <Card 
                  key={subject.id} 
                  className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                  onClick={() => handleSubjectClick(subject.id)}
                >
                  <div className={`h-2 bg-gradient-to-r ${subject.color}`}></div>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${subject.color} text-white`}>
                            {subject.icon}
                          </div>
                          <div>
                            <CardTitle className="text-base text-balance">
                              {getText(subject.title, subject.titleHi, subject.titlePa)}
                            </CardTitle>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {subject.difficulty}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {subject.chapters} {getText("Chapters", "अध्याय", "ਅਧਿਆਇ")}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Play className="w-5 h-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-4">
                    <p className="text-sm text-muted-foreground text-pretty">
                      {getText(subject.description, subject.descriptionHi, subject.descriptionPa)}
                    </p>
                    
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>{getText("Progress", "प्रगति", "ਤਰੱਕੀ")}</span>
                        <span className="font-medium">{subject.completed}/{subject.chapters}</span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                    </div>

                    {/* Key Topics */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-muted-foreground">
                        {getText("Key Topics:", "मुख्य विषय:", "ਮੁੱਖ ਵਿਸ਼ੇ:")}
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {subject.topics.slice(0, 3).map((topic, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                        {subject.topics.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{subject.topics.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Button size="sm" className="w-full">
                      {progressPercentage > 0 
                        ? getText("Continue Learning", "सीखना जारी रखें", "ਸਿੱਖਣਾ ਜਾਰੀ ਰੱਖੋ")
                        : getText("Start Learning", "सीखना शुरू करें", "ਸਿੱਖਣਾ ਸ਼ੁਰੂ ਕਰੋ")
                      }
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Competitive Exam Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-accent" />
              {getText("Competitive Exam Preparation", "प्रतियोगी परीक्षा की तैयारी", "ਪ੍ਰਤੀਯੋਗੀ ਪ੍ਰੀਖਿਆ ਦੀ ਤਿਆਰੀ")}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-600">JEE (Joint Entrance Examination)</h4>
              <p className="text-sm text-muted-foreground">
                {getText(
                  "For admission to IITs, NITs, and other engineering colleges",
                  "IIT, NIT और अन्य इंजीनियरिंग कॉलेजों में प्रवेश के लिए",
                  "IIT, NIT ਅਤੇ ਹੋਰ ਇੰਜੀਨੀਅਰਿੰਗ ਕਾਲਜਾਂ ਵਿੱਚ ਦਾਖਲੇ ਲਈ"
                )}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">NEET (National Eligibility cum Entrance Test)</h4>
              <p className="text-sm text-muted-foreground">
                {getText(
                  "For admission to medical and dental colleges across India",
                  "भारत भर में मेडिकल और डेंटल कॉलेजों में प्रवेश के लिए",
                  "ਭਾਰਤ ਭਰ ਵਿੱਚ ਮੈਡੀਕਲ ਅਤੇ ਡੈਂਟਲ ਕਾਲਜਾਂ ਵਿੱਚ ਦਾਖਲੇ ਲਈ"
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
