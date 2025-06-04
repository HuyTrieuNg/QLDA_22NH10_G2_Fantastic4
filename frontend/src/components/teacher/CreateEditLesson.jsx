import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Play, FileText, BookOpen } from 'lucide-react';
import { lessonService, sectionService } from '../../services/courseService';
import toast from 'react-hot-toast';
import TeacherLayout from '../common/TeacherLayout';

const CreateEditLesson = ({ isEdit = false }) => {
  const { lessonId, sectionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [section, setSection] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    video_url: '',
    position: 1
  });

  useEffect(() => {
    fetchInitialData();
  }, [sectionId, lessonId]);
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Validate that we have sectionId (required for both create and edit)
      if (!sectionId) {
        toast.error('Không thể xác định chương học');
        navigate(-1);
        return;
      }
      
      if (isEdit && lessonId) {
        // Fetch lesson data for editing
        const lessonResponse = await lessonService.getLessonDetail(lessonId);
        const lesson = lessonResponse.data;
        
        setFormData({
          title: lesson.title || '',
          content: lesson.content || '',
          video_url: lesson.video_url || '',
          position: lesson.position || 1        });
      }
      
      // Always fetch section info using sectionId from URL
      const sectionResponse = await sectionService.getSectionDetail(sectionId);
      setSection(sectionResponse.data);
      
      if (!isEdit) {
        // Get lesson count to set position
        const lessonsResponse = await lessonService.getSectionLessons(sectionId);
        setFormData(prev => ({
          ...prev,
          position: lessonsResponse.data.length + 1
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

  const validateVideoUrl = (url) => {
    if (!url) return true;
    // Chỉ chấp nhận YouTube link dạng https://www.youtube.com/watch?v=...
    return url.startsWith('https://www.youtube.com/watch?v=');
  };

  const isLessonValid = () => {
    // Bắt buộc phải có content
    return formData.content && formData.content.trim().length > 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề bài học');
      return;
    }
    if (!isLessonValid()) {
      toast.error('Nội dung bài học là bắt buộc!');
      return;
    }
    if (formData.video_url && !validateVideoUrl(formData.video_url)) {
      toast.error('Đường dẫn video phải là link YouTube hợp lệ!');
      return;
    }
    try {
      setSaving(true);
      const safeFormData = {
        ...formData,
        content: formData.content || "",
        video_url: formData.video_url || ""
      };
      if (isEdit) {
        await lessonService.updateLesson(lessonId, safeFormData);
        toast.success('Cập nhật bài học thành công!');
      } else {
        await lessonService.createLesson(sectionId, safeFormData);
        toast.success('Tạo bài học thành công!');
      }
      navigate(-1);
    } catch (error) {
      toast.error(isEdit ? 'Không thể cập nhật bài học' : 'Không thể tạo bài học');
      console.error('Error saving lesson:', error);
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
              <BookOpen className="w-8 h-8 mr-3" />
              {isEdit ? 'Chỉnh sửa bài học' : 'Tạo bài học mới'}
            </h1>
            {section && (
              <p className="mt-2 text-blue-100">
                Chương: {section.title}
              </p>
            )}
          </div>
        </div>
      </div>      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-10 hover:shadow-2xl transition-shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <BookOpen className="w-6 h-6 mr-2 text-blue-600" />
            Thông tin bài học
          </h2>
          
          {/* Lesson Title */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề bài học *
            </label>            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Ví dụ: Giới thiệu về Python"
              className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-blue-500"
              required
            />
          </div>

          {/* Video URL */}
          <div className="mb-6">
            <label htmlFor="video_url" className="block text-sm font-medium text-gray-700 mb-2">
              Đường dẫn video (tùy chọn)
            </label>            <input
              type="url"
              id="video_url"
              name="video_url"
              value={formData.video_url}
              onChange={handleInputChange}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Chỉ chấp nhận liên kết YouTube dạng https://www.youtube.com/watch?v=... Có thể để trống nếu đã nhập nội dung bài học.
            </p>
            {formData.video_url && !validateVideoUrl(formData.video_url) && (
              <p className="mt-1 text-sm text-red-600">
                Đường dẫn video phải là link YouTube hợp lệ (https://www.youtube.com/watch?v=...)
              </p>
            )}
          </div>

          {/* Lesson Content */}
          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung bài học 
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={12}
              placeholder="Nhập nội dung chi tiết của bài học..."
              className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-blue-500 resize-none"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Nội dung có thể bao gồm text, markdown, hoặc HTML đơn giản. Bắt buộc phải nhập nội dung.
            </p>
          </div>          {/* Position - Hidden but kept in formData for backend compatibility */}
          <input
            type="hidden"
            name="position"
            value={formData.position}
          />
        </div>

        {/* Preview */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Xem trước</h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="flex items-center mb-4">
              {formData.video_url ? (
                <Play className="w-6 h-6 text-purple-600 mr-2" />
              ) : (
                <FileText className="w-6 h-6 text-gray-400 mr-2" />
              )}
              <h3 className="text-lg font-medium text-gray-900">
                {formData.title || 'Tiêu đề bài học'}
              </h3>
            </div>
            
            {formData.video_url && validateVideoUrl(formData.video_url) && (
              <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-700">
                  📹 Video: {formData.video_url}
                </p>
              </div>
            )}
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Nội dung:</h4>
              <div className="text-sm text-gray-600 whitespace-pre-wrap">
                {formData.content || 'Nội dung bài học sẽ hiển thị ở đây...'}
              </div>
            </div>
            
            <div className="mt-4 text-xs text-gray-500">
              Vị trí: {formData.position}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-4 sm:justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={saving}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold"
          >
            Hủy
          </button>
          
          <button
            type="submit"
            disabled={saving || !formData.title.trim() || !isLessonValid() || (formData.video_url && !validateVideoUrl(formData.video_url))}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-all"
          >
            {saving ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isEdit ? 'Đang cập nhật...' : 'Đang tạo...'}
              </div>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2 inline" />
                {isEdit ? 'Cập nhật bài học' : 'Tạo bài học'}
              </>
            )}
          </button>
        </div>        </form>
      </div>
    </TeacherLayout>
  );
};

export default CreateEditLesson;
