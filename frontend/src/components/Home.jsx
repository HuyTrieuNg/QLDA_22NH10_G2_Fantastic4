import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import reactLogo from "../assets/react.svg";
import viteLogo from "/vite.svg";
import "../index.css";

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra token trong localStorage
    const accessToken = localStorage.getItem("accessToken");
    setIsLoggedIn(!!accessToken);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userData");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800 dark:text-white p-6 md:p-12">
      <div className="max-w-5xl mx-auto backdrop-blur bg-white/80 dark:bg-slate-800/80 rounded-3xl shadow-2xl p-8 md:p-14 border border-gray-200 dark:border-slate-700">
        <header className="mb-12">
          <div className="flex justify-center gap-x-10 gap-y-4 flex-wrap mb-8">
            <a
              href="https://vite.dev"
              target="_blank"
              className="transition-transform duration-300 hover:scale-110"
            >
              <div className="p-5 bg-white dark:bg-slate-700 rounded-2xl shadow-xl">
                <img src={viteLogo} className="h-16" alt="Vite logo" />
              </div>
            </a>
            <a
              href="https://react.dev"
              target="_blank"
              className="transition-transform duration-300 hover:scale-110"
            >
              <div className="p-5 bg-white dark:bg-slate-700 rounded-2xl shadow-xl">
                <img
                  src={reactLogo}
                  className="h-16 animate-spin-slow"
                  alt="React logo"
                />
              </div>
            </a>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-balance text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 leading-tight py-6 md:py-8">
            Hệ thống học trực tuyến
          </h1>
        </header>

        <div className="text-center mb-10">
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Chào mừng bạn đến với nền tảng học trực tuyến hiện đại. Kết nối giáo
            viên và học sinh để tạo ra trải nghiệm học tập tốt nhất.
          </p>
        </div>

        {isLoggedIn ? (
          <div className="flex justify-center max-w-3xl mx-auto mb-6">
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white text-center font-semibold py-4 px-8 rounded-2xl shadow-xl transition-transform duration-300 hover:scale-105 focus:ring-4 focus:ring-opacity-50 focus:ring-red-300"
            >
              Đăng xuất
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-6">
            <Link
              to="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white text-center font-semibold py-4 px-8 rounded-2xl shadow-xl transition-transform duration-300 hover:scale-105 focus:ring-4 focus:ring-opacity-50 focus:ring-blue-300"
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-center font-semibold py-4 px-8 rounded-2xl shadow-xl transition-transform duration-300 hover:scale-105 focus:ring-4 focus:ring-emerald-300 focus:ring-opacity-50"
            >
              Đăng ký
            </Link>
          </div>
        )}

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg">
            <div className="text-indigo-600 dark:text-indigo-400 text-4xl mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-12 w-12"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
              Khóa học phong phú
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Truy cập vào kho nội dung học tập đa dạng với nhiều chủ đề khác
              nhau.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg">
            <div className="text-indigo-600 dark:text-indigo-400 text-4xl mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-12 w-12"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
              Theo dõi tiến độ
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Giáo viên có thể theo dõi tiến độ học tập và hỗ trợ học sinh một
              cách hiệu quả.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg">
            <div className="text-indigo-600 dark:text-indigo-400 text-4xl mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-12 w-12"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
              Tương tác trực tuyến
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Trao đổi, thảo luận và nhận phản hồi trực tiếp từ giáo viên và bạn
              học.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
