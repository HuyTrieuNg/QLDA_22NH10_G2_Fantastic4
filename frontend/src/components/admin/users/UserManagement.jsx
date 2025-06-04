import React, { useState, useEffect } from "react";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  changeUserType,
  toggleUserActiveStatus,
} from "../../../services/adminService";
import DataTable from "../common/DataTable";
import Modal from "../common/Modal";
import FormInput from "../common/FormInput";
import { toast } from "react-hot-toast";
import {
  FiPlus,
  FiCheck,
  FiX,
  FiLock,
  FiUnlock,
  FiRefreshCw,
  FiUserPlus,
} from "react-icons/fi";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create', 'edit', 'view', 'delete', 'changeType', 'toggleActive'
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    user_type: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleModalOpen = (mode, user = null) => {
    setModalMode(mode);
    setErrors({});

    if (user) {
      setSelectedUser(user);
      if (mode === "edit" || mode === "view") {
        setFormData({
          username: user.username,
          email: user.email,
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          user_type: user.user_type || "",
          password: "", // Leave empty for edit mode
        });
      }
    } else {
      setFormData({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        password: "",
        user_type: "",
      });
    }

    setIsModalOpen(true);
  };

  const validateForm = () => {
    const newErrors = {};

    if (modalMode === "create") {
      if (!formData.username)
        newErrors.username = "Tên đăng nhập không được để trống";
      if (!formData.email) newErrors.email = "Email không được để trống";
      if (!formData.password)
        newErrors.password = "Mật khẩu không được để trống";
      if (!formData.user_type)
        newErrors.user_type = "Vui lòng chọn loại người dùng";
    }

    if (modalMode === "edit") {
      if (!formData.email) newErrors.email = "Email không được để trống";
    }

    if (modalMode === "changeType" && !formData.user_type) {
      newErrors.user_type = "Vui lòng chọn loại người dùng";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (modalMode === "create") {
        await createUser(formData);
        toast.success("Người dùng đã được tạo thành công");
      } else if (modalMode === "edit") {
        await updateUser(selectedUser.id, formData);
        toast.success("Thông tin người dùng đã được cập nhật");
      } else if (modalMode === "changeType") {
        await changeUserType(selectedUser.id, formData.user_type);
        toast.success(
          `Loại người dùng đã được đổi thành ${formData.user_type}`
        );
      } else if (modalMode === "delete") {
        if (selectedUser.is_active) {
          await deleteUser(selectedUser.id);
          toast.success("Tài khoản người dùng đã được khóa");
        } else {
          await toggleUserActiveStatus(selectedUser.id);
          toast.success("Tài khoản người dùng đã được khôi phục");
        }
      } else if (modalMode === "toggleActive") {
        await toggleUserActiveStatus(selectedUser.id);
        const action = selectedUser.is_active ? "khóa" : "khôi phục";
        toast.success(`Tài khoản đã được ${action} thành công`);
      }

      fetchUsers();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error submitting form:", error);

      if (error.response?.data) {
        // Handle API validation errors
        const serverErrors = error.response.data;
        const newErrors = {};

        Object.keys(serverErrors).forEach((key) => {
          newErrors[key] = serverErrors[key].join(" ");
        });

        setErrors(newErrors);
      } else {
        toast.error("Đã xảy ra lỗi, vui lòng thử lại");
      }
    }
  };

  const userTypeOptions = [
    { value: "student", label: "Học sinh" },
    { value: "teacher", label: "Giáo viên" },
    { value: "admin", label: "Quản trị viên" },
  ];

  const columns = [
    {
      key: "username",
      header: "Tên đăng nhập",
    },
    {
      key: "email",
      header: "Email",
    },
    {
      key: "full_name",
      header: "Họ và tên",
      render: (user) =>
        `${user.first_name || ""} ${user.last_name || ""}`.trim() || "N/A",
    },
    {
      key: "user_type",
      header: "Loại người dùng",
      render: (user) => {
        const option = userTypeOptions.find(
          (opt) => opt.value === user.user_type
        );
        return option ? option.label : user.user_type || "N/A";
      },
    },
    {
      key: "is_active",
      header: "Trạng thái",
      render: (user) => (
        <span
          className={`px-2 py-1 rounded text-xs font-semibold ${
            user.is_active
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {user.is_active ? "Đang hoạt động" : "Bị khóa"}
        </span>
      ),
    },
  ];

  const renderModalContent = () => {
    switch (modalMode) {
      case "create":
      case "edit":
        return (
          <form onSubmit={handleSubmit}>
            <FormInput
              label="Tên đăng nhập"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Nhập tên đăng nhập"
              error={errors.username}
              required
              disabled={modalMode === "edit"}
            />

            <FormInput
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Nhập email"
              error={errors.email}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Họ"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                placeholder="Nhập họ"
                error={errors.first_name}
              />

              <FormInput
                label="Tên"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                placeholder="Nhập tên"
                error={errors.last_name}
              />
            </div>

            {modalMode === "create" && (
              <FormInput
                label="Mật khẩu"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Nhập mật khẩu"
                error={errors.password}
                required
              />
            )}

            <FormInput
              label="Loại người dùng"
              type="select"
              name="user_type"
              value={formData.user_type}
              onChange={handleInputChange}
              options={userTypeOptions}
              error={errors.user_type}
              required
            />

            <div className="flex justify-end mt-6 space-x-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border text-gray-700 rounded hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {modalMode === "create" ? "Tạo" : "Lưu"}
              </button>
            </div>
          </form>
        );

      case "view":
        return (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Tên đăng nhập
                </p>
                <p>{selectedUser.username}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p>{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Họ và tên</p>
                <p>
                  {`${selectedUser.first_name || ""} ${
                    selectedUser.last_name || ""
                  }`.trim() || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Loại người dùng
                </p>
                <p>
                  {userTypeOptions.find(
                    (opt) => opt.value === selectedUser.user_type
                  )?.label ||
                    selectedUser.user_type ||
                    "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Trạng thái</p>
                <p>{selectedUser.is_active ? "Đang hoạt động" : "Bị khóa"}</p>
              </div>
            </div>

            <div className="flex justify-end mt-6 space-x-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border text-gray-700 rounded hover:bg-gray-100"
              >
                Đóng
              </button>
            </div>
          </div>
        );

      case "delete": {
        const isActive = selectedUser?.is_active;
        const action = isActive ? "khóa" : "khôi phục";
        return (
          <div>
            <p className="mb-4">
              Bạn có chắc chắn muốn {action} tài khoản người dùng{" "}
              <strong>{selectedUser.username}</strong>?
            </p>

            <div className="flex justify-end mt-6 space-x-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border text-gray-700 rounded hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className={`px-4 py-2 text-white rounded ${
                  isActive
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isActive ? "Khóa tài khoản" : "Khôi phục tài khoản"}
              </button>
            </div>
          </div>
        );
      }

      case "changeType":
        return (
          <form onSubmit={handleSubmit}>
            <p className="mb-4">
              Thay đổi loại người dùng cho{" "}
              <strong>{selectedUser.username}</strong>:
            </p>

            <FormInput
              label="Loại người dùng"
              type="select"
              name="user_type"
              value={formData.user_type}
              onChange={handleInputChange}
              options={userTypeOptions}
              error={errors.user_type}
              required
            />

            <div className="flex justify-end mt-6 space-x-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border text-gray-700 rounded hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Lưu
              </button>
            </div>
          </form>
        );

      case "toggleActive": {
        const action = selectedUser.is_active ? "khóa" : "khôi phục";
        return (
          <div>
            <p className="mb-4">
              Bạn có chắc chắn muốn {action} tài khoản{" "}
              <strong>{selectedUser.username}</strong>?
            </p>

            <div className="flex justify-end mt-6 space-x-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border text-gray-700 rounded hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className={`px-4 py-2 text-white rounded ${
                  selectedUser.is_active
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {selectedUser.is_active
                  ? "Khóa tài khoản"
                  : "Khôi phục tài khoản"}
              </button>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  const getModalTitle = () => {
    switch (modalMode) {
      case "create":
        return "Thêm người dùng mới";
      case "edit":
        return "Chỉnh sửa người dùng";
      case "view":
        return "Thông tin người dùng";
      case "delete":
        return selectedUser?.is_active
          ? "Khóa tài khoản người dùng"
          : "Khôi phục tài khoản người dùng";
      case "changeType":
        return "Thay đổi loại người dùng";
      case "toggleActive":
        return selectedUser?.is_active
          ? "Khóa tài khoản"
          : "Khôi phục tài khoản";
      default:
        return "";
    }
  };

  const [activeFilter, setActiveFilter] = useState("all"); // all, active, blocked
  const [currentPage, setCurrentPage] = useState(1); // Thêm state phân trang toàn cục

  const handleFilterChange = async (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1); // Reset về trang đầu khi đổi filter
    setLoading(true);
    try {
      let response;
      if (filter === "active") {
        response = await getUsers({ is_active: true });
      } else if (filter === "blocked") {
        response = await getUsers({ is_active: false });
      } else {
        response = await getUsers();
      }
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching filtered users:", error);
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Quản lý người dùng</h1>
        {/* <button
          onClick={() => handleModalOpen("create")}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <FiPlus className="mr-2" /> Thêm người dùng
        </button> */}
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => handleFilterChange("all")}
              className={`py-2 px-4 ${
                activeFilter === "all"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Tất cả người dùng
            </button>
            <button
              onClick={() => handleFilterChange("active")}
              className={`py-2 px-4 ${
                activeFilter === "active"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Đang hoạt động
            </button>
            <button
              onClick={() => handleFilterChange("blocked")}
              className={`py-2 px-4 ${
                activeFilter === "blocked"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Đã bị khóa
            </button>
          </nav>
        </div>
      </div>

      <DataTable
        data={users}
        columns={columns}
        isLoading={loading}
        onView={(user) => handleModalOpen("view", user)}
        onEdit={(user) => handleModalOpen("edit", user)}
        onDelete={(user) => handleModalOpen("delete", user)}
        actionColumn={true}
        emptyMessage="Không có người dùng nào"
        customActions={(user) => (
          <>
            <button
              onClick={() => handleModalOpen("changeType", user)}
              className="text-indigo-600 hover:text-indigo-900 ml-3"
              title="Thay đổi loại người dùng"
            >
              <FiCheck size={18} />
            </button>
            <button
              onClick={() => handleModalOpen("toggleActive", user)}
              className={`${
                user.is_active
                  ? "text-red-600 hover:text-red-900"
                  : "text-green-600 hover:text-green-900"
              } ml-3`}
              title={user.is_active ? "Khóa tài khoản" : "Khôi phục tài khoản"}
            >
              {user.is_active ? <FiLock size={18} /> : <FiUserPlus size={18} />}
            </button>
          </>
        )}
        pageSize={10}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={getModalTitle()}
        size="md"
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
};

export default UserManagement;
