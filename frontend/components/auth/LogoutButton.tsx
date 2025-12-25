"use client"

import { useRouter } from 'next/navigation'
import { logout } from '@/lib/api/authService'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { useToast } from '@/lib/hooks/use-toast'

export function LogoutButton() {
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = () => {
    logout()
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
    
    router.push('/get-started')
  }

  return (
    <Button 
      variant="ghost" 
      onClick={handleLogout}
      className="gap-2"
    >
      <LogOut className="w-4 h-4" />
      Logout
    </Button>
  )
}
