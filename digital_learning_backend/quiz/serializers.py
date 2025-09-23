from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Quiz, Question, QuizAttempt, Badge, Student, Teacher, StudentBadge, ClassRoom, Enrollment, VideoCategory, Video, VideoProgress

class TeacherRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    school_id = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'first_name', 'last_name', 'school_id')

    def validate(self, data):
        
        
        SECRET_SCHOOL_ID = "SIH2025" 
        
        if data.get('school_id') != SECRET_SCHOOL_ID:
            raise serializers.ValidationError({"school_id": "Invalid School ID. Teacher registration failed."})
        
        return data

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            is_staff=True  
        )
        Teacher.objects.create(
            user=user,
            subject='Not Specified',
            school='Verified School' 
        )
        return user

class StudentRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'first_name', 'last_name')

    def create(self, validated_data):
        # Step 1: Create the User object
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        
        
        Student.objects.create(
            user=user,
            grade='Not Specified',
            school='Not Specified'
        )
        
        return user

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

class EnrollmentSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    student_id = serializers.PrimaryKeyRelatedField(queryset=Student.objects.all(), write_only=True, source='student')

    class Meta:
        model = Enrollment
        fields = ['id', 'student', 'student_id', 'active', 'progress']

class ClassRoomSerializer(serializers.ModelSerializer):
    teacher = TeacherSerializer(read_only=True)
    student_count = serializers.SerializerMethodField()
    active_students_count = serializers.SerializerMethodField()
    inactive_students_count = serializers.SerializerMethodField()
    average_progress = serializers.SerializerMethodField()
    enrollments = EnrollmentSerializer(many=True, read_only=True)

    class Meta:
        model = ClassRoom
        fields = ['id', 'name', 'teacher', 'student_count', 'active_students_count', 'inactive_students_count', 'average_progress', 'enrollments']


    # Add these method fields
    def get_student_count(self, obj):
        return obj.student_count()

    def get_active_students_count(self, obj):
        return obj.active_students_count()

    def get_inactive_students_count(self, obj):
        return obj.inactive_students_count()

    def get_average_progress(self, obj):
        return obj.average_progress()

class MyProgressSerializer(serializers.ModelSerializer):
    """
    Serializer for the logged-in student's own progress view.
    """
    quiz_attempts = QuizAttemptSerializer(many=True, read_only=True, source='quizattempt_set')
    badges = StudentBadgeSerializer(many=True, read_only=True, source='studentbadge_set')

    class Meta:
        model = Student
        fields = ['quiz_attempts', 'badges']

class ErrorSerializer(serializers.Serializer):
    error = serializers.CharField()

class VideoCategorySerializer(serializers.ModelSerializer):
    video_count = serializers.SerializerMethodField()
    
    class Meta:
        model = VideoCategory
        fields = ['id', 'name', 'category_type', 'description', 'video_count', 'created_at']
    
    def get_video_count(self, obj):
        return obj.videos.count()

class VideoSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_type = serializers.CharField(source='category.category_type', read_only=True)
    video_url = serializers.SerializerMethodField()
    is_completed = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = Video
        fields = [
            'id', 'title', 'title_hi', 'title_pa',
            'description', 'description_hi', 'description_pa',
            'category_name', 'category_type', 'difficulty',
            'video_url', 'duration_minutes', 'thumbnail_url',
            'view_count', 'is_completed', 'progress_percentage',
            'created_at'
        ]
    
    def get_video_url(self, obj):
        # Get language from request context
        request = self.context.get('request')
        language = 'en'
        
        if request and hasattr(request, 'user') and hasattr(request.user, 'student'):
            # You could store language preference in user model
            language = request.GET.get('lang', 'en')
        
        return obj.get_video_url(language)
    
    def get_is_completed(self, obj):
        request = self.context.get('request')
        if request and hasattr(request.user, 'student'):
            try:
                progress = VideoProgress.objects.get(student=request.user.student, video=obj)
                return progress.completed
            except VideoProgress.DoesNotExist:
                return False
        return False
    
    def get_progress_percentage(self, obj):
        request = self.context.get('request')
        if request and hasattr(request.user, 'student'):
            try:
                progress = VideoProgress.objects.get(student=request.user.student, video=obj)
                return progress.completion_percentage
            except VideoProgress.DoesNotExist:
                return 0.0
        return 0.0

class VideoProgressSerializer(serializers.ModelSerializer):
    video_title = serializers.CharField(source='video.title', read_only=True)
    
    class Meta:
        model = VideoProgress
        fields = [
            'id', 'video', 'video_title', 'watch_time_seconds',
            'completed', 'completion_percentage', 'preferred_language',
            'first_watched', 'last_watched'
        ]
        read_only_fields = ['student', 'first_watched']
