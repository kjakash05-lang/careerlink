import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Users,
  Briefcase,
  FileText,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ArrowLeft,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { recruiterService } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import ResumeViewerModal from '../../components/profile/ResumeViewerModal';

const RecruiterApplicantsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useNotifications();

  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(searchParams.get('jobId') || '');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || '');
  const [isLoading, setIsLoading] = useState(true);

  // Resume Modal State
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [activeResume, setActiveResume] = useState(null);
  const [activeCandidateName, setActiveCandidateName] = useState('');

  const fetchApplicants = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (selectedJobId) params.jobId = selectedJobId;
      if (selectedStatus) params.status = selectedStatus;

      const [appsRes, jobsRes] = await Promise.all([
        recruiterService.getJobApplicants(params),
        recruiterService.getRecruiterJobs(),
      ]);

      if (appsRes.success) {
        setApplications(appsRes.applications);
      }
      if (jobsRes.success) {
        setJobs(jobsRes.jobs);
      }
    } catch (err) {
      console.error('Failed to load applicants:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [selectedJobId, selectedStatus]);

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await recruiterService.updateApplicationStatus(applicationId, { status: newStatus });
      setApplications((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, status: newStatus } : app
        )
      );
      showToast(`Candidate status updated to "${newStatus}" & notification dispatched`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const statusOptions = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/recruiter/dashboard"
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>Applicant Tracking Pipeline (ATS)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review candidate qualifications, view resumes, and progress candidates across hiring stages.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="pro-card p-4 flex flex-wrap items-center gap-3 text-xs">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Filter by Job</label>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="pro-input text-xs py-1.5 min-w-[200px]"
          >
            <option value="">All Job Postings</option>
            {jobs.map((j) => (
              <option key={j._id} value={j._id}>
                {j.title} ({j.company?.name})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Pipeline Stage</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="pro-input text-xs py-1.5 min-w-[160px]"
          >
            <option value="">All Stages</option>
            {statusOptions.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        <div className="ml-auto self-end">
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg">
            {applications.length} Candidates
          </span>
        </div>
      </div>

      {/* Candidates ATS Table / Cards */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="pro-card p-6 animate-pulse bg-slate-200 h-32" />
          ))}
        </div>
      ) : applications.length > 0 ? (
        <div className="space-y-3">
          {applications.map((app) => {
            const profile = app.applicant?.profile || {};
            const candidateName = profile.fullName || `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Candidate';
            const candidateHeadline = profile.headline || 'Applicant';
            const matchScore = app.matchScore || 80;

            return (
              <div
                key={app._id}
                className="pro-card p-5 hover:border-indigo-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
              >
                {/* Candidate Info */}
                <div className="flex items-start gap-4 flex-1">
                  <Avatar
                    src={profile.avatar}
                    alt={candidateName}
                    size="lg"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/profile/${profile._id || app.applicant?._id}`}
                        className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                      >
                        {candidateName}
                      </Link>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        {matchScore}% Match
                      </span>
                    </div>

                    <p className="text-xs font-medium text-slate-600">{candidateHeadline}</p>
                    <p className="text-xs text-indigo-700 font-semibold flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      Applied for: {app.job?.title} ({app.job?.location})
                    </p>

                    {app.coverNote && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic mt-2">
                        "{app.coverNote}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Resume & ATS Status Transition Controls */}
                <div className="flex flex-wrap items-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
                  {/* Resume PDF Action */}
                  {app.resume && app.resume.url ? (
                    <button
                      onClick={() => {
                        setActiveResume(app.resume);
                        setActiveCandidateName(candidateName);
                        setResumeModalOpen(true);
                      }}
                      className="pro-btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      <span>View PDF Resume</span>
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No resume attached</span>
                  )}

                  {/* Stage Transition Dropdown */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-500">Stage:</span>
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app._id, e.target.value)}
                      className={`text-xs font-bold py-1.5 px-3 rounded-lg border focus:outline-none ${
                        app.status === 'Shortlisted'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                          : app.status === 'Interview'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : app.status === 'Selected'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : app.status === 'Rejected'
                          ? 'bg-rose-50 text-rose-800 border-rose-300'
                          : 'bg-slate-100 text-slate-800 border-slate-300'
                      }`}
                    >
                      {statusOptions.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="pro-card p-12 text-center">
          <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">No applicants found</h3>
          <p className="text-xs text-slate-500 mt-1">Try switching job filter or pipeline stage filter.</p>
        </div>
      )}

      {/* Resume Modal */}
      <ResumeViewerModal
        isOpen={resumeModalOpen}
        onClose={() => setResumeModalOpen(false)}
        resume={activeResume}
        candidateName={activeCandidateName}
      />
    </div>
  );
};

export default RecruiterApplicantsPage;
