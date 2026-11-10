/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { BottomNav } from './components/common/BottomNav';
import { SplashScreen } from './components/common/SplashScreen';
import { AuthModal } from './components/modals/AuthModal';
import { QuickCaptureModal } from './components/modals/QuickCaptureModal';
import { AIScannerModal } from './components/modals/AIScannerModal';
import { BreakdownModal } from './components/modals/BreakdownModal';
import { AutoSchedulerModal } from './components/modals/AutoSchedulerModal';
import { RescheduleModal } from './components/modals/RescheduleModal';
import { TaskDetailModal } from './components/modals/TaskDetailModal';
import { OnboardingModal } from './components/modals/OnboardingModal';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { TasksPage } from './pages/TasksPage';
import { CalendarPage } from './pages/CalendarPage';
import { FocusPage } from './pages/FocusPage';
import { InsightsPage } from './pages/InsightsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { HabitsPage } from './pages/HabitsPage';
import { ProfilePage } from './pages/ProfilePage';

const MainLayout: React.FC = () => {
  const { activeTab, showSplashPreview, setShowSplashPreview } = useApp();

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'tasks':
        return <TasksPage />;
      case 'calendar':
        return <CalendarPage />;
      case 'focus':
        return <FocusPage />;
      case 'insights':
        return <InsightsPage />;
      case 'projects':
        return <ProjectsPage />;
      case 'habits':
        return <HabitsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F5F6F8] dark:bg-[#1A2130] text-[#303642] dark:text-[#EAECEF] font-sans antialiased selection:bg-[#75C9C0]/30 selection:text-[#347F80] transition-colors">
      {/* Official Animated Splash Screen (First visit or preview trigger) */}
      <SplashScreen
        forceShow={showSplashPreview}
        onFinish={() => setShowSplashPreview(false)}
      />

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {renderActivePage()}
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </div>

      {/* Global Interactive Modals */}
      <AuthModal />
      <QuickCaptureModal />
      <AIScannerModal />
      <BreakdownModal />
      <AutoSchedulerModal />
      <RescheduleModal />
      <TaskDetailModal />
      <OnboardingModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
