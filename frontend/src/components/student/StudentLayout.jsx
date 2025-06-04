import React from "react";
import { Outlet } from "react-router-dom";
import StudentHeader from "./StudentHeader";

const StudentLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900">
      <StudentHeader />
      <main className="flex-1 container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <footer className="bg-white dark:bg-slate-800 shadow-inner py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} E-Learning Platform. Tất cả quyền được
            bảo lưu.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default StudentLayout;
