import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { BookOpen, CheckCircle, Clock } from "lucide-react";
import studentService from "../../services/studentService";
import { categories } from "../../constants/categories";

const EnrolledCourses = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      const response = await studentService.getEnrolledCourses();
      setEnrolledCourses(response.data);
    } catch (error) {
      toast.error("Không thể tải danh sách khóa học đã đăng ký");
      console.error("Error fetching enrolled courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
        Khóa học của tôi
      </h1>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : enrolledCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookOpen size={64} className="text-gray-400 mb-4" />
          <h2 className="text-xl font-medium text-gray-600 dark:text-gray-300 mb-2">
            Bạn chưa đăng ký khóa học nào
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Khám phá các khóa học hấp dẫn và bắt đầu học ngay hôm nay
          </p>
          <Link
            to="/student/courses"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Khám phá khóa học
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {enrolledCourses.map((enrollment) => (
            <div
              key={enrollment.id}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden"
            >
              <div className="md:flex">
                <div className="md:w-1/4">
                  <div className="aspect-video w-full overflow-hidden bg-gray-200 dark:bg-slate-700">
                    {enrollment.course.thumbnail ? (
                      <img
                        src={
                          enrollment.course.thumbnail.startsWith("http")
                            ? enrollment.course.thumbnail
                            : `http://localhost:8000${enrollment.course.thumbnail}`
                        }
                        alt={enrollment.course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen size={48} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-6 md:w-3/4 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="mb-2">
                        <span className="px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 rounded-full">
                          {enrollment.course.category || "Khác"}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                        {enrollment.course.title}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">
                        {enrollment.course.subtitle}
                      </p>
                    </div>
                    <Link
                      to={`/student/courses/${enrollment.course.id}`}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                    >
                      Xem chi tiết
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center">
                      <BookOpen size={16} className="mr-2" />
                      <span>{enrollment.course.lesson_count} bài học</span>
                    </div>
                    {typeof enrollment.course.quiz_count === "number" && (
                      <div className="flex items-center">
                        <CheckCircle size={16} className="mr-2" />
                        <span>{enrollment.course.quiz_count} bài kiểm tra</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Clock size={16} className="mr-2" />
                      <span>Đăng ký: {formatDate(enrollment.enrolled_at)}</span>
                    </div>
                  </div>

                  {/* Progress calculation: lessons + quizzes */}
                  <div className="mt-6">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tiến độ học tập
                      </span>
                      <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                        {(() => {
                          const lessonCount =
                            enrollment.course.lesson_count || 0;
                          const quizCount =
                            typeof enrollment.course.quiz_count === "number"
                              ? enrollment.course.quiz_count
                              : 0;
                          const total = lessonCount + quizCount;
                          // If backend progress is already correct, just show it. Otherwise, fallback to old logic.
                          return total > 0
                            ? `${Math.round(enrollment.progress)}%`
                            : `${Math.round(enrollment.progress)}%`;
                        })()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full"
                        style={{ width: `${Math.round(enrollment.progress)}%` }}
                      ></div>
                    </div>
                  </div>

                  {enrollment.progress === 100 && (
                    <div className="mt-4 flex items-center text-green-600 dark:text-green-400">
                      <CheckCircle size={16} className="mr-2" />
                      <span className="text-sm font-medium">
                        Đã hoàn thành khóa học
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnrolledCourses;
