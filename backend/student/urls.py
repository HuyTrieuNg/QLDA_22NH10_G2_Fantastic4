from django.urls import path
from . import views
from .views import StudentLessonSummarizeView, StudentQuizAIFeedbackView

app_name = 'student'

urlpatterns = [
    # Danh sách khóa học và tìm kiếm
    path('courses/', views.StudentCourseListView.as_view(), name='course-list'),
    
    # Chi tiết khóa học
    path('courses/<int:pk>/', views.StudentCourseDetailView.as_view(), name='course-detail'),
    
    # Đăng ký khóa học
    path('courses/<int:pk>/enroll/', views.StudentEnrollCourseView.as_view(), name='course-enroll'),
    
    # Danh sách khóa học đã đăng ký và tiến độ học tập
    path('my-courses/', views.StudentEnrolledCoursesView.as_view(), name='enrolled-courses'),
    
    # Xem bài giảng
    path('lessons/<int:pk>/', views.StudentLessonDetailView.as_view(), name='lesson-detail'),

    # Lịch sử làm bài quiz
    path('quiz-history/', views.StudentQuizHistoryListView.as_view(), name='quiz-history'),
    path('quizzes/<int:quiz_id>/history/', views.StudentQuizHistoryByQuizView.as_view(), name='quiz-history-by-quiz'),

    # Nộp bài kiểm tra
    path('quizzes/<int:quiz_id>/submit/', views.StudentQuizSubmitView.as_view(), name='quiz-submit'),

    # Tóm tắt bài học
    path('lessons/<int:lesson_id>/summarize/', StudentLessonSummarizeView.as_view(), name='student-lesson-summarize'),

    # Nhận xét AI cho quiz attempt
    path('quiz-attempts/<int:quiz_attempt_id>/ai-feedback/', StudentQuizAIFeedbackView.as_view(), name='quiz-attempt-ai-feedback'),
]
