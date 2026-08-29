import React from 'react';

const Avatar = ({ src, alt = 'Avatar', size = 'md', className = '', online = false }) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-xs',
    lg: 'w-14 h-14 text-sm',
    xl: 'w-20 h-20 text-lg',
    '2xl': 'w-28 h-28 text-2xl',
  };

  const getInitials = (name) => {
    if (!name) return 'CL';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={`${sizeClasses[size] || sizeClasses.md} rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-xs`}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(alt)}&background=1d4ed8&color=fff`;
          }}
        />
      ) : (
        <div
          className={`${sizeClasses[size] || sizeClasses.md} rounded-full bg-gradient-to-tr from-pro-700 via-pro-600 to-indigo-600 text-white font-extrabold flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-xs`}
        >
          {getInitials(alt)}
        </div>
      )}
      {online && (
        <span className="absolute bottom-0 right-0 block w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
      )}
    </div>
  );
};

export default Avatar;
