/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Layers,
  Sparkles,
  Clock,
  CheckCircle,
  Plus,
  Trash2,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AIService, AIBreakdownResult } from '../../lib/aiService';
import { Priority, SubTask } from '../../types';

export const BreakdownModal: React.FC = () => {
  const {
    isBreakdownOpen,
    setIsBreakdownOpen,
    activeTaskForBreakdown,
    updateTask,
    categories,
    triggerConfetti,
    awardXP,
  } = useApp();

  const [isLoading, setIsLoading] = useState(false);
  const [breakdown, setBreakdown] = useState<AIBreakdownResult | null>(null);
  const [editableSteps, setEditableSteps] = useState<
    { title: string; estimatedMinutes: number; priority: Priority }[]
  >([]);

  useEffect(() => {
    if (isBreakdownOpen && activeTaskForBreakdown) {
      handleGenerateBreakdown();
    }
  }, [isBreakdownOpen, activeTaskForBreakdown]);

  if (!isBreakdownOpen || !activeTaskForBreakdown) return null;

  const cat = categories.find((c) => c.id === activeTaskForBreakdown.categoryId);

  const handleGenerateBreakdown = async () => {
    setIsLoading(true);
    try {
      const hours = Math.max(1, Math.round(activeTaskForBreakdown.estimatedMinutes / 60));
      const res = await AIService.breakItDown(
        activeTaskForBreakdown.title,
        activeTaskForBreakdown.description || '',
        cat?.name || 'Pekerjaan',
        activeTaskForBreakdown.dueDate,
        hours
      );
      setBreakdown(res);
      setEditableSteps(res.steps);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepTitleChange = (index: number, val: string) => {
    const next = [...editableSteps];
    next[index].title = val;
    setEditableSteps(next);
  };

  const handleStepMinutesChange = (index: number, val: number) => {
    const next = [...editableSteps];
    next[index].estimatedMinutes = val;
    setEditableSteps(next);
  };

  const handleRemoveStep = (index: number) => {
    setEditableSteps(editableSteps.filter((_, i) => i !== index));
  };

  const handleAddStep = () => {
    setEditableSteps([
      ...editableSteps,
      {
        title: 'Langkah pengerjaan baru',
        estimatedMinutes: 30,
        priority: 'medium',
      },
    ]);
  };

  const handleApplySubtasks = () => {
    const newSubtasks: SubTask[] = editableSteps.map((step, i) => ({
      id: `st-ai-${Date.now()}-${i}`,
      title: step.title,
      completed: false,
      estimatedMinutes: step.estimatedMinutes,
      priority: step.priority,
    }));

    // Update the task with newly broken down subtasks
    updateTask(activeTaskForBreakdown.id, {
      subtasks: [...activeTaskForBreakdown.subtasks, ...newSubtasks],
      status: activeTaskForBreakdown.status === 'todo' ? 'in_progress' : activeTaskForBreakdown.status,
    });

    awardXP(50, 'Memecah tugas dengan AI');
    triggerConfetti();
    setIsBreakdownOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#28334A] rounded-3xl shadow-2xl border border-slate-200/80 dark:border-[#36435E] p-5 sm:p-6 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#36435E]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#75C9C0] to-[#6575C9] flex items-center justify-center text-white shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#303642] dark:text-white flex items-center gap-1.5">
                <span>Break It Down — AI Subtask</span>
              </h2>
              <p className="text-xs text-[#858B98] dark:text-slate-400">
                Pecah tugas besar menjadi langkah-langkah terukur yang mudah diselesaikan
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsBreakdownOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1A2130] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task Info Pill */}
        <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-[#1A2130] border border-slate-200 dark:border-[#36435E]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#858B98]">
            Aktivitas Utama
          </span>
          <h3 className="text-sm font-bold text-[#303642] dark:text-white mt-0.5">
            {activeTaskForBreakdown.title}
          </h3>
          <div className="flex items-center gap-3 mt-1 text-xs text-[#858B98] dark:text-slate-400">
            <span>Kategori: {cat?.name}</span>
            <span>•</span>
            <span>Estimasi Total: {activeTaskForBreakdown.estimatedMinutes} menit</span>
            {activeTaskForBreakdown.dueDate && (
              <>
                <span>•</span>
                <span>Deadline: {activeTaskForBreakdown.dueDate}</span>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="py-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-[#75C9C0] mx-auto" />
            <p className="text-xs font-semibold text-[#303642] dark:text-slate-300">
              Gemini sedang memecah tugas menjadi tahapan realistis...
            </p>
            <p className="text-[11px] text-[#858B98] max-w-xs mx-auto">
              Menghitung urutan kerja, estimasi waktu, dan prioritas per tahapan.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {breakdown?.overview && (
              <div className="p-3 rounded-xl bg-[#75C9C0]/15 text-xs text-[#347F80] dark:text-[#A9DCD5] border border-[#75C9C0]/30 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-[#6575C9] shrink-0 mt-0.5" />
                <span>{breakdown.overview}</span>
              </div>
            )}

            {/* Steps list */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#303642] dark:text-slate-300">
                  Tahapan Pengerjaan ({editableSteps.length})
                </label>
                <button
                  type="button"
                  onClick={handleAddStep}
                  className="text-xs font-semibold text-[#6575C9] dark:text-[#B9BFF0] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Langkah</span>
                </button>
              </div>

              {editableSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-[#1A2130] rounded-xl border border-slate-200 dark:border-[#36435E] group"
                >
                  <span className="w-6 h-6 rounded-lg bg-white dark:bg-[#28334A] flex items-center justify-center text-xs font-bold text-[#303642] dark:text-slate-300 shrink-0 border border-slate-100 dark:border-[#36435E]">
                    {idx + 1}
                  </span>

                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => handleStepTitleChange(idx, e.target.value)}
                    className="flex-1 px-2.5 py-1 text-xs bg-white dark:bg-[#28334A] border border-slate-200 dark:border-[#36435E] rounded-lg outline-none focus:border-[#75C9C0] text-[#303642] dark:text-white"
                  />

                  <div className="flex items-center gap-1 shrink-0">
                    <input
                      type="number"
                      min="5"
                      step="5"
                      value={step.estimatedMinutes}
                      onChange={(e) => handleStepMinutesChange(idx, Number(e.target.value))}
                      className="w-16 px-1.5 py-1 text-xs text-center bg-white dark:bg-[#28334A] border border-slate-200 dark:border-[#36435E] rounded-lg text-[#303642] dark:text-white focus:border-[#75C9C0]"
                    />
                    <span className="text-[10px] text-[#858B98]">mnt</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveStep(idx)}
                    className="text-slate-400 hover:text-[#E98E91] p-1 cursor-pointer"
                    title="Hapus langkah"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-between border-t border-slate-100 dark:border-[#36435E]">
              <button
                type="button"
                onClick={handleGenerateBreakdown}
                className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1A2130] rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Rekomendasikan Ulang</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsBreakdownOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1A2130] rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleApplySubtasks}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-[#75C9C0] to-[#6575C9] hover:opacity-95 text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#6575C9]/20"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Terapkan Sebagai Subtugas</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
