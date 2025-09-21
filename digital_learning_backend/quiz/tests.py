from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth.models import User
from .models import Quiz, Question, Student, Teacher, QuizAttempt

class QuizAPITests(TestCase):
    def setUp(self):
        """Set up test data"""
        # Create teacher
        self.teacher = User.objects.create_user(
            username='teacher1',
            password='teacher123',
            email='teacher1@example.com'
        )
        self.teacher_profile = Teacher.objects.create(
            user=self.teacher,
            subject='Science',
            school='Nabha Public School'
        )

        # Create student
        self.student = User.objects.create_user(
            username='student1',
            password='student123'
        )
        self.student_profile = Student.objects.create(
            user=self.student,
            grade='10',
            school='Nabha Public School'
        )

        # Create quiz
        self.quiz = Quiz.objects.create(
            name='Test Science Quiz',
            subject='Science',
            created_by=self.teacher_profile
        )

        # Create questions
        self.questions = [
            Question.objects.create(
                quiz=self.quiz,
                text_en='What is H2O?',
                text_pa='ਪਾਣੀ ਕੀ ਹੈ?',
                options={'A': 'Water', 'B': 'Air', 'C': 'Fire', 'D': 'Earth'},
                correct_answer='A',
                subject='Science'
            ),
            Question.objects.create(
                quiz=self.quiz,
                text_en='What is the Red Planet?',
                text_pa='ਲਾਲ ਗ੍ਰਹਿ ਕੀ ਹੈ?',
                options={'A': 'Venus', 'B': 'Mars', 'C': 'Jupiter', 'D': 'Saturn'},
                correct_answer='B',
                subject='Science'
            )
        ]

        self.client = APIClient()

    def test_teacher_login(self):
        """Test teacher authentication"""
        response = self.client.post('/api/auth/login/', {
            'username': 'teacher1',
            'password': 'teacher123'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)

    def test_quiz_list(self):
        """Test quiz listing"""
        self.client.force_authenticate(user=self.teacher)
        response = self.client.get('/api/quiz/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('quizzes', response.data)

    def test_quiz_detail(self):
        """Test single quiz retrieval"""
        self.client.force_authenticate(user=self.teacher)
        response = self.client.get(f'/api/quiz/{self.quiz.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Test Science Quiz')

    def test_quiz_submission(self):
        """Test quiz submission"""
        self.client.force_authenticate(user=self.student)
        response = self.client.post('/api/submit/', {
            'quiz_id': self.quiz.id,
            'answers': {
                str(self.questions[0].id): 'A',
                str(self.questions[1].id): 'B'
            }
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['score'], 100.0)

    def test_teacher_dashboard(self):
        """Test teacher dashboard access"""
        self.client.force_authenticate(user=self.teacher)
        response = self.client.get('/api/quiz/dashboard/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_export_progress(self):
        """Test progress export"""
        self.client.force_authenticate(user=self.teacher)
        response = self.client.get('/api/quiz/export/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'text/csv')
