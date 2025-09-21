# # filepath: /Users/SamrithaShree/Desktop/SAM/digital_learning_backend/backend/urls.py
# from django.contrib import admin
# from django.urls import path, include
# from django.conf import settings
# from django.conf.urls.static import static
# from rest_framework.authtoken import views

# urlpatterns = [
#     path('admin/', admin.site.urls),
#     path('api/quiz/', include('quiz.urls')),
#     path('api/auth/login/', views.obtain_auth_token),
# ] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuizViewSet, QuizSubmissionView, TeacherDashboardView, export_progress

router = DefaultRouter()
router.register('quiz', QuizViewSet, basename='quiz')

urlpatterns = [
    path('', include(router.urls)),
    path('submit/', QuizSubmissionView.as_view(), name='quiz-submit'),
    path('quiz/dashboard/', TeacherDashboardView.as_view(), name='teacher-dashboard'),
    path('quiz/export/', export_progress, name='export-progress'),
]
