from rest_framework.permissions import BasePermission

class IsTeacherOrAdmin(BasePermission):
    """
    Custom permission to allow only teachers and admins to access.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and
            (
                request.user.is_staff or 
                request.user.profile.user_type == 'teacher' or
                request.user.profile.user_type == 'admin'
            )
        )

class IsTeacher(BasePermission):
    """
    Custom permission to allow only teachers to access.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and
            request.user.profile.user_type == 'teacher'
        )

class IsStudent(BasePermission):
    """
    Custom permission to allow only students to access.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and
            request.user.profile.user_type == 'student'
        )

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
