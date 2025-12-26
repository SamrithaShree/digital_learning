"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { VideoPlayer } from "../shared/video-player"
import { ArrowLeft, TreePine, Play, Award, Video as VideoIcon, List, Users } from "lucide-react"

interface Video {
  id: number;
  title: string;
  title_hi: string;
  title_pa: string;
  description: string;
  description_hi: string;
  description_pa: string;
  category_name: string;
  category_type: string;
  difficulty: string;
  video_url: string;
  view_count: number;
  duration_minutes: number;
  thumbnail_url: string;
  is_completed: boolean;
  progress_percentage: number;
}

export function StemLanguagesDashboard() {
  const [language, setLanguage] = useState<"en" | "hi" | "pa">("en")
  const [videos, setVideos] = useState<Video[]>([])
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [selectedStream, setSelectedStream] = useState<"pcm" | "pcb" | "all">("all")
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"list" | "player">("list")
  
  const router = useRouter()

  const getText = (en: string, hi: string, pa: string) => {
    return language === "hi" ? hi : language === "pa" ? pa : en
  }

  useEffect(() => {
    fetchVideos()
  }, [language, selectedStream])

  const fetchVideos = async () => {
    try {
      const response = await api.get('/api/videos/', {
        params: {
          category: selectedStream === 'all' ? 'stem' : selectedStream,
          lang: language
        }
      })
      setVideos(response.data.videos || [])
    } catch (error) {
      console.error("Failed to fetch videos:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video)
    setViewMode("player")
  }

  const handleProgressUpdate = async (progressData: any) => {
    if (!selectedVideo) return
    
    try {
      await api.post(`/videos/${selectedVideo.id}/progress/`, progressData)
      setVideos(prev => prev.map(v => 
        v.id === selectedVideo.id 
          ? { ...v, progress_percentage: progressData.completion_percentage }
          : v
      ))
    } catch (error) {
      console.error("Failed to update progress:", error)
    }
  }

  // Group videos by subject
  const videosBySubject = videos.reduce((acc, video) => {
    const subject = video.category_type
    if (!acc[subject]) acc[subject] = []
    acc[subject].push(video)
    return acc
  }, {} as Record<string, Video[]>)

  const subjectColors = {
    mathematics: "from-blue-500 to-indigo-600",
    physics: "from-purple-500 to-pink-600", 
    chemistry: "from-green-500 to-teal-600",
    biology: "from-emerald-500 to-green-600"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p>Loading STEM content...</p>
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
              {viewMode === "player" ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {getText("Back to Videos", "वीडियो पर वापस", "ਵੀਡੀਓ ਵਿੱਚ ਵਾਪਸ")}
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/student/dashboard')}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {getText("Back to Hub", "हब पर वापस", "ਹੱਬ ਵਿੱਚ ਵਾਪਸ")}
                </Button>
              )}
              
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <TreePine className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-balance">
                  {getText("STEM Subjects", "STEM विषय", "STEM ਵਿਸ਼ੇ")}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {getText("Higher Secondary Video Lessons", "उच्चतर माध्यमिक वीडियो पाठ", "ਉੱਚ ਸਿੱਖਿਆ ਵੀਡੀਓ ਪਾਠ")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Stream Filter */}
              {viewMode === "list" && (
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
              )}

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

      <main className="container mx-auto px-4 py-6">
        {viewMode === "player" && selectedVideo ? (
          /* Video Player View */
          <VideoPlayer
            video={selectedVideo}
            language={language}
            onProgressUpdate={handleProgressUpdate}
          />
        ) : (
          /* Subject-wise Video List */
          <div className="space-y-8">
            {/* Stream Information */}
            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  {getText("Career Streams", "करियर स्ट्रीम", "ਕਰੀਅਰ ਸਟਰੀਮ")}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-semibold text-blue-600">PCM (Physics, Chemistry, Mathematics)</h4>
                  <p className="text-sm text-muted-foreground">
                    {getText(
                      "Engineering, Architecture, Technology careers",
                      "इंजीनियरिंग, आर्किटेक्चर, प्रौद्योगिकी करियर",
                      "ਇੰਜੀਨੀਅਰਿੰਗ, ਆਰਕੀਟੈਕਚਰ, ਤਕਨਾਲੋਜੀ ਕਰੀਅਰ"
                    )}
                  </p>
                  <Badge variant="secondary">JEE Preparation</Badge>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-600">PCB (Physics, Chemistry, Biology)</h4>
                  <p className="text-sm text-muted-foreground">
                    {getText(
                      "Medical, Pharmacy, Life Sciences careers",
                      "मेडिकल, फार्मेसी, जीव विज्ञान करियर",
                      "ਮੈਡੀਕਲ, ਫਾਰਮੇਸੀ, ਲਾਇਫ ਸਾਇੰਸ ਕਰੀਅਰ"
                    )}
                  </p>
                  <Badge variant="secondary">NEET Preparation</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Videos by Subject */}
            {Object.entries(videosBySubject).map(([subject, subjectVideos]) => (
              <div key={subject} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <VideoIcon className="w-5 h-5 text-primary" />
                    {getText(
                      subject.charAt(0).toUpperCase() + subject.slice(1),
                      subject === 'mathematics' ? 'गणित' :
                      subject === 'physics' ? 'भौतिकी' :  
                      subject === 'chemistry' ? 'रसायन विज्ञान' :
                      subject === 'biology' ? 'जीव विज्ञान' : subject,
                      subject === 'mathematics' ? 'ਗਣਿਤ' :
                      subject === 'physics' ? 'ਭੌਤਿਕ ਵਿਗਿਆਨ' :
                      subject === 'chemistry' ? 'ਰਸਾਇਣ ਵਿਗਿਆਨ' :
                      subject === 'biology' ? 'ਜੀਵ ਵਿਗਿਆਨ' : subject
                    )} {getText("Videos", "वीडियो", "ਵੀਡੀਓ")}
                  </h2>
                  <Badge variant="outline">{subjectVideos.length} {getText("videos", "वीडियो", "ਵੀਡੀਓ")}</Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {subjectVideos.map((video) => (
                    <Card
                      key={video.id}
                      className="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
                      onClick={() => handleVideoSelect(video)}
                    >
                      <div className={`h-2 bg-gradient-to-r ${subjectColors[subject as keyof typeof subjectColors] || 'from-gray-500 to-gray-600'}`}></div>
                      
                      {/* Video Thumbnail */}
                      <div className="relative aspect-video bg-muted overflow-hidden">
                        {video.thumbnail_url ? (
                          <img 
                            src={video.thumbnail_url} 
                            alt={getText(video.title, video.title_hi, video.title_pa)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${subjectColors[subject as keyof typeof subjectColors]}/20`}>
                            <VideoIcon className="w-12 h-12 text-primary" />
                          </div>
                        )}
                        
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                            <Play className="w-8 h-8 text-primary ml-1" />
                          </div>
                        </div>
                        
                        <Badge className="absolute bottom-2 right-2 bg-black/70 text-white">
                          {video.duration_minutes}m
                        </Badge>
                      </div>

                      <CardHeader className="pb-2">
                        <CardTitle className="text-base text-balance leading-tight">
                          {getText(video.title, video.title_hi, video.title_pa)}
                        </CardTitle>
                        <div className="flex gap-2">
                          <Badge variant={
                            video.difficulty === 'beginner' ? 'secondary' : 
                            video.difficulty === 'intermediate' ? 'default' : 'destructive'
                          }>
                            {video.difficulty}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0 space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {getText(video.description, video.description_hi, video.description_pa)}
                        </p>
                        
                        {video.progress_percentage > 0 && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>{getText("Progress", "प्रगति", "ਤਰੱਕੀ")}</span>
                              <span className="font-medium">{Math.round(video.progress_percentage)}%</span>
                            </div>
                            <Progress value={video.progress_percentage} className="h-1" />
                          </div>
                        )}

                        <Button size="sm" className="w-full">
                          {video.is_completed 
                            ? getText("Watch Again", "फिर देखें", "ਦੁਬਾਰਾ ਵੇਖੋ")
                            : video.progress_percentage > 0
                              ? getText("Continue", "जारी रखें", "ਜਾਰੀ ਰੱਖੋ")
                              : getText("Start Video", "वीडियो शुरू करें", "ਵੀਡੀਓ ਸ਼ੁਰੂ ਕਰੋ")
                          }
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}

            {videos.length === 0 && (
              <div className="text-center py-12">
                <VideoIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {getText("No videos available", "कोई वीडियो उपलब्ध नहीं", "ਕੋਈ ਵੀਡੀਓ ਉਪਲਬਧ ਨਹੀਂ")}
                </h3>
                <p className="text-muted-foreground">
                  {getText("Video content will be added soon", "वीडियो सामग्री जल्द ही जोड़ी जाएगी", "ਵੀਡੀਓ ਸਮੱਗਰੀ ਜਲਦੀ ਜੋੜੀ ਜਾਵੇਗੀ")}
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

// "use client"

// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Progress } from "@/components/ui/progress"
// import { ArrowLeft, Calculator, Atom, FlaskConical, Microscope, Zap, TreePine, BookOpen, Play, Users, Award } from "lucide-react"

// export function StemLanguagesDashboard() {
//   const [language, setLanguage] = useState<"en" | "hi" | "pa">("en")
//   const [selectedStream, setSelectedStream] = useState<"pcm" | "pcb" | "all">("all")
//   const router = useRouter()

//   const getText = (en: string, hi: string, pa: string) => {
//     return language === "hi" ? hi : language === "pa" ? pa : en
//   }

//   // STEM subjects for rural higher secondary students (Classes 11-12)
//   const stemSubjects = [
//     {
//       id: "mathematics",
//       title: "Mathematics",
//       titleHi: "गणित",
//       titlePa: "ਗਣਿਤ",
//       description: "Advanced mathematics for competitive exams (JEE, NEET)",
//       descriptionHi: "प्रतियोगी परीक्षाओं के लिए उन्नत गणित (JEE, NEET)",
//       descriptionPa: "ਪ੍ਰਤੀਯੋਗੀ ਪ੍ਰੀਖਿਆਵਾਂ ਲਈ ਉੱਨਤ ਗਣਿਤ (JEE, NEET)",
//       icon: <Calculator className="w-6 h-6" />,
//       color: "from-blue-500 to-indigo-600",
//       chapters: 15,
//       completed: 8,
//       difficulty: "Advanced",
//       stream: ["pcm", "pcb"],
//       topics: ["Calculus", "Algebra", "Trigonometry", "Coordinate Geometry"]
//     },
//     {
//       id: "physics",
//       title: "Physics",
//       titleHi: "भौतिकी",
//       titlePa: "ਭੌਤਿਕ ਵਿਗਿਆਨ",
//       description: "Applied Physics with practical experiments and theory",
//       descriptionHi: "व्यावहारिक प्रयोगों और सिद्धांत के साथ अनुप्रयुक्त भौतिकी",
//       descriptionPa: "ਪ੍ਰਯੋਗਾਤਮਕ ਅਤੇ ਸਿਧਾਂਤਕ ਭੌਤਿਕ ਵਿਗਿਆਨ",
//       icon: <Atom className="w-6 h-6" />,
//       color: "from-purple-500 to-pink-600",
//       chapters: 18,
//       completed: 12,
//       difficulty: "Advanced",
//       stream: ["pcm"],
//       topics: ["Mechanics", "Thermodynamics", "Optics", "Modern Physics"]
//     },
//     {
//       id: "chemistry",
//       title: "Chemistry",
//       titleHi: "रसायन विज्ञान",
//       titlePa: "ਰਸਾਇਣ ਵਿਗਿਆਨ",
//       description: "Organic, Inorganic & Physical Chemistry fundamentals",
//       descriptionHi: "कार्बनिक, अकार्बनिक और भौतिक रसायन की मूल बातें",
//       descriptionPa: "ਕਾਰਬਨਿਕ, ਅਕਾਰਬਨਿਕ ਅਤੇ ਭੌਤਿਕ ਰਸਾਇਣ ਦੀਆਂ ਬੁਨਿਆਦਾਂ",
//       icon: <FlaskConical className="w-6 h-6" />,
//       color: "from-green-500 to-teal-600",
//       chapters: 16,
//       completed: 10,
//       difficulty: "Advanced",
//       stream: ["pcm", "pcb"],
//       topics: ["Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry"]
//     },
//     {
//       id: "biology",
//       title: "Biology",
//       titleHi: "जीव विज्ञान",
//       titlePa: "ਜੀਵ ਵਿਗਿਆਨ",
//       description: "Life sciences for NEET and medical entrance preparation",
//       descriptionHi: "NEET और मेडिकल प्रवेश की तैयारी के लिए जीव विज्ञान",
//       descriptionPa: "NEET ਅਤੇ ਮੈਡੀਕਲ ਪ੍ਰਵੇਸ਼ ਦੀ ਤਿਆਰੀ ਲਈ ਜੀਵ ਵਿਗਿਆਨ",
//       icon: <Microscope className="w-6 h-6" />,
//       color: "from-emerald-500 to-green-600",
//       chapters: 20,
//       completed: 14,
//       difficulty: "Advanced",
//       stream: ["pcb"],
//       topics: ["Botany", "Zoology", "Human Physiology", "Genetics"]
//     },
//     {
//       id: "english",
//       title: "English Communication",
//       titleHi: "अंग्रेजी संचार",
//       titlePa: "ਅੰਗਰੇਜ਼ੀ ਸੰਚਾਰ",
//       description: "Technical English for STEM careers and higher studies",
//       descriptionHi: "STEM करियर और उच्च शिक्षा के लिए तकनीकी अंग्रेजी",
//       descriptionPa: "STEM ਕਰੀਅਰ ਅਤੇ ਉੱਚ ਸਿੱਖਿਆ ਲਈ ਤਕਨੀਕੀ ਅੰਗਰੇਜ਼ੀ",
//       icon: <BookOpen className="w-6 h-6" />,
//       color: "from-orange-500 to-red-600",
//       chapters: 12,
//       completed: 9,
//       difficulty: "Intermediate",
//       stream: ["pcm", "pcb"],
//       topics: ["Scientific Writing", "Technical Vocabulary", "Communication Skills"]
//     },
//     {
//       id: "computer-science",
//       title: "Computer Science",
//       titleHi: "कंप्यूटर साइंस",
//       titlePa: "ਕੰਪਿਊਟਰ ਸਾਇੰਸ",
//       description: "Programming basics and computational thinking",
//       descriptionHi: "प्रोग्रामिंग की बुनियादी बातें और कम्प्यूटेशनल सोच",
//       descriptionPa: "ਪ੍ਰੋਗਰਾਮਿੰਗ ਦੀਆਂ ਬੁਨਿਆਦਾਂ ਅਤੇ ਕੰਪਿਊਟੇਸ਼ਨਲ ਸੋਚ",
//       icon: <Zap className="w-6 h-6" />,
//       color: "from-cyan-500 to-blue-600",
//       chapters: 10,
//       completed: 6,
//       difficulty: "Beginner",
//       stream: ["pcm"],
//       topics: ["Python Basics", "Problem Solving", "Logic Building"]
//     }
//   ]

//   // Filter subjects based on selected stream
//   const filteredSubjects = selectedStream === "all" 
//     ? stemSubjects 
//     : stemSubjects.filter(subject => subject.stream.includes(selectedStream))

//   const handleSubjectClick = (subjectId: string) => {
//     // For now, show a message. Later, navigate to individual subject pages
//     const subject = stemSubjects.find(s => s.id === subjectId)
//     if (subject) {
//       alert(getText(
//         `Opening ${subject.title} - ${subject.chapters} chapters available`,
//         `${subject.titleHi} खोला जा रहा है - ${subject.chapters} अध्याय उपलब्ध हैं`,
//         `${subject.titlePa} ਖੋਲਿਆ ਜਾ ਰਿਹਾ ਹੈ - ${subject.chapters} ਅਧਿਆਇ ਉਪਲਬਧ ਹਨ`
//       ))
//     }
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
//         <div className="container mx-auto px-4 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => router.push('/student/dashboard')}
//                 className="gap-2"
//               >
//                 <ArrowLeft className="w-4 h-4" />
//                 {getText("Back to Hub", "हब पर वापस", "ਹੱਬ ਵਿੱਚ ਵਾਪਸ")}
//               </Button>
//               <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
//                 <TreePine className="w-6 h-6 text-primary-foreground" />
//               </div>
//               <div>
//                 <h1 className="text-xl font-bold text-balance">
//                   {getText("STEM Subjects", "STEM विषय", "STEM ਵਿਸ਼ੇ")}
//                 </h1>
//                 <p className="text-sm text-muted-foreground">
//                   {getText("Higher Secondary (Classes 11-12) for Rural Students", "ग्रामीण छात्रों के लिए उच्चतर माध्यमिक (कक्षा 11-12)", "ਪੇਂਡੂ ਵਿਦਿਆਰਥੀਆਂ ਲਈ ਉੱਚ ਸਿੱਖਿਆ (ਜਮਾਤ 11-12)")}
//                 </p>
//               </div>
//             </div>

//             <div className="flex items-center gap-3">
//               {/* Stream Filter */}
//               <div className="flex bg-muted rounded-lg p-1">
//                 <Button
//                   variant={selectedStream === "all" ? "default" : "ghost"}
//                   size="sm"
//                   onClick={() => setSelectedStream("all")}
//                   className="text-xs px-3"
//                 >
//                   {getText("All", "सभी", "ਸਭ")}
//                 </Button>
//                 <Button
//                   variant={selectedStream === "pcm" ? "default" : "ghost"}
//                   size="sm"
//                   onClick={() => setSelectedStream("pcm")}
//                   className="text-xs px-3"
//                 >
//                   PCM
//                 </Button>
//                 <Button
//                   variant={selectedStream === "pcb" ? "default" : "ghost"}
//                   size="sm"
//                   onClick={() => setSelectedStream("pcb")}
//                   className="text-xs px-3"
//                 >
//                   PCB
//                 </Button>
//               </div>

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
//             </div>
//           </div>
//         </div>
//       </header>

//       <main className="container mx-auto px-4 py-6 space-y-6">
//         {/* Stream Information */}
//         <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Award className="w-5 h-5 text-primary" />
//               {getText("Stream Information", "स्ट्रीम जानकारी", "ਸਟਰੀਮ ਜਾਣਕਾਰੀ")}
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="grid gap-4 md:grid-cols-2">
//             <div className="space-y-2">
//               <h4 className="font-semibold text-blue-600">PCM (Physics, Chemistry, Mathematics)</h4>
//               <p className="text-sm text-muted-foreground">
//                 {getText(
//                   "For Engineering, Architecture, and Technology careers",
//                   "इंजीनियरिंग, आर्किटेक्चर और प्रौद्योगिकी करियर के लिए",
//                   "ਇੰਜੀਨੀਅਰਿੰਗ, ਆਰਕੀਟੈਕਚਰ ਅਤੇ ਤਕਨਾਲੋਜੀ ਕਰੀਅਰ ਲਈ"
//                 )}
//               </p>
//               <Badge variant="secondary">JEE Preparation</Badge>
//             </div>
//             <div className="space-y-2">
//               <h4 className="font-semibold text-green-600">PCB (Physics, Chemistry, Biology)</h4>
//               <p className="text-sm text-muted-foreground">
//                 {getText(
//                   "For Medical, Pharmacy, and Life Sciences careers",
//                   "मेडिकल, फार्मेसी और जीव विज्ञान करियर के लिए",
//                   "ਮੈਡੀਕਲ, ਫਾਰਮੇਸੀ ਅਤੇ ਲਾਇਫ ਸਾਇੰਸ ਕਰੀਅਰ ਲਈ"
//                 )}
//               </p>
//               <Badge variant="secondary">NEET Preparation</Badge>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Subjects Grid */}
//         <div className="space-y-4">
//           <div className="flex items-center justify-between">
//             <h2 className="text-lg font-semibold">
//               {getText("Available Subjects", "उपलब्ध विषय", "ਉਪਲਬਧ ਵਿਸ਼ੇ")} 
//               {selectedStream !== "all" && (
//                 <span className="text-primary ml-2">({selectedStream.toUpperCase()} Stream)</span>
//               )}
//             </h2>
//             <div className="flex items-center gap-2 text-sm text-muted-foreground">
//               <Users className="w-4 h-4" />
//               {getText("Designed for Rural Students", "ग्रामीण छात्रों के लिए डिज़ाइन किया गया", "ਪੇਂਡੂ ਵਿਦਿਆਰਥੀਆਂ ਲਈ ਡਿਜ਼ਾਈਨ ਕੀਤਾ ਗਿਆ")}
//             </div>
//           </div>

//           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//             {filteredSubjects.map((subject) => {
//               const progressPercentage = (subject.completed / subject.chapters) * 100

//               return (
//                 <Card 
//                   key={subject.id} 
//                   className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
//                   onClick={() => handleSubjectClick(subject.id)}
//                 >
//                   <div className={`h-2 bg-gradient-to-r ${subject.color}`}></div>
//                   <CardHeader className="pb-3">
//                     <div className="flex items-start justify-between">
//                       <div className="space-y-2 flex-1">
//                         <div className="flex items-center gap-3">
//                           <div className={`p-2 rounded-lg bg-gradient-to-r ${subject.color} text-white`}>
//                             {subject.icon}
//                           </div>
//                           <div>
//                             <CardTitle className="text-base text-balance">
//                               {getText(subject.title, subject.titleHi, subject.titlePa)}
//                             </CardTitle>
//                             <div className="flex gap-2 mt-1">
//                               <Badge variant="outline" className="text-xs">
//                                 {subject.difficulty}
//                               </Badge>
//                               <Badge variant="secondary" className="text-xs">
//                                 {subject.chapters} {getText("Chapters", "अध्याय", "ਅਧਿਆਇ")}
//                               </Badge>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                       <Play className="w-5 h-5 text-primary" />
//                     </div>
//                   </CardHeader>
//                   <CardContent className="pt-0 space-y-4">
//                     <p className="text-sm text-muted-foreground text-pretty">
//                       {getText(subject.description, subject.descriptionHi, subject.descriptionPa)}
//                     </p>
                    
//                     {/* Progress */}
//                     <div className="space-y-2">
//                       <div className="flex justify-between text-xs">
//                         <span>{getText("Progress", "प्रगति", "ਤਰੱਕੀ")}</span>
//                         <span className="font-medium">{subject.completed}/{subject.chapters}</span>
//                       </div>
//                       <Progress value={progressPercentage} className="h-2" />
//                     </div>

//                     {/* Key Topics */}
//                     <div className="space-y-2">
//                       <h4 className="text-xs font-medium text-muted-foreground">
//                         {getText("Key Topics:", "मुख्य विषय:", "ਮੁੱਖ ਵਿਸ਼ੇ:")}
//                       </h4>
//                       <div className="flex flex-wrap gap-1">
//                         {subject.topics.slice(0, 3).map((topic, index) => (
//                           <Badge key={index} variant="outline" className="text-xs">
//                             {topic}
//                           </Badge>
//                         ))}
//                         {subject.topics.length > 3 && (
//                           <Badge variant="outline" className="text-xs">
//                             +{subject.topics.length - 3} more
//                           </Badge>
//                         )}
//                       </div>
//                     </div>

//                     <Button size="sm" className="w-full">
//                       {progressPercentage > 0 
//                         ? getText("Continue Learning", "सीखना जारी रखें", "ਸਿੱਖਣਾ ਜਾਰੀ ਰੱਖੋ")
//                         : getText("Start Learning", "सीखना शुरू करें", "ਸਿੱਖਣਾ ਸ਼ੁਰੂ ਕਰੋ")
//                       }
//                     </Button>
//                   </CardContent>
//                 </Card>
//               )
//             })}
//           </div>
//         </div>

//         {/* Competitive Exam Info */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Award className="w-5 h-5 text-accent" />
//               {getText("Competitive Exam Preparation", "प्रतियोगी परीक्षा की तैयारी", "ਪ੍ਰਤੀਯੋਗੀ ਪ੍ਰੀਖਿਆ ਦੀ ਤਿਆਰੀ")}
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="grid gap-4 md:grid-cols-2">
//             <div className="space-y-2">
//               <h4 className="font-semibold text-blue-600">JEE (Joint Entrance Examination)</h4>
//               <p className="text-sm text-muted-foreground">
//                 {getText(
//                   "For admission to IITs, NITs, and other engineering colleges",
//                   "IIT, NIT और अन्य इंजीनियरिंग कॉलेजों में प्रवेश के लिए",
//                   "IIT, NIT ਅਤੇ ਹੋਰ ਇੰਜੀਨੀਅਰਿੰਗ ਕਾਲਜਾਂ ਵਿੱਚ ਦਾਖਲੇ ਲਈ"
//                 )}
//               </p>
//             </div>
//             <div className="space-y-2">
//               <h4 className="font-semibold text-green-600">NEET (National Eligibility cum Entrance Test)</h4>
//               <p className="text-sm text-muted-foreground">
//                 {getText(
//                   "For admission to medical and dental colleges across India",
//                   "भारत भर में मेडिकल और डेंटल कॉलेजों में प्रवेश के लिए",
//                   "ਭਾਰਤ ਭਰ ਵਿੱਚ ਮੈਡੀਕਲ ਅਤੇ ਡੈਂਟਲ ਕਾਲਜਾਂ ਵਿੱਚ ਦਾਖਲੇ ਲਈ"
//                 )}
//               </p>
//             </div>
//           </CardContent>
//         </Card>
//       </main>
//     </div>
//   )
// }
