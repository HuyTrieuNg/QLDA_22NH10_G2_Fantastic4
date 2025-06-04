from django.db.models.signals import pre_delete
from django.dispatch import receiver
from course.models import Course, Section, Lesson, Quiz
from django.contrib.auth.models import User
import logging

logger = logging.getLogger(__name__)

@receiver(pre_delete, sender=Course)
def log_course_deletion(sender, instance, **kwargs):
    """Log when a course is being deleted by an admin"""
    logger.info(f"Course being deleted: {instance.title} (ID: {instance.id})")
    
    # Additional logic could be added here like notifications to enrolled students

@receiver(pre_delete, sender=User)
def handle_user_deletion(sender, instance, **kwargs):
    """Log and handle user deletion"""
    logger.info(f"User being deleted: {instance.username} (ID: {instance.id})")
    
    # Additional cleanup or notification logic could be added here
