import React, { useState, useEffect } from 'react';
import { Bookmark, Briefcase, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { jobService } from '../../services/api';
import JobCard from '../../components/jobs/JobCard';

const SavedJobsPage = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSaved = async () => {
    setIsLoading(true);
    try {
      const res = await jobService.getSavedJobs();
      if (res.success) {
        setSavedJobs(res.jobs);
      }
    } catch (err) {
      console.error('Failed to load saved jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleSaveToggle = (jobId, isSaved) => {
    if (!isSaved) {
      setSavedJobs((prev) => prev.filter((j) => j._id !== jobId));
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-1 text-xs font-semibold text-pro-600 dark:text-pro-400 hover:underline mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Jobs</span>
        </Link>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-amber-500 fill-amber-500" />
          <span>Saved Jobs & Opportunities</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Review your bookmarked job listings and track applications.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="pro-card p-6 animate-pulse bg-slate-200 dark:bg-slate-800 h-32" />
          ))}
        </div>
      ) : savedJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedJobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              onSaveToggle={handleSaveToggle}
            />
          ))}
        </div>
      ) : (
        <div className="pro-card p-12 text-center text-slate-400">
          <Briefcase className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No saved jobs</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Save jobs you're interested in and find them here.</p>
          <Link to="/jobs" className="pro-btn-primary text-xs py-2 px-4 inline-block mt-4">
            Explore Open Positions
          </Link>
        </div>
      )}
    </div>
  );
};

export default SavedJobsPage;
