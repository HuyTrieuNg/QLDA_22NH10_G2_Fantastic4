# 📚 Course API Endpoints Documentation

Tài liệu này mô tả đầy đủ các API endpoints cho Smart Learning Platform với hướng dẫn test Postman chi tiết.

## 🔑 Authentication & Permissions

### JWT Authentication
Tất cả các API yêu cầu authentication sử dụng JWT token:
```
Authorization: Bearer <your_jwt_token>
```

### Permission Classes:
1. **IsTeacherOrAdmin**: Chỉ giáo viên và admin
2. **IsTeacher**: Chỉ giáo viên
3. **IsStudent**: Chỉ học viên  
4. **IsOwnerOrAdminOrTeacher**: Chủ sở hữu, admin hoặc giáo viên
5. **IsAuthenticated**: Người dùng đã đăng nhập
6. **AllowAny**: Công khai

## 🌐 Base URL
```
Base URL: http://localhost:8000/api/
Authentication URL: http://localhost:8000/api/auth/
```

## 📋 API Endpoints

### 🎓 1. Course Management

#### 1.1 Danh sách khóa học
- **URL**: `GET /api/courses/`
- **Permission**: `AllowAny` (Công khai, hiển thị khóa học đã xuất bản)
- **Query Parameters**:
  - `search`: Tìm kiếm theo tiêu đề, mô tả, danh mục
  - `category`: Lọc theo danh mục
  - `ordering`: Sắp xếp (created_at, -created_at, title, -title)

**Response:**
```json
{
  "count": 10,
  "next": "http://localhost:8000/api/courses/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Python Cơ bản",
      "subtitle": "Học Python từ con số 0",
      "description": "Khóa học dành cho người mới bắt đầu",
      "thumbnail": "http://localhost:8000/media/thumbnails/python.jpg",
      "category": "Programming",
      "price": "99.99",
      "creator": {
        "id": 2,
        "username": "teacher1",
        "first_name": "John",
        "last_name": "Doe"
      },
      "published": true,
      "created_at": "2025-01-01T10:00:00Z",
      "student_count": 25,
      "lesson_count": 15,
      "section_count": 5
    }
  ]
}
```

**🧪 Postman Test:**
```javascript
// GET http://localhost:8000/api/courses/
// Headers: (không cần authentication)

// Test Script:
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has courses array", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.results).to.be.an('array');
});

pm.test("Each course has required fields", function () {
    var jsonData = pm.response.json();
    if (jsonData.results.length > 0) {
        var course = jsonData.results[0];
        pm.expect(course).to.have.property('id');
        pm.expect(course).to.have.property('title');
        pm.expect(course).to.have.property('creator');
    }
});
```

#### 1.2 Chi tiết khóa học
- **URL**: `GET /api/courses/{id}/`
- **Permission**: `AllowAny` (Với kiểm tra đặc biệt cho khóa học chưa xuất bản)

**Response:**
```json
{
  "id": 1,
  "title": "Python Cơ bản",
  "subtitle": "Học Python từ con số 0",
  "description": "Khóa học chi tiết về Python...",
  "thumbnail": "http://localhost:8000/media/thumbnails/python.jpg",
  "category": "Programming",
  "price": "99.99",
  "creator": {
    "id": 2,
    "username": "teacher1",
    "first_name": "John",
    "last_name": "Doe"
  },
  "published": true,
  "created_at": "2025-01-01T10:00:00Z",
  "last_updated_at": "2025-01-01T10:00:00Z",
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
          "video_url": "https://youtube.com/watch?v=..."
        }
      ],
      "quizzes": [
        {
          "id": 1,
          "title": "Kiểm tra kiến thức",
          "position": 2
        }
      ]
    }
  ]
}
```

**🧪 Postman Test:**
```javascript
// GET http://localhost:8000/api/courses/1/
// Headers: (không cần authentication cho published course)

// Test Script:
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Course has sections", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('sections');
    pm.expect(jsonData.sections).to.be.an('array');
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

#### 1.3 Tạo khóa học mới
- **URL**: `POST /api/courses/create/`
- **Permission**: `IsTeacherOrAdmin`
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`

**Request Body:**
```json
{
  "title": "Machine Learning cơ bản",
  "subtitle": "Học ML từ con số 0", 
  "description": "Khóa học về Machine Learning cho người mới bắt đầu",
  "category": "AI/ML",
  "price": 199.99,
  "published": false,
  "thumbnail": "base64_image_string_or_url"
}
```

