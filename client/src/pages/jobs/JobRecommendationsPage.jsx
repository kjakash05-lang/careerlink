import React, { useState, useEffect } from 'react';
import { Sparkles, Layers, CheckCircle2, AlertCircle, ArrowRight, ExternalLink } from 'lucide-react';
import { jobService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import JobCard from '../../components/jobs/JobCard';
import MatchBreakdownModal from '../../components/jobs/MatchBreakdownModal';

const JobRecommendationsPage = () => {
  const { user, profile } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeJobModal, setActiveJobModal] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      try {
        const res = await jobService.getRecommendedJobs();
        if (res.success) {
          setRecommendations(res.recommendations);
        }
      } catch (err) {
        console.error('Failed to fetch recommendations:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Hero Recommendation Engine Card */}
      <div className="pro-card p-6 bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white rounded-2xl border-slate-800">
        <div className="max-w-3xl space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Deterministic Career Matching Engine</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Recommended Jobs For You
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Every job score is calculated by cross-matching your verified skills (40%), experience timeline (20%), target roles (15%), education (10%), location (10%), and work mode preferences (5%).
          </p>
        </div>
      </div>

      {/* Recommendations Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="pro-card p-6 animate-pulse bg-slate-200 dark:bg-slate-800 h-48" />
          ))}
        </div>
      ) : recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((job) => (
            <div key={job._id} className="pro-card p-5 hover:border-emerald-400/60 dark:hover:border-emerald-500/60 transition-all flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={job.company?.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80'}
                      alt={job.company?.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm shrink-0"
                    />
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white hover:text-pro-600 dark:hover:text-pro-400 line-clamp-1">
                        {job.title}
                      </h3>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        {job.company?.name} · {job.location}
                      </p>
                    </div>
                  </div>

                  {/* Match Badge */}
                  <div className="flex flex-col items-center justify-center px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-black text-sm shrink-0">
                    <span>{job.matchScore}%</span>
                    <span className="text-[9px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Match</span>
                  </div>
                </div>

                {/* Transparent Match Reasons Checklist */}
                <div className="p-3 bg-slate-50/80 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800 mb-4 space-y-1.5">
                  <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Why you match:
                  </p>
                  {(job.matchReasons || []).slice(0, 3).map((reason, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                      {reason.matched ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      )}
                      <span className="truncate">{reason.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setActiveJobModal(job)}
                  className="text-xs font-bold text-pro-600 dark:text-pro-400 hover:underline flex items-center gap-1"
                >
                  <span>View Scoring Breakdown</span>
                  <ExternalLink className="w-3 h-3" />
                </button>

                <Link
                  to={`/jobs`}
                  className="pro-btn-primary text-xs py-1.5 px-4"
                >
                  View Role
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="pro-card p-12 text-center text-slate-400">
          <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No job recommendations generated</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Add skills and experience to your profile to receive high-precision job matches.</p>
        </div>
      )}

      {/* Match Breakdown Modal */}
      {activeJobModal && (
        <MatchBreakdownModal
          isOpen={Boolean(activeJobModal)}
          onClose={() => setActiveJobModal(null)}
          job={activeJobModal}
        />
      )}
    </div>
  );
};

export default JobRecommendationsPage;
