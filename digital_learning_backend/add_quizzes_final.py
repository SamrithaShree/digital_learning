#!/usr/bin/env python
"""Add sample quizzes to database - Compatible with your models"""

from datetime import datetime
from quiz.models import Quiz, Question, Teacher
from django.contrib.auth.models import User

print("🚀 Creating sample quizzes...")

# Get or create teacher
teacher = Teacher.objects.first()

if not teacher:
    print("⚠️  No teacher found. Creating default teacher...")
    user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@example.com',
            'first_name': 'Admin',
            'last_name': 'Teacher'
        }
    )
    if created:
        user.set_password('admin123')
        user.save()
        print(f"✅ Created user: {user.username}")
    
    teacher = Teacher.objects.create(
        user=user,
        subject='Computer Science',
        school='Demo School'
    )
    print(f"✅ Created teacher: {teacher.user.username}")

# Clear existing quizzes
Quiz.objects.all().delete()
print("✅ Cleared existing quizzes")

# Quiz 1: Digital Literacy Basics
quiz1 = Quiz.objects.create(
    name="Digital Literacy Basics",
    subject="digital_literacy",
    created_by=teacher,
    is_active=True,
    offline_available=True,
    time_limit=15
)

questions1 = [
    {
        "text_en": "What does CPU stand for?",
        "text_pa": "CPU ਦਾ ਕੀ ਅਰਥ ਹੈ?",
        "options": {
            "A": "Central Processing Unit",
            "B": "Computer Personal Unit",
            "C": "Central Program Utility",
            "D": "Computer Processing Unit"
        },
        "correct": "A"
    },
    {
        "text_en": "Which of the following is an input device?",
        "text_pa": "ਹੇਠਾਂ ਦਿੱਤੇ ਵਿੱਚੋਂ ਕਿਹੜਾ ਇੰਪੁੱਟ ਡਿਵਾਈਸ ਹੈ?",
        "options": {
            "A": "Monitor",
            "B": "Printer",
            "C": "Keyboard",
            "D": "Speaker"
        },
        "correct": "C"
    },
    {
        "text_en": "What is the shortcut key to copy text?",
        "text_pa": "ਟੈਕਸਟ ਕਾਪੀ ਕਰਨ ਲਈ ਸ਼ਾਰਟਕੱਟ ਕੁੰਜੀ ਕੀ ਹੈ?",
        "options": {
            "A": "Ctrl + C",
            "B": "Ctrl + V",
            "C": "Ctrl + X",
            "D": "Ctrl + Z"
        },
        "correct": "A"
    },
    {
        "text_en": "What does RAM stand for?",
        "text_pa": "RAM ਦਾ ਕੀ ਅਰਥ ਹੈ?",
        "options": {
            "A": "Read Access Memory",
            "B": "Random Access Memory",
            "C": "Run Access Memory",
            "D": "Rapid Access Memory"
        },
        "correct": "B"
    },
    {
        "text_en": "Which of the following is a web browser?",
        "text_pa": "ਹੇਠਾਂ ਦਿੱਤੇ ਵਿੱਚੋਂ ਕਿਹੜਾ ਵੈੱਬ ਬ੍ਰਾਊਜ਼ਰ ਹੈ?",
        "options": {
            "A": "Microsoft Word",
            "B": "Google Chrome",
            "C": "Adobe Photoshop",
            "D": "Windows Explorer"
        },
        "correct": "B"
    },
]

for q_data in questions1:
    Question.objects.create(
        quiz=quiz1,
        text_en=q_data["text_en"],
        text_pa=q_data["text_pa"],
        options=q_data["options"],
        correct_answer=q_data["correct"],
        subject="digital_literacy"
    )

print(f"✅ Created: {quiz1.name} ({quiz1.questions.count()} questions)")

# Quiz 2: Internet Safety
quiz2 = Quiz.objects.create(
    name="Internet Safety",
    subject="digital_literacy",
    created_by=teacher,
    is_active=True,
    offline_available=True,
    time_limit=10
)

