import React, { useEffect, useState } from "react";
import TeacherLayout from "../common/TeacherLayout";
import { Bar, Line } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend } from 'chart.js';
import api from "../../api/axiosConfig";
import { getTeacherStatistics, getTeacherStatisticsAIFeedback } from '../../services/courseService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

Chart.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, ArcElement);

const TeacherStatistics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState("");
  const [aiError, setAiError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getTeacherStatistics();
        setStats(res.data);
        setAiFeedback(res.data.ai_feedback || "");
      } catch (err) {
        setError("Không thể tải dữ liệu thống kê");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Gọi lại AI feedback (timeout lớn)
  const fetchAIFeedback = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await getTeacherStatisticsAIFeedback();
      setAiFeedback(res.data.ai_feedback || "Không có nhận xét AI.");
    } catch (err) {
      setAiError("Không thể lấy nhận xét AI. Vui lòng thử lại sau.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <TeacherLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-indigo-700">Thống kê & Phân tích</h1>
        {loading ? (
          <div className="text-center py-20 text-lg">Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="text-center text-red-600 py-20">{error}</div>
        ) : stats ? (
          <>
            {/* Summary cards in a single row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                <div className="text-2xl font-bold text-indigo-700">{stats.total_courses}</div>
                <div className="text-sm text-gray-600 mt-1">Tổng số khóa học</div>
              </div>
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                <div className="text-2xl font-bold text-green-700">{stats.published_courses}</div>
                <div className="text-sm text-gray-600 mt-1">Đã xuất bản</div>
              </div>
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.draft_courses}</div>
                <div className="text-sm text-gray-600 mt-1">Bản nháp</div>
              </div>
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                <div className="text-2xl font-bold text-blue-700">{stats.total_students}</div>
                <div className="text-sm text-gray-600 mt-1">Tổng học viên</div>
              </div>
            </div>
            {/* Charts: Revenue and New Students in one row, Course Scores in a separate row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-xl shadow p-6 flex flex-col justify-center h-full">
                <h2 className="text-xl font-semibold mb-4 text-green-700">Doanh thu theo tháng</h2>
                <Bar data={stats.revenue_chart} options={{ responsive: true }} />
              </div>
              <div className="bg-white rounded-xl shadow p-6 flex flex-col justify-center h-full">
                <h2 className="text-xl font-semibold mb-4 text-blue-700">Số học viên mới</h2>
                <Line data={stats.new_students_chart} options={{ responsive: true }} />
              </div>
            </div>
            <div className="mb-8">
              <div className="bg-white rounded-xl shadow p-6 flex flex-col justify-center h-full">
                <h2 className="text-xl font-semibold mb-4 text-purple-700">Điểm trung bình các khóa học</h2>
                <Bar data={stats.course_scores_chart} options={{ responsive: true }} />
              </div>
            </div>
          </>
        ) : null}
        {/* Nhận xét AI để riêng phía dưới */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col min-h-[400px] mt-8 max-w-6xl mx-auto overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4 text-indigo-700">Nhận xét AI về số liệu</h2>
          {aiLoading ? (
            <div className="text-center text-gray-500">Đang lấy nhận xét AI...</div>
          ) : aiError ? (
            <div className="text-red-600 mb-2">{aiError}</div>
          ) : aiFeedback ? (
            <div className="prose max-w-none text-gray-800 prose-h2:text-2xl prose-h3:text-xl prose-ul:pl-6 prose-ol:pl-6 prose-table:overflow-x-auto">
                <ReactMarkdown>{String(aiFeedback).replace(/\\n/g, '\n')}</ReactMarkdown>            </div>
          ) : (
            <div>Chưa có nhận xét AI.</div>
          )}
          <button
            className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 w-full disabled:opacity-60"
            onClick={fetchAIFeedback}
            disabled={aiLoading}
          >
            {aiLoading ? "Đang lấy nhận xét..." : "Lấy lại nhận xét AI"}
          </button>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default TeacherStatistics;
