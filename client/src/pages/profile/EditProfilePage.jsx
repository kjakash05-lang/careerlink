import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Save,
  Plus,
  Trash2,
  GraduationCap,
  Award,
  ArrowLeft,
  Camera,
  UploadCloud,
  Check,
  Loader2,
  Code,
  Image as ImageIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { profileService } from '../../services/api';
import Modal from '../../components/common/Modal';
import Avatar from '../../components/common/Avatar';

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

const EditProfilePage = () => {
  const { user, profile, updateProfileState } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  // Basic Info Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [headline, setHeadline] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Skills State
  const [skills, setSkills] = useState([]);
  const [newSkillName, setNewSkillName] = useState('');

  // Education Modal & State
  const [educations, setEducations] = useState([]);
  const [eduModalOpen, setEduModalOpen] = useState(false);
  const [eduSchool, setEduSchool] = useState('');
  const [eduDegree, setEduDegree] = useState('');
  const [eduField, setEduField] = useState('');
  const [eduStartDate, setEduStartDate] = useState('');
  const [eduEndDate, setEduEndDate] = useState('');
  const [eduDescription, setEduDescription] = useState('');

  // Photo & Banner Modals
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [coverModalOpen, setCoverModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [selectedPresetUrl, setSelectedPresetUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || '');
      setLastName(profile.lastName || '');
      setHeadline(profile.headline || '');
      setLocation(profile.location || '');
      setPhone(profile.phone || '');
      setSkills(profile.skills || []);
      setEducations(profile.education || []);
    }
  }, [profile]);

  // Save Basic Info
  const handleSaveBasicInfo = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        headline: headline.trim(),
        location: location.trim(),
        phone: phone.trim(),
      };

      const res = await profileService.updateProfile(payload);
      if (res.success && res.profile) {
        updateProfileState(res.profile);
        showToast('Basic info saved successfully!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update profile info', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Avatar Management
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
        const res = await profileService.updateProfile({ avatar: selectedPresetUrl });
        if (res.success && res.profile) {
          updateProfileState(res.profile);
          showToast('Profile photo updated from gallery!', 'success');
          setAvatarModalOpen(false);
          setUploadFile(null);
          setPreviewImage(null);
          setSelectedPresetUrl(null);
        }
      } else if (uploadFile) {
        const formData = new FormData();
        formData.append('avatar', uploadFile);
        const res = await profileService.uploadAvatar(formData);
        if (res.success && res.profile) {
          updateProfileState(res.profile);
          showToast('Profile photo uploaded successfully!', 'success');
          setAvatarModalOpen(false);
          setUploadFile(null);
          setPreviewImage(null);
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to update avatar', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Banner Management
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
        const res = await profileService.updateProfile({ coverImage: selectedPresetUrl });
        if (res.success && res.profile) {
          updateProfileState(res.profile);
          showToast('Cover banner updated from gallery!', 'success');
          setCoverModalOpen(false);
          setUploadFile(null);
          setPreviewImage(null);
          setSelectedPresetUrl(null);
        }
      } else if (uploadFile) {
        const formData = new FormData();
        formData.append('cover', uploadFile);
        const res = await profileService.uploadCover(formData);
        if (res.success && res.profile) {
          updateProfileState(res.profile);
          showToast('Cover banner uploaded!', 'success');
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

  // Skills Management
  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    try {
      const res = await profileService.addSkill(newSkillName.trim());
      if (res.success) {
        const updatedSkills = res.skills || res.profile?.skills || [];
        setSkills(updatedSkills);
        if (res.profile) {
          updateProfileState(res.profile);
        }
        setNewSkillName('');
        showToast(`Skill "${newSkillName.trim()}" added & reflected below your profile picture!`, 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to add skill', 'error');
    }
  };

  const handleDeleteSkill = async (skillId) => {
    try {
      const res = await profileService.removeSkill(skillId);
      if (res.success) {
        const updatedSkills = res.skills || res.profile?.skills || [];
        setSkills(updatedSkills);
        if (res.profile) {
          updateProfileState(res.profile);
        }
        showToast('Skill removed', 'info');
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete skill', 'error');
    }
  };

  // Education Management (Without CGPA)
  const handleAddEducation = async (e) => {
    e.preventDefault();
    if (!eduSchool.trim() || !eduDegree.trim()) {
      showToast('School name and Degree are required.', 'error');
      return;
    }

    try {
      const res = await profileService.addEducation({
        school: eduSchool.trim(),
        degree: eduDegree.trim(),
        fieldOfStudy: eduField.trim(),
        startDate: eduStartDate.trim(),
        endDate: eduEndDate.trim(),
        description: eduDescription.trim(),
      });
      if (res.success) {
        const updatedEdus = res.education || res.profile?.education || [];
        setEducations(updatedEdus);
        if (res.profile) {
          updateProfileState(res.profile);
        }
        showToast('Education credential added!', 'success');
        setEduModalOpen(false);
        setEduSchool('');
        setEduDegree('');
        setEduField('');
        setEduStartDate('');
        setEduEndDate('');
        setEduDescription('');
      }
    } catch (err) {
      showToast(err.message || 'Failed to add education', 'error');
    }
  };

  const handleDeleteEducation = async (eduId) => {
    try {
      const res = await profileService.removeEducation(eduId);
      if (res.success) {
        const updatedEdus = res.education || res.profile?.education || [];
        setEducations(updatedEdus);
        if (res.profile) {
          updateProfileState(res.profile);
        }
        showToast('Education entry removed', 'info');
      }
    } catch (err) {
      showToast(err.message || 'Failed to remove education', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/profile/me"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white">Edit Profile</h1>
            <p className="text-xs text-slate-300">
              Customize your profile photo, cover banner, headlines, skills, and credentials.
            </p>
          </div>
        </div>

        <Link
          to="/profile/me"
          className="pro-btn-secondary text-xs py-2 px-4"
        >
          View Public Profile
        </Link>
      </div>

      {/* 1. Profile Visual Identity (Photo & Banner with Gallery Presets) */}
      <div className="pro-card p-6 border border-white/15 shadow-xl backdrop-blur-xl space-y-5">
        <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2 border-b border-white/10 pb-3">
          <Camera className="w-4 h-4 text-pro-400" />
          <span>Profile Photo & Cover Banner</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Profile Photo Card */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
            <Avatar src={profile?.avatar} alt={profile?.fullName} size="xl" />
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-white">Profile Photo</p>
              <p className="text-[11px] text-slate-400">Choose from gallery presets or upload a photo.</p>
              <button
                type="button"
                onClick={() => {
                  setUploadFile(null);
                  setPreviewImage(null);
                  setSelectedPresetUrl(null);
                  setAvatarModalOpen(true);
                }}
                className="pro-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5 text-pro-400" />
                <span>Change Photo</span>
              </button>
            </div>
          </div>

          {/* Cover Banner Card */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="h-16 rounded-xl overflow-hidden bg-slate-900 border border-white/10 relative">
              {profile?.coverImage ? (
                <img src={profile.coverImage} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[11px] text-slate-500">
                  Default Banner
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-white">Cover Banner</p>
              <button
                type="button"
                onClick={() => {
                  setUploadFile(null);
                  setPreviewImage(null);
                  setSelectedPresetUrl(null);
                  setCoverModalOpen(true);
                }}
                className="pro-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5 text-pro-400" />
                <span>Change Banner</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Basic Information Form */}
      <form onSubmit={handleSaveBasicInfo} className="pro-card p-6 border border-white/15 shadow-xl backdrop-blur-xl space-y-4">
        <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2 border-b border-white/10 pb-3">
          <span>Basic Information</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">First Name *</label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="pro-input text-xs"
              placeholder="e.g. Akash"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">Last Name *</label>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="pro-input text-xs"
              placeholder="e.g. K J"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-200 mb-1">Professional Headline *</label>
          <input
            type="text"
            required
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="pro-input text-xs"
            placeholder="e.g. Full Stack Developer | React & Node.js Engineer"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pro-input text-xs"
              placeholder="e.g. Bengaluru, Karnataka, India"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="pro-input text-xs"
              placeholder="e.g. +91 9876543210"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-white/10 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="pro-btn-primary text-xs py-2 px-5 flex items-center gap-1.5 shadow-lg shadow-pro-600/30"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Saving...' : 'Save Basic Info'}</span>
          </button>
        </div>
      </form>

      {/* 3. Skills Management (Reflected Directly Below Profile Picture) */}
      <div id="skills" className="pro-card p-6 border border-white/15 shadow-xl backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-pro-400" />
              <span>Skills & Technologies</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Skills added here reflect immediately directly under your profile photo.
            </p>
          </div>
          <span className="text-xs font-bold text-pro-300">{skills.length} skills added</span>
        </div>

        {/* Add Skill Input */}
        <form onSubmit={handleAddSkill} className="flex gap-2">
          <input
            type="text"
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            placeholder="Add a new skill (e.g. React, Java, Docker, Python)..."
            className="pro-input text-xs flex-1"
          />
          <button
            type="submit"
            disabled={!newSkillName.trim()}
            className="pro-btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Skill</span>
          </button>
        </form>

        {/* Skill Chips */}
        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-2">
            {skills.map((skill) => (
              <div
                key={skill._id || skill.name}
                className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/15 text-xs text-white font-bold flex items-center gap-2 hover:border-pro-400/50 transition-all"
              >
                <Code className="w-3.5 h-3.5 text-pro-400" />
                <span>{skill.name}</span>
                <button
                  type="button"
                  onClick={() => handleDeleteSkill(skill._id)}
                  className="text-slate-400 hover:text-rose-400 p-0.5 transition-colors"
                  title="Remove skill"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No skills added yet.</p>
        )}
      </div>

      {/* 4. Education Background (Without CGPA) */}
      <div id="education" className="pro-card p-6 border border-white/15 shadow-xl backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-pro-400" />
            <span>Education Background</span>
          </h2>
          <button
            type="button"
            onClick={() => setEduModalOpen(true)}
            className="pro-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5 text-pro-400" />
            <span>Add Education</span>
          </button>
        </div>

        {educations.length > 0 ? (
          <div className="space-y-3">
            {educations.map((edu) => (
              <div
                key={edu._id}
                className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <h4 className="font-bold text-white text-sm">{edu.school}</h4>
                  <p className="font-semibold text-slate-300">
                    {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {edu.startDate} – {edu.endDate}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteEducation(edu._id)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No education credentials added yet.</p>
        )}
      </div>

      {/* ======================================================== */}
      {/* 5. AVATAR UPLOAD & GALLERY MODAL */}
      {/* ======================================================== */}
      <Modal
        isOpen={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        title="Choose Profile Picture"
        maxWidth="max-w-xl"
      >
        <div className="space-y-5">
          <div className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-2xl border border-white/10">
            <div className="relative">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Avatar preview"
                  className="w-28 h-28 rounded-full object-cover border-4 border-pro-500 shadow-xl"
                />
              ) : (
                <Avatar src={profile?.avatar} alt={profile?.fullName} size="2xl" className="w-28 h-28" />
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Select from default preset gallery or choose a photo from your device.
            </p>
          </div>

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

            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="pro-btn-secondary text-xs py-2 px-4 flex items-center gap-1.5"
            >
              <UploadCloud className="w-4 h-4 text-pro-400" />
              <span>Browse Files...</span>
            </button>
          </div>

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
      {/* 6. COVER BANNER UPLOAD & GALLERY MODAL */}
      {/* ======================================================== */}
      <Modal
        isOpen={coverModalOpen}
        onClose={() => setCoverModalOpen(false)}
        title="Choose Cover Banner"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-5">
          <div className="h-36 rounded-2xl overflow-hidden bg-slate-900 border border-white/15 relative shadow-xl">
            {previewImage ? (
              <img
                src={previewImage}
                alt="Cover preview"
                className="w-full h-full object-cover"
              />
            ) : profile?.coverImage ? (
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

            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="pro-btn-secondary text-xs py-2 px-4 flex items-center gap-1.5"
            >
              <UploadCloud className="w-4 h-4 text-pro-400" />
              <span>Browse Banner Image...</span>
            </button>
          </div>

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

      {/* ======================================================== */}
      {/* 7. ADD EDUCATION MODAL (WITHOUT CGPA) */}
      {/* ======================================================== */}
      <Modal
        isOpen={eduModalOpen}
        onClose={() => setEduModalOpen(false)}
        title="Add Education Credential"
      >
        <form onSubmit={handleAddEducation} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">School / University *</label>
            <input
              type="text"
              required
              value={eduSchool}
              onChange={(e) => setEduSchool(e.target.value)}
              className="pro-input text-xs"
              placeholder="e.g. Indian Institute of Science"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">Degree *</label>
              <input
                type="text"
                required
                value={eduDegree}
                onChange={(e) => setEduDegree(e.target.value)}
                className="pro-input text-xs"
                placeholder="e.g. Bachelor of Technology"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">Field of Study</label>
              <input
                type="text"
                value={eduField}
                onChange={(e) => setEduField(e.target.value)}
                className="pro-input text-xs"
                placeholder="e.g. Computer Science"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">Start Year</label>
              <input
                type="text"
                value={eduStartDate}
                onChange={(e) => setEduStartDate(e.target.value)}
                className="pro-input text-xs"
                placeholder="e.g. 2022"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">End Year</label>
              <input
                type="text"
                value={eduEndDate}
                onChange={(e) => setEduEndDate(e.target.value)}
                className="pro-input text-xs"
                placeholder="e.g. 2026"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEduModalOpen(false)}
              className="pro-btn-secondary text-xs py-2 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="pro-btn-primary text-xs py-2 px-5 flex items-center gap-1.5 shadow-lg shadow-pro-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Add Education</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EditProfilePage;