**Response:**
```json
{
  "id": 15,
  "title": "Machine Learning cơ bản",
  "subtitle": "Học ML từ con số 0",
  "description": "Khóa học về Machine Learning cho người mới bắt đầu",
  "thumbnail": "http://localhost:8000/media/thumbnails/ml_course.jpg",
  "category": "AI/ML", 
  "price": "199.99",
  "creator": {
    "id": 2,
    "username": "teacher1",
    "first_name": "John",
    "last_name": "Doe"
  },
  "published": false,
  "created_at": "2025-06-06T10:00:00Z",
  "last_updated_at": "2025-06-06T10:00:00Z"
}
```

**🧪 Postman Test:**
```javascript
// POST http://localhost:8000/api/courses/create/
// Headers: 
// Authorization: Bearer {{teacher_token}}
// Content-Type: application/json

// Pre-request Script (get token):
// Assumes you have a teacher_token environment variable

// Test Script:
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Course created successfully", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('id');
    pm.expect(jsonData.title).to.eql("Machine Learning cơ bản");
    
    // Save course ID for other tests
    pm.environment.set("created_course_id", jsonData.id);
});

pm.test("Creator is current user", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.creator).to.have.property('username');
});
```

#### 1.4 Cập nhật khóa học
- **URL**: `PUT/PATCH /api/courses/{id}/update/`
- **Permission**: `IsAuthenticated` + kiểm tra creator/giáo viên/admin

**Request Body (PATCH):**
```json
{
  "title": "Python Nâng cao",
  "published": true
}
```

**🧪 Postman Test:**
```javascript
// PATCH http://localhost:8000/api/courses/{{created_course_id}}/update/
// Headers: Authorization: Bearer {{teacher_token}}

// Test Script:
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Course updated successfully", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.title).to.eql("Python Nâng cao");
    pm.expect(jsonData.published).to.eql(true);
});
```

#### 1.5 Xóa khóa học
- **URL**: `DELETE /api/courses/{id}/delete/`
- **Permission**: `IsAuthenticated` + kiểm tra creator/giáo viên/admin

**🧪 Postman Test:**
```javascript
// DELETE http://localhost:8000/api/courses/{{created_course_id}}/delete/
// Headers: Authorization: Bearer {{teacher_token}}

// Test Script:
pm.test("Status code is 204", function () {
    pm.response.to.have.status(204);
});

// Verify deletion
pm.test("Course deleted", function () {
    pm.sendRequest({
        url: `http://localhost:8000/api/courses/${pm.environment.get("created_course_id")}/`,
        method: 'GET'
    }, function (err, response) {
        pm.expect(response.code).to.be.oneOf([404, 403]);
    });
});
```

#### 1.6 Khóa học của tôi
- **URL**: `GET /api/courses/my-courses/`
- **Permission**: `IsAuthenticated`
- **Mô tả**: 
  - Giáo viên/Admin: Xem khóa học đã tạo
  - Học viên: Xem khóa học đã đăng ký

**🧪 Postman Test:**
```javascript
// GET http://localhost:8000/api/courses/my-courses/
// Headers: Authorization: Bearer {{user_token}}

// Test Script:
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Returns my courses", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.be.an('array');
});
```
- **Mô tả**: 
  - Giáo viên/Admin: Xem khóa học đã tạo
  - Học viên: Xem khóa học đã đăng ký

### 📚 2. Course Enrollment

#### 2.1 Đăng ký khóa học
- **URL**: `POST /api/courses/{course_id}/enroll/`
- **Permission**: `IsStudent`

**Response:**
```json
{
  "message": "Đăng ký khóa học thành công",
  "enrollment": {
    "id": 10,
    "user": {
      "id": 5,
      "username": "student1"
    },
    "course": {
      "id": 1,
      "title": "Python Cơ bản"
    },
    "enrolled_at": "2025-06-06T10:00:00Z",
    "progress": 0.0
  }
}
```

**🧪 Postman Test:**
```javascript
// POST http://localhost:8000/api/courses/1/enroll/
// Headers: Authorization: Bearer {{student_token}}

// Test Script:
pm.test("Status code is 200 or 201", function () {
    pm.response.to.have.status.oneOf([200, 201]);
});

