from django.db import models
from django.contrib.auth.models import User

# DEFINE STUDENT AND TEACHER FIRST (before they're referenced)
class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    grade = models.CharField(max_length=10)
    school = models.CharField(max_length=100)

    def __str__(self):
        return self.user.username

class Teacher(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    subject = models.CharField(max_length=50)
    school = models.CharField(max_length=100)

    def __str__(self):
        return self.user.username

# NOW DEFINE VIDEO MODELS (Student is already defined above)
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
    student = models.ForeignKey(Student, on_delete=models.CASCADE)  # ✅ Student is now defined above
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
    
    class Meta:
        unique_together = ['student', 'video']
    
    def __str__(self):
        return f"{self.student.user.username} - {self.video.title} ({self.completion_percentage}%)"

# REST OF YOUR EXISTING MODELS
class ClassRoom(models.Model):
    name = models.CharField(max_length=100)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='classes')  # ✅ Teacher already defined
    students = models.ManyToManyField(Student, through='Enrollment')  # ✅ Student already defined
    
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
    progress = models.FloatField(default=0.0)  # Store progress percentage for student in this class

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

    class Meta:
        ordering = ['-completed_at']
        unique_together = ['student', 'quiz', 'attempt_number']

    def save(self, *args, **kwargs):
        if not self.pk and not self.attempt_number:  # Only for new instances
            # Get the highest attempt number for this student and quiz
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
