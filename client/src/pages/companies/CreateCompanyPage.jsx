import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, ArrowLeft, Plus } from 'lucide-react';
import { companyService } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';

const CreateCompanyPage = () => {
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('51-200');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [foundedYear, setFoundedYear] = useState(new Date().getFullYear());
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        name: name.trim(),
        tagline: tagline.trim(),
        industry: industry.trim(),
        companySize,
        location: location.trim(),
        website: website.trim(),
        foundedYear: parseInt(foundedYear, 10),
        description: description.trim(),
        logo: logo.trim() || undefined,
        coverImage: coverImage.trim() || undefined,
      };

      const res = await companyService.createCompany(payload);
      if (res.success && res.company) {
        showToast('Company page created successfully!', 'success');
        navigate(`/company/${res.company._id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to create company page');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to="/companies"
        className="inline-flex items-center gap-1 text-xs font-semibold text-pro-600 hover:underline mb-1"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Companies</span>
      </Link>

      <div className="pro-card p-6">
        <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 mb-1">
          <Building2 className="w-6 h-6 text-pro-600" />
          <span>Create a Verified Company Page</span>
        </h1>
        <p className="text-xs text-slate-500 mb-6">
          Set up your organization's presence to publish jobs, attract candidates, and build employer brand.
        </p>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Company Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. NovaTech Systems"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pro-input text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tagline</label>
            <input
              type="text"
              placeholder="e.g. Building next-generation enterprise cloud platforms"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="pro-input text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Industry *</label>
              <input
                type="text"
                required
                placeholder="e.g. Enterprise Software, FinTech, AI"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="pro-input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company Size</label>
              <select
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className="pro-input text-sm"
              >
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501-1000">501-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Headquarters Location *</label>
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Official Website</label>
              <input
                type="url"
                placeholder="https://example.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="pro-input text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">About / Description *</label>
            <textarea
              rows={4}
              required
              placeholder="Describe your company mission, products, and culture..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="pro-input text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/companies')}
              className="pro-btn-secondary text-xs px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="pro-btn-primary text-xs px-5 py-2 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating...' : 'Create Company Page'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCompanyPage;
