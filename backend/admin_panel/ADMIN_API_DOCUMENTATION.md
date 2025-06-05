# 👑 Admin Panel API Documentation

Tài liệu này mô tả đầy đủ các API endpoints dành cho quản trị viên trong Smart Learning Platform với hướng dẫn test Postman chi tiết.

## 🔑 Authentication & Permissions

### JWT Authentication
```
Authorization: Bearer <admin_jwt_token>
```

### Permission Levels:
- **Admin Only**: Yêu cầu user_type='admin' hoặc is_staff=True
- **Super Admin**: Một số tính năng yêu cầu quyền cao nhất

## 🌐 Base URL
```
Base URL: http://localhost:8000/api/admin-panel/
Auth URL: http://localhost:8000/api/auth/
```

## 📋 API Endpoints

### 👥 1. User Management

#### 1.1 Danh sách tất cả người dùng
- **URL**: `GET /api/admin-panel/users/`
- **Permission**: Admin
- **Query Parameters**:
  - `search`: Tìm kiếm theo username, email, name
  - `user_type`: Lọc theo loại user (student, teacher, admin)
  - `is_active`: Lọc theo trạng thái (true/false)
  - `ordering`: Sắp xếp (-date_joined, username, email)

**Response:**
```json
{
  "count": 150,
  "next": "http://localhost:8000/api/admin-panel/users/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "user_type": "student",
      "is_active": true,
      "is_staff": false,
      "date_joined": "2025-01-15T10:30:00Z",
      "last_login": "2025-06-15T14:20:00Z",
      "profile": {
        "bio": "Student interested in programming",
        "phone": "+1234567890",
        "date_of_birth": "1995-05-15"
      },
      "stats": {
        "courses_enrolled": 3,
        "courses_completed": 1,
        "total_study_time": 14400
      }
    }
  ]
}
```

**🧪 Postman Test:**
```javascript
// GET {{base_url}}/admin-panel/users/
// Headers: Authorization: Bearer {{admin_token}}

// Test Script:
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Users list returned", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('results');
    pm.expect(jsonData.results).to.be.an('array');
});

pm.test("User has required fields", function () {
    var jsonData = pm.response.json();
    if (jsonData.results.length > 0) {
        var user = jsonData.results[0];
        pm.expect(user).to.have.property('id');
        pm.expect(user).to.have.property('username');
        pm.expect(user).to.have.property('user_type');
        pm.expect(user).to.have.property('is_active');
    }
});

// Save test user ID
pm.test("Save user ID for tests", function () {
    var jsonData = pm.response.json();
    if (jsonData.results.length > 0) {
        pm.environment.set("test_user_id", jsonData.results[0].id);
    }
});
```

#### 1.2 Chi tiết người dùng
- **URL**: `GET /api/admin-panel/users/{user_id}/`
- **Permission**: Admin

**Response:**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "user_type": "student",
  "is_active": true,
  "is_staff": false,
  "date_joined": "2025-01-15T10:30:00Z",
  "last_login": "2025-06-15T14:20:00Z",
  "profile": {
    "bio": "Student interested in programming",
    "phone": "+1234567890",
    "date_of_birth": "1995-05-15",
    "avatar": "http://localhost:8000/media/avatars/john.jpg"
  },
  "enrolled_courses": [
    {
      "id": 1,
      "title": "Python Cơ bản",
      "enrolled_at": "2025-06-01T10:00:00Z",
      "progress": 65.5,
      "completed": false
    }
  ],
  "activity_stats": {
    "total_study_time": 14400,
    "lessons_completed": 45,
    "quizzes_completed": 12,
    "avg_quiz_score": 8.2,
    "last_active": "2025-06-15T14:20:00Z"
  }
}
```

**🧪 Postman Test:**
```javascript
// GET {{base_url}}/admin-panel/users/{{test_user_id}}/
// Headers: Authorization: Bearer {{admin_token}}

// Test Script:
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("User details complete", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('profile');
    pm.expect(jsonData).to.have.property('enrolled_courses');
    pm.expect(jsonData).to.have.property('activity_stats');
});

