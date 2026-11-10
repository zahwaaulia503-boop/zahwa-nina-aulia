/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Target,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Clock,
  Coffee,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const FocusPage: React.FC = () => {
  const {
    tasks,
    focusSessions,
    addFocusSession,
  } = useApp();

  const activeTasks = tasks.filter((t) => t.status !== 'completed');

  // Selected linked task
  const [selectedTaskId, setSelectedTaskId] = useState<string>(activeTasks[0]?.id || '');

  // Modes: 25m, 45m, 60m, custom, break (5m), free
  const [mode, setMode] = useState<'25' | '45' | '60' | 'break' | 'free'>('25');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [freeElapsedSeconds, setFreeElapsedSeconds] = useState(0);

  // Sound ambience (Web Audio API synthetic soothing pink noise)
  const [isSoundOn, setIsSoundOn] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  // Timer loop
  useEffect(() => {
    let interval: any = null;

    if (isRunning) {
      interval = setInterval(() => {
        if (mode === 'free') {
          setFreeElapsedSeconds((prev) => prev + 1);
        } else {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              handleSessionComplete();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isRunning, mode]);

  const handleSessionComplete = () => {
    setIsRunning(false);
    const duration =
      mode === '25' ? 25 : mode === '45' ? 45 : mode === '60' ? 60 : 5;
    const task = tasks.find((t) => t.id === selectedTaskId);

    addFocusSession({
      taskId: task?.id,
      taskTitle: task?.title || 'Fokus Mandiri',
      durationMinutes: duration,
      mode: mode === 'break' ? 'short_break' : 'pomodoro',
    });

    setTimerForMode(mode);
  };

  const handleStopFreeMode = () => {
    setIsRunning(false);
    const durationMins = Math.max(1, Math.round(freeElapsedSeconds / 60));
    const task = tasks.find((t) => t.id === selectedTaskId);

    addFocusSession({
      taskId: task?.id,
      taskTitle: task?.title || 'Fokus Bebas',
      durationMinutes: durationMins,
      mode: 'free',
    });

    setFreeElapsedSeconds(0);
  };

  const setTimerForMode = (newMode: '25' | '45' | '60' | 'break' | 'free') => {
    setMode(newMode);
    setIsRunning(false);
    if (newMode === '25') setTimeLeft(25 * 60);
    else if (newMode === '45') setTimeLeft(45 * 60);
    else if (newMode === '60') setTimeLeft(60 * 60);
    else if (newMode === 'break') setTimeLeft(5 * 60);
    else setFreeElapsedSeconds(0);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimerForMode(mode);
  };

  // Toggle ambient white noise using Web Audio
  const toggleSound = () => {
    if (isSoundOn) {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      setIsSoundOn(false);
    } else {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          data[i] = (b0 + b1 + b2) * 0.05;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);

        noise.connect(gainNode);
        gainNode.connect(ctx.destination);
        noise.start();

        noiseNodeRef.current = noise;
        setIsSoundOn(true);
      } catch (e) {
        console.error('Audio not allowed or supported', e);
      }
    }
  };

  // Format mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const totalFocusAllTime = focusSessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-center sm:text-left">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#303642] dark:text-white flex items-center justify-center sm:justify-start gap-2">
            <Target className="w-6 h-6 text-[#75C9C0]" />
            <span>Ruang Fokus (Focus Mode)</span>
          </h1>
          <p className="text-xs text-[#858B98]">
            Heningkan distraksi, pasang target waktu, dan nikmati alur produktivitas Anda
          </p>
        </div>

        {/* Sound toggle button */}
        <button
          onClick={toggleSound}
          className={`self-center px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            isSoundOn
              ? 'bg-gradient-to-r from-[#75C9C0] to-[#6575C9] text-white shadow-sm'
              : 'bg-white dark:bg-[#28334A] border border-slate-200 dark:border-[#36435E] text-[#858B98] hover:text-[#303642] dark:hover:text-white'
          }`}
        >
          {isSoundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span>{isSoundOn ? 'Suara Derau Lembut Aktif' : 'Aktifkan Suara Derau'}</span>
        </button>
      </div>

      {/* Main Focus Card with Teal & Indigo Gradient Accents */}
      <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#28334A] border border-slate-200/80 dark:border-[#36435E] shadow-xl text-center space-y-6 transition-all relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-[#75C9C0]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-[#6575C9]/10 blur-3xl pointer-events-none" />

        {/* Linked Task Selector */}
        <div className="max-w-md mx-auto relative z-10">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#858B98] mb-1.5">
            Aktivitas yang Sedang Difokuskan:
          </label>
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            className="w-full px-4 py-2.5 text-xs font-bold bg-[#F5F6F8] dark:bg-[#1A2130] border border-slate-200 dark:border-[#36435E] rounded-2xl outline-none focus:border-[#75C9C0] text-[#303642] dark:text-white cursor-pointer truncate"
          >
            <option value="">-- Fokus Bebas Mandiri --</option>
            {activeTasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.estimatedMinutes} mnt)
              </option>
            ))}
          </select>
        </div>

        {/* Mode Selector Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 relative z-10">
          <button
            onClick={() => setTimerForMode('25')}
            className={`px-4 py-2 text-xs font-bold rounded-2xl transition-all cursor-pointer ${
              mode === '25'
                ? 'bg-gradient-to-r from-[#75C9C0] to-[#6575C9] text-white shadow-md'
                : 'bg-[#F5F6F8] dark:bg-[#1A2130] text-[#858B98] hover:text-[#303642] dark:hover:text-white'
            }`}
          >
            Pomodoro (25m)
          </button>
          <button
            onClick={() => setTimerForMode('45')}
            className={`px-4 py-2 text-xs font-bold rounded-2xl transition-all cursor-pointer ${
              mode === '45'
                ? 'bg-gradient-to-r from-[#75C9C0] to-[#6575C9] text-white shadow-md'
                : 'bg-[#F5F6F8] dark:bg-[#1A2130] text-[#858B98] hover:text-[#303642] dark:hover:text-white'
            }`}
          >
            Deep Focus (45m)
          </button>
          <button
            onClick={() => setTimerForMode('60')}
            className={`px-4 py-2 text-xs font-bold rounded-2xl transition-all cursor-pointer ${
              mode === '60'
                ? 'bg-gradient-to-r from-[#75C9C0] to-[#6575C9] text-white shadow-md'
                : 'bg-[#F5F6F8] dark:bg-[#1A2130] text-[#858B98] hover:text-[#303642] dark:hover:text-white'
            }`}
          >
            Intensif (60m)
          </button>
          <button
            onClick={() => setTimerForMode('break')}
            className={`px-4 py-2 text-xs font-bold rounded-2xl transition-all cursor-pointer ${
              mode === 'break'
                ? 'bg-[#82BFA4] text-white shadow-md'
                : 'bg-[#82BFA4]/20 text-[#347F80] dark:text-[#82BFA4]'
            }`}
          >
            ☕ Istirahat (5m)
          </button>
          <button
            onClick={() => setTimerForMode('free')}
            className={`px-4 py-2 text-xs font-bold rounded-2xl transition-all cursor-pointer ${
              mode === 'free'
                ? 'bg-[#6575C9] text-white shadow-md'
                : 'bg-[#F5F6F8] dark:bg-[#1A2130] text-[#858B98] hover:text-[#303642] dark:hover:text-white'
            }`}
          >
            Fokus Bebas
          </button>
        </div>

        {/* Large Timer Display */}
        <div className="py-6 select-none relative z-10">
          <div className="font-mono text-6xl sm:text-8xl font-black tracking-tight text-[#303642] dark:text-white">
            {mode === 'free' ? formatTime(freeElapsedSeconds) : formatTime(timeLeft)}
          </div>
          <p className="text-xs text-[#858B98] mt-2 font-semibold">
            {isRunning ? 'Sesi fokus sedang berlangsung... Konsentrasi penuh.' : 'Tekan Mulai untuk mengawali fokus'}
          </p>
        </div>

        {/* Primary Controls */}
        <div className="flex items-center justify-center gap-3 relative z-10">
          {mode === 'free' ? (
            <>
              {!isRunning ? (
                <button
                  onClick={() => setIsRunning(true)}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#75C9C0] to-[#6575C9] text-white text-sm font-bold flex items-center gap-2 shadow-lg hover:opacity-95 active:scale-98 transition-all cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Mulai Stopwatch</span>
                </button>
              ) : (
                <button
                  onClick={handleStopFreeMode}
                  className="px-8 py-3.5 rounded-2xl bg-[#82BFA4] text-white text-sm font-bold flex items-center gap-2 shadow-lg hover:opacity-95 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Simpan Sesi Fokus</span>
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#75C9C0] to-[#6575C9] text-white text-sm font-bold flex items-center gap-2 shadow-lg hover:opacity-95 active:scale-98 transition-all cursor-pointer"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5 fill-current" />
                    <span>Jeda</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    <span>Mulai Fokus</span>
                  </>
                )}
              </button>

              <button
                onClick={handleReset}
                className="p-3.5 rounded-2xl bg-[#F5F6F8] hover:bg-[#E4E5FA] dark:bg-[#1A2130] dark:hover:bg-[#1A2130]/80 text-[#858B98] hover:text-[#303642] dark:hover:text-white transition-colors cursor-pointer"
                title="Atur Ulang Timer"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Focus Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-3xl bg-white dark:bg-[#28334A] border border-slate-200/80 dark:border-[#36435E] text-center shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#858B98]">
            Total Sesi Selesai
          </span>
          <div className="text-2xl font-black text-[#303642] dark:text-white mt-1">
            {focusSessions.length} Sesi
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#28334A] border border-slate-200/80 dark:border-[#36435E] text-center shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#858B98]">
            Total Jam Fokus
          </span>
          <div className="text-2xl font-black text-[#347F80] dark:text-[#75C9C0] mt-1">
            {Math.round((totalFocusAllTime / 60) * 10) / 10} Jam
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#28334A] border border-slate-200/80 dark:border-[#36435E] text-center shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#858B98]">
            Rata-rata Durasi
          </span>
          <div className="text-2xl font-black text-[#6575C9] dark:text-[#B9BFF0] mt-1">
            {focusSessions.length > 0
              ? Math.round(totalFocusAllTime / focusSessions.length)
              : 0}{' '}
            Mnt
          </div>
        </div>
      </div>

      {/* Recent Focus History */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#28334A] border border-slate-200/80 dark:border-[#36435E] shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-[#303642] dark:text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#75C9C0]" />
          <span>Riwayat Sesi Fokus Terakhir</span>
        </h3>

        <div className="space-y-2">
          {focusSessions.slice(0, 5).map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-[#F5F6F8] dark:bg-[#1A2130] border border-slate-100 dark:border-[#36435E]/60"
            >
              <div>
                <h4 className="text-xs font-bold text-[#303642] dark:text-white">
                  {session.taskTitle || 'Fokus Mandiri'}
                </h4>
                <span className="text-[10px] text-[#858B98]">
                  {new Date(session.completedAt).toLocaleDateString('id-ID')} • Mode {session.mode}
                </span>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-[#75C9C0]/20 text-[#347F80] dark:text-[#75C9C0]">
                {session.durationMinutes} Menit
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
