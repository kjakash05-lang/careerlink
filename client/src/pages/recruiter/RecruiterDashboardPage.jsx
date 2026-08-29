import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  UserCheck,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  TrendingUp,
  Search,
  FileText,
} from 'lucide-react';
import { recruiterService } from '../../services/api';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';

const RecruiterDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recentApplications, setRecentApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true);
      try {
        const res = await recruiterService.getDashboardStats();
        if (res.success) {
          setStats(res.stats);
          setRecentApplications(res.recentApplications);
        }
      } catch (err) {
        console.error('Failed to load recruiter dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="pro-card p-6 animate-pulse bg-slate-200 dark:bg-slate-800 h-28" />
          ))}
        </div>
      </div>
    );
  }

  const pipeline = stats?.pipeline || {
    underReview: 0,
    shortlisted: 0,
    interview: 0,
    selected: 0,
    rejected: 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800 uppercase tracking-wider">
            Recruiter ATS Suite
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1.5">
            Recruitment Mission Control
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your hiring pipelines, review talent applications, and discover qualified candidates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/recruiter/candidates"
            className="pro-btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5"
          >
            <Search className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Search Candidates</span>
          </Link>
          <Link
            to="/recruiter/jobs/create"
            className="pro-btn-primary text-xs py-2 px-4 flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Job</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="pro-card p-5 border-l-4 border-l-indigo-600">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Total Jobs Posted</p>
            <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{stats?.totalJobs || 0}</p>
          <p className="text-[11px] text-slate-400 mt-1">{stats?.activeJobs || 0} currently active</p>
        </div>

        <div className="pro-card p-5 border-l-4 border-l-pro-600">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Total Applicants</p>
            <Users className="w-5 h-5 text-pro-600 dark:text-pro-400" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{stats?.totalApplications || 0}</p>
          <p className="text-[11px] text-slate-400 mt-1">Across all open positions</p>
        </div>

        <div className="pro-card p-5 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">In Interview Round</p>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{pipeline.interview || 0}</p>
          <p className="text-[11px] text-slate-400 mt-1">Scheduled technical & culture</p>
        </div>

        <div className="pro-card p-5 border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Hired / Selected</p>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{pipeline.selected || 0}</p>
          <p className="text-[11px] text-slate-400 mt-1">Offers accepted</p>
        </div>
      </div>

      {/* Recruitment Pipeline Funnel Breakdown */}
      <div className="pro-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Application Pipeline Funnel</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Real-time candidate progression through the hiring stages</p>
          </div>
          <Link to="/recruiter/applicants" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
            Manage All Applicants →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Under Review</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{pipeline.underReview}</p>
          </div>
          <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800">
            <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">Shortlisted</p>
            <p className="text-xl font-black text-indigo-900 dark:text-indigo-200 mt-1">{pipeline.shortlisted}</p>
          </div>
          <div className="p-3 bg-amber-50/60 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">Interview</p>
            <p className="text-xl font-black text-amber-900 dark:text-amber-200 mt-1">{pipeline.interview}</p>
          </div>
          <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Selected</p>
            <p className="text-xl font-black text-emerald-900 dark:text-emerald-200 mt-1">{pipeline.selected}</p>
          </div>
          <div className="p-3 bg-rose-50/60 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800">
            <p className="text-xs font-semibold text-rose-700 dark:text-rose-300">Rejected</p>
            <p className="text-xl font-black text-rose-900 dark:text-rose-200 mt-1">{pipeline.rejected}</p>
          </div>
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="pro-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Candidate Applications</h3>
          <Link to="/recruiter/applicants" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
            View All in ATS →
          </Link>
        </div>

        {recentApplications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Role Applied For</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Applied Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentApplications.map((app) => {
                  const p = app.applicant?.profile || {};
                  const name = p.fullName || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Candidate';
                  return (
                    <tr key={app._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-850/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={p.avatar} alt={name} size="sm" />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{name}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">{p.headline}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{app.job?.title || 'Job'}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{app.job?.location}</p>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            app.status === 'Shortlisted'
                              ? 'primary'
                              : app.status === 'Interview'
                              ? 'warning'
                              : app.status === 'Selected'
                              ? 'success'
                              : app.status === 'Rejected'
                              ? 'danger'
                              : 'default'
                          }
                          size="xs"
                        >
                          {app.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                        {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Recent'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to="/recruiter/applicants"
                          className="pro-btn-secondary text-[11px] py-1 px-3"
                        >
                          Review in ATS
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No job applications submitted yet.</p>
        )}
      </div>
    </div>
  );
};

export default RecruiterDashboardPage;
