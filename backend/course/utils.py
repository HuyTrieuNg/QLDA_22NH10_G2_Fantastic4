import re
import json
import logging
from google import genai
from youtube_transcript_api import YouTubeTranscriptApi
from django.conf import settings

logger = logging.getLogger(__name__)

def extract_youtube_video_id(url):
    """Extract YouTube video ID from URL"""
    patterns = [
        r'(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)',
        r'(?:youtu\.be\/)([a-zA-Z0-9_-]+)',
        r'(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]+)',
        r'(?:youtube\.com\/v\/)([a-zA-Z0-9_-]+)'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None

def get_youtube_transcript(video_url):
    """Get transcript from YouTube video. Prefer Vietnamese, then English, then any."""
    try:
        video_id = extract_youtube_video_id(video_url)
        if not video_id:
            return None

        # Ngôn ngữ ưu tiên: tiếng Việt → tiếng Anh → bất kỳ
        language_priority = [['vi', 'vi-VN'], ['en', 'en-US'], []]
        
        for languages in language_priority:
            try:
                transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=languages) if languages else YouTubeTranscriptApi.get_transcript(video_id)
                full_text = ' '.join([entry['text'] for entry in transcript])
                return full_text
            except Exception:
                continue  # thử tiếp ngôn ngữ tiếp theo

    except Exception as e:
        logger.error(f"Error getting YouTube transcript for {video_url}: {str(e)}")
    
    return None


def generate_quiz_with_ai(content, num_questions=10):
    """Generate quiz questions using Google Gemini AI"""
    try:
        # Configure Gemini AI
        client = genai.Client(api_key=getattr(settings, 'GOOGLE_AI_API_KEY', ''))
        
        prompt = f"""
        Based on the following educational content, generate {num_questions} multiple choice questions.
        Each question should have exactly 4 answer choices with only one correct answer.
        
        Content:
        {content[:10000]}  # Limit content to avoid token limits
          Please format your response as a JSON array with this exact structure:
        [
            {{
                "question": "Question text here?",
                "choices": [
                    "Choice A text",
                    "Choice B text", 
                    "Choice C text",
                    "Choice D text"
                ],
                "correct_answer": 0
            }}
        ]
        
        Requirements:
        - Questions should be educational and test understanding
        - All choices should be plausible but only one correct
        - Use Vietnamese if the content is in Vietnamese, otherwise use English
        - correct_answer should be the index (0-3) of the correct choice
        - Make questions varied in difficulty
        - Focus on key concepts and important information
        """
        
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            )
        
        # Extract JSON from response
        response_text = response.text.strip()
        
        # Try to find JSON array in the response
        json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
        if json_match:
            json_str = json_match.group(0)
            questions = json.loads(json_str)
            
            # Validate the structure
            validated_questions = []
            for q in questions:
                if (isinstance(q, dict) and 
                    'question' in q and 
                    'choices' in q and 
                    'correct_answer' in q and
                    isinstance(q['choices'], list) and 
                    len(q['choices']) == 4 and
                    isinstance(q['correct_answer'], int) and
                    0 <= q['correct_answer'] <= 3):
                    validated_questions.append(q)
            
            return validated_questions[:num_questions]
        
    except Exception as e:
        logger.error(f"Error generating quiz with AI: {str(e)}")
        return []
    
    return []

def extract_lesson_content(lesson):
    """Extract text content from lesson"""
    content_parts = []
    
    if lesson.title:
        content_parts.append(f"Title: {lesson.title}")
    
    if lesson.content:
        content_parts.append(f"Content: {lesson.content}")
    
    # Extract YouTube transcript if video_url exists
    if lesson.video_url:
        transcript = get_youtube_transcript(lesson.video_url)
        if transcript:
            content_parts.append(f"Video Transcript: {transcript}")
    
    return "\n\n".join(content_parts)

def generate_quiz_from_lessons(section, num_questions=10):
    """Generate quiz questions from all lessons in a section"""
    try:
        lessons = section.lessons.all()
        if not lessons:
            return []
        
        # Combine content from all lessons
        all_content = []
        for lesson in lessons:
            content = extract_lesson_content(lesson)
            if content.strip():
                all_content.append(content)
        
        if not all_content:
            return []
        
        combined_content = "\n\n--- Lesson Separator ---\n\n".join(all_content)
        
        # Generate questions using AI
        questions = generate_quiz_with_ai(combined_content, num_questions)
        
        return questions
        
    except Exception as e:
        logger.error(f"Error generating quiz from lessons: {str(e)}")
        return []

def generate_quiz_from_selected_lessons(lesson_ids, num_questions=10):
    """Generate quiz questions from selected lessons"""
    try:
        from .models import Lesson
        
        lessons = Lesson.objects.filter(id__in=lesson_ids)
        if not lessons:
            return []
        
        # Combine content from selected lessons
        all_content = []
        for lesson in lessons:
            content = extract_lesson_content(lesson)
            if content.strip():
                all_content.append(content)
        
        if not all_content:
            return []
        
        combined_content = "\n\n--- Lesson Separator ---\n\n".join(all_content)
        
        # Generate questions using AI
        questions = generate_quiz_with_ai(combined_content, num_questions)
        
        return questions
        
    except Exception as e:
        logger.error(f"Error generating quiz from selected lessons: {str(e)}")
        return []

def summarize_content_with_ai(content):
    """Summarize content using Google Gemini AI"""
    try:
        client = genai.Client(api_key=getattr(settings, 'GOOGLE_AI_API_KEY', ''))
        prompt = f"""
            Bạn là một trợ lý AI. Lọc lấy nội dung bài giảng và tóm tắt thành danh sách các ý chính ngắn gọn, dễ hiểu.
            Yêu cầu:
            - Các ý ghi chú cần nhớ.
            - Viết mỗi ý trên một dòng, dạng dấu gạch đầu dòng (-).
            - Tối đa 20 ý chính.
            - Không viết lại toàn văn, chỉ nêu thông tin cốt lõi.
            - Nếu nội dung là tiếng Việt, hãy giữ tiếng Việt.
            - Nếu nội dung là tiếng Anh, hãy giữ tiếng Anh.

            Nội dung bao gồm bài giảng và phụ đề video:
            \"\"\"
            {content[:5000]}
            \"\"\"
        """
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )
        response_text = response.text.strip()
        return response_text
    except Exception as e:
        print(content)
        logger.error(f"Error summarizing content with AI: {str(e)}")
        return None

def generate_quiz_feedback_with_ai(prompt):
    """Sinh nhận xét AI cho kết quả quiz với prompt tự do (không ép dạng tóm tắt)"""
    try:
        client = genai.Client(api_key=getattr(settings, 'GOOGLE_AI_API_KEY', ''))
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )
        response_text = response.text.strip()
        return response_text
    except Exception as e:
        logger.error(f"Error generating quiz feedback with AI: {str(e)}")
        return None
