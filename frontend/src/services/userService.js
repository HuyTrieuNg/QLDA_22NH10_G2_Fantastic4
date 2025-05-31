import api from "./api/axiosConfig";

// Lấy danh sách users với phân trang
export const getUsers = (page = 1, limit = 10) => {
  return api.get("/users/", {
    params: { page, limit },
  });
};

// Lấy thông tin chi tiết về một user
export const getUserById = (userId) => {
  return api.get(`/users/${userId}/`);
};

// Tạo mới user
export const createUser = (userData) => {
  return api.post("/users/", userData);
};

// Cập nhật thông tin user
export const updateUser = (userId, userData) => {
  return api.put(`/users/${userId}/`, userData);
};

// Xóa user
export const deleteUser = (userId) => {
  return api.delete(`/users/${userId}/`);
};
