from django.shortcuts import render, get_object_or_404
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from django.db.models import Q, Count
from django.db import models

# Import custom permissions
from user.permissions import IsTeacherOrAdmin, IsTeacher, IsStudent, IsOwnerOrAdminOrTeacher

# Import models and serializers
from .models import Course, Section, Lesson, Quiz, Question, Choice, UserCourse
from .serializers import (
    CourseSerializer, CourseCreateUpdateSerializer, SectionSerializer, 
    LessonSerializer, QuizSerializer, QuestionSerializer, ChoiceSerializer,
    UserCourseSerializer, SectionCreateUpdateSerializer, LessonCreateUpdateSerializer,
    QuizCreateUpdateSerializer, QuestionCreateUpdateSerializer, ChoiceCreateUpdateSerializer
)


# Course Views
class CourseListView(generics.ListAPIView):
    """
    Danh sách tất cả khóa học đã được xuất bản (cho học viên)
    Hoặc tất cả khóa học (cho giáo viên và admin)
    """
    serializer_class = CourseSerializer
    permission_classes = [AllowAny]  # Cho phép xem danh sách khóa học công khai
    
    def get_queryset(self):
        queryset = Course.objects.all()
        
        # Nếu user không phải teacher/admin, chỉ hiển thị khóa học đã xuất bản
        if not (self.request.user.is_authenticated and 
                (self.request.user.is_staff or 
                 (hasattr(self.request.user, 'profile') and 
                  self.request.user.profile.user_type in ['teacher', 'admin']))):
            queryset = queryset.filter(published=True)
        
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
            
        return queryset.order_by('-created_at')


class CourseDetailView(generics.RetrieveAPIView):
    """
    Chi tiết khóa học
    """
    serializer_class = CourseSerializer
    permission_classes = [AllowAny]
    
    def get_object(self):
        course_id = self.kwargs['pk']
        course = get_object_or_404(Course, id=course_id)
        
        # Nếu khóa học chưa xuất bản, chỉ creator, teacher và admin mới xem được
        if not course.published:
            if not self.request.user.is_authenticated:
                self.permission_denied(self.request)
            
            if not (course.creator == self.request.user or 
                    self.request.user.is_staff or
                    (hasattr(self.request.user, 'profile') and 
                     self.request.user.profile.user_type in ['teacher', 'admin'])):
                self.permission_denied(self.request)
        
        return course


class CourseCreateView(generics.CreateAPIView):
    """
    Tạo khóa học mới (chỉ giáo viên và admin)
    """
    serializer_class = CourseCreateUpdateSerializer
    permission_classes = [IsTeacherOrAdmin]
    
    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)


class CourseUpdateView(generics.UpdateAPIView):
    """
    Cập nhật khóa học (chỉ creator, giáo viên và admin)
    """
    serializer_class = CourseCreateUpdateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        course = get_object_or_404(Course, id=self.kwargs['pk'])
        
        # Kiểm tra quyền: chỉ creator, teacher hoặc admin mới được sửa
        if not (course.creator == self.request.user or 
                self.request.user.is_staff or
                (hasattr(self.request.user, 'profile') and 
                 self.request.user.profile.user_type in ['teacher', 'admin'])):
            self.permission_denied(self.request)
        
        return course


class CourseDeleteView(generics.DestroyAPIView):
    """
    Xóa khóa học (chỉ creator, giáo viên và admin)
    """
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        course = get_object_or_404(Course, id=self.kwargs['pk'])
        
        # Kiểm tra quyền: chỉ creator, teacher hoặc admin mới được xóa
        if not (course.creator == self.request.user or 
                self.request.user.is_staff or
                (hasattr(self.request.user, 'profile') and 
                 self.request.user.profile.user_type in ['teacher', 'admin'])):
            self.permission_denied(self.request)
        
        return course


class MyCourseListView(generics.ListAPIView):
    """
    Danh sách khóa học của tôi (giáo viên xem khóa học đã tạo, học viên xem khóa học đã đăng ký)
    """
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Nếu là teacher hoặc admin, hiển thị khóa học đã tạo
        if (user.is_staff or 
            (hasattr(user, 'profile') and user.profile.user_type in ['teacher', 'admin'])):
            return Course.objects.filter(creator=user).order_by('-created_at')
        
        # Nếu là student, hiển thị khóa học đã đăng ký
        enrolled_courses = UserCourse.objects.filter(user=user).values_list('course', flat=True)
        return Course.objects.filter(id__in=enrolled_courses).order_by('-created_at')


