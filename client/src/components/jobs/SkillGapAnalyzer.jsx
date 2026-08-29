import React from 'react';
import { CheckCircle2, AlertCircle, Sparkles, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const normalizeSkill = (s) => (typeof s === 'string' ? s : s?.name || '').toLowerCase().trim();

const SkillGapAnalyzer = ({ job, className = '' }) => {
  const { profile } = useAuth();
  if (!job || !job.skillsRequired || job.skillsRequired.length === 0) return null;

  const candidateSkills = (profile?.skills || []).map(normalizeSkill);

  const matched = [];
  const missing = [];

  job.skillsRequired.forEach((reqSkill) => {
    const normalized = normalizeSkill(reqSkill);
    const hasMatch = candidateSkills.some(
      (cSkill) => cSkill.includes(normalized) || normalized.includes(cSkill)
    );
    if (hasMatch) {
      matched.push(reqSkill);
    } else {
      missing.push(reqSkill);
    }
  });

  const missingCount = missing.length;

  return (
    <div className={`p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Skill Gap Analysis
          </h4>
        </div>
        <span
          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
            missingCount === 0
              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
              : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
          }`}
        >
          {missingCount === 0 ? '✓ Full Skill Match' : `Missing ${missingCount} skill${missingCount > 1 ? 's' : ''}`}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Matched Skills */}
        <div>
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Your Matched Skills ({matched.length})</span>
          </p>
          {matched.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {matched.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-md text-[11px] font-semibold border border-emerald-200 dark:border-emerald-800"
                >
                  ✓ {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 italic">No direct skill matches found in profile.</p>
          )}
        </div>

        {/* Missing Skill Gaps */}
        <div>
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>Skill Gaps for Role ({missing.length})</span>
          </p>
          {missing.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {missing.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-md text-[11px] font-semibold border border-amber-200 dark:border-amber-800"
                >
                  ⚠ {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">You meet all skill requirements!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillGapAnalyzer;
