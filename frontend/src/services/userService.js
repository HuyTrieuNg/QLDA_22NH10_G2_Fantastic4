import api from "../api/axiosConfig";

// Lấy danh sách users (chỉ cho giáo viên và admin)
export const getUsers = (page = 1, limit = 10) => {
  return api.get("/auth/users/", {
    params: { page, limit },
  });
};

// Lấy thông tin chi tiết về một user theo từ khóa tìm kiếm
export const searchUsers = (query) => {
  return api.get(`/auth/users/search/`, {
    params: { query },
  });
};

// Lấy danh sách học sinh (chỉ dành cho giáo viên)
export const getStudents = () => {
  return api.get("/auth/users/students/");
};

// Lấy danh sách giáo viên
export const getTeachers = () => {
  return api.get("/auth/users/teachers/");
};

// Cập nhật avatar của user
export const updateAvatar = (formData) => {
  return api.post("/auth/profile/avatar/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Cập nhật thông tin người dùng (cho admin)
export const updateUser = (userId, userData) => {
  return api.put(`/auth/users/${userId}/`, userData);
};

// Xóa user (chỉ cho admin)
export const deleteUser = (userId) => {
  return api.delete(`/auth/users/${userId}/`);
};
