from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    QuizViewSet,
    QuizSubmissionView,
    TeacherDashboardView,
    ClassRoomViewSet,
    ClassDetailView,
    export_progress,
    login_view,
    logout_view,
    my_progress_view,
    student_registration_view,
    teacher_registration_view,
    update_student_progress, 
    update_student_status, 
    get_available_students,
    class_detail_view,
    add_student_to_class,
    remove_student_from_class,
    update_enrollment,
)

router = DefaultRouter()
router.register('quizzes', QuizViewSet, basename='quiz')
router.register(r'classrooms', ClassRoomViewSet, basename='classroom')

urlpatterns = [
    path('', include(router.urls)),
    path('submit/', QuizSubmissionView.as_view(), name='quiz-submit'),
    
    # Enhanced API endpoints with date range support (your friend's enhancement)
    path('dashboard/', TeacherDashboardView.as_view(), name='teacher-dashboard'),
    path('my-progress/', my_progress_view, name='my-progress'),
    path('export/', export_progress, name='export-progress'),

    # Authentication and registration endpoints
    path('auth/login/', login_view, name='api-login'),
    path('auth/logout/', logout_view, name='api-logout'),
    path('auth/register/', student_registration_view, name='api-register'),
    path('auth/register/teacher/', teacher_registration_view, name='api-teacher-register'),
    
    # Class management endpoints (your feature)
    path('classes/<int:class_id>/', ClassDetailView.as_view(), name='class_detail'),
    path('classes/<int:class_id>/details/', class_detail_view, name='class_detail_view'),
    path('classes/<int:class_id>/add-student/', add_student_to_class, name='add_student_to_class'),
    path('classes/<int:class_id>/remove-student/<int:enrollment_id>/', remove_student_from_class, name='remove_student_from_class'),
    path('enrollments/<int:enrollment_id>/update/', update_enrollment, name='update_enrollment'),
    path('enrollments/<int:enrollment_id>/status/', update_student_status, name='update_student_status'),
    path('enrollments/<int:enrollment_id>/progress/', update_student_progress, name='update_student_progress'),
    path('students/available/', get_available_students, name='available_students'),
]



# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from .views import (
#     QuizViewSet,
#     QuizSubmissionView,
#     TeacherDashboardView,
#     export_progress,
#     login_view,
#     logout_view,
#     my_progress_view,
#     student_registration_view,
#     teacher_registration_view,
# )

# router = DefaultRouter()
# router.register('quizzes', QuizViewSet, basename='quiz')

# urlpatterns = [
#     path('', include(router.urls)),
#     path('submit/', QuizSubmissionView.as_view(), name='quiz-submit'),
#     # Corrected URL patterns to match the tests
#     path('dashboard/', TeacherDashboardView.as_view(), name='teacher-dashboard'),
#     path('my-progress/', my_progress_view, name='my-progress'),
#     path('export/', export_progress, name='export-progress'),
#     path('auth/login/', login_view, name='api-login'),
#     path('auth/logout/', logout_view, name='api-logout'),
#     path('auth/register/', student_registration_view, name='api-register'),
#     path('auth/register/teacher/', teacher_registration_view, name='api-teacher-register'),
# ]