pm.test("Activity stats available", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.activity_stats).to.have.property('total_study_time');
    pm.expect(jsonData.activity_stats).to.have.property('lessons_completed');
});
```

#### 1.3 Tạo người dùng mới
- **URL**: `POST /api/admin-panel/users/`
- **Permission**: Admin

**Request Body:**
```json
{
  "username": "new_student",
  "email": "student@example.com",
  "password": "SecurePass123!",
  "first_name": "New",
  "last_name": "Student",
  "user_type": "student",
  "profile": {
    "phone": "+1234567890",
    "date_of_birth": "1995-08-20"
  }
}
```

**Response:**
```json
{
  "id": 25,
  "username": "new_student",
  "email": "student@example.com",
  "first_name": "New",
  "last_name": "Student",
  "user_type": "student",
  "is_active": true,
  "date_joined": "2025-06-15T18:30:00Z",
  "detail": "Người dùng được tạo thành công"
}
```

**🧪 Postman Test:**
```javascript
// POST {{base_url}}/admin-panel/users/
// Headers: Authorization: Bearer {{admin_token}}

// Request Body:
{
  "username": "test_user_{{$randomInt}}",
  "email": "test{{$randomInt}}@example.com",
  "password": "TestPass123!",
  "first_name": "Test",
  "last_name": "User",
  "user_type": "student"
}

// Test Script:
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("User created successfully", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('id');
    pm.expect(jsonData).to.have.property('username');
    pm.expect(jsonData.detail).to.include('thành công');
});

// Save created user ID
pm.test("Save created user ID", function () {
    var jsonData = pm.response.json();
    pm.environment.set("created_user_id", jsonData.id);
});
```

#### 1.4 Cập nhật thông tin người dùng
- **URL**: `PATCH /api/admin-panel/users/{user_id}/`
- **Permission**: Admin

**Request Body:**
```json
{
  "first_name": "Updated Name",
  "is_active": false,
  "user_type": "teacher"
}
```

#### 1.5 Thay đổi loại người dùng
- **URL**: `PATCH /api/admin-panel/users/{user_id}/change_user_type/`
- **Permission**: Admin

**Request Body:**
```json
{
  "user_type": "teacher"
}
```

**Response:**
```json
{
  "detail": "Đã thay đổi loại người dùng thành công",
  "old_type": "student",
  "new_type": "teacher"
}
```

#### 1.6 Chặn/Bỏ chặn người dùng
- **URL**: `PATCH /api/admin-panel/users/{user_id}/toggle_active_status/`
- **Permission**: Admin

**Response:**
```json
{
  "detail": "Đã cập nhật trạng thái người dùng",
  "is_active": false
}
```

### 📚 2. Course Management

#### 2.1 Danh sách tất cả khóa học
- **URL**: `GET /api/admin-panel/courses/`
- **Permission**: Admin
- **Query Parameters**:
  - `search`: Tìm kiếm theo tiêu đề, mô tả
  - `creator`: Lọc theo ID người tạo
  - `category`: Lọc theo danh mục
  - `is_published`: Lọc theo trạng thái xuất bản

**Response:**
```json
{
  "count": 45,
  "results": [
    {
      "id": 1,
      "title": "Python Cơ bản",
      "subtitle": "Học lập trình Python từ cơ bản đến nâng cao",
      "category": "Programming",
      "price": "99.99",
      "is_published": true,
      "creator": {
        "id": 2,
        "username": "teacher1",
        "first_name": "John",
        "last_name": "Doe"
      },
      "created_at": "2025-05-01T09:00:00Z",
      "updated_at": "2025-06-10T15:30:00Z",
      "stats": {
        "student_count": 42,
        "section_count": 5,
        "lesson_count": 15,
        "quiz_count": 5,
        "avg_rating": 4.5,
        "total_revenue": "4199.58"
      }
    }
  ]
}
```

**🧪 Postman Test:**
```javascript
// GET {{base_url}}/admin-panel/courses/
// Headers: Authorization: Bearer {{admin_token}}

// Test Script:
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Courses list with admin details", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('results');
    if (jsonData.results.length > 0) {
        var course = jsonData.results[0];
        pm.expect(course).to.have.property('stats');
        pm.expect(course.stats).to.have.property('total_revenue');
        pm.expect(course.stats).to.have.property('student_count');
    }
});

