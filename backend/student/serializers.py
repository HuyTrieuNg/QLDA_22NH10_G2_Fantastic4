from rest_framework import serializers
from django.contrib.auth.models import User
from course.models import Course, Section, Lesson, UserCourse, Quiz
from course.serializers import LessonSerializer, QuizSerializer



class StudentCourseListSerializer(serializers.ModelSerializer):
    """Serializer hiển thị thông tin ngắn gọn về khóa học trong danh sách"""
    student_count = serializers.SerializerMethodField()
    lesson_count = serializers.SerializerMethodField()
    quiz_count = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()
    creator = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'subtitle', 'thumbnail', 
            'category', 'price', 'student_count', 
            'lesson_count', 'quiz_count', 'is_enrolled', 'creator', 'published_at'
        ]
    
    def get_student_count(self, obj):
        return obj.students.count()
    
    def get_lesson_count(self, obj):
        lesson_count = 0
        for section in obj.sections.all():
            lesson_count += section.lessons.count()
        return lesson_count
    
    def get_quiz_count(self, obj):
        quiz_count = 0
        for section in obj.sections.all():
            quiz_count += section.quizzes.count()
        return quiz_count
    
    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserCourse.objects.filter(user=request.user, course=obj).exists()
        return False


class StudentLessonSectionSerializer(serializers.ModelSerializer):
    course_id = serializers.IntegerField(source="course.id")
    class Meta:
        model = Section
        fields = ["id", "title", "course_id"]


class StudentLessonSerializer(serializers.ModelSerializer):
    """Serializer hiển thị thông tin bài giảng cho học viên"""
    section = StudentLessonSectionSerializer(read_only=True)
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'content', 'video_url', 'section']


class StudentQuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ['id', 'title', 'position']


class StudentSectionSerializer(serializers.ModelSerializer):
    """Serializer hiển thị thông tin section cho học viên"""
    lessons = StudentLessonSerializer(many=True, read_only=True)
    quizzes = StudentQuizSerializer(many=True, read_only=True)
    
    class Meta:
        model = Section
        fields = ['id', 'title', 'lessons', 'quizzes']


class StudentCourseDetailSerializer(serializers.ModelSerializer):
    """Serializer hiển thị thông tin chi tiết khóa học cho học viên"""
    sections = StudentSectionSerializer(many=True, read_only=True)
    student_count = serializers.SerializerMethodField()
    lesson_count = serializers.SerializerMethodField()
    quiz_count = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'subtitle', 'description',
            'thumbnail', 'category', 'price',
            'student_count', 'lesson_count', 'quiz_count', 'sections',
            'is_enrolled', 'published_at', 'last_updated_at'
        ]
    
    def get_student_count(self, obj):
        return obj.students.count()
    
    def get_lesson_count(self, obj):
        lesson_count = 0
        for section in obj.sections.all():
            lesson_count += section.lessons.count()
        return lesson_count
    
    def get_quiz_count(self, obj):
        quiz_count = 0
        for section in obj.sections.all():
            quiz_count += section.quizzes.count()
        return quiz_count
    
    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserCourse.objects.filter(user=request.user, course=obj).exists()
        return False


class EnrolledCourseSerializer(serializers.ModelSerializer):
    """Serializer hiển thị thông tin khóa học đã đăng ký với tiến độ học"""
    course = StudentCourseListSerializer(read_only=True)
    
    class Meta:
        model = UserCourse
        fields = ['id', 'course', 'enrolled_at', 'progress']
