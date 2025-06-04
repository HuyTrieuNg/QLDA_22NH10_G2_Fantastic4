# Admin Panel API Documentation

This document describes the API endpoints available in the admin panel module.

## Authentication and Authorization

All endpoints require a valid JWT token with admin privileges. Add the token to the request header:

```
Authorization: Bearer <token>
```

Only users with 'admin' user_type or is_staff=True can access these endpoints.

## User Management API

### List All Users

**GET** `/api/admin-panel/users/`

Returns a paginated list of all registered users.

### Get User Details

**GET** `/api/admin-panel/users/{id}/`

Returns detailed information about a specific user.

### Create User

**POST** `/api/admin-panel/users/`

Creates a new user.

**Request Body:**

```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "securepassword",
  "first_name": "New",
  "last_name": "User",
  "user_type": "student"
}
```

### Update User

**PUT/PATCH** `/api/admin-panel/users/{id}/`

Updates a user's information.

**Request Body (PATCH):**

```json
{
  "first_name": "Updated",
  "last_name": "Name"
}
```

### Block User

**DELETE** `/api/admin-panel/users/{id}/`

Blocks a user account instead of permanently deleting it. Sets user's is_active status to false.

### List Active Users

**GET** `/api/admin-panel/users/active/`

Returns a list of all active users.

### List Blocked Users

**GET** `/api/admin-panel/users/blocked/`

Returns a list of all blocked users.

### Filter Users by Active Status

**GET** `/api/admin-panel/users/?is_active=true` or `/api/admin-panel/users/?is_active=false`

Returns a list of users filtered by their active status.

### Change User Type

**PATCH** `/api/admin-panel/users/{id}/change_user_type/`

Changes a user's type (role).

**Request Body:**

```json
{
  "user_type": "teacher"
}
```

### Toggle User Active Status

**PATCH** `/api/admin-panel/users/{id}/toggle_active_status/`

Blocks or unblocks a user account.

## Course Management API

### List All Courses

**GET** `/api/admin-panel/courses/`

Returns a paginated list of all courses in the system.

### Get Course Details

**GET** `/api/admin-panel/courses/{id}/`

Returns detailed information about a specific course including its sections, lessons and quizzes (complete course content structure).

### Create Course

**POST** `/api/admin-panel/courses/`

Creates a new course.

### Update Course

**PUT/PATCH** `/api/admin-panel/courses/{id}/`

Updates course information.

### Delete Course

**DELETE** `/api/admin-panel/courses/{id}/`

Deletes a course and all associated content.

### Get Course Statistics

**GET** `/api/admin-panel/courses/{id}/detailed_stats/`

Returns detailed statistics about a course.

## Content Management APIs

The admin panel provides CRUD operations for all content types:

- **Sections:** `/api/admin-panel/sections/`
- **Lessons:** `/api/admin-panel/lessons/`
- **Quizzes:** `/api/admin-panel/quizzes/`
- **Questions:** `/api/admin-panel/questions/`
- **Choices:** `/api/admin-panel/choices/`
- **Enrollments:** `/api/admin-panel/enrollments/`

Each supports standard REST operations (GET, POST, PUT, PATCH, DELETE).

> **Note**: You can access all course content directly through the course detail endpoint (`/api/admin-panel/courses/{id}/`) which includes the complete structure of sections, lessons, and quizzes.

## Dashboard API

### Get System Statistics

**GET** `/api/admin-panel/dashboard/`

Returns comprehensive statistics about the system including:

- User counts (total, active, by role)
- Course counts (total, published, unpublished)
- Content statistics
- Enrollment information
