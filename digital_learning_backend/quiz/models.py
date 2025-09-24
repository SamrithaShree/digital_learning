from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

# EXISTING MODELS WITH OFFLINE FIELDS ADDED

class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    grade = models.CharField(max_length=10)
    school = models.CharField(max_length=100)
    
    # ADD OFFLINE FIELDS
    offline_mode = models.BooleanField(default=False)
    last_offline_sync = models.DateTimeField(null=True, blank=True)
    student_id = models.CharField(max_length=50, unique=True, null=True, blank=True)

    def __str__(self):
        return self.user.username


class Teacher(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    subject = models.CharField(max_length=50)
    school = models.CharField(max_length=100)

    def __str__(self):
        return self.user.username


# EXISTING VIDEO MODELS (KEEP AS IS)
class VideoCategory(models.Model):
    CATEGORY_CHOICES = [
        ('digital_literacy', 'Digital Literacy'),
        ('stem', 'STEM Subjects'),
        ('mathematics', 'Mathematics'),
        ('physics', 'Physics'),
        ('chemistry', 'Chemistry'),
        ('biology', 'Biology'),
    ]
    
    name = models.CharField(max_length=100)
    category_type = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} ({self.category_type})"


class Video(models.Model):
    DIFFICULTY_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]
    
    # Basic Info
    title = models.CharField(max_length=200)
    title_hi = models.CharField(max_length=200, blank=True)  # Hindi title
    title_pa = models.CharField(max_length=200, blank=True)  # Punjabi title
    
    description = models.TextField()
    description_hi = models.TextField(blank=True)
    description_pa = models.TextField(blank=True)
    
    # Category and Difficulty
    category = models.ForeignKey(VideoCategory, on_delete=models.CASCADE, related_name='videos')
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='beginner')
    
    # Video Files (URLs or paths)
    video_url_en = models.URLField(blank=True)  # English version
    video_url_hi = models.URLField(blank=True)  # Hindi version
    video_url_pa = models.URLField(blank=True)  # Punjabi version
    
    # Alternative: file uploads (for local storage)
    video_file_en = models.FileField(upload_to='videos/english/', blank=True)
    video_file_hi = models.FileField(upload_to='videos/hindi/', blank=True)
    video_file_pa = models.FileField(upload_to='videos/punjabi/', blank=True)
    
    # Metadata
    duration_minutes = models.IntegerField(default=10)  # Duration in minutes
    thumbnail_url = models.URLField(blank=True)
    view_count = models.IntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # ADD OFFLINE SUPPORT
    offline_available = models.BooleanField(default=True)
    download_size_mb = models.IntegerField(default=50)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} ({self.category.category_type})"
    
    def get_video_url(self, language='en'):
        """Get video URL based on language preference"""
        if language == 'hi' and self.video_url_hi:
            return self.video_url_hi
        elif language == 'pa' and self.video_url_pa:
            return self.video_url_pa
        elif language == 'hi' and self.video_file_hi:
            return self.video_file_hi.url
        elif language == 'pa' and self.video_file_pa:
            return self.video_file_pa.url
        else:
            return self.video_url_en or (self.video_file_en.url if self.video_file_en else '')


class VideoProgress(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    video = models.ForeignKey(Video, on_delete=models.CASCADE)
    
    # Progress tracking
    watch_time_seconds = models.IntegerField(default=0)
    completed = models.BooleanField(default=False)
    completion_percentage = models.FloatField(default=0.0)  # 0-100
    
    # Language preference for this video
    preferred_language = models.CharField(max_length=5, default='en')  # 'en', 'hi', 'pa'
    
    # Timestamps
    first_watched = models.DateTimeField(auto_now_add=True)
    last_watched = models.DateTimeField(auto_now=True)
    
    # ADD OFFLINE SUPPORT
    offline_progress = models.BooleanField(default=False)
    sync_needed = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ['student', 'video']
    
    def __str__(self):
        return f"{self.student.user.username} - {self.video.title} ({self.completion_percentage}%)"


# EXISTING CLASSROOM MODELS (KEEP AS IS)
class ClassRoom(models.Model):
    name = models.CharField(max_length=100)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='classes')
    students = models.ManyToManyField(Student, through='Enrollment')
    
    def student_count(self):
        return self.students.count()
    
    def active_students_count(self):
        return self.enrollments.filter(active=True).count()
    
    def inactive_students_count(self):
        return self.enrollments.filter(active=False).count()

    def average_progress(self):
        enrollments = self.enrollments.all()
        if enrollments:
            return sum(e.progress for e in enrollments) / enrollments.count()
        return 0.0

    def __str__(self):
        return self.name


