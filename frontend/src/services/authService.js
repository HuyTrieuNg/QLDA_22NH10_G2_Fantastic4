import api from "./api/axiosConfig";

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

// Cập nhật thông tin profile
export const updateProfile = (profileData) => {
  return api.put("/auth/profile/", profileData);
};

// Đổi mật khẩu
export const changePassword = (passwordData) => {
  return api.post("/auth/change-password/", passwordData);
};

// Yêu cầu đặt lại mật khẩu
export const requestPasswordReset = (email) => {
  return api.post("/auth/password-reset/", { email });
};

// Xác nhận đặt lại mật khẩu
export const confirmPasswordReset = (resetData) => {
  return api.post("/auth/password-reset-confirm/", resetData);
};

// Refresh token
export const refreshToken = (refreshToken) => {
  return api.post("/auth/token/refresh/", { refresh: refreshToken });
};

// Đăng xuất
export const logout = (refreshToken) => {
  return api.post("/auth/logout/", { refresh: refreshToken });
};

// Quản lý token - lưu vào localStorage
export const setAuthTokens = (tokens) => {
  localStorage.setItem("accessToken", tokens.access);
  localStorage.setItem("refreshToken", tokens.refresh);
};

// Lấy access token
export const getAccessToken = () => {
  return localStorage.getItem("accessToken");
};

// Lấy refresh token
export const getRefreshToken = () => {
  return localStorage.getItem("refreshToken");
};

// Xóa tokens khi đăng xuất
export const removeAuthTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};
