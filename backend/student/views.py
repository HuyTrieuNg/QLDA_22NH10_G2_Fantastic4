from django.shortcuts import get_object_or_404
from rest_framework import generics, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q
from user.permissions import IsStudent
from course.models import Course, Section, Lesson, UserCourse
from .serializers import (
    StudentCourseListSerializer, 
    StudentCourseDetailSerializer, 
    StudentLessonSerializer,
    EnrolledCourseSerializer
)


class StudentCourseListView(generics.ListAPIView):
    """
    Danh sách tất cả các khóa học đã xuất bản (dành cho học viên)
    Có thể tìm kiếm theo tiêu đề, mô tả, danh mục
    """
    serializer_class = StudentCourseListSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description', 'category']
    
    def get_queryset(self):
        queryset = Course.objects.filter(published=True)
        
        # Tìm kiếm theo từ khóa
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(description__icontains=search) |
                Q(category__icontains=search)
            )
        
        # Lọc theo danh mục
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category__icontains=category)
            
        return queryset.order_by('-published_at')


class StudentCourseDetailView(generics.RetrieveAPIView):
    """
    Chi tiết khóa học (cho học viên)
    Hiển thị thông tin chi tiết khóa học và danh sách các bài giảng
    """
    serializer_class = StudentCourseDetailSerializer
    permission_classes = [AllowAny]
    
    def get_object(self):
        course_id = self.kwargs['pk']
        # Chỉ hiển thị khóa học đã xuất bản
        return get_object_or_404(Course, id=course_id, published=True)


class StudentEnrollCourseView(APIView):
    """
    Đăng ký khóa học (dành cho học viên đã đăng nhập)
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        course = get_object_or_404(Course, id=pk, published=True)
        
        # Kiểm tra xem học viên đã đăng ký khóa học này chưa
        if UserCourse.objects.filter(user=request.user, course=course).exists():
            return Response(
                {"detail": "Bạn đã đăng ký khóa học này rồi"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Đăng ký khóa học mới
        UserCourse.objects.create(user=request.user, course=course)
        
        return Response(
            {"detail": "Đăng ký khóa học thành công"}, 
            status=status.HTTP_201_CREATED
        )


class StudentEnrolledCoursesView(generics.ListAPIView):
    """
    Danh sách khóa học đã đăng ký của học viên và tiến độ học tập
    """
    serializer_class = EnrolledCourseSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserCourse.objects.filter(user=self.request.user).order_by('-enrolled_at')


class StudentLessonDetailView(generics.RetrieveAPIView):
    """
    Chi tiết bài giảng (cho học viên đã đăng ký khóa học)
    """
    serializer_class = StudentLessonSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        lesson_id = self.kwargs['pk']
        lesson = get_object_or_404(Lesson, id=lesson_id)
        
        # Kiểm tra xem học viên đã đăng ký khóa học chứa bài giảng này chưa
        course = lesson.section.course
        if not UserCourse.objects.filter(user=self.request.user, course=course).exists():
            self.permission_denied(self.request, message="Bạn chưa đăng ký khóa học này")
        
        return lesson
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        
        # Cập nhật tiến độ học tập nếu cần (logic đơn giản)
        # Trong thực tế, bạn có thể muốn lưu trữ tiến độ chi tiết hơn cho từng bài giảng
        course = instance.section.course
        user_course = UserCourse.objects.get(user=request.user, course=course)
        
        # Logic đơn giản: Tính tổng số bài giảng và tiến độ dựa trên số bài đã xem
        # Logic này sẽ cập nhật tiến độ mỗi khi học viên xem bài giảng
        total_lessons = 0
        for section in course.sections.all():
            total_lessons += section.lessons.count()
        
        # Trong thực tế, bạn sẽ cần một bảng riêng để theo dõi các bài giảng đã xem
        # Ở đây chỉ làm đơn giản bằng cách tăng tiến độ mỗi khi xem bài
        if total_lessons > 0:
            progress_increment = (100 / total_lessons) 
            # Chỉ cập nhật nếu tiến độ chưa đạt tối đa
            if user_course.progress < 100:
                user_course.progress = min(user_course.progress + progress_increment, 100)
                user_course.save()
        
        return Response(serializer.data)
