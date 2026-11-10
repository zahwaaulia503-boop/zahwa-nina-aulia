/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Calendar,
  Clock,
  Tag,
  AlertCircle,
  Plus,
  Trash2,
  Check,
  DollarSign,
  MapPin,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AIService } from '../../lib/aiService';
import { ActivityType, Priority } from '../../types';

export const QuickCaptureModal: React.FC = () => {
  const {
    isQuickCaptureOpen,
    setIsQuickCaptureOpen,
    categories,
    projects,
    addTask,
  } = useApp();

  const [naturalInput, setNaturalInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiNote, setAiNote] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-akademik');
  const [type, setType] = useState<ActivityType>('task');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState('17:00');
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [projectId, setProjectId] = useState<string>('');
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [location, setLocation] = useState('');
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  if (!isQuickCaptureOpen) return null;

  const handleNaturalLanguageParse = async (customText?: string) => {
    const textToParse = customText || naturalInput;
    if (!textToParse.trim()) return;

    setIsAiLoading(true);
    setAiNote(null);

    try {
      const result = await AIService.parseNaturalLanguage(textToParse);

      setTitle(result.title);
      if (result.description) setDescription(result.description);
      if (result.dueDate) setDueDate(result.dueDate);
      if (result.dueTime) setDueTime(result.dueTime);
      if (result.priority) setPriority(result.priority);
      if (result.estimatedMinutes) setEstimatedMinutes(result.estimatedMinutes);
      if (result.amount) setAmount(result.amount);
      if (result.type) setType(result.type as ActivityType);

      // Match category
      const matchedCat = categories.find(
        (c) => c.name.toLowerCase() === (result.category || '').toLowerCase()
      );
      if (matchedCat) {
        setCategoryId(matchedCat.id);
      }

      setAiNote(result.explanation || 'Berhasil dianalisis oleh AI. Periksa dan simpan.');
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([
      ...subtasks,
      {
        id: `st-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: newSubtaskTitle.trim(),
        completed: false,
      },
    ]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      description: description.trim(),
      categoryId,
      type,
      priority,
      dueDate: dueDate || undefined,
      dueTime: dueTime || '17:00',
      estimatedMinutes: Number(estimatedMinutes) || 60,
      projectId: projectId || undefined,
      amount: type === 'bill' ? Number(amount) || 0 : undefined,
      location: type === 'event' ? location : undefined,
      subtasks,
    });

    setIsQuickCaptureOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setNaturalInput('');
    setAiNote(null);
    setSubtasks([]);
    setAmount(undefined);
    setLocation('');
  };

  const samplePrompts = [
    'Ingatkan bayar listrik PLN tgl 15 sebesar 500rb',
    'Besok jam 09.00 rapat panitia seminar di Zoom',
    'Selesaikan proposal riset minggu depan estimasi 3 jam',
    'Olahraga kardio sore ini jam 16.30',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#28334A] rounded-3xl shadow-2xl border border-slate-200/80 dark:border-[#36435E] p-5 sm:p-6 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#36435E]">
          <div>
            <h2 className="text-lg font-bold text-[#303642] dark:text-white flex items-center gap-2">
              <span>Tambah Aktivitas Baru</span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#75C9C0]/20 text-[#347F80] dark:text-[#A9DCD5] font-semibold border border-[#75C9C0]/30">
                Pintar AI
              </span>
            </h2>
            <p className="text-xs text-[#858B98] dark:text-slate-400">
              Ketik bahasa sehari-hari atau isi formulir terstruktur
            </p>
          </div>
          <button
            onClick={() => setIsQuickCaptureOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1A2130] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Natural Language Input (AI Assisted) */}
        <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-[#75C9C0]/15 via-[#6575C9]/10 to-[#A9DCD5]/15 border border-[#75C9C0]/30 dark:border-[#36435E]">
          <label className="block text-xs font-semibold text-[#303642] dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#6575C9]" />
            <span className="font-bold text-[#6575C9] dark:text-[#B9BFF0]">AI Natural Language Input</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Contoh: Besok jam 14.00 ada kuis pemrograman..."
              value={naturalInput}
              onChange={(e) => setNaturalInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleNaturalLanguageParse())}
              className="flex-1 px-3 py-2 text-xs bg-white dark:bg-[#1A2130] border border-slate-200 dark:border-[#36435E] rounded-xl outline-none focus:border-[#75C9C0] text-[#303642] dark:text-white"
            />
            <button
              type="button"
              disabled={isAiLoading || !naturalInput.trim()}
              onClick={() => handleNaturalLanguageParse()}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-[#75C9C0] to-[#6575C9] text-white hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-1 cursor-pointer shadow-xs"
            >
              {isAiLoading ? 'Memproses...' : 'Ubah ke Draf'}
            </button>
          </div>

          {/* Quick prompt chips */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {samplePrompts.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setNaturalInput(prompt);
                  handleNaturalLanguageParse(prompt);
                }}
                className="text-[10px] px-2 py-0.5 rounded-lg bg-white/90 dark:bg-[#1A2130]/90 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-[#36435E] hover:border-[#75C9C0] transition-all cursor-pointer truncate max-w-[200px]"
              >
                {prompt}
              </button>
            ))}
          </div>

          {aiNote && (
            <div className="mt-2.5 text-[11px] p-2.5 rounded-xl bg-white/95 dark:bg-[#1A2130] text-[#347F80] dark:text-[#A9DCD5] border border-[#75C9C0]/40 flex items-start gap-1.5 shadow-xs">
              <Check className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#75C9C0]" />
              <span>{aiNote}</span>
            </div>
          )}
        </div>

        {/* Structured Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-[#303642] dark:text-slate-300 mb-1">
              Judul Aktivitas <span className="text-[#E98E91]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Selesaikan laporan keuangan divisi"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-[#1A2130] border border-slate-200 dark:border-[#36435E] rounded-xl outline-none focus:border-[#75C9C0] text-[#303642] dark:text-white"
            />
          </div>

          {/* Type & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#303642] dark:text-slate-300 mb-1">
                Kategori
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#1A2130] border border-slate-200 dark:border-[#36435E] rounded-xl outline-none focus:border-[#75C9C0] text-[#303642] dark:text-white cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#303642] dark:text-slate-300 mb-1">
                Tipe Aktivitas
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ActivityType)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#1A2130] border border-slate-200 dark:border-[#36435E] rounded-xl outline-none focus:border-[#75C9C0] text-[#303642] dark:text-white cursor-pointer"
              >
                <option value="task">Tugas Sekali Selesai</option>
                <option value="recurring">Tugas Berulang</option>
                <option value="project">Terkait Proyek</option>
                <option value="event">Acara / Janji Temu</option>
                <option value="bill">Tagihan / Pembayaran</option>
                <option value="routine">Rutinitas</option>
                <option value="goal">Target / Goal</option>
                <option value="reminder">Pengingat Ringan</option>
              </select>
            </div>
          </div>

          {/* Priority & Project selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#303642] dark:text-slate-300 mb-1">
                Tingkat Prioritas
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['low', 'medium', 'high', 'urgent'] as Priority[]).map((p) => {
                  const labels: Record<Priority, string> = {
                    low: 'Rendah',
                    medium: 'Sedang',
                    high: 'Tinggi',
                    urgent: 'Mendesak',
                  };
                  const colors: Record<Priority, string> = {
                    low: 'border-slate-300 text-slate-600 dark:text-slate-400',
                    medium: 'border-[#6575C9]/40 text-[#6575C9] dark:text-[#B9BFF0]',
                    high: 'border-[#F2B56B]/60 text-[#F2B56B]',
                    urgent: 'border-[#E98E91]/60 text-[#E98E91]',
                  };
                  const isSelected = priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-1.5 text-[11px] font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#75C9C0] to-[#6575C9] text-white border-transparent shadow-xs'
                          : `${colors[p]} bg-slate-50 dark:bg-[#1A2130] hover:bg-slate-100 dark:hover:bg-[#1A2130]/80`
                      }`}
                    >
                      {labels[p]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#303642] dark:text-slate-300 mb-1">
                Proyek (Opsional)
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#1A2130] border border-slate-200 dark:border-[#36435E] rounded-xl outline-none focus:border-[#75C9C0] text-[#303642] dark:text-white cursor-pointer"
              >
                <option value="">-- Bukan bagian proyek --</option>
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date, Time, Duration */}
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-[#303642] dark:text-slate-300 mb-1">
                Tenggat Tanggal
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#1A2130] border border-slate-200 dark:border-[#36435E] rounded-xl outline-none focus:border-[#75C9C0] text-[#303642] dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#303642] dark:text-slate-300 mb-1">
                Jam Deadline
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#1A2130] border border-slate-200 dark:border-[#36435E] rounded-xl outline-none focus:border-[#75C9C0] text-[#303642] dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#303642] dark:text-slate-300 mb-1">
                Estimasi (Menit)
              </label>
              <input
                type="number"
                min="5"
                step="5"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#1A2130] border border-slate-200 dark:border-[#36435E] rounded-xl outline-none focus:border-[#75C9C0] text-[#303642] dark:text-white"
              />
            </div>
          </div>

          {/* Conditional Bill amount or Event Location */}
          {type === 'bill' && (
            <div>
              <label className="block text-xs font-semibold text-[#303642] dark:text-slate-300 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-[#82BFA4]" />
                <span>Nominal Tagihan (Rp)</span>
              </label>
              <input
                type="number"
                placeholder="Contoh: 500000"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#1A2130] border border-slate-200 dark:border-[#36435E] rounded-xl outline-none focus:border-[#75C9C0] text-[#303642] dark:text-white"
              />
            </div>
          )}

          {type === 'event' && (
            <div>
              <label className="block text-xs font-semibold text-[#303642] dark:text-slate-300 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#E98E91]" />
                <span>Lokasi Acara / Tautan Virtual</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Ruang Rapat Lt 2 / Zoom Meeting"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#1A2130] border border-slate-200 dark:border-[#36435E] rounded-xl outline-none focus:border-[#75C9C0] text-[#303642] dark:text-white"
              />
            </div>
          )}

          {/* Subtasks */}
          <div>
            <label className="block text-xs font-semibold text-[#303642] dark:text-slate-300 mb-1">
              Langkah / Subtugas ({subtasks.length})
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Tambah langkah kecil pengerjaan..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#1A2130] border border-slate-200 dark:border-[#36435E] rounded-xl outline-none focus:border-[#75C9C0] text-[#303642] dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3.5 py-1.5 text-xs font-semibold bg-[#75C9C0]/20 hover:bg-[#75C9C0]/30 text-[#347F80] dark:text-[#A9DCD5] rounded-xl transition-colors cursor-pointer"
              >
                Tambah
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between px-2.5 py-1 text-xs bg-slate-50 dark:bg-[#1A2130]/60 rounded-lg border border-slate-100 dark:border-[#36435E]"
                  >
                    <span className="text-[#303642] dark:text-slate-200 truncate">{st.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="text-slate-400 hover:text-[#E98E91] cursor-pointer p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#303642] dark:text-slate-300 mb-1">
              Deskripsi & Catatan
            </label>
            <textarea
              rows={2}
              placeholder="Catatan pengerjaan, referensi, atau instruksi..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#1A2130] border border-slate-200 dark:border-[#36435E] rounded-xl outline-none focus:border-[#75C9C0] text-[#303642] dark:text-white"
            />
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-[#36435E]">
            <button
              type="button"
              onClick={() => setIsQuickCaptureOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1A2130] rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-gradient-to-r from-[#75C9C0] to-[#6575C9] hover:opacity-95 text-white rounded-xl transition-all shadow-md shadow-[#6575C9]/20 cursor-pointer"
            >
              Simpan Aktivitas
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
