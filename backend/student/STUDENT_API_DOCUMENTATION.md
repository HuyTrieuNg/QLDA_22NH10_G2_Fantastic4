# 🎓 Student Module API Documentation

Tài liệu này mô tả đầy đủ các API endpoints dành cho học viên trong Smart Learning Platform với hướng dẫn test Postman chi tiết.

## 🔑 Authentication & Permissions

### JWT Authentication
```
Authorization: Bearer <student_jwt_token>
```

### Permission Levels:
- **Public**: Không cần đăng nhập
- **Student**: Yêu cầu đăng nhập với quyền student
- **Authenticated**: Yêu cầu đăng nhập (bất kỳ role nào)

## 🌐 Base URL
```
Base URL: http://localhost:8000/api/student/
Auth URL: http://localhost:8000/api/auth/
```

## 📋 API Endpoints

### 🎯 1. Course Discovery & Search

#### 1.1 Danh sách khóa học và tìm kiếm
- **URL**: `GET /api/student/courses/`
- **Permission**: Public
- **Query Parameters**:
  - `search`: Tìm kiếm theo tiêu đề, mô tả, danh mục
  - `category`: Lọc theo danh mục
  - `ordering`: Sắp xếp (-created_at, price, -price, title)
  - `min_price`, `max_price`: Lọc theo khoảng giá

**Response:**
```json
{
  "count": 25,
  "next": "http://localhost:8000/api/student/courses/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Python Cơ bản",
      "subtitle": "Học lập trình Python từ cơ bản đến nâng cao",
      "thumbnail": "http://localhost:8000/media/thumbnails/python.jpg",
      "category": "Programming",
      "price": "99.99",
      "creator": {
        "id": 2,
        "username": "teacher1",
        "first_name": "John",
        "last_name": "Doe"
      },
      "student_count": 42,
      "lesson_count": 15,
      "section_count": 5,
      "is_enrolled": false,
      "avg_rating": 4.5,
      "total_reviews": 25
    }
  ]
}
```

**🧪 Postman Test:**
```javascript
// GET {{base_url}}/student/courses/
// Headers: (không cần authentication)

// Test Script:
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response contains courses", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('results');
    pm.expect(jsonData.results).to.be.an('array');
});

pm.test("Course has essential fields", function () {
    var jsonData = pm.response.json();
    if (jsonData.results.length > 0) {
        var course = jsonData.results[0];
        pm.expect(course).to.have.property('id');
        pm.expect(course).to.have.property('title');
        pm.expect(course).to.have.property('price');
        pm.expect(course).to.have.property('is_enrolled');
    }
});

// Save first course ID for other tests
pm.test("Save course ID", function () {
    var jsonData = pm.response.json();
    if (jsonData.results.length > 0) {
        pm.environment.set("test_course_id", jsonData.results[0].id);
    }
});
```

#### 1.2 Chi tiết khóa học
- **URL**: `GET /api/student/courses/{course_id}/`
- **Permission**: Public
- **Mô tả**: Xem chi tiết khóa học với thông tin sections, lessons, quizzes

**Response:**
```json
{
  "id": 1,
  "title": "Python Cơ bản",
  "subtitle": "Học lập trình Python từ cơ bản đến nâng cao",
  "description": "Khóa học này sẽ giúp bạn làm quen với Python từ cơ bản...",
  "thumbnail": "http://localhost:8000/media/thumbnails/python.jpg",
  "category": "Programming",
  "price": "99.99",
  "creator": {
    "id": 2,
    "username": "teacher1",
    "first_name": "John",
    "last_name": "Doe",
    "profile": {
      "bio": "Experienced Python developer...",
      "avatar": "http://localhost:8000/media/avatars/teacher1.jpg"
    }
  },
  "is_enrolled": true,
  "enrollment_date": "2025-06-01T10:00:00Z",
  "progress": 65.5,
  "sections": [
    {
      "id": 1,
      "title": "Giới thiệu về Python",
      "position": 1,
      "lessons": [
        {
          "id": 1,
          "title": "Cài đặt Python",
          "position": 1,
          "video_url": "https://youtube.com/watch?v=abc123",
          "is_completed": true
        },
        {
          "id": 2,
          "title": "Python IDE Setup",
          "position": 2,
          "video_url": "https://youtube.com/watch?v=def456",
          "is_completed": false
        }
      ],
      "quizzes": [
        {
          "id": 1,
          "title": "Kiểm tra cài đặt",
          "position": 3,
          "is_completed": true,
          "last_score": 8.5,
          "best_score": 9.0,
          "attempt_count": 2
        }
      ]
    }
  ],
  "total_lessons": 15,
  "completed_lessons": 10,
  "total_quizzes": 5,
  "completed_quizzes": 3,
  "avg_quiz_score": 7.8
}
```

