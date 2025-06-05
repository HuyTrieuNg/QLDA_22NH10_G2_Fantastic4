from django.shortcuts import get_object_or_404
from rest_framework import generics, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q
from user.permissions import IsStudent
from course.models import Course, Section, Lesson, UserCourse, QuizAttempt, Quiz, Question, Choice
from .serializers import (
    StudentCourseListSerializer, 
    StudentCourseDetailSerializer, 
    StudentLessonSerializer,
    EnrolledCourseSerializer
)
from course.serializers import QuizAttemptSerializer
from course.utils import extract_lesson_content, get_youtube_transcript, summarize_content_with_ai, generate_quiz_feedback_with_ai
import json


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


class StudentQuizHistoryListView(generics.ListAPIView):
    """
    Danh sách tất cả lịch sử làm bài quiz của học viên hiện tại
    """
    serializer_class = QuizAttemptSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return QuizAttempt.objects.filter(user=self.request.user)

class StudentQuizHistoryByQuizView(APIView):
    """
    Lấy lịch sử làm bài mới nhất cho một quiz cụ thể của học viên hiện tại, trả về chi tiết với text thực tế
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, quiz_id):
        attempt = QuizAttempt.objects.filter(user=request.user, quiz_id=quiz_id).order_by('-submitted_at').first()
        if not attempt:
            return Response(None)
        # Lấy quiz và questions
        quiz = attempt.quiz
        questions = quiz.questions.all()
        answers = attempt.answers or {}
        answer_detail = []
        correct = 0
        total = questions.count()
        for q in questions:
            qid = str(q.id)
            selected_choice_id = answers.get(qid)
            correct_choice = q.choices.filter(is_correct=True).first()
            
            # Get selected choice text
            selected_choice_text = None
            if selected_choice_id:
                try:
                    selected_choice = q.choices.get(id=selected_choice_id)
                    selected_choice_text = selected_choice.text
                except:
                    selected_choice_text = "Không xác định"
            
            is_correct = str(getattr(correct_choice, 'id', None)) == str(selected_choice_id)
            if is_correct:
                correct += 1
            answer_detail.append({
                "question": q.text,                "your_choice": selected_choice_text or "Không trả lời",
                "correct_choice": correct_choice.text if correct_choice else "Không xác định",
                "is_correct": is_correct
            })
        return Response({
            "score": attempt.score,
            "correct": correct,
            "total": total,
            "answers": answer_detail,
            "attempt_id": attempt.id,
            "submitted_at": attempt.submitted_at
        })


class StudentQuizAttemptDetailView(APIView):
    """
    Chi tiết bài làm quiz theo attempt ID (cho học sinh)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, attempt_id):
        attempt = get_object_or_404(QuizAttempt, id=attempt_id, user=request.user)
        # Lấy quiz và questions
        quiz = attempt.quiz
        questions = quiz.questions.all()
        answers = attempt.answers or {}
        answer_detail = []
        correct = 0
        total = questions.count()
        for q in questions:
            qid = str(q.id)
            selected_choice_id = answers.get(qid)
            correct_choice = q.choices.filter(is_correct=True).first()
            
            # Get selected choice text
            selected_choice_text = None
            if selected_choice_id:
                try:
                    selected_choice = q.choices.get(id=selected_choice_id)
                    selected_choice_text = selected_choice.text
                except:
                    selected_choice_text = "Không xác định"
            
            is_correct = str(getattr(correct_choice, 'id', None)) == str(selected_choice_id)
            if is_correct:
                correct += 1
            answer_detail.append({
                "question": q.text,
                "your_choice": selected_choice_text or "Không trả lời",
                "correct_choice": correct_choice.text if correct_choice else "Không xác định",
                "is_correct": is_correct
            })
        return Response({
            "score": attempt.score,
            "correct": correct,
            "total": total,
            "answers": answer_detail,
            "attempt_id": attempt.id,
            "submitted_at": attempt.submitted_at,
            "quiz_title": quiz.title
        })


