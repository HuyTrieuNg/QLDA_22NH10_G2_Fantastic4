import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Search, BookOpen, Users } from "lucide-react";
import studentService from "../../services/studentService";
import { categories } from "../../constants/categories";

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [activeCategory, setActiveCategory] = useState("");

  useEffect(() => {
    fetchCourses();
  }, [selectedCategory]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory) {
        params.category = selectedCategory;
      }
      const response = await studentService.getAllCourses(params);
      setCourses(response.data);
    } catch (error) {
      toast.error("Không thể tải danh sách khóa học");
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const params = { search: searchTerm };
      if (selectedCategory) {
        params.category = selectedCategory;
      }
      const response = await studentService.getAllCourses(params);
      setCourses(response.data);
    } catch (error) {
      toast.error("Lỗi khi tìm kiếm khóa học");
      console.error("Error searching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setActiveCategory(e.target.value);
  };

  const handleCategoryButton = (cat) => {
    if (activeCategory === cat) {
      setSelectedCategory("");
      setActiveCategory("");
    } else {
      setSelectedCategory(cat);
      setActiveCategory(cat);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Khám phá khóa học
        </h1>

        {/* Search and filter */}
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <form onSubmit={handleSearch} className="flex w-full sm:w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm khóa học..."
              className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <Search size={20} />
            </button>
          </form>
          {/* Danh mục dạng select thay cho list */}
          <select
            value={activeCategory}
            onChange={(e) => handleCategoryButton(e.target.value)}
            className="w-48 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
          >
            <option value="">Tất cả</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookOpen size={64} className="text-gray-400 mb-4" />
          <h2 className="text-xl font-medium text-gray-600 dark:text-gray-300 mb-2">
            Không tìm thấy khóa học nào
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Hãy thử tìm kiếm với từ khóa khác hoặc xem tất cả các khóa học
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("");
              fetchCourses();
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Xem tất cả khóa học
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link
              key={course.id}
              to={`/student/courses/${course.id}`}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="aspect-video w-full overflow-hidden bg-gray-200 dark:bg-slate-700">
                {course.thumbnail ? (
                  <img
                    src={
                      course.thumbnail.startsWith("http")
                        ? course.thumbnail
                        : `http://localhost:8000${course.thumbnail}`
                    }
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-slate-700">
                    <BookOpen size={48} className="text-gray-400" />
                  </div>
                )}
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 rounded-md">
                    {course.category || "Khác"}
                  </span>
                  {course.is_enrolled && (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-md">
                      Đã đăng ký
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-xl text-gray-800 dark:text-white line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                  {course.subtitle || "Không có mô tả"}
                </p>
                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Users size={16} className="mr-1" />
                    <span>{course.student_count} học viên</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <BookOpen size={16} className="mr-1" />
                    <span>{course.lesson_count} bài học</span>
                  </div>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {course.price ? `$${course.price}` : "Miễn phí"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseList;
