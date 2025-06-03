from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

urlpatterns = [
    # Course URLs
    path('courses/', views.CourseListView.as_view(), name='course-list'),
    path('courses/create/', views.CourseCreateView.as_view(), name='course-create'),
    path('courses/<int:pk>/', views.CourseDetailView.as_view(), name='course-detail'),
    path('courses/<int:pk>/update/', views.CourseUpdateView.as_view(), name='course-update'),
    path('courses/<int:pk>/delete/', views.CourseDeleteView.as_view(), name='course-delete'),
    path('courses/my-courses/', views.MyCourseListView.as_view(), name='my-courses'),
    
    # Course Enrollment URLs
    path('courses/<int:course_id>/enroll/', views.CourseEnrollView.as_view(), name='course-enroll'),
    path('courses/<int:course_id>/unenroll/', views.CourseUnenrollView.as_view(), name='course-unenroll'),
    path('courses/<int:course_id>/students/', views.CourseStudentsView.as_view(), name='course-students'),
    
    # Section URLs
    path('courses/<int:course_id>/sections/', views.SectionListCreateView.as_view(), name='section-list-create'),
    path('sections/<int:pk>/', views.SectionDetailView.as_view(), name='section-detail'),
    
    # Lesson URLs
    path('sections/<int:section_id>/lessons/', views.LessonListCreateView.as_view(), name='lesson-list-create'),
    path('lessons/<int:pk>/', views.LessonDetailView.as_view(), name='lesson-detail'),
    
    # Quiz URLs
    path('sections/<int:section_id>/quizzes/', views.QuizListCreateView.as_view(), name='quiz-list-create'),
    path('quizzes/<int:pk>/', views.QuizDetailView.as_view(), name='quiz-detail'),
    
    # Question URLs
    path('quizzes/<int:quiz_id>/questions/', views.QuestionListCreateView.as_view(), name='question-list-create'),
    path('questions/<int:pk>/', views.QuestionDetailView.as_view(), name='question-detail'),
    
    # Choice URLs
    path('questions/<int:question_id>/choices/', views.ChoiceListCreateView.as_view(), name='choice-list-create'),
    path('choices/<int:pk>/', views.ChoiceDetailView.as_view(), name='choice-detail'),
    
    # Dashboard URLs
    path('dashboard/teacher/', views.TeacherDashboardView.as_view(), name='teacher-dashboard'),
    path('dashboard/admin/', views.AdminDashboardView.as_view(), name='admin-dashboard'),
]
