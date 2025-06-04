import React, { useState, useEffect } from "react";
import {
  getSections,
  getLessons,
  getQuizzes,
  getQuestions,
} from "../../../services/adminService";
import { toast } from "react-hot-toast";
import { FiBook, FiFileText, FiHelpCircle } from "react-icons/fi";
import { Link } from "react-router-dom";
import DataTable from "../common/DataTable";

const ContentManagement = () => {
  const [activeTab, setActiveTab] = useState("lessons");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const fetchData = async (tab) => {
    setLoading(true);
    try {
      let response;

      switch (tab) {
        case "sections":
          response = await getSections();
          break;
        case "lessons":
          response = await getLessons();
          break;
        case "quizzes":
          response = await getQuizzes();
          break;
        case "questions":
          response = await getQuestions();
          break;
        default:
          response = await getLessons();
      }

      setData(response.data);
    } catch (error) {
      console.error(`Error fetching ${tab}:`, error);
      toast.error(`Không thể tải dữ liệu ${getTabName(tab)}`);
    } finally {
      setLoading(false);
    }
  };

  const getTabName = (tab) => {
    const names = {
      sections: "phần học",
      lessons: "bài học",
      quizzes: "bài kiểm tra",
      questions: "câu hỏi",
    };

    return names[tab] || tab;
  };

  // Define columns for different content types
  const columnDefinitions = {
    sections: [
      {
        key: "title",
        header: "Tên phần học",
      },
      {
        key: "position",
        header: "Vị trí",
      },
      {
        key: "course",
        header: "Khóa học",
        render: (item) => getCourseName(item.course),
      },
    ],

    lessons: [
      {
        key: "title",
        header: "Tên bài học",
      },
      {
        key: "position",
        header: "Vị trí",
      },
      {
        key: "section",
        header: "Phần học",
        render: (item) => getSectionName(item.section),
      },
      {
        key: "content_preview",
        header: "Nội dung",
        render: (item) =>
          item.content?.substring(0, 50) +
            (item.content?.length > 50 ? "..." : "") || "N/A",
      },
    ],

    quizzes: [
      {
        key: "title",
        header: "Tên bài kiểm tra",
      },
      {
        key: "position",
        header: "Vị trí",
      },
      {
        key: "section",
        header: "Phần học",
        render: (item) => getSectionName(item.section),
      },
      {
        key: "questions_count",
        header: "Số câu hỏi",
        render: (item) => item.questions?.length || 0,
      },
    ],

    questions: [
      {
        key: "text",
        header: "Câu hỏi",
        render: (item) =>
          item.text?.substring(0, 50) + (item.text?.length > 50 ? "..." : "") ||
          "N/A",
      },
      {
        key: "position",
        header: "Vị trí",
      },
      {
        key: "quiz",
        header: "Bài kiểm tra",
        render: (item) => getQuizName(item.quiz),
      },
      {
        key: "choices_count",
        header: "Số lựa chọn",
        render: (item) => item.choices?.length || 0,
      },
    ],
  };

  // Helper functions to get related entity names
  const getCourseName = (courseId) => {
    // In a real implementation, you would fetch course names or use a context/store
    return `Khóa học #${courseId}`;
  };

  const getSectionName = (sectionId) => {
    return `Phần học #${sectionId}`;
  };

  const getQuizName = (quizId) => {
    return `Bài kiểm tra #${quizId}`;
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Quản lý nội dung</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <ul className="flex flex-wrap -mb-px">
          {["lessons", "sections", "quizzes", "questions"].map((tab) => (
            <li key={tab} className="mr-2">
              <button
                onClick={() => setActiveTab(tab)}
                className={`inline-flex items-center py-4 px-4 text-sm font-medium text-center border-b-2 ${
                  activeTab === tab
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab === "lessons" && <FiFileText className="mr-2" />}
                {tab === "sections" && <FiBook className="mr-2" />}
                {tab === "quizzes" && <FiFileText className="mr-2" />}
                {tab === "questions" && <FiHelpCircle className="mr-2" />}
                {getTabName(tab).charAt(0).toUpperCase() +
                  getTabName(tab).slice(1)}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Content */}
      <DataTable
        data={data}
        columns={columnDefinitions[activeTab] || []}
        isLoading={loading}
        emptyMessage={`Không có ${getTabName(activeTab)} nào`}
        onView={(item) => {
          toast.error("Chức năng xem chi tiết đang được phát triển.");
        }}
        onEdit={(item) => {
          toast.error("Chức năng chỉnh sửa đang được phát triển.");
        }}
        onDelete={(item) => {
          toast.error("Chức năng xóa đang được phát triển.");
        }}
      />
    </div>
  );
};

export default ContentManagement;
