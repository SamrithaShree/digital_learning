"use client"

import { getCurrentUser } from '@/lib/api/authService'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function UserInfo() {
  const user = getCurrentUser()

  if (!user) return null

  const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()

  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarFallback>{initials || 'U'}</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium">{user.first_name} {user.last_name}</p>
        <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
      </div>
    </div>
  )
}
