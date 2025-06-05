from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.files.base import ContentFile
from decimal import Decimal
import random
from datetime import datetime, timedelta

from course.models import Course, Section, Lesson, Quiz, Question, Choice, UserCourse, QuizAttempt
from user.models import UserProfile
from admin_panel.models import SystemConfiguration, AuditLog


class Command(BaseCommand):
    help = 'Seed database with demo data for Smart Learning platform'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting data seeding...'))
        
        # Clear existing data
        self.clear_data()
        
        # Create users and profiles
        users = self.create_users()
        
        # Create system configurations
        self.create_system_configs(users['admin'])
        
        # Create courses with content
        courses = self.create_courses(users)
        
        # Enroll students in courses
        self.enroll_students(users, courses)
        
        # Create quiz attempts
        self.create_quiz_attempts(users, courses)
          # Create audit logs
        self.create_audit_logs(users)
        
        self.stdout.write(self.style.SUCCESS('Data seeding completed successfully!'))
        self.print_summary()
    
    def clear_data(self):
        """Clear existing data"""
        self.stdout.write('Clearing existing data...')
        
        # Clear course-related data first
        QuizAttempt.objects.all().delete()
        UserCourse.objects.all().delete()
        Choice.objects.all().delete()
        Question.objects.all().delete()
        Quiz.objects.all().delete()
        Lesson.objects.all().delete()
        Section.objects.all().delete()
        Course.objects.all().delete()
        
        # Clear admin data
        AuditLog.objects.all().delete()
        SystemConfiguration.objects.all().delete()
        
        # Clear demo users and their profiles carefully
        demo_usernames = [
            'admin', 'teacher_john', 'teacher_mary', 'teacher_david',
            'student_alice', 'student_bob', 'student_charlie', 
            'student_diana', 'student_eve'
        ]
        
        # Delete UserProfiles first for demo users
        demo_users = User.objects.filter(username__in=demo_usernames)
        UserProfile.objects.filter(user__in=demo_users).delete()
        
        # Then delete the demo users
        demo_users.delete()
        
        self.stdout.write('Data cleared successfully.')

    def create_users(self):
        """Create demo users with different roles"""
        self.stdout.write('Creating users...')
        
        users = {}
          # Admin user
        admin_user = User.objects.create_user(
            username='admin',
            email='admin@smartlearning.com',
            password='admin123',
            first_name='Nguyễn',
            last_name='Quản Trị',
            is_staff=True,
            is_superuser=True        )
        # Update profile created by signal with correct user_type and data
        admin_profile = admin_user.profile
        admin_profile.user_type = 'admin'
        admin_profile.phone_number = '0901234567'
        admin_profile.bio = 'Quản trị viên hệ thống Smart Learning'
        admin_profile.save()
        users['admin'] = admin_user
        
        # Teachers
        teachers_data = [
            {
                'username': 'teacher_john',
                'email': 'john@smartlearning.com',
                'first_name': 'John',
                'last_name': 'Smith',
                'bio': 'Giảng viên Khoa học Máy tính với 10 năm kinh nghiệm giảng dạy',
                'phone': '0912345678'
            },
            {
                'username': 'teacher_mary',
                'email': 'mary@smartlearning.com',
                'first_name': 'Mary',
                'last_name': 'Johnson',
                'bio': 'Chuyên gia thiết kế web và UX/UI với hơn 8 năm kinh nghiệm',
                'phone': '0923456789'
            },
            {
                'username': 'teacher_david',
                'email': 'david@smartlearning.com',
                'first_name': 'David',
                'last_name': 'Wilson',
                'bio': 'Kỹ sư phần mềm và chuyên gia về Data Science',
                'phone': '0934567890'
            }
        ]
        teachers = []
        for teacher_data in teachers_data:
            user = User.objects.create_user(
                username=teacher_data['username'],
                email=teacher_data['email'],
                password='teacher123',
                first_name=teacher_data['first_name'],
                last_name=teacher_data['last_name']            )
            # Update profile created by signal with correct user_type and data
            teacher_profile = user.profile
            teacher_profile.user_type = 'teacher'
            teacher_profile.bio = teacher_data['bio']
            teacher_profile.phone_number = teacher_data['phone']
            teacher_profile.date_of_birth = datetime(1980 + random.randint(0, 15), random.randint(1, 12), random.randint(1, 28))
            teacher_profile.save()
            teachers.append(user)
        
        users['teachers'] = teachers
        
        # Students
        students_data = [
            {
                'username': 'student_alice',
                'email': 'alice@student.com',
                'first_name': 'Alice',
                'last_name': 'Nguyễn',
                'bio': 'Sinh viên năm 3 khoa Công nghệ Thông tin',
                'phone': '0945678901'
            },
            {
                'username': 'student_bob',
                'email': 'bob@student.com',
                'first_name': 'Bob',
                'last_name': 'Trần',
                'bio': 'Sinh viên năm 2 khoa Khoa học Máy tính',
                'phone': '0956789012'
            },
            {
                'username': 'student_charlie',
                'email': 'charlie@student.com',
                'first_name': 'Charlie',
                'last_name': 'Lê',
                'bio': 'Học viên tự học lập trình web',
                'phone': '0967890123'
            },
            {
                'username': 'student_diana',
                'email': 'diana@student.com',
                'first_name': 'Diana',
                'last_name': 'Phạm',
                'bio': 'Designer muốn học thêm về lập trình',
                'phone': '0978901234'
            },
            {
                'username': 'student_eve',
                'email': 'eve@student.com',
                'first_name': 'Eve',
                'last_name': 'Hoàng',
                'bio': 'Sinh viên thực tập muốn nâng cao kỹ năng',
                'phone': '0989012345'
            }
        ]
        students = []
        for student_data in students_data:
            user = User.objects.create_user(
                username=student_data['username'],
                email=student_data['email'],
                password='student123',
                first_name=student_data['first_name'],
                last_name=student_data['last_name']            )
            # Update profile created by signal with correct data (user_type is already 'student')
            student_profile = user.profile
            student_profile.bio = student_data['bio']
            student_profile.phone_number = student_data['phone']
            student_profile.date_of_birth = datetime(1995 + random.randint(0, 10), random.randint(1, 12), random.randint(1, 28))
            student_profile.save()
            students.append(user)
        
        users['students'] = students
        
        return users

    def create_system_configs(self, admin_user):
        """Create system configuration entries"""
        self.stdout.write('Creating system configurations...')
        
        configs = [
            {
                'key': 'site_name',
                'value': 'Smart Learning Platform',
                'description': 'Tên của nền tảng học tập',
                'category': 'general',
                'is_public': True
            },
            {
                'key': 'max_file_upload_size',
                'value': '100',
                'description': 'Kích thước file tối đa có thể tải lên (MB)',
                'category': 'uploads',
                'is_public': False
            },
            {
                'key': 'course_approval_required',
                'value': 'true',
                'description': 'Khóa học cần được duyệt trước khi công bố',
                'category': 'courses',
                'is_public': False
            },
            {
                'key': 'default_course_price',
                'value': '99000',
                'description': 'Giá khóa học mặc định (VND)',
                'category': 'pricing',
                'is_public': False
            },
            {
                'key': 'quiz_time_limit',
                'value': '30',
                'description': 'Thời gian làm bài quiz mặc định (phút)',
                'category': 'quizzes',
                'is_public': True
            }
        ]
        
        for config_data in configs:
            SystemConfiguration.objects.create(
                updated_by=admin_user,
                **config_data
            )

    def create_courses(self, users):
        """Create demo courses with sections, lessons, and quizzes"""
        self.stdout.write('Creating courses...')
        
        courses_data = [
            {
                'title': 'Python Programming Fundamentals',
                'subtitle': 'Learn Python from scratch to advanced level',
                'description': '''
Khóa học Python toàn diện dành cho người mới bắt đầu. Bạn sẽ học được:
- Cú pháp cơ bản của Python
- Cấu trúc dữ liệu và thuật toán
- Lập trình hướng đối tượng
- Xử lý file và database
- Web development với Django

Khóa học bao gồm nhiều bài tập thực hành và dự án thực tế.
                '''.strip(),
                'category': 'Programming',
                'price': Decimal('199.99'),
                'creator': users['teachers'][0],
                'published': True
            },
            {
                'title': 'Web Development with React',
                'subtitle': 'Build modern web applications with React.js',
                'description': '''
Khóa học phát triển web với React.js dành cho các developer muốn xây dựng ứng dụng web hiện đại:
- JavaScript ES6+ fundamentals
- React components và hooks
- State management với Redux
- API integration
- Deployment và optimization

Bao gồm các dự án thực tế như todo app, e-commerce, và social media app.
                '''.strip(),
                'category': 'Web Development',
                'price': Decimal('299.99'),
                'creator': users['teachers'][1],
                'published': True
            },
            {
                'title': 'Data Science with Python',
                'subtitle': 'Complete data science course from beginner to advanced',
                'description': '''
Khóa học Data Science toàn diện với Python:
- Pandas và NumPy cho data manipulation
- Matplotlib và Seaborn cho data visualization
- Machine Learning với Scikit-learn
- Deep Learning cơ bản với TensorFlow
- Statistical analysis và hypothesis testing

Bao gồm nhiều case study thực tế từ các ngành khác nhau.
                '''.strip(),
                'category': 'Data Science',
                'price': Decimal('399.99'),
                'creator': users['teachers'][2],
                'published': True
            },
            {
                'title': 'Mobile App Development with Flutter',
                'subtitle': 'Build cross-platform mobile apps',
                'description': '''
Học phát triển ứng dụng mobile đa nền tảng với Flutter:
- Dart programming language
- Flutter widgets và layouts
- State management
- API integration và database
- Publishing to app stores

Xây dựng các ứng dụng thực tế như weather app, chat app, và e-commerce app.
                '''.strip(),
                'category': 'Mobile Development',
                'price': Decimal('249.99'),
                'creator': users['teachers'][0],
                'published': False  # Unpublished course for demo
            }
        ]
        
        courses = []
        for course_data in courses_data:
            # Set published date if course is published
            if course_data['published']:
                course_data['published_at'] = timezone.now().date() - timedelta(days=random.randint(1, 30))
            
            course = Course.objects.create(**course_data)
            courses.append(course)
            
            # Create sections for each course
            self.create_sections_for_course(course)
        
        return courses

    def create_sections_for_course(self, course):
        """Create sections, lessons, and quizzes for a course"""
        
        if 'Python' in course.title:
            sections_data = [
                {
                    'title': 'Introduction to Python',
                    'lessons': [
                        'What is Python?',
                        'Installing Python and IDE Setup',
                        'Your First Python Program',
                        'Python Syntax and Indentation'
                    ]
                },
                {
                    'title': 'Variables and Data Types',
                    'lessons': [
                        'Numbers and Strings',
                        'Lists and Tuples',
                        'Dictionaries and Sets',
                        'Type Conversion'
                    ]
                },
                {
                    'title': 'Control Structures',
                    'lessons': [
                        'Conditional Statements',
                        'Loops: for and while',
                        'Break and Continue',
                        'Exception Handling'
                    ]
                },
                {
                    'title': 'Functions and Modules',
                    'lessons': [
                        'Defining Functions',
                        'Function Parameters and Arguments',
                        'Lambda Functions',
                        'Modules and Packages'
                    ]
                }
            ]
        elif 'React' in course.title:
            sections_data = [
                {
                    'title': 'JavaScript Fundamentals',
                    'lessons': [
                        'ES6+ Features',
                        'Async/Await and Promises',
                        'Array Methods',
                        'Object Destructuring'
                    ]
                },
                {
                    'title': 'React Basics',
                    'lessons': [
                        'Components and JSX',
                        'Props and State',
                        'Event Handling',
                        'Conditional Rendering'
                    ]
                },
                {
                    'title': 'Advanced React',
                    'lessons': [
                        'React Hooks',
                        'Context API',
                        'Custom Hooks',
                        'Performance Optimization'
                    ]
                },
                {
                    'title': 'State Management',
                    'lessons': [
                        'Introduction to Redux',
                        'Actions and Reducers',
                        'Redux Toolkit',
                        'Async Actions with Thunk'
                    ]
                }
            ]
        elif 'Data Science' in course.title:
            sections_data = [
                {
                    'title': 'Data Analysis Fundamentals',
                    'lessons': [
                        'Introduction to Pandas',
                        'Data Cleaning and Preprocessing',
                        'Exploratory Data Analysis',
                        'Data Visualization with Matplotlib'
                    ]
                },
                {
                    'title': 'Statistical Analysis',
                    'lessons': [
                        'Descriptive Statistics',
                        'Hypothesis Testing',
                        'Correlation and Regression',
                        'ANOVA and Chi-square Tests'
                    ]
                },
                {
                    'title': 'Machine Learning',
                    'lessons': [
                        'Supervised Learning Algorithms',
                        'Unsupervised Learning',
                        'Model Evaluation and Selection',
                        'Feature Engineering'
                    ]
                }
            ]
        else:  # Flutter course
            sections_data = [
                {
                    'title': 'Flutter Basics',
                    'lessons': [
                        'Introduction to Flutter and Dart',
                        'Setting up Development Environment',
                        'Understanding Widgets',
                        'Building Your First App'
                    ]
                },
                {
                    'title': 'UI Development',
                    'lessons': [
                        'Layout Widgets',
                        'Material Design Components',
                        'Navigation and Routing',
                        'Animations and Gestures'
                    ]
                }
            ]
        
        for position, section_data in enumerate(sections_data, 1):
            section = Section.objects.create(
                title=section_data['title'],
                position=position,
                course=course
            )
            
            # Create lessons for each section
            for lesson_position, lesson_title in enumerate(section_data['lessons'], 1):
                lesson_content = self.generate_lesson_content(lesson_title)
                video_url = self.generate_video_url(lesson_title)
                
                Lesson.objects.create(
                    title=lesson_title,
                    content=lesson_content,
                    position=lesson_position,
                    video_url=video_url,
                    section=section
                )
            
            # Create a quiz for each section
            quiz = Quiz.objects.create(
                title=f'Quiz: {section_data["title"]}',
                section=section,
                position=len(section_data['lessons']) + 1
            )
            
            # Create questions for the quiz
            self.create_quiz_questions(quiz, section_data['title'])

    def generate_lesson_content(self, lesson_title):
        """Generate realistic lesson content"""
        contents = {
            'What is Python?': '''
Python là một ngôn ngữ lập trình bậc cao, được phát triển bởi Guido van Rossum và ra mắt lần đầu vào năm 1991. Python được thiết kế với triết lý "code dễ đọc và dễ hiểu".

## Đặc điểm của Python:
- **Syntax đơn giản**: Python có cú pháp rất gần với ngôn ngữ tự nhiên
- **Interpreted Language**: Python được thực thi trực tiếp mà không cần biên dịch
- **Cross-platform**: Chạy được trên Windows, macOS, Linux
- **Open Source**: Miễn phí và có cộng đồng phát triển mạnh mẽ

## Ứng dụng của Python:
- Web Development (Django, Flask)
- Data Science và Machine Learning
- Automation và Scripting
- Desktop Applications
- Game Development

Trong bài học này, chúng ta sẽ tìm hiểu tại sao Python lại phổ biến đến vậy và bắt đầu hành trình học lập trình Python.
            ''',
            'ES6+ Features': '''
ES6 (ECMAScript 2015) đã mang đến nhiều tính năng mới quan trọng cho JavaScript. Đây là những tính năng bạn cần biết để làm việc hiệu quả với React.

## Arrow Functions
```javascript
// Traditional function
function add(a, b) {
    return a + b;
}

// Arrow function
const add = (a, b) => a + b;
```

## Template Literals
```javascript
const name = 'John';
const message = `Hello, ${name}!`;
```

## Destructuring
```javascript
// Array destructuring
const [first, second] = [1, 2, 3];

// Object destructuring
const {name, age} = {name: 'John', age: 30};
```

## Spread Operator
```javascript
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5];
```

Những tính năng này sẽ được sử dụng thường xuyên trong React development.
            ''',
            'Introduction to Pandas': '''
Pandas là thư viện Python mạnh mẽ nhất cho việc phân tích và thao tác dữ liệu. Được xây dựng trên NumPy, Pandas cung cấp cấu trúc dữ liệu linh hoạt và công cụ phân tích dữ liệu.

## Cấu trúc dữ liệu chính:

### Series
Series là mảng một chiều có thể chứa bất kỳ kiểu dữ liệu nào:
```python
import pandas as pd

# Tạo Series
s = pd.Series([1, 3, 5, 6, 8])
print(s)
```

### DataFrame
DataFrame là cấu trúc dữ liệu hai chiều, giống như bảng trong Excel:
```python
# Tạo DataFrame
data = {
    'Name': ['Alice', 'Bob', 'Charlie'],
    'Age': [25, 30, 35],
    'City': ['New York', 'London', 'Tokyo']
}
df = pd.DataFrame(data)
print(df)
```

## Tại sao sử dụng Pandas?
- Xử lý dữ liệu thiếu (missing data)
- Đọc/ghi nhiều định dạng file (CSV, Excel, JSON, SQL)
- Thao tác dữ liệu linh hoạt
- Tích hợp tốt với các thư viện khác

Trong các bài tiếp theo, chúng ta sẽ học cách sử dụng Pandas để làm sạch, phân tích và xử lý dữ liệu.
            '''
        }
        
        # Return specific content if available, otherwise generate generic content
        if lesson_title in contents:
            return contents[lesson_title]
        else:
            return f'''
# {lesson_title}

Đây là nội dung bài học về {lesson_title}. Trong bài học này, bạn sẽ học được:

## Mục tiêu bài học:
- Hiểu rõ về khái niệm {lesson_title}
- Nắm được các nguyên tắc cơ bản
- Thực hành với các ví dụ cụ thể
- Áp dụng kiến thức vào bài tập thực tế

## Nội dung chính:
{lesson_title} là một chủ đề quan trọng trong khóa học này. Chúng ta sẽ đi sâu vào từng khía cạnh và cung cấp nhiều ví dụ thực tế để bạn có thể hiểu và áp dụng ngay.

## Bài tập thực hành:
Sau khi hoàn thành bài học này, hãy thử làm các bài tập được giao để củng cố kiến thức.

## Tài liệu tham khảo:
- Documentation chính thức
- Các ví dụ và case studies
- Community discussions và best practices
            '''.strip()

    def generate_video_url(self, lesson_title):
        """Generate sample video URLs"""
        video_ids = [
            'dQw4w9WgXcQ', 'J---aiyznGQ', 'kJQP7kiw5Fk', 'fJ9rUzIMcZQ',
            'QB7ACr7pUuE', 'rTHlyTphWP0', 'y6120QOlsfU', 'kxPCFljwJws'
        ]
        return f"https://www.youtube.com/watch?v={random.choice(video_ids)}"

    def create_quiz_questions(self, quiz, section_title):
        """Create questions for a quiz"""
        
        if 'Python' in section_title:
            questions_data = [
                {
                    'text': 'Python được phát triển bởi ai?',
                    'choices': [
                        ('Guido van Rossum', True),
                        ('Linus Torvalds', False),
                        ('Dennis Ritchie', False),
                        ('James Gosling', False)
                    ]
                },
                {
                    'text': 'Đặc điểm nào sau đây KHÔNG phải của Python?',
                    'choices': [
                        ('Syntax đơn giản', False),
                        ('Cần biên dịch trước khi chạy', True),
                        ('Cross-platform', False),
                        ('Open Source', False)
                    ]
                },
                {
                    'text': 'Python có thể được sử dụng cho mục đích nào?',
                    'choices': [
                        ('Web Development', False),
                        ('Data Science', False),
                        ('Machine Learning', False),
                        ('Tất cả các đáp án trên', True)
                    ]
                }
            ]
        elif 'JavaScript' in section_title or 'React' in section_title:
            questions_data = [
                {
                    'text': 'ES6 được ra mắt vào năm nào?',
                    'choices': [
                        ('2014', False),
                        ('2015', True),
                        ('2016', False),
                        ('2017', False)
                    ]
                },
                {
                    'text': 'Arrow function có đặc điểm gì khác biệt?',
                    'choices': [
                        ('Syntax ngắn gọn hơn', False),
                        ('Không có this binding riêng', False),
                        ('Không thể sử dụng làm constructor', False),
                        ('Tất cả các đáp án trên', True)
                    ]
                },
                {
                    'text': 'Template literals sử dụng ký tự nào?',
                    'choices': [
                        ('Dấu nháy đơn (\'))', False),
                        ('Dấu nháy kép (")', False),
                        ('Dấu backtick (`)', True),
                        ('Dấu ngoặc vuông ([])', False)
                    ]
                }
            ]
        elif 'Data' in section_title:
            questions_data = [
                {
                    'text': 'Pandas được xây dựng trên thư viện nào?',
                    'choices': [
                        ('Matplotlib', False),
                        ('NumPy', True),
                        ('SciPy', False),
                        ('Scikit-learn', False)
                    ]
                },
                {
                    'text': 'Cấu trúc dữ liệu nào trong Pandas là mảng một chiều?',
                    'choices': [
                        ('DataFrame', False),
                        ('Series', True),
                        ('Panel', False),
                        ('Index', False)
                    ]
                },
                {
                    'text': 'DataFrame có thể đọc từ định dạng file nào?',
                    'choices': [
                        ('CSV', False),
                        ('Excel', False),
                        ('JSON', False),
                        ('Tất cả các định dạng trên', True)
                    ]
                }
            ]
        else:  # Flutter or other topics
            questions_data = [
                {
                    'text': 'Flutter được phát triển bởi công ty nào?',
                    'choices': [
                        ('Facebook', False),
                        ('Google', True),
                        ('Microsoft', False),
                        ('Apple', False)
                    ]
                },
                {
                    'text': 'Ngôn ngữ lập trình chính của Flutter là gì?',
                    'choices': [
                        ('Java', False),
                        ('Kotlin', False),
                        ('Dart', True),
                        ('Swift', False)
                    ]
                },
                {
                    'text': 'Flutter có thể tạo ứng dụng cho nền tảng nào?',
                    'choices': [
                        ('iOS và Android', False),
                        ('Web', False),
                        ('Desktop', False),
                        ('Tất cả các nền tảng trên', True)
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

    def enroll_students(self, users, courses):
        """Enroll students in various courses"""
        self.stdout.write('Enrolling students in courses...')
        
        students = users['students']
        
        # Enroll students randomly in courses with different progress levels
        for student in students:
            # Each student enrolls in 2-3 courses
            enrolled_courses = random.sample(courses[:3], random.randint(2, 3))  # Only published courses
            
            for course in enrolled_courses:
                # Random enrollment date in the past
                enrolled_at = timezone.now() - timedelta(days=random.randint(1, 60))
                
                # Random progress (0-100%)
                progress = random.uniform(0, 100)
                
                UserCourse.objects.create(
                    user=student,
                    course=course,
                    enrolled_at=enrolled_at,
                    progress=progress
                )

    def create_quiz_attempts(self, users, courses):
        """Create quiz attempts for students"""
        self.stdout.write('Creating quiz attempts...')
        
        students = users['students']
        
        for student in students:
            # Get courses this student is enrolled in
            enrolled_courses = Course.objects.filter(
                usercourse__user=student
            )
            
            for course in enrolled_courses:
                # Get quizzes from this course
                quizzes = Quiz.objects.filter(section__course=course)
                
                # Student attempts some quizzes (not all)
                attempted_quizzes = random.sample(
                    list(quizzes), 
                    min(len(quizzes), random.randint(1, len(quizzes)))
                )
                
                for quiz in attempted_quizzes:
                    # Number of attempts for this quiz (1-3)
                    num_attempts = random.randint(1, 3)
                    
                    for attempt_num in range(num_attempts):
                        questions = quiz.questions.all()
                        total_count = len(questions)
                        
                        # Generate realistic scores (students usually improve over time)
                        base_score = random.uniform(0.4, 0.9)  # 40-90% base
                        improvement = attempt_num * 0.1  # 10% improvement per attempt
                        final_score = min(1.0, base_score + improvement)
                        
                        correct_count = int(total_count * final_score)
                        score = (correct_count / total_count) * 10  # Score out of 10
                        
                        # Generate answers
                        answers = {}
                        questions_list = list(questions)
                        random.shuffle(questions_list)
                        
                        for i, question in enumerate(questions_list):
                            choices = list(question.choices.all())
                            if i < correct_count:
                                # Select correct answer
                                correct_choice = next(c for c in choices if c.is_correct)
                                answers[question.id] = correct_choice.id
                            else:
                                # Select random wrong answer
                                wrong_choices = [c for c in choices if not c.is_correct]
                                if wrong_choices:
                                    answers[question.id] = random.choice(wrong_choices).id
                        
                        # Random submission time
                        submitted_at = timezone.now() - timedelta(
                            days=random.randint(1, 30),
                            hours=random.randint(0, 23),
                            minutes=random.randint(0, 59)
                        )
                        
                        QuizAttempt.objects.create(
                            user=student,
                            quiz=quiz,
                            score=round(score, 2),
                            correct_count=correct_count,
                            total_count=total_count,
                            answers=answers,
                            submitted_at=submitted_at
                        )

    def create_audit_logs(self, users):
        """Create audit log entries"""
        self.stdout.write('Creating audit logs...')
        
        all_users = [users['admin']] + users['teachers'] + users['students']
        
        actions = [
            ('login', 'User logged in'),
            ('logout', 'User logged out'),
            ('create', 'Created new course'),
            ('update', 'Updated course content'),
            ('delete', 'Deleted quiz question'),
            ('user_role_change', 'Changed user role'),
            ('other', 'Accessed admin panel')
        ]
        
        # Create 50 audit log entries
        for _ in range(50):
            user = random.choice(all_users)
            action, description = random.choice(actions)
            
            # Generate timestamp in the past
            timestamp = timezone.now() - timedelta(
                days=random.randint(0, 30),
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59)
            )
            
            AuditLog.objects.create(
                user=user,
                action=action,
                description=f"{description} - {user.username}",
                timestamp=timestamp,
                ip_address=f"192.168.1.{random.randint(1, 254)}"
            )

    def print_summary(self):
        """Print summary of created data"""
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.SUCCESS('DATA SEEDING SUMMARY'))
        self.stdout.write('='*50)
        
        self.stdout.write(f'Users created: {User.objects.count()}')
        self.stdout.write(f'- Admins: {UserProfile.objects.filter(user_type="admin").count()}')
        self.stdout.write(f'- Teachers: {UserProfile.objects.filter(user_type="teacher").count()}')
        self.stdout.write(f'- Students: {UserProfile.objects.filter(user_type="student").count()}')
        
        self.stdout.write(f'\nCourses created: {Course.objects.count()}')
        self.stdout.write(f'- Published: {Course.objects.filter(published=True).count()}')
        self.stdout.write(f'- Unpublished: {Course.objects.filter(published=False).count()}')
        
        self.stdout.write(f'\nCourse content:')
        self.stdout.write(f'- Sections: {Section.objects.count()}')
        self.stdout.write(f'- Lessons: {Lesson.objects.count()}')
        self.stdout.write(f'- Quizzes: {Quiz.objects.count()}')
        self.stdout.write(f'- Questions: {Question.objects.count()}')
        self.stdout.write(f'- Choices: {Choice.objects.count()}')
        
        self.stdout.write(f'\nStudent activities:')
        self.stdout.write(f'- Course enrollments: {UserCourse.objects.count()}')
        self.stdout.write(f'- Quiz attempts: {QuizAttempt.objects.count()}')
        
        self.stdout.write(f'\nSystem data:')
        self.stdout.write(f'- System configurations: {SystemConfiguration.objects.count()}')
        self.stdout.write(f'- Audit logs: {AuditLog.objects.count()}')
        
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.SUCCESS('LOGIN CREDENTIALS'))
        self.stdout.write('='*50)
        self.stdout.write('Admin: admin / admin123')
        self.stdout.write('Teachers: teacher_john, teacher_mary, teacher_david / teacher123')
        self.stdout.write('Students: student_alice, student_bob, student_charlie, student_diana, student_eve / student123')
        self.stdout.write('='*50)
