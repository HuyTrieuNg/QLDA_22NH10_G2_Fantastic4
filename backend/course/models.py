from django.db import models
from django.contrib.auth.models import User

class Course(models.Model):
    title = models.CharField(max_length=200, unique=True)
    subtitle = models.CharField(max_length=200, blank=True, null=True)
    description = models.TextField()
    created_at = models.DateField(auto_now_add=True)
    last_updated_at = models.DateField(auto_now=True)
    published_at = models.DateField(null=True, blank=True)
    published = models.BooleanField(default=False)
    thumbnail = models.ImageField(
        null=True, blank=True, upload_to='thumbnails/',)
    creator = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="courses", null=True)
    students = models.ManyToManyField(User, through='UserCourse')
    category = models.CharField(max_length=100, blank=True, null=True)
    price = models.DecimalField(
        max_digits=6, decimal_places=2, null=True, blank=True, default=11.99)
        
    def __str__(self):
        return str(self.id)


class Section(models.Model):
    title = models.CharField(max_length=200)
    position = models.PositiveIntegerField()
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="sections")

    def __str__(self):
        return str(self.id)
    
class Lesson(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    position = models.PositiveIntegerField()
    video_url = models.URLField(blank=True, null=True)
    section = models.ForeignKey(
        Section, on_delete=models.CASCADE, related_name="lessons")

    def __str__(self):
        return str(self.id)

class Quiz(models.Model):
    title = models.CharField(max_length=200)
    section = models.ForeignKey(
        Section, on_delete=models.CASCADE, related_name="quizzes")
    position = models.PositiveIntegerField()

    def __str__(self):
        return str(self.id)

class Question(models.Model):
    quiz = models.ForeignKey(
        Quiz, on_delete=models.CASCADE, related_name="questions")
    text = models.TextField()
    position = models.PositiveIntegerField()

    def __str__(self):
        return str(self.id)

class Choice(models.Model):
    question = models.ForeignKey(
        Question, on_delete=models.CASCADE, related_name="choices")
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return str(self.id)
    
class UserCourse(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    enrolled_at = models.DateTimeField(auto_now_add=True)
    progress = models.FloatField(default=0.0)  # Progress in percentage

    class Meta:
        unique_together = ('user', 'course')

    def __str__(self):
        return f"{self.user.username} - {self.course.title}"


    
