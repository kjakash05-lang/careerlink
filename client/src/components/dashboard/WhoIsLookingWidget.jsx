import React from 'react';
import { Users2, UserCheck, Briefcase, Building, Sparkles } from 'lucide-react';
import { VIEWER_BREAKDOWN_DATA } from '../../data/companyInsightsData';

const getCategoryIcon = (category) => {
  switch (category) {
    case 'Recruiters':
      return <UserCheck className="w-3.5 h-3.5 text-pro-400" />;
    case 'Hiring Managers':
      return <Briefcase className="w-3.5 h-3.5 text-emerald-400" />;
    case 'Talent Teams':
      return <Users2 className="w-3.5 h-3.5 text-purple-400" />;
    case 'Company Pages':
      return <Building className="w-3.5 h-3.5 text-amber-400" />;
    default:
      return <Sparkles className="w-3.5 h-3.5 text-pro-400" />;
  }
};

const WhoIsLookingWidget = () => {
  return (
    <div className="liquid-glass p-5 rounded-3xl border border-white/15 shadow-xl space-y-4 flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-1.5 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Users2 className="w-4 h-4 text-pro-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Who's Looking at You?
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/10 text-slate-300 border border-white/10">
            Breakdown
          </span>
        </div>
        <p className="text-[11px] text-slate-300 mt-1">
          Distribution of professional roles and verified organizations viewing your profile
        </p>
      </div>

      {/* Categories Progress Breakdown */}
      <div className="space-y-3">
        {VIEWER_BREAKDOWN_DATA.map((item) => (
          <div key={item.category} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                {getCategoryIcon(item.category)}
                <span>{item.category}</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-mono">({item.count})</span>
                <span className="font-black text-white">{item.percentage}%</span>
              </div>
            </div>

            {/* Progress Track */}
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${item.color}`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Footer Disclaimer */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
        <span>Illustrative analytics</span>
        <span className="text-slate-300 font-semibold">Total: 3,240 views</span>
      </div>
    </div>
  );
};

export default WhoIsLookingWidget;
