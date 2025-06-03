from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from course.models import Course, Section, Lesson, Quiz, Question, Choice, UserCourse
from random import choice, randint, sample

class Command(BaseCommand):
    help = "Seed sample courses with sections, lessons, quizzes, and enroll students"

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS("Seeding sample data..."))

        # Lấy user loại teacher và student
        teachers = User.objects.filter(username__in=['teacher1', 'teacher2'])
        students = User.objects.filter(username__startswith='student')

        # Tạo 2 course cho mỗi giáo viên
        for teacher in teachers:
            for i in range(1, 3):
                course = Course.objects.create(
                    title=f"Khóa học {i} của {teacher.first_name}",
                    subtitle="Khóa học demo",
                    description="Mô tả chi tiết khóa học.",
                    creator=teacher,
                    published=True,
                    category="Lập trình",
                    price=199.99
                )
                self.stdout.write(self.style.SUCCESS(f"Created course: {course.title}"))

                # Tạo Sections
                for sec_num in range(1, 4):
                    section = Section.objects.create(
                        title=f"Chương {sec_num}",
                        position=sec_num,
                        course=course
                    )

                    # Tạo Lessons
                    for les_num in range(1, 4):
                        Lesson.objects.create(
                            title=f"Bài học {les_num} - Chương {sec_num}",
                            content="Nội dung bài học chi tiết...",
                            position=les_num,
                            section=section,
                            video_url=f"https://example.com/video{les_num}"
                        )

                    # Tạo Quiz
                    quiz = Quiz.objects.create(
                        title=f"Bài kiểm tra Chương {sec_num}",
                        section=section,
                        position=1
                    )

                    # Tạo Questions và Choices
                    for q_num in range(1, 4):
                        question = Question.objects.create(
                            quiz=quiz,
                            text=f"Câu hỏi {q_num} chương {sec_num}",
                            position=q_num
                        )

                        for c_num in range(1, 4):
                            Choice.objects.create(
                                question=question,
                                text=f"Lựa chọn {c_num}",
                                is_correct=(c_num == 1)  # Câu trả lời đúng là lựa chọn 1
                            )

                # Enroll ngẫu nhiên 2-3 học sinh vào mỗi course
                selected_students = sample(list(students), randint(2, 3))
                for student in selected_students:
                    UserCourse.objects.create(
                        user=student,
                        course=course
                    )
                    self.stdout.write(self.style.NOTICE(
                        f"Enrolled {student.username} in {course.title}"))

        self.stdout.write(self.style.SUCCESS("✅ Seeding completed!"))