pm.test("Enrollment successful", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('message');
    pm.expect(jsonData).to.have.property('enrollment');
});
```

#### 2.2 Hủy đăng ký khóa học
- **URL**: `DELETE /api/courses/{course_id}/unenroll/`
- **Permission**: `IsStudent`

**🧪 Postman Test:**
```javascript
// DELETE http://localhost:8000/api/courses/1/unenroll/
// Headers: Authorization: Bearer {{student_token}}

// Test Script:
pm.test("Status code is 200 or 204", function () {
    pm.response.to.have.status.oneOf([200, 204]);
});
```

#### 2.3 Danh sách học viên của khóa học
- **URL**: `GET /api/courses/{course_id}/students/`
- **Permission**: `IsAuthenticated` + kiểm tra creator/giáo viên/admin

**Response:**
```json
{
  "course": {
    "id": 1,
    "title": "Python Cơ bản"
  },
  "students": [
    {
      "id": 5,
      "username": "student1",
      "first_name": "Jane",
      "last_name": "Smith",
      "email": "jane@example.com",
      "enrollment": {
        "enrolled_at": "2025-06-01T10:00:00Z",
        "progress": 75.5
      }
    }
  ],
  "total_students": 25
}
```

**🧪 Postman Test:**
```javascript
// GET http://localhost:8000/api/courses/1/students/
// Headers: Authorization: Bearer {{teacher_token}}

// Test Script:
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has students list", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('students');
    pm.expect(jsonData.students).to.be.an('array');
});
```

### 📖 3. Section Management

#### 3.1 Danh sách và tạo section
- **URL**: `GET/POST /api/courses/{course_id}/sections/`
- **Permission**: 
  - GET: `IsAuthenticated`
  - POST: `IsAuthenticated` + kiểm tra creator/giáo viên/admin

**GET Response:**
```json
[
  {
    "id": 1,
    "title": "Giới thiệu về Python",
    "position": 1,
    "lessons": [
      {
        "id": 1,
        "title": "Cài đặt Python",
        "position": 1,
        "video_url": "https://youtube.com/watch?v=..."
      }
    ],
    "quizzes": [
      {
        "id": 1,
        "title": "Kiểm tra cài đặt",
        "position": 2
      }
    ]
  }
]
```

**POST Request Body:**
```json
{
  "title": "Variables và Data Types",
  "position": 2
}
```

**🧪 Postman Test (GET):**
```javascript
// GET http://localhost:8000/api/courses/1/sections/
// Headers: Authorization: Bearer {{user_token}}

// Test Script:
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Sections returned", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.be.an('array');
    if (jsonData.length > 0) {
        pm.expect(jsonData[0]).to.have.property('title');
        pm.expect(jsonData[0]).to.have.property('position');
        pm.expect(jsonData[0]).to.have.property('lessons');
        pm.expect(jsonData[0]).to.have.property('quizzes');
    }
});
```

**🧪 Postman Test (POST):**
```javascript
// POST http://localhost:8000/api/courses/1/sections/
// Headers: Authorization: Bearer {{teacher_token}}

// Test Script:
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Section created", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('id');
    pm.expect(jsonData.title).to.eql("Variables và Data Types");
    
    // Save section ID for other tests
    pm.environment.set("created_section_id", jsonData.id);
});
```

#### 3.2 Chi tiết, cập nhật, xóa section
- **URL**: `GET/PUT/PATCH/DELETE /api/sections/{id}/`
- **Permission**: 
  - GET: `IsAuthenticated`
  - PUT/PATCH/DELETE: `IsAuthenticated` + kiểm tra creator/giáo viên/admin

**PUT Request Body:**
```json
{
  "title": "Python Variables và Data Types (Updated)",
  "position": 2
}
```

**🧪 Postman Test (PUT):**
```javascript
// PUT http://localhost:8000/api/sections/{{created_section_id}}/
// Headers: Authorization: Bearer {{teacher_token}}