**🧪 Postman Test:**
```javascript
// GET {{base_url}}/student/courses/{{test_course_id}}/
// Headers: Authorization: Bearer {{student_token}} (optional, for enrollment info)

// Test Script:
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Course has detailed structure", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('sections');
    pm.expect(jsonData.sections).to.be.an('array');
    
    if (jsonData.sections.length > 0) {
        var section = jsonData.sections[0];
        pm.expect(section).to.have.property('lessons');
        pm.expect(section).to.have.property('quizzes');
    }
});

pm.test("Progress tracking fields present", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('total_lessons');
    pm.expect(jsonData).to.have.property('total_quizzes');
});
```

### 📚 2. Course Enrollment Management

#### 2.1 Đăng ký khóa học
- **URL**: `POST /api/student/courses/{course_id}/enroll/`
- **Permission**: Student
- **Mô tả**: Đăng ký học viên vào khóa học

**Response:**
```json
{
  "detail": "Đăng ký khóa học thành công",
  "enrollment": {
    "id": 15,
    "course_id": 1,
    "student_id": 5,
    "enrolled_at": "2025-06-15T14:30:00Z",
    "progress": 0.0
  }
}
```

**🧪 Postman Test:**
```javascript
// POST {{base_url}}/student/courses/{{test_course_id}}/enroll/
// Headers: Authorization: Bearer {{student_token}}

// Test Script:
pm.test("Status code is 200 or 201", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});

pm.test("Enrollment successful", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('detail');
    pm.expect(jsonData.detail).to.include('thành công');
});

pm.test("Enrollment object returned", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('enrollment');
    pm.expect(jsonData.enrollment).to.have.property('course_id');
    pm.expect(jsonData.enrollment).to.have.property('progress');
});
```

#### 2.2 Hủy đăng ký khóa học
- **URL**: `DELETE /api/student/courses/{course_id}/unenroll/`
- **Permission**: Student
- **Mô tả**: Hủy đăng ký khóa học

**Response:**
```json
{
  "detail": "Đã hủy đăng ký khóa học thành công"
}
```

#### 2.3 Danh sách khóa học đã đăng ký
- **URL**: `GET /api/student/my-courses/`
- **Permission**: Student
- **Query Parameters**:
  - `ordering`: Sắp xếp (-enrolled_at, progress, -progress)
  - `category`: Lọc theo danh mục

**Response:**
```json
{
  "count": 3,
  "results": [
    {
      "id": 1,
      "course": {
        "id": 1,
        "title": "Python Cơ bản",
        "subtitle": "Học lập trình Python từ cơ bản đến nâng cao",
        "thumbnail": "http://localhost:8000/media/thumbnails/python.jpg",
        "category": "Programming",
        "creator": {
          "first_name": "John",
          "last_name": "Doe"
        }
      },
      "enrolled_at": "2025-06-01T10:00:00Z",
      "progress": 65.5,
      "last_accessed": "2025-06-14T15:30:00Z",
      "completed_lessons": 10,
      "total_lessons": 15,
      "completed_quizzes": 3,
      "total_quizzes": 5,
      "avg_quiz_score": 7.8
    }
  ]
}
```

