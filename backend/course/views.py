import logging
from django.shortcuts import render, get_object_or_404
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q, Count
from django.contrib.auth.models import User
import json

# Import custom permissions
from user.permissions import IsTeacherOrAdmin, IsTeacher, IsStudent, IsOwnerOrAdminOrTeacher

# Import models and serializers
from .models import Course, Section, Lesson, Quiz, Question, Choice, UserCourse, QuizAttempt
from .serializers import (
    CourseSerializer, CourseCreateUpdateSerializer, SectionSerializer, 
    LessonSerializer, QuizSerializer, QuestionSerializer, ChoiceSerializer,
    UserCourseSerializer, SectionCreateUpdateSerializer, LessonCreateUpdateSerializer,
    QuizCreateUpdateSerializer, QuestionCreateUpdateSerializer, ChoiceCreateUpdateSerializer,
    QuizAttemptSerializer, UserSerializer, TeacherQuizAttemptSerializer
)

# Import utils for AI quiz generation
from .utils import generate_quiz_from_lessons, generate_quiz_from_selected_lessons, generate_quiz_feedback_with_ai

logger = logging.getLogger(__name__)


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
        section = get_object_or_404(
            Section.objects.prefetch_related(
                'lessons',
                'quizzes__questions__choices'
            ), 
            id=self.kwargs['pk']
        )
        
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
                 request.user.profile.user_type in ['teacher', 'admin'])):
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
        quiz = get_object_or_404(
            Quiz.objects.prefetch_related('questions__choices'), 
            id=self.kwargs['pk']
        )
        
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


