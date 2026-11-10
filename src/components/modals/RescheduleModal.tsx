/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  RefreshCw,
  AlertTriangle,
  Calendar,
  Clock,
  Sparkles,
  Check,
  ArrowRight,
  Split,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AIService, AIRescheduleResult } from '../../lib/aiService';
import { Task } from '../../types';

export const RescheduleModal: React.FC = () => {
  const {
    isRescheduleOpen,
    setIsRescheduleOpen,
    tasks,
    updateTask,
    openBreakdownForTask,
    triggerConfetti,
    awardXP,
  } = useApp();

  const today = new Date().toISOString().split('T')[0];

  // Find overdue tasks (active and dueDate < today)
  const overdueTasks = tasks.filter(
    (t) => t.status !== 'completed' && t.dueDate && t.dueDate < today
  );

  const [isLoading, setIsLoading] = useState(false);
  const [advice, setAdvice] = useState<AIRescheduleResult | null>(null);
  const [selectedTaskDates, setSelectedTaskDates] = useState<{ [id: string]: string }>({});

  if (!isRescheduleOpen) return null;

  const handleAskAI = async () => {
    setIsLoading(true);
    try {
      const simplified = overdueTasks.map((t) => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        estimatedMinutes: t.estimatedMinutes,
      }));

      const res = await AIService.getSmartRescheduleAdvice(
        simplified,
        [],
        '08:00 - 17:00'
      );
      setAdvice(res);

      const mapping: { [id: string]: string } = {};
      res.rescheduledTasks.forEach((item) => {
        mapping[item.taskId] = item.suggestedDate;
      });
      setSelectedTaskDates(mapping);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplySingle = (taskId: string, newDate: string) => {
    updateTask(taskId, { dueDate: newDate });
    awardXP(20, 'Menjadwalkan ulang tugas');
  };

  const handleApplyAll = () => {
    overdueTasks.forEach((t) => {
      const newDate = selectedTaskDates[t.id] || getTomorrowDate();
      updateTask(t.id, { dueDate: newDate });
    });

    awardXP(50, 'Menata ulang seluruh jadwal tertunda');
    triggerConfetti();
    setIsRescheduleOpen(false);
  };

  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#28334A] rounded-3xl shadow-2xl border border-slate-200/80 dark:border-[#36435E] p-5 sm:p-6 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#36435E]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#F2B56B] to-[#E98E91] flex items-center justify-center text-white shadow-xs">
              <RefreshCw className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#303642] dark:text-white flex items-center gap-1.5">
                <span>Smart Reschedule</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F2B56B]/20 text-[#F2B56B] border border-[#F2B56B]/30">
                  {overdueTasks.length} Terlambat
                </span>
              </h2>
              <p className="text-xs text-[#858B98] dark:text-slate-400">
                Atur ulang jadwal yang belum terlaksana secara bersahabat dan realistis
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsRescheduleOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1A2130] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overdue Status Notice */}
        {overdueTasks.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#82BFA4]/20 flex items-center justify-center text-[#82BFA4]">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#303642] dark:text-white">
              Tidak Ada Jadwal Tertunda!
            </h3>
            <p className="text-xs text-[#858B98] max-w-xs mx-auto">
              Semua aktivitasmu berjalan tepat waktu dan terkontrol dengan baik.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="p-3.5 rounded-2xl bg-[#F2B56B]/15 border border-[#F2B56B]/30 text-xs text-[#F2B56B] flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-[#F2B56B] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">
                  Jadwal sebelumnya belum terlaksana. Apakah kamu ingin mengatur ulang waktu pengerjaan?
                </p>
                <p className="text-[11px] text-[#858B98] mt-0.5">
                  Deadline asli tidak akan diubah tanpa konfirmasi dari Anda.
                </p>
              </div>
            </div>

            {/* AI Advisor Button */}
            {!advice && (
              <button
                type="button"
                disabled={isLoading}
                onClick={handleAskAI}
                className="w-full py-2.5 text-xs font-bold rounded-2xl bg-gradient-to-r from-[#75C9C0] to-[#6575C9] hover:opacity-95 text-white shadow-md shadow-[#6575C9]/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Gemini Menganalisis Beban Waktu...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Rekomendasikan Jadwal Otomatis dengan AI</span>
                  </>
                )}
              </button>
            )}

            {advice && (
              <div className="p-3 rounded-2xl bg-[#75C9C0]/15 border border-[#75C9C0]/30 text-xs text-[#347F80] dark:text-[#A9DCD5]">
                <span className="font-bold flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#6575C9]" />
                  Saran AI:
                </span>
                <p>{advice.recommendationSummary}</p>
              </div>
            )}

            {/* List of Overdue Tasks */}
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {overdueTasks.map((task) => {
                const targetDate = selectedTaskDates[task.id] || getTomorrowDate();
                return (
                  <div
                    key={task.id}
                    className="p-3 bg-slate-50 dark:bg-[#1A2130] rounded-2xl border border-slate-200 dark:border-[#36435E] flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-[#303642] dark:text-white">
                          {task.title}
                        </h4>
                        <span className="text-[10px] text-[#E98E91] font-semibold">
                          Jatuh tempo lama: {task.dueDate} {task.dueTime || ''}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsRescheduleOpen(false);
                          openBreakdownForTask(task);
                        }}
                        className="text-[10px] font-semibold text-[#6575C9] dark:text-[#B9BFF0] bg-[#6575C9]/10 px-2 py-1 rounded-lg border border-[#6575C9]/30 flex items-center gap-1 hover:bg-[#6575C9]/20 transition-colors cursor-pointer"
                        title="Pecah menjadi tahapan kecil"
                      >
                        <Split className="w-3 h-3" />
                        <span>Bagi Tahapan</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 dark:border-[#36435E]">
                      <span className="text-[11px] text-[#858B98]">Pilih Tanggal Baru:</span>
                      <input
                        type="date"
                        value={targetDate}
                        onChange={(e) =>
                          setSelectedTaskDates({
                            ...selectedTaskDates,
                            [task.id]: e.target.value,
                          })
                        }
                        className="px-2 py-1 text-xs bg-white dark:bg-[#28334A] border border-slate-200 dark:border-[#36435E] rounded-lg text-[#303642] dark:text-white focus:border-[#75C9C0]"
                      />
                      <button
                        type="button"
                        onClick={() => handleApplySingle(task.id, targetDate)}
                        className="px-2.5 py-1 text-xs font-semibold bg-[#75C9C0]/20 hover:bg-[#75C9C0]/30 text-[#347F80] dark:text-[#A9DCD5] rounded-lg transition-colors cursor-pointer ml-auto"
                      >
                        Terapkan
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-between border-t border-slate-100 dark:border-[#36435E]">
              <button
                type="button"
                onClick={() => setIsRescheduleOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1A2130] rounded-xl cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleApplyAll}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-[#75C9C0] to-[#6575C9] hover:opacity-95 text-white transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-[#6575C9]/20"
              >
                <Check className="w-4 h-4" />
                <span>Terapkan Semua Jadwal Baru</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
