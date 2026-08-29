import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, TrendingUp, Calendar, Info, Layers, Plus, Sparkles } from 'lucide-react';
import { useAnalytics } from '../../context/AnalyticsContext';

const METRIC_CONFIG = {
  overview: {
    label: 'Overview',
    color: '#38bdf8', // Sky 400
    unit: '',
  },
  profile_views: {
    label: 'Profile Views',
    color: '#34d399', // Emerald 400
    unit: 'views',
  },
  post_reach: {
    label: 'Post Reach',
    color: '#c084fc', // Purple 400
    unit: 'impressions',
  },
  recruiter_interest: {
    label: 'Recruiter Interest',
    color: '#fbbf24', // Amber 400
    unit: 'inquiries',
  },
};

const TIME_FILTERS = ['7D', '30D', '90D', '1Y'];

const PerformanceGraph = ({ onOpenPostModal }) => {
  const { analytics } = useAnalytics();
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('7D');
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const isNewAccount = analytics?.isNewAccount !== false && (analytics?.profileImpressions || 0) === 0;

  // Retrieve dataset from user's persistent analytics
  const currentDataset = useMemo(() => {
    if (analytics?.history && analytics.history[selectedTimeFilter]) {
      return analytics.history[selectedTimeFilter];
    }
    // Fallback baseline for 7D
    return [
      { date: 'Mon', value: 0 },
      { date: 'Tue', value: 0 },
      { date: 'Wed', value: 0 },
      { date: 'Thu', value: 0 },
      { date: 'Fri', value: 0 },
      { date: 'Sat', value: 0 },
      { date: 'Sun', value: 0 },
    ];
  }, [analytics, selectedTimeFilter]);

  const hasActivity = useMemo(() => {
    return currentDataset.some((d) => d.value > 0 || (d.reach && d.reach > 0));
  }, [currentDataset]);

  // Calculate SVG dimensions & coordinates
  const { pathD, areaD, points } = useMemo(() => {
    if (!currentDataset || currentDataset.length === 0) {
      return { pathD: '', areaD: '', points: [] };
    }

    const values = currentDataset.map((d) => d.value || 0);
    const maxVal = Math.max(...values, 10);
    const minVal = 0;
    const range = maxVal - minVal || 1;

    const width = 640;
    const height = 220;
    const padding = 32;

    const stepX = (width - padding * 2) / (currentDataset.length - 1 || 1);

    const calculatedPoints = currentDataset.map((item, idx) => {
      const x = padding + idx * stepX;
      const normalizedY = (item.value - minVal) / range;
      const y = height - padding - normalizedY * (height - padding * 2);
      return { ...item, x, y };
    });

    let linePath = `M ${calculatedPoints[0].x} ${calculatedPoints[0].y}`;
    for (let i = 0; i < calculatedPoints.length - 1; i++) {
      const p0 = calculatedPoints[i];
      const p1 = calculatedPoints[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }

    const lastX = calculatedPoints[calculatedPoints.length - 1].x;
    const firstX = calculatedPoints[0].x;
    const bottomY = height - padding + 10;
    const areaPath = `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;

    return {
      pathD: linePath,
      areaD: areaPath,
      points: calculatedPoints,
    };
  }, [currentDataset]);

  const activeColor = METRIC_CONFIG[selectedMetric]?.color || '#38bdf8';

  return (
    <div className="liquid-glass p-5 rounded-3xl border border-white/15 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <LineChart className="w-4 h-4 text-pro-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Your Performance
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-pro-500/20 text-pro-300 border border-pro-400/30">
              {hasActivity ? 'Active Velocity' : 'Initial Baseline'}
            </span>
          </div>
          <p className="text-[11px] text-slate-300 mt-0.5">
            Track how your professional presence is growing across companies & networks
          </p>
        </div>

        {/* Time Filters Pills */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10 self-start md:self-auto">
          {TIME_FILTERS.map((tf) => (
            <button
              key={tf}
              onClick={() => {
                setSelectedTimeFilter(tf);
                setHoveredPoint(null);
              }}
              className={`px-2.5 py-1 rounded-xl text-[10.5px] font-bold transition-all ${
                selectedTimeFilter === tf
                  ? 'bg-white/20 text-white shadow-md border border-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {Object.entries(METRIC_CONFIG).map(([key, cfg]) => {
          const isSelected = selectedMetric === key;
          return (
            <button
              key={key}
              onClick={() => {
                setSelectedMetric(key);
                setHoveredPoint(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border ${
                isSelected
                  ? 'bg-white/15 text-white border-white/25 shadow-lg'
                  : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-slate-200'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: cfg.color }}
              />
              <span>{cfg.label}</span>
            </button>
          );
        })}
      </div>

      {/* Animated SVG Graph Container */}
      <div className="relative w-full h-64 bg-black/20 rounded-2xl border border-white/10 p-2 overflow-hidden flex flex-col justify-between">
        {/* Floating Tooltip */}
        <AnimatePresence>
          {hoveredPoint && (
            <motion.div
              initial={{ opacity: 0, y: 5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute z-20 pointer-events-none liquid-glass px-3 py-1.5 rounded-xl text-xs shadow-2xl border border-white/20 text-center"
              style={{
                left: `${(hoveredPoint.x / 640) * 100}%`,
                top: `${(hoveredPoint.y / 220) * 100 - 15}%`,
                transform: 'translate(-50%, -100%)',
              }}
            >
              <p className="text-[10px] text-slate-300 font-semibold">{hoveredPoint.date}</p>
              <p className="text-xs font-black text-white">
                {hoveredPoint.value.toLocaleString()} {METRIC_CONFIG[selectedMetric]?.unit}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State Banner Overlay for 0-activity accounts */}
        {!hasActivity && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 text-center bg-black/30 backdrop-blur-[2px]">
            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15 mb-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <h4 className="font-bold text-white text-sm">Your performance journey starts here</h4>
            <p className="text-xs text-slate-300 max-w-sm mt-0.5">
              Create your first engineering post or connect with peers to start generating profile views and reach.
            </p>
          </div>
        )}

        {/* SVG Visualization */}
        <svg
          viewBox="0 0 640 220"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={activeColor} stopOpacity="0.45" />
              <stop offset="70%" stopColor={activeColor} stopOpacity="0.08" />
              <stop offset="100%" stopColor={activeColor} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="32" y1="40" x2="608" y2="40" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <line x1="32" y1="95" x2="608" y2="95" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <line x1="32" y1="150" x2="608" y2="150" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <line x1="32" y1="195" x2="608" y2="195" stroke="rgba(255,255,255,0.12)" />

          {/* Gradient Fill Below Line */}
          <motion.path
            key={`area-${selectedMetric}-${selectedTimeFilter}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            d={areaD}
            fill="url(#chartGradient)"
          />

          {/* Animated Line Stroke */}
          <motion.path
            key={`line-${selectedMetric}-${selectedTimeFilter}`}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
            d={pathD}
            fill="none"
            stroke={activeColor}
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Interactive Data Points */}
          {points.map((pt, idx) => {
            const isHovered = hoveredPoint?.date === pt.date;
            return (
              <g key={idx}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="16"
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? '6' : '3.5'}
                  fill="#ffffff"
                  stroke={activeColor}
                  strokeWidth={isHovered ? '3' : '2'}
                  className="transition-all duration-150 pointer-events-none"
                />
              </g>
            );
          })}
        </svg>

        {/* X-Axis Date Labels */}
        <div className="flex justify-between items-center px-4 pt-1 text-[9.5px] text-slate-400 font-semibold border-t border-white/5">
          {points.map((pt, idx) => (
            <span
              key={idx}
              className={`transition-colors ${
                hoveredPoint?.date === pt.date ? 'text-white font-bold' : ''
              }`}
            >
              {pt.date}
            </span>
          ))}
        </div>
      </div>

      {/* Summary Footer */}
      <div className="flex items-center justify-between text-[10.5px] text-slate-300 pt-1">
        <span className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span>{hasActivity ? 'Average weekly velocity: +19.2%' : 'Ready to record activity'}</span>
        </span>
        <span className="text-slate-400 text-[10px]">User-specific persistent metrics</span>
      </div>
    </div>
  );
};

export default PerformanceGraph;
