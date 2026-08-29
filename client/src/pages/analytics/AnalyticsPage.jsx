import React from 'react';
import { BarChart3, TrendingUp, Sparkles, Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import CompanyInsightsDashboard from '../../components/dashboard/CompanyInsightsDashboard';

const AnalyticsPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb / Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/feed"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-pro-400 hover:text-pro-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </Link>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Real-time Velocity & Impressions</span>
        </div>
      </div>

      {/* Main Insights Suite */}
      <CompanyInsightsDashboard />
    </div>
  );
};

export default AnalyticsPage;
