/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LogoProps {
  variant?: 'main' | 'icon' | 'horizontal';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSlogan?: boolean;
  className?: string;
}

export const LogoIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 36,
  className = '',
}) => {
  return (
    <div
      className={`relative flex items-center justify-center shrink-0 rounded-2xl shadow-sm ${className}`}
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #75C9C0 0%, #6575C9 100%)',
      }}
    >
      {/* Clock + Checkmark Geometric Icon */}
      <svg
        width={Math.round(size * 0.64)}
        height={Math.round(size * 0.64)}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-white drop-shadow-xs"
      >
        {/* Clock circle track */}
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeDasharray="46"
          strokeDashoffset="10"
          className="opacity-95"
        />
        {/* Hour markers (subtle dots at 12 and 9) */}
        <circle cx="12" cy="5.2" r="1.1" fill="currentColor" opacity="0.9" />
        <circle cx="5.2" cy="12" r="1.1" fill="currentColor" opacity="0.9" />
        
        {/* Dynamic completion Checkmark / Clock Hand */}
        <path
          d="M8.5 12.3L11.2 15L17.5 8.7"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export const Logo: React.FC<LogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  showSlogan = false,
  className = '',
}) => {
  const iconSizes = {
    sm: 28,
    md: 36,
    lg: 44,
    xl: 56,
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  const iconPx = iconSizes[size];

  if (variant === 'icon') {
    return <LogoIcon size={iconPx} className={className} />;
  }

  if (variant === 'main') {
    // Vertical / Centered Logo with Icon on top and typography below
    return (
      <div className={`flex flex-col items-center text-center select-none ${className}`}>
        <LogoIcon size={iconPx * 1.25} />
        <div className="mt-2.5">
          <span className={`font-extrabold tracking-tight text-[#303642] dark:text-white ${textSizes[size]}`}>
            Deadline<span className="text-[#347F80] dark:text-[#75C9C0] font-black">Ku</span>
          </span>
          {showSlogan && (
            <p className="text-[11px] font-medium text-[#858B98] tracking-tight mt-0.5">
              Your Tasks, Your Pace, Your Progress
            </p>
          )}
        </div>
      </div>
    );
  }

  // Default: Horizontal Logo (icon on left, text on right)
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <LogoIcon size={iconPx} />
      <div className="leading-tight">
        <div className="flex items-center gap-1.5">
          <span className={`font-extrabold tracking-tight text-[#303642] dark:text-white ${textSizes[size]}`}>
            Deadline<span className="text-[#347F80] dark:text-[#75C9C0] font-black">Ku</span>
          </span>
        </div>
        {showSlogan ? (
          <p className="text-[10px] font-medium text-[#858B98] dark:text-[#B9BFF0]/80 tracking-tight">
            Your Tasks, Your Pace, Your Progress
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default Logo;
