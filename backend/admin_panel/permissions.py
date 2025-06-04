from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    """
    Custom permission to allow only admins to access.
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        
        # Check if user is staff or admin type
        try:
            return (request.user.is_staff or 
                    (hasattr(request.user, 'profile') and 
                     request.user.profile.user_type == 'admin'))
        except AttributeError:
            return False
