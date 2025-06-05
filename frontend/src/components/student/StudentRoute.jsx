import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const StudentRoute = () => {
  const { isStudent, isLoading: authLoading, currentUser } = useAuth();

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated but not student, redirect to home page
  if (!isStudent()) {
    return <Navigate to="/" replace />;
  }

  // If student, render the child routes
  return <Outlet />;
};

export default StudentRoute;
