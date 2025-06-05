from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models import Q, Avg
from decimal import Decimal
import random
from datetime import datetime, timedelta
import json

from course.models import Course, Section, Lesson, Quiz, Question, Choice, UserCourse, QuizAttempt
from user.models import UserProfile
from admin_panel.models import SystemConfiguration, AuditLog


class Command(BaseCommand):
    help = 'Seed analytics and reporting data for Smart Learning platform'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=90,
            help='Number of days of historical data to generate (default: 90)'
        )
        parser.add_argument(
            '--students',
            type=int,
            default=20,
            help='Number of additional students to create (default: 20)'
        )

    def handle(self, *args, **options):
        self.days = options['days']
        self.additional_students = options['students']
        
        self.stdout.write(self.style.SUCCESS(f'Generating analytics data for {self.days} days...'))
        
        # Create additional students for better analytics
        self.create_additional_students()
        
        # Generate daily activity data
        self.generate_daily_activities()
        
        # Create realistic enrollment patterns
        self.create_enrollment_patterns()
        
        # Generate quiz performance trends
        self.generate_quiz_performance_trends()
        
        # Create user engagement metrics
        self.create_engagement_metrics()
        
        # Generate course completion statistics
        self.generate_completion_statistics()
        
        # Create teacher performance metrics
        self.create_teacher_metrics()
        
        self.stdout.write(self.style.SUCCESS('Analytics data generation completed!'))
        self.display_analytics_summary()

    def create_additional_students(self):
        """Create additional students for richer analytics"""
        self.stdout.write(f'Creating {self.additional_students} additional students...')
        
        student_profiles = [
            {'level': 'beginner', 'engagement': 'high', 'performance': 'good'},
            {'level': 'intermediate', 'engagement': 'medium', 'performance': 'excellent'},
            {'level': 'advanced', 'engagement': 'high', 'performance': 'excellent'},
            {'level': 'beginner', 'engagement': 'low', 'performance': 'poor'},
            {'level': 'intermediate', 'engagement': 'high', 'performance': 'good'},
            {'level': 'beginner', 'engagement': 'medium', 'performance': 'fair'},
        ]
        vietnamese_names = [
            ('Nguyễn', 'Văn An'), ('Trần', 'Thị Bình'), ('Lê', 'Văn Cường'),
            ('Phạm', 'Thị Dung'), ('Hoàng', 'Văn Em'), ('Huỳnh', 'Thị Phượng'),
            ('Vũ', 'Văn Giang'), ('Võ', 'Thị Hương'), ('Đặng', 'Văn Khoa'),
            ('Bùi', 'Thị Lan'), ('Đỗ', 'Văn Minh'), ('Ngô', 'Thị Nga'),
            ('Dương', 'Văn Phúc'), ('Lý', 'Thị Quỳnh'), ('Mai', 'Văn Sang'),
            ('Tôn', 'Thị Tâm'), ('Phan', 'Văn Trung'), ('Đinh', 'Thị Uyên'),
            ('Hồ', 'Văn Vinh'), ('Kiều', 'Thị Yến'), ('Cao', 'Văn Đức'),
            ('Lâm', 'Thị Hoa'), ('Trương', 'Văn Tuấn'), ('Lưu', 'Thị Mai'),
            ('Thái', 'Văn Sơn'), ('Hà', 'Thị Thủy'), ('Tạ', 'Văn Tài'),
            ('Đinh', 'Thị Linh'), ('Phan', 'Văn Đạt'), ('Vương', 'Thị Hằng')
        ]
        
        domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'student.edu.vn']
        for i in range(self.additional_students):
            profile = random.choice(student_profiles)
            last_name, first_name = random.choice(vietnamese_names)
            
            # Create unique username with better collision avoidance
            base_username = f"analytics_{last_name.lower().replace(' ', '').replace('ă', 'a').replace('â', 'a').replace('ư', 'u').replace('ô', 'o').replace('ê', 'e')}_{i+200}"
            username = base_username
            counter = 1
            
            # Ensure username uniqueness
            while User.objects.filter(username=username).exists():
                username = f"{base_username}_{counter}"
                counter += 1
            
            email = f"{username}@{random.choice(domains)}"
            
            # Create user
            user = User.objects.create_user(
                username=username,
                email=email,
                password='student123',
                first_name=first_name,
                last_name=last_name,
                date_joined=timezone.now() - timedelta(days=random.randint(1, self.days))
            )
            
            # Create profile with characteristics
            bio = f"Học viên {profile['level']} với mức độ tham gia {profile['engagement']}"
            if profile['performance'] == 'excellent':
                bio += ". Luôn đạt điểm cao và tích cực thảo luận."
            elif profile['performance'] == 'good':
                bio += ". Học tập nghiêm túc và đều đặn."
            elif profile['performance'] == 'fair':
                bio += ". Đang cố gắng cải thiện kết quả học tập."
            else:
                bio += ". Cần hỗ trợ thêm để theo kịp lớp."
            UserProfile.objects.get_or_create(
                user=user,
                defaults={
                    'user_type': 'student',
                    'bio': bio,
                    'phone_number': f"09{random.randint(10000000, 99999999)}",
                    'date_of_birth': datetime(
                        random.randint(1995, 2005),
                        random.randint(1, 12),
                        random.randint(1, 28)
                    )
                }
            )
            
            # Store profile characteristics as metadata (we can use this for enrollment patterns)
            user.profile.bio = json.dumps(profile)  # Store as JSON for later use
            user.profile.save()

    def generate_daily_activities(self):
        """Generate daily user activities for analytics"""
        self.stdout.write('Generating daily activities...')
        
        students = User.objects.filter(profile__user_type='student')
        courses = Course.objects.filter(published=True)
        
        # Generate activities for each day
        for day_offset in range(self.days):
            activity_date = timezone.now() - timedelta(days=day_offset)
            
            # Weekend factor (less activity on weekends)
            weekend_factor = 0.6 if activity_date.weekday() in [5, 6] else 1.0
            
            # Active students for this day (60-90% of all students)
            active_students = random.sample(
                list(students),
                int(len(students) * random.uniform(0.6, 0.9) * weekend_factor)
            )
            
            for student in active_students:
                # Number of activities per student (1-5 activities per day)
                num_activities = random.randint(1, 5)
                
                # Get student's enrolled courses
                enrolled_courses = Course.objects.filter(usercourse__user=student)
                
                if enrolled_courses.exists():
                    for _ in range(num_activities):
                        course = random.choice(enrolled_courses)
                        activity_type = random.choice([
                            'lesson_view', 'lesson_complete', 'quiz_attempt',
                            'course_progress', 'video_watch'
                        ])
                        
                        # Create activity log
                        AuditLog.objects.create(
                            user=student,
                            action='other',
                            description=f"Student activity: {activity_type} in {course.title}",
                            timestamp=activity_date + timedelta(
                                hours=random.randint(8, 22),
                                minutes=random.randint(0, 59)
                            ),
                            object_type='Course',
                            object_id=course.id,
                            ip_address=f"192.168.{random.randint(1, 10)}.{random.randint(1, 254)}"
                        )

    def create_enrollment_patterns(self):
        """Create realistic enrollment patterns over time"""
        self.stdout.write('Creating enrollment patterns...')
        
        students = User.objects.filter(profile__user_type='student')
        courses = Course.objects.filter(published=True)
        
        # Enrollment waves (simulate marketing campaigns, new course launches)
        enrollment_waves = [
            {'start_day': 80, 'duration': 7, 'intensity': 2.5},  # Course launch
            {'start_day': 60, 'duration': 14, 'intensity': 1.8}, # Marketing campaign
            {'start_day': 30, 'duration': 10, 'intensity': 2.0}, # Back to school
            {'start_day': 10, 'duration': 5, 'intensity': 1.5},  # Limited offer
        ]
        
        for student in students:
            # Each student enrolls in 1-4 courses over time
            num_courses = random.randint(1, 4)
            selected_courses = random.sample(list(courses), min(num_courses, len(courses)))
            
            for i, course in enumerate(selected_courses):
                # Check if student is already enrolled
                if UserCourse.objects.filter(user=student, course=course).exists():
                    continue
                
                # Determine enrollment date
                if i == 0:  # First course - can be any time
                    enrollment_date = timezone.now() - timedelta(days=random.randint(1, self.days))
                else:  # Subsequent courses - influenced by waves and previous enrollments
                    prev_enrollment = UserCourse.objects.filter(user=student).first()
                    if prev_enrollment:
                        # Enroll 7-30 days after previous course
                        base_date = prev_enrollment.enrolled_at + timedelta(days=random.randint(7, 30))
                    else:
                        base_date = timezone.now() - timedelta(days=random.randint(1, 60))
                    
                    # Check if enrollment falls in a wave period
                    enrollment_boost = 1.0
                    for wave in enrollment_waves:
                        wave_start = timezone.now() - timedelta(days=wave['start_day'])
                        wave_end = wave_start + timedelta(days=wave['duration'])
                        
                        if wave_start <= base_date <= wave_end:
                            enrollment_boost = wave['intensity']
                            break
                    
                    # Apply some randomness
                    if random.random() < (0.3 * enrollment_boost):
                        enrollment_date = base_date
                    else:
                        enrollment_date = timezone.now() - timedelta(days=random.randint(1, self.days))
                
                # Calculate initial progress based on time since enrollment
                days_since_enrollment = (timezone.now() - enrollment_date).days
                max_possible_progress = min(100, days_since_enrollment * random.uniform(1.0, 3.0))
                actual_progress = random.uniform(0, max_possible_progress)
                
                UserCourse.objects.get_or_create(
                    user=student,
                    course=course,
                    defaults={
                        'enrolled_at': enrollment_date,
                        'progress': actual_progress
                    }
                )

    def generate_quiz_performance_trends(self):
        """Generate quiz performance data showing learning trends"""
        self.stdout.write('Generating quiz performance trends...')
        
        enrollments = UserCourse.objects.all()
        
        for enrollment in enrollments:
            user = enrollment.user
            course = enrollment.course
            quizzes = Quiz.objects.filter(section__course=course).order_by('section__position', 'position')
            
            # Determine user's learning pattern
            try:
                profile_data = json.loads(user.profile.bio)
                performance_level = profile_data.get('performance', 'fair')
                engagement_level = profile_data.get('engagement', 'medium')
            except:
                performance_level = random.choice(['poor', 'fair', 'good', 'excellent'])
                engagement_level = random.choice(['low', 'medium', 'high'])
            
            # Performance base scores
            performance_bases = {
                'poor': 0.4, 'fair': 0.6, 'good': 0.75, 'excellent': 0.85
            }
            base_performance = performance_bases.get(performance_level, 0.6)
            
            # Engagement affects number of attempts
            attempt_multipliers = {'low': 1, 'medium': 1.5, 'high': 2}
            max_attempts = int(3 * attempt_multipliers.get(engagement_level, 1))
              # Progress through quizzes based on course progress
            progress_ratio = enrollment.progress / 100
            num_quizzes_attempted = max(1, int(len(quizzes) * progress_ratio))
            
            # Ensure we don't attempt more quizzes than available
            num_quizzes_attempted = min(num_quizzes_attempted, len(quizzes))
            
            # Skip if no quizzes available
            if len(quizzes) == 0:
                continue
            
            current_skill = base_performance
            
            for i, quiz in enumerate(quizzes[:num_quizzes_attempted]):
                # Number of attempts for this quiz
                num_attempts = random.randint(1, max_attempts)
                
                for attempt_num in range(num_attempts):
                    # Learning improvement over attempts
                    attempt_improvement = attempt_num * 0.08
                      # Skill improvement over time (learning effect)
                    skill_improvement = (i / max(1, len(quizzes))) * 0.15
                    
                    # Quiz difficulty factor (later quizzes are harder)
                    difficulty_factor = 1.0 - (i / max(1, len(quizzes))) * 0.2
                    
                    # Calculate final performance
                    final_performance = min(1.0, (current_skill + attempt_improvement + skill_improvement) * difficulty_factor)
                    
                    # Add some randomness
                    final_performance *= random.uniform(0.8, 1.2)
                    final_performance = max(0.1, min(1.0, final_performance))
                    
                    # Generate quiz results
                    questions = quiz.questions.all()
                    total_questions = len(questions)
                    correct_answers = int(total_questions * final_performance)
                    score = (correct_answers / total_questions) * 10
                    
                    # Generate answers
                    answers = {}
                    questions_list = list(questions)
                    random.shuffle(questions_list)
                    
                    for q_idx, question in enumerate(questions_list):
                        if q_idx < correct_answers:
                            correct_choice = question.choices.filter(is_correct=True).first()
                            answers[question.id] = correct_choice.id if correct_choice else None
                        else:
                            wrong_choices = question.choices.filter(is_correct=False)
                            if wrong_choices.exists():
                                answers[question.id] = random.choice(wrong_choices).id
                    
                    # Calculate attempt date
                    days_after_enrollment = random.randint(i * 3, i * 7 + 14)
                    attempt_date = enrollment.enrolled_at + timedelta(days=days_after_enrollment)
                    
                    # Don't create attempts in the future
                    if attempt_date > timezone.now():
                        continue
                    
                    QuizAttempt.objects.create(
                        user=user,
                        quiz=quiz,
                        score=round(score, 2),
                        correct_count=correct_answers,
                        total_count=total_questions,
                        answers=answers,
                        submitted_at=attempt_date
                    )
                
                # Update current skill (learning effect)
                current_skill = min(0.95, current_skill + 0.02)

    def create_engagement_metrics(self):
        """Create user engagement metrics"""
        self.stdout.write('Creating engagement metrics...')
        
        # Create system configurations for tracking engagement
        admin_user = User.objects.filter(is_superuser=True).first()
        if not admin_user:
            return
        
        engagement_configs = [
            {
                'key': 'daily_active_users_target',
                'value': '75',
                'description': 'Target percentage of daily active users',
                'category': 'metrics'
            },
            {
                'key': 'avg_session_duration_target',
                'value': '45',
                'description': 'Target average session duration (minutes)',
                'category': 'metrics'
            },
            {
                'key': 'course_completion_rate_target',
                'value': '65',
                'description': 'Target course completion rate (%)',
                'category': 'metrics'
            },
            {
                'key': 'quiz_pass_rate_target',
                'value': '80',
                'description': 'Target quiz pass rate (%)',
                'category': 'metrics'
            }
        ]
        
        for config in engagement_configs:
            SystemConfiguration.objects.get_or_create(
                key=config['key'],
                defaults={
                    'value': config['value'],
                    'description': config['description'],
                    'category': config['category'],
                    'is_public': False,
                    'updated_by': admin_user
                }
            )

    def generate_completion_statistics(self):
        """Generate course completion statistics"""
        self.stdout.write('Generating completion statistics...')
        
        enrollments = UserCourse.objects.all()
        
        for enrollment in enrollments:
            # Determine if course should be completed based on time and progress
            days_enrolled = (timezone.now().date() - enrollment.enrolled_at.date()).days
            
            # Course completion likelihood based on progress and time
            if enrollment.progress >= 95:
                completion_probability = 0.9
            elif enrollment.progress >= 80:
                completion_probability = 0.7
            elif enrollment.progress >= 60:
                completion_probability = 0.4
            else:
                completion_probability = 0.1
            
            # Time factor (longer enrollment increases completion chance)
            time_factor = min(1.5, 1.0 + (days_enrolled / 90))
            completion_probability *= time_factor
            
            if random.random() < completion_probability:
                # Mark as completed
                enrollment.progress = 100
                enrollment.save()
                
                # Create completion audit log
                completion_date = enrollment.enrolled_at + timedelta(
                    days=random.randint(int(days_enrolled * 0.8), days_enrolled)
                )
                
                AuditLog.objects.create(
                    user=enrollment.user,
                    action='other',
                    description=f"Course completed: {enrollment.course.title}",
                    timestamp=completion_date,
                    object_type='Course',
                    object_id=enrollment.course.id,
                    ip_address=f"192.168.{random.randint(1, 10)}.{random.randint(1, 254)}"
                )

    def create_teacher_metrics(self):
        """Create teacher performance metrics"""
        self.stdout.write('Creating teacher metrics...')
        
        teachers = User.objects.filter(profile__user_type='teacher')
        
        for teacher in teachers:
            teacher_courses = Course.objects.filter(creator=teacher)
            
            for course in teacher_courses:
                # Calculate metrics
                total_enrollments = UserCourse.objects.filter(course=course).count()
                completed_enrollments = UserCourse.objects.filter(course=course, progress=100).count()
                
                # Create teacher activity logs
                activities = [
                    f"Updated course content for {course.title}",
                    f"Responded to student questions in {course.title}",
                    f"Created new quiz for {course.title}",
                    f"Added supplementary materials to {course.title}",
                    f"Reviewed student progress in {course.title}"
                ]
                
                # Generate 2-5 activities per course
                for _ in range(random.randint(2, 5)):
                    activity_date = timezone.now() - timedelta(
                        days=random.randint(1, self.days),
                        hours=random.randint(8, 18)
                    )
                    
                    AuditLog.objects.create(
                        user=teacher,
                        action='update',
                        description=random.choice(activities),
                        timestamp=activity_date,
                        object_type='Course',
                        object_id=course.id,
                        ip_address=f"10.0.{random.randint(1, 10)}.{random.randint(1, 254)}"
                    )

    def display_analytics_summary(self):
        """Display analytics summary"""
        self.stdout.write('\n' + '='*60)
        self.stdout.write(self.style.SUCCESS('ANALYTICS DATA SUMMARY'))
        self.stdout.write('='*60)
        
        # User statistics
        total_users = User.objects.count()
        students = User.objects.filter(profile__user_type='student').count()
        teachers = User.objects.filter(profile__user_type='teacher').count()
        
        self.stdout.write(f'Total Users: {total_users}')
        self.stdout.write(f'- Students: {students}')
        self.stdout.write(f'- Teachers: {teachers}')
        
        # Course statistics
        total_courses = Course.objects.count()
        published_courses = Course.objects.filter(published=True).count()
        
        self.stdout.write(f'\nCourses: {total_courses} ({published_courses} published)')
        
        # Enrollment statistics
        total_enrollments = UserCourse.objects.count()
        completed_courses = UserCourse.objects.filter(progress=100).count()
        completion_rate = (completed_courses / total_enrollments * 100) if total_enrollments > 0 else 0
        
        self.stdout.write(f'\nEnrollments: {total_enrollments}')
        self.stdout.write(f'Completed: {completed_courses} ({completion_rate:.1f}%)')
          # Quiz statistics
        total_attempts = QuizAttempt.objects.count()
        avg_score = QuizAttempt.objects.aggregate(avg_score=Avg('score'))['avg_score'] or 0
        
        self.stdout.write(f'\nQuiz Attempts: {total_attempts}')
        self.stdout.write(f'Average Score: {avg_score:.2f}/10')
        
        # Activity statistics
        total_activities = AuditLog.objects.count()
        recent_activities = AuditLog.objects.filter(
            timestamp__gte=timezone.now() - timedelta(days=7)
        ).count()
        
        self.stdout.write(f'\nActivity Logs: {total_activities}')
        self.stdout.write(f'Recent (7 days): {recent_activities}')
          # Top performing courses
        self.stdout.write(f'\nTop Courses by Enrollment:')
        from django.db.models import Count
        top_courses = Course.objects.annotate(
            enrollment_count=Count('usercourse')
        ).order_by('-enrollment_count')[:3]
        
        for i, course in enumerate(top_courses, 1):
            self.stdout.write(f'{i}. {course.title} ({course.enrollment_count} enrollments)')
        
        self.stdout.write('='*60)
