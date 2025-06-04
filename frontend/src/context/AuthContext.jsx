import React, { createContext, useContext, useState, useEffect } from "react";
import { getUserProfile, isAuthenticated } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check authentication status and get user profile
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // First check if user has a token
        if (!isAuthenticated()) {
          setCurrentUser(null);
          setUserRole(null);
          setIsLoading(false);
          return;
        }

        // User has a token, get profile information
        const response = await getUserProfile();
        setCurrentUser(response.data);

        // Set user role
        const userType =
          response.data.user_type || response.data.profile?.user_type;
        setUserRole(userType);

        // Store user type in local storage for quicker checks
        if (userType) {
          localStorage.setItem("userType", userType);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setAuthError(error);
        setCurrentUser(null);
        setUserRole(null);

        // If the error is due to unauthorized access, clear tokens
        if (error.response?.status === 401) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("userType");
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();

    // Listen for storage changes to sync auth state across tabs
    const handleStorageChange = (e) => {
      if (
        e.key === "accessToken" ||
        e.key === "refreshToken" ||
        e.key === "userType"
      ) {
        checkAuthStatus();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Function to manually refresh auth status
  const refreshAuthStatus = async () => {
    setIsLoading(true);
    try {
      if (!isAuthenticated()) {
        setCurrentUser(null);
        setUserRole(null);
        return false;
      }

      const response = await getUserProfile();
      setCurrentUser(response.data);

      const userType =
        response.data.user_type || response.data.profile?.user_type;
      setUserRole(userType);

      if (userType) {
        localStorage.setItem("userType", userType);
      }

      return true;
    } catch (error) {
      console.error("Error refreshing auth status:", error);
      setAuthError(error);
      setCurrentUser(null);
      setUserRole(null);

      if (error.response?.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userType");
      }

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to check if user is admin
  const isAdmin = () => userRole === "admin";

  // Function to check if user is teacher
  const isTeacher = () => userRole === "teacher";

  // Function to check if user is student
  const isStudent = () => userRole === "student";

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userRole,
        isLoading,
        authError,
        refreshAuthStatus,
        isAdmin,
        isTeacher,
        isStudent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
