import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { BookOpen, Calendar, Clock, CheckCircle, Users } from "lucide-react";
import studentService from "../../services/studentService";

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  // Check if user is logged in
  const isLoggedIn = !!localStorage.getItem("accessToken");

  const fetchCourseDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await studentService.getCourseDetail(courseId);
      setCourse(response.data);
    } catch (error) {
      toast.error("Không thể tải thông tin khóa học");
      console.error("Error fetching course:", error);
      if (error.response && error.response.status === 404) {
        navigate("/student/courses");
      }
    } finally {
      setLoading(false);
    }
  }, [courseId, navigate]);

  useEffect(() => {
    fetchCourseDetail();
  }, [fetchCourseDetail]);

  const handleEnroll = async () => {
    if (!isLoggedIn) {
      toast.error("Vui lòng đăng nhập để đăng ký khóa học");
      navigate("/login", { state: { from: `/student/courses/${courseId}` } });
      return;
    }

    try {
      setEnrolling(true);
      await studentService.enrollCourse(courseId);
      toast.success("Đăng ký khóa học thành công!");
      fetchCourseDetail(); // Refresh data to update enrollment status
    } catch (error) {
      toast.error(error.response?.data?.detail || "Đăng ký khóa học thất bại");
      console.error("Error enrolling:", error);
    } finally {
      setEnrolling(false);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Không tìm thấy khóa học
        </h2>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Course Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3">
            <div className="aspect-video w-full overflow-hidden bg-gray-200 dark:bg-slate-700">
              {course.thumbnail ? (
                <img
                  src={
                    course.thumbnail.startsWith("http")
                      ? course.thumbnail
                      : `http://localhost:8000${course.thumbnail}`
                  }
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen size={64} className="text-gray-400" />
                </div>
              )}
            </div>
          </div>
          <div className="p-6 md:w-2/3 space-y-4">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 rounded-full">
                {course.category || "Khác"}
              </span>
              {course.is_enrolled && (
                <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                  Đã đăng ký
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              {course.title}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {course.subtitle}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <Calendar className="mr-2" size={20} />
                <span>
                  Cập nhật:{" "}
                  {course.last_updated_at
                    ? formatDate(course.last_updated_at)
                    : "Chưa có"}
                </span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <BookOpen className="mr-2" size={20} />
                <span>{course.lesson_count} bài học</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <Users className="mr-2" size={20} />
                <span>{course.student_count} học viên đã đăng ký</span>
              </div>
              {course.quiz_count !== undefined && (
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <CheckCircle className="mr-2" size={20} />
                  <span>{course.quiz_count} bài kiểm tra</span>
                </div>
              )}
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {course.price ? `${course.price}$` : "Miễn phí"}
              </div>

              {!course.is_enrolled ? (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className={`px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    enrolling ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                >
                  {enrolling ? "Đang đăng ký..." : "Đăng ký ngay"}
                </button>
              ) : (
                <button
                  onClick={() => navigate("/student/my-courses")}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <CheckCircle className="inline-block mr-2" size={20} />
                  Đã đăng ký
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Course Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Mô tả khóa học
            </h2>
            <div className="prose max-w-none dark:prose-invert dark:text-gray-300">
              <p>{course.description}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Nội dung khóa học
            </h2>

            {course.sections && course.sections.length > 0 ? (
              <div className="space-y-4">
                {course.sections.map((section) => (
                  <div
                    key={section.id}
                    className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden"
                  >
                    <div className="bg-gray-100 dark:bg-slate-700 px-4 py-3">
                      <h3 className="font-semibold text-gray-800 dark:text-white">
                        {section.title}
                      </h3>
                    </div>

                    <div className="divide-y divide-gray-200 dark:divide-slate-700">
                      {section.lessons &&
                        section.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className={`px-4 py-3 flex items-center justify-between ${
                              course.is_enrolled
                                ? "hover:bg-gray-50 dark:hover:bg-slate-700/60 cursor-pointer"
                                : "opacity-75"
                            }`}
                            onClick={() =>
                              course.is_enrolled
                                ? navigate(`/student/lessons/${lesson.id}`)
                                : toast.error(
                                    "Vui lòng đăng ký khóa học để xem bài giảng"
                                  )
                            }
                          >
                            <div className="flex items-center">
                              {lesson.video_url ? (
                                <Clock
                                  className="mr-3 text-indigo-500"
                                  size={18}
                                />
                              ) : (
                                <BookOpen
                                  className="mr-3 text-indigo-500"
                                  size={18}
                                />
                              )}
                              <span className="text-gray-700 dark:text-gray-300">
                                {lesson.title}
                              </span>
                            </div>
                            {!course.is_enrolled && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Khóa
                              </span>
                            )}
                          </div>
                        ))}
                    </div>
                    {/* Quizzes for this section */}
                    {section.quizzes && section.quizzes.length > 0 && (
                      <div className="bg-blue-50 dark:bg-blue-900/30 border-t border-blue-100 dark:border-blue-800 px-4 py-3">
                        <div className="font-medium text-blue-700 dark:text-blue-200 mb-2">
                          Bài kiểm tra
                        </div>
                        <ul className="space-y-2">
                          {section.quizzes.map((quiz) => (
                            <li
                              key={quiz.id}
                              className="flex items-center justify-between gap-2"
                            >
                              <div className="flex items-center gap-2">
                                <CheckCircle
                                  className="text-blue-500"
                                  size={18}
                                />
                                <span className="text-gray-800 dark:text-gray-100">
                                  {quiz.title}
                                </span>
                              </div>
                              {course.is_enrolled && (
                                <div className="flex gap-2 ml-auto">
                                  <button
                                    className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                                    onClick={() =>
                                      navigate(`/student/quizzes/${quiz.id}`)
                                    }
                                  >
                                    Làm bài
                                  </button>
                                  <button
                                    className="px-3 py-1 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-slate-600 text-sm"
                                    onClick={() =>
                                      navigate(
                                        `/student/quizzes/${quiz.id}/history`
                                      )
                                    }
                                  >
                                    Xem lịch sử
                                  </button>
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                Chưa có nội dung cho khóa học này.
              </p>
            )}
          </div>
        </div>

        {/* Enrollment Card */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 sticky top-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Tham gia khóa học
            </h3>

            <ul className="space-y-4 mb-6">
              <li className="flex items-start">
                <CheckCircle className="text-green-500 mr-2" size={20} />
                <span className="text-gray-700 dark:text-gray-300">
                  Truy cập {course.lesson_count} bài giảng
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-green-500 mr-2" size={20} />
                <span className="text-gray-700 dark:text-gray-300">
                  Học ở mọi lúc, mọi nơi
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-green-500 mr-2" size={20} />
                <span className="text-gray-700 dark:text-gray-300">
                  Giảng viên có kinh nghiệm
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-green-500 mr-2" size={20} />
                <span className="text-gray-700 dark:text-gray-300">
                  Truy cập không giới hạn
                </span>
              </li>
            </ul>

            <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Giá:</span>
                <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                  {course.price ? `${course.price}$` : "Miễn phí"}
                </span>
              </div>

              {!course.is_enrolled ? (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className={`w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    enrolling ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                >
                  {enrolling ? "Đang đăng ký..." : "Đăng ký ngay"}
                </button>
              ) : (
                <button
                  onClick={() => navigate("/student/my-courses")}
                  className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <CheckCircle className="inline-block mr-2" size={20} />
                  Đã đăng ký
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
