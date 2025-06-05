import React, { useState, useEffect } from "react";
import { getAuditLogs } from "../../../services/adminService";
import { toast } from "react-hot-toast";
import { FiFilter, FiRefreshCw } from "react-icons/fi";
import DataTable from "../common/DataTable";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: "",
    user: "",
    object_type: "",
    date_from: "",
    date_to: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);

      // Prepare filter params
      const params = {};
      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          params[key] = filters[key];
        }
      });

      const response = await getAuditLogs(params);
      setLogs(response.data);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      toast.error("Không thể tải nhật ký hệ thống");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const handleClearFilters = () => {
    setFilters({
      action: "",
      user: "",
      object_type: "",
      date_from: "",
      date_to: "",
    });
  };

  const columns = [
    {
      key: "username",
      header: "Người dùng",
      render: (log) => log.username || log.user || "N/A",
    },
    {
      key: "action",
      header: "Hành động",
      render: (log) => (
        <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
          {formatAction(log.action)}
        </span>
      ),
    },
    {
      key: "object_info",
      header: "Đối tượng",
      render: (log) =>
        `${formatObjectType(log.object_type)} ${
          log.object_id ? `#${log.object_id}` : ""
        }`,
    },
    {
      key: "timestamp",
      header: "Thời gian",
      render: (log) => new Date(log.timestamp).toLocaleString(),
    },
    {
      key: "ip_address",
      header: "Địa chỉ IP",
      render: (log) => log.ip_address || "N/A",
    },
  ];

  const formatAction = (action) => {
    const actionMap = {
      create: "Tạo mới",
      update: "Cập nhật",
      delete: "Xóa",
      login: "Đăng nhập",
      logout: "Đăng xuất",
      user_role_change: "Đổi quyền",
      account_lock: "Khóa/Mở tài khoản",
      other: "Khác",
    };

    return actionMap[action] || action;
  };

  const formatObjectType = (objectType) => {
    const typeMap = {
      users: "Người dùng",
      courses: "Khóa học",
      sections: "Phần học",
      lessons: "Bài học",
      quizzes: "Bài kiểm tra",
      "system-config": "Cấu hình hệ thống",
    };

    return typeMap[objectType] || objectType;
  };

  const actionOptions = [
    { value: "create", label: "Tạo mới" },
    { value: "update", label: "Cập nhật" },
    { value: "delete", label: "Xóa" },
    { value: "login", label: "Đăng nhập" },
    { value: "logout", label: "Đăng xuất" },
    { value: "user_role_change", label: "Đổi quyền" },
    { value: "account_lock", label: "Khóa/Mở tài khoản" },
    { value: "other", label: "Khác" },
  ];

  const objectTypeOptions = [
    { value: "users", label: "Người dùng" },
    { value: "courses", label: "Khóa học" },
    { value: "sections", label: "Phần học" },
    { value: "lessons", label: "Bài học" },
    { value: "quizzes", label: "Bài kiểm tra" },
    { value: "system-config", label: "Cấu hình hệ thống" },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Nhật ký hệ thống</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            <FiFilter className="mr-2" /> Bộ lọc
          </button>
          <button
            onClick={fetchLogs}
            className="flex items-center px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            title="Làm mới"
          >
            <FiRefreshCw className="mr-2" /> Làm mới
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <form
            onSubmit={handleFilterSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hành động
              </label>
              <select
                name="action"
                value={filters.action}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả</option>
                {actionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại đối tượng
              </label>
              <select
                name="object_type"
                value={filters.object_type}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả</option>
                {objectTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Người dùng
              </label>
              <input
                type="text"
                name="user"
                value={filters.user}
                onChange={handleFilterChange}
                placeholder="Nhập tên người dùng"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Từ ngày
              </label>
              <input
                type="date"
                name="date_from"
                value={filters.date_from}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đến ngày
              </label>
              <input
                type="date"
                name="date_to"
                value={filters.date_to}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end space-x-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Áp dụng
              </button>
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Xóa lọc
              </button>
            </div>
          </form>
        </div>
      )}

      <DataTable
        data={logs}
        columns={columns}
        isLoading={loading}
        actionColumn={false}
        emptyMessage="Không có nhật ký nào"
      />
    </div>
  );
};

export default AuditLogs;