**🧪 Postman Test:**
```javascript
// GET {{base_url}}/student/my-courses/
// Headers: Authorization: Bearer {{student_token}}

// Test Script:
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Returns enrolled courses", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('results');
    pm.expect(jsonData.results).to.be.an('array');
});

pm.test("Course progress tracking", function () {
    var jsonData = pm.response.json();
    if (jsonData.results.length > 0) {
        var enrollment = jsonData.results[0];
        pm.expect(enrollment).to.have.property('progress');
        pm.expect(enrollment).to.have.property('completed_lessons');
        pm.expect(enrollment).to.have.property('total_lessons');
    }
});
```

### 🎥 3. Lesson & Learning Content

#### 3.1 Xem chi tiết bài giảng
- **URL**: `GET /api/student/lessons/{lesson_id}/`
- **Permission**: Student (enrolled in course)
- **Mô tả**: Lấy nội dung bài giảng và tự động đánh dấu đã xem

**Response:**
```json
{
  "id": 1,
  "title": "Cài đặt Python",
  "content": "Nội dung chi tiết của bài giảng...",
  "video_url": "https://youtube.com/watch?v=abc123",
  "duration": 1800,
  "position": 1,
  "section": {
    "id": 1,
    "title": "Giới thiệu về Python",
    "course_id": 1
  },
  "is_completed": true,
  "completed_at": "2025-06-10T14:30:00Z",
  "next_lesson": {
    "id": 2,
    "title": "Python IDE Setup"
  },
  "previous_lesson": null
}
```

**🧪 Postman Test:**
```javascript
// GET {{base_url}}/student/lessons/{{lesson_id}}/
// Headers: Authorization: Bearer {{student_token}}

// Test Script:
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Lesson content available", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('title');
    pm.expect(jsonData).to.have.property('content');
    pm.expect(jsonData).to.have.property('video_url');
});

pm.test("Navigation links present", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('next_lesson');
    pm.expect(jsonData).to.have.property('previous_lesson');
});

// Save lesson ID for other tests
pm.environment.set("test_lesson_id", pm.response.json().id);
```

#### 3.2 Đánh dấu bài giảng hoàn thành
- **URL**: `POST /api/student/lessons/{lesson_id}/complete/`
- **Permission**: Student (enrolled in course)

**Response:**
```json
{
  "detail": "Đã đánh dấu bài giảng hoàn thành",
  "progress_updated": true,
  "new_progress": 66.7
}
```

### 📝 4. Quiz & Assessment

#### 4.1 Lấy thông tin quiz
- **URL**: `GET /api/student/quizzes/{quiz_id}/`
- **Permission**: Student (enrolled in course)

**Response:**
```json
{
  "id": 1,
  "title": "Kiểm tra cài đặt Python",
  "description": "Quiz kiểm tra hiểu biết về cài đặt Python",
  "time_limit": 600,
  "max_attempts": 3,
  "attempt_count": 1,
  "best_score": 8.5,
  "last_score": 8.5,
  "is_completed": true,
  "section": {
    "id": 1,
    "title": "Giới thiệu về Python",
    "course_id": 1
  },
  "questions": [
    {
      "id": 1,
      "question_text": "Python được phát triển bởi ai?",
      "question_type": "multiple_choice",
      "choices": [
        {
          "id": 1,
          "choice_text": "Guido van Rossum"
        },
        {
          "id": 2,
          "choice_text": "Dennis Ritchie"
        },
        {
          "id": 3,
          "choice_text": "Linus Torvalds"
        }
      ]
    }
  ]
}
```

**🧪 Postman Test:**
```javascript
// GET {{base_url}}/student/quizzes/{{quiz_id}}/
// Headers: Authorization: Bearer {{student_token}}

// Test Script:
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Quiz structure is correct", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('questions');
    pm.expect(jsonData.questions).to.be.an('array');
    
    if (jsonData.questions.length > 0) {
        var question = jsonData.questions[0];
        pm.expect(question).to.have.property('question_text');
        pm.expect(question).to.have.property('choices');
    }
});

pm.test("Attempt tracking present", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('attempt_count');
    pm.expect(jsonData).to.have.property('max_attempts');
});
```

#### 4.2 Nộp bài quiz
- **URL**: `POST /api/student/quizzes/{quiz_id}/submit/`
- **Permission**: Student (enrolled in course)

