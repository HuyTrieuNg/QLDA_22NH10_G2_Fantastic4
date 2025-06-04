from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator

class SystemConfiguration(models.Model):
    """
    System-wide configuration settings that can be managed by admins
    """
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField()
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=50, default='general')
    is_public = models.BooleanField(default=False, help_text="If true, this config can be accessed by non-admin users")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    def __str__(self):
        return f"{self.key}: {self.value[:50]}"
    
    class Meta:
        verbose_name = "System Configuration"
        verbose_name_plural = "System Configurations"

class AuditLog(models.Model):
    """
    Track important admin actions for security and audit purposes
    """
    ACTION_TYPES = (
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('user_role_change', 'User Role Change'),
        ('account_lock', 'Account Lock/Unlock'),
        ('other', 'Other'),
    )
    
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='audit_logs')
    action = models.CharField(max_length=20, choices=ACTION_TYPES)
    timestamp = models.DateTimeField(auto_now_add=True)
    object_id = models.IntegerField(null=True, blank=True)
    object_type = models.CharField(max_length=100, null=True, blank=True)
    description = models.TextField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.user} - {self.action} - {self.timestamp}"
    
    class Meta:
        ordering = ['-timestamp']
