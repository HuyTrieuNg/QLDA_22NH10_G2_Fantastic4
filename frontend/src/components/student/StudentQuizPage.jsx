import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import studentService from "../../services/studentService";
import api from "../../api/axiosConfig";

const StudentQuizPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await api.get(`/quizzes/${quizId}/`);
        setQuiz(res.data);
        setQuestions(res.data.questions || []);
      } catch (err) {
        toast.error("Không thể tải bài kiểm tra");
      }
    };
    fetchQuiz();
  }, [quizId]);

  const handleSelect = (questionId, choiceId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: choiceId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Gửi đáp án lên server
      const res = await studentService.submitQuizAttempt(quizId, { answers });
      setScore(res.data.score);
      setShowResult(true);
      toast.success(
        `Bạn đã làm đúng ${res.data.correct}/${res.data.total} câu. Điểm: ${res.data.score}/10`
      );
    } catch (err) {
      toast.error("Có lỗi khi nộp bài");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper: get courseId from quiz object if available
  const courseId = quiz?.section?.course_id || quiz?.course_id || null;

  if (!quiz)
    return <div className="p-8 text-center">Đang tải bài kiểm tra...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-slate-800 rounded-xl shadow-md mt-8">
      <h1 className="text-2xl font-bold mb-4 text-indigo-700 dark:text-indigo-200">
        {quiz.title}
      </h1>
      {showResult ? (
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600 dark:text-green-300 mb-4">
            Điểm của bạn: {score} / {questions.length}
          </div>
          <div className="flex flex-col gap-3 items-center mt-6">
            <button
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              onClick={() => navigate(`/student/quizzes/${quizId}/history`)}
            >
              Xem lịch sử bài vừa làm
            </button>
            <button
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              onClick={() =>
                navigate(
                  courseId ? `/student/courses/${courseId}` : "/student/courses"
                )
              }
            >
              Về trang khóa học
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {questions.map((q, idx) => (
            <div key={q.id} className="mb-6">
              <div className="font-semibold mb-2">
                {idx + 1}. {q.text}
              </div>
              <div className="space-y-2">
                {q.choices.map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name={`question_${q.id}`}
                      value={c.id}
                      checked={String(answers[q.id]) === String(c.id)}
                      onChange={() => handleSelect(q.id, c.id)}
                      disabled={submitting}
                    />
                    <span>{c.text}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold mt-4"
            disabled={submitting}
          >
            {submitting ? "Đang nộp bài..." : "Nộp bài và xem điểm"}
          </button>
        </form>
      )}
    </div>
  );
};

export default StudentQuizPage;
