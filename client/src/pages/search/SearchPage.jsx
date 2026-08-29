import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Users,
  Building2,
  Briefcase,
  FileText,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { searchService } from '../../services/api';
import Avatar from '../../components/common/Avatar';
import JobCard from '../../components/jobs/JobCard';
import PostCard from '../../components/feed/PostCard';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'people' | 'companies' | 'jobs' | 'posts'

  const [results, setResults] = useState({ people: [], companies: [], jobs: [], posts: [] });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) return;

    const performSearch = async () => {
      setIsLoading(true);
      try {
        const res = await searchService.searchGlobal({ q: query, type: activeTab });
        if (res.success && res.results) {
          setResults(res.results);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [query, activeTab]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Search Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Search results for "<span className="text-pro-600 dark:text-pro-400">{query}</span>"
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-xs sm:text-sm font-bold">
        {['all', 'people', 'companies', 'jobs', 'posts'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 border-b-2 capitalize transition-colors ${
              activeTab === tab
                ? 'border-pro-600 dark:border-pro-400 text-pro-600 dark:text-pro-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Results Rendering */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="pro-card p-6 animate-pulse bg-slate-200 dark:bg-slate-800 h-28" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {/* People Section */}
          {(activeTab === 'all' || activeTab === 'people') && results.people?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-pro-600 dark:text-pro-400" /> People ({results.people.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results.people.map((p) => (
                  <div key={p._id} className="pro-card p-4 flex items-center justify-between gap-3">
                    <Link to={`/profile/${p._id}`} className="flex items-center gap-3 overflow-hidden">
                      <Avatar src={p.avatar} alt={p.fullName} size="md" />
                      <div className="overflow-hidden">
                        <p className="font-bold text-slate-900 dark:text-white hover:text-pro-600 dark:hover:text-pro-400 text-sm truncate">{p.fullName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{p.headline}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{p.location}</p>
                      </div>
                    </Link>
                    <Link to={`/profile/${p._id}`} className="pro-btn-secondary text-xs py-1 px-3 shrink-0">
                      Profile
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Companies Section */}
          {(activeTab === 'all' || activeTab === 'companies') && results.companies?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-pro-600 dark:text-pro-400" /> Companies ({results.companies.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results.companies.map((c) => (
                  <div key={c._id} className="pro-card p-4 flex items-center justify-between gap-3">
                    <Link to={`/company/${c._id}`} className="flex items-center gap-3 overflow-hidden">
                      <img src={c.logo} alt={c.name} className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0" />
                      <div className="overflow-hidden">
                        <p className="font-bold text-slate-900 dark:text-white hover:text-pro-600 dark:hover:text-pro-400 text-sm truncate">{c.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{c.industry} · {c.location}</p>
                      </div>
                    </Link>
                    <Link to={`/company/${c._id}`} className="pro-btn-secondary text-xs py-1 px-3 shrink-0">
                      View Page
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Jobs Section */}
          {(activeTab === 'all' || activeTab === 'jobs') && results.jobs?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-pro-600 dark:text-pro-400" /> Jobs ({results.jobs.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.jobs.map((job) => (
                  <JobCard key={job._id} job={job} />
                ))}
              </div>
            </div>
          )}

          {/* Posts Section */}
          {(activeTab === 'all' || activeTab === 'posts') && results.posts?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-pro-600 dark:text-pro-400" /> Posts ({results.posts.length})
              </h3>
              <div className="space-y-4 max-w-2xl">
                {results.posts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            </div>
          )}

          {results.people?.length === 0 && results.companies?.length === 0 && results.jobs?.length === 0 && results.posts?.length === 0 && (
            <div className="p-12 text-center text-slate-400 pro-card">
              <Search className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">No results found for "{query}"</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Try searching with a broader title, skill, company name or keyword.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
