/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Target,
  BarChart3,
  FolderKanban,
  Flame,
  Settings,
  CalendarClock,
  RefreshCw,
} from 'lucide-react';
import { Logo } from './Logo';
import { useApp } from '../../context/AppContext';
import { SmartEngine } from '../../lib/smartEngine';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    tasks,
    userProfile,
    setIsAutoSchedulerOpen,
    setIsRescheduleOpen,
  } = useApp();

  // Count overdue tasks
  const today = new Date().toISOString().split('T')[0];
  const overdueCount = tasks.filter(
    (t) => t.status !== 'completed' && t.dueDate && t.dueDate < today
  ).length;

  const { level, currentXp, nextLevelXp, progressPercent } = SmartEngine.calculateLevel(
    userProfile.xp
  );

  const navItems = [
    { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
    { id: 'tasks', label: 'Aktivitas', icon: CheckSquare, badge: tasks.filter(t => t.status !== 'completed').length },
    { id: 'calendar', label: 'Kalender', icon: Calendar },
    { id: 'focus', label: 'Ruang Fokus', icon: Target },
    { id: 'insights', label: 'Insight & Keseimbangan', icon: BarChart3 },
    { id: 'projects', label: 'Proyek & Kolaborasi', icon: FolderKanban },
    { id: 'habits', label: 'Pelacak Kebiasaan', icon: Flame },
    { id: 'profile', label: 'Profil & Pengaturan', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-white dark:bg-[#1A2130] backdrop-blur-md border-r border-slate-200/80 dark:border-[#28334A] p-4 select-none shrink-0 transition-colors">
      {/* Official Brand Logo */}
      <div
        onClick={() => setActiveTab('dashboard')}
        className="px-2 py-3 mb-4 cursor-pointer hover:opacity-95 transition-opacity"
      >
        <Logo variant="horizontal" size="md" showSlogan={true} />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#858B98] dark:text-[#B9BFF0]/70 px-3 py-1">
          Menu Utama
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#75C9C0] to-[#6575C9] text-white shadow-md'
                  : 'text-[#303642] dark:text-[#F5F6F8]/80 hover:bg-[#F5F6F8] dark:hover:bg-[#28334A] hover:text-[#347F80] dark:hover:text-[#75C9C0]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#858B98] dark:text-[#B9BFF0]'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-[#E4E5FA] dark:bg-[#28334A] text-[#6575C9] dark:text-[#75C9C0]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* AI & Smart Tools Section */}
        <div className="pt-4 mt-2 border-t border-slate-100 dark:border-[#28334A]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#858B98] dark:text-[#B9BFF0]/70 px-3 py-1">
            Fitur Cerdas
          </p>

          <button
            onClick={() => setIsAutoSchedulerOpen(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 mt-1 rounded-xl text-xs font-medium text-[#303642] dark:text-[#F5F6F8] hover:bg-[#A9DCD5]/20 dark:hover:bg-[#28334A] transition-all cursor-pointer group"
          >
            <div className="w-6 h-6 rounded-lg bg-[#75C9C0]/20 flex items-center justify-center text-[#347F80] dark:text-[#75C9C0] group-hover:scale-105 transition-transform">
              <CalendarClock className="w-3.5 h-3.5" />
            </div>
            <span>Auto Scheduler</span>
          </button>

          <button
            onClick={() => setIsRescheduleOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 mt-1 rounded-xl text-xs font-medium text-[#303642] dark:text-[#F5F6F8] hover:bg-[#F2B56B]/20 dark:hover:bg-[#28334A] transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-[#F2B56B]/25 flex items-center justify-center text-[#F2B56B] group-hover:scale-105 transition-transform">
                <RefreshCw className="w-3.5 h-3.5" />
              </div>
              <span>Smart Reschedule</span>
            </div>
            {overdueCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#E98E91]/20 text-[#E98E91]">
                {overdueCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Gamification Level Footer in Teal & Indigo */}
      <div className="mt-auto pt-3 border-t border-slate-100 dark:border-[#28334A]">
        <div className="bg-[#F5F6F8] dark:bg-[#28334A]/80 rounded-2xl p-3 border border-slate-200/60 dark:border-[#36435E]/60">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-lg bg-gradient-to-tr from-[#75C9C0] to-[#6575C9] text-white text-[10px] font-black shadow-2xs">
                L{level}
              </span>
              <span className="text-xs font-bold text-[#303642] dark:text-white">
                Level {level}
              </span>
            </div>
            <span className="text-[10px] font-semibold text-[#858B98]">
              {currentXp} / {nextLevelXp} XP
            </span>
          </div>

          {/* Teal & Indigo Progress Bar */}
          <div className="w-full h-1.5 bg-slate-200 dark:bg-[#1A2130] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#75C9C0] via-[#A9DCD5] to-[#6575C9] rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="text-[10px] text-[#858B98] mt-2 truncate">
            {userProfile.roleTitle}
          </p>
        </div>
      </div>
    </aside>
  );
};