class StudentQuizSubmitView(APIView):
    """
    Học sinh nộp bài kiểm tra, chấm điểm và lưu lịch sử làm bài
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, quiz_id):
        quiz = get_object_or_404(Quiz, id=quiz_id)
        answers = request.data.get("answers", {})  # {question_id: choice_id}
        if not isinstance(answers, dict):
            return Response({"detail": "answers phải là dict {question_id: choice_id}"}, status=400)

        questions = quiz.questions.all()
        total = questions.count()
        correct = 0
        answer_detail = []
        for q in questions:
            qid = str(q.id)
            selected_choice_id = answers.get(qid)
            correct_choice = q.choices.filter(is_correct=True).first()
            
            # Get selected choice text
            selected_choice_text = None
            if selected_choice_id:
                try:
                    selected_choice = q.choices.get(id=selected_choice_id)
                    selected_choice_text = selected_choice.text
                except:
                    selected_choice_text = "Không xác định"
            
            is_correct = str(getattr(correct_choice, 'id', None)) == str(selected_choice_id)
            if is_correct:
                correct += 1
            answer_detail.append({
                "question": q.text,
                "your_choice": selected_choice_text or "Không trả lời",
                "correct_choice": correct_choice.text if correct_choice else "Không xác định",
                "is_correct": is_correct
            })
        score = round((correct / total) * 10, 2) if total > 0 else 0
        # Lưu QuizAttempt
        attempt = QuizAttempt.objects.create(
            user=request.user,
            quiz=quiz,
            score=score,
            correct_count=correct,
            total_count=total,
            answers=answers
        )

        # --- Update progress after quiz submission ---
        course = quiz.section.course
        user_course = UserCourse.objects.get(user=request.user, course=course)
        # Count total lessons and quizzes
        total_lessons = 0
        total_quizzes = 0
        for section in course.sections.all():
            total_lessons += section.lessons.count()
            total_quizzes += section.quizzes.count()
        total_items = total_lessons + total_quizzes
        # Count completed lessons and quizzes (simple: +1 for this quiz if not already counted)
        # For real tracking, should have a table for completed lessons/quizzes per user
        # Here, just increment progress if not 100%
        if total_items > 0 and user_course.progress < 100:
            progress_increment = 100 / total_items
            user_course.progress = min(user_course.progress + progress_increment, 100)
            user_course.save()
        # --- End update progress ---

        return Response({
            "score": score,
            "correct": correct,
            "total": total,
            "answers": answer_detail,
            "attempt_id": attempt.id
        })


class StudentLessonSummarizeView(APIView):
    """
    API: POST /student/lessons/<lesson_id>/summarize/
    Tóm tắt nội dung bài học (text + phụ đề video nếu có)
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, lesson_id):
        from course.models import Lesson
        lesson = get_object_or_404(Lesson, id=lesson_id)
        # Check permission: must be enrolled
        course = lesson.section.course
        if not UserCourse.objects.filter(user=request.user, course=course).exists():
            return Response({"detail": "Bạn chưa đăng ký khóa học này"}, status=403)
        # Gather content
        content = lesson.content or ""
        transcript = get_youtube_transcript(lesson.video_url) if lesson.video_url else ""
        content_ok = content and len(content.strip()) > 100
        transcript_ok = transcript and len(transcript.strip()) > 100
        if not content_ok and not transcript_ok:
            return Response({"detail": "Nội dung bài học và phụ đề video không đủ để tóm tắt (cần > 100 ký tự)."}, status=400)
        # Ưu tiên content, nếu có transcript thì nối vào
        full_content = ""
        if content_ok:
            full_content += content.strip()
        if transcript_ok:
            if full_content:
                full_content += "\n\n--- Phụ đề video ---\n\n"
            full_content += transcript.strip()
        # Gọi AI
        summary = summarize_content_with_ai(full_content)
        if not summary:
            return Response({"detail": "Không thể tóm tắt nội dung. Vui lòng thử lại sau."}, status=500)
        return Response({"summary": summary})

class StudentQuizAIFeedbackView(APIView):
    """
    Nhận xét AI cho kết quả làm bài quiz của học sinh
    POST /student/quiz-attempts/<int:quiz_attempt_id>/ai-feedback/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, quiz_attempt_id):
        # Lấy QuizAttempt theo id
        attempt = get_object_or_404(QuizAttempt, id=quiz_attempt_id, user=request.user)
        # Lấy dữ liệu kết quả quiz
        quiz = attempt.quiz
        questions = quiz.questions.all()
        answers = attempt.answers or {}
        answer_detail = []
        correct = 0
        total = questions.count()
        for q in questions:
            qid = str(q.id)
            selected_choice_id = answers.get(qid)
            correct_choice = q.choices.filter(is_correct=True).first()
            
            # Get selected choice text
            selected_choice_text = "Không có lựa chọn"
            if selected_choice_id:
                try:
                    selected_choice = q.choices.get(id=int(selected_choice_id))
                    selected_choice_text = selected_choice.text
                except (ValueError, Question.DoesNotExist):
                    selected_choice_text = f"ID: {selected_choice_id}"
              # Get correct choice text
            correct_choice_text = "Không có đáp án đúng"
            if correct_choice:
                correct_choice_text = correct_choice.text
            
            is_correct = str(getattr(correct_choice, 'id', None)) == str(selected_choice_id)
            if is_correct:
                correct += 1
            answer_detail.append({
                "question": q.text,
                "your_choice": selected_choice_text,
                "correct_choice": correct_choice_text,
            })
        quiz_result = {
            "score": attempt.score,
            "correct": correct,
            "total": total,
            "answers": answer_detail,
            "attempt_id": attempt.id,
            "submitted_at": str(attempt.submitted_at)
        }
        # Prompt mẫu
        prompt = (
            "Bạn là một trợ lý học tập. Hãy đánh giá kết quả bài kiểm tra trắc nghiệm của học sinh và đưa ra phản hồi chi tiết.\n\n"
            "Yêu cầu:\n"
            "1. Đưa ra **điểm mạnh** của học sinh: nêu rõ các phần kiến thức hoặc dạng câu hỏi học sinh làm tốt.\n"
            "2. Chỉ ra **kiến thức hoặc kỹ năng học sinh cần cải thiện**: liệt kê các chủ đề hoặc dạng câu hỏi mà học sinh làm sai hoặc còn yếu.\n"
            "3. Gợi ý **hướng học tập tiếp theo** để cải thiện kết quả trong tương lai (ngắn gọn).\n\n"
            "**Yêu cầu định dạng:**\n"
            "- Trả về kết quả ở dạng markdown, sử dụng tiêu đề, danh sách, in đậm, in nghiêng, bảng nếu cần.\n"
            "- Không giải thích thêm, chỉ trả về markdown, 3 yêu cầu in đậm, từ khóa in nghiêng, có đánh số.\n\n"
            "Thông tin đầu vào: kết quả bài kiểm tra sau:\n"
            f"{json.dumps(quiz_result, ensure_ascii=False, indent=2)}"
        )
        # Gọi AI
        feedback = generate_quiz_feedback_with_ai(prompt)
        if not feedback:
            return Response({"detail": "Không thể tạo nhận xét AI. Vui lòng thử lại sau."}, status=500)
        return Response({"feedback": feedback})
