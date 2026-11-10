/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  CalendarClock,
  Sparkles,
  Check,
  Clock,
  Calendar,
  AlertCircle,
  Coffee,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SmartEngine, ScheduledSlot } from '../../lib/smartEngine';

export const AutoSchedulerModal: React.FC = () => {
  const {
    isAutoSchedulerOpen,
    setIsAutoSchedulerOpen,
    tasks,
    categories,
    userProfile,
    updateTask,
    triggerConfetti,
    awardXP,
  } = useApp();

  const [productiveStart, setProductiveStart] = useState(userProfile.productiveHoursStart || '08:00');
  const [productiveEnd, setProductiveEnd] = useState(userProfile.productiveHoursEnd || '17:00');
  const [restStart, setRestStart] = useState(userProfile.restHoursStart || '12:00');
  const [restEnd, setRestEnd] = useState(userProfile.restHoursEnd || '13:00');

  const [generatedSchedule, setGeneratedSchedule] = useState<ScheduledSlot[]>(() =>
    SmartEngine.generateAutoSchedule(
      tasks,
      categories,
      userProfile.productiveHoursStart,
      userProfile.productiveHoursEnd,
      userProfile.restHoursStart,
      userProfile.restHoursEnd
    )
  );

  const [appliedSuccess, setAppliedSuccess] = useState(false);

  if (!isAutoSchedulerOpen) return null;

  const handleRegenerate = () => {
    const slots = SmartEngine.generateAutoSchedule(
      tasks,
      categories,
      productiveStart,
      productiveEnd,
      restStart,
      restEnd
    );
    setGeneratedSchedule(slots);
    setAppliedSuccess(false);
  };

  const handleApplySchedule = () => {
    generatedSchedule.forEach((slot) => {
      updateTask(slot.taskId, {
        dueDate: slot.date,
        dueTime: slot.endTime,
      });
    });

    awardXP(60, 'Menerapkan jadwal otomatis');
    triggerConfetti();
    setAppliedSuccess(true);
    setTimeout(() => {
      setIsAutoSchedulerOpen(false);
      setAppliedSuccess(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#28334A] rounded-3xl shadow-2xl border border-slate-200/80 dark:border-[#36435E] p-5 sm:p-6 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#36435E]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#75C9C0] to-[#6575C9] flex items-center justify-center text-white shadow-xs">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#303642] dark:text-white flex items-center gap-1.5">
                <span>Smart Auto Scheduler</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#75C9C0]/20 text-[#347F80] dark:text-[#A9DCD5] border border-[#75C9C0]/30">
                  Real-time Engine
                </span>
              </h2>
              <p className="text-xs text-[#858B98] dark:text-slate-400">
                Susun waktu pengerjaan tugas secara harmonis, tanpa tabrakan, dan tetap ada jeda istirahat
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAutoSchedulerOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1A2130] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Parameters Configuration */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1A2130] border border-slate-200 dark:border-[#36435E] space-y-3">
          <span className="text-xs font-bold text-[#303642] dark:text-slate-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#6575C9]" />
            <span>Preferensi Ketersediaan Waktu Pengguna</span>
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <label className="block text-[10px] font-semibold text-[#858B98] mb-0.5">
                Mulai Jam Produktif
              </label>
              <input
                type="time"
                value={productiveStart}
                onChange={(e) => setProductiveStart(e.target.value)}
                className="w-full px-2 py-1 text-xs bg-white dark:bg-[#28334A] border border-slate-200 dark:border-[#36435E] rounded-lg text-[#303642] dark:text-white focus:border-[#75C9C0]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-[#858B98] mb-0.5">
                Selesai Jam Produktif
              </label>
              <input
                type="time"
                value={productiveEnd}
                onChange={(e) => setProductiveEnd(e.target.value)}
                className="w-full px-2 py-1 text-xs bg-white dark:bg-[#28334A] border border-slate-200 dark:border-[#36435E] rounded-lg text-[#303642] dark:text-white focus:border-[#75C9C0]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-[#858B98] mb-0.5 flex items-center gap-1">
                <Coffee className="w-3 h-3 text-[#F2B56B]" />
                <span>Mulai Istirahat</span>
              </label>
              <input
                type="time"
                value={restStart}
                onChange={(e) => setRestStart(e.target.value)}
                className="w-full px-2 py-1 text-xs bg-white dark:bg-[#28334A] border border-slate-200 dark:border-[#36435E] rounded-lg text-[#303642] dark:text-white focus:border-[#75C9C0]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-[#858B98] mb-0.5">
                Selesai Istirahat
              </label>
              <input
                type="time"
                value={restEnd}
                onChange={(e) => setRestEnd(e.target.value)}
                className="w-full px-2 py-1 text-xs bg-white dark:bg-[#28334A] border border-slate-200 dark:border-[#36435E] rounded-lg text-[#303642] dark:text-white focus:border-[#75C9C0]"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleRegenerate}
            className="w-full py-1.5 text-xs font-semibold rounded-xl bg-[#75C9C0]/20 hover:bg-[#75C9C0]/30 text-[#347F80] dark:text-[#A9DCD5] transition-colors cursor-pointer"
          >
            Hitung Ulang Jadwal
          </button>
        </div>

        {/* Schedule Proposed Slots */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#303642] dark:text-slate-300">
              Rekomendasi Distribusi Slot Waktu ({generatedSchedule.length} Aktivitas)
            </span>
            <span className="text-[11px] text-[#858B98]">Jeda buffer 15 menit disertakan</span>
          </div>

          {generatedSchedule.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#858B98]">
              Tidak ada aktivitas tertunda yang perlu dijadwalkan otomatis.
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {generatedSchedule.map((slot, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-[#1A2130] border border-slate-200 dark:border-[#36435E] hover:border-[#75C9C0] transition-all shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-10 rounded-full"
                      style={{ backgroundColor: slot.categoryColor }}
                    />
                    <div>
                      <h4 className="text-xs font-bold text-[#303642] dark:text-white line-clamp-1">
                        {slot.taskTitle}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#858B98] dark:text-slate-400">
                        <span className="font-semibold text-[#303642] dark:text-slate-300">
                          {slot.date}
                        </span>
                        <span>•</span>
                        <span>
                          {slot.startTime} - {slot.endTime}
                        </span>
                        <span>•</span>
                        <span>{slot.durationMinutes} mnt</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      slot.priority === 'urgent'
                        ? 'bg-[#E98E91]/20 text-[#E98E91] border border-[#E98E91]/30'
                        : slot.priority === 'high'
                        ? 'bg-[#F2B56B]/20 text-[#F2B56B] border border-[#F2B56B]/30'
                        : 'bg-[#6575C9]/20 text-[#6575C9] dark:text-[#B9BFF0] border border-[#6575C9]/30'
                    }`}
                  >
                    {slot.priority.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feedback message */}
        {appliedSuccess && (
          <div className="mt-3 p-3 rounded-xl bg-[#82BFA4]/20 text-[#347F80] dark:text-[#82BFA4] text-xs font-semibold flex items-center gap-2 border border-[#82BFA4]/40">
            <CheckCircle2 className="w-4 h-4 text-[#82BFA4]" />
            <span>Jadwal cerdas berhasil diterapkan ke seluruh aktivitas Anda!</span>
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-[#36435E]">
          <button
            type="button"
            onClick={() => setIsAutoSchedulerOpen(false)}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1A2130] rounded-xl cursor-pointer"
          >
            Tutup
          </button>
          <button
            type="button"
            disabled={generatedSchedule.length === 0 || appliedSuccess}
            onClick={handleApplySchedule}
            className="px-6 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-[#75C9C0] to-[#6575C9] hover:opacity-95 text-white transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-[#6575C9]/20 disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>Terapkan Jadwal ke Kalender</span>
          </button>
        </div>
      </div>
    </div>
  );
};
