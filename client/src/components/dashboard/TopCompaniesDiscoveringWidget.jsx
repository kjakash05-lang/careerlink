import React from 'react';
import { Building2, TrendingUp, Sparkles, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TOP_COMPANIES_DISCOVERING } from '../../data/companyInsightsData';

const TopCompaniesDiscoveringWidget = () => {
  return (
    <div className="liquid-glass p-5 rounded-3xl border border-white/15 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-1.5 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-pro-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Top Companies Discovering Your Profile
            </h3>
          </div>
          <p className="text-[11px] text-slate-300 mt-0.5">
            Ranked by aggregate search & recruiter impression volume
          </p>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/10 text-slate-300 border border-white/10 shrink-0">
          Ranked
        </span>
      </div>

      {/* Ranked List */}
      <div className="space-y-2.5">
        {TOP_COMPANIES_DISCOVERING.map((company) => (
          <div
            key={company.rank}
            className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all group"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              {/* Rank Badge */}
              <span className="text-xs font-black text-slate-400 w-4 text-center">
                #{company.rank}
              </span>

              {/* Company Logo / Avatar */}
              <div
                className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${company.color} flex items-center justify-center text-white font-black text-xs shadow-md shrink-0`}
              >
                {company.initials}
              </div>

              {/* Details */}
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white group-hover:text-pro-300 transition-colors truncate">
                    {company.name}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-slate-300 uppercase tracking-wider">
                    Profile
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  {company.industry}
                </p>
              </div>
            </div>

            {/* Impressions & Trend */}
            <div className="text-right shrink-0 pl-2">
              <p className="text-xs font-black text-white">
                {company.impressions}
              </p>
              <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-400 font-bold">
                <TrendingUp className="w-2.5 h-2.5" />
                <span>{company.trend}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
        <span>Illustrative company discovery signals</span>
        <Link
          to="/companies"
          className="text-pro-400 hover:text-pro-300 font-bold flex items-center gap-0.5"
        >
          <span>Explore directory</span>
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};

export default TopCompaniesDiscoveringWidget;
