import React, { useState } from 'react';
import { FileText, Upload, CheckCircle2, Send, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { jobService, profileService } from '../../services/api';
import Modal from '../common/Modal';

const ApplyModal = ({ isOpen, onClose, job, onApplied }) => {
  const { profile } = useAuth();
  const { showToast } = useNotifications();

  const [coverNote, setCoverNote] = useState('');
  const [selectedResume, setSelectedResume] = useState(profile?.resume || null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!job) return null;

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Only PDF resumes are supported.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setIsUploadingResume(true);
    setError(null);
    try {
      const data = await profileService.uploadResume(formData);
      if (data.success && data.resume) {
        setSelectedResume(data.resume);
        showToast('Resume uploaded to your profile successfully!', 'success');
      }
    } catch (err) {
      setError(err.message || 'Failed to upload resume');
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!selectedResume || !selectedResume.url) {
      setError('Please provide a PDF resume to apply.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        coverNote: coverNote.trim(),
        resumeUrl: selectedResume.url,
        resumeFileName: selectedResume.fileName || 'Resume.pdf',
      };

      const res = await jobService.applyForJob(job._id, payload);
      if (res.success) {
        showToast('Application submitted successfully!', 'success');
        if (onApplied) onApplied(job._id);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Application submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Apply to ${job.company?.name || 'Company'}`}>
      <form onSubmit={handleApply} className="space-y-4">
        {/* Job Header */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <h4 className="font-bold text-slate-900 text-sm">{job.title}</h4>
          <p className="text-xs text-slate-500">{job.location} · {job.jobType} · {job.workMode}</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Resume Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Resume / CV (PDF required)
          </label>

          {selectedResume && selectedResume.url ? (
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-6 h-6 text-emerald-600 shrink-0" />
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {selectedResume.fileName || 'Profile_Resume.pdf'}
                  </p>
                  <p className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Ready to submit
                  </p>
                </div>
              </div>

              <label className="cursor-pointer text-[11px] font-semibold text-pro-600 hover:text-pro-700 underline">
                Replace PDF
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleResumeUpload}
                  className="hidden"
                  disabled={isUploadingResume}
                />
              </label>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-pro-400 transition-colors">
              <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
              <p className="text-xs text-slate-600 font-medium">Upload your PDF Resume</p>
              <p className="text-[10px] text-slate-400 mb-2">Max file size 10MB</p>
              <label className="cursor-pointer pro-btn-secondary text-xs py-1 px-3">
                <span>Select File</span>
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

        {/* Cover Note */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Cover Note / Message to Recruiter (Optional)
          </label>
          <textarea
            rows={4}
            placeholder="Introduce yourself and highlight key achievements relevant to this role..."
            value={coverNote}
            onChange={(e) => setCoverNote(e.target.value)}
            className="pro-input text-xs"
          />
        </div>

        {/* Submit Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="pro-btn-secondary text-xs px-4 py-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!selectedResume || isSubmitting || isUploadingResume}
            className="pro-btn-primary text-xs px-5 py-2 flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <span>Submitting...</span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Submit Application</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ApplyModal;
