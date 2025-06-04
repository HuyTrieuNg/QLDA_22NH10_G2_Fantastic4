import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Users, 
  Plus, 
  ChevronDown, 
  ChevronRight,
  Play,
  FileText,
  MoreVertical,
  Trash2,
  Eye,
  Settings,
  HelpCircle,
  Bot
} from 'lucide-react';
import { courseService, sectionService, lessonService, quizService } from '../../services/courseService';
import toast from 'react-hot-toast';
import TeacherLayout from '../common/TeacherLayout';
import DragDropList from '../common/DragDropList';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [showDropdown, setShowDropdown] = useState(null);
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState("");
  const [editingSectionLoading, setEditingSectionLoading] = useState(false);

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const [courseResponse, sectionsResponse] = await Promise.all([
        courseService.getCourseDetail(id),
        sectionService.getCourseSections(id)
      ]);
      
      setCourse(courseResponse.data);
      setSections(sectionsResponse.data);
      
      // Expand first section by default
      if (sectionsResponse.data.length > 0) {
        setExpandedSections(new Set([sectionsResponse.data[0].id]));
      }
    } catch (error) {
      toast.error('Không thể tải thông tin khóa học');
      console.error('Error fetching course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSection = async (e) => {
    e.preventDefault();
    if (!newSectionTitle.trim()) return;

    try {
      const sectionData = {
        title: newSectionTitle,
        position: sections.length + 1
      };
      
      await sectionService.createSection(id, sectionData);
      toast.success('Tạo chương mới thành công');
      setNewSectionTitle('');
      setShowSectionForm(false);
      fetchCourseData();
    } catch (error) {
      toast.error('Không thể tạo chương mới');
      console.error('Error creating section:', error);
    }
  };
  const handleDeleteSection = async (sectionId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa chương này?')) {
      try {
        await sectionService.deleteSection(sectionId);
        toast.success('Xóa chương thành công');
        fetchCourseData();
      } catch (error) {
        toast.error('Không thể xóa chương');
        console.error('Error deleting section:', error);
      }
    }
  };

  const handleDeleteLesson = async (lessonId, lessonTitle) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa bài học "${lessonTitle}"?`)) {
      try {
        await lessonService.deleteLesson(lessonId);
        toast.success('Xóa bài học thành công!');
        fetchCourseData(); // Refresh data
      } catch (error) {
        toast.error('Không thể xóa bài học');
        console.error('Error deleting lesson:', error);
      }
    }
  };

  const handleDeleteQuiz = async (quizId, quizTitle) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa bài kiểm tra "${quizTitle}"?`)) {
      try {
        await quizService.deleteQuiz(quizId);
        toast.success('Xóa bài kiểm tra thành công!');
        fetchCourseData(); // Refresh data
      } catch (error) {
        toast.error('Không thể xóa bài kiểm tra');
        console.error('Error deleting quiz:', error);
      }
    }
  };

  const handleSectionReorder = async (newOrder) => {
    try {
      // Update local state immediately for better UX
      setSections(newOrder);
      
      // Send the new order to the backend
      const updatePromises = newOrder.map((section, index) => 
        sectionService.updateSection(section.id, { position: index + 1 })
      );
      
      await Promise.all(updatePromises);
      toast.success('Cập nhật thứ tự chương thành công');
    } catch (error) {
      toast.error('Không thể cập nhật thứ tự chương');
      console.error('Error reordering sections:', error);
      // Revert to original order on error
      fetchCourseData();
    }
  };

  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatPrice = (price) => {    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };
  const getTotalLessons = () => {
    return sections.reduce((total, section) => total + (section.lessons?.length || 0), 0);
  };

  // Handle thumbnail upload
  const handleThumbnailUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Chỉ chấp nhận file ảnh định dạng JPEG, PNG hoặc WebP!');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước file không được vượt quá 5MB!');
      return;
    }

    const formData = new FormData();
    formData.append('thumbnail', file);

    try {
      setUploadingThumbnail(true);
      const response = await courseService.updateCourseThumbnail(id, formData);
      setCourse(prev => ({ ...prev, thumbnail: response.data.thumbnail }));
      toast.success('Cập nhật ảnh thumbnail thành công!');
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      toast.error('Có lỗi khi cập nhật ảnh thumbnail!');
    } finally {
      setUploadingThumbnail(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const getSectionIcon = (section) => {
    return <FileText className="w-4 h-4 text-purple-600" />;
  };

  const getSectionSubtext = (section, index) => {
    const lessonCount = section.lessons?.length || 0;
    const quizCount = section.quizzes?.length || 0;
    return `${lessonCount} bài học • ${quizCount} bài kiểm tra`;
  };

  const renderSectionItem = (section, index) => {
    return (
      <div className="space-y-4">
        {/* Section Content when expanded */}
        {expandedSections.has(section.id) && (
          <div className="ml-6 space-y-2">            {/* Lessons */}
            {section.lessons?.map((lesson, lessonIndex) => (
              <div key={lesson.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Play className="w-4 h-4 text-purple-600 mr-3" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">
                    {lessonIndex + 1}. {lesson.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/teacher/sections/${section.id}/lessons/${lesson.id}/edit`}
                    className="text-purple-600 hover:text-purple-700 text-sm px-2 py-1 rounded hover:bg-purple-50"
                    title="Chỉnh sửa bài học"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                    className="text-red-600 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50 flex items-center"
                    title="Xóa bài học"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )) || (
              <div className="text-center py-4 text-gray-500 text-sm">
                Chưa có bài học nào
              </div>
            )}            {/* Quizzes */}
            {section.quizzes?.map((quiz, quizIndex) => (
              <div key={quiz.id} className="flex items-center p-3 bg-blue-50 rounded-lg">
                <HelpCircle className="w-4 h-4 text-blue-600 mr-3" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">
                    Bài kiểm tra: {quiz.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/teacher/sections/${section.id}/quizzes/${quiz.id}/edit`}
                    className="text-blue-600 hover:text-blue-700 text-sm px-2 py-1 rounded hover:bg-blue-100"
                    title="Chỉnh sửa bài kiểm tra"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <Link
                    to={`/teacher/sections/${section.id}/quizzes/${quiz.id}/results`}
                    className="text-green-600 hover:text-green-700 text-sm px-2 py-1 rounded hover:bg-green-100"
                    title="Xem kết quả bài kiểm tra"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                    className="text-red-600 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50 flex items-center"
                    title="Xóa bài kiểm tra"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )) || null}

            {/* Add Content Buttons */}            <div className="flex gap-2 pt-2">
              <Link
                to={`/teacher/sections/${section.id}/lessons/create`}
                className="text-sm text-purple-600 hover:text-purple-700 flex items-center"
              >
                <Plus className="w-3 h-3 mr-1" />
                Thêm bài học
              </Link>
              <span className="text-gray-300">•</span>
              <Link
                to={`/teacher/sections/${section.id}/quizzes/create`}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
              >
                <Plus className="w-3 h-3 mr-1" />
                Thêm bài kiểm tra
              </Link>
              <span className="text-gray-300">•</span>
              <Link
                to={`/teacher/sections/${section.id}/generate-quiz`}
                className="text-sm text-green-600 hover:text-green-700 flex items-center"
              >
                <Bot className="w-3 h-3 mr-1" />
                Tạo câu hỏi AI
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleSectionEdit = (sectionID) => {
    const section = sections.find((s) => s.id === sectionID);
    setEditingSectionId(sectionID);
    setEditingSectionTitle(section?.title || "");
  };

  const handleSectionEditCancel = () => {
    setEditingSectionId(null);
    setEditingSectionTitle("");
  };

  const handleSectionEditSave = async (sectionID) => {
    if (!editingSectionTitle.trim()) {
      toast.error("Vui lòng nhập tiêu đề chương");
      return;
    }
    setEditingSectionLoading(true);
    try {
      await sectionService.updateSection(sectionID, { title: editingSectionTitle });
      toast.success("Cập nhật chương thành công!");
      setEditingSectionId(null);
      setEditingSectionTitle("");
      fetchCourseData();
    } catch (error) {
      toast.error("Không thể cập nhật chương");
      console.error("Error updating section:", error);
    } finally {
      setEditingSectionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Không tìm thấy khóa học</h2>          <Link to="/teacher/courses" className="mt-4 text-purple-600 hover:text-purple-700">
            ← Quay lại danh sách khóa học
          </Link>
        </div>
      </div>
    );
  }

  return (
    <TeacherLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
        <button
          onClick={() => navigate('/teacher/courses')}
          className="mr-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              course.published 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {course.published ? 'Đã xuất bản' : 'Bản nháp'}
            </span>
          </div>
          {course.subtitle && (
            <p className="text-gray-600">{course.subtitle}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            to={`/teacher/courses/${course.id}/edit`}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
          >
            <Edit className="w-4 h-4 mr-2" />
            Chỉnh sửa
          </Link>
          <Link
            to={`/teacher/courses/${course.id}/students`}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
          >
            <Users className="w-4 h-4 mr-2" />
            Học viên
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">            {/* Thumbnail */}
            <div className="relative h-48 bg-gray-200 flex items-center justify-center group">
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <Eye className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Chưa có ảnh thumbnail</p>
                </div>
              )}
              
              {/* Upload overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <label className="cursor-pointer bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2">
                  {uploadingThumbnail ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                      <span className="text-sm">Đang tải...</span>
                    </>
                  ) : (
                    <>
                      <Settings className="w-4 h-4" />
                      <span className="text-sm">Cập nhật ảnh</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleThumbnailUpload}
                    disabled={uploadingThumbnail}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Course Stats */}
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Giá khóa học:</span>
                  <span className="font-semibold text-purple-600">
                    {formatPrice(course.price)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Danh mục:</span>
                  <span className="font-medium">{course.category || 'Chưa phân loại'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số chương:</span>
                  <span className="font-medium">{sections.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số bài học:</span>
                  <span className="font-medium">{getTotalLessons()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Học viên:</span>
                  <span className="font-medium">{course.student_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày tạo:</span>
                  <span className="font-medium">{formatDate(course.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cập nhật:</span>
                  <span className="font-medium">{formatDate(course.last_updated_at)}</span>
                </div>
              </div>

              {/* Course Description */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Mô tả khóa học</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {course.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl">
            {/* Content Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Nội dung khóa học</h2>
                <button
                  onClick={() => setShowSectionForm(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-all"
                >
                  <Plus className="w-4 h-4 mr-2 inline" />
                  Thêm chương
                </button>
              </div>
            </div>

            {/* Add Section Form */}
            {showSectionForm && (
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                <form onSubmit={handleCreateSection} className="flex gap-2">
                  <input
                    type="text"
                    value={newSectionTitle}
                    onChange={(e) => setNewSectionTitle(e.target.value)}
                    placeholder="Tên chương mới..."
                    className="flex-1 px-5 py-3 rounded-xl border border-gray-300 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-all"
                  >
                    Thêm
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSectionForm(false);
                      setNewSectionTitle('');
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold"
                  >
                    Hủy
                  </button>
                </form>
              </div>
            )}            {/* Sections List */}
            <div className="divide-y divide-gray-200">
              {sections.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Chưa có nội dung nào
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Bắt đầu tạo chương đầu tiên cho khóa học của bạn
                  </p>
                  <button
                    onClick={() => setShowSectionForm(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-all"
                  >
                    <Plus className="w-4 h-4 mr-2 inline" />
                    Tạo chương đầu tiên
                  </button>
                </div>              ) : (
                <DragDropList
                  items={sections}
                  onReorder={handleSectionReorder}
                  onEdit={handleSectionEdit}
                  onDelete={handleDeleteSection}
                  getItemIcon={getSectionIcon}
                  getItemSubtext={getSectionSubtext}
                  renderItem={(section, index) => (
                    <div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            Chương {index + 1}: {editingSectionId === section.id ? (
                              <input
                                type="text"
                                value={editingSectionTitle}
                                onChange={e => setEditingSectionTitle(e.target.value)}
                                className="border px-2 py-1 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                disabled={editingSectionLoading}
                                autoFocus
                                onKeyDown={e => {
                                  if (e.key === 'Enter') handleSectionEditSave(section.id);
                                  if (e.key === 'Escape') handleSectionEditCancel();
                                }}
                              />
                            ) : (
                              section.title
                            )}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {getSectionSubtext(section, index)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {editingSectionId === section.id ? (
                            <>
                              <button
                                className="px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-xs"
                                onClick={() => handleSectionEditSave(section.id)}
                                disabled={editingSectionLoading}
                              >
                                Lưu
                              </button>
                              <button
                                className="px-2 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-xs"
                                onClick={handleSectionEditCancel}
                                disabled={editingSectionLoading}
                              >
                                Hủy
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => toggleSection(section.id)}
                              className="p-1 hover:bg-gray-100 rounded"
                              title={expandedSections.has(section.id) ? "Thu gọn" : "Mở rộng"}
                            >
                              {expandedSections.has(section.id) ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      {renderSectionItem(section, index)}
                    </div>
                  )}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </TeacherLayout>
  );
};

export default CourseDetail;

// TODO: Cần API endpoint backend cho giáo viên lấy kết quả bài kiểm tra của quiz này, ví dụ:
// GET /api/teacher/quizzes/{quiz_id}/results/
// Trả về danh sách học viên đã làm, điểm số, chi tiết từng lần làm, ...
