/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Task, Category, Priority } from '../types';

export interface WorkloadRadarResult {
  score: number; // 0 - 100
  status: 'Santai' | 'Padat' | 'Terlalu Padat';
  color: string;
  totalTasks: number;
  uncompletedTasks: number;
  totalEstimatedHours: number;
  urgentCount: number;
  analysisMessage: string;
  recommendation: string;
  dailyDistribution: { date: string; dayName: string; taskCount: number; hours: number }[];
}

export interface DeadlinePrediction {
  status: 'Aman' | 'Perlu Perhatian' | 'Berisiko Terlambat';
  level: 'safe' | 'warning' | 'critical';
  color: string;
  remainingHours: number;
  estimatedHours: number;
  message: string;
  suggestion: string;
}

export interface ScheduledSlot {
  taskId: string;
  taskTitle: string;
  categoryColor: string;
  priority: Priority;
  date: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  durationMinutes: number;
}

export const SmartEngine = {
  // 1. Smart Workload Radar
  analyzeWorkload(tasks: Task[], categories: Category[]): WorkloadRadarResult {
    const today = new Date().toISOString().split('T')[0];
    const next7Days: { [key: string]: { date: string; dayName: string; taskCount: number; hours: number } } = {};

    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      next7Days[dateStr] = {
        date: dateStr,
        dayName: i === 0 ? 'Hari Ini' : i === 1 ? 'Besok' : dayNames[d.getDay()],
        taskCount: 0,
        hours: 0,
      };
    }

    const activeTasks = tasks.filter((t) => t.status !== 'completed' && t.status !== 'cancelled');

    let totalMinutesNext7Days = 0;
    let urgentCount = 0;
    let todayMinutes = 0;
    let todayCount = 0;

    activeTasks.forEach((t) => {
      if (t.priority === 'urgent' || t.priority === 'high') {
        urgentCount++;
      }
      if (t.dueDate && next7Days[t.dueDate]) {
        next7Days[t.dueDate].taskCount += 1;
        const mins = t.estimatedMinutes || 60;
        next7Days[t.dueDate].hours += Math.round((mins / 60) * 10) / 10;
        totalMinutesNext7Days += mins;

        if (t.dueDate === today) {
          todayCount++;
          todayMinutes += mins;
        }
      }
    });

    const todayHours = Math.round((todayMinutes / 60) * 10) / 10;
    const totalHours = Math.round((totalMinutesNext7Days / 60) * 10) / 10;

    // Workload score calculation: based on today's hours, total tasks, and urgency
    let score = Math.min(100, Math.round((todayHours / 8) * 50 + (urgentCount * 10) + (todayCount * 5)));
    if (score < 10 && activeTasks.length > 0) score = 25;

    let status: 'Santai' | 'Padat' | 'Terlalu Padat' = 'Santai';
    let color = '#82BFA4'; // Green
    let analysisMessage = '';
    let recommendation = '';

    if (score > 70 || todayHours > 6.5) {
      status = 'Terlalu Padat';
      color = '#E98E91'; // Red
      analysisMessage = `Jadwalmu hari ini sangat padat dengan ${todayCount} aktivitas (total estimasi ${todayHours} jam pengerjaan).`;
      recommendation = 'Sebaiknya gunakan fitur Smart Reschedule untuk menggeser 1-2 tugas prioritas sedang ke hari esok agar tidak burnout.';
    } else if (score > 35 || todayHours >= 3.5) {
      status = 'Padat';
      color = '#F2B56B'; // Orange
      analysisMessage = `Jadwalmu hari ini cukup aktif dengan ${todayCount} aktivitas (${todayHours} jam estimasi). Terkendali dengan fokus yang baik.`;
      recommendation = 'Kerjakan 3 tugas di Fokus Hari Ini terlebih dahulu sebelum menangani aktivitas minor lainnya.';
    } else {
      status = 'Santai';
      color = '#82BFA4'; // Green
      analysisMessage = `Beban aktivitasmu saat ini tergolong seimbang (${todayCount} aktivitas hari ini, total ${todayHours} jam).`;
      recommendation = 'Waktu yang tepat untuk mencicil proyek jangka panjang atau menikmati waktu luang bersama keluarga.';
    }

    return {
      score,
      status,
      color,
      totalTasks: tasks.length,
      uncompletedTasks: activeTasks.length,
      totalEstimatedHours: totalHours,
      urgentCount,
      analysisMessage,
      recommendation,
      dailyDistribution: Object.values(next7Days),
    };
  },

  // 2. Deadline Predictor
  predictTaskDeadline(task: Task): DeadlinePrediction {
    if (task.status === 'completed') {
      return {
        status: 'Aman',
        level: 'safe',
        color: '#82BFA4',
        remainingHours: 0,
        estimatedHours: Math.round((task.estimatedMinutes / 60) * 10) / 10,
        message: 'Aktivitas telah selesai.',
        suggestion: 'Pekerjaan tuntas dengan baik!',
      };
    }

    if (!task.dueDate) {
      return {
        status: 'Aman',
        level: 'safe',
        color: '#A9C7E8',
        remainingHours: 999,
        estimatedHours: Math.round((task.estimatedMinutes / 60) * 10) / 10,
        message: 'Tidak ada tenggat waktu ketat.',
        suggestion: 'Atur target tanggal pengerjaan agar lebih terarah.',
      };
    }

    const now = new Date();
    const dueDateTime = new Date(`${task.dueDate}T${task.dueTime || '23:59'}:00`);
    const diffMs = dueDateTime.getTime() - now.getTime();
    const remainingHours = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;
    const estimatedHours = Math.max(0.5, Math.round((task.estimatedMinutes / 60) * 10) / 10);

    if (diffMs < 0) {
      return {
        status: 'Berisiko Terlambat',
        level: 'critical',
        color: '#E98E91',
        remainingHours,
        estimatedHours,
        message: `Tenggat waktu telah terlewat ${Math.abs(remainingHours)} jam yang lalu.`,
        suggestion: 'Segera lakukan Smart Reschedule untuk menetapkan target realistis baru.',
      };
    }

    const ratio = remainingHours / estimatedHours;

    if (ratio < 1.3 || (remainingHours <= 4 && estimatedHours >= 3)) {
      return {
        status: 'Berisiko Terlambat',
        level: 'critical',
        color: '#E98E91',
        remainingHours,
        estimatedHours,
        message: `Waktu tersisa (${remainingHours} jam) sangat sempit dibandingkan estimasi pengerjaan (${estimatedHours} jam).`,
        suggestion: 'Dahulukan aktivitas ini sekarang atau pecah menjadi subtugas kecil dengan "Break It Down".',
      };
    } else if (ratio < 2.5 || remainingHours <= 12) {
      return {
        status: 'Perlu Perhatian',
        level: 'warning',
        color: '#F2B56B',
        remainingHours,
        estimatedHours,
        message: `Waktu pengerjaan butuh sekitar ${estimatedHours} jam dan deadline dalam ${remainingHours} jam.`,
        suggestion: 'Mulai blokir sesi fokus 45 menit untuk mencicil pengerjaannya hari ini.',
      };
    } else {
      return {
        status: 'Aman',
        level: 'safe',
        color: '#82BFA4',
        remainingHours,
        estimatedHours,
        message: `Waktu pengerjaan masih cukup luang (${remainingHours} jam tersisa).`,
        suggestion: 'Jadwal terkontrol. Pertahankan ritme kerja Anda.',
      };
    }
  },

  // 3. Smart Auto Scheduler Algorithm
  generateAutoSchedule(
    tasks: Task[],
    categories: Category[],
    productiveStart = '08:00',
    productiveEnd = '17:00',
    restStart = '12:00',
    restEnd = '13:00'
  ): ScheduledSlot[] {
    const activeTasks = tasks
      .filter((t) => t.status === 'todo' || t.status === 'in_progress')
      .sort((a, b) => {
        // Priority order: urgent -> high -> medium -> low
        const pOrder: Record<Priority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
        if (pOrder[b.priority] !== pOrder[a.priority]) {
          return pOrder[b.priority] - pOrder[a.priority];
        }
        // Then by due date
        if (a.dueDate && b.dueDate) {
          return a.dueDate.localeCompare(b.dueDate);
        }
        return 0;
      });

    const categoryMap = new Map(categories.map((c) => [c.id, c.color]));
    const slots: ScheduledSlot[] = [];

    // Schedule over next 3 days
    let currentDayOffset = 0;

    const parseTimeToMins = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const formatMinsToTime = (mins: number) => {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    const startMins = parseTimeToMins(productiveStart);
    const endMins = parseTimeToMins(productiveEnd);
    const restStartMins = parseTimeToMins(restStart);
    const restEndMins = parseTimeToMins(restEnd);

    let currentDayTime = startMins;

    for (const task of activeTasks) {
      let taskMins = Math.min(180, Math.max(30, task.estimatedMinutes || 60));
      const catColor = categoryMap.get(task.categoryId) || '#A9C7E8';

      // If current slot collides with lunch, skip after lunch
      if (currentDayTime + taskMins > restStartMins && currentDayTime < restEndMins) {
        currentDayTime = restEndMins;
      }

      // If beyond productive end, move to next day
      if (currentDayTime + taskMins > endMins) {
        currentDayOffset += 1;
        currentDayTime = startMins;
      }

      const slotDate = new Date();
      slotDate.setDate(slotDate.getDate() + currentDayOffset);
      const dateStr = slotDate.toISOString().split('T')[0];

      const startTimeStr = formatMinsToTime(currentDayTime);
      currentDayTime += taskMins;
      const endTimeStr = formatMinsToTime(currentDayTime);

      // Add 15 mins buffer
      currentDayTime += 15;

      slots.push({
        taskId: task.id,
        taskTitle: task.title,
        categoryColor: catColor,
        priority: task.priority,
        date: dateStr,
        startTime: startTimeStr,
        endTime: endTimeStr,
        durationMinutes: taskMins,
      });

      if (slots.length >= 12) break; // Limit auto-schedule preview to 12 top slots
    }

    return slots;
  },

  // 4. Life Balance Analyzer
  analyzeLifeBalance(tasks: Task[], categories: Category[]): {
    categoryBreakdown: { id: string; name: string; color: string; hours: number; percentage: number }[];
    totalHours: number;
    insightMessage: string;
    healthyBalanceScore: number;
  } {
    const catHours: { [catId: string]: number } = {};
    categories.forEach((c) => {
      catHours[c.id] = 0;
    });

    let totalMinutes = 0;

    tasks.forEach((t) => {
      const mins = t.estimatedMinutes || 45;
      if (catHours[t.categoryId] !== undefined) {
        catHours[t.categoryId] += mins;
      } else {
        catHours[t.categoryId] = (catHours[t.categoryId] || 0) + mins;
      }
      totalMinutes += mins;
    });

    const totalHours = Math.round((totalMinutes / 60) * 10) / 10 || 1;

    const breakdown = categories.map((c) => {
      const mins = catHours[c.id] || 0;
      const hours = Math.round((mins / 60) * 10) / 10;
      const percentage = Math.round((mins / (totalMinutes || 1)) * 100);
      return {
        id: c.id,
        name: c.name,
        color: c.color,
        hours,
        percentage,
      };
    }).sort((a, b) => b.hours - a.hours);

    const workHours = (catHours['cat-pekerjaan'] || 0) + (catHours['cat-bisnis'] || 0);
    const personalHours = (catHours['cat-pribadi'] || 0) + (catHours['cat-kesehatan'] || 0);
    const workPercent = Math.round((workHours / (totalMinutes || 1)) * 100);

    let insightMessage = '';
    let healthyBalanceScore = 80;

    if (workPercent > 65) {
      healthyBalanceScore = 65;
      insightMessage = `Aktivitas kerja & bisnis mendominasi sekitar ${workPercent}% dari alokasi waktumu. Sangat produktif, namun pastikan tetap meluangkan waktu istirahat dan kegiatan pribadi agar energi tetap prima.`;
    } else if (personalHours < 60) {
      healthyBalanceScore = 70;
      insightMessage = 'Waktu untuk kesehatan dan pribadi terbilang minim minggu ini. Coba tambahkan rutinitas jalan santai atau membaca buku 15 menit.';
    } else {
      healthyBalanceScore = 92;
      insightMessage = 'Keseimbangan aktivitasmu sangat harmonis! Ada porsi yang sehat antara tanggung jawab akademis/pekerjaan, kesehatan, dan kehidupan pribadi.';
    }

    return {
      categoryBreakdown: breakdown,
      totalHours,
      insightMessage,
      healthyBalanceScore,
    };
  },

  // 5. XP and Level Calculation
  calculateLevel(xp: number): { level: number; currentXp: number; nextLevelXp: number; progressPercent: number } {
    // Level formula: Level 1 (0-300), Level 2 (300-750), Level 3 (750-1350), Level 4 (1350-2100)...
    let level = 1;
    let requiredXpForNext = 300;
    let accumulated = 0;

    while (xp >= accumulated + requiredXpForNext) {
      accumulated += requiredXpForNext;
      level++;
      requiredXpForNext = Math.round(requiredXpForNext * 1.3);
    }

    const currentXpInLevel = xp - accumulated;
    const progressPercent = Math.min(100, Math.round((currentXpInLevel / requiredXpForNext) * 100));

    return {
      level,
      currentXp: currentXpInLevel,
      nextLevelXp: requiredXpForNext,
      progressPercent,
    };
  },
};
