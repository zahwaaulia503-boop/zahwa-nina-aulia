/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FolderKanban,
  Users,
  Plus,
  CheckCircle,
  Calendar,
  MessageSquare,
  Share2,
  Sparkles,
  ArrowRight,
  UserPlus,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Project } from '../types';

export const ProjectsPage: React.FC = () => {
  const { projects, tasks, addProject, setTaskDetailModalId, openBreakdownForTask, setIsQuickCaptureOpen } = useApp();

  const [activeProjectId, setActiveProjectId] = useState<string>(projects[0]?.id || '');
  const [isAddProjOpen, setIsAddProjOpen] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjDueDate, setNewProjDueDate] = useState('');

  // Invite modal state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'member' | 'viewer'>('member');
  const [inviteFeedback, setInviteFeedback] = useState<string | null>(null);

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  const projectTasks = tasks.filter((t) => t.projectId === activeProject?.id);
  const completedCount = projectTasks.filter((t) => t.status === 'completed').length;
  const progressPercent =
    projectTasks.length > 0 ? Math.round((completedCount / projectTasks.length) * 100) : 0;

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;

    const created = addProject({
      name: newProjName.trim(),
      description: newProjDesc.trim(),
      color: '#75C9C0',
      dueDate: newProjDueDate || undefined,
      status: 'active',
      members: [
        { id: `m-${Date.now()}`, name: 'Zahwa Aulia', role: 'leader' },
      ],
    });

    setActiveProjectId(created.id);
    setIsAddProjOpen(false);
    setNewProjName('');
    setNewProjDesc('');
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviteFeedback(`Undangan kolaborasi berhasil dikirimkan ke ${inviteEmail}! Anggota akan otomatis tersambung saat menerima.`);
    setTimeout(() => {
      setInviteFeedback(null);
      setIsInviteOpen(false);
      setInviteEmail('');
    }, 2000);
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#303642] dark:text-white flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-[#75C9C0]" />
            <span>Proyek & Ruang Kolaborasi</span>
          </h1>
          <p className="text-xs text-[#858B98]">
            Kelola tugas tim, kepanitiaan organisasi, dan target bersama dalam satu workspace
          </p>
        </div>

        <button
          onClick={() => setIsAddProjOpen(true)}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-[#75C9C0] to-[#6575C9] text-white hover:opacity-95 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Proyek Baru</span>
        </button>
      </div>

      {/* Project Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {projects.map((proj) => (
          <button
            key={proj.id}
            onClick={() => setActiveProjectId(proj.id)}
            className={`px-4 py-2 text-xs font-bold rounded-2xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeProjectId === proj.id
                ? 'bg-gradient-to-r from-[#75C9C0] to-[#6575C9] text-white shadow-md'
                : 'bg-white dark:bg-[#28334A] text-[#858B98] hover:text-[#303642] dark:hover:text-white border border-slate-200/80 dark:border-[#36435E]'
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: proj.color }}
            />
            <span>{proj.name}</span>
          </button>
        ))}
      </div>

      {activeProject && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Project Overview & Tasks (2 cols) */}
          <div className="lg:col-span-2 space-y-5">
            {/* Project Details Banner */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#28334A] border border-slate-200/80 dark:border-[#36435E] shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-[#303642] dark:text-white">
                    {activeProject.name}
                  </h2>
                  <p className="text-xs text-[#858B98] mt-1">
                    {activeProject.description || 'Tidak ada deskripsi tambahan.'}
                  </p>
                </div>
                {activeProject.dueDate && (
                  <span className="text-xs font-bold px-3 py-1 rounded-xl bg-[#F5F6F8] dark:bg-[#1A2130] text-[#347F80] dark:text-[#75C9C0] shrink-0 border border-slate-200/60 dark:border-[#36435E]">
                    Target: {activeProject.dueDate}
                  </span>
                )}
              </div>

              {/* Progress Bar with Teal to Indigo Gradient */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#858B98]">Progres Keseluruhan</span>
                  <span className="text-[#347F80] dark:text-[#75C9C0] font-black">{progressPercent}% Selesai</span>
                </div>
                <div className="w-full h-2.5 bg-[#F5F6F8] dark:bg-[#1A2130] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#75C9C0] via-[#A9DCD5] to-[#6575C9] rounded-full transition-all duration-700"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Task List under Project */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#303642] dark:text-white">
                  Aktivitas & Milestone Proyek ({projectTasks.length})
                </h3>
                <button
                  onClick={() => setIsQuickCaptureOpen(true)}
                  className="text-xs font-bold text-[#347F80] dark:text-[#75C9C0] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Aktivitas Proyek</span>
                </button>
              </div>

              {projectTasks.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-[#28334A] rounded-3xl border border-slate-200/80 dark:border-[#36435E]">
                  <p className="text-xs text-[#858B98]">
                    Belum ada tugas yang dikaitkan ke proyek ini.
                  </p>
                </div>
              ) : (
                projectTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setTaskDetailModalId(t.id)}
                    className="p-3.5 rounded-2xl bg-white dark:bg-[#28334A] border border-slate-200/80 dark:border-[#36435E] hover:border-[#75C9C0] transition-all flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div>
                      <h4
                        className={`text-xs font-bold text-[#303642] dark:text-white ${
                          t.status === 'completed' ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {t.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#858B98]">
                        {t.dueDate && <span>Deadline: {t.dueDate}</span>}
                        <span>•</span>
                        <span>Estimasi: {t.estimatedMinutes} mnt</span>
                        {t.subtasks.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-[#6575C9] dark:text-[#B9BFF0]">
                              {t.subtasks.filter((s) => s.completed).length}/{t.subtasks.length} subtugas
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        t.status === 'completed'
                          ? 'bg-[#82BFA4]/20 text-[#82BFA4]'
                          : 'bg-[#F5F6F8] text-[#858B98] dark:bg-[#1A2130] dark:text-[#F5F6F8]'
                      }`}
                    >
                      {t.status === 'completed' ? 'Selesai' : 'Aktif'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Collaboration Space & Members */}
          <div className="space-y-5">
            <div className="p-5 rounded-3xl bg-white dark:bg-[#28334A] border border-slate-200/80 dark:border-[#36435E] shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#36435E]">
                <h3 className="text-sm font-bold text-[#303642] dark:text-white flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#75C9C0]" />
                  <span>Anggota Tim ({activeProject.members.length})</span>
                </h3>
                <button
                  onClick={() => setIsInviteOpen(true)}
                  className="text-xs font-bold text-[#347F80] dark:text-[#75C9C0] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Undang</span>
                </button>
              </div>

              <div className="space-y-2">
                {activeProject.members.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-[#F5F6F8] dark:bg-[#1A2130]"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#75C9C0] to-[#6575C9] flex items-center justify-center text-xs font-bold text-white shadow-2xs">
                        {m.name.charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-[#303642] dark:text-white">
                        {m.name}
                      </span>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-[#28334A] text-[#347F80] dark:text-[#75C9C0] capitalize shadow-2xs">
                      {m.role}
                    </span>
                  </div>
                ))}
              </div>

              {/* Collaboration notice */}
              <div className="p-3.5 rounded-2xl bg-[#F5F6F8] dark:bg-[#1A2130] border border-slate-200/60 dark:border-[#36435E] text-[11px] text-[#858B98] leading-relaxed">
                ℹ️ <strong>Workspace Kolaboratif:</strong> Setiap anggota dapat memantau linimasa dan berkontribusi secara langsung pada aktivitas proyek.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {isAddProjOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#28334A] rounded-3xl p-6 border border-slate-200 dark:border-[#36435E] shadow-xl space-y-4">
            <h3 className="text-base font-bold text-[#303642] dark:text-white">
              Buat Proyek / Ruang Kolaborasi Baru
            </h3>
            <form onSubmit={handleCreateProject} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#858B98] mb-1">
                  Nama Proyek
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Skripsi Bab 4-5, Launching Produk..."
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F5F6F8] dark:bg-[#1A2130] border border-slate-200 dark:border-[#36435E] rounded-xl outline-none focus:border-[#75C9C0] text-[#303642] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#858B98] mb-1">
                  Deskripsi Singkat
                </label>
                <textarea
                  rows={2}
                  placeholder="Tujuan atau target luaran proyek..."
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F5F6F8] dark:bg-[#1A2130] border border-slate-200 dark:border-[#36435E] rounded-xl outline-none focus:border-[#75C9C0] text-[#303642] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#858B98] mb-1">
                  Target Tanggal Selesai
                </label>
                <input
                  type="date"
                  value={newProjDueDate}
                  onChange={(e) => setNewProjDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F5F6F8] dark:bg-[#1A2130] border border-slate-200 dark:border-[#36435E] rounded-xl outline-none text-[#303642] dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddProjOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#858B98] hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-gradient-to-r from-[#75C9C0] to-[#6575C9] text-white rounded-xl shadow-sm cursor-pointer"
                >
                  Simpan Proyek
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-[#28334A] rounded-3xl p-5 border border-slate-200 dark:border-[#36435E] shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-[#303642] dark:text-white">
              Undang Kolaborator ke Proyek
            </h3>
            <form onSubmit={handleSendInvite} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#858B98] mb-1">
                  Email Rekan Tim
                </label>
                <input
                  type="email"
                  required
                  placeholder="rekan@email.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F5F6F8] dark:bg-[#1A2130] border border-slate-200 dark:border-[#36435E] rounded-xl outline-none focus:border-[#75C9C0] text-[#303642] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#858B98] mb-1">
                  Peran (Role)
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-[#F5F6F8] dark:bg-[#1A2130] border border-slate-200 dark:border-[#36435E] rounded-xl outline-none text-[#303642] dark:text-white"
                >
                  <option value="member">Anggota (Bisa perbarui tugas)</option>
                  <option value="viewer">Peninjau (Hanya melihat)</option>
                </select>
              </div>

              {inviteFeedback && (
                <div className="p-2.5 rounded-xl bg-[#75C9C0]/20 border border-[#75C9C0]/40 text-[#347F80] dark:text-[#75C9C0] text-xs font-semibold">
                  {inviteFeedback}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#858B98] hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-gradient-to-r from-[#75C9C0] to-[#6575C9] text-white rounded-xl"
                >
                  Kirim Undangan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
