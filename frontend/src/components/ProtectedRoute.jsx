import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";

// ProtectedRoute component checks if user is authenticated
const ProtectedRoute = () => {
  const location = useLocation();

  // Check if user is authenticated by looking for the access token in localStorage
  const isAuthenticated = !!localStorage.getItem("accessToken");

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
