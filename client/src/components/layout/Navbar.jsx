import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  Briefcase,
  Building2,
  MessageSquare,
  Bell,
  Search,
  User as UserIcon,
  LogOut,
  Sparkles,
  Menu,
  X,
  FileText,
  Sun,
  Moon,
  ChevronDown,
  Settings,
  RefreshCw,
  Edit,
  Shield,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import Avatar from '../common/Avatar';
import SwitchAccountModal from '../common/SwitchAccountModal';

const Navbar = () => {
  const { user, profile, isAuthenticated, isRecruiter, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { unreadCount, showToast } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [switchAccountModalOpen, setSwitchAccountModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const profileMenuRef = useRef(null);

  // Close dropdown on outside click, Escape key, or page route change
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setProfileDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Close dropdown whenever route path changes
  useEffect(() => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    setProfileDropdownOpen(false);
    logout();
    showToast('Successfully logged out.', 'info');
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/feed' && (location.pathname === '/' || location.pathname === '/feed')) return true;
    return location.pathname.startsWith(path);
  };

  const displayName =
    profile?.fullName ||
    user?.profile?.fullName ||
    (user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : null) ||
    user?.email?.split('@')[0] ||
    'Member';

  const userHeadline =
    profile?.headline ||
    (user?.role === 'recruiter' ? 'Talent Acquisition Partner' : 'Software Engineer');

  const userAvatar = profile?.avatar || user?.profile?.avatar;

  return (
    <header className="sticky top-3 z-50 px-4 sm:px-6 lg:px-8 py-1 transition-all duration-200">
      <div className="max-w-7xl mx-auto liquid-glass-nav rounded-full px-4 sm:px-6 py-2 shadow-2xl border border-white/15">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-pro-700 via-pro-600 to-tealAccent-500 flex items-center justify-center text-white font-black text-sm sm:text-base shadow-lg shadow-pro-600/30 group-hover:scale-105 transition-transform">
                <span>CL</span>
              </div>
              <div className="hidden xl:block">
                <span className="text-base font-black tracking-tight text-white flex items-center">
                  Career<span className="text-pro-400">Link</span>
                </span>
                <span className="block text-[8px] uppercase font-bold tracking-widest text-slate-300 -mt-1">
                  CONNECT · GROW · GET HIRED
                </span>
              </div>
            </Link>

            {/* Global Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative w-32 sm:w-48 md:w-56 lg:w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search network, jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/15 focus:border-pro-400 rounded-full text-xs text-white placeholder-slate-400 focus:outline-none transition-all"
                />
              </div>
            </form>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1">
            <Link
              to="/feed"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isActive('/feed')
                  ? 'bg-white/20 text-white shadow-inner border border-white/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>

            <Link
              to="/network"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isActive('/network')
                  ? 'bg-white/20 text-white shadow-inner border border-white/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Network</span>
            </Link>

            <Link
              to="/jobs"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isActive('/jobs')
                  ? 'bg-white/20 text-white shadow-inner border border-white/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Jobs</span>
            </Link>

            <Link
              to="/companies"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isActive('/companies')
                  ? 'bg-white/20 text-white shadow-inner border border-white/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Companies</span>
            </Link>

            <Link
              to="/messages"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isActive('/messages')
                  ? 'bg-white/20 text-white shadow-inner border border-white/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Messaging</span>
            </Link>

            <Link
              to="/notifications"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold relative transition-all ${
                isActive('/notifications')
                  ? 'bg-white/20 text-white shadow-inner border border-white/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Alerts</span>
              {unreadCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-900 absolute top-1 right-1" />
              )}
            </Link>

            <Link
              to="/articles"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isActive('/articles')
                  ? 'bg-white/20 text-white shadow-inner border border-white/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Articles</span>
            </Link>
          </nav>

          {/* Right Action Tools: Exact Order = [Theme Toggle] -> [Profile Avatar] -> [Profile Dropdown] */}
          <div className="flex items-center gap-2 shrink-0">
            {/* 1. Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-200" />
              )}
            </button>

            {/* 2. Logged-in User Profile Avatar & Dropdown Wrapper */}
            <div className="relative overflow-visible shrink-0" ref={profileMenuRef}>
              <button
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1.5 p-1 pl-1 pr-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all hover:scale-105 active:scale-95 group shadow-sm"
                title="Your Profile & Account Settings"
              >
                {isAuthenticated ? (
                  <Avatar
                    src={userAvatar}
                    alt={displayName}
                    size="xs"
                    className="ring-1 ring-white/40"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-pro-600 to-indigo-600 flex items-center justify-center text-white text-xs">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                )}
                <span className="text-xs font-bold text-white max-w-[90px] truncate hidden sm:inline">
                  {isAuthenticated ? displayName : 'Profile'}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-300 group-hover:text-white transition-transform duration-150 ${
                    profileDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* 3. Anchored Liquid-Glass Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div
                  className="absolute right-0 top-[calc(100%+10px)] w-[280px] max-w-[calc(100vw-24px)] liquid-glass-dropdown p-3 shadow-2xl z-[100] animate-fadeIn border border-white/20"
                  style={{
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.55)',
                  }}
                >
                  {/* Logged-In User Information Header */}
                  {isAuthenticated ? (
                    <div className="p-3 rounded-2xl bg-white/10 border border-white/15 mb-2">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={userAvatar}
                          alt={displayName}
                          size="md"
                        />
                        <div className="overflow-hidden flex-1">
                          <p className="font-black text-white text-sm truncate">
                            {displayName}
                          </p>
                          <p className="text-[10.5px] text-slate-300 truncate mt-0.5">
                            {userHeadline}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-pro-500/20 text-pro-300 border border-pro-400/30">
                              {user?.role}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate">{user?.email}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-2xl bg-white/10 border border-white/15 mb-2 text-center">
                      <p className="font-bold text-white text-xs">Guest Session</p>
                      <p className="text-[10px] text-slate-300 mt-0.5">Sign in to unlock all CareerLink features</p>
                      <div className="flex justify-center gap-2 mt-2">
                        <Link
                          to="/login"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="px-3 py-1 rounded-xl bg-pro-600 hover:bg-pro-500 text-white font-bold text-xs"
                        >
                          Sign In
                        </Link>
                        <Link
                          to="/register"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
                        >
                          Join Free
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Actions List */}
                  <div className="space-y-1 text-xs py-1 border-t border-white/10">
                    {isAuthenticated && (
                      <>
                        <Link
                          to={`/profile/${profile?._id || user?.id}`}
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 p-2 rounded-xl text-slate-100 hover:bg-white/10 hover:text-white transition-colors font-medium"
                        >
                          <UserIcon className="w-4 h-4 text-pro-400" />
                          <span>View Profile</span>
                        </Link>

                        <Link
                          to="/profile/edit"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 p-2 rounded-xl text-slate-100 hover:bg-white/10 hover:text-white transition-colors font-medium"
                        >
                          <Edit className="w-4 h-4 text-emerald-400" />
                          <span>Edit Profile</span>
                        </Link>

                        <Link
                          to="/analytics"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 p-2 rounded-xl text-slate-100 hover:bg-white/10 hover:text-white transition-colors font-medium"
                        >
                          <BarChart3 className="w-4 h-4 text-sky-400" />
                          <span>Analytics & Insights</span>
                        </Link>

                        <Link
                          to="/settings"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 p-2 rounded-xl text-slate-100 hover:bg-white/10 hover:text-white transition-colors font-medium"
                        >
                          <Settings className="w-4 h-4 text-slate-300" />
                          <span>Settings</span>
                        </Link>
                      </>
                    )}

                    {/* Switch Account */}
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setSwitchAccountModalOpen(true);
                      }}
                      className="w-full text-left flex items-center gap-2.5 p-2 rounded-xl text-slate-100 hover:bg-white/10 hover:text-white transition-colors font-medium"
                    >
                      <RefreshCw className="w-4 h-4 text-amber-400" />
                      <span>Switch Account</span>
                    </button>
                  </div>

                  {/* Log Out Button */}
                  {isAuthenticated && (
                    <div className="pt-2 mt-1 border-t border-white/10">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden pt-3 mt-2 border-t border-white/10 grid grid-cols-3 gap-2 text-center text-xs font-semibold">
            <Link
              to="/feed"
              onClick={() => setMobileMenuOpen(false)}
              className="flex flex-col items-center gap-1 p-2 rounded-xl text-slate-200 hover:bg-white/10"
            >
              <Home className="w-4 h-4 text-pro-400" />
              <span>Home</span>
            </Link>
            <Link
              to="/network"
              onClick={() => setMobileMenuOpen(false)}
              className="flex flex-col items-center gap-1 p-2 rounded-xl text-slate-200 hover:bg-white/10"
            >
              <Users className="w-4 h-4 text-pro-400" />
              <span>Network</span>
            </Link>
            <Link
              to="/jobs"
              onClick={() => setMobileMenuOpen(false)}
              className="flex flex-col items-center gap-1 p-2 rounded-xl text-slate-200 hover:bg-white/10"
            >
              <Briefcase className="w-4 h-4 text-pro-400" />
              <span>Jobs</span>
            </Link>
            <Link
              to="/companies"
              onClick={() => setMobileMenuOpen(false)}
              className="flex flex-col items-center gap-1 p-2 rounded-xl text-slate-200 hover:bg-white/10"
            >
              <Building2 className="w-4 h-4 text-pro-400" />
              <span>Companies</span>
            </Link>
            <Link
              to="/messages"
              onClick={() => setMobileMenuOpen(false)}
              className="flex flex-col items-center gap-1 p-2 rounded-xl text-slate-200 hover:bg-white/10"
            >
              <MessageSquare className="w-4 h-4 text-pro-400" />
              <span>Messages</span>
            </Link>
            <Link
              to="/notifications"
              onClick={() => setMobileMenuOpen(false)}
              className="flex flex-col items-center gap-1 p-2 rounded-xl text-slate-200 hover:bg-white/10"
            >
              <Bell className="w-4 h-4 text-pro-400" />
              <span>Alerts</span>
            </Link>
          </div>
        )}
      </div>

      {/* Switch Account Modal */}
      <SwitchAccountModal
        isOpen={switchAccountModalOpen}
        onClose={() => setSwitchAccountModalOpen(false)}
      />
    </header>
  );
};

export default Navbar;
