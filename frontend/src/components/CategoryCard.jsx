import React from "react";
import { useNavigate } from "react-router-dom";

const CategoryCard = ({ name, icon, onClick }) => {
  const navigate = useNavigate();
  const handleClick = () => {
    if (onClick) {
      onClick(name);
    } else {
      // Default: chuyển hướng sang trang course list với query string
      navigate(`/student/courses?category=${encodeURIComponent(name)}`);
    }
  };
  return (
    <button
      onClick={handleClick}
      className="bg-gray-200 dark:bg-gray-700 p-6 rounded-lg text-center hover:shadow-lg hover:bg-gray-300 dark:hover:bg-indigo-800 transition-all duration-300 transform hover:-translate-y-1 shadow w-full"
      type="button"
    >
      <div className="text-indigo-700 dark:text-indigo-200 flex justify-center mb-4 text-3xl">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-800 dark:text-white truncate text-base">
        {name}
      </h3>
    </button>
  );
};

export default CategoryCard;
