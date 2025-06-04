import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import { getUserProfile } from '../../services/authService';

const TeacherNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  // Load user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await getUserProfile();
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('accessToken'); // For backward compatibility
    navigate('/');
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/teacher/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Khóa học',
      href: '/teacher/courses',
      icon: BookOpen,
    },
  ];

  const userDropdownItems = [
    {
      name: 'Hồ sơ',
      href: '/profile',
      icon: User,
    },
    {
      name: 'Đổi mật khẩu',
      href: '/change-password',
      icon: Settings,
    },
  ];

  const isActive = (href) => {
    if (href === '/teacher/dashboard') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  const getDisplayName = () => {
    if (!userData) return 'User';
    const firstName = userData.first_name || '';
    const lastName = userData.last_name || '';
    return firstName && lastName ? `${firstName} ${lastName}` : userData.username;
  };

  const getAvatarInitials = () => {
    if (!userData) return 'U';
    const firstName = userData.first_name || '';
    const lastName = userData.last_name || '';
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return userData.username ? userData.username[0].toUpperCase() : 'U';
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Logo and main nav */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/teacher/dashboard" className="text-xl font-bold text-purple-600">
                Smart Learning
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive(item.href)
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>          {/* Right side - User dropdown */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full overflow-hidden bg-purple-100 flex items-center justify-center">
                  {userData?.avatar ? (
                    <img
                      src={userData.avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium text-purple-600">
                      {getAvatarInitials()}
                    </span>
                  )}
                </div>
                
                {/* Name */}
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-medium text-gray-900">
                    {loading ? 'Loading...' : getDisplayName()}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </div>
              </button>

              {/* Dropdown menu */}
              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1">
                    {/* User info section */}
                    <div className="px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-purple-100 flex items-center justify-center">
                          {userData?.avatar ? (
                            <img
                              src={userData.avatar}
                              alt="Avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium text-purple-600">
                              {getAvatarInitials()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {getDisplayName()}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {userData?.email || 'teacher@example.com'}
                          </p>
                          <p className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full inline-block mt-1">
                            {userData?.user_type === 'teacher' ? 'Giáo viên' : userData?.user_type || 'Teacher'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Dropdown items */}
                    {userDropdownItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        >
                          <Icon className="w-4 h-4 mr-3 text-gray-400 group-hover:text-gray-500" />
                          {item.name}
                        </Link>
                      );
                    })}

                    {/* Logout */}
                    <div className="border-t border-gray-200">
                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          handleLogout();
                        }}
                        className="group flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 hover:text-red-900"
                      >
                        <LogOut className="w-4 h-4 mr-3 text-red-400 group-hover:text-red-500" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
            >
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {/* User info in mobile */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-purple-100 flex items-center justify-center">
                  {userData?.avatar ? (
                    <img
                      src={userData.avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium text-purple-600">
                      {getAvatarInitials()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {loading ? 'Loading...' : getDisplayName()}
                  </p>
                  <p className="text-xs text-purple-600">
                    {userData?.user_type === 'teacher' ? 'Giáo viên' : userData?.user_type || 'Teacher'}
                  </p>
                </div>
              </div>
            </div>

            {/* Main navigation items */}
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive(item.href)
                      ? 'bg-purple-50 border-purple-500 text-purple-700'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className="w-4 h-4 mr-3" />
                    {item.name}
                  </div>
                </Link>
              );
            })}

            {/* User dropdown items in mobile */}
            {userDropdownItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive(item.href)
                      ? 'bg-purple-50 border-purple-500 text-purple-700'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className="w-4 h-4 mr-3" />
                    {item.name}
                  </div>
                </Link>
              );
            })}

            {/* Logout in mobile */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLogout();
              }}
              className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-red-600 hover:bg-red-50 hover:border-red-300"
            >
              <div className="flex items-center">
                <LogOut className="w-4 h-4 mr-3" />
                Đăng xuất
              </div>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default TeacherNavigation;
