/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Bell,
  Search,
  Sparkles,
  Camera,
  Moon,
  Sun,
  Plus,
  Check,
  Calendar,
  AlertTriangle,
  LogIn,
} from 'lucide-react';
import { Logo } from './Logo';
import { useApp } from '../../context/AppContext';

export const Header: React.FC = () => {
  const {
    userProfile,
    theme,
    toggleTheme,
    notifications,
    unreadNotifsCount,
    markNotificationRead,
    markAllNotificationsRead,
    setIsQuickCaptureOpen,
    setIsAIScanOpen,
    setIsAuthModalOpen,
    setActiveTab,
    setTaskDetailModalId,
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveTab('tasks');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3 bg-white/95 dark:bg-[#1A2130]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-[#28334A] transition-colors">
      {/* Brand Logo (Visible on mobile/tablet or when sidebar collapsed) */}
      <div className="flex items-center gap-3">
        <div
          onClick={() => setActiveTab('dashboard')}
          className="cursor-pointer select-none md:hidden"
        >
          <Logo variant="horizontal" size="sm" showSlogan={false} />
        </div>
      </div>

      {/* Search Bar (Desktop) */}
      <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#858B98]" />
          <input
            type="text"
            placeholder="Cari aktivitas, tagihan, proyek, catatan... (Enter)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#F5F6F8] dark:bg-[#28334A]/70 border border-transparent focus:border-[#75C9C0] dark:focus:border-[#6575C9] rounded-2xl outline-none text-[#303642] dark:text-[#F5F6F8] transition-all placeholder:text-[#858B98]"
          />
        </form>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* AI Scanner Button */}
        <button
          onClick={() => setIsAIScanOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-[#75C9C0]/15 to-[#6575C9]/15 hover:from-[#75C9C0]/25 hover:to-[#6575C9]/25 text-[#28334A] dark:text-[#E4E5FA] border border-[#75C9C0]/40 dark:border-[#6575C9]/40 transition-all shadow-xs cursor-pointer active:scale-95"
          title="Pindai tugas dari foto / tangkapan layar"
        >
          <Camera className="w-3.5 h-3.5 text-[#347F80] dark:text-[#75C9C0]" />
          <span className="hidden sm:inline">AI Scanner</span>
        </button>

        {/* Quick Add Button */}
        <button
          onClick={() => setIsQuickCaptureOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-[#75C9C0] to-[#6575C9] text-white hover:opacity-95 transition-all shadow-xs cursor-pointer active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Aktivitas Baru</span>
        </button>

        {/* Dark / Light Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-[#858B98] hover:text-[#303642] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#28334A] transition-colors cursor-pointer"
          aria-label="Ganti Tema"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-[#F2B56B]" />
          ) : (
            <Moon className="w-4 h-4 text-[#6575C9]" />
          )}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-xl text-[#858B98] hover:text-[#303642] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#28334A] transition-colors cursor-pointer"
            aria-label="Pemberitahuan"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E98E91] ring-2 ring-white dark:ring-[#1A2130]" />
            )}
          </button>

          {/* Popover Menu */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#28334A] rounded-2xl shadow-2xl border border-slate-200/80 dark:border-[#36435E] py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100 dark:border-[#36435E]">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xs text-[#303642] dark:text-white">Pemberitahuan</h3>
                  {unreadNotifsCount > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#75C9C0]/20 text-[#347F80] dark:text-[#75C9C0]">
                      {unreadNotifsCount} baru
                    </span>
                  )}
                </div>
                {unreadNotifsCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-[#858B98] hover:text-[#303642] dark:hover:text-white cursor-pointer"
                  >
                    Tandai dibaca
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-[#36435E]">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#858B98]">
                    Tidak ada pemberitahuan baru
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotificationRead(notif.id);
                        if (notif.actionTaskId) {
                          setTaskDetailModalId(notif.actionTaskId);
                          setIsNotifOpen(false);
                        }
                      }}
                      className={`p-3.5 hover:bg-[#F5F6F8] dark:hover:bg-[#1A2130]/60 transition-colors cursor-pointer flex gap-3 ${
                        !notif.read ? 'bg-[#75C9C0]/10 dark:bg-[#75C9C0]/10' : ''
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {notif.type === 'deadline' && (
                          <div className="w-7 h-7 rounded-lg bg-[#E98E91]/20 text-[#E98E91] flex items-center justify-center">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {notif.type === 'reschedule' && (
                          <div className="w-7 h-7 rounded-lg bg-[#F2B56B]/20 text-[#F2B56B] flex items-center justify-center">
                            <Calendar className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {notif.type === 'achievement' && (
                          <div className="w-7 h-7 rounded-lg bg-[#75C9C0]/20 text-[#347F80] dark:text-[#75C9C0] flex items-center justify-center">
                            <Sparkles className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {!['deadline', 'reschedule', 'achievement'].includes(notif.type) && (
                          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 flex items-center justify-center">
                            <Bell className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-[#303642] dark:text-white truncate">
                            {notif.title}
                          </h4>
                          {!notif.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#6575C9]" />
                          )}
                        </div>
                        <p className="text-xs text-[#858B98] dark:text-[#B9BFF0]/80 mt-0.5 line-clamp-2">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Account / Login Trigger */}
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="p-1.5 rounded-xl text-[#858B98] hover:text-[#303642] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#28334A] transition-colors cursor-pointer"
          title="Masuk atau Daftar Akun"
        >
          <LogIn className="w-4 h-4" />
        </button>

        {/* User Mini Profile Avatar */}
        <button
          onClick={() => setActiveTab('profile')}
          className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-[#28334A] transition-colors cursor-pointer shrink-0"
          title="Buka Profil"
        >
          <img
            src={userProfile.avatar}
            alt={userProfile.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-[#75C9C0]/70"
          />
        </button>
      </div>
    </header>
  );
};
