import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  Briefcase,
  Building2,
  MessageSquare,
  Bell,
  FileText,
  Sun,
  Moon,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Avatar from '../common/Avatar';

const CinematicNavbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="w-full pt-4 sm:pt-6 px-4 sm:px-6 lg:px-8 z-30">
      <div className="max-w-6xl mx-auto liquid-glass rounded-3xl sm:rounded-full px-5 py-3.5 transition-all shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Brand Logo & Tagline */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pro-700 via-pro-600 to-tealAccent-500 flex items-center justify-center text-white font-black text-base shadow-lg shadow-pro-600/30 group-hover:scale-105 transition-transform">
              <span>CL</span>
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white flex items-center">
                Career<span className="text-pro-400">Link</span>
              </span>
              <span className="hidden sm:block text-[8.5px] uppercase font-bold tracking-widest text-slate-300 -mt-1">
                CONNECT · GROW · GET HIRED
              </span>
            </div>
          </Link>

          {/* Center: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <Link
              to="/feed"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isActive('/feed') || isActive('/')
                  ? 'bg-white/15 text-white shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>

            <Link
              to="/network"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isActive('/network')
                  ? 'bg-white/15 text-white shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Network</span>
            </Link>

            <Link
              to="/jobs"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isActive('/jobs')
                  ? 'bg-white/15 text-white shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Jobs</span>
            </Link>

            <Link
              to="/companies"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isActive('/companies')
                  ? 'bg-white/15 text-white shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Companies</span>
            </Link>

            <Link
              to="/messages"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isActive('/messages')
                  ? 'bg-white/15 text-white shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Messaging</span>
            </Link>

            <Link
              to="/notifications"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isActive('/notifications')
                  ? 'bg-white/15 text-white shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Alerts</span>
            </Link>

            <Link
              to="/articles"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isActive('/articles')
                  ? 'bg-white/15 text-white shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Articles</span>
            </Link>
          </nav>

          {/* Right: Theme Toggle & Auth */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-200" />
              )}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link to="/feed" className="text-xs font-bold text-white hover:underline">
                  Go to Feed →
                </Link>
                <button
                  onClick={logout}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold text-rose-300 hover:bg-rose-950/40 border border-rose-800/60 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-1.5 rounded-full text-xs font-bold text-white hover:bg-white/10 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-pro-600 to-indigo-600 hover:from-pro-500 hover:to-indigo-500 shadow-md shadow-pro-600/30 transition-all hover:scale-105"
                >
                  Join Free
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-1.5 text-slate-300 hover:text-white"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileOpen && (
          <div className="lg:hidden pt-4 mt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-xs font-semibold">
            <Link
              to="/feed"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 p-2 rounded-xl text-slate-200 hover:bg-white/10"
            >
              <Home className="w-4 h-4 text-pro-400" />
              <span>Home Feed</span>
            </Link>
            <Link
              to="/jobs"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 p-2 rounded-xl text-slate-200 hover:bg-white/10"
            >
              <Briefcase className="w-4 h-4 text-pro-400" />
              <span>Jobs</span>
            </Link>
            <Link
              to="/network"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 p-2 rounded-xl text-slate-200 hover:bg-white/10"
            >
              <Users className="w-4 h-4 text-pro-400" />
              <span>Network</span>
            </Link>
            <Link
              to="/companies"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 p-2 rounded-xl text-slate-200 hover:bg-white/10"
            >
              <Building2 className="w-4 h-4 text-pro-400" />
              <span>Companies</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default CinematicNavbar;
