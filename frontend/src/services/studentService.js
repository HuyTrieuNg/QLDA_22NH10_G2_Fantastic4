import api from "../api/axiosConfig";

// Student services
export const studentService = {
  // Get all published courses for students
  getAllCourses: (params) => api.get("/student/courses/", { params }),

  // Get course detail
  getCourseDetail: (courseId) => api.get(`/student/courses/${courseId}/`),

  // Enroll to a course
  enrollCourse: (courseId) => api.post(`/student/courses/${courseId}/enroll/`),

  // Get student's enrolled courses
  getEnrolledCourses: () => api.get("/student/my-courses/"),

  // Get lesson details
  getLessonDetail: (lessonId) => api.get(`/student/lessons/${lessonId}/`),
};

export default studentService;
