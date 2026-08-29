import React, { useState } from 'react';
import { Building2, Users, Briefcase, Plus, Check, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CURATED_COMPANIES_DIRECTORY } from '../../data/companyInsightsData';
import { useNotifications } from '../../context/NotificationContext';

const InterestedCompaniesWidget = () => {
  const { showToast } = useNotifications();
  const [followingMap, setFollowingMap] = useState({});

  const toggleFollow = (companyId, companyName) => {
    const isNowFollowing = !followingMap[companyId];
    setFollowingMap((prev) => ({
      ...prev,
      [companyId]: isNowFollowing,
    }));

    if (isNowFollowing) {
      showToast(`Now following ${companyName}`, 'success');
    } else {
      showToast(`Unfollowed ${companyName}`, 'info');
    }
  };

  return (
    <div className="liquid-glass p-5 rounded-3xl border border-white/15 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-pro-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Companies You May Be Interested In
            </h3>
          </div>
          <p className="text-[11px] text-slate-300 mt-0.5">
            Curated technology leaders hiring engineering, AI, and cloud talent
          </p>
        </div>

        <Link
          to="/companies"
          className="text-xs font-bold text-pro-400 hover:text-pro-300 flex items-center gap-1 shrink-0 self-start sm:self-auto"
        >
          <span>View All Directory</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {CURATED_COMPANIES_DIRECTORY.slice(0, 6).map((company) => {
          const isFollowing = Boolean(followingMap[company.id]);
          return (
            <div
              key={company.id}
              className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Logo & Follow Action Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div
                    className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${company.color} flex items-center justify-center text-white font-black text-sm shadow-lg group-hover:scale-105 transition-transform shrink-0`}
                  >
                    {company.initials}
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleFollow(company.id, company.name)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border ${
                      isFollowing
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-sm'
                        : 'bg-white/10 text-white hover:bg-white/20 border-white/15'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3 text-pro-300" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Company Name & Details */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-white text-sm group-hover:text-pro-300 transition-colors truncate">
                      {company.name}
                    </h4>
                    <span className="text-[8.5px] px-1.5 py-0.2 rounded bg-white/10 text-slate-300 uppercase tracking-wider font-semibold">
                      Profile
                    </span>
                  </div>

                  <p className="text-[10.5px] text-slate-300 line-clamp-1">
                    {company.industry}
                  </p>
                  <p className="text-[10px] text-slate-400 line-clamp-2 mt-1">
                    {company.tagline}
                  </p>
                </div>
              </div>

              {/* Stats & Link */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10.5px]">
                <span className="text-pro-300 font-bold flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  <span>{company.openRoles}</span>
                </span>

                <Link
                  to="/jobs"
                  className="text-slate-300 hover:text-white font-semibold flex items-center gap-0.5 transition-colors"
                >
                  <span>Explore jobs</span>
                  <ArrowRight className="w-3 h-3 text-pro-400" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InterestedCompaniesWidget;
