import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Image as ImageIcon,
  FileText,
  Sparkles,
  TrendingUp,
  Briefcase,
  Users,
  Building2,
  ChevronRight,
  Plus,
  PenSquare,
  Loader2,
  ArrowRight,
  BarChart3,
  Bookmark,
  Award,
  RefreshCw,
  Flame,
  Code,
  Layers,
  Compass,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { postService, jobService } from '../services/api';
import Avatar from '../components/common/Avatar';
import PostCard from '../components/feed/PostCard';
import CreatePostModal from '../components/feed/CreatePostModal';
import QuickActionsWidget from '../components/dashboard/QuickActionsWidget';
import CareerInsightsWidget from '../components/dashboard/CareerInsightsWidget';
import CompanyInsightsDashboard from '../components/dashboard/CompanyInsightsDashboard';
import { useAnalytics } from '../context/AnalyticsContext';

const HomePage = () => {
  const { user, profile, isAuthenticated } = useAuth();
  const { recordEvent } = useAnalytics();
  const [posts, setPosts] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [feedFilter, setFeedFilter] = useState('all'); // 'all' | 'tech' | 'cloud' | 'career' | 'hiring'

  const bottomSentinelRef = useRef(null);

  const fetchFeedPosts = async (pageNum = 1, append = false) => {
    if (pageNum === 1) setIsLoading(true);
    else setIsLoadingMore(true);

    try {
      const res = await postService.getPosts({ page: pageNum, limit: 20 });
      if (res.success) {
        if (append) {
          setPosts((prev) => {
            const existingIds = new Set(prev.map((p) => p._id));
            const newUnique = (res.posts || []).filter((p) => !existingIds.has(p._id));
            return [...prev, ...newUnique];
          });
        } else {
          setPosts(res.posts || []);
        }
        setHasMore(res.page < res.pages);
      }
    } catch (err) {
      console.error('Failed to load feed posts:', err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchFeedPosts(1, false);

    const fetchSidebarData = async () => {
      if (isAuthenticated) {
        try {
          const userSkills = (profile?.skills || []).map((s) => (typeof s === 'string' ? s : s.name).toLowerCase());
          const jobsRes = await jobService.getJobs({ limit: 6 });

          if (jobsRes.success) {
            const allJobs = jobsRes.jobs || [];
            const matched = allJobs.filter((j) => {
              if (userSkills.length === 0) return true;
              const text = `${j.title} ${j.description} ${(j.skillsRequired || []).join(' ')}`.toLowerCase();
              return userSkills.some((sk) => text.includes(sk));
            });
            setRecommendedJobs((matched.length > 0 ? matched : allJobs).slice(0, 4));
          }
        } catch (err) {
          console.error(err);
        }
      }
    };

    fetchSidebarData();
  }, [isAuthenticated, profile?.skills]);

  // Infinite Scroll Trigger via IntersectionObserver
  useEffect(() => {
    if (!hasMore || isLoading || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchFeedPosts(nextPage, true);
        }
      },
      { threshold: 0.1, rootMargin: '350px' }
    );

    if (bottomSentinelRef.current) {
      observer.observe(bottomSentinelRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore, page]);

  const handleLoadMore = () => {
    if (isLoadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFeedPosts(nextPage, true);
  };

  const handlePostCreated = (newPost) => {
    recordEvent('POST_CREATED');
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === updatedPost._id ? { ...p, ...updatedPost } : p))
    );
  };

  // Filter posts based on selected category pill
  const filteredPosts = posts.filter((post) => {
    if (feedFilter === 'all') return true;
    const text = (post.content || '').toLowerCase();
    if (feedFilter === 'tech') {
      return /react|javascript|typescript|java|python|spring|node|frontend|backend|sql|api|coding|git|bugs|code|benchmark/i.test(text);
    }
    if (feedFilter === 'cloud') {
      return /cloud|aws|docker|kubernetes|microservice|kafka|redis|devops|scale|system|distributed|database|postgres|architecture/i.test(text);
    }
    if (feedFilter === 'career') {
      return /career|milestone|promot|interview|framework|grow|developer|engineer|learn|bootcamp|tips/i.test(text);
    }
    if (feedFilter === 'hiring') {
      return /hiring|hire|role|remote|job|join|equity|salary|position/i.test(text);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: User Profile Summary Card & Career Insights (3 cols) */}
        <div className="md:col-span-4 lg:col-span-3 space-y-4">
          {isAuthenticated ? (
            <>
              {/* Profile Overview Card */}
              <div className="pro-card overflow-hidden border border-white/15 shadow-xl backdrop-blur-xl">
                {/* Cover Banner */}
                <div className="h-20 bg-gradient-to-r from-pro-700 via-pro-600 to-indigo-800 relative">
                  {profile?.coverImage && (
                    <img
                      src={profile.coverImage}
                      alt="Cover"
                      className="w-full h-full object-cover opacity-60"
                    />
                  )}
                </div>

                {/* Profile Bio */}
                <div className="p-4 pt-0 text-center relative">
                  <div className="-mt-10 mb-2 flex justify-center">
                    <Link to="/profile/me">
                      <Avatar
                        src={profile?.avatar}
                        alt={profile?.fullName || user?.email}
                        size="xl"
                        className="ring-4 ring-slate-900 shadow-xl"
                      />
                    </Link>
                  </div>

                  <Link
                    to="/profile/me"
                    className="font-extrabold text-sm text-white hover:text-pro-300 block truncate"
                  >
                    {profile?.fullName || user?.email?.split('@')[0]}
                  </Link>

                  <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2 font-medium">
                    {profile?.headline || 'CareerLink Member'}
                  </p>

                  <div className="mt-3 pt-3 border-t border-white/10 flex justify-between text-xs font-semibold text-slate-300">
                    <Link to="/network" className="hover:text-pro-300 transition-colors">
                      <span className="block text-[10px] text-slate-400">Network</span>
                      <span className="font-extrabold text-white">500+</span>
                    </Link>
                    <Link to="/analytics" className="hover:text-pro-300 transition-colors">
                      <span className="block text-[10px] text-slate-400">Analytics</span>
                      <span className="font-extrabold text-emerald-400">Active</span>
                    </Link>
                    <Link to="/saved-jobs" className="hover:text-pro-300 transition-colors">
                      <span className="block text-[10px] text-slate-400">Saved</span>
                      <span className="font-extrabold text-white">Jobs</span>
                    </Link>
                  </div>
                </div>

                {/* My Items Quick Navigation Link */}
                <div className="p-2.5 bg-white/5 border-t border-white/10 text-xs">
                  <Link
                    to="/saved-jobs"
                    className="flex items-center gap-2 text-slate-300 hover:text-white font-bold p-1.5 rounded-lg transition-colors"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-pro-400" />
                    <span>My Saved Items</span>
                  </Link>
                </div>
              </div>

              {/* Quick Actions Widget */}
              <QuickActionsWidget />

              {/* Career Analytics Snapshot */}
              <CareerInsightsWidget />
            </>
          ) : (
            <div className="pro-card p-6 text-center space-y-4 border border-white/15 shadow-xl backdrop-blur-xl">
              <div className="w-12 h-12 rounded-2xl bg-pro-600/20 text-pro-400 flex items-center justify-center mx-auto border border-pro-500/30 font-black text-xl">
                CL
              </div>
              <div>
                <h3 className="text-base font-black text-white">Welcome to CareerLink</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Connect with engineers, share technical insights, and discover opportunities.
                </p>
              </div>
              <div className="space-y-2">
                <Link to="/login" className="pro-btn-primary text-xs py-2.5 w-full block text-center">
                  Sign In
                </Link>
                <Link to="/register" className="pro-btn-secondary text-xs py-2.5 w-full block text-center">
                  Join Free
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Center Column: Create Post & Home Stream (6 cols on lg) */}
        <div className="md:col-span-8 lg:col-span-6 space-y-4">
          {/* Create Post Card */}
          {isAuthenticated && (
            <div className="pro-card p-4 border border-white/15 shadow-xl backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <Avatar
                  src={profile?.avatar}
                  alt={profile?.fullName || user?.email}
                  size="md"
                />
                <button
                  onClick={() => setCreatePostOpen(true)}
                  className="flex-1 text-left px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 border border-white/10 hover:border-pro-400/40 transition-all cursor-pointer shadow-xs"
                >
                  Start a post, share knowledge or code...
                </button>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10 px-2">
                <button
                  onClick={() => setCreatePostOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-pro-300 transition-colors p-1.5 rounded-lg"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  <span>Media</span>
                </button>
                <button
                  onClick={() => setCreatePostOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-pro-300 transition-colors p-1.5 rounded-lg"
                >
                  <PenSquare className="w-4 h-4 text-amber-400" />
                  <span>Post</span>
                </button>
                <Link
                  to="/articles/create"
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-pro-300 transition-colors p-1.5 rounded-lg"
                >
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span>Write Article</span>
                </Link>
              </div>
            </div>
          )}

          {/* Feed Controls & Topic Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar flex-1">
              {[
                { id: 'all', label: 'All Posts', icon: Flame },
                { id: 'tech', label: 'Tech & Code', icon: Code },
                { id: 'cloud', label: 'Architecture & Cloud', icon: Layers },
                { id: 'career', label: 'Career & Growth', icon: TrendingUp },
                { id: 'hiring', label: 'Hiring', icon: Briefcase },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = feedFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setFeedFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-pro-600 text-white shadow-md shadow-pro-600/30'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-pro-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <span className="text-[11px] text-slate-400 font-medium">
                {filteredPosts.length} posts
              </span>
              <button
                onClick={() => fetchFeedPosts(1, false)}
                title="Refresh Live Feed"
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-pro-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Posts Stream */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="pro-card p-5 animate-pulse bg-slate-800/40 border border-white/10 h-48 rounded-2xl" />
              ))}
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onPostDeleted={handlePostDeleted}
                  onPostUpdated={handlePostUpdated}
                  onPostCreated={handlePostCreated}
                />
              ))}

              {/* Infinite Scroll Bottom Sentinel */}
              <div ref={bottomSentinelRef} className="h-4" />

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center pt-2">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="pro-btn-secondary text-xs py-2 px-6 shadow-xs font-bold"
                  >
                    {isLoadingMore ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Loading more posts...</span>
                      </span>
                    ) : (
                      <span>Load More Feed Posts</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="pro-card p-12 text-center border border-white/15">
              <PenSquare className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-white">No posts match this filter</h3>
              <p className="text-xs text-slate-400 mt-1">Try selecting "All Posts" to see the entire engineering feed.</p>
              <button
                onClick={() => setFeedFilter('all')}
                className="pro-btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5 mt-4"
              >
                <span>View All Posts</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Recommended Jobs & Insights (3 cols on lg) */}
        <div className="hidden lg:block lg:col-span-3 space-y-4">
          {/* Recommended Jobs Widget */}
          <div className="pro-card p-4 space-y-3 border border-white/15 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Job Recommendations</span>
              </h4>
              <Link to="/jobs/recommendations" className="text-[11px] font-bold text-pro-400 hover:underline">
                View All
              </Link>
            </div>

            <div className="divide-y divide-white/10">
              {recommendedJobs.map((job) => (
                <div key={job._id} className="py-2.5 first:pt-0 last:pb-0">
                  <Link to={`/jobs`} className="font-bold text-xs text-white hover:text-pro-300 line-clamp-1">
                    {job.title}
                  </Link>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{job.company?.name} · {job.location}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      {job.workMode}
                    </span>
                    <Link to={`/jobs`} className="text-[10px] font-bold text-pro-400 hover:underline">
                      Apply →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Company Insights & Platform Performance */}
      <div className="mt-8">
        <CompanyInsightsDashboard />
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={createPostOpen}
        onClose={() => setCreatePostOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
};

export default HomePage;
