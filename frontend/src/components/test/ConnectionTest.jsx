import { useState, useEffect } from "react";
import api from "../../services/api/axiosConfig";

const ConnectionTest = () => {
  const [apiStatus, setApiStatus] = useState({
    status: "pending",
    message: "Chưa kiểm tra",
  });
  const [dbStatus, setDbStatus] = useState({
    status: "pending",
    message: "Chưa kiểm tra",
  });
  const [testItems, setTestItems] = useState([]);
  const [newItemName, setNewItemName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testApiConnection = async () => {
    setApiStatus({ status: "loading", message: "Đang kiểm tra kết nối..." });
    try {
      const response = await api.get("test-connection/");
      setApiStatus({
        status: "success",
        message: `Kết nối thành công đến ${response.data.service}`,
      });
      setDbStatus({
        status:
          response.data.database_status === "Connected" ? "success" : "error",
        message: `Database: ${response.data.database_status}`,
      });
    } catch (error) {
      setApiStatus({
        status: "error",
        message: `Lỗi kết nối: ${error.message}`,
      });
    }
  };

  const fetchTestItems = async () => {
    setLoading(true);
    try {
      const response = await api.get("test-database/");
      setTestItems(response.data);
      setError(null);
    } catch (error) {
      setError(`Lỗi khi tải dữ liệu: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    try {
      await api.post("test-database/", { name: newItemName });
      setNewItemName("");
      fetchTestItems(); // Tải lại danh sách
    } catch (error) {
      setError(`Lỗi khi tạo mục mới: ${error.message}`);
    }
  };

  useEffect(() => {
    // Tự động kiểm tra kết nối khi component được mount
    testApiConnection();
  }, []);

  // Tailwind classes for status indicators
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-400";
      case "loading":
        return "bg-blue-400 animate-pulse";
      case "success":
        return "bg-green-600";
      case "error":
        return "bg-red-600";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-3xl shadow-2xl text-gray-900 dark:bg-slate-800 dark:text-white">
      <h2 className="text-3xl font-extrabold mb-6 text-balance">
        Kiểm tra kết nối
      </h2>

      <div className="flex gap-x-8 gap-y-4 flex-wrap my-8">
        <div className="flex-1 min-w-[200px] border border-gray-200 dark:border-slate-700 rounded-xl p-6 bg-white dark:bg-slate-900 text-center">
          <h3 className="text-lg font-semibold mb-2">Backend API</h3>
          <div
            className={`w-6 h-6 rounded-full mx-auto mb-2 border-2 border-white/80 shadow ${getStatusColor(
              apiStatus.status
            )}`}
          ></div>
          <p className="text-balance">{apiStatus.message}</p>
        </div>

        <div className="flex-1 min-w-[200px] border border-gray-200 dark:border-slate-700 rounded-xl p-6 bg-white dark:bg-slate-900 text-center">
          <h3 className="text-lg font-semibold mb-2">Database</h3>
          <div
            className={`w-6 h-6 rounded-full mx-auto mb-2 border-2 border-white/80 shadow ${getStatusColor(
              dbStatus.status
            )}`}
          ></div>
          <p className="text-balance">{dbStatus.message}</p>
        </div>
      </div>

      <button
        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-xl transition mb-8 shadow"
        onClick={testApiConnection}
      >
        Kiểm tra kết nối
      </button>

      <hr className="my-8 border-t border-gray-200 dark:border-slate-700" />

      <div className="pt-2">
        <h3 className="text-2xl font-bold mb-6">Kiểm tra CRUD với Database</h3>

        <form onSubmit={handleCreateItem} className="flex gap-4 mb-6 flex-wrap">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Nhập tên mục mới"
            className="flex-1 min-w-[180px] p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-slate-900"
          />
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition shadow"
          >
            Tạo mục mới
          </button>
        </form>

        <button
          onClick={fetchTestItems}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition mb-6 shadow"
        >
          Tải danh sách
        </button>

        {error && (
          <p className="text-red-800 p-3 bg-red-100 border border-red-200 rounded-lg mt-3">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-center py-6">Loading...</p>
        ) : (
          <div className="mt-6 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-6">
            <h4 className="font-semibold mb-4">
              Danh sách các mục ({testItems.length})
            </h4>
            {testItems.length === 0 ? (
              <p className="text-gray-500 text-center py-6">
                Chưa có mục nào. Hãy tạo mục mới!
              </p>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-slate-700">
                {testItems.map((item) => (
                  <li key={item.id} className="flex justify-between py-3">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-500 text-sm">
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionTest;
