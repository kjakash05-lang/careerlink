import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Globe,
  Users,
  Calendar,
  Briefcase,
  Plus,
  Check,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { companyService } from '../../services/api';
import JobCard from '../../components/jobs/JobCard';

const CompanyDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [company, setCompany] = useState(null);
  const [activeTab, setActiveTab] = useState('about'); // 'about' | 'jobs'
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      setIsLoading(true);
      try {
        const res = await companyService.getCompanyById(id);
        if (res.success && res.company) {
          setCompany(res.company);
        }
      } catch (err) {
        console.error('Failed to load company:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompany();
  }, [id]);

  const handleFollowToggle = async () => {
    if (!user) {
      showToast('Please sign in to follow', 'info');
      return;
    }
    try {
      const res = await companyService.followCompany(company._id);
      if (res.success) {
        setCompany((prev) => ({
          ...prev,
          isFollowing: res.following,
          followerCount: res.followerCount,
        }));
        showToast(res.following ? 'Following company!' : 'Unfollowed company', 'info');
      }
    } catch (err) {
      showToast(err.message || 'Follow action failed', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-4">
        <div className="pro-card h-64 animate-pulse bg-slate-200" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center">
        <h3 className="text-lg font-bold text-slate-900 mb-2">Company Not Found</h3>
        <Link to="/companies" className="pro-btn-primary text-xs py-2">Back to Companies</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <Link
        to="/companies"
        className="inline-flex items-center gap-1 text-xs font-semibold text-pro-600 hover:underline mb-1"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>All Companies</span>
      </Link>

      {/* Header Banner Card */}
      <div className="pro-card overflow-hidden">
        {/* Cover Photo */}
        <div className="h-44 sm:h-56 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 relative">
          {company.coverImage && (
            <img
              src={company.coverImage}
              alt={company.name}
              className="w-full h-full object-cover opacity-70"
            />
          )}
        </div>

        {/* Profile Info */}
        <div className="p-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 gap-4 mb-4">
            <div className="flex items-end gap-4">
              <img
                src={company.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80'}
                alt={company.name}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg bg-white shrink-0"
              />
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">{company.name}</h1>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">{company.tagline}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {company.industry} · {company.location} · {company.followerCount || 0} followers
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleFollowToggle}
                className={`pro-btn-primary text-xs py-2 px-5 flex items-center gap-1.5 ${
                  company.isFollowing ? 'bg-slate-800 hover:bg-slate-900' : ''
                }`}
              >
                {company.isFollowing ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{company.isFollowing ? 'Following' : 'Follow'}</span>
              </button>

              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pro-btn-secondary text-xs py-2 px-3 flex items-center gap-1"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Website</span>
                </a>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-t border-slate-100 pt-3 gap-6 text-sm font-semibold">
            <button
              onClick={() => setActiveTab('about')}
              className={`pb-2 border-b-2 transition-colors ${
                activeTab === 'about' ? 'border-pro-600 text-pro-600' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              About
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`pb-2 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'jobs' ? 'border-pro-600 text-pro-600' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>Jobs</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs">
                {company.jobs?.length || 0}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab: About */}
      {activeTab === 'about' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 space-y-6">
            <div className="pro-card p-6">
              <h3 className="text-base font-bold text-slate-900 mb-3">Overview</h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {company.description}
              </p>
            </div>
          </div>

          <div className="md:col-span-4 space-y-4">
            <div className="pro-card p-6 space-y-4 text-xs">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Company Details
              </h4>
              <div className="space-y-3">
                <div className="flex items-start gap-2 text-slate-700">
                  <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-900">Industry</p>
                    <p className="text-slate-600">{company.industry}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-slate-700">
                  <Users className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-900">Company Size</p>
                    <p className="text-slate-600">{company.companySize} employees</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-900">Headquarters</p>
                    <p className="text-slate-600">{company.location}</p>
                  </div>
                </div>

                {company.foundedYear && (
                  <div className="flex items-start gap-2 text-slate-700">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900">Founded</p>
                      <p className="text-slate-600">{company.foundedYear}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Jobs */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Open Positions at {company.name} ({company.jobs?.length || 0})
            </h3>
          </div>

          {company.jobs && company.jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {company.jobs.map((job) => (
                <JobCard key={job._id} job={{ ...job, company }} />
              ))}
            </div>
          ) : (
            <div className="pro-card p-12 text-center text-slate-500 text-xs">
              No open roles currently posted by this company.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompanyDetailPage;
