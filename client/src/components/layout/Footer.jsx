import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="mt-16 pb-8 pt-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto liquid-glass rounded-2xl p-6 text-slate-300 text-xs flex flex-col md:flex-row items-center justify-between gap-4 border border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-pro-700 via-pro-600 to-tealAccent-500 flex items-center justify-center text-white font-black text-[10px] shadow-sm">
            CL
          </div>
          <span className="text-sm font-black text-white">
            Career<span className="text-pro-400">Link</span>
          </span>
        </div>

        <p className="text-xs text-slate-400 text-center">
          CareerLink Platform © {new Date().getFullYear()} · <span className="text-slate-200">Connect. Grow. Get Hired.</span>
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 text-slate-300 font-medium">
          <Link to="/feed" className="hover:text-pro-400 transition-colors">Feed</Link>
          <Link to="/jobs" className="hover:text-pro-400 transition-colors">Jobs</Link>
          <Link to="/jobs/recommendations" className="hover:text-pro-400 transition-colors">AI Match Engine</Link>
          <Link to="/companies" className="hover:text-pro-400 transition-colors">Companies</Link>
          <Link to="/articles" className="hover:text-pro-400 transition-colors">Articles</Link>
          <Link to="/network" className="hover:text-pro-400 transition-colors">Network</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
