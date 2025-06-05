import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    // Reset to light mode for all users (remove this after deployment)
    const themeVersion = localStorage.getItem("themeVersion");
    if (themeVersion !== "1.0") {
      localStorage.removeItem("darkMode");
      localStorage.setItem("themeVersion", "1.0");
    }

    // Check localStorage first, then default to light mode
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) {
      return JSON.parse(saved);
    }
    // Default to light mode (false)
    return false;
  });

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem("darkMode", JSON.stringify(darkMode));

    // Update document class
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const value = {
    darkMode,
    toggleDarkMode,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
