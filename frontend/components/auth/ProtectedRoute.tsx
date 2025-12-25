"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated, getUserRole } from '@/lib/api/authService'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ('student' | 'teacher')[]
  requireAuth?: boolean
}

export function ProtectedRoute({ 
  children, 
  allowedRoles,
  requireAuth = true 
}: ProtectedRouteProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated()
      const userRole = getUserRole()

      if (requireAuth && !authenticated) {
        router.push('/get-started')
        return
      }

      if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
        if (userRole === 'student') {
          router.push('/student/dashboard')
        } else if (userRole === 'teacher') {
          router.push('/teacher/dashboard')
        } else {
          router.push('/get-started')
        }
        return
      }

      setIsAuthorized(true)
      setIsLoading(false)
    }

    checkAuth()
  }, [router, allowedRoles, requireAuth])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return isAuthorized ? <>{children}</> : null
}
