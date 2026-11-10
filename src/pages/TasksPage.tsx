/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  CheckCircle,
  Circle,
  Clock,
  AlertTriangle,
  Play,
  Layers,
  Trash2,
  Tag,
  DollarSign,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SmartEngine } from '../lib/smartEngine';
import { ActivityType, Priority, Task, TaskStatus, Category } from '../types';

export const TasksPage: React.FC = () => {
  const {
    tasks,
    categories,
    projects,
    toggleTaskComplete,
    deleteTask,
    setTaskDetailModalId,
    openBreakdownForTask,
    setIsQuickCaptureOpen,
    setActiveTab,
    addCategory,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'today' | 'upcoming' | 'overdue' | 'completed'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'title'>('dueDate');

  // Custom Category Modal
  const [isAddCatOpen, setIsAddCatOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#75C9C0');

  const today = new Date().toISOString().split('T')[0];
  const categoryMap = new Map<string, Category>(categories.map((c: Category) => [c.id, c]));

  // Filtering & Sorting
  const filteredTasks = useMemo(() => {
    return tasks.filter((t: Task) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = (t.description || '').toLowerCase().includes(q);
        const cat = categoryMap.get(t.categoryId);
        const matchCat = cat && cat.name.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchCat) return false;
      }

      // Tab filter
      if (activeTabFilter === 'today') {
        if (t.dueDate !== today) return false;
      } else if (activeTabFilter === 'upcoming') {
        if (!t.dueDate || t.dueDate <= today || t.status === 'completed') return false;
      } else if (activeTabFilter === 'overdue') {
        if (!t.dueDate || t.dueDate >= today || t.status === 'completed') return false;
      } else if (activeTabFilter === 'completed') {
        if (t.status !== 'completed') return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && t.categoryId !== selectedCategory) {
        return false;
      }

      // Priority filter
      if (selectedPriority !== 'all' && t.priority !== selectedPriority) {
        return false;
      }

      // Type filter
      if (selectedType !== 'all' && t.type !== selectedType) {
        return false;
      }

      return true;
    }).sort((a: Task, b: Task) => {
      if (sortBy === 'priority') {
        const pRank: Record<Priority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
        return pRank[b.priority] - pRank[a.priority];
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return (a.dueDate || '9999').localeCompare(b.dueDate || '9999');
    });
  }, [tasks, searchQuery, activeTabFilter, selectedCategory, selectedPriority, selectedType, sortBy]);

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory({
      name: newCatName.trim(),
      color: newCatColor,
      icon: 'Tag',
      description: 'Kategori kustom buatan Anda',
    });
    setNewCatName('');
    setIsAddCatOpen(false);
  };

  return (
    <div className="space-y-5 pb-20 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#303642] dark:text-white flex items-center gap-2">
            <span>Manajemen Aktivitas</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E4E5FA] dark:bg-[#28334A] text-[#6575C9] dark:text-[#75C9C0] font-bold">
              {filteredTasks.length} dari {tasks.length}
            </span>
          </h1>
          <p className="text-xs text-[#858B98]">
            Kelola seluruh tugas akademik, pekerjaan, keuangan, organisasi, dan target pribadi Anda
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddCatOpen(true)}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-[#28334A] hover:bg-[#E4E5FA] text-[#303642] dark:text-white border border-slate-200 dark:border-[#36435E] transition-colors cursor-pointer"
          >
            + Kategori Baru
          </button>

          <button
            onClick={() => setIsQuickCaptureOpen(true)}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-[#75C9C0] to-[#6575C9] text-white hover:opacity-95 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Aktivitas</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs in Teal & Indigo styling */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'Semua' },
          { id: 'today', label: 'Hari Ini' },
          { id: 'upcoming', label: 'Terjadwal' },
          { id: 'overdue', label: 'Terlambat' },
          { id: 'completed', label: 'Selesai' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTabFilter(tab.id as any)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-2xl transition-all cursor-pointer whitespace-nowrap ${
              activeTabFilter === tab.id
                ? 'bg-gradient-to-r from-[#75C9C0] to-[#6575C9] text-white shadow-xs'
                : 'bg-white dark:bg-[#28334A] text-[#858B98] hover:text-[#303642] dark:hover:text-white border border-slate-200/80 dark:border-[#36435E]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Multi-dropdown Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
        {/* Search Input */}
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#858B98]" />
          <input
            type="text"
            placeholder="Cari aktivitas, catatan, kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-[#28334A] border border-slate-200/80 dark:border-[#36435E] rounded-2xl outline-none focus:border-[#75C9C0] text-[#303642] dark:text-white"
          />
        </div>

        {/* Category Dropdown */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 text-xs bg-white dark:bg-[#28334A] border border-slate-200/80 dark:border-[#36435E] rounded-2xl outline-none text-[#303642] dark:text-white cursor-pointer"
        >
          <option value="all">Semua Kategori</option>
          {categories.map((c: Category) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 text-xs bg-white dark:bg-[#28334A] border border-slate-200/80 dark:border-[#36435E] rounded-2xl outline-none text-[#303642] dark:text-white cursor-pointer"
        >
          <option value="dueDate">Urutkan: Deadline</option>
          <option value="priority">Urutkan: Prioritas</option>
          <option value="title">Urutkan: Abjad</option>
        </select>
      </div>

      {/* Task List Cards */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-[#28334A] rounded-3xl border border-slate-200/80 dark:border-[#36435E] p-8 space-y-3">
            <CheckSquare className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-[#303642] dark:text-white">
              Tidak Ada Aktivitas yang Sesuai
            </h3>
            <p className="text-xs text-[#858B98] max-w-sm mx-auto">
              Coba sesuaikan kata kunci pencarian, filter kategori, atau tambahkan aktivitas baru.
            </p>
            <button
              onClick={() => setIsQuickCaptureOpen(true)}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-[#75C9C0] to-[#6575C9] text-white hover:opacity-95 cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Aktivitas Sekarang</span>
            </button>
          </div>
        ) : (
          filteredTasks.map((task: Task) => {
            const cat = categoryMap.get(task.categoryId);
            const prediction = SmartEngine.predictTaskDeadline(task);
            const isCompleted = task.status === 'completed';

            return (
              <div
                key={task.id}
                className={`p-3.5 sm:p-4 rounded-3xl bg-white dark:bg-[#28334A] border transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 group ${
                  isCompleted
                    ? 'border-slate-200/50 dark:border-[#36435E]/50 opacity-75'
                    : 'border-slate-200/80 dark:border-[#36435E] hover:border-[#75C9C0] dark:hover:border-[#75C9C0]'
                }`}
              >
                {/* Left check & info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => toggleTaskComplete(task.id)}
                    className="mt-0.5 text-slate-300 hover:text-[#82BFA4] transition-colors cursor-pointer shrink-0"
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-[#82BFA4] fill-[#82BFA4]/20" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 dark:text-slate-500" />
                    )}
                  </button>

                  <div
                    onClick={() => setTaskDetailModalId(task.id)}
                    className="cursor-pointer flex-1 min-w-0"
                  >
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                        style={{
                          backgroundColor: `${cat?.color || '#75C9C0'}25`,
                          color: cat?.color || '#347F80',
                        }}
                      >
                        {cat?.name || 'Aktivitas'}
                      </span>

                      {!isCompleted && (
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                          style={{
                            backgroundColor: `${prediction.color}20`,
                            color: prediction.color,
                          }}
                        >
                          {prediction.status}
                        </span>
                      )}

                      {task.priority === 'urgent' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-[#E98E91]/20 text-[#E98E91]">
                          Mendesak
                        </span>
                      )}

                      {task.amount ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-[#82BFA4]/20 text-[#347F80] dark:text-[#75C9C0] flex items-center gap-0.5">
                          <DollarSign className="w-2.5 h-2.5" />
                          <span>Rp {task.amount.toLocaleString('id-ID')}</span>
                        </span>
                      ) : null}

                      {task.location ? (
                        <span className="text-[10px] text-[#858B98] flex items-center gap-0.5 truncate">
                          <MapPin className="w-2.5 h-2.5" />
                          <span>{task.location}</span>
                        </span>
                      ) : null}
                    </div>

                    <h3
                      className={`text-sm font-bold text-[#303642] dark:text-white mt-1 group-hover:text-[#347F80] dark:group-hover:text-[#75C9C0] transition-colors truncate ${
                        isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
                      }`}
                    >
                      {task.title}
                    </h3>

                    <div className="flex items-center gap-3 mt-1 text-[11px] text-[#858B98] flex-wrap">
                      {task.dueDate && (
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3 text-[#75C9C0]" />
                          <span>
                            {task.dueDate === today ? 'Hari Ini' : task.dueDate} {task.dueTime || ''}
                          </span>
                        </span>
                      )}
                      <span>•</span>
                      <span>{task.estimatedMinutes} menit</span>

                      {task.subtasks.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-[#6575C9] dark:text-[#B9BFF0] font-semibold">
                            Subtugas: {task.subtasks.filter((s) => s.completed).length}/
                            {task.subtasks.length}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Quick Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {!isCompleted && (
                    <>
                      <button
                        onClick={() => openBreakdownForTask(task)}
                        className="p-1.5 rounded-xl text-[#858B98] hover:text-[#347F80] dark:hover:text-[#75C9C0] hover:bg-[#F5F6F8] dark:hover:bg-[#1A2130] transition-colors cursor-pointer"
                        title="Pecah menjadi tahapan kecil (AI Breakdown)"
                      >
                        <Layers className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setActiveTab('focus')}
                        className="px-2.5 py-1 text-xs font-semibold rounded-xl bg-[#F5F6F8] dark:bg-[#1A2130] hover:bg-[#E4E5FA] text-[#303642] dark:text-white flex items-center gap-1 cursor-pointer transition-colors"
                        title="Fokus dengan Timer"
                      >
                        <Play className="w-3 h-3 fill-current text-[#75C9C0]" />
                        <span>Fokus</span>
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 rounded-xl text-[#858B98] hover:text-[#E98E91] hover:bg-[#F5F6F8] dark:hover:bg-[#1A2130] transition-colors cursor-pointer"
                    title="Hapus aktivitas"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Custom Category Modal */}
      {isAddCatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-[#28334A] rounded-3xl p-5 border border-slate-200 dark:border-[#36435E] shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-[#303642] dark:text-white">
              Tambah Kategori Baru
            </h3>
            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#858B98] mb-1">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Skripsi, Portofolio, Bisnis..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F5F6F8] dark:bg-[#1A2130] border border-slate-200 dark:border-[#36435E] rounded-xl outline-none focus:border-[#75C9C0] text-[#303642] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#858B98] mb-1">
                  Pilih Warna Kategori
                </label>
                <div className="flex gap-2">
                  {['#75C9C0', '#6575C9', '#A9DCD5', '#347F80', '#B9BFF0', '#F2B56B', '#E98E91', '#82BFA4'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewCatColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                        newCatColor === c ? 'scale-125 ring-2 ring-[#28334A] dark:ring-white' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCatOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#858B98] hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-gradient-to-r from-[#75C9C0] to-[#6575C9] text-white rounded-xl shadow-xs"
                >
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
