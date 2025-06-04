import api from "../api/axiosConfig";

// Student services
const studentService = {
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

  // Get all quiz history for student
  getQuizHistory: () => api.get("/student/quiz-history/"),

  // Get quiz history for a specific quiz
  getQuizHistoryByQuiz: (quizId) => api.get(`/student/quizzes/${quizId}/history/`),

  // Submit a quiz attempt
  submitQuizAttempt: (quizId, data) => api.post(`/student/quizzes/${quizId}/submit/`, data),

  // Summarize lesson content (timeout 5 minutes)
  summarizeLesson: (lessonId) =>
    api.post(
      `/student/lessons/${lessonId}/summarize/`,
      {},
      { timeout: 300000 } // 5 minutes in milliseconds
    ),
};

export default studentService;
