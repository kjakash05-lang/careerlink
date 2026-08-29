import React from 'react';
import { Sparkles, CheckCircle2, Circle, ArrowRight, X, User, Briefcase, Plus, FileText, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAnalytics } from '../../context/AnalyticsContext';

const OnboardingWelcomeBanner = ({ onOpenPostModal }) => {
  const { user, profile } = useAuth();
  const { analytics, completionPercentage, dismissOnboarding } = useAnalytics();

  if (!user || analytics?.onboardingDismissed || analytics?.isNewAccount === false) {
    return null;
  }

  const firstName = profile?.firstName || user?.profile?.firstName || user?.firstName || 'Professional';
  const hasAbout = Boolean(profile?.about && profile.about.trim().length > 5);
  const hasSkills = Boolean(profile?.skills && profile.skills.length > 0);
  const hasExperience = Boolean(profile?.experience && profile.experience.length > 0);
  const hasResume = Boolean(profile?.resume?.url);
  const hasPost = (analytics?.postsCount || 0) > 0;

  const checklist = [
    {
      id: 'profile',
      label: 'Complete core profile & bio',
      completed: hasAbout,
      to: '/profile/edit',
      icon: <User className="w-3.5 h-3.5" />,
    },
    {
      id: 'skills',
      label: 'Add your top tech skills',
      completed: hasSkills,
      to: '/profile/edit',
      icon: <Briefcase className="w-3.5 h-3.5" />,
    },
    {
      id: 'resume',
      label: 'Upload your verified resume',
      completed: hasResume,
      to: '/profile/edit',
      icon: <FileText className="w-3.5 h-3.5" />,
    },
    {
      id: 'network',
      label: 'Connect with 3+ peers',
      completed: (analytics?.connectionsCount || 0) >= 3,
      to: '/network',
      icon: <Users className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="liquid-glass p-5 rounded-3xl border border-white/20 shadow-2xl relative overflow-hidden space-y-4 mb-6">
      {/* Glow accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-pro-600/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pro-600 via-pro-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg shrink-0">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h3 className="font-black text-white text-base sm:text-lg flex items-center gap-1.5">
              <span>Welcome to CareerLink, {firstName}</span>
              <span className="text-amber-400">👋</span>
            </h3>
            <p className="text-xs text-slate-300">
              Let's build your professional presence and get discovered by top tech recruiters.
            </p>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={dismissOnboarding}
          className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Dismiss onboarding banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5 relative z-10">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-200">Profile Readiness</span>
          <span className="font-black text-pro-400">{completionPercentage}% Complete</span>
        </div>
        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-pro-500 to-emerald-400 transition-all duration-700 ease-out"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Checklist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 relative z-10 pt-1">
        {checklist.map((item) => (
          <Link
            key={item.id}
            to={item.to}
            className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between text-xs group ${
              item.completed
                ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-300'
                : 'bg-white/5 hover:bg-white/12 border-white/10 hover:border-white/20 text-slate-300 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              {item.completed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-slate-500 shrink-0 group-hover:text-pro-400" />
              )}
              <span className="font-medium truncate">{item.label}</span>
            </div>
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1 text-pro-400" />
          </Link>
        ))}
      </div>

      {/* Actions Row */}
      <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 relative z-10 text-xs">
        <span className="text-[11px] text-slate-400">
          Your profile visibility increases as you complete each section.
        </span>

        <div className="flex items-center gap-2">
          {onOpenPostModal && (
            <button
              type="button"
              onClick={onOpenPostModal}
              className="py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-pro-400" />
              <span>Create First Post</span>
            </button>
          )}

          <Link
            to="/profile/edit"
            className="py-1.5 px-3 rounded-xl bg-pro-600 hover:bg-pro-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1"
          >
            <span>Complete Profile</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWelcomeBanner;
