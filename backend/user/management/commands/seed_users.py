from django.core.management.base import BaseCommand
from django.db import transaction
from django.contrib.auth.models import User
from user.models.user_profile import UserProfile

class Command(BaseCommand):
    help = 'Seeds the database with users (admin, teachers, students)'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.NOTICE('Starting user seeding...'))
        
        with transaction.atomic():
            self.create_admin_user()
            self.create_teachers()
            self.create_students()
            
        self.stdout.write(self.style.SUCCESS('User seeding completed successfully!'))

    def create_user(self, username, password, email, first_name, last_name, user_type):
        """Helper method to create a user with the given parameters."""
        try:
            # Check if user exists
            if User.objects.filter(username=username).exists():
                self.stdout.write(self.style.WARNING(f"User {username} already exists. Skipping..."))
                return User.objects.get(username=username)
            
            # Create user
            user = User.objects.create_user(
                username=username,
                password=password,
                email=email,
                first_name=first_name,
                last_name=last_name
            )
            
            # Create or update profile
            profile, created = UserProfile.objects.get_or_create(
                user=user,
                defaults={'user_type': user_type}
            )
            
            if not created:
                profile.user_type = user_type
                profile.save()
            
            self.stdout.write(self.style.SUCCESS(f"Created user: {username} ({user_type})"))
            return user
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error creating user {username}: {e}"))
            return None

    def create_admin_user(self):
        """Create admin user."""
        self.stdout.write(self.style.NOTICE('Creating admin user...'))
        self.create_user(
            username='admin',
            password='admin123',
            email='admin@example.com',
            first_name='Admin',
            last_name='User',
            user_type='admin'
        )

    def create_teachers(self):
        """Create teacher users."""
        self.stdout.write(self.style.NOTICE('Creating teacher users...'))
        teachers = [
            {
                'username': 'teacher1',
                'password': 'teacher123',
                'email': 'teacher1@example.com',
                'first_name': 'Thầy',
                'last_name': 'Nguyễn',
            },
            {
                'username': 'teacher2',
                'password': 'teacher123',
                'email': 'teacher2@example.com',
                'first_name': 'Cô',
                'last_name': 'Phạm',
            },
        ]
        
        for teacher in teachers:
            self.create_user(
                username=teacher['username'],
                password=teacher['password'],
                email=teacher['email'],
                first_name=teacher['first_name'],
                last_name=teacher['last_name'],
                user_type='teacher'
            )

    def create_students(self):
        """Create student users."""
        self.stdout.write(self.style.NOTICE('Creating student users...'))
        students = [
            {
                'username': 'student1',
                'password': 'student123',
                'email': 'student1@example.com',
                'first_name': 'Nam',
                'last_name': 'Trần',
            },
            {
                'username': 'student2',
                'password': 'student123',
                'email': 'student2@example.com',
                'first_name': 'Lan',
                'last_name': 'Lê',
            },
            {
                'username': 'student3',
                'password': 'student123',
                'email': 'student3@example.com',
                'first_name': 'Hoa',
                'last_name': 'Đỗ',
            },
            {
                'username': 'student4',
                'password': 'student123',
                'email': 'student4@example.com',
                'first_name': 'Minh',
                'last_name': 'Ngô',
            },
            {
                'username': 'student5',
                'password': 'student123',
                'email': 'student5@example.com',
                'first_name': 'Tuấn',
                'last_name': 'Vũ',
            },
        ]
        
        for student in students:
            self.create_user(
                username=student['username'],
                password=student['password'],
                email=student['email'],
                first_name=student['first_name'],
                last_name=student['last_name'],
                user_type='student'
            )
