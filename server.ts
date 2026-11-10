import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '30mb' }));

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Health endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    appName: 'DeadlineKu',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// AI Task Scanner (Multimodal image/screenshot/doc to Task)
app.post('/api/ai/scan-task', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', currentDate, notes } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY belum dikonfigurasi di secrets.',
      });
    }

    if (!imageBase64) {
      return res.status(400).json({ error: 'Data gambar wajib disertakan.' });
    }

    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
    const referenceDate = currentDate || new Date().toISOString().split('T')[0];

    const prompt = `Anda adalah asisten AI dari aplikasi manajemen aktivitas 'DeadlineKu'.
Analisis gambar berikut (dapat berupa tangkapan layar chat WhatsApp/Telegram, dokumen tugas kuliah, silabus, catatan tangan, foto nota/tagihan, atau pengumuman kantor).
Tanggal hari ini sebagai patokan: ${referenceDate} (Tahun ${referenceDate.slice(0, 4)}).
Catatan tambahan pengguna: ${notes || 'Tidak ada'}.

Ekstrak informasi aktivitas secara akurat dalam Bahasa Indonesia.
Kategori yang tersedia: 'Akademik', 'Pekerjaan', 'Organisasi', 'Bisnis', 'Pribadi', 'Rumah Tangga', 'Kesehatan', 'Keuangan', 'Proyek'.
Prioritas: 'low' (Rendah), 'medium' (Sedang), 'high' (Tinggi), 'urgent' (Mendesak).
Tipe: 'task' (Tugas sekali selesai), 'recurring' (Berulang), 'project' (Proyek), 'event' (Acara), 'reminder' (Pengingat), 'bill' (Tagihan), 'routine' (Rutinitas).

Jika tanggal tidak jelas atau ambigu, set requiresConfirmation: true dan jelaskan di ambiguityReason.
Format tanggal dueDate harus 'YYYY-MM-DD' atau null. Jam dueTime dalam format 'HH:mm' 24 jam (misal '23:59').`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType.includes('/') ? mimeType : 'image/jpeg',
              data: cleanBase64,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Judul tugas yang jelas dan padat' },
            description: { type: Type.STRING, description: 'Deskripsi lengkap atau isi pengumuman/chat' },
            category: { type: Type.STRING, description: 'Nama kategori yang paling cocok' },
            type: { type: Type.STRING, description: 'Tipe aktivitas (task, bill, event, etc.)' },
            priority: { type: Type.STRING, description: 'Tingkat prioritas (low, medium, high, urgent)' },
            dueDate: { type: Type.STRING, description: 'Tanggal jatuh tempo YYYY-MM-DD atau kosong jika tidak disebutkan' },
            dueTime: { type: Type.STRING, description: 'Waktu deadline HH:mm atau kosong' },
            estimatedMinutes: { type: Type.INTEGER, description: 'Estimasi waktu pengerjaan dalam menit' },
            amount: { type: Type.NUMBER, description: 'Nominal tagihan jika berupa pembayaran/keuangan, atau 0' },
            location: { type: Type.STRING, description: 'Lokasi jika berupa event/rapat' },
            requiresConfirmation: { type: Type.BOOLEAN, description: 'True jika ada info yang ragu/kurang lengkap' },
            ambiguityReason: { type: Type.STRING, description: 'Penjelasan jika butuh konfirmasi tanggal/detail' },
            subtasks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Langkah-langkah kecil pengerjaan jika tugas kompleks',
            },
            summary: { type: Type.STRING, description: 'Ringkasan singkat hasil deteksi dalam bahasa Indonesia' },
          },
          required: ['title', 'category', 'priority', 'requiresConfirmation'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Scan task error:', error);
    return res.status(500).json({ error: error.message || 'Gagal memindai gambar.' });
  }
});

