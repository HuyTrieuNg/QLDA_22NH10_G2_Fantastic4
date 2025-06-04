import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, BookOpen } from 'lucide-react';
import { sectionService, courseService } from '../../services/courseService';
import toast from 'react-hot-toast';
import TeacherLayout from '../common/TeacherLayout';

const CreateEditSection = ({ isEdit = false }) => {
  const { courseId, sectionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [course, setCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    position: 1
  });

  useEffect(() => {
    fetchInitialData();
  }, [courseId, sectionId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      if (isEdit && sectionId) {
        // Fetch section data for editing
        const sectionResponse = await sectionService.getSectionDetail(sectionId);
        const section = sectionResponse.data;
        
        setFormData({
          title: section.title || '',
          description: section.description || '',
          position: section.position || 1
        });
        
        // Also fetch course info
        const courseResponse = await courseService.getCourseDetail(section.course);
        setCourse(courseResponse.data);
      } else {
        // Creating new section, just fetch course info
        const courseResponse = await courseService.getCourseDetail(courseId);
        setCourse(courseResponse.data);
        
        // Get section count to set position
        const sectionsResponse = await sectionService.getCourseSections(courseId);
        setFormData(prev => ({
          ...prev,
          position: sectionsResponse.data.length + 1
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề chương');
      return;
    }

    try {
      setSaving(true);
      
      if (isEdit) {
        await sectionService.updateSection(sectionId, formData);
        toast.success('Cập nhật chương thành công!');
      } else {
        await sectionService.createSection(courseId, formData);
        toast.success('Tạo chương thành công!');
      }
      
      navigate(`/teacher/courses/${courseId}/`);
    } catch (error) {
      toast.error(isEdit ? 'Không thể cập nhật chương' : 'Không thể tạo chương');
      console.error('Error saving section:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }
  return (
    <TeacherLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            {isEdit ? 'Chỉnh sửa chương' : 'Tạo chương mới'}
          </h1>
          {course && (
            <p className="mt-2 text-gray-600">
              Khóa học: {course.title}
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Thông tin chương</h2>
          
          {/* Section Title */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề chương *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Ví dụ: Giới thiệu về Python"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          {/* Section Description */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả chương (tùy chọn)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Mô tả ngắn gọn về nội dung của chương này..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
            <p className="mt-1 text-sm text-gray-500">
              Mô tả sẽ giúp học sinh hiểu rõ hơn về nội dung chương học
            </p>
          </div>

          {/* Position */}
          <div className="mb-6">
            <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
              Vị trí trong khóa học
            </label>
            <input
              type="number"
              id="position"
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">
              Thứ tự hiển thị của chương trong khóa học
            </p>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Xem trước</h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <BookOpen className="w-6 h-6 text-purple-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">
                {formData.title || 'Tiêu đề chương'}
              </h3>
            </div>
            
            {formData.description && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  {formData.description}
                </p>
              </div>
            )}
            
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
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>
          
          <button
            type="submit"
            disabled={saving || !formData.title.trim()}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isEdit ? 'Đang cập nhật...' : 'Đang tạo...'}
              </div>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2 inline" />
                {isEdit ? 'Cập nhật chương' : 'Tạo chương'}
              </>
            )}
          </button>
        </div>        </form>
      </div>
    </TeacherLayout>
  );
};

export default CreateEditSection;