// Test Script:
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Section updated", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.title).to.include("Updated");
});
```

### 📝 4. Lesson Management

#### 4.1 Danh sách và tạo lesson
- **URL**: `GET/POST /api/sections/{section_id}/lessons/`
- **Permission**: 
  - GET: `IsAuthenticated`
  - POST: `IsAuthenticated` + kiểm tra creator/giáo viên/admin

**GET Response:**
```json
[
  {
    "id": 1,
    "title": "Cài đặt Python",
    "content": "Trong bài học này, chúng ta sẽ học cách cài đặt Python...",
    "position": 1,
    "video_url": "https://youtube.com/watch?v=abc123"
  }
]
```

**POST Request Body:**
```json
{
  "title": "Python Syntax Cơ bản",
  "content": "Bài học về syntax cơ bản của Python:\n\n1. Variables\n2. Print statements\n3. Comments",
  "position": 2,
  "video_url": "https://youtube.com/watch?v=def456"
}
```

**🧪 Postman Test (POST):**
```javascript
// POST http://localhost:8000/api/sections/{{created_section_id}}/lessons/
// Headers: Authorization: Bearer {{teacher_token}}

// Test Script:
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Lesson created", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('id');
    pm.expect(jsonData.title).to.eql("Python Syntax Cơ bản");
    
    // Save lesson ID for other tests
    pm.environment.set("created_lesson_id", jsonData.id);
});
```

#### 4.2 Chi tiết, cập nhật, xóa lesson
- **URL**: `GET/PUT/PATCH/DELETE /api/lessons/{id}/`
- **Permission**: 
  - GET: `IsAuthenticated`
  - PUT/PATCH/DELETE: `IsAuthenticated` + kiểm tra creator/giáo viên/admin

**PATCH Request Body:**
```json
{
  "content": "Nội dung bài học đã được cập nhật với thêm ví dụ...",
  "video_url": "https://youtube.com/watch?v=updated123"
}
```

**🧪 Postman Test (PATCH):**
```javascript
// PATCH http://localhost:8000/api/lessons/{{created_lesson_id}}/
// Headers: Authorization: Bearer {{teacher_token}}

// Test Script:
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Lesson updated", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.content).to.include("đã được cập nhật");
});
```

### 🧩 5. Quiz Management

#### 5.1 Danh sách và tạo quiz
- **URL**: `GET/POST /api/sections/{section_id}/quizzes/`
- **Permission**: 
  - GET: `IsAuthenticated`
  - POST: `IsAuthenticated` + kiểm tra creator/giáo viên/admin

**GET Response:**
```json
[
  {
    "id": 1,
    "title": "Kiểm tra Python Cơ bản",
    "position": 1,
    "questions": [
      {
        "id": 1,
        "text": "Python là ngôn ngữ lập trình gì?",
        "position": 1,
        "choices": [
          {
            "id": 1,
            "text": "Compiled language",
            "is_correct": false
          },
          {
            "id": 2,
            "text": "Interpreted language",
            "is_correct": true
          }
        ]
      }
    ]
  }
]
```

**POST Request Body:**
```json
{
  "title": "Quiz Variables và Data Types",
  "position": 1,
  "questions": [
    {
      "text": "Cách khai báo biến trong Python?",
      "position": 1,
      "choices": [
        {
          "text": "var x = 10",
          "is_correct": false
        },
        {
          "text": "x = 10",
          "is_correct": true
        },
        {
          "text": "int x = 10",
          "is_correct": false
        }
      ]
    }
  ]
}
```

**🧪 Postman Test (POST):**
```javascript
// POST http://localhost:8000/api/sections/{{created_section_id}}/quizzes/
// Headers: Authorization: Bearer {{teacher_token}}

// Test Script:
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Quiz created with questions", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('id');
    pm.expect(jsonData.title).to.eql("Quiz Variables và Data Types");
    
    // Save quiz ID for other tests
    pm.environment.set("created_quiz_id", jsonData.id);
});
```

#### 5.2 Chi tiết, cập nhật, xóa quiz
- **URL**: `GET/PUT/PATCH/DELETE /api/quizzes/{id}/`
- **Permission**: 
  - GET: `IsAuthenticated`
  - PUT/PATCH/DELETE: `IsAuthenticated` + kiểm tra creator/giáo viên/admin

**🧪 Postman Test (GET):**
```javascript
// GET http://localhost:8000/api/quizzes/{{created_quiz_id}}/
// Headers: Authorization: Bearer {{user_token}}

