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
    class Meta:
        model = Question
        fields = ['id', 'subject', 'text_en', 'text_pa', 'options', 'correct_answer']
        extra_kwargs = {
            'correct_answer': {'write_only': True}
        }

class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    created_by = TeacherSerializer(read_only=True)
    
    class Meta:
        model = Quiz
        fields = ['id', 'name', 'subject', 'created_by', 'created_at', 'questions']

class QuizAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAttempt
        fields = ['student', 'quiz', 'attempt_number', 'answers', 'score', 'completed_at']
        read_only_fields = ['score', 'completed_at', 'attempt_number']

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
    """
    Custom serializer for the Teacher Dashboard.
    """
    student_name = serializers.CharField(source='student.user.get_full_name')
    badges = StudentBadgeSerializer(source='student.studentbadge_set', many=True, read_only=True)

    class Meta:
        model = QuizAttempt
        fields = ['student_name', 'score', 'completed_at', 'badges']

class ErrorSerializer(serializers.Serializer):
    error = serializers.CharField()

# --- ADDED FOR NEW FEATURES ---

class MyProgressSerializer(serializers.ModelSerializer):
    """
    Serializer for the logged-in student's own progress view.
    """
    quiz_attempts = QuizAttemptSerializer(many=True, read_only=True, source='quizattempt_set')
    badges = StudentBadgeSerializer(many=True, read_only=True, source='studentbadge_set')

    class Meta:
        model = Student
        fields = ['quiz_attempts', 'badges']

class StudentRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for handling new student registration.
    """
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'first_name', 'last_name')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data.get('email', ''),
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        # Automatically create a Student profile for the new user
        Student.objects.create(
            user=user,
            grade='default', # You can adjust these defaults
            school='default'
        )
        return user