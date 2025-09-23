"use client"

import axios from "axios"
import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation" // Import useRouter for navigation
import api from "@/lib/api" // Import our central API service

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { BookOpen, ArrowLeft, Eye, EyeOff } from "lucide-react"

export function StudentAuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    // Changed email to username to match the backend
    username: "",
    password: "",
    confirmPassword: "",
  })
  const { toast } = useToast()
  const router = useRouter() // Initialize router

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // --- Registration Logic (currently not connected to backend) ---
    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Password Mismatch",
          description: "Passwords do not match. Please try again.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }
      
      try {
        // Split the full name into first and last name for the backend
        const nameParts = formData.name.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');

        // Make the API call to the registration endpoint
        await api.post('/auth/register/', {
            username: formData.username,
            password: formData.password,
            first_name: firstName,
            last_name: lastName,
        });

        toast({
          title: "Account Created!",
          description: "Your student account has been created. Please log in.",
        })
        // Automatically switch to the login form on success
        setIsLogin(true) 
      } catch (error) {
        toast({
            title: "Registration Failed",
            description: "That username might already be taken. Please try another one.",
            variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
      return; // End the function here after handling registration
    }


    // --- Login Logic (Connected to your backend) ---
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/auth/login/', {
        username: formData.username,
        password: formData.password,
      });

      const { token, user_info, role } = response.data;

      if (role === 'student') {
        localStorage.setItem('authToken', token);
        localStorage.setItem('userInfo', JSON.stringify(user_info));
        
        toast({
          title: "Welcome Back!",
          description: "Successfully logged in.",
        })

        // Redirect to dashboard
        router.push('/student/dashboard');
      } else {
        toast({
          title: "Login Error",
          description: "This is not a student account. Please use the teacher login page.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Please check your username and password.",
        variant: "destructive",
      });
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Button variant="ghost" className="gap-2" onClick={() => (window.location.href = "/get-started")}>
          <ArrowLeft className="w-4 h-4" />
          Back to Get Started
        </Button>

        <Card className="border-primary/20">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">{isLogin ? "Student Login" : "Create Student Account"}</CardTitle>
              <p className="text-muted-foreground">
                {isLogin
                  ? "Welcome back! Continue your learning journey."
                  : "Join thousands of students learning digital skills."}
              </p>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              )}
              
              {/* === IMPORTANT CHANGE: Email field is now Username === */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Processing..." : isLogin ? "Login" : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <Button variant="link" className="p-0 ml-1 h-auto" onClick={() => setIsLogin(!isLogin)}>
                  {isLogin ? "Sign up" : "Login"}
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
// "use client"

// import type React from "react"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { useToast } from "@/hooks/use-toast"
// import { BookOpen, ArrowLeft, Eye, EyeOff } from "lucide-react"

// export function StudentAuthPage() {
//   const [isLogin, setIsLogin] = useState(true)
//   const [showPassword, setShowPassword] = useState(false)
//   const [loading, setLoading] = useState(false)
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//   })
//   const { toast } = useToast()

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setLoading(true)

//     if (!isLogin && formData.password !== formData.confirmPassword) {
//       toast({
//         title: "Password Mismatch",
//         description: "Passwords do not match. Please try again.",
//         variant: "destructive",
//       })
//       setLoading(false)
//       return
//     }

//     setTimeout(() => {
//       toast({
//         title: isLogin ? "Welcome Back!" : "Account Created!",
//         description: isLogin ? "Successfully logged in." : "Your student account has been created.",
//       })

//       window.location.href = "/dashboard"
//     }, 2000)
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
//       <div className="w-full max-w-md space-y-6">
//         <Button variant="ghost" className="gap-2" onClick={() => (window.location.href = "/get-started")}>
//           <ArrowLeft className="w-4 h-4" />
//           Back to Get Started
//         </Button>

//         <Card className="border-primary/20">
//           <CardHeader className="text-center space-y-4">
//             <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
//               <BookOpen className="w-8 h-8 text-primary" />
//             </div>
//             <div>
//               <CardTitle className="text-2xl">{isLogin ? "Student Login" : "Create Student Account"}</CardTitle>
//               <p className="text-muted-foreground">
//                 {isLogin
//                   ? "Welcome back! Continue your learning journey."
//                   : "Join thousands of students learning digital skills."}
//               </p>
//             </div>
//           </CardHeader>

//           <CardContent>
//             <form onSubmit={handleSubmit} className="space-y-4">
//               {!isLogin && (
//                 <div className="space-y-2">
//                   <Label htmlFor="name">Full Name</Label>
//                   <Input
//                     id="name"
//                     type="text"
//                     placeholder="Enter your full name"
//                     value={formData.name}
//                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                     required
//                   />
//                 </div>
//               )}

//               <div className="space-y-2">
//                 <Label htmlFor="email">Email</Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder="Enter your email"
//                   value={formData.email}
//                   onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                   required
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="password">Password</Label>
//                 <div className="relative">
//                   <Input
//                     id="password"
//                     type={showPassword ? "text" : "password"}
//                     placeholder="Enter your password"
//                     value={formData.password}
//                     onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                     required
//                   />
//                   <Button
//                     type="button"
//                     variant="ghost"
//                     size="sm"
//                     className="absolute right-0 top-0 h-full px-3"
//                     onClick={() => setShowPassword(!showPassword)}
//                   >
//                     {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                   </Button>
//                 </div>
//               </div>

//               {!isLogin && (
//                 <div className="space-y-2">
//                   <Label htmlFor="confirmPassword">Confirm Password</Label>
//                   <Input
//                     id="confirmPassword"
//                     type="password"
//                     placeholder="Confirm your password"
//                     value={formData.confirmPassword}
//                     onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
//                     required
//                   />
//                 </div>
//               )}

//               <Button type="submit" className="w-full" disabled={loading}>
//                 {loading ? "Processing..." : isLogin ? "Login" : "Create Account"}
//               </Button>
//             </form>

//             <div className="mt-6 text-center">
//               <p className="text-sm text-muted-foreground">
//                 {isLogin ? "Don't have an account?" : "Already have an account?"}
//                 <Button variant="link" className="p-0 ml-1 h-auto" onClick={() => setIsLogin(!isLogin)}>
//                   {isLogin ? "Sign up" : "Login"}
//                 </Button>
//               </p>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   )
// }
