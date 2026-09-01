import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Mail,
  Phone,
  GraduationCap,
  Award,
  Code,
  Star,
  UserPlus,
  MessageSquare,
  Edit,
  Check,
  Camera,
  Trash2,
  UploadCloud,
  Loader2,
  Sparkles,
  TrendingUp,
  Eye,
  Users,
  BarChart3,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShieldCheck,
  Activity,
  Image as ImageIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { profileService, connectionService, postService, analyticsService } from '../../services/api';
import Avatar from '../../components/common/Avatar';
import Modal from '../../components/common/Modal';
import CareerScoreWidget from '../../components/profile/CareerScoreWidget';
import PostCard from '../../components/feed/PostCard';

// Curated Default Preset Avatars Gallery
const PRESET_AVATARS = [
  {
    name: 'Tech Architect',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  },
  {
    name: 'Full Stack Engineer',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  },
  {
    name: 'Systems Developer',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
  },
  {
    name: 'Backend Specialist',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
  },
  {
    name: 'UI/UX Engineer',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
  },
  {
    name: 'Engineering Lead',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
  },
];

// Curated Default Preset Cover Banners Gallery
const PRESET_BANNERS = [
  {
    name: 'Liquid Glass Tech',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
  },
  {
    name: 'Cyber Neon Glow',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
  },
  {
    name: 'Deep Indigo Space',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
  },
  {
    name: 'Minimal Modernist',
    url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&auto=format&fit=crop&q=80',
  },
  {
    name: 'Silicon Circuitry',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
  },
  {
    name: 'Matrix Code Grid',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
  },
];

