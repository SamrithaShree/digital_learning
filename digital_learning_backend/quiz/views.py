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
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        lang = self.request.query_params.get('lang', 'en')
        if lang == 'pa':
            # If Punjabi is requested, only return quizzes with Punjabi translations
            return queryset.filter(questions__text_pa__isnull=False).distinct()
        return queryset

class QuizSubmissionView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        student = get_object_or_404(Student, user=request.user)
        quiz = get_object_or_404(Quiz, id=request.data.get('quiz_id'))
        
        answers = request.data.get('answers', {})
        if not answers:
            return Response(
                {'error': 'No answers provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calculate score
        questions = quiz.questions.all()
        correct_count = 0
        for question in questions:
            if str(question.id) in answers:
                if answers[str(question.id)] == question.correct_answer:
                    correct_count += 1
        
        score = (correct_count / questions.count()) * 10  # Score out of 10
        
        # Save attempt
        attempt = QuizAttempt.objects.create(
            student=student,
            quiz=quiz,
            answers=answers,
            score=score
        )
        
        # Award badges based on performance
        badges = []
        if score == 10:
            badge, created = Badge.objects.get_or_create(
                name='Perfect Score',
                defaults={'description': 'Achieved a perfect score in a quiz!'}
            )
            StudentBadge.objects.get_or_create(student=student, badge=badge)
            badges.append(badge.name)
        
        return Response({
            'score': score,
            'badges': badges
        })

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
