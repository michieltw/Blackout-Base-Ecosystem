import React from 'react';

interface TeamLogoProps {
  logo?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const TeamLogo: React.FC<TeamLogoProps> = ({
  logo = '',
  name = 'Team',
  size = 'md',
  className = '',
}) => {
  const isUrl = Boolean(logo && (logo.startsWith('http://') || logo.startsWith('https://') || logo.startsWith('/') || logo.includes('.')));
  const displayLogo = isUrl ? logo : (name ? name.charAt(0).toUpperCase() : 'T');

  const sizeClasses = {
    xs: 'w-5 h-5 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-2xl',
    xl: 'w-24 h-24 text-4xl',
  };

  const containerClasses = `inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden ${sizeClasses[size]} ${className}`;

  if (isUrl) {
    return (
      <img
        src={displayLogo}
        alt={`${name} Logo`}
        className={`${containerClasses} object-contain`}
        referrerPolicy="no-referrer"
      />
    );
  }

  // Fallback to text rendering with a clean background
  const bgColors = [
    'bg-slate-100 text-slate-900 border-slate-200',
    'bg-slate-900 text-white border-slate-900',
    'bg-white text-slate-900 border-slate-200',
    'bg-[#FFEFD5] text-slate-900 border-[#FFEFD5]',
    'bg-slate-100 text-slate-900 border-slate-200',
    'bg-slate-900 text-white border-slate-900',
    'bg-white text-slate-900 border-slate-200',
    'bg-[#FFEFD5] text-slate-900 border-[#FFEFD5]',
    'bg-slate-100 text-slate-900 border-slate-200',
    'bg-slate-900 text-white border-slate-900',
    'bg-white text-slate-900 border-slate-200',
    'bg-[#FFEFD5] text-slate-900 border-[#FFEFD5]',
    'bg-slate-100 text-slate-900 border-slate-200',
    'bg-slate-900 text-white border-slate-900',
    'bg-white text-slate-900 border-slate-200',
    'bg-[#FFEFD5] text-slate-900 border-[#FFEFD5]',
  ];
  // Simple hash for consistent colors
  const charCodeSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const bgColor = bgColors[charCodeSum % bgColors.length];

  return (
    <div className={`${containerClasses} border border-slate-200 font-extrabold ${bgColor}`}>
      {displayLogo}
    </div>
  );
};
