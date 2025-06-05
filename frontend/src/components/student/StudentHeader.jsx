import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  User,
  LogOut,
  Bookmark,
  Home,
  Clock,
  BookOpen,
  GraduationCap,
  X,
  ChevronDown,
} from "lucide-react";
import DarkModeToggle from "../common/DarkModeToggle";

const StudentHeader = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");

  // Ref cho 2 menu để detect click ngoài
  const menuRef = useRef(null);
  const profileRef = useRef(null);

  const toggleMenu = () => {
    setIsOpen((prev) => {
      // Nếu menu sắp mở thì đóng profile
      if (!prev) setProfileDropdown(false);
      return !prev;
    });
  };

  const toggleProfile = () => {
    setProfileDropdown((prev) => {
      // Nếu profile sắp mở thì đóng menu
      if (!prev) setIsOpen(false);
      return !prev;
    });
  };

  // Đóng dropdown nếu click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userData");
    navigate("/login");
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and navigation */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <GraduationCap className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                <span className="ml-2 text-xl font-bold text-gray-800 dark:text-white">
                  EduLearn
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
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
            </nav>
          </div>

          {/* Right side - Dark mode toggle, User profile, Mobile menu button */}
          <div className="flex items-center">
            {/* Dark Mode Toggle */}
            <DarkModeToggle />

            {/* Profile Dropdown */}
            <div className="ml-4 relative" ref={profileRef}>
              <button
                onClick={toggleProfile}
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

              {/* Profile Dropdown Menu */}
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

            {/* Mobile Menu Button */}
            <button
              className="ml-2 md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              onClick={toggleMenu}
            >
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden pt-2 pb-3 border-t border-gray-200 dark:border-gray-700">
          <div className="px-2 space-y-1">
            <Link
              to="/"
              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              <Home className="w-4 h-4 mr-3" />
              Trang chủ
            </Link>
            <Link
              to="/student/courses"
              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              <BookOpen className="w-4 h-4 mr-3" />
              Khóa học
            </Link>
            <Link
              to="/student/my-courses"
              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              <Bookmark className="w-4 h-4 mr-3" />
              Khóa học của tôi
            </Link>
            <Link
              to="/student/quiz-history"
              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              <Clock className="w-4 h-4 mr-3" />
              Lịch sử làm bài
            </Link>

            {/* User menu items */}
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center px-3 pb-3">
                <div className="h-8 w-8 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white">
                  <User size={16} />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800 dark:text-white">
                    {userData.username || "Tài khoản"}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {userData.email || "user@example.com"}
                  </div>
                </div>
              </div>

              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <User className="w-4 h-4 mr-3" />
                Hồ sơ cá nhân
              </Link>

              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default StudentHeader;
