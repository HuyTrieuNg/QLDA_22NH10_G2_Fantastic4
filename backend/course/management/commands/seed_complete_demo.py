from django.core.management.base import BaseCommand
from django.contrib.auth.models import User, Group, Permission
from django.utils import timezone
from django.contrib.contenttypes.models import ContentType
from decimal import Decimal
import random
from datetime import datetime, timedelta

from course.models import Course, Section, Lesson, Quiz, Question, Choice, UserCourse, QuizAttempt
from user.models import UserProfile
from admin_panel.models import SystemConfiguration, AuditLog


class Command(BaseCommand):
    help = 'Seed comprehensive demo data showcasing all Smart Learning features'

    def add_arguments(self, parser):
        parser.add_argument(
            '--full',
            action='store_true',
            help='Generate full dataset with all features'
        )
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Reset all data before seeding'
        )

    def handle(self, *args, **options):
        if options['reset']:
            self.reset_all_data()
        
        self.full_mode = options['full']
        
        self.stdout.write(self.style.SUCCESS('Starting comprehensive data seeding...'))
        
        # Create user groups and permissions
        self.create_user_groups()
        
        # Create comprehensive user base
        users = self.create_comprehensive_users()
        
        # Create featured courses
        courses = self.create_featured_courses(users)
        
        # Create learning scenarios
        self.create_learning_scenarios(users, courses)
        
        # Create admin features
        self.create_admin_features(users['admins'])
        
        # Create realistic interactions
        self.create_user_interactions(users, courses)
        
        # Generate reports data
        self.generate_reports_data()
        
        self.stdout.write(self.style.SUCCESS('Comprehensive data seeding completed!'))
        self.print_feature_showcase()

    def reset_all_data(self):
        """Reset all data for fresh start"""
        self.stdout.write('Resetting all data...')
        
        # Clear all data except superuser
        QuizAttempt.objects.all().delete()
        UserCourse.objects.all().delete()
        Choice.objects.all().delete()
        Question.objects.all().delete()
        Quiz.objects.all().delete()
        Lesson.objects.all().delete()
        Section.objects.all().delete()
        Course.objects.all().delete()
        AuditLog.objects.all().delete()
        SystemConfiguration.objects.all().delete()
        UserProfile.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()
        Group.objects.all().delete()

    def create_user_groups(self):
        """Create user groups with specific permissions"""
        self.stdout.write('Creating user groups and permissions...')
        
        # Create groups
        admin_group, _ = Group.objects.get_or_create(name='Administrators')
        teacher_group, _ = Group.objects.get_or_create(name='Teachers')
        student_group, _ = Group.objects.get_or_create(name='Students')
        moderator_group, _ = Group.objects.get_or_create(name='Moderators')
        
        # Get content types
        course_ct = ContentType.objects.get_for_model(Course)
        user_ct = ContentType.objects.get_for_model(User)
        
        # Assign permissions to groups
        # Administrators - all permissions
        admin_permissions = Permission.objects.all()
        admin_group.permissions.set(admin_permissions)
        
        # Teachers - course management permissions
        teacher_permissions = Permission.objects.filter(
            content_type__in=[course_ct],
            codename__in=['add_course', 'change_course', 'view_course']
        )
        teacher_group.permissions.set(teacher_permissions)
        
        # Students - view permissions only
        student_permissions = Permission.objects.filter(
            content_type=course_ct,
            codename='view_course'
        )
        student_group.permissions.set(student_permissions)

    def create_comprehensive_users(self):
        """Create comprehensive user base with different roles"""
        self.stdout.write('Creating comprehensive user base...')
        
        users = {
            'admins': [],
            'teachers': [],
            'students': [],
            'moderators': []
        }
        
        # Create admins
        admin_data = [
            {
                'username': 'admin_system',
                'email': 'admin@smartlearning.com',
                'first_name': 'System',
                'last_name': 'Administrator',
                'bio': 'Quản trị viên hệ thống chính',
                'is_superuser': True
            },
            {
                'username': 'admin_content',
                'email': 'content@smartlearning.com',
                'first_name': 'Content',
                'last_name': 'Manager',
                'bio': 'Quản lý nội dung và khóa học',
                'is_superuser': False
            }
        ]
        
        for data in admin_data:
            user = User.objects.create_user(
                username=data['username'],
                email=data['email'],
                password='admin123',
                first_name=data['first_name'],
                last_name=data['last_name'],
                is_staff=True,
                is_superuser=data['is_superuser']
            )
            UserProfile.objects.get_or_create(
                user=user,
                defaults={
                    'user_type': 'admin',
                    'bio': data['bio'],
                    'phone_number': f"090{random.randint(1000000, 9999999)}"
                }
            )
            
            # Add to admin group
            admin_group = Group.objects.get(name='Administrators')
            user.groups.add(admin_group)
            users['admins'].append(user)
        
        # Create teachers with specializations
        teacher_specializations = [
            {
                'username': 'prof_nguyen_ai',
                'first_name': 'Nguyễn',
                'last_name': 'Văn AI',
                'email': 'ai.expert@smartlearning.com',
                'specialization': 'Artificial Intelligence',
                'bio': 'Tiến sĩ Khoa học Máy tính, chuyên gia AI với 15 năm kinh nghiệm nghiên cứu và giảng dạy',
                'experience': 15
            },
            {
                'username': 'prof_tran_web',
                'first_name': 'Trần',
                'last_name': 'Thị Web',
                'email': 'web.dev@smartlearning.com',
                'specialization': 'Web Development',
                'bio': 'Full-stack developer với 10+ năm kinh nghiệm, từng làm việc tại các công ty công nghệ hàng đầu',
                'experience': 12
            },
            {
                'username': 'prof_le_mobile',
                'first_name': 'Lê',
                'last_name': 'Văn Mobile',
                'email': 'mobile.dev@smartlearning.com',
                'specialization': 'Mobile Development',
                'bio': 'Chuyên gia phát triển ứng dụng di động, có hơn 50 ứng dụng được xuất bản',
                'experience': 8
            },
            {
                'username': 'prof_pham_data',
                'first_name': 'Phạm',
                'last_name': 'Thị Data',
                'email': 'data.scientist@smartlearning.com',
                'specialization': 'Data Science',
                'bio': 'Data Scientist tại các tập đoàn lớn, chuyên gia về Machine Learning và Big Data',
                'experience': 10
            }
        ]
        
        for teacher_data in teacher_specializations:
            user = User.objects.create_user(
                username=teacher_data['username'],
                email=teacher_data['email'],
                password='teacher123',
                first_name=teacher_data['first_name'],
                last_name=teacher_data['last_name'],
                is_staff=True
            )
            UserProfile.objects.get_or_create(
                user=user,
                defaults={
                    'user_type': 'teacher',
                    'bio': teacher_data['bio'],
                    'phone_number': f"091{random.randint(1000000, 9999999)}"
                }
            )
            
            # Add to teacher group
            teacher_group = Group.objects.get(name='Teachers')
            user.groups.add(teacher_group)
            users['teachers'].append(user)
        
        # Create diverse student profiles
        student_profiles = self.generate_student_profiles()
        
        for profile in student_profiles:
            user = User.objects.create_user(
                username=profile['username'],
                email=profile['email'],
                password='student123',
                first_name=profile['first_name'],
                last_name=profile['last_name']
            )
            UserProfile.objects.get_or_create(
                user=user,
                defaults={
                    'user_type': 'student',
                    'bio': profile['bio'],
                    'phone_number': profile['phone'],
                    'date_of_birth': profile['birth_date']
                }
            )
            
            # Add to student group
            student_group = Group.objects.get(name='Students')
            user.groups.add(student_group)
            users['students'].append(user)
        
        return users

    def generate_student_profiles(self):
        """Generate diverse student profiles"""
        profiles = []
        
        # Student archetypes
        archetypes = [
            {
                'type': 'university_student',
                'age_range': (18, 23),
                'interests': ['Programming', 'Web Development', 'AI'],
                'learning_style': 'fast_learner',
                'engagement': 'high'
            },
            {
                'type': 'working_professional',
                'age_range': (25, 35),
                'interests': ['Data Science', 'Career Change', 'Upskilling'],
                'learning_style': 'structured_learner',
                'engagement': 'medium'
            },
            {
                'type': 'career_changer',
                'age_range': (30, 45),
                'interests': ['Programming', 'New Career', 'Technology'],
                'learning_style': 'methodical_learner',
                'engagement': 'high'
            },
            {
                'type': 'hobbyist',
                'age_range': (20, 60),
                'interests': ['Personal Projects', 'Learning for Fun'],
                'learning_style': 'casual_learner',
                'engagement': 'low'
            }
        ]
        
        vietnamese_names = [
            ('Nguyễn', 'Văn Anh'), ('Trần', 'Thị Bình'), ('Lê', 'Văn Cường'),
            ('Phạm', 'Thị Dung'), ('Hoàng', 'Văn Em'), ('Vũ', 'Thị Phượng'),
            ('Võ', 'Văn Giang'), ('Đặng', 'Thị Hương'), ('Bùi', 'Văn Khoa'),
            ('Đỗ', 'Thị Lan'), ('Ngô', 'Văn Minh'), ('Dương', 'Thị Nga'),
            ('Lý', 'Văn Phúc'), ('Mai', 'Thị Quỳnh'), ('Tôn', 'Văn Sang'),
            ('Châu', 'Thị Tâm'), ('Đinh', 'Văn Trung'), ('Hồ', 'Thị Uyên'),
            ('Kiều', 'Văn Vinh'), ('Phan', 'Thị Yến'), ('Huỳnh', 'Văn Tùng'),
            ('Cao', 'Thị Linh'), ('Lưu', 'Văn Đức'), ('Trương', 'Thị Mai'),
            ('Đào', 'Văn Bình'), ('Lê', 'Thị Hoa'), ('Nguyễn', 'Văn Long'),
            ('Trần', 'Thị Kim'), ('Phạm', 'Văn Sơn'), ('Hoàng', 'Thị Lan')
        ]
        
        for i in range(30 if self.full_mode else 15):
            archetype = random.choice(archetypes)
            last_name, first_name = random.choice(vietnamese_names)
            
            age = random.randint(*archetype['age_range'])
            birth_year = datetime.now().year - age
            
            username = f"student_{last_name.lower().replace(' ', '')}_{i+1}"
            email = f"{username}@{random.choice(['gmail.com', 'yahoo.com', 'student.edu.vn'])}"
            
            bio = self.generate_student_bio(archetype, age)
            
            profiles.append({
                'username': username,
                'email': email,
                'first_name': first_name,
                'last_name': last_name,
                'bio': bio,
                'phone': f"09{random.randint(10000000, 99999999)}",
                'birth_date': datetime(birth_year, random.randint(1, 12), random.randint(1, 28)),
                'archetype': archetype
            })
        
        return profiles

    def generate_student_bio(self, archetype, age):
        """Generate realistic student bio based on archetype"""
        bios = {
            'university_student': [
                f"Sinh viên năm {random.randint(1, 4)} ngành Công nghệ Thông tin, đam mê lập trình và công nghệ.",
                f"Học sinh {age} tuổi, yêu thích học hỏi về AI và Machine Learning.",
                f"Sinh viên Khoa học Máy tính, tích cực tham gia các dự án opensource."
            ],
            'working_professional': [
                f"Kỹ sư phần mềm {age} tuổi, muốn nâng cao kỹ năng trong lĩnh vực Data Science.",
                f"Chuyên viên IT đang làm việc tại công ty công nghệ, muốn chuyển sang AI.",
                f"Product Manager muốn hiểu sâu hơn về technical để làm việc hiệu quả với team dev."
            ],
            'career_changer': [
                f"Hiện đang làm việc trong lĩnh vực {random.choice(['tài chính', 'marketing', 'giáo dục'])}, muốn chuyển sang công nghệ.",
                f"Có background về {random.choice(['kinh tế', 'quản trị', 'kế toán'])}, đang học lập trình để đổi nghề.",
                f"{age} tuổi, quyết định học programming để bắt đầu sự nghiệp mới trong IT."
            ],
            'hobbyist': [
                f"Học lập trình như một sở thích, muốn tạo ra những ứng dụng thú vị.",
                f"Đam mê công nghệ và muốn hiểu cách hoạt động của các ứng dụng.",
                f"Học để phát triển kỹ năng cá nhân và có thể làm các side projects."
            ]
        }
        
        return random.choice(bios[archetype['type']])

    def create_featured_courses(self, users):
        """Create featured courses showcasing platform capabilities"""
        self.stdout.write('Creating featured courses...')
        
        teachers = users['teachers']
        
        featured_courses = [
            {
                'title': 'Complete Python Mastery: From Zero to Hero',
                'subtitle': 'Comprehensive Python course covering everything from basics to advanced topics',
                'description': '''
🐍 **Khóa học Python toàn diện nhất trên nền tảng!**

## Những gì bạn sẽ học được:
### Fundamentals (Cơ bản)
- ✅ Python syntax và programming concepts
- ✅ Data structures: Lists, Tuples, Dictionaries, Sets
- ✅ Control flow: Loops, Conditionals, Functions
- ✅ File handling và Exception handling

### Intermediate (Trung cấp)
- 🔥 Object-Oriented Programming (OOP)
- 🔥 Modules và Packages
- 🔥 Regular Expressions
- 🔥 Working với APIs và JSON

### Advanced (Nâng cao)
- 🚀 Web scraping với BeautifulSoup
- 🚀 Database operations với SQLite/PostgreSQL  
- 🚀 Web development với Flask/Django
- 🚀 Testing và Debugging

## Dự án thực tế:
1. **Personal Expense Tracker** - Ứng dụng quản lý chi tiêu
2. **Web Scraper Dashboard** - Thu thập và phân tích dữ liệu web
3. **RESTful API** - Xây dựng API hoàn chỉnh
4. **Automation Scripts** - Tự động hóa công việc hàng ngày

## Bonus Materials:
- 📚 200+ coding exercises
- 🎯 Real-world projects portfolio
- 📄 Certificate of completion
- 💬 Lifetime access to community
                '''.strip(),
                'category': 'Programming',
                'price': Decimal('299.99'),
                'creator': teachers[0],
                'published': True,
                'featured': True
            },
            {
                'title': 'Modern React Development with Hooks & Context',
                'subtitle': 'Build production-ready React applications with latest features',
                'description': '''
⚛️ **Master React.js với những techniques mới nhất!**

## Curriculum Overview:
### React Fundamentals
- ⭐ Components và JSX mastery
- ⭐ Props và State management
- ⭐ Event handling và Forms
- ⭐ Component lifecycle

### Modern React Features
- 🎯 React Hooks (useState, useEffect, useContext, useReducer)
- 🎯 Custom Hooks development
- 🎯 Context API for state management
- 🎯 React Router for navigation

### Advanced Patterns
- 💎 Higher-Order Components (HOC)
- 💎 Render Props pattern
- 💎 Compound Components
- 💎 Error Boundaries

### Performance & Optimization
- ⚡ React.memo và useMemo
- ⚡ Code splitting với lazy loading
- ⚡ Bundle optimization
- ⚡ Performance monitoring

## Major Projects:
1. **E-commerce Platform** - Full-featured online store
2. **Social Media Dashboard** - Real-time data visualization
3. **Task Management App** - Team collaboration tool
4. **Weather App** - API integration showcase

## Tools & Technologies:
- Create React App & Vite
- TypeScript integration
- Testing với Jest & React Testing Library
- Deployment với Netlify/Vercel
                '''.strip(),
                'category': 'Web Development',
                'price': Decimal('399.99'),
                'creator': teachers[1],
                'published': True,
                'featured': True
            },
            {
                'title': 'Data Science & Machine Learning Bootcamp',
                'subtitle': 'Complete data science pipeline from data collection to model deployment',
                'description': '''
📊 **Trở thành Data Scientist professional trong 12 tuần!**

## Learning Path:
### Data Foundation
- 📈 Statistics và Probability
- 📈 Python for Data Science (NumPy, Pandas)
- 📈 Data cleaning và preprocessing
- 📈 Exploratory Data Analysis (EDA)

### Visualization & Communication
- 📊 Matplotlib và Seaborn mastery
- 📊 Interactive charts với Plotly
- 📊 Dashboard creation với Streamlit
- 📊 Storytelling with data

### Machine Learning
- 🤖 Supervised Learning (Regression, Classification)
- 🤖 Unsupervised Learning (Clustering, PCA)
- 🤖 Model evaluation và selection
- 🤖 Feature engineering techniques

### Deep Learning
- 🧠 Neural Networks fundamentals
- 🧠 TensorFlow và Keras
- 🧠 CNN for image recognition
- 🧠 RNN for sequence data

### MLOps & Deployment
- 🚀 Model versioning với MLflow
- 🚀 API development với FastAPI
- 🚀 Docker containerization
- 🚀 Cloud deployment (AWS/GCP)

## Industry Projects:
1. **Customer Churn Prediction** - Business analytics
2. **Fraud Detection System** - Anomaly detection
3. **Recommendation Engine** - Collaborative filtering
4. **Image Classification App** - Computer vision

## Career Support:
- Portfolio development guidance
- Interview preparation
- Industry connections
- Job placement assistance
                '''.strip(),
                'category': 'Data Science',
                'price': Decimal('599.99'),
                'creator': teachers[3],
                'published': True,
                'featured': True
            }
        ]
        
        courses = []
        for course_data in featured_courses:
            course = Course.objects.create(**course_data)
            courses.append(course)
            
            # Create comprehensive content for each course
            self.create_comprehensive_course_content(course)
        
        return courses

    def create_comprehensive_course_content(self, course):
        """Create comprehensive content for a course"""
        
        if 'Python' in course.title:
            sections_data = [
                {
                    'title': 'Python Foundations',
                    'lessons': [
                        'Python Installation and Setup',
                        'Understanding Python Syntax',
                        'Variables and Data Types',
                        'Input and Output Operations',
                        'Your First Python Program'
                    ]
                },
                {
                    'title': 'Control Structures',
                    'lessons': [
                        'Conditional Statements (if/elif/else)',
                        'For Loops and Iterations',
                        'While Loops and Break/Continue',
                        'Nested Loops and Logic',
                        'Practice: Building a Number Guessing Game'
                    ]
                },
                {
                    'title': 'Data Structures',
                    'lessons': [
                        'Lists: Creation and Manipulation',
                        'Tuples and Their Use Cases',
                        'Dictionaries for Key-Value Storage',
                        'Sets and Set Operations',
                        'Choosing the Right Data Structure'
                    ]
                },
                {
                    'title': 'Functions and Modules',
                    'lessons': [
                        'Function Definition and Calling',
                        'Parameters, Arguments, and Return Values',
                        'Scope and Global Variables',
                        'Lambda Functions and Built-ins',
                        'Creating and Importing Modules'
                    ]
                }
            ]
        elif 'React' in course.title:
            sections_data = [
                {
                    'title': 'React Fundamentals',
                    'lessons': [
                        'What is React and Why Use It?',
                        'Setting Up Development Environment',
                        'JSX Syntax and Components',
                        'Props and Component Communication',
                        'State Management Basics'
                    ]
                },
                {
                    'title': 'Modern React with Hooks',
                    'lessons': [
                        'Introduction to React Hooks',
                        'useState for State Management',
                        'useEffect for Side Effects',
                        'useContext for Global State',
                        'Custom Hooks Development'
                    ]
                },
                {
                    'title': 'Advanced React Patterns',
                    'lessons': [
                        'Component Composition Patterns',
                        'Higher-Order Components (HOC)',
                        'Render Props Pattern',
                        'Error Boundaries Implementation',
                        'Performance Optimization Techniques'
                    ]
                }
            ]
        else:  # Data Science course
            sections_data = [
                {
                    'title': 'Data Science Fundamentals',
                    'lessons': [
                        'Introduction to Data Science',
                        'Python for Data Science Setup',
                        'NumPy for Numerical Computing',
                        'Pandas for Data Manipulation',
                        'Jupyter Notebooks Mastery'
                    ]
                },
                {
                    'title': 'Data Visualization',
                    'lessons': [
                        'Matplotlib Fundamentals',
                        'Seaborn for Statistical Plots',
                        'Interactive Plots with Plotly',
                        'Dashboard Creation',
                        'Best Practices in Data Visualization'
                    ]
                },
                {
                    'title': 'Machine Learning Basics',
                    'lessons': [
                        'Introduction to Machine Learning',
                        'Supervised vs Unsupervised Learning',
                        'Linear and Logistic Regression',
                        'Decision Trees and Random Forest',
                        'Model Evaluation Metrics'
                    ]
                }
            ]
        
        for position, section_data in enumerate(sections_data, 1):
            section = Section.objects.create(
                title=section_data['title'],
                position=position,
                course=course
            )
            
            for lesson_position, lesson_title in enumerate(section_data['lessons'], 1):
                content = self.generate_detailed_lesson_content(lesson_title, course.category)
                
                Lesson.objects.create(
                    title=lesson_title,
                    content=content,
                    position=lesson_position,
                    video_url=f"https://www.youtube.com/watch?v={self.generate_video_id()}",
                    section=section
                )
            
            # Create comprehensive quiz
            quiz = Quiz.objects.create(
                title=f'Mastery Quiz: {section_data["title"]}',
                section=section,
                position=len(section_data['lessons']) + 1
            )
            
            self.create_comprehensive_quiz_questions(quiz, section_data['title'], course.category)

    def generate_detailed_lesson_content(self, lesson_title, category):
        """Generate detailed lesson content"""
        return f'''
# {lesson_title}

## 🎯 Learning Objectives
Sau khi hoàn thành bài học này, bạn sẽ có thể:
- Hiểu rõ concepts của {lesson_title}
- Áp dụng kiến thức vào các tình huống thực tế
- Troubleshoot các vấn đề thường gặp
- Implement best practices trong {category}

## 📚 Theoretical Foundation
### Core Concepts
{lesson_title} là một phần quan trọng trong {category}. Chúng ta sẽ tìm hiểu:

- **Definition**: Định nghĩa và ý nghĩa
- **Applications**: Các ứng dụng thực tế
- **Best Practices**: Những practices được khuyến nghị
- **Common Pitfalls**: Những lỗi thường gặp cần tránh

### Industry Standards
- Các tiêu chuẩn công nghiệp hiện tại
- Framework và tools phổ biến
- Performance benchmarks
- Security considerations

## 💻 Hands-on Examples
### Basic Implementation
```python
# Example code for {lesson_title}
def demonstrate_concept():
    # Implementation details
    result = perform_operation()
    return result

# Practical usage
example_result = demonstrate_concept()
print(f"Result: {{example_result}}")
```

### Advanced Usage
```python
# Advanced implementation
class AdvancedExample:
    def __init__(self):
        self.config = self.load_configuration()
    
    def advanced_method(self):
        # Complex logic implementation
        return self.process_data()
```

## 🔍 Deep Dive
### Performance Considerations
- Time complexity analysis
- Space complexity analysis
- Optimization techniques
- Scalability factors

### Real-world Applications
- Industry use cases
- Case studies
- Success stories
- Lessons learned

## 🧪 Practice Exercises
### Exercise 1: Basic Implementation
Implement the basic concepts covered in this lesson.

### Exercise 2: Real-world Scenario
Apply the knowledge to solve a real-world problem.

### Exercise 3: Optimization Challenge
Optimize the solution for better performance.

## 📖 Additional Resources
- Official documentation links
- Community tutorials
- Expert articles
- Video supplements

## ✅ Knowledge Check
- Key concepts summary
- Important formulas/patterns
- Common interview questions
- Practical tips

## 🚀 Next Steps
Preparation for the next lesson and ongoing learning path.
        '''.strip()

    def generate_video_id(self):
        """Generate realistic YouTube video ID"""
        chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-'
        return ''.join(random.choice(chars) for _ in range(11))

    def create_comprehensive_quiz_questions(self, quiz, section_title, category):
        """Create comprehensive quiz questions"""
        # Will implement detailed quiz questions based on section and category
        questions_data = [
            {
                'text': f'Trong {section_title}, khái niệm quan trọng nhất là gì?',
                'choices': [
                    ('Syntax và cú pháp', False),
                    ('Hiểu rõ principles và best practices', True),
                    ('Ghi nhớ documentation', False),
                    ('Sử dụng tools', False)
                ]
            },
            {
                'text': f'Khi implement {section_title}, điều cần ưu tiên đầu tiên là:',
                'choices': [
                    ('Performance optimization', False),
                    ('Code readability và maintainability', True),
                    ('Using latest technology', False),
                    ('Minimizing code length', False)
                ]
            },
            {
                'text': f'Best practice cho {section_title} bao gồm:',
                'choices': [
                    ('Following naming conventions', False),
                    ('Writing comprehensive tests', False),
                    ('Documentation và comments', False),
                    ('Tất cả các đáp án trên', True)
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

    def create_learning_scenarios(self, users, courses):
        """Create realistic learning scenarios"""
        self.stdout.write('Creating learning scenarios...')
        
        students = users['students']
        
        # Scenario 1: High-performing students
        high_performers = students[:5]
        for student in high_performers:
            for course in courses:
                enrollment_date = timezone.now() - timedelta(days=random.randint(30, 90))
                UserCourse.objects.create(
                    user=student,
                    course=course,
                    enrolled_at=enrollment_date,
                    progress=random.uniform(70, 100)
                )
        
        # Scenario 2: Struggling students
        struggling_students = students[5:10]
        for student in struggling_students:
            selected_course = random.choice(courses)
            enrollment_date = timezone.now() - timedelta(days=random.randint(15, 60))
            UserCourse.objects.create(
                user=student,
                course=selected_course,
                enrolled_at=enrollment_date,
                progress=random.uniform(10, 40)
            )
        
        # Scenario 3: Regular learners
        regular_learners = students[10:]
        for student in regular_learners:
            num_courses = random.randint(1, 2)
            selected_courses = random.sample(courses, min(num_courses, len(courses)))
            
            for course in selected_courses:
                enrollment_date = timezone.now() - timedelta(days=random.randint(7, 45))
                UserCourse.objects.create(
                    user=student,
                    course=course,
                    enrolled_at=enrollment_date,
                    progress=random.uniform(25, 80)
                )

    def create_admin_features(self, admins):
        """Create admin features and configurations"""
        self.stdout.write('Creating admin features...')
        
        admin_user = admins[0]
        
        # System configurations
        admin_configs = [
            {
                'key': 'platform_name',
                'value': 'Smart Learning Platform',
                'description': 'Tên chính thức của nền tảng',
                'category': 'branding',
                'is_public': True
            },
            {
                'key': 'max_enrollment_per_course',
                'value': '1000',
                'description': 'Số lượng học viên tối đa cho mỗi khóa học',
                'category': 'limits',
                'is_public': False
            },
            {
                'key': 'course_review_required',
                'value': 'true',
                'description': 'Yêu cầu review khóa học trước khi publish',
                'category': 'moderation',
                'is_public': False
            },
            {
                'key': 'auto_certificate_generation',
                'value': 'true',
                'description': 'Tự động tạo certificate khi hoàn thành khóa học',
                'category': 'features',
                'is_public': True
            },
            {
                'key': 'discussion_moderation',
                'value': 'enabled',
                'description': 'Bật tính năng kiểm duyệt thảo luận',
                'category': 'moderation',
                'is_public': False
            }
        ]
        
        for config in admin_configs:
            SystemConfiguration.objects.create(
                updated_by=admin_user,
                **config
            )

    def create_user_interactions(self, users, courses):
        """Create realistic user interactions"""
        self.stdout.write('Creating user interactions...')
        
        # Create quiz attempts with realistic patterns
        enrollments = UserCourse.objects.all()
        
        for enrollment in enrollments:
            user = enrollment.user
            course = enrollment.course
            quizzes = Quiz.objects.filter(section__course=course)
            
            # Determine how many quizzes to attempt based on progress
            progress_ratio = enrollment.progress / 100
            num_quizzes_to_attempt = int(len(quizzes) * progress_ratio)
            
            for quiz in quizzes[:num_quizzes_to_attempt]:
                # Create 1-3 attempts per quiz
                num_attempts = random.randint(1, 3)
                
                for attempt in range(num_attempts):
                    questions = quiz.questions.all()
                    total_questions = len(questions)
                    
                    # Score improves with attempts
                    base_score = 0.5 + (progress_ratio * 0.3)
                    attempt_bonus = attempt * 0.1
                    final_score = min(1.0, base_score + attempt_bonus)
                    
                    correct_count = int(total_questions * final_score)
                    score = (correct_count / total_questions) * 10
                    
                    # Generate answers
                    answers = {}
                    for i, question in enumerate(questions):
                        if i < correct_count:
                            correct_choice = question.choices.filter(is_correct=True).first()
                            answers[question.id] = correct_choice.id if correct_choice else None
                        else:
                            wrong_choices = question.choices.filter(is_correct=False)
                            if wrong_choices.exists():
                                answers[question.id] = random.choice(wrong_choices).id
                    
                    QuizAttempt.objects.create(
                        user=user,
                        quiz=quiz,
                        score=round(score, 2),
                        correct_count=correct_count,
                        total_count=total_questions,
                        answers=answers,
                        submitted_at=enrollment.enrolled_at + timedelta(
                            days=random.randint(1, 30),
                            hours=random.randint(0, 23)
                        )
                    )

    def generate_reports_data(self):
        """Generate data for reports and analytics"""
        self.stdout.write('Generating reports data...')
        
        # Create various audit logs for reporting
        admin_users = User.objects.filter(is_superuser=True)
        
        report_activities = [
            'Generated monthly enrollment report',
            'Exported student performance data',
            'Created course completion analytics',
            'Generated revenue report',
            'Analyzed user engagement metrics',
            'Created teacher performance summary',
            'Generated system usage statistics'
        ]
        
        for _ in range(20):
            admin_user = random.choice(admin_users)
            activity = random.choice(report_activities)
            
            AuditLog.objects.create(
                user=admin_user,
                action='other',
                description=activity,
                timestamp=timezone.now() - timedelta(
                    days=random.randint(1, 30),
                    hours=random.randint(0, 23)
                ),
                object_type='Report',
                ip_address=f"10.0.1.{random.randint(1, 254)}"
            )

    def print_feature_showcase(self):
        """Print feature showcase summary"""
        self.stdout.write('\n' + '='*70)
        self.stdout.write(self.style.SUCCESS('🚀 SMART LEARNING PLATFORM - FEATURE SHOWCASE'))
        self.stdout.write('='*70)
        
        # User statistics
        total_users = User.objects.count()
        admins = User.objects.filter(profile__user_type='admin').count()
        teachers = User.objects.filter(profile__user_type='teacher').count()
        students = User.objects.filter(profile__user_type='student').count()
        
        self.stdout.write(f'👥 USERS: {total_users} total')
        self.stdout.write(f'   • {admins} Administrators')
        self.stdout.write(f'   • {teachers} Teachers')
        self.stdout.write(f'   • {students} Students')
        
        # Course statistics
        total_courses = Course.objects.count()
        published_courses = Course.objects.filter(published=True).count()
        
        self.stdout.write(f'\n📚 COURSES: {total_courses} total ({published_courses} published)')
        
        # Content statistics
        total_sections = Section.objects.count()
        total_lessons = Lesson.objects.count()
        total_quizzes = Quiz.objects.count()
        total_questions = Question.objects.count()
        
        self.stdout.write(f'📖 CONTENT:')
        self.stdout.write(f'   • {total_sections} Sections')
        self.stdout.write(f'   • {total_lessons} Lessons')
        self.stdout.write(f'   • {total_quizzes} Quizzes')
        self.stdout.write(f'   • {total_questions} Questions')
        
        # Engagement statistics
        total_enrollments = UserCourse.objects.count()
        completed_courses = UserCourse.objects.filter(progress=100).count()
        total_attempts = QuizAttempt.objects.count()
        
        completion_rate = (completed_courses / total_enrollments * 100) if total_enrollments > 0 else 0
        
        self.stdout.write(f'\n📊 ENGAGEMENT:')
        self.stdout.write(f'   • {total_enrollments} Course Enrollments')
        self.stdout.write(f'   • {completed_courses} Completed Courses ({completion_rate:.1f}%)')
        self.stdout.write(f'   • {total_attempts} Quiz Attempts')
        
        # System features
        total_configs = SystemConfiguration.objects.count()
        total_audit_logs = AuditLog.objects.count()
        
        self.stdout.write(f'\n⚙️  SYSTEM:')
        self.stdout.write(f'   • {total_configs} Configuration Settings')
        self.stdout.write(f'   • {total_audit_logs} Audit Log Entries')
        
        # Login credentials
        self.stdout.write('\n' + '='*70)
        self.stdout.write(self.style.SUCCESS('🔐 LOGIN CREDENTIALS'))
        self.stdout.write('='*70)
        self.stdout.write('🔧 Admin: admin_system / admin123')
        self.stdout.write('👨‍🏫 Teachers: prof_nguyen_ai, prof_tran_web, prof_le_mobile, prof_pham_data / teacher123')
        self.stdout.write('👨‍🎓 Students: student_nguyen_1, student_tran_2, etc. / student123')
        
        self.stdout.write('\n' + '='*70)
        self.stdout.write(self.style.SUCCESS('✨ FEATURES DEMONSTRATED:'))
        self.stdout.write('='*70)
        self.stdout.write('• 🎯 Multi-role user management (Admin, Teacher, Student)')
        self.stdout.write('• 📚 Comprehensive course creation and management')
        self.stdout.write('• 🧪 Interactive quizzes with multiple attempts')
        self.stdout.write('• 📈 Student progress tracking and analytics')
        self.stdout.write('• 🔍 System audit logging and monitoring')
        self.stdout.write('• ⚙️  Configurable system settings')
        self.stdout.write('• 👥 User groups and permissions')
        self.stdout.write('• 📊 Rich educational content with videos')
        self.stdout.write('• 🏆 Learning path progression tracking')
        self.stdout.write('• 💼 Teacher performance metrics')
        self.stdout.write('='*70)
