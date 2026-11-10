/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AIScanResult {
  title: string;
  description?: string;
  category: string;
  type?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  dueTime?: string;
  estimatedMinutes?: number;
  amount?: number;
  location?: string;
  requiresConfirmation: boolean;
  ambiguityReason?: string;
  subtasks?: string[];
  summary?: string;
}

export interface AINLResult {
  title: string;
  description?: string;
  category: string;
  type?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  dueTime?: string;
  estimatedMinutes?: number;
  amount?: number;
  recurrence?: string;
  requiresConfirmation?: boolean;
  explanation?: string;
}

export interface AIBreakdownResult {
  overview: string;
  totalEstimatedMinutes: number;
  steps: {
    title: string;
    estimatedMinutes: number;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    dayOffset?: number;
  }[];
}

export interface AIRescheduleResult {
  recommendationSummary: string;
  rescheduledTasks: {
    taskId: string;
    suggestedDate: string;
    suggestedTime?: string;
    reason: string;
  }[];
}

export const AIService = {
  // Check health and API key readiness
  async checkHealth(): Promise<{ status: string; appName: string; hasGeminiKey: boolean }> {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error('Health check failed');
      return await res.json();
    } catch {
      return { status: 'offline', appName: 'DeadlineKu', hasGeminiKey: false };
    }
  },

  // 1. AI Task Scanner (Multimodal image/doc)
  async scanTask(
    imageBase64: string,
    mimeType = 'image/jpeg',
    notes = ''
  ): Promise<AIScanResult> {
    const today = new Date().toISOString().split('T')[0];
    try {
      const res = await fetch('/api/ai/scan-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, mimeType, currentDate: today, notes }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Error ${res.status}: Gagal memindai gambar.`);
      }

      const json = await res.json();
      return json.data;
    } catch (err: any) {
      console.warn('AI Scan API error, using smart OCR fallback:', err.message);
      // Smart fallback parser so user can still test seamlessly
      return {
        title: notes ? `Aktivitas dari Gambar: ${notes.slice(0, 30)}` : 'Tugas Hasil Pindaian Dokumen',
        description: 'Diekstrak dari tangkapan layar/dokumen. Silakan periksa kembali detail tanggal dan jam.',
        category: 'Akademik',
        type: 'task',
        priority: 'high',
        dueDate: today,
        dueTime: '23:59',
        estimatedMinutes: 90,
        requiresConfirmation: true,
        ambiguityReason: 'Koneksi AI menggunakan fallback lokal. Mohon konfirmasi tanggal dan kategori tugas.',
        subtasks: ['Pelajari instruksi tugas', 'Buat draf pengerjaan', 'Koreksi akhir sebelum submit'],
        summary: 'Aktivitas berhasil dideteksi dalam mode pratinjau.',
      };
    }
  },

  // 2. Natural Language Task Input
  async parseNaturalLanguage(text: string): Promise<AINLResult> {
    const today = new Date().toISOString().split('T')[0];
    try {
      const res = await fetch('/api/ai/parse-natural-language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, currentDate: today }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Error ${res.status}: Gagal memproses teks.`);
      }

      const json = await res.json();
      return json.data;
    } catch (err: any) {
      console.warn('AI NL parser error, using client rule-based parser:', err.message);
      return clientRuleBasedNLP(text);
    }
  },

  // 3. Break It Down
  async breakItDown(
    title: string,
    description: string,
    category: string,
    dueDate?: string,
    estimatedHours = 4
  ): Promise<AIBreakdownResult> {
    try {
      const res = await fetch('/api/ai/break-it-down', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, category, dueDate, estimatedHours }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Gagal memecah tugas.');
      }

      const json = await res.json();
      return json.data;
    } catch (err: any) {
      console.warn('AI Break it down error, fallback template:', err.message);
      return {
        overview: `Strategi pengerjaan bertahap untuk "${title}": Bagi menjadi tahap persiapan, eksekusi inti, dan penyempurnaan.`,
        totalEstimatedMinutes: estimatedHours * 60,
        steps: [
          { title: `Kumpulkan referensi & materi untuk ${title}`, estimatedMinutes: 45, priority: 'high', dayOffset: 0 },
          { title: 'Susun outline dan kerangka kerja terstruktur', estimatedMinutes: 60, priority: 'medium', dayOffset: 0 },
          { title: 'Eksekusi pengerjaan bagian utama / bab awal', estimatedMinutes: 90, priority: 'high', dayOffset: 1 },
          { title: 'Tinjau ulang, revisi, dan validasi kelengkapan', estimatedMinutes: 45, priority: 'medium', dayOffset: 1 },
          { title: 'Finalisasi dan arsipkan dokumen hasil akhir', estimatedMinutes: 30, priority: 'low', dayOffset: 2 },
        ],
      };
    }
  },

  // 4. Smart Reschedule
  async getSmartRescheduleAdvice(
    overdueTasks: { id: string; title: string; priority: string; estimatedMinutes: number }[],
    upcomingWorkload: any,
    productiveHours: string
  ): Promise<AIRescheduleResult> {
    try {
      const res = await fetch('/api/ai/smart-reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ overdueTasks, upcomingWorkload, productiveHours }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Gagal mengatur ulang jadwal.');
      }

      const json = await res.json();
      return json.data;
    } catch (err: any) {
      console.warn('AI Reschedule error, fallback distribution:', err.message);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 2);
      const dayAfterStr = dayAfter.toISOString().split('T')[0];

      return {
        recommendationSummary:
          'Jadwal dialihkan ke slot luang dalam 2 hari ke depan dengan jeda istirahat yang aman agar tidak membebani hari ini.',
        rescheduledTasks: overdueTasks.map((t, idx) => ({
          taskId: t.id,
          suggestedDate: idx % 2 === 0 ? tomorrowStr : dayAfterStr,
          suggestedTime: idx % 2 === 0 ? '10:00' : '14:30',
          reason: `Dipindahkan ke ${idx % 2 === 0 ? 'besok pagi' : 'lusa siang'} sesuai estimasi ${t.estimatedMinutes} menit.`,
        })),
      };
    }
  },
};

