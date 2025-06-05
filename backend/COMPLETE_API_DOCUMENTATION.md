# 🚀 Smart Learning Platform - Complete API Documentation

## 📖 Tổng quan

Tài liệu này tổng hợp toàn bộ API endpoints của Smart Learning Platform với hướng dẫn test Postman chi tiết cho từng module.

## 🏗️ Kiến trúc hệ thống

```
Smart Learning Platform
├── 🔐 Authentication Module (Auth)
├── 👑 Admin Panel Module (Admin Management)
├── 📚 Course Module (Course Management)
└── 🎓 Student Module (Learning Experience)
```

## 🌐 Base URLs

```
Authentication: http://localhost:8000/api/auth/
Admin Panel:    http://localhost:8000/api/admin-panel/
Course Module:  http://localhost:8000/api/courses/
Student Module: http://localhost:8000/api/student/
```

## 📋 Module Overview

### 🔐 Authentication Module
**File**: `AUTH_API_DOCUMENTATION.md`

**Key Features**:
- User registration (Student/Teacher)
- Login/Logout với JWT tokens
- Password reset functionality
- Profile management
- Token refresh mechanism

**Main Endpoints**:
- `POST /auth/register/` - Đăng ký tài khoản
- `POST /auth/login/` - Đăng nhập
- `POST /auth/logout/` - Đăng xuất
- `POST /auth/token/refresh/` - Refresh token
- `POST /auth/password/reset/` - Reset password

---

### 👑 Admin Panel Module
**File**: `admin_panel/ADMIN_API_DOCUMENTATION.md`

**Key Features**:
- User management (CRUD operations)
- Course oversight và statistics
- System dashboard
- Content moderation
- Revenue tracking

**Main Endpoints**:
- `GET /admin-panel/users/` - Quản lý người dùng
- `GET /admin-panel/courses/` - Quản lý khóa học
- `GET /admin-panel/dashboard/` - Dashboard hệ thống
- `GET /admin-panel/enrollments/` - Quản lý đăng ký

**Permission Required**: Admin only (user_type='admin' or is_staff=True)

---

### 📚 Course Module (Teacher)
**File**: `COURSE_API_DOCUMENTATION.md`

**Key Features**:
- Course creation và management
- Content structure (Sections/Lessons/Quizzes)
- Student enrollment tracking
- Analytics và performance metrics
- AI-powered insights

**Main Endpoints**:
- `GET /courses/` - Danh sách khóa học
- `POST /courses/` - Tạo khóa học mới
- `GET /courses/{id}/sections/` - Quản lý sections
- `POST /courses/{id}/sections/{id}/lessons/` - Tạo bài giảng
- `GET /courses/{id}/analytics/` - Thống kê khóa học

**Permission Required**: Teacher (course owner)

---

### 🎓 Student Module
**File**: `student/STUDENT_API_DOCUMENTATION.md`

**Key Features**:
- Course discovery và enrollment
- Learning progress tracking
- Quiz taking và results
- AI recommendations
- Student dashboard

**Main Endpoints**:
- `GET /student/courses/` - Khám phá khóa học
- `POST /student/courses/{id}/enroll/` - Đăng ký khóa học
- `GET /student/lessons/{id}/` - Xem bài giảng
- `POST /student/quizzes/{id}/submit/` - Nộp bài quiz
- `GET /student/dashboard/` - Dashboard học viên

**Permission Required**: Student (enrolled in course for protected content)

## 🔑 Authentication Flow

### 1. User Registration
```javascript
// POST {{auth_url}}/register/
{
  "username": "new_user",
  "email": "user@example.com",
  "password": "SecurePass123!",
  "user_type": "student" // or "teacher"
}
```

### 2. Login Process
```javascript
// POST {{auth_url}}/login/
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

// Response:
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "username": "new_user",
    "user_type": "student"
  }
}
```

### 3. Using JWT Tokens
```
Authorization: Bearer <access_token>
```

## 📊 Permission Matrix

| Endpoint Group | Public | Student | Teacher | Admin |
|---------------|--------|---------|---------|-------|
| Course Discovery | ✅ | ✅ | ✅ | ✅ |
| Course Enrollment | ❌ | ✅ | ✅ | ✅ |
| Course Creation | ❌ | ❌ | ✅ | ✅ |
| Course Management | ❌ | ❌ | ✅ (own) | ✅ (all) |
| User Management | ❌ | ❌ | ❌ | ✅ |
| System Dashboard | ❌ | ❌ | ❌ | ✅ |

## 🚀 Postman Collection Setup

### Global Environment Variables
```json
{
  "base_url": "http://localhost:8000/api",
  "auth_url": "http://localhost:8000/api/auth",
  "admin_email": "admin@example.com",
  "admin_password": "admin123",
  "teacher_email": "teacher@example.com",
  "teacher_password": "teacher123",
  "student_email": "student@example.com",
  "student_password": "student123",
  "admin_token": "",
  "teacher_token": "",
  "student_token": "",
  "test_course_id": "",
  "test_user_id": ""
}
```