**Request Body:**
```json
{
  "answers": [
    {
      "question_id": 1,
      "choice_ids": [1]
    },
    {
      "question_id": 2,
      "choice_ids": [3, 4]
    }
  ]
}
```

**Response:**
```json
{
  "attempt_id": 5,
  "score": 8.5,
  "max_score": 10.0,
  "percentage": 85.0,
  "passed": true,
  "time_taken": 450,
  "submitted_at": "2025-06-15T16:30:00Z",
  "results": [
    {
      "question_id": 1,
      "is_correct": true,
      "score": 2.0,
      "max_score": 2.0
    },
    {
      "question_id": 2,
      "is_correct": false,
      "score": 0.0,
      "max_score": 2.0,
      "explanation": "Đáp án đúng là option C và D"
    }
  ],
  "progress_updated": true,
  "new_course_progress": 72.3
}
```

**🧪 Postman Test:**
```javascript
// POST {{base_url}}/student/quizzes/{{quiz_id}}/submit/
// Headers: Authorization: Bearer {{student_token}}

// Request Body:
{
  "answers": [
    {
      "question_id": 1,
      "choice_ids": [1]
    }
  ]
}

// Test Script:
pm.test("Status code is 200 or 201", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});

pm.test("Quiz results returned", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('score');
    pm.expect(jsonData).to.have.property('percentage');
    pm.expect(jsonData).to.have.property('results');
});

pm.test("Progress tracking updated", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('progress_updated');
    if (jsonData.progress_updated) {
        pm.expect(jsonData).to.have.property('new_course_progress');
    }
});
```

#### 4.3 Lịch sử làm quiz
- **URL**: `GET /api/student/quizzes/{quiz_id}/attempts/`
- **Permission**: Student (enrolled in course)

**Response:**
```json
{
  "count": 2,
  "results": [
    {
      "id": 5,
      "score": 8.5,
      "max_score": 10.0,
      "percentage": 85.0,
      "time_taken": 450,
      "submitted_at": "2025-06-15T16:30:00Z",
      "is_best": true
    },
    {
      "id": 3,
      "score": 6.0,
      "max_score": 10.0,
      "percentage": 60.0,
      "time_taken": 380,
      "submitted_at": "2025-06-10T14:15:00Z",
      "is_best": false
    }
  ]
}
```

### 📊 5. Progress Tracking

#### 5.1 Tiến độ khóa học chi tiết
- **URL**: `GET /api/student/courses/{course_id}/progress/`
- **Permission**: Student (enrolled in course)

**Response:**
```json
{
  "course_id": 1,
  "overall_progress": 65.5,
  "lessons_progress": {
    "completed": 10,
    "total": 15,
    "percentage": 66.7
  },
  "quizzes_progress": {
    "completed": 3,
    "total": 5,
    "percentage": 60.0,
    "avg_score": 7.8
  },
  "sections_progress": [
    {
      "section_id": 1,
      "title": "Giới thiệu về Python",
      "progress": 100.0,
      "lessons_completed": 3,
      "lessons_total": 3,
      "quizzes_completed": 1,
      "quizzes_total": 1
    },
    {
      "section_id": 2,
      "title": "Cú pháp cơ bản",
      "progress": 50.0,
      "lessons_completed": 2,
      "lessons_total": 4,
      "quizzes_completed": 1,
      "quizzes_total": 2
    }
  ],
  "last_accessed": "2025-06-14T15:30:00Z",
  "time_spent": 14400,
  "estimated_completion": "2025-07-01T00:00:00Z"
}
```

**🧪 Postman Test:**
```javascript
// GET {{base_url}}/student/courses/{{test_course_id}}/progress/
// Headers: Authorization: Bearer {{student_token}}

// Test Script:
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Progress breakdown available", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('overall_progress');
    pm.expect(jsonData).to.have.property('lessons_progress');
    pm.expect(jsonData).to.have.property('quizzes_progress');
    pm.expect(jsonData).to.have.property('sections_progress');
});

pm.test("Section progress details", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.sections_progress).to.be.an('array');
    if (jsonData.sections_progress.length > 0) {
        var section = jsonData.sections_progress[0];
        pm.expect(section).to.have.property('progress');
        pm.expect(section).to.have.property('lessons_completed');
    }
});
```

