from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Course, Section, Lesson, Quiz, Question, Choice, UserCourse, QuizAttempt


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']


class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['id', 'text', 'is_correct']


class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True)
    
    class Meta:
        model = Question
        fields = ['id', 'text', 'position', 'choices']
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Sắp xếp choices theo thứ tự tạo (hoặc có thể thêm position field cho Choice)
        data['choices'] = sorted(data['choices'], key=lambda x: x['id'])
        return data


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    section_id = serializers.IntegerField(source='section.id', read_only=True)
    course_id = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = ['id', 'title', 'position', 'questions', 'section_id', 'course_id']

    def get_course_id(self, obj):
        # Trả về id của course thông qua section
        return obj.section.course.id if obj.section and obj.section.course else None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Sắp xếp questions theo position
        data['questions'] = sorted(data['questions'], key=lambda x: x['position'])
        return data


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'content', 'position', 'video_url']


class SectionSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    quizzes = QuizSerializer(many=True, read_only=True)
    
    class Meta:
        model = Section
        fields = ['id', 'title', 'position', 'lessons', 'quizzes']


class CourseSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    sections = SectionSerializer(many=True, read_only=True)
    student_count = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'subtitle', 'description', 'created_at', 
            'last_updated_at', 'published_at', 'published', 'thumbnail',
            'creator', 'category', 'price', 'sections', 'student_count', 'is_enrolled'
        ]
    
    def get_student_count(self, obj):
        return obj.students.count()
    
    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserCourse.objects.filter(user=request.user, course=obj).exists()
        return False


class CourseCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = [
            'id','title', 'subtitle', 'description', 'published', 
            'thumbnail', 'category', 'price'
        ]


class UserCourseSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserCourse
        fields = ['id', 'user', 'course', 'enrolled_at', 'progress']


class SectionCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = ['title', 'position']


class LessonCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['title', 'content', 'position', 'video_url']


class QuizCreateUpdateSerializer(serializers.ModelSerializer):
    questions = serializers.ListField(child=serializers.DictField(), write_only=True, required=False)
    
    class Meta:
        model = Quiz
        fields = ['title', 'position', 'questions']
    
    def create(self, validated_data):
        questions_data = validated_data.pop('questions', [])
        quiz = Quiz.objects.create(**validated_data)
        
        # Tạo questions và choices
        for i, question_data in enumerate(questions_data):
            choices_data = question_data.pop('choices', [])
            question = Question.objects.create(
                quiz=quiz,
                text=question_data.get('text', ''),
                position=question_data.get('position', i + 1)
            )
            
            # Tạo choices cho question
            for choice_data in choices_data:
                choice_text = choice_data.get('text', '').strip()
                if choice_text:  # Chỉ tạo choice có text
                    Choice.objects.create(
                        question=question,
                        text=choice_text,
                        is_correct=choice_data.get('is_correct', False)                    )
        
        return quiz
    
    def update(self, instance, validated_data):
        questions_data = validated_data.pop('questions', [])
        
        # Cập nhật quiz
        instance.title = validated_data.get('title', instance.title)
        instance.position = validated_data.get('position', instance.position)
        instance.save()
        
        # Xóa tất cả questions cũ (và choices sẽ tự động xóa theo cascade)
        instance.questions.all().delete()
        
        # Tạo lại questions và choices
        for i, question_data in enumerate(questions_data):
            choices_data = question_data.pop('choices', [])
            question = Question.objects.create(
                quiz=instance,
                text=question_data.get('text', ''),
                position=question_data.get('position', i + 1)
            )
            
            # Tạo choices cho question
            for choice_data in choices_data:
                choice_text = choice_data.get('text', '').strip()
                if choice_text:  # Chỉ tạo choice có text
                    Choice.objects.create(
                        question=question,
                        text=choice_text,
                        is_correct=choice_data.get('is_correct', False)
                    )
        
        return instance


class QuestionCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['text', 'position']


class ChoiceCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['text', 'is_correct']


class QuizAttemptSerializer(serializers.ModelSerializer):
    quiz_title = serializers.CharField(source="quiz.title", read_only=True)
    class Meta:
        model = QuizAttempt
        fields = [
            "id", "quiz", "quiz_title", "score", "correct_count", "total_count", "answers", "submitted_at"
        ]


class TeacherQuizAttemptSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    detailed_answers = serializers.SerializerMethodField()
    
    class Meta:
        model = QuizAttempt
        fields = [
            'id', 'user', 'score', 'correct_count', 'total_count', 'answers', 'detailed_answers', 'submitted_at'
        ]
    
    def get_detailed_answers(self, obj):
        """
        Return detailed answers with question text and choice text
        """
        if not obj.answers:
            return []
            
        detailed = []
        quiz = obj.quiz
        questions = quiz.questions.all()
        
        for question in questions:
            qid = str(question.id)
            selected_choice_id = obj.answers.get(qid)
            
            # Get correct choice
            correct_choice = question.choices.filter(is_correct=True).first()
            
            # Get selected choice text
            selected_choice_text = None
            if selected_choice_id:
                try:
                    selected_choice = question.choices.get(id=selected_choice_id)
                    selected_choice_text = selected_choice.text
                except:
                    selected_choice_text = "Không xác định"
            
            detailed.append({
                "question": question.text,
                "your_choice": selected_choice_text or "Không trả lời",
                "correct_choice": correct_choice.text if correct_choice else "Không xác định",
                "is_correct": str(selected_choice_id) == str(correct_choice.id) if correct_choice and selected_choice_id else False
            })
            
        return detailed
