import { StudentDetailPage } from "@/components/student-detail-page"

export default function TeacherStudentDetailPage({ params }: { params: { id: string } }) {
  return <StudentDetailPage studentId={params.id} />
}
