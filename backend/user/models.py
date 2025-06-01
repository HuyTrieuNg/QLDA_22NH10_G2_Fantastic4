from django.db import models

# Import UserProfile and make it available at the module level
from .models.user_profile import UserProfile

# This allows imports like `from user.models import UserProfile` to work
