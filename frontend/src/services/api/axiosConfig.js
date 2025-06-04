import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
  removeAuthTokens,
} from "../authService";

// Tạo instance axios với cấu hình mặc định
const api = axios.create({
  baseURL: "http://localhost:8000/api", // URL của backend API - không kết thúc với dấu /
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // timeout 10 giây
});

// Interceptor cho request
api.interceptors.request.use(
  (config) => {
    // Thêm token vào header nếu có
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor cho response
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 (Unauthorized) và chưa retry
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Thử refresh token
        const refreshToken = getRefreshToken();

        if (!refreshToken) {
          // Không có refresh token, đưa người dùng về trang đăng nhập
          removeAuthTokens();
          window.location.href = "/login";
          return Promise.reject(error);
        }

        // Gọi API refresh token
        const response = await axios.post("/api/auth/token/refresh/", {
          refresh: refreshToken,
        });

        // Lưu token mới
        const { access, refresh } = response.data;
        setAuthTokens({ access, refresh });

        // Thử lại request ban đầu với token mới
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Nếu refresh token cũng hết hạn, đưa người dùng về trang đăng nhập
        removeAuthTokens();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
