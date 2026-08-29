import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserCheck, Briefcase, ArrowRight, CheckCircle2, Loader2, Mail, Lock, User, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import CinematicBackground from '../../components/layout/CinematicBackground';
import CinematicNavbar from '../../components/layout/CinematicNavbar';
import CinematicSocialFooter from '../../components/layout/CinematicSocialFooter';

const RegisterPage = () => {
  const { register, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('candidate');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [headline, setHeadline] = useState('');
  const [location, setLocation] = useState('');
  const [formError, setFormError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    const res = await register({
      role,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password,
      headline: headline.trim(),
      location: location.trim(),
    });

    if (res.success) {
      navigate('/feed', { replace: true });
    } else {
      setFormError(res.message);
    }
  };

  return (
    <CinematicBackground>
      {/* 1. Pill-shaped Liquid Glass Navbar */}
      <CinematicNavbar />

      {/* 2. Main Hero & Register Card */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12 z-20">
        <div className="max-w-lg w-full space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex p-1.5 rounded-2xl bg-gradient-to-tr from-pro-600/40 via-indigo-500/20 to-tealAccent-500/30 border border-white/20 shadow-2xl backdrop-blur-md mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-pro-700 via-pro-600 to-tealAccent-500 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-pro-600/50">
                CL
              </div>
            </div>

            <h1 className="font-serif-hero text-4xl sm:text-5xl font-normal tracking-wide text-white leading-tight">
              Create your Career<span className="text-pro-400 italic">Link</span> Account
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              Connect. Grow. Get Hired. Build your professional future today.
            </p>
          </div>

          {/* Liquid Glass Form Card */}
          <div className="liquid-glass p-6 sm:p-8 rounded-3xl space-y-5">
            {(formError || error) && (
              <div className="p-3 bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs rounded-xl">
                {formError || error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Select your Account Role:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('candidate')}
                    className={`p-3 rounded-2xl border text-left transition-all relative ${
                      role === 'candidate'
                        ? 'border-pro-400 bg-pro-600/20 shadow-lg shadow-pro-600/20'
                        : 'border-white/10 hover:border-white/20 bg-white/5'
                    }`}
                  >
                    <UserCheck className={`w-4 h-4 mb-1.5 ${role === 'candidate' ? 'text-pro-300' : 'text-slate-400'}`} />
                    <p className="font-bold text-xs text-white">Job Seeker</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Explore jobs & grow network</p>
                    {role === 'candidate' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-pro-400 absolute top-2.5 right-2.5" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('recruiter')}
                    className={`p-3 rounded-2xl border text-left transition-all relative ${
                      role === 'recruiter'
                        ? 'border-indigo-400 bg-indigo-600/20 shadow-lg shadow-indigo-600/20'
                        : 'border-white/10 hover:border-white/20 bg-white/5'
                    }`}
                  >
                    <Briefcase className={`w-4 h-4 mb-1.5 ${role === 'recruiter' ? 'text-indigo-300' : 'text-slate-400'}`} />
                    <p className="font-bold text-xs text-white">Recruiter</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Post jobs & hire talent</p>
                    {role === 'recruiter' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 absolute top-2.5 right-2.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Names */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">First name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jane"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="liquid-glass-input w-full px-3 py-2 rounded-xl text-xs placeholder-slate-500 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Last name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="liquid-glass-input w-full px-3 py-2 rounded-xl text-xs placeholder-slate-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email & Password */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="liquid-glass-input w-full pl-10 pr-3 py-2 rounded-xl text-xs placeholder-slate-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Password (6+ characters)</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="liquid-glass-input w-full pl-10 pr-3 py-2 rounded-xl text-xs placeholder-slate-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Professional Headline */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Professional Headline</label>
                <input
                  type="text"
                  placeholder={role === 'candidate' ? 'e.g. Software Engineer | React, Node.js' : 'e.g. Senior Technical Recruiter'}
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="liquid-glass-input w-full px-3 py-2 rounded-xl text-xs placeholder-slate-500 focus:outline-none transition-all"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. San Francisco, CA or Remote"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="liquid-glass-input w-full pl-10 pr-3 py-2 rounded-xl text-xs placeholder-slate-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pro-600 via-pro-500 to-indigo-600 hover:from-pro-500 hover:to-indigo-500 shadow-lg shadow-pro-600/40 hover:shadow-pro-600/60 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Agree & Join CareerLink</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-white/10 text-center text-xs text-slate-400">
              Already registered on CareerLink?{' '}
              <Link to="/login" className="font-bold text-pro-400 hover:text-pro-300 hover:underline">
                Sign in
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

export default RegisterPage;
