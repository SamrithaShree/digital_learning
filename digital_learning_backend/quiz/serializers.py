from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Quiz, Question, QuizAttempt, Badge, Student, Teacher, StudentBadge

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        extra_kwargs = {
            'password': {'write_only': True}
        }

class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    
    class Meta:
        model = Student
        fields = ['id', 'user', 'grade', 'school']

class TeacherSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    
    class Meta:
        model = Teacher
        fields = ['id', 'user', 'subject', 'school']

class QuestionSerializer(serializers.ModelSerializer):
    options = serializers.JSONField()
    
    class Meta:
        model = Question
        fields = ['id', 'subject', 'text_en', 'text_pa', 'options', 'correct_answer']
        extra_kwargs = {
            'correct_answer': {'write_only': True}  # Hide correct answer in responses
        }

class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Quiz
        fields = ['id', 'name', 'questions']

class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    created_by = TeacherSerializer(read_only=True)
    
    class Meta:
        model = Quiz
        fields = ['id', 'name', 'subject', 'created_by', 'created_at', 'questions']

class QuizAttemptSerializer(serializers.ModelSerializer):
    answers = serializers.JSONField()
    
    class Meta:
        model = QuizAttempt
        fields = ['student', 'quiz', 'answers', 'score', 'completed_at']
        read_only_fields = ['score', 'completed_at']

class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ['id', 'name', 'description', 'image_url']

class StudentBadgeSerializer(serializers.ModelSerializer):
    badge = BadgeSerializer(read_only=True)
    
    class Meta:
        model = StudentBadge
        fields = ['badge', 'awarded_at']

class StudentProgressSerializer(serializers.ModelSerializer):
    badges = StudentBadgeSerializer(source='studentbadge_set', many=True, read_only=True)
    quiz_attempts = QuizAttemptSerializer(source='quizattempt_set', many=True, read_only=True)
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Student
        fields = ['id', 'user', 'grade', 'school', 'badges', 'quiz_attempts']

class ErrorSerializer(serializers.Serializer):
    error = serializers.CharField()