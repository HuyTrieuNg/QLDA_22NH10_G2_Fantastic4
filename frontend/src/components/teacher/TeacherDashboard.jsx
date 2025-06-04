import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Star,
  Plus,
  Eye,
  Edit,
  Calendar,
  DollarSign,
  Award
} from 'lucide-react';
import { courseService } from '../../services/courseService';
import TeacherLayout from '../common/TeacherLayout';
import toast from 'react-hot-toast';

const TeacherDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [recentCourses, setRecentCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardResponse, coursesResponse] = await Promise.all([
        courseService.getTeacherDashboard(),
        courseService.getMyCourses()
      ]);
      
      setDashboardData(dashboardResponse.data);
      // Get 5 most recent courses
      const sortedCourses = coursesResponse.data
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
      setRecentCourses(sortedCourses);
    } catch (error) {
      toast.error('Không thể tải dữ liệu dashboard');
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatPrice = (price) => {    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Giáo viên</h1>
          <p className="mt-2 text-gray-600">
            Chào mừng bạn quay trở lại! Đây là tổng quan về các khóa học của bạn.
          </p>
        </div>
        <Link
          to="/teacher/courses/create"
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors shadow-lg transform hover:scale-105"
        >
          <Plus className="w-5 h-5 mr-2" />
          Tạo khóa học mới
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow">
          <div className="flex items-center">
            <BookOpen className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng khóa học</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.total_courses || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow">
          <div className="flex items-center">
            <Eye className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đã xuất bản</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.published_courses || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng học viên</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.total_students || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow">
          <div className="flex items-center">
            <Star className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Khóa học nổi bật</p>
              <p className="text-sm font-bold text-gray-900">
                {dashboardData?.popular_course?.title || 'Chưa có'}
              </p>
              <p className="text-xs text-gray-500">
                {dashboardData?.popular_course?.student_count || 0} học viên
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Courses */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl">
            <div className="p-8 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Khóa học gần đây</h2>
                <Link
                  to="/teacher/courses"
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  Xem tất cả →
                </Link>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {recentCourses.length === 0 ? (
                <div className="p-6 text-center">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Chưa có khóa học nào
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Bắt đầu bằng cách tạo khóa học đầu tiên
                  </p>
                  <Link
                    to="/teacher/courses/create"
                    className="mt-6 inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Tạo khóa học
                  </Link>
                </div>
              ) : (
                recentCourses.map((course) => (
                  <div key={course.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {course.title}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            course.published 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {course.published ? 'Đã xuất bản' : 'Bản nháp'}
                          </span>
                        </div>
                        {course.subtitle && (
                          <p className="text-sm text-gray-600 mb-2">{course.subtitle}</p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {course.student_count || 0} học viên
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(course.created_at)}
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {formatPrice(course.price)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Link
                          to={`/teacher/courses/${course.id}`}
                          className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/teacher/courses/${course.id}/edit`}
                          className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions & Tips */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
            <div className="space-y-3">
              <Link
                to="/teacher/courses/create"
                className="flex items-center p-3 text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <Plus className="w-5 h-5 mr-3" />
                Tạo khóa học mới
              </Link>
              <Link
                to="/teacher/courses"
                className="flex items-center p-3 text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <BookOpen className="w-5 h-5 mr-3" />
                Quản lý khóa học
              </Link>
              <Link
                to="/profile"
                className="flex items-center p-3 text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Edit className="w-5 h-5 mr-3" />
                Cập nhật profile
              </Link>
            </div>
          </div>

          {/* Performance Overview */}
          {dashboardData?.popular_course && (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Khóa học nổi bật
              </h3>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                <div className="flex items-center mb-2">
                  <Award className="w-6 h-6 mr-2" />
                  <span className="text-sm font-medium">Khóa học hàng đầu</span>
                </div>
                <h4 className="font-bold text-lg mb-1">
                  {dashboardData.popular_course.title}
                </h4>
                <div className="flex items-center justify-between text-sm">
                  <span>{dashboardData.popular_course.student_count} học viên</span>
                  <Link
                    to={`/teacher/courses/${dashboardData.popular_course.id}`}
                    className="text-white hover:text-purple-200 underline"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mẹo cho giáo viên</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>Sử dụng tính năng tạo bài kiểm tra tự động để tiết kiệm thời gian xây dựng nội dung.</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>Thường xuyên gửi thông báo cho học viên qua email để duy trì sự tương tác.</p>
              </div>
             
            </div>
          </div>
        </div>
      </div>
      </div>
    </TeacherLayout>
  );
};

export default TeacherDashboard;
