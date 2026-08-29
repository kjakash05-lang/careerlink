import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { postService, jobService, connectionService } from '../services/api';
import Avatar from '../components/common/Avatar';
import PostCard from '../components/feed/PostCard';
import CreatePostModal from '../components/feed/CreatePostModal';
import QuickActionsWidget from '../components/dashboard/QuickActionsWidget';
import CareerInsightsWidget from '../components/dashboard/CareerInsightsWidget';
import DevelopedByWidget from '../components/common/DevelopedByWidget';
import CompanyInsightsDashboard from '../components/dashboard/CompanyInsightsDashboard';
import OnboardingWelcomeBanner from '../components/dashboard/OnboardingWelcomeBanner';
import { useAnalytics } from '../context/AnalyticsContext';

const HomePage = () => {
  const { user, profile, isAuthenticated } = useAuth();
  const { recordEvent } = useAnalytics();
  const [posts, setPosts] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [suggestedConnections, setSuggestedConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [createPostOpen, setCreatePostOpen] = useState(false);

  const fetchFeedPosts = async (pageNum = 1, append = false) => {
    if (pageNum === 1) setIsLoading(true);
    else setIsLoadingMore(true);

    try {
      const res = await postService.getPosts({ page: pageNum, limit: 10 });
      if (res.success) {
        if (append) {
          setPosts((prev) => [...prev, ...res.posts]);
        } else {
          setPosts(res.posts);
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
          const [jobsRes, connRes] = await Promise.allSettled([
            jobService.getJobs({ limit: 6 }),
            connectionService.getSuggestions(),
          ]);

          if (jobsRes.status === 'fulfilled' && jobsRes.value.success) {
            const allJobs = jobsRes.value.jobs || [];
            // Intelligent Skill matching: prioritize jobs matching user skills
            const matched = allJobs.filter((j) => {
              if (userSkills.length === 0) return true;
              const text = `${j.title} ${j.description} ${(j.skillsRequired || []).join(' ')}`.toLowerCase();
              return userSkills.some((sk) => text.includes(sk));
            });
            setRecommendedJobs((matched.length > 0 ? matched : allJobs).slice(0, 3));
          }
          if (connRes.status === 'fulfilled' && connRes.value.success) {
            setSuggestedConnections(connRes.value.suggestions.slice(0, 3));
          }
        } catch (err) {
          console.error(err);
        }
      }
    };

    fetchSidebarData();
  }, [isAuthenticated, profile?.skills]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFeedPosts(nextPage, true);
  };

  const handlePostCreated = (newPost) => {
    recordEvent('POST_CREATED');
    setPosts([newPost, ...posts]);
  };

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === updatedPost._id ? { ...p, ...updatedPost } : p))
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: User Profile Summary Card & Career Insights (3 cols) */}
        <div className="md:col-span-4 lg:col-span-3 space-y-4">
          {isAuthenticated ? (
            <>
              {/* Profile Overview Card */}
              <div className="pro-card overflow-hidden">
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
                    <Avatar
                      src={profile?.avatar}
                      alt={profile?.fullName || user?.email}
                      size="xl"
                      className="ring-4 ring-white dark:ring-slate-900 shadow-md bg-white dark:bg-slate-900"
                    />
                  </div>
                  <Link
                    to={`/profile/${user.profile?._id || user.id}`}
                    className="font-bold text-slate-900 dark:text-white hover:text-pro-600 dark:hover:text-pro-400 text-sm line-clamp-1"
                  >
                    {profile?.fullName || user.email}
                  </Link>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                    {profile?.headline || (user.role === 'recruiter' ? 'Talent Acquisition' : 'Professional')}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{profile?.location || 'Global'}</p>

                  {/* Quick Links */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-left space-y-2">
                    <Link
                      to="/network"
                      className="flex justify-between items-center text-slate-600 dark:text-slate-400 hover:text-pro-600 font-medium"
                    >
                      <span>Connections</span>
                      <span className="font-bold text-pro-600 dark:text-pro-400">Network Hub</span>
                    </Link>
                    <Link
                      to="/saved-jobs"
                      className="flex justify-between items-center text-slate-600 dark:text-slate-400 hover:text-pro-600 font-medium"
                    >
                      <span>Saved Jobs</span>
                      <span className="font-bold text-slate-900 dark:text-slate-200">View</span>
                    </Link>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <Link
                      to="/profile/edit"
                      className="w-full pro-btn-secondary text-xs py-1.5 block text-center"
                    >
                      Edit Profile & Resume
                    </Link>
                  </div>
                </div>
              </div>

              {/* Quick Actions Widget */}
              <QuickActionsWidget onOpenPostModal={() => setCreatePostOpen(true)} />

              {/* Career Insights Widget */}
              <CareerInsightsWidget profile={profile} user={user} />
            </>
          ) : (
            <div className="pro-card p-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-pro-50 dark:bg-pro-950 text-pro-600 dark:text-pro-400 flex items-center justify-center mx-auto mb-3 font-black text-xl">
                CL
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Welcome to CareerLink</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Connect. Grow. Get Hired. Join a vibrant community of verified engineers, founders, and recruiters.
              </p>
              <Link to="/register" className="w-full pro-btn-primary text-xs py-2 block mb-2">
                Join CareerLink Free
              </Link>
              <Link to="/login" className="w-full pro-btn-secondary text-xs py-2 block">
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Center Column: Feed & Post Composer (6 cols) */}
        <div className="md:col-span-8 lg:col-span-6 space-y-4">
          {/* Onboarding Welcome Banner for New Accounts */}
          <OnboardingWelcomeBanner onOpenPostModal={() => setCreatePostOpen(true)} />

          {/* Post Composer Box */}
          {isAuthenticated && (
            <div className="pro-card p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Avatar
                  src={profile?.avatar}
                  alt={profile?.fullName || user?.email}
                  size="md"
                />
                <button
                  type="button"
                  onClick={() => setCreatePostOpen(true)}
                  className="flex-1 text-left px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-750 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-semibold transition-colors"
                >
                  Start a post, share a project or insight...
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setCreatePostOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-pro-600 dark:text-pro-400 transition-colors"
                >
                  <PenSquare className="w-4 h-4" />
                  <span>Create Post</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCreatePostOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-emerald-600 dark:text-emerald-400 transition-colors"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Photo</span>
                </button>

                <Link
                  to="/articles/create"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Write Article</span>
                </Link>
              </div>
            </div>
          )}

          {/* Posts Stream */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="pro-card p-5 animate-pulse bg-slate-200 dark:bg-slate-800 h-48" />
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onPostDeleted={handlePostDeleted}
                  onPostUpdated={handlePostUpdated}
                  onPostCreated={handlePostCreated}
                />
              ))}

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
            <div className="pro-card p-12 text-center">
              <PenSquare className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No posts in your feed yet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Be the first to share an engineering milestone or insight with the community!</p>
              {isAuthenticated && (
                <button
                  onClick={() => setCreatePostOpen(true)}
                  className="pro-btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5 mt-4"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create First Post</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Recommendations & Network Suggestions (3 cols) */}
        <div className="hidden lg:block lg:col-span-3 space-y-4">
          {/* Recommended Jobs Widget */}
          <div className="pro-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Job Recommendations</span>
              </h4>
              <Link to="/jobs/recommendations" className="text-[11px] font-bold text-pro-600 dark:text-pro-400 hover:underline">
                View All
              </Link>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recommendedJobs.map((job) => (
                <div key={job._id} className="py-2.5 first:pt-0 last:pb-0">
                  <Link to={`/jobs`} className="font-bold text-xs text-slate-900 dark:text-white hover:text-pro-600 line-clamp-1">
                    {job.title}
                  </Link>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{job.company?.name} · {job.location}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      {job.workMode}
                    </span>
                    <Link to={`/jobs`} className="text-[10px] font-bold text-pro-600 dark:text-pro-400 hover:underline">
                      Apply →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* People You May Know */}
          {suggestedConnections.length > 0 && (
            <div className="pro-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-pro-600 dark:text-pro-400" />
                  <span>Suggested Peers</span>
                </h4>
                <Link to="/network" className="text-[11px] font-bold text-pro-600 dark:text-pro-400 hover:underline">
                  Grow
                </Link>
              </div>

              <div className="space-y-3">
                {suggestedConnections.map((u) => {
                  const p = u.profile || {};
                  const name = p.fullName || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Professional';
                  return (
                    <div key={u._id} className="flex items-start gap-2.5">
                      <Avatar src={p.avatar} alt={name} size="sm" />
                      <div className="overflow-hidden flex-1">
                        <Link to={`/profile/${p._id || u._id}`} className="font-bold text-xs text-slate-900 dark:text-white hover:text-pro-600 truncate block">
                          {name}
                        </Link>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{p.headline}</p>
                        <Link
                          to="/network"
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-pro-600 dark:text-pro-400 hover:underline mt-1"
                        >
                          <span>Connect</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Developed By Team Section (JOB RECOMMENDATIONS -> SUGGESTED PEERS -> DEVELOPED BY) */}
          <DevelopedByWidget />
        </div>
      </div>

      {/* Mobile Developed By Section */}
      <div className="block lg:hidden mt-6">
        <DevelopedByWidget />
      </div>

      {/* Company Insights & Performance Section */}
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
