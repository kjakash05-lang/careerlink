import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Users,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  FileText,
  Filter,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';
import { recruiterService } from '../../services/api';
import Avatar from '../../components/common/Avatar';
import ResumeViewerModal from '../../components/profile/ResumeViewerModal';

const CandidateSearchPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [name, setName] = useState('');
  const [skill, setSkill] = useState('');
  const [location, setLocation] = useState('');
  const [education, setEducation] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Resume Modal
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [activeResume, setActiveResume] = useState(null);
  const [activeCandidateName, setActiveCandidateName] = useState('');

  const fetchCandidates = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (name) params.name = name;
      if (skill) params.skill = skill;
      if (location) params.location = location;
      if (education) params.education = education;
      if (experienceYears) params.experienceYears = experienceYears;
      if (targetRole) params.targetRole = targetRole;

      const res = await recruiterService.searchCandidates(params);
      if (res.success) {
        setCandidates(res.candidates);
      }
    } catch (err) {
      console.error('Failed to search candidates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [experienceYears]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCandidates();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <Link
          to="/recruiter/dashboard"
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <Search className="w-6 h-6 text-indigo-600" />
          <span>Candidate Discovery & Talent Sourcing Engine</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Filter through candidate profiles by skill stack, experience, location, and education.
        </p>
      </div>

      {/* Multi-Parameter Search Controls */}
      <div className="pro-card p-5">
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Candidate Name</label>
              <input
                type="text"
                placeholder="e.g. Alex Rivera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pro-input text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Skill Requirement</label>
              <input
                type="text"
                placeholder="e.g. React, Python, AWS, Docker"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                className="pro-input text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Location</label>
              <input
                type="text"
                placeholder="e.g. San Francisco, CA or Bangalore"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pro-input text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Role / Headline</label>
              <input
                type="text"
                placeholder="e.g. Full Stack, Machine Learning"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="pro-input text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Education / School</label>
              <input
                type="text"
                placeholder="e.g. Computer Science, Stanford"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                className="pro-input text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Min Experience (Years)</label>
              <select
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                className="pro-input text-xs"
              >
                <option value="">Any Experience</option>
                <option value="2">2+ Years</option>
                <option value="4">4+ Years</option>
                <option value="6">6+ Years</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="pro-btn-primary text-xs py-2 px-6 bg-indigo-600 hover:bg-indigo-700"
            >
              Search Candidates ({candidates.length})
            </button>
          </div>
        </form>
      </div>

      {/* Candidate Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="pro-card p-6 animate-pulse bg-slate-200 h-44" />
          ))}
        </div>
      ) : candidates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {candidates.map((cand) => (
            <div
              key={cand._id}
              className="pro-card p-5 hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-3.5 mb-3">
                  <Avatar
                    src={cand.avatar}
                    alt={cand.fullName}
                    size="lg"
                  />
                  <div className="overflow-hidden flex-1">
                    <Link
                      to={`/profile/${cand._id}`}
                      className="font-bold text-slate-900 hover:text-indigo-600 text-base line-clamp-1"
                    >
                      {cand.fullName}
                    </Link>
                    <p className="text-xs font-semibold text-slate-600 line-clamp-1 mt-0.5">{cand.headline}</p>
                    <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {cand.location || 'Location flexible'} · Mode: {cand.preferredWorkMode || 'Any'}
                    </p>
                  </div>
                </div>

                {/* Skills Chips */}
                {cand.skills && cand.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {cand.skills.slice(0, 5).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-medium"
                      >
                        {typeof skill === 'string' ? skill : skill.name}
                      </span>
                    ))}
                    {cand.skills.length > 5 && (
                      <span className="px-1 text-[11px] text-slate-400">+{cand.skills.length - 5}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {cand.resume && cand.resume.url ? (
                  <button
                    onClick={() => {
                      setActiveResume(cand.resume);
                      setActiveCandidateName(cand.fullName);
                      setResumeModalOpen(true);
                    }}
                    className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Resume PDF</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400 italic">No resume uploaded</span>
                )}

                <Link
                  to={`/profile/${cand._id}`}
                  className="pro-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
                >
                  <span>Full Profile</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="pro-card p-12 text-center">
          <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">No matching candidates</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting the filter criteria.</p>
        </div>
      )}

      {/* Resume Viewer Modal */}
      <ResumeViewerModal
        isOpen={resumeModalOpen}
        onClose={() => setResumeModalOpen(false)}
        resume={activeResume}
        candidateName={activeCandidateName}
      />
    </div>
  );
};

export default CandidateSearchPage;
