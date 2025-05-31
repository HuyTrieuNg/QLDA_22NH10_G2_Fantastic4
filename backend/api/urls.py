from django.urls import path
from .views import HelloView, TestConnectionView, TestDatabaseView

urlpatterns = [
    path('hello/', HelloView.as_view()),
    path('test-connection/', TestConnectionView.as_view()),
    path('test-database/', TestDatabaseView.as_view()),
]