from django.urls import path
from .views import HelloView, TestConnectionView, TestDatabaseView
from user.views import RegisterView, ProfileView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('hello/', HelloView.as_view()),
    path('test-connection/', TestConnectionView.as_view()),
    path('test-database/', TestDatabaseView.as_view()),
]