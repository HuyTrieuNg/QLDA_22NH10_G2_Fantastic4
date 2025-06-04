import React from "react";
import { Link } from "react-router-dom";
import { Star, Users } from "lucide-react";

const FeaturedCourseCard = ({ course }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
    <div className="relative">
      <img
        src={
          course.image_url ||
          course.thumbnail ||
          "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
        }
        alt={course.title}
        className="w-full h-48 object-cover"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src =
            "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80";
        }}
      />
      <div className="absolute top-2 right-2 bg-indigo-600 text-white px-2 py-1 text-xs font-bold rounded">
        {course.category || "Khác"}
      </div>
    </div>
    <div className="p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 h-14">
        {course.title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
        Giảng viên:{" "}
        {course.teacher_name || course.instructor || "Đội ngũ giảng viên"}
      </p>
      <div className="flex items-center mb-4">
        <div className="flex text-yellow-400">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={16}
              fill={
                i < Math.floor(course.rating || 4.5) ? "currentColor" : "none"
              }
              stroke="currentColor"
            />
          ))}
        </div>
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
          ({course.rating || 4.5})
        </span>
        <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
        <span className="flex items-center text-sm text-gray-600 dark:text-gray-300">
          <Users size={14} className="mr-1" />
          {course.student_count || course.students || 0}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
          {course.price ? `${course.price}đ` : "Miễn phí"}
        </span>
        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 text-xs font-medium rounded">
          {course.level || "Cơ bản"}
        </span>
      </div>
    </div>
    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600">
      <Link
        to={`/student/courses/${course.id}`}
        className="block w-full text-center py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-300"
      >
        Xem chi tiết
      </Link>
    </div>
  </div>
);

export default FeaturedCourseCard;
