from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
from rest_framework import viewsets, status, permissions, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from django.views.decorators.csrf import csrf_exempt  # ADD THIS
from django.utils.decorators import method_decorator  # ADD THIS
import csv
from django.http import HttpResponse
from django.utils.dateparse import parse_date
from django.utils import timezone
import uuid

# Models import
from .models import (
    Quiz, Question, Student, Teacher, Badge, QuizAttempt, StudentBadge, ClassRoom, Enrollment, 
    Video, VideoCategory, VideoProgress,
    OfflineSession, OfflineContent, SyncLog
)
from .serializers import (
    QuizSerializer, QuestionSerializer, StudentSerializer, TeacherSerializer, VideoCategorySerializer, 
    VideoSerializer, VideoProgressSerializer, BadgeSerializer, QuizAttemptSerializer, ClassRoomSerializer, 
    EnrollmentSerializer, StudentProgressSerializer, StudentRegistrationSerializer,
    TeacherRegistrationSerializer, UserSerializer, MyProgressSerializer, ErrorSerializer
)

# ========== AUTHENTICATION VIEWS (FIXED) ==========

@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def student_registration_view(request):
    """Student registration endpoint - no authentication required"""
    serializer = StudentRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        # Create token for immediate login
        token, _ = Token.objects.get_or_create(user=user)
        
        # Get student profile
        student = user.student
        student_data = StudentSerializer(student).data
        
        return Response({
            'token': token.key,
            'user_info': student_data,
            'role': 'student'
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def teacher_registration_view(request):
    """Teacher registration endpoint - no authentication required"""
    serializer = TeacherRegistrationSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        
        teacher = user.teacher
        teacher_data = TeacherSerializer(teacher).data
        
        return Response({
            'token': token.key,
            'user_info': teacher_data,
            'role': 'teacher'
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])  # KEEP THIS
@csrf_exempt  # ADD THIS to exempt from CSRF
def login_view(request):
    """Login endpoint - no authentication required"""
    print("LOGIN ATTEMPT:", request.data)
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response(
            {'error': 'Please provide username and password'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = authenticate(username=username, password=password)
    if not user:
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    token, _ = Token.objects.get_or_create(user=user)
    
    if hasattr(user, 'student'):
        serializer = StudentSerializer(user.student)
        role = 'student'
    elif hasattr(user, 'teacher'):
        serializer = TeacherSerializer(user.teacher)
        role = 'teacher'
    else:
        role = 'admin'
        serializer = UserSerializer(user)
    
    return Response({
        'token': token.key,
        'user_info': serializer.data,
        'role': role
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_progress_view(request):
    if not hasattr(request.user, 'student'):
        return Response({'error': 'Only students can view progress.'}, status=403)

    student = request.user.student
    serializer = MyProgressSerializer(student)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    request.user.auth_token.delete()
    return Response({'message': 'Successfully logged out'})

# ========== QUIZ VIEWS ==========

class QuizViewSet(viewsets.ModelViewSet):
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Quiz.objects.filter(offline_available=True).prefetch_related('questions')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'quizzes': serializer.data
        })
    
    def retrieve(self, request, pk=None):
        queryset = self.get_queryset()
        quiz = get_object_or_404(queryset, pk=pk)
        serializer = self.get_serializer(quiz)
        return Response({"quiz": serializer.data})

@method_decorator(csrf_exempt, name='dispatch')  # ADD THIS
class QuizSubmissionView(APIView):
    """Enhanced API endpoint for submitting quiz answers with offline support"""
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            quiz_id = request.data.get('quiz_id')
            answers = request.data.get('answers', {})
            offline_mode = request.data.get('offline_mode', False)

            quiz = get_object_or_404(Quiz, id=quiz_id)
            student = request.user.student

            # Calculate score
            correct_count = 0
            total_questions = quiz.questions.count()

            for question in quiz.questions.all():
                student_answer = answers.get(str(question.id))
                if student_answer and student_answer == question.correct_answer:
                    correct_count += 1

            score = (correct_count / total_questions * 100) if total_questions > 0 else 0

            # CREATE attempt with offline support
            attempt = QuizAttempt(
                student=student,
                quiz=quiz,
                answers=answers,
                score=score,
                offline_attempt=offline_mode,
                is_synced=not offline_mode
            )
            attempt.save()

            # Award badges
            badges_earned = []
            if score == 100:
                badge, _ = Badge.objects.get_or_create(
                    name='Perfect Score',
                    defaults={'description': 'Scored 100% on a quiz'}
                )
                StudentBadge.objects.get_or_create(student=student, badge=badge)
                badges_earned.append('Perfect Score')
            
            if offline_mode:
                badge, _ = Badge.objects.get_or_create(
                    name='Offline Learner',
                    defaults={'description': 'Completed quiz in offline mode'}
                )
                StudentBadge.objects.get_or_create(student=student, badge=badge)
                badges_earned.append('Offline Learner')

            return Response({
                'attempt_number': attempt.attempt_number,
                'score': score,
                'correct_answers': correct_count,
                'total_questions': total_questions,
                'badges_earned': badges_earned,
                'offline_mode': offline_mode,
                'sync_status': 'synced' if not offline_mode else 'pending'
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# ========== OFFLINE ENDPOINTS ==========

@api_view(['GET'])
@permission_classes([AllowAny])
@csrf_exempt  # ADD THIS
def download_offline_content(request):
    """Download all content for offline use"""
    try:
        quizzes = Quiz.objects.filter(
            is_active=True, 
            offline_available=True
        ).prefetch_related('questions')
        
        videos = Video.objects.filter(offline_available=True)
        
        offline_content = {
            'quizzes': [],
            'videos': [],
            'sync_timestamp': timezone.now().isoformat(),
            'version': 1
        }
        
        for quiz in quizzes:
            quiz_data = {
                'id': str(quiz.id),
                'name': quiz.name,
                'subject': quiz.subject,
                'time_limit': quiz.time_limit,
                'questions': []
            }
            
            for question in quiz.questions.all():
                quiz_data['questions'].append({
                    'id': str(question.id),
                    'text_en': question.text_en,
                    'text_pa': question.text_pa,
                    'options': question.options,
                })
            
            offline_content['quizzes'].append(quiz_data)
        
        for video in videos:
            video_data = {
                'id': str(video.id),
                'title': video.title,
                'title_pa': video.title_pa,
                'description': video.description,
                'category': video.category.category_type,
                'difficulty': video.difficulty,
                'duration_minutes': video.duration_minutes,
                'video_urls': {
                    'en': video.get_video_url('en'),
                    'hi': video.get_video_url('hi'),
                    'pa': video.get_video_url('pa'),
                }
            }
            offline_content['videos'].append(video_data)
        
        return Response(offline_content)
        
    except Exception as e:
        return Response({'error': f'Failed to download content: {str(e)}'}, status=500)

@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt  # ADD THIS
def submit_offline_quiz(request):
    """Submit quiz that works both online and offline"""
    try:
        quiz_id = request.data.get('quiz_id')
        answers = request.data.get('answers', {})
        offline_mode = request.data.get('offline_mode', False)
        student_id = request.data.get('student_id')
        
        quiz = get_object_or_404(Quiz, id=quiz_id)
        
        correct_count = 0
        total_questions = quiz.questions.count()
        
        for question in quiz.questions.all():
            student_answer = answers.get(str(question.id))
            if student_answer == question.correct_answer:
                correct_count += 1
        
        score = (correct_count / total_questions * 100) if total_questions > 0 else 0
        
        if request.user.is_authenticated and hasattr(request.user, 'student'):
            attempt = QuizAttempt.objects.create(
                student=request.user.student,
                quiz=quiz,
                answers=answers,
                score=score,
                offline_attempt=offline_mode,
                is_synced=not offline_mode
            )
        elif offline_mode and student_id:
            try:
                student = Student.objects.get(student_id=student_id)
                offline_session = OfflineSession.objects.create(
                    student=student,
                    session_id=str(uuid.uuid4()),
                    session_data={
                        'quiz_id': str(quiz_id),
                        'answers': answers,
                        'score': score,
                        'completed_at': timezone.now().isoformat()
                    },
                    is_synced=False
                )
            except Student.DoesNotExist:
                return Response({'error': 'Student not found'}, status=404)
        
        badges_earned = []
        if score >= 90:
            badges_earned.append("Excellence")
        if score == 100:
            badges_earned.append("Perfect Score")
        if offline_mode:
            badges_earned.append("Offline Learner")
        
        return Response({
            'score': score,
            'correct_answers': correct_count,
            'total_questions': total_questions,
            'badges_earned': badges_earned,
            'offline_mode': offline_mode,
            'sync_needed': offline_mode,
            'message': 'Quiz completed!' + (' (Will sync when online)' if offline_mode else '')
        })
        
    except Exception as e:
        return Response({'error': f'Quiz submission failed: {str(e)}'}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sync_offline_attempts(request):
    """Sync offline quiz attempts when back online"""
    try:
        offline_attempts = request.data.get('offline_attempts', [])
        synced_count = 0
        errors = []
        
        student = request.user.student
        
        for attempt_data in offline_attempts:
            try:
                quiz_id = attempt_data.get('quiz_id')
                quiz = Quiz.objects.get(id=quiz_id)
                
                existing = QuizAttempt.objects.filter(
                    student=student,
                    quiz=quiz,
                    answers=attempt_data.get('answers', {}),
                    offline_attempt=True
                ).exists()
                
                if not existing:
                    QuizAttempt.objects.create(
                        student=student,
                        quiz=quiz,
                        answers=attempt_data.get('answers', {}),
                        score=attempt_data.get('score', 0),
                        offline_attempt=True,
                        is_synced=True
                    )
                    synced_count += 1
                
            except Exception as e:
                errors.append(f"Failed to sync attempt: {str(e)}")
        
        student.last_offline_sync = timezone.now()
        student.save()
        
        SyncLog.objects.create(
            student=student,
            sync_type='quiz_attempts',
            status='success' if not errors else 'failed',
            sync_data={'synced_count': synced_count, 'errors': errors}
        )
        
        return Response({
            'synced_count': synced_count,
            'errors': errors,
            'message': f'Successfully synced {synced_count} offline attempts'
        })
        
    except Exception as e:
        return Response({'error': f'Sync failed: {str(e)}'}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_offline_mode(request):
    """Enable/disable offline mode for student"""
    try:
        offline_mode = request.data.get('offline_mode', False)
        student = request.user.student
        student.offline_mode = offline_mode
        student.save()
        
        return Response({
            'offline_mode': offline_mode,
            'message': f'Offline mode {"enabled" if offline_mode else "disabled"}'
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_offline_status(request):
    """Get offline sync status and pending data"""
    try:
        student = request.user.student
        
        unsynced_attempts = QuizAttempt.objects.filter(
            student=student,
            is_synced=False
        ).count()
        
        offline_sessions = OfflineSession.objects.filter(
            student=student,
            is_synced=False
        ).count()
        
        return Response({
            'offline_mode': student.offline_mode,
            'unsynced_attempts': unsynced_attempts,
            'offline_sessions': offline_sessions,
            'last_sync': student.last_offline_sync.isoformat() if student.last_offline_sync else None,
            'needs_sync': unsynced_attempts > 0 or offline_sessions > 0,
            'student_id': student.student_id
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

# ========== TEACHER DASHBOARD ==========

@method_decorator(csrf_exempt, name='dispatch')  # ADD THIS
class TeacherDashboardView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if not hasattr(request.user, 'teacher'):
            return Response(
                {'error': 'Only teachers can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        quiz_id = request.query_params.get('quiz_id')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        queryset = QuizAttempt.objects.select_related('student__user').prefetch_related('student__studentbadge_set__badge').all()
        
        if quiz_id:
            queryset = queryset.filter(quiz_id=quiz_id)
        
        if start_date and end_date:
            try:
                start = parse_date(start_date)
                end = parse_date(end_date)
                queryset = queryset.filter(completed_at__date__range=[start, end])
            except Exception as e:
                return Response({'error': f'Invalid date format: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = StudentProgressSerializer(queryset, many=True)
        return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_progress(request):
    if not hasattr(request.user, 'teacher'):
        return Response(
            {'error': 'Only teachers can access this endpoint'},
            status=status.HTTP_403_FORBIDDEN
        )

    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="student_progress.csv"'

    quiz_id = request.query_params.get('quiz_id')
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')

    queryset = QuizAttempt.objects.all()
    if quiz_id:
        queryset = queryset.filter(quiz_id=quiz_id)
    
    if start_date and end_date:
        try:
            start = parse_date(start_date)
            end = parse_date(end_date)
            queryset = queryset.filter(completed_at__date__range=[start, end])
        except Exception as e:
            return Response({'error': f'Invalid date format: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

    writer = csv.writer(response)
    writer.writerow(['Student', 'Quiz', 'Score', 'Completed At', 'Offline Mode'])

    for attempt in queryset:
        writer.writerow([
            attempt.student.user.get_full_name(),
            attempt.quiz.name,
            attempt.score,
            attempt.completed_at.strftime('%Y-%m-%d %H:%M:%S'),
            'Yes' if attempt.offline_attempt else 'No'
        ])

    return response

# ========== CLASS MANAGEMENT ==========

class ClassRoomViewSet(viewsets.ModelViewSet):
    serializer_class = ClassRoomSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if hasattr(self.request.user, 'teacher'):
            return ClassRoom.objects.filter(teacher=self.request.user.teacher).prefetch_related('enrollments')
        return ClassRoom.objects.none()

    def perform_create(self, serializer):
        if hasattr(self.request.user, 'teacher'):
            serializer.save(teacher=self.request.user.teacher)
        else:
            raise serializers.ValidationError("Only teachers can create classes")

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            return Response({
                'classes': serializer.data
            })
        except Exception as e:
            return Response({
                'classes': [],
                'error': str(e)
            })

    def create(self, request, *args, **kwargs):
        try:
            if not hasattr(request.user, 'teacher'):
                return Response(
                    {'error': 'Only teachers can create classes'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
                
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

@method_decorator(csrf_exempt, name='dispatch')  # ADD THIS
class ClassDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, class_id):
        if not hasattr(request.user, 'teacher'):
            return Response(
                {'error': 'Only teachers can access class details'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            classroom = get_object_or_404(ClassRoom, id=class_id, teacher=request.user.teacher)
            serializer = ClassRoomSerializer(classroom)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# ========== VIDEO VIEWS ==========

@method_decorator(csrf_exempt, name='dispatch')  # ADD THIS
class VideoListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if not hasattr(request.user, 'student'):
            return Response(
                {'error': 'Only students can access videos'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        category_type = request.query_params.get('category')
        difficulty = request.query_params.get('difficulty')
        
        videos = Video.objects.all()
        
        if category_type:
            videos = videos.filter(category__category_type=category_type)
        
        if difficulty:
            videos = videos.filter(difficulty=difficulty)
        
        serializer = VideoSerializer(videos, many=True, context={'request': request})
        return Response({
            'videos': serializer.data
        })

@method_decorator(csrf_exempt, name='dispatch')  # ADD THIS
class VideoDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, video_id):
        try:
            video = get_object_or_404(Video, id=video_id)
            video.view_count += 1
            video.save()
            
            serializer = VideoSerializer(video, context={'request': request})
            return Response(serializer.data)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

@method_decorator(csrf_exempt, name='dispatch')  # ADD THIS
class VideoProgressView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, video_id):
        try:
            video = get_object_or_404(Video, id=video_id)
            student = request.user.student
            
            progress, created = VideoProgress.objects.get_or_create(
                student=student,
                video=video,
                defaults={
                    'preferred_language': request.data.get('language', 'en')
                }
            )
            
            watch_time = request.data.get('watch_time_seconds', 0)
            completion_percentage = request.data.get('completion_percentage', 0)
            
            progress.watch_time_seconds = max(progress.watch_time_seconds, watch_time)
            progress.completion_percentage = completion_percentage
            progress.completed = completion_percentage >= 80
            progress.preferred_language = request.data.get('language', progress.preferred_language)
            
            progress.save()
            
            serializer = VideoProgressSerializer(progress)
            return Response(serializer.data)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

@method_decorator(csrf_exempt, name='dispatch')  # ADD THIS
class VideoCategoriesView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        categories = VideoCategory.objects.all()
        serializer = VideoCategorySerializer(categories, many=True)
        return Response({
            'categories': serializer.data
        })

# ========== ADDITIONAL CLASS MANAGEMENT FUNCTIONS ==========

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
@csrf_exempt  # ADD THIS
def update_student_status(request, enrollment_id):
    if not hasattr(request.user, 'teacher'):
        return Response({'error': 'Only teachers can update student status'}, status=403)
    
    try:
        enrollment = get_object_or_404(
            Enrollment, 
            id=enrollment_id, 
            classroom__teacher=request.user.teacher
        )
        active_status = request.data.get('active')
        
        if active_status is not None:
            enrollment.active = active_status
            enrollment.save()
            return Response({'message': 'Student status updated successfully'})
        
        return Response({'error': 'Active status required'}, status=400)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
@csrf_exempt  # ADD THIS
def update_student_progress(request, enrollment_id):
    if not hasattr(request.user, 'teacher'):
        return Response({'error': 'Only teachers can update student progress'}, status=403)
    
    try:
        enrollment = get_object_or_404(
            Enrollment, 
            id=enrollment_id, 
            classroom__teacher=request.user.teacher
        )
        progress = request.data.get('progress')
        
        if progress is not None and 0 <= progress <= 100:
            enrollment.progress = progress
            enrollment.save()
            return Response({'message': 'Student progress updated successfully'})
        
        return Response({'error': 'Valid progress value (0-100) required'}, status=400)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_available_students(request):
    if not hasattr(request.user, 'teacher'):
        return Response({'error': 'Only teachers can access student list'}, status=403)
    
    try:
        students = Student.objects.all()
        serializer = StudentSerializer(students, many=True)
        return Response({'students': serializer.data})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def class_detail_view(request, class_id):
    if not hasattr(request.user, 'teacher'):
        return Response({'error': 'Only teachers can view class details'}, status=403)
    
    try:
        classroom = get_object_or_404(
            ClassRoom, 
            id=class_id, 
            teacher=request.user.teacher
        )
        
        serializer = ClassRoomSerializer(classroom)
        data = serializer.data
        
        enrollments = classroom.enrollments.all().select_related('student__user')
        students_data = []
        
        for enrollment in enrollments:
            students_data.append({
                'enrollment_id': enrollment.id,
                'student_id': enrollment.student.id,
                'student_name': f"{enrollment.student.user.first_name} {enrollment.student.user.last_name}",
                'username': enrollment.student.user.username,
                'grade': enrollment.student.grade,
                'progress': enrollment.progress,
                'active': enrollment.active,
                'last_active': enrollment.student.user.last_login.isoformat() if enrollment.student.user.last_login else None
            })
        
        data['students'] = students_data
        return Response(data)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@csrf_exempt  # ADD THIS
def add_student_to_class(request, class_id):
    if not hasattr(request.user, 'teacher'):
        return Response({'error': 'Only teachers can manage classes'}, status=403)
    
    try:
        classroom = get_object_or_404(ClassRoom, id=class_id, teacher=request.user.teacher)
        student_id = request.data.get('student_id')
        
        if not student_id:
            return Response({'error': 'Student ID is required'}, status=400)
        
        student = get_object_or_404(Student, id=student_id)
        
        if Enrollment.objects.filter(student=student, classroom=classroom).exists():
            return Response({'error': 'Student already enrolled in this class'}, status=400)
        
        enrollment = Enrollment.objects.create(
            student=student,
            classroom=classroom,
            active=True,
            progress=0.0
        )
        
        return Response({
            'message': 'Student added successfully',
            'enrollment': {
                'id': enrollment.id,
                'student_name': f"{student.user.first_name} {student.user.last_name}",
                'active': enrollment.active,
                'progress': enrollment.progress
            }
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
@csrf_exempt  # ADD THIS
def remove_student_from_class(request, class_id, enrollment_id):
    if not hasattr(request.user, 'teacher'):
        return Response({'error': 'Only teachers can manage classes'}, status=403)
    
    try:
        classroom = get_object_or_404(ClassRoom, id=class_id, teacher=request.user.teacher)
        enrollment = get_object_or_404(Enrollment, id=enrollment_id, classroom=classroom)
        
        student_name = f"{enrollment.student.user.first_name} {enrollment.student.user.last_name}"
        enrollment.delete()
        
        return Response({'message': f'{student_name} removed from class successfully'})
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
@csrf_exempt  # ADD THIS
def update_enrollment(request, enrollment_id):
    if not hasattr(request.user, 'teacher'):
        return Response({'error': 'Only teachers can update enrollments'}, status=403)
    
    try:
        enrollment = get_object_or_404(
            Enrollment, 
            id=enrollment_id, 
            classroom__teacher=request.user.teacher
        )
        
        if 'progress' in request.data:
            progress = request.data['progress']
            if 0 <= progress <= 100:
                enrollment.progress = progress
            else:
                return Response({'error': 'Progress must be between 0 and 100'}, status=400)
        
        if 'active' in request.data:
            enrollment.active = request.data['active']
        
        enrollment.save()
        
        return Response({
            'message': 'Enrollment updated successfully',
            'enrollment': {
                'id': enrollment.id,
                'progress': enrollment.progress,
                'active': enrollment.active
            }
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


# from django.shortcuts import get_object_or_404
# from django.contrib.auth import authenticate
# from rest_framework import viewsets, status, permissions, serializers
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.response import Response
# from rest_framework.authtoken.models import Token
# from rest_framework.views import APIView
# from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
# import csv
# from django.http import HttpResponse
# from django.utils.dateparse import parse_date
# from django.utils import timezone
# import uuid

# # ADD the new offline models to imports
# from .models import (
#     Quiz, Question, Student, Teacher, Badge, QuizAttempt, StudentBadge, ClassRoom, Enrollment, 
#     Video, VideoCategory, VideoProgress,
#     # NEW OFFLINE MODELS
#     OfflineSession, OfflineContent, SyncLog
# )
# from .serializers import (
#     QuizSerializer, QuestionSerializer, StudentSerializer, TeacherSerializer, VideoCategorySerializer, 
#     VideoSerializer, VideoProgressSerializer, BadgeSerializer, QuizAttemptSerializer, ClassRoomSerializer, 
#     EnrollmentSerializer, StudentProgressSerializer, StudentRegistrationSerializer,
#     TeacherRegistrationSerializer, UserSerializer, MyProgressSerializer, ErrorSerializer
# )

# # ========== EXISTING VIEWS (KEEP AS IS) ==========

# @api_view(['POST'])
# @permission_classes([AllowAny])
# def student_registration_view(request):
#     serializer = StudentRegistrationSerializer(data=request.data)
#     if serializer.is_valid():
#         serializer.save()
#         return Response(serializer.data, status=status.HTTP_201_CREATED)
#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# @api_view(['POST'])
# @permission_classes([AllowAny])
# def teacher_registration_view(request):
#     serializer = TeacherRegistrationSerializer(data=request.data)
#     if serializer.is_valid():
#         serializer.save()
#         return Response(serializer.data, status=status.HTTP_201_CREATED)
#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# @api_view(['POST'])
# @permission_classes([permissions.AllowAny])
# def login_view(request):
#     print("LOGIN ATTEMPT:", request.data)
#     username = request.data.get('username')
#     password = request.data.get('password')
    
#     if not username or not password:
#         return Response(
#             {'error': 'Please provide username and password'},
#             status=status.HTTP_400_BAD_REQUEST
#         )
    
#     user = authenticate(username=username, password=password)
#     if not user:
#         return Response(
#             {'error': 'Invalid credentials'},
#             status=status.HTTP_401_UNAUTHORIZED
#         )
    
#     token, _ = Token.objects.get_or_create(user=user)
    
#     if hasattr(user, 'student'):
#         serializer = StudentSerializer(user.student)
#         role = 'student'
#     elif hasattr(user, 'teacher'):
#         serializer = TeacherSerializer(user.teacher)
#         role = 'teacher'
#     else:
#         role = 'admin'
#         serializer = UserSerializer(user)
    
#     return Response({
#         'token': token.key,
#         'user_info': serializer.data,
#         'role': role
#     })

# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def my_progress_view(request):
#     if not hasattr(request.user, 'student'):
#         return Response({'error': 'Only students can view progress.'}, status=403)

#     student = request.user.student
#     serializer = MyProgressSerializer(student)
#     return Response(serializer.data)

# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def logout_view(request):
#     request.user.auth_token.delete()
#     return Response({'message': 'Successfully logged out'})

# # ========== UPDATED QUIZ VIEWS WITH OFFLINE SUPPORT ==========

# class QuizViewSet(viewsets.ModelViewSet):
#     serializer_class = QuizSerializer
#     permission_classes = [IsAuthenticatedOrReadOnly]

#     def get_queryset(self):
#         # ADD filtering for offline available quizzes
#         return Quiz.objects.filter(offline_available=True).prefetch_related('questions')

#     def list(self, request, *args, **kwargs):
#         queryset = self.get_queryset()
#         serializer = self.get_serializer(queryset, many=True)
#         return Response({
#             'quizzes': serializer.data
#         })
    
#     def retrieve(self, request, pk=None):
#         queryset = self.get_queryset()
#         quiz = get_object_or_404(queryset, pk=pk)
#         serializer = self.get_serializer(quiz)
#         return Response(serializer.data)

# class QuizSubmissionView(APIView):
#     """Enhanced API endpoint for submitting quiz answers with offline support"""
#     permission_classes = [IsAuthenticated]

#     def post(self, request, *args, **kwargs):
#         try:
#             quiz_id = request.data.get('quiz_id')
#             answers = request.data.get('answers', {})
#             # ADD offline mode detection
#             offline_mode = request.data.get('offline_mode', False)

#             quiz = get_object_or_404(Quiz, id=quiz_id)
#             student = request.user.student

#             # Calculate score
#             correct_count = 0
#             total_questions = quiz.questions.count()

#             for question in quiz.questions.all():
#                 student_answer = answers.get(str(question.id))
#                 if student_answer and student_answer == question.correct_answer:
#                     correct_count += 1

#             score = (correct_count / total_questions * 100) if total_questions > 0 else 0

#             # CREATE attempt with offline support
#             attempt = QuizAttempt(
#                 student=student,
#                 quiz=quiz,
#                 answers=answers,
#                 score=score,
#                 offline_attempt=offline_mode,  # ADD offline flag
#                 is_synced=not offline_mode     # ADD sync flag
#             )
#             attempt.save()

#             # Award badges with offline badge
#             badges_earned = []
#             if score == 100:
#                 badge, _ = Badge.objects.get_or_create(
#                     name='Perfect Score',
#                     defaults={'description': 'Scored 100% on a quiz'}
#                 )
#                 StudentBadge.objects.get_or_create(student=student, badge=badge)
#                 badges_earned.append('Perfect Score')
            
#             # ADD offline learner badge
#             if offline_mode:
#                 badge, _ = Badge.objects.get_or_create(
#                     name='Offline Learner',
#                     defaults={'description': 'Completed quiz in offline mode'}
#                 )
#                 StudentBadge.objects.get_or_create(student=student, badge=badge)
#                 badges_earned.append('Offline Learner')

#             return Response({
#                 'attempt_number': attempt.attempt_number,
#                 'score': score,
#                 'correct_answers': correct_count,
#                 'total_questions': total_questions,
#                 'badges_earned': badges_earned,  # ADD badges info
#                 'offline_mode': offline_mode,    # ADD offline status
#                 'sync_status': 'synced' if not offline_mode else 'pending'
#             }, status=status.HTTP_201_CREATED)

#         except Exception as e:
#             return Response(
#                 {'error': str(e)},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

# # ========== NEW OFFLINE ENDPOINTS ==========

# @api_view(['GET'])
# @permission_classes([AllowAny])
# def download_offline_content(request):
#     """Download all content for offline use"""
#     try:
#         # Get all offline-available quizzes
#         quizzes = Quiz.objects.filter(
#             is_active=True, 
#             offline_available=True
#         ).prefetch_related('questions')
        
#         # Get all offline-available videos
#         videos = Video.objects.filter(offline_available=True)
        
#         offline_content = {
#             'quizzes': [],
#             'videos': [],
#             'sync_timestamp': timezone.now().isoformat(),
#             'version': 1
#         }
        
#         # Prepare quiz data (hide correct answers for security)
#         for quiz in quizzes:
#             quiz_data = {
#                 'id': str(quiz.id),
#                 'name': quiz.name,
#                 'subject': quiz.subject,
#                 'time_limit': quiz.time_limit,
#                 'questions': []
#             }
            
#             for question in quiz.questions.all():
#                 quiz_data['questions'].append({
#                     'id': str(question.id),
#                     'text_en': question.text_en,
#                     'text_pa': question.text_pa,
#                     'options': question.options,
#                     # Don't include correct_answer for offline security
#                 })
            
#             offline_content['quizzes'].append(quiz_data)
        
#         # Prepare video data
#         for video in videos:
#             video_data = {
#                 'id': str(video.id),
#                 'title': video.title,
#                 'title_pa': video.title_pa,
#                 'description': video.description,
#                 'category': video.category.category_type,
#                 'difficulty': video.difficulty,
#                 'duration_minutes': video.duration_minutes,
#                 'video_urls': {
#                     'en': video.get_video_url('en'),
#                     'hi': video.get_video_url('hi'),
#                     'pa': video.get_video_url('pa'),
#                 }
#             }
#             offline_content['videos'].append(video_data)
        
#         return Response(offline_content)
        
#     except Exception as e:
#         return Response({'error': f'Failed to download content: {str(e)}'}, status=500)

# @api_view(['POST'])
# @permission_classes([AllowAny])
# def submit_offline_quiz(request):
#     """Submit quiz that works both online and offline"""
#     try:
#         quiz_id = request.data.get('quiz_id')
#         answers = request.data.get('answers', {})
#         offline_mode = request.data.get('offline_mode', False)
#         student_id = request.data.get('student_id')  # For offline identification
        
#         quiz = get_object_or_404(Quiz, id=quiz_id)
        
#         # Calculate score
#         correct_count = 0
#         total_questions = quiz.questions.count()
        
#         for question in quiz.questions.all():
#             student_answer = answers.get(str(question.id))
#             if student_answer == question.correct_answer:
#                 correct_count += 1
        
#         score = (correct_count / total_questions * 100) if total_questions > 0 else 0
        
#         # Handle online vs offline submission
#         if request.user.is_authenticated and hasattr(request.user, 'student'):
#             # Online user - save normally
#             attempt = QuizAttempt.objects.create(
#                 student=request.user.student,
#                 quiz=quiz,
#                 answers=answers,
#                 score=score,
#                 offline_attempt=offline_mode,
#                 is_synced=not offline_mode
#             )
#         elif offline_mode and student_id:
#             # Offline mode - save to offline session
#             try:
#                 student = Student.objects.get(student_id=student_id)
#                 offline_session = OfflineSession.objects.create(
#                     student=student,
#                     session_id=str(uuid.uuid4()),
#                     session_data={
#                         'quiz_id': str(quiz_id),
#                         'answers': answers,
#                         'score': score,
#                         'completed_at': timezone.now().isoformat()
#                     },
#                     is_synced=False
#                 )
#             except Student.DoesNotExist:
#                 return Response({'error': 'Student not found'}, status=404)
        
#         # Award badges
#         badges_earned = []
#         if score >= 90:
#             badges_earned.append("Excellence")
#         if score == 100:
#             badges_earned.append("Perfect Score")
#         if offline_mode:
#             badges_earned.append("Offline Learner")
        
#         return Response({
#             'score': score,
#             'correct_answers': correct_count,
#             'total_questions': total_questions,
#             'badges_earned': badges_earned,
#             'offline_mode': offline_mode,
#             'sync_needed': offline_mode,
#             'message': 'Quiz completed!' + (' (Will sync when online)' if offline_mode else '')
#         })
        
#     except Exception as e:
#         return Response({'error': f'Quiz submission failed: {str(e)}'}, status=500)

# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def sync_offline_attempts(request):
#     """Sync offline quiz attempts when back online"""
#     try:
#         offline_attempts = request.data.get('offline_attempts', [])
#         synced_count = 0
#         errors = []
        
#         student = request.user.student
        
#         for attempt_data in offline_attempts:
#             try:
#                 quiz_id = attempt_data.get('quiz_id')
#                 quiz = Quiz.objects.get(id=quiz_id)
                
#                 # Check if this attempt already exists
#                 existing = QuizAttempt.objects.filter(
#                     student=student,
#                     quiz=quiz,
#                     answers=attempt_data.get('answers', {}),
#                     offline_attempt=True
#                 ).exists()
                
#                 if not existing:
#                     QuizAttempt.objects.create(
#                         student=student,
#                         quiz=quiz,
#                         answers=attempt_data.get('answers', {}),
#                         score=attempt_data.get('score', 0),
#                         offline_attempt=True,
#                         is_synced=True
#                     )
#                     synced_count += 1
                
#             except Exception as e:
#                 errors.append(f"Failed to sync attempt: {str(e)}")
        
#         # Update student's last sync time
#         student.last_offline_sync = timezone.now()
#         student.save()
        
#         # Log the sync operation
#         SyncLog.objects.create(
#             student=student,
#             sync_type='quiz_attempts',
#             status='success' if not errors else 'failed',
#             sync_data={'synced_count': synced_count, 'errors': errors}
#         )
        
#         return Response({
#             'synced_count': synced_count,
#             'errors': errors,
#             'message': f'Successfully synced {synced_count} offline attempts'
#         })
        
#     except Exception as e:
#         return Response({'error': f'Sync failed: {str(e)}'}, status=500)

# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def toggle_offline_mode(request):
#     """Enable/disable offline mode for student"""
#     try:
#         offline_mode = request.data.get('offline_mode', False)
#         student = request.user.student
#         student.offline_mode = offline_mode
#         student.save()
        
#         return Response({
#             'offline_mode': offline_mode,
#             'message': f'Offline mode {"enabled" if offline_mode else "disabled"}'
#         })
        
#     except Exception as e:
#         return Response({'error': str(e)}, status=500)

# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def get_offline_status(request):
#     """Get offline sync status and pending data"""
#     try:
#         student = request.user.student
        
#         unsynced_attempts = QuizAttempt.objects.filter(
#             student=student,
#             is_synced=False
#         ).count()
        
#         offline_sessions = OfflineSession.objects.filter(
#             student=student,
#             is_synced=False
#         ).count()
        
#         return Response({
#             'offline_mode': student.offline_mode,
#             'unsynced_attempts': unsynced_attempts,
#             'offline_sessions': offline_sessions,
#             'last_sync': student.last_offline_sync.isoformat() if student.last_offline_sync else None,
#             'needs_sync': unsynced_attempts > 0 or offline_sessions > 0,
#             'student_id': student.student_id  # For offline identification
#         })
        
#     except Exception as e:
#         return Response({'error': str(e)}, status=500)

# # ========== KEEP ALL YOUR EXISTING VIEWS BELOW ==========
# # (Teacher Dashboard, Class Management, Video Views, etc. - exactly as they are)

# class TeacherDashboardView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         if not hasattr(request.user, 'teacher'):
#             return Response(
#                 {'error': 'Only teachers can access this endpoint'},
#                 status=status.HTTP_403_FORBIDDEN
#             )
        
#         quiz_id = request.query_params.get('quiz_id')
#         start_date = request.query_params.get('start_date')
#         end_date = request.query_params.get('end_date')

#         queryset = QuizAttempt.objects.select_related('student__user').prefetch_related('student__studentbadge_set__badge').all()
        
#         if quiz_id:
#             queryset = queryset.filter(quiz_id=quiz_id)
        
#         if start_date and end_date:
#             try:
#                 start = parse_date(start_date)
#                 end = parse_date(end_date)
#                 queryset = queryset.filter(completed_at__date__range=[start, end])
#             except Exception as e:
#                 return Response({'error': f'Invalid date format: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
        
#         serializer = StudentProgressSerializer(queryset, many=True)
#         return Response(serializer.data)

# ADD the rest of your existing views exactly as they are...
# ClassRoomViewSet, VideoListView, etc. - no changes needed to them

# [Include all your remaining existing views here - they work unchanged]
