

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NavigationHeader } from "@/components/navigation-header"
import { User, Settings, Trophy, BookOpen, Globe, Save, Camera, Bell, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ProfilePage() {
  const [language, setLanguage] = useState("english")
  const [profile, setProfile] = useState({
    name: "राज कुमार",
    email: "raj.kumar@example.com",
    grade: "Class 8",
    school: "Government High School, Village Khanna",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [offlineMode, setOfflineMode] = useState(true)
  const { toast } = useToast()

  const achievements = [
    { name: "First Lesson Complete", icon: "🎯", earned: true, description: "Complete your first lesson" },
    { name: "Digital Explorer", icon: "💻", earned: true, description: "Explore 5 different topics" },
    { name: "Quiz Master", icon: "🧠", earned: false, description: "Score 100% on 3 quizzes" },
    { name: "Offline Champion", icon: "📱", earned: true, description: "Use offline mode for 7 days" },
    { name: "Streak Keeper", icon: "🔥", earned: false, description: "Maintain 30-day learning streak" },
    { name: "Helper", icon: "🤝", earned: false, description: "Help 5 classmates" },
  ]

  const stats = {
    lessonsCompleted: 12,
    totalLessons: 25,
    streakDays: 7,
    totalPoints: 850,
    weeklyGoal: 5,
    weeklyCompleted: 3,
  }

  const handleSaveProfile = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: language === "hindi" ? "प्रोफाइल सेव हो गई" : language === "punjabi" ? "ਪ੍ਰੋਫਾਈਲ ਸੇਵ ਹੋ ਗਈ" : "Profile Saved",
      description:
        language === "hindi"
          ? "आपकी जानकारी सफलतापूर्वक अपडेट हो गई"
          : language === "punjabi"
            ? "ਤੁਹਾਡੀ ਜਾਣਕਾਰੀ ਸਫਲਤਾਪੂਰਵਕ ਅਪਡੇਟ ਹੋ ਗਈ"
            : "Your information has been updated successfully",
    })
    setIsLoading(false)
  }

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage)
    toast({
      title: language === "hindi" ? "भाषा बदली गई" : language === "punjabi" ? "ਭਾਸ਼ਾ ਬਦਲੀ ਗਈ" : "Language Changed",
      description: `${newLanguage === "hindi" ? "हिंदी" : newLanguage === "punjabi" ? "ਪੰਜਾਬੀ" : "English"} selected`,
    })
  }

  const uploadProfilePicture = () => {
    toast({
      title: language === "hindi" ? "फोटो अपलोड" : language === "punjabi" ? "ਫੋਟੋ ਅਪਲੋਡ" : "Photo Upload",
      description:
        language === "hindi"
          ? "फोटो अपलोड फीचर जल्द आएगा"
          : language === "punjabi"
            ? "ਫੋਟੋ ਅਪਲੋਡ ਫੀਚਰ ਜਲਦੀ ਆਵੇਗਾ"
            : "Photo upload feature coming soon",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-teal-50">
      <NavigationHeader
        title={language === "hindi" ? "मेरी प्रोफाइल" : language === "punjabi" ? "ਮੇਰੀ ਪ੍ਰੋਫਾਈਲ" : "My Profile"}
        backUrl="/get-started"
      />

      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <p className="text-gray-600">
              {language === "hindi"
                ? "अपनी जानकारी और प्रगति देखें"
                : language === "punjabi"
                  ? "ਆਪਣੀ ਜਾਣਕਾਰੀ ਅਤੇ ਤਰੱਕੀ ਦੇਖੋ"
                  : "View your information and progress"}
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {language === "hindi" ? "प्रोफाइल" : language === "punjabi" ? "ਪ੍ਰੋਫਾਈਲ" : "Profile"}
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                {language === "hindi" ? "प्रगति" : language === "punjabi" ? "ਤਰੱਕੀ" : "Progress"}
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                {language === "hindi" ? "उपलब्धियां" : language === "punjabi" ? "ਪ੍ਰਾਪਤੀਆਂ" : "Achievements"}
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                {language === "hindi" ? "सेटिंग्स" : language === "punjabi" ? "ਸੈਟਿੰਗਜ਼" : "Settings"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src="/student-avatar.png" />
                        <AvatarFallback className="text-xl">RK</AvatarFallback>
                      </Avatar>
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full p-0 bg-transparent"
                        onClick={uploadProfilePicture}
                      >
                        <Camera className="h-3 w-3" />
                      </Button>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{profile.name}</h2>
                      <p className="text-gray-600">
                        {profile.grade} • {profile.school}
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">
                        {language === "hindi" ? "नाम" : language === "punjabi" ? "ਨਾਮ" : "Name"}
                      </Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">
                        {language === "hindi" ? "ईमेल" : language === "punjabi" ? "ਈਮੇਲ" : "Email"}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="grade">
                        {language === "hindi" ? "कक्षा" : language === "punjabi" ? "ਜਮਾਤ" : "Grade"}
                      </Label>
                      <Input
                        id="grade"
                        value={profile.grade}
                        onChange={(e) => setProfile({ ...profile, grade: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="school">
                        {language === "hindi" ? "स्कूल" : language === "punjabi" ? "ਸਕੂਲ" : "School"}
                      </Label>
                      <Input
                        id="school"
                        value={profile.school}
                        onChange={(e) => setProfile({ ...profile, school: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button
                    className="bg-orange-500 hover:bg-orange-600"
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading
                      ? language === "hindi"
                        ? "सेव हो रहा है..."
                        : language === "punjabi"
                          ? "ਸੇਵ ਹੋ ਰਿਹਾ ਹੈ..."
                          : "Saving..."
                      : language === "hindi"
                        ? "सेव करें"
                        : language === "punjabi"
                          ? "ਸੇਵ ਕਰੋ"
                          : "Save Changes"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="progress">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {language === "hindi"
                        ? "सीखने की प्रगति"
                        : language === "punjabi"
                          ? "ਸਿੱਖਣ ਦੀ ਤਰੱਕੀ"
                          : "Learning Progress"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span>
                            {language === "hindi"
                              ? "पूरे किए गए पाठ"
                              : language === "punjabi"
                                ? "ਪੂਰੇ ਕੀਤੇ ਪਾਠ"
                                : "Lessons Completed"}
                          </span>
                          <span>
                            {stats.lessonsCompleted}/{stats.totalLessons}
                          </span>
                        </div>
                        <Progress value={(stats.lessonsCompleted / stats.totalLessons) * 100} />
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <span>
                            {language === "hindi"
                              ? "साप्ताहिक लक्ष्य"
                              : language === "punjabi"
                                ? "ਹਫਤਾਵਾਰੀ ਟੀਚਾ"
                                : "Weekly Goal"}
                          </span>
                          <span>
                            {stats.weeklyCompleted}/{stats.weeklyGoal}
                          </span>
                        </div>
                        <Progress value={(stats.weeklyCompleted / stats.weeklyGoal) * 100} />
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-500">{stats.streakDays}</div>
                          <div className="text-sm text-gray-600">
                            {language === "hindi"
                              ? "दिन की लकीर"
                              : language === "punjabi"
                                ? "ਦਿਨਾਂ ਦੀ ਲਕੀਰ"
                                : "Day Streak"}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-teal-500">{stats.totalPoints}</div>
                          <div className="text-sm text-gray-600">
                            {language === "hindi" ? "कुल अंक" : language === "punjabi" ? "ਕੁੱਲ ਅੰਕ" : "Total Points"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>
                      {language === "hindi"
                        ? "हाल की गतिविधि"
                        : language === "punjabi"
                          ? "ਹਾਲ ਦੀ ਗਤੀਵਿਧੀ"
                          : "Recent Activity"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">
                          {language === "hindi"
                            ? "कंप्यूटर बेसिक्स पूरा किया"
                            : language === "punjabi"
                              ? "ਕੰਪਿਊਟਰ ਬੇਸਿਕਸ ਪੂਰਾ ਕੀਤਾ"
                              : "Completed Computer Basics"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">
                          {language === "hindi"
                            ? "इंटरनेट सेफ्टी क्विज़ पास किया"
                            : language === "punjabi"
                              ? "ਇੰਟਰਨੈਟ ਸੇਫਟੀ ਕਵਿਜ਼ ਪਾਸ ਕੀਤਾ"
                              : "Passed Internet Safety Quiz"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-sm">
                          {language === "hindi"
                            ? "नया बैज अर्जित किया"
                            : language === "punjabi"
                              ? "ਨਵਾ ਬੈਜ ਕਮਾਇਆ"
                              : "Earned new badge"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="achievements">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => (
                  <Card
                    key={index}
                    className={achievement.earned ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{achievement.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                          <Badge variant={achievement.earned ? "default" : "secondary"}>
                            {achievement.earned
                              ? language === "hindi"
                                ? "अर्जित"
                                : language === "punjabi"
                                  ? "ਕਮਾਇਆ"
                                  : "Earned"
                              : language === "hindi"
                                ? "लॉक्ड"
                                : language === "punjabi"
                                  ? "ਲਾਕਡ"
                                  : "Locked"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {language === "hindi"
                        ? "भाषा सेटिंग्स"
                        : language === "punjabi"
                          ? "ਭਾਸ਼ਾ ਸੈਟਿੰਗਜ਼"
                          : "Language Settings"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="language">
                        {language === "hindi" ? "भाषा चुनें" : language === "punjabi" ? "ਭਾਸ਼ਾ ਚੁਣੋ" : "Choose Language"}
                      </Label>
                      <select
                        id="language"
                        value={language}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="w-full mt-1 p-2 border rounded-md"
                      >
                        <option value="english">English</option>
                        <option value="hindi">हिंदी</option>
                        <option value="punjabi">ਪੰਜਾਬੀ</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>
                      {language === "hindi" ? "ऐप सेटिंग्स" : language === "punjabi" ? "ਐਪ ਸੈਟਿੰਗਜ਼" : "App Settings"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        <span>
                          {language === "hindi" ? "सूचनाएं" : language === "punjabi" ? "ਸੂਚਨਾਵਾਂ" : "Notifications"}
                        </span>
                      </div>
                      <Button
                        variant={notifications ? "default" : "outline"}
                        size="sm"
                        onClick={() => setNotifications(!notifications)}
                      >
                        {notifications ? "ON" : "OFF"}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span>
                          {language === "hindi" ? "ऑफलाइन मोड" : language === "punjabi" ? "ਆਫਲਾਈਨ ਮੋਡ" : "Offline Mode"}
                        </span>
                      </div>
                      <Button
                        variant={offlineMode ? "default" : "outline"}
                        size="sm"
                        onClick={() => setOfflineMode(!offlineMode)}
                      >
                        {offlineMode ? "ON" : "OFF"}
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 pt-4 border-t">
                      <Shield className="h-4 w-4" />
                      <span className="text-sm text-gray-600">
                        {language === "hindi"
                          ? "आपका डेटा सुरक्षित है"
                          : language === "punjabi"
                            ? "ਤੁਹਾਡਾ ਡੇਟਾ ਸੁਰੱਖਿਤ ਹੈ"
                            : "Your data is secure"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
