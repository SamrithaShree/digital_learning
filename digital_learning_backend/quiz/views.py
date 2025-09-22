from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
from rest_framework import viewsets, status, permissions, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
import csv
from django.http import HttpResponse
from django.utils.dateparse import parse_date

from .models import Quiz, Question, Student, Teacher, Badge, QuizAttempt, StudentBadge, ClassRoom, Enrollment
from .serializers import (
    QuizSerializer, QuestionSerializer, StudentSerializer, TeacherSerializer,
    BadgeSerializer, QuizAttemptSerializer, ClassRoomSerializer, EnrollmentSerializer, StudentProgressSerializer,StudentRegistrationSerializer,
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

# MERGED: Enhanced TeacherDashboardView with date filtering (your friend's feature)
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
        
        # MERGED: Your friend's date filtering functionality
        if start_date and end_date:
            try:
                start = parse_date(start_date)
                end = parse_date(end_date)
                queryset = queryset.filter(completed_at__date__range=[start, end])
            except Exception as e:
                return Response({'error': f'Invalid date format: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = StudentProgressSerializer(queryset, many=True)
        return Response(serializer.data)

# MERGED: Enhanced export with date filtering (your friend's feature)
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
    
    # MERGED: Your friend's date filtering in export
    if start_date and end_date:
        try:
            start = parse_date(start_date)
            end = parse_date(end_date)
            queryset = queryset.filter(completed_at__date__range=[start, end])
        except Exception as e:
            return Response({'error': f'Invalid date format: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

    writer = csv.writer(response)
    writer.writerow(['Student', 'Quiz', 'Score', 'Completed At'])

    for attempt in queryset:
        writer.writerow([
            attempt.student.user.get_full_name(),
            attempt.quiz.name,
            attempt.score,
            attempt.completed_at.strftime('%Y-%m-%d %H:%M:%S')
        ])

    return response

# YOUR: All class management views
class ClassRoomViewSet(viewsets.ModelViewSet):
    serializer_class = ClassRoomSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only show classes for the authenticated teacher
        if hasattr(self.request.user, 'teacher'):
            return ClassRoom.objects.filter(teacher=self.request.user.teacher).prefetch_related('enrollments')
        return ClassRoom.objects.none()

    def perform_create(self, serializer):
        # Automatically assign the authenticated teacher when creating a class
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
            print(f"Error in ClassRoomViewSet.list: {e}")  # Debug log
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
            print(f"Error in ClassRoomViewSet.create: {e}")  # Debug log
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class ClassDetailView(APIView):
    """
    API endpoint for managing individual class operations
    """
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

    def post(self, request, class_id):
        """Add a student to this class"""
        if not hasattr(request.user, 'teacher'):
            return Response(
                {'error': 'Only teachers can manage classes'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            classroom = get_object_or_404(ClassRoom, id=class_id, teacher=request.user.teacher)
            student_id = request.data.get('student_id')
            
            if not student_id:
                return Response(
                    {'error': 'Student ID is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            student = get_object_or_404(Student, id=student_id)
            enrollment, created = Enrollment.objects.get_or_create(
                student=student,
                classroom=classroom,
                defaults={'active': True, 'progress': 0.0}
            )
            
            if created:
                return Response({'message': 'Student added successfully'})
            else:
                return Response(
                    {'message': 'Student already in class'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Student.DoesNotExist:
            return Response(
                {'error': 'Student not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request, class_id):
        """Remove a student from this class"""
        if not hasattr(request.user, 'teacher'):
            return Response(
                {'error': 'Only teachers can manage classes'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            classroom = get_object_or_404(ClassRoom, id=class_id, teacher=request.user.teacher)
            student_id = request.data.get('student_id')
            
            enrollment = get_object_or_404(
                Enrollment, 
                student_id=student_id, 
                classroom=classroom
            )
            enrollment.delete()
            return Response({'message': 'Student removed successfully'})
        except Enrollment.DoesNotExist:
            return Response(
                {'error': 'Student not in this class'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_student_status(request, enrollment_id):
    """Toggle active/inactive status of a student in a class"""
    if not hasattr(request.user, 'teacher'):
        return Response(
            {'error': 'Only teachers can update student status'},
            status=status.HTTP_403_FORBIDDEN
        )
    
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
        
        return Response(
            {'error': 'Active status required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_student_progress(request, enrollment_id):
    """Update progress of a student in a class"""
    if not hasattr(request.user, 'teacher'):
        return Response(
            {'error': 'Only teachers can update student progress'},
            status=status.HTTP_403_FORBIDDEN
        )
    
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
        
        return Response(
            {'error': 'Valid progress value (0-100) required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_available_students(request):
    """Get list of students that can be added to classes"""
    if not hasattr(request.user, 'teacher'):
        return Response(
            {'error': 'Only teachers can access student list'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        students = Student.objects.all()
        serializer = StudentSerializer(students, many=True)
        return Response({
            'students': serializer.data
        })
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def class_detail_view(request, class_id):
    """Get detailed information about a specific class"""
    if not hasattr(request.user, 'teacher'):
        return Response({'error': 'Only teachers can view class details'}, status=403)
    
    try:
        classroom = get_object_or_404(
            ClassRoom, 
            id=class_id, 
            teacher=request.user.teacher
        )
        
        # Get class details with students
        serializer = ClassRoomSerializer(classroom)
        data = serializer.data
        
        # Add student details
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
def add_student_to_class(request, class_id):
    """Add a student to a class"""
    if not hasattr(request.user, 'teacher'):
        return Response({'error': 'Only teachers can manage classes'}, status=403)
    
    try:
        classroom = get_object_or_404(ClassRoom, id=class_id, teacher=request.user.teacher)
        student_id = request.data.get('student_id')
        
        if not student_id:
            return Response({'error': 'Student ID is required'}, status=400)
        
        student = get_object_or_404(Student, id=student_id)
        
        # Check if student is already in class
        if Enrollment.objects.filter(student=student, classroom=classroom).exists():
            return Response({'error': 'Student already enrolled in this class'}, status=400)
        
        # Add student to class
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
def remove_student_from_class(request, class_id, enrollment_id):
    """Remove a student from a class"""
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
def update_enrollment(request, enrollment_id):
    """Update student enrollment (progress, status)"""
    if not hasattr(request.user, 'teacher'):
        return Response({'error': 'Only teachers can update enrollments'}, status=403)
    
    try:
        enrollment = get_object_or_404(
            Enrollment, 
            id=enrollment_id, 
            classroom__teacher=request.user.teacher
        )
        
        # Update progress if provided
        if 'progress' in request.data:
            progress = request.data['progress']
            if 0 <= progress <= 100:
                enrollment.progress = progress
            else:
                return Response({'error': 'Progress must be between 0 and 100'}, status=400)
        
        # Update active status if provided
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
# from rest_framework import viewsets, status, permissions
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.response import Response
# from rest_framework.authtoken.models import Token
# from rest_framework.views import APIView
# from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
# import csv
# from django.http import HttpResponse

# from .models import Quiz, Question, Student, Teacher, Badge, QuizAttempt, StudentBadge
# from .serializers import (
#     QuizSerializer, QuestionSerializer, StudentSerializer, TeacherSerializer,
#     BadgeSerializer, QuizAttemptSerializer, StudentProgressSerializer,StudentRegistrationSerializer,
#     TeacherRegistrationSerializer, UserSerializer, MyProgressSerializer, ErrorSerializer
# )

# @api_view(['POST'])
# @permission_classes([AllowAny]) # Anyone can access this page to sign up
# def student_registration_view(request):
#     serializer = StudentRegistrationSerializer(data=request.data)
#     if serializer.is_valid():
#         serializer.save()
#         return Response(serializer.data, status=status.HTTP_201_CREATED)
#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# @api_view(['POST'])
# @permission_classes([AllowAny]) # Anyone can access this page to sign up
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

# class QuizViewSet(viewsets.ModelViewSet):
#     serializer_class = QuizSerializer
#     permission_classes = [IsAuthenticatedOrReadOnly]

#     def get_queryset(self):
#         return Quiz.objects.prefetch_related('questions').all()

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
#     """
#     API endpoint for submitting quiz answers
#     """
#     permission_classes = [IsAuthenticated]

#     def post(self, request, *args, **kwargs):
#         try:
#             quiz_id = request.data.get('quiz_id')
#             answers = request.data.get('answers', {})

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

#             # Create new attempt and let the model handle attempt_number
#             attempt = QuizAttempt(
#                 student=student,
#                 quiz=quiz,
#                 answers=answers,
#                 score=score
#             )
#             attempt.save() # This will call the custom save method

#             # Award badges
#             if score == 100:
#                 badge, _ = Badge.objects.get_or_create(name='Perfect Score')
#                 StudentBadge.objects.get_or_create(student=student, badge=badge)

#             return Response({
#                 'attempt_number': attempt.attempt_number,
#                 'score': score,
#                 'correct_answers': correct_count,
#                 'total_questions': total_questions,
#             }, status=status.HTTP_201_CREATED)

#         except Exception as e:
#             return Response(
#                 {'error': str(e)},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )
        
# class TeacherDashboardView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         if not hasattr(request.user, 'teacher'):
#             return Response(
#                 {'error': 'Only teachers can access this endpoint'},
#                 status=status.HTTP_403_FORBIDDEN
#             )
        
#         quiz_id = request.query_params.get('quiz_id')
#         # Use prefetch_related to optimize queries
#         queryset = QuizAttempt.objects.select_related('student__user').prefetch_related('student__studentbadge_set__badge').all()
        
#         if quiz_id:
#             queryset = queryset.filter(quiz_id=quiz_id)
        
#         serializer = StudentProgressSerializer(queryset, many=True)
#         return Response(serializer.data)

# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def export_progress(request):
#     if not hasattr(request.user, 'teacher'):
#         return Response(
#             {'error': 'Only teachers can access this endpoint'},
#             status=status.HTTP_403_FORBIDDEN
#         )

#     response = HttpResponse(content_type='text/csv')
#     response['Content-Disposition'] = 'attachment; filename="student_progress.csv"'

#     writer = csv.writer(response)
#     writer.writerow(['Student', 'Quiz', 'Score', 'Completed At'])

#     quiz_id = request.query_params.get('quiz_id')
#     queryset = QuizAttempt.objects.all()
#     if quiz_id:
#         queryset = queryset.filter(quiz_id=quiz_id)

#     for attempt in queryset:
#         writer.writerow([
#             attempt.student.user.get_full_name(),
#             attempt.quiz.name,
#             attempt.score,
#             attempt.completed_at.strftime('%Y-%m-%d %H:%M:%S')
#         ])

#     return response

