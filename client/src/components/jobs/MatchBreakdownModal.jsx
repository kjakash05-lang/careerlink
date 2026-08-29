import React from 'react';
import { CheckCircle2, AlertCircle, Percent, Sparkles, Layers } from 'lucide-react';
import Modal from '../common/Modal';
import SkillGapAnalyzer from './SkillGapAnalyzer';

const MatchBreakdownModal = ({ isOpen, onClose, job }) => {
  if (!job) return null;

  const score = job.matchScore || 75;
  const breakdown = job.matchBreakdown || {
    skills: 30,
    experience: 18,
    title: 12,
    education: 8,
    location: 8,
    workMode: 5,
  };
  const reasons = job.matchReasons || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Recommendation Match Breakdown" maxWidth="max-w-lg">
      <div className="space-y-5">
        {/* Score Header Card */}
        <div className="p-4 bg-gradient-to-br from-pro-50 via-indigo-50/60 to-emerald-50/40 dark:from-slate-850 dark:via-pro-950/40 dark:to-slate-850 rounded-2xl border border-pro-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-pro-700 dark:text-pro-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Algorithmic Match Score
            </span>
            <h4 className="text-lg font-black text-slate-900 dark:text-white mt-1">{job.title}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">{job.company?.name} · {job.location}</p>
          </div>

          <div className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-md border border-pro-200 dark:border-pro-800 text-pro-600 dark:text-pro-400 font-black text-xl shrink-0">
            <span>{score}%</span>
            <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">Match</span>
          </div>
        </div>

        {/* Skill Gap Analysis Section */}
        <SkillGapAnalyzer job={job} />

        {/* 6-Factor Weighted Breakdown Bar */}
        <div>
          <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-pro-600 dark:text-pro-400" /> Transparent Scoring Factors (Total: 100%)
          </h5>

          <div className="space-y-2 text-xs">
            <div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 font-medium mb-1">
                <span>1. Skills Intersection (Max 40%)</span>
                <span className="font-bold text-pro-700 dark:text-pro-400">{breakdown.skills}/40 pts</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-pro-600 rounded-full" style={{ width: `${(breakdown.skills / 40) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 font-medium mb-1">
                <span>2. Experience Alignment (Max 20%)</span>
                <span className="font-bold text-pro-700 dark:text-pro-400">{breakdown.experience}/20 pts</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${(breakdown.experience / 20) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 font-medium mb-1">
                <span>3. Title & Role Relevance (Max 15%)</span>
                <span className="font-bold text-pro-700 dark:text-pro-400">{breakdown.title}/15 pts</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-tealAccent-500 rounded-full" style={{ width: `${(breakdown.title / 15) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 font-medium mb-1">
                <span>4. Education Background (Max 10%)</span>
                <span className="font-bold text-pro-700 dark:text-pro-400">{breakdown.education}/10 pts</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-600 rounded-full" style={{ width: `${(breakdown.education / 10) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 font-medium mb-1">
                <span>5. Location & Commute (Max 10%)</span>
                <span className="font-bold text-pro-700 dark:text-pro-400">{breakdown.location}/10 pts</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${(breakdown.location / 10) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 font-medium mb-1">
                <span>6. Preferred Work Mode (Max 5%)</span>
                <span className="font-bold text-pro-700 dark:text-pro-400">{breakdown.workMode}/5 pts</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(breakdown.workMode / 5) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Why You Match Reason List */}
        <div>
          <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
            Deterministic Match Factors:
          </h5>
          <div className="space-y-1.5">
            {reasons.length > 0 ? (
              reasons.map((r, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ${
                    r.matched
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800'
                      : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800'
                  }`}
                >
                  {r.matched ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  )}
                  <span>{r.text}</span>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 italic p-2 bg-slate-50 dark:bg-slate-850 rounded-xl">
                Match calculated dynamically based on your verified skills, experience timeline, and preferences.
              </div>
            )}
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button onClick={onClose} className="pro-btn-secondary text-xs px-4 py-2">
            Close Breakdown
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default MatchBreakdownModal;