### 🤖 6. AI Feedback & Recommendations

#### 6.1 Lấy gợi ý AI cho khóa học
- **URL**: `GET /api/student/courses/{course_id}/ai-recommendations/`
- **Permission**: Student (enrolled in course)

**Response:**
```json
{
  "course_id": 1,
  "recommendations": {
    "next_actions": [
      {
        "type": "lesson",
        "id": 6,
        "title": "Variables và Data Types",
        "reason": "Tiếp tục với bài giảng tiếp theo trong chương trình",
        "priority": "high"
      },
      {
        "type": "quiz",
        "id": 3,
        "title": "Kiểm tra Variables",
        "reason": "Cần cải thiện điểm quiz (điểm hiện tại: 6.5/10)",
        "priority": "medium"
      }
    ],
    "study_tips": [
      "Bạn đang tiến bộ tốt với các bài giảng, hãy thử làm thêm quiz để củng cố kiến thức",
      "Dành 30 phút mỗi ngày để ôn tập sẽ giúp bạn ghi nhớ tốt hơn"
    ],
    "performance_analysis": {
      "strong_areas": ["Basic Syntax", "Variables"],
      "weak_areas": ["Functions", "Error Handling"],
      "improvement_suggestions": [
        "Xem lại bài giảng về Functions",
        "Làm thêm bài tập thực hành về Error Handling"
      ]
    }
  },
  "generated_at": "2025-06-15T18:00:00Z"
}
```

**🧪 Postman Test:**
```javascript
// GET {{base_url}}/student/courses/{{test_course_id}}/ai-recommendations/
// Headers: Authorization: Bearer {{student_token}}

// Test Script:
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("AI recommendations structure", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('recommendations');
    pm.expect(jsonData.recommendations).to.have.property('next_actions');
    pm.expect(jsonData.recommendations).to.have.property('study_tips');
});

pm.test("Performance analysis available", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.recommendations).to.have.property('performance_analysis');
    var analysis = jsonData.recommendations.performance_analysis;
    pm.expect(analysis).to.have.property('strong_areas');
    pm.expect(analysis).to.have.property('weak_areas');
});
```

### 📱 7. Student Dashboard

#### 7.1 Dashboard tổng quan
- **URL**: `GET /api/student/dashboard/`
- **Permission**: Student

**Response:**
```json
{
  "student_stats": {
    "total_courses": 3,
    "completed_courses": 1,
    "in_progress_courses": 2,
    "total_lessons_completed": 45,
    "total_quizzes_completed": 12,
    "avg_quiz_score": 8.2,
    "total_study_time": 86400,
    "streak_days": 7
  },
  "recent_activity": [
    {
      "type": "lesson_completed",
      "lesson_id": 15,
      "lesson_title": "Advanced Functions",
      "course_title": "Python Cơ bản",
      "timestamp": "2025-06-15T16:30:00Z"
    },
    {
      "type": "quiz_completed",
      "quiz_id": 5,
      "quiz_title": "Variables Test",
      "score": 9.0,
      "course_title": "Python Cơ bản",
      "timestamp": "2025-06-15T14:20:00Z"
    }
  ],
  "current_courses": [
    {
      "id": 1,
      "title": "Python Cơ bản",
      "progress": 65.5,
      "next_lesson": {
        "id": 16,
        "title": "Error Handling"
      },
      "last_accessed": "2025-06-15T16:30:00Z"
    }
  ],
  "recommended_courses": [
    {
      "id": 5,
      "title": "JavaScript Fundamentals",
      "reason": "Dựa trên sở thích lập trình của bạn",
      "rating": 4.7
    }
  ]
}
```