# Course Enrollment Views
class CourseEnrollView(APIView):
    """
    Đăng ký khóa học (chỉ học viên)
    """
    permission_classes = [IsStudent]
    
    def post(self, request, course_id):
        course = get_object_or_404(Course, id=course_id, published=True)
        
        # Kiểm tra xem đã đăng ký chưa
        if UserCourse.objects.filter(user=request.user, course=course).exists():
            return Response(
                {"detail": "Bạn đã đăng ký khóa học này rồi"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Tạo đăng ký mới
        UserCourse.objects.create(user=request.user, course=course)
        
        return Response(
            {"detail": "Đăng ký khóa học thành công"}, 
            status=status.HTTP_201_CREATED
        )


class CourseUnenrollView(APIView):
    """
    Hủy đăng ký khóa học (chỉ học viên)
    """
    permission_classes = [IsStudent]
    
    def delete(self, request, course_id):
        course = get_object_or_404(Course, id=course_id)
        
        try:
            enrollment = UserCourse.objects.get(user=request.user, course=course)
            enrollment.delete()
            return Response(
                {"detail": "Hủy đăng ký khóa học thành công"}, 
                status=status.HTTP_200_OK
            )
        except UserCourse.DoesNotExist:
            return Response(
                {"detail": "Bạn chưa đăng ký khóa học này"}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class CourseStudentsView(generics.ListAPIView):
    """
    Danh sách học viên đã đăng ký khóa học (chỉ creator, giáo viên và admin)
    """
    serializer_class = UserCourseSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        course = get_object_or_404(Course, id=self.kwargs['course_id'])
        
        # Kiểm tra quyền: chỉ creator, teacher hoặc admin mới được xem
        if not (course.creator == self.request.user or 
                self.request.user.is_staff or
                (hasattr(self.request.user, 'profile') and 
                 self.request.user.profile.user_type in ['teacher', 'admin'])):
            self.permission_denied(self.request)
        
        return UserCourse.objects.filter(course=course).order_by('-enrolled_at')


# Section Views
class SectionListCreateView(generics.ListCreateAPIView):
    """
    Danh sách và tạo section cho khóa học
    """
    serializer_class = SectionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        course = get_object_or_404(Course, id=self.kwargs['course_id'])
        return Section.objects.filter(course=course).order_by('position')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return SectionCreateUpdateSerializer
        return SectionSerializer
    
    def perform_create(self, serializer):
        course = get_object_or_404(Course, id=self.kwargs['course_id'])
        
        # Kiểm tra quyền: chỉ creator, teacher hoặc admin mới được tạo
        if not (course.creator == self.request.user or 
                self.request.user.is_staff or
                (hasattr(self.request.user, 'profile') and 
                 self.request.user.profile.user_type in ['teacher', 'admin'])):
            self.permission_denied(self.request)
        
        serializer.save(course=course)


class SectionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Chi tiết, cập nhật và xóa section
    """
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return SectionCreateUpdateSerializer
        return SectionSerializer
    
    def get_object(self):
        section = get_object_or_404(Section, id=self.kwargs['pk'])
        
        # Kiểm tra quyền cho các thao tác sửa/xóa
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            if not (section.course.creator == self.request.user or 
                    self.request.user.is_staff or
                    (hasattr(self.request.user, 'profile') and 
                     self.request.user.profile.user_type in ['teacher', 'admin'])):
                self.permission_denied(self.request)
        
        return section


# Lesson Views  
class LessonListCreateView(generics.ListCreateAPIView):
    """
    Danh sách và tạo lesson cho section
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        section = get_object_or_404(Section, id=self.kwargs['section_id'])
        return Lesson.objects.filter(section=section).order_by('position')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return LessonCreateUpdateSerializer
        return LessonSerializer
    
    def perform_create(self, serializer):
        section = get_object_or_404(Section, id=self.kwargs['section_id'])
        
        # Kiểm tra quyền: chỉ creator, teacher hoặc admin mới được tạo
        if not (section.course.creator == self.request.user or 
                self.request.user.is_staff or
                (hasattr(self.request.user, 'profile') and 
                 self.request.user.profile.user_type in ['teacher', 'admin'])):
            self.permission_denied(self.request)
        
        serializer.save(section=section)


class LessonDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Chi tiết, cập nhật và xóa lesson
    """
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return LessonCreateUpdateSerializer
        return LessonSerializer
    
    def get_object(self):
        lesson = get_object_or_404(Lesson, id=self.kwargs['pk'])
        
        # Kiểm tra quyền cho các thao tác sửa/xóa
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            if not (lesson.section.course.creator == self.request.user or 
                    self.request.user.is_staff or
                    (hasattr(self.request.user, 'profile') and 
                     self.request.user.profile.user_type in ['teacher', 'admin'])):
                self.permission_denied(self.request)
        
        return lesson


# Quiz Views
class QuizListCreateView(generics.ListCreateAPIView):
    """
    Danh sách và tạo quiz cho section
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        section = get_object_or_404(Section, id=self.kwargs['section_id'])
        return Quiz.objects.filter(section=section).order_by('position')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return QuizCreateUpdateSerializer
        return QuizSerializer
    
    def perform_create(self, serializer):
        section = get_object_or_404(Section, id=self.kwargs['section_id'])
        
        # Kiểm tra quyền: chỉ creator, teacher hoặc admin mới được tạo
        if not (section.course.creator == self.request.user or 
                self.request.user.is_staff or
                (hasattr(self.request.user, 'profile') and 
                 self.request.user.profile.user_type in ['teacher', 'admin'])):
            self.permission_denied(self.request)
        
        serializer.save(section=section)


class QuizDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Chi tiết, cập nhật và xóa quiz
    """
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return QuizCreateUpdateSerializer
        return QuizSerializer
    
    def get_object(self):
        quiz = get_object_or_404(Quiz, id=self.kwargs['pk'])
        
        # Kiểm tra quyền cho các thao tác sửa/xóa
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            if not (quiz.section.course.creator == self.request.user or 
                    self.request.user.is_staff or
                    (hasattr(self.request.user, 'profile') and 
                     self.request.user.profile.user_type in ['teacher', 'admin'])):
                self.permission_denied(self.request)
        
        return quiz


# Question Views
class QuestionListCreateView(generics.ListCreateAPIView):
    """
    Danh sách và tạo question cho quiz
    """
    permission_classes = [IsTeacherOrAdmin]  # Chỉ teacher và admin mới được quản lý câu hỏi
    
    def get_queryset(self):
        quiz = get_object_or_404(Quiz, id=self.kwargs['quiz_id'])
        return Question.objects.filter(quiz=quiz).order_by('position')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return QuestionCreateUpdateSerializer
        return QuestionSerializer
    
    def perform_create(self, serializer):
        quiz = get_object_or_404(Quiz, id=self.kwargs['quiz_id'])
        serializer.save(quiz=quiz)


class QuestionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Chi tiết, cập nhật và xóa question
    """
    permission_classes = [IsTeacherOrAdmin]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return QuestionCreateUpdateSerializer
        return QuestionSerializer
    
    def get_object(self):
        return get_object_or_404(Question, id=self.kwargs['pk'])


# Choice Views
class ChoiceListCreateView(generics.ListCreateAPIView):
    """
    Danh sách và tạo choice cho question
    """
    permission_classes = [IsTeacherOrAdmin]
    
    def get_queryset(self):
        question = get_object_or_404(Question, id=self.kwargs['question_id'])
        return Choice.objects.filter(question=question)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ChoiceCreateUpdateSerializer
        return ChoiceSerializer
    
    def perform_create(self, serializer):
        question = get_object_or_404(Question, id=self.kwargs['question_id'])
        serializer.save(question=question)


class ChoiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Chi tiết, cập nhật và xóa choice
    """
    permission_classes = [IsTeacherOrAdmin]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ChoiceCreateUpdateSerializer
        return ChoiceSerializer
    
    def get_object(self):
        return get_object_or_404(Choice, id=self.kwargs['pk'])


# Dashboard Views
class TeacherDashboardView(APIView):
    """
    Dashboard cho giáo viên - thống kê khóa học
    """
    permission_classes = [IsTeacher]
    
    def get(self, request):
        user = request.user
        courses = Course.objects.filter(creator=user)
        
        total_courses = courses.count()
        published_courses = courses.filter(published=True).count()
        total_students = UserCourse.objects.filter(course__creator=user).count()
          # Khóa học phổ biến nhất
        popular_course = None
        if courses.exists():
            popular_course_obj = courses.annotate(
                student_count=Count('students')
            ).order_by('-student_count').first()
            
            if popular_course_obj:
                popular_course = {
                    'id': popular_course_obj.id,
                    'title': popular_course_obj.title,
                    'student_count': popular_course_obj.students.count()
                }
        
        return Response({
            'total_courses': total_courses,
            'published_courses': published_courses,
            'total_students': total_students,
            'popular_course': popular_course
        })


class AdminDashboardView(APIView):
    """
    Dashboard cho admin - thống kê tổng quan
    """
    permission_classes = [IsTeacherOrAdmin]
    
    def get(self, request):
        total_courses = Course.objects.count()
        published_courses = Course.objects.filter(published=True).count()
        total_enrollments = UserCourse.objects.count()
        total_teachers = User.objects.filter(
            profile__user_type='teacher'
        ).count() if hasattr(User, 'profile') else 0
        total_students = User.objects.filter(
            profile__user_type='student'
        ).count() if hasattr(User, 'profile') else 0
        
        return Response({
            'total_courses': total_courses,
            'published_courses': published_courses,
            'total_enrollments': total_enrollments,
            'total_teachers': total_teachers,
            'total_students': total_students
        })
