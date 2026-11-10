/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Flame,
  Plus,
  Check,
  Sparkles,
  TrendingUp,
  Award,
  BookOpen,
  Activity,
  Droplets,
  Calendar,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Habit, Category } from '../types';

export const HabitsPage: React.FC = () => {
  const { habits, categories, toggleHabitDay, addHabit } = useApp();

  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCatId, setNewCatId] = useState(categories[0]?.id || 'cat-kesehatan');

  // Generate last 7 days list for check-in dots
  const last7Days: { dateStr: string; label: string; dayNum: number }[] = [];
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    last7Days.push({
      dateStr,
      label: i === 0 ? 'Hari Ini' : dayNames[d.getDay()],
      dayNum: d.getDate(),
    });
  }

  const categoryMap = new Map<string, Category>(categories.map((c: Category) => [c.id, c]));

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addHabit({
      title: newTitle.trim(),
      categoryId: newCatId,
      frequency: 'daily',
      targetDaysPerWeek: 7,
    });

    setNewTitle('');
    setIsAddHabitOpen(false);
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#303642] dark:text-white flex items-center gap-2">
            <Flame className="w-6 h-6 text-[#F2B56B] fill-[#F2B56B]" />
            <span>Pelacak Kebiasaan (Habit Tracker)</span>
          </h1>
          <p className="text-xs text-[#858B98]">
            Bentuk rutinitas positif secara bertahap tanpa rasa bersalah dan rayakan konsistensi Anda
          </p>
        </div>

        <button
          onClick={() => setIsAddHabitOpen(true)}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-[#75C9C0] to-[#6575C9] text-white hover:opacity-95 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kebiasaan</span>
        </button>
      </div>

      {/* Habits List Card */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#28334A] border border-slate-200/80 dark:border-[#36435E] shadow-sm space-y-4">
        {/* Days Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#36435E]">
          <span className="text-xs font-bold text-[#303642] dark:text-white">
            Daftar Rutinitas Harian ({habits.length})
          </span>

          <div className="hidden sm:flex items-center gap-3 pr-2">
            {last7Days.map((d) => (
              <div key={d.dateStr} className="w-8 text-center">
                <span className="text-[10px] font-bold text-[#858B98] block">{d.label}</span>
                <span className="text-xs font-black text-[#303642] dark:text-white">
                  {d.dayNum}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Habit Rows */}
        <div className="space-y-3">
          {habits.map((habit) => {
            const cat = categoryMap.get(habit.categoryId);

            return (
              <div
                key={habit.id}
                className="p-3.5 sm:p-4 rounded-3xl bg-[#F5F6F8] dark:bg-[#1A2130] border border-slate-200/60 dark:border-[#36435E] flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:border-[#75C9C0] transition-all"
              >
                {/* Habit Info */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs"
                    style={{
                      backgroundColor: `${cat?.color || '#75C9C0'}25`,
                      color: cat?.color || '#347F80',
                    }}
                  >
                    <Sparkles className="w-5 h-5" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#303642] dark:text-white">
                      {habit.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#858B98]">
                      <span className="flex items-center gap-1 font-bold text-[#F2B56B]">
                        <Flame className="w-3.5 h-3.5 fill-current" />
                        <span>Streak: {habit.streak} Hari</span>
                      </span>
                      <span>•</span>
                      <span>Terbaik: {habit.bestStreak} Hari</span>
                    </div>
                  </div>
                </div>

                {/* 7-Day Interactive Check-in Dots */}
                <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/50 dark:border-[#36435E]">
                  {last7Days.map((d) => {
                    const isDone = habit.completedDates.includes(d.dateStr);
                    const isToday = d.label === 'Hari Ini';

                    return (
                      <button
                        key={d.dateStr}
                        type="button"
                        onClick={() => toggleHabitDay(habit.id, d.dateStr)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                          isDone
                            ? 'bg-gradient-to-tr from-[#75C9C0] to-[#6575C9] text-white shadow-xs scale-105'
                            : isToday
                            ? 'bg-white dark:bg-[#28334A] text-slate-400 hover:bg-slate-100 border border-[#75C9C0]/50'
                            : 'bg-white/70 dark:bg-[#28334A]/60 text-slate-300 dark:text-slate-600 hover:bg-white'
                        }`}
                        title={`${d.dateStr}: ${isDone ? 'Selesai' : 'Belum'}`}
                      >
                        {isDone ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Positive Habit Insight */}
      <div className="p-4 rounded-3xl bg-[#A9DCD5]/20 border border-[#75C9C0]/30 text-xs text-[#303642] dark:text-[#F5F6F8] flex items-start gap-3">
        <Award className="w-5 h-5 text-[#347F80] dark:text-[#75C9C0] shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-[#347F80] dark:text-[#75C9C0]">Prinsip Konsistensi Bersahabat di DeadlineKu</p>
          <p className="text-[11px] text-[#858B98] mt-0.5">
            Jika ada satu hari terlewat, jangan merasa bersalah. Kuncinya adalah 'Never miss twice' — segera lakukan rutinitas kecil Anda hari ini dan pertahankan kebiasaan baik Anda.
          </p>
        </div>
      </div>

      {/* Add Habit Modal */}
      {isAddHabitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-[#28334A] rounded-3xl p-5 border border-slate-200 dark:border-[#36435E] shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-[#303642] dark:text-white">
              Tambah Kebiasaan Baru
            </h3>
            <form onSubmit={handleCreateHabit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#858B98] mb-1">
                  Nama Kebiasaan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Membaca 15 menit, Meditasi..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F5F6F8] dark:bg-[#1A2130] border border-slate-200 dark:border-[#36435E] rounded-xl outline-none focus:border-[#75C9C0] text-[#303642] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#858B98] mb-1">
                  Kategori
                </label>
                <select
                  value={newCatId}
                  onChange={(e) => setNewCatId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F5F6F8] dark:bg-[#1A2130] border border-slate-200 dark:border-[#36435E] rounded-xl outline-none text-[#303642] dark:text-white cursor-pointer"
                >
                  {categories.map((c: Category) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddHabitOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#858B98] hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-gradient-to-r from-[#75C9C0] to-[#6575C9] text-white rounded-xl shadow-xs"
                >
                  Simpan Kebiasaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
