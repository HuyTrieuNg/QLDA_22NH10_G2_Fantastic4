import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axiosConfig";
import { toast } from "react-hot-toast";
import ReactMarkdown from "react-markdown";

const StudentQuizHistoryPage = () => {
  const { quizId } = useParams();
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiFeedback, setAiFeedback] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const feedbackRequested = useRef(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get(`/student/quizzes/${quizId}/history/`);
        // Handle both array (old) and object (new API)
        if (Array.isArray(res.data)) {
          if (res.data.length === 0) {
            setHistory(null);
          } else {
            // Use the latest attempt if array
            setHistory(res.data[0]);
          }
        } else {
          setHistory(res.data);
        }
      } catch (err) {
        toast.error("Không thể tải lịch sử bài làm");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [quizId]);

  const handleGetAIFeedback = async () => {
    setAiLoading(true);
    setAiError("");
    setAiFeedback("");
    feedbackRequested.current = true;
    try {
      // Gọi endpoint mới với attempt_id
      const res = await api.post(`/student/quiz-attempts/${history.attempt_id}/ai-feedback/`, {});
      setAiFeedback(res.data.feedback || res.data.result || "Không có phản hồi từ AI.");
    } catch (err) {
      setAiError("Không thể lấy nhận xét AI. Vui lòng thử lại sau.");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Đang tải lịch sử...</div>;
  if (!history)
    return <div className="p-8 text-center text-red-500">Không có dữ liệu lịch sử cho bài kiểm tra này.</div>;

  // Defensive: answers may be missing or not an array
  const answers = Array.isArray(history.answers) ? history.answers : [];

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white dark:bg-slate-800 rounded-xl shadow-md mt-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Kết quả bài kiểm tra bên trái */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold mb-4 text-indigo-700 dark:text-indigo-200">Lịch sử làm bài kiểm tra</h1>
          <div className="mb-4 text-lg font-semibold text-green-700 dark:text-green-300">
            Điểm: <span className="text-2xl">{history.score}/10</span> &nbsp;|&nbsp; Số câu đúng: {history.correct ?? history.correct_count} / {history.total ?? history.total_count}
          </div>
          <div className="space-y-6">
            {answers.length === 0 ? (
              <div className="text-gray-500">Không có chi tiết câu trả lời.</div>
            ) : (
              answers.map((a, idx) => (
                <div key={idx} className="p-4 rounded bg-gray-50 dark:bg-slate-700">
                  <div className="font-medium mb-2">{idx + 1}. {a.question}</div>
                  <div className="flex flex-col gap-1">
                    <span className={a.your_choice === a.correct_choice ? "text-green-600" : "text-red-500"}>
                      Đáp án của bạn: {a.your_choice}
                    </span>
                    <span className="text-green-700">Đáp án đúng: {a.correct_choice}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-8 text-center text-gray-500 text-sm">Bạn không thể sửa bài làm này.</div>
        </div>
        {/* Nhận xét AI bên phải */}
        <div className="w-full md:w-[580px] flex-shrink-0 mt-10 py-10 md:mt-0 p-6 bg-indigo-50 dark:bg-slate-900 rounded-xl h-fit">
          <div className="font-semibold text-indigo-700 dark:text-indigo-200 mb-2">Nhận xét từ trợ lý AI</div>
          {aiFeedback ? (
            <div className="text-gray-800 dark:text-gray-100 text-left border rounded p-3 bg-white dark:bg-slate-800 prose dark:prose-invert max-w-none overflow-x-auto">
              <ReactMarkdown>{aiFeedback}</ReactMarkdown>
            </div>
          ) : (
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 w-full"
              onClick={handleGetAIFeedback}
              disabled={aiLoading || feedbackRequested.current}
            >
              {aiLoading ? "Đang tạo nhận xét..." : "Nhận nhận xét từ AI"}
            </button>
          )}
          {aiError && <div className="text-red-600 text-sm mt-2">{aiError}</div>}
        </div>
      </div>
    </div>
  );
};

export default StudentQuizHistoryPage;
