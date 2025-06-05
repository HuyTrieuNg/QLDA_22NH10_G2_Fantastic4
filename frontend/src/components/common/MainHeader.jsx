import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  User,
  ChevronDown,
  Menu,
  X,
  BookOpen,
  Bookmark,
  Clock,
  LogOut,
} from "lucide-react";
import DarkModeToggle from "../common/DarkModeToggle";

const MainHeader = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("accessToken")
  );
  const [userData, setUserData] = useState({});
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("accessToken"));
    if (localStorage.getItem("userData")) {
      setUserData(JSON.parse(localStorage.getItem("userData")));
    }
  }, []);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userData");
    setIsLoggedIn(false);
    setProfileDropdown(false);
    navigate("/login");
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and nav */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <GraduationCap className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              <span className="ml-2 text-xl font-bold text-gray-800 dark:text-white">
                EduLearn
              </span>
            </Link>
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
              <Link
                to="/"
                className="px-3 py-2 text-gray-700 dark:text-gray-300 font-medium hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                Trang chủ
              </Link>
              <Link
                to="/student/courses"
                className="px-3 py-2 text-gray-700 dark:text-gray-300 font-medium hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                Khóa học
              </Link>
              {!isLoggedIn && (
                <>
                  <Link
                    to="/about"
                    className="px-3 py-2 text-gray-700 dark:text-gray-300 font-medium hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    Giới thiệu
                  </Link>
                  <Link
                    to="/contact"
                    className="px-3 py-2 text-gray-700 dark:text-gray-300 font-medium hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    Liên hệ
                  </Link>
                  <Link
                    to="/faq"
                    className="px-3 py-2 text-gray-700 dark:text-gray-300 font-medium hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    Hỏi đáp
                  </Link>
                </>
              )}
              {isLoggedIn && (
                <>
                  <Link
                    to="/student/my-courses"
                    className="px-3 py-2 text-gray-700 dark:text-gray-300 font-medium hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    Khóa học của tôi
                  </Link>
                  <Link
                    to="/student/quiz-history"
                    className="px-3 py-2 text-gray-700 dark:text-gray-300 font-medium hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    Lịch sử làm bài
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center">
            <DarkModeToggle />
            {/* Avatar & Dropdown */}
            {isLoggedIn ? (
              <div className="ml-4 relative" ref={profileRef}>
                <button
                  onClick={() => setProfileDropdown((open) => !open)}
                  className="flex items-center text-sm font-medium text-gray-700 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none"
                >
                  <div className="h-8 w-8 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white mr-2">
                    <User size={16} />
                  </div>
                  <span className="hidden md:block">
                    {userData.username || "Tài khoản"}
                  </span>
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                {profileDropdown && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-40">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setProfileDropdown(false)}
                    >
                      Hồ sơ cá nhân
                    </Link>
                    <Link
                      to="/student/my-courses"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setProfileDropdown(false)}
                    >
                      Khóa học của tôi
                    </Link>
                    <Link
                      to="/student/quiz-history"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setProfileDropdown(false)}
                    >
                      Lịch sử làm bài
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="md:flex space-x-4 ml-4 hidden">
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 dark:text-indigo-400 dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                  Đăng ký
                </Link>
              </div>
            )}
            {/* Mobile menu button */}
            <button
              className="ml-2 md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pt-2 pb-3 border-t border-gray-200 dark:border-gray-700">
            <div className="px-2 space-y-1">
              <Link
                to="/"
                className="block px-3 py-2 rounded-md text-base font-medium text-indigo-600 dark:text-indigo-400 bg-gray-50 dark:bg-gray-700"
              >
                Trang chủ
              </Link>
              <Link
                to="/student/courses"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Khóa học
              </Link>
              {!isLoggedIn && (
                <>
                  <Link
                    to="/about"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Giới thiệu
                  </Link>
                  <Link
                    to="/contact"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Liên hệ
                  </Link>
                  <Link
                    to="/faq"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Hỏi đáp
                  </Link>
                </>
              )}
              {isLoggedIn && (
                <>
                  <Link
                    to="/student/my-courses"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Khóa học của tôi
                  </Link>
                  <Link
                    to="/student/quiz-history"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Lịch sử làm bài
                  </Link>
                </>
              )}
              {!isLoggedIn && (
                <div className="px-3 py-2 space-y-2">
                  <Link
                    to="/login"
                    className="block text-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="block text-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 dark:text-indigo-400 dark:bg-gray-800 dark:hover:bg-gray-700"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
              {isLoggedIn && (
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Đăng xuất
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default MainHeader;
