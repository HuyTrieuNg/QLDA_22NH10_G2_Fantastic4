from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth.models import User
from .serializers import (
    UserManagementSerializer, CourseAdminSerializer, SectionAdminSerializer, 
    LessonAdminSerializer, QuizAdminSerializer, QuestionAdminSerializer, 
    ChoiceAdminSerializer, UserCourseAdminSerializer, 
    SystemConfigurationSerializer, AuditLogSerializer
)
from .permissions import IsAdmin
from user.models.user_profile import UserProfile
from course.models import Course, Section, Lesson, Quiz, Question, Choice, UserCourse
from .models import SystemConfiguration, AuditLog
from rest_framework.views import APIView

class UserManagementViewSet(viewsets.ModelViewSet):
    """
    Admin viewset for managing users
    """
    queryset = User.objects.all()
    serializer_class = UserManagementSerializer
    permission_classes = [IsAdmin]
    
    def get_queryset(self):
        """
        Filter users based on is_active status if requested
        """
        queryset = User.objects.all()
        active_status = self.request.query_params.get('is_active', None)
        
        if active_status is not None:
            # Convert string to boolean
            is_active = active_status.lower() == 'true'
            queryset = queryset.filter(is_active=is_active)
        
        return queryset
    
    def destroy(self, request, *args, **kwargs):
        """
        Override delete to block user instead of permanently deleting
        """
        user = self.get_object()
        user.is_active = False
        user.save()
        
        return Response({
            "message": f"User '{user.username}' has been blocked",
            "username": user.username,
            "is_active": False
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """
        Get only active users
        """
        active_users = User.objects.filter(is_active=True)
        serializer = self.get_serializer(active_users, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def blocked(self, request):
        """
        Get only blocked (inactive) users
        """
        blocked_users = User.objects.filter(is_active=False)
        serializer = self.get_serializer(blocked_users, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def change_user_type(self, request, pk=None):
        """
        Change user type (student, teacher, admin)
        """
        user = self.get_object()
        user_type = request.data.get('user_type')
        
        if user_type not in ['student', 'teacher', 'admin']:
            return Response(
                {"error": "Invalid user type. Choose 'student', 'teacher', or 'admin'."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            profile = user.profile
            profile.user_type = user_type
            profile.save()
            
            return Response({
                "message": f"User type successfully changed to {user_type}",
                "username": user.username,
                "user_type": user_type
            })
        except UserProfile.DoesNotExist:
            return Response(
                {"error": "User profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['patch'])
    def toggle_active_status(self, request, pk=None):
        """
        Toggle user active status (block/unblock account)
        """
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        
        status_text = "unblocked" if user.is_active else "blocked"
        return Response({
            "message": f"User account has been {status_text}",
            "username": user.username,
            "is_active": user.is_active
        })

class CourseManagementViewSet(viewsets.ModelViewSet):
    """
    Admin viewset for managing courses
    """
    queryset = Course.objects.all()
    serializer_class = CourseAdminSerializer
    permission_classes = [IsAdmin]
    
    def retrieve(self, request, *args, **kwargs):
        """
        Get a course with its full content (sections, lessons, quizzes)
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def detailed_stats(self, request, pk=None):
        """
        Get detailed statistics for a course
        """
        course = self.get_object()
        
        # Get basic course data
        course_data = CourseAdminSerializer(course).data
        
        # Get student enrollment data
        enrolled_students = UserCourse.objects.filter(course=course).count()
        
        # Get content statistics
        sections_count = Section.objects.filter(course=course).count()
        lessons_count = Lesson.objects.filter(section__course=course).count()
        quizzes_count = Quiz.objects.filter(section__course=course).count()
        
        # Add statistics to response
        stats = {
            "enrolled_students": enrolled_students,
            "sections_count": sections_count,
            "lessons_count": lessons_count,
            "quizzes_count": quizzes_count,
        }
        
        course_data['statistics'] = stats
        
        return Response(course_data)

class SectionManagementViewSet(viewsets.ModelViewSet):
    """
    Admin viewset for managing sections
    """
    queryset = Section.objects.all()
    serializer_class = SectionAdminSerializer
    permission_classes = [IsAdmin]

class LessonManagementViewSet(viewsets.ModelViewSet):
    """
    Admin viewset for managing lessons
    """
    queryset = Lesson.objects.all()
    serializer_class = LessonAdminSerializer
    permission_classes = [IsAdmin]

class QuizManagementViewSet(viewsets.ModelViewSet):
    """
    Admin viewset for managing quizzes
    """
    queryset = Quiz.objects.all()
    serializer_class = QuizAdminSerializer
    permission_classes = [IsAdmin]

class QuestionManagementViewSet(viewsets.ModelViewSet):
    """
    Admin viewset for managing questions
    """
    queryset = Question.objects.all()
    serializer_class = QuestionAdminSerializer
    permission_classes = [IsAdmin]

class ChoiceManagementViewSet(viewsets.ModelViewSet):
    """
    Admin viewset for managing choices
    """
    queryset = Choice.objects.all()
    serializer_class = ChoiceAdminSerializer
    permission_classes = [IsAdmin]

class UserCourseManagementViewSet(viewsets.ModelViewSet):
    """
    Admin viewset for managing user-course enrollments
    """
    queryset = UserCourse.objects.all()
    serializer_class = UserCourseAdminSerializer
    permission_classes = [IsAdmin]

class SystemConfigurationViewSet(viewsets.ModelViewSet):
    """
    Admin viewset for managing system configurations
    """
    queryset = SystemConfiguration.objects.all()
    serializer_class = SystemConfigurationSerializer
    permission_classes = [IsAdmin]
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """
        Get configurations grouped by category
        """
        categories = {}
        for config in SystemConfiguration.objects.all():
            if config.category not in categories:
                categories[config.category] = []
            
            categories[config.category].append(
                SystemConfigurationSerializer(config).data
            )
        
        return Response(categories)
    
    @action(detail=False, methods=['get'])
    def public(self, request):
        """
        Get all public configurations (accessible by non-admins)
        """
        public_configs = SystemConfiguration.objects.filter(is_public=True)
        serializer = SystemConfigurationSerializer(public_configs, many=True)
        return Response(serializer.data)

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Admin viewset for viewing audit logs (read-only)
    """
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdmin]
    filterset_fields = ['action', 'user', 'object_type']

class DashboardView(APIView):
    """
    Admin dashboard with system statistics
    """
    permission_classes = [IsAdmin]
    
    def get(self, request):
        # User statistics
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        teacher_count = UserProfile.objects.filter(user_type='teacher').count()
        student_count = UserProfile.objects.filter(user_type='student').count()
        admin_count = UserProfile.objects.filter(user_type='admin').count()
        
        # Course statistics
        total_courses = Course.objects.count()
        published_courses = Course.objects.filter(published=True).count()
        unpublished_courses = Course.objects.filter(published=False).count()
        
        # Content statistics
        section_count = Section.objects.count()
        lesson_count = Lesson.objects.count()
        quiz_count = Quiz.objects.count()
        
        # Enrollment statistics
        total_enrollments = UserCourse.objects.count()
        
        # Recent activity
        recent_logs = AuditLogSerializer(
            AuditLog.objects.order_by('-timestamp')[:10], 
            many=True
        ).data
        
        return Response({
            "users": {
                "total": total_users,
                "active": active_users,
                "inactive": total_users - active_users,
                "teachers": teacher_count,
                "students": student_count,
                "admins": admin_count
            },
            "courses": {
                "total": total_courses,
                "published": published_courses,
                "unpublished": unpublished_courses
            },
            "content": {
                "sections": section_count,
                "lessons": lesson_count,
                "quizzes": quiz_count
            },
            "enrollments": {
                "total": total_enrollments
            },
            "recent_activity": recent_logs
        })
