/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { Logo } from '../common/Logo';
import { useApp } from '../../context/AppContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, userProfile, updateUserProfile, triggerConfetti } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState(userProfile.name || '');
  const [email, setEmail] = useState(userProfile.email || '');
  const [password, setPassword] = useState('');
  const [roleTitle, setRoleTitle] = useState(userProfile.roleTitle || 'Mahasiswa');
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    if (mode === 'register') {
      updateUserProfile({
        name: name.trim() || 'Pengguna Baru',
        email: email.trim(),
        roleTitle,
      });
      setFeedback('Akun DeadlineKu berhasil didaftarkan!');
    } else {
      updateUserProfile({
        email: email.trim(),
      });
      setFeedback('Berhasil masuk ke akun Anda!');
    }

    triggerConfetti();
    setTimeout(() => {
      setFeedback(null);
      setIsAuthModalOpen(false);
      setPassword('');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-[#28334A] rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-700/80 p-6 sm:p-7 transition-all">
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Logo Header */}
        <div className="flex flex-col items-center text-center pt-2">
          <Logo variant="main" size="lg" showSlogan={false} />
          <h2 className="text-base font-extrabold text-[#303642] dark:text-white mt-3">
            {mode === 'login' ? 'Masuk ke Akun Anda' : 'Buat Akun DeadlineKu'}
          </h2>
          <p className="text-xs text-[#858B98] dark:text-[#B9BFF0]/80 mt-0.5">
            {mode === 'login'
              ? 'Kelola jadwal, deadline, dan fokus harian Anda'
              : 'Mulai kelola seluruh aktivitas dengan gaya Teal & Indigo'}
          </p>
        </div>

        {/* Tab Toggle (Masuk / Daftar) */}
        <div className="flex items-center bg-[#F5F6F8] dark:bg-[#1A2130] p-1 rounded-2xl mt-5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setFeedback(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white dark:bg-[#28334A] text-[#28334A] dark:text-white shadow-xs'
                : 'text-[#858B98] hover:text-[#303642]'
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setFeedback(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-white dark:bg-[#28334A] text-[#28334A] dark:text-white shadow-xs'
                : 'text-[#858B98] hover:text-[#303642]'
            }`}
          >
            Daftar Akun
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-bold text-[#303642] dark:text-slate-300 mb-1">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Contoh: Zahwa Aulia"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#F5F6F8] dark:bg-[#1A2130] border border-slate-200/80 dark:border-slate-700 rounded-xl outline-none focus:border-[#75C9C0] text-[#303642] dark:text-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-[#303642] dark:text-slate-300 mb-1">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#F5F6F8] dark:bg-[#1A2130] border border-slate-200/80 dark:border-slate-700 rounded-xl outline-none focus:border-[#75C9C0] text-[#303642] dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#303642] dark:text-slate-300 mb-1">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#F5F6F8] dark:bg-[#1A2130] border border-slate-200/80 dark:border-slate-700 rounded-xl outline-none focus:border-[#75C9C0] text-[#303642] dark:text-white"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-bold text-[#303642] dark:text-slate-300 mb-1">
                Peran Utama
              </label>
              <select
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F5F6F8] dark:bg-[#1A2130] border border-slate-200/80 dark:border-slate-700 rounded-xl outline-none text-[#303642] dark:text-white cursor-pointer"
              >
                <option value="Mahasiswa">Mahasiswa</option>
                <option value="Pelajar">Pelajar</option>
                <option value="Pekerja Kantoran">Pekerja Kantoran</option>
                <option value="Pekerja Lepas (Freelancer)">Pekerja Lepas (Freelancer)</option>
                <option value="Pengusaha">Pengusaha</option>
                <option value="Ibu Rumah Tangga">Ibu Rumah Tangga</option>
                <option value="Masyarakat Umum">Masyarakat Umum</option>
              </select>
            </div>
          )}

          {feedback && (
            <div className="p-2.5 rounded-xl bg-[#75C9C0]/20 border border-[#75C9C0]/40 text-[#347F80] dark:text-[#75C9C0] text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{feedback}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 mt-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#75C9C0] to-[#6575C9] hover:opacity-95 transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
          >
            <span>{mode === 'login' ? 'Masuk Sekarang' : 'Daftar Akun Baru'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[11px] text-center text-[#858B98] mt-4">
          Data Anda disimpan aman secara lokal di peramban dan tersinkronisasi.
        </p>
      </div>
    </div>
  );
};