// Test Script:
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Quiz has questions and choices", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('questions');
    if (jsonData.questions.length > 0) {
        var question = jsonData.questions[0];
        pm.expect(question).to.have.property('choices');
        pm.expect(question.choices).to.be.an('array');
    }
});
```

### ❓ 6. Question Management

#### 6.1 Danh sách và tạo câu hỏi
- **URL**: `GET/POST /api/quizzes/{quiz_id}/questions/`
- **Permission**: `IsTeacherOrAdmin`

**POST Request Body:**
```json
{
  "text": "Hàm nào được sử dụng để in ra màn hình trong Python?",
  "position": 1
}
```

**🧪 Postman Test (POST):**
```javascript
// POST http://localhost:8000/api/quizzes/{{created_quiz_id}}/questions/
// Headers: Authorization: Bearer {{teacher_token}}

// Test Script:
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Question created", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('id');
    
    // Save question ID for choice tests
    pm.environment.set("created_question_id", jsonData.id);
});
```

#### 6.2 Chi tiết, cập nhật, xóa câu hỏi
- **URL**: `GET/PUT/PATCH/DELETE /api/questions/{id}/`
- **Permission**: `IsTeacherOrAdmin`

### 🔘 7. Choice Management

#### 7.1 Danh sách và tạo lựa chọn
- **URL**: `GET/POST /api/questions/{question_id}/choices/`
- **Permission**: `IsTeacherOrAdmin`

**POST Request Body:**
```json
{
  "text": "print()",
  "is_correct": true
}
```

**🧪 Postman Test (POST):**
```javascript
// POST http://localhost:8000/api/questions/{{created_question_id}}/choices/
// Headers: Authorization: Bearer {{teacher_token}}

// Test Script:
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Choice created", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('id');
    pm.expect(jsonData.text).to.eql("print()");
    pm.expect(jsonData.is_correct).to.eql(true);
});
```

#### 7.2 Chi tiết, cập nhật, xóa lựa chọn
- **URL**: `GET/PUT/PATCH/DELETE /api/choices/{id}/`
- **Permission**: `IsTeacherOrAdmin`

### 📊 8. Dashboard & Analytics

#### 8.1 Dashboard giáo viên
- **URL**: `GET /api/dashboard/teacher/`
- **Permission**: `IsTeacher`

**Response:**
```json
{
  "total_courses": 8,
  "published_courses": 6,
  "total_students": 127,
  "total_enrollments": 245,
  "popular_course": {
    "id": 3,
    "title": "JavaScript Full Stack",
    "student_count": 45,
    "avg_rating": 4.7
  },
  "recent_enrollments": [
    {
      "id": 15,
      "student": {
        "username": "student5",
        "first_name": "Alice"
      },
      "course": {
        "id": 3,
        "title": "JavaScript Full Stack"
      },
      "enrolled_at": "2025-06-05T14:30:00Z"
    }
  ],
  "monthly_revenue": {
    "current_month": 1250.50,
    "previous_month": 980.75,
    "growth_percentage": 27.5
  }
}
```

**🧪 Postman Test:**
```javascript
// GET http://localhost:8000/api/dashboard/teacher/
// Headers: Authorization: Bearer {{teacher_token}}

// Test Script:
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Dashboard has required metrics", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('total_courses');
    pm.expect(jsonData).to.have.property('published_courses');
    pm.expect(jsonData).to.have.property('total_students');
    pm.expect(jsonData).to.have.property('popular_course');
});

pm.test("Revenue data is present", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('monthly_revenue');
    pm.expect(jsonData.monthly_revenue).to.have.property('current_month');
});
```

#### 8.2 Dashboard admin
- **URL**: `GET /api/dashboard/admin/`
- **Permission**: `IsTeacherOrAdmin`

**Response:**
```json
{
  "total_courses": 125,
  "published_courses": 98,
  "total_enrollments": 2450,
  "total_teachers": 25,
  "total_students": 580,
  "platform_revenue": {
    "total": 25450.75,
    "this_month": 3200.50,
    "growth_rate": 15.2
  },
  "top_courses": [
    {
      "id": 1,
      "title": "Python for Data Science",
      "enrollments": 125,
      "revenue": 4500.00
    }
  ],
  "user_registrations": {
    "today": 12,
    "this_week": 89,
    "this_month": 245
  }
}
```

**🧪 Postman Test:**
```javascript
// GET http://localhost:8000/api/dashboard/admin/
// Headers: Authorization: Bearer {{admin_token}}

