import api from "../api/axiosConfig";

// Đăng nhập
export const login = (credentials) => {
  return api.post("/auth/login/", credentials);
};

// Đăng ký
export const register = (userData) => {
  return api.post("/auth/register/", userData);
};

// Lấy thông tin profile
export const getUserProfile = () => {
  return api.get("/auth/profile/");
};

// Đổi mật khẩu
export const changePassword = (passwordData) => {
  return api.post("/auth/change-password/", passwordData);
};

// Refresh token
export const refreshToken = (refreshToken) => {
  return api.post("/auth/refresh-token/", { refresh: refreshToken });
};

// Đăng xuất
export const logout = () => {
  return api.post("/auth/logout/");
};
