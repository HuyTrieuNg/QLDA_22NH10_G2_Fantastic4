import React from "react";
import { Link } from "react-router-dom";

const CategoryCard = ({ name, icon }) => (
  <Link
    to={
      name === "Tất cả"
        ? "/student/courses"
        : `/student/courses?category=${encodeURIComponent(name)}`
    }
    className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg text-center hover:shadow-md hover:bg-indigo-50 dark:hover:bg-gray-600 transition-all duration-300 transform hover:-translate-y-1"
  >
    <div className="text-indigo-600 dark:text-indigo-400 flex justify-center mb-4">
      {icon}
    </div>
    <h3 className="font-medium text-gray-900 dark:text-white truncate">
      {name}
    </h3>
  </Link>
);

export default CategoryCard;
