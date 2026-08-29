import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, ArrowLeft, Plus } from 'lucide-react';
import { companyService, recruiterService } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';

const CreateJobPage = () => {
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  const [companies, setCompanies] = useState([]);
  const [companyId, setCompanyId] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('Full-time');
  const [workMode, setWorkMode] = useState('Hybrid');
  const [salaryMin, setSalaryMin] = useState(120000);
  const [salaryMax, setSalaryMax] = useState(160000);
  const [experienceRequired, setExperienceRequired] = useState(3);
  const [skillsRequired, setSkillsRequired] = useState('React, TypeScript, Node.js');
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await companyService.getCompanies();
        if (res.success && res.companies.length > 0) {
          setCompanies(res.companies);
          setCompanyId(res.companies[0]._id);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchCompanies();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyId) {
      setError('Please select or create a company first.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        title: title.trim(),
        company: companyId,
        location: location.trim(),
        jobType,
        workMode,
        salaryMin: parseInt(salaryMin, 10) || 0,
        salaryMax: parseInt(salaryMax, 10) || 0,
        experienceRequired: parseInt(experienceRequired, 10) || 0,
        skillsRequired: skillsRequired.split(',').map((s) => s.trim()).filter(Boolean),
        description: description.trim(),
        responsibilities: responsibilities.split('\n').map((r) => r.trim()).filter(Boolean),
        qualifications: qualifications.split('\n').map((q) => q.trim()).filter(Boolean),
      };

      const res = await recruiterService.createJob(payload);
      if (res.success) {
        showToast('Job posting published successfully!', 'success');
        navigate('/recruiter/jobs');
      }
    } catch (err) {
      setError(err.message || 'Failed to create job posting');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to="/recruiter/dashboard"
        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline mb-1"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Dashboard</span>
      </Link>

      <div className="pro-card p-6">
        <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 mb-1">
          <Briefcase className="w-6 h-6 text-indigo-600" />
          <span>Post a New Job Opportunity</span>
        </h1>
        <p className="text-xs text-slate-500 mb-6">
          Publish your role to CareerLink talent network and receive candidate applications with instant algorithmic match scoring.
        </p>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Job Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Full Stack Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="pro-input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hiring Company *</label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="pro-input text-sm"
                required
              >
                {companies.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Location *</label>
              <input
                type="text"
                required
                placeholder="e.g. San Francisco, CA"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pro-input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Work Mode</label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value)}
                className="pro-input text-sm"
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Job Type</label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="pro-input text-sm"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Min Salary ($/yr)</label>
              <input
                type="number"
                placeholder="100000"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                className="pro-input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Max Salary ($/yr)</label>
              <input
                type="number"
                placeholder="150000"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                className="pro-input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Required Exp (Years)</label>
              <input
                type="number"
                min={0}
                placeholder="3"
                value={experienceRequired}
                onChange={(e) => setExperienceRequired(e.target.value)}
                className="pro-input text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Required Skills (comma separated) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. React, TypeScript, Node.js, GraphQL"
              value={skillsRequired}
              onChange={(e) => setSkillsRequired(e.target.value)}
              className="pro-input text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Job Description *</label>
            <textarea
              rows={4}
              required
              placeholder="Provide a compelling overview of the team, mission, and day-to-day impact..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="pro-input text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Key Responsibilities (one per line)
            </label>
            <textarea
              rows={3}
              placeholder="Lead architecture of front-end services&#10;Optimize database queries and response latency&#10;Mentor team members"
              value={responsibilities}
              onChange={(e) => setResponsibilities(e.target.value)}
              className="pro-input text-sm font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Qualifications (one per line)
            </label>
            <textarea
              rows={3}
              placeholder="3+ years React and TypeScript experience&#10;Demonstrated understanding of REST and GraphQL APIs&#10;Strong communication skills"
              value={qualifications}
              onChange={(e) => setQualifications(e.target.value)}
              className="pro-input text-sm font-mono text-xs"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/recruiter/dashboard')}
              className="pro-btn-secondary text-xs px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="pro-btn-primary text-xs px-5 py-2.5 flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Publishing...' : 'Publish Job Listing'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJobPage;
