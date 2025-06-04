import React, { useState, useEffect } from "react";
import {
  FiUsers,
  FiBook,
  FiBookOpen,
  FiCheckCircle,
  FiUserCheck,
  FiUserX,
  FiFileText,
  FiClock,
  FiAlertCircle,
} from "react-icons/fi";
import { getDashboardStats } from "../../../services/adminService";
import StatsCard from "../common/StatsCard";
import { toast } from "react-hot-toast";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const response = await getDashboardStats();
        setStats(response.data);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError("Không thể tải dữ liệu thống kê.");
        toast.error("Không thể tải dữ liệu thống kê.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <div className="flex items-center">
          <FiAlertCircle className="mr-2" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Thống kê hệ thống</h1>

      {/* User Statistics */}
      <section className="mb-8">
        <h2 className="text-lg font-medium mb-4 text-gray-700">Người dùng</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Tổng số người dùng"
            value={stats?.users?.total || 0}
            icon={<FiUsers size={24} />}
            color="blue"
          />
          <StatsCard
            title="Giáo viên"
            value={stats?.users?.teachers || 0}
            icon={<FiUserCheck size={24} />}
            color="green"
          />
          <StatsCard
            title="Học sinh"
            value={stats?.users?.students || 0}
            icon={<FiBook size={24} />}
            color="indigo"
          />
          <StatsCard
            title="Tài khoản không hoạt động"
            value={stats?.users?.inactive || 0}
            icon={<FiUserX size={24} />}
            color="red"
          />
        </div>
      </section>

      {/* Course Statistics */}
      <section className="mb-8">
        <h2 className="text-lg font-medium mb-4 text-gray-700">Khóa học</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title="Tổng số khóa học"
            value={stats?.courses?.total || 0}
            icon={<FiBookOpen size={24} />}
            color="purple"
          />
          <StatsCard
            title="Đã xuất bản"
            value={stats?.courses?.published || 0}
            icon={<FiCheckCircle size={24} />}
            color="green"
          />
          <StatsCard
            title="Chưa xuất bản"
            value={stats?.courses?.unpublished || 0}
            icon={<FiClock size={24} />}
            color="yellow"
          />
        </div>
      </section>

      {/* Content Statistics */}
      <section className="mb-8">
        <h2 className="text-lg font-medium mb-4 text-gray-700">Nội dung</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title="Phần học"
            value={stats?.content?.sections || 0}
            icon={<FiFileText size={24} />}
            color="blue"
          />
          <StatsCard
            title="Bài học"
            value={stats?.content?.lessons || 0}
            icon={<FiFileText size={24} />}
            color="indigo"
          />
          <StatsCard
            title="Bài kiểm tra"
            value={stats?.content?.quizzes || 0}
            icon={<FiFileText size={24} />}
            color="purple"
          />
        </div>
      </section>

      {/* Charts & Analytics */}
      <section className="mb-8">
        <h2 className="text-lg font-medium mb-4 text-gray-700">
          Biểu đồ phân tích
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Distribution Chart */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-md font-medium mb-4 text-gray-700">
              Phân bố người dùng
            </h3>
            <div className="h-64">
              <Doughnut
                data={{
                  labels: ["Giáo viên", "Học sinh", "Không hoạt động"],
                  datasets: [
                    {
                      data: [
                        stats?.users?.teachers || 0,
                        stats?.users?.students || 0,
                        stats?.users?.inactive || 0,
                      ],
                      backgroundColor: [
                        "rgba(54, 162, 235, 0.7)",
                        "rgba(75, 192, 192, 0.7)",
                        "rgba(255, 99, 132, 0.7)",
                      ],
                      borderColor: [
                        "rgba(54, 162, 235, 1)",
                        "rgba(75, 192, 192, 1)",
                        "rgba(255, 99, 132, 1)",
                      ],
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Course Status Chart */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-md font-medium mb-4 text-gray-700">
              Trạng thái khóa học
            </h3>
            <div className="h-64">
              <Bar
                data={{
                  labels: ["Đã xuất bản", "Chưa xuất bản"],
                  datasets: [
                    {
                      label: "Số lượng khóa học",
                      data: [
                        stats?.courses?.published || 0,
                        stats?.courses?.unpublished || 0,
                      ],
                      backgroundColor: [
                        "rgba(75, 192, 192, 0.7)",
                        "rgba(255, 206, 86, 0.7)",
                      ],
                      borderColor: [
                        "rgba(75, 192, 192, 1)",
                        "rgba(255, 206, 86, 1)",
                      ],
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Content Distribution Chart */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-md font-medium mb-4 text-gray-700">
              Phân bố nội dung
            </h3>
            <div className="h-64">
              <Bar
                data={{
                  labels: ["Phần học", "Bài học", "Bài kiểm tra"],
                  datasets: [
                    {
                      label: "Số lượng",
                      data: [
                        stats?.content?.sections || 0,
                        stats?.content?.lessons || 0,
                        stats?.content?.quizzes || 0,
                      ],
                      backgroundColor: [
                        "rgba(54, 162, 235, 0.7)",
                        "rgba(153, 102, 255, 0.7)",
                        "rgba(255, 159, 64, 0.7)",
                      ],
                      borderColor: [
                        "rgba(54, 162, 235, 1)",
                        "rgba(153, 102, 255, 1)",
                        "rgba(255, 159, 64, 1)",
                      ],
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* System Growth Chart (Placeholder - would need actual data) */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-md font-medium mb-4 text-gray-700">
              Tăng trưởng theo tháng
            </h3>
            <div className="h-64">
              <Line
                data={{
                  labels: [
                    "T1",
                    "T2",
                    "T3",
                    "T4",
                    "T5",
                    "T6",
                    "T7",
                    "T8",
                    "T9",
                    "T10",
                    "T11",
                    "T12",
                  ],
                  datasets: [
                    {
                      label: "Người dùng mới",
                      data: Array(12)
                        .fill(0)
                        .map((_, i) => Math.floor(Math.random() * 50) + 10),
                      borderColor: "rgba(54, 162, 235, 1)",
                      backgroundColor: "rgba(54, 162, 235, 0.1)",
                      tension: 0.4,
                    },
                    {
                      label: "Khóa học mới",
                      data: Array(12)
                        .fill(0)
                        .map((_, i) => Math.floor(Math.random() * 20) + 5),
                      borderColor: "rgba(75, 192, 192, 1)",
                      backgroundColor: "rgba(75, 192, 192, 0.1)",
                      tension: 0.4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