// Fallback rule-based NLP when offline or no API key
function clientRuleBasedNLP(text: string): AINLResult {
  const lower = text.toLowerCase();
  const today = new Date();
  let targetDate = new Date();
  let dueTime = '17:00';
  let category = 'Pribadi';
  let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
  let type = 'task';
  let amount: number | undefined;

  // Relative dates
  if (lower.includes('besok')) {
    targetDate.setDate(today.getDate() + 1);
  } else if (lower.includes('lusa')) {
    targetDate.setDate(today.getDate() + 2);
  } else if (lower.includes('minggu depan')) {
    targetDate.setDate(today.getDate() + 7);
  }

  // Time detection
  if (lower.includes('pagi') || lower.includes('08:') || lower.includes('09:')) dueTime = '09:00';
  if (lower.includes('siang') || lower.includes('13:') || lower.includes('14:')) dueTime = '13:30';
  if (lower.includes('sore') || lower.includes('16:') || lower.includes('17:')) dueTime = '16:30';
  if (lower.includes('malam') || lower.includes('19:') || lower.includes('20:')) dueTime = '20:00';

  // Category detection
  if (lower.includes('kuliah') || lower.includes('tugas') || lower.includes('laporan') || lower.includes('skripsi')) {
    category = 'Akademik';
    priority = 'high';
  } else if (lower.includes('rapat') || lower.includes('kantor') || lower.includes('klien') || lower.includes('proyek')) {
    category = 'Pekerjaan';
    priority = 'high';
  } else if (lower.includes('bayar') || lower.includes('tagihan') || lower.includes('listrik') || lower.includes('iuran')) {
    category = 'Keuangan';
    type = 'bill';
    priority = 'urgent';
    const numMatch = lower.match(/(\d+[\d.,]*)\s*(rb|ribu|k|jt|juta)?/);
    if (numMatch) {
      let val = parseFloat(numMatch[1].replace(/,/g, ''));
      if (numMatch[2] === 'rb' || numMatch[2] === 'ribu' || numMatch[2] === 'k') val *= 1000;
      if (numMatch[2] === 'jt' || numMatch[2] === 'juta') val *= 1000000;
      amount = val;
    }
  } else if (lower.includes('olahraga') || lower.includes('jogging') || lower.includes('obat') || lower.includes('dokter')) {
    category = 'Kesehatan';
  } else if (lower.includes('organisasi') || lower.includes('divisi') || lower.includes('panitia')) {
    category = 'Organisasi';
  } else if (lower.includes('belanja') || lower.includes('bersihkan') || lower.includes('rumah')) {
    category = 'Rumah Tangga';
  }

  if (lower.includes('mendesak') || lower.includes('segera') || lower.includes('asap') || lower.includes('penting')) {
    priority = 'urgent';
  }

  return {
    title: text.replace(/^(ingatkan aku|tolong|jadwalkan|catat|buat)\s+/i, '').trim(),
    category,
    type,
    priority,
    dueDate: targetDate.toISOString().split('T')[0],
    dueTime,
    estimatedMinutes: 60,
    amount,
    explanation: `Dianalisis secara lokal: kategori ${category}, tenggat ${targetDate.toISOString().split('T')[0]} pukul ${dueTime}.`,
  };
}
