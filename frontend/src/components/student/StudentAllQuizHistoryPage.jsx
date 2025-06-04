import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { studentService } from "../../services/studentService";
import { Clock } from "lucide-react";

const StudentAllQuizHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await studentService.getQuizHistory();
        setHistory(res.data);
      } catch (err) {
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <div className="p-8 text-center">Đang tải lịch sử...</div>;
  if (!history || history.length === 0)
    return <div className="p-8 text-center text-gray-500">Bạn chưa làm bài kiểm tra nào.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-slate-800 rounded-xl shadow-md mt-8">
      <h1 className="text-2xl font-bold mb-6 text-indigo-700 dark:text-indigo-200 flex items-center gap-2">
        <Clock className="w-6 h-6" /> Lịch sử làm bài kiểm tra
      </h1>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bài kiểm tra</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Điểm</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Số câu đúng</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ngày làm</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-100 dark:divide-slate-700">
            {history.map((attempt) => (
              <tr key={attempt.id}>
                <td className="px-4 py-2 font-semibold text-indigo-700 dark:text-indigo-200">{attempt.quiz_title}</td>
                <td className="px-4 py-2">{attempt.score}/10</td>
                <td className="px-4 py-2">{attempt.correct_count} / {attempt.total_count}</td>
                <td className="px-4 py-2">{new Date(attempt.submitted_at).toLocaleString("vi-VN")}</td>
                <td className="px-4 py-2">
                  <button
                    className="text-blue-600 hover:underline text-sm"
                    onClick={() => navigate(`/student/quizzes/${attempt.quiz}/history`)}
                  >
                    Xem chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentAllQuizHistoryPage;
