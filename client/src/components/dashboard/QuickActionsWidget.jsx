import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Briefcase, FileText, Search, Users, Sparkles, PenSquare } from 'lucide-react';

const QuickActionsWidget = ({ onOpenPostModal, className = '' }) => {
  return (
    <div className={`pro-card p-5 ${className}`}>
      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-white mb-3">
        Quick Actions
      </h3>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onOpenPostModal}
          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 hover:bg-pro-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-left text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 transition-colors group"
        >
          <PenSquare className="w-3.5 h-3.5 text-pro-600 dark:text-pro-400 group-hover:scale-110 transition-transform" />
          <span>Create Post</span>
        </button>

        <Link
          to="/jobs"
          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 hover:bg-pro-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-left text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 transition-colors group"
        >
          <Search className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
          <span>Find Jobs</span>
        </Link>

        <Link
          to="/profile/edit"
          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 hover:bg-pro-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-left text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 transition-colors group"
        >
          <Briefcase className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
          <span>Add Work</span>
        </Link>

        <Link
          to="/network"
          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 hover:bg-pro-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-left text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 transition-colors group"
        >
          <Users className="w-3.5 h-3.5 text-tealAccent-500 group-hover:scale-110 transition-transform" />
          <span>Grow Network</span>
        </Link>
      </div>
    </div>
  );
};

export default QuickActionsWidget;
