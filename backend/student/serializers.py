from rest_framework import serializers
from django.contrib.auth.models import User
from course.models import Course, Section, Lesson, UserCourse
from course.serializers import LessonSerializer

class StudentCourseListSerializer(serializers.ModelSerializer):
    """Serializer hiển thị thông tin ngắn gọn về khóa học trong danh sách"""
    student_count = serializers.SerializerMethodField()
    lesson_count = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'subtitle', 'thumbnail', 
            'category', 'price', 'student_count', 
            'lesson_count', 'is_enrolled'
        ]
    
    def get_student_count(self, obj):
        return obj.students.count()
    
    def get_lesson_count(self, obj):
        lesson_count = 0
        for section in obj.sections.all():
            lesson_count += section.lessons.count()
        return lesson_count
    
    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserCourse.objects.filter(user=request.user, course=obj).exists()
        return False


class StudentLessonSerializer(serializers.ModelSerializer):
    """Serializer hiển thị thông tin bài giảng cho học viên"""
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'content', 'video_url']


class StudentSectionSerializer(serializers.ModelSerializer):
    """Serializer hiển thị thông tin section cho học viên"""
    lessons = StudentLessonSerializer(many=True, read_only=True)
    
    class Meta:
        model = Section
        fields = ['id', 'title', 'lessons']


class StudentCourseDetailSerializer(serializers.ModelSerializer):
    """Serializer hiển thị thông tin chi tiết khóa học cho học viên"""
    sections = StudentSectionSerializer(many=True, read_only=True)
    student_count = serializers.SerializerMethodField()
    lesson_count = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'subtitle', 'description',
            'thumbnail', 'category', 'price',
            'student_count', 'lesson_count', 'sections',
            'is_enrolled', 'published_at'
        ]
    
    def get_student_count(self, obj):
        return obj.students.count()
    
    def get_lesson_count(self, obj):
        lesson_count = 0
        for section in obj.sections.all():
            lesson_count += section.lessons.count()
        return lesson_count
    
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