// Test Script:
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Admin dashboard has comprehensive metrics", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('total_courses');
    pm.expect(jsonData).to.have.property('total_teachers');
    pm.expect(jsonData).to.have.property('total_students');
    pm.expect(jsonData).to.have.property('platform_revenue');
    pm.expect(jsonData).to.have.property('top_courses');
});
```

#### 8.3 Quiz Results (Teacher)
- **URL**: `GET /api/teacher/quizzes/{quiz_id}/results/`
- **Permission**: `IsTeacherOrAdmin`

**Response:**
```json
{
  "quiz_id": 1,
  "quiz_title": "Python Basics Quiz",
  "results": [
    {
      "id": 15,
      "user": {
        "id": 5,
        "username": "student1",
        "first_name": "John",
        "last_name": "Doe"
      },
      "score": 8.5,
      "correct_count": 17,
      "total_count": 20,
      "submitted_at": "2025-06-06T09:30:00Z",
      "detailed_answers": [
        {
          "question": "What is Python?",
          "user_answer": "A programming language",
          "correct_answer": "A programming language",
          "is_correct": true
        }
      ]
    }
  ],
  "stats": {
    "total_attempts": 45,
    "average_score": 7.2,
    "highest_score": 10.0,
    "lowest_score": 3.5,
    "pass_rate": 78.5
  }
}
```

**🧪 Postman Test:**
```javascript
// GET http://localhost:8000/api/teacher/quizzes/1/results/
// Headers: Authorization: Bearer {{teacher_token}}

// Test Script:
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Quiz results include stats", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('results');
    pm.expect(jsonData).to.have.property('stats');
    pm.expect(jsonData.stats).to.have.property('average_score');
    pm.expect(jsonData.stats).to.have.property('pass_rate');
});
```

#### 8.4 Teacher Statistics  
- **URL**: `GET /api/teacher/statistics/`
- **Permission**: `IsTeacherOrAdmin`

**Response:**
```json
{
  "revenue_chart": {
    "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    "datasets": [{
      "label": "Doanh thu (USD)",
      "data": [150, 280, 320, 450, 380, 520],
      "backgroundColor": "#4f46e5"
    }]
  },
  "enrollment_trends": {
    "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    "datasets": [{
      "label": "Học viên mới",
      "data": [12, 19, 15, 25, 18, 32],
      "borderColor": "#22d3ee"
    }]
  },
  "course_performance": {
    "course_names": ["Python Basics", "Advanced Python", "Data Science"],
    "avg_scores": [7.8, 8.2, 7.5]
  }
}
```

**🧪 Postman Test:**
```javascript
// GET http://localhost:8000/api/teacher/statistics/
// Headers: Authorization: Bearer {{teacher_token}}

// Test Script:
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Statistics include charts data", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('revenue_chart');
    pm.expect(jsonData).to.have.property('enrollment_trends');
    pm.expect(jsonData).to.have.property('course_performance');
});
```

### 🤖 9. AI Features

#### 9.1 Generate Auto Quiz
- **URL**: `POST /api/sections/{section_id}/generate-quiz/`
- **Permission**: `IsTeacherOrAdmin`

**Request Body:**
```json
{
  "num_questions": 10,
  "lesson_ids": [1, 2, 3],
  "difficulty": "medium"
}
```

**Response:**
```json
{
  "message": "Tạo câu hỏi thành công",
  "section_title": "Python Fundamentals",
  "num_questions": 10,
  "questions": [
    {
      "text": "Cách khai báo biến trong Python?",
      "choices": [
        {
          "text": "var x = 10",
          "is_correct": false
        },
        {
          "text": "x = 10", 
          "is_correct": true
        },
        {
          "text": "int x = 10",
          "is_correct": false
        }
      ]
    }
  ]
}
```

**🧪 Postman Test:**
```javascript
// POST http://localhost:8000/api/sections/1/generate-quiz/
// Headers: Authorization: Bearer {{teacher_token}}

// Test Script:
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Quiz generated successfully", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('questions');
    pm.expect(jsonData.questions).to.be.an('array');
    pm.expect(jsonData.questions.length).to.be.greaterThan(0);
});

