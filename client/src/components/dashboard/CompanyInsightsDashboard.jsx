import React from 'react';
import { BarChart3, Sparkles } from 'lucide-react';
import CompanyImpressionsWidget from './CompanyImpressionsWidget';
import PerformanceGraph from './PerformanceGraph';
import WhoIsLookingWidget from './WhoIsLookingWidget';
import TopCompaniesDiscoveringWidget from './TopCompaniesDiscoveringWidget';
import InterestedCompaniesWidget from './InterestedCompaniesWidget';

const CompanyInsightsDashboard = () => {
  return (
    <section className="space-y-6 pt-4">
      {/* Section Title Banner */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-pro-600/30 border border-pro-400/30 text-pro-300">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
              <span>Company Insights & Performance</span>
            </h2>
            <p className="text-xs text-slate-300">
              Real-time profile discovery, company reach velocity, and network engagement
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-300">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Interactive Dashboard</span>
        </div>
      </div>

      {/* 1. Metric Cards: Company Impressions */}
      <CompanyImpressionsWidget />

      {/* 2. Interactive Animated Performance Graph */}
      <PerformanceGraph />

      {/* 3. Two-Column Analytics: Breakdown & Top Companies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WhoIsLookingWidget />
        <TopCompaniesDiscoveringWidget />
      </div>

      {/* 4. Real Company Discovery Directory */}
      <InterestedCompaniesWidget />
    </section>
  );
};

export default CompanyInsightsDashboard;
