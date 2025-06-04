import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, Loader2 } from 'lucide-react';
import TeacherLayout from '../common/TeacherLayout';
import { quizService } from '../../services/courseService';

const QuizResults = () => {
  const { quizId, sectionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await quizService.getQuizResults(quizId);
        setResults(res.data.results);
        setQuizTitle(res.data.quiz_title);
      } catch (err) {
        console.error('Error fetching quiz results:', err);
        setError('Không thể tải kết quả bài kiểm tra');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();  }, [quizId]);

  // Navigate to detailed view
  const viewAttemptDetail = (attemptId) => {
    navigate(`/teacher/quiz-attempts/${attemptId}/detail`);
  };

  return (
    <TeacherLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Eye className="w-6 h-6 text-green-600" />
          Kết quả bài kiểm tra: <span className="ml-2 text-purple-700">{quizTitle}</span>
        </h1>
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <Loader2 className="animate-spin w-8 h-8 text-purple-600" />
          </div>
        ) : error ? (
          <div className="text-red-600 text-center py-8">{error}</div>
        ) : results.length === 0 ? (
          <div className="text-gray-500 text-center py-8">Chưa có học viên nào làm bài kiểm tra này.</div>        ) : (
          <div className="overflow-x-auto rounded-xl shadow border">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <th className="py-3 px-4 text-left">#</th>
                  <th className="py-3 px-4 text-left">Học viên</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-center">Điểm</th>
                  <th className="py-3 px-4 text-center">Số câu đúng</th>
                  <th className="py-3 px-4 text-center">Tổng số câu</th>
                  <th className="py-3 px-4 text-center">Nộp lúc</th>                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {results.map((attempt, idx) => (
                  <tr key={attempt.id} className="border-t hover:bg-purple-50/30">
                    <td className="py-2 px-4">{idx + 1}</td>
                    <td className="py-2 px-4 font-medium">
                      {attempt.user.first_name || attempt.user.username} {attempt.user.last_name}
                    </td>
                    <td className="py-2 px-4">{attempt.user.email}</td>
                    <td className="py-2 px-4 text-center font-bold text-purple-700">{attempt.score}</td>
                    <td className="py-2 px-4 text-center">{attempt.correct_count}</td>
                    <td className="py-2 px-4 text-center">{attempt.total_count}</td>
                    <td className="py-2 px-4 text-center">
                      {new Date(attempt.submitted_at).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-2 px-4 text-center">
                      <button
                        onClick={() => viewAttemptDetail(attempt.id)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        title="Xem chi tiết bài làm"
                      >
                        <Eye className="w-4 h-4" />
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
};

export default QuizResults;
