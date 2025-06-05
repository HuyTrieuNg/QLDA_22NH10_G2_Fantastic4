import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Clock,
  Star,
  Users,
  Search,
  ArrowRight,
  GraduationCap,
  Book,
  Monitor,
  Activity,
  ChevronDown,
  Menu,
  X,
  User,
  Check,
  Award,
  Globe,
  Zap,
  Heart,
  MessageCircle,
  Mail,
  MapPin,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  DollarSign,
  Calendar,
  BarChart2,
  Target,
  ShoppingBag,
  Gift,
  Code,
  Languages,
  Briefcase,
  PenTool,
  Bookmark,
  Music,
  Camera,
  Coffee,
} from "lucide-react";
import "../index.css";
import studentService from "../services/studentService";
import { toast } from "react-hot-toast";
import FeaturedCourseCard from "./FeaturedCourseCard";
import FeaturedCourseSkeleton from "./FeaturedCourseSkeleton";
import CategoryCard from "./CategoryCard";
import Footer from "./Footer";
import { categories as sharedCategories } from "../constants/categories";

// Function to get an icon based on category name
const getIconForCategory = (category) => {
  const categoryLower = category.toLowerCase();

  if (
    categoryLower.includes("lập trình") ||
    categoryLower.includes("program")
  ) {
    return <Code className="h-8 w-8" />;
  } else if (
    categoryLower.includes("ngoại ngữ") ||
    categoryLower.includes("language")
  ) {
    return <Languages className="h-8 w-8" />;
  } else if (categoryLower.includes("marketing")) {
    return <Target className="h-8 w-8" />;
  } else if (
    categoryLower.includes("thiết kế") ||
    categoryLower.includes("design")
  ) {
    return <PenTool className="h-8 w-8" />;
  } else if (
    categoryLower.includes("kinh doanh") ||
    categoryLower.includes("business")
  ) {
    return <Briefcase className="h-8 w-8" />;
  } else if (
    categoryLower.includes("music") ||
    categoryLower.includes("âm nhạc")
  ) {
    return <Music className="h-8 w-8" />;
  } else if (categoryLower.includes("photo") || categoryLower.includes("ảnh")) {
    return <Camera className="h-8 w-8" />;
  } else {
    return <Bookmark className="h-8 w-8" />;
  }
};

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState({});
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [popularCourses, setPopularCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // Check if user is logged in
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    setIsLoggedIn(!!accessToken);

    if (accessToken) {
      try {
        const user = JSON.parse(localStorage.getItem("userData") || "{}");
        setUserData(user);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }

    // Load featured courses
    fetchCourses();
  }, []);
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await studentService.getAllCourses();

      if (response.data && Array.isArray(response.data)) {
        // Get featured courses (newest 6)
        const featured = [...response.data].slice(0, 6);
        setFeaturedCourses(featured);

        // Get popular courses (sort by student_count, different from featured)
        const popular = [...response.data]
          .sort((a, b) => (b.student_count || 0) - (a.student_count || 0))
          .filter((course) => !featured.some((fc) => fc.id === course.id))
          .slice(0, 3);
        setPopularCourses(popular);
      }
    } catch (error) {
      console.error("Failed to load courses:", error);
      // Fallback to empty arrays if API fails
      setFeaturedCourses([]);
      setPopularCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userData");
    setIsLoggedIn(false);
    setProfileDropdownOpen(false);
    toast.success("Đã đăng xuất thành công");
    navigate("/login");
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".category-dropdown")) {
        setCategoryDropdownOpen(false);
      }
      if (!event.target.closest(".profile-dropdown")) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const categories = sharedCategories;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header & Navigation */}
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and nav links */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="flex items-center">
                  <GraduationCap className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                  <span className="ml-2 text-xl font-bold text-gray-800 dark:text-white">
                    EduLearn
                  </span>
                </Link>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:ml-8 md:flex md:space-x-8">
                <Link
                  to="/"
                  className="px-3 py-2 text-indigo-600 dark:text-indigo-400 font-medium border-b-2 border-indigo-600 dark:border-indigo-400"
                >
                  Trang chủ
                </Link>
                <Link
                  to="/student/courses"
                  className="px-3 py-2 text-gray-700 dark:text-gray-300 font-medium hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Khóa học
                </Link>
                <div className="relative category-dropdown">
                  <button
                    className="px-3 py-2 text-gray-700 dark:text-gray-300 font-medium hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center"
                    onClick={() => setCategoryDropdownOpen((open) => !open)}
                  >
                    Danh mục
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </button>
                  {categoryDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-40">
                      {categories.length > 0
                        ? categories.map((category, index) => (
                            <Link
                              key={index}
                              to={`/student/courses?category=${category}`}
                              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={() => setCategoryDropdownOpen(false)}
                            >
                              {category}
                            </Link>
                          ))
                        : [
                            "Lập trình",
                            "Ngoại ngữ",
                            "Marketing",
                            "Thiết kế",
                            "Kinh doanh",
                          ].map((category, index) => (
                            <Link
                              key={index}
                              to={`/student/courses?category=${category}`}
                              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={() => setCategoryDropdownOpen(false)}
                            >
                              {category}
                            </Link>
                          ))}
                    </div>
                  )}
                </div>
                <Link
                  to="/about"
                  className="px-3 py-2 text-gray-700 dark:text-gray-300 font-medium hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Giới thiệu
                </Link>
                <Link
                  to="/contact"
                  className="px-3 py-2 text-gray-700 dark:text-gray-300 font-medium hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Liên hệ
                </Link>
              </nav>
            </div>

            {/* Search, User profile, Mobile menu button */}
            <div className="flex items-center">
              {/* Search form - desktop */}
              <div className="hidden md:block">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm khóa học..."
                    className="w-64 pl-10 pr-4 py-2 text-sm text-gray-700 dark:text-white bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                </div>
              </div>

              {/* Profile dropdown */}
              {isLoggedIn ? (
                <div className="ml-4 relative profile-dropdown">
                  <button
                    className="flex items-center text-sm font-medium text-gray-700 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none"
                    onClick={() => setProfileDropdownOpen((open) => !open)}
                  >
                    <div className="h-8 w-8 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white">
                      <User size={16} />
                    </div>
                  </button>
                  {profileDropdownOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-40">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        Hồ sơ cá nhân
                      </Link>
                      <Link
                        to="/student/my-courses"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        Khóa học của tôi
                      </Link>
                      <Link
                        to="/teacher/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        Quản lý giảng dạy
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="md:flex space-x-4 ml-4 hidden">
                  <Link
                    to="/login"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 dark:text-indigo-400 dark:bg-gray-800 dark:hover:bg-gray-700"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                className="ml-2 md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu, show/hide based on menuOpen state */}
          {menuOpen && (
            <div className="md:hidden pt-2 pb-3 border-t border-gray-200 dark:border-gray-700">
              <div className="px-2 space-y-1">
                <Link
                  to="/"
                  className="block px-3 py-2 rounded-md text-base font-medium text-indigo-600 dark:text-indigo-400 bg-gray-50 dark:bg-gray-700"
                >
                  Trang chủ
                </Link>
                <Link
                  to="/student/courses"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Khóa học
                </Link>
                <Link
                  to="/about"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Giới thiệu
                </Link>
                <Link
                  to="/contact"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Liên hệ
                </Link>

                {/* Mobile search */}
                <div className="px-3 py-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Tìm kiếm khóa học..."
                      className="w-full pl-10 pr-4 py-2 text-sm text-gray-700 dark:text-white bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </div>
                </div>

                {/* Mobile auth buttons */}
                {!isLoggedIn && (
                  <div className="px-3 py-2 space-y-2">
                    <Link
                      to="/login"
                      className="block text-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      to="/register"
                      className="block text-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 dark:text-indigo-400 dark:bg-gray-800 dark:hover:bg-gray-700"
                    >
                      Đăng ký
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-800 dark:to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Nâng cao kỹ năng của bạn với các khóa học trực tuyến
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-indigo-100 dark:text-indigo-200">
                Tiếp cận hàng trăm khóa học chất lượng cao từ các giảng viên
                hàng đầu
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/student/courses"
                  className="px-8 py-3 bg-white text-indigo-600 font-bold rounded-lg hover:bg-gray-100 transition-colors duration-300"
                >
                  Khám phá khóa học
                </Link>
                <Link
                  to="/register"
                  className="px-8 py-3 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-colors duration-300"
                >
                  Đăng ký miễn phí
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"
                alt="Học trực tuyến"
                className="rounded-lg shadow-2xl w-full max-w-md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Khám phá theo danh mục
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Tìm kiếm khóa học phù hợp với mục tiêu học tập của bạn
            </p>
          </div>
          <div className="flex justify-center">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {loading
                ? // Improved skeleton loading for categories
                  Array(5)
                    .fill()
                    .map((_, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 animate-pulse"
                      >
                        <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4"></div>
                        <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-20 mx-auto"></div>
                      </div>
                    ))
                : [
                    ...categories.slice(0, 5).map((cat) => ({
                      name: cat,
                      icon: getIconForCategory(cat),
                    })),
                    { name: "Tất cả", icon: <BookOpen className="h-8 w-8" /> },
                  ].map((category, index) => (
                    <CategoryCard
                      key={index}
                      name={category.name}
                      icon={category.icon}
                    />
                  ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Khóa học nổi bật
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Khám phá các khóa học được học viên đánh giá cao
              </p>
            </div>
            <Link
              to="/student/courses"
              className="hidden sm:flex items-center text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300"
            >
              Xem tất cả
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              // Loading skeleton for featured courses
              Array(3)
                .fill()
                .map((_, index) => <FeaturedCourseSkeleton key={index} />)
            ) : featuredCourses.length > 0 ? (
              featuredCourses.map((course) => (
                <FeaturedCourseCard
                  key={course.id}
                  course={{
                    ...course,
                    price: course.price ? `$${course.price}` : "Free",
                    rating: (Math.random() * (5 - 4) + 4).toFixed(1),
                  }}
                />
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Chưa có khóa học nổi bật
                </p>
                <Link
                  to="/student/courses"
                  className="mt-4 inline-flex items-center text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300"
                >
                  Xem tất cả khóa học
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            )}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link
              to="/student/courses"
              className="inline-flex items-center text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300"
            >
              Xem tất cả khóa học
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Tại sao chọn chúng tôi?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Nền tảng học tập trực tuyến hàng đầu với nhiều ưu điểm vượt trội
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl text-center">
              <div className="inline-block p-4 bg-indigo-100 dark:bg-indigo-900 rounded-full mb-4">
                <BookOpen className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Khóa học đa dạng
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Hơn 1000+ khóa học từ cơ bản đến nâng cao trong nhiều lĩnh vực
                khác nhau.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl text-center">
              <div className="inline-block p-4 bg-indigo-100 dark:bg-indigo-900 rounded-full mb-4">
                <User className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Giảng viên chất lượng
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Đội ngũ giảng viên giàu kinh nghiệm và chuyên môn cao trong từng
                lĩnh vực.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl text-center">
              <div className="inline-block p-4 bg-indigo-100 dark:bg-indigo-900 rounded-full mb-4">
                <Activity className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Học mọi lúc, mọi nơi
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Truy cập không giới hạn vào khóa học từ máy tính, điện thoại
                hoặc tablet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
