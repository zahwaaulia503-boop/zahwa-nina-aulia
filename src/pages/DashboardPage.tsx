/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle,
  Clock,
  AlertTriangle,
  Play,
  ArrowRight,
  Sparkles,
  Target,
  RefreshCw,
  Plus,
  Flame,
  Check,
  TrendingUp,
  AlertCircle,
  Compass,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SmartEngine } from '../lib/smartEngine';
import { Category, Task } from '../types';

export const DashboardPage: React.FC = () => {
  const {
    tasks,
    categories,
    userProfile,
    focusSessions,
    setActiveTab,
    setIsQuickCaptureOpen,
    setIsRescheduleOpen,
    setIsAutoSchedulerOpen,
    setTaskDetailModalId,
    toggleTaskComplete,
  } = useApp();

  const today = new Date().toISOString().split('T')[0];

  // Indonesian date formatter
  const dateFormatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  // Metrics
  const todayTasks = tasks.filter((t) => t.dueDate === today);
  const completedTodayTasks = todayTasks.filter((t) => t.status === 'completed');
  const pendingTasks = tasks.filter((t) => t.status === 'todo' || t.status === 'in_progress');
  const overdueTasks = tasks.filter(
    (t) => t.status !== 'completed' && t.dueDate && t.dueDate < today
  );

  // Today's Focus (Top 3 urgent/high tasks for today or overdue)
  const focusCandidates = [...tasks]
    .filter((t) => t.status !== 'completed')
    .sort((a, b) => {
      const isAOverdue = a.dueDate && a.dueDate < today ? 1 : 0;
      const isBOverdue = b.dueDate && b.dueDate < today ? 1 : 0;
      if (isAOverdue !== isBOverdue) return isBOverdue - isAOverdue;

      const pRank: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
      if (pRank[b.priority] !== pRank[a.priority]) {
        return pRank[b.priority] - pRank[a.priority];
      }

      return (a.dueDate || '9999').localeCompare(b.dueDate || '9999');
    })
    .slice(0, 3);

  // Smart Workload Radar
  const workload = SmartEngine.analyzeWorkload(tasks, categories);

  // Total Focus Time Today
  const focusTodayMinutes = focusSessions
    .filter((f) => f.completedAt.startsWith(today))
    .reduce((acc, curr) => acc + curr.durationMinutes, 0);

  // Nearest deadline
  const nearestTask = [...tasks]
    .filter((t) => t.status !== 'completed' && t.dueDate && t.dueDate >= today)
    .sort((a, b) => (a.dueDate! + (a.dueTime || '')).localeCompare(b.dueDate! + (b.dueTime || '')))[0];

  const categoryMap = new Map<string, Category>(categories.map((c: Category) => [c.id, c]));

  const completionPercent =
    todayTasks.length > 0
      ? Math.round((completedTodayTasks.length / todayTasks.length) * 100)
      : 100;

  // Mini Calendar Widget State (Current 7-day strip)
  const currentWeekDays: { dateStr: string; dayName: string; dayNum: number; isToday: boolean; hasTasks: boolean }[] = [];
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Start on Sunday

  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const dStr = d.toISOString().split('T')[0];
    currentWeekDays.push({
      dateStr: dStr,
      dayName: dayNames[d.getDay()],
      dayNum: d.getDate(),
      isToday: dStr === today,
      hasTasks: tasks.some((t) => t.dueDate === dStr && t.status !== 'completed'),
    });
  }

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Top Banner: Modern Teal & Indigo Identity */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#28334A] via-[#1E273A] to-[#28334A] text-white shadow-xl border border-slate-700/50">
        {/* Subtle decorative teal and indigo ambient glows */}
        <div className="absolute -top-16 -right-16 w-60 h-60 rounded-full bg-[#75C9C0]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-60 h-60 rounded-full bg-[#6575C9]/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#A9DCD5]">
              <CalendarIcon className="w-3.5 h-3.5 text-[#75C9C0]" />
              <span>{dateFormatted}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1 text-white">
              {getGreeting()},{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#75C9C0] to-[#B9BFF0]">
                {userProfile.name}
              </span>{' '}
              ✨
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-lg leading-relaxed">
              {overdueTasks.length > 0
                ? `Terdapat ${overdueTasks.length} aktivitas yang memerlukan perhatian Anda. Gunakan Smart Reschedule untuk menata ulang dengan santai.`
                : 'Semua ritme aktivitas Anda berjalan terkendali. Siap memulai fokus hari ini?'}
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 mt-5">
              <button
                onClick={() => setActiveTab('focus')}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-[#75C9C0] to-[#6575C9] text-white hover:opacity-95 transition-all flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Mulai Fokus</span>
              </button>

              <button
                onClick={() => setIsQuickCaptureOpen(true)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all flex items-center gap-1.5 border border-white/15 cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Aktivitas</span>
              </button>

              {overdueTasks.length > 0 && (
                <button
                  onClick={() => setIsRescheduleOpen(true)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-[#F2B56B]/20 hover:bg-[#F2B56B]/30 text-[#F2B56B] border border-[#F2B56B]/40 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Atur Ulang Jadwal ({overdueTasks.length})</span>
                </button>
              )}
            </div>
          </div>

          {/* Productivity Stats Badge */}
          <div className="flex items-center gap-4 bg-white/10 dark:bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/15 shrink-0 shadow-inner">
            <div className="text-center">
              <div className="text-2xl font-black text-[#75C9C0]">{completionPercent}%</div>
              <span className="text-[10px] text-slate-300 uppercase tracking-wider font-bold">
                Produktivitas
              </span>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-black text-[#B9BFF0]">
                {Math.round((focusTodayMinutes / 60) * 10) / 10}h
              </div>
              <span className="text-[10px] text-slate-300 uppercase tracking-wider font-bold">
                Waktu Fokus
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Key Metric Cards in Teal & Indigo styling */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Hari Ini (Teal accent) */}
        <div
          onClick={() => setActiveTab('tasks')}
          className="p-4 rounded-3xl bg-white dark:bg-[#28334A] border border-slate-200/80 dark:border-[#36435E] hover:border-[#75C9C0] dark:hover:border-[#75C9C0] transition-all shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#858B98] dark:text-[#B9BFF0]">Hari Ini</span>
            <div className="w-8 h-8 rounded-xl bg-[#75C9C0]/20 text-[#347F80] dark:text-[#75C9C0] flex items-center justify-center group-hover:scale-105 transition-transform">
              <CalendarIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-[#303642] dark:text-white">
            {todayTasks.length}
          </div>
          <span className="text-[11px] text-[#858B98]">Target aktivitas hari ini</span>
        </div>

        {/* 2. Selesai (Success Mint accent) */}
        <div
          onClick={() => setActiveTab('tasks')}
          className="p-4 rounded-3xl bg-white dark:bg-[#28334A] border border-slate-200/80 dark:border-[#36435E] hover:border-[#82BFA4] dark:hover:border-[#82BFA4] transition-all shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#858B98] dark:text-[#B9BFF0]">Selesai</span>
            <div className="w-8 h-8 rounded-xl bg-[#82BFA4]/20 text-[#82BFA4] flex items-center justify-center group-hover:scale-105 transition-transform">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-[#82BFA4]">
            {completedTodayTasks.length}
          </div>
          <span className="text-[11px] text-[#858B98]">Tuntas diselesaikan</span>
        </div>

        {/* 3. Tertunda (Indigo accent) */}
        <div
          onClick={() => setActiveTab('tasks')}
          className="p-4 rounded-3xl bg-white dark:bg-[#28334A] border border-slate-200/80 dark:border-[#36435E] hover:border-[#6575C9] dark:hover:border-[#6575C9] transition-all shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#858B98] dark:text-[#B9BFF0]">Tertunda</span>
            <div className="w-8 h-8 rounded-xl bg-[#6575C9]/20 text-[#6575C9] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-[#6575C9] dark:text-[#B9BFF0]">
            {pendingTasks.length}
          </div>
          <span className="text-[11px] text-[#858B98]">Dalam antrean pengerjaan</span>
        </div>

        {/* 4. Terlambat (Warning / Danger accent) */}
        <div
          onClick={() => setIsRescheduleOpen(true)}
          className={`p-4 rounded-3xl border transition-all shadow-xs cursor-pointer group ${
            overdueTasks.length > 0
              ? 'bg-[#E98E91]/10 border-[#E98E91]/40 dark:bg-[#E98E91]/15'
              : 'bg-white dark:bg-[#28334A] border-slate-200/80 dark:border-[#36435E]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#858B98] dark:text-[#B9BFF0]">Terlambat</span>
            <div className="w-8 h-8 rounded-xl bg-[#E98E91]/20 text-[#E98E91] flex items-center justify-center group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-[#E98E91]">
            {overdueTasks.length}
          </div>
          <span className="text-[11px] text-[#E98E91] font-medium">
            {overdueTasks.length > 0 ? 'Klik untuk atur ulang' : 'Tidak ada keterlambatan'}
          </span>
        </div>
      </div>

      {/* Mini Calendar Strip Widget */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#28334A] border border-slate-200/80 dark:border-[#36435E] shadow-sm">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#75C9C0]" />
            <h3 className="text-xs font-bold text-[#303642] dark:text-white">
              Kalender Mingguan
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('calendar')}
            className="text-[11px] font-bold text-[#347F80] dark:text-[#75C9C0] hover:underline"
          >
            Buka Kalender Lengkap →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {currentWeekDays.map((d) => (
            <div
              key={d.dateStr}
              onClick={() => setActiveTab('calendar')}
              className={`py-2 px-1 rounded-2xl text-center cursor-pointer transition-all ${
                d.isToday
                  ? 'bg-gradient-to-b from-[#75C9C0] to-[#6575C9] text-white shadow-sm'
                  : 'bg-[#F5F6F8] dark:bg-[#1A2130] text-[#303642] dark:text-white hover:bg-[#E4E5FA]/50'
              }`}
            >
              <span className={`text-[10px] font-bold block ${d.isToday ? 'text-white' : 'text-[#858B98]'}`}>
                {d.dayName}
              </span>
              <span className="text-sm font-black block mt-0.5">
                {d.dayNum}
              </span>
              {d.hasTasks && (
                <span
                  className={`w-1.5 h-1.5 rounded-full mx-auto mt-1 block ${
                    d.isToday ? 'bg-white' : 'bg-[#75C9C0]'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Today's Focus & Smart Workload Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Focus (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#75C9C0] animate-pulse" />
              <h2 className="text-base font-extrabold text-[#303642] dark:text-white">
                Fokus Hari Ini (Today's Focus)
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('tasks')}
              className="text-xs font-bold text-[#347F80] dark:text-[#75C9C0] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Semua Aktivitas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {focusCandidates.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-[#28334A] rounded-3xl border border-slate-200/80 dark:border-[#36435E]">
                <CheckCircle className="w-10 h-10 text-[#82BFA4] mx-auto mb-2" />
                <h3 className="text-sm font-bold text-[#303642] dark:text-white">
                  Semua Tugas Utama Telah Selesai!
                </h3>
                <p className="text-xs text-[#858B98] mt-1 max-w-sm mx-auto">
                  Kerja luar biasa! Anda telah menyelesaikan prioritas tertinggi hari ini.
                </p>
              </div>
            ) : (
              focusCandidates.map((task) => {
                const cat = categoryMap.get(task.categoryId);
                const prediction = SmartEngine.predictTaskDeadline(task);

                return (
                  <div
                    key={task.id}
                    className="p-4 rounded-3xl bg-white dark:bg-[#28334A] border border-slate-200/80 dark:border-[#36435E] hover:border-[#75C9C0] dark:hover:border-[#75C9C0] transition-all shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => toggleTaskComplete(task.id)}
                        className="mt-0.5 text-slate-300 hover:text-[#82BFA4] transition-colors cursor-pointer shrink-0"
                      >
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-500 hover:border-[#82BFA4] flex items-center justify-center" />
                      </button>

                      <div
                        onClick={() => setTaskDetailModalId(task.id)}
                        className="cursor-pointer flex-1 min-w-0"
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${cat?.color || '#75C9C0'}25`,
                              color: cat?.color || '#347F80',
                            }}
                          >
                            {cat?.name || 'Aktivitas'}
                          </span>

                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${prediction.color}20`,
                              color: prediction.color,
                            }}
                          >
                            {prediction.status}
                          </span>

                          {task.dueDate && (
                            <span className="text-[11px] text-[#858B98] dark:text-[#B9BFF0]">
                              Deadline: {task.dueDate === today ? 'Hari Ini' : task.dueDate} •{' '}
                              {task.dueTime || '17:00'}
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-[#303642] dark:text-white mt-1 group-hover:text-[#347F80] dark:group-hover:text-[#75C9C0] transition-colors truncate">
                          {task.title}
                        </h3>

                        {task.subtasks.length > 0 && (
                          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-[#858B98]">
                            <span className="font-medium">
                              Subtugas: {task.subtasks.filter((s) => s.completed).length}/
                              {task.subtasks.length}
                            </span>
                            <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#75C9C0] to-[#6575C9] rounded-full"
                                style={{
                                  width: `${
                                    (task.subtasks.filter((s) => s.completed).length /
                                      task.subtasks.length) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => setActiveTab('focus')}
                        className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#F5F6F8] hover:bg-[#E4E5FA] dark:bg-[#1A2130] dark:hover:bg-[#1A2130]/80 text-[#303642] dark:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current text-[#75C9C0]" />
                        <span>Fokus</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Nearest Deadline Highlight Card */}
          {nearestTask && (
            <div className="p-4 rounded-3xl bg-gradient-to-r from-[#75C9C0]/15 via-[#A9DCD5]/15 to-[#6575C9]/15 border border-[#75C9C0]/40 dark:border-[#36435E] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-white dark:bg-[#28334A] flex items-center justify-center text-[#347F80] dark:text-[#75C9C0] shadow-sm shrink-0">
                  <Sparkles className="w-5 h-5 text-[#75C9C0]" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#858B98]">
                    Tenggat Waktu Terdekat
                  </span>
                  <h4 className="text-xs font-bold text-[#303642] dark:text-white truncate">
                    {nearestTask.title}
                  </h4>
                  <span className="text-[11px] text-[#858B98]">
                    {nearestTask.dueDate} pukul {nearestTask.dueTime || '17:00'} ({nearestTask.estimatedMinutes} menit)
                  </span>
                </div>
              </div>

              <button
                onClick={() => setTaskDetailModalId(nearestTask.id)}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-[#28334A] hover:bg-slate-50 text-[#303642] dark:text-white shadow-xs cursor-pointer shrink-0"
              >
                Detail
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Smart Workload Radar Widget */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-[#303642] dark:text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#75C9C0]" />
              <span>Smart Workload Radar</span>
            </h2>
            <button
              onClick={() => setIsAutoSchedulerOpen(true)}
              className="text-xs font-bold text-[#347F80] dark:text-[#75C9C0] hover:underline"
            >
              Auto Jadwal
            </button>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-[#28334A] border border-slate-200/80 dark:border-[#36435E] shadow-sm space-y-4">
            {/* Radar Meter Gauge Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#36435E]">
              <div>
                <span className="text-xs text-[#858B98]">Status Kepadatan:</span>
                <div className="text-lg font-black mt-0.5" style={{ color: workload.color }}>
                  {workload.status}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#858B98]">Estimasi Beban:</span>
                <div className="text-base font-extrabold text-[#303642] dark:text-white">
                  {workload.totalEstimatedHours} Jam
                </div>
              </div>
            </div>

            {/* Daily Bars Visualizer in Teal & Indigo */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#858B98] block">
                Beban Jam 7 Hari ke Depan:
              </span>
              <div className="grid grid-cols-7 gap-1.5 pt-1">
                {workload.dailyDistribution.map((d, idx) => {
                  const maxH = 8;
                  const barHeight = Math.min(100, Math.round((d.hours / maxH) * 100));
                  const isCurrentDay = idx === 0;

                  return (
                    <div key={d.date} className="flex flex-col items-center gap-1 text-center">
                      <div className="w-full h-20 bg-[#F5F6F8] dark:bg-[#1A2130] rounded-xl p-1 flex items-end justify-center">
                        <div
                          className={`w-full rounded-lg transition-all duration-500 ${
                            isCurrentDay
                              ? 'bg-gradient-to-t from-[#6575C9] to-[#75C9C0]'
                              : 'bg-slate-300 dark:bg-slate-600'
                          }`}
                          style={{ height: `${Math.max(14, barHeight)}%` }}
                          title={`${d.dayName}: ${d.taskCount} tugas, ${d.hours} jam`}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-[#303642] dark:text-white truncate w-full">
                        {d.dayName}
                      </span>
                      <span className="text-[9px] text-[#858B98] font-semibold">
                        {d.hours}h
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Analysis Insight */}
            <div className="p-3.5 rounded-2xl bg-[#F5F6F8] dark:bg-[#1A2130] border border-slate-200/60 dark:border-[#36435E] text-xs space-y-1.5">
              <p className="text-[#303642] dark:text-slate-300 font-medium leading-relaxed">
                "{workload.analysisMessage}"
              </p>
              <p className="text-[11px] text-[#347F80] dark:text-[#75C9C0] font-bold">
                💡 Rekomendasi: {workload.recommendation}
              </p>
            </div>

            {/* Quick Auto Scheduler Trigger */}
            <button
              onClick={() => setIsAutoSchedulerOpen(true)}
              className="w-full py-2.5 text-xs font-bold rounded-2xl bg-gradient-to-r from-[#75C9C0] to-[#6575C9] text-white hover:opacity-95 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 active:scale-98"
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Optimalkan dengan Auto Scheduler</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
