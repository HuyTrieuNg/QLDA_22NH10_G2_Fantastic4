import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  Search, 
  Download, 
  Mail, 
  Calendar,
  TrendingUp,
  User
} from 'lucide-react';
import { courseService } from '../../services/courseService';
import toast from 'react-hot-toast';
import TeacherLayout from '../common/TeacherLayout';

const CourseStudents = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [courseResponse, studentsResponse] = await Promise.all([
        courseService.getCourseDetail(id),
        courseService.getCourseStudents(id)
      ]);
      
      setCourse(courseResponse.data);
      setStudents(studentsResponse.data);
    } catch (error) {
      toast.error('Không thể tải danh sách học viên');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    return (
      student.user.username.toLowerCase().includes(searchLower) ||
      student.user.email.toLowerCase().includes(searchLower) ||
      (student.user.first_name + ' ' + student.user.last_name).toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatProgress = (progress) => {
    return Math.round(progress);
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  const exportStudentList = () => {
    const csvContent = [
      ['Tên', 'Email', 'Ngày đăng ký', 'Tiến độ (%)'].join(','),
      ...filteredStudents.map(student => [
        `"${student.user.first_name} ${student.user.last_name}"`,
        student.user.email,
        formatDate(student.enrolled_at),
        formatProgress(student.progress)
      ].join(','))
    ].join('\n');

    // Thêm UTF-8 BOM để hỗ trợ tiếng Việt
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;
    
    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `students_${course?.title || 'course'}.csv`;

    // link.download = `danh_sach_hoc_vien_${course?.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'course'}.csv`;
    link.click();
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
          <h2 className="text-2xl font-bold text-gray-900">Không tìm thấy khóa học</h2>
          <button 
            onClick={() => navigate('/teacher/courses')}
            className="mt-4 text-purple-600 hover:text-purple-700"
          >
            ← Quay lại danh sách khóa học
          </button>
        </div>
      </div>
    );  }

  return (
    <TeacherLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
        <button
          onClick={() => navigate(`/teacher/courses/${id}`)}
          className="mr-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Học viên của khóa học</h1>
          <p className="mt-2 text-gray-600">{course.title}</p>
        </div>
        <button
          onClick={exportStudentList}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
        >
          <Download className="w-4 h-4 mr-2" />
          Xuất danh sách
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng học viên</p>
              <p className="text-2xl font-bold text-gray-900">{students.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tiến độ trung bình</p>
              <p className="text-2xl font-bold text-gray-900">
                {students.length > 0 
                  ? Math.round(students.reduce((sum, s) => sum + s.progress, 0) / students.length)
                  : 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đăng ký gần đây</p>
              <p className="text-2xl font-bold text-gray-900">
                {students.filter(s => {
                  const enrolledDate = new Date(s.enrolled_at);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return enrolledDate >= weekAgo;
                }).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
              <p className="text-2xl font-bold text-gray-900">
                {students.filter(s => s.progress >= 100).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            {students.length === 0 ? (
              <>
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có học viên nào</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Khóa học chưa có học viên đăng ký
                </p>
              </>
            ) : (
              <>
                <Search className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy học viên</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Thử tìm kiếm với từ khóa khác
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Học viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày đăng ký
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tiến độ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-purple-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.user.first_name} {student.user.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            @{student.user.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(student.enrolled_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                          <div
                            className={`h-2 rounded-full ${getProgressColor(student.progress)}`}
                            style={{ width: `${Math.min(student.progress, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {formatProgress(student.progress)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <a
                        href={`mailto:${student.user.email}`}
                        className="text-purple-600 hover:text-purple-900 flex items-center"
                      >
                        <Mail className="w-4 h-4 mr-1" />
                        Gửi email
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      {filteredStudents.length > 0 && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>
              Hiển thị {filteredStudents.length} trong tổng số {students.length} học viên
            </span>
            <span>
              Cập nhật lần cuối: {formatDate(new Date())}
            </span>
          </div>
        </div>
      )}      </div>
    </TeacherLayout>
  );
};

export default CourseStudents;
