import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  FileText,
  Star,
  UserPlus,
  MessageSquare,
  Edit,
  Check,
  ExternalLink,
  Download,
  Calendar,
  Camera,
  Trash2,
  UploadCloud,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { profileService, connectionService } from '../../services/api';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ResumeViewerModal from '../../components/profile/ResumeViewerModal';
import CareerScoreWidget from '../../components/profile/CareerScoreWidget';

const ProfilePage = () => {
  const { id } = useParams();
  const { user: currentUser, updateProfileState } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('none');
  const [resumeModalOpen, setResumeModalOpen] = useState(false);

  // Avatar & Cover Upload Modals
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [coverModalOpen, setCoverModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const targetId = id || currentUser?.profile?._id || currentUser?.id;
  const isOwnProfile = currentUser && (
    currentUser.profile?._id === profile?._id ||
    currentUser.id === profile?.user?._id ||
    currentUser._id === profile?.user?._id ||
    currentUser.id === profile?.user
  );

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        const res = await profileService.getProfile(targetId);
        if (res.success && res.profile) {
          setProfile(res.profile);
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
  }, [targetId]);

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
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleSaveAvatar = async () => {
    if (!uploadFile) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', uploadFile);
      const res = await profileService.uploadAvatar(formData);
      if (res.success && res.profile) {
        setProfile(res.profile);
        updateProfileState(res.profile);
        showToast('Profile photo updated successfully!', 'success');
        setAvatarModalOpen(false);
        setUploadFile(null);
        setPreviewImage(null);
      }
    } catch (err) {
      showToast(err.message || 'Failed to update photo', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!window.confirm('Remove your profile photo and reset to default?')) return;
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
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleSaveCover = async () => {
    if (!uploadFile) return;
    setIsUploading(true);
    try {
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
      await connectionService.sendRequest(targetUserId);
      setConnectionStatus('pending');
      showToast('Connection request sent!', 'success');
    } catch (err) {
      showToast(err.message || 'Connection request failed', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-4">
        <div className="pro-card h-64 animate-pulse bg-slate-200 dark:bg-slate-800" />
        <div className="pro-card h-40 animate-pulse bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Profile Not Found</h3>
        <p className="text-xs text-slate-500 mb-4">{error || 'This user profile does not exist.'}</p>
        <Link to="/feed" className="pro-btn-primary text-xs py-2">Return to Feed</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Header Profile Banner Card */}
      <div className="pro-card overflow-hidden">
        {/* Cover Photo */}
        <div className="h-44 sm:h-56 bg-gradient-to-r from-pro-700 via-indigo-800 to-slate-950 relative group">
          {profile.coverImage && (
            <img
              src={profile.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}

          {/* Edit Cover Icon (Own Profile) */}
          {isOwnProfile && (
            <button
              onClick={() => {
                setUploadFile(null);
                setPreviewImage(null);
                setCoverModalOpen(true);
              }}
              className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/70 hover:bg-slate-900 text-white text-xs font-semibold backdrop-blur-sm flex items-center gap-1.5 transition-all shadow-md"
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Edit Cover</span>
            </button>
          )}
        </div>

        {/* Profile Details Bar */}
        <div className="p-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 gap-4 mb-4">
            <div className="flex items-end gap-4 relative">
              <div className="relative group">
                <Avatar
                  src={profile.avatar}
                  alt={profile.fullName}
                  size="2xl"
                  className="ring-4 ring-white dark:ring-slate-900 shadow-lg bg-white dark:bg-slate-900"
                />

                {/* Edit Avatar Overlay Button (Own Profile) */}
                {isOwnProfile && (
                  <button
                    onClick={() => {
                      setUploadFile(null);
                      setPreviewImage(null);
                      setAvatarModalOpen(true);
                    }}
                    className="absolute inset-0 rounded-full bg-slate-900/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs shadow-md"
                    title="Change Profile Photo"
                  >
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-bold">Edit Photo</span>
                  </button>
                )}
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {profile.fullName}
                </h1>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                  {profile.headline}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                  {profile.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {profile.location}
                    </span>
                  )}
                  {profile.preferredWorkMode && (
                    <span>· Mode: {profile.preferredWorkMode}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {isOwnProfile ? (
                <Link
                  to="/profile/edit"
                  className="pro-btn-secondary text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5 text-slate-500" />
                  <span>Edit Full Profile</span>
                </Link>
              ) : (
                <>
                  <button
                    onClick={handleConnect}
                    disabled={connectionStatus === 'pending'}
                    className="pro-btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{connectionStatus === 'pending' ? 'Request Sent' : 'Connect'}</span>
                  </button>

                  <Link
                    to={`/messages?userId=${profile.user?._id || profile.user}`}
                    className="pro-btn-secondary text-xs py-2 px-4 flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Career Score Widget (Own Profile) */}
      {isOwnProfile && (
        <CareerScoreWidget profile={profile} />
      )}

      {/* 3. About Section */}
      {profile.about && (
        <div className="pro-card p-6">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-white mb-2">
            About
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {profile.about}
          </p>
        </div>
      )}

      {/* 4. Verified Skills & Peer Endorsement Graph */}
      <div className="pro-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-pro-600 dark:text-pro-400" />
            <span>Verified Skills & Peer Endorsements</span>
          </h3>
          {isOwnProfile && (
            <Link to="/profile/edit#skills" className="text-xs font-bold text-pro-600 dark:text-pro-400 hover:underline">
              + Manage Skills
            </Link>
          )}
        </div>

        {profile.skills && profile.skills.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {profile.skills.map((skill) => {
              const endorsementsCount = skill.endorsements ? skill.endorsements.length : 0;
              const isEndorsedByMe = currentUser && skill.endorsements?.some(
                (e) => (e.user?._id || e.user || e.user?.id) === (currentUser.id || currentUser._id)
              );

              return (
                <div
                  key={skill._id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 hover:border-pro-300 dark:hover:border-pro-600/60 transition-colors"
                >
                  <div>
                    <p className="font-bold text-xs text-slate-900 dark:text-white">{skill.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span>{endorsementsCount} {endorsementsCount === 1 ? 'endorsement' : 'endorsements'}</span>
                    </p>
                  </div>

                  {!isOwnProfile && currentUser && (
                    <button
                      onClick={() => handleEndorseSkill(skill._id)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                        isEndorsedByMe
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      <Star className={`w-3 h-3 ${isEndorsedByMe ? 'fill-amber-500 text-amber-500' : ''}`} />
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

      {/* 5. Work Experience Timeline */}
      <div className="pro-card p-6 space-y-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-pro-600 dark:text-pro-400" />
          <span>Work Experience Timeline</span>
        </h3>

        {profile.experience && profile.experience.length > 0 ? (
          <div className="space-y-4 border-l-2 border-slate-200 dark:border-slate-800 pl-4 ml-2">
            {profile.experience.map((exp, idx) => (
              <div key={idx} className="relative space-y-1">
                <div className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-pro-600 ring-4 ring-white dark:ring-slate-900" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{exp.title}</h4>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{exp.company} · {exp.location}</p>
                <p className="text-[11px] text-slate-400">
                  {exp.startDate} – {exp.current ? 'Present' : exp.endDate} · {exp.employmentType || 'Full-time'}
                </p>
                {exp.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 whitespace-pre-line leading-relaxed">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No work experience listed.</p>
        )}
      </div>

      {/* 6. Education Background */}
      <div className="pro-card p-6 space-y-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-pro-600 dark:text-pro-400" />
          <span>Education Credentials</span>
        </h3>

        {profile.education && profile.education.length > 0 ? (
          <div className="space-y-3">
            {profile.education.map((edu, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 text-xs">
                <h4 className="font-bold text-slate-900 dark:text-white">{edu.school}</h4>
                <p className="font-semibold text-slate-700 dark:text-slate-300">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{edu.startDate} – {edu.endDate}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No education history listed.</p>
        )}
      </div>

      {/* 7. Resume Document Preview Box */}
      {profile.resume && profile.resume.url && (
        <div className="pro-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {profile.resume.fileName || 'Verified Professional Resume.pdf'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Attached document available for 1-Click candidate applications
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setResumeModalOpen(true)}
              className="pro-btn-primary text-xs py-2 px-4"
            >
              View PDF Document
            </button>
            <a
              href={profile.resume.url}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="pro-btn-secondary text-xs py-2 px-3 flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Resume Viewer Modal */}
      {profile.resume && (
        <ResumeViewerModal
          isOpen={resumeModalOpen}
          onClose={() => setResumeModalOpen(false)}
          resume={profile.resume}
          candidateName={profile.fullName}
        />
      )}

      {/* Avatar Upload Modal */}
      <Modal
        isOpen={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        title="Edit Profile Photo"
      >
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            {previewImage ? (
              <img
                src={previewImage}
                alt="Avatar preview"
                className="w-32 h-32 rounded-full object-cover border-4 border-pro-500 shadow-md"
              />
            ) : (
              <Avatar src={profile.avatar} alt={profile.fullName} size="2xl" />
            )}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            JPG, PNG, WebP supported. Maximum file size 5MB.
          </p>

          <input
            ref={avatarInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            onChange={handleAvatarFileSelect}
            className="hidden"
          />

          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="pro-btn-secondary text-xs py-2 px-4 flex items-center gap-1.5"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Choose Photo</span>
            </button>

            {profile.avatar && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                disabled={isUploading}
                className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove</span>
              </button>
            )}
          </div>

          {previewImage && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setPreviewImage(null);
                  setUploadFile(null);
                }}
                className="pro-btn-secondary text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAvatar}
                disabled={isUploading}
                className="pro-btn-primary text-xs py-2 px-5 flex items-center gap-1.5"
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>{isUploading ? 'Uploading...' : 'Save Photo'}</span>
              </button>
            </div>
          )}
        </div>
      </Modal>

      {/* Cover Banner Upload Modal */}
      <Modal
        isOpen={coverModalOpen}
        onClose={() => setCoverModalOpen(false)}
        title="Edit Cover Banner"
      >
        <div className="space-y-4">
          <div className="h-36 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
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
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                No cover banner set
              </div>
            )}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            Recommended aspect ratio 4:1. Maximum file size 8MB.
          </p>

          <input
            ref={coverInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            onChange={handleCoverFileSelect}
            className="hidden"
          />

          <div className="flex justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="pro-btn-secondary text-xs py-2 px-4 flex items-center gap-1.5"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Choose Banner Image</span>
            </button>

            {profile.coverImage && (
              <button
                type="button"
                onClick={handleRemoveCover}
                disabled={isUploading}
                className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove</span>
              </button>
            )}
          </div>

          {previewImage && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setPreviewImage(null);
                  setUploadFile(null);
                }}
                className="pro-btn-secondary text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCover}
                disabled={isUploading}
                className="pro-btn-primary text-xs py-2 px-5 flex items-center gap-1.5"
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>{isUploading ? 'Saving...' : 'Save Cover'}</span>
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ProfilePage;
