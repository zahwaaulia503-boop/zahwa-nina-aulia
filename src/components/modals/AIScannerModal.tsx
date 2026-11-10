/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  Upload,
  Sparkles,
  AlertTriangle,
  Check,
  FileText,
  Calendar,
  Clock,
  ArrowRight,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AIService, AIScanResult } from '../../lib/aiService';
import { Priority, ActivityType } from '../../types';

export const AIScannerModal: React.FC = () => {
  const { isAIScanOpen, setIsAIScanOpen, categories, addTask, triggerConfetti } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState('image/jpeg');
  const [userNotes, setUserNotes] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Extracted Task Draft State
  const [draft, setDraft] = useState<AIScanResult | null>(null);

  if (!isAIScanOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageMime(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      setDraft(null);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleUseSampleImage = (type: 'chat' | 'exam' | 'bill') => {
    // Generate clean canvas SVG sample with realistic Indonesian text
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (type === 'chat') {
      ctx.fillStyle = '#0F1E1A';
      ctx.fillRect(0, 0, 600, 360);
      // Chat bubble
      ctx.fillStyle = '#1F352E';
      ctx.roundRect(40, 40, 520, 260, 16);
      ctx.fill();
      ctx.fillStyle = '#25D366';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('Pesan WhatsApp Dosen Pembimbing', 60, 80);
      ctx.fillStyle = '#EAECEF';
      ctx.font = '16px sans-serif';
      ctx.fillText('"Selamat siang teman-teman mahasiswa.', 60, 120);
      ctx.fillText('Jangan lupa Laporan Praktikum Modul 4 dikumpulkan', 60, 150);
      ctx.font = 'bold 17px sans-serif';
      ctx.fillStyle = '#A9C7E8';
      ctx.fillText('Jumat minggu ini paling lambat pukul 23:59 WIB.', 60, 185);
      ctx.fillStyle = '#EAECEF';
      ctx.font = '15px sans-serif';
      ctx.fillText('Format file PDF dengan lampiran data tabel.', 60, 220);
      ctx.fillStyle = '#858B98';
      ctx.font = '12px sans-serif';
      ctx.fillText('10:45 WIB • Dibaca', 460, 280);
    } else if (type === 'bill') {
      ctx.fillStyle = '#21252D';
      ctx.fillRect(0, 0, 600, 360);
      ctx.fillStyle = '#FFFFFF';
      ctx.roundRect(50, 30, 500, 290, 16);
      ctx.fill();
      ctx.fillStyle = '#F2B56B';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('TAGIHAN LISTRIK PLN PASCABAYAR', 80, 75);
      ctx.fillStyle = '#303642';
      ctx.font = '16px sans-serif';
      ctx.fillText('Nomor Pelanggan: 5321-9872-0012', 80, 115);
      ctx.fillText('Nama: ZAHWA AULIA', 80, 145);
      ctx.font = 'bold 20px sans-serif';
      ctx.fillStyle = '#E98E91';
      ctx.fillText('Total Tagihan: Rp 450.000', 80, 190);
      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = '#303642';
      ctx.fillText('Jatuh Tempo: Tanggal 20 pukul 21:00 WIB', 80, 230);
      ctx.fillStyle = '#858B98';
      ctx.font = '13px sans-serif';
      ctx.fillText('Harap lakukan pembayaran sebelum tanggal jatuh tempo.', 80, 270);
    } else {
      ctx.fillStyle = '#1E222A';
      ctx.fillRect(0, 0, 600, 360);
      ctx.fillStyle = '#FFFFFF';
      ctx.roundRect(40, 30, 520, 290, 16);
      ctx.fill();
      ctx.fillStyle = '#C6B8E8';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('PENGUMUMAN RAPAT KOORDINASI PROYEK', 70, 75);
      ctx.fillStyle = '#303642';
      ctx.font = '16px sans-serif';
      ctx.fillText('Agenda: Evaluasi Sprint Desain UI & Backend API', 70, 115);
      ctx.fillText('Lokasi: Google Meet (meet.google.com/abc-xyz)', 70, 150);
      ctx.font = 'bold 17px sans-serif';
      ctx.fillStyle = '#303642';
      ctx.fillText('Waktu: Besok pukul 10:00 - 11:30 WIB', 70, 190);
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#858B98';
      ctx.fillText('PIC: Zahwa Aulia • Estimasi durasi 90 menit', 70, 230);
    }

    const dataUrl = canvas.toDataURL('image/png');
    setImagePreview(dataUrl);
    setImageMime('image/png');
    setDraft(null);
    setErrorMsg(null);
  };

  const handleStartScan = async () => {
    if (!imagePreview) return;
    setIsScanning(true);
    setErrorMsg(null);

    try {
      const result = await AIService.scanTask(imagePreview, imageMime, userNotes);
      setDraft(result);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memproses gambar');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveToTasks = () => {
    if (!draft) return;

    // Find category ID
    let catId = categories[0].id;
    const foundCat = categories.find(
      (c) => c.name.toLowerCase() === (draft.category || '').toLowerCase()
    );
    if (foundCat) catId = foundCat.id;

    addTask({
      title: draft.title,
      description: draft.description || draft.summary,
      categoryId: catId,
      type: (draft.type as ActivityType) || 'task',
      priority: draft.priority || 'high',
      dueDate: draft.dueDate,
      dueTime: draft.dueTime || '23:59',
      estimatedMinutes: draft.estimatedMinutes || 60,
      amount: draft.amount,
      location: draft.location,
      subtasks: (draft.subtasks || []).map((st, i) => ({
        id: `st-scan-${Date.now()}-${i}`,
        title: st,
        completed: false,
      })),
    });

    triggerConfetti();
    setIsAIScanOpen(false);
    resetScanner();
  };

  const resetScanner = () => {
    setImagePreview(null);
    setDraft(null);
    setUserNotes('');
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white dark:bg-[#28334A] rounded-3xl shadow-2xl border border-slate-200/80 dark:border-[#36435E] p-5 sm:p-6 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#36435E]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#75C9C0] to-[#6575C9] flex items-center justify-center text-white shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#303642] dark:text-white flex items-center gap-1.5">
                <span>AI Task Scanner</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#75C9C0]/20 text-[#347F80] dark:text-[#A9DCD5] border border-[#75C9C0]/30">
                  Multimodal Gemini
                </span>
              </h2>
              <p className="text-xs text-[#858B98] dark:text-slate-400">
                Pindai chat, dokumen tugas kuliah, silabus, atau foto tagihan langsung jadi aktivitas
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAIScanOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1A2130] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload & Sample Section */}
        {!imagePreview && (
          <div className="mt-5 space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200/80 dark:border-[#36435E] hover:border-[#75C9C0] dark:hover:border-[#75C9C0] rounded-3xl p-8 text-center cursor-pointer bg-slate-50/50 dark:bg-[#1A2130]/50 hover:bg-slate-50 dark:hover:bg-[#1A2130] transition-all group"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-white dark:bg-[#28334A] shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:scale-105 transition-transform border border-slate-100 dark:border-[#36435E]">
                <Upload className="w-7 h-7 text-[#6575C9]" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-[#303642] dark:text-slate-200">
                Pilih atau Seret Foto/Dokumen ke Sini
              </h3>
              <p className="mt-1 text-xs text-[#858B98] dark:text-slate-400 max-w-sm mx-auto">
                Mendukung tangkapan layar WhatsApp, instruksi tugas dosen, surat pengumuman, atau nota tagihan (PNG, JPG, WebP)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Preset Samples */}
            <div>
              <p className="text-xs font-semibold text-[#303642] dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#F2B56B]" />
                <span>Atau uji coba langsung dengan contoh tangkapan layar:</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleUseSampleImage('chat')}
                  className="p-3 text-left bg-slate-50 dark:bg-[#1A2130] hover:bg-slate-100 dark:hover:bg-[#1A2130]/80 border border-slate-200 dark:border-[#36435E] hover:border-[#75C9C0] rounded-2xl transition-all cursor-pointer"
                >
                  <span className="text-xs font-bold text-[#303642] dark:text-slate-200 block">
                    💬 Chat WA Dosen
                  </span>
                  <span className="text-[11px] text-[#858B98] dark:text-slate-400 line-clamp-1">
                    "Laporan praktikum dikumpulkan Jumat 23:59..."
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleUseSampleImage('bill')}
                  className="p-3 text-left bg-slate-50 dark:bg-[#1A2130] hover:bg-slate-100 dark:hover:bg-[#1A2130]/80 border border-slate-200 dark:border-[#36435E] hover:border-[#75C9C0] rounded-2xl transition-all cursor-pointer"
                >
                  <span className="text-xs font-bold text-[#303642] dark:text-slate-200 block">
                    ⚡ Tagihan PLN
                  </span>
                  <span className="text-[11px] text-[#858B98] dark:text-slate-400 line-clamp-1">
                    Tagihan listrik Rp 450.000 jatuh tempo tgl 20
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleUseSampleImage('exam')}
                  className="p-3 text-left bg-slate-50 dark:bg-[#1A2130] hover:bg-slate-100 dark:hover:bg-[#1A2130]/80 border border-slate-200 dark:border-[#36435E] hover:border-[#75C9C0] rounded-2xl transition-all cursor-pointer"
                >
                  <span className="text-xs font-bold text-[#303642] dark:text-slate-200 block">
                    📢 Rapat Proyek
                  </span>
                  <span className="text-[11px] text-[#858B98] dark:text-slate-400 line-clamp-1">
                    Rapat evaluasi sprint besok jam 10:00 di GMeet
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image Preview & Scanner Controls */}
        {imagePreview && !draft && (
          <div className="mt-4 space-y-3">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-[#36435E] bg-slate-900 max-h-64 flex items-center justify-center">
              <img
                src={imagePreview}
                alt="Preview to scan"
                className="max-h-64 object-contain w-full"
              />
              <button
                onClick={resetScanner}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                title="Ganti Gambar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#303642] dark:text-slate-300 mb-1">
                Catatan Tambahan (Opsional)
              </label>
              <input
                type="text"
                placeholder="Misal: 'Tugas mata kuliah Statistika' atau 'Ini tagihan rumah tangga'"
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#1A2130] border border-slate-200 dark:border-[#36435E] rounded-xl outline-none focus:border-[#75C9C0] text-[#303642] dark:text-white"
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-[#E98E91]/15 border border-[#E98E91]/30 text-xs text-[#E98E91]">
                {errorMsg}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={resetScanner}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1A2130] rounded-xl"
              >
                Ganti Gambar
              </button>
              <button
                type="button"
                disabled={isScanning}
                onClick={handleStartScan}
                className="px-6 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-[#75C9C0] to-[#6575C9] hover:opacity-95 text-white shadow-md shadow-[#6575C9]/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menganalisis Gambar dengan Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Pindai Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Draft Result Confirmation View */}
        {draft && (
          <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Ambiguity Alert */}
            {draft.requiresConfirmation && (
              <div className="p-3.5 rounded-2xl bg-[#F2B56B]/15 border border-[#F2B56B]/30 text-[#F2B56B] text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#F2B56B] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Perlu Konfirmasi Anda:</span>
                  <span>{draft.ambiguityReason || 'Beberapa tanggal atau detail tidak disebutkan secara eksplisit. Harap tinjau rancangan di bawah.'}</span>
                </div>
              </div>
            )}

            {/* Editable Extracted Fields Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1A2130] border border-slate-200 dark:border-[#36435E] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#858B98]">
                  Rancangan Aktivitas Hasil Pindaian
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#82BFA4]/20 text-[#347F80] dark:text-[#82BFA4] font-semibold border border-[#82BFA4]/30">
                  {draft.category}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#303642] dark:text-slate-300 mb-1">
                  Nama Aktivitas
                </label>
                <input
                  type="text"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm font-semibold bg-white dark:bg-[#28334A] border border-slate-200 dark:border-[#36435E] rounded-xl outline-none focus:border-[#75C9C0] text-[#303642] dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-[#858B98] mb-0.5">
                    Tanggal Deadline
                  </label>
                  <input
                    type="date"
                    value={draft.dueDate || ''}
                    onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })}
                    className="w-full px-2 py-1 text-xs bg-white dark:bg-[#28334A] border border-slate-200 dark:border-[#36435E] rounded-lg text-[#303642] dark:text-white focus:border-[#75C9C0]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#858B98] mb-0.5">
                    Jam Deadline
                  </label>
                  <input
                    type="time"
                    value={draft.dueTime || '23:59'}
                    onChange={(e) => setDraft({ ...draft, dueTime: e.target.value })}
                    className="w-full px-2 py-1 text-xs bg-white dark:bg-[#28334A] border border-slate-200 dark:border-[#36435E] rounded-lg text-[#303642] dark:text-white focus:border-[#75C9C0]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#858B98] mb-0.5">
                    Prioritas
                  </label>
                  <select
                    value={draft.priority}
                    onChange={(e) => setDraft({ ...draft, priority: e.target.value as Priority })}
                    className="w-full px-2 py-1 text-xs bg-white dark:bg-[#28334A] border border-slate-200 dark:border-[#36435E] rounded-lg text-[#303642] dark:text-white focus:border-[#75C9C0]"
                  >
                    <option value="low">Rendah</option>
                    <option value="medium">Sedang</option>
                    <option value="high">Tinggi</option>
                    <option value="urgent">Mendesak</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#858B98] mb-0.5">
                    Estimasi Menit
                  </label>
                  <input
                    type="number"
                    value={draft.estimatedMinutes || 60}
                    onChange={(e) => setDraft({ ...draft, estimatedMinutes: Number(e.target.value) })}
                    className="w-full px-2 py-1 text-xs bg-white dark:bg-[#28334A] border border-slate-200 dark:border-[#36435E] rounded-lg text-[#303642] dark:text-white focus:border-[#75C9C0]"
                  />
                </div>
              </div>

              {draft.amount ? (
                <div>
                  <label className="block text-[10px] font-semibold text-[#858B98] mb-0.5">
                    Nominal Tagihan
                  </label>
                  <input
                    type="number"
                    value={draft.amount}
                    onChange={(e) => setDraft({ ...draft, amount: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#28334A] border border-slate-200 dark:border-[#36435E] rounded-lg text-[#303642] dark:text-white focus:border-[#75C9C0]"
                  />
                </div>
              ) : null}

              {/* Subtasks if extracted */}
              {draft.subtasks && draft.subtasks.length > 0 && (
                <div>
                  <label className="block text-[11px] font-semibold text-[#303642] dark:text-slate-300 mb-1">
                    Langkah yang Terdeteksi ({draft.subtasks.length})
                  </label>
                  <ul className="space-y-1">
                    {draft.subtasks.map((st, i) => (
                      <li
                        key={i}
                        className="text-xs text-[#303642] dark:text-slate-200 flex items-center gap-2 bg-white dark:bg-[#28334A] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#36435E]"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#75C9C0]"></span>
                        <span>{st}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Summary */}
              {draft.summary && (
                <p className="text-xs text-[#858B98] italic">
                  "{draft.summary}"
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={resetScanner}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1A2130] rounded-xl cursor-pointer"
              >
                Pindai Gambar Lain
              </button>
              <button
                type="button"
                onClick={handleSaveToTasks}
                className="px-6 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-[#75C9C0] to-[#6575C9] hover:opacity-95 text-white flex items-center gap-2 cursor-pointer shadow-md shadow-[#6575C9]/20"
              >
                <Check className="w-4 h-4" />
                <span>Setujui & Simpan ke Aktivitas</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
