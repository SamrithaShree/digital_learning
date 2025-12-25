import { StudentDashboard } from "../../../components/student/student-dashboard"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

export default function DashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <StudentDashboard />
    </ProtectedRoute>
  )
}
