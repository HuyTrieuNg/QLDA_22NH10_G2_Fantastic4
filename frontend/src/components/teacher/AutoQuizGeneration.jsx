import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Bot, Trash2, Edit, Plus, Minus, HelpCircle, Play, FileText } from 'lucide-react';
import { quizService, sectionService } from '../../services/courseService';
import toast from 'react-hot-toast';
import TeacherLayout from '../common/TeacherLayout';

const AutoQuizGeneration = () => {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [section, setSection] = useState(null);
  const [numQuestions, setNumQuestions] = useState(10);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [selectedLessons, setSelectedLessons] = useState([]);
  const [useAllLessons, setUseAllLessons] = useState(true);

  useEffect(() => {
    fetchSectionData();
  }, [sectionId]);

  const fetchSectionData = async () => {
    try {
      setLoading(true);
      const response = await sectionService.getSectionDetail(sectionId);
      setSection(response.data);
      setQuizTitle(`Bài kiểm tra ${response.data.title}`);
    } catch (error) {
      toast.error('Không thể tải thông tin chương học');
      console.error('Error fetching section:', error);
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };
  const handleGenerateQuiz = async () => {
    // Validate lesson selection
    if (!useAllLessons && selectedLessons.length === 0) {
      toast.error('Vui lòng chọn ít nhất một bài học để tạo câu hỏi');
      return;
    }    try {
      setGenerating(true);
      // Show initial loading toast
      toast.loading('Đang tạo câu hỏi AI... Quá trình này có thể mất 1-3 phút, vui lòng chờ!', {
        id: 'generating-quiz',
        duration: Infinity, // Keep showing until dismissed
      });
      
      const requestData = {
        num_questions: numQuestions
      };

      // Add selected lesson IDs if not using all lessons
      if (!useAllLessons) {
        requestData.lesson_ids = selectedLessons;
      }

      const response = await quizService.generateAutoQuiz(sectionId, requestData);
      
      // Dismiss loading toast
      toast.dismiss('generating-quiz');
      
      setGeneratedQuestions(response.data.questions || []);
      toast.success(`Đã tạo ${response.data.num_questions} câu hỏi thành công!`);
    } catch (error) {
      // Dismiss loading toast
      toast.dismiss('generating-quiz');
      
      const errorMessage = error.response?.data?.error || 'Không thể tạo câu hỏi tự động';
      
      // Check if it's a timeout error
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        toast.error('Quá trình tạo câu hỏi mất quá nhiều thời gian. Vui lòng thử lại với ít câu hỏi hơn hoặc ít bài học hơn.');
      } else {
        toast.error(errorMessage);
      }
      
      console.error('Error generating quiz:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleLessonToggle = (lessonId) => {
    setSelectedLessons(prev => {
      if (prev.includes(lessonId)) {
        return prev.filter(id => id !== lessonId);
      } else {
        return [...prev, lessonId];
      }
    });
  };

  const handleSelectAllLessons = () => {
    if (section?.lessons) {
      setSelectedLessons(section.lessons.map(lesson => lesson.id));
    }
  };

  const handleDeselectAllLessons = () => {
    setSelectedLessons([]);
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...generatedQuestions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setGeneratedQuestions(updatedQuestions);
  };

  const updateChoice = (questionIndex, choiceIndex, value) => {
    const updatedQuestions = [...generatedQuestions];
    updatedQuestions[questionIndex].choices[choiceIndex] = value;
    setGeneratedQuestions(updatedQuestions);
  };

  const setCorrectAnswer = (questionIndex, choiceIndex) => {
    const updatedQuestions = [...generatedQuestions];
    updatedQuestions[questionIndex].correct_answer = choiceIndex;
    setGeneratedQuestions(updatedQuestions);
  };

  const deleteQuestion = (index) => {
    const updatedQuestions = generatedQuestions.filter((_, i) => i !== index);
    setGeneratedQuestions(updatedQuestions);
  };
  const addQuestion = () => {
    const newQuestion = {
      question: '',
      choices: ['', '', '', ''],
      correct_answer: 0
    };
    setGeneratedQuestions([...generatedQuestions, newQuestion]);
  };

  const handleSaveQuiz = async () => {
    if (!quizTitle.trim()) {
      toast.error('Vui lòng nhập tiêu đề bài kiểm tra');
      return;
    }

    if (generatedQuestions.length === 0) {
      toast.error('Vui lòng thêm ít nhất một câu hỏi');
      return;
    }

    // Validate questions
    for (let i = 0; i < generatedQuestions.length; i++) {
      const question = generatedQuestions[i];
      if (!question.question.trim()) {
        toast.error(`Câu hỏi ${i + 1} không được để trống`);
        return;
      }
      
      const validChoices = question.choices.filter(choice => choice.trim());
      if (validChoices.length < 2) {
        toast.error(`Câu hỏi ${i + 1} cần ít nhất 2 lựa chọn`);
        return;
      }
      
      if (question.correct_answer < 0 || question.correct_answer >= question.choices.length) {
        toast.error(`Câu hỏi ${i + 1} cần có đáp án đúng`);
        return;
      }
    }

    try {
      setSaving(true);
      
      // Convert generated questions to quiz format
      const questions = generatedQuestions.map((q, index) => ({
        text: q.question,
        position: index + 1,
        choices: q.choices
          .filter(choice => choice.trim())
          .map((choice, choiceIndex) => ({
            text: choice,
            is_correct: choiceIndex === q.correct_answer
          }))
      }));

      const quizData = {
        title: quizTitle,
        position: 1,
        questions: questions
      };

      await quizService.createQuiz(sectionId, quizData);
      toast.success('Tạo bài kiểm tra thành công!');
      navigate(-1);
    } catch (error) {
      toast.error('Không thể tạo bài kiểm tra');
      console.error('Error saving quiz:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <TeacherLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Tạo bài kiểm tra tự động với AI
            </h1>
            {section && (
              <p className="mt-2 text-gray-600">
                Chương: {section.title}
              </p>
            )}
          </div>
        </div>

        {/* Generation Settings */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Bot className="w-6 h-6 mr-2 text-purple-600" />
            Cài đặt tạo câu hỏi
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề bài kiểm tra *
              </label>
              <input
                type="text"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                placeholder="Ví dụ: Bài kiểm tra Chương 1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số lượng câu hỏi (1-15)
              </label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setNumQuestions(Math.max(1, numQuestions - 1))}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={generating}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={generating}
                />
                <button
                  type="button"
                  onClick={() => setNumQuestions(Math.min(30, numQuestions + 1))}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={generating}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>            </div>
          </div>

          {/* Lesson Selection */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Chọn bài học để tạo câu hỏi
            </label>
            
            <div className="space-y-4">
              {/* All lessons vs Selected lessons toggle */}
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={useAllLessons}
                    onChange={() => setUseAllLessons(true)}
                    className="mr-2 text-purple-600 focus:ring-purple-500"
                    disabled={generating}
                  />
                  <span className="text-sm text-gray-700">Sử dụng tất cả bài học ({section?.lessons?.length || 0} bài)</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!useAllLessons}
                    onChange={() => setUseAllLessons(false)}
                    className="mr-2 text-purple-600 focus:ring-purple-500"
                    disabled={generating}
                  />
                  <span className="text-sm text-gray-700">Chọn bài học cụ thể</span>
                </label>
              </div>

              {/* Lesson selection when not using all lessons */}
              {!useAllLessons && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      Đã chọn: {selectedLessons.length} / {section?.lessons?.length || 0} bài học
                    </span>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={handleSelectAllLessons}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        disabled={generating}
                      >
                        Chọn tất cả
                      </button>
                      <button
                        type="button"
                        onClick={handleDeselectAllLessons}
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        disabled={generating}
                      >
                        Bỏ chọn tất cả
                      </button>
                    </div>
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {section?.lessons?.map((lesson, index) => (
                      <label key={lesson.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedLessons.includes(lesson.id)}
                          onChange={() => handleLessonToggle(lesson.id)}
                          className="mt-1 text-purple-600 focus:ring-purple-500"
                          disabled={generating}
                        />                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            {lesson.video_url ? (
                              <Play className="w-4 h-4 mr-2 text-purple-600" />
                            ) : (
                              <FileText className="w-4 h-4 mr-2 text-gray-600" />
                            )}
                            {index + 1}. {lesson.title}
                          </div>
                          <div className="text-xs text-gray-500 truncate ml-6">
                            {lesson.video_url ? 'Video bài học' : 'Bài học văn bản'}
                            {lesson.content && ` • ${lesson.content.length > 50 ? lesson.content.substring(0, 50) + '...' : lesson.content}`}
                          </div>
                        </div>
                      </label>
                    )) || (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        Chương này chưa có bài học nào
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>          <div className="mt-6">
            <button
              onClick={handleGenerateQuiz}
              disabled={generating}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang tạo câu hỏi...
                </>
              ) : (
                <>
                  <Bot className="w-5 h-5 mr-2" />
                  Tạo câu hỏi với AI
                </>
              )}
            </button>
            
            {/* Time warning */}
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm flex items-center">
                <HelpCircle className="w-4 h-4 mr-2" />
                💡 <strong>Lưu ý:</strong> Quá trình tạo câu hỏi AI có thể mất 1-3 phút tùy thuộc vào số lượng câu hỏi và độ dài nội dung bài học. Vui lòng kiên nhẫn chờ đợi!
              </p>
            </div>
          </div>

          {section?.lessons?.length === 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                ⚠️ Chương này chưa có bài học nào. Vui lòng thêm bài học trước khi tạo câu hỏi tự động.
              </p>
            </div>
          )}
        </div>

        {/* Generated Questions */}
        {generatedQuestions.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <HelpCircle className="w-6 h-6 mr-2 text-blue-600" />
                Câu hỏi đã tạo ({generatedQuestions.length})
              </h2>
              <button
                onClick={addQuestion}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm câu hỏi
              </button>
            </div>

            <div className="space-y-6">
              {generatedQuestions.map((question, questionIndex) => (
                <div key={questionIndex} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Câu hỏi {questionIndex + 1}
                    </h3>
                    <button
                      onClick={() => deleteQuestion(questionIndex)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Question Text */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nội dung câu hỏi *
                      </label>
                      <textarea
                        value={question.question}
                        onChange={(e) => updateQuestion(questionIndex, 'question', e.target.value)}
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Nhập nội dung câu hỏi..."
                      />
                    </div>

                    {/* Choices */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lựa chọn (chọn đáp án đúng)
                      </label>
                      <div className="space-y-2">
                        {question.choices.map((choice, choiceIndex) => (
                          <div key={choiceIndex} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name={`correct_${questionIndex}`}
                              checked={question.correct_answer === choiceIndex}
                              onChange={() => setCorrectAnswer(questionIndex, choiceIndex)}
                              className="text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm font-medium text-gray-500 w-6">
                              {String.fromCharCode(65 + choiceIndex)}.
                            </span>
                            <input
                              type="text"
                              value={choice}
                              onChange={(e) => updateChoice(questionIndex, choiceIndex, e.target.value)}
                              placeholder={`Lựa chọn ${String.fromCharCode(65 + choiceIndex)}`}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                        ))}
                      </div>                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Save Actions */}
            <div className="flex flex-col sm:flex-row gap-4 sm:justify-end mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={saving}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              
              <button
                onClick={handleSaveQuiz}
                disabled={saving || !quizTitle.trim() || generatedQuestions.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Lưu bài kiểm tra
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
};

export default AutoQuizGeneration;
