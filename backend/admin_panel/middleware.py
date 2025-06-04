from django.utils.deprecation import MiddlewareMixin
from django.urls import resolve
from .models import AuditLog
import json
import re

class AdminAuditMiddleware(MiddlewareMixin):
    """Middleware to log admin actions for audit purposes"""
    
    def process_response(self, request, response):
        # Only log admin panel actions
        if '/api/admin-panel/' not in request.path:
            return response
            
        # Only log authenticated requests
        if not hasattr(request, 'user') or not request.user.is_authenticated:
            return response
            
        # Skip GET requests (just viewing, not modifying)
        if request.method == 'GET':
            return response
            
        try:
            # Determine the action type based on HTTP method
            action_map = {
                'POST': 'create',
                'PUT': 'update',
                'PATCH': 'update',
                'DELETE': 'delete'
            }
            
            action = action_map.get(request.method, 'other')
            
            # Determine object type from URL
            url_name = resolve(request.path_info).url_name
            
            # Extract object ID from URL if it's a detail action
            object_id = None
            url_id_match = re.search(r'/(\d+)/?$', request.path)
            if url_id_match:
                object_id = int(url_id_match.group(1))
                
            # Custom handling for special actions
            if 'change_user_type' in request.path:
                action = 'user_role_change'
            elif 'toggle_active_status' in request.path:
                action = 'account_lock'
                
            # Get request body for description
            description = ""
            if request.body:
                try:
                    body = json.loads(request.body)
                    description = json.dumps(body)
                except json.JSONDecodeError:
                    description = request.body.decode('utf-8', errors='ignore')
            
            # Get client IP
            ip_address = request.META.get('HTTP_X_FORWARDED_FOR')
            if not ip_address:
                ip_address = request.META.get('REMOTE_ADDR')
            
            # Extract first IP if multiple are provided
            if ip_address and ',' in ip_address:
                ip_address = ip_address.split(',')[0].strip()
                
            # Extract object type from URL
            object_type = url_name.split('-')[-1] if url_name else None
            
            # Skip recording if we don't have enough context
            if action != 'other' or object_type:
                AuditLog.objects.create(
                    user=request.user,
                    action=action,
                    object_id=object_id,
                    object_type=object_type,
                    description=description[:1000],  # Limit description length
                    ip_address=ip_address
                )
                
        except Exception as e:
            # Fail silently, we don't want to break the application if logging fails
            pass
            
        return response
