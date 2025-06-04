from rest_framework import serializers
from django.contrib.auth.models import User
from user.models.user_profile import UserProfile
from course.models import Course, Section, Lesson, Quiz, Question, Choice, UserCourse
from .models import SystemConfiguration, AuditLog

class UserManagementSerializer(serializers.ModelSerializer):
    user_type = serializers.CharField(source='profile.user_type', required=False)
    is_active = serializers.BooleanField(required=False)
    email = serializers.EmailField(required=False)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'user_type']
        
    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        user_type = profile_data.get('user_type', None)
        
        # Update User model fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update UserProfile if necessary
        if user_type and hasattr(instance, 'profile'):
            instance.profile.user_type = user_type
            instance.profile.save()
            
        return instance

class CourseAdminSerializer(serializers.ModelSerializer):
    creator_username = serializers.SerializerMethodField()
    student_count = serializers.SerializerMethodField()
    sections = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = '__all__'
    
    def get_creator_username(self, obj):
        return obj.creator.username if obj.creator else None
    
    def get_student_count(self, obj):
        return obj.students.count()
        
    def get_sections(self, obj):
        sections = Section.objects.filter(course=obj).order_by('position')
        return SectionDetailAdminSerializer(sections, many=True).data

class SectionAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = '__all__'

class SectionDetailAdminSerializer(serializers.ModelSerializer):
    lessons = serializers.SerializerMethodField()
    quizzes = serializers.SerializerMethodField()
    
    class Meta:
        model = Section
        fields = '__all__'
        
    def get_lessons(self, obj):
        lessons = Lesson.objects.filter(section=obj).order_by('position')
        return LessonAdminSerializer(lessons, many=True).data
        
    def get_quizzes(self, obj):
        quizzes = Quiz.objects.filter(section=obj).order_by('position')
        return QuizAdminSerializer(quizzes, many=True).data

class LessonAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = '__all__'

class QuizAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = '__all__'

class QuestionAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'

class ChoiceAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = '__all__'

class UserCourseAdminSerializer(serializers.ModelSerializer):
    student_username = serializers.SerializerMethodField()
    course_title = serializers.SerializerMethodField()
    
    class Meta:
        model = UserCourse
        fields = '__all__'
    
    def get_student_username(self, obj):
        return obj.user.username
    
    def get_course_title(self, obj):
        return obj.course.title

class SystemConfigurationSerializer(serializers.ModelSerializer):
    updated_by_username = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = SystemConfiguration
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
    
    def get_updated_by_username(self, obj):
        return obj.updated_by.username if obj.updated_by else None
    
    def create(self, validated_data):
        # Set the current user as updated_by
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['updated_by'] = request.user
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # Set the current user as updated_by
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['updated_by'] = request.user
        return super().update(instance, validated_data)

class AuditLogSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = AuditLog
        fields = '__all__'
        read_only_fields = ('timestamp',)
    
    def get_username(self, obj):
        return obj.user.username if obj.user else None