# Auto Quiz Generation Views
@api_view(['POST'])
@permission_classes([IsTeacherOrAdmin])
def generate_auto_quiz(request, section_id):
    """
    Generate quiz questions automatically from section lessons using AI
    """
    try:
        section = get_object_or_404(Section, id=section_id)
        
        # Kiểm tra quyền: chỉ creator, teacher hoặc admin mới được tạo
        if not (section.course.creator == request.user or 
                request.user.is_staff or
                (hasattr(request.user, 'profile') and 
                 request.user.profile.user_type in ['teacher', 'admin'])):
            return Response(
                {"error": "Bạn không có quyền tạo quiz cho chương này"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get parameters from request
        num_questions = request.data.get('num_questions', 10)
        selected_lesson_ids = request.data.get('lesson_ids', [])
        
        # Validate num_questions
        if not isinstance(num_questions, int) or num_questions < 1 or num_questions > 30:
            return Response(
                {"error": "Số câu hỏi phải từ 1 đến 30"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if section has lessons
        if not section.lessons.exists():
            return Response(
                {"error": "Chương này chưa có bài học nào để tạo quiz"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate questions using AI
        if selected_lesson_ids:
            # Validate selected lessons belong to this section
            valid_lesson_ids = list(section.lessons.filter(id__in=selected_lesson_ids).values_list('id', flat=True))
            if not valid_lesson_ids:
                return Response(
                    {"error": "Không tìm thấy bài học hợp lệ để tạo quiz"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            questions = generate_quiz_from_selected_lessons(valid_lesson_ids, num_questions)
        else:
            # Use all lessons in section
            questions = generate_quiz_from_lessons(section, num_questions)
        
        if not questions:
            return Response(
                {"error": "Không thể tạo câu hỏi từ nội dung bài học. Vui lòng kiểm tra lại nội dung hoặc thử lại sau."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Return generated questions for preview
        return Response({
            "message": "Tạo câu hỏi thành công",
            "section_title": section.title,
            "num_questions": len(questions),
            "questions": questions
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error in generate_auto_quiz: {str(e)}")
        return Response(
            {"error": "Đã xảy ra lỗi khi tạo quiz. Vui lòng thử lại sau."}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# Teacher Quiz Results View
@api_view(['GET'])
@permission_classes([IsTeacherOrAdmin])
def teacher_quiz_results(request, quiz_id):
    """
    API endpoint: GET /api/teacher/quizzes/<quiz_id>/results/
    Trả về danh sách các lần làm bài kiểm tra của học viên cho quiz này
    """
    quiz = get_object_or_404(Quiz, id=quiz_id)
    attempts = QuizAttempt.objects.filter(quiz=quiz).select_related('user').order_by('-submitted_at')
    serializer = TeacherQuizAttemptSerializer(attempts, many=True)
    return Response({'quiz_id': quiz.id, 'quiz_title': quiz.title, 'results': serializer.data})


# Teacher Quiz Attempt Detail View
@api_view(['GET'])
@permission_classes([IsTeacherOrAdmin])
def teacher_quiz_attempt_detail(request, attempt_id):
    """
    API endpoint: GET /api/teacher/quiz-attempts/<attempt_id>/detail/
    Trả về chi tiết một lần làm bài cụ thể cho giáo viên
    """
    attempt = get_object_or_404(QuizAttempt, id=attempt_id)
    serializer = TeacherQuizAttemptSerializer(attempt)
    return Response(serializer.data)


# Teacher Quiz AI Feedback View
@api_view(['POST'])
@permission_classes([IsTeacherOrAdmin])
def teacher_quiz_attempt_ai_feedback(request, attempt_id):
    """
    API endpoint: POST /api/teacher/quiz-attempts/<attempt_id>/ai-feedback/
    Giáo viên lấy nhận xét AI cho bất kỳ bài làm nào
    """
    attempt = get_object_or_404(QuizAttempt, id=attempt_id)
    quiz = attempt.quiz
    questions = quiz.questions.all()
    answers = attempt.answers or {}
    answer_detail = []
    correct = 0
    total = questions.count()
    for q in questions:
        qid = str(q.id)
        selected = answers.get(qid)
        correct_choice = q.choices.filter(is_correct=True).first()
        is_correct = str(getattr(correct_choice, 'id', None)) == str(selected)
        if is_correct:
            correct += 1
        answer_detail.append({
            "question": q.text,
            "your_choice": selected,
            "correct_choice": str(getattr(correct_choice, 'id', None)),
        })
    quiz_result = {
        "score": attempt.score,
        "correct": correct,
        "total": total,
        "answers": answer_detail,
        "attempt_id": attempt.id,
        "submitted_at": str(attempt.submitted_at)
    }
    prompt = (
        "Bạn là một trợ lý học tập. Hãy đánh giá kết quả bài kiểm tra trắc nghiệm của học sinh và đưa ra phản hồi chi tiết.\n\n"
        "Yêu cầu:\n"
        "1. Đưa ra **điểm mạnh** của học sinh: nêu rõ các phần kiến thức hoặc dạng câu hỏi học sinh làm tốt.\n"
        "2. Chỉ ra **kiến thức hoặc kỹ năng học sinh cần cải thiện**: liệt kê các chủ đề hoặc dạng câu hỏi mà học sinh làm sai hoặc còn yếu.\n"
        "3. Gợi ý **hướng học tập tiếp theo** để cải thiện kết quả trong tương lai (ngắn gọn).\n\n"
        "**Yêu cầu định dạng:**\n"
        "- Trả về kết quả ở dạng markdown, sử dụng tiêu đề, danh sách, in đậm, in nghiêng, bảng nếu cần.\n"
        "- Không giải thích thêm, chỉ trả về markdown, 3 yêu cầu in đậm, từ khóa in nghiêng\n\n"
        "Thông tin đầu vào: kết quả bài kiểm tra sau:\n"
        f"{json.dumps(quiz_result, ensure_ascii=False, indent=2)}"
    )
    feedback = generate_quiz_feedback_with_ai(prompt)
    if not feedback:
        return Response({"detail": "Không thể tạo nhận xét AI. Vui lòng thử lại sau."}, status=500)
    return Response({"feedback": feedback})


# Teacher Statistics View
@api_view(['GET'])
@permission_classes([IsTeacherOrAdmin])
def teacher_statistics(request):
    """
    API endpoint: GET /api/teacher/statistics/
    - Không có ?ai=1: chỉ trả về số liệu cho biểu đồ (nhanh)
    - Có ?ai=1: chỉ trả về nhận xét AI (có thể chậm)
    """
    user = request.user
    # --- Số liệu thống kê ---
    # Doanh thu theo tháng (giả lập)
    months = ["01/2025", "02/2025", "03/2025", "04/2025", "05/2025"]
    revenue = [12000000, 15000000, 18000000, 21000000, 25000000]
    revenue_chart = {
        "labels": months,
        "datasets": [{
            "label": "Doanh thu (VNĐ)",
            "data": revenue,
            "backgroundColor": "#4f46e5"
        }]
    }
    # Số học viên mới theo tháng (giả lập)
    new_students = [30, 45, 60, 80, 100]
    new_students_chart = {
        "labels": months,
        "datasets": [{
            "label": "Học viên mới",
            "data": new_students,
            "borderColor": "#22d3ee",
            "backgroundColor": "#a5f3fc"
        }]
    }
    # Điểm trung bình các khóa học (giả lập)
    course_names = ["Python", "Toán", "Văn", "Anh", "Lý"]
    avg_scores = [8.2, 7.5, 8.8, 7.9, 8.0]
    course_scores_chart = {
        "labels": course_names,
        "datasets": [{
            "label": "Điểm trung bình",
            "data": avg_scores,
            "backgroundColor": "#a78bfa"
        }]
    }
    # Thống kê tổng số khóa học, đã xuất bản, bản nháp, tổng học viên
    from .models import Course, UserCourse, QuizAttempt
    from django.db.models import Sum, Avg, F
    from django.utils import timezone
    from datetime import datetime, timedelta

    # --- Dynamic statistics ---
    # Revenue by month (sum of course.price for each enrollment in UserCourse)
    # Đơn vị tiền là USD, không dùng VND
    user_courses = UserCourse.objects.filter(course__creator=user)
    # Get all months in the last 5 months
    now = timezone.now()
    months = []
    for i in range(4, -1, -1):
        month = (now - timedelta(days=now.day-1)).replace(day=1) - timedelta(days=30*i)
        months.append(month.strftime('%m/%Y'))
    months = months[::-1]
    # Revenue and new students per month
    revenue = []
    new_students = []
    for m in months:
        month_dt = datetime.strptime(m, '%m/%Y')
        month_start = month_dt.replace(day=1)
        if month_start.month == 12:
            month_end = month_start.replace(year=month_start.year+1, month=1)
        else:
            month_end = month_start.replace(month=month_start.month+1)
        month_enrolls = user_courses.filter(enrolled_at__gte=month_start, enrolled_at__lt=month_end)
        # Revenue: sum of course.price for each enrollment (USD)
        month_revenue_usd = sum([uc.course.price or 0 for uc in month_enrolls])
        revenue.append(float(month_revenue_usd))
        new_students.append(month_enrolls.count())
    revenue_chart = {
        "labels": months,
        "datasets": [{
            "label": "Doanh thu (USD)",
            "data": revenue,
            "backgroundColor": "#4f46e5"
        }]
    }
    new_students_chart = {
        "labels": months,
        "datasets": [{
            "label": "Học viên mới",
            "data": new_students,
            "borderColor": "#22d3ee",
            "backgroundColor": "#a5f3fc"
        }]
    }
    # Average course scores (by QuizAttempt)
    courses = Course.objects.filter(creator=user)
    course_names = []
    avg_scores = []
    for course in courses:
        quiz_ids = course.sections.values_list('quizzes__id', flat=True)
        attempts = QuizAttempt.objects.filter(quiz_id__in=quiz_ids)
        avg_score = attempts.aggregate(avg=Avg('score'))['avg']
        course_names.append(course.title)
        avg_scores.append(round(avg_score, 2) if avg_score is not None else 0)
    course_scores_chart = {
        "labels": course_names,
        "datasets": [{
            "label": "Điểm trung bình",
            "data": avg_scores,
            "backgroundColor": "#a78bfa"
        }]
    }
    # Thống kê tổng số khóa học, đã xuất bản, bản nháp, tổng học viên
    total_courses = courses.count()
    published_courses = courses.filter(published=True).count()
    draft_courses = courses.filter(published=False).count()
    total_students = user_courses.count()
    # Nếu chỉ lấy số liệu (không có ?ai=1)
    if not request.GET.get('ai'):
        return Response({
            "revenue_chart": revenue_chart,
            "new_students_chart": new_students_chart,
            "course_scores_chart": course_scores_chart,
            "total_courses": total_courses,
            "published_courses": published_courses,
            "draft_courses": draft_courses,
            "total_students": total_students,
            "ai_feedback": ""
        })
    # Nếu có ?ai=1 thì chỉ trả về nhận xét AI động dựa trên số liệu thực tế
    if request.GET.get('ai'):
        # Chuẩn bị dữ liệu thống kê thực tế
        summary = {
            "Tổng số khóa học": total_courses,
            "Khóa học đã xuất bản": published_courses,
            "Bản nháp": draft_courses,
            "Tổng học viên": total_students,
            "Doanh thu theo tháng (USD)": revenue,
            "Số học viên mới theo tháng": new_students,
            "Điểm trung bình từng khóa học": dict(zip(course_names, avg_scores)),
        }
        prompt = (
            "Bạn là một trợ lý AI cho giáo viên. Hãy phân tích số liệu thống kê sau và đưa ra nhận xét, khuyến nghị chi tiết.\n\n"
            "Yêu cầu:\n"
            "1. Đưa ra **tổng quan** về hiệu quả hoạt động dựa trên số liệu.\n"
            "2. Chỉ ra **điểm mạnh** và **điểm cần cải thiện**.\n"
            "3. Đề xuất **hành động tiếp theo** để nâng cao hiệu quả.\n\n"
            "**Nội quy markdown:**\n"
            "- Mỗi tiêu đề (heading) phải bắt đầu bằng dấu # hoặc ## và có một dòng trống phía trước.\n"
            "- Danh sách phải bắt đầu bằng dấu - hoặc * và có dòng trống phía trước.\n"
            "- In đậm dùng **text**, in nghiêng dùng *text*.\n"
            "- Không dùng ký tự lạ, không escape ký tự xuống dòng.\n"
            "- Đảm bảo markdown dễ đọc, dễ render trên web.Có đáng số đề mục. Đề mục in đậm, từ khóa in nghiêng\n"
            "- Không giải thích thêm, chỉ trả về markdown.\n\n"
            f"Số liệu thống kê:\n{json.dumps(summary, ensure_ascii=False, indent=2)}"
        )
        feedback = generate_quiz_feedback_with_ai(prompt)
        if not feedback:
            return Response({"ai_feedback": "Không thể tạo nhận xét AI. Vui lòng thử lại sau."}, status=500)
        return Response({"ai_feedback": feedback})
