// import axios from "axios";

// // Cấu hình mặc định cho axios
// const axiosInstance = axios.create({
//   baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/",
//   timeout: 15000,
//   headers: {
//     "Content-Type": "application/json",
//     Accept: "application/json",
//   },
// });

// // Interceptor xử lý request trước khi gửi đi
// axiosInstance.interceptors.request.use(
//   (config) => {
//     // Lấy token từ localStorage (nếu có)
//     const token = localStorage.getItem("accessToken");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Interceptor xử lý response
// axiosInstance.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     // Xử lý lỗi tùy thuộc vào response code
//     if (error.response) {
//       // Nếu token hết hạn (401)
//       if (error.response.status === 401) {
//         localStorage.removeItem("accessToken");
//         // Chuyển hướng đến trang đăng nhập nếu cần
//         // window.location.href = '/login';
//       }

//       // Xử lý các lỗi khác (400, 403, 404, 500...)
//       console.error("API Error:", error.response.data);
//     } else if (error.request) {
//       // Không nhận được response
//       console.error("No response received:", error.request);
//     } else {
//       // Lỗi trong quá trình thiết lập request
//       console.error("Error setting up request:", error.message);
//     }

//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;