questions2 = [
    {
        "text_en": "What should you do to keep your password safe?",
        "text_pa": "ਆਪਣਾ ਪਾਸਵਰਡ ਸੁਰੱਖਿਅਤ ਰੱਖਣ ਲਈ ਤੁਹਾਨੂੰ ਕੀ ਕਰਨਾ ਚਾਹੀਦਾ ਹੈ?",
        "options": {
            "A": "Share it with friends",
            "B": "Use your name as password",
            "C": "Use a strong, unique password",
            "D": "Write it on a piece of paper"
        },
        "correct": "C"
    },
    {
        "text_en": "What is phishing?",
        "text_pa": "ਫਿਸ਼ਿੰਗ ਕੀ ਹੈ?",
        "options": {
            "A": "A type of fish",
            "B": "Catching fish online",
            "C": "Fraudulent attempt to obtain sensitive information",
            "D": "A computer game"
        },
        "correct": "C"
    },
    {
        "text_en": "What does HTTPS stand for?",
        "text_pa": "HTTPS ਦਾ ਕੀ ਅਰਥ ਹੈ?",
        "options": {
            "A": "Hyper Text Transfer Protocol Secure",
            "B": "High Transfer Text Protocol System",
            "C": "Hyper Transfer Text Protocol",
            "D": "High Text Transfer Protocol"
        },
        "correct": "A"
    },
]

for q_data in questions2:
    Question.objects.create(
        quiz=quiz2,
        text_en=q_data["text_en"],
        text_pa=q_data["text_pa"],
        options=q_data["options"],
        correct_answer=q_data["correct"],
        subject="digital_literacy"
    )

print(f"✅ Created: {quiz2.name} ({quiz2.questions.count()} questions)")

# Quiz 3: STEM Basics
quiz3 = Quiz.objects.create(
    name="STEM Basics",
    subject="stem",
    created_by=teacher,
    is_active=True,
    offline_available=True,
    time_limit=15
)

questions3 = [
    {
        "text_en": "What is Python?",
        "text_pa": "Python ਕੀ ਹੈ?",
        "options": {
            "A": "A type of snake",
            "B": "A programming language",
            "C": "A web browser",
            "D": "An operating system"
        },
        "correct": "B"
    },
    {
        "text_en": "What does HTML stand for?",
        "text_pa": "HTML ਦਾ ਕੀ ਅਰਥ ਹੈ?",
        "options": {
            "A": "Hyper Text Markup Language",
            "B": "High Tech Modern Language",
            "C": "Home Tool Markup Language",
            "D": "Hyperlinks and Text Markup Language"
        },
        "correct": "A"
    },
    {
        "text_en": "Which symbol is used for comments in Python?",
        "text_pa": "Python ਵਿੱਚ ਟਿੱਪਣੀਆਂ ਲਈ ਕਿਹੜੇ ਚਿੰਨ੍ਹ ਦੀ ਵਰਤੋਂ ਕੀਤੀ ਜਾਂਦੀ ਹੈ?",
        "options": {
            "A": "//",
            "B": "/* */",
            "C": "#",
            "D": "--"
        },
        "correct": "C"
    },
    {
        "text_en": "What is the basic unit of a computer program?",
        "text_pa": "ਕੰਪਿਊਟਰ ਪ੍ਰੋਗਰਾਮ ਦੀ ਬੁਨਿਆਦੀ ਇਕਾਈ ਕੀ ਹੈ?",
        "options": {
            "A": "Algorithm",
            "B": "Instruction",
            "C": "Variable",
            "D": "Function"
        },
        "correct": "B"
    },
]

for q_data in questions3:
    Question.objects.create(
        quiz=quiz3,
        text_en=q_data["text_en"],
        text_pa=q_data["text_pa"],
        options=q_data["options"],
        correct_answer=q_data["correct"],
        subject="stem"
    )

print(f"✅ Created: {quiz3.name} ({quiz3.questions.count()} questions)")

# Summary
print("\n" + "="*60)
print(f"🎉 SUCCESS! Created {Quiz.objects.count()} quizzes")
print(f"📝 Total questions: {Question.objects.count()}")
print("="*60)

print("\n📋 Quiz List:")
for quiz in Quiz.objects.all():
    print(f"  • {quiz.name}")
    print(f"    - Questions: {quiz.questions.count()}")
    print(f"    - Subject: {quiz.subject}")
    print(f"    - Time limit: {quiz.time_limit} min")
    print(f"    - Offline available: {quiz.offline_available}")
    print()
