"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Upload,
  FileText,
  Video,
  ImageIcon,
  Search,
  Eye,
  Copy,
  Globe,
  Users,
  Clock,
  Star,
  Download,
} from "lucide-react"

interface LessonContent {
  id: string
  title: string
  titleHi: string
  titlePa: string
  description: string
  descriptionHi: string
  descriptionPa: string
  content: string
  contentHi: string
  contentPa: string
  category: string
  categoryHi: string
  categoryPa: string
  difficulty: "beginner" | "intermediate" | "advanced"
  duration: number
  mediaType: "text" | "video" | "interactive"
  mediaUrl?: string
  thumbnailUrl?: string
  status: "draft" | "published" | "archived"
  createdBy: string
  createdAt: string
  updatedAt: string
  tags: string[]
  viewCount: number
  rating: number
}

const mockLessons: LessonContent[] = [
  {
    id: "1",
    title: "Introduction to Computers",
    titleHi: "कंप्यूटर का परिचय",
    titlePa: "ਕੰਪਿਊਟਰ ਦੀ ਜਾਣ-ਪਛਾਣ",
    description: "Learn the basics of computers and how they work",
    descriptionHi: "कंप्यूटर की मूल बातें और उनका काम सीखें",
    descriptionPa: "ਕੰਪਿਊਟਰ ਦੀਆਂ ਬੁਨਿਆਦੀ ਗੱਲਾਂ ਅਤੇ ਉਹਨਾਂ ਦਾ ਕੰਮ ਸਿੱਖੋ",
    content: "A computer is an electronic device that processes data...",
    contentHi: "कंप्यूटर एक इलेक्ट्रॉनिक उपकरण है जो डेटा को प्रोसेस करता है...",
    contentPa: "ਕੰਪਿਊਟਰ ਇੱਕ ਇਲੈਕਟ੍ਰਾਨਿਕ ਯੰਤਰ ਹੈ ਜੋ ਡੇਟਾ ਨੂੰ ਪ੍ਰੋਸੈਸ ਕਰਦਾ ਹੈ...",
    category: "Digital Literacy",
    categoryHi: "डिजिटल साक्षरता",
    categoryPa: "ਡਿਜੀਟਲ ਸਾਖਰਤਾ",
    difficulty: "beginner",
    duration: 15,
    mediaType: "interactive",
    thumbnailUrl: "/computer-basics-illustration.jpg",
    status: "published",
    createdBy: "Teacher A",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20",
    tags: ["basics", "introduction", "hardware"],
    viewCount: 245,
    rating: 4.5,
  },
  {
    id: "2",
    title: "Internet Safety",
    titleHi: "इंटरनेट सुरक्षा",
    titlePa: "ਇੰਟਰਨੈੱਟ ਸੁਰੱਖਿਆ",
    description: "Stay safe online and protect your personal information",
    descriptionHi: "ऑनलाइन सुरक्षित रहें और अपनी व्यक्तिगत जानकारी की सुरक्षा करें",
    descriptionPa: "ਔਨਲਾਈਨ ਸੁਰੱਖਿਅਤ ਰਹੋ ਅਤੇ ਆਪਣੀ ਨਿੱਜੀ ਜਾਣਕਾਰੀ ਦੀ ਸੁਰੱਖਿਆ ਕਰੋ",
    content: "Internet safety is crucial in today's digital world...",
    contentHi: "आज की डिजिटल दुनिया में इंटरनेट सुरक्षा महत्वपूर्ण है...",
    contentPa: "ਅੱਜ ਦੀ ਡਿਜੀਟਲ ਦੁਨੀਆ ਵਿੱਚ ਇੰਟਰਨੈੱਟ ਸੁਰੱਖਿਆ ਮਹੱਤਵਪੂਰਨ ਹੈ...",
    category: "Internet Safety",
    categoryHi: "इंटरनेट सुरक्षा",
    categoryPa: "ਇੰਟਰਨੈੱਟ ਸੁਰੱਖਿਆ",
    difficulty: "beginner",
    duration: 20,
    mediaType: "video",
    mediaUrl: "/videos/internet-safety.mp4",
    thumbnailUrl: "/internet-safety-shield.jpg",
    status: "draft",
    createdBy: "Teacher B",
    createdAt: "2024-01-18",
    updatedAt: "2024-01-22",
    tags: ["safety", "privacy", "security"],
    viewCount: 0,
    rating: 0,
  },
]

