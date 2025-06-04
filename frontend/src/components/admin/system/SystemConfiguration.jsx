import React, { useState, useEffect } from "react";
import {
  getSystemConfigsByCategory,
  updateSystemConfig,
  createSystemConfig,
} from "../../../services/adminService";
import FormInput from "../common/FormInput";
import Modal from "../common/Modal";
import { toast } from "react-hot-toast";
import { FiPlus, FiEdit, FiInfo } from "react-icons/fi";

const SystemConfiguration = () => {
  const [configs, setConfigs] = useState({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [formData, setFormData] = useState({
    key: "",
    value: "",
    description: "",
    category: "general",
    is_public: false,
  });
  const [modalMode, setModalMode] = useState("create"); // 'create', 'edit'

  useEffect(() => {
    fetchConfigurations();
  }, []);

  const fetchConfigurations = async () => {
    try {
      setLoading(true);
      const response = await getSystemConfigsByCategory();
      setConfigs(response.data);
    } catch (error) {
      console.error("Error fetching system configurations:", error);
      toast.error("Không thể tải cấu hình hệ thống");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleModalOpen = (mode, config = null) => {
    setModalMode(mode);

    if (config) {
      setSelectedConfig(config);
      setFormData({
        key: config.key,
        value: config.value || "",
        description: config.description || "",
        category: config.category || "general",
        is_public: config.is_public || false,
      });
    } else {
      setSelectedConfig(null);
      setFormData({
        key: "",
        value: "",
        description: "",
        category: "general",
        is_public: false,
      });
    }

    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modalMode === "create") {
        await createSystemConfig(formData);
        toast.success("Cấu hình mới đã được tạo thành công");
      } else {
        await updateSystemConfig(selectedConfig.id, formData);
        toast.success("Cấu hình đã được cập nhật thành công");
      }

      fetchConfigurations();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving configuration:", error);
      toast.error("Không thể lưu cấu hình");
    }
  };

  const categoryOptions = [
    { value: "general", label: "Cấu hình chung" },
    { value: "email", label: "Cấu hình email" },
    { value: "payment", label: "Cấu hình thanh toán" },
    { value: "appearance", label: "Giao diện" },
    { value: "security", label: "Bảo mật" },
    { value: "other", label: "Khác" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Cấu hình hệ thống</h1>
        <button
          onClick={() => handleModalOpen("create")}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <FiPlus className="mr-2" /> Thêm cấu hình mới
        </button>
      </div>

      {Object.keys(configs).length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">
          Chưa có cấu hình nào được thiết lập
        </div>
      ) : (
        Object.keys(configs).map((category) => (
          <div key={category} className="mb-8">
            <h2 className="text-lg font-medium mb-4 text-gray-700 border-b pb-2">
              {categoryOptions.find((opt) => opt.value === category)?.label ||
                category}
            </h2>

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Khóa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giá trị
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Công khai
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {configs[category].map((config) => (
                    <tr key={config.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {config.key}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {config.value}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            config.is_public
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {config.is_public ? "Công khai" : "Riêng tư"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleModalOpen("edit", config)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => {
                            toast.custom(
                              (t) => (
                                <div
                                  className={`${
                                    t.visible
                                      ? "animate-enter"
                                      : "animate-leave"
                                  } bg-white shadow-lg rounded-lg py-4 px-6 max-w-md w-full`}
                                >
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 text-blue-500">
                                      <FiInfo size={24} />
                                    </div>
                                    <div className="ml-3 overflow-hidden">
                                      <p className="font-medium text-gray-900">
                                        {config.key}
                                      </p>
                                      <p className="text-sm text-gray-500 mt-1">
                                        {config.description || "Không có mô tả"}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ),
                              { duration: 4000 }
                            );
                          }}
                          className="text-blue-600 hover:text-blue-900 ml-3"
                        >
                          <FiInfo size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === "create" ? "Thêm cấu hình mới" : "Chỉnh sửa cấu hình"
        }
      >
        <form onSubmit={handleSubmit}>
          <FormInput
            label="Khóa"
            name="key"
            value={formData.key}
            onChange={handleInputChange}
            placeholder="Nhập khóa cấu hình"
            disabled={modalMode === "edit"}
            required
          />

          <FormInput
            label="Giá trị"
            type="textarea"
            name="value"
            value={formData.value}
            onChange={handleInputChange}
            placeholder="Nhập giá trị"
            required
          />

          <FormInput
            label="Mô tả"
            type="textarea"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Nhập mô tả"
          />

          <FormInput
            label="Phân loại"
            type="select"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            options={categoryOptions}
            required
          />

          <div className="flex items-center mb-4">
            <input
              id="is_public"
              name="is_public"
              type="checkbox"
              checked={formData.is_public}
              onChange={handleInputChange}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="is_public"
              className="ml-2 block text-sm text-gray-700"
            >
              Công khai (Có thể truy cập bởi người dùng không phải admin)
            </label>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
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
      </Modal>
    </div>
  );
};

export default SystemConfiguration;
