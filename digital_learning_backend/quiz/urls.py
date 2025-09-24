from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    QuizViewSet,
    QuizSubmissionView,
    TeacherDashboardView,
    ClassRoomViewSet,
    ClassDetailView,
    VideoCategoriesView,
    VideoDetailView,
    VideoListView,
    VideoProgressView,
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
    # ADD OFFLINE IMPORTS
    download_offline_content,
    submit_offline_quiz,
    sync_offline_attempts,
    toggle_offline_mode,
    get_offline_status,
)

router = DefaultRouter()
router.register('quizzes', QuizViewSet, basename='quiz')
router.register(r'classrooms', ClassRoomViewSet, basename='classroom')

urlpatterns = [
    path('', include(router.urls)),
    path('submit/', QuizSubmissionView.as_view(), name='quiz-submit'),
    
    # Enhanced API endpoints with date range support
    path('dashboard/', TeacherDashboardView.as_view(), name='teacher-dashboard'),
    path('my-progress/', my_progress_view, name='my-progress'),
    path('export/', export_progress, name='export-progress'),

    # Authentication and registration endpoints
    path('auth/login/', login_view, name='api-login'),
    path('auth/logout/', logout_view, name='api-logout'),
    path('auth/register/', student_registration_view, name='api-register'),
    path('auth/register/teacher/', teacher_registration_view, name='api-teacher-register'),
    
    # Class management endpoints
    path('classes/<int:class_id>/', ClassDetailView.as_view(), name='class_detail'),
    path('classes/<int:class_id>/details/', class_detail_view, name='class_detail_view'),
    path('classes/<int:class_id>/add-student/', add_student_to_class, name='add_student_to_class'),
    path('classes/<int:class_id>/remove-student/<int:enrollment_id>/', remove_student_from_class, name='remove_student_from_class'),
    path('enrollments/<int:enrollment_id>/update/', update_enrollment, name='update_enrollment'),
    path('enrollments/<int:enrollment_id>/status/', update_student_status, name='update_student_status'),
    path('enrollments/<int:enrollment_id>/progress/', update_student_progress, name='update_student_progress'),
    path('students/available/', get_available_students, name='available_students'),

    # Video endpoints
    path('videos/', VideoListView.as_view(), name='video-list'),
    path('videos/<int:video_id>/', VideoDetailView.as_view(), name='video-detail'),
    path('videos/<int:video_id>/progress/', VideoProgressView.as_view(), name='video-progress'),
    path('video-categories/', VideoCategoriesView.as_view(), name='video-categories'),

    # NEW OFFLINE ENDPOINTS
    path('offline/download/', download_offline_content, name='offline-download'),
    path('offline/submit/', submit_offline_quiz, name='offline-submit'),
    path('offline/sync/', sync_offline_attempts, name='offline-sync'),
    path('offline/toggle/', toggle_offline_mode, name='offline-toggle'),
    path('offline/status/', get_offline_status, name='offline-status'),
]

# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from . import views

# # Only register the views that actually exist
# router = DefaultRouter()
# try:
#     router.register('quizzes', views.QuizViewSet, basename='quiz')
# except AttributeError:
#     pass

# try:
#     router.register(r'classrooms', views.ClassRoomViewSet, basename='classroom')
# except AttributeError:
#     pass

# urlpatterns = [
#     path('', include(router.urls)),
    
#     # Basic endpoints that should exist
#     path('auth/login/', views.login_view, name='api-login'),
#     path('auth/logout/', views.logout_view, name='api-logout'),
#     path('auth/register/', views.student_registration_view, name='api-register'),
#     path('auth/register/teacher/', views.teacher_registration_view, name='api-teacher-register'),
#     path('submit/', views.QuizSubmissionView.as_view(), name='quiz-submit'),
#     path('my-progress/', views.my_progress_view, name='my-progress'),
    
#     # Add offline endpoints if they exist
#     # Uncomment these once your views.py has the offline functions
#     path('offline/download/', views.download_offline_content, name='offline-download'),
#     path('offline/submit/', views.submit_offline_quiz, name='offline-submit'),
#     path('offline/sync/', views.sync_offline_attempts, name='offline-sync'),
#     path('offline/toggle/', views.toggle_offline_mode, name='offline-toggle'),
#     path('offline/status/', views.get_offline_status, name='offline-status'),
# ]
