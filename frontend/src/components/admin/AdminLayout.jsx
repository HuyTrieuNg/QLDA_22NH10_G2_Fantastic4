import React, { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import {
  FiUsers,
  FiBook,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiHome,
  FiBarChart2,
  FiList,
  FiClock,
} from "react-icons/fi";
import { logout, getRefreshToken } from "../../services/authService";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const refreshToken = getRefreshToken();
      await logout(refreshToken);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      toast.success("Đăng xuất thành công");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Đã xảy ra lỗi khi đăng xuất");
    }
  };

  const menuItems = [
    {
      path: "/admin/dashboard",
      icon: <FiHome size={20} />,
      label: "Dashboard",
    },
    {
      path: "/admin/users",
      icon: <FiUsers size={20} />,
      label: "Quản lý người dùng",
    },
    {
      path: "/admin/courses",
      icon: <FiBook size={20} />,
      label: "Quản lý khóa học",
    },
    {
      path: "/admin/system",
      icon: <FiSettings size={20} />,
      label: "Cấu hình hệ thống",
    },
    {
      path: "/admin/audit-logs",
      icon: <FiClock size={20} />,
      label: "Nhật ký hệ thống",
    },
  ];

  // Styles for active nav link
  const activeNavClass = "bg-blue-700 text-white";
  const inactiveNavClass =
    "text-white hover:bg-blue-800 transition duration-150";

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-blue-600 overflow-y-auto transition duration-300 lg:translate-x-0 lg:static lg:inset-auto ${
          sidebarOpen ? "translate-x-0 ease-out" : "-translate-x-full ease-in"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center">
            <FiBarChart2 className="h-8 w-8 text-white" />
            <span className="text-white text-xl font-semibold ml-3">
              Admin Panel
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white focus:outline-none"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="mt-8 px-3">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg ${
                    isActive ? activeNavClass : inactiveNavClass
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </NavLink>
            ))}

            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 rounded-lg text-white hover:bg-blue-800 transition duration-150"
            >
              <FiLogOut size={20} />
              <span className="ml-3">Đăng xuất</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 focus:outline-none"
            >
              <FiMenu size={24} />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">Admin Panel</h1>
            <div>
              <Link to="/" className="text-blue-600 hover:underline">
                Trở về trang chủ
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
