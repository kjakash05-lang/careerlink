import React from 'react';
import { User, Shield, Briefcase, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import Modal from './Modal';
import Avatar from './Avatar';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const DEMO_PERSONAS = [
  {
    roleKey: 'akash',
    name: 'Akash K J',
    headline: 'Systems Architect & Full Stack Engineer (React · Node.js · Socket.IO)',
    role: 'Candidate',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30',
    avatarColor: 'from-indigo-600 to-purple-600',
    initials: 'AK',
  },
  {
    roleKey: 'ajay',
    name: 'Ajay P K',
    headline: 'Full Stack Software Engineer (React · Express · MongoDB)',
    role: 'Candidate',
    badgeColor: 'bg-pro-500/20 text-pro-300 border-pro-400/30',
    avatarColor: 'from-pro-600 to-blue-600',
    initials: 'AP',
  },
  {
    roleKey: 'akshay_g',
    name: 'Akshay Guptha L',
    headline: 'Backend & Data Engineer (Node.js · Java · Microservices)',
    role: 'Candidate',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
    avatarColor: 'from-emerald-600 to-teal-600',
    initials: 'AG',
  },
  {
    roleKey: 'akshay_r',
    name: 'Akshay Ravi',
    headline: 'Frontend & UI/UX Engineer (React · Tailwind CSS · Framer Motion)',
    role: 'Candidate',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
    avatarColor: 'from-amber-600 to-orange-600',
    initials: 'AR',
  },
  {
    roleKey: 'candidate',
    name: 'Alex Rivera',
    headline: 'Senior Full Stack Engineer (React · Node.js · TypeScript)',
    role: 'Candidate',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
    avatarColor: 'from-blue-600 to-indigo-600',
    initials: 'AR',
  },
  {
    roleKey: 'recruiter',
    name: 'Elena Rostova',
    headline: 'Talent Acquisition Partner at NovaTech Systems',
    role: 'Recruiter',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
    avatarColor: 'from-purple-600 to-pink-600',
    initials: 'ER',
  },
];

const SwitchAccountModal = ({ isOpen, onClose }) => {
  const { user, profile, demoLogin } = useAuth();
  const { showToast } = useNotifications();

  const handleSelectAccount = async (roleKey, name) => {
    try {
      await demoLogin(roleKey);
      showToast(`Switched account to ${name}`, 'success');
      onClose();
    } catch (err) {
      showToast('Could not switch account', 'error');
    }
  };

  const currentDisplayName = profile?.fullName || user?.profile?.fullName || (user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '') || user?.email || 'Member';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Switch CareerLink Account" maxWidth="max-w-lg">
      <div className="space-y-4 text-xs">
        {/* Current Active Account Section */}
        <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15">
          <p className="text-[10px] uppercase font-black tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Currently Active Account</span>
          </p>
          <div className="flex items-center gap-3">
            <Avatar src={profile?.avatar} alt={currentDisplayName} size="md" />
            <div className="flex-1 overflow-hidden">
              <p className="font-black text-white text-sm truncate">{currentDisplayName}</p>
              <p className="text-[11px] text-slate-300 truncate">
                {profile?.headline || (user?.role === 'recruiter' ? 'Recruiter' : 'Candidate')}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white/15 text-pro-300 border border-white/20">
                  {user?.role}
                </span>
                <span className="text-[10px] text-slate-400 truncate">{user?.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Available Personas List */}
        <div>
          <p className="text-[10px] uppercase font-black tracking-wider text-slate-400 mb-2 px-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Select Account to Switch</span>
          </p>

          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            {DEMO_PERSONAS.map((persona) => {
              const isCurrent = user?.email?.toLowerCase().includes(persona.name.split(' ')[0].toLowerCase());
              return (
                <div
                  key={persona.roleKey}
                  className={`p-3 rounded-2xl transition-all border flex items-center justify-between gap-3 ${
                    isCurrent
                      ? 'bg-pro-600/15 border-pro-400/40'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden flex-1">
                    <div
                      className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${persona.avatarColor} flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm`}
                    >
                      {persona.initials}
                    </div>
                    <div className="overflow-hidden flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-white text-xs truncate">{persona.name}</p>
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[8.5px] font-extrabold uppercase border ${persona.badgeColor}`}
                        >
                          {persona.role}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{persona.headline}</p>
                    </div>
                  </div>

                  <button
                    disabled={isCurrent}
                    onClick={() => handleSelectAccount(persona.roleKey, persona.name)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 shrink-0 ${
                      isCurrent
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                        : 'pro-btn-primary hover:scale-105 active:scale-95'
                    }`}
                  >
                    <span>{isCurrent ? 'Active' : 'Switch'}</span>
                    {!isCurrent && <ArrowRight className="w-3 h-3" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SwitchAccountModal;