// Save course ID for tests
pm.test("Save course ID", function () {
    var jsonData = pm.response.json();
    if (jsonData.results.length > 0) {
        pm.environment.set("admin_test_course_id", jsonData.results[0].id);
    }
});
```

#### 2.2 Chi tiết khóa học với cấu trúc đầy đủ
- **URL**: `GET /api/admin-panel/courses/{course_id}/`
- **Permission**: Admin

**Response:**
```json
{
  "id": 1,
  "title": "Python Cơ bản",
  "subtitle": "Học lập trình Python từ cơ bản đến nâng cao",
  "description": "Khóa học chi tiết về Python...",
  "category": "Programming",
  "price": "99.99",
  "is_published": true,
  "creator": {
    "id": 2,
    "username": "teacher1",
    "first_name": "John",
    "last_name": "Doe",
    "email": "teacher1@example.com"
  },
  "created_at": "2025-05-01T09:00:00Z",
  "updated_at": "2025-06-10T15:30:00Z",
  "sections": [
    {
      "id": 1,
      "title": "Giới thiệu về Python",
      "position": 1,
      "lessons": [
        {
          "id": 1,
          "title": "Cài đặt Python",
          "content": "Nội dung bài giảng...",
          "video_url": "https://youtube.com/watch?v=abc123",
          "duration": 1800,
          "position": 1
        }
      ],
      "quizzes": [
        {
          "id": 1,
          "title": "Kiểm tra cài đặt",
          "description": "Quiz về cài đặt Python",
          "time_limit": 600,
          "position": 2,
          "questions": [
            {
              "id": 1,
              "question_text": "Python được phát triển bởi ai?",
              "question_type": "multiple_choice",
              "choices": [
                {
                  "id": 1,
                  "choice_text": "Guido van Rossum",
                  "is_correct": true
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  "enrollments": [
    {
      "id": 1,
      "student": {
        "id": 5,
        "username": "student1",
        "first_name": "Jane",
        "last_name": "Smith"
      },
      "enrolled_at": "2025-06-01T10:00:00Z",
      "progress": 65.5,
      "last_accessed": "2025-06-15T14:30:00Z"
    }
  ],
  "revenue_stats": {
    "total_revenue": "4199.58",
    "monthly_revenue": "1200.00",
    "avg_revenue_per_student": "99.99"
  }
}
```

**🧪 Postman Test:**
```javascript
// GET {{base_url}}/admin-panel/courses/{{admin_test_course_id}}/
// Headers: Authorization: Bearer {{admin_token}}

// Test Script:
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Complete course structure", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('sections');
    pm.expect(jsonData).to.have.property('enrollments');
    pm.expect(jsonData).to.have.property('revenue_stats');
});

pm.test("Sections have lessons and quizzes", function () {
    var jsonData = pm.response.json();
    if (jsonData.sections.length > 0) {
        var section = jsonData.sections[0];
        pm.expect(section).to.have.property('lessons');
        pm.expect(section).to.have.property('quizzes');
    }
});
```

#### 2.3 Thống kê chi tiết khóa học
- **URL**: `GET /api/admin-panel/courses/{course_id}/detailed_stats/`
- **Permission**: Admin

**Response:**
```json
{
  "course_id": 1,
  "overview": {
    "total_students": 42,
    "completion_rate": 23.8,
    "avg_progress": 67.5,
    "avg_rating": 4.5,
    "total_reviews": 25
  },
  "revenue": {
    "total_revenue": "4199.58",
    "monthly_revenue": "1200.00",
    "daily_revenue": "45.00",
    "refunds": "199.98"
  },
  "engagement": {
    "avg_study_time_per_student": 8640,
    "lesson_completion_rate": 78.5,
    "quiz_completion_rate": 65.2,
    "avg_quiz_score": 7.8
  },
  "content_performance": {
    "most_viewed_lesson": {
      "id": 1,
      "title": "Cài đặt Python",
      "view_count": 156
    },
    "highest_scoring_quiz": {
      "id": 2,
      "title": "Variables Test",
      "avg_score": 9.2
    },
    "dropout_points": [
      {
        "lesson_id": 8,
        "title": "Advanced Functions",
        "dropout_rate": 15.5
      }
    ]
  },
  "enrollment_trends": {
    "last_30_days": 8,
    "last_7_days": 2,
    "peak_enrollment_day": "Monday"
  }
}
```

### 📊 3. System Dashboard

#### 3.1 Dashboard tổng quan hệ thống
- **URL**: `GET /api/admin-panel/dashboard/`
- **Permission**: Admin

**Response:**
```json
{
  "users": {
    "total_users": 1250,
    "active_users": 1180,
    "new_users_this_month": 85,
    "user_breakdown": {
      "students": 1050,
      "teachers": 190,
      "admins": 10
    }
  },
  "courses": {
    "total_courses": 45,
    "published_courses": 38,
    "draft_courses": 7,
    "new_courses_this_month": 3
  },
  "content": {
    "total_lessons": 450,
    "total_quizzes": 180,
    "total_questions": 720,
    "avg_content_per_course": 10.0
  },
  "enrollments": {
    "total_enrollments": 2340,
    "active_enrollments": 1890,
    "completion_rate": 28.5,
    "new_enrollments_this_month": 156
  },
  "revenue": {
    "total_revenue": "125,450.00",
    "monthly_revenue": "8,750.00",
    "weekly_revenue": "2,100.00",
    "avg_revenue_per_course": "2,787.78"
  },
  "activity": {
    "daily_active_users": 320,
    "weekly_active_users": 850,
    "avg_session_duration": 2160,
    "total_study_hours": 15680
  },
  "top_performing": {
    "courses": [
      {
        "id": 1,
        "title": "Python Cơ bản",
        "student_count": 42,
        "revenue": "4199.58"
      }
    ],
    "teachers": [
      {
        "id": 2,
        "name": "John Doe",
        "course_count": 5,
        "total_students": 210
      }
    ]
  }
}
```

**🧪 Postman Test:**
```javascript
// GET {{base_url}}/admin-panel/dashboard/
// Headers: Authorization: Bearer {{admin_token}}

// Test Script:
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Dashboard contains all sections", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('users');
    pm.expect(jsonData).to.have.property('courses');
    pm.expect(jsonData).to.have.property('revenue');
    pm.expect(jsonData).to.have.property('activity');
});

pm.test("Revenue data available", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.revenue).to.have.property('total_revenue');
    pm.expect(jsonData.revenue).to.have.property('monthly_revenue');
});

pm.test("Top performing data", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('top_performing');
    pm.expect(jsonData.top_performing).to.have.property('courses');
    pm.expect(jsonData.top_performing).to.have.property('teachers');
});
```

### 📝 4. Content Management

#### 4.1 Quản lý Sections
- **URL**: `GET /api/admin-panel/sections/`
- **Permission**: Admin

#### 4.2 Quản lý Lessons
- **URL**: `GET /api/admin-panel/lessons/`
- **Permission**: Admin

#### 4.3 Quản lý Quizzes
- **URL**: `GET /api/admin-panel/quizzes/`
- **Permission**: Admin

#### 4.4 Quản lý Questions
- **URL**: `GET /api/admin-panel/questions/`
- **Permission**: Admin

#### 4.5 Quản lý Choices
- **URL**: `GET /api/admin-panel/choices/`
- **Permission**: Admin

#### 4.6 Quản lý Enrollments
- **URL**: `GET /api/admin-panel/enrollments/`
- **Permission**: Admin

**Response Example:**
```json
{
  "count": 2340,
  "results": [
    {
      "id": 1,
      "student": {
        "id": 5,
        "username": "student1",
        "first_name": "Jane",
        "last_name": "Smith",
        "email": "jane@example.com"
      },
      "course": {
        "id": 1,
        "title": "Python Cơ bản",
        "price": "99.99"
      },
      "enrolled_at": "2025-06-01T10:00:00Z",
      "progress": 65.5,
      "completed": false,
      "last_accessed": "2025-06-15T14:30:00Z",
      "total_study_time": 8640
    }
  ]
}
```

**🧪 Postman Test:**
```javascript
// GET {{base_url}}/admin-panel/enrollments/
// Headers: Authorization: Bearer {{admin_token}}

// Test Script:
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Enrollments with detailed info", function () {
    var jsonData = pm.response.json();
    if (jsonData.results.length > 0) {
        var enrollment = jsonData.results[0];
        pm.expect(enrollment).to.have.property('student');
        pm.expect(enrollment).to.have.property('course');
        pm.expect(enrollment).to.have.property('progress');
        pm.expect(enrollment).to.have.property('total_study_time');
    }
});
```

## 🚀 Postman Environment Setup

### Environment Variables
```json
{
  "base_url": "http://localhost:8000/api",
  "auth_url": "http://localhost:8000/api/auth",
  "admin_email": "admin@example.com",
  "admin_password": "admin123",
  "admin_token": "",
  "test_user_id": "",
  "admin_test_course_id": "",
  "created_user_id": ""
}
```

### Pre-request Script (Collection Level)
```javascript
// Auto-login admin if token is missing or expired
if (!pm.environment.get("admin_token")) {
    const loginRequest = {
        url: pm.environment.get("auth_url") + "/login/",
        method: 'POST',
        header: {
            'Content-Type': 'application/json',
        },
        body: {
            mode: 'raw',
            raw: JSON.stringify({
                email: pm.environment.get("admin_email"),
                password: pm.environment.get("admin_password")
            })
        }
    };
    
    pm.sendRequest(loginRequest, function (err, response) {
        if (err) {
            console.log('Admin login failed:', err);
        } else {
            const jsonData = response.json();
            pm.environment.set("admin_token", jsonData.access);
        }
    });
}
```

### Global Test Script
```javascript
// Global error handling
pm.test("Response time is less than 3000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(3000);
});

