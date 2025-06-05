from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from decimal import Decimal
import random
from datetime import datetime, timedelta

from course.models import Course, Section, Lesson, Quiz, Question, Choice, UserCourse, QuizAttempt
from user.models import UserProfile
from admin_panel.models import SystemConfiguration, AuditLog


class Command(BaseCommand):
    help = 'Seed advanced demo data with realistic scenarios for Smart Learning platform'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting advanced data seeding...'))
        
        # Create more realistic course scenarios
        self.create_advanced_courses()
        
        # Create student learning paths
        self.create_learning_paths()
        
        # Create realistic quiz performance data
        self.create_performance_analytics()
        
        # Create course reviews and feedback
        self.create_course_interactions()
        
        # Create realistic admin activities
        self.create_admin_activities()
        
        self.stdout.write(self.style.SUCCESS('Advanced data seeding completed!'))

    def create_advanced_courses(self):
        """Create more advanced courses with realistic content"""
        self.stdout.write('Creating advanced courses...')
        
        # Get existing users
        teachers = User.objects.filter(profile__user_type='teacher')
        if not teachers.exists():
            self.stdout.write(self.style.ERROR('No teachers found. Please run basic seed_data first.'))
            return
            
        advanced_courses = [
            {
                'title': 'Advanced Machine Learning with TensorFlow',
                'subtitle': 'Deep dive into neural networks and deep learning',
                'description': '''
Khóa học Machine Learning nâng cao dành cho những người đã có kiến thức cơ bản về ML:

## Nội dung khóa học:
- **Deep Neural Networks**: Kiến trúc và training techniques
- **Convolutional Neural Networks (CNN)**: Xử lý ảnh và computer vision
- **Recurrent Neural Networks (RNN/LSTM)**: Xử lý sequence data
- **Transfer Learning**: Sử dụng pre-trained models
- **Model Optimization**: Techniques để tăng performance
- **Production Deployment**: Đưa model vào production

## Dự án thực tế:
- Image Classification System
- Natural Language Processing App  
- Time Series Forecasting
- Recommendation System

## Yêu cầu:
- Kiến thức Python cơ bản
- Đã học Machine Learning fundamentals
- Hiểu về Linear Algebra và Statistics

Khóa học bao gồm 40+ giờ video, 15 assignments và 4 capstone projects.
                '''.strip(),
                'category': 'Machine Learning',
                'price': Decimal('599.99'),
                'creator': teachers[0] if teachers.count() > 0 else teachers.first(),
                'published': True,
                'sections': [
                    {
                        'title': 'Deep Learning Fundamentals',
                        'lessons': [
                            'Neural Network Architecture',
                            'Backpropagation Algorithm',
                            'Activation Functions and Loss Functions',
                            'Gradient Descent Optimization',
                            'Regularization Techniques'
                        ]
                    },
                    {
                        'title': 'Convolutional Neural Networks',
                        'lessons': [
                            'CNN Architecture and Convolution Operation',
                            'Pooling Layers and Feature Maps',
                            'Famous CNN Architectures (LeNet, AlexNet, VGG)',
                            'Image Classification Project',
                            'Object Detection Basics'
                        ]
                    },
                    {
                        'title': 'Recurrent Neural Networks',
                        'lessons': [
                            'RNN Fundamentals and Vanishing Gradient',
                            'LSTM and GRU Networks',
                            'Sequence-to-Sequence Models',
                            'Text Generation Project',
                            'Sentiment Analysis with RNN'
                        ]
                    }
                ]
            },
            {
                'title': 'Full-Stack JavaScript Development',
                'subtitle': 'Master Node.js, Express, React, and MongoDB',
                'description': '''
Khóa học Full-Stack JavaScript toàn diện cho web developers:

## Backend Development:
- **Node.js**: Server-side JavaScript development
- **Express.js**: Web application framework
- **RESTful APIs**: Design và implementation
- **Authentication**: JWT, OAuth, Session management
- **Database**: MongoDB với Mongoose ODM

## Frontend Development:
- **React.js**: Component-based UI development
- **State Management**: Redux, Context API
- **Routing**: React Router
- **UI Libraries**: Material-UI, Bootstrap
- **Testing**: Jest, React Testing Library

## DevOps & Deployment:
- **Version Control**: Git workflows
- **Cloud Deployment**: Heroku, Netlify, AWS
- **CI/CD**: GitHub Actions
- **Monitoring**: Error tracking và performance

## Capstone Project:
Xây dựng hoàn chỉnh một Social Media Application với tất cả tính năng:
- User authentication và profiles
- Real-time messaging
- File upload và image processing
- News feed và notifications
- Mobile responsive design

Thời lượng: 60+ giờ với mentorship 1-on-1.
                '''.strip(),
                'category': 'Full-Stack Development',
                'price': Decimal('799.99'),
                'creator': teachers[1] if teachers.count() > 1 else teachers.first(),
                'published': True,
                'sections': [
                    {
                        'title': 'Backend Fundamentals',
                        'lessons': [
                            'Node.js Event Loop và Modules',
                            'Express.js Setup và Middleware',
                            'RESTful API Design Principles',
                            'MongoDB Database Design',
                            'Authentication và Authorization'
                        ]
                    },
                    {
                        'title': 'Advanced Backend',
                        'lessons': [
                            'Error Handling và Logging',
                            'File Upload và Image Processing',
                            'Real-time Communication với Socket.io',
                            'Performance Optimization',
                            'Security Best Practices'
                        ]
                    },
                    {
                        'title': 'Frontend Integration',
                        'lessons': [
                            'React API Integration',
                            'State Management Architecture',
                            'Real-time UI Updates',
                            'Form Validation và Error Handling',
                            'Responsive Design Implementation'
                        ]
                    }
                ]
            },
            {
                'title': 'DevOps and Cloud Computing',
                'subtitle': 'Master Docker, Kubernetes, AWS, and CI/CD',
                'description': '''
Khóa học DevOps toàn diện cho Software Engineers và System Administrators:

## Containerization:
- **Docker**: Container fundamentals, Dockerfile, Docker Compose
- **Kubernetes**: Orchestration, Deployments, Services, ConfigMaps
- **Container Security**: Best practices và security scanning

## Cloud Platforms:
- **AWS Services**: EC2, S3, RDS, Lambda, CloudWatch
- **Infrastructure as Code**: Terraform, CloudFormation
- **Serverless Architecture**: Lambda functions, API Gateway

## CI/CD Pipelines:
- **Git Workflows**: Branching strategies, Pull Requests
- **Jenkins/GitHub Actions**: Automated testing và deployment
- **Monitoring**: Prometheus, Grafana, ELK Stack

## Project Scenarios:
- Microservices architecture deployment
- Auto-scaling web applications
- Multi-environment setup (dev/staging/prod)
- Disaster recovery planning

Bao gồm hands-on labs với AWS credits được cung cấp.
                '''.strip(),
                'category': 'DevOps',
                'price': Decimal('899.99'),
                'creator': teachers[2] if teachers.count() > 2 else teachers.first(),
                'published': True,
                'sections': [
                    {
                        'title': 'Containerization with Docker',
                        'lessons': [
                            'Docker Fundamentals và Installation',
                            'Writing Efficient Dockerfiles',
                            'Docker Compose for Multi-container Apps',
                            'Container Networking và Volumes',
                            'Docker Security Best Practices'
                        ]
                    },
                    {
                        'title': 'Kubernetes Orchestration',
                        'lessons': [
                            'Kubernetes Architecture và Components',
                            'Pods, Deployments, và Services',
                            'ConfigMaps và Secrets Management',
                            'Ingress Controllers và Load Balancing',
                            'Monitoring và Troubleshooting'
                        ]
                    }
                ]
            },
            {
                'title': 'Mobile Game Development with Unity',
                'subtitle': 'Create engaging mobile games from concept to publish',
                'description': '''
Khóa học phát triển game mobile với Unity dành cho aspiring game developers:

## Game Development Fundamentals:
- **Unity Interface**: Scene, GameObject, Component system
- **C# Programming**: OOP concepts for game development  
- **Physics**: 2D/3D physics, collisions, rigidbodies
- **Animation**: Animator controller, timeline system

## Mobile Game Specifics:
- **Touch Controls**: Gesture recognition, virtual joysticks
- **Performance Optimization**: Mobile hardware constraints
- **Monetization**: Ads integration, in-app purchases
- **Platform Publishing**: Google Play Store, App Store

## Game Genres Covered:
- **Puzzle Games**: Match-3, physics puzzles
- **Action Games**: Platformers, endless runners
- **Strategy Games**: Tower defense, turn-based
- **Casual Games**: Hyper-casual mechanics

## Complete Game Projects:
1. **Flappy Bird Clone**: Basic mechanics và polish
2. **Tower Defense Game**: Strategy gameplay
3. **Match-3 Puzzle**: Advanced UI và progression
4. **Original Game Concept**: Your creative project

Bao gồm art assets, sound effects và complete game templates.
                '''.strip(),
                'category': 'Game Development',
                'price': Decimal('499.99'),
                'creator': teachers[0] if teachers.count() > 0 else teachers.first(),
                'published': False,  # Coming soon course
                'sections': [
                    {
                        'title': 'Unity Basics',
                        'lessons': [
                            'Unity Interface và Project Setup',
                            'GameObjects và Components',
                            'Scene Management và Hierarchy',
                            'Prefabs và Asset Management',
                            'Basic C# Scripting for Unity'
                        ]
                    }
                ]
            }
        ]
        
        for course_data in advanced_courses:
            sections_data = course_data.pop('sections')
            
            if course_data['published']:
                course_data['published_at'] = timezone.now().date() - timedelta(days=random.randint(1, 90))
            
            course = Course.objects.create(**course_data)
            
            # Create sections and lessons
            for position, section_data in enumerate(sections_data, 1):
                section = Section.objects.create(
                    title=section_data['title'],
                    position=position,
                    course=course
                )
                
                for lesson_position, lesson_title in enumerate(section_data['lessons'], 1):
                    Lesson.objects.create(
                        title=lesson_title,
                        content=self.generate_advanced_lesson_content(lesson_title, course.category),
                        position=lesson_position,
                        video_url=f"https://www.youtube.com/watch?v={self.generate_video_id()}",
                        section=section
                    )
                
                # Create advanced quiz
                quiz = Quiz.objects.create(
                    title=f'Advanced Quiz: {section_data["title"]}',
                    section=section,
                    position=len(section_data['lessons']) + 1
                )
                
                self.create_advanced_quiz_questions(quiz, section_data['title'], course.category)

    def generate_advanced_lesson_content(self, lesson_title, category):
        """Generate more detailed lesson content based on category"""
        
        if 'Machine Learning' in category:
            return f'''
# {lesson_title}

## Giới thiệu
{lesson_title} là một phần quan trọng trong Machine Learning hiện đại. Trong bài học này, chúng ta sẽ đi sâu vào chi tiết về lý thuyết và implementation.

## Lý thuyết nền tảng
### Mathematical Foundation
- Linear Algebra concepts được sử dụng
- Probability và Statistics applications
- Calculus trong optimization

### Algorithmic Approach
- Step-by-step algorithm breakdown
- Complexity analysis và performance metrics
- Comparison với alternative approaches

## Implementation Guide
```python
# Sample implementation
import tensorflow as tf
import numpy as np

# Your implementation code here
def advanced_model():
    # Model architecture
    model = tf.keras.Sequential([
        tf.keras.layers.Dense(128, activation='relu'),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(10, activation='softmax')
    ])
    return model
```

## Practical Applications
- Real-world use cases
- Industry examples
- Performance benchmarks

## Assignment
Implement {lesson_title} từ scratch và compare với existing libraries.

## Further Reading
- Research papers
- Documentation links
- Community discussions
            '''.strip()
            
        elif 'Full-Stack' in category:
            return f'''
# {lesson_title}

## Overview
{lesson_title} là cornerstone của modern web development. Chúng ta sẽ học both theory và hands-on implementation.

## Core Concepts
### Architecture Patterns
- MVC và component-based architecture
- Separation of concerns
- Scalability considerations

### Best Practices
- Code organization và structure
- Error handling strategies
- Security considerations

## Code Examples
```python
# {lesson_title} implementation
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def api_example(request):
    try:
        # Your logic here
        return JsonResponse({{'success': True, 'data': result}})
    except Exception as error:
        return JsonResponse({{'error': str(error)}}, status=500)
```

## Testing Strategy
- Unit tests với Jest
- Integration testing
- End-to-end testing với Cypress

## Deployment Considerations
- Environment configurations
- Performance optimizations
- Monitoring và logging

## Project Exercise
Build a feature implementing {lesson_title} concepts trong capstone project.
            '''.strip()
            
        else:  # Default content for other categories
            return f'''
# {lesson_title}

## Learning Objectives
Sau khi hoàn thành bài học này, bạn sẽ có thể:
- Hiểu rõ concepts của {lesson_title}
- Apply kiến thức vào practical scenarios
- Troubleshoot common issues
- Optimize performance và best practices

## Detailed Content
{lesson_title} plays a crucial role trong {category}. Chúng ta sẽ explore:

### Fundamentals
- Core principles và methodologies
- Industry standards và conventions
- Common patterns và anti-patterns

### Advanced Topics
- Performance optimization techniques
- Scalability considerations
- Integration với other technologies

### Hands-on Practice
- Step-by-step tutorials
- Real-world examples
- Troubleshooting exercises

## Resources
- Official documentation
- Community best practices
- Expert recommendations

## Assessment
- Quiz questions
- Practical assignments
- Project integration
            '''.strip()

    def generate_video_id(self):
        """Generate realistic video IDs"""
        chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-'
        return ''.join(random.choice(chars) for _ in range(11))

    def create_advanced_quiz_questions(self, quiz, section_title, category):
        """Create more sophisticated quiz questions"""
        
        questions_data = []
        
        if 'Machine Learning' in category:
            questions_data = [
                {
                    'text': 'Trong neural networks, vanishing gradient problem xảy ra khi nào?',
                    'choices': [
                        ('Khi learning rate quá cao', False),
                        ('Khi network quá shallow', False),
                        ('Khi gradients trở nên rất nhỏ trong deep networks', True),
                        ('Khi sử dụng ReLU activation', False)
                    ]
                },
                {
                    'text': 'Dropout technique được sử dụng để:',
                    'choices': [
                        ('Tăng tốc độ training', False),
                        ('Prevent overfitting', True),
                        ('Giảm memory usage', False),
                        ('Improve gradient flow', False)
                    ]
                },
                {
                    'text': 'Batch normalization có tác dụng gì?',
                    'choices': [
                        ('Normalize input data', False),
                        ('Stabilize training và allow higher learning rates', True),
                        ('Reduce số lượng parameters', False),
                        ('Prevent gradient explosion', False)
                    ]
                },
                {
                    'text': 'Transfer learning hiệu quả nhất khi:',
                    'choices': [
                        ('Source và target domains tương tự nhau', True),
                        ('Target dataset rất lớn', False),
                        ('Source model rất nhỏ', False),
                        ('Không có labeled data', False)
                    ]
                }
            ]
        elif 'Full-Stack' in category:
            questions_data = [
                {
                    'text': 'Trong RESTful API design, POST method được sử dụng để:',
                    'choices': [
                        ('Retrieve data', False),
                        ('Update existing resource', False),
                        ('Create new resource', True),
                        ('Delete resource', False)
                    ]
                },
                {
                    'text': 'JWT (JSON Web Token) có cấu trúc gồm mấy phần?',
                    'choices': [
                        ('2 phần: header và payload', False),
                        ('3 phần: header, payload, và signature', True),
                        ('4 phần: header, payload, signature, và timestamp', False),
                        ('1 phần: encrypted data', False)
                    ]
                },
                {
                    'text': 'Trong React, useEffect hook được sử dụng để:',
                    'choices': [
                        ('Manage component state', False),
                        ('Handle side effects và lifecycle events', True),
                        ('Create custom hooks', False),
                        ('Pass data between components', False)
                    ]
                },
                {
                    'text': 'CORS (Cross-Origin Resource Sharing) được implement ở đâu?',
                    'choices': [
                        ('Frontend only', False),
                        ('Backend server', True),
                        ('Database level', False),
                        ('Browser only', False)
                    ]
                }
            ]
        else:  # DevOps or other categories
            questions_data = [
                {
                    'text': 'Docker container khác virtual machine như thế nào?',
                    'choices': [
                        ('Container nặng hơn VM', False),
                        ('Container share OS kernel, VM có OS riêng', True),
                        ('Container chậm hơn VM', False),
                        ('Không có sự khác biệt', False)
                    ]
                },
                {
                    'text': 'Trong Kubernetes, Pod là:',
                    'choices': [
                        ('Một container', False),
                        ('Smallest deployable unit có thể chứa multiple containers', True),
                        ('Một node trong cluster', False),
                        ('Một service', False)
                    ]
                },
                {
                    'text': 'CI/CD pipeline có lợi ích gì?',
                    'choices': [
                        ('Tăng manual testing', False),
                        ('Automate build, test, và deployment processes', True),
                        ('Giảm code quality', False),
                        ('Increase deployment time', False)
                    ]
                }
            ]
        
        for position, question_data in enumerate(questions_data, 1):
            question = Question.objects.create(
                quiz=quiz,
                text=question_data['text'],
                position=position
            )
            
            for choice_text, is_correct in question_data['choices']:
                Choice.objects.create(
                    question=question,
                    text=choice_text,
                    is_correct=is_correct
                )

    def create_learning_paths(self):
        """Create realistic learning progression for students"""
        self.stdout.write('Creating learning paths...')
        
        students = User.objects.filter(profile__user_type='student')
        courses = Course.objects.filter(published=True)
        
        if not students.exists() or not courses.exists():
            return
        
        # Create learning journeys for each student
        for student in students:
            # Determine student's learning path based on interests
            learning_paths = {
                'web_developer': ['React', 'Full-Stack', 'DevOps'],
                'data_scientist': ['Python', 'Data Science', 'Machine Learning'],
                'mobile_developer': ['React', 'Flutter', 'Full-Stack'],
                'ai_enthusiast': ['Python', 'Data Science', 'Machine Learning'],
                'beginner': ['Python', 'React']
            }
            
            # Randomly assign a learning path
            path_type = random.choice(list(learning_paths.keys()))
            interested_topics = learning_paths[path_type]
            
            # Find courses matching the learning path
            relevant_courses = []
            for topic in interested_topics:
                matching_courses = courses.filter(title__icontains=topic)
                relevant_courses.extend(matching_courses)
            
            # Remove duplicates and limit to 3-4 courses
            relevant_courses = list(set(relevant_courses))[:4]
            
            # Enroll student with realistic progression
            for i, course in enumerate(relevant_courses):
                enrollment_date = timezone.now() - timedelta(days=90 - (i * 20))
                
                # Progress decreases for later enrolled courses (more realistic)
                if i == 0:  # First course - nearly completed
                    progress = random.uniform(80, 100)
                elif i == 1:  # Second course - mid progress
                    progress = random.uniform(40, 80)
                elif i == 2:  # Third course - early progress
                    progress = random.uniform(10, 50)
                else:  # Fourth course - just started
                    progress = random.uniform(0, 20)
                
                UserCourse.objects.get_or_create(
                    user=student,
                    course=course,
                    defaults={
                        'enrolled_at': enrollment_date,
                        'progress': progress
                    }
                )

    def create_performance_analytics(self):
        """Create realistic quiz performance data for analytics"""
        self.stdout.write('Creating performance analytics...')
        
        enrolled_courses = UserCourse.objects.all()
        
        for enrollment in enrolled_courses:
            user = enrollment.user
            course = enrollment.course
            
            # Get quizzes for this course
            quizzes = Quiz.objects.filter(section__course=course)
            
            # Student attempts quizzes based on course progress
            progress_threshold = enrollment.progress / 100
            available_quizzes = list(quizzes)
            
            # Number of quizzes attempted based on progress
            num_quizzes_to_attempt = int(len(available_quizzes) * progress_threshold)
            
            for i, quiz in enumerate(available_quizzes[:num_quizzes_to_attempt]):
                # Create multiple attempts to show improvement over time
                num_attempts = random.randint(1, 3)
                
                for attempt_num in range(num_attempts):
                    # Simulate learning improvement
                    base_performance = 0.5 + (progress_threshold * 0.3)  # 50-80% base
                    attempt_improvement = attempt_num * 0.1  # 10% improvement per attempt
                    quiz_difficulty = 0.9 - (i * 0.05)  # Later quizzes are harder
                    
                    final_performance = min(1.0, base_performance + attempt_improvement) * quiz_difficulty
                    
                    questions = quiz.questions.all()
                    total_questions = len(questions)
                    correct_answers = int(total_questions * final_performance)
                    score = (correct_answers / total_questions) * 10
                    
                    # Generate realistic answers
                    answers = {}
                    for q_idx, question in enumerate(questions):
                        if q_idx < correct_answers:
                            correct_choice = question.choices.filter(is_correct=True).first()
                            answers[question.id] = correct_choice.id if correct_choice else None
                        else:
                            wrong_choices = question.choices.filter(is_correct=False)
                            if wrong_choices.exists():
                                answers[question.id] = random.choice(wrong_choices).id
                    
                    # Create attempt with realistic timestamp
                    attempt_date = enrollment.enrolled_at + timedelta(
                        days=random.randint(1, 60),
                        hours=random.randint(0, 23)
                    )
                    
                    QuizAttempt.objects.create(
                        user=user,
                        quiz=quiz,
                        score=round(score, 2),
                        correct_count=correct_answers,
                        total_count=total_questions,
                        answers=answers,
                        submitted_at=attempt_date
                    )

    def create_course_interactions(self):
        """Create realistic course interaction data"""
        self.stdout.write('Creating course interactions...')
        
        # This would include reviews, ratings, comments, etc.
        # For now, we'll create some system configurations for course interactions
        admin_user = User.objects.filter(is_superuser=True).first()
        if not admin_user:
            return
        
        interaction_configs = [
            {
                'key': 'enable_course_reviews',
                'value': 'true',
                'description': 'Allow students to review and rate courses',
                'category': 'features',
                'is_public': True
            },
            {
                'key': 'min_progress_for_review',
                'value': '50',
                'description': 'Minimum course progress (%) required to leave a review',
                'category': 'features',
                'is_public': False
            },
            {
                'key': 'enable_discussion_forum',
                'value': 'true',
                'description': 'Enable course discussion forums',
                'category': 'features',
                'is_public': True
            }
        ]
        
        for config in interaction_configs:
            SystemConfiguration.objects.get_or_create(
                key=config['key'],
                defaults={
                    'value': config['value'],
                    'description': config['description'],
                    'category': config['category'],
                    'is_public': config['is_public'],
                    'updated_by': admin_user
                }
            )

    def create_admin_activities(self):
        """Create realistic admin activity logs"""
        self.stdout.write('Creating admin activities...')
        
        admin_users = User.objects.filter(is_superuser=True)
        teachers = User.objects.filter(profile__user_type='teacher')
        
        activities = [
            ('create', 'Created new course approval workflow'),
            ('update', 'Updated system configuration for file uploads'),
            ('user_role_change', 'Promoted user to teacher role'),
            ('create', 'Created new quiz question bank'),
            ('update', 'Updated course pricing structure'),
            ('delete', 'Removed inappropriate course content'),
            ('other', 'Performed system maintenance'),
            ('create', 'Added new course category'),
            ('update', 'Modified user permissions'),
            ('other', 'Generated analytics report')
        ]
        
        # Create 30 admin activity logs
        for _ in range(30):
            user = random.choice(list(admin_users) + list(teachers))
            action, description = random.choice(activities)
            
            # Create realistic timestamps
            timestamp = timezone.now() - timedelta(
                days=random.randint(0, 60),
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59)
            )
            
            AuditLog.objects.create(
                user=user,
                action=action,
                description=f"{description} by {user.get_full_name() or user.username}",
                timestamp=timestamp,
                ip_address=f"10.0.{random.randint(0, 255)}.{random.randint(1, 254)}",
                object_type='Course' if 'course' in description.lower() else 'System',
                object_id=random.randint(1, 100) if random.choice([True, False]) else None
            )
