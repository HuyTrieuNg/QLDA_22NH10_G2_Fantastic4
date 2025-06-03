# Course API Endpoints Documentation

Đây là tài liệu mô tả các API endpoints cho ứng dụng Course với kiểm tra quyền từ `user/permissions.py`.

## Các Permission Classes được sử dụng:

1. **IsTeacherOrAdmin**: Chỉ giáo viên và admin mới được truy cập
2. **IsTeacher**: Chỉ giáo viên mới được truy cập  
3. **IsStudent**: Chỉ học viên mới được truy cập
4. **IsOwnerOrAdminOrTeacher**: Chỉ chủ sở hữu, admin hoặc giáo viên mới được truy cập
5. **IsAuthenticated**: Người dùng đã đăng nhập
6. **AllowAny**: Không yêu cầu đăng nhập

## API Endpoints:

### 1. Course Management

#### Danh sách khóa học
- **URL**: `GET /api/courses/`
- **Permission**: `AllowAny` (Công khai, nhưng chỉ hiển thị khóa học đã xuất bản cho người dùng thường)
- **Query Parameters**:
  - `search`: Tìm kiếm theo tiêu đề, mô tả, danh mục
  - `category`: Lọc theo danh mục
- **Mô tả**: Lấy danh sách tất cả khóa học. Giáo viên/Admin xem được cả khóa học chưa xuất bản.

#### Chi tiết khóa học
- **URL**: `GET /api/courses/{id}/`
- **Permission**: `AllowAny` (Với kiểm tra đặc biệt cho khóa học chưa xuất bản)
- **Mô tả**: Xem chi tiết khóa học. Khóa học chưa xuất bản chỉ creator/giáo viên/admin mới xem được.

#### Tạo khóa học mới
- **URL**: `POST /api/courses/create/`
- **Permission**: `IsTeacherOrAdmin`
- **Body**: `title`, `subtitle`, `description`, `published`, `thumbnail`, `category`, `price`
- **Mô tả**: Tạo khóa học mới, tự động gán creator là người tạo.

#### Cập nhật khóa học
- **URL**: `PUT/PATCH /api/courses/{id}/update/`
- **Permission**: `IsAuthenticated` + kiểm tra creator/giáo viên/admin
- **Body**: `title`, `subtitle`, `description`, `published`, `thumbnail`, `category`, `price`
- **Mô tả**: Cập nhật thông tin khóa học.

#### Xóa khóa học
- **URL**: `DELETE /api/courses/{id}/delete/`
- **Permission**: `IsAuthenticated` + kiểm tra creator/giáo viên/admin
- **Mô tả**: Xóa khóa học.

#### Khóa học của tôi
- **URL**: `GET /api/courses/my-courses/`
- **Permission**: `IsAuthenticated`
- **Mô tả**: 
  - Giáo viên/Admin: Xem khóa học đã tạo
  - Học viên: Xem khóa học đã đăng ký

### 2. Course Enrollment

#### Đăng ký khóa học
- **URL**: `POST /api/courses/{course_id}/enroll/`
- **Permission**: `IsStudent`
- **Mô tả**: Học viên đăng ký khóa học.

#### Hủy đăng ký khóa học
- **URL**: `DELETE /api/courses/{course_id}/unenroll/`
- **Permission**: `IsStudent`
- **Mô tả**: Học viên hủy đăng ký khóa học.

#### Danh sách học viên của khóa học
- **URL**: `GET /api/courses/{course_id}/students/`
- **Permission**: `IsAuthenticated` + kiểm tra creator/giáo viên/admin
- **Mô tả**: Xem danh sách học viên đã đăng ký khóa học.

### 3. Section Management

#### Danh sách và tạo section
- **URL**: `GET/POST /api/courses/{course_id}/sections/`
- **Permission**: 
  - GET: `IsAuthenticated`
  - POST: `IsAuthenticated` + kiểm tra creator/giáo viên/admin
- **Body** (POST): `title`, `position`
- **Mô tả**: Lấy danh sách hoặc tạo section mới cho khóa học.

#### Chi tiết, cập nhật, xóa section
- **URL**: `GET/PUT/PATCH/DELETE /api/sections/{id}/`
- **Permission**: 
  - GET: `IsAuthenticated`
  - PUT/PATCH/DELETE: `IsAuthenticated` + kiểm tra creator/giáo viên/admin
- **Body** (PUT/PATCH): `title`, `position`
- **Mô tả**: Quản lý section.

### 4. Lesson Management

#### Danh sách và tạo lesson
- **URL**: `GET/POST /api/sections/{section_id}/lessons/`
- **Permission**: 
  - GET: `IsAuthenticated`
  - POST: `IsAuthenticated` + kiểm tra creator/giáo viên/admin
