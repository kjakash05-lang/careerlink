import React, { useState } from 'react';

const GRADIENTS = [
  'from-pro-700 via-pro-600 to-indigo-600',
  'from-teal-600 via-emerald-600 to-cyan-700',
  'from-indigo-600 via-purple-600 to-pink-600',
  'from-blue-600 via-sky-600 to-teal-600',
  'from-violet-700 via-indigo-600 to-purple-800',
  'from-rose-600 via-pink-600 to-amber-600',
];

const getGradientForName = (name) => {
  if (!name) return GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENTS.length;
  return GRADIENTS[index];
};

const getInitials = (name) => {
  if (!name || !name.trim()) return 'CL';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const Avatar = ({ src, alt = 'Avatar', size = 'md', className = '', online = false }) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-xs',
    lg: 'w-14 h-14 text-sm',
    xl: 'w-20 h-20 text-lg',
    '2xl': 'w-28 h-28 text-2xl',
  };

  const initials = getInitials(alt);
  const gradientClass = getGradientForName(alt);

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      {src && !imgError ? (
        <img
          src={src}
          alt={alt}
          className={`${sizeClasses[size] || sizeClasses.md} rounded-full object-cover border border-white/15 shadow-md`}
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className={`${sizeClasses[size] || sizeClasses.md} rounded-full bg-gradient-to-tr ${gradientClass} text-white font-extrabold flex items-center justify-center border border-white/20 shadow-md select-none tracking-wider`}
        >
          {initials}
        </div>
      )}
      {online && (
        <span className="absolute bottom-0 right-0 block w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
      )}
    </div>
  );
};

export default Avatar;
