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
from . import views

# Create router for any viewsets you have
router = DefaultRouter()

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', views.login_view, name='quiz_login'),
    path('submit/', views.QuizSubmissionView.as_view(), name='quiz_submit') if hasattr(views, 'QuizSubmissionView') else path('', views.login_view),
    path('dashboard/', views.TeacherDashboardView.as_view(), name='dashboard') if hasattr(views, 'TeacherDashboardView') else path('', views.login_view),
]
