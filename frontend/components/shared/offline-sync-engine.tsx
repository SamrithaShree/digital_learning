"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Wifi,
  WifiOff,
  Download,
  Upload,
  RefreshCw,
  Database,
  Clock,
  CheckCircle,
  AlertCircle,
  HardDrive,
  CloudSun as CloudSync,
  Settings,
  Activity,
  FileText,
  Users,
  BookOpen,
  BarChart3,
  Zap,
  Globe,
  Signal,
} from "lucide-react"

interface SyncStatus {
  isOnline: boolean
  lastSync: Date | null
  pendingUploads: number
  pendingDownloads: number
  storageUsed: number
  storageLimit: number
  syncInProgress: boolean
  conflicts: number
}

interface DataCategory {
  id: string
  name: string
  nameHi: string
  namePa: string
  icon: React.ReactNode
  size: number
  lastUpdated: Date
  status: "synced" | "pending" | "conflict" | "offline"
  priority: "high" | "medium" | "low"
  itemCount: number
}

const mockSyncStatus: SyncStatus = {
  isOnline: true,
  lastSync: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
  pendingUploads: 3,
  pendingDownloads: 7,
  storageUsed: 245,
  storageLimit: 500,
  syncInProgress: false,
  conflicts: 1,
}

const mockDataCategories: DataCategory[] = [
  {
    id: "lessons",
    name: "Lessons & Content",
    nameHi: "पाठ और सामग्री",
    namePa: "ਪਾਠ ਅਤੇ ਸਮੱਗਰੀ",
    icon: <BookOpen className="w-5 h-5" />,
    size: 125,
    lastUpdated: new Date(Date.now() - 10 * 60 * 1000),
    status: "synced",
    priority: "high",
    itemCount: 45,
  },
  {
    id: "progress",
    name: "Student Progress",
    nameHi: "छात्र प्रगति",
    namePa: "ਵਿਦਿਆਰਥੀ ਪ੍ਰਗਤੀ",
    icon: <BarChart3 className="w-5 h-5" />,
    size: 67,
    lastUpdated: new Date(Date.now() - 2 * 60 * 1000),
    status: "pending",
    priority: "high",
    itemCount: 128,
  },
  {
    id: "users",
    name: "User Data",
    nameHi: "उपयोगकर्ता डेटा",
    namePa: "ਯੂਜ਼ਰ ਡੇਟਾ",
    icon: <Users className="w-5 h-5" />,
    size: 23,
    lastUpdated: new Date(Date.now() - 30 * 60 * 1000),
    status: "synced",
    priority: "medium",
    itemCount: 89,
  },
  {
    id: "media",
    name: "Media Files",
    nameHi: "मीडिया फाइलें",
    namePa: "ਮੀਡੀਆ ਫਾਈਲਾਂ",
    icon: <FileText className="w-5 h-5" />,
    size: 156,
    lastUpdated: new Date(Date.now() - 60 * 60 * 1000),
    status: "offline",
    priority: "low",
    itemCount: 234,
  },
  {
    id: "analytics",
    name: "Analytics Data",
    nameHi: "विश्लेषण डेटा",
    namePa: "ਵਿਸ਼ਲੇਸ਼ਣ ਡੇਟਾ",
    icon: <Activity className="w-5 h-5" />,
    size: 34,
    lastUpdated: new Date(Date.now() - 15 * 60 * 1000),
    status: "conflict",
    priority: "medium",
    itemCount: 67,
  },
]

