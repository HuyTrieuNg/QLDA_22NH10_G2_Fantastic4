import React, { useState, useEffect } from "react";
import {
  getCourses,
  deleteCourse,
  getCourseStats,
  getCourseContent,
} from "../../../services/adminService";
import DataTable from "../common/DataTable";
import Modal from "../common/Modal";
import { toast } from "react-hot-toast";
import {
  FiPlus,
  FiBarChart2,
  FiUsers,
  FiBookOpen,
  FiFile,
  FiCheckSquare,
  FiArrowLeft,
} from "react-icons/fi";
import { Link } from "react-router-dom";

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("stats"); // 'stats', 'content', 'delete'
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseStats, setCourseStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [courseContent, setCourseContent] = useState(null);
  const [contentLoading, setContentLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await getCourses();
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Không thể tải danh sách khóa học");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async () => {
    try {
      await deleteCourse(selectedCourse.id);
      toast.success("Khóa học đã được xóa thành công");
      fetchCourses();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error("Không thể xóa khóa học");
    }
  };

  const handleViewStats = async (course) => {
    setSelectedCourse(course);
    setModalMode("stats");
    setIsModalOpen(true);

    try {
      setStatsLoading(true);
      const response = await getCourseStats(course.id);
      setCourseStats(response.data);
    } catch (error) {
      console.error("Error fetching course stats:", error);
      toast.error("Không thể tải thống kê khóa học");
    } finally {
      setStatsLoading(false);
    }
  };

  const handleViewContent = async (course) => {
    setSelectedCourse(course);
    setModalMode("content");
    setIsModalOpen(true);

    try {
      setContentLoading(true);
      const response = await getCourseContent(course.id);
      setCourseContent(response.data);
    } catch (error) {
      console.error("Error fetching course content:", error);
      toast.error("Không thể tải nội dung khóa học");
    } finally {
      setContentLoading(false);
    }
  };

  const handleModalOpen = (mode, course) => {
    setModalMode(mode);
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const columns = [
    {
      key: "title",
      header: "Tên khóa học",
    },
    {
      key: "creator_username",
      header: "Người tạo",
      render: (course) => course.creator_username || "N/A",
    },
    {
      key: "published",
      header: "Trạng thái",
      render: (course) => (
        <span
          className={`px-2 py-1 rounded text-xs font-semibold ${
            course.published
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {course.published ? "Đã xuất bản" : "Chưa xuất bản"}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Ngày tạo",
      render: (course) => new Date(course.created_at).toLocaleDateString(),
    },
    {
      key: "price",
      header: "Giá",
      render: (course) => (course.price ? `${course.price} đ` : "Miễn phí"),
    },
  ];

  const renderStatistics = () => {
    if (!courseStats) return null;

    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">{courseStats.title}</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="font-medium text-gray-700 mb-2">Thông tin chung</h4>
            <table className="min-w-full">
              <tbody>
                <tr>
                  <td className="py-2 text-sm font-medium text-gray-500">
                    Người tạo
                  </td>
                  <td>{courseStats.creator_username || "N/A"}</td>
                </tr>
                <tr>
                  <td className="py-2 text-sm font-medium text-gray-500">
                    Ngày tạo
                  </td>
                  <td>
                    {new Date(courseStats.created_at).toLocaleDateString()}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-sm font-medium text-gray-500">
                    Trạng thái
                  </td>
                  <td>
                    <span
                      className={
                        courseStats.published
                          ? "text-green-600"
                          : "text-yellow-600"
                      }
                    >
                      {courseStats.published ? "Đã xuất bản" : "Chưa xuất bản"}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-sm font-medium text-gray-500">
                    Giá
                  </td>
                  <td>
                    {courseStats.price ? `${courseStats.price} đ` : "Miễn phí"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="font-medium text-gray-700 mb-2">Thống kê</h4>
            <table className="min-w-full">
              <tbody>
                <tr>
                  <td className="py-2 text-sm font-medium text-gray-500">
                    Số học sinh đăng ký
                  </td>
                  <td>{courseStats.statistics?.enrolled_students || 0}</td>
                </tr>
                <tr>
                  <td className="py-2 text-sm font-medium text-gray-500">
                    Số phần học
                  </td>
                  <td>{courseStats.statistics?.sections_count || 0}</td>
                </tr>
                <tr>
                  <td className="py-2 text-sm font-medium text-gray-500">
                    Số bài học
                  </td>
                  <td>{courseStats.statistics?.lessons_count || 0}</td>
                </tr>
                <tr>
                  <td className="py-2 text-sm font-medium text-gray-500">
                    Số bài kiểm tra
                  </td>
                  <td>{courseStats.statistics?.quizzes_count || 0}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow mt-4">
          <h4 className="font-medium text-gray-700 mb-2">Mô tả khóa học</h4>
          <p className="text-gray-600 whitespace-pre-line">
            {courseStats.description || "Không có mô tả"}
          </p>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (!courseContent) return null;

    // Hiển thị chi tiết các phần, bài học, bài kiểm tra nếu có
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">{courseContent.title}</h3>

        {courseContent.sections && courseContent.sections.length > 0 ? (
          <div className="bg-white p-4 rounded-lg shadow mt-4">
            <h4 className="font-medium text-gray-700 mb-2">
              Nội dung khóa học
            </h4>
            <div className="space-y-4">
              {courseContent.sections.map((section, idx) => (
                <div key={section.id || idx} className="border-b pb-2 mb-2">
                  <div className="font-semibold text-blue-700">
                    Phần {idx + 1}: {section.title}
                  </div>
                  {section.lessons && section.lessons.length > 0 && (
                    <div className="ml-4 mt-1">
                      <div className="font-medium text-gray-600">Bài học:</div>
                      <ul className="list-disc ml-6">
                        {section.lessons.map((lesson, lidx) => (
                          <li key={lesson.id || lidx}>{lesson.title}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {section.quizzes && section.quizzes.length > 0 && (
                    <div className="ml-4 mt-1">
                      <div className="font-medium text-gray-600">
                        Bài kiểm tra:
                      </div>
                      <ul className="list-disc ml-6">
                        {section.quizzes.map((quiz, qidx) => (
                          <li key={quiz.id || qidx}>{quiz.title}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white p-4 rounded-lg shadow mt-4">
            <h4 className="font-medium text-gray-700 mb-2">
              Nội dung khóa học
            </h4>
            <div className="text-gray-600 whitespace-pre-line">
              {courseContent.content || "Không có nội dung"}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Quản lý khóa học</h1>
        <Link
          to="/admin/courses/create"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <FiPlus className="mr-2" /> Thêm khóa học
        </Link>
      </div>

      <DataTable
        data={courses}
        columns={columns}
        isLoading={loading}
        onDelete={(course) => handleModalOpen("delete", course)}
        customActions={(course) => (
          <>
            <button
              onClick={() => handleViewStats(course)}
              className="text-blue-600 hover:text-blue-900"
              title="Xem thống kê"
            >
              <FiBarChart2 size={18} />
            </button>
            <Link
              to={`/admin/courses/${course.id}/students`}
              className="text-indigo-600 hover:text-indigo-900 ml-3"
              title="Xem danh sách học sinh"
            >
              <FiUsers size={18} />
            </Link>
            <button
              onClick={() => handleViewContent(course)}
              className="text-green-600 hover:text-green-900 ml-3"
              title="Xem nội dung khóa học"
            >
              <FiBookOpen size={18} />
            </button>
          </>
        )}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === "stats"
            ? "Thống kê khóa học"
            : modalMode === "content"
            ? "Nội dung khóa học"
            : "Xóa khóa học"
        }
        size={modalMode === "stats" ? "lg" : "md"}
      >
        {modalMode === "stats" ? (
          statsLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            renderStatistics()
          )
        ) : modalMode === "content" ? (
          contentLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : (
            renderContent()
          )
        ) : (
          <div>
            <p className="mb-4">
              Bạn có chắc chắn muốn xóa khóa học{" "}
              <strong>{selectedCourse?.title}</strong>?
            </p>
            <p className="text-red-500 mb-6">
              Lưu ý: Hành động này sẽ xóa tất cả nội dung và thông tin liên
              quan.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border text-gray-700 rounded hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteCourse}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CourseManagement;
