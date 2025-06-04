import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, HelpCircle } from 'lucide-react';
import { quizService, sectionService } from '../../services/courseService';
import toast from 'react-hot-toast';
import TeacherLayout from '../common/TeacherLayout';

const CreateEditQuiz = ({ isEdit = false }) => {
  const { quizId, sectionId } = useParams(); // sectionId cho tạo mới, quizId cho chỉnh sửa
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [section, setSection] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    position: 1
  });
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    
    fetchInitialData();
  }, [sectionId, quizId]);
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Validate that we have sectionId (required for both create and edit)
      if (!sectionId) {
        toast.error('Không thể xác định chương học');
        navigate(-1);
        return;
      }
        if (isEdit && quizId) {
        // Fetch quiz data for editing
        const quizResponse = await quizService.getQuizDetail(quizId);
        const quiz = quizResponse.data;
        
        console.log('Quiz data from API:', quiz); // Debug log
        
        setFormData({
          title: quiz.title || '',
          position: quiz.position || 1
        });
        
        // Xử lý questions data từ API
        const questionsFromAPI = quiz.questions || [];
        const processedQuestions = questionsFromAPI.map(question => ({
          ...question,
          // Đảm bảo choices có đủ 4 phần tử cho UI
          choices: question.choices && question.choices.length > 0 
            ? [
                ...question.choices,
                // Thêm choices trống nếu ít hơn 4
                ...Array(Math.max(0, 4 - question.choices.length)).fill(null).map((_, index) => ({
                  id: `temp_choice_${Date.now()}_${question.choices.length + index + 1}`,
                  text: '',
                  is_correct: false
                }))
              ]
            : [
                // Nếu không có choices, tạo 4 choices mặc định
                { id: `temp_choice_${Date.now()}_1`, text: '', is_correct: true },
                { id: `temp_choice_${Date.now()}_2`, text: '', is_correct: false },
                { id: `temp_choice_${Date.now()}_3`, text: '', is_correct: false },
                { id: `temp_choice_${Date.now()}_4`, text: '', is_correct: false }
              ]
        }));
        
        console.log('Processed questions:', processedQuestions); // Debug log
        setQuestions(processedQuestions);
      }
      // Always fetch section info using sectionId from URL
      const sectionResponse = await sectionService.getSectionDetail(sectionId);
      setSection(sectionResponse.data);
      
      if (!isEdit) {
        // Get quiz count to set position
        const quizzesResponse = await quizService.getSectionQuizzes(sectionId);
        setFormData(prev => ({
          ...prev,
          position: quizzesResponse.data.length + 1
        }));
      }
    } catch (error) {
      toast.error('Không thể tải thông tin');
      console.error('Error fetching data:', error);
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const addQuestion = () => {
    const newQuestion = {
      id: `temp_${Date.now()}`,
      text: '',
      position: questions.length + 1,
      choices: [
        { id: `temp_choice_${Date.now()}_1`, text: '', is_correct: true },
        { id: `temp_choice_${Date.now()}_2`, text: '', is_correct: false },
        { id: `temp_choice_${Date.now()}_3`, text: '', is_correct: false },
        { id: `temp_choice_${Date.now()}_4`, text: '', is_correct: false }
      ]
    };
    setQuestions([...questions, newQuestion]);
  };
  const removeQuestion = (questionId) => {
    const updatedQuestions = questions.filter(q => q.id !== questionId);
    // Reindex positions
    const reindexedQuestions = updatedQuestions.map((q, index) => ({
      ...q,
      position: index + 1
    }));
    setQuestions(reindexedQuestions);
  };

  const updateQuestion = (questionId, field, value) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, [field]: value } : q
    ));
  };

  const updateChoice = (questionId, choiceId, field, value) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? {
            ...q,
            choices: q.choices.map(c => 
              c.id === choiceId ? { ...c, [field]: value } : c
            )
          }
        : q
    ));
  };

  const setCorrectChoice = (questionId, choiceId) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? {
            ...q,
            choices: q.choices.map(c => ({
              ...c,
              is_correct: c.id === choiceId
            }))
          }
        : q
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề bài kiểm tra');
      return;
    }

    if (questions.length === 0) {
      toast.error('Vui lòng thêm ít nhất một câu hỏi');
      return;
    }

    // Validate questions
    for (const question of questions) {
      if (!question.text.trim()) {
        toast.error('Vui lòng nhập nội dung cho tất cả câu hỏi');
        return;
      }
      
      const validChoices = question.choices.filter(c => c.text.trim());
      if (validChoices.length < 2) {
        toast.error('Mỗi câu hỏi cần ít nhất 2 lựa chọn');
        return;
      }
      
      const correctChoices = question.choices.filter(c => c.is_correct && c.text.trim());
      if (correctChoices.length === 0) {
        toast.error('Mỗi câu hỏi cần có ít nhất một đáp án đúng');
        return;
      }
    }    try {
      setSaving(true);
      
      const quizData = {
        ...formData,
        questions: questions.map(q => ({
          ...q,
          choices: q.choices.filter(c => c.text.trim())
        }))
      };
      
      console.log('Sending quiz data:', quizData); // Debug log
      
      if (isEdit) {
        await quizService.updateQuiz(quizId, quizData);
        toast.success('Cập nhật bài kiểm tra thành công!');
      } else {
        await quizService.createQuiz(sectionId, quizData);
        toast.success('Tạo bài kiểm tra thành công!');
      }
      navigate(-1);
    } catch (error) {
      toast.error(isEdit ? 'Không thể cập nhật bài kiểm tra' : 'Không thể tạo bài kiểm tra');
      console.error('Error saving quiz:', error);
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  return (
    <TeacherLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 via-purple-600 to-purple-800 rounded-2xl shadow-2xl p-8 mb-10">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 text-white hover:bg-white/20 rounded-lg transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white flex items-center">
              <HelpCircle className="w-8 h-8 mr-3" />
              {isEdit ? 'Chỉnh sửa bài kiểm tra' : 'Tạo bài kiểm tra mới'}
            </h1>
            {section && (
              <p className="mt-2 text-blue-100">
                Chương: {section.title}
              </p>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">        {/* Quiz Info */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Thông tin bài kiểm tra</h2>
            <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề bài kiểm tra *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Ví dụ: Kiểm tra kiến thức Python cơ bản"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>        {/* Questions */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <HelpCircle className="w-6 h-6 mr-2 text-blue-600" />
              Câu hỏi
            </h2>
            <button
              type="button"
              onClick={addQuestion}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm câu hỏi
            </button>
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-8">
              <HelpCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có câu hỏi nào</h3>
              <p className="mt-1 text-sm text-gray-500">
                Bắt đầu bằng cách thêm câu hỏi đầu tiên
              </p>              <button
                type="button"
                onClick={addQuestion}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2 inline" />
                Thêm câu hỏi
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {questions.map((question, questionIndex) => (
                <div key={question.id} className="border border-gray-200 rounded-2xl p-6 bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-purple-50 transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Câu hỏi {questionIndex + 1}
                    </h3>
                    <button
                      type="button"
                      onClick={() => removeQuestion(question.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Question Text */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nội dung câu hỏi *
                    </label>
                    <textarea
                      value={question.text}
                      onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                      rows={2}
                      placeholder="Nhập nội dung câu hỏi..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      required
                    />
                  </div>

                  {/* Choices */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lựa chọn (chọn đáp án đúng)
                    </label>
                    <div className="space-y-2">
                      {question.choices.map((choice, choiceIndex) => (
                        <div key={choice.id} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name={`correct_${question.id}`}
                            checked={choice.is_correct}
                            onChange={() => setCorrectChoice(question.id, choice.id)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                          />
                          <input
                            type="text"
                            value={choice.text}
                            onChange={(e) => updateChoice(question.id, choice.id, 'text', e.target.value)}
                            placeholder={`Lựa chọn ${choiceIndex + 1}`}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      ))}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Chọn radio button bên trái để đánh dấu đáp án đúng
                    </p>
                  </div>
                </div>
              ))}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={addQuestion}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-all duration-200"
                >
                  <Plus className="w-4 h-4 mr-2 inline" />
                  Thêm câu hỏi
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        {questions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Xem trước</h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6">
              <div className="flex items-center mb-4">
                <HelpCircle className="w-6 h-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">
                  {formData.title || 'Tiêu đề bài kiểm tra'}
                </h3>
              </div>
              
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={question.id} className="bg-gray-50 rounded-2xl p-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {index + 1}. {question.text || `Câu hỏi ${index + 1}`}
                    </h4>
                    <div className="space-y-1">
                      {question.choices.filter(c => c.text.trim()).map((choice, choiceIndex) => (
                        <div 
                          key={choice.id} 
                          className={`text-sm p-2 rounded ${
                            choice.is_correct ? 'bg-green-100 text-green-800' : 'text-gray-600'
                          }`}
                        >
                          {String.fromCharCode(65 + choiceIndex)}. {choice.text}
                          {choice.is_correct && ' ✓'}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
                <div className="mt-4 text-xs text-gray-500">
                Tổng số câu hỏi: {questions.length}
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-4 sm:justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={saving}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>
            <button
            type="submit"
            disabled={saving || !formData.title.trim() || questions.length === 0}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-all duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isEdit ? 'Đang cập nhật...' : 'Đang tạo...'}
              </div>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2 inline" />
                {isEdit ? 'Cập nhật bài kiểm tra' : 'Tạo bài kiểm tra'}
              </>
            )}
          </button>
        </div>        </form>
      </div>
    </TeacherLayout>
  );
};

export default CreateEditQuiz;
