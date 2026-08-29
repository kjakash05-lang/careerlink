import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Plus, Users, Edit, Trash2, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { recruiterService } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import Badge from '../../components/common/Badge';

const RecruiterJobsPage = () => {
  const { showToast } = useNotifications();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const res = await recruiterService.getRecruiterJobs();
      if (res.success) {
        setJobs(res.jobs);
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleToggleStatus = async (jobId, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Closed' : 'Active';
    try {
      await recruiterService.updateJob(jobId, { status: nextStatus });
      setJobs((prev) =>
        prev.map((j) => (j._id === jobId ? { ...j, status: nextStatus } : j))
      );
      showToast(`Job listing marked as ${nextStatus}`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update job status', 'error');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Delete this job posting and all its submitted applications?')) return;
    try {
      await recruiterService.deleteJob(jobId);
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
      showToast('Job posting deleted', 'info');
    } catch (err) {
      showToast(err.message || 'Could not delete job', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/recruiter/dashboard"
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900">Manage Job Postings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor live status, applicant counts, and close or edit open positions.
          </p>
        </div>

        <Link
          to="/recruiter/jobs/create"
          className="pro-btn-primary text-xs py-2 px-4 flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Job</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="pro-card p-6 animate-pulse bg-slate-200 h-28" />
          ))}
        </div>
      ) : jobs.length > 0 ? (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="pro-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <img
                  src={job.company?.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80'}
                  alt={job.company?.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{job.title}</h3>
                    <Badge variant={job.status === 'Active' ? 'success' : 'default'} size="xs">
                      {job.status}
                    </Badge>
                  </div>
                  <p className="text-xs font-semibold text-slate-600 mt-0.5">
                    {job.company?.name} · {job.location} · {job.jobType} · {job.workMode}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Posted on {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Stats & Actions */}
              <div className="flex items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                <Link
                  to={`/recruiter/applicants?jobId=${job._id}`}
                  className="p-2.5 bg-indigo-50 hover:bg-indigo-100 rounded-xl text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Users className="w-4 h-4" />
                  <span>{job.applicationsCount || 0} Applicants</span>
                </Link>

                <button
                  onClick={() => handleToggleStatus(job._id, job.status)}
                  className="pro-btn-secondary text-xs py-2 px-3"
                  title={job.status === 'Active' ? 'Close job' : 'Reactivate job'}
                >
                  {job.status === 'Active' ? 'Close Role' : 'Reopen Role'}
                </button>

                <button
                  onClick={() => handleDeleteJob(job._id)}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete job"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="pro-card p-12 text-center">
          <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">No jobs posted yet</h3>
          <p className="text-xs text-slate-500 mt-1">Create your first role to start receiving candidate applications.</p>
          <Link
            to="/recruiter/jobs/create"
            className="pro-btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5 mt-4 bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            <span>Post a Job</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecruiterJobsPage;
