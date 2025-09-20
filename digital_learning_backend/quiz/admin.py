from django.contrib import admin
from .models import Student, Teacher, Quiz, Question, Badge, QuizAttempt, StudentBadge

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('user', 'grade', 'school')
    search_fields = ('user__username', 'user__email', 'school')

@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ('user', 'subject', 'school')
    search_fields = ('user__username', 'user__email', 'school')

@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('name', 'subject', 'created_by', 'created_at')
    search_fields = ('name', 'subject')
    list_filter = ('subject', 'created_at')

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('quiz', 'subject', 'text_en')
    search_fields = ('text_en', 'text_pa')
    list_filter = ('subject', 'quiz')

@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ('student', 'quiz', 'score', 'completed_at')
    list_filter = ('completed_at', 'score')

@admin.register(StudentBadge)
class StudentBadgeAdmin(admin.ModelAdmin):
    list_display = ('student', 'badge', 'awarded_at')
    list_filter = ('awarded_at', 'badge')
