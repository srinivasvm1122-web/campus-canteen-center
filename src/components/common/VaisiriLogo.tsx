import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  withContainer?: boolean;
}

export const CampusLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  withContainer = false,
}) => {
  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const currentSize = sizeMap[size];

  // Universal Modern Smart Campus Canteen Emblem
  // Features: Cloche food cover, chef/dining fork-spoon, and lightning speed indicator
  const svgLogo = (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full object-contain"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="canteenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="50%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
        <linearGradient id="warmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>

      {/* Outer rounded badge */}
      <rect x="6" y="6" width="88" height="88" rx="24" fill="url(#canteenGrad)" />
      
      {/* Inner subtle glow */}
      <rect x="8" y="8" width="84" height="84" rx="22" stroke="white" strokeOpacity="0.25" strokeWidth="2" />

      {/* Cloche dome (Food platter lid) */}
      <path
        d="M24 62 C24 40, 76 40, 76 62 Z"
        fill="white"
        fillOpacity="0.95"
      />

      {/* Cloche handle */}
      <circle cx="50" cy="34" r="5" fill="white" />
      <rect x="48" y="38" width="4" height="4" fill="white" />

      {/* Serving tray base plate */}
      <rect x="18" y="65" width="64" height="6" rx="3" fill="url(#warmGrad)" />

      {/* Speed / Digital Token Lightning Bolt in Center */}
      <path
        d="M48 45 L43 54 L49 54 L46 62 L55 52 L49 52 Z"
        fill="url(#warmGrad)"
      />
    </svg>
  );

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${
        withContainer
          ? 'bg-white/95 rounded-2xl shadow-md border border-slate-200/80 p-1'
          : 'bg-white/95 rounded-xl shadow-xs p-0.5'
      } ${currentSize} ${className}`}
    >
      {svgLogo}
    </div>
  );
};

// Export alias for seamless backward compatibility
export const VaisiriLogo = CampusLogo;
