import api from "../api/axiosConfig";

// User Management API
export const getUsers = (params) => {
  return api.get("/admin-panel/users/", { params });
};

export const getUser = (userId) => {
  return api.get(`/admin-panel/users/${userId}/`);
};

export const createUser = (userData) => {
  return api.post("/admin-panel/users/", userData);
};

export const updateUser = (userId, userData) => {
  return api.patch(`/admin-panel/users/${userId}/`, userData);
};

export const deleteUser = (userId) => {
  return api.delete(`/admin-panel/users/${userId}/`);
};

export const changeUserType = (userId, userType) => {
  return api.patch(`/admin-panel/users/${userId}/change_user_type/`, {
    user_type: userType,
  });
};

export const toggleUserActiveStatus = (userId) => {
  return api.patch(`/admin-panel/users/${userId}/toggle_active_status/`);
};

// Course Management API
export const getCourses = (params) => {
  return api.get("/admin-panel/courses/", { params });
};

export const getCourse = (courseId) => {
  return api.get(`/admin-panel/courses/${courseId}/`);
};

export const createCourse = (courseData) => {
  return api.post("/admin-panel/courses/", courseData);
};

export const updateCourse = (courseId, courseData) => {
  return api.patch(`/admin-panel/courses/${courseId}/`, courseData);
};

export const deleteCourse = (courseId) => {
  return api.delete(`/admin-panel/courses/${courseId}/`);
};

export const getCourseStats = (courseId) => {
  return api.get(`/admin-panel/courses/${courseId}/detailed_stats/`);
};

// Get full course content (sections, lessons, quizzes) for admin view
export const getCourseContent = (courseId) => {
  // This endpoint returns the full course structure
  return api.get(`/admin-panel/courses/${courseId}/`);
};

// Dashboard API
export const getDashboardStats = () => {
  return api.get("/admin-panel/dashboard/");
};

// System Configuration API
export const getSystemConfigs = () => {
  return api.get("/admin-panel/system-config/");
};

export const getSystemConfigsByCategory = () => {
  return api.get("/admin-panel/system-config/by_category/");
};

export const updateSystemConfig = (configId, configData) => {
  return api.patch(`/admin-panel/system-config/${configId}/`, configData);
};

export const createSystemConfig = (configData) => {
  return api.post("/admin-panel/system-config/", configData);
};

// Audit Logs API
export const getAuditLogs = (params) => {
  return api.get("/admin-panel/audit-logs/", { params });
};

// Content Management APIs (Sections, Lessons, Quizzes, etc.)
export const getSections = (params) => {
  return api.get("/admin-panel/sections/", { params });
};

export const getLessons = (params) => {
  return api.get("/admin-panel/lessons/", { params });
};

export const getQuizzes = (params) => {
  return api.get("/admin-panel/quizzes/", { params });
};

export const getQuestions = (params) => {
  return api.get("/admin-panel/questions/", { params });
};

export const getEnrollments = (params) => {
  return api.get("/admin-panel/enrollments/", { params });
};
