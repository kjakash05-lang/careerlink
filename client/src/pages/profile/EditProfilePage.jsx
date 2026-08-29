import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Save,
  Plus,
  Trash2,
  Upload,
  FileText,
  Briefcase,
  GraduationCap,
  Award,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { profileService, uploadService } from '../../services/api';
import Modal from '../../components/common/Modal';

const EditProfilePage = () => {
  const { user, profile, updateProfileState } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  // Basic Info Form State
  const [firstName, setFirstName] = useState(profile?.firstName || '');
  const [lastName, setLastName] = useState(profile?.lastName || '');
  const [headline, setHeadline] = useState(profile?.headline || '');
  const [about, setAbout] = useState(profile?.about || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [preferredWorkMode, setPreferredWorkMode] = useState(profile?.preferredWorkMode || 'Any');
  const [targetRoles, setTargetRoles] = useState((profile?.targetRoles || []).join(', '));
  const [isSaving, setIsSaving] = useState(false);

  // Resume State
  const [resume, setResume] = useState(profile?.resume || null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  // Skills State
  const [skills, setSkills] = useState(profile?.skills || []);
  const [newSkillName, setNewSkillName] = useState('');

  // Experience Modal & State
  const [experiences, setExperiences] = useState(profile?.experience || []);
  const [expModalOpen, setExpModalOpen] = useState(false);
  const [expTitle, setExpTitle] = useState('');
  const [expCompany, setExpCompany] = useState('');
  const [expLocation, setExpLocation] = useState('');
  const [expStartDate, setExpStartDate] = useState('');
  const [expEndDate, setExpEndDate] = useState('');
  const [expCurrent, setExpCurrent] = useState(false);
  const [expDescription, setExpDescription] = useState('');
  const [expType, setExpType] = useState('Full-time');

  // Education Modal & State
  const [educations, setEducations] = useState(profile?.education || []);
  const [eduModalOpen, setEduModalOpen] = useState(false);
  const [eduSchool, setEduSchool] = useState('');
  const [eduDegree, setEduDegree] = useState('');
  const [eduField, setEduField] = useState('');
  const [eduStartDate, setEduStartDate] = useState('');
  const [eduEndDate, setEduEndDate] = useState('');
  const [eduDescription, setEduDescription] = useState('');

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || '');
      setLastName(profile.lastName || '');
      setHeadline(profile.headline || '');
      setAbout(profile.about || '');
      setLocation(profile.location || '');
      setPhone(profile.phone || '');
      setPreferredWorkMode(profile.preferredWorkMode || 'Any');
      setTargetRoles((profile.targetRoles || []).join(', '));
      setResume(profile.resume || null);
      setSkills(profile.skills || []);
      setExperiences(profile.experience || []);
      setEducations(profile.education || []);
    }
  }, [profile]);

  const handleSaveBasicInfo = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        headline: headline.trim(),
        about: about.trim(),
        location: location.trim(),
        phone: phone.trim(),
        preferredWorkMode,
        targetRoles: targetRoles.split(',').map((r) => r.trim()).filter(Boolean),
      };

      const res = await profileService.updateProfile(payload);
      if (res.success && res.profile) {
        updateProfileState(res.profile);
        showToast('Profile basic info updated successfully!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      showToast('Please select a valid PDF file for your resume', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setIsUploadingResume(true);
    try {
      const res = await profileService.uploadResume(formData);
      if (res.success && res.resume) {
        setResume(res.resume);
        updateProfileState(res.profile);
        showToast('Resume uploaded successfully!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Resume upload failed', 'error');
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!window.confirm('Are you sure you want to delete your uploaded resume?')) return;
    try {
      const res = await profileService.deleteResume();
      if (res.success) {
        setResume(null);
        updateProfileState(res.profile);
        showToast('Resume deleted', 'info');
      }
    } catch (err) {
      showToast(err.message || 'Could not delete resume', 'error');
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    try {
      const res = await profileService.addSkill(newSkillName.trim());
      if (res.success && res.profile) {
        setSkills(res.profile.skills);
        updateProfileState(res.profile);
        setNewSkillName('');
        showToast('Skill added!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to add skill', 'error');
    }
  };

  const handleRemoveSkill = async (skillId) => {
    try {
      const res = await profileService.removeSkill(skillId);
      if (res.success && res.profile) {
        setSkills(res.profile.skills);
        updateProfileState(res.profile);
        showToast('Skill removed', 'info');
      }
    } catch (err) {
      showToast(err.message || 'Could not remove skill', 'error');
    }
  };

  const handleAddExperience = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: expTitle.trim(),
        company: expCompany.trim(),
        location: expLocation.trim(),
        startDate: expStartDate,
        endDate: expCurrent ? undefined : expEndDate,
        current: expCurrent,
        employmentType: expType,
        description: expDescription.trim(),
      };

      const res = await profileService.addExperience(payload);
      if (res.success && res.profile) {
        setExperiences(res.profile.experience);
        updateProfileState(res.profile);
        setExpModalOpen(false);
        setExpTitle('');
        setExpCompany('');
        setExpLocation('');
        setExpDescription('');
        showToast('Experience added!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to add experience', 'error');
    }
  };

  const handleDeleteExperience = async (expId) => {
    try {
      const res = await profileService.deleteExperience(expId);
      if (res.success && res.profile) {
        setExperiences(res.profile.experience);
        updateProfileState(res.profile);
        showToast('Experience entry deleted', 'info');
      }
    } catch (err) {
      showToast(err.message || 'Could not delete experience', 'error');
    }
  };

  const handleAddEducation = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        school: eduSchool.trim(),
        degree: eduDegree.trim(),
        fieldOfStudy: eduField.trim(),
        startDate: eduStartDate,
        endDate: eduEndDate,
        description: eduDescription.trim(),
      };

      const res = await profileService.addEducation(payload);
      if (res.success && res.profile) {
        setEducations(res.profile.education);
        updateProfileState(res.profile);
        setEduModalOpen(false);
        setEduSchool('');
        setEduDegree('');
        setEduField('');
        setEduDescription('');
        showToast('Education added!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to add education', 'error');
    }
  };

  const handleDeleteEducation = async (eduId) => {
    try {
      const res = await profileService.deleteEducation(eduId);
      if (res.success && res.profile) {
        setEducations(res.profile.education);
        updateProfileState(res.profile);
        showToast('Education entry deleted', 'info');
      }
    } catch (err) {
      showToast(err.message || 'Could not delete education', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to={`/profile/${profile?._id || user?.id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-pro-600 hover:text-pro-700 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Profile</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900">Edit Profile & Resume</h1>
        </div>
      </div>

      {/* 1. Basic Info Section */}
      <div className="pro-card p-6">
        <h3 className="text-base font-bold text-slate-900 mb-4">Basic Information</h3>
        <form onSubmit={handleSaveBasicInfo} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="pro-input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Last Name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="pro-input text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Professional Headline</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="pro-input text-sm"
              placeholder="e.g. Senior Full Stack Engineer | React, Node.js"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pro-input text-sm"
                placeholder="e.g. San Francisco, CA"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pro-input text-sm"
                placeholder="e.g. +1 (555) 000-0000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Work Mode</label>
              <select
                value={preferredWorkMode}
                onChange={(e) => setPreferredWorkMode(e.target.value)}
                className="pro-input text-sm"
              >
                <option value="Any">Any / Flexible</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Roles (comma separated)</label>
              <input
                type="text"
                value={targetRoles}
                onChange={(e) => setTargetRoles(e.target.value)}
                className="pro-input text-sm"
                placeholder="e.g. Full Stack Engineer, Engineering Manager"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">About Section</label>
            <textarea
              rows={4}
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              className="pro-input text-sm"
              placeholder="Share a summary of your professional journey, technical expertise, and goals..."
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="pro-btn-primary text-xs py-2 px-5 flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Basic Info'}</span>
          </button>
        </form>
      </div>

      {/* 2. PDF Resume Management */}
      <div className="pro-card p-6">
        <h3 className="text-base font-bold text-slate-900 mb-3">Resume Document (PDF)</h3>

        {resume && resume.url ? (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-pro-600" />
              <div>
                <p className="text-sm font-bold text-slate-900">{resume.fileName || 'Resume.pdf'}</p>
                <p className="text-xs text-slate-500">
                  Uploaded: {resume.uploadDate ? new Date(resume.uploadDate).toLocaleDateString() : 'Active'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="cursor-pointer pro-btn-secondary text-xs py-1.5 px-3">
                <span>Replace PDF</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleResumeUpload}
                  className="hidden"
                  disabled={isUploadingResume}
                />
              </label>
              <button
                onClick={handleDeleteResume}
                className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Delete Resume"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-pro-400 transition-colors">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">Upload your PDF Resume</h4>
            <p className="text-xs text-slate-500 mb-3">PDF format up to 10MB</p>
            <label className="cursor-pointer pro-btn-primary text-xs py-2 px-4 inline-flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span>Select PDF Resume</span>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleResumeUpload}
                className="hidden"
                disabled={isUploadingResume}
              />
            </label>
          </div>
        )}
      </div>

      {/* 3. Skills Manager */}
      <div className="pro-card p-6">
        <h3 className="text-base font-bold text-slate-900 mb-3">Skills</h3>

        <form onSubmit={handleAddSkill} className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Add a new skill (e.g. React, Node.js, Kubernetes)..."
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            className="pro-input text-xs flex-1"
          />
          <button type="submit" className="pro-btn-primary text-xs py-2 px-4 flex items-center gap-1">
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill._id}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold border border-slate-200"
            >
              <span>{skill.name}</span>
              <button
                onClick={() => handleRemoveSkill(skill._id)}
                className="text-slate-400 hover:text-rose-600"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* 4. Experience Timeline Manager */}
      <div className="pro-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900">Work Experience</h3>
          <button
            onClick={() => setExpModalOpen(true)}
            className="pro-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Experience</span>
          </button>
        </div>

        <div className="space-y-3">
          {experiences.map((exp) => (
            <div key={exp._id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900">{exp.title}</h4>
                <p className="text-xs text-slate-700">{exp.company} · {exp.employmentType || 'Full-time'}</p>
                <p className="text-[11px] text-slate-400">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</p>
              </div>
              <button
                onClick={() => handleDeleteExperience(exp._id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Education Manager */}
      <div className="pro-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900">Education</h3>
          <button
            onClick={() => setEduModalOpen(true)}
            className="pro-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Education</span>
          </button>
        </div>

        <div className="space-y-3">
          {educations.map((edu) => (
            <div key={edu._id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900">{edu.school}</h4>
                <p className="text-xs text-slate-700">{edu.degree} {edu.fieldOfStudy ? `· ${edu.fieldOfStudy}` : ''}</p>
                <p className="text-[11px] text-slate-400">{edu.startDate} – {edu.endDate}</p>
              </div>
              <button
                onClick={() => handleDeleteEducation(edu._id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Experience Add Modal */}
      <Modal isOpen={expModalOpen} onClose={() => setExpModalOpen(false)} title="Add Work Experience">
        <form onSubmit={handleAddExperience} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Job Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Senior Software Engineer"
              value={expTitle}
              onChange={(e) => setExpTitle(e.target.value)}
              className="pro-input text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company</label>
              <input
                type="text"
                required
                placeholder="e.g. NovaTech Systems"
                value={expCompany}
                onChange={(e) => setExpCompany(e.target.value)}
                className="pro-input text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Employment Type</label>
              <select
                value={expType}
                onChange={(e) => setExpType(e.target.value)}
                className="pro-input text-xs"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
              <input
                type="text"
                placeholder="e.g. 2021-03"
                value={expStartDate}
                onChange={(e) => setExpStartDate(e.target.value)}
                className="pro-input text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">End Date</label>
              <input
                type="text"
                placeholder="e.g. 2023-08"
                disabled={expCurrent}
                value={expEndDate}
                onChange={(e) => setExpEndDate(e.target.value)}
                className="pro-input text-xs disabled:bg-slate-100"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={expCurrent}
              onChange={(e) => setExpCurrent(e.target.checked)}
              className="rounded text-pro-600"
            />
            <span>I currently work in this role</span>
          </label>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description / Responsibilities</label>
            <textarea
              rows={3}
              value={expDescription}
              onChange={(e) => setExpDescription(e.target.value)}
              className="pro-input text-xs"
              placeholder="Describe your achievements and technical responsibilities..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setExpModalOpen(false)}
              className="pro-btn-secondary text-xs px-4 py-2"
            >
              Cancel
            </button>
            <button type="submit" className="pro-btn-primary text-xs px-4 py-2">
              Add Experience
            </button>
          </div>
        </form>
      </Modal>

      {/* Education Add Modal */}
      <Modal isOpen={eduModalOpen} onClose={() => setEduModalOpen(false)} title="Add Education">
        <form onSubmit={handleAddEducation} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">School / University</label>
            <input
              type="text"
              required
              placeholder="e.g. Stanford University"
              value={eduSchool}
              onChange={(e) => setEduSchool(e.target.value)}
              className="pro-input text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Degree</label>
              <input
                type="text"
                required
                placeholder="e.g. B.S. Computer Science"
                value={eduDegree}
                onChange={(e) => setEduDegree(e.target.value)}
                className="pro-input text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Field of Study</label>
              <input
                type="text"
                placeholder="e.g. Software Systems"
                value={eduField}
                onChange={(e) => setEduField(e.target.value)}
                className="pro-input text-xs"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Start Year</label>
              <input
                type="text"
                placeholder="e.g. 2016"
                value={eduStartDate}
                onChange={(e) => setEduStartDate(e.target.value)}
                className="pro-input text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">End Year (or Expected)</label>
              <input
                type="text"
                placeholder="e.g. 2020"
                value={eduEndDate}
                onChange={(e) => setEduEndDate(e.target.value)}
                className="pro-input text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEduModalOpen(false)}
              className="pro-btn-secondary text-xs px-4 py-2"
            >
              Cancel
            </button>
            <button type="submit" className="pro-btn-primary text-xs px-4 py-2">
              Add Education
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EditProfilePage;