// Natural Language Input parser
app.post('/api/ai/parse-natural-language', async (req, res) => {
  try {
    const { text, currentDate } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY belum dikonfigurasi.',
      });
    }

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Teks input wajib diisi.' });
    }

    const referenceDate = currentDate || new Date().toISOString().split('T')[0];

    const prompt = `Anda adalah parser bahasa alami untuk aplikasi DeadlineKu.
Ubah teks input pengguna dalam bahasa Indonesia menjadi rancangan aktivitas yang terstruktur.
Tanggal acuan hari ini: ${referenceDate}.
Teks pengguna: "${text}"

Ketentuan:
- Pahami istilah hari relatif seperti "besok", "lusa", "Jumat depan", "sore ini", "jam 8 malam (20:00)", "setiap Senin dan Kamis", "tanggal 15".
- dueDate harus format 'YYYY-MM-DD'.
- dueTime format 'HH:mm' 24 jam.
- Kategori yang cocok: 'Akademik', 'Pekerjaan', 'Organisasi', 'Bisnis', 'Pribadi', 'Rumah Tangga', 'Kesehatan', 'Keuangan', 'Proyek'.
- Tipe: 'task' | 'recurring' | 'project' | 'event' | 'reminder' | 'bill' | 'routine'.
- Prioritas: 'low' | 'medium' | 'high' | 'urgent'.
- requiresConfirmation: true jika tanggal atau waktu tidak jelas.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            category: { type: Type.STRING },
            type: { type: Type.STRING },
            priority: { type: Type.STRING },
            dueDate: { type: Type.STRING },
            dueTime: { type: Type.STRING },
            estimatedMinutes: { type: Type.INTEGER },
            amount: { type: Type.NUMBER },
            recurrence: { type: Type.STRING, description: 'Aturan berulang, misal: daily, weekly, custom' },
            requiresConfirmation: { type: Type.BOOLEAN },
            explanation: { type: Type.STRING, description: 'Penjelasan pemahaman waktu/jadwal' },
          },
          required: ['title', 'category', 'priority'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Parse NL error:', error);
    return res.status(500).json({ error: error.message || 'Gagal memproses bahasa alami.' });
  }
});

// Break It Down - AI Subtask breakdown
app.post('/api/ai/break-it-down', async (req, res) => {
  try {
    const { title, description, category, dueDate, estimatedHours } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY belum dikonfigurasi.',
      });
    }

    const prompt = `Pecah tugas besar berikut menjadi 4 sampai 7 langkah/subtugas kecil yang teratur, berurutan, dan dapat dikerjakan (actionable) untuk aplikasi DeadlineKu.
Judul Tugas: "${title}"
Deskripsi: "${description || '-'}"
Kategori: "${category || 'Pekerjaan'}"
Deadline Utama: "${dueDate || 'Tidak ditentukan'}"
Estimasi Total Jam: "${estimatedHours || 4} jam"

Tuliskan setiap tahapan dengan nama yang jelas, estimasi waktu dalam menit, dan tingkat prioritasnya ('low', 'medium', 'high', 'urgent').`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overview: { type: Type.STRING, description: 'Strategi ringkas pengerjaan' },
            totalEstimatedMinutes: { type: Type.INTEGER },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: 'Langkah aksi konkret' },
                  estimatedMinutes: { type: Type.INTEGER },
                  priority: { type: Type.STRING },
                  dayOffset: { type: Type.INTEGER, description: 'Rekomendasi urutan hari (0 = hari pertama)' },
                },
                required: ['title', 'estimatedMinutes', 'priority'],
              },
            },
          },
          required: ['steps', 'overview'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Break it down error:', error);
    return res.status(500).json({ error: error.message || 'Gagal memecah tugas.' });
  }
});

// Smart Reschedule & Workload Advisor
app.post('/api/ai/smart-reschedule', async (req, res) => {
  try {
    const { overdueTasks, upcomingWorkload, productiveHours } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY belum dikonfigurasi.',
      });
    }

    const prompt = `Anda adalah algoritma Smart Reschedule aplikasi DeadlineKu.
Daftar aktivitas yang terlambat/belum terlaksana:
${JSON.stringify(overdueTasks, null, 2)}

Beban aktivitas yang sudah ada dalam beberapa hari ke depan:
${JSON.stringify(upcomingWorkload, null, 2)}

Jam produktif pengguna: ${productiveHours || '08:00 - 17:00'}.

Berikan saran penjadwalan ulang yang realistis, jangan menumpuk semua tugas dalam satu hari, sisakan jeda istirahat, dan utamakan tugas mendesak.
Format output JSON:`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendationSummary: { type: Type.STRING, description: 'Analisis dan saran pembagian waktu bersahabat' },
            rescheduledTasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  taskId: { type: Type.STRING },
                  suggestedDate: { type: Type.STRING, description: 'YYYY-MM-DD' },
                  suggestedTime: { type: Type.STRING, description: 'HH:mm' },
                  reason: { type: Type.STRING, description: 'Alasan pemilihan waktu ini' },
                },
                required: ['taskId', 'suggestedDate', 'reason'],
              },
            },
          },
          required: ['recommendationSummary', 'rescheduledTasks'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Smart reschedule error:', error);
    return res.status(500).json({ error: error.message || 'Gagal membuat saran penjadwalan ulang.' });
  }
});

// Start server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`DeadlineKu server is running at http://0.0.0.0:${port}`);
  });
}

startServer();
