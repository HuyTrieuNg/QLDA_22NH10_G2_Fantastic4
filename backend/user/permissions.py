from rest_framework.permissions import BasePermission

class IsTeacherOrAdmin(BasePermission):
    """
    Custom permission to allow only teachers and admins to access.
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        
        # Check if user is staff (admin)
        if request.user.is_staff:
            return True
            
        # Check if user has profile and is teacher or admin
        try:
            return hasattr(request.user, 'profile') and request.user.profile.user_type in ['teacher', 'admin']
        except AttributeError:
            return False

class IsTeacher(BasePermission):
    """
    Custom permission to allow only teachers to access.
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
            
        # Check if user has profile and is teacher
        try:
            return hasattr(request.user, 'profile') and request.user.profile.user_type == 'teacher'
        except AttributeError:
            return False

class IsStudent(BasePermission):
    """
    Custom permission to allow only students to access.
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
            
        # Check if user has profile and is student
        try:
            return hasattr(request.user, 'profile') and request.user.profile.user_type == 'student'
        except AttributeError:
            return False

class IsOwnerOrAdminOrTeacher(BasePermission):
    """
    Custom permission to allow only the user themselves, admin or teacher to access their data.
    """
    def has_object_permission(self, request, view, obj):
        # Check if the object has a user attribute
        if hasattr(obj, 'user'):
            # For objects with user attribute (like Profile)
            return bool(
                request.user and
                request.user.is_authenticated and
                (
                    obj.user == request.user or
                    request.user.is_staff or
                    request.user.profile.user_type in ['teacher', 'admin']
                )
            )
        # For User objects
        return bool(
            request.user and
            request.user.is_authenticated and
            (
                obj == request.user or
                request.user.is_staff or
                request.user.profile.user_type in ['teacher', 'admin']
            )
        )
