from django.urls import path
from . import views

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
]