**🧪 Postman Test:**
```javascript
// GET {{base_url}}/student/dashboard/
// Headers: Authorization: Bearer {{student_token}}

// Test Script:
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Dashboard contains student stats", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('student_stats');
    pm.expect(jsonData.student_stats).to.have.property('total_courses');
    pm.expect(jsonData.student_stats).to.have.property('total_study_time');
});

pm.test("Recent activity tracking", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('recent_activity');
    pm.expect(jsonData.recent_activity).to.be.an('array');
});

pm.test("Course recommendations available", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('recommended_courses');
    pm.expect(jsonData.recommended_courses).to.be.an('array');
});
```

## 🚀 Postman Environment Setup

### Environment Variables
```json
{
  "base_url": "http://localhost:8000/api",
  "auth_url": "http://localhost:8000/api/auth",
  "student_email": "student@example.com",
  "student_password": "password123",
  "student_token": "",
  "test_course_id": "",
  "test_lesson_id": "",
  "quiz_id": ""
}
```

### Pre-request Script (Collection Level)
```javascript
// Auto-login if token is missing or expired
if (!pm.environment.get("student_token")) {
    const loginRequest = {
        url: pm.environment.get("auth_url") + "/login/",
        method: 'POST',
        header: {
            'Content-Type': 'application/json',
        },
        body: {
            mode: 'raw',
            raw: JSON.stringify({
                email: pm.environment.get("student_email"),
                password: pm.environment.get("student_password")
            })
        }
    };
    
    pm.sendRequest(loginRequest, function (err, response) {
        if (err) {
            console.log('Login failed:', err);
        } else {
            const jsonData = response.json();
            pm.environment.set("student_token", jsonData.access);
        }
    });
}
```

### Global Test Script
```javascript
// Global error handling
pm.test("Response time is less than 2000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});

pm.test("Content-Type is JSON", function () {
    pm.expect(pm.response.headers.get("Content-Type")).to.include("application/json");
});

// Handle authentication errors
if (pm.response.code === 401) {
    console.log("Authentication failed, clearing token");
    pm.environment.unset("student_token");
}
```

## 🔧 Testing Workflow

### 1. Setup Phase
1. Set environment variables
2. Run authentication request
3. Verify token is saved

### 2. Course Discovery Flow
1. Get all courses (`GET /courses/`)
2. Get course details (`GET /courses/{id}/`)
3. Enroll in course (`POST /courses/{id}/enroll/`)

### 3. Learning Flow
1. Get enrolled courses (`GET /my-courses/`)
2. View lesson (`GET /lessons/{id}/`)
3. Complete lesson (`POST /lessons/{id}/complete/`)
4. Take quiz (`GET /quizzes/{id}/`, `POST /quizzes/{id}/submit/`)

### 4. Progress Tracking
1. Check course progress (`GET /courses/{id}/progress/`)
2. View dashboard (`GET /dashboard/`)
3. Get AI recommendations (`GET /courses/{id}/ai-recommendations/`)

## ⚠️ Error Codes

| Status | Meaning | Description |
|--------|---------|-------------|
| 400 | Bad Request | Request data không hợp lệ |
| 401 | Unauthorized | Chưa đăng nhập hoặc token hết hạn |
| 403 | Forbidden | Không có quyền truy cập (chưa enroll course) |
| 404 | Not Found | Resource không tồn tại |
| 429 | Too Many Requests | Quá nhiều requests, cần giảm tần suất |
| 500 | Internal Server Error | Lỗi server |

## 🛠️ Troubleshooting

### Authentication Issues
```javascript
// Check if token is valid
pm.test("Token validation", function () {
    if (pm.response.code === 401) {
        console.log("Token expired or invalid");
        pm.environment.unset("student_token");
    }
});
```

### Quiz Submission Issues
- Đảm bảo `question_id` và `choice_ids` đúng format
- Kiểm tra còn số lần attempt
- Verify đã enroll course chứa quiz

### Progress Tracking Issues
- Lesson completion tự động khi view lesson
- Quiz completion sau khi submit
- Progress calculation có thể có delay

### Common Error Responses
```json
{
  "detail": "Authentication credentials were not provided."
}

{
  "detail": "You are not enrolled in this course."
}

{
  "non_field_errors": ["You have exceeded the maximum number of attempts for this quiz."]
}
```
