from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from user.models.user_profile import UserProfile
from course.models import Course, Section, Lesson, Quiz, Question, Choice, UserCourse
from .models import SystemConfiguration, AuditLog

# Customized admin interfaces

class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name = 'Profile'
    verbose_name_plural = 'Profiles'

class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'is_active', 'get_user_type')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'profile__user_type')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    
    def get_user_type(self, obj):
        if hasattr(obj, 'profile'):
            return obj.profile.get_user_type_display()
        return '-'
    get_user_type.short_description = 'User Type'
    
# Unregister the default User admin and register our enhanced version
admin.site.unregister(User)
admin.site.register(User, UserAdmin)

# Register course models with enhanced admin interfaces
@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'creator', 'published', 'published_at', 'created_at', 'price')
    list_filter = ('published', 'category')
    search_fields = ('title', 'description')
    readonly_fields = ('created_at', 'last_updated_at')

@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'position')
    list_filter = ('course',)
    search_fields = ('title', 'course__title')

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'section', 'position')
    list_filter = ('section__course',)
    search_fields = ('title', 'content')

@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('title', 'section', 'position')
    list_filter = ('section__course',)
    search_fields = ('title',)

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('text', 'quiz', 'position')
    list_filter = ('quiz',)
    search_fields = ('text',)

@admin.register(Choice)
class ChoiceAdmin(admin.ModelAdmin):
    list_display = ('text', 'question', 'is_correct')
    list_filter = ('is_correct', 'question__quiz')
    search_fields = ('text',)

@admin.register(UserCourse)
class UserCourseAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'enrolled_at', 'progress')
    list_filter = ('course', 'enrolled_at')
    search_fields = ('user__username', 'course__title')
    readonly_fields = ('enrolled_at',)

@admin.register(SystemConfiguration)
class SystemConfigurationAdmin(admin.ModelAdmin):
    list_display = ('key', 'value', 'category', 'is_public', 'updated_at', 'updated_by')
    list_filter = ('category', 'is_public', 'updated_at')
    search_fields = ('key', 'value', 'description')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'object_type', 'object_id', 'timestamp', 'ip_address')
    list_filter = ('action', 'timestamp')
    search_fields = ('user__username', 'description', 'object_type')
    readonly_fields = ('user', 'action', 'timestamp', 'object_id', 'object_type', 
                      'description', 'ip_address')
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
