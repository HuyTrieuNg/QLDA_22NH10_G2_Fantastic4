import api from "../api/axiosConfig";

// Course services
export const courseService = {
  // Get all courses for teacher
  getMyCourses: () => api.get('/courses/my-courses/'),
  
  // Get course detail
  getCourseDetail: (id) => api.get(`/courses/${id}/`),
  
  // Create new course
  createCourse: (data) => api.post('/courses/create/', data),
    // Update course
  updateCourse: (id, data) => api.patch(`/courses/${id}/update/`, data),
  
  // Update course thumbnail
  updateCourseThumbnail: (id, formData) => api.patch(`/courses/${id}/update/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  }),
  
  // Delete course
  deleteCourse: (id) => api.delete(`/courses/${id}/delete/`),
  
  // Get course students
  getCourseStudents: (id) => api.get(`/courses/${id}/students/`),
  
  // Teacher dashboard
  getTeacherDashboard: () => api.get('/dashboard/teacher/'),
};

// Section services
export const sectionService = {
  // Get sections for course
  getCourseSections: (courseId) => api.get(`/courses/${courseId}/sections/`),
  
  // Get section detail
  getSectionDetail: (id) => api.get(`/sections/${id}/`),
  
  // Create section
  createSection: (courseId, data) => api.post(`/courses/${courseId}/sections/`, data),
  
  // Update section
  updateSection: (id, data) => api.patch(`/sections/${id}/`, data),
  
  // Delete section
  deleteSection: (id) => api.delete(`/sections/${id}/`),
};

// Lesson services
export const lessonService = {
  // Get lessons for section
  getSectionLessons: (sectionId) => api.get(`/sections/${sectionId}/lessons/`),
  
  // Get lesson detail
  getLessonDetail: (id) => api.get(`/lessons/${id}/`),
  
  // Create lesson
  createLesson: (sectionId, data) => api.post(`/sections/${sectionId}/lessons/`, data),
  
  // Update lesson
  updateLesson: (id, data) => api.patch(`/lessons/${id}/`, data),
  
  // Delete lesson
  deleteLesson: (id) => api.delete(`/lessons/${id}/`),
};

// Quiz services
export const quizService = {
  // Get quizzes for section
  getSectionQuizzes: (sectionId) => api.get(`/sections/${sectionId}/quizzes/`),
  
  // Get quiz detail
  getQuizDetail: (id) => api.get(`/quizzes/${id}/`),
  
  // Create quiz
  createQuiz: (sectionId, data) => api.post(`/sections/${sectionId}/quizzes/`, data),
    // Update quiz
  updateQuiz: (id, data) => api.patch(`/quizzes/${id}/`, data),
    // Delete quiz
  deleteQuiz: (id) => api.delete(`/quizzes/${id}/`),
  
  // Generate quiz automatically using AI
  generateAutoQuiz: (sectionId, data) => api.post(`/sections/${sectionId}/generate-quiz/`, data, {
    timeout: 300000, // 5 phút timeout cho AI quiz generation
  }),
  
  // Get quiz results for teachers
  getQuizResults: (quizId) => api.get(`/teacher/quizzes/${quizId}/results/`),
};

// Thống kê cho giáo viên (chỉ số liệu, không AI)
export const getTeacherStatistics = () => api.get('/teacher/statistics/', { timeout: 20000 }); // 20s cho số liệu
// Lấy nhận xét AI cho thống kê giáo viên (timeout lớn)
export const getTeacherStatisticsAIFeedback = () => api.get('/teacher/statistics/?ai=1', { timeout: 180000 }); // 3 phút cho AI

export default api;
