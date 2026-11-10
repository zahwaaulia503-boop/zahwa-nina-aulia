/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  User,
  Settings,
  Award,
  Download,
  Upload,
  RefreshCw,
  Moon,
  Sun,
  ShieldCheck,
  CheckCircle,
  Clock,
  Sparkles,
  FileSpreadsheet,
  FileText,
  AlertTriangle,
  Flame,
  LogIn,
  Eye,
} from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { useApp } from '../context/AppContext';
import { StorageService } from '../lib/storage';
import { SmartEngine } from '../lib/smartEngine';

export const ProfilePage: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    achievements,
    tasks,
    theme,
    toggleTheme,
    resetToDemo,
    triggerConfetti,
    setIsAuthModalOpen,
    setShowSplashPreview,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(userProfile.name);
  const [roleTitle, setRoleTitle] = useState(userProfile.roleTitle);
  const [productiveStart, setProductiveStart] = useState(userProfile.productiveHoursStart);
  const [productiveEnd, setProductiveEnd] = useState(userProfile.productiveHoursEnd);
  const [isSaved, setIsSaved] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);

  const { level, currentXp, nextLevelXp, progressPercent } = SmartEngine.calculateLevel(
    userProfile.xp
  );

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name,
      roleTitle,
      productiveHoursStart: productiveStart,
      productiveHoursEnd: productiveEnd,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleExportJSON = () => {
    const jsonStr = StorageService.exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deadlineku-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const csvStr = StorageService.exportTasksCSV(tasks);
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deadlineku-aktivitas-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = StorageService.restoreBackupJSON(content);
      if (success) {
        setRestoreStatus('Cadangan berhasil dipulihkan!');
        triggerConfetti();
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setRestoreStatus('Gagal memulihkan file cadangan. Periksa format file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Profile Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#28334A] border border-slate-200/80 dark:border-[#36435E] shadow-sm flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <img
            src={userProfile.avatar}
            alt={userProfile.name}
            className="w-20 h-20 rounded-3xl object-cover ring-4 ring-[#75C9C0]/50 shadow-md"
          />

          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#303642] dark:text-white">
                {userProfile.name}
              </h1>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#75C9C0]/20 text-[#347F80] dark:text-[#75C9C0]">
                Level {level}
              </span>
            </div>
            <p className="text-xs text-[#858B98] mt-0.5">
              {userProfile.roleTitle} • {userProfile.email}
            </p>

            {/* Level & XP progress in Teal & Indigo */}
            <div className="mt-3 space-y-1.5 w-64 max-w-full">
              <div className="flex justify-between text-[11px] font-bold text-[#858B98]">
                <span>Pengalaman (XP)</span>
                <span>
                  {currentXp} / {nextLevelXp} XP
                </span>
              </div>
              <div className="w-full h-2 bg-[#F5F6F8] dark:bg-[#1A2130] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#75C9C0] via-[#A9DCD5] to-[#6575C9] rounded-full transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons: Theme toggle & Auth */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-3.5 py-2 text-xs font-bold rounded-2xl bg-white dark:bg-[#1A2130] hover:bg-[#E4E5FA] border border-slate-200 dark:border-[#36435E] text-[#303642] dark:text-white flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <LogIn className="w-4 h-4 text-[#75C9C0]" />
            <span>Kelola Akun</span>
          </button>

          <button
            onClick={toggleTheme}
            className="px-3.5 py-2 text-xs font-bold rounded-2xl bg-[#F5F6F8] hover:bg-[#E4E5FA] dark:bg-[#1A2130] dark:hover:bg-[#1A2130]/80 text-[#303642] dark:text-white flex items-center gap-2 transition-all cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-[#F2B56B]" /> : <Moon className="w-4 h-4 text-[#6575C9]" />}
            <span>{theme === 'dark' ? 'Mode Gelap' : 'Mode Terang'}</span>
          </button>
        </div>
      </div>

      {/* Brand Identity & Logo Showcase Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#28334A] border border-slate-200/80 dark:border-[#36435E] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Logo variant="icon" size="lg" />
          <div>
            <h3 className="text-sm font-extrabold text-[#303642] dark:text-white">
              Identitas Resmi: Modern Teal & Indigo
            </h3>
            <p className="text-xs text-[#858B98]">
              "Time Management Meets Productivity" — Jam & Tanda Centang
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowSplashPreview(true)}
          className="px-4 py-2 text-xs font-bold rounded-2xl bg-[#75C9C0]/15 hover:bg-[#75C9C0]/25 text-[#347F80] dark:text-[#75C9C0] border border-[#75C9C0]/40 flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Lihat Animasi Splash Screen</span>
        </button>
      </div>

      {/* Gamification Achievements Showcase */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#28334A] border border-slate-200/80 dark:border-[#36435E] shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#36435E]">
          <h2 className="text-base font-bold text-[#303642] dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-[#F2B56B]" />
            <span>Lencana & Pencapaian ({achievements.filter((a) => a.progress >= 100).length}/{achievements.length})</span>
          </h2>
          <span className="text-xs font-bold text-[#347F80] dark:text-[#75C9C0]">
            Total {userProfile.xp} XP Dikumpulkan
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {achievements.map((ach) => {
            const isUnlocked = ach.progress >= 100;
            return (
              <div
                key={ach.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                  isUnlocked
                    ? 'bg-[#75C9C0]/10 border-[#75C9C0]/40 dark:bg-[#75C9C0]/15'
                    : 'bg-[#F5F6F8]/60 dark:bg-[#1A2130]/60 border-slate-200/60 dark:border-[#36435E] opacity-60'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold shadow-xs ${
                    isUnlocked
                      ? 'bg-gradient-to-tr from-[#75C9C0] to-[#6575C9] text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                  }`}
                >
                  <Award className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[#303642] dark:text-white truncate">
                      {ach.title}
                    </h3>
                    <span className="text-[10px] font-bold text-[#347F80] dark:text-[#75C9C0] shrink-0">
                      +{ach.xpReward} XP
                    </span>
                  </div>
                  <p className="text-[11px] text-[#858B98] mt-0.5 line-clamp-2">
                    {ach.description}
                  </p>
                  {isUnlocked ? (
                    <span className="inline-block mt-1 text-[9px] font-bold text-[#82BFA4]">
                      ✓ Terbuka ({ach.unlockedAt})
                    </span>
                  ) : (
                    <div className="mt-1.5 w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-400"
                        style={{ width: `${ach.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Account & Schedule Preferences Form */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#28334A] border border-slate-200/80 dark:border-[#36435E] shadow-sm space-y-4">
        <h2 className="text-base font-bold text-[#303642] dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#75C9C0]" />
          <span>Pengaturan Akun & Jam Kerja</span>
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#858B98] mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F5F6F8] dark:bg-[#1A2130] border border-slate-200 dark:border-[#36435E] rounded-xl outline-none focus:border-[#75C9C0] text-[#303642] dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#858B98] mb-1">
                Peran Utama (Role)
              </label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F5F6F8] dark:bg-[#1A2130] border border-slate-200 dark:border-[#36435E] rounded-xl outline-none focus:border-[#75C9C0] text-[#303642] dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#858B98] mb-1">
                Mulai Jam Produktif
              </label>
              <input
                type="time"
                value={productiveStart}
                onChange={(e) => setProductiveStart(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F5F6F8] dark:bg-[#1A2130] border border-slate-200 dark:border-[#36435E] rounded-xl text-[#303642] dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#858B98] mb-1">
                Selesai Jam Produktif
              </label>
              <input
                type="time"
                value={productiveEnd}
                onChange={(e) => setProductiveEnd(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F5F6F8] dark:bg-[#1A2130] border border-slate-200 dark:border-[#36435E] rounded-xl text-[#303642] dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {isSaved ? (
              <span className="text-xs font-bold text-[#82BFA4] flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                <span>Pengaturan berhasil disimpan!</span>
              </span>
            ) : <span />}

            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-[#75C9C0] to-[#6575C9] text-white hover:opacity-95 transition-all cursor-pointer shadow-sm"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>

      {/* Data Export, Backup & Reset Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#28334A] border border-slate-200/80 dark:border-[#36435E] shadow-sm space-y-4">
        <h2 className="text-base font-bold text-[#303642] dark:text-white flex items-center gap-2">
          <Download className="w-5 h-5 text-[#75C9C0]" />
          <span>Cadangan, Ekspor, & Pemulihan Data</span>
        </h2>
        <p className="text-xs text-[#858B98]">
          Data Anda tersimpan secara lokal di peramban. Anda dapat mengunduh salinan CSV untuk spreadsheet atau mencadangkan JSON kapan saja.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* CSV Export */}
          <button
            onClick={handleExportCSV}
            className="p-4 rounded-2xl bg-[#F5F6F8] dark:bg-[#1A2130] hover:bg-[#E4E5FA]/50 border border-slate-200 dark:border-[#36435E] text-left transition-all cursor-pointer space-y-1"
          >
            <FileSpreadsheet className="w-5 h-5 text-[#82BFA4]" />
            <h3 className="text-xs font-bold text-[#303642] dark:text-white">Ekspor ke CSV</h3>
            <p className="text-[11px] text-[#858B98]">
              Unduh seluruh daftar aktivitas untuk Excel / Google Sheets
            </p>
          </button>

          {/* Backup JSON */}
          <button
            onClick={handleExportJSON}
            className="p-4 rounded-2xl bg-[#F5F6F8] dark:bg-[#1A2130] hover:bg-[#E4E5FA]/50 border border-slate-200 dark:border-[#36435E] text-left transition-all cursor-pointer space-y-1"
          >
            <Download className="w-5 h-5 text-[#6575C9]" />
            <h3 className="text-xs font-bold text-[#303642] dark:text-white">Cadangkan JSON</h3>
            <p className="text-[11px] text-[#858B98]">
              Simpan file cadangan lengkap termasuk kebiasaan & pencapaian
            </p>
          </button>

          {/* Restore JSON */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-4 rounded-2xl bg-[#F5F6F8] dark:bg-[#1A2130] hover:bg-[#E4E5FA]/50 border border-slate-200 dark:border-[#36435E] text-left transition-all cursor-pointer space-y-1"
          >
            <Upload className="w-5 h-5 text-[#F2B56B]" />
            <h3 className="text-xs font-bold text-[#303642] dark:text-white">Pulihkan Data (Restore)</h3>
            <p className="text-[11px] text-[#858B98]">
              Unggah file cadangan JSON yang telah disimpan
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleRestoreFile}
              className="hidden"
            />
          </button>
        </div>

        {restoreStatus && (
          <div className="p-3 rounded-xl bg-[#75C9C0]/20 text-[#347F80] dark:text-[#75C9C0] text-xs font-semibold">
            {restoreStatus}
          </div>
        )}

        {/* Reset Demo Data Button */}
        <div className="pt-4 border-t border-slate-100 dark:border-[#36435E] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#303642] dark:text-white block">
              Atur Ulang ke Data Contoh (Demo Data)
            </span>
            <span className="text-[11px] text-[#858B98]">
              Kembalikan 20+ aktivitas contoh, kategori, dan proyek awal.
            </span>
          </div>
          <button
            onClick={() => {
              if (window.confirm('Apakah Anda yakin ingin mengatur ulang data ke default demo?')) {
                resetToDemo();
              }
            }}
            className="px-4 py-2 text-xs font-bold rounded-xl text-[#E98E91] hover:bg-[#E98E91]/15 border border-[#E98E91]/40 transition-colors cursor-pointer"
          >
            Reset Data Demo
          </button>
        </div>
      </div>
    </div>
  );
};
