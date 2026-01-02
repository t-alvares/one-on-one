import { useState, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface AppShellProps {
  children: ReactNode;
  title: string;
}

/**
 * AppShell - Main application layout wrapper
 *
 * Features:
 * - Left sidebar navigation (280px wide, fixed on desktop)
 * - Top header bar with page title and user actions
 * - Main content area with proper spacing
 * - Responsive: sidebar collapses to drawer on mobile
 */
function AppShell({ children, title }: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main content wrapper */}
      <div className="lg:ml-[280px] min-h-screen flex flex-col">
        {/* Header */}
        <Header
          title={title}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        {/* Main content */}
        <main className="flex-1 min-h-0 p-4 lg:p-6 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

export { AppShell };
