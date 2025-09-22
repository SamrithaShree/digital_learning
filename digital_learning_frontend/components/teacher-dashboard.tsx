"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import {
  Users,
  BookOpen,
  TrendingUp,
  Award,
  Search,
  Download,
  Plus,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  Calendar,
  Bell,
  User,
  X,
} from "lucide-react"
import { NavigationHeader } from "./navigation-header"

// Real data interfaces from backend
interface StudentProgress {
  student_name: string;
  score: number;
  completed_at: string;
}

interface ClassRoom {
  id: number;
  name: string;
  student_count: number;
  active_students_count: number;
  inactive_students_count: number;
  average_progress: number;
}

interface Student {
  id: number;
  user: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  grade: string;
  school: string;
}

// Interface for detailed class view
interface ClassStudent {
  enrollment_id: number;
  student_id: number;
  student_name: string;
  username: string;
  grade: string;
  progress: number;
  active: boolean;
  last_active: string | null;
}

export function TeacherDashboard() {
  const [language, setLanguage] = useState<"en" | "hi" | "pa">("en")
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([])
  const [classrooms, setClassrooms] = useState<ClassRoom[]>([])
  const [availableStudents, setAvailableStudents] = useState<Student[]>([])
  const [selectedClass, setSelectedClass] = useState<string>("all") // Keep your existing filter logic
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [classesLoading, setClassesLoading] = useState(false)
  const [selectedDateRange, setSelectedDateRange] = useState("last-30-days")
  
  // NEW state variables for class modal functionality
  const [viewingClass, setViewingClass] = useState<ClassRoom | null>(null) // Changed from selectedClass
  const [showClassModal, setShowClassModal] = useState(false)
  const [classStudents, setClassStudents] = useState<ClassStudent[]>([])
  const [modalLoading, setModalLoading] = useState(false)

  const { toast } = useToast()
  const router = useRouter()

  // Fetch student progress data
  useEffect(() => {
    const fetchStudentProgress = async () => {
      setLoading(true);
      try {
        const response = await api.get('/dashboard/');
        setStudentProgress(response.data);
      } catch (error) {
        console.error("Failed to fetch student progress:", error);
        toast({ title: "Error", description: "Could not load student data.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchStudentProgress();
  }, [toast]);

  // Fetch classrooms when classes tab is active
  useEffect(() => {
    const fetchClassrooms = async () => {
      if (activeTab !== 'classes') return;
      
      setClassesLoading(true);
      try {
        const response = await api.get('/classrooms/');
        console.log("Initial fetch classrooms response:", response);
        console.log("Response data:", response.data);
        
        const classroomsData = response.data.classes || response.data.results || response.data || [];
        console.log("Setting classrooms to:", classroomsData);
        
        setClassrooms(classroomsData);
      } catch (error) {
        console.error("Failed to fetch classrooms:", error);
        toast({ 
          title: "Error", 
          description: "Could not load class data.", 
          variant: "destructive" 
        });
      } finally {
        setClassesLoading(false);
      }
    };

    fetchClassrooms();
  }, [activeTab, toast]);

  // Fetch available students when needed
  useEffect(() => {
    const fetchAvailableStudents = async () => {
      try {
        const response = await api.get('/students/available/');
        setAvailableStudents(response.data.students || []);
      } catch (error) {
        console.error("Failed to fetch students:", error);
      }
    };

    if (activeTab === 'classes' || activeTab === 'reports') {
      fetchAvailableStudents();
    }
  }, [activeTab]);

  const handleAddClass = async () => {
    const className = prompt(getText("Enter class name:", "कक्षा का नाम दर्ज करें:", "ਕਲਾਸ ਦਾ ਨਾਮ ਦਰਜ ਕਰੋ:"));
    if (!className) return;

    setClassesLoading(true);
    try {
      const createResponse = await api.post('/classrooms/', { name: className });
      console.log("Create class response:", createResponse);
      
      toast({ 
        title: getText("Success", "सफल", "ਸਫਲ"), 
        description: getText("Class created successfully", "कक्षा सफलतापूर्वक बनाई गई", "ਕਲਾਸ ਸਫਲਤਾਪੂਰਵਕ ਬਣਾਈ ਗਈ") 
      });
      
      // Refresh classrooms
      const response = await api.get('/classrooms/');
      console.log("Fetch classrooms response:", response);
      console.log("Response data:", response.data);
      
      setClassrooms(response.data.classes || response.data || []);
    } catch (error) {
      console.error("Failed to create class:", error);
      toast({ title: "Error", description: "Could not create class.", variant: "destructive" });
    } finally {
      setClassesLoading(false);
    }
  };

  // UPDATED: New View Class functionality
  const handleViewClass = async (classId: string) => {
    setModalLoading(true)
    try {
      const response = await api.get(`/classes/${classId}/details/`)
      setViewingClass(response.data)
      setClassStudents(response.data.students || [])
      setShowClassModal(true)
      
      toast({ 
        title: getText("Class Details", "कक्षा विवरण", "ਕਲਾਸ ਵੇਰਵੇ"), 
        description: getText("Class information loaded", "कक्षा जानकारी लोड हुई", "ਕਲਾਸ ਦੀ ਜਾਣਕਾਰੀ ਲੋਡ ਹੋਈ") 
      })
    } catch (error) {
      console.error("Failed to fetch class details:", error)
      toast({ title: "Error", description: "Could not load class details.", variant: "destructive" })
    } finally {
      setModalLoading(false)
    }
  };

  // UPDATED: New Manage Class functionality
  const handleManageClass = async (classId: string) => {
    // For now, same as view - you can differentiate later with different UI
    await handleViewClass(classId);
  };

  // NEW: Function to update student progress
  const handleUpdateProgress = async (enrollmentId: number, progress: number) => {
    if (progress < 0 || progress > 100) return;
    
    try {
      await api.patch(`/enrollments/${enrollmentId}/update/`, { progress })
      
      // Update local state
      setClassStudents(prev => 
        prev.map(student => 
          student.enrollment_id === enrollmentId 
            ? { ...student, progress } 
            : student
        )
      )
      
      toast({ title: "Success", description: "Progress updated successfully" })
    } catch (error) {
      console.error("Failed to update progress:", error)
      toast({ title: "Error", description: "Could not update progress.", variant: "destructive" })
    }
  };

  // NEW: Function to toggle student status
  const handleToggleStudentStatus = async (enrollmentId: number, active: boolean) => {
    try {
      await api.patch(`/enrollments/${enrollmentId}/update/`, { active })
      
      // Update local state
      setClassStudents(prev => 
        prev.map(student => 
          student.enrollment_id === enrollmentId 
            ? { ...student, active } 
            : student
        )
      )
      
      toast({ title: "Success", description: `Student ${active ? 'activated' : 'deactivated'} successfully` })
    } catch (error) {
      console.error("Failed to update status:", error)
      toast({ title: "Error", description: "Could not update status.", variant: "destructive" })
    }
  };

  const handleExportStudents = () => {
    setLoading(true);
    toast({ title: "Preparing Export" });
    const csvContent = studentProgress.map(s =>
      `${s.student_name},${s.score.toFixed(0)}%,${new Date(s.completed_at).toLocaleDateString()}`
    ).join("\n");
    const blob = new Blob([`Name,Score,Date\n${csvContent}`], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student-progress-export.csv";
    a.click();
    setLoading(false);
    toast({ title: "Export Complete" });
  };

  const handleExportReport = async () => {
    setLoading(true);
    try {
      const response = await api.get('/export-progress/', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "detailed-report.csv";
      a.click();
      toast({ title: "Report Exported Successfully" });
    } catch (error) {
      console.error("Failed to export report:", error);
      toast({ title: "Error", description: "Could not export report.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (range: string) => {
    setSelectedDateRange(range);
    toast({ title: "Date Range Updated", description: `Showing data for ${range}` });
  };

  const handleNotifications = () => {
    toast({ title: "Notifications", description: "No new notifications" });
  };

  const getText = (en: string, hi: string, pa: string) => {
    return language === "hi" ? hi : language === "pa" ? pa : en;
  };
  
  // Calculations for real data
  const filteredStudents = studentProgress.filter(student =>
    student.student_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const uniqueStudentsCount = new Set(studentProgress.map(s => s.student_name)).size;
  const strugglingStudentsCount = studentProgress.filter(s => s.score < 70).length;
  const averageScore = studentProgress.length > 0
    ? studentProgress.reduce((acc, s) => acc + s.score, 0) / studentProgress.length
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-balance">
                  {getText("Teacher Dashboard", "शिक्षक डैशबोर्ड", "ਅਧਿਆਪਕ ਡੈਸ਼ਬੋਰਡ")}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {getText("Monitor student progress and manage classes", "छात्र प्रगति की निगरानी करें और कक्षाओं का प्रबंधन करें", "ਵਿਦਿਆਰਥੀ ਦੀ ਤਰੱਕੀ ਦੀ ਨਿਗਰਾਨੀ ਕਰੋ ਅਤੇ ਕਲਾਸਾਂ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-muted rounded-lg p-1">
                {(["en", "hi", "pa"] as const).map((lang) => (
                  <Button key={lang} variant={language === lang ? "default" : "ghost"} size="sm" onClick={() => setLanguage(lang)} className="text-xs px-3">
                    {lang === "en" ? "EN" : lang === "hi" ? "हि" : "ਪਾ"}
                  </Button>
                ))}
              </div>
              <Button variant="ghost" size="sm" className="relative" onClick={handleNotifications} disabled={loading}>
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full"></span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{getText("Teacher Name", "शिक्षक नाम", "ਅਧਿਆਪਕ ਨਾਮ")}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">{getText("Overview", "अवलोकन", "ਸੰਖੇਪ")}</TabsTrigger>
            <TabsTrigger value="students">{getText("Students", "छात्र", "ਵਿਦਿਆਰਥੀ")}</TabsTrigger>
            <TabsTrigger value="classes">{getText("Classes", "कक्षाएं", "ਕਲਾਸਾਂ")}</TabsTrigger>
            <TabsTrigger value="reports">{getText("Reports", "रिपोर्ट", "ਰਿਪੋਰਟਾਂ")}</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{getText("Total Students", "कुल छात्र", "ਕੁੱਲ ਵਿਦਿਆਰਥੀ")}</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{uniqueStudentsCount}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{getText("Total Submissions", "कुल सबमिशन", "ਕੁੱਲ ਸਬਮਿਸ਼ਨ")}</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">{studentProgress.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{getText("Need Help", "सहायता चाहिए", "ਮਦਦ ਚਾਹੀਦੀ")}</CardTitle>
                  <AlertCircle className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">{strugglingStudentsCount}</div>
                  <p className="text-xs text-muted-foreground">{getText("Low scores", "कम स्कोर", "ਘੱਟ ਸਕੋਰ")}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{getText("Avg Score", "औसत स्कोर", "ਔਸਤ ਸਕੋਰ")}</CardTitle>
                  <TrendingUp className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{averageScore.toFixed(0)}%</div>
                  <Progress value={averageScore} className="mt-2" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder={getText("Search students...", "छात्रों को खोजें...", "ਵਿਦਿਆਰਥੀਆਂ ਨੂੰ ਖੋਜੋ...")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline" className="gap-2 bg-transparent" onClick={handleExportStudents} disabled={loading}>
                <Download className="w-4 h-4" />
                {loading ? "Exporting..." : getText("Export", "निर्यात", "ਨਿਰਯਾਤ")}
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr className="bg-muted/40">
                        <th className="text-left p-4 font-medium">{getText("Student", "छात्र", "ਵਿਦਿਆਰਥੀ")}</th>
                        <th className="text-right p-4 font-medium">{getText("Score", "स्कोर", "ਸਕੋਰ")}</th>
                        <th className="text-left p-4 font-medium">{getText("Date", "दिनांक", "ਮਿਤੀ")}</th>
                        <th className="text-center p-4 font-medium">{getText("Status", "स्थिति", "ਸਥਿਤੀ")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan={4} className="text-center p-10">Loading...</td></tr>
                      ) : filteredStudents.length === 0 ? (
                        <tr><td colSpan={4} className="text-center p-10 text-muted-foreground">No submissions found.</td></tr>
                      ) : (
                        filteredStudents.map((attempt, index) => (
                          <tr key={index} className="border-b hover:bg-muted/20">
                            <td className="p-4 font-medium">{attempt.student_name}</td>
                            <td className="p-4 text-right font-bold">{attempt.score.toFixed(0)}%</td>
                            <td className="p-4 text-muted-foreground">{new Date(attempt.completed_at).toLocaleString()}</td>
                            <td className="p-4 text-center">
                              <Badge variant={attempt.score >= 70 ? 'default' : 'destructive'}>
                                {attempt.score >= 70 ? 'Passed' : 'Failed'}
                              </Badge>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Classes Tab - Connected to Real API */}
          <TabsContent value="classes" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {getText("Class Management", "कक्षा प्रबंधन", "ਕਲਾਸ ਪ੍ਰਬੰਧਨ")}
              </h2>
              <Button 
                className="gap-2" 
                onClick={handleAddClass} 
                disabled={classesLoading}
              >
                <Plus className="w-4 h-4" />
                {classesLoading 
                  ? getText("Creating...", "बनाया जा रहा है...", "ਬਣਾਇਆ ਜਾ ਰਿਹਾ ਹੈ...") 
                  : getText("Add Class", "कक्षा जोड़ें", "ਕਲਾਸ ਜੋੜੋ")
                }
              </Button>
            </div>

            {classesLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-muted-foreground">
                    {getText("Loading classes...", "कक्षाएं लोड हो रही हैं...", "ਕਲਾਸਾਂ ਲੋਡ ਹੋ ਰਹੀਆਂ ਹਨ...")}
                  </p>
                </div>
              </div>
            ) : classrooms.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-64">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {getText("No Classes Found", "कोई कक्षा नहीं मिली", "ਕੋਈ ਕਲਾਸ ਨਹੀਂ ਮਿਲੀ")}
                  </h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {getText(
                      "Create your first class to start managing students and tracking their progress.",
                      "छात्रों का प्रबंधन करने और उनकी प्रगति को ट्रैक करने के लिए अपनी पहली कक्षा बनाएं।",
                      "ਵਿਦਿਆਰਥੀਆਂ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰਨ ਅਤੇ ਉਹਨਾਂ ਦੀ ਤਰੱਕੀ ਨੂੰ ਟਰੈਕ ਕਰਨ ਲਈ ਆਪਣੀ ਪਹਿਲੀ ਕਲਾਸ ਬਣਾਓ।"
                    )}
                  </p>
                  <Button onClick={handleAddClass} className="gap-2">
                    <Plus className="w-4 h-4" />
                    {getText("Create First Class", "पहली कक्षा बनाएं", "ਪਹਿਲੀ ਕਲਾਸ ਬਣਾਓ")}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {classrooms.map((classroom) => (
                  <Card key={classroom.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="text-balance">{classroom.name}</span>
                        <Badge variant="secondary">
                          {classroom.student_count} {getText("students", "छात्र", "ਵਿਦਿਆਰਥੀ")}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {getText("Average Progress", "औसत प्रगति", "ਔਸਤ ਤਰੱਕੀ")}
                          </span>
                          <span className="font-medium">{Math.round(classroom.average_progress)}%</span>
                        </div>
                        <Progress value={classroom.average_progress} />
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-center">
                          <p className="text-lg font-bold text-success">{classroom.active_students_count}</p>
                          <p className="text-xs text-muted-foreground">
                            {getText("Active", "सक्रिय", "ਸਰਗਰਮ")}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-muted-foreground">{classroom.inactive_students_count}</p>
                          <p className="text-xs text-muted-foreground">
                            {getText("Inactive", "निष्क्रिय", "ਨਿਸ਼ਕਿਰਿਆ")}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 gap-1 bg-transparent" 
                          onClick={() => handleViewClass(classroom.id.toString())}
                          disabled={classesLoading}
                        >
                          <Eye className="w-3 h-3" /> 
                          {getText("View", "देखें", "ਵੇਖੋ")}
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1 gap-1" 
                          onClick={() => handleManageClass(classroom.id.toString())}
                          disabled={classesLoading}
                        >
                          <BookOpen className="w-3 h-3" /> 
                          {getText("Manage", "प्रबंधन", "ਪ੍ਰਬੰਧਨ")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Reports Tab - Connected to Real Data */}
          <TabsContent value="reports" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">{getText("Analytics & Reports", "विश्लेषण और रिपोर्ट", "ਵਿਸ਼ਲੇਸ਼ਣ ਅਤੇ ਰਿਪੋਰਟਾਂ")}</h2>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2 bg-transparent" onClick={() => handleDateRangeChange("custom")} disabled={loading}>
                  <Calendar className="w-4 h-4" />
                  {loading ? "Loading..." : getText("Date Range", "दिनांक सीमा", "ਮਿਤੀ ਸੀਮਾ")}
                </Button>
                <Button className="gap-2" onClick={handleExportReport} disabled={loading}>
                  <Download className="w-4 h-4" />
                  {loading ? "Exporting..." : getText("Export Report", "रिपोर्ट निर्यात करें", "ਰਿਪੋਰਟ ਨਿਰਯਾਤ ਕਰੋ")}
                </Button>
              </div>
            </div>
            
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    {getText("Class Progress Overview", "कक्षा प्रगति अवलोकन", "ਕਲਾਸ ਤਰੱਕੀ ਸੰਖੇਪ")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {classrooms.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      {getText("No classes available", "कोई कक्षा उपलब्ध नहीं", "ਕੋਈ ਕਲਾਸ ਉਪਲਬਧ ਨਹੀਂ")}
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {classrooms.map((classroom) => (
                        <div key={classroom.id} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{classroom.name}</span>
                            <span className="font-medium">{Math.round(classroom.average_progress)}%</span>
                          </div>
                          <Progress value={classroom.average_progress} />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-accent" />
                    {getText("Student Performance", "छात्र प्रदर्शन", "ਵਿਦਿਆਰਥੀ ਪ੍ਰਦਰਸ਼ਨ")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-success rounded-full"></div>
                        <span className="text-sm">{getText("Passing Students", "उत्तीर्ण छात्र", "ਪਾਸ ਵਿਦਿਆਰਥੀ")}</span>
                      </div>
                      <span className="font-medium">{studentProgress.filter(s => s.score >= 70).length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-warning rounded-full"></div>
                        <span className="text-sm">{getText("Need Help", "सहायता चाहिए", "ਮਦਦ ਚਾਹੀਦੀ")}</span>
                      </div>
                      <span className="font-medium">{strugglingStudentsCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        <span className="text-sm">{getText("Average Score", "औसत स्कोर", "ਔਸਤ ਸਕੋਰ")}</span>
                      </div>
                      <span className="font-medium">{averageScore.toFixed(0)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>{getText("Recent Student Activity", "हाल की छात्र गतिविधि", "ਹਾਲ ਦੀ ਵਿਦਿਆਰਥੀ ਗਤੀਵਿਧੀ")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">{getText("Student", "छात्र", "ਵਿਦਿਆਰਥੀ")}</th>
                        <th className="text-left p-2">{getText("Score", "स्कोर", "ਸਕੋਰ")}</th>
                        <th className="text-left p-2">{getText("Date", "दिनांक", "ਮਿਤੀ")}</th>
                        <th className="text-left p-2">{getText("Status", "स्थिति", "ਸਥਿਤੀ")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentProgress.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center p-8 text-muted-foreground">
                            {getText("No student activity found", "कोई छात्र गतिविधि नहीं मिली", "ਕੋਈ ਵਿਦਿਆਰਥੀ ਗਤੀਵਿਧੀ ਨਹੀਂ ਮਿਲੀ")}
                          </td>
                        </tr>
                      ) : (
                        studentProgress.slice(0, 10).map((student, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2 font-medium">{student.student_name}</td>
                            <td className="p-2">{student.score.toFixed(0)}%</td>
                            <td className="p-2">{new Date(student.completed_at).toLocaleDateString()}</td>
                            <td className="p-2">
                              <Badge variant={student.score >= 70 ? "default" : "destructive"}>
                                {student.score >= 70 
                                  ? getText("Passed", "उत्तीर्ण", "ਪਾਸ") 
                                  : getText("Failed", "अनुत्तीर्ण", "ਫੇਲ੍ਹ")
                                }
                              </Badge>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* NEW: Class Detail Modal */}
        {showClassModal && viewingClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">{viewingClass.name}</h2>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowClassModal(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                {modalLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <>
                    {/* Class Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold">{viewingClass.student_count}</div>
                          <div className="text-sm text-muted-foreground">Total Students</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold text-success">{viewingClass.active_students_count}</div>
                          <div className="text-sm text-muted-foreground">Active</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold text-warning">{viewingClass.inactive_students_count}</div>
                          <div className="text-sm text-muted-foreground">Inactive</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold text-primary">{Math.round(viewingClass.average_progress)}%</div>
                          <div className="text-sm text-muted-foreground">Avg Progress</div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Students List */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Students in This Class</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {classStudents.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            No students enrolled in this class yet.
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {classStudents.map((student) => (
                              <div key={student.enrollment_id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex-1">
                                  <h4 className="font-medium">{student.student_name}</h4>
                                  <p className="text-sm text-muted-foreground">@{student.username} • Grade: {student.grade}</p>
                                </div>
                                
                                <div className="flex items-center gap-4">
                                  {/* Progress */}
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">Progress:</span>
                                    <Input
                                      type="number"
                                      min="0"
                                      max="100"
                                      value={student.progress}
                                      onChange={(e) => handleUpdateProgress(student.enrollment_id, Number(e.target.value))}
                                      className="w-16 text-center"
                                    />
                                    <span className="text-sm">%</span>
                                  </div>
                                  
                                  {/* Status Toggle */}
                                  <Button
                                    variant={student.active ? "default" : "secondary"}
                                    size="sm"
                                    onClick={() => handleToggleStudentStatus(student.enrollment_id, !student.active)}
                                  >
                                    {student.active ? "Active" : "Inactive"}
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}


// "use client"

// import { useState } from "react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Progress } from "@/components/ui/progress"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Input } from "@/components/ui/input"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { useToast } from "@/components/ui/use-toast"
// import {
//   Users,
//   BookOpen,
//   TrendingUp,
//   Award,
//   Search,
//   Download,
//   Plus,
//   Eye,
//   Clock,
//   CheckCircle,
//   AlertCircle,
//   BarChart3,
//   PieChart,
//   Calendar,
//   Bell,
//   User,
// } from "lucide-react"

// interface Student {
//   id: string
//   name: string
//   nameHi: string
//   namePa: string
//   email: string
//   class: string
//   lessonsCompleted: number
//   totalLessons: number
//   lastActive: string
//   status: "active" | "inactive" | "struggling"
//   achievements: number
//   averageScore: number
// }

// interface ClassData {
//   id: string
//   name: string
//   nameHi: string
//   namePa: string
//   studentCount: number
//   averageProgress: number
//   activeStudents: number
// }

// const mockStudents: Student[] = [
//   {
//     id: "1",
//     name: "Rajesh Kumar",
//     nameHi: "राजेश कुमार",
//     namePa: "ਰਾਜੇਸ਼ ਕੁਮਾਰ",
//     email: "rajesh@example.com",
//     class: "Class 8A",
//     lessonsCompleted: 8,
//     totalLessons: 12,
//     lastActive: "2 hours ago",
//     status: "active",
//     achievements: 5,
//     averageScore: 85,
//   },
//   {
//     id: "2",
//     name: "Priya Sharma",
//     nameHi: "प्रिया शर्मा",
//     namePa: "ਪ੍ਰਿਆ ਸ਼ਰਮਾ",
//     email: "priya@example.com",
//     class: "Class 8A",
//     lessonsCompleted: 12,
//     totalLessons: 12,
//     lastActive: "1 day ago",
//     status: "active",
//     achievements: 8,
//     averageScore: 92,
//   },
//   {
//     id: "3",
//     name: "Amit Singh",
//     nameHi: "अमित सिंह",
//     namePa: "ਅਮਿਤ ਸਿੰਘ",
//     email: "amit@example.com",
//     class: "Class 8B",
//     lessonsCompleted: 3,
//     totalLessons: 12,
//     lastActive: "1 week ago",
//     status: "struggling",
//     achievements: 1,
//     averageScore: 65,
//   },
// ]

// const mockClasses: ClassData[] = [
//   {
//     id: "1",
//     name: "Class 8A",
//     nameHi: "कक्षा 8अ",
//     namePa: "ਜਮਾਤ 8ਏ",
//     studentCount: 25,
//     averageProgress: 78,
//     activeStudents: 22,
//   },
//   {
//     id: "2",
//     name: "Class 8B",
//     nameHi: "कक्षा 8ब",
//     namePa: "ਜਮਾਤ 8ਬੀ",
//     studentCount: 28,
//     averageProgress: 65,
//     activeStudents: 24,
//   },
//   {
//     id: "3",
//     name: "Class 9A",
//     nameHi: "कक्षा 9अ",
//     namePa: "ਜਮਾਤ 9ਏ",
//     studentCount: 30,
//     averageProgress: 82,
//     activeStudents: 28,
//   },
// ]

// export function TeacherDashboard() {
//   const [language, setLanguage] = useState<"en" | "hi" | "pa">("en")
//   const [selectedClass, setSelectedClass] = useState<string>("all")
//   const [searchTerm, setSearchTerm] = useState("")
//   const [activeTab, setActiveTab] = useState("overview")
//   const [loading, setLoading] = useState(false)
//   const [selectedDateRange, setSelectedDateRange] = useState("last-30-days")
//   const { toast } = useToast()

//   const handleViewStudent = (studentId: string) => {
//     setLoading(true)
//     toast({
//       title: "Loading Student Details",
//       description: "Fetching comprehensive student information...",
//     })

//     setTimeout(() => {
//       setLoading(false)
//       toast({
//         title: "Student Profile Loaded",
//         description: "Viewing detailed student progress and performance.",
//       })
//       window.location.href = `/teacher/student/${studentId}`
//     }, 1500)
//   }

//   const handleAssignLesson = (studentId: string) => {
//     setLoading(true)
//     toast({
//       title: "Opening Assignment Panel",
//       description: "Loading available lessons to assign...",
//     })

//     setTimeout(() => {
//       setLoading(false)
//       toast({
//         title: "Assignment Panel Ready",
//         description: "Select lessons to assign to this student.",
//       })
//       window.location.href = `/teacher/assign/${studentId}`
//     }, 1500)
//   }

//   const handleExportStudents = () => {
//     setLoading(true)
//     toast({
//       title: "Preparing Export",
//       description: "Generating student data export file...",
//     })

//     setTimeout(() => {
//       setLoading(false)
//       toast({
//         title: "Export Complete",
//         description: "Student data has been exported successfully.",
//       })
//       const csvContent = mockStudents
//         .map(
//           (student) =>
//             `${student.name},${student.email},${student.class},${student.lessonsCompleted}/${student.totalLessons},${student.averageScore}%,${student.status}`,
//         )
//         .join("\n")
//       const blob = new Blob([`Name,Email,Class,Progress,Score,Status\n${csvContent}`], { type: "text/csv" })
//       const url = window.URL.createObjectURL(blob)
//       const a = document.createElement("a")
//       a.href = url
//       a.download = "students-export.csv"
//       a.click()
//     }, 2000)
//   }

//   const handleViewClass = (classId: string) => {
//     setLoading(true)
//     toast({
//       title: "Loading Class Details",
//       description: "Fetching class information and student list...",
//     })

//     setTimeout(() => {
//       setLoading(false)
//       toast({
//         title: "Class Details Loaded",
//         description: "Viewing comprehensive class information.",
//       })
//       window.location.href = `/teacher/class/${classId}`
//     }, 1500)
//   }

//   const handleManageClass = (classId: string) => {
//     setLoading(true)
//     toast({
//       title: "Opening Class Management",
//       description: "Loading class management tools...",
//     })

//     setTimeout(() => {
//       setLoading(false)
//       toast({
//         title: "Management Panel Ready",
//         description: "Class management tools are now available.",
//       })
//       window.location.href = `/teacher/manage/${classId}`
//     }, 1500)
//   }

//   const handleAddClass = () => {
//     setLoading(true)
//     toast({
//       title: "Opening Class Creator",
//       description: "Loading new class creation form...",
//     })

//     setTimeout(() => {
//       setLoading(false)
//       toast({
//         title: "Class Creator Ready",
//         description: "Fill in the details to create a new class.",
//       })
//       window.location.href = "/teacher/create-class"
//     }, 1500)
//   }

//   const handleDateRangeChange = (range: string) => {
//     setSelectedDateRange(range)
//     setLoading(true)
//     toast({
//       title: "Updating Reports",
//       description: `Loading data for ${range.replace("-", " ")}...`,
//     })

//     setTimeout(() => {
//       setLoading(false)
//       toast({
//         title: "Reports Updated",
//         description: "Analytics have been refreshed with new date range.",
//       })
//     }, 1500)
//   }

//   const handleExportReport = () => {
//     setLoading(true)
//     toast({
//       title: "Generating Report",
//       description: "Creating comprehensive analytics report...",
//     })

//     setTimeout(() => {
//       setLoading(false)
//       toast({
//         title: "Report Generated",
//         description: "Analytics report has been exported successfully.",
//       })
//       const reportData = {
//         dateRange: selectedDateRange,
//         totalStudents: mockStudents.length,
//         activeStudents: mockStudents.filter((s) => s.status === "active").length,
//         strugglingStudents: mockStudents.filter((s) => s.status === "struggling").length,
//         averageProgress: Math.round(
//           mockStudents.reduce((acc, s) => acc + (s.lessonsCompleted / s.totalLessons) * 100, 0) / mockStudents.length,
//         ),
//         classData: mockClasses,
//         studentData: mockStudents,
//       }
//       const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" })
//       const url = window.URL.createObjectURL(blob)
//       const a = document.createElement("a")
//       a.href = url
//       a.download = `analytics-report-${selectedDateRange}.json`
//       a.click()
//     }, 2000)
//   }

//   const handleNotifications = () => {
//     setLoading(true)
//     toast({
//       title: "Loading Notifications",
//       description: "Fetching latest updates and alerts...",
//     })

//     setTimeout(() => {
//       setLoading(false)
//       toast({
//         title: "Notifications Loaded",
//         description: "You have 3 new notifications to review.",
//       })
//       window.location.href = "/teacher/notifications"
//     }, 1500)
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

//   const filteredStudents = mockStudents.filter((student) => {
//     const matchesSearch =
//       student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       student.nameHi.includes(searchTerm) ||
//       student.namePa.includes(searchTerm)
//     const matchesClass = selectedClass === "all" || student.class === selectedClass
//     return matchesSearch && matchesClass
//   })

//   const totalStudents = mockStudents.length
//   const activeStudents = mockStudents.filter((s) => s.status === "active").length
//   const strugglingStudents = mockStudents.filter((s) => s.status === "struggling").length
//   const averageProgress = Math.round(
//     mockStudents.reduce((acc, s) => acc + (s.lessonsCompleted / s.totalLessons) * 100, 0) / totalStudents,
//   )

//   return (
//     <div className="min-h-screen bg-background">
//       {/* Header */}
//       <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
//         <div className="container mx-auto px-4 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
//                 <Users className="w-6 h-6 text-primary-foreground" />
//               </div>
//               <div>
//                 <h1 className="text-xl font-bold text-balance">
//                   {getText("Teacher Dashboard", "शिक्षक डैशबोर्ड", "ਅਧਿਆਪਕ ਡੈਸ਼ਬੋਰਡ")}
//                 </h1>
//                 <p className="text-sm text-muted-foreground">
//                   {getText(
//                     "Monitor student progress and manage classes",
//                     "छात्र प्रगति की निगरानी करें और कक्षाओं का प्रबंधन करें",
//                     "ਵਿਦਿਆਰਥੀ ਦੀ ਤਰੱਕੀ ਦੀ ਨਿਗਰਾਨੀ ਕਰੋ ਅਤੇ ਕਲਾਸਾਂ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ",
//                   )}
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

//               {/* Notifications */}
//               <Button variant="ghost" size="sm" className="relative" onClick={handleNotifications} disabled={loading}>
//                 <Bell className="w-4 h-4" />
//                 <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full"></span>
//               </Button>

//               {/* Profile Menu */}
//               <div className="flex items-center gap-2">
//                 <Button variant="ghost" size="sm" className="gap-2">
//                   <User className="w-4 h-4" />
//                   <span className="hidden sm:inline">{getText("Teacher Name", "शिक्षक नाम", "ਅਧਿਆਪਕ ਨਾਮ")}</span>
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </header>

//       <main className="container mx-auto px-4 py-6">
//         <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
//           <TabsList className="grid w-full grid-cols-4">
//             <TabsTrigger value="overview">{getText("Overview", "अवलोकन", "ਸੰਖੇਪ")}</TabsTrigger>
//             <TabsTrigger value="students">{getText("Students", "छात्र", "ਵਿਦਿਆਰਥੀ")}</TabsTrigger>
//             <TabsTrigger value="classes">{getText("Classes", "कक्षाएं", "ਕਲਾਸਾਂ")}</TabsTrigger>
//             <TabsTrigger value="reports">{getText("Reports", "रिपोर्ट", "ਰਿਪੋਰਟਾਂ")}</TabsTrigger>
//           </TabsList>

//           {/* Overview Tab */}
//           <TabsContent value="overview" className="space-y-6">
//             {/* Stats Cards */}
//             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//               <Card>
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                   <CardTitle className="text-sm font-medium">
//                     {getText("Total Students", "कुल छात्र", "ਕੁੱਲ ਵਿਦਿਆਰਥੀ")}
//                   </CardTitle>
//                   <Users className="h-4 w-4 text-muted-foreground" />
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-2xl font-bold">{totalStudents}</div>
//                   <p className="text-xs text-muted-foreground">
//                     +2 {getText("from last week", "पिछले सप्ताह से", "ਪਿਛਲੇ ਹਫ਼ਤੇ ਤੋਂ")}
//                   </p>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                   <CardTitle className="text-sm font-medium">
//                     {getText("Active Students", "सक्रिय छात्र", "ਸਰਗਰਮ ਵਿਦਿਆਰਥੀ")}
//                   </CardTitle>
//                   <CheckCircle className="h-4 w-4 text-success" />
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-2xl font-bold text-success">{activeStudents}</div>
//                   <p className="text-xs text-muted-foreground">
//                     {Math.round((activeStudents / totalStudents) * 100)}%{" "}
//                     {getText("engagement", "सहभागिता", "ਸਹਿਭਾਗਤਾ")}
//                   </p>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                   <CardTitle className="text-sm font-medium">
//                     {getText("Need Help", "सहायता चाहिए", "ਮਦਦ ਚਾਹੀਦੀ")}
//                   </CardTitle>
//                   <AlertCircle className="h-4 w-4 text-warning" />
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-2xl font-bold text-warning">{strugglingStudents}</div>
//                   <p className="text-xs text-muted-foreground">
//                     {getText("Students struggling", "संघर्षरत छात्र", "ਸੰਘਰਸ਼ ਕਰ ਰਹੇ ਵਿਦਿਆਰਥੀ")}
//                   </p>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                   <CardTitle className="text-sm font-medium">
//                     {getText("Avg Progress", "औसत प्रगति", "ਔਸਤ ਤਰੱਕੀ")}
//                   </CardTitle>
//                   <TrendingUp className="h-4 w-4 text-primary" />
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-2xl font-bold text-primary">{averageProgress}%</div>
//                   <Progress value={averageProgress} className="mt-2" />
//                 </CardContent>
//               </Card>
//             </div>

//             {/* Recent Activity */}
//             <div className="grid gap-6 lg:grid-cols-2">
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <Clock className="w-5 h-5 text-primary" />
//                     {getText("Recent Activity", "हाल की गतिविधि", "ਹਾਲ ਦੀ ਗਤੀਵਿਧੀ")}
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   {mockStudents.slice(0, 5).map((student) => (
//                     <div key={student.id} className="flex items-center justify-between">
//                       <div className="flex items-center gap-3">
//                         <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
//                           <User className="w-4 h-4 text-primary" />
//                         </div>
//                         <div>
//                           <p className="text-sm font-medium">{getText(student.name, student.nameHi, student.namePa)}</p>
//                           <p className="text-xs text-muted-foreground">
//                             {getText("Completed lesson", "पाठ पूरा किया", "ਪਾਠ ਪੂਰਾ ਕੀਤਾ")}
//                           </p>
//                         </div>
//                       </div>
//                       <span className="text-xs text-muted-foreground">{student.lastActive}</span>
//                     </div>
//                   ))}
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <Award className="w-5 h-5 text-accent" />
//                     {getText("Top Performers", "शीर्ष प्रदर्शनकर्ता", "ਸਿਖਰਲੇ ਪ੍ਰਦਰਸ਼ਨਕਾਰ")}
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   {mockStudents
//                     .sort((a, b) => b.averageScore - a.averageScore)
//                     .slice(0, 5)
//                     .map((student, index) => (
//                       <div key={student.id} className="flex items-center justify-between">
//                         <div className="flex items-center gap-3">
//                           <div
//                             className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
//                               index === 0
//                                 ? "bg-warning text-warning-foreground"
//                                 : index === 1
//                                   ? "bg-muted text-muted-foreground"
//                                   : index === 2
//                                     ? "bg-accent/20 text-accent"
//                                     : "bg-muted/50 text-muted-foreground"
//                             }`}
//                           >
//                             {index + 1}
//                           </div>
//                           <div>
//                             <p className="text-sm font-medium">
//                               {getText(student.name, student.nameHi, student.namePa)}
//                             </p>
//                             <p className="text-xs text-muted-foreground">{student.class}</p>
//                           </div>
//                         </div>
//                         <div className="text-right">
//                           <p className="text-sm font-bold text-success">{student.averageScore}%</p>
//                           <p className="text-xs text-muted-foreground">
//                             {student.achievements} {getText("badges", "बैज", "ਬੈਜ")}
//                           </p>
//                         </div>
//                       </div>
//                     ))}
//                 </CardContent>
//               </Card>
//             </div>
//           </TabsContent>

//           {/* Students Tab */}
//           <TabsContent value="students" className="space-y-6">
//             {/* Filters */}
//             <div className="flex flex-col sm:flex-row gap-4">
//               <div className="flex-1">
//                 <div className="relative">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
//                   <Input
//                     placeholder={getText("Search students...", "छात्रों को खोजें...", "ਵਿਦਿਆਰਥੀਆਂ ਨੂੰ ਖੋਜੋ...")}
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="pl-10"
//                   />
//                 </div>
//               </div>
//               <Select value={selectedClass} onValueChange={setSelectedClass}>
//                 <SelectTrigger className="w-full sm:w-48">
//                   <SelectValue placeholder={getText("Select class", "कक्षा चुनें", "ਕਲਾਸ ਚੁਣੋ")} />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">{getText("All Classes", "सभी कक्षाएं", "ਸਾਰੀਆਂ ਕਲਾਸਾਂ")}</SelectItem>
//                   {mockClasses.map((cls) => (
//                     <SelectItem key={cls.id} value={cls.name}>
//                       {getText(cls.name, cls.nameHi, cls.namePa)}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//               <Button
//                 variant="outline"
//                 className="gap-2 bg-transparent"
//                 onClick={handleExportStudents}
//                 disabled={loading}
//               >
//                 <Download className="w-4 h-4" />
//                 {loading ? "Exporting..." : getText("Export", "निर्यात", "ਨਿਰਯਾਤ")}
//               </Button>
//             </div>

//             {/* Students List */}
//             <div className="grid gap-4">
//               {filteredStudents.map((student) => (
//                 <Card key={student.id} className="hover:shadow-md transition-shadow">
//                   <CardContent className="p-6">
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-4">
//                         <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
//                           <User className="w-6 h-6 text-primary" />
//                         </div>
//                         <div>
//                           <h3 className="font-semibold text-balance">
//                             {getText(student.name, student.nameHi, student.namePa)}
//                           </h3>
//                           <p className="text-sm text-muted-foreground">{student.class}</p>
//                           <div className="flex items-center gap-2 mt-1">
//                             <Badge
//                               variant={
//                                 student.status === "active"
//                                   ? "default"
//                                   : student.status === "struggling"
//                                     ? "destructive"
//                                     : "secondary"
//                               }
//                             >
//                               {student.status === "active"
//                                 ? getText("Active", "सक्रिय", "ਸਰਗਰਮ")
//                                 : student.status === "struggling"
//                                   ? getText("Needs Help", "सहायता चाहिए", "ਮਦਦ ਚਾਹੀਦੀ")
//                                   : getText("Inactive", "निष्क्रिय", "ਨਿਸ਼ਕਿਰਿਆ")}
//                             </Badge>
//                             <span className="text-xs text-muted-foreground">
//                               {getText("Last active:", "अंतिम सक्रिय:", "ਆਖਰੀ ਸਰਗਰਮ:")} {student.lastActive}
//                             </span>
//                           </div>
//                         </div>
//                       </div>

//                       <div className="text-right space-y-2">
//                         <div className="flex items-center gap-4">
//                           <div className="text-center">
//                             <p className="text-2xl font-bold text-primary">
//                               {Math.round((student.lessonsCompleted / student.totalLessons) * 100)}%
//                             </p>
//                             <p className="text-xs text-muted-foreground">{getText("Progress", "प्रगति", "ਤਰੱਕੀ")}</p>
//                           </div>
//                           <div className="text-center">
//                             <p className="text-2xl font-bold text-success">{student.averageScore}%</p>
//                             <p className="text-xs text-muted-foreground">{getText("Score", "स्कोर", "ਸਕੋਰ")}</p>
//                           </div>
//                           <div className="text-center">
//                             <p className="text-2xl font-bold text-accent">{student.achievements}</p>
//                             <p className="text-xs text-muted-foreground">{getText("Badges", "बैज", "ਬੈਜ")}</p>
//                           </div>
//                         </div>
//                         <div className="flex gap-2">
//                           <Button
//                             size="sm"
//                             variant="outline"
//                             className="gap-1 bg-transparent"
//                             onClick={() => handleViewStudent(student.id)}
//                             disabled={loading}
//                           >
//                             <Eye className="w-3 h-3" />
//                             {getText("View", "देखें", "ਵੇਖੋ")}
//                           </Button>
//                           <Button
//                             size="sm"
//                             className="gap-1"
//                             onClick={() => handleAssignLesson(student.id)}
//                             disabled={loading}
//                           >
//                             <Plus className="w-3 h-3" />
//                             {getText("Assign", "असाइन करें", "ਸੌਂਪੋ")}
//                           </Button>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="mt-4">
//                       <div className="flex items-center justify-between mb-2">
//                         <span className="text-sm text-muted-foreground">
//                           {getText("Lesson Progress", "पाठ प्रगति", "ਪਾਠ ਤਰੱਕੀ")}
//                         </span>
//                         <span className="text-sm font-medium">
//                           {student.lessonsCompleted}/{student.totalLessons}
//                         </span>
//                       </div>
//                       <Progress value={(student.lessonsCompleted / student.totalLessons) * 100} />
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           </TabsContent>

//           {/* Classes Tab */}
//           <TabsContent value="classes" className="space-y-6">
//             <div className="flex justify-between items-center">
//               <h2 className="text-2xl font-bold">{getText("Class Management", "कक्षा प्रबंधन", "ਕਲਾਸ ਪ੍ਰਬੰਧਨ")}</h2>
//               <Button className="gap-2" onClick={handleAddClass} disabled={loading}>
//                 <Plus className="w-4 h-4" />
//                 {loading ? "Creating..." : getText("Add Class", "कक्षा जोड़ें", "ਕਲਾਸ ਜੋੜੋ")}
//               </Button>
//             </div>

//             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//               {mockClasses.map((classData) => (
//                 <Card key={classData.id} className="hover:shadow-lg transition-shadow">
//                   <CardHeader>
//                     <CardTitle className="flex items-center justify-between">
//                       <span className="text-balance">
//                         {getText(classData.name, classData.nameHi, classData.namePa)}
//                       </span>
//                       <Badge variant="secondary">
//                         {classData.studentCount} {getText("students", "छात्र", "ਵਿਦਿਆਰਥੀ")}
//                       </Badge>
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent className="space-y-4">
//                     <div className="space-y-2">
//                       <div className="flex justify-between text-sm">
//                         <span className="text-muted-foreground">
//                           {getText("Average Progress", "औसत प्रगति", "ਔਸਤ ਤਰੱਕੀ")}
//                         </span>
//                         <span className="font-medium">{classData.averageProgress}%</span>
//                       </div>
//                       <Progress value={classData.averageProgress} />
//                     </div>

//                     <div className="flex justify-between items-center">
//                       <div className="text-center">
//                         <p className="text-lg font-bold text-success">{classData.activeStudents}</p>
//                         <p className="text-xs text-muted-foreground">{getText("Active", "सक्रिय", "ਸਰਗਰਮ")}</p>
//                       </div>
//                       <div className="text-center">
//                         <p className="text-lg font-bold text-muted-foreground">
//                           {classData.studentCount - classData.activeStudents}
//                         </p>
//                         <p className="text-xs text-muted-foreground">{getText("Inactive", "निष्क्रिय", "ਨਿਸ਼ਕਿਰਿਆ")}</p>
//                       </div>
//                     </div>

//                     <div className="flex gap-2">
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         className="flex-1 gap-1 bg-transparent"
//                         onClick={() => handleViewClass(classData.id)}
//                         disabled={loading}
//                       >
//                         <Eye className="w-3 h-3" />
//                         {getText("View", "देखें", "ਵੇਖੋ")}
//                       </Button>
//                       <Button
//                         size="sm"
//                         className="flex-1 gap-1"
//                         onClick={() => handleManageClass(classData.id)}
//                         disabled={loading}
//                       >
//                         <BookOpen className="w-3 h-3" />
//                         {getText("Manage", "प्रबंधन", "ਪ੍ਰਬੰਧਨ")}
//                       </Button>
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           </TabsContent>

//           {/* Reports Tab */}
//           <TabsContent value="reports" className="space-y-6">
//             <div className="flex justify-between items-center">
//               <h2 className="text-2xl font-bold">
//                 {getText("Analytics & Reports", "विश्लेषण और रिपोर्ट", "ਵਿਸ਼ਲੇਸ਼ਣ ਅਤੇ ਰਿਪੋਰਟਾਂ")}
//               </h2>
//               <div className="flex gap-2">
//                 <Button
//                   variant="outline"
//                   className="gap-2 bg-transparent"
//                   onClick={() => handleDateRangeChange("custom")}
//                   disabled={loading}
//                 >
//                   <Calendar className="w-4 h-4" />
//                   {loading ? "Loading..." : getText("Date Range", "दिनांक सीमा", "ਮਿਤੀ ਸੀਮਾ")}
//                 </Button>
//                 <Button className="gap-2" onClick={handleExportReport} disabled={loading}>
//                   <Download className="w-4 h-4" />
//                   {loading ? "Exporting..." : getText("Export Report", "रिपोर्ट निर्यात करें", "ਰਿਪੋਰਟ ਨਿਰਯਾਤ ਕਰੋ")}
//                 </Button>
//               </div>
//             </div>

//             <div className="grid gap-6 lg:grid-cols-2">
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <BarChart3 className="w-5 h-5 text-primary" />
//                     {getText("Progress Overview", "प्रगति अवलोकन", "ਤਰੱਕੀ ਸੰਖੇਪ")}
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-4">
//                     {mockClasses.map((classData) => (
//                       <div key={classData.id} className="space-y-2">
//                         <div className="flex justify-between text-sm">
//                           <span>{getText(classData.name, classData.nameHi, classData.namePa)}</span>
//                           <span className="font-medium">{classData.averageProgress}%</span>
//                         </div>
//                         <Progress value={classData.averageProgress} />
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <PieChart className="w-5 h-5 text-accent" />
//                     {getText("Student Status", "छात्र स्थिति", "ਵਿਦਿਆਰਥੀ ਸਥਿਤੀ")}
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-4">
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-2">
//                         <div className="w-3 h-3 bg-success rounded-full"></div>
//                         <span className="text-sm">{getText("Active Students", "सक्रिय छात्र", "ਸਰਗਰਮ ਵਿਦਿਆਰਥੀ")}</span>
//                       </div>
//                       <span className="font-medium">{activeStudents}</span>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-2">
//                         <div className="w-3 h-3 bg-warning rounded-full"></div>
//                         <span className="text-sm">{getText("Need Help", "सहायता चाहिए", "ਮਦਦ ਚਾਹੀਦੀ")}</span>
//                       </div>
//                       <span className="font-medium">{strugglingStudents}</span>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-2">
//                         <div className="w-3 h-3 bg-muted rounded-full"></div>
//                         <span className="text-sm">{getText("Inactive", "निष्क्रिय", "ਨਿਸ਼ਕਿਰਿਆ")}</span>
//                       </div>
//                       <span className="font-medium">{totalStudents - activeStudents - strugglingStudents}</span>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>

//             {/* Detailed Reports */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>
//                   {getText("Detailed Performance Report", "विस्तृत प्रदर्शन रिपोर्ट", "ਵਿਸਤ੍ਰਿਤ ਪ੍ਰਦਰਸ਼ਨ ਰਿਪੋਰਟ")}
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="overflow-x-auto">
//                   <table className="w-full text-sm">
//                     <thead>
//                       <tr className="border-b">
//                         <th className="text-left p-2">{getText("Student", "छात्र", "ਵਿਦਿਆਰਥੀ")}</th>
//                         <th className="text-left p-2">{getText("Class", "कक्षा", "ਕਲਾਸ")}</th>
//                         <th className="text-left p-2">{getText("Progress", "प्रगति", "ਤਰੱਕੀ")}</th>
//                         <th className="text-left p-2">{getText("Score", "स्कोर", "ਸਕੋਰ")}</th>
//                         <th className="text-left p-2">{getText("Status", "स्थिति", "ਸਥਿਤੀ")}</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {mockStudents.map((student) => (
//                         <tr key={student.id} className="border-b">
//                           <td className="p-2 font-medium">{getText(student.name, student.nameHi, student.namePa)}</td>
//                           <td className="p-2">{student.class}</td>
//                           <td className="p-2">
//                             {Math.round((student.lessonsCompleted / student.totalLessons) * 100)}%
//                           </td>
//                           <td className="p-2">{student.averageScore}%</td>
//                           <td className="p-2">
//                             <Badge
//                               variant={
//                                 student.status === "active"
//                                   ? "default"
//                                   : student.status === "struggling"
//                                     ? "destructive"
//                                     : "secondary"
//                               }
//                             >
//                               {student.status === "active"
//                                 ? getText("Active", "सक्रिय", "ਸਰਗਰਮ")
//                                 : student.status === "struggling"
//                                   ? getText("Needs Help", "सहायता चाहिए", "ਮਦਦ ਚਾਹੀਦੀ")
//                                   : getText("Inactive", "निष्क्रिय", "ਨਿਸ਼ਕਿਰਿਆ")}
//                             </Badge>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>
//         </Tabs>
//       </main>
//     </div>
//   )
// }
