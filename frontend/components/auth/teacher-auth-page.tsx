"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { login, registerTeacher, storeAuthData } from "@/lib/api/authService"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "../../lib/hooks/use-toast"
import { Users, ArrowLeft, Eye, EyeOff, Shield } from "lucide-react"

export function TeacherAuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    confirmPassword: "",
    schoolId: "",
  })
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // --- Registration Logic ---
      if (!isLogin) {
        if (formData.password !== formData.confirmPassword) {
          toast({
            title: "Password Mismatch",
            variant: "destructive",
          })
          setLoading(false)
          return
        }

        const nameParts = formData.name.split(' ')
        const firstName = nameParts[0]
        const lastName = nameParts.slice(1).join(' ')

        const data = await registerTeacher({
          username: formData.username,
          password: formData.password,
          first_name: firstName,
          last_name: lastName,
          school_id: formData.schoolId,
        })

        // Store auth data
        storeAuthData(data)

        toast({
          title: "Account Created!",
          description: "Welcome to the teaching platform!",
        })

        // Redirect to dashboard
        router.push('/teacher/dashboard')
        return
      }

      // --- Login Logic ---
      const data = await login(formData.username, formData.password)

      // Check if teacher
      if (data.role !== 'teacher') {
        toast({
          title: "Login Error",
          description: "This is not a teacher account. Please use the student login page.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Store auth data
      storeAuthData(data)

      toast({
        title: "Welcome Back, Teacher!",
        description: "Successfully logged in to the teacher dashboard.",
      })

      // Redirect to teacher dashboard
      router.push('/teacher/dashboard')

    } catch (error: any) {
      const errorMsg = error.error || (isLogin ? "Invalid credentials" : "Registration failed")
      toast({
        title: isLogin ? "Login Failed" : "Registration Failed",
        description: errorMsg,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/5 via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Button variant="ghost" className="gap-2" onClick={() => router.push("/get-started")}>
          <ArrowLeft className="w-4 h-4" />
          Back to Get Started
        </Button>

        <Card className="border-secondary/20">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto">
              <Users className="w-8 h-8 text-secondary" />
            </div>
            <div>
              <CardTitle className="text-2xl">{isLogin ? "Teacher Login" : "Create Teacher Account"}</CardTitle>
              <p className="text-muted-foreground">
                {isLogin
                  ? "Welcome back! Manage your students and classes."
                  : "Join our community of educators making a difference."}
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

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="schoolId">School ID</Label>
                  <Input
                    id="schoolId"
                    type="text"
                    placeholder="Enter your school ID"
                    value={formData.schoolId}
                    onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
                    required
                  />
                </div>
              )}

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

              {!isLogin && (
                <div className="flex items-start gap-2 p-3 bg-secondary/5 rounded-lg">
                  <Shield className="w-4 h-4 text-secondary mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    Teacher accounts require verification. You'll receive an email once your account is approved.
                  </p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading} variant="secondary">
                {loading ? "Processing..." : isLogin ? "Login" : "Create Teacher Account"}
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
// import { useRouter } from "next/navigation" // Import useRouter for navigation
// import api from "@/lib/api/api" // Import our central API service

// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { useToast } from "../../lib/hooks/use-toast"
// import { Users, ArrowLeft, Eye, EyeOff, Shield } from "lucide-react"

// export function TeacherAuthPage() {
//   const [isLogin, setIsLogin] = useState(true)
//   const [showPassword, setShowPassword] = useState(false)
//   const [loading, setLoading] = useState(false)
//   const [formData, setFormData] = useState({
//     name: "",
//     username: "",
//     password: "",
//     confirmPassword: "",
//     schoolId: "",
//     teacherId: "",
//   })
//   const { toast } = useToast()
//   const router = useRouter() // Initialize router

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setLoading(true)

//     // --- Registration Logic (currently not connected to backend) ---
//     if (!isLogin) {
//       if (formData.password !== formData.confirmPassword) {
//         toast({
//           title: "Password Mismatch",
//           variant: "destructive",
//         })
//         setLoading(false)
//         return
//       }
      
//       try {
//         const nameParts = formData.name.split(' ');
//         const firstName = nameParts[0];
//         const lastName = nameParts.slice(1).join(' ');

//         // Send the schoolId and teacherId along with other data
//         await api.post('auth/register/teacher/', {
//             username: formData.username,
//             password: formData.password,
//             first_name: firstName,
//             last_name: lastName,
//             school_id: formData.schoolId, 
//         });

//         toast({
//           title: "Account Created!",
//           description: "Your teacher account has been created. Please log in.",
//         })
//         setIsLogin(true) // Switch to login form on success
//       } catch (error: any) {
        
//         let errorMsg = "An unexpected error occurred. Please try again.";
//         toast({
//             title: "Registration Failed",
//             description: errorMsg,
//             variant: "destructive",
//         })
//       } finally {
//         setLoading(false)
//       }
//       return
//     }

//     // --- Login Logic (Connected to your backend) ---
//     try {
//       const response = await api.post('/auth/login/', {
//         username: formData.username,
//         password: formData.password,
//       });

//       const { token, user_info, role } = response.data;

//       if (role === 'teacher') {
//         localStorage.setItem('authToken', token);
//         localStorage.setItem('userInfo', JSON.stringify(user_info));
//         localStorage.setItem('role', role);    
        
//         toast({
//           title: "Welcome Back, Teacher!",
//           description: "Successfully logged in to the teacher dashboard.",
//         })

//         // Redirect to teacher dashboard
//         router.push('/teacher/dashboard'); 
//       } else {
//         toast({
//           title: "Login Error",
//           description: "This is not a teacher account. Please use the student login page.",
//           variant: "destructive",
//         });
//       }
//     } catch (error) {
//       toast({
//         title: "Login Failed",
//         description: "Invalid credentials. Please check your username and password.",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-secondary/5 via-background to-primary/5 flex items-center justify-center p-4">
//       <div className="w-full max-w-md space-y-6">
//         <Button variant="ghost" className="gap-2" onClick={() => (window.location.href = "/get-started")}>
//           <ArrowLeft className="w-4 h-4" />
//           Back to Get Started
//         </Button>

//         <Card className="border-secondary/20">
//           <CardHeader className="text-center space-y-4">
//             <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto">
//               <Users className="w-8 h-8 text-secondary" />
//             </div>
//             <div>
//               <CardTitle className="text-2xl">{isLogin ? "Teacher Login" : "Create Teacher Account"}</CardTitle>
//               <p className="text-muted-foreground">
//                 {isLogin
//                   ? "Welcome back! Manage your students and classes."
//                   : "Join our community of educators making a difference."}
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

//               {/* === IMPORTANT CHANGE: Email field is now Username === */}
//               <div className="space-y-2">
//                 <Label htmlFor="username">Username</Label>
//                 <Input
//                   id="username"
//                   type="text"
//                   placeholder="Enter your username"
//                   value={formData.username}
//                   onChange={(e) => setFormData({ ...formData, username: e.target.value })}
//                   required
//                 />
//               </div>

//               {!isLogin && (
//                 <>
//                   <div className="space-y-2">
//                     <Label htmlFor="schoolId">School ID</Label>
//                     <Input
//                       id="schoolId"
//                       type="text"
//                       placeholder="Enter your school ID"
//                       value={formData.schoolId}
//                       onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
//                       required
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="teacherId">Teacher ID</Label>
//                     <Input
//                       id="teacherId"
//                       type="text"
//                       placeholder="Enter your teacher ID"
//                       value={formData.teacherId}
//                       onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
//                       required
//                     />
//                   </div>
//                 </>
//               )}

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

//               {!isLogin && (
//                 <div className="flex items-start gap-2 p-3 bg-secondary/5 rounded-lg">
//                   <Shield className="w-4 h-4 text-secondary mt-0.5" />
//                   <p className="text-xs text-muted-foreground">
//                     Teacher accounts require verification. You'll receive an email once your account is approved.
//                   </p>
//                 </div>
//               )}

//               <Button type="submit" className="w-full" disabled={loading} variant="secondary">
//                 {loading ? "Processing..." : isLogin ? "Login" : "Create Teacher Account"}
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
