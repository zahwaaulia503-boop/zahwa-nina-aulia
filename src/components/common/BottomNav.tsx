/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Plus,
  Target,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, setIsQuickCaptureOpen } = useApp();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#1A2130]/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-[#28334A] px-3 py-1.5 flex items-center justify-around shadow-lg transition-colors">
      {/* 1. Beranda */}
      <button
        onClick={() => setActiveTab('dashboard')}
        className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
          activeTab === 'dashboard'
            ? 'text-[#347F80] dark:text-[#75C9C0] font-bold'
            : 'text-[#858B98] dark:text-slate-500'
        }`}
      >
        <LayoutDashboard className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Beranda</span>
      </button>

      {/* 2. Aktivitas */}
      <button
        onClick={() => setActiveTab('tasks')}
        className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
          activeTab === 'tasks'
            ? 'text-[#347F80] dark:text-[#75C9C0] font-bold'
            : 'text-[#858B98] dark:text-slate-500'
        }`}
      >
        <CheckSquare className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Aktivitas</span>
      </button>

      {/* 3. Center Floating Add Button with Teal & Indigo Gradient */}
      <div className="-mt-5">
        <button
          onClick={() => setIsQuickCaptureOpen(true)}
          className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#75C9C0] to-[#6575C9] text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer ring-4 ring-[#F5F6F8] dark:ring-[#1A2130]"
          aria-label="Tambah Aktivitas Cepat"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* 4. Kalender */}
      <button
        onClick={() => setActiveTab('calendar')}
        className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
          activeTab === 'calendar'
            ? 'text-[#347F80] dark:text-[#75C9C0] font-bold'
            : 'text-[#858B98] dark:text-slate-500'
        }`}
      >
        <Calendar className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Kalender</span>
      </button>

      {/* 5. Fokus */}
      <button
        onClick={() => setActiveTab('focus')}
        className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
          activeTab === 'focus'
            ? 'text-[#347F80] dark:text-[#75C9C0] font-bold'
            : 'text-[#858B98] dark:text-slate-500'
        }`}
      >
        <Target className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Fokus</span>
      </button>
    </div>
  );
};