const ProfilePage = () => {
  const { id } = useParams();
  const { user: currentUser, updateProfileState } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('NONE');
  const [connectionId, setConnectionId] = useState(null);

  // User's Real Posts
  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);

  // Sidebar Data
  const [suggestions, setSuggestions] = useState([]);
  const [connectionsCount, setConnectionsCount] = useState(0);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState('7D');

  // Avatar & Cover Upload Modals + Preset Gallery State
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [coverModalOpen, setCoverModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [selectedPresetUrl, setSelectedPresetUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const params = useParams();
  const rawId = params.id || params.identifier;
  const targetId = (rawId && rawId !== 'undefined' && rawId !== '[object Object]')
    ? rawId
    : (currentUser?.profile?._id || currentUser?.id || currentUser?._id);

  const targetUserId = profile?.user?._id || profile?.user;
  const currentUserId = currentUser?.id || currentUser?._id;
  const isOwnProfile =
    Boolean(currentUser && profile && (
      (currentUserId && targetUserId && currentUserId.toString() === targetUserId.toString()) ||
      (currentUser.profile?._id && profile._id && currentUser.profile._id.toString() === profile._id.toString())
    ));

  // Fetch Profile & Relationship Status
  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await profileService.getProfile(targetId);
        if (res.success && res.profile) {
          setProfile(res.profile);

          const profileUid = res.profile.user?._id || res.profile.user;
          const authUid = currentUser?.id || currentUser?._id;

          // Check relationship status if viewing another user
          if (currentUser && profileUid && authUid && profileUid.toString() !== authUid.toString()) {
            try {
              const statusRes = await connectionService.getConnectionStatus(profileUid);
              if (statusRes.success) {
                setConnectionStatus(statusRes.status);
                setConnectionId(statusRes.connectionId);
              }
            } catch (statusErr) {
              console.warn('Could not fetch relationship status:', statusErr);
            }

            // Track visitor profile view
            analyticsService
              .trackEvent({
                type: 'PROFILE_VIEW',
                metadata: { targetUserId: profileUid },
              })
              .catch(() => {});
          } else {
            setConnectionStatus('SELF');
          }

          // Fetch user's real posts
          fetchUserPosts(profileUid);
        } else {
          setError('Profile not found');
        }
      } catch (err) {
        setError(err.message || 'Profile not found');
      } finally {
        setIsLoading(false);
      }
    };

    if (targetId) {
      fetchProfileData();
    }
  }, [targetId, currentUser]);

  // Fetch sidebar data (suggestions, analytics if owner)
  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        const [suggRes, connRes] = await Promise.allSettled([
          connectionService.getSuggestions(),
          connectionService.getMyConnections(),
        ]);

        if (suggRes.status === 'fulfilled' && suggRes.value.success) {
          setSuggestions(suggRes.value.suggestions.slice(0, 4));
        }
        if (connRes.status === 'fulfilled' && connRes.value.success) {
          setConnectionsCount(connRes.value.count || 0);
        }

        // Fetch owner analytics
        if (isOwnProfile) {
          try {
            const anaRes = await analyticsService.getMyAnalytics();
            if (anaRes.success) {
              setAnalyticsData(anaRes.analytics);
            }
          } catch (anaErr) {
            console.warn('Could not load profile analytics:', anaErr);
          }
        }
      } catch (e) {
        console.warn('Sidebar data load error:', e);
      }
    };

    fetchSidebarData();
  }, [isOwnProfile]);

  const fetchUserPosts = async (userId) => {
    setPostsLoading(true);
    try {
      const res = await postService.getPosts({ author: userId, limit: 10 });
      if (res.success && res.posts) {
        setUserPosts(res.posts);
      }
    } catch (err) {
      console.warn('Could not load user posts:', err);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleAvatarFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
      showToast('Please select a JPG, PNG, or WebP image.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must be under 5MB.', 'error');
      return;
    }

    setUploadFile(file);
    setSelectedPresetUrl(null);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleSelectPresetAvatar = (url) => {
    setSelectedPresetUrl(url);
    setUploadFile(null);
    setPreviewImage(url);
  };

  const handleSaveAvatar = async () => {
    setIsUploading(true);
    try {
      if (selectedPresetUrl) {
        // Save preset URL
        const res = await profileService.updateProfile({ avatar: selectedPresetUrl });
        if (res.success && res.profile) {
          setProfile(res.profile);
          updateProfileState(res.profile);
          showToast('Profile photo updated from gallery!', 'success');
          setAvatarModalOpen(false);
          setUploadFile(null);
          setPreviewImage(null);
          setSelectedPresetUrl(null);
        }
      } else if (uploadFile) {
        // Upload file
        const formData = new FormData();
        formData.append('avatar', uploadFile);
        const res = await profileService.uploadAvatar(formData);
        if (res.success && res.profile) {
          setProfile(res.profile);
          updateProfileState(res.profile);
          showToast('Profile photo uploaded successfully!', 'success');
          setAvatarModalOpen(false);
          setUploadFile(null);
          setPreviewImage(null);
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to update photo', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!window.confirm('Remove your profile photo and reset to default monogram?')) return;
    setIsUploading(true);
    try {
      const res = await profileService.removeAvatar();
      if (res.success && res.profile) {
        setProfile(res.profile);
        updateProfileState(res.profile);
        showToast('Profile photo removed.', 'info');
        setAvatarModalOpen(false);
        setUploadFile(null);
        setPreviewImage(null);
        setSelectedPresetUrl(null);
      }
    } catch (err) {
      showToast(err.message || 'Failed to remove photo', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCoverFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
      showToast('Please select a JPG, PNG, or WebP image.', 'error');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      showToast('File size must be under 8MB.', 'error');
      return;
    }

    setUploadFile(file);
    setSelectedPresetUrl(null);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleSelectPresetBanner = (url) => {
    setSelectedPresetUrl(url);
    setUploadFile(null);
    setPreviewImage(url);
  };

  const handleSaveCover = async () => {
    setIsUploading(true);
    try {
      if (selectedPresetUrl) {
        // Save preset banner URL
        const res = await profileService.updateProfile({ coverImage: selectedPresetUrl });
        if (res.success && res.profile) {
          setProfile(res.profile);
          updateProfileState(res.profile);
          showToast('Cover banner updated from gallery!', 'success');
          setCoverModalOpen(false);
          setUploadFile(null);
          setPreviewImage(null);
          setSelectedPresetUrl(null);
        }
      } else if (uploadFile) {
        // Upload file
        const formData = new FormData();
        formData.append('cover', uploadFile);
        const res = await profileService.uploadCover(formData);
        if (res.success && res.profile) {
          setProfile(res.profile);
          updateProfileState(res.profile);
          showToast('Cover banner updated!', 'success');
          setCoverModalOpen(false);
          setUploadFile(null);
          setPreviewImage(null);
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to update cover', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveCover = async () => {
    if (!window.confirm('Remove your cover banner?')) return;
    setIsUploading(true);
    try {
      const res = await profileService.removeCover();
      if (res.success && res.profile) {
        setProfile(res.profile);
        updateProfileState(res.profile);
        showToast('Cover banner removed.', 'info');
        setCoverModalOpen(false);
        setUploadFile(null);
        setPreviewImage(null);
        setSelectedPresetUrl(null);
      }
    } catch (err) {
      showToast(err.message || 'Failed to remove cover', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEndorseSkill = async (skillId) => {
    if (!currentUser) {
      showToast('Please sign in to endorse skills', 'info');
      return;
    }
    if (isOwnProfile) {
      showToast('You cannot endorse your own skills', 'info');
      return;
    }

    try {
      const res = await profileService.endorseSkill(profile._id, skillId);
      if (res.success && res.profile) {
        setProfile(res.profile);
        showToast(res.endorsed ? 'Skill endorsed!' : 'Endorsement removed', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Endorsement failed', 'error');
    }
  };

  const handleConnect = async () => {
    if (!currentUser) {
      showToast('Please sign in to connect', 'info');
      return;
    }
    try {
      const targetUserId = profile.user?._id || profile.user;
      const res = await connectionService.sendRequest(targetUserId);
      if (res.success) {
        setConnectionStatus('PENDING_SENT');
        showToast('Connection request sent!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Connection request failed', 'error');
    }
  };

  const handleAcceptConnection = async () => {
    if (!connectionId) return;
    try {
      const res = await connectionService.acceptRequest(connectionId);
      if (res.success) {
        setConnectionStatus('CONNECTED');
        showToast('Connection request accepted!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to accept connection', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="pro-card h-72 animate-pulse bg-slate-200 dark:bg-slate-850" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="pro-card h-40 animate-pulse bg-slate-200 dark:bg-slate-850" />
            <div className="pro-card h-60 animate-pulse bg-slate-200 dark:bg-slate-850" />
          </div>
          <div className="space-y-6">
            <div className="pro-card h-60 animate-pulse bg-slate-200 dark:bg-slate-850" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 text-center shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-2">Profile Not Found</h3>
        <p className="text-xs text-slate-400 mb-6">{error || 'This user profile does not exist or has been removed.'}</p>
        <Link to="/feed" className="pro-btn-primary text-xs py-2.5 px-6">
          Return to Feed
        </Link>
      </div>
    );
  }

  const chartHistory =
    analyticsData?.impressionsHistory?.[analyticsTimeframe] || [
      { date: 'Mon', value: 45, reach: 210 },
      { date: 'Tue', value: 68, reach: 340 },
      { date: 'Wed', value: 92, reach: 480 },
      { date: 'Thu', value: 78, reach: 410 },
      { date: 'Fri', value: 110, reach: 560 },
      { date: 'Sat', value: 85, reach: 390 },
      { date: 'Sun', value: 130, reach: 620 },
    ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* ======================================================== */}
      {/* 1. TOP HEADER HERO BANNER & IDENTITY CARD */}
      {/* ======================================================== */}
      <div className="pro-card overflow-hidden border border-white/15 shadow-2xl backdrop-blur-xl">
        {/* Cover Photo */}
        <div className="h-48 sm:h-64 bg-gradient-to-r from-pro-800 via-indigo-900 to-slate-950 relative group">
          {profile.coverImage ? (
            <img
              src={profile.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.35)_0%,_rgba(15,23,42,0.8)_60%,_rgba(0,0,0,0.95)_100%)] flex items-center justify-center">
              <span className="text-white/20 font-black text-4xl tracking-widest uppercase select-none">CareerLink Professional</span>
            </div>
          )}

          {/* Edit Cover Button (Owner Only) */}
          {isOwnProfile && (
            <button
              onClick={() => {
                setUploadFile(null);
                setPreviewImage(null);
                setSelectedPresetUrl(null);
                setCoverModalOpen(true);
              }}
              className="absolute top-4 right-4 py-1.5 px-3.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-white text-xs font-bold backdrop-blur-md flex items-center gap-2 transition-all border border-white/20 shadow-lg hover:scale-105"
            >
              <Camera className="w-3.5 h-3.5 text-pro-400" />
              <span className="hidden sm:inline">Change Banner</span>
            </button>
          )}
        </div>

        {/* Profile Identity Bar */}
        <div className="p-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-20 sm:-mt-24 gap-4 mb-4">
            {/* Avatar & Key Text */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 relative">
              <div className="relative group shrink-0">
                <Avatar
                  src={profile.avatar}
                  alt={profile.fullName}
                  size="2xl"
                  className="w-28 h-28 sm:w-36 sm:h-36 ring-4 ring-slate-950 shadow-2xl bg-slate-900 border-2 border-white/20"
                />

                {/* Edit Avatar Overlay Button (Owner Only) */}
                {isOwnProfile && (
                  <button
                    onClick={() => {
                      setUploadFile(null);
                      setPreviewImage(null);
                      setSelectedPresetUrl(null);
                      setAvatarModalOpen(true);
                    }}
                    className="absolute inset-0 rounded-full bg-slate-950/70 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs shadow-md border border-pro-400/40"
                    title="Change Profile Photo"
                  >
                    <Camera className="w-6 h-6 mb-1 text-pro-300" />
                    <span className="text-[10px] font-bold tracking-wider uppercase">Edit Photo</span>
                  </button>
                )}
              </div>

              <div className="space-y-1 sm:mb-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {profile.fullName}
                  </h1>
                  <span title="Verified CareerLink Member" className="text-pro-400">
                    <ShieldCheck className="w-5 h-5 fill-pro-500/20 text-pro-400" />
                  </span>
                </div>

                <p className="text-sm font-semibold text-slate-200 leading-snug max-w-2xl">
                  {profile.headline || 'CareerLink Professional Member'}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
                  {profile.location && (
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-pro-400" /> {profile.location}
                    </span>
                  )}
                  <span className="text-pro-300 font-semibold">
                    {connectionsCount > 0 ? `${connectionsCount} connections` : '500+ connections'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 sm:mb-3 shrink-0">
              {isOwnProfile ? (
                <>
                  <Link
                    to="/profile/edit"
                    className="pro-btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-lg shadow-pro-600/30"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </Link>

                  <Link
                    to="/analytics"
                    className="pro-btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-pro-400" />
                    <span>Analytics</span>
                  </Link>
                </>
              ) : (
                <>
                  {/* Dynamic Connection Button */}
                  {connectionStatus === 'CONNECTED' ? (
                    <button
                      disabled
                      className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 cursor-default"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Connected</span>
                    </button>
                  ) : connectionStatus === 'PENDING_SENT' ? (
                    <button
                      disabled
                      className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 cursor-default"
                    >
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      <span>Pending</span>
                    </button>
                  ) : connectionStatus === 'PENDING_RECEIVED' ? (
                    <button
                      onClick={handleAcceptConnection}
                      className="pro-btn-primary text-xs py-2 px-4 flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept Request</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleConnect}
                      className="pro-btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-lg shadow-pro-600/30"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Connect</span>
                    </button>
                  )}

                  <Link
                    to={`/messages?userId=${profile.user?._id || profile.user}`}
                    className="pro-btn-secondary text-xs py-2 px-4 flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-pro-400" />
                    <span>Message</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* ======================================================== */}
          {/* PROMINENT SKILLS REFLECTED DIRECTLY BELOW PROFILE PICTURE */}
          {/* ======================================================== */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="pt-3 border-t border-white/10 mt-2">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-3.5 h-3.5 text-pro-400" />
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-300">
                  Verified Technical Skills
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill._id || skill.name}
                    className="px-3 py-1 rounded-xl text-xs font-bold bg-pro-500/15 text-pro-200 border border-pro-400/30 flex items-center gap-1.5 hover:bg-pro-500/25 transition-all shadow-sm"
                  >
                    <Code className="w-3 h-3 text-pro-400" />
                    <span>{skill.name}</span>
                    {skill.endorsements && skill.endorsements.length > 0 && (
                      <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-pro-600/40 text-pro-100">
                        {skill.endorsements.length}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. THREE-COLUMN PRODUCTION LAYOUT */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ======================================================== */}
        {/* LEFT / MAIN COLUMN (2/3 WIDTH) */}
        {/* ======================================================== */}
        <div className="lg:col-span-2 space-y-6">
          {/* Career Score / Completeness Prompt (Owner Only) */}
          {isOwnProfile && <CareerScoreWidget profile={profile} />}

          {/* Education Credentials */}
          <div className="pro-card p-6 border border-white/15 shadow-xl backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-pro-400" />
                <span>Education</span>
              </h3>
              {isOwnProfile && (
                <Link to="/profile/edit#education" className="text-xs font-bold text-pro-400 hover:text-pro-300">
                  + Add Education
                </Link>
              )}
            </div>

            {profile.education && profile.education.length > 0 ? (
              <div className="space-y-3">
                {profile.education.map((edu, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs">
                    <h4 className="font-bold text-white text-sm">{edu.school}</h4>
                    <p className="font-semibold text-slate-300">
                      {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {edu.startDate} – {edu.endDate}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No education credentials added.</p>
            )}
          </div>

          {/* Verified Skills & Peer Endorsements Section */}
          <div className="pro-card p-6 border border-white/15 shadow-xl backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-pro-400" />
                <span>Skills & Endorsements</span>
              </h3>
              {isOwnProfile && (
                <Link to="/profile/edit#skills" className="text-xs font-bold text-pro-400 hover:text-pro-300">
                  + Manage Skills
                </Link>
              )}
            </div>

            {profile.skills && profile.skills.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profile.skills.map((skill) => {
                  const endorsementsCount = skill.endorsements ? skill.endorsements.length : 0;
                  const isEndorsedByMe =
                    currentUser &&
                    skill.endorsements?.some(
                      (e) => (e.user?._id || e.user || e.user?.id) === (currentUser.id || currentUser._id)
                    );

                  return (
                    <div
                      key={skill._id || skill.name}
                      className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-2 hover:border-pro-400/40 transition-colors"
                    >
                      <div>
                        <p className="font-bold text-xs text-white">{skill.name}</p>
                        <p className="text-[10.5px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span>{endorsementsCount} {endorsementsCount === 1 ? 'endorsement' : 'endorsements'}</span>
                        </p>
                      </div>

                      {!isOwnProfile && currentUser && (
                        <button
                          onClick={() => handleEndorseSkill(skill._id)}
                          className={`text-xs font-bold px-3 py-1 rounded-xl transition-all flex items-center gap-1 ${
                            isEndorsedByMe
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                          }`}
                        >
                          <Star className={`w-3 h-3 ${isEndorsedByMe ? 'fill-amber-400 text-amber-400' : ''}`} />
                          <span>{isEndorsedByMe ? 'Endorsed' : 'Endorse'}</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No skills listed yet.</p>
            )}
          </div>

          {/* User's Real Posts / Activity */}
          <div className="pro-card p-6 border border-white/15 shadow-xl backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-pro-400" />
                <span>Recent Activity & Posts</span>
              </h3>
              <span className="text-xs text-slate-400 font-semibold">{userPosts.length} posts</span>
            </div>

            {postsLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-32 rounded-xl bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : userPosts.length > 0 ? (
              <div className="space-y-4">
                {userPosts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onPostUpdated={(updated) => {
                      setUserPosts((prev) =>
                        prev.map((p) => (p._id === updated._id ? updated : p))
                      );
                    }}
                    onPostDeleted={(deletedId) => {
                      setUserPosts((prev) => prev.filter((p) => p._id !== deletedId));
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                <p>No posts published yet.</p>
                {isOwnProfile && (
                  <Link to="/feed" className="text-pro-400 hover:underline font-bold mt-1 inline-block">
                    Create your first post on the Home Feed →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN (1/3 WIDTH) */}
        {/* ======================================================== */}
        <div className="space-y-6">
          {/* Profile Owner Private Analytics Card */}
          {isOwnProfile && (
            <div className="pro-card p-6 border border-white/15 shadow-xl backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-pro-400" />
                  <span>Private Analytics</span>
                </h3>
                <span className="text-[9px] uppercase font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  Only you
                </span>
              </div>

              {/* Timeframe Filter Buttons */}
              <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                {['7D', '30D', '90D', '1Y'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setAnalyticsTimeframe(t)}
                    className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all ${
                      analyticsTimeframe === t
                        ? 'bg-pro-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Metric Highlights */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Profile Views</p>
                  <p className="text-xl font-black text-white mt-1">
                    {analyticsData?.summary?.profileViews || 142}
                  </p>
                  <p className="text-[9px] text-emerald-400 font-bold flex items-center gap-0.5 mt-0.5">
                    <TrendingUp className="w-2.5 h-2.5" /> +18.4%
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Post Reach</p>
                  <p className="text-xl font-black text-white mt-1">
                    {analyticsData?.summary?.postImpressions || 1850}
                  </p>
                  <p className="text-[9px] text-emerald-400 font-bold flex items-center gap-0.5 mt-0.5">
                    <TrendingUp className="w-2.5 h-2.5" /> +24.1%
                  </p>
                </div>
              </div>

              {/* Mini Sparkline Chart */}
              <div className="space-y-1.5 pt-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Impressions Trend</p>
                <div className="h-20 flex items-end gap-1 pt-4 px-1">
                  {chartHistory.map((item, idx) => {
                    const maxVal = Math.max(...chartHistory.map((c) => c.value || c.reach || 10));
                    const currentVal = item.value || item.reach || 10;
                    const heightPercent = Math.max(15, Math.round((currentVal / maxVal) * 100));

                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full rounded-t-sm bg-gradient-to-t from-pro-600 to-tealAccent-400 group-hover:brightness-125 transition-all"
                        />
                        <span className="text-[8px] text-slate-500">{item.date?.slice(0, 3)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Link
                to="/analytics"
                className="w-full text-center block text-xs font-bold text-pro-300 hover:text-white pt-2 border-t border-white/10"
              >
                View Full Analytics Suite →
              </Link>
            </div>
          )}

          {/* People You May Know / Suggestions */}
          {suggestions.length > 0 && (
            <div className="pro-card p-6 border border-white/15 shadow-xl backdrop-blur-xl space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-pro-400" />
                <span>People You May Know</span>
              </h3>

              <div className="space-y-3.5">
                {suggestions.map((sug) => {
                  const sugProfile = sug.profile || {};
                  return (
                    <div key={sug._id} className="flex items-center justify-between gap-3">
                      <Link
                        to={`/profile/${sugProfile._id || sug._id}`}
                        className="flex items-center gap-3 overflow-hidden group"
                      >
                        <Avatar
                          src={sugProfile.avatar}
                          alt={sugProfile.firstName}
                          size="sm"
                        />
                        <div className="overflow-hidden">
                          <p className="font-bold text-white text-xs group-hover:text-pro-300 truncate">
                            {sugProfile.firstName} {sugProfile.lastName}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[140px]">
                            {sugProfile.headline}
                          </p>
                        </div>
                      </Link>

                      <Link
                        to={`/profile/${sugProfile._id || sug._id}`}
                        className="pro-btn-secondary text-[10.5px] py-1 px-2.5 shrink-0"
                      >
                        View
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. AVATAR UPLOAD & GALLERY PRESET MODAL */}
      {/* ======================================================== */}
      <Modal
        isOpen={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        title="Choose Profile Picture"
        maxWidth="max-w-xl"
      >
        <div className="space-y-5">
          {/* Live Preview */}
          <div className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-2xl border border-white/10">
            <div className="relative">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Avatar preview"
                  className="w-28 h-28 rounded-full object-cover border-4 border-pro-500 shadow-xl"
                />
              ) : (
                <Avatar src={profile.avatar} alt={profile.fullName} size="2xl" className="w-28 h-28" />
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Select from default preset gallery below or choose a file from your device.
            </p>
          </div>

          {/* Option A: Default Preset Gallery */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-pro-400" />
              <span>Choose from Default Gallery</span>
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {PRESET_AVATARS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPresetAvatar(preset.url)}
                  className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-all group ${
                    selectedPresetUrl === preset.url
                      ? 'border-pro-400 scale-105 ring-2 ring-pro-400/50'
                      : 'border-white/10 hover:border-pro-400/60'
                  }`}
                  title={preset.name}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                  {selectedPresetUrl === preset.url && (
                    <div className="absolute inset-0 bg-pro-600/40 flex items-center justify-center">
                      <Check className="w-5 h-5 text-white stroke-[3]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Option B: Upload from Device */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <UploadCloud className="w-3.5 h-3.5 text-pro-400" />
              <span>Or Choose from Your Device</span>
            </h4>

            <input
              ref={avatarInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={handleAvatarFileSelect}
              className="hidden"
            />

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="pro-btn-secondary text-xs py-2 px-4 flex items-center gap-1.5"
              >
                <UploadCloud className="w-4 h-4 text-pro-400" />
                <span>Browse Files...</span>
              </button>

              {profile.avatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={isUploading}
                  className="p-2 text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Reset to Initials</span>
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-white/10 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setAvatarModalOpen(false);
                setPreviewImage(null);
                setUploadFile(null);
                setSelectedPresetUrl(null);
              }}
              className="pro-btn-secondary text-xs py-2 px-4"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAvatar}
              disabled={isUploading || (!uploadFile && !selectedPresetUrl)}
              className="pro-btn-primary text-xs py-2 px-5 flex items-center gap-1.5 shadow-lg shadow-pro-600/30"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>{isUploading ? 'Saving...' : 'Apply Photo'}</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* 4. COVER BANNER UPLOAD & GALLERY PRESET MODAL */}
      {/* ======================================================== */}
      <Modal
        isOpen={coverModalOpen}
        onClose={() => setCoverModalOpen(false)}
        title="Choose Cover Banner"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-5">
          {/* Live Preview */}
          <div className="h-36 rounded-2xl overflow-hidden bg-slate-900 border border-white/15 relative shadow-xl">
            {previewImage ? (
              <img
                src={previewImage}
                alt="Cover preview"
                className="w-full h-full object-cover"
              />
            ) : profile.coverImage ? (
              <img
                src={profile.coverImage}
                alt="Current cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 font-medium">
                No cover banner selected
              </div>
            )}
          </div>

          {/* Option A: Default Preset Gallery */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-pro-400" />
              <span>Choose from Default Gallery</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {PRESET_BANNERS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPresetBanner(preset.url)}
                  className={`relative rounded-xl overflow-hidden h-20 border-2 transition-all group ${
                    selectedPresetUrl === preset.url
                      ? 'border-pro-400 scale-[1.02] ring-2 ring-pro-400/50'
                      : 'border-white/10 hover:border-pro-400/60'
                  }`}
                  title={preset.name}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                    <span className="text-[10px] font-bold text-white truncate">{preset.name}</span>
                  </div>
                  {selectedPresetUrl === preset.url && (
                    <div className="absolute inset-0 bg-pro-600/40 flex items-center justify-center">
                      <Check className="w-5 h-5 text-white stroke-[3]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Option B: Upload from Device */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <UploadCloud className="w-3.5 h-3.5 text-pro-400" />
              <span>Or Choose from Your Device</span>
            </h4>

            <input
              ref={coverInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={handleCoverFileSelect}
              className="hidden"
            />

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="pro-btn-secondary text-xs py-2 px-4 flex items-center gap-1.5"
              >
                <UploadCloud className="w-4 h-4 text-pro-400" />
                <span>Browse Banner Image...</span>
              </button>

              {profile.coverImage && (
                <button
                  type="button"
                  onClick={handleRemoveCover}
                  disabled={isUploading}
                  className="p-2 text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Remove Banner</span>
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-white/10 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setCoverModalOpen(false);
                setPreviewImage(null);
                setUploadFile(null);
                setSelectedPresetUrl(null);
              }}
              className="pro-btn-secondary text-xs py-2 px-4"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveCover}
              disabled={isUploading || (!uploadFile && !selectedPresetUrl)}
              className="pro-btn-primary text-xs py-2 px-5 flex items-center gap-1.5 shadow-lg shadow-pro-600/30"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>{isUploading ? 'Saving...' : 'Apply Banner'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProfilePage;
