from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
import csv
from django.http import HttpResponse

from .models import Quiz, Question, Student, Teacher, Badge, QuizAttempt, StudentBadge
from .serializers import (
    QuizSerializer, QuestionSerializer, StudentSerializer, TeacherSerializer,
    BadgeSerializer, QuizAttemptSerializer, StudentProgressSerializer,StudentRegistrationSerializer,
    TeacherRegistrationSerializer, UserSerializer, MyProgressSerializer, ErrorSerializer
)

@api_view(['POST'])
@permission_classes([AllowAny]) # Anyone can access this page to sign up
def student_registration_view(request):
    serializer = StudentRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny]) # Anyone can access this page to sign up
def teacher_registration_view(request):
    serializer = TeacherRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
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

class QuizViewSet(viewsets.ModelViewSet):
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Quiz.objects.prefetch_related('questions').all()

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
        return Response(serializer.data)

class QuizSubmissionView(APIView):
    """
    API endpoint for submitting quiz answers
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            quiz_id = request.data.get('quiz_id')
            answers = request.data.get('answers', {})

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

            # Create new attempt and let the model handle attempt_number
            attempt = QuizAttempt(
                student=student,
                quiz=quiz,
                answers=answers,
                score=score
            )
            attempt.save() # This will call the custom save method

            # Award badges
            if score == 100:
                badge, _ = Badge.objects.get_or_create(name='Perfect Score')
                StudentBadge.objects.get_or_create(student=student, badge=badge)

            return Response({
                'attempt_number': attempt.attempt_number,
                'score': score,
                'correct_answers': correct_count,
                'total_questions': total_questions,
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
        # Use prefetch_related to optimize queries
        queryset = QuizAttempt.objects.select_related('student__user').prefetch_related('student__studentbadge_set__badge').all()
        
        if quiz_id:
            queryset = queryset.filter(quiz_id=quiz_id)
        
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

    writer = csv.writer(response)
    writer.writerow(['Student', 'Quiz', 'Score', 'Completed At'])

    quiz_id = request.query_params.get('quiz_id')
    queryset = QuizAttempt.objects.all()
    if quiz_id:
        queryset = queryset.filter(quiz_id=quiz_id)

    for attempt in queryset:
        writer.writerow([
            attempt.student.user.get_full_name(),
            attempt.quiz.name,
            attempt.score,
            attempt.completed_at.strftime('%Y-%m-%d %H:%M:%S')
        ])

    return response