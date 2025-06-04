import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { courseService } from '../../services/courseService';
import toast from 'react-hot-toast';
import TeacherLayout from '../common/TeacherLayout';
import { categories } from '../../constants/categories';

const CreateCourse = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    category: '',
    price: '',
    published: false
  });


  const validateForm = () => {
    const errors = {};

    // Title validation
    if (!formData.title.trim()) {
      errors.title = 'Tiêu đề khóa học là bắt buộc';
    } else if (formData.title.trim().length < 10) {
      errors.title = 'Tiêu đề phải có ít nhất 10 ký tự';
    } else if (formData.title.trim().length > 100) {
      errors.title = 'Tiêu đề không được vượt quá 100 ký tự';
    }

    // Description validation
    if (!formData.description.trim()) {
      errors.description = 'Mô tả khóa học là bắt buộc';
    } else if (formData.description.trim().length < 50) {
      errors.description = 'Mô tả phải có ít nhất 50 ký tự';
    } else if (formData.description.trim().length > 1000) {
      errors.description = 'Mô tả không được vượt quá 1000 ký tự';
    }    // Price validation
    if (formData.price < 0) {
      errors.price = 'Giá không được âm';
    } else if (formData.price > 10000) {
      errors.price = 'Giá không được vượt quá $10,000 USD';
    }

    // Category validation
    if (!formData.category.trim()) {
      errors.category = 'Danh mục là bắt buộc';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin đã nhập');
      return;
    }

    try {
      setLoading(true);
      const response = await courseService.createCourse(formData);
      toast.success('Tạo khóa học thành công!');
      navigate(`/teacher/courses/${response.data.id}`);
    } catch (error) {
      if (error.response?.data?.title) {
        toast.error('Tiêu đề khóa học đã tồn tại');
      } else {
        toast.error('Không thể tạo khóa học. Vui lòng thử lại.');
      }
      console.error('Error creating course:', error);    } finally {
      setLoading(false);
    }
  };

  return (
    <TeacherLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate('/teacher/courses')}
          className="mr-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tạo khóa học mới</h1>
          <p className="mt-2 text-gray-600">Tạo khóa học để chia sẻ kiến thức của bạn</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Thông tin cơ bản</h2>
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
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                validationErrors.title 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-300'
              }`}
              required
            />
            {validationErrors.title ? (
              <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
            ) : (
              <p className="mt-1 text-sm text-gray-500">
                Tiêu đề hấp dẫn sẽ giúp thu hút học viên (10-100 ký tự)
              </p>
            )}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>          {/* Course Description */}
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
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${
                validationErrors.description 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-300'
              }`}
              required
            />
            {validationErrors.description ? (
              <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
            ) : (
              <p className="mt-1 text-sm text-gray-500">
                Mô tả chi tiết sẽ giúp học viên hiểu rõ về khóa học (50-1000 ký tự)
              </p>
            )}
          </div>

          {/* Category and Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  validationErrors.category 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300'
                }`}
              >
                <option value="">Chọn danh mục</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {validationErrors.category && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.category}</p>
              )}
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
                min="0"
                step="0.01"
                placeholder="11.99"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  validationErrors.price 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300'
                }`}
              />
              {validationErrors.price ? (
                <p className="mt-1 text-sm text-red-600">{validationErrors.price}</p>
              ) : (
                <p className="mt-1 text-sm text-gray-500">Để trống nếu khóa học miễn phí</p>
              )}
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
                Xuất bản khóa học ngay lập tức
              </label>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Nếu không chọn, khóa học sẽ được lưu dưới dạng bản nháp
            </p>
          </div>
        </div>

        {/* Course Content Preview */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Xem trước</h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <Eye className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {formData.title || 'Tiêu đề khóa học'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {formData.subtitle || 'Phụ đề khóa học'}
              </p>
              <div className="mt-4 text-left bg-gray-50 rounded-lg p-4">
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
            </div>
          </div>
        </div>        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-4 sm:justify-end">
          <button
            type="button"
            onClick={() => navigate('/teacher/courses')}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>
          
          <button
            type="submit"
            disabled={loading || !formData.title.trim() || !formData.description.trim()}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang tạo...
              </div>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2 inline" />
                {formData.published ? 'Tạo và xuất bản' : 'Tạo khóa học'}
              </>
            )}
          </button>
        </div>        </form>
      </div>
    </TeacherLayout>
  );
};

export default CreateCourse;
