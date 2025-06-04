from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserManagementViewSet, CourseManagementViewSet, SectionManagementViewSet,
    LessonManagementViewSet, QuizManagementViewSet, QuestionManagementViewSet,
    ChoiceManagementViewSet, UserCourseManagementViewSet, DashboardView,
    SystemConfigurationViewSet, AuditLogViewSet
)

# Create a router for ViewSets
router = DefaultRouter()
router.register('users', UserManagementViewSet, basename='admin-users')
router.register('courses', CourseManagementViewSet, basename='admin-courses')
router.register('sections', SectionManagementViewSet, basename='admin-sections')
router.register('lessons', LessonManagementViewSet, basename='admin-lessons')
router.register('quizzes', QuizManagementViewSet, basename='admin-quizzes')
router.register('questions', QuestionManagementViewSet, basename='admin-questions')
router.register('choices', ChoiceManagementViewSet, basename='admin-choices')
router.register('enrollments', UserCourseManagementViewSet, basename='admin-enrollments')
router.register('system-config', SystemConfigurationViewSet, basename='admin-system-config')
router.register('audit-logs', AuditLogViewSet, basename='admin-audit-logs')

# Additional non-ViewSet URLs
urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', DashboardView.as_view(), name='admin-dashboard'),
]