export function OfflineSyncEngine() {
  const [language, setLanguage] = useState<"en" | "hi" | "pa">("en")
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(mockSyncStatus)
  const [dataCategories, setDataCategories] = useState<DataCategory[]>(mockDataCategories)
  const [autoSync, setAutoSync] = useState(true)
  const [syncQuality, setSyncQuality] = useState<"high" | "medium" | "low">("medium")

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

  const formatFileSize = (sizeInMB: number) => {
    if (sizeInMB < 1) {
      return `${Math.round(sizeInMB * 1024)} KB`
    }
    return `${sizeInMB} MB`
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) {
      return getText("Just now", "अभी", "ਹੁਣੇ")
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} ${getText("min ago", "मिनट पहले", "ਮਿੰਟ ਪਹਿਲਾਂ")}`
    } else {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours} ${getText("hr ago", "घंटे पहले", "ਘੰਟੇ ਪਹਿਲਾਂ")}`
    }
  }

  const getStatusColor = (status: DataCategory["status"]) => {
    switch (status) {
      case "synced":
        return "text-success"
      case "pending":
        return "text-warning"
      case "conflict":
        return "text-destructive"
      case "offline":
        return "text-muted-foreground"
      default:
        return "text-muted-foreground"
    }
  }

  const getStatusIcon = (status: DataCategory["status"]) => {
    switch (status) {
      case "synced":
        return <CheckCircle className="w-4 h-4" />
      case "pending":
        return <Clock className="w-4 h-4" />
      case "conflict":
        return <AlertCircle className="w-4 h-4" />
      case "offline":
        return <WifiOff className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const handleManualSync = () => {
    setSyncStatus((prev) => ({ ...prev, syncInProgress: true }))
    // Simulate sync process
    setTimeout(() => {
      setSyncStatus((prev) => ({
        ...prev,
        syncInProgress: false,
        lastSync: new Date(),
        pendingUploads: 0,
        pendingDownloads: 0,
      }))
      setDataCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          status: cat.status === "pending" ? "synced" : cat.status,
          lastUpdated: new Date(),
        })),
      )
    }, 3000)
  }

  const storagePercentage = (syncStatus.storageUsed / syncStatus.storageLimit) * 100

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <CloudSync className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-balance">
                  {getText("Offline Sync Engine", "ऑफलाइन सिंक इंजन", "ਆਫਲਾਈਨ ਸਿੰਕ ਇੰਜਨ")}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {getText(
                    "Manage offline data and synchronization",
                    "ऑफलाइन डेटा और सिंक्रोनाइज़ेशन प्रबंधित करें",
                    "ਆਫਲਾਈਨ ਡੇਟਾ ਅਤੇ ਸਿੰਕਰੋਨਾਈਜ਼ੇਸ਼ਨ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ",
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Connection Status */}
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  syncStatus.isOnline ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                }`}
              >
                {syncStatus.isOnline ? (
                  <>
                    <Wifi className="w-4 h-4" />
                    {getText("Online", "ऑनलाइन", "ਆਨਲਾਈਨ")}
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4" />
                    {getText("Offline", "ऑफलाइन", "ਆਫਲਾਈਨ")}
                  </>
                )}
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
        {/* Sync Status Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Signal className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{getText("Connection", "कनेक्शन", "ਕਨੈਕਸ਼ਨ")}</p>
                  <p className="font-semibold">
                    {syncStatus.isOnline ? getText("Strong", "मजबूत", "ਮਜ਼ਬੂਤ") : getText("Offline", "ऑफलाइन", "ਆਫਲਾਈਨ")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-warning/5 to-warning/10 border-warning/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-warning/20 rounded-lg flex items-center justify-center">
                  <Upload className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {getText("Pending Uploads", "अपलोड लंबित", "ਅਪਲੋਡ ਬਾਕੀ")}
                  </p>
                  <p className="font-semibold">{syncStatus.pendingUploads}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-info/5 to-info/10 border-info/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-info/20 rounded-lg flex items-center justify-center">
                  <Download className="w-5 h-5 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {getText("Pending Downloads", "डाउनलोड लंबित", "ਡਾਊਨਲੋਡ ਬਾਕੀ")}
                  </p>
                  <p className="font-semibold">{syncStatus.pendingDownloads}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-success/5 to-success/10 border-success/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center">
                  <HardDrive className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {getText("Storage Used", "उपयोग किया गया स्टोरेज", "ਵਰਤਿਆ ਸਟੋਰੇਜ")}
                  </p>
                  <p className="font-semibold">
                    {formatFileSize(syncStatus.storageUsed)} / {formatFileSize(syncStatus.storageLimit)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Storage Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              {getText("Storage Usage", "स्टोरेज उपयोग", "ਸਟੋਰੇਜ ਵਰਤੋਂ")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {formatFileSize(syncStatus.storageUsed)} {getText("used of", "का उपयोग", "ਦੀ ਵਰਤੋਂ")}{" "}
                {formatFileSize(syncStatus.storageLimit)}
              </span>
              <span className={`font-medium ${storagePercentage > 80 ? "text-destructive" : "text-muted-foreground"}`}>
                {Math.round(storagePercentage)}%
              </span>
            </div>
            <Progress
              value={storagePercentage}
              className={`h-2 ${storagePercentage > 80 ? "[&>div]:bg-destructive" : ""}`}
            />
            {storagePercentage > 80 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {getText(
                    "Storage is running low. Consider clearing old data or upgrading storage.",
                    "स्टोरेज कम हो रहा है। पुराना डेटा साफ़ करने या स्टोरेज अपग्रेड करने पर विचार करें।",
                    "ਸਟੋਰੇਜ ਘੱਟ ਹੋ ਰਿਹਾ ਹੈ। ਪੁਰਾਣਾ ਡੇਟਾ ਸਾਫ਼ ਕਰਨ ਜਾਂ ਸਟੋਰੇਜ ਅਪਗ੍ਰੇਡ ਕਰਨ ਬਾਰੇ ਸੋਚੋ।",
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="data" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="data">{getText("Data Categories", "डेटा श्रेणियां", "ਡੇਟਾ ਸ਼੍ਰੇਣੀਆਂ")}</TabsTrigger>
            <TabsTrigger value="sync">{getText("Sync Control", "सिंक नियंत्रण", "ਸਿੰਕ ਕੰਟਰੋਲ")}</TabsTrigger>
            <TabsTrigger value="settings">{getText("Settings", "सेटिंग्स", "ਸੈਟਿੰਗਜ਼")}</TabsTrigger>
          </TabsList>

          {/* Data Categories Tab */}
          <TabsContent value="data" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{getText("Data Categories", "डेटा श्रेणियां", "ਡੇਟਾ ਸ਼੍ਰੇਣੀਆਂ")}</h2>
              <Button
                onClick={handleManualSync}
                disabled={syncStatus.syncInProgress || !syncStatus.isOnline}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${syncStatus.syncInProgress ? "animate-spin" : ""}`} />
                {syncStatus.syncInProgress
                  ? getText("Syncing...", "सिंक हो रहा है...", "ਸਿੰਕ ਹੋ ਰਿਹਾ ਹੈ...")
                  : getText("Sync Now", "अभी सिंक करें", "ਹੁਣੇ ਸਿੰਕ ਕਰੋ")}
              </Button>
            </div>

            <div className="grid gap-4">
              {dataCategories.map((category) => (
                <Card key={category.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          {category.icon}
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-semibold text-balance">
                            {getText(category.name, category.nameHi, category.namePa)}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{formatFileSize(category.size)}</span>
                            <span>•</span>
                            <span>
                              {category.itemCount} {getText("items", "आइटम", "ਆਈਟਮ")}
                            </span>
                            <span>•</span>
                            <span>{formatTimeAgo(category.lastUpdated)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            category.priority === "high"
                              ? "destructive"
                              : category.priority === "medium"
                                ? "default"
                                : "secondary"
                          }
                          className="text-xs"
                        >
                          {category.priority === "high"
                            ? getText("High", "उच्च", "ਉੱਚ")
                            : category.priority === "medium"
                              ? getText("Medium", "मध्यम", "ਮੱਧਮ")
                              : getText("Low", "कम", "ਘੱਟ")}
                        </Badge>
                        <div className={`flex items-center gap-1 ${getStatusColor(category.status)}`}>
                          {getStatusIcon(category.status)}
                          <span className="text-sm font-medium">
                            {category.status === "synced"
                              ? getText("Synced", "सिंक किया गया", "ਸਿੰਕ ਕੀਤਾ")
                              : category.status === "pending"
                                ? getText("Pending", "लंबित", "ਬਾਕੀ")
                                : category.status === "conflict"
                                  ? getText("Conflict", "संघर्ष", "ਟਕਰਾਅ")
                                  : getText("Offline", "ऑफलाइन", "ਆਫਲਾਈਨ")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Sync Control Tab */}
          <TabsContent value="sync" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  {getText("Manual Sync", "मैनुअल सिंक", "ਮੈਨੁਅਲ ਸਿੰਕ")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {getText(
                    "Force synchronization of all pending data. This may consume significant bandwidth.",
                    "सभी लंबित डेटा का जबरदस्ती सिंक्रोनाइज़ेशन। इससे काफी बैंडविड्थ की खपत हो सकती है।",
                    "ਸਾਰੇ ਬਾਕੀ ਡੇਟਾ ਦਾ ਜ਼ਬਰਦਸਤੀ ਸਿੰਕਰੋਨਾਈਜ਼ੇਸ਼ਨ। ਇਸ ਨਾਲ ਕਾਫੀ ਬੈਂਡਵਿਡਥ ਦੀ ਖਪਤ ਹੋ ਸਕਦੀ ਹੈ।",
                  )}
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={handleManualSync}
                    disabled={syncStatus.syncInProgress || !syncStatus.isOnline}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {getText("Upload Changes", "परिवर्तन अपलोड करें", "ਤਬਦੀਲੀਆਂ ਅਪਲੋਡ ਕਰੋ")}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={syncStatus.syncInProgress || !syncStatus.isOnline}
                    className="gap-2 bg-transparent"
                  >
                    <Download className="w-4 h-4" />
                    {getText("Download Updates", "अपडेट डाउनलोड करें", "ਅਪਡੇਟ ਡਾਊਨਲੋਡ ਕਰੋ")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  {getText("Sync History", "सिंक इतिहास", "ਸਿੰਕ ਇਤਿਹਾਸ")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { time: new Date(Date.now() - 5 * 60 * 1000), type: "upload", status: "success" },
                    { time: new Date(Date.now() - 15 * 60 * 1000), type: "download", status: "success" },
                    { time: new Date(Date.now() - 45 * 60 * 1000), type: "upload", status: "failed" },
                    { time: new Date(Date.now() - 2 * 60 * 60 * 1000), type: "download", status: "success" },
                  ].map((sync, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            sync.status === "success"
                              ? "bg-success/10 text-success"
                              : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {sync.type === "upload" ? <Upload className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {sync.type === "upload"
                              ? getText("Data Upload", "डेटा अपलोड", "ਡੇਟਾ ਅਪਲੋਡ")
                              : getText("Data Download", "डेटा डाउनलोड", "ਡੇਟਾ ਡਾਊਨਲੋਡ")}
                          </p>
                          <p className="text-xs text-muted-foreground">{formatTimeAgo(sync.time)}</p>
                        </div>
                      </div>
                      <Badge variant={sync.status === "success" ? "secondary" : "destructive"}>
                        {sync.status === "success"
                          ? getText("Success", "सफल", "ਸਫਲ")
                          : getText("Failed", "असफल", "ਅਸਫਲ")}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  {getText("Sync Settings", "सिंक सेटिंग्स", "ਸਿੰਕ ਸੈਟਿੰਗਜ਼")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{getText("Auto Sync", "ऑटो सिंक", "ਆਟੋ ਸਿੰਕ")}</h3>
                    <p className="text-sm text-muted-foreground">
                      {getText(
                        "Automatically sync when connected to internet",
                        "इंटरनेट से जुड़ने पर स्वचालित रूप से सिंक करें",
                        "ਇੰਟਰਨੈੱਟ ਨਾਲ ਜੁੜਨ 'ਤੇ ਆਪਣੇ ਆਪ ਸਿੰਕ ਕਰੋ",
                      )}
                    </p>
                  </div>
                  <Button variant={autoSync ? "default" : "outline"} size="sm" onClick={() => setAutoSync(!autoSync)}>
                    {autoSync ? getText("Enabled", "सक्षम", "ਸਮਰੱਥ") : getText("Disabled", "अक्षम", "ਅਸਮਰੱਥ")}
                  </Button>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium">{getText("Sync Quality", "सिंक गुणवत्ता", "ਸਿੰਕ ਗੁਣਵੱਤਾ")}</h3>
                  <div className="grid gap-2">
                    {(["high", "medium", "low"] as const).map((quality) => (
                      <Button
                        key={quality}
                        variant={syncQuality === quality ? "default" : "outline"}
                        className="justify-start"
                        onClick={() => setSyncQuality(quality)}
                      >
                        <div className="text-left">
                          <div className="font-medium">
                            {quality === "high"
                              ? getText("High Quality", "उच्च गुणवत्ता", "ਉੱਚ ਗੁਣਵੱਤਾ")
                              : quality === "medium"
                                ? getText("Medium Quality", "मध्यम गुणवत्ता", "ਮੱਧਮ ਗੁਣਵੱਤਾ")
                                : getText("Low Quality", "कम गुणवत्ता", "ਘੱਟ ਗੁਣਵੱਤਾ")}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {quality === "high"
                              ? getText(
                                  "Full resolution, high bandwidth",
                                  "पूर्ण रिज़ॉल्यूशन, उच्च बैंडविड्थ",
                                  "ਪੂਰਾ ਰੈਜ਼ੋਲਿਊਸ਼ਨ, ਉੱਚ ਬੈਂਡਵਿਡਥ",
                                )
                              : quality === "medium"
                                ? getText("Balanced quality and speed", "संतुलित गुणवत्ता और गति", "ਸੰਤੁਲਿਤ ਗੁਣਵੱਤਾ ਅਤੇ ਗਤੀ")
                                : getText("Compressed, low bandwidth", "संपीड़ित, कम बैंडविड्थ", "ਸੰਕੁਚਿਤ, ਘੱਟ ਬੈਂਡਵਿਡਥ")}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-3">{getText("Storage Management", "स्टोरेज प्रबंधन", "ਸਟੋਰੇਜ ਪ੍ਰਬੰਧਨ")}</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <HardDrive className="w-4 h-4" />
                      {getText("Clear Cache", "कैश साफ़ करें", "ਕੈਸ਼ ਸਾਫ਼ ਕਰੋ")}
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <Database className="w-4 h-4" />
                      {getText("Optimize Storage", "स्टोरेज अनुकूलित करें", "ਸਟੋਰੇਜ ਅਨੁਕੂਲਿਤ ਕਰੋ")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  {getText("Network Settings", "नेटवर्क सेटिंग्स", "ਨੈੱਟਵਰਕ ਸੈਟਿੰਗਜ਼")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{getText("WiFi Only Sync", "केवल WiFi सिंक", "ਸਿਰਫ਼ WiFi ਸਿੰਕ")}</h3>
                    <p className="text-sm text-muted-foreground">
                      {getText(
                        "Only sync when connected to WiFi to save mobile data",
                        "मोबाइल डेटा बचाने के लिए केवल WiFi से जुड़े होने पर सिंक करें",
                        "ਮੋਬਾਈਲ ਡੇਟਾ ਬਚਾਉਣ ਲਈ ਸਿਰਫ਼ WiFi ਨਾਲ ਜੁੜੇ ਹੋਣ 'ਤੇ ਸਿੰਕ ਕਰੋ",
                      )}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    {getText("Enabled", "सक्षम", "ਸਮਰੱਥ")}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{getText("Background Sync", "बैकग्राउंड सिंक", "ਬੈਕਗ੍ਰਾਊਂਡ ਸਿੰਕ")}</h3>
                    <p className="text-sm text-muted-foreground">
                      {getText(
                        "Allow syncing when app is in background",
                        "ऐप बैकग्राउंड में होने पर सिंक करने की अनुमति दें",
                        "ਐਪ ਬੈਕਗ੍ਰਾਊਂਡ ਵਿੱਚ ਹੋਣ 'ਤੇ ਸਿੰਕ ਕਰਨ ਦੀ ਇਜਾਜ਼ਤ ਦਿਓ",
                      )}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    {getText("Enabled", "सक्षम", "ਸਮਰੱਥ")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
