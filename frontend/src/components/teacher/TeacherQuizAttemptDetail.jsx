import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare, Loader2, X } from 'lucide-react';
import api from "../../api/axiosConfig";
import { toast } from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import TeacherLayout from '../common/TeacherLayout';

const TeacherQuizAttemptDetail = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiFeedback, setAiFeedback] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const feedbackRequested = useRef(false);

  useEffect(() => {
    const fetchAttemptDetail = async () => {
      try {
        // Gọi API để lấy chi tiết attempt của học sinh
        const res = await api.get(`/teacher/quiz-attempts/${attemptId}/detail/`);
        setAttempt(res.data);
      } catch (err) {
        toast.error("Không thể tải chi tiết bài làm");
        console.error('Error fetching attempt detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttemptDetail();
  }, [attemptId]);

  const handleAIFeedback = async () => {
    setAiLoading(true);
    setAiError(null);
    feedbackRequested.current = true;
    try {
      // Gọi endpoint AI feedback
      const res = await api.post(`/teacher/quiz-attempts/${attemptId}/ai-feedback/`, {});
      setAiFeedback(res.data.feedback || res.data.result || "Không có phản hồi từ AI.");
    } catch (err) {
      setAiError('Không thể lấy nhận xét AI. Vui lòng thử lại sau.');
      console.error('Error getting AI feedback:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const clearAIFeedback = () => {
    setAiFeedback("");
    setAiError(null);
    feedbackRequested.current = false;
  };

  if (loading) {
    return (
      <TeacherLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="animate-spin w-8 h-8 text-purple-600" />
        </div>
      </TeacherLayout>
    );
  }

  if (!attempt) {
    return (
      <TeacherLayout>
        <div className="p-8 text-center text-red-500">
          Không tìm thấy bài làm này.
        </div>
      </TeacherLayout>
    );
  }

  // Defensive: detailed_answers may be missing or not an array
  const answers = Array.isArray(attempt.detailed_answers) ? attempt.detailed_answers : [];

  return (
    <TeacherLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chi tiết bài làm của học sinh</h1>
            <p className="text-gray-600">
              Học sinh: {attempt.user.first_name || attempt.user.username} {attempt.user.last_name} ({attempt.user.email})
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md">
          <div className="flex flex-col lg:flex-row gap-8 p-6">
            {/* Kết quả bài kiểm tra bên trái */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold mb-4 text-indigo-700">Kết quả bài kiểm tra</h2>
              
              {/* Thông tin tổng quan */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-indigo-600">{attempt.score}/10</div>
                    <div className="text-sm text-gray-600">Điểm số</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{attempt.correct_count}</div>
                    <div className="text-sm text-gray-600">Câu đúng</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-600">{attempt.total_count}</div>
                    <div className="text-sm text-gray-600">Tổng câu</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-600">
                      {new Date(attempt.submitted_at).toLocaleString('vi-VN')}
                    </div>
                    <div className="text-xs text-gray-500">Thời gian nộp</div>
                  </div>
                </div>
              </div>

              {/* Chi tiết từng câu hỏi */}
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Chi tiết từng câu hỏi</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {answers.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">Không có chi tiết câu trả lời.</div>
                ) : (
                  answers.map((answer, idx) => (
                    <div key={idx} className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                      <div className="font-medium mb-3 text-gray-900">
                        {idx + 1}. {answer.question}
                      </div>
                      <div className="space-y-2">
                        <div className={`text-sm p-2 rounded ${answer.is_correct ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          <span className="font-medium">Đáp án của học sinh:</span> {answer.your_choice}
                        </div>
                        <div className="text-sm p-2 rounded bg-blue-100 text-blue-700">
                          <span className="font-medium">Đáp án đúng:</span> {answer.correct_choice}
                        </div>
                        {answer.is_correct && (
                          <div className="text-xs text-green-600 font-medium">✓ Trả lời đúng</div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Nhận xét AI bên phải */}
            <div className="w-full lg:w-[500px] flex-shrink-0">
              <div className="bg-indigo-50 rounded-xl p-6 h-fit">
                <h3 className="font-semibold text-indigo-700 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Nhận xét từ trợ lý AI
                </h3>
                
                {aiFeedback ? (
                  <div className="bg-white rounded-lg border p-4 max-h-96 overflow-y-auto">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-sm font-medium text-indigo-600">Phản hồi AI:</span>
                      <button
                        onClick={clearAIFeedback}
                        className="text-gray-400 hover:text-gray-600"
                        title="Xóa nhận xét"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="prose prose-sm max-w-none text-gray-800">
                      <ReactMarkdown>{aiFeedback}</ReactMarkdown>
                    </div>
                  </div>
                ) : (
                  <button
                    className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
                    onClick={handleAIFeedback}
                    disabled={aiLoading}
                  >
                    {aiLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Đang tạo nhận xét...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4" />
                        Tạo nhận xét từ AI
                      </>
                    )}
                  </button>
                )}
                
                {aiError && (
                  <div className="text-red-600 text-sm mt-2">{aiError}</div>
                )}
                
                <div className="mt-4 text-xs text-gray-500">
                  💡 AI sẽ phân tích bài làm và đưa ra nhận xét chi tiết về điểm mạnh, điểm yếu và gợi ý cải thiện cho học sinh.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default TeacherQuizAttemptDetail;
