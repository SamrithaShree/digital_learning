"use client"

import { QuizListPage } from "@/components/student/quiz-list-page"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

export default function QuizCenterPage() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <QuizListPage />
    </ProtectedRoute>
  )
}
