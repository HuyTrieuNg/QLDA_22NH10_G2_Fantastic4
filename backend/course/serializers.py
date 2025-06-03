from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Course, Section, Lesson, Quiz, Question, Choice, UserCourse


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']


class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['id', 'text', 'is_correct']


class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True)
    
    class Meta:
        model = Question
        fields = ['id', 'text', 'position', 'choices']


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Quiz
        fields = ['id', 'title', 'position', 'questions']


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'content', 'position', 'video_url']


class SectionSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    quizzes = QuizSerializer(many=True, read_only=True)
    
    class Meta:
        model = Section
        fields = ['id', 'title', 'position', 'lessons', 'quizzes']


class CourseSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    sections = SectionSerializer(many=True, read_only=True)
    student_count = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'subtitle', 'description', 'created_at', 
            'last_updated_at', 'published_at', 'published', 'thumbnail',
            'creator', 'category', 'price', 'sections', 'student_count', 'is_enrolled'
        ]
    
    def get_student_count(self, obj):
        return obj.students.count()
    
    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserCourse.objects.filter(user=request.user, course=obj).exists()
        return False


class CourseCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = [
            'title', 'subtitle', 'description', 'published', 
            'thumbnail', 'category', 'price'
        ]


class UserCourseSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserCourse
        fields = ['id', 'user', 'course', 'enrolled_at', 'progress']


class SectionCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = ['title', 'position']


class LessonCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['title', 'content', 'position', 'video_url']


class QuizCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ['title', 'position']


class QuestionCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['text', 'position']


class ChoiceCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['text', 'is_correct']
