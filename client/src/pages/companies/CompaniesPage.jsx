import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Search, Users, Briefcase, Plus, MapPin, Check, Filter, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { companyService } from '../../services/api';
import { CURATED_COMPANIES_DIRECTORY } from '../../data/companyInsightsData';

const INDUSTRY_FILTERS = ['All', 'Software & Cloud', 'AI & Semiconductors', 'Consumer Tech', 'Enterprise'];

const CompaniesPage = () => {
  const { user, isRecruiter } = useAuth();
  const { showToast } = useNotifications();

  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [followingMap, setFollowingMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const data = await companyService.getCompanies({ search });
      if (data.success && data.companies?.length > 0) {
        setCompanies(data.companies);
      } else {
        // Use curated directory
        setCompanies(CURATED_COMPANIES_DIRECTORY);
      }
    } catch (err) {
      setCompanies(CURATED_COMPANIES_DIRECTORY);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [search]);

  const handleFollowToggle = async (companyId, companyName) => {
    const isNowFollowing = !followingMap[companyId];
    setFollowingMap((prev) => ({
      ...prev,
      [companyId]: isNowFollowing,
    }));

    if (isNowFollowing) {
      showToast(`Now following ${companyName}!`, 'success');
    } else {
      showToast(`Unfollowed ${companyName}.`, 'info');
    }
  };

  const filteredCompanies = useMemo(() => {
    const list = companies.length > 0 ? companies : CURATED_COMPANIES_DIRECTORY;
    return list.filter((c) => {
      const matchSearch =
        search === '' ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.industry && c.industry.toLowerCase().includes(search.toLowerCase())) ||
        (c.location && c.location.toLowerCase().includes(search.toLowerCase()));

      const matchIndustry =
        selectedIndustry === 'All' ||
        (c.industry && c.industry.toLowerCase().includes(selectedIndustry.toLowerCase().split(' ')[0]));

      return matchSearch && matchIndustry;
    });
  }, [companies, search, selectedIndustry]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-pro-400" />
            <h1 className="text-2xl font-black text-white">
              Company Directory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-300 border border-white/10">
              Curated Profiles
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Discover technology leaders, cloud pioneers, and open engineering opportunities.
          </p>
        </div>

        {isRecruiter && (
          <Link
            to="/companies/create"
            className="pro-btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Company Profile</span>
          </Link>
        )}
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Microsoft, NVIDIA, Google, Apple, AI, Cloud..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="liquid-glass-input w-full pl-10 pr-4 text-xs"
          />
        </div>

        {/* Industry Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {INDUSTRY_FILTERS.map((ind) => (
            <button
              key={ind}
              onClick={() => setSelectedIndustry(ind)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                selectedIndustry === ind
                  ? 'bg-white/20 text-white border-white/30 shadow-md'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-slate-200'
              }`}
            >
              {ind}
            </button>
          ))}
        </div>
      </div>

      {/* Companies Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="liquid-glass p-6 animate-pulse h-56 rounded-3xl" />
          ))}
        </div>
      ) : filteredCompanies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCompanies.map((company) => {
            const companyId = company._id || company.id;
            const isFollowing = Boolean(followingMap[companyId] || company.isFollowing);
            const initials = company.initials || company.name?.substring(0, 2).toUpperCase() || 'CO';
            const color = company.color || 'from-pro-700 to-indigo-700';

            return (
              <div
                key={companyId}
                className="liquid-glass rounded-3xl overflow-hidden hover:border-white/30 transition-all flex flex-col justify-between group shadow-xl"
              >
                <div>
                  {/* Cover Banner */}
                  <div className="h-24 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden">
                    {company.coverImage && (
                      <img
                        src={company.coverImage}
                        alt={company.name}
                        className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  </div>

                  {/* Body Details */}
                  <div className="p-5 pt-0 relative">
                    <div className="-mt-8 mb-2 flex items-center justify-between">
                      {/* Avatar */}
                      <div
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${color} border-2 border-white/20 shadow-lg flex items-center justify-center text-white font-black text-base shrink-0`}
                      >
                        {initials}
                      </div>

                      {/* Follow Button */}
                      <button
                        type="button"
                        onClick={() => handleFollowToggle(companyId, company.name)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 border shadow-sm ${
                          isFollowing
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                            : 'bg-white/10 text-white hover:bg-white/20 border-white/15'
                        }`}
                      >
                        {isFollowing ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 text-pro-300" />
                        )}
                        <span>{isFollowing ? 'Following' : 'Follow'}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-white text-base group-hover:text-pro-300 transition-colors line-clamp-1">
                        {company.name}
                      </h3>
                      <span className="text-[8.5px] px-1.5 py-0.2 rounded bg-white/10 text-slate-300 uppercase tracking-wider font-semibold">
                        Company profile
                      </span>
                    </div>

                    <p className="text-xs text-pro-300 font-medium line-clamp-1 mt-0.5">
                      {company.industry}
                    </p>
                    <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                      {company.tagline || company.description}
                    </p>

                    {/* Metadata Pill Row */}
                    <div className="flex items-center gap-3 text-[11px] text-slate-300 mt-3 pt-3 border-t border-white/10">
                      {company.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" /> {company.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1 font-bold text-pro-400">
                        <Briefcase className="w-3 h-3" /> {company.openRoles || `${company.jobsCount || 12} open roles`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* View Jobs / Profile Button */}
                <div className="p-4 pt-0">
                  <Link
                    to="/jobs"
                    className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs text-center border border-white/15 hover:border-white/25 transition-all flex items-center justify-center gap-1"
                  >
                    <span>Explore Open Roles</span>
                    <ArrowRight className="w-3.5 h-3.5 text-pro-400" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="liquid-glass p-12 text-center text-slate-400 rounded-3xl">
          <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-500" />
          <h3 className="text-sm font-bold text-white">No companies match your search</h3>
          <p className="text-xs text-slate-400 mt-1">Try clearing filters or search for another technology company.</p>
        </div>
      )}
    </div>
  );
};

export default CompaniesPage;