pm.test("Content-Type is JSON", function () {
    pm.expect(pm.response.headers.get("Content-Type")).to.include("application/json");
});

// Handle admin authentication errors
if (pm.response.code === 401) {
    console.log("Admin authentication failed, clearing token");
    pm.environment.unset("admin_token");
}

if (pm.response.code === 403) {
    console.log("Admin permissions required");
}
```

## 🔧 Testing Workflow

### 1. Admin Setup Phase
1. Set admin environment variables
2. Run admin authentication request
3. Verify admin token is saved

### 2. User Management Flow
1. List all users (`GET /users/`)
2. Get user details (`GET /users/{id}/`)
3. Create new user (`POST /users/`)
4. Update user (`PATCH /users/{id}/`)
5. Change user type (`PATCH /users/{id}/change_user_type/`)

### 3. Course Management Flow
1. List all courses (`GET /courses/`)
2. Get course details with full structure (`GET /courses/{id}/`)
3. Get course statistics (`GET /courses/{id}/detailed_stats/`)

### 4. System Monitoring
1. Check dashboard overview (`GET /dashboard/`)
2. Monitor enrollments (`GET /enrollments/`)
3. Review content performance

## ⚠️ Error Codes

| Status | Meaning | Description |
|--------|---------|-------------|
| 400 | Bad Request | Request data không hợp lệ |
| 401 | Unauthorized | Token không hợp lệ hoặc hết hạn |
| 403 | Forbidden | Không có quyền admin |
| 404 | Not Found | Resource không tồn tại |
| 429 | Too Many Requests | Quá nhiều requests |
| 500 | Internal Server Error | Lỗi server |

## 🛠️ Troubleshooting

### Admin Authentication Issues
```javascript
// Check admin permissions
pm.test("Admin access validation", function () {
    if (pm.response.code === 403) {
        console.log("User doesn't have admin privileges");
        pm.expect.fail("Admin access required");
    }
});
```

### Data Management Issues
- Verify user_type field khi tạo user
- Check is_active status cho user management
- Ensure proper course ownership validation

### Performance Monitoring
- Dashboard endpoints có thể chậm do tính toán nhiều
- Use pagination cho large datasets
- Monitor response times cho admin operations

### Common Error Responses
```json
{
  "detail": "You do not have permission to perform this action."
}

{
  "detail": "Authentication credentials were not provided."
}

{
  "username": ["A user with that username already exists."]
}
```
