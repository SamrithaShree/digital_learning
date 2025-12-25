// src/app/teacher/dashboard/page.tsx

import { TeacherDashboard } from "@/components/teacher/teacher-dashboard"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

export default function TeacherDashboardPage() {
  // This page simply renders your main teacher dashboard component.
  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <TeacherDashboard />
    </ProtectedRoute>
  )
}
