"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings,
  CheckCircle,
  Clock,
  Eye
} from "lucide-react"

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
  duration_minutes: number;
  thumbnail_url: string;
  view_count: number;
  is_completed: boolean;
  progress_percentage: number;
}

interface VideoPlayerProps {
  video: Video;
  language: "en" | "hi" | "pa";
  onProgressUpdate?: (progressData: any) => void;
}

export function VideoPlayer({ video, language, onProgressUpdate }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  const getText = (en: string, hi: string, pa: string) => {
    return language === "hi" ? hi : language === "pa" ? pa : en
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => setCurrentTime(video.currentTime)
    const updateDuration = () => setDuration(video.duration)
    
    video.addEventListener('timeupdate', updateTime)
    video.addEventListener('loadedmetadata', updateDuration)
    
    return () => {
      video.removeEventListener('timeupdate', updateTime)
      video.removeEventListener('loadedmetadata', updateDuration)
    }
  }, [])

  // Update progress every 10 seconds
  useEffect(() => {
    if (currentTime > 0 && duration > 0) {
      const progressPercentage = (currentTime / duration) * 100
      
      // Update progress every 10 seconds
      if (Math.floor(currentTime) % 10 === 0) {
        onProgressUpdate?.({
          watch_time_seconds: Math.floor(currentTime),
          completion_percentage: progressPercentage,
          language: language
        })
      }
    }
  }, [currentTime, duration, language, onProgressUpdate])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleVolumeChange = (newVolume: number) => {
    const video = videoRef.current
    if (!video) return

    video.volume = newVolume
    setVolume(newVolume)
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current
    const progressBar = progressRef.current
    if (!video || !progressBar) return

    const rect = progressBar.getBoundingClientRect()
    const pos = (e.clientX - rect.left) / rect.width
    video.currentTime = pos * duration
  }

  const toggleFullscreen = () => {
    const video = videoRef.current
    if (!video) return

    if (!isFullscreen) {
      if (video.requestFullscreen) {
        video.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <CardTitle className="text-lg text-balance">
              {getText(video.title, video.title_hi, video.title_pa)}
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant={video.difficulty === 'beginner' ? 'secondary' : video.difficulty === 'intermediate' ? 'default' : 'destructive'}>
                {video.difficulty}
              </Badge>
              <Badge variant="outline">
                {video.category_name}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Clock className="w-3 h-3" />
                {video.duration_minutes}m
              </Badge>
            </div>
          </div>
          {video.is_completed && (
            <CheckCircle className="w-6 h-6 text-success" />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Video Player */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="w-full aspect-video"
            src={video.video_url}
            poster={video.thumbnail_url}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          
          {/* Video Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            {/* Progress Bar */}
            <div 
              ref={progressRef}
              className="w-full h-2 bg-white/20 rounded-full mb-3 cursor-pointer"
              onClick={handleSeek}
            >
              <div 
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            
            {/* Controls */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={togglePlay}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={toggleMute}
                    className="text-white hover:bg-white/20"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                  
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-16 h-1 bg-white/20 rounded-full"
                  />
                </div>
                
                <span className="text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  <Settings className="w-4 h-4" />
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20"
                >
                  <Maximize className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Video Info */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {getText(video.description, video.description_hi, video.description_pa)}
          </p>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <span>{video.view_count} views</span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="font-medium">
                {Math.round(video.progress_percentage)}% Complete
              </div>
              <Progress value={video.progress_percentage} className="w-24 h-2 mt-1" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
