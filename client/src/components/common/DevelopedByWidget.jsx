import React from 'react';
import { Sparkles, Code2, Users2, ShieldCheck, Laptop } from 'lucide-react';

const TEAM_MEMBERS = [
  {
    name: 'Ajay P K',
    initials: 'AP',
    color: 'from-blue-600 to-indigo-600',
  },
  {
    name: 'Akash K J',
    initials: 'AK',
    color: 'from-teal-600 to-emerald-600',
  },
  {
    name: 'Akshay Guptha L',
    initials: 'AG',
    color: 'from-purple-600 to-pink-600',
  },
  {
    name: 'Akshay Ravi',
    initials: 'AR',
    color: 'from-cyan-600 to-blue-600',
  },
];

const DevelopedByWidget = () => {
  return (
    <div className="liquid-glass p-4 rounded-2xl border border-white/15 shadow-xl transition-all hover:border-white/25">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-white/10">
        <div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <h3 className="text-xs font-black tracking-wider text-white uppercase">
              Developed By
            </h3>
          </div>
          <p className="text-[10px] text-slate-300 font-medium mt-0.5">
            CareerLink Project Team
          </p>
        </div>

        <div className="p-1.5 rounded-xl bg-white/10 border border-white/10 text-pro-300">
          <Code2 className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Team Members List */}
      <div className="space-y-2">
        {TEAM_MEMBERS.map((member, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 transition-all group"
          >
            {/* Small Circular Avatar */}
            <div
              className={`w-7 h-7 rounded-full bg-gradient-to-tr ${member.color} flex items-center justify-center text-white font-bold text-[10px] shadow-sm shrink-0 group-hover:scale-105 transition-transform`}
            >
              {member.initials}
            </div>

            {/* Member Name */}
            <div className="flex-1 overflow-hidden">
              <p className="font-semibold text-xs text-white group-hover:text-pro-300 transition-colors truncate">
                {member.name}
              </p>
            </div>

            {/* Subtle Team Icon */}
            <div className="text-slate-400 group-hover:text-white transition-colors">
              <Laptop className="w-3 h-3" />
            </div>
          </div>
        ))}
      </div>

      {/* Footer Tag */}
      <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[9.5px] text-slate-400">
        <span>Full-Stack Platform</span>
        <span className="text-pro-400 font-semibold">v1.0.0</span>
      </div>
    </div>
  );
};

export default DevelopedByWidget;
