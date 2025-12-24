import { LessonDetailPage } from "../../../../components/shared/lesson-detail-page"

export default function LessonDetail({ params }: { params: { id: string } }) {
  return <LessonDetailPage lessonId={params.id} />
}
