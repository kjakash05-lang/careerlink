import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Flame, Target, Briefcase, Eye, Sparkles, BarChart3, ArrowRight } from 'lucide-react';
import { calculateCareerScore } from '../profile/CareerScoreWidget';

const CareerInsightsWidget = ({ profile, user, jobCount = 12 }) => {
  const { score } = calculateCareerScore(profile);
  const skills = profile?.skills || [];
  const topSkill = skills.length > 0 ? (typeof skills[0] === 'string' ? skills[0] : skills[0].name) : 'Software Engineering';

  return (
    <div className="liquid-glass p-5 rounded-3xl border border-white/15 space-y-3.5 shadow-xl">
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-pro-400" />
          <h3 className="text-xs font-black uppercase tracking-wider text-white">
            Career Insights & Analytics
          </h3>
        </div>
        <Link
          to="/analytics"
          className="text-[10.5px] font-bold text-pro-400 hover:text-pro-300 flex items-center gap-0.5"
        >
          <span>Full Report</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-2 text-xs">
        {/* Metric Snapshots */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-center">
            <p className="text-base font-black text-white">12,480</p>
            <p className="text-[9.5px] text-slate-300 font-semibold">Impressions</p>
            <span className="text-[9px] text-emerald-400 font-bold">+18.4%</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-center">
            <p className="text-base font-black text-white">3,240</p>
            <p className="text-[9.5px] text-slate-300 font-semibold">Recruiter Views</p>
            <span className="text-[9px] text-emerald-400 font-bold">+12.7%</span>
          </div>
        </div>

        <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2.5">
          <Flame className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <p className="font-bold text-white text-[11px]">
              Profile is {score}% Complete
            </p>
            <p className="text-[10px] text-slate-400">
              {score >= 80 ? 'High visibility across top tech recruiters' : 'Complete sections to boost discovery'}
            </p>
          </div>
        </div>

        {skills.length > 0 && (
          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-white text-[11px]">
                {topSkill} in High Demand
              </p>
              <p className="text-[10px] text-slate-400">
                Top matched skill in Microsoft, NVIDIA, and Google searches
              </p>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-white/10">
          <Link
            to="/analytics"
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-pro-600 via-pro-500 to-indigo-600 hover:from-pro-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all group"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Open Performance Graph →</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CareerInsightsWidget;
