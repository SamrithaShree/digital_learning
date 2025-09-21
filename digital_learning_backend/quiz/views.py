from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from .models import Quiz, Question, Student, Teacher, Badge, QuizAttempt, StudentBadge
from .serializers import (
    QuizSerializer, QuestionSerializer, StudentSerializer, TeacherSerializer,
    BadgeSerializer, QuizAttemptSerializer, StudentProgressSerializer,
    UserSerializer, ErrorSerializer
)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    request.user.auth_token.delete()
    return Response({'message': 'Successfully logged out'})

class QuizViewSet(viewsets.ModelViewSet):
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Quiz.objects.prefetch_related('questions').all()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        # Add debugging information
        print(f"Found {queryset.count()} quizzes")
        for quiz in queryset:
            print(f"Quiz '{quiz.name}' has {quiz.questions.count()} questions")
            
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'quizzes': serializer.data
        })

class QuizSubmissionView(APIView):
    """
    API endpoint for submitting quiz answers
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            quiz_id = request.data.get('quiz_id')
            answers = request.data.get('answers', {})
            
            quiz = Quiz.objects.get(id=quiz_id)
            student = request.user.student
            
            # Calculate score
            correct_count = 0
            total_questions = quiz.questions.count()
            
            for question in quiz.questions.all():
                student_answer = answers.get(str(question.id))
                if student_answer and student_answer == question.correct_answer:
                    correct_count += 1
            
            score = (correct_count / total_questions * 100) if total_questions > 0 else 0
            
            # Create new attempt without specifying attempt_number
            attempt = QuizAttempt.objects.create(
                student=student,
                quiz=quiz,
                answers=answers,
                score=score
            )
            
            return Response({
                'attempt_number': attempt.attempt_number,
                'score': score,
                'correct_answers': correct_count,
                'total_questions': total_questions,
                'previous_attempts': QuizAttempt.objects.filter(
                    student=student,
                    quiz=quiz
                ).count()
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class TeacherDashboardView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if not hasattr(request.user, 'teacher'):
            return Response(
                {'error': 'Only teachers can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        quiz_id = request.query_params.get('quiz_id')
        queryset = QuizAttempt.objects.all()
        
        if quiz_id:
            queryset = queryset.filter(quiz_id=quiz_id)
        
        student_progress = []
        for attempt in queryset:
            badges = [badge.name for badge in attempt.student.studentbadge_set.all()]
            progress = {
                'student_name': attempt.student.user.get_full_name(),
                'score': attempt.score,
                'badges': badges,
                'progress': attempt.score / 10.0  # Convert score to progress percentage
            }
            student_progress.append(progress)
        
        return Response(student_progress)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_progress(request):
    if not hasattr(request.user, 'teacher'):
        return Response(
            {'error': 'Only teachers can access this endpoint'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # This is a placeholder for CSV generation
    # In a real implementation, you would use Django's CSV writing capabilities
    return Response({
        'message': 'Export functionality will be implemented here'
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def debug_quiz_data(request):
    quizzes = Quiz.objects.all()
    quiz_data = []
    for quiz in quizzes:
        quiz_data.append({
            'id': quiz.id,
            'name': quiz.name,
            'question_count': quiz.questions.count(),
            'created_by': quiz.created_by.user.username if quiz.created_by else None
        })
    return Response({
        'quiz_count': len(quiz_data),
        'quizzes': quiz_data
    })
