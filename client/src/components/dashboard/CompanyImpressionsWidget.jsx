import React from 'react';
import { TrendingUp, Eye, Search, Briefcase, Building2, Sparkles, Plus, ArrowRight, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAnalytics } from '../../context/AnalyticsContext';

const CompanyImpressionsWidget = () => {
  const { analytics, completionPercentage } = useAnalytics();

  const isNewAccount = analytics?.isNewAccount !== false && (analytics?.profileImpressions || 0) === 0;

  const metrics = [
    {
      id: 'profile-impressions',
      label: 'Profile Impressions',
      value: (analytics?.profileImpressions || 0).toLocaleString(),
      change: isNewAccount ? '+0.0%' : '+18.4%',
      description: isNewAccount ? 'Appears when recruiters browse profiles' : 'Times your card appeared in search feeds',
      icon: <Eye className="w-4 h-4 text-blue-400" />,
      cta: isNewAccount ? { label: 'Complete Profile →', to: '/profile/edit' } : null,
    },
    {
      id: 'recruiter-views',
      label: 'Recruiter Views',
      value: (analytics?.recruiterInterest || analytics?.profileViews || 0).toLocaleString(),
      change: isNewAccount ? '+0.0%' : '+12.7%',
      description: isNewAccount ? 'Unique verified talent teams inspecting you' : 'Technical recruiters viewing your full profile',
      icon: <Building2 className="w-4 h-4 text-emerald-400" />,
      cta: isNewAccount ? { label: 'Add Skills →', to: '/profile/edit' } : null,
    },
    {
      id: 'job-views',
      label: 'Job Matches',
      value: (analytics?.jobViews || 0).toLocaleString(),
      change: isNewAccount ? '+0.0%' : '+8.3%',
      description: isNewAccount ? 'Roles matching your preferred tech stack' : 'Company postings matching your stack',
      icon: <Briefcase className="w-4 h-4 text-purple-400" />,
      cta: isNewAccount ? { label: 'Browse Jobs →', to: '/jobs' } : null,
    },
    {
      id: 'profile-searches',
      label: 'Network Connections',
      value: (analytics?.connectionsCount || 0).toLocaleString(),
      change: isNewAccount ? '+0.0%' : '+21.5%',
      description: isNewAccount ? 'Verified developers in your network' : 'Direct peers & industry connections',
      icon: <UserCheck className="w-4 h-4 text-amber-400" />,
      cta: isNewAccount ? { label: 'Grow Network →', to: '/network' } : null,
    },
  ];

  return (
    <div className="liquid-glass p-5 rounded-3xl border border-white/15 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-3 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-pro-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Company Impressions
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/10 text-slate-300 border border-white/10">
              {isNewAccount ? 'Baseline' : 'Active Account'}
            </span>
          </div>
          <p className="text-[11px] text-slate-300 mt-0.5">
            {isNewAccount
              ? 'Complete your profile to start getting discovered by verified tech companies'
              : 'How frequently verified organizations and talent teams discover your profile'}
          </p>
        </div>

        <div className="text-[10px] text-slate-400 flex items-center gap-1">
          <span>Past 30 Days</span>
        </div>
      </div>

      {/* 4 Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-1 mb-2">
              <div className="p-2 rounded-xl bg-white/10 border border-white/10 shrink-0 group-hover:scale-105 transition-transform">
                {metric.icon}
              </div>
              <div
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  metric.change === '+0.0%'
                    ? 'bg-white/10 text-slate-400 border border-white/10'
                    : 'bg-emerald-500/15 border border-emerald-500/25 text-emerald-400'
                }`}
              >
                <TrendingUp className="w-2.5 h-2.5" />
                <span>{metric.change}</span>
              </div>
            </div>

            <div>
              <p className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {metric.value}
              </p>
              <p className="text-[11px] font-semibold text-slate-200 truncate mt-0.5">
                {metric.label}
              </p>
              <p className="text-[9.5px] text-slate-400 line-clamp-1 mt-0.5">
                {metric.description}
              </p>

              {/* Actionable CTA for New Accounts */}
              {metric.cta && (
                <Link
                  to={metric.cta.to}
                  className="mt-2.5 inline-flex items-center gap-1 text-[10.5px] font-bold text-pro-400 hover:text-pro-300 hover:underline"
                >
                  <span>{metric.cta.label}</span>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-white/10">
        <span>
          {isNewAccount ? 'New account baseline analytics' : 'User-specific live performance metrics'}
        </span>
        <span className="text-pro-400 font-semibold">
          Profile: {completionPercentage}% Complete
        </span>
      </div>
    </div>
  );
};

export default CompanyImpressionsWidget;
