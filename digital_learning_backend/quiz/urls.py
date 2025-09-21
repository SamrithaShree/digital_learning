from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    QuizViewSet,
    QuizSubmissionView,
    TeacherDashboardView,
    export_progress,
    login_view,
    logout_view,
)

router = DefaultRouter()
router.register('quizzes', QuizViewSet, basename='quiz')

urlpatterns = [
    path('', include(router.urls)),
    path('submit/', QuizSubmissionView.as_view(), name='quiz-submit'),
    # Corrected URL patterns to match the tests
    path('dashboard/', TeacherDashboardView.as_view(), name='teacher-dashboard'),
    path('export/', export_progress, name='export-progress'),
    path('auth/login/', login_view, name='api-login'),
    path('auth/logout/', logout_view, name='api-logout'),
]