import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Users,
  Building2,
  Briefcase,
  FileText,
  MapPin,
  ArrowRight,
  UserPlus,
  Check,
  CheckCircle2,
  Clock,
  MessageSquare,
  GraduationCap,
  Sparkles,
  Loader2,
  Code,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { searchService, connectionService } from '../../services/api';
import Avatar from '../../components/common/Avatar';
import JobCard from '../../components/jobs/JobCard';
import PostCard from '../../components/feed/PostCard';

const SearchPage = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'people' | 'companies' | 'jobs' | 'posts'

  const [results, setResults] = useState({ people: [], companies: [], jobs: [], posts: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const performSearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    try {
      const res = await searchService.searchGlobal({ q: query, type: activeTab });
      if (res.success && res.results) {
        setResults(res.results);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    performSearch();
  }, [query, activeTab]);

  // Handle Send Connection Request directly from Search Results
  const handleConnect = async (targetUserId, targetProfileId) => {
    setActionLoadingId(targetUserId || targetProfileId);
    try {
      await connectionService.sendRequest(targetUserId);
      showToast('Connection request sent!', 'success');
      // Update local card status to PENDING_SENT
      setResults((prev) => ({
        ...prev,
        people: prev.people.map((p) => {
          const uid = p.user?._id || p.user || p._id;
          if (uid === targetUserId) {
            return { ...p, connectionStatus: 'PENDING_SENT' };
          }
          return p;
        }),
      }));
    } catch (err) {
      showToast(err.message || 'Failed to send connection request', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Accept Connection Request directly from Search Results
  const handleAccept = async (connectionId, targetUserId) => {
    setActionLoadingId(targetUserId);
    try {
      await connectionService.acceptRequest(connectionId || targetUserId);
      showToast('Connection accepted!', 'success');
      // Update local card status to CONNECTED
      setResults((prev) => ({
        ...prev,
        people: prev.people.map((p) => {
          const uid = p.user?._id || p.user || p._id;
          if (uid === targetUserId) {
            return { ...p, connectionStatus: 'CONNECTED' };
          }
          return p;
        }),
      }));
    } catch (err) {
      showToast(err.message || 'Failed to accept connection', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Search Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Search className="w-6 h-6 text-pro-400" />
            <span>
              Search results for "<span className="text-pro-400">{query}</span>"
            </span>
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Showing results across registered members, companies, jobs, and engineering posts.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 gap-6 text-xs sm:text-sm font-bold overflow-x-auto pb-1">
        {['all', 'people', 'companies', 'jobs', 'posts'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 border-b-2 capitalize transition-colors cursor-pointer shrink-0 ${
              activeTab === tab
                ? 'border-pro-400 text-pro-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Results Rendering */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="pro-card p-6 animate-pulse bg-slate-800/40 border border-white/10 h-28 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {/* 1. PEOPLE / MEMBERS SECTION */}
          {(activeTab === 'all' || activeTab === 'people') && results.people?.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-pro-400" />
                <span>People & Registered Members ({results.people.length})</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.people.map((p) => {
                  const targetUserId = p.user?._id || p.user || p._id;
                  const profileUrl = `/profile/${p._id || targetUserId}`;
                  const isActionLoading = actionLoadingId === targetUserId;

                  return (
                    <div
                      key={p._id}
                      className="pro-card p-5 border border-white/15 shadow-xl backdrop-blur-xl flex flex-col justify-between gap-4 hover:border-pro-400/40 transition-all rounded-2xl"
                    >
                      <div className="flex items-start gap-3.5">
                        {/* Avatar: Photo or Initials Monogram */}
                        <Link to={profileUrl} className="shrink-0 group">
                          <Avatar
                            src={p.avatar}
                            alt={p.fullName}
                            size="lg"
                            className="ring-2 ring-white/15 group-hover:scale-105 transition-transform"
                          />
                        </Link>

                        <div className="overflow-hidden flex-1 min-w-0">
                          <Link
                            to={profileUrl}
                            className="font-extrabold text-sm text-white hover:text-pro-300 truncate block"
                          >
                            {p.fullName}
                          </Link>

                          <p className="text-xs text-slate-300 font-medium line-clamp-2 mt-0.5">
                            {p.headline || 'CareerLink Member'}
                          </p>

                          {p.location && (
                            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1 truncate">
                              <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                              <span>{p.location}</span>
                            </p>
                          )}

                          {p.education?.[0]?.school && (
                            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                              <GraduationCap className="w-3 h-3 text-slate-500 shrink-0" />
                              <span>{p.education[0].school}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Technical Skills Chips */}
                      {p.skills && p.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-white/10">
                          {p.skills.slice(0, 4).map((sk, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300"
                            >
                              {typeof sk === 'string' ? sk : sk.name}
                            </span>
                          ))}
                          {p.skills.length > 4 && (
                            <span className="text-[10px] text-slate-400 self-center">
                              +{p.skills.length - 4} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Connection Action Buttons */}
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                        <Link
                          to={profileUrl}
                          className="pro-btn-secondary text-xs py-1.5 px-3"
                        >
                          View Profile
                        </Link>

                        {/* Dynamic Relationship Buttons */}
                        {p.connectionStatus === 'SELF' ? (
                          <span className="text-xs text-slate-400 font-bold px-2 py-1">
                            (You)
                          </span>
                        ) : p.connectionStatus === 'CONNECTED' ? (
                          <div className="flex items-center gap-1.5">
                            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Connected</span>
                            </span>
                            <Link
                              to={`/messages?userId=${targetUserId}`}
                              className="pro-btn-secondary text-xs py-1.5 px-2.5 flex items-center gap-1"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-pro-400" />
                              <span>Message</span>
                            </Link>
                          </div>
                        ) : p.connectionStatus === 'PENDING_SENT' ? (
                          <button
                            disabled
                            className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 cursor-default"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Pending</span>
                          </button>
                        ) : p.connectionStatus === 'PENDING_RECEIVED' ? (
                          <button
                            onClick={() => handleAccept(p.connectionId, targetUserId)}
                            disabled={isActionLoading}
                            className="pro-btn-primary text-xs py-1.5 px-3.5 flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600"
                          >
                            {isActionLoading ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            <span>Accept</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleConnect(targetUserId, p._id)}
                            disabled={isActionLoading}
                            className="pro-btn-primary text-xs py-1.5 px-3.5 flex items-center gap-1.5 shadow-lg shadow-pro-600/30"
                          >
                            {isActionLoading ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <UserPlus className="w-3.5 h-3.5" />
                            )}
                            <span>Connect</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. COMPANIES SECTION */}
          {(activeTab === 'all' || activeTab === 'companies') && results.companies?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-pro-400" />
                <span>Companies ({results.companies.length})</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results.companies.map((c) => (
                  <div key={c._id} className="pro-card p-4 border border-white/15 flex items-center justify-between gap-3 rounded-2xl">
                    <Link to={`/company/${c._id}`} className="flex items-center gap-3 overflow-hidden">
                      <img
                        src={c.logo}
                        alt={c.name}
                        className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0 bg-slate-900"
                      />
                      <div className="overflow-hidden">
                        <p className="font-bold text-white hover:text-pro-300 text-sm truncate">{c.name}</p>
                        <p className="text-xs text-slate-300 truncate">{c.industry} · {c.location}</p>
                      </div>
                    </Link>
                    <Link to={`/company/${c._id}`} className="pro-btn-secondary text-xs py-1 px-3 shrink-0">
                      View Page
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. JOBS SECTION */}
          {(activeTab === 'all' || activeTab === 'jobs') && results.jobs?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-pro-400" />
                <span>Jobs ({results.jobs.length})</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.jobs.map((job) => (
                  <JobCard key={job._id} job={job} />
                ))}
              </div>
            </div>
          )}

          {/* 4. POSTS SECTION */}
          {(activeTab === 'all' || activeTab === 'posts') && results.posts?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-pro-400" />
                <span>Engineering Posts ({results.posts.length})</span>
              </h3>
              <div className="space-y-4 max-w-2xl">
                {results.posts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {results.people?.length === 0 &&
            results.companies?.length === 0 &&
            results.jobs?.length === 0 &&
            results.posts?.length === 0 && (
              <div className="p-12 text-center text-slate-400 pro-card border border-white/15 rounded-3xl space-y-3">
                <Search className="w-10 h-10 mx-auto text-slate-500" />
                <h3 className="font-bold text-white text-base">No results found for "{query}"</h3>
                <p className="text-xs text-slate-400">
                  Try searching with a person's name, email, headline, skill (e.g. React, Java), or university.
                </p>
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
