/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  Layers,
  Target,
  Trash2,
  CheckCircle,
  Circle,
  AlertTriangle,
  Plus,
  DollarSign,
  MapPin,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SmartEngine } from '../../lib/smartEngine';
import { Priority, TaskStatus } from '../../types';

export const TaskDetailModal: React.FC = () => {
  const {
    taskDetailModalId,
    setTaskDetailModalId,
    tasks,
    categories,
    projects,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    toggleSubTask,
    addSubTask,
    openBreakdownForTask,
    setActiveTab,
  } = useApp();

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  if (!taskDetailModalId) return null;

  const task = tasks.find((t) => t.id === taskDetailModalId);
  if (!task) return null;

  const category = categories.find((c) => c.id === task.categoryId);
  const project = projects.find((p) => p.id === task.projectId);
  const prediction = SmartEngine.predictTaskDeadline(task);

  const handleAddSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    addSubTask(task.id, newSubtaskTitle.trim(), 30);
    setNewSubtaskTitle('');
  };

  const handleStartFocus = () => {
    setTaskDetailModalId(null);
    setActiveTab('focus');
  };

  const priorityLabels: Record<Priority, string> = {
    low: 'Rendah',
    medium: 'Sedang',
    high: 'Tinggi',
    urgent: 'Mendesak',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#28334A] rounded-3xl shadow-2xl border border-slate-200/80 dark:border-[#36435E] p-5 sm:p-6 transition-all">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#36435E]">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: category?.color || '#75C9C0' }}
            />
            <span className="text-xs font-semibold text-[#858B98] dark:text-slate-400">
              {category?.name || 'Aktivitas'}
            </span>
            {project && (
              <>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-xs text-[#858B98] font-medium">{project.name}</span>
              </>
            )}
          </div>
          <button
            onClick={() => setTaskDetailModalId(null)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1A2130] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task Title & Status Toggle */}
        <div className="mt-4 flex items-start gap-3">
          <button
            type="button"
            onClick={() => toggleTaskComplete(task.id)}
            className="mt-1 text-slate-400 hover:text-[#82BFA4] transition-colors cursor-pointer"
          >
            {task.status === 'completed' ? (
              <CheckCircle className="w-6 h-6 text-[#82BFA4] fill-[#82BFA4]/20" />
            ) : (
              <Circle className="w-6 h-6 text-slate-300 dark:text-slate-600" />
            )}
          </button>
          <div className="flex-1">
            <h2
              className={`text-lg font-bold text-[#303642] dark:text-white ${
                task.status === 'completed' ? 'line-through text-slate-400 dark:text-slate-500' : ''
              }`}
            >
              {task.title}
            </h2>
            {task.description && (
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 whitespace-pre-line leading-relaxed">
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* Deadline Predictor Banner */}
        <div
          className="mt-4 p-3.5 rounded-2xl border text-xs flex items-start gap-2.5"
          style={{
            backgroundColor: `${prediction.color}15`,
            borderColor: `${prediction.color}40`,
          }}
        >
          <AlertTriangle
            className="w-4 h-4 shrink-0 mt-0.5"
            style={{ color: prediction.color }}
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-bold" style={{ color: prediction.color }}>
                Prediksi Deadline: {prediction.status}
              </span>
              <span className="text-[10px] text-[#858B98] font-semibold">
                Estimasi: {prediction.estimatedHours} jam
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mt-0.5">{prediction.message}</p>
            <p className="text-[11px] text-[#858B98] italic mt-0.5">{prediction.suggestion}</p>
          </div>
        </div>

        {/* Metadata Badges */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1A2130] border border-slate-200/80 dark:border-[#36435E]">
            <span className="text-[10px] text-[#858B98] block font-semibold">DEADLINE</span>
            <span className="font-bold text-[#303642] dark:text-slate-200">
              {task.dueDate || 'Tanpa Tanggal'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1A2130] border border-slate-200/80 dark:border-[#36435E]">
            <span className="text-[10px] text-[#858B98] block font-semibold">WAKTU</span>
            <span className="font-bold text-[#303642] dark:text-slate-200">
              {task.dueTime || '17:00'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1A2130] border border-slate-200/80 dark:border-[#36435E]">
            <span className="text-[10px] text-[#858B98] block font-semibold">PRIORITAS</span>
            <span className="font-bold text-[#303642] dark:text-slate-200 capitalize">
              {priorityLabels[task.priority]}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1A2130] border border-slate-200/80 dark:border-[#36435E]">
            <span className="text-[10px] text-[#858B98] block font-semibold">ESTIMASI</span>
            <span className="font-bold text-[#303642] dark:text-slate-200">
              {task.estimatedMinutes} menit
            </span>
          </div>
        </div>

        {/* Special fields */}
        {(task.amount || task.location || task.courseName) && (
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {task.amount && (
              <span className="px-3 py-1 rounded-xl bg-[#82BFA4]/20 text-[#347F80] dark:text-[#82BFA4] font-bold border border-[#82BFA4]/30">
                Nominal: Rp {task.amount.toLocaleString('id-ID')}
              </span>
            )}
            {task.location && (
              <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-[#1A2130] text-[#303642] dark:text-slate-300 font-medium border border-slate-200 dark:border-[#36435E]">
                📍 {task.location}
              </span>
            )}
            {task.courseName && (
              <span className="px-3 py-1 rounded-xl bg-[#6575C9]/15 text-[#6575C9] dark:text-[#B9BFF0] font-medium border border-[#6575C9]/30">
                🎓 {task.courseName}
              </span>
            )}
          </div>
        )}

        {/* Subtasks Section */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#303642] dark:text-slate-200">
              Daftar Subtugas ({task.subtasks.filter((s) => s.completed).length}/
              {task.subtasks.length})
            </span>
            <button
              type="button"
              onClick={() => {
                setTaskDetailModalId(null);
                openBreakdownForTask(task);
              }}
              className="text-xs font-semibold text-[#6575C9] dark:text-[#B9BFF0] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Break It Down dengan AI</span>
            </button>
          </div>

          <form onSubmit={handleAddSub} className="flex gap-2">
            <input
              type="text"
              placeholder="Tambah subtugas..."
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#1A2130] border border-slate-200 dark:border-[#36435E] rounded-xl outline-none focus:border-[#75C9C0] text-[#303642] dark:text-white"
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 text-xs font-semibold bg-[#75C9C0]/20 hover:bg-[#75C9C0]/30 text-[#347F80] dark:text-[#A9DCD5] rounded-xl cursor-pointer"
            >
              Tambah
            </button>
          </form>

          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {task.subtasks.map((st) => (
              <div
                key={st.id}
                onClick={() => toggleSubTask(task.id, st.id)}
                className="flex items-center gap-2.5 p-2 bg-slate-50 dark:bg-[#1A2130]/60 rounded-xl border border-slate-100 dark:border-[#36435E] cursor-pointer hover:bg-slate-100 dark:hover:bg-[#1A2130] transition-colors"
              >
                {st.completed ? (
                  <CheckCircle className="w-4 h-4 text-[#82BFA4] shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <span
                  className={`text-xs flex-1 ${
                    st.completed ? 'line-through text-slate-400' : 'text-[#303642] dark:text-slate-200'
                  }`}
                >
                  {st.title}
                </span>
                {st.estimatedMinutes && (
                  <span className="text-[10px] text-[#858B98]">{st.estimatedMinutes} mnt</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-3 flex items-center justify-between border-t border-slate-100 dark:border-[#36435E]">
          <button
            type="button"
            onClick={() => {
              deleteTask(task.id);
              setTaskDetailModalId(null);
            }}
            className="text-xs text-[#E98E91] hover:text-[#E98E91]/80 flex items-center gap-1.5 p-1.5 cursor-pointer font-medium"
          >
            <Trash2 className="w-4 h-4" />
            <span>Hapus Aktivitas</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleStartFocus}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-[#75C9C0] to-[#6575C9] hover:opacity-95 text-white flex items-center gap-1.5 shadow-md shadow-[#6575C9]/20 cursor-pointer transition-all"
            >
              <Target className="w-3.5 h-3.5" />
              <span>Mulai Fokus</span>
            </button>

            <button
              type="button"
              onClick={() => setTaskDetailModalId(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1A2130] rounded-xl cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
