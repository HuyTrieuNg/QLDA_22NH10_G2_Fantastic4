# Student Module API Documentation

Tài liệu này mô tả các API endpoints có sẵn trong module Student, giúp học viên tương tác với hệ thống quản lý khóa học.

## Endpoints

### 1. Danh sách khóa học và tìm kiếm

- **URL**: `/api/student/courses/`
- **Method**: GET
- **Quyền**: Public (Bất kỳ ai cũng có thể xem)
- **Mô tả**: Trả về danh sách tất cả các khóa học đã xuất bản
- **Query Params**:
  - `search`: Tìm kiếm theo tiêu đề, mô tả hoặc danh mục
  - `category`: Lọc theo danh mục
- **Response**:

```json
[
  {
    "id": 1,
    "title": "Python Cơ bản",
    "subtitle": "Học lập trình Python từ cơ bản đến nâng cao",
    "thumbnail": "url_to_thumbnail",
    "category": "Lập trình",
    "price": 11.99,
    "student_count": 42,
    "lesson_count": 15,
    "is_enrolled": false
  },
  ...
]
```

### 2. Chi tiết khóa học

- **URL**: `/api/student/courses/<course_id>/`
- **Method**: GET
- **Quyền**: Public (Bất kỳ ai cũng có thể xem)
- **Mô tả**: Trả về thông tin chi tiết về khóa học, bao gồm danh sách các section và bài giảng
- **Response**:

```json
{
  "id": 1,
  "title": "Python Cơ bản",
  "subtitle": "Học lập trình Python từ cơ bản đến nâng cao",
  "description": "Khóa học này sẽ giúp bạn...",
  "thumbnail": "url_to_thumbnail",
  "category": "Lập trình",
  "price": 11.99,
  "student_count": 42,
  "lesson_count": 15,
  "is_enrolled": false,
  "published_at": "2023-06-01",
  "sections": [
    {
      "id": 1,
      "title": "Giới thiệu Python",
      "lessons": [
        {
          "id": 1,
          "title": "Cài đặt Python",
          "content": "Tóm tắt nội dung",
          "video_url": "https://example.com/video1"
        },
        ...
      ]
    },
    ...
  ]
}
```

### 3. Đăng ký khóa học

- **URL**: `/api/student/courses/<course_id>/enroll/`
- **Method**: POST
- **Quyền**: Yêu cầu đăng nhập
- **Mô tả**: Đăng ký khóa học cho học viên đã đăng nhập
- **Request Body**: Không cần
- **Response**:

```json
{
  "detail": "Đăng ký khóa học thành công"
}
```

### 4. Danh sách khóa học đã đăng ký

- **URL**: `/api/student/my-courses/`
- **Method**: GET
- **Quyền**: Yêu cầu đăng nhập
- **Mô tả**: Trả về danh sách khóa học mà học viên đã đăng ký và tiến độ học tập
- **Response**:

```json
[
  {
    "id": 1,
    "course": {
      "id": 1,
      "title": "Python Cơ bản",
      "subtitle": "Học lập trình Python từ cơ bản đến nâng cao",
      "thumbnail": "url_to_thumbnail",
      "category": "Lập trình",
      "price": 11.99,
      "student_count": 42,
      "lesson_count": 15,
      "is_enrolled": true
    },
    "enrolled_at": "2023-06-10T10:30:00Z",
    "progress": 35.0
  },
  ...
]
```

### 5. Xem bài giảng

- **URL**: `/api/student/lessons/<lesson_id>/`
- **Method**: GET
- **Quyền**: Yêu cầu đăng nhập và đã đăng ký khóa học chứa bài giảng
- **Mô tả**: Trả về nội dung chi tiết của bài giảng và tự động cập nhật tiến độ học tập
- **Response**:

```json
{
  "id": 1,
  "title": "Cài đặt Python",
  "content": "Nội dung chi tiết của bài giảng...",
  "video_url": "https://example.com/video1"
}
```

## Mã lỗi

- `400 Bad Request`: Yêu cầu không hợp lệ (ví dụ: đăng ký khóa học đã đăng ký)
- `401 Unauthorized`: Chưa đăng nhập
- `403 Forbidden`: Không có quyền truy cập (ví dụ: cố gắng xem bài giảng của khóa học chưa đăng ký)
- `404 Not Found`: Không tìm thấy tài nguyên