### Collection Pre-request Script
```javascript
// Auto-authentication based on request URL
const url = pm.request.url.toString();

if (url.includes('/admin-panel/')) {
    // Admin authentication
    if (!pm.environment.get("admin_token")) {
        pm.sendRequest({
            url: pm.environment.get("auth_url") + "/login/",
            method: 'POST',
            header: { 'Content-Type': 'application/json' },
            body: {
                mode: 'raw',
                raw: JSON.stringify({
                    email: pm.environment.get("admin_email"),
                    password: pm.environment.get("admin_password")
                })
            }
        }, function (err, response) {
            if (!err) {
                pm.environment.set("admin_token", response.json().access);
            }
        });
    }
} else if (url.includes('/courses/') && pm.request.method !== 'GET') {
    // Teacher authentication for course management
    if (!pm.environment.get("teacher_token")) {
        pm.sendRequest({
            url: pm.environment.get("auth_url") + "/login/",
            method: 'POST',
            header: { 'Content-Type': 'application/json' },
            body: {
                mode: 'raw',
                raw: JSON.stringify({
                    email: pm.environment.get("teacher_email"),
                    password: pm.environment.get("teacher_password")
                })
            }
        }, function (err, response) {
            if (!err) {
                pm.environment.set("teacher_token", response.json().access);
            }
        });
    }
} else if (url.includes('/student/')) {
    // Student authentication
    if (!pm.environment.get("student_token")) {
        pm.sendRequest({
            url: pm.environment.get("auth_url") + "/login/",
            method: 'POST',
            header: { 'Content-Type': 'application/json' },
            body: {
                mode: 'raw',
                raw: JSON.stringify({
                    email: pm.environment.get("student_email"),
                    password: pm.environment.get("student_password")
                })
            }
        }, function (err, response) {
            if (!err) {
                pm.environment.set("student_token", response.json().access);
            }
        });
    }
}
```

### Global Test Script
```javascript
// Universal tests for all endpoints
pm.test("Status code is successful", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 201, 204]);
});

pm.test("Response time is acceptable", function () {
    pm.expect(pm.response.responseTime).to.be.below(3000);
});

pm.test("Content-Type is JSON (if applicable)", function () {
    if (pm.response.code !== 204) {
        pm.expect(pm.response.headers.get("Content-Type")).to.include("application/json");
    }
});

// Handle authentication errors globally
if (pm.response.code === 401) {
    console.log("Authentication failed, clearing tokens");
    pm.environment.unset("admin_token");
    pm.environment.unset("teacher_token");
    pm.environment.unset("student_token");
}

// Log detailed error information
if (pm.response.code >= 400) {
    console.log("Error Response:", pm.response.text());
}
```

## 🧪 Complete Testing Scenarios

### Scenario 1: Teacher Creates and Manages Course
```
1. Teacher Registration → POST /auth/register/
2. Teacher Login → POST /auth/login/
3. Create Course → POST /courses/
4. Create Section → POST /courses/{id}/sections/
5. Create Lesson → POST /courses/{id}/sections/{id}/lessons/
6. Create Quiz → POST /courses/{id}/sections/{id}/quizzes/
7. Publish Course → PATCH /courses/{id}/
8. View Analytics → GET /courses/{id}/analytics/
```

### Scenario 2: Student Learning Journey
```
1. Student Registration → POST /auth/register/
2. Student Login → POST /auth/login/
3. Browse Courses → GET /student/courses/
4. View Course Details → GET /student/courses/{id}/
5. Enroll in Course → POST /student/courses/{id}/enroll/
6. View Lesson → GET /student/lessons/{id}/
7. Take Quiz → POST /student/quizzes/{id}/submit/
8. Check Progress → GET /student/courses/{id}/progress/
9. View Dashboard → GET /student/dashboard/
```

### Scenario 3: Admin System Management
```
1. Admin Login → POST /auth/login/
2. View Dashboard → GET /admin-panel/dashboard/
3. Manage Users → GET /admin-panel/users/
4. Review Courses → GET /admin-panel/courses/
5. Check Enrollments → GET /admin-panel/enrollments/
6. Generate Reports → GET /admin-panel/courses/{id}/detailed_stats/
```

## 📈 Performance Testing Guidelines

### Load Testing Targets
- **Authentication**: 100 requests/minute
- **Course Discovery**: 500 requests/minute
- **Learning Content**: 200 requests/minute
- **Admin Operations**: 50 requests/minute

### Monitoring Metrics
- Response time < 2 seconds for most endpoints
- Response time < 5 seconds for dashboard/analytics
- 99.9% uptime target
- Error rate < 1%

## 🔧 Error Handling

### Common HTTP Status Codes
| Code | Meaning | Action Required |
|------|---------|----------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Check request format/data |
| 401 | Unauthorized | Refresh or obtain new token |
| 403 | Forbidden | Check user permissions |
| 404 | Not Found | Verify resource exists |
| 429 | Rate Limited | Reduce request frequency |
| 500 | Server Error | Contact system administrator |

### Error Response Format
```json
{
  "detail": "Error message",
  "field_errors": {
    "field_name": ["Specific field error message"]
  },
  "non_field_errors": ["General error message"],
  "error_code": "SPECIFIC_ERROR_CODE"
}
```

## 📚 Quick Reference Links

- **Course Management**: [COURSE_API_DOCUMENTATION.md](./COURSE_API_DOCUMENTATION.md)
- **Student Learning**: [student/STUDENT_API_DOCUMENTATION.md](./student/STUDENT_API_DOCUMENTATION.md)
- **Admin Panel**: [admin_panel/ADMIN_API_DOCUMENTATION.md](./admin_panel/ADMIN_API_DOCUMENTATION.md)

## 🤝 Contributing

Khi cập nhật API documentation:

1. **Update individual module docs** trước
2. **Test all endpoints** với Postman
3. **Update this summary** với changes mới
4. **Validate Postman collections** hoạt động
5. **Update error handling** nếu cần

## 📞 Support

Nếu gặp vấn đề với APIs:

1. Check individual module documentation
2. Verify authentication tokens
3. Review error responses
4. Test with provided Postman examples
5. Contact development team nếu cần thiết

---

**Last Updated**: June 2025  
**API Version**: v1.0  
**Documentation Version**: 1.0
