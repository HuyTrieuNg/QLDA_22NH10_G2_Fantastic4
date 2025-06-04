from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models.user_profile import UserProfile

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Create a UserProfile whenever a new User is created."""
    if created:
        if not hasattr(instance, 'profile'):
            user_type = getattr(instance, '_user_type', 'student')
            UserProfile.objects.create(user=instance, user_type=user_type)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Update the UserProfile whenever User is updated."""
    profile, created = UserProfile.objects.get_or_create(
        user=instance,
        defaults={'user_type': 'student'}
    )
    if not created:
        profile.save()