class Enrollment(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='enrollments')
    classroom = models.ForeignKey(ClassRoom, on_delete=models.CASCADE, related_name='enrollments')
    active = models.BooleanField(default=True)
    progress = models.FloatField(default=0.0)

    class Meta:
        unique_together = ('student', 'classroom')

    def __str__(self):
        return f"{self.student.user.username} - {self.classroom.name}"


class Badge(models.Model):
    name = models.CharField(max_length=50)
    description = models.TextField()
    image_url = models.URLField(null=True, blank=True)

    def __str__(self):
        return self.name


class Quiz(models.Model):
    name = models.CharField(max_length=200)
    subject = models.CharField(max_length=50)
    created_by = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # ADD OFFLINE SUPPORT
    is_active = models.BooleanField(default=True)
    offline_available = models.BooleanField(default=True)
    time_limit = models.IntegerField(default=30)  # minutes

    def __str__(self):
        return self.name


class Question(models.Model):
    quiz = models.ForeignKey(Quiz, related_name='questions', on_delete=models.CASCADE)
    text_en = models.TextField(verbose_name='Question Text (English)')
    text_pa = models.TextField(verbose_name='Question Text (Punjabi)', null=True, blank=True)
    options = models.JSONField()  # Store options as JSON: {"A": "option1", "B": "option2", ...}
    correct_answer = models.CharField(max_length=1)
    subject = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.quiz.name} - Question {self.id}"


class QuizAttempt(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    attempt_number = models.PositiveIntegerField()
    answers = models.JSONField()
    score = models.FloatField(default=0)
    completed_at = models.DateTimeField(auto_now_add=True)
    
    # ADD OFFLINE SUPPORT
    offline_attempt = models.BooleanField(default=False)
    is_synced = models.BooleanField(default=True)
    sync_attempts = models.IntegerField(default=0)

    class Meta:
        ordering = ['-completed_at']
        unique_together = ['student', 'quiz', 'attempt_number']

    def save(self, *args, **kwargs):
        if not self.pk and not self.attempt_number:
            last_attempt = QuizAttempt.objects.filter(
                student=self.student,
                quiz=self.quiz
            ).order_by('-attempt_number').first()
            
            self.attempt_number = (last_attempt.attempt_number + 1) if last_attempt else 1
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.student.user.username} - {self.quiz.name}"


class StudentBadge(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    awarded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['student', 'badge']
        ordering = ['-awarded_at']

    def __str__(self):
        return f"{self.student.user.username} - {self.badge.name}"


# NEW OFFLINE-SPECIFIC MODELS
class OfflineSession(models.Model):
    """Track offline learning sessions"""
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    session_id = models.CharField(max_length=100, unique=True)
    session_data = models.JSONField(default=dict)  # Store quiz attempts, video progress, etc.
    quiz_attempts = models.JSONField(default=list)  # Store offline quiz attempts
    video_progress = models.JSONField(default=list)  # Store offline video progress
    is_synced = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    synced_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Offline Session - {self.student.user.username} ({self.session_id[:8]})"


class OfflineContent(models.Model):
    """Cache content for offline access"""
    content_type = models.CharField(max_length=50, choices=[
        ('quiz', 'Quiz'),
        ('video', 'Video'),
        ('lesson', 'Lesson')
    ])
    content_id = models.IntegerField()
    cached_data = models.JSONField()
    cache_version = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        unique_together = ['content_type', 'content_id']
    
    def is_expired(self):
        return timezone.now() > self.expires_at
    
    def __str__(self):
        return f"Offline {self.content_type} - {self.content_id}"


class SyncLog(models.Model):
    """Log all sync operations"""
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    sync_type = models.CharField(max_length=50, choices=[
        ('quiz_attempts', 'Quiz Attempts'),
        ('video_progress', 'Video Progress'),
        ('full_sync', 'Full Sync'),
        ('content_download', 'Content Download')
    ])
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed')
    ], default='pending')
    sync_data = models.JSONField(default=dict)
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Sync {self.sync_type} - {self.status} ({self.student.user.username})"
