import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Briefcase,
  DollarSign,
  Bookmark,
  Sparkles,
  CheckCircle2,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { jobService } from '../../services/api';
import Badge from '../common/Badge';
import MatchBreakdownModal from './MatchBreakdownModal';
import ApplyModal from './ApplyModal';

const JobCard = ({ job, onSaveToggle, isSelected = false, onSelect }) => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [isSaved, setIsSaved] = useState(job.isSaved || false);
  const [hasApplied, setHasApplied] = useState(job.hasApplied || false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);

  const score = job.matchScore || 75;

  const handleSave = async (e) => {
    e.stopPropagation();
    if (!user) return;
    setIsSaved(!isSaved);
    try {
      if (isSaved) {
        await jobService.unsaveJob(job._id);
        showToast('Job removed from saved', 'info');
      } else {
        await jobService.saveJob(job._id);
        showToast('Job saved to bookmarks', 'success');
      }
      if (onSaveToggle) onSaveToggle(job._id, !isSaved);
    } catch (err) {
      setIsSaved(isSaved);
    }
  };

  return (
    <>
      <div
        onClick={() => onSelect && onSelect(job)}
        className={`pro-card p-5 cursor-pointer transition-all relative ${
          isSelected
            ? 'border-pro-500 ring-2 ring-pro-500/30 bg-pro-50/20 dark:bg-pro-950/20 shadow-md'
            : 'hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          {/* Company Logo & Job Title */}
          <div className="flex items-start gap-3.5 flex-1">
            <img
              src={job.company?.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80'}
              alt={job.company?.name || 'Company'}
              className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs shrink-0"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80';
              }}
            />

            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white hover:text-pro-600 dark:hover:text-pro-400 transition-colors line-clamp-1">
                {job.title}
              </h4>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                {job.company?.name}
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  {job.jobType} · {job.workMode}
                </span>
                {job.salaryMin > 0 && (
                  <span className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
                    <DollarSign className="w-3.5 h-3.5" />
                    ${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k/yr
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={handleSave}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
          </button>
        </div>

        {/* Skills Pills */}
        {job.skillsRequired && job.skillsRequired.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            {job.skillsRequired.slice(0, 4).map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-[11px] font-medium"
              >
                {skill}
              </span>
            ))}
            {job.skillsRequired.length > 4 && (
              <span className="px-1.5 py-0.5 text-slate-400 text-[11px]">
                +{job.skillsRequired.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Recommendation Engine Match Badge & Action Footer */}
        <div className="mt-4 flex items-center justify-between gap-2">
          {/* Match Score Badge */}
          {user && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMatchModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors shadow-xs"
              title="Click to view transparent match scoring breakdown & skill gaps"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{score}% Match</span>
            </button>
          )}

          {/* Apply or Status Button */}
          <div className="flex items-center gap-2">
            {hasApplied ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Applied
              </span>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowApplyModal(true);
                }}
                className="pro-btn-primary text-xs py-1.5 px-3"
              >
                1-Click Apply
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <MatchBreakdownModal
        isOpen={showMatchModal}
        onClose={() => setShowMatchModal(false)}
        job={job}
      />
      <ApplyModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        job={job}
        onApplied={() => setHasApplied(true)}
      />
    </>
  );
};

export default JobCard;
