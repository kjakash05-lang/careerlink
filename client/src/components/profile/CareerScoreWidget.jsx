import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, CheckCircle2, AlertCircle, TrendingUp, Award, ArrowRight } from 'lucide-react';

export const calculateCareerScore = (profile) => {
  if (!profile) return { score: 0, checklist: [] };

  let score = 0;
  const checklist = [];

  // 1. Basic Info (Avatar, Headline, Location): Max 40
  const hasAvatar = Boolean(profile.avatar);
  const hasHeadline = Boolean(profile.headline && profile.headline.length > 5);
  const hasLocation = Boolean(profile.location);

  let basicScore = 0;
  if (hasAvatar) basicScore += 15;
  if (hasHeadline) basicScore += 15;
  if (hasLocation) basicScore += 10;
  score += basicScore;

  if (basicScore === 40) {
    checklist.push({ label: 'Profile essentials completed (Avatar, Headline, Location)', completed: true, type: 'basic' });
  } else {
    checklist.push({ label: 'Add profile photo, headline & location', completed: false, type: 'basic', href: '/profile/edit' });
  }

  // 2. Skills: Max 40 (8 pts per skill up to 5)
  const skillsCount = profile.skills ? profile.skills.length : 0;
  const skillsScore = Math.min(40, skillsCount * 8);
  score += skillsScore;

  if (skillsCount >= 5) {
    checklist.push({ label: `${skillsCount} verified technical skills added`, completed: true, type: 'skills' });
  } else {
    checklist.push({ label: `Add ${Math.max(1, 5 - skillsCount)} more technical skill(s)`, completed: false, type: 'skills', href: '/profile/edit' });
  }

  // 3. Education: Max 20
  const eduCount = profile.education ? profile.education.length : 0;
  if (eduCount >= 1) {
    score += 20;
    checklist.push({ label: 'Education credentials added', completed: true, type: 'edu' });
  } else {
    checklist.push({ label: 'Add university/degree education background', completed: false, type: 'edu', href: '/profile/edit' });
  }

  return {
    score: Math.min(100, Math.round(score)),
    checklist,
  };
};

const CareerScoreWidget = ({ profile, className = '' }) => {
  const { score, checklist } = calculateCareerScore(profile);

  const getScoreColor = (val) => {
    if (val >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (val >= 50) return 'text-pro-400 bg-pro-500/10 border-pro-500/30';
    return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  };

  return (
    <div className={`pro-card p-5 border border-white/15 shadow-xl backdrop-blur-xl ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-black uppercase tracking-wider text-white">
            Profile Strength
          </h3>
        </div>

        <div className={`px-2.5 py-0.5 rounded-full border text-xs font-black ${getScoreColor(score)}`}>
          {score}% Complete
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden mb-3">
        <div
          className="bg-gradient-to-r from-pro-500 to-tealAccent-400 h-2 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Actionable Checklist */}
      <div className="space-y-1.5 pt-1">
        {checklist.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs py-1">
            <div className="flex items-center gap-2">
              {item.completed ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              )}
              <span className={item.completed ? 'text-slate-300' : 'text-slate-200 font-medium'}>
                {item.label}
              </span>
            </div>

            {!item.completed && item.href && (
              <Link
                to={item.href}
                className="text-[11px] font-bold text-pro-400 hover:text-pro-300 flex items-center gap-0.5 ml-2 shrink-0"
              >
                <span>Add</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CareerScoreWidget;
