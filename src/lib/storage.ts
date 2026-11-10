/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Task,
  Category,
  Project,
  Habit,
  FocusSession,
  Achievement,
  UserProfile,
  NotificationItem,
} from '../types';
import {
  initialCategories,
  initialProjects,
  initialTasks,
  initialHabits,
  initialFocusSessions,
  initialAchievements,
  initialUserProfile,
} from './demoData';

const STORAGE_KEYS = {
  TASKS: 'deadlineku_tasks_v1',
  CATEGORIES: 'deadlineku_categories_v1',
  PROJECTS: 'deadlineku_projects_v1',
  HABITS: 'deadlineku_habits_v1',
  FOCUS_SESSIONS: 'deadlineku_focus_sessions_v1',
  ACHIEVEMENTS: 'deadlineku_achievements_v1',
  USER_PROFILE: 'deadlineku_user_profile_v1',
  NOTIFICATIONS: 'deadlineku_notifications_v1',
};

// Safe JSON parser
function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
  }
}

export const StorageService = {
  getTasks(): Task[] {
    return safeGet<Task[]>(STORAGE_KEYS.TASKS, initialTasks);
  },
  setTasks(tasks: Task[]): void {
    safeSet(STORAGE_KEYS.TASKS, tasks);
  },

  getCategories(): Category[] {
    return safeGet<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
  },
  setCategories(cats: Category[]): void {
    safeSet(STORAGE_KEYS.CATEGORIES, cats);
  },

  getProjects(): Project[] {
    return safeGet<Project[]>(STORAGE_KEYS.PROJECTS, initialProjects);
  },
  setProjects(projects: Project[]): void {
    safeSet(STORAGE_KEYS.PROJECTS, projects);
  },

  getHabits(): Habit[] {
    return safeGet<Habit[]>(STORAGE_KEYS.HABITS, initialHabits);
  },
  setHabits(habits: Habit[]): void {
    safeSet(STORAGE_KEYS.HABITS, habits);
  },

  getFocusSessions(): FocusSession[] {
    return safeGet<FocusSession[]>(STORAGE_KEYS.FOCUS_SESSIONS, initialFocusSessions);
  },
  setFocusSessions(sessions: FocusSession[]): void {
    safeSet(STORAGE_KEYS.FOCUS_SESSIONS, sessions);
  },

  getAchievements(): Achievement[] {
    return safeGet<Achievement[]>(STORAGE_KEYS.ACHIEVEMENTS, initialAchievements);
  },
  setAchievements(achievements: Achievement[]): void {
    safeSet(STORAGE_KEYS.ACHIEVEMENTS, achievements);
  },

  getUserProfile(): UserProfile {
    return safeGet<UserProfile>(STORAGE_KEYS.USER_PROFILE, initialUserProfile);
  },
  setUserProfile(profile: UserProfile): void {
    safeSet(STORAGE_KEYS.USER_PROFILE, profile);
  },

  getNotifications(): NotificationItem[] {
    return safeGet<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, [
      {
        id: 'notif-1',
        title: 'Deadline Mendekat!',
        message: 'Proposal Bab 4 jatuh tempo hari ini pukul 17:00.',
        type: 'deadline',
        timestamp: new Date().toISOString(),
        read: false,
        actionTaskId: 'task-1',
      },
      {
        id: 'notif-2',
        title: 'Tugas Terlambat Perlu Perhatian',
        message: 'Laporan Pengeluaran Operasional kemarin belum diselesaikan. Gunakan Smart Reschedule.',
        type: 'reschedule',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: false,
        actionTaskId: 'task-10',
      },
      {
        id: 'notif-3',
        title: 'Pencapaian Baru!',
        message: 'Selamat! Anda telah membuka lencana Consistency Master (7 hari streak).',
        type: 'achievement',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        read: true,
      },
    ]);
  },
  setNotifications(notifications: NotificationItem[]): void {
    safeSet(STORAGE_KEYS.NOTIFICATIONS, notifications);
  },

  // Reset all to fresh demo data
  resetToDemo(): void {
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.PROJECTS);
    localStorage.removeItem(STORAGE_KEYS.HABITS);
    localStorage.removeItem(STORAGE_KEYS.FOCUS_SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS);
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);

    safeSet(STORAGE_KEYS.TASKS, initialTasks);
    safeSet(STORAGE_KEYS.CATEGORIES, initialCategories);
    safeSet(STORAGE_KEYS.PROJECTS, initialProjects);
    safeSet(STORAGE_KEYS.HABITS, initialHabits);
    safeSet(STORAGE_KEYS.FOCUS_SESSIONS, initialFocusSessions);
    safeSet(STORAGE_KEYS.ACHIEVEMENTS, initialAchievements);
    safeSet(STORAGE_KEYS.USER_PROFILE, initialUserProfile);
  },

  // Export full backup as JSON
  exportBackupJSON(): string {
    const data = {
      version: 1,
      appName: 'DeadlineKu',
      exportedAt: new Date().toISOString(),
      tasks: this.getTasks(),
      categories: this.getCategories(),
      projects: this.getProjects(),
      habits: this.getHabits(),
      focusSessions: this.getFocusSessions(),
      achievements: this.getAchievements(),
      userProfile: this.getUserProfile(),
    };
    return JSON.stringify(data, null, 2);
  },

  // Restore backup from JSON
  restoreBackupJSON(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (!data || !Array.isArray(data.tasks)) {
        throw new Error('Format file cadangan tidak valid');
      }
      if (data.tasks) this.setTasks(data.tasks);
      if (data.categories) this.setCategories(data.categories);
      if (data.projects) this.setProjects(data.projects);
      if (data.habits) this.setHabits(data.habits);
      if (data.focusSessions) this.setFocusSessions(data.focusSessions);
      if (data.achievements) this.setAchievements(data.achievements);
      if (data.userProfile) this.setUserProfile(data.userProfile);
      return true;
    } catch (e) {
      console.error('Failed to restore backup:', e);
      return false;
    }
  },

  // Export tasks as CSV
  exportTasksCSV(tasks: Task[]): string {
    const headers = [
      'ID',
      'Judul',
      'Kategori',
      'Tipe',
      'Prioritas',
      'Status',
      'Tanggal Deadline',
      'Jam Deadline',
      'Estimasi Menit',
      'Nominal Tagihan',
      'Lokasi',
      'Selesai Pada',
    ];

    const rows = tasks.map((t) => [
      `"${t.id}"`,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${t.categoryId}"`,
      `"${t.type}"`,
      `"${t.priority}"`,
      `"${t.status}"`,
      `"${t.dueDate || ''}"`,
      `"${t.dueTime || ''}"`,
      t.estimatedMinutes || 0,
      t.amount || 0,
      `"${(t.location || '').replace(/"/g, '""')}"`,
      `"${t.completedAt || ''}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  },
};
