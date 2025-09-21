"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Home } from "lucide-react"

interface NavigationHeaderProps {
  title: string
  showBack?: boolean
  showHome?: boolean
  backUrl?: string
}

export function NavigationHeader({ title, showBack = true, showHome = true, backUrl }: NavigationHeaderProps) {
  const handleBack = () => {
    if (backUrl) {
      window.location.href = backUrl
    } else {
      window.history.back()
    }
  }

  const handleHome = () => {
    window.location.href = "/"
  }

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBack && (
              <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            )}
            <h1 className="text-xl font-bold">{title}</h1>
          </div>

          {showHome && (
            <Button variant="ghost" size="sm" onClick={handleHome} className="gap-2">
              <Home className="w-4 h-4" />
              Home
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
