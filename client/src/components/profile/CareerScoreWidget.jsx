import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, CheckCircle2, AlertCircle, TrendingUp, Award, FileText, ArrowRight } from 'lucide-react';

export const calculateCareerScore = (profile) => {
  if (!profile) return { score: 0, checklist: [] };

  let score = 0;
  const checklist = [];

  // 1. Basic Info (Avatar, Headline, About, Location): Max 20
  const hasAvatar = Boolean(profile.avatar);
  const hasHeadline = Boolean(profile.headline && profile.headline.length > 5);
  const hasAbout = Boolean(profile.about && profile.about.length > 10);
  const hasLocation = Boolean(profile.location);

  let basicScore = 0;
  if (hasAvatar) basicScore += 5;
  if (hasHeadline) basicScore += 5;
  if (hasAbout) basicScore += 5;
  if (hasLocation) basicScore += 5;
  score += basicScore;

  if (basicScore === 20) {
    checklist.push({ label: 'Profile essentials completed', completed: true, type: 'basic' });
  } else {
    checklist.push({ label: 'Complete bio & headline', completed: false, type: 'basic', href: '/profile/edit' });
  }

  // 2. Skills: Max 20 (4 pts per skill up to 5)
  const skillsCount = profile.skills ? profile.skills.length : 0;
  const skillsScore = Math.min(20, skillsCount * 4);
  score += skillsScore;

  if (skillsCount >= 5) {
    checklist.push({ label: `${skillsCount} verified skills added`, completed: true, type: 'skills' });
  } else {
    checklist.push({ label: `Add ${5 - skillsCount} more skills`, completed: false, type: 'skills', href: '/profile/edit' });
  }

  // 3. Work Experience: Max 20
  const expCount = profile.experience ? profile.experience.length : 0;
  if (expCount >= 1) {
    score += 20;
    checklist.push({ label: 'Work experience history added', completed: true, type: 'exp' });
  } else {
    checklist.push({ label: 'Add work experience history', completed: false, type: 'exp', href: '/profile/edit' });
  }

  // 4. Education: Max 10
  const eduCount = profile.education ? profile.education.length : 0;
  if (eduCount >= 1) {
    score += 10;
    checklist.push({ label: 'Education credentials added', completed: true, type: 'edu' });
  } else {
    checklist.push({ label: 'Add degree or education background', completed: false, type: 'edu', href: '/profile/edit' });
  }

  // 5. Resume Uploaded: Max 15
  const hasResume = Boolean(profile.resume && profile.resume.url);
  if (hasResume) {
    score += 15;
    checklist.push({ label: 'PDF Resume attached for 1-Click apply', completed: true, type: 'resume' });
  } else {
    checklist.push({ label: 'Upload your PDF resume', completed: false, type: 'resume', href: '/profile/edit' });
  }

  // 6. Certifications & Projects: Max 15
  const certsCount = profile.certifications ? profile.certifications.length : 0;
  const projCount = profile.projects ? profile.projects.length : 0;
  const portfolioScore = Math.min(15, (certsCount * 7.5) + (projCount * 7.5));
  score += portfolioScore;

  if (certsCount >= 1 || projCount >= 1) {
    checklist.push({ label: 'Projects or certifications listed', completed: true, type: 'portfolio' });
  } else {
    checklist.push({ label: 'Add project or certification', completed: false, type: 'portfolio', href: '/profile/edit' });
  }

  return {
    score: Math.min(100, Math.round(score)),
    checklist,
  };
};

const CareerScoreWidget = ({ profile, className = '' }) => {
  const { score, checklist } = calculateCareerScore(profile);

  const getScoreColor = (val) => {
    if (val >= 80) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800';
    if (val >= 50) return 'text-pro-600 dark:text-pro-400 bg-pro-50 dark:bg-pro-950/50 border-pro-200 dark:border-pro-800';
    return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800';
  };

  return (
    <div className={`pro-card p-5 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-white">
            Career Score & Profile Strength
          </h3>
        </div>
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{score}/100</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-pro-600' : 'bg-amber-500'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Checklist of actionable suggestions */}
      <div className="space-y-2 text-xs">
        {checklist.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              {item.completed ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              )}
              <span className={`truncate ${item.completed ? 'text-slate-700 dark:text-slate-300 font-medium' : 'text-slate-500 dark:text-slate-400 font-semibold'}`}>
                {item.label}
              </span>
            </div>

            {!item.completed && item.href && (
              <Link
                to={item.href}
                className="text-[11px] font-bold text-pro-600 dark:text-pro-400 hover:underline shrink-0"
              >
                Improve
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CareerScoreWidget;
