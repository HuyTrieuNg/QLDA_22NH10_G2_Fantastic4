import React, { useState, useEffect } from "react";
import {
  FiEdit,
  FiTrash2,
  FiEye,
  FiLock,
  FiUserPlus,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

const DataTable = ({
  data,
  columns,
  onView,
  onEdit,
  onDelete,
  isLoading = false,
  emptyMessage = "Không có dữ liệu",
  actionColumn = true,
  pageSize = 10,
  currentPage: controlledPage,
  setCurrentPage: setControlledPage,
}) => {
  const [internalPage, setInternalPage] = useState(1);
  const isControlled =
    controlledPage !== undefined && setControlledPage !== undefined;
  const currentPage = isControlled ? controlledPage : internalPage;
  const setCurrentPage = isControlled ? setControlledPage : setInternalPage;
  const [paginatedData, setPaginatedData] = useState([]);
  const totalPages = data ? Math.ceil(data.length / pageSize) : 0;

  useEffect(() => {
    if (data) {
      const startIndex = (currentPage - 1) * pageSize;
      setPaginatedData(data.slice(startIndex, startIndex + pageSize));
    }
  }, [data, currentPage, pageSize]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
              {actionColumn && (
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Thao tác
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((item, index) => (
              <tr key={item.id || index} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td
                    key={`${item.id || index}-${column.key}`}
                    className="px-6 py-4 whitespace-nowrap"
                  >
                    {column.render ? column.render(item) : item[column.key]}
                  </td>
                ))}
                {actionColumn && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {onView && (
                      <button
                        onClick={() => onView(item)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FiEye size={18} />
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(item)}
                        className="text-indigo-600 hover:text-indigo-900 ml-3"
                      >
                        <FiEdit size={18} />
                      </button>
                    )}
                    {/* Chỉ hiện icon xóa/khôi phục cho bảng user (có trường user_type), hoặc luôn hiện icon xóa nếu là bảng khóa học */}
                    {onDelete &&
                      (item.user_type !== undefined ||
                        item.title !== undefined) && (
                        <button
                          onClick={() => onDelete(item)}
                          className={
                            item.user_type !== undefined
                              ? "is_active" in item
                                ? item.is_active
                                  ? "text-red-600 hover:text-red-900"
                                  : "text-green-600 hover:text-green-900"
                                : "text-red-600 hover:text-red-900"
                              : "text-red-600 hover:text-red-900"
                          }
                          title={
                            item.user_type !== undefined
                              ? "is_active" in item
                                ? item.is_active
                                  ? "Khóa tài khoản"
                                  : "Khôi phục tài khoản"
                                : "Xóa"
                              : "Xóa khóa học"
                          }
                        >
                          {item.user_type !== undefined ? (
                            "is_active" in item ? (
                              item.is_active ? (
                                <FiLock size={18} />
                              ) : (
                                <FiUserPlus size={18} />
                              )
                            ) : (
                              <FiTrash2 size={18} />
                            )
                          ) : (
                            <FiTrash2 size={18} />
                          )}
                        </button>
                      )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Hiển thị từ{" "}
                <span className="font-medium">
                  {(currentPage - 1) * pageSize + 1}
                </span>{" "}
                đến{" "}
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, data.length)}
                </span>{" "}
                trong tổng số <span className="font-medium">{data.length}</span>{" "}
                kết quả
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1
                      ? "text-gray-300"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <FiChevronLeft size={18} />
                </button>

                {[...Array(totalPages).keys()].map((page) => (
                  <button
                    key={page + 1}
                    onClick={() => handlePageChange(page + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border ${
                      currentPage === page + 1
                        ? "bg-blue-50 border-blue-500 text-blue-600"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    } text-sm font-medium`}
                  >
                    {page + 1}
                  </button>
                ))}

                <button
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === totalPages
                      ? "text-gray-300"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <FiChevronRight size={18} />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
