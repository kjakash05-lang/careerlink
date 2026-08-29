import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, User, Briefcase, ArrowRight, Loader2, Lock, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import CinematicBackground from '../../components/layout/CinematicBackground';
import CinematicNavbar from '../../components/layout/CinematicNavbar';
import CinematicSocialFooter from '../../components/layout/CinematicSocialFooter';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton';

const LoginPage = () => {
  const { login, demoLogin, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/feed';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    const res = await login(email, password);
    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setFormError(res.message);
    }
  };

  const handleQuickDemo = async (role) => {
    const res = await demoLogin(role);
    if (res.success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <CinematicBackground>
      {/* 1. Pill-shaped Liquid Glass Navbar */}
      <CinematicNavbar />

      {/* 2. Main Hero & Login Card */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12 z-20">
        <div className="max-w-md w-full space-y-6">
          {/* Brand Monogram & Hero Heading */}
          <div className="text-center space-y-2">
            <div className="inline-flex p-1.5 rounded-2xl bg-gradient-to-tr from-pro-600/40 via-indigo-500/20 to-tealAccent-500/30 border border-white/20 shadow-2xl backdrop-blur-md mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-pro-700 via-pro-600 to-tealAccent-500 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-pro-600/50">
                CL
              </div>
            </div>

            <h1 className="font-serif-hero text-4xl sm:text-5xl font-normal tracking-wide text-white leading-tight">
              Welcome to Career<span className="text-pro-400 italic">Link</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              Connect. Grow. Get Hired. Sign in to your account.
            </p>
          </div>

          {/* Instant Demo Accounts Liquid-Glass Section */}
          <div className="liquid-glass p-4 rounded-3xl space-y-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-pro-300 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Instant Demo Accounts</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('candidate')}
                className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white/5 hover:bg-white/12 border border-white/10 hover:border-pro-400/50 text-left text-xs transition-all group"
              >
                <div className="w-7 h-7 rounded-xl bg-pro-600/30 border border-pro-400/30 flex items-center justify-center text-pro-300 shrink-0 group-hover:scale-110 transition-transform">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-white group-hover:text-pro-300 truncate">Alex (Candidate)</p>
                  <p className="text-[10px] text-slate-400 truncate">Senior Full Stack</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('recruiter')}
                className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white/5 hover:bg-white/12 border border-white/10 hover:border-indigo-400/50 text-left text-xs transition-all group"
              >
                <div className="w-7 h-7 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0 group-hover:scale-110 transition-transform">
                  <Briefcase className="w-3.5 h-3.5" />
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-white group-hover:text-indigo-300 truncate">Elena (Recruiter)</p>
                  <p className="text-[10px] text-slate-400 truncate">NovaTech Talent</p>
                </div>
              </button>
            </div>
          </div>

          {/* Login Form Liquid-Glass Card */}
          <div className="liquid-glass p-6 sm:p-7 rounded-3xl space-y-4">
            {(formError || error) && (
              <div className="p-3 bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs rounded-xl">
                {formError || error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="liquid-glass-input w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs placeholder-slate-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="liquid-glass-input w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs placeholder-slate-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pro-600 via-pro-500 to-indigo-600 hover:from-pro-500 hover:to-indigo-500 shadow-lg shadow-pro-600/40 hover:shadow-pro-600/60 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* OR Divider */}
            <div className="relative flex items-center justify-center py-0.5">
              <div className="border-t border-white/10 w-full" />
              <span className="bg-transparent px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">
                or
              </span>
              <div className="border-t border-white/10 w-full" />
            </div>

            {/* Continue with Google OAuth Button */}
            <GoogleSignInButton
              onSuccess={() => navigate(from, { replace: true })}
              onError={(err) => setFormError(typeof err === 'string' ? err : 'Google sign-in was cancelled or failed.')}
            />

            <div className="pt-4 border-t border-white/10 text-center text-xs text-slate-400">
              Don't have a CareerLink account?{' '}
              <Link to="/register" className="font-bold text-pro-400 hover:text-pro-300 hover:underline">
                Join now
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* 3. Cinematic Social Footer */}
      <CinematicSocialFooter />
    </CinematicBackground>
  );
};

export default LoginPage;
