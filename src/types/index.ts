/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'todo' | 'in_progress' | 'waiting' | 'completed' | 'cancelled';

export type ActivityType =
  | 'task'       // Tugas sekali selesai
  | 'recurring'  // Tugas berulang
  | 'project'    // Terkait proyek
  | 'event'      // Acara / kegiatan
  | 'reminder'   // Pengingat
  | 'goal'       // Target
  | 'routine'    // Rutinitas harian/mingguan
  | 'bill';      // Tagihan / pembayaran

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  estimatedMinutes?: number;
  priority?: Priority;
  dueDate?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  categoryId: string;
  type: ActivityType;
  priority: Priority;
  status: TaskStatus;
  dueDate?: string;         // YYYY-MM-DD
  dueTime?: string;         // HH:mm
  startDate?: string;
  estimatedMinutes: number; // e.g. 60
  actualMinutes?: number;
  completedAt?: string;
  createdAt: string;
  projectId?: string;
  subtasks: SubTask[];
  // Specific metadata
  amount?: number;          // For bill
  isPaid?: boolean;         // For bill
  location?: string;        // For event
  courseName?: string;      // For academic
  recurrence?: 'daily' | 'weekly' | 'weekdays' | 'monthly' | 'none';
  tags?: string[];
  reminderBeforeMinutes?: number; // e.g. 60 min before
  assigneeName?: string;    // Collaboration
  commentsCount?: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;            // Hex code
  icon: string;             // Lucide icon name
  description?: string;
  isCustom?: boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  dueDate?: string;
  status: 'planning' | 'active' | 'completed' | 'on_hold';
  members: ProjectMember[];
  createdAt: string;
}

export interface ProjectMember {
  id: string;
  name: string;
  email?: string;
  role: 'leader' | 'member' | 'viewer';
  avatar?: string;
}

export interface Habit {
  id: string;
  title: string;
  frequency: 'daily' | 'weekly';
  targetDaysPerWeek: number;
  categoryId: string;
  completedDates: string[]; // List of YYYY-MM-DD
  streak: number;
  bestStreak: number;
  createdAt: string;
  icon?: string;
}

export interface FocusSession {
  id: string;
  taskId?: string;
  taskTitle?: string;
  durationMinutes: number;
  completedAt: string;
  mode: 'pomodoro' | 'short_break' | 'long_break' | 'free';
}

export interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  xpReward: number;
  category: 'task' | 'focus' | 'habit' | 'streak';
  progress: number; // 0 to 100
}

export interface UserProfile {
  name: string;
  email?: string;
  roleTitle: string; // Pelajar, Mahasiswa, Pekerja, etc.
  avatar?: string;
  level: number;
  xp: number;
  productiveHoursStart: string; // e.g. "08:00"
  productiveHoursEnd: string;   // e.g. "17:00"
  restHoursStart: string;       // e.g. "12:00"
  restHoursEnd: string;         // e.g. "13:00"
  isOnboarded: boolean;
  theme: 'light' | 'dark';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'deadline' | 'conflict' | 'reschedule' | 'habit' | 'achievement';
  timestamp: string;
  read: boolean;
  actionTaskId?: string;
}
