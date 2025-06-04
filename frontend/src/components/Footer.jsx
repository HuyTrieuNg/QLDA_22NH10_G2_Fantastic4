import React from "react";
import { GraduationCap } from "lucide-react";

const Footer = () => (
  <footer className="bg-gray-900 text-white pt-16 pb-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <div>
          <div className="flex items-center mb-4">
            <GraduationCap className="h-8 w-8 text-indigo-400" />
            <span className="ml-2 text-xl font-bold">EduLearn</span>
          </div>
          <p className="text-gray-400 mb-4">
            Nền tảng học tập trực tuyến hàng đầu Việt Nam, kết nối giáo viên và
            học viên một cách hiệu quả.
          </p>
          <div className="flex space-x-4">
            {/* Social icons here (copy from original) */}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Khóa học</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="text-gray-400 hover:text-white">
                Lập trình
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-400 hover:text-white">
                Ngoại ngữ
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-400 hover:text-white">
                Marketing
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-400 hover:text-white">
                Thiết kế
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-400 hover:text-white">
                Kinh doanh
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Liên kết</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="text-gray-400 hover:text-white">
                Về chúng tôi
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-400 hover:text-white">
                Giảng viên
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-400 hover:text-white">
                Đối tác
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-400 hover:text-white">
                Blog
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-400 hover:text-white">
                Liên hệ
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
          <ul className="space-y-2 text-gray-400">
            <li className="flex items-start">
              <span className="mr-2">📍</span>
              <span>123 Đường ABC, Quận 1, TP.HCM</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">📱</span>
              <span>+84 123 456 789</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✉️</span>
              <span>info@edulearn.vn</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 pt-8">
        <p className="text-center text-gray-400 text-sm">
          &copy; 2025 EduLearn. Tất cả quyền được bảo lưu.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