pm.test("Questions have choices", function () {
    var jsonData = pm.response.json();
    if (jsonData.questions.length > 0) {
        var question = jsonData.questions[0];
        pm.expect(question).to.have.property('choices');
        pm.expect(question.choices).to.be.an('array');
    }
});
```

#### 9.2 AI Quiz Feedback (Teacher)
- **URL**: `POST /api/teacher/quiz-attempts/{attempt_id}/ai-feedback/`
- **Permission**: `IsTeacherOrAdmin`

**Response:**
```json
{
  "feedback": "## 📊 Phân tích kết quả bài kiểm tra\n\n### ✅ Điểm mạnh\n- Học sinh làm tốt các câu hỏi về **syntax cơ bản**\n- Hiểu rõ về **variables và data types**\n\n### ⚠️ Cần cải thiện\n- **Control structures**: Cần luyện tập thêm về loops\n- **Functions**: Chưa nắm vững cách define functions\n\n### 💡 Đề xuất\n1. Ôn lại bài học về loops\n2. Làm thêm bài tập về functions\n3. Thực hành coding nhiều hơn"
}
```

**🧪 Postman Test:**
```javascript
// POST http://localhost:8000/api/teacher/quiz-attempts/1/ai-feedback/
// Headers: Authorization: Bearer {{teacher_token}}

// Test Script:
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("AI feedback generated", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('feedback');
    pm.expect(jsonData.feedback).to.be.a('string');
    pm.expect(jsonData.feedback.length).to.be.greaterThan(0);
});
```

## 🔄 Testing Workflow Recommendations

### 1. Complete Course Creation Workflow
```
1. Login as Teacher → Get Token
2. Create Course → Save course_id
3. Create Section → Save section_id  
4. Create Lesson → Save lesson_id
5. Create Quiz → Save quiz_id
6. Create Questions & Choices
7. Publish Course
8. Login as Student → Enroll in Course
9. Take Quiz → Get Results
10. Teacher Views Results → Generate AI Feedback
```

### 2. Postman Collection Structure
```
📁 Smart Learning Platform API
├── 🔐 Authentication
│   ├── Login Admin
│   ├── Login Teacher
│   └── Login Student
├── 📚 Course Management
│   ├── List Courses
│   ├── Create Course
│   ├── Course Details
│   ├── Update Course
│   └── Delete Course
├── 📖 Content Management
│   ├── 📂 Sections
│   ├── 📝 Lessons  
│   ├── 🧩 Quizzes
│   ├── ❓ Questions
│   └── 🔘 Choices
├── 🎓 Student Features
│   ├── Enroll Course
│   ├── Take Quiz
│   └── View Progress
├── 📊 Analytics & Reports
│   ├── Teacher Dashboard
│   ├── Admin Dashboard
│   ├── Quiz Results
│   └── Statistics
└── 🤖 AI Features
    ├── Generate Quiz
    └── AI Feedback
```

## 🐛 Troubleshooting

### Common Issues:

#### 1. Authentication Errors (401)
```
Problem: Invalid or expired token
Solution: 
- Check token in environment variables
- Re-login to get fresh token
- Verify Authorization header format: "Bearer <token>"
```

#### 2. Permission Errors (403)  
```
Problem: User doesn't have required permissions
Solution:
- Check user_type in profile (admin/teacher/student)
- Verify endpoint permissions in documentation
- Use correct user role for the endpoint
```

#### 3. Validation Errors (400)
```
Problem: Invalid request data
Solution: 
- Check required fields in request body
- Verify data types (string, number, boolean)
- Check field constraints (max_length, etc.)
```

#### 4. Not Found Errors (404)
```
Problem: Resource doesn't exist
Solution:
- Verify ID exists in database
- Check URL path parameters
- Ensure resource isn't deleted
```

### Environment Setup Issues:

#### 1. Server Not Running
```bash
# Start Django development server
cd backend/
python manage.py runserver
```

#### 2. Database Issues  
```bash
# Run migrations
python manage.py migrate

# Create seed data
python manage.py seed_data
```

#### 3. Missing Dependencies
```bash
# Install requirements
pip install -r requirements.txt
```

## 📝 API Response Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 204 | No Content | Delete successful |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Permission denied |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Internal server error |

## 🔧 Quick Start với Postman

1. **Import Collection**: Copy API endpoints to Postman
2. **Setup Environment**: Add base_url and auth tokens
3. **Run Authentication**: Get tokens for all user types
4. **Test Basic Flow**: Create → Read → Update → Delete
5. **Test Permissions**: Try endpoints with different user roles
6. **Test Error Cases**: Invalid data, missing auth, etc.

---

**Last Updated**: June 6, 2025  
**API Version**: v1.0  
**Base URL**: `http://localhost:8000/api/`
