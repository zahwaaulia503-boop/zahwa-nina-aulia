/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Sparkles,
  Heart,
  CheckCircle,
  Clock,
  AlertTriangle,
  Award,
  Calendar,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SmartEngine } from '../lib/smartEngine';

export const InsightsPage: React.FC = () => {
  const { tasks, categories, focusSessions } = useApp();

  const balance = SmartEngine.analyzeLifeBalance(tasks, categories);
  const workload = SmartEngine.analyzeWorkload(tasks, categories);

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const totalCount = tasks.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100;

  const totalFocusHours =
    Math.round((focusSessions.reduce((acc, c) => acc + c.durationMinutes, 0) / 60) * 10) / 10;

  const recapMessage = `Minggu ini Anda telah mencatatkan ${totalCount} aktivitas, menyelesaikan ${completedCount} tugas dengan tingkat penyelesaian ${completionRate}%, serta mendedikasikan ${totalFocusHours} jam fokus penuh konsentrasi.`;

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Page Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-[#303642] dark:text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-[#75C9C0]" />
          <span>Productivity Insights & Life Balance</span>
        </h1>
        <p className="text-xs text-[#858B98]">
          Analisis objektif penggunaan waktu Anda untuk menjaga produktivitas yang sehat dan seimbang
        </p>
      </div>

      {/* Weekly Recap Card with Modern Teal & Indigo styling */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-[#28334A] via-[#1E273A] to-[#28334A] text-white shadow-xl space-y-3 border border-slate-700/60 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#75C9C0]/15 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-[#6575C9]/15 blur-2xl pointer-events-none" />

        <div className="flex items-center gap-2 text-xs font-bold text-[#A9DCD5] uppercase tracking-wider relative z-10">
          <Sparkles className="w-4 h-4 text-[#75C9C0]" />
          <span>Weekly Productivity Recap</span>
        </div>
        <p className="text-sm sm:text-base font-semibold leading-relaxed max-w-2xl text-slate-100 relative z-10">
          "{recapMessage}"
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 relative z-10">
          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
            <span className="text-[10px] text-slate-300 block font-bold">Total Aktivitas</span>
            <span className="text-xl font-black text-white">{totalCount}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
            <span className="text-[10px] text-slate-300 block font-bold">Tugas Selesai</span>
            <span className="text-xl font-black text-[#82BFA4]">{completedCount}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
            <span className="text-[10px] text-slate-300 block font-bold">Tingkat Tuntas</span>
            <span className="text-xl font-black text-[#75C9C0]">{completionRate}%</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
            <span className="text-[10px] text-slate-300 block font-bold">Jam Fokus</span>
            <span className="text-xl font-black text-[#B9BFF0]">{totalFocusHours}h</span>
          </div>
        </div>
      </div>

      {/* Life Balance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Time Distribution Bars */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#28334A] border border-slate-200/80 dark:border-[#36435E] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#36435E]">
            <h3 className="text-sm font-bold text-[#303642] dark:text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#75C9C0]" />
              <span>Distribusi Alokasi Waktu (Life Balance)</span>
            </h3>
            <span className="text-xs font-bold text-[#858B98]">
              Total {balance.totalHours} Jam
            </span>
          </div>

          <div className="space-y-3">
            {balance.categoryBreakdown.map((item) => (
              <div key={item.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#303642] dark:text-white flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}</span>
                  </span>
                  <span className="text-[#858B98] font-semibold">
                    {item.hours} jam ({item.percentage}%)
                  </span>
                </div>

                <div className="w-full h-2 bg-[#F5F6F8] dark:bg-[#1A2130] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Constructive Balance Recommendation */}
          <div className="p-4 rounded-2xl bg-[#F5F6F8] dark:bg-[#1A2130] border border-slate-200/60 dark:border-[#36435E] text-xs space-y-1">
            <span className="font-bold text-[#303642] dark:text-white flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-[#E98E91]" />
              <span>Analisis Keseimbangan Hidup:</span>
            </span>
            <p className="text-[#858B98] dark:text-slate-300 leading-relaxed">
              {balance.insightMessage}
            </p>
          </div>
        </div>

        {/* Workload Radar Deep Dive */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#28334A] border border-slate-200/80 dark:border-[#36435E] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#36435E]">
            <h3 className="text-sm font-bold text-[#303642] dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#6575C9]" />
              <span>Analisis Kepadatan Jadwal</span>
            </h3>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${workload.color}25`,
                color: workload.color,
              }}
            >
              {workload.status}
            </span>
          </div>

          <p className="text-xs text-[#858B98] dark:text-slate-300 leading-relaxed">
            {workload.analysisMessage}
          </p>

          <div className="p-4 rounded-2xl bg-[#75C9C0]/10 border border-[#75C9C0]/30 space-y-2">
            <span className="text-xs font-bold text-[#347F80] dark:text-[#75C9C0] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Rekomendasi Optimalisasi:</span>
            </span>
            <p className="text-xs text-[#303642] dark:text-slate-200">
              {workload.recommendation}
            </p>
          </div>

          {/* Daily workload matrix */}
          <div className="pt-2">
            <span className="text-xs font-bold text-[#858B98] block mb-2">
              Beban Jam Per Hari:
            </span>
            <div className="grid grid-cols-7 gap-1">
              {workload.dailyDistribution.map((d) => (
                <div
                  key={d.date}
                  className="p-2 rounded-2xl bg-[#F5F6F8] dark:bg-[#1A2130] text-center"
                >
                  <span className="text-[10px] font-bold text-[#858B98] block">
                    {d.dayName}
                  </span>
                  <span className="text-xs font-black text-[#303642] dark:text-white mt-0.5 block">
                    {d.hours}h
                  </span>
                  <span className="text-[9px] text-[#858B98]">
                    {d.taskCount} tugas
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
