from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from quiz.models import Badge, Teacher, Student, Quiz, Question

class Command(BaseCommand):
    help = 'Sets up initial test data for the quiz application'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating initial data...')

        # Create badges
        badges = [
            {
                'name': 'Perfect Score',
                'description': 'Achieved 100% in a quiz!'
            },
            {
                'name': 'Quick Learner',
                'description': 'Completed 5 quizzes in record time'
            },
            {
                'name': 'Science Whiz',
                'description': 'Excellent performance in Science quizzes'
            },
            {
                'name': 'Math Master',
                'description': 'Outstanding achievement in Mathematics'
            },
            {
                'name': 'Language Expert',
                'description': 'Proficient in both English and Punjabi'
            }
        ]

        for badge_data in badges:
            badge, created = Badge.objects.get_or_create(
                name=badge_data['name'],
                defaults={'description': badge_data['description']}
            )
            if created:
                self.stdout.write(f'Created badge: {badge.name}')

        # Create a teacher
        teacher_user, created = User.objects.get_or_create(
            username='teacher1',
            defaults={
                'email': 'teacher1@example.com',
                'first_name': 'John',
                'last_name': 'Smith'
            }
        )
        if created:
            teacher_user.set_password('teacher123')
            teacher_user.save()
            
        teacher, created = Teacher.objects.get_or_create(
            user=teacher_user,
            defaults={
                'subject': 'Science',
                'school': 'Nabha Public School'
            }
        )
        if created:
            self.stdout.write(f'Created teacher: {teacher.user.username}')

        # Create a quiz
        quiz, created = Quiz.objects.get_or_create(
            name='Basic Science Quiz',
            defaults={
                'subject': 'Science',
                'created_by': teacher
            }
        )
        
        if created:
            self.stdout.write(f'Created quiz: {quiz.name}')
            # Add questions to the quiz
            questions = [
                {
                    'text_en': 'What is the chemical formula for water?',
                    'text_pa': 'ਪਾਣੀ ਦਾ ਰਸਾਇਣਕ ਫਾਰਮੂਲਾ ਕੀ ਹੈ?',
                    'options': {
                        'A': 'H2O',
                        'B': 'CO2',
                        'C': 'O2',
                        'D': 'H2'
                    },
                    'correct_answer': 'A'
                },
                {
                    'text_en': 'Which planet is known as the Red Planet?',
                    'text_pa': 'ਕਿਹੜਾ ਗ੍ਰਹਿ ਲਾਲ ਗ੍ਰਹਿ ਦੇ ਰੂਪ ਵਿੱਚ ਜਾਣਿਆ ਜਾਂਦਾ ਹੈ?',
                    'options': {
                        'A': 'Venus',
                        'B': 'Mars',
                        'C': 'Jupiter',
                        'D': 'Saturn'
                    },
                    'correct_answer': 'B'
                }
            ]

            for q_data in questions:
                Question.objects.create(
                    quiz=quiz,
                    text_en=q_data['text_en'],
                    text_pa=q_data['text_pa'],
                    options=q_data['options'],
                    correct_answer=q_data['correct_answer'],
                    subject='Science'
                )
                self.stdout.write(f'Added question to quiz: {q_data["text_en"][:30]}...')

        # Create student accounts
        students = [
            {
                'username': 'student1',
                'email': 'student1@example.com',
                'first_name': 'Alice',
                'last_name': 'Johnson',
                'grade': '10',
                'school': 'Nabha Public School'
            },
            {
                'username': 'student2',
                'email': 'student2@example.com',
                'first_name': 'Bob',
                'last_name': 'Wilson',
                'grade': '10',
                'school': 'Nabha Public School'
            }
        ]

        for student_data in students:
            user, created = User.objects.get_or_create(
                username=student_data['username'],
                defaults={
                    'email': student_data['email'],
                    'first_name': student_data['first_name'],
                    'last_name': student_data['last_name']
                }
            )
            if created:
                user.set_password('student123')
                user.save()
                
            student, created = Student.objects.get_or_create(
                user=user,
                defaults={
                    'grade': student_data['grade'],
                    'school': student_data['school']
                }
            )
            if created:
                self.stdout.write(f'Created student: {student.user.username}')

        self.stdout.write(self.style.SUCCESS('Successfully created initial test data'))