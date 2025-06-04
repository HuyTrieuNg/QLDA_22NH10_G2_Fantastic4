import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, User, LogOut, Bookmark, Home } from "lucide-react";

const StudentHeader = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);
  const [profileDropdown, setProfileDropdown] = React.useState(false);

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (profileDropdown) setProfileDropdown(false);
  };

  const toggleProfile = () => {
    setProfileDropdown(!profileDropdown);
    if (isOpen) setIsOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userData");
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-md dark:bg-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="text-2xl font-bold text-indigo-600 dark:text-indigo-400"
            >
              E-Learning
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-white transition"
            >
              <Home className="inline-block mr-1" size={18} />
              Trang chủ
            </Link>
            <Link
              to="/student/courses"
              className="text-gray-700 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-white transition"
            >
              Khóa học
            </Link>
            <Link
              to="/student/my-courses"
              className="text-gray-700 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-white transition"
            >
              <Bookmark className="inline-block mr-1" size={18} />
              Khóa học của tôi
            </Link>
          </nav>

          {/* User Profile & Mobile Menu Button */}
          <div className="flex items-center">
            {/* Profile Dropdown */}
            <div className="relative ml-3">
              <button
                onClick={toggleProfile}
                className="flex items-center space-x-2 text-gray-700 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none"
              >
                <span className="text-sm font-medium hidden sm:block">
                  {userData.username || "Tài khoản"}
                </span>
                <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                  <User size={16} />
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-700 rounded-md shadow-lg z-50 py-1">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-100 dark:hover:bg-slate-600"
                    onClick={() => setProfileDropdown(false)}
                  >
                    Hồ sơ
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-100 dark:hover:bg-slate-600"
                  >
                    <LogOut className="inline-block mr-2" size={16} />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden ml-4">
              <button
                onClick={toggleMenu}
                className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="md:hidden py-3 border-t border-gray-200 dark:border-slate-700">
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-slate-700 rounded-md"
                onClick={toggleMenu}
              >
                <Home className="inline-block mr-2" size={18} />
                Trang chủ
              </Link>
              <Link
                to="/student/courses"
                className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-slate-700 rounded-md"
                onClick={toggleMenu}
              >
                Khóa học
              </Link>
              <Link
                to="/student/my-courses"
                className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-slate-700 rounded-md"
                onClick={toggleMenu}
              >
                <Bookmark className="inline-block mr-2" size={18} />
                Khóa học của tôi
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default StudentHeader;
