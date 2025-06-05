from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from course.models import Course, Section, Lesson, Quiz, Question, Choice, UserCourse, QuizAttempt
from user.models.user_profile import UserProfile
from admin_panel.models import SystemConfiguration, AuditLog
from django.utils import timezone
from decimal import Decimal
import random
from datetime import datetime, timedelta
from random import randint, uniform, choice, sample

class Command(BaseCommand):
    help = 'Seed database with realistic course and user data'

    def handle(self, *args, **options):
        self.stdout.write('Starting to seed database...')
        
        # Clear existing data
        self.clear_existing_data()
        
        # Create admin user
        self.create_admin_user()
        
        # Create teachers
        teachers = self.create_teachers()
        
        # Create students
        students = self.create_students()
        
        # Create courses
        courses = self.create_courses(teachers)
        
        # Enroll students in courses
        self.enroll_students_in_courses(students, courses)
        
        # Create quiz attempts
        self.create_quiz_attempts(students, courses)
        
        # Create system configurations
        self.create_system_configurations()
        
        # Create audit logs
        self.create_audit_logs()
        
        self.stdout.write(self.style.SUCCESS('Successfully seeded database!'))

    def clear_existing_data(self):
        self.stdout.write('Clearing existing data...')
        QuizAttempt.objects.all().delete()
        UserCourse.objects.all().delete()
        Question.objects.all().delete()
        Quiz.objects.all().delete()
        Lesson.objects.all().delete()
        Section.objects.all().delete()
        Course.objects.all().delete()
        UserProfile.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()
        SystemConfiguration.objects.all().delete()
        AuditLog.objects.all().delete()

    def create_admin_user(self):
        self.stdout.write('Creating admin user...')
        admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@smartlearning.com',
            password='admin123',
            first_name='Administrator',
            last_name='System'
        )
        UserProfile.objects.create(
            user=admin_user,
            user_type='admin',
            phone_number='+84901234567',
            date_of_birth=timezone.now().date() - timedelta(days=365 * 30),
            bio='System Administrator'
        )
        return admin_user

    def create_teachers(self):
        self.stdout.write('Creating teachers...')
        teachers_data = [
            {
                'username': 'nguyenvana',
                'email': 'nguyenvana@smartlearning.com',
                'first_name': 'Nguyễn',
                'last_name': 'Văn An',
                'phone': '0987654321',
                'bio': 'Giảng viên Khoa học Máy tính, 10 năm kinh nghiệm giảng dạy lập trình.'
            },
            {
                'username': 'tranthib',
                'email': 'tranthib@smartlearning.com',
                'first_name': 'Trần',
                'last_name': 'Thị Bình',
                'phone': '0987654322',
                'bio': 'Thạc sĩ Ngôn ngữ Anh, chuyên gia về phương pháp giảng dạy tiếng Anh giao tiếp.'
            },
            {
                'username': 'lequocc',
                'email': 'lequocc@smartlearning.com',
                'first_name': 'Lê',
                'last_name': 'Quốc Cường',
                'phone': '0987654323',
                'bio': 'Tiến sĩ Toán học, chuyên về đại số và giải tích, 15 năm kinh nghiệm.'
            },
            {
                'username': 'phamthid',
                'email': 'phamthid@smartlearning.com',
                'first_name': 'Phạm',
                'last_name': 'Thị Diệu',
                'phone': '0987654324',
                'bio': 'Thạc sĩ Marketing, 8 năm kinh nghiệm trong lĩnh vực marketing số và truyền thông.'
            },
            {
                'username': 'hoangvane',
                'email': 'hoangvane@smartlearning.com',
                'first_name': 'Hoàng',
                'last_name': 'Văn Em',
                'phone': '0987654325',
                'bio': 'Cử nhân Thiết kế đồ họa, 7 năm kinh nghiệm thiết kế UI/UX và branding.'
            }
        ]
        teachers = []
        for data in teachers_data:
            user = User.objects.create_user(
                username=data['username'],
                email=data['email'],
                password='teacher123',
                first_name=data['first_name'],
                last_name=data['last_name']
            )
            UserProfile.objects.create(
                user=user,
                user_type='teacher',
                phone_number=data['phone'],
                date_of_birth=timezone.now().date() - timedelta(days=365 * randint(28, 45)),
                bio=data['bio']
            )
            teachers.append(user)
        return teachers

    def create_students(self):
        self.stdout.write('Creating students...')
        students_data = [
            {'username': 'nguyenthihuong', 'email': 'huongnt@smartlearning.com', 'first_name': 'Nguyễn', 'last_name': 'Thị Hương', 'phone': '0912345671'},
            {'username': 'phamquanghuy', 'email': 'huyphq@smartlearning.com', 'first_name': 'Phạm', 'last_name': 'Quang Huy', 'phone': '0912345672'},
            {'username': 'tranminhchau', 'email': 'chautm@smartlearning.com', 'first_name': 'Trần', 'last_name': 'Minh Châu', 'phone': '0912345673'},
            {'username': 'lethanhdat', 'email': 'datlt@smartlearning.com', 'first_name': 'Lê', 'last_name': 'Thanh Đạt', 'phone': '0912345674'},
            {'username': 'doanthithao', 'email': 'thaodt@smartlearning.com', 'first_name': 'Doãn', 'last_name': 'Thị Thảo', 'phone': '0912345675'},
            {'username': 'nguyenvanphuc', 'email': 'phucnv@smartlearning.com', 'first_name': 'Nguyễn', 'last_name': 'Văn Phúc', 'phone': '0912345676'},
            {'username': 'phamthimai', 'email': 'maipt@smartlearning.com', 'first_name': 'Phạm', 'last_name': 'Thị Mai', 'phone': '0912345677'},
            {'username': 'buitrungkien', 'email': 'kienbt@smartlearning.com', 'first_name': 'Bùi', 'last_name': 'Trung Kiên', 'phone': '0912345678'},
            {'username': 'ngothanhson', 'email': 'sonnt@smartlearning.com', 'first_name': 'Ngô', 'last_name': 'Thanh Sơn', 'phone': '0912345679'},
            {'username': 'dinhthithu', 'email': 'thudt@smartlearning.com', 'first_name': 'Đinh', 'last_name': 'Thị Thu', 'phone': '0912345680'},
            {'username': 'votuananh', 'email': 'anhvt@smartlearning.com', 'first_name': 'Võ', 'last_name': 'Tuấn Anh', 'phone': '0912345681'},
            {'username': 'nguyenthithao', 'email': 'thaontt@smartlearning.com', 'first_name': 'Nguyễn', 'last_name': 'Thị Thảo', 'phone': '0912345682'},
            {'username': 'phamminhduc', 'email': 'ducpm@smartlearning.com', 'first_name': 'Phạm', 'last_name': 'Minh Đức', 'phone': '0912345683'},
            {'username': 'tranthanhha', 'email': 'hatt@smartlearning.com', 'first_name': 'Trần', 'last_name': 'Thanh Hà', 'phone': '0912345684'},
            {'username': 'lethithu', 'email': 'thult@smartlearning.com', 'first_name': 'Lê', 'last_name': 'Thị Thu', 'phone': '0912345685'},
            {'username': 'nguyenvanlong', 'email': 'longnv@smartlearning.com', 'first_name': 'Nguyễn', 'last_name': 'Văn Long', 'phone': '0912345686'},
            {'username': 'phamthanhson', 'email': 'sonpt@smartlearning.com', 'first_name': 'Phạm', 'last_name': 'Thanh Sơn', 'phone': '0912345687'},
            {'username': 'buiquanghieu', 'email': 'hieubq@smartlearning.com', 'first_name': 'Bùi', 'last_name': 'Quang Hiếu', 'phone': '0912345688'},
            {'username': 'ngothithao', 'email': 'thaont@smartlearning.com', 'first_name': 'Ngô', 'last_name': 'Thị Thảo', 'phone': '0912345689'},
            {'username': 'dinhtuananh', 'email': 'anhdt@smartlearning.com', 'first_name': 'Đinh', 'last_name': 'Tuấn Anh', 'phone': '0912345690'}
        ]
        students = []
        for data in students_data:
            user = User.objects.create_user(
                username=data['username'],
                email=data['email'],
                password='student123',
                first_name=data['first_name'],
                last_name=data['last_name']
            )
            UserProfile.objects.create(
                user=user,
                user_type='student',
                phone_number=data['phone'],
                date_of_birth=timezone.now().date() - timedelta(days=365 * randint(18, 25)),
                bio='Học viên Smart Learning'
            )
            students.append(user)
        return students

    def create_courses(self, teachers):
        self.stdout.write('Creating courses...')
        # 15 courses, 3 per teacher, each in allowed categories
        allowed_categories = [
            'Lập trình', 'Ngoại ngữ', 'Toán học', 'Vật lý', 'Hóa học', 'Sinh học',
            'Ngữ văn', 'Lịch sử', 'Địa lý', 'Marketing', 'Thiết kế', 'Phát triển bản thân'
        ]
        all_courses_data = self.get_courses_data()
        courses = []
        course_idx = 0
        for i, teacher in enumerate(teachers):
            for j in range(3):
                course_data = all_courses_data[course_idx % len(all_courses_data)]
                course = Course.objects.create(
                    title=course_data['title'] + f' ({teacher.last_name})',
                    subtitle=course_data.get('subtitle', ''),
                    description=course_data['description'],
                    creator=teacher,
                    category=course_data['category'],
                    price=Decimal(course_data['price']),
                    published=True,
                    published_at=timezone.now() - timedelta(days=randint(1, 90))
                )
                # Sections, Lessons, Quizzes
                for section_data in course_data.get('sections', []):
                    section = Section.objects.create(
                        title=section_data['title'],
                        position=section_data['position'],
                        course=course
                    )
                    for lesson_data in section_data.get('lessons', []):
                        Lesson.objects.create(
                            title=lesson_data['title'],
                            content=lesson_data['content'],
                            position=lesson_data['position'],
                            video_url=lesson_data.get('video_url', ''),
                            section=section
                        )
                    if 'quiz' in section_data:
                        quiz_data = section_data['quiz']
                        quiz = Quiz.objects.create(
                            title=quiz_data['title'],
                            section=section,
                            position=99
                        )
                        for q in quiz_data['questions']:
                            question = Question.objects.create(
                                quiz=quiz,
                                text=q['text'],
                                position=q['position']
                            )
                            for c in q['choices']:
                                Choice.objects.create(
                                    question=question,
                                    text=c['text'],
                                    is_correct=c['is_correct']
                                )
                courses.append(course)
                course_idx += 1
        return courses

    def enroll_students_in_courses(self, students, courses):
        self.stdout.write('Enrolling students in courses...')
        for student in students:
            enrolled_courses = sample(courses, 10)
            for course in enrolled_courses:
                enrolled_at = timezone.now() - timedelta(days=randint(1, 90))
                UserCourse.objects.create(
                    user=student,
                    course=course,
                    enrolled_at=enrolled_at,
                    progress=uniform(0, 100)
                )

    def create_quiz_attempts(self, students, courses):
        self.stdout.write('Creating quiz attempts for students...')
        for student in students:
            user_courses = UserCourse.objects.filter(user=student)
            # Mỗi học sinh làm 3 bài kiểm tra ở 3 khóa học khác nhau
            for uc in sample(list(user_courses), min(3, len(user_courses))):
                quizzes = Quiz.objects.filter(section__course=uc.course)
                if quizzes.exists():
                    quiz = quizzes.order_by('?').first()
                    questions = list(quiz.questions.all())
                    answers = {}
                    correct_count = 0
                    for q in questions:
                        choices = list(q.choices.all())
                        selected = choice(choices)
                        answers[str(q.id)] = selected.id
                        if selected.is_correct:
                            correct_count += 1
                    QuizAttempt.objects.create(
                        user=student,
                        quiz=quiz,
                        score=round(10 * correct_count / max(1, len(questions)), 2),
                        correct_count=correct_count,
                        total_count=len(questions),
                        answers=answers
                    )

    def create_system_configurations(self):
        self.stdout.write('Creating system configurations...')
        SystemConfiguration.objects.create(
            key='site_name',
            value='Smart Learning',
            description='Tên hệ thống',
            category='general',
            is_public=True
        )
        SystemConfiguration.objects.create(
            key='max_upload_size',
            value='10485760',
            description='Dung lượng upload tối đa (bytes)',
            category='upload',
            is_public=False
        )

    def create_audit_logs(self):
        self.stdout.write('Creating audit logs...')
        admin = User.objects.filter(is_superuser=True).first()
        AuditLog.objects.create(
            user=admin,
            action='create',
            object_type='SystemConfiguration',
            description='Khởi tạo cấu hình hệ thống',
            ip_address='127.0.0.1'
        )
        AuditLog.objects.create(
            user=admin,
            action='create',
            object_type='Course',
            description='Khởi tạo dữ liệu khóa học mẫu',
            ip_address='127.0.0.1'
        )

    def get_courses_data(self):
        """Return expanded course data: mỗi khóa học nhiều section, lesson, quiz, mỗi quiz nhiều câu hỏi"""
        return [
            # Lập trình
            {
                'title': 'Python Cơ Bản Đến Nâng Cao',
                'subtitle': 'Học Python từ zero đến hero với các project thực tế',
                'description': 'Khóa học Python toàn diện từ cơ bản đến nâng cao. Bao gồm cú pháp, OOP, xử lý file, web scraping, và các thư viện phổ biến.',
                'category': 'Lập trình',
                'price': '299.99',
                'sections': [
                    {
                        'title': 'Python Cơ Bản',
                        'position': 1,
                        'lessons': [
                            {
                                'title': 'Giới thiệu Python',
                                'content': 'Python là ngôn ngữ lập trình dễ học, mạnh mẽ.',
                                'position': 1,
                                'video_url': 'https://www.youtube.com/watch?v=YYXdXT2l-Gg'
                            },
                            {
                                'title': 'Biến và kiểu dữ liệu',
                                'content': 'Học về int, float, string, boolean, list, tuple, dictionary.',
                                'position': 2,
                                'video_url': 'https://www.youtube.com/watch?v=gCCVsvgR2KU'
                            }
                        ],
                        'quiz': {
                            'title': 'Quiz Python cơ bản',
                            'questions': [
                                {
                                    'text': 'Cách nào đúng để in "Hello World" trong Python?',
                                    'position': 1,
                                    'choices': [
                                        {'text': 'print("Hello World")', 'is_correct': True},
                                        {'text': 'echo "Hello World"', 'is_correct': False},
                                        {'text': 'console.log("Hello World")', 'is_correct': False},
                                        {'text': 'printf("Hello World")', 'is_correct': False}
                                    ]
                                },
                                {
                                    'text': 'Kiểu dữ liệu nào là immutable?',
                                    'position': 2,
                                    'choices': [
                                        {'text': 'tuple', 'is_correct': True},
                                        {'text': 'list', 'is_correct': False},
                                        {'text': 'dict', 'is_correct': False},
                                        {'text': 'set', 'is_correct': False}
                                    ]
                                }
                            ]
                        }
                    },
                    {
                        'title': 'Lập trình hướng đối tượng',
                        'position': 2,
                        'lessons': [
                            {
                                'title': 'Class và Object',
                                'content': 'Khái niệm class, object, thuộc tính, phương thức.',
                                'position': 1,
                                'video_url': 'https://www.youtube.com/watch?v=apACNr7DC_s'
                            },
                            {
                                'title': 'Kế thừa và đa hình',
                                'content': 'Tính kế thừa, đa hình trong Python.',
                                'position': 2,
                                'video_url': 'https://www.youtube.com/watch?v=RSl87lqOXDE'
                            }
                        ],
                        'quiz': {
                            'title': 'Quiz OOP Python',
                            'questions': [
                                {
                                    'text': 'Từ khóa nào để định nghĩa class trong Python?',
                                    'position': 1,
                                    'choices': [
                                        {'text': 'class', 'is_correct': True},
                                        {'text': 'object', 'is_correct': False},
                                        {'text': 'def', 'is_correct': False},
                                        {'text': 'struct', 'is_correct': False}
                                    ]
                                },
                                {
                                    'text': 'Tính chất nào KHÔNG thuộc OOP?',
                                    'position': 2,
                                    'choices': [
                                        {'text': 'Tính đóng gói', 'is_correct': False},
                                        {'text': 'Tính kế thừa', 'is_correct': False},
                                        {'text': 'Tính đa hình', 'is_correct': False},
                                        {'text': 'Tính đồng nhất', 'is_correct': True}
                                    ]
                                }
                            ]
                        }
                    },
                    {
                        'title': 'Xử lý file và web scraping',
                        'position': 3,
                        'lessons': [
                            {
                                'title': 'Đọc/ghi file',
                                'content': 'Cách đọc và ghi file trong Python.',
                                'position': 1,
                                'video_url': 'https://www.youtube.com/watch?v=Uh2ebFW8OYM'
                            },
                            {
                                'title': 'Web scraping với requests và BeautifulSoup',
                                'content': 'Lấy dữ liệu web bằng Python.',
                                'position': 2,
                                'video_url': 'https://www.youtube.com/watch?v=ng2o98k983k'
                            }
                        ],
                        'quiz': {
                            'title': 'Quiz File & Web Scraping',
                            'questions': [
                                {
                                    'text': 'Thư viện nào dùng để gửi HTTP request?',
                                    'position': 1,
                                    'choices': [
                                        {'text': 'requests', 'is_correct': True},
                                        {'text': 'os', 'is_correct': False},
                                        {'text': 're', 'is_correct': False},
                                        {'text': 'json', 'is_correct': False}
                                    ]
                                },
                                {
                                    'text': 'BeautifulSoup dùng để làm gì?',
                                    'position': 2,
                                    'choices': [
                                        {'text': 'Phân tích HTML', 'is_correct': True},
                                        {'text': 'Gửi request', 'is_correct': False},
                                        {'text': 'Lưu file', 'is_correct': False},
                                        {'text': 'Tạo class', 'is_correct': False}
                                    ]
                                }
                            ]
                        }
                    }
                ]
            },
            # ...tương tự cho các khóa học khác, mỗi khóa học có 2-3 section, mỗi section có 2-3 lesson, mỗi quiz có 2-3 câu hỏi...
            # Bạn có thể copy mẫu trên và thay đổi nội dung cho các lĩnh vực khác như Ngoại ngữ, Toán học, Marketing, Thiết kế, v.v.
        ]

    def create_quiz_attempts(self, students, courses):
        self.stdout.write('Creating quiz attempts for students...')
        for student in students:
            user_courses = UserCourse.objects.filter(user=student)
            # Mỗi học sinh làm 3 bài kiểm tra ở 3 khóa học khác nhau
            for uc in sample(list(user_courses), min(3, len(user_courses))):
                quizzes = Quiz.objects.filter(section__course=uc.course)
                if quizzes.exists():
                    quiz = quizzes.order_by('?').first()
                    questions = list(quiz.questions.all())
                    answers = {}
                    correct_count = 0
                    for q in questions:
                        choices = list(q.choices.all())
                        selected = choice(choices)
                        answers[str(q.id)] = selected.id
                        if selected.is_correct:
                            correct_count += 1
                    QuizAttempt.objects.create(
                        user=student,
                        quiz=quiz,
                        score=round(10 * correct_count / max(1, len(questions)), 2),
                        correct_count=correct_count,
                        total_count=len(questions),
                        answers=answers
                    )

    def create_system_configurations(self):
        self.stdout.write('Creating system configurations...')
        SystemConfiguration.objects.create(
            key='site_name',
            value='Smart Learning',
            description='Tên hệ thống',
            category='general',
            is_public=True
        )
        SystemConfiguration.objects.create(
            key='max_upload_size',
            value='10485760',
            description='Dung lượng upload tối đa (bytes)',
            category='upload',
            is_public=False
        )

    def create_audit_logs(self):
        self.stdout.write('Creating audit logs...')
        admin = User.objects.filter(is_superuser=True).first()
        AuditLog.objects.create(
            user=admin,
            action='create',
            object_type='SystemConfiguration',
            description='Khởi tạo cấu hình hệ thống',
            ip_address='127.0.0.1'
        )
        AuditLog.objects.create(
            user=admin,
            action='create',
            object_type='Course',
            description='Khởi tạo dữ liệu khóa học mẫu',
            ip_address='127.0.0.1'
        )

    def get_courses_data(self):
        """Return expanded course data: mỗi khóa học nhiều section, lesson, quiz, mỗi quiz nhiều câu hỏi"""
        return [
            # Lập trình
            {
                'title': 'Python Cơ Bản Đến Nâng Cao',
                'subtitle': 'Học Python từ zero đến hero với các project thực tế',
                'description': 'Khóa học Python toàn diện từ cơ bản đến nâng cao. Bao gồm cú pháp, OOP, xử lý file, web scraping, và các thư viện phổ biến.',
                'category': 'Lập trình',
                'price': '299.99',
                'sections': [
                    {
                        'title': 'Python Cơ Bản',
                        'position': 1,
                        'lessons': [
                            {
                                'title': 'Giới thiệu Python',
                                'content': 'Python là ngôn ngữ lập trình dễ học, mạnh mẽ.',
                                'position': 1,
                                'video_url': 'https://www.youtube.com/watch?v=YYXdXT2l-Gg'
                            },
                            {
                                'title': 'Biến và kiểu dữ liệu',
                                'content': 'Học về int, float, string, boolean, list, tuple, dictionary.',
                                'position': 2,
                                'video_url': 'https://www.youtube.com/watch?v=gCCVsvgR2KU'
                            }
                        ],
                        'quiz': {
                            'title': 'Quiz Python cơ bản',
                            'questions': [
                                {
                                    'text': 'Cách nào đúng để in "Hello World" trong Python?',
                                    'position': 1,
                                    'choices': [
                                        {'text': 'print("Hello World")', 'is_correct': True},
                                        {'text': 'echo "Hello World"', 'is_correct': False},
                                        {'text': 'console.log("Hello World")', 'is_correct': False},
                                        {'text': 'printf("Hello World")', 'is_correct': False}
                                    ]
                                },
                                {
                                    'text': 'Kiểu dữ liệu nào là immutable?',
                                    'position': 2,
                                    'choices': [
                                        {'text': 'tuple', 'is_correct': True},
                                        {'text': 'list', 'is_correct': False},
                                        {'text': 'dict', 'is_correct': False},
                                        {'text': 'set', 'is_correct': False}
                                    ]
                                }
                            ]
                        }
                    },
                    {
                        'title': 'Lập trình hướng đối tượng',
                        'position': 2,
                        'lessons': [
                            {
                                'title': 'Class và Object',
                                'content': 'Khái niệm class, object, thuộc tính, phương thức.',
                                'position': 1,
                                'video_url': 'https://www.youtube.com/watch?v=apACNr7DC_s'
                            },
                            {
                                'title': 'Kế thừa và đa hình',
                                'content': 'Tính kế thừa, đa hình trong Python.',
                                'position': 2,
                                'video_url': 'https://www.youtube.com/watch?v=RSl87lqOXDE'
                            }
                        ],
                        'quiz': {
                            'title': 'Quiz OOP Python',
                            'questions': [
                                {
                                    'text': 'Từ khóa nào để định nghĩa class trong Python?',
                                    'position': 1,
                                    'choices': [
                                        {'text': 'class', 'is_correct': True},
                                        {'text': 'object', 'is_correct': False},
                                        {'text': 'def', 'is_correct': False},
                                        {'text': 'struct', 'is_correct': False}
                                    ]
                                },
                                {
                                    'text': 'Tính chất nào KHÔNG thuộc OOP?',
                                    'position': 2,
                                    'choices': [
                                        {'text': 'Tính đóng gói', 'is_correct': False},
                                        {'text': 'Tính kế thừa', 'is_correct': False},
                                        {'text': 'Tính đa hình', 'is_correct': False},
                                        {'text': 'Tính đồng nhất', 'is_correct': True}
                                    ]
                                }
                            ]
                        }
                    },
                    {
                        'title': 'Xử lý file và web scraping',
                        'position': 3,
                        'lessons': [
                            {
                                'title': 'Đọc/ghi file',
                                'content': 'Cách đọc và ghi file trong Python.',
                                'position': 1,
                                'video_url': 'https://www.youtube.com/watch?v=Uh2ebFW8OYM'
                            },
                            {
                                'title': 'Web scraping với requests và BeautifulSoup',
                                'content': 'Lấy dữ liệu web bằng Python.',
                                'position': 2,
                                'video_url': 'https://www.youtube.com/watch?v=ng2o98k983k'
                            }
                        ],
                        'quiz': {
                            'title': 'Quiz File & Web Scraping',
                            'questions': [
                                {
                                    'text': 'Thư viện nào dùng để gửi HTTP request?',
                                    'position': 1,
                                    'choices': [
                                        {'text': 'requests', 'is_correct': True},
                                        {'text': 'os', 'is_correct': False},
                                        {'text': 're', 'is_correct': False},
                                        {'text': 'json', 'is_correct': False}
                                    ]
                                },
                                {
                                    'text': 'BeautifulSoup dùng để làm gì?',
                                    'position': 2,
                                    'choices': [
                                        {'text': 'Phân tích HTML', 'is_correct': True},
                                        {'text': 'Gửi request', 'is_correct': False},
                                        {'text': 'Lưu file', 'is_correct': False},
                                        {'text': 'Tạo class', 'is_correct': False}
                                    ]
                                }
                            ]
                        }
                    }
                ]
            },
            # ...tương tự cho các khóa học khác, mỗi khóa học có 2-3 section, mỗi section có 2-3 lesson, mỗi quiz có 2-3 câu hỏi...
            # Bạn có thể copy mẫu trên và thay đổi nội dung cho các lĩnh vực khác như Ngoại ngữ, Toán học, Marketing, Thiết kế, v.v.
        ]

    def create_quiz_attempts(self, students, courses):
        self.stdout.write('Creating quiz attempts for students...')
        for student in students:
            user_courses = UserCourse.objects.filter(user=student)
            # Mỗi học sinh làm 3 bài kiểm tra ở 3 khóa học khác nhau
            for uc in sample(list(user_courses), min(3, len(user_courses))):
                quizzes = Quiz.objects.filter(section__course=uc.course)
                if quizzes.exists():
                    quiz = quizzes.order_by('?').first()
                    questions = list(quiz.questions.all())
                    answers = {}
                    correct_count = 0
                    for q in questions:
                        choices = list(q.choices.all())
                        selected = choice(choices)
                        answers[str(q.id)] = selected.id
                        if selected.is_correct:
                            correct_count += 1
                    QuizAttempt.objects.create(
                        user=student,
                        quiz=quiz,
                        score=round(10 * correct_count / max(1, len(questions)), 2),
                        correct_count=correct_count,
                        total_count=len(questions),
                        answers=answers
                    )

    def create_system_configurations(self):
        self.stdout.write('Creating system configurations...')
        SystemConfiguration.objects.create(
            key='site_name',
            value='Smart Learning',
            description='Tên hệ thống',
            category='general',
            is_public=True
        )
        SystemConfiguration.objects.create(
            key='max_upload_size',
            value='10485760',
            description='Dung lượng upload tối đa (bytes)',
            category='upload',
            is_public=False
        )

    def create_audit_logs(self):
        self.stdout.write('Creating audit logs...')
        admin = User.objects.filter(is_superuser=True).first()
        AuditLog.objects.create(
            user=admin,
            action='create',
            object_type='SystemConfiguration',
            description='Khởi tạo cấu hình hệ thống',
            ip_address='127.0.0.1'
        )
        AuditLog.objects.create(
            user=admin,
            action='create',
            object_type='Course',
            description='Khởi tạo dữ liệu khóa học mẫu',
            ip_address='127.0.0.1'
        )

    def get_courses_data(self):
        """Return expanded course data: mỗi khóa học nhiều section, lesson, quiz, mỗi quiz nhiều câu hỏi"""
        return [
            # Lập trình
            {
                'title': 'Python Cơ Bản Đến Nâng Cao',
                'subtitle': 'Học Python từ zero đến hero với các project thực tế',
                'description': 'Khóa học Python toàn diện từ cơ bản đến nâng cao. Bao gồm cú pháp, OOP, xử lý file, web scraping, và các thư viện phổ biến.',
                'category': 'Lập trình',
                'price': '299.99',
                'sections': [
                    {
                        'title': 'Python Cơ Bản',
                        'position': 1,
                        'lessons': [
                            {
                                'title': 'Giới thiệu Python',
                                'content': 'Python là ngôn ngữ lập trình dễ học, mạnh mẽ.',
                                'position': 1,
                                'video_url': 'https://www.youtube.com/watch?v=YYXdXT2l-Gg'
                            },
                            {
                                'title': 'Biến và kiểu dữ liệu',
                                'content': 'Học về int, float, string, boolean, list, tuple, dictionary.',
                                'position': 2,
                                'video_url': 'https://www.youtube.com/watch?v=gCCVsvgR2KU'
                            }
                        ],
                        'quiz': {
                            'title': 'Quiz Python cơ bản',
                            'questions': [
                                {
                                    'text': 'Cách nào đúng để in "Hello World" trong Python?',
                                    'position': 1,
                                    'choices': [
                                        {'text': 'print("Hello World")', 'is_correct': True},
                                        {'text': 'echo "Hello World"', 'is_correct': False},
                                        {'text': 'console.log("Hello World")', 'is_correct': False},
                                        {'text': 'printf("Hello World")', 'is_correct': False}
                                    ]
                                },
                                {
                                    'text': 'Kiểu dữ liệu nào là immutable?',
                                    'position': 2,
                                    'choices': [
                                        {'text': 'tuple', 'is_correct': True},
                                        {'text': 'list', 'is_correct': False},
                                        {'text': 'dict', 'is_correct': False},
                                        {'text': 'set', 'is_correct': False}
                                    ]
                                }
                            ]
                        }
                    },
                    {
                        'title': 'Lập trình hướng đối tượng',
                        'position': 2,
                        'lessons': [
                            {
                                'title': 'Class và Object',
                                'content': 'Khái niệm class, object, thuộc tính, phương thức.',
                                'position': 1,
                                'video_url': 'https://www.youtube.com/watch?v=apACNr7DC_s'
                            },
                            {
                                'title': 'Kế thừa và đa hình',
                                'content': 'Tính kế thừa, đa hình trong Python.',
                                'position': 2,
                                'video_url': 'https://www.youtube.com/watch?v=RSl87lqOXDE'
                            }
                        ],
                        'quiz': {
                            'title': 'Quiz OOP Python',
                            'questions': [
                                {
                                    'text': 'Từ khóa nào để định nghĩa class trong Python?',
                                    'position': 1,
                                    'choices': [
                                        {'text': 'class', 'is_correct': True},
                                        {'text': 'object', 'is_correct': False},
                                        {'text': 'def', 'is_correct': False},
                                        {'text': 'struct', 'is_correct': False}
                                    ]
                                },
                                {
                                    'text': 'Tính chất nào KHÔNG thuộc OOP?',
                                    'position': 2,
                                    'choices': [
                                        {'text': 'Tính đóng gói', 'is_correct': False},
                                        {'text': 'Tính kế thừa', 'is_correct': False},
                                        {'text': 'Tính đa hình', 'is_correct': False},
                                        {'text': 'Tính đồng nhất', 'is_correct': True}
                                    ]
                                }
                            ]
                        }
                    },
                    {
                        'title': 'Xử lý file và web scraping',
                        'position': 3,
                        'lessons': [
                            {
                                'title': 'Đọc/ghi file',
                                'content': 'Cách đọc và ghi file trong Python.',
                                'position': 1,
                                'video_url': 'https://www.youtube.com/watch?v=Uh2ebFW8OYM'
                            },
                            {
                                'title': 'Web scraping với requests và BeautifulSoup',
                                'content': 'Lấy dữ liệu web bằng Python.',
                                'position': 2,
                                'video_url': 'https://www.youtube.com/watch?v=ng2o98k983k'
                            }
                        ],
                        'quiz': {
                            'title': 'Quiz File & Web Scraping',
                            'questions': [
                                {
                                    'text': 'Thư viện nào dùng để gửi HTTP request?',
                                    'position': 1,
                                    'choices': [
                                        {'text': 'requests', 'is_correct': True},
                                        {'text': 'os', 'is_correct': False},
                                        {'text': 're', 'is_correct': False},
                                        {'text': 'json', 'is_correct': False}
                                    ]
                                },
                                {
                                    'text': 'BeautifulSoup dùng để làm gì?',
                                    'position': 2,
                                    'choices': [
                                        {'text': 'Phân tích HTML', 'is_correct': True},
                                        {'text': 'Gửi request', 'is_correct': False},
                                        {'text': 'Lưu file', 'is_correct': False},
                                        {'text': 'Tạo class', 'is_correct': False}
                                    ]
                                }
                            ]
                        }
                    }
                ]
            },
            # ...tương tự cho các khóa học khác, mỗi khóa học có 2-3 section, mỗi section có 2-3 lesson, mỗi quiz có 2-3 câu hỏi...
            # Bạn có thể copy mẫu trên và thay đổi nội dung cho các lĩnh vực khác như Ngoại ngữ, Toán học, Marketing, Thiết kế, v.v.
        ]

    def create_quiz_attempts(self, students, courses):
        self.stdout.write('Creating quiz attempts for students...')
        for student in students:
            user_courses = UserCourse.objects.filter(user=student)
            # Mỗi học sinh làm 3 bài kiểm tra ở 3 khóa học khác nhau
            for uc in sample(list(user_courses), min(3, len(user_courses))):
                quizzes = Quiz.objects.filter(section__course=uc.course)
                if quizzes.exists():
                    quiz = quizzes.order_by('?').first()
                    questions = list(quiz.questions.all())
                    answers = {}
                    correct_count = 0
                    for q in questions:
                        choices = list(q.choices.all())
                        selected = choice(choices)
                        answers[str(q.id)] = selected.id
                        if selected.is_correct:
                            correct_count += 1
                    QuizAttempt.objects.create(
                        user=student,
                        quiz=quiz,
                        score=round(10 * correct_count / max(1, len(questions)), 2),
                        correct_count=correct_count,
                        total_count=len(questions),
                        answers=answers
                    )

    def create_system_configurations(self):
        self.stdout.write('Creating system configurations...')
        SystemConfiguration.objects.create(
            key='site_name',
            value='Smart Learning',
            description='Tên hệ thống',
            category='general',
            is_public=True
        )
        SystemConfiguration.objects.create(
            key='max_upload_size',
            value='10485760',
            description='Dung lượng upload tối đa (bytes)',
            category='upload',
            is_public=False
        )

    def create_audit_logs(self):
        self.stdout.write('Creating audit logs...')
        admin = User.objects.filter(is_superuser=True).first()
        AuditLog.objects.create(
            user=admin,
            action='create',
            object_type='SystemConfiguration',
            description='Khởi tạo cấu hình hệ thống',
            ip_address='127.0.0.1'
        )
        AuditLog.objects.create(
            user=admin,
            action='create',
            object_type='Course',
            description='Khởi tạo dữ liệu khóa học mẫu',
            ip_address='127.0.0.1'
        )

    def get_courses_data(self):
        """Return expanded course data: mỗi khóa học nhiều section, lesson, quiz, mỗi quiz nhiều câu hỏi"""
        return [
            # Lập trình
            {
                'title': 'Python Cơ Bản Đến Nâng Cao',
                'subtitle': 'Học Python từ zero đến hero với các project thực tế',
                'description': 'Khóa học Python toàn diện từ cơ bản đến nâng cao. Bao gồm cú pháp, OOP, xử lý file, web scraping, và các thư viện phổ biến.',
                'category': 'Lập trình',
                'price': '299.99',
                'sections': [
                    {
                        'title': 'Python Cơ Bản',
                        'position': 1,
                        'lessons': [
                            {
                                'title': 'Giới thiệu Python',
                                'content': 'Python là ngôn ngữ lập trình dễ học, mạnh mẽ.',
                                'position': 1,
                                'video_url': 'https://www.youtube.com/watch?v=YYXdXT2l-Gg'
                            },
                            {
                                'title': 'Biến và kiểu dữ liệu',
                                'content': 'Học về int, float, string, boolean, list, tuple, dictionary.',
                                'position': 2,
                                'video_url': 'https://www.youtube.com/watch?v=gCCVsvgR2KU'
                            }
                        ],
                        'quiz': {
                            'title': 'Quiz Python cơ bản',
                            'questions': [
                                {
                                    'text': 'Cách nào đúng để in "Hello World" trong Python?',
                                    'position': 1,
                                    'choices': [
                                        {'text': 'print("Hello World")', 'is_correct': True},
                                        {'text': 'echo "Hello World"', 'is_correct': False},
                                        {'text': 'console.log("Hello World")', 'is_correct': False},
                                        {'text': 'printf("Hello World")', 'is_correct': False}
                                    ]
                                },
                                {
                                    'text': 'Kiểu dữ liệu nào là immutable?',
                                    'position': 2,
                                    'choices': [
                                        {'text': 'tuple', 'is_correct': True},
                                        {'text': 'list', 'is_correct': False},
                                        {'text': 'dict', 'is_correct': False},
                                        {'text': 'set', 'is_correct': False}
                                    ]
                                }
                            ]
                        }
                    },
                    {
                        'title': 'Lập trình hướng đối tượng',
                        'position': 2,
                        'lessons': [
                            {
                                'title': 'Class và Object',
                                'content': 'Khái niệm class, object, thuộc tính, phương thức.',
                                'position': 1,
                                'video_url': 'https://www.youtube.com/watch?v=apACNr7DC_s'
                            },
                            {
                                'title': 'Kế thừa và đa hình',
                                'content': 'Tính kế thừa, đa hình trong Python.',
                                'position': 2,
                                'video_url': 'https://www.youtube.com/watch?v=RSl87lqOXDE'
                            }
                        ],
                        'quiz': {
                            'title': 'Quiz OOP Python',
                            'questions': [
                                {
                                    'text': 'Từ khóa nào để định nghĩa class trong Python?',
                                    'position': 1,
                                    'choices': [
                                        {'text': 'class', 'is_correct': True},
                                        {'text': 'object', 'is_correct': False},
                                        {'text': 'def', 'is_correct': False},
                                        {'text': 'struct', 'is_correct': False}
                                    ]
                                },
                                {
                                    'text': 'Tính chất nào KHÔNG thuộc OOP?',
                                    'position': 2,
                                    'choices': [
                                        {'text': 'Tính đóng gói', 'is_correct': False},
                                        {'text': 'Tính kế thừa', 'is_correct': False},
                                        {'text': 'Tính đa hình', 'is_correct': False},
                                        {'text': 'Tính đồng nhất', 'is_correct': True}
                                    ]
                                }
                            ]
                        }
                    },
                    {
                        'title': 'Xử lý file và web scraping',
                        'position': 3,
                        'lessons': [
                            {
                                'title': 'Đọc/ghi file',
                                'content': 'Cách đọc và ghi file trong Python.',
                                'position': 1,
                                'video_url': 'https://www.youtube.com/watch?v=Uh2ebFW8OYM'
                            },
                            {
                                'title': 'Web scraping với requests và BeautifulSoup',
                                'content': 'Lấy dữ liệu web bằng Python.',
                                'position': 2,
                                'video_url': 'https://www.youtube.com/watch?v=ng2o98k983k'
                            }
                        ],
                        'quiz': {
                            'title': 'Quiz File & Web Scraping',
                            'questions': [
                                {
                                    'text': 'Thư viện nào dùng để gửi HTTP request?',
                                    'position': 1,
                                    'choices': [
                                        {'text': 'requests', 'is_correct': True},
                                        {'text': 'os', 'is_correct': False},
                                        {'text': 're', 'is_correct': False},
                                        {'text': 'json', 'is_correct': False}
                                    ]
                                },
                                {
                                    'text': 'BeautifulSoup dùng để làm gì?',
                                    'position': 2,
                                    'choices': [
                                        {'text': 'Phân tích HTML', 'is_correct': True},
                                        {'text': 'Gửi request', 'is_correct': False},
                                        {'text': 'Lưu file', 'is_correct': False},
                                        {'text': 'Tạo class', 'is_correct': False}
                                    ]
                                }
                            ]
                        }
                    }
                ]
            },
            # ...tương tự cho các khóa học khác, mỗi khóa học có 2-3 section, mỗi section có 2-3 lesson, mỗi quiz có 2-3 câu hỏi...
            # Bạn có thể copy mẫu trên và thay đổi nội dung cho các lĩnh vực khác như Ngoại ngữ, Toán học, Marketing, Thiết kế, v.v.
        ]

    def create_quiz_attempts(self, students, courses):
        self.stdout.write('Creating quiz attempts for students...')
        for student in students:
            user_courses = UserCourse.objects.filter(user=student)
            # Mỗi học sinh làm 3 bài kiểm tra ở 3 khóa học khác nhau
            for uc in sample(list(user_courses), min(3, len(user_courses))):
                quizzes = Quiz.objects.filter(section__course=uc.course)
                if quizzes.exists():
                    quiz = quizzes.order_by('?').first()
                    questions = list(quiz.questions.all())
                    answers = {}
                    correct_count = 0
                    for q in questions:
                        choices = list(q.choices.all())
                        selected = choice(choices)
                        answers[str(q.id)] = selected.id
                        if selected.is_correct:
                            correct_count += 1
                    QuizAttempt.objects.create(
                        user=student,
                        quiz=quiz,
                        score=round(10 * correct_count / max(1, len(questions)), 2),
                        correct_count=correct_count,
                        total_count=len(questions),
                        answers=answers
                    )

    def create_system_configurations(self):
        self.stdout.write('Creating system configurations...')
        SystemConfiguration.objects.create(
            key='site_name',
            value='Smart Learning',
            description='Tên hệ thống',
            category='general',
            is_public=True
        )
        SystemConfiguration.objects.create(
            key='max_upload_size',
            value='10485760',
            description='Dung lượng upload tối đa (bytes)',
            category='upload',
            is_public=False
        )

    def create_audit_logs(self):
        self.stdout.write('Creating audit logs...')
        admin = User.objects.filter(is_superuser=True).first()
        AuditLog.objects.create(
            user=admin,
            action='create',
            object_type='SystemConfiguration',
            description='Khởi tạo cấu hình hệ thống',
            ip_address='127.0.0.1'
        )
        AuditLog.objects.create(
            user=admin,
            action='create',
            object_type='Course',
            description='Khởi tạo dữ liệu khóa học mẫu',
            ip_address='127.0.0.1'
        )

    def get_courses_data(self):
        """Return expanded course data: mỗi khóa học nhiều section, lesson, quiz, mỗi quiz nhiều câu hỏi"""
        return [
            # Lập trình
            {
                'title': 'Python Cơ Bản Đến Nâng Cao',
                'subtitle': 'Học Python từ zero đến hero với các project thực tế',
                'description': 'Khóa học Python toàn diện từ cơ bản đến nâng cao. Bao gồm cú pháp, OOP, xử lý file, web scraping, và các thư viện phổ biến.',
                'category': 'Lập trình',
                'price': '299.99',
                'sections': [
                    {
                        'title': 'Python Cơ Bản',
                        'position': 1,
                        'lessons': [
                            {
                                'title': 'Giới thiệu Python',
                                'content': 'Python là ngôn ngữ lập trình dễ học, mạnh mẽ.',
                                'position': 1,
                                'video_url': 'https://www.youtube.com/watch?v=YYXdXT2l-Gg'
                            },
                            {
                                'title': 'Biến và kiểu dữ liệu',
                                'content': 'Học về int, float, string, boolean, list, tuple, dictionary.',
                                'position': 2,
                                'video_url': 'https://www.youtube.com/watch?v=gCCVsvgR2KU'
                            }
                        ],
                        'quiz': {
                            'title': 'Quiz Python cơ bản',
                            'questions': [
                                {
                                    'text': 'Cách nào đúng để in "Hello World" trong Python?',
                                    'position': 1,
                                    'choices': [
                                        {'text': 'print("Hello World")', 'is_correct': True},
                                        {'text': 'echo "Hello World"', 'is_correct': False},
                                        {'text': 'console.log("Hello World")', 'is_correct': False},
                                        {'text': 'printf("Hello World")', 'is_correct': False}
                                    ]
                                },
                                {
                                    'text': 'Kiểu dữ liệu nào là immutable?',
                                    'position': 2,
                                    'choices': [
                                        {'text': 'tuple', 'is_correct': True},
                                        {'text': 'list', 'is_correct': False},
                                        {'text': 'dict', 'is_correct': False},
                                        {'text': 'set', 'is_correct': False}
                                    ]
                                }
                            ]
                        }
                    },
                    {
                        'title': 'Lập trình hướng đối tượng',
                        'position': 2,
                        'lessons': [
                            {
                                'title': 'Class và Object',
                                'content': 'Khái niệm class, object, thuộc tính, phương thức.',
                                'position': 1,
                                'video_url': 'https://www.youtube.com/watch?v=apACNr7DC_s'
                            },
                            {
                                'title': 'Kế thừa và đa hình',
                                'content': 'Tính kế thừa, đa hình trong Python.',
                                'position': 2,
                                'video_url': 'https://www.youtube.com/watch?v=RSl87lqOXDE'
                            }
                        ],
                        'quiz': {
                            'title': 'Quiz OOP Python',
                            'questions': [
                                {
                                    'text': 'Từ khóa nào để định nghĩa class trong Python?',
                                    'position': 1,
                                    'choices': [
                                        {'text': 'class', 'is_correct': True},
                                        {'text': 'object', 'is_correct': False},
                                        {'text': 'def', 'is_correct': False},
                                        {'text': 'struct', 'is_correct': False}
                                    ]
                                },
                                {
                                    'text': 'Tính chất nào KHÔNG thuộc OOP?',
                                    'position': 2,
                                    'choices': [
                                        {'text': 'Tính đóng gói', 'is_correct': False},
                                        {'text': 'Tính kế thừa', 'is_correct': False},
                                        {'text': 'Tính đa hình', 'is_correct': False},
                                        {'text': 'Tính đồng nhất', 'is_correct': True}
                                    ]
                                }
                            ]
                        }
                    },
                    {
                        'title': 'Xử lý file và web scraping',
                        'position': 3,
                        'lessons': [
                            {
                                'title': 'Đọc/ghi file',
                                'content': 'Cách đọc và ghi file trong Python.',
                                'position': 1,
                                'video_url': 'https://www.youtube.com/watch?v=Uh2ebFW8OYM'
                            },
                            {
                                'title': 'Web scraping với requests và BeautifulSoup',
                                'content': 'Lấy dữ liệu web bằng Python.',
                                'position': 2,
                                'video_url': 'https://www.youtube.com/watch?v=ng2o98k983k'
                            }
                        ],
                        'quiz': {
                            'title': 'Quiz File & Web Scraping',
                            'questions': [
                                {
                                    'text': 'Thư viện nào dùng để gửi HTTP request?',
                                    'position': 1,
                                    'choices': [
                                        {'text': 'requests', 'is_correct': True},
                                        {'text': 'os', 'is_correct': False},
                                        {'text': 're', 'is_correct': False},
                                        {'text': 'json', 'is_correct': False}
                                    ]
                                },
                                {
                                    'text': 'BeautifulSoup dùng để làm gì?',
                                    'position': 2,
                                    'choices': [
                                        {'text': 'Phân tích HTML', 'is_correct': True},
                                        {'text': 'Gửi request', 'is_correct': False},
                                        {'text': 'Lưu file', 'is_correct': False},
                                        {'text': 'Tạo class', 'is_correct': False}
                                    ]
                                }
                            ]
                        }
                    }
                ]
            },
            # ...tương tự cho các khóa học khác, mỗi khóa học có 2-3 section, mỗi section có 2-3 lesson, mỗi quiz có 2-3 câu hỏi...
            # Bạn có thể copy mẫu trên và thay đổi nội dung cho các lĩnh vực khác như Ngoại ngữ, Toán học, Marketing, Thiết kế, v.v.
        ]

    def create_quiz_attempts(self, students, courses):
        self.stdout.write('Creating quiz attempts for students...')
        for student in students:
            user_courses = UserCourse.objects.filter(user=student)
            # Mỗi học sinh làm 3 bài kiểm tra ở 3 khóa học khác nhau
            for uc in sample(list(user_courses), min(3, len(user_courses))):
                quizzes = Quiz.objects.filter(section__course=uc.course)
                if quizzes.exists():
                    quiz = quizzes.order_by('?').first()
                    questions = list(quiz.questions.all())
                    answers = {}
                    correct_count = 0
                    for q in questions:
                        choices = list(q.choices.all())
                        selected = choice(choices)
                        answers[str(q.id)] = selected.id
                        if selected.is_correct:
                            correct_count += 1
                    QuizAttempt.objects.create(
                        user=student,
                        quiz=quiz,
                        score=round(10 * correct_count / max(1, len(questions)), 2),
                        correct_count=correct_count,
                        total_count=len(questions),
                        answers=answers
                    )

    def create_system_configurations(self):
        self.stdout.write('Creating system configurations...')
        SystemConfiguration.objects.create(
            key='site_name',
            value='Smart Learning',
            description='Tên hệ thống',
            category='general',
            is_public=True
        )
        SystemConfiguration.objects.create(
            key='max_upload_size',
            value='10485760',
            description='Dung lượng upload tối đa (bytes)',
            category='upload',
            is_public=False
        )

    def create_audit_logs(self):
        self.stdout.write('Creating audit logs...')
        admin = User.objects.filter(is_superuser=True).first()
        AuditLog.objects.create(
            user=admin,
            action='create',
            object_type='SystemConfiguration',
            description='Khởi tạo cấu hình hệ thống',
            ip_address='127.0.0.1'
        )
        AuditLog.objects.create(
            user=admin,
            action='create',
            object_type='Course',
            description='Khởi tạo dữ liệu khóa học mẫu',
            ip_address='127.0.0.1'
        )

    def get_courses_data(self):
        """Return expanded course data: mỗi khóa học nhiều section, lesson, quiz, mỗi quiz nhiều câu hỏi"""
        return [
            # Lập trình
            {
                'title': 'Python Cơ Bản Đến Nâng Cao',
                'subtitle': 'Học Python từ zero đến hero với các project thực tế',
                'description': 'Khóa học Python toàn diện từ cơ bản đến nâng cao. Bao gồm cú pháp, OOP, xử lý file, web scraping, và các thư viện phổ biến.',
                'category': 'Lập trình',
                'price': '299.99',
                'sections': [
                    {
                        'title': 'Python Cơ Bản',
                        'position': 1,
                        'lessons': [
                            {
                                'title': 'Giới thiệu Python',
                                'content': 'Python là ngôn ngữ lập trình dễ học, mạnh mẽ.',
                                'position': 1,
                                'video_url': 'https://www.youtube.com/watch?v=YYXdXT2l-Gg'
                            },
                            {
                                'title': 'Biến và kiểu dữ liệu',
                                'content': 'Học về int, float, string, boolean, list, tuple, dictionary.',
                                'position': 2,
                                'video_url': 'https://www.youtube.com/watch?v=gCCVsvgR2KU'
                            }
                        ],
                        'quiz': {
                            'title': 'Quiz Python cơ bản',
                            'questions': [
                                {
                                    'text': 'Cách nào đúng để in "Hello World" trong Python?',
                                    'position': 1,
                                    'choices': [
                                        {'text': 'print("Hello World")', 'is_correct': True},
                                        {'text': 'echo "Hello World"', 'is_correct': False},
                                        {'text': 'console.log("Hello World")', 'is_correct': False},
                                        {'text': 'printf("Hello World")', 'is_correct': False}
                                    ]
                                },
                                {
                                    'text': 'Kiểu dữ liệu nào là immutable?',
                                    'position': 2,
                                    'choices': [
                                        {'text': 'tuple', 'is_correct': True},
                                        {'text': 'list', 'is_correct': False},
                                        {'text': 'dict', 'is_correct': False},
                                        {'text': 'set', 'is_correct': False}
                                    ]
                                }
                            ]
                        }
                    },
                    {
                        'title': 'Lập trình hướng đối tượng',
                        'position': 2,
                        'lessons': [
                            {
                                'title': 'Class và Object',
                                'content': 'Khái niệm class, object, thuộc tính, phương thức.',
                                'position': 1,
                                'video_url': 'https://www.youtube.com/watch?v=apACNr7DC_s'
                            },
                            {
                                'title': 'Kế thừa và đa hình',
                                'content': 'Tính kế thừa, đa hình trong Python.',
                                'position': 2,
                                'video_url': 'https://www.youtube.com/watch?v=RSl87lqOXDE'
                            }
                        ],
                        'quiz': {
                            'title': 'Quiz OOP Python',
                            'questions': [
                                {
                                    'text': 'Từ khóa nào để định nghĩa class trong Python?',
                                    'position': 1,
                                    'choices': [
                                        {'text': 'class', 'is_correct': True},
                                        {'text': 'object', 'is_correct': False},
                                        {'text': 'def', 'is_correct': False},
                                        {'text': 'struct', 'is_correct': False}
                                    ]
                                },
                                {
                                    'text': 'Tính chất nào KHÔNG thuộc OOP?',
                                    'position': 2,
                                    'choices': [
                                        {'text': 'Tính đóng gói', 'is_correct': False},
                                        {'text': 'Tính kế thừa', 'is_correct': False},
                                        {'text': 'Tính đa hình', 'is_correct': False},
                                        {'text': 'Tính đồng nhất', 'is_correct': True}
                                    ]
                                }
                            ]
                        }
                    },
                    {
                        'title': 'Xử lý file và web scraping',
                        'position': 3,
                        'lessons': [
                            {
                                'title': 'Đọc/ghi file',
                                'content': 'Cách đọc và ghi file trong Python.',
                                'position': 1,
                                'video_url': 'https://www.youtube.com/watch?v=Uh2ebFW8OYM'
                            },
                            {
                                'title': 'Web scraping với requests và BeautifulSoup',
                                'content': 'Lấy dữ liệu web bằng Python.',
                                'position': 2,
                                'video_url': 'https://www.youtube.com/watch?v=ng2o98k983k'
                            }
                        ],
                        'quiz': {
                            'title': 'Quiz File & Web Scraping',
                            'questions': [
                                {
                                    'text': 'Thư viện nào dùng để gửi HTTP request?',
                                    'position': 1,
                                    'choices': [
                                        {'text': 'requests', 'is_correct': True},
                                        {'text': 'os', 'is_correct': False},
                                        {'text': 're', 'is_correct': False},
                                        {'text': 'json', 'is_correct': False}
                                    ]
                                },
                                {
                                    'text': 'BeautifulSoup dùng để làm gì?',
                                    'position': 2,
                                    'choices': [
                                        {'text': 'Phân tích HTML', 'is_correct': True},
                                        {'text': 'Gửi request', 'is_correct': False},
                                        {'text': 'Lưu file', 'is_correct': False},
                                        {'text': 'Tạo class', 'is_correct': False}
                                    ]
                                }
                            ]
                        }
                    }
                ]
            },
            # ...tương tự cho các khóa học khác, mỗi khóa học có 2-3 section, mỗi section có 2-3 lesson, mỗi quiz có 2-3 câu hỏi...
            # Bạn có thể copy mẫu trên và thay đổi nội dung cho các lĩnh vực khác như Ngoại ngữ, Toán học, Marketing, Thiết kế, v.v.
        ]

    def create_quiz_attempts(self, students, courses):
        self.stdout.write('Creating quiz attempts for students...')
        for student in students:
            user_courses = UserCourse.objects.filter(user=student)
            # Mỗi học sinh làm 3 bài kiểm tra ở 3 khóa học khác nhau
            for uc in sample(list(user_courses), min(3, len(user_courses))):
                quizzes = Quiz.objects.filter(section__course=uc.course)
                if quizzes.exists():
                    quiz = quizzes.order_by('?').first()
                    questions = list(quiz.questions.all())
                    answers = {}
                    correct_count = 0
                    for q in questions:
                        choices = list(q.choices.all())
                        selected = choice(choices)
                        answers[str(q.id)] = selected.id
                        if selected.is_correct:
                            correct_count += 1
                    QuizAttempt.objects.create(
                        user=student,
                        quiz=quiz,
                        score=round(10 * correct_count / max(1, len(questions)), 2),
                        correct_count=correct_count,
                        total_count=len(questions),
                        answers=answers
                    )

    def create_system_configurations(self):
        self.stdout.write('Creating system configurations...')
        SystemConfiguration.objects.create(
            key='site_name',
            value='Smart Learning',
            description='Tên hệ thống',
            category='general',
            is_public=True
        )
        SystemConfiguration.objects.create(
            key='max_upload_size',
            value='10485760',
            description='Dung lượng upload tối đa (bytes)',
            category='upload',
            is_public=False
        )

    def create_audit_logs(self):
        self.stdout.write('Creating audit logs...')
        admin = User.objects.filter(is_superuser=True).first()
        AuditLog.objects.create(
            user=admin,
            action='create',
            object_type='SystemConfiguration',
            description='Khởi tạo cấu hình hệ thống',
            ip_address='127.0.0.1'
        )
        AuditLog.objects.create(
            user=admin,
            action='create',
            object_type='Course',
            description='Khởi tạo dữ liệu khóa học mẫu',
            ip_address='127.0.0.1'
        )

    def get_courses_data(self):
        """Return expanded course data: mỗi khóa học nhiều section, lesson, quiz, mỗi quiz nhiều câu hỏi"""
        return [
            # Lập trình
            {
                'title': 'Python Cơ Bản Đến Nâng Cao',
                'subtitle': 'Học Python từ zero đến hero với các project thực tế',
                'description': 'Khóa học Python toàn diện từ cơ bản đến nâng cao. Bao gồm cú pháp, OOP, xử lý file, web scraping, và các thư viện phổ biến.',
                'category': 'Lập trình',
                'price': '299.99',
                'sections': [
                    {
                        'title': 'Python Cơ Bản',
                        'position': 1,
                        'lessons': [
                            {
                                'title': 'Giới thiệu Python',
                                'content': 'Python là ngôn ngữ lập trình dễ học, mạnh mẽ.',
                                'position': 1,
                                'video_url': 'https://www.youtube.com/watch?v=YYXdXT2l-Gg'
                            },
                            {
                                'title': 'Biến và kiểu dữ liệu',
                                'content': 'Học về int, float, string, boolean, list, tuple, dictionary.',
                                'position': 2,
                                'video_url': 'https://www.youtube.com/watch?v=gCCVsvgR2KU'
                            }
                        ],
                        'quiz': {
                            'title': 'Quiz Python cơ bản',
                            'questions': [
                                {
                                    'text': 'Cách nào đúng để in "Hello World" trong Python?',
                                    'position': 1,
                                    'choices': [
                                        {'text': 'print("Hello World")', 'is_correct': True},
                                        {'text': 'echo "Hello World"', 'is_correct': False},
                                        {'text': 'console.log("Hello World")', 'is_correct': False},
                                        {'text': 'printf("Hello World")', 'is_correct': False}
                                    ]
                                },
                                {
                                    'text': 'Kiểu dữ liệu nào là immutable?',
                                    'position': 2,
                                    'choices': [
                                        {'text': 'tuple', 'is_correct': True},
                                        {'text': 'list', 'is_correct': False},
                                        {'text': 'dict', 'is_correct': False},
                                        {'text': 'set', 'is_correct': False}
                                    ]
                                }
                            ]
                        }
                    },
                    {
                        'title': 'Lập trình hướng đối tượng',
                        'position': 2,
                        'lessons': [
                            {
                                'title': 'Class và Object',
                                'content': 'Khái niệm class, object, thuộc tính, phương thức.',
                                'position': 1,
                                'video_url': 'https://www.youtube.com/watch?v=apACNr7DC_s'
                            },
                            {
                                'title': 'Kế thừa và đa hình',
                                'content': 'Tính kế thừa, đa hình trong Python.',
                                'position': 2,
                                'video_url': 'https://www.youtube.com/watch?v=RSl87lqOXDE'
                            }
                        ],
                        'quiz': {
                            'title': 'Quiz OOP Python',
                            'questions': [
                                {
                                    'text': 'Từ khóa nào để định nghĩa class trong Python?',
                                    'position': 1,
                                    'choices': [
                                        {'text': 'class', 'is_correct': True},
                                        {'text': 'object', 'is_correct': False},
                                        {'text': 'def', 'is_correct': False},
                                        {'text': 'struct', 'is_correct': False}
                                    ]
                                },
                                {
                                    'text': 'Tính chất nào KHÔNG thuộc OOP?',
                                    'position': 2,
                                    'choices': [
                                        {'text': 'Tính đóng gói', 'is_correct': False},
                                        {'text': 'Tính kế thừa', 'is_correct': False},
                                        {'text': 'Tính đa hình', 'is_correct': False},
                                        {'text': 'Tính đồng nhất', 'is_correct': True}
                                    ]
                                }
                            ]
                        }
                    },
                    {
                        'title': 'Xử lý file và web scraping',
                        'position': 3,
                        'lessons': [
                            {
                                'title': 'Đọc/ghi file',
                                'content': 'Cách đọc và ghi file trong Python.',
                                'position': 1,
                                'video_url': 'https://www.youtube.com/watch?v=Uh2ebFW8OYM'
                            },
                            {
                                'title': 'Web scraping với requests và BeautifulSoup',
                                'content': 'Lấy dữ liệu web bằng Python.',
                                'position': 2,
                                'video_url': 'https://www.youtube.com/watch?v=ng2o98k983k'
                            }
                        ],
                        'quiz': {
                            'title': 'Quiz File & Web Scraping',
                            'questions': [
                                {
                                    'text': 'Thư viện nào dùng để gửi HTTP request?',
                                    'position': 1,
                                    'choices': [
                                        {'text': 'requests', 'is_correct': True},
                                        {'text': 'os', 'is_correct': False},
                                        {'text': 're', 'is_correct': False},
                                        {'text': 'json', 'is_correct': False}
                                    ]
                                },
                                {
                                    'text': 'BeautifulSoup dùng để làm gì?',
                                    'position': 2,
                                    'choices': [
                                        {'text': 'Phân tích HTML', 'is_correct': True},
                                        {'text': 'Gửi request', 'is_correct': False},
                                        {'text': 'Lưu file', 'is_correct': False},
                                        {'text': 'Tạo class', 'is_correct': False}
                                    ]
                                }
                            ]
                        }
                    }
                ]
            },
            # ...tương tự cho các khóa học khác, mỗi khóa học có 2-3 section, mỗi section có 2-3 lesson, mỗi quiz có 2-3 câu hỏi...
            # Bạn có thể copy mẫu trên và thay đổi nội dung cho các lĩnh vực khác như Ngoại ngữ, Toán học, Marketing, Thiết kế, v.v.
        ]

    def create_quiz_attempts(self, students, courses):
        self.stdout.write('Creating quiz attempts for students...')
        for student in students:
            user_courses = UserCourse.objects.filter(user=student)
            # Mỗi học sinh làm 3 bài kiểm tra ở 3 khóa học khác nhau
            for uc in sample(list(user_courses), min(3, len(user_courses))):
                quizzes = Quiz.objects.filter(section__course=uc.course)
                if quizzes.exists():
                    quiz = quizzes.order_by('?').first()
                    questions = list(quiz.questions.all())
                    answers = {}
                    correct_count = 0
                    for q in questions:
                        choices = list(q.choices.all())
                        selected = choice(choices)
                        answers[str(q.id)] = selected.id
                        if selected.is_correct:
                            correct_count += 1
                    QuizAttempt.objects.create(
                        user=student,
                        quiz=quiz,
                        score=round(10 * correct_count / max(1, len(questions)), 2),
                        correct_count=correct_count,
                        total_count=len(questions),
                        answers=answers
                    )

    def create_system_configurations(self):
        self.stdout.write('Creating system configurations...')
        SystemConfiguration.objects.create(
            key='site_name',
            value='Smart Learning',
            description='Tên hệ thống',
            category='general',
            is_public=True
        )
        SystemConfiguration.objects.create(
            key='max_upload_size',
            value='10485760',
            description='Dung lượng upload tối đa (bytes)',
            category='upload',
            is_public=False
        )

    def create_audit_logs(self):
        self.stdout.write('Creating audit logs...')
        admin = User.objects.filter(is_superuser=True).first()
        AuditLog.objects.create(
            user=admin,
            action='create',
            object_type='SystemConfiguration',
            description='Khởi tạo cấu hình hệ thống',
            ip_address='127.0.0.1'
        )
        AuditLog.objects.create(
            user=admin,
            action='create',
            object_type='Course',
            description='Khởi tạo dữ liệu khóa học mẫu',
            ip_address='127.0.0.1'
        )

    def get_courses_data(self):
        """Return expanded course data: mỗi khóa học nhiều section, lesson, quiz, mỗi quiz nhiều câu hỏi"""
        return [
            # Lập trình
            {
                'title': 'Python Cơ Bản Đến Nâng Cao',
                'subtitle': 'Học Python từ zero đến hero với các project thực tế',
                'description': 'Khóa học Python toàn diện từ cơ bản đến nâng cao. Bao gồm cú pháp, OOP, xử lý file, web scraping, và các thư viện phổ biến.',
                'category': 'Lập trình',
                'price': '299.99',
                'sections': [
                    {
                        'title': 'Python Cơ Bản',
                        'position': 1,
                        'lessons': [
                            {
                                'title': 'Giới thiệu Python',
                                'content': 'Python là ngôn ngữ lập trình dễ học, mạnh mẽ.',
                                'position': 1,
                                'video_url': 'https://www.youtube.com/watch?v=YYXdXT2l-Gg'
                            },
                            {
                                'title': 'Biến và kiểu dữ liệu',
                                'content': 'Học về int, float, string, boolean, list, tuple, dictionary.',
                                'position': 2,
                                'video_url': 'https://www.youtube.com/watch?v=gCCVsvgR2KU'
                            }
                        ],
                        'quiz': {
                            'title': 'Quiz Python cơ bản',
                            'questions': [
                                {
                                    'text': 'Cách nào đúng để in "Hello World" trong Python?',
                                    'position': 1,
                                    'choices': [
                                        {'text': 'print("Hello World")', 'is_correct': True},
                                        {'text': 'echo "Hello World"', 'is_correct': False},
                                        {'text': 'console.log("Hello World")', 'is_correct': False},
                                        {'text': 'printf("Hello World")', 'is_correct': False}
                                    ]
                                },
                                {
                                    'text': 'Kiểu dữ liệu nào là immutable?',
                                    'position': 2,
                                    'choices': [
                                        {'text': 'tuple', 'is_correct': True},
                                        {'text': 'list', 'is_correct': False},
                                        {'text': 'dict', 'is_correct': False},
                                        {'text': 'set', 'is_correct': False}
                                    ]
                                }
                            ]
                        }
                    },
                    {
                        'title': 'Lập trình hướng đối tượng',
                        'position': 2,
                        'lessons': [
                            {
                                'title': 'Class và Object',
                                'content': 'Khái niệm class, object, thuộc tính, phương thức.',
                                'position': 1,
                                'video_url': 'https://www.youtube.com/watch?v=apACNr7DC_s'
                            },
                            {
                                'title': 'Kế thừa và đa hình',
                                'content': 'Tính kế thừa, đa hình trong Python.',
                                'position': 2,
                                'video_url': 'https://www.youtube.com/watch?v=RSl87lqOXDE'
                            }
                        ],
                        'quiz': {
                            'title': 'Quiz OOP Python',
                            'questions': [
                                {
                                    'text': 'Từ khóa nào để định nghĩa class trong Python?',
                                    'position': 1,
                                    'choices': [
                                        {'text': 'class', 'is_correct': True},
                                        {'text': 'object', 'is_correct': False},
                                        {'text': 'def', 'is_correct': False},
                                        {'text': 'struct', 'is_correct': False}
                                    ]
                                },
                                {
                                    'text': 'Tính chất nào KHÔNG thuộc OOP?',
                                    'position': 2,
                                    'choices': [
                                        {'text': 'Tính đóng gói', 'is_correct': False},
                                        {'text': 'Tính kế thừa', 'is_correct': False},
                                        {'text': 'Tính đa hình', 'is_correct': False},
                                        {'text': 'Tính đồng nhất', 'is_correct': True}
                                    ]
                                }
                            ]
                        }
                    },
                    {
                        'title': 'Xử lý file và web scraping',
                        'position': 3,
                        'lessons': [
                            {
                                'title': 'Đọc/ghi file',
                                'content': 'Cách đọc và ghi file trong Python.',
                                'position': 1,
                                'video_url': 'https://www.youtube.com/watch?v=Uh2ebFW8OYM'
                            },
                            {
                                'title': 'Web scraping với requests và BeautifulSoup',
                                'content': 'Lấy dữ liệu web bằng Python.',
                                'position': 2,
                                'video_url': 'https://www.youtube.com/watch?v=ng2o98k983k'
                            }
                        ],
                        'quiz': {
                            'title': 'Quiz File & Web Scraping',
                            'questions': [
                                {
                                    'text': 'Thư viện nào dùng để gửi HTTP request?',
                                    'position': 1,
                                    'choices': [
                                        {'text': 'requests', 'is_correct': True},
                                        {'text': 'os', 'is_correct': False},
                                        {'text': 're', 'is_correct': False},
                                        {'text': 'json', 'is_correct': False}
                                    ]
                                },
                                {
                                    'text': 'BeautifulSoup dùng để làm gì?',
                                    'position': 2,
                                    'choices': [
                                        {'text': 'Phân tích HTML', 'is_correct': True},
                                        {'text': 'Gửi request', 'is_correct': False},
                                        {'text': 'Lưu file', 'is_correct': False},
                                        {'text': 'Tạo class', 'is_correct': False}
                                    ]
                                }
                            ]
                        }
                    }
                ]
            },
            # ...tương tự cho các khóa học khác, mỗi khóa học có 2-3 section, mỗi section có 2-3 lesson, mỗi quiz có 2-3 câu hỏi...
            # Bạn có thể copy mẫu trên và thay đổi nội dung cho các lĩnh vực khác như Ngoại ngữ, Toán học, Marketing, Thiết kế, v.v.
        ]
