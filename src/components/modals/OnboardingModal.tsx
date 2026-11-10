/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Check,
  Clock,
  Briefcase,
  GraduationCap,
  Heart,
  Moon,
  Sun,
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { useApp } from '../../context/AppContext';

export const OnboardingModal: React.FC = () => {
  const { userProfile, updateUserProfile, triggerConfetti } = useApp();

  // If already onboarded, don't show
  if (userProfile.isOnboarded) return null;

  const [step, setStep] = useState(1);
  const [name, setName] = useState(userProfile.name || '');
  const [roleTitle, setRoleTitle] = useState(userProfile.roleTitle || 'Mahasiswa');
  const [productiveHoursStart, setProductiveHoursStart] = useState('08:00');
  const [productiveHoursEnd, setProductiveHoursEnd] = useState('17:00');
  const [restHoursStart, setRestHoursStart] = useState('12:00');
  const [restHoursEnd, setRestHoursEnd] = useState('13:00');

  const roles = [
    'Mahasiswa',
    'Pelajar',
    'Pekerja Kantoran',
    'Pekerja Lepas (Freelancer)',
    'Pengusaha / Founder',
    'Anggota Organisasi',
    'Ibu Rumah Tangga',
    'Masyarakat Umum',
  ];

  const handleFinish = () => {
    updateUserProfile({
      name: name.trim() || 'Pengguna DeadlineKu',
      roleTitle,
      productiveHoursStart,
      productiveHoursEnd,
      restHoursStart,
      restHoursEnd,
      isOnboarded: true,
    });
    triggerConfetti();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#28334A] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#36435E] p-6 sm:p-8 transition-all">
        {/* Progress indicator with Official Logo */}
        <div className="flex items-center justify-between mb-6">
          <Logo variant="horizontal" size="sm" showSlogan={false} />
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-6 h-1.5 rounded-full transition-all ${
                  step === s ? 'bg-[#75C9C0]' : s < step ? 'bg-[#6575C9]' : 'bg-slate-200 dark:bg-[#1A2130]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Welcome & Name */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h2 className="text-xl font-extrabold text-[#303642] dark:text-white">
                Selamat Datang di DeadlineKu! 👋
              </h2>
              <p className="text-xs text-[#858B98] mt-1">
                Your Tasks, Your Pace, Your Progress. Satu aplikasi pintar dengan konsep Modern Teal & Indigo untuk mengelola seluruh ritme hidup Anda.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-[#303642] dark:text-slate-300 mb-1">
                  Siapa nama panggilan Anda?
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Zahwa Aulia"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-[#F5F6F8] dark:bg-[#1A2130] border border-slate-200 dark:border-[#36435E] rounded-xl outline-none focus:border-[#75C9C0] text-[#303642] dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#303642] dark:text-slate-300 mb-1">
                  Aktivitas atau peran utama Anda saat ini:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {roles.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRoleTitle(r)}
                      className={`p-2.5 text-left text-xs rounded-xl border transition-all cursor-pointer ${
                        roleTitle === r
                          ? 'bg-gradient-to-r from-[#75C9C0] to-[#6575C9] text-white border-transparent font-bold shadow-xs'
                          : 'bg-[#F5F6F8] dark:bg-[#1A2130] border-slate-200 dark:border-[#36435E] text-[#303642] dark:text-slate-300 hover:bg-[#E4E5FA]/50'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-[#75C9C0] to-[#6575C9] text-white flex items-center gap-1.5 shadow-md cursor-pointer hover:opacity-95 transition-all"
              >
                <span>Lanjut</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Productive & Rest Hours */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h2 className="text-xl font-extrabold text-[#303642] dark:text-white">
                Jam Produktif & Istirahat ⏰
              </h2>
              <p className="text-xs text-[#858B98] mt-1">
                DeadlineKu menggunakan jadwal ini untuk Smart Auto Scheduler agar tugas tidak bertabrakan dengan waktu istirahat Anda.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#858B98] mb-1">
                    Mulai Produktif
                  </label>
                  <input
                    type="time"
                    value={productiveHoursStart}
                    onChange={(e) => setProductiveHoursStart(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F5F6F8] dark:bg-[#1A2130] border border-slate-200 dark:border-[#36435E] rounded-xl text-[#303642] dark:text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#858B98] mb-1">
                    Selesai Produktif
                  </label>
                  <input
                    type="time"
                    value={productiveHoursEnd}
                    onChange={(e) => setProductiveHoursEnd(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F5F6F8] dark:bg-[#1A2130] border border-slate-200 dark:border-[#36435E] rounded-xl text-[#303642] dark:text-white font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#858B98] mb-1">
                    Mulai Istirahat / Siang
                  </label>
                  <input
                    type="time"
                    value={restHoursStart}
                    onChange={(e) => setRestHoursStart(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F5F6F8] dark:bg-[#1A2130] border border-slate-200 dark:border-[#36435E] rounded-xl text-[#303642] dark:text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#858B98] mb-1">
                    Selesai Istirahat
                  </label>
                  <input
                    type="time"
                    value={restHoursEnd}
                    onChange={(e) => setRestHoursEnd(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F5F6F8] dark:bg-[#1A2130] border border-slate-200 dark:border-[#36435E] rounded-xl text-[#303642] dark:text-white font-semibold"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-bold text-[#858B98] hover:bg-slate-100 rounded-xl"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-[#75C9C0] to-[#6575C9] text-white flex items-center gap-1.5 shadow-md cursor-pointer hover:opacity-95 transition-all"
              >
                <span>Lanjut</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Ready with Logo */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in text-center py-2">
            <Logo variant="main" size="lg" showSlogan={false} />

            <div>
              <h2 className="text-xl font-extrabold text-[#303642] dark:text-white">
                Siap Memulai, {name || 'Kawan'}! 🚀
              </h2>
              <p className="text-xs text-[#858B98] mt-1 max-w-sm mx-auto">
                Konsep Modern Teal & Indigo siap menemani Anda mengatur seluruh tugas, rutinitas, dan target hidup secara terstruktur.
              </p>
            </div>

            <div className="p-4 bg-[#F5F6F8] dark:bg-[#1A2130] rounded-2xl border border-slate-200 dark:border-[#36435E] text-left text-xs space-y-2">
              <div className="flex items-center gap-2 text-[#303642] dark:text-slate-300">
                <Check className="w-4 h-4 text-[#82BFA4]" />
                <span>Penyimpanan permanen lokal aktif (aman tanpa hilang)</span>
              </div>
              <div className="flex items-center gap-2 text-[#303642] dark:text-slate-300">
                <Check className="w-4 h-4 text-[#75C9C0]" />
                <span>AI Multimodal Gemini 3.8 Flash siap menganalisis tugas</span>
              </div>
              <div className="flex items-center gap-2 text-[#303642] dark:text-slate-300">
                <Check className="w-4 h-4 text-[#6575C9]" />
                <span>Gamifikasi XP & Pencapaian diaktifkan</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleFinish}
                className="w-full py-3 text-xs font-bold rounded-2xl bg-gradient-to-r from-[#75C9C0] to-[#6575C9] text-white hover:opacity-95 transition-all shadow-lg cursor-pointer"
              >
                Mulai Gunakan DeadlineKu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
