import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from quiz.models import VideoCategory, Video

def create_sample_videos():
    # Create categories
    digital_literacy_cat, _ = VideoCategory.objects.get_or_create(
        name="Computer Basics",
        category_type="digital_literacy",
        description="Essential digital skills for beginners"
    )
    
    math_cat, _ = VideoCategory.objects.get_or_create(
        name="Mathematics",
        category_type="mathematics",
        description="Higher secondary mathematics"
    )
    
    physics_cat, _ = VideoCategory.objects.get_or_create(
        name="Physics", 
        category_type="physics",
        description="Physics concepts and practicals"
    )
    
    chemistry_cat, _ = VideoCategory.objects.get_or_create(
        name="Chemistry",
        category_type="chemistry", 
        description="Chemistry theory and experiments"
    )

    # Sample YouTube videos for testing (these are actual educational videos)
    digital_literacy_videos = [
        {
            'title': 'Computer Basics for Beginners',
            'title_hi': 'शुरुआती लोगों के लिए कंप्यूटर की बुनियादी बातें',
            'title_pa': 'ਸ਼ੁਰੂਆਤੀ ਲੋਕਾਂ ਲਈ ਕੰਪਿਊਟਰ ਦੀਆਂ ਬੁਨਿਆਦੀ ਗੱਲਾਂ',
            'description': 'Learn the fundamentals of using a computer',
            'description_hi': 'कंप्यूटर का उपयोग करने की बुनियादी बातें सीखें',
            'description_pa': 'ਕੰਪਿਊਟਰ ਵਰਤਣ ਦੀਆਂ ਬੁਨਿਆਦੀ ਗੱਲਾਂ ਸਿੱਖੋ',
            'video_url_en': 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
            'category': digital_literacy_cat,
            'difficulty': 'beginner',
            'duration_minutes': 15
        },
        {
            'title': 'Internet Safety and Security',
            'title_hi': 'इंटरनेट सुरक्षा और बचाव',
            'title_pa': 'ਇੰਟਰਨੈੱਟ ਸੁਰੱਖਿਆ ਅਤੇ ਸੁਰੱਖਿਆ',
            'description': 'Stay safe while browsing the internet',
            'description_hi': 'इंटरनेट ब्राउज़ करते समय सुरक्षित रहें',
            'description_pa': 'ਇੰਟਰਨੈੱਟ ਬ੍ਰਾਊਜ਼ ਕਰਦੇ ਸਮੇਂ ਸੁਰੱਖਿਅਤ ਰਹੋ',
            'video_url_en': 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
            'category': digital_literacy_cat,
            'difficulty': 'intermediate',
            'duration_minutes': 20
        }
    ]
    
    math_videos = [
        {
            'title': 'Calculus Fundamentals',
            'title_hi': 'कैलकुलस की बुनियादी बातें',
            'title_pa': 'ਕੈਲਕੁਲਸ ਦੀਆਂ ਬੁਨਿਆਦੀ ਗੱਲਾਂ',
            'description': 'Introduction to differential and integral calculus',
            'description_hi': 'अवकल और समाकलन कैलकुलस का परिचय',
            'description_pa': 'ਡਿਫਰੈਂਸ਼ੀਅਲ ਅਤੇ ਇੰਟੀਗਰਲ ਕੈਲਕੁਲਸ ਦੀ ਜਾਣ-ਪਛਾਣ',
            'video_url_en': 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_3mb.mp4',
            'category': math_cat,
            'difficulty': 'advanced',
            'duration_minutes': 30
        }
    ]
    
    # Create videos
    for video_data in digital_literacy_videos + math_videos:
        Video.objects.get_or_create(
            title=video_data['title'],
            defaults=video_data
        )
    
    print("Sample videos created successfully!")

if __name__ == "__main__":
    create_sample_videos()
