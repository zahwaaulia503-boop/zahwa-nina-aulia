/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Logo } from './Logo';

interface SplashScreenProps {
  onFinish?: () => void;
  forceShow?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, forceShow = false }) => {
  const [visible, setVisible] = useState(() => {
    if (forceShow) return true;
    // Show splash once on initial session load
    const hasSeen = sessionStorage.getItem('deadlineku_splash_seen');
    return !hasSeen;
  });

  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!visible) return;

    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setVisible(false);
        sessionStorage.setItem('deadlineku_splash_seen', 'true');
        onFinish?.();
      }, 500);
    }, 1200);

    return () => clearTimeout(timer);
  }, [visible, onFinish]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F5F6F8] dark:bg-[#1A2130] transition-opacity duration-500 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
        <Logo variant="main" size="xl" showSlogan={true} />
        
        {/* Loading subtle indicator in Teal & Indigo */}
        <div className="mt-8 flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#75C9C0] animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-[#6575C9] animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-[#347F80] animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};
