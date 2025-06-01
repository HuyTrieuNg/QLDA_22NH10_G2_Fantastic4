from django.contrib import admin
from .models.user_profile import UserProfile
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User

# Register your models here.
class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'profiles'

class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'get_user_type')
    list_filter = ('is_staff', 'is_superuser', 'profile__user_type')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    
    def get_user_type(self, obj):
        return obj.profile.get_user_type_display()
    get_user_type.short_description = 'Vai trò'
    
# Re-register UserAdmin with the updated admin class
admin.site.unregister(User)
admin.site.register(User, UserAdmin)
admin.site.register(UserProfile)
