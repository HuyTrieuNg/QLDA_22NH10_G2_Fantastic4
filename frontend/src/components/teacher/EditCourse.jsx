import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { courseService } from '../../services/courseService';
import toast from 'react-hot-toast';
import TeacherLayout from '../common/TeacherLayout';

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    category: '',
    price: '',
    published: false
  });

  const categories = [
    'Programming',
    'Design',
    'Business',
    'Marketing',
    'Photography',
    'Music',
    'Health & Fitness',
    'Language',
    'Lifestyle',
    'Personal Development'
  ];

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await courseService.getCourseDetail(id);
      const course = response.data;
      
      setFormData({
        title: course.title || '',
        subtitle: course.subtitle || '',
        description: course.description || '',
        category: course.category || '',
        price: course.price || '',
        published: course.published || false
      });
    } catch (error) {
      toast.error('Không thể tải thông tin khóa học');
      console.error('Error fetching course:', error);
      navigate('/teacher/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề khóa học');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Vui lòng nhập mô tả khóa học');
      return;
    }

    try {
      setSaving(true);
      await courseService.updateCourse(id, formData);
      toast.success('Cập nhật khóa học thành công!');
      navigate(`/teacher/courses/${id}`);
    } catch (error) {
      if (error.response?.data?.title) {
        toast.error('Tiêu đề khóa học đã tồn tại');
      } else {
        toast.error('Không thể cập nhật khóa học. Vui lòng thử lại.');
      }
      console.error('Error updating course:', error);
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
          onClick={() => navigate(`/teacher/courses/${id}`)}
          className="mr-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa khóa học</h1>
          <p className="mt-2 text-gray-600">Cập nhật thông tin khóa học của bạn</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Thông tin cơ bản</h2>
            <div className="text-sm text-gray-500 bg-blue-50 px-3 py-1 rounded-lg">
              💡 Thay đổi chỉ được áp dụng khi "Lưu thay đổi"
            </div>
          </div>
          
          {/* Course Title */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề khóa học *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Ví dụ: Lập trình Python từ cơ bản đến nâng cao"
              className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-blue-500"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Tiêu đề hấp dẫn sẽ giúp thu hút học viên
            </p>
          </div>

          {/* Course Subtitle */}
          <div className="mb-6">
            <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-2">
              Phụ đề khóa học
            </label>
            <input
              type="text"
              id="subtitle"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleInputChange}
              placeholder="Mô tả ngắn gọn về khóa học"
              className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-blue-500"
            />
          </div>

          {/* Course Description */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả khóa học *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={6}
              placeholder="Mô tả chi tiết về nội dung, mục tiêu học tập và đối tượng học viên..."
              className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-blue-500 resize-none"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Mô tả chi tiết sẽ giúp học viên hiểu rõ về khóa học
            </p>
          </div>

          {/* Category and Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-blue-500"
              >
                <option value="">Chọn danh mục</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Giá khóa học (USD)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"                step="0.01"
                placeholder="11.99"
                className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Published Status */}
          <div className="mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="published"
                name="published"
                checked={formData.published}
                onChange={handleInputChange}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="published" className="ml-2 block text-sm text-gray-700">
                Xuất bản khóa học
              </label>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Khóa học đã xuất bản sẽ hiển thị công khai cho học viên
            </p>
          </div>
        </div>

        {/* Course Content Preview */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Xem trước</h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8">
            <div className="text-center">
              <Eye className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {formData.title || 'Tiêu đề khóa học'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {formData.subtitle || 'Phụ đề khóa học'}
              </p>
              <div className="mt-4 text-left bg-gray-50 rounded-2xl p-4">
                <p className="text-sm text-gray-600">
                  {formData.description || 'Mô tả khóa học sẽ hiển thị ở đây...'}
                </p>
              </div>
              {formData.category && (
                <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {formData.category}
                </div>
              )}              {formData.price && (
                <div className="mt-2 text-lg font-bold text-purple-600">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(formData.price)}
                </div>
              )}
              <div className="mt-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  formData.published 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {formData.published ? 'Đã xuất bản' : 'Bản nháp'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-4 sm:justify-end">          <button
            type="button"
            onClick={() => navigate(`/teacher/courses/${id}`)}
            disabled={saving}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>
          
          <button
            type="submit"
            disabled={saving || !formData.title.trim() || !formData.description.trim()}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang lưu...
              </div>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2 inline" />
                Lưu thay đổi
              </>
            )}
          </button>
        </div>        </form>
      </div>
    </TeacherLayout>
  );
};

export default EditCourse;