export function ContentManagementSystem() {
  const [language, setLanguage] = useState<"en" | "hi" | "pa">("en")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [selectedLesson, setSelectedLesson] = useState<LessonContent | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("lessons")

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

  const filteredLessons = mockLessons.filter((lesson) => {
    const matchesSearch =
      lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.titleHi.includes(searchTerm) ||
      lesson.titlePa.includes(searchTerm) ||
      lesson.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = filterStatus === "all" || lesson.status === filterStatus
    const matchesCategory = filterCategory === "all" || lesson.category === filterCategory
    return matchesSearch && matchesStatus && matchesCategory
  })

  const categories = Array.from(new Set(mockLessons.map((lesson) => lesson.category)))

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
                  {getText("Content Management", "सामग्री प्रबंधन", "ਸਮੱਗਰੀ ਪ੍ਰਬੰਧਨ")}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {getText(
                    "Create and manage learning content",
                    "शिक्षण सामग्री बनाएं और प्रबंधित करें",
                    "ਸਿੱਖਣ ਦੀ ਸਮੱਗਰੀ ਬਣਾਓ ਅਤੇ ਪ੍ਰਬੰਧਿਤ ਕਰੋ",
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

              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    {getText("Create Lesson", "पाठ बनाएं", "ਪਾਠ ਬਣਾਓ")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{getText("Create New Lesson", "नया पाठ बनाएं", "ਨਵਾਂ ਪਾਠ ਬਣਾਓ")}</DialogTitle>
                  </DialogHeader>
                  <LessonEditor language={language} getText={getText} onSave={() => setIsCreateDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="lessons">{getText("Lessons", "पाठ", "ਪਾਠ")}</TabsTrigger>
            <TabsTrigger value="media">{getText("Media", "मीडिया", "ਮੀਡੀਆ")}</TabsTrigger>
            <TabsTrigger value="categories">{getText("Categories", "श्रेणियां", "ਸ਼੍ਰੇਣੀਆਂ")}</TabsTrigger>
            <TabsTrigger value="settings">{getText("Settings", "सेटिंग्स", "ਸੈਟਿੰਗਾਂ")}</TabsTrigger>
          </TabsList>

          {/* Lessons Tab */}
          <TabsContent value="lessons" className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder={getText("Search lessons...", "पाठ खोजें...", "ਪਾਠ ਖੋਜੋ...")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue
                    placeholder={getText("Filter by status", "स्थिति के अनुसार फ़िल्टर करें", "ਸਥਿਤੀ ਅਨੁਸਾਰ ਫਿਲਟਰ ਕਰੋ")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{getText("All Status", "सभी स्थिति", "ਸਾਰੀ ਸਥਿਤੀ")}</SelectItem>
                  <SelectItem value="published">{getText("Published", "प्रकाशित", "ਪ੍ਰਕਾਸ਼ਿਤ")}</SelectItem>
                  <SelectItem value="draft">{getText("Draft", "मसौदा", "ਡਰਾਫਟ")}</SelectItem>
                  <SelectItem value="archived">{getText("Archived", "संग्रहीत", "ਸੰਗ੍ਰਹਿਤ")}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue
                    placeholder={getText("Filter by category", "श्रेणी के अनुसार फ़िल्टर करें", "ਸ਼੍ਰੇਣੀ ਅਨੁਸਾਰ ਫਿਲਟਰ ਕਰੋ")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{getText("All Categories", "सभी श्रेणियां", "ਸਾਰੀਆਂ ਸ਼੍ਰੇਣੀਆਂ")}</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Lessons Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredLessons.map((lesson) => (
                <Card key={lesson.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="aspect-video bg-muted rounded-lg mb-3 overflow-hidden">
                      <img
                        src={lesson.thumbnailUrl || "/placeholder.svg"}
                        alt={getText(lesson.title, lesson.titleHi, lesson.titlePa)}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base text-balance line-clamp-2">
                          {getText(lesson.title, lesson.titleHi, lesson.titlePa)}
                        </CardTitle>
                        <Badge
                          variant={
                            lesson.status === "published"
                              ? "default"
                              : lesson.status === "draft"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {lesson.status === "published"
                            ? getText("Published", "प्रकाशित", "ਪ੍ਰਕਾਸ਼ਿਤ")
                            : lesson.status === "draft"
                              ? getText("Draft", "मसौदा", "ਡਰਾਫਟ")
                              : getText("Archived", "संग्रहीत", "ਸੰਗ੍ਰਹਿਤ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground text-pretty line-clamp-2">
                        {getText(lesson.description, lesson.descriptionHi, lesson.descriptionPa)}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {getText(lesson.category, lesson.categoryHi, lesson.categoryPa)}
                        </Badge>
                        <span>•</span>
                        <Clock className="w-3 h-3" />
                        <span>{lesson.duration} min</span>
                        <span>•</span>
                        <Eye className="w-3 h-3" />
                        <span>{lesson.viewCount}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-warning text-warning" />
                        <span className="text-sm font-medium">{lesson.rating}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setSelectedLesson(lesson)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">{getText("Media Library", "मीडिया लाइब्रेरी", "ਮੀਡੀਆ ਲਾਇਬ੍ਰੇਰੀ")}</h2>
              <Button className="gap-2">
                <Upload className="w-4 h-4" />
                {getText("Upload Media", "मीडिया अपलोड करें", "ਮੀਡੀਆ ਅਪਲੋਡ ਕਰੋ")}
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {[
                { type: "image", name: "computer-basics.jpg", size: "2.3 MB", uploaded: "2024-01-15" },
                { type: "video", name: "internet-safety.mp4", size: "45.2 MB", uploaded: "2024-01-18" },
                { type: "document", name: "lesson-plan.pdf", size: "1.8 MB", uploaded: "2024-01-20" },
                { type: "image", name: "digital-literacy.png", size: "3.1 MB", uploaded: "2024-01-22" },
              ].map((media, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center">
                      {media.type === "image" ? (
                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                      ) : media.type === "video" ? (
                        <Video className="w-8 h-8 text-muted-foreground" />
                      ) : (
                        <FileText className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium truncate">{media.name}</p>
                      <p className="text-xs text-muted-foreground">{media.size}</p>
                      <p className="text-xs text-muted-foreground">{media.uploaded}</p>
                    </div>
                    <div className="flex gap-1 mt-3">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">{getText("Categories", "श्रेणियां", "ਸ਼੍ਰੇਣੀਆਂ")}</h2>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                {getText("Add Category", "श्रेणी जोड़ें", "ਸ਼੍ਰੇਣੀ ਜੋੜੋ")}
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((category, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{category}</h3>
                        <p className="text-sm text-muted-foreground">
                          {mockLessons.filter((l) => l.category === category).length} {getText("lessons", "पाठ", "ਪਾਠ")}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-bold">{getText("CMS Settings", "CMS सेटिंग्स", "CMS ਸੈਟਿੰਗਾਂ")}</h2>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    {getText("Language Settings", "भाषा सेटिंग्स", "ਭਾਸ਼ਾ ਸੈਟਿੰਗਾਂ")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>{getText("Default Language", "डिफ़ॉल्ट भाषा", "ਡਿਫਾਲਟ ਭਾਸ਼ਾ")}</Label>
                    <Select defaultValue="en">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">हिंदी</SelectItem>
                        <SelectItem value="pa">ਪੰਜਾਬੀ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{getText("Auto-translate", "स्वचालित अनुवाद", "ਆਟੋ-ਅਨੁਵਾਦ")}</Label>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="auto-translate" />
                      <label htmlFor="auto-translate" className="text-sm">
                        {getText(
                          "Enable automatic translation for new content",
                          "नई सामग्री के लिए स्वचालित अनुवाद सक्षम करें",
                          "ਨਵੀਂ ਸਮੱਗਰੀ ਲਈ ਆਟੋਮੈਟਿਕ ਅਨੁਵਾਦ ਸਮਰੱਥ ਕਰੋ",
                        )}
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    {getText("User Permissions", "उपयोगकर्ता अनुमतियां", "ਯੂਜ਼ਰ ਅਨੁਮਤੀਆਂ")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">
                        {getText("Teachers can create lessons", "शिक्षक पाठ बना सकते हैं", "ਅਧਿਆਪਕ ਪਾਠ ਬਣਾ ਸਕਦੇ ਹਨ")}
                      </span>
                      <input type="checkbox" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">
                        {getText(
                          "Teachers can publish lessons",
                          "शिक्षक पाठ प्रकाशित कर सकते हैं",
                          "ਅਧਿਆਪਕ ਪਾਠ ਪ੍ਰਕਾਸ਼ਿਤ ਕਰ ਸਕਦੇ ਹਨ",
                        )}
                      </span>
                      <input type="checkbox" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">
                        {getText(
                          "Auto-approve teacher content",
                          "शिक्षक सामग्री को स्वचालित रूप से अनुमोदित करें",
                          "ਅਧਿਆਪਕ ਸਮੱਗਰੀ ਨੂੰ ਆਟੋਮੈਟਿਕ ਮਨਜ਼ੂਰੀ ਦਿਓ",
                        )}
                      </span>
                      <input type="checkbox" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{getText("Edit Lesson", "पाठ संपादित करें", "ਪਾਠ ਸੰਪਾਦਿਤ ਕਰੋ")}</DialogTitle>
            </DialogHeader>
            {selectedLesson && (
              <LessonEditor
                lesson={selectedLesson}
                language={language}
                getText={getText}
                onSave={() => setIsEditDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}

function LessonEditor({
  lesson,
  language,
  getText,
  onSave,
}: {
  lesson?: LessonContent
  language: "en" | "hi" | "pa"
  getText: (en: string, hi: string, pa: string) => string
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    title: lesson?.title || "",
    titleHi: lesson?.titleHi || "",
    titlePa: lesson?.titlePa || "",
    description: lesson?.description || "",
    descriptionHi: lesson?.descriptionHi || "",
    descriptionPa: lesson?.descriptionPa || "",
    content: lesson?.content || "",
    contentHi: lesson?.contentHi || "",
    contentPa: lesson?.contentPa || "",
    category: lesson?.category || "",
    difficulty: lesson?.difficulty || "beginner",
    duration: lesson?.duration || 15,
    mediaType: lesson?.mediaType || "text",
    tags: lesson?.tags?.join(", ") || "",
  })

  return (
    <div className="space-y-6">
      <Tabs defaultValue="en" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="en">English</TabsTrigger>
          <TabsTrigger value="hi">हिंदी</TabsTrigger>
          <TabsTrigger value="pa">ਪੰਜਾਬੀ</TabsTrigger>
        </TabsList>

        <TabsContent value="en" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title-en">Title (English)</Label>
            <Input
              id="title-en"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter lesson title in English"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description-en">Description (English)</Label>
            <Textarea
              id="description-en"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter lesson description in English"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content-en">Content (English)</Label>
            <Textarea
              id="content-en"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Enter lesson content in English"
              rows={8}
            />
          </div>
        </TabsContent>

        <TabsContent value="hi" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title-hi">Title (हिंदी)</Label>
            <Input
              id="title-hi"
              value={formData.titleHi}
              onChange={(e) => setFormData({ ...formData, titleHi: e.target.value })}
              placeholder="हिंदी में पाठ का शीर्षक दर्ज करें"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description-hi">Description (हिंदी)</Label>
            <Textarea
              id="description-hi"
              value={formData.descriptionHi}
              onChange={(e) => setFormData({ ...formData, descriptionHi: e.target.value })}
              placeholder="हिंदी में पाठ का विवरण दर्ज करें"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content-hi">Content (हिंदी)</Label>
            <Textarea
              id="content-hi"
              value={formData.contentHi}
              onChange={(e) => setFormData({ ...formData, contentHi: e.target.value })}
              placeholder="हिंदी में पाठ की सामग्री दर्ज करें"
              rows={8}
            />
          </div>
        </TabsContent>

        <TabsContent value="pa" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title-pa">Title (ਪੰਜਾਬੀ)</Label>
            <Input
              id="title-pa"
              value={formData.titlePa}
              onChange={(e) => setFormData({ ...formData, titlePa: e.target.value })}
              placeholder="ਪੰਜਾਬੀ ਵਿੱਚ ਪਾਠ ਦਾ ਸਿਰਲੇਖ ਦਰਜ ਕਰੋ"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description-pa">Description (ਪੰਜਾਬੀ)</Label>
            <Textarea
              id="description-pa"
              value={formData.descriptionPa}
              onChange={(e) => setFormData({ ...formData, descriptionPa: e.target.value })}
              placeholder="ਪੰਜਾਬੀ ਵਿੱਚ ਪਾਠ ਦਾ ਵੇਰਵਾ ਦਰਜ ਕਰੋ"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content-pa">Content (ਪੰਜਾਬੀ)</Label>
            <Textarea
              id="content-pa"
              value={formData.contentPa}
              onChange={(e) => setFormData({ ...formData, contentPa: e.target.value })}
              placeholder="ਪੰਜਾਬੀ ਵਿੱਚ ਪਾਠ ਦੀ ਸਮੱਗਰੀ ਦਰਜ ਕਰੋ"
              rows={8}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Lesson Settings */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="Enter category"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty</Label>
          <Select
            value={formData.difficulty}
            onValueChange={(value: any) => setFormData({ ...formData, difficulty: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: Number.parseInt(e.target.value) || 0 })}
            placeholder="15"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="media-type">Media Type</Label>
          <Select
            value={formData.mediaType}
            onValueChange={(value: any) => setFormData({ ...formData, mediaType: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="interactive">Interactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma separated)</Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="basics, introduction, computer"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onSave}>
          {getText("Save as Draft", "मसौदे के रूप में सहेजें", "ਡਰਾਫਟ ਵਜੋਂ ਸੇਵ ਕਰੋ")}
        </Button>
        <Button onClick={onSave}>{getText("Publish", "प्रकाशित करें", "ਪ੍ਰਕਾਸ਼ਿਤ ਕਰੋ")}</Button>
      </div>
    </div>
  )
}