- **Body** (POST): `title`, `content`, `position`, `video_url`
- **Mô tả**: Quản lý bài học trong section.

#### Chi tiết, cập nhật, xóa lesson
- **URL**: `GET/PUT/PATCH/DELETE /api/lessons/{id}/`
- **Permission**: 
  - GET: `IsAuthenticated`
  - PUT/PATCH/DELETE: `IsAuthenticated` + kiểm tra creator/giáo viên/admin
- **Body** (PUT/PATCH): `title`, `content`, `position`, `video_url`
- **Mô tả**: Quản lý bài học.

### 5. Quiz Management

#### Danh sách và tạo quiz
- **URL**: `GET/POST /api/sections/{section_id}/quizzes/`
- **Permission**: 
  - GET: `IsAuthenticated`
  - POST: `IsAuthenticated` + kiểm tra creator/giáo viên/admin
- **Body** (POST): `title`, `position`
- **Mô tả**: Quản lý quiz trong section.

#### Chi tiết, cập nhật, xóa quiz
- **URL**: `GET/PUT/PATCH/DELETE /api/quizzes/{id}/`
- **Permission**: 
  - GET: `IsAuthenticated`
  - PUT/PATCH/DELETE: `IsAuthenticated` + kiểm tra creator/giáo viên/admin
- **Body** (PUT/PATCH): `title`, `position`
- **Mô tả**: Quản lý quiz.

### 6. Question Management

#### Danh sách và tạo câu hỏi
- **URL**: `GET/POST /api/quizzes/{quiz_id}/questions/`
- **Permission**: `IsTeacherOrAdmin`
- **Body** (POST): `text`, `position`
- **Mô tả**: Quản lý câu hỏi trong quiz.

#### Chi tiết, cập nhật, xóa câu hỏi
- **URL**: `GET/PUT/PATCH/DELETE /api/questions/{id}/`
- **Permission**: `IsTeacherOrAdmin`
- **Body** (PUT/PATCH): `text`, `position`
- **Mô tả**: Quản lý câu hỏi.

### 7. Choice Management

#### Danh sách và tạo lựa chọn
- **URL**: `GET/POST /api/questions/{question_id}/choices/`
- **Permission**: `IsTeacherOrAdmin`
- **Body** (POST): `text`, `is_correct`
- **Mô tả**: Quản lý lựa chọn cho câu hỏi.

#### Chi tiết, cập nhật, xóa lựa chọn
- **URL**: `GET/PUT/PATCH/DELETE /api/choices/{id}/`
- **Permission**: `IsTeacherOrAdmin`
- **Body** (PUT/PATCH): `text`, `is_correct`
- **Mô tả**: Quản lý lựa chọn.

### 8. Dashboard

#### Dashboard giáo viên
- **URL**: `GET /api/dashboard/teacher/`
- **Permission**: `IsTeacher`
- **Response**: 
  ```json
  {
    "total_courses": 5,
    "published_courses": 3,
    "total_students": 25,
    "popular_course": {
      "id": 1,
      "title": "Python cơ bản",
      "student_count": 15
    }
  }
  ```
- **Mô tả**: Thống kê dành cho giáo viên.

#### Dashboard admin
- **URL**: `GET /api/dashboard/admin/`
- **Permission**: `IsTeacherOrAdmin`
- **Response**:
  ```json
  {
    "total_courses": 50,
    "published_courses": 35,
    "total_enrollments": 500,
    "total_teachers": 10,
    "total_students": 100
  }
  ```
- **Mô tả**: Thống kê tổng quan dành cho admin.

## Ví dụ sử dụng:

### 1. Tạo khóa học mới (với quyền giáo viên):
```bash
curl -X POST http://127.0.0.1:8000/api/courses/create/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Khóa học Python cơ bản",
    "subtitle": "Học Python từ con số 0",
    "description": "Khóa học dành cho người mới bắt đầu",
    "category": "Programming",
    "price": 99.99,
    "published": false
  }'
```

### 2. Đăng ký khóa học (với quyền học viên):
```bash
curl -X POST http://127.0.0.1:8000/api/courses/1/enroll/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Xem dashboard giáo viên:
```bash
curl -X GET http://127.0.0.1:8000/api/dashboard/teacher/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Lưu ý:

1. Tất cả các API yêu cầu Authentication đều cần header `Authorization: Bearer YOUR_ACCESS_TOKEN`
2. Quyền truy cập được kiểm tra dựa trên `user.profile.user_type` và `user.is_staff`
3. Một số endpoint có kiểm tra quyền đặc biệt (ví dụ: chỉ creator của khóa học mới được sửa/xóa)
4. Các API công khai (AllowAny) vẫn có logic kiểm tra riêng (ví dụ: khóa học chưa xuất bản)
5. Server đang chạy tại `http://127.0.0.1:8000/`
