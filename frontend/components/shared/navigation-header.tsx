"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Home, LogOut } from "lucide-react"
import { useRouter } from "next/navigation" // Import the Next.js router

interface NavigationHeaderProps {
  title: string
  showBack?: boolean
  showHome?: boolean
  showLogout?: boolean // Add a prop to show the logout button
  backUrl?: string
}

export function NavigationHeader({ 
  title, 
  showBack = true, 
  showHome = true, 
  showLogout = false, // Default to false
  backUrl 
}: NavigationHeaderProps) {
  const router = useRouter() // Initialize the router

  const handleBack = () => {
    if (backUrl) {
      router.push(backUrl) // Use router.push for client-side navigation
    } else {
      router.back() // Use router.back() to go to the previous page
    }
  }

  const handleHome = () => {
    router.push("/") // Use router.push to navigate home
  }
  
  // Add a function to handle logging out
  const handleLogout = () => {
    // Clear user data from browser storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    
    // Redirect to the home page
    router.push('/');
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

          <div className="flex items-center gap-2">
            {showHome && (
              <Button variant="ghost" size="sm" onClick={handleHome} className="gap-2">
                <Home className="w-4 h-4" />
                Home
              </Button>
            )}
            {/* Add the Logout button, which shows conditionally */}
            {showLogout && (
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
// "use client"

// import { Button } from "@/components/ui/button"
// import { ArrowLeft, Home } from "lucide-react"

// interface NavigationHeaderProps {
//   title: string
//   showBack?: boolean
//   showHome?: boolean
//   backUrl?: string
// }

// export function NavigationHeader({ title, showBack = true, showHome = true, backUrl }: NavigationHeaderProps) {
//   const handleBack = () => {
//     if (backUrl) {
//       window.location.href = backUrl
//     } else {
//       window.history.back()
//     }
//   }

//   const handleHome = () => {
//     window.location.href = "/"
//   }

//   return (
//     <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
//       <div className="container mx-auto px-4 py-4">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             {showBack && (
//               <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
//                 <ArrowLeft className="w-4 h-4" />
//                 Back
//               </Button>
//             )}
//             <h1 className="text-xl font-bold">{title}</h1>
//           </div>

//           {showHome && (
//             <Button variant="ghost" size="sm" onClick={handleHome} className="gap-2">
//               <Home className="w-4 h-4" />
//               Home
//             </Button>
//           )}
//         </div>
//       </div>
//     </header>
//   )
// }
