from django.db import models
from django.contrib.auth.models import User

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
    student = models.ForeignKey('Student', on_delete=models.CASCADE)
    quiz = models.ForeignKey('Quiz', on_delete=models.CASCADE)
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
    student = models.ForeignKey('Student', on_delete=models.CASCADE)
    badge = models.ForeignKey('Badge', on_delete=models.CASCADE)
    awarded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['student', 'badge']
        ordering = ['-awarded_at']

    def __str__(self):
        return f"{self.student.user.username} - {self.badge.name}"
