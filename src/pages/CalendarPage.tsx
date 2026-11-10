/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle,
  Tag,
  List,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Task, Category } from '../types';

export const CalendarPage: React.FC = () => {
  const {
    tasks,
    categories,
    setTaskDetailModalId,
    setIsQuickCaptureOpen,
  } = useApp();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');

  const categoryMap = new Map<string, Category>(categories.map((c: Category) => [c.id, c]));

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const todayDate = () => {
    setCurrentDate(new Date());
  };

  const monthYearLabel = new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(currentDate);

  // Month Matrix calculation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Create grid cells (42 cells: 6 weeks * 7 days)
  const cells: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

  // Previous month trailing days
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const dObj = new Date(year, month - 1, d);
    cells.push({
      dateStr: dObj.toISOString().split('T')[0],
      dayNum: d,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const dObj = new Date(year, month, i);
    cells.push({
      dateStr: dObj.toISOString().split('T')[0],
      dayNum: i,
      isCurrentMonth: true,
    });
  }

  // Next month leading days
  const remainingCells = 42 - cells.length;
  for (let i = 1; i <= remainingCells; i++) {
    const dObj = new Date(year, month + 1, i);
    cells.push({
      dateStr: dObj.toISOString().split('T')[0],
      dayNum: i,
      isCurrentMonth: false,
    });
  }

  const todayStr = new Date().toISOString().split('T')[0];

  // Group tasks by dueDate
  const tasksByDate = new Map<string, Task[]>();
  tasks.forEach((t) => {
    if (t.dueDate) {
      const arr = tasksByDate.get(t.dueDate) || [];
      arr.push(t);
      tasksByDate.set(t.dueDate, arr);
    }
  });

  return (
    <div className="space-y-5 pb-20 animate-in fade-in duration-300">
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#75C9C0]/20 flex items-center justify-center text-[#347F80] dark:text-[#75C9C0]">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#303642] dark:text-white capitalize">
              {monthYearLabel}
            </h1>
            <p className="text-xs text-[#858B98]">
              Pantau tenggat waktu dan deteksi jadwal bertabrakan secara visual
            </p>
          </div>
        </div>

        {/* View mode & Navigation buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* View toggle */}
          <div className="flex items-center bg-white dark:bg-[#28334A] border border-slate-200 dark:border-[#36435E] p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                viewMode === 'month'
                  ? 'bg-gradient-to-r from-[#75C9C0] to-[#6575C9] text-white shadow-xs'
                  : 'text-[#858B98] hover:text-[#303642] dark:hover:text-white'
              }`}
            >
              Bulanan
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                viewMode === 'agenda'
                  ? 'bg-gradient-to-r from-[#75C9C0] to-[#6575C9] text-white shadow-xs'
                  : 'text-[#858B98] hover:text-[#303642] dark:hover:text-white'
              }`}
            >
              Agenda
            </button>
          </div>

          <button
            onClick={todayDate}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-[#28334A] border border-slate-200 dark:border-[#36435E] text-[#303642] dark:text-white hover:bg-[#E4E5FA]/50 cursor-pointer"
          >
            Hari Ini
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-xl bg-white dark:bg-[#28334A] border border-slate-200 dark:border-[#36435E] text-[#858B98] hover:text-[#303642] dark:hover:text-white cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-xl bg-white dark:bg-[#28334A] border border-slate-200 dark:border-[#36435E] text-[#858B98] hover:text-[#303642] dark:hover:text-white cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsQuickCaptureOpen(true)}
            className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-[#75C9C0] to-[#6575C9] text-white hover:opacity-95 cursor-pointer flex items-center gap-1 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tambah</span>
          </button>
        </div>
      </div>

      {/* Month View Grid */}
      {viewMode === 'month' ? (
        <div className="bg-white dark:bg-[#28334A] rounded-3xl border border-slate-200/80 dark:border-[#36435E] p-4 shadow-sm overflow-hidden">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-[#858B98] dark:text-[#B9BFF0] pb-3 border-b border-slate-100 dark:border-[#36435E]">
            <span>Minggu</span>
            <span>Senin</span>
            <span>Selasa</span>
            <span>Rabu</span>
            <span>Kamis</span>
            <span>Jumat</span>
            <span>Sabtu</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 pt-2">
            {cells.map((cell, idx) => {
              const dayTasks = tasksByDate.get(cell.dateStr) || [];
              const isToday = cell.dateStr === todayStr;
              const hasConflict = dayTasks.length >= 3;

              return (
                <div
                  key={idx}
                  className={`min-h-[90px] sm:min-h-[115px] p-1.5 sm:p-2 rounded-2xl border transition-all flex flex-col justify-between ${
                    cell.isCurrentMonth
                      ? 'bg-[#F5F6F8]/60 dark:bg-[#1A2130]/60 border-slate-100 dark:border-[#36435E]/60'
                      : 'bg-transparent border-transparent opacity-40'
                  } ${isToday ? 'ring-2 ring-[#75C9C0] bg-[#75C9C0]/10 dark:bg-[#75C9C0]/10' : ''}`}
                >
                  {/* Date number & Conflict indicator */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-black w-6 h-6 rounded-lg flex items-center justify-center ${
                        isToday
                          ? 'bg-gradient-to-r from-[#75C9C0] to-[#6575C9] text-white shadow-2xs'
                          : cell.isCurrentMonth
                          ? 'text-[#303642] dark:text-white'
                          : 'text-[#858B98]'
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {hasConflict && (
                      <span
                        title="Jadwal padat (≥3 tugas)"
                        className="p-0.5 rounded text-[#F2B56B]"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  {/* Task Pills */}
                  <div className="space-y-1 mt-1 flex-1 overflow-y-auto max-h-16 scrollbar-none">
                    {dayTasks.slice(0, 3).map((task) => {
                      const cat = categoryMap.get(task.categoryId);
                      return (
                        <div
                          key={task.id}
                          onClick={() => setTaskDetailModalId(task.id)}
                          className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold truncate cursor-pointer transition-transform hover:scale-102 flex items-center gap-1 shadow-2xs"
                          style={{
                            backgroundColor: `${cat?.color || '#75C9C0'}25`,
                            color: cat?.color || '#347F80',
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: cat?.color || '#347F80' }}
                          />
                          <span className="truncate">{task.title}</span>
                        </div>
                      );
                    })}
                    {dayTasks.length > 3 && (
                      <span className="text-[9px] font-bold text-[#858B98] block text-center">
                        +{dayTasks.length - 3} lagi
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Agenda View */
        <div className="space-y-4">
          {Array.from(tasksByDate.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([dateStr, dTasks]) => {
              const isToday = dateStr === todayStr;
              return (
                <div
                  key={dateStr}
                  className="p-4 rounded-3xl bg-white dark:bg-[#28334A] border border-slate-200/80 dark:border-[#36435E] space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#36435E]">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-xl ${
                          isToday
                            ? 'bg-gradient-to-r from-[#75C9C0] to-[#6575C9] text-white'
                            : 'bg-[#F5F6F8] dark:bg-[#1A2130] text-[#303642] dark:text-white'
                        }`}
                      >
                        {isToday ? 'Hari Ini' : dateStr}
                      </span>
                      <span className="text-xs text-[#858B98]">
                        {dTasks.length} aktivitas
                      </span>
                    </div>

                    {dTasks.length >= 3 && (
                      <span className="text-[11px] font-bold text-[#F2B56B] flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Jadwal Padat</span>
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {dTasks.map((t) => {
                      const cat = categoryMap.get(t.categoryId);
                      return (
                        <div
                          key={t.id}
                          onClick={() => setTaskDetailModalId(t.id)}
                          className="flex items-center justify-between p-2.5 rounded-2xl bg-[#F5F6F8] dark:bg-[#1A2130] hover:bg-[#E4E5FA]/50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: cat?.color || '#75C9C0' }}
                            />
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-[#303642] dark:text-white truncate">
                                {t.title}
                              </h4>
                              <span className="text-[11px] text-[#858B98]">
                                {cat?.name} • {t.dueTime || '17:00'} ({t.estimatedMinutes} menit)
                              </span>
                            </div>
                          </div>

                          <span className="text-xs text-[#858B98] font-bold shrink-0">
                            {t.status === 'completed' ? 'Selesai' : 'Belum Selesai'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};
