import React, { useState } from "react";
import { changePassword } from "../../services/authService";
import { useNavigate } from "react-router-dom";

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (formData.new_password !== formData.confirm_password) {
      setError("Mật khẩu mới không khớp.");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await changePassword({
        current_password: formData.current_password,
        new_password: formData.new_password,
        confirm_password: formData.confirm_password,
      });

      setSuccess("Mật khẩu đã được thay đổi thành công!");

      // Reset form
      setFormData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });

      // Redirect to profile after 3 seconds
      setTimeout(() => {
        navigate("/profile");
      }, 3000);
    } catch (err) {
      console.error("Change password error:", err);
      setError(
        err.response?.data?.current_password ||
          err.response?.data?.new_password ||
          err.response?.data?.detail ||
          "Có lỗi xảy ra. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Đổi mật khẩu
        </h1>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {success && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <span className="block sm:inline">{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="current_password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Mật khẩu hiện tại
            </label>
            <input
              id="current_password"
              name="current_password"
              type="password"
              required
              value={formData.current_password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="new_password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Mật khẩu mới
            </label>
            <input
              id="new_password"
              name="new_password"
              type="password"
              required
              value={formData.new_password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="confirm_password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Xác nhận mật khẩu mới
            </label>
            <input
              id="confirm_password"
              name="confirm_password"
              type="password"
              required
              value={formData.confirm_password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <a
              href="/profile"
              className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              Quay lại hồ sơ
            </a>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
