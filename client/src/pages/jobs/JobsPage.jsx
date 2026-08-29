import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Briefcase,
  Filter,
  DollarSign,
  Sparkles,
  CheckCircle2,
  Building,
  ArrowRight,
  Bookmark,
} from 'lucide-react';
import { jobService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import JobCard from '../../components/jobs/JobCard';
import MatchBreakdownModal from '../../components/jobs/MatchBreakdownModal';
import ApplyModal from '../../components/jobs/ApplyModal';
import SkillGapAnalyzer from '../../components/jobs/SkillGapAnalyzer';

const JobsPage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [jobType, setJobType] = useState(searchParams.get('jobType') || '');
  const [workMode, setWorkMode] = useState(searchParams.get('workMode') || '');
  const [experience, setExperience] = useState(searchParams.get('experience') || '');

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (location) params.location = location;
      if (jobType) params.jobType = jobType;
      if (workMode) params.workMode = workMode;
      if (experience) params.experience = experience;

      const data = await jobService.getJobs(params);
      if (data.success) {
        setJobs(data.jobs);
        if (data.jobs.length > 0 && !selectedJob) {
          setSelectedJob(data.jobs[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [jobType, workMode, experience]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Search & Filter Header Bar */}
      <div className="pro-card p-5">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Job title, skill, or keywords (e.g. React, Node, ML)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pro-input pl-10 text-xs"
            />
          </div>

          <div className="md:col-span-4 relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="City, state, or 'Remote'..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pro-input pl-10 text-xs"
            />
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              className="w-full pro-btn-primary py-2.5 text-xs font-bold rounded-xl shadow-md"
            >
              Search Jobs
            </button>
          </div>
        </form>

        {/* Quick Filter Selectors */}
        <div className="flex flex-wrap items-center gap-2 pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filters:
          </span>

          <select
            value={workMode}
            onChange={(e) => setWorkMode(e.target.value)}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-semibold focus:outline-none"
          >
            <option value="">All Work Modes</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
          </select>

          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-semibold focus:outline-none"
          >
            <option value="">All Job Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Contract">Contract</option>
            <option value="Part-time">Part-time</option>
            <option value="Internship">Internship</option>
          </select>

          <select
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-semibold focus:outline-none"
          >
            <option value="">Any Experience</option>
            <option value="1">Junior (0-2 Yrs)</option>
            <option value="3">Mid-Level (3-5 Yrs)</option>
            <option value="5">Senior Lead (5+ Yrs)</option>
          </select>

          <Link
            to="/jobs/recommendations"
            className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 rounded-xl font-bold border border-emerald-200/80 dark:border-emerald-800 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Recommended for You (Match Engine)</span>
          </Link>
        </div>
      </div>

      {/* 2-Pane Jobs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Job Cards List (5 cols) */}
        <div className="lg:col-span-5 space-y-3.5 max-h-[82vh] overflow-y-auto pr-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium px-1">
            <span>Showing {jobs.length} open roles</span>
            <span>Sorted by relevance</span>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="pro-card p-5 animate-pulse bg-slate-200 dark:bg-slate-800 h-36" />
              ))}
            </div>
          ) : jobs.length > 0 ? (
            jobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                isSelected={selectedJob?._id === job._id}
                onSelect={(j) => setSelectedJob(j)}
              />
            ))
          ) : (
            <div className="pro-card p-12 text-center">
              <Briefcase className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No jobs matching your criteria</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try clearing filters or search terms.</p>
            </div>
          )}
        </div>

        {/* Right Column: Detailed Job View (7 cols) */}
        <div className="hidden lg:block lg:col-span-7">
          {selectedJob ? (
            <div className="pro-card p-6 sticky top-20 max-h-[82vh] overflow-y-auto space-y-6">
              {/* Job Header */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={selectedJob.company?.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80'}
                      alt={selectedJob.company?.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm shrink-0"
                    />
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{selectedJob.title}</h2>
                      <Link
                        to={`/company/${selectedJob.company?._id || selectedJob.company?.slug}`}
                        className="text-sm font-bold text-pro-600 dark:text-pro-400 hover:underline block mt-0.5"
                      >
                        {selectedJob.company?.name}
                      </Link>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {selectedJob.location} · {selectedJob.jobType} · {selectedJob.workMode}
                      </p>
                    </div>
                  </div>

                  {/* Recommendation Badge */}
                  {user && (
                    <button
                      onClick={() => setShowMatchModal(true)}
                      className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-black text-base hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors shadow-xs"
                      title="View full match scoring reasons & skill gaps"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mb-0.5" />
                      <span>{selectedJob.matchScore || 80}%</span>
                      <span className="text-[9px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Match</span>
                    </button>
                  )}
                </div>

                {/* Actions & Salary Bar */}
                <div className="mt-5 flex items-center justify-between">
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedJob.salaryMin > 0 ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-black">
                        ${(selectedJob.salaryMin / 1000).toFixed(0)}k – ${(selectedJob.salaryMax / 1000).toFixed(0)}k / year
                      </span>
                    ) : (
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Competitive Salary & Benefits</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedJob.hasApplied ? (
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Application Submitted
                      </span>
                    ) : (
                      <button
                        onClick={() => setShowApplyModal(true)}
                        className="pro-btn-primary text-xs py-2 px-5 shadow-md"
                      >
                        1-Click Apply Now
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Skill Gap Analyzer Component */}
              <SkillGapAnalyzer job={selectedJob} />

              {/* Skills Required */}
              {selectedJob.skillsRequired && selectedJob.skillsRequired.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                    Required Technical Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.skillsRequired.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-pro-50 dark:bg-pro-950/50 text-pro-700 dark:text-pro-300 rounded-xl text-xs font-bold border border-pro-200/60 dark:border-pro-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Job Description
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {selectedJob.description}
                </p>
              </div>

              {/* Responsibilities */}
              {selectedJob.responsibilities && selectedJob.responsibilities.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                    Key Responsibilities
                  </h4>
                  <ul className="list-disc pl-4 text-xs text-slate-700 dark:text-slate-300 space-y-1.5 leading-relaxed">
                    {selectedJob.responsibilities.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="pro-card p-12 text-center text-slate-400">
              Select a job from the list to view comprehensive role requirements & skill gap analysis.
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <MatchBreakdownModal
        isOpen={showMatchModal}
        onClose={() => setShowMatchModal(false)}
        job={selectedJob}
      />

      <ApplyModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        job={selectedJob}
        onApplied={() => {
          if (selectedJob) {
            setSelectedJob({ ...selectedJob, hasApplied: true });
          }
          fetchJobs();
        }}
      />
    </div>
  );
};

export default JobsPage;
