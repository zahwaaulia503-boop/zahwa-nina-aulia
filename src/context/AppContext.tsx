/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import confetti from 'canvas-confetti';
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
import { StorageService } from '../lib/storage';
import { SmartEngine } from '../lib/smartEngine';

interface AppContextType {
  tasks: Task[];
  categories: Category[];
  projects: Project[];
  habits: Habit[];
  focusSessions: FocusSession[];
  achievements: Achievement[];
  userProfile: UserProfile;
  notifications: NotificationItem[];
  unreadNotifsCount: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isQuickCaptureOpen: boolean;
  setIsQuickCaptureOpen: (open: boolean) => void;
  isAIScanOpen: boolean;
  setIsAIScanOpen: (open: boolean) => void;
  isAutoSchedulerOpen: boolean;
  setIsAutoSchedulerOpen: (open: boolean) => void;
  isRescheduleOpen: boolean;
  setIsRescheduleOpen: (open: boolean) => void;
  isBreakdownOpen: boolean;
  setIsBreakdownOpen: (open: boolean) => void;
  activeTaskForBreakdown: Task | null;
  openBreakdownForTask: (task: Task) => void;
  taskDetailModalId: string | null;
  setTaskDetailModalId: (id: string | null) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  showSplashPreview: boolean;
  setShowSplashPreview: (show: boolean) => void;
  // CRUD Actions
  addTask: (taskData: Partial<Task> & { title: string; categoryId: string }) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  toggleSubTask: (taskId: string, subtaskId: string) => void;
  addSubTask: (taskId: string, title: string, estimatedMinutes?: number) => void;
  addCategory: (cat: Omit<Category, 'id'>) => Category;
  addProject: (proj: Omit<Project, 'id' | 'createdAt'>) => Project;
  addHabit: (habitData: { title: string; categoryId: string; frequency: 'daily' | 'weekly'; targetDaysPerWeek: number }) => Habit;
  toggleHabitDay: (habitId: string, dateStr: string) => void;
  addFocusSession: (session: { taskId?: string; taskTitle?: string; durationMinutes: number; mode: 'pomodoro' | 'short_break' | 'long_break' | 'free' }) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetToDemo: () => void;
  awardXP: (amount: number, reason: string) => void;
  triggerConfetti: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(() => StorageService.getTasks());
  const [categories, setCategories] = useState<Category[]>(() => StorageService.getCategories());
  const [projects, setProjects] = useState<Project[]>(() => StorageService.getProjects());
  const [habits, setHabits] = useState<Habit[]>(() => StorageService.getHabits());
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>(() => StorageService.getFocusSessions());
  const [achievements, setAchievements] = useState<Achievement[]>(() => StorageService.getAchievements());
  const [userProfile, setUserProfileState] = useState<UserProfile>(() => StorageService.getUserProfile());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => StorageService.getNotifications());

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [isAIScanOpen, setIsAIScanOpen] = useState(false);
  const [isAutoSchedulerOpen, setIsAutoSchedulerOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [activeTaskForBreakdown, setActiveTaskForBreakdown] = useState<Task | null>(null);
  const [taskDetailModalId, setTaskDetailModalId] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showSplashPreview, setShowSplashPreview] = useState(false);

  // Sync state to local storage
  useEffect(() => {
    StorageService.setTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    StorageService.setCategories(categories);
  }, [categories]);

  useEffect(() => {
    StorageService.setProjects(projects);
  }, [projects]);

  useEffect(() => {
    StorageService.setHabits(habits);
  }, [habits]);

  useEffect(() => {
    StorageService.setFocusSessions(focusSessions);
  }, [focusSessions]);

  useEffect(() => {
    StorageService.setAchievements(achievements);
  }, [achievements]);

  useEffect(() => {
    StorageService.setUserProfile(userProfile);
  }, [userProfile]);

  useEffect(() => {
    StorageService.setNotifications(notifications);
  }, [notifications]);

  // Sync dark theme class on document
  useEffect(() => {
    if (userProfile.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [userProfile.theme]);

  const toggleTheme = () => {
    const nextTheme = userProfile.theme === 'dark' ? 'light' : 'dark';
    setUserProfileState((prev) => ({ ...prev, theme: nextTheme }));
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#75C9C0', '#6575C9', '#A9DCD5', '#B9BFF0', '#347F80'],
      });
    } catch (e) {
      console.log('Confetti triggered', e);
    }
  };

  const awardXP = (amount: number, reason: string) => {
    setUserProfileState((prev) => {
      const newXp = prev.xp + amount;
      const { level } = SmartEngine.calculateLevel(newXp);
      const isLevelUp = level > prev.level;

      if (isLevelUp) {
        triggerConfetti();
        // Add level up notification
        setNotifications((notifs) => [
          {
            id: `notif-lvl-${Date.now()}`,
            title: '🎉 Naik Level Baru!',
            message: `Hebat! Anda telah mencapai Level ${level} berkat dedikasi produktif Anda.`,
            type: 'achievement',
            timestamp: new Date().toISOString(),
            read: false,
          },
          ...notifs,
        ]);
      }

      return {
        ...prev,
        xp: newXp,
        level,
      };
    });
  };

  // Task Actions
  const addTask = (taskData: Partial<Task> & { title: string; categoryId: string }): Task => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: taskData.title,
      description: taskData.description || '',
      categoryId: taskData.categoryId,
      type: taskData.type || 'task',
      priority: taskData.priority || 'medium',
      status: taskData.status || 'todo',
      dueDate: taskData.dueDate,
      dueTime: taskData.dueTime || '17:00',
      estimatedMinutes: taskData.estimatedMinutes || 60,
      projectId: taskData.projectId,
      subtasks: taskData.subtasks || [],
      amount: taskData.amount,
      isPaid: taskData.isPaid || false,
      location: taskData.location,
      courseName: taskData.courseName,
      recurrence: taskData.recurrence,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setTasks((prev) => [newTask, ...prev]);
    awardXP(25, 'Menambah aktivitas baru');
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, ...updates };
          return updated;
        }
        return t;
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTaskComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextStatus = t.status === 'completed' ? 'todo' : 'completed';
          const completedAt = nextStatus === 'completed' ? new Date().toISOString() : undefined;
          if (nextStatus === 'completed') {
            triggerConfetti();
            awardXP(50, 'Menyelesaikan aktivitas');
          }
          return { ...t, status: nextStatus, completedAt };
        }
        return t;
      })
    );
  };

  const toggleSubTask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedSubtasks = t.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          // Check if all subtasks completed
          const allDone = updatedSubtasks.length > 0 && updatedSubtasks.every((st) => st.completed);
          if (allDone && t.status !== 'completed') {
            triggerConfetti();
            awardXP(40, 'Menyelesaikan semua subtugas');
          }
          return {
            ...t,
            subtasks: updatedSubtasks,
            status: allDone ? 'completed' : t.status,
            completedAt: allDone ? new Date().toISOString() : t.completedAt,
          };
        }
        return t;
      })
    );
  };

  const addSubTask = (taskId: string, title: string, estimatedMinutes = 30) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const newSubtask = {
            id: `st-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            title,
            completed: false,
            estimatedMinutes,
          };
          return {
            ...t,
            subtasks: [...t.subtasks, newSubtask],
          };
        }
        return t;
      })
    );
  };

  const addCategory = (cat: Omit<Category, 'id'>): Category => {
    const newCat: Category = {
      ...cat,
      id: `cat-${Date.now()}`,
      isCustom: true,
    };
    setCategories((prev) => [...prev, newCat]);
    return newCat;
  };

  const addProject = (proj: Omit<Project, 'id' | 'createdAt'>): Project => {
    const newProj: Project = {
      ...proj,
      id: `proj-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProjects((prev) => [...prev, newProj]);
    awardXP(35, 'Membuat proyek baru');
    return newProj;
  };

  const addHabit = (habitData: {
    title: string;
    categoryId: string;
    frequency: 'daily' | 'weekly';
    targetDaysPerWeek: number;
  }): Habit => {
    const newHabit: Habit = {
      id: `hab-${Date.now()}`,
      title: habitData.title,
      categoryId: habitData.categoryId,
      frequency: habitData.frequency,
      targetDaysPerWeek: habitData.targetDaysPerWeek,
      completedDates: [],
      streak: 0,
      bestStreak: 0,
      createdAt: new Date().toISOString().split('T')[0],
      icon: 'Sparkles',
    };
    setHabits((prev) => [...prev, newHabit]);
    awardXP(20, 'Menambah kebiasaan');
    return newHabit;
  };

  const toggleHabitDay = (habitId: string, dateStr: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          const exists = h.completedDates.includes(dateStr);
          let newDates: string[];
          if (exists) {
            newDates = h.completedDates.filter((d) => d !== dateStr);
          } else {
            newDates = [...h.completedDates, dateStr].sort();
            awardXP(15, 'Check-in kebiasaan');
          }

          // Calculate current streak
          let streak = 0;
          const checkDate = new Date();
          while (true) {
            const dStr = checkDate.toISOString().split('T')[0];
            if (newDates.includes(dStr)) {
              streak++;
              checkDate.setDate(checkDate.getDate() - 1);
            } else {
              break;
            }
          }

          const bestStreak = Math.max(h.bestStreak, streak);
          return {
            ...h,
            completedDates: newDates,
            streak,
            bestStreak,
          };
        }
        return h;
      })
    );
  };

  const addFocusSession = (session: {
    taskId?: string;
    taskTitle?: string;
    durationMinutes: number;
    mode: 'pomodoro' | 'short_break' | 'long_break' | 'free';
  }) => {
    const newSession: FocusSession = {
      id: `foc-${Date.now()}`,
      taskId: session.taskId,
      taskTitle: session.taskTitle,
      durationMinutes: session.durationMinutes,
      completedAt: new Date().toISOString(),
      mode: session.mode,
    };
    setFocusSessions((prev) => [newSession, ...prev]);
    if (session.mode === 'pomodoro' || session.mode === 'free') {
      awardXP(session.durationMinutes * 2, 'Menyelesaikan sesi fokus');
      triggerConfetti();
    }
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfileState((prev) => ({ ...prev, ...updates }));
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const resetToDemo = () => {
    StorageService.resetToDemo();
    setTasks(StorageService.getTasks());
    setCategories(StorageService.getCategories());
    setProjects(StorageService.getProjects());
    setHabits(StorageService.getHabits());
    setFocusSessions(StorageService.getFocusSessions());
    setAchievements(StorageService.getAchievements());
    setUserProfileState(StorageService.getUserProfile());
    setNotifications(StorageService.getNotifications());
  };

  const openBreakdownForTask = (task: Task) => {
    setActiveTaskForBreakdown(task);
    setIsBreakdownOpen(true);
  };

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        tasks,
        categories,
        projects,
        habits,
        focusSessions,
        achievements,
        userProfile,
        notifications,
        unreadNotifsCount,
        activeTab,
        setActiveTab,
        isQuickCaptureOpen,
        setIsQuickCaptureOpen,
        isAIScanOpen,
        setIsAIScanOpen,
        isAutoSchedulerOpen,
        setIsAutoSchedulerOpen,
        isRescheduleOpen,
        setIsRescheduleOpen,
        isBreakdownOpen,
        setIsBreakdownOpen,
        activeTaskForBreakdown,
        openBreakdownForTask,
        taskDetailModalId,
        setTaskDetailModalId,
        isAuthModalOpen,
        setIsAuthModalOpen,
        showSplashPreview,
        setShowSplashPreview,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        toggleSubTask,
        addSubTask,
        addCategory,
        addProject,
        addHabit,
        toggleHabitDay,
        addFocusSession,
        updateUserProfile,
        markNotificationRead,
        markAllNotificationsRead,
        resetToDemo,
        awardXP,
        triggerConfetti,
        theme: userProfile.theme,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
