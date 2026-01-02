import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { AuthProvider } from './contexts/AuthContext';
import { LoginPage, AdminLoginPage } from './pages/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppShell } from './components/layout';
import { AppSidebar } from './components/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from './components/ui/sidebar';
import { Separator } from './components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from './components/ui/breadcrumb';
import { WorkspacePage, ThoughtPage, TopicPage } from './pages/ic';
import { TeamPage, ICWorkspacePage } from './pages/leader';
import { MeetingPage } from './pages/meetings';
import { Bot } from './components/animate-ui/icons/bot';
import { Users } from './components/animate-ui/icons/users';
import { ICProvider, useICContext } from './contexts/ICContext';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

// Admin page placeholders
function AdminUsersPage() {
  return (
    <div>
      <div className="bg-white rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-2">User Management</h2>
        <p className="text-text-secondary">
          Manage users, roles, and permissions.
        </p>
      </div>
    </div>
  );
}

function AdminRelationshipsPage() {
  return (
    <div>
      <div className="bg-white rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-2">Relationships</h2>
        <p className="text-text-secondary">
          Configure Leader-IC relationships and team structures.
        </p>
      </div>
    </div>
  );
}

function AdminLabelsPage() {
  return (
    <div>
      <div className="bg-white rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-2">Labels</h2>
        <p className="text-text-secondary">
          Manage topic and thought labels.
        </p>
      </div>
    </div>
  );
}

function AdminCompetenciesPage() {
  return (
    <div>
      <div className="bg-white rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-2">Competencies</h2>
        <p className="text-text-secondary">
          Configure the competency framework for action items.
        </p>
      </div>
    </div>
  );
}

function AdminImportPage() {
  return (
    <div>
      <div className="bg-white rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-2">Import Data</h2>
        <p className="text-text-secondary">
          Bulk import users and relationships from CSV files.
        </p>
      </div>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-surface-secondary">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-text-tertiary mb-4">404</h1>
        <p className="text-xl text-text-secondary mb-6">Page not found</p>
        <a
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 bg-wawanesa-blue text-white font-medium rounded-md hover:bg-wawanesa-blue-hover transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}

// Layout wrapper for IC routes with new sidebar
function ICLayout() {
  return (
    <ProtectedRoute allowedRoles={['IC']}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b">
            <div className="flex items-center px-4">
              <SidebarTrigger className="-ml-1 mr-2" />
              <Separator orientation="vertical" className="h-4" />
              <Breadcrumb>
                <BreadcrumbList className="pl-0 ml-3">
                  <BreadcrumbItem>
                    <BreadcrumbPage className="flex items-center gap-2 text-base font-medium text-text-secondary tracking-wide">
                      <Bot size={25} animateOnHover />
                      My Workspace
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}

// Layout wrapper for Leader routes - uses same sidebar pattern as IC
function LeaderLayout() {
  return (
    <ProtectedRoute allowedRoles={['LEADER', 'ADMIN']}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b">
            <div className="flex items-center px-4">
              <SidebarTrigger className="-ml-1 mr-2" />
              <Separator orientation="vertical" className="h-4" />
              <Breadcrumb>
                <BreadcrumbList className="pl-0 ml-3">
                  <BreadcrumbItem>
                    <BreadcrumbPage className="flex items-center gap-2 text-base font-medium text-text-secondary tracking-wide">
                      <Users size={25} animateOnHover />
                      My Team
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}

// Inner content for LeaderICLayout that has access to ICContext
function LeaderICLayoutContent() {
  const { ic, isLoading } = useICContext();

  // Calculate years of service display
  const yearsDisplay = ic?.yearsOfService
    ? `${ic.yearsOfService} ${ic.yearsOfService === 1 ? 'year' : 'years'} of service`
    : null;

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b">
        <div className="flex items-center px-4 flex-1 min-w-0">
          <SidebarTrigger className="-ml-1 mr-2" />
          <Separator orientation="vertical" className="h-4" />
          <Breadcrumb>
            <BreadcrumbList className="pl-0 ml-3">
              <BreadcrumbItem>
                <Link
                  to="/team"
                  className="flex items-center gap-2 text-base font-medium text-text-secondary tracking-wide hover:underline transition-colors"
                >
                  <Users size={25} animateOnHover />
                  My Team
                </Link>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <span className="text-text-tertiary mx-2">›</span>
              </BreadcrumbItem>
              <BreadcrumbItem className="flex items-center gap-2 min-w-0">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-text-tertiary" />
                ) : ic ? (
                  <BreadcrumbPage className="flex items-center gap-2 tracking-wide min-w-0">
                    <span className="text-base font-medium text-text-secondary truncate">{ic.name}</span>
                    {ic.position && (
                      <>
                        <span className="text-text-tertiary text-sm">·</span>
                        <span className="text-text-tertiary text-sm truncate">{ic.position}</span>
                      </>
                    )}
                    {yearsDisplay && (
                      <>
                        <span className="text-text-tertiary text-sm hidden sm:inline">|</span>
                        <span className="text-text-tertiary text-sm hidden sm:inline">{yearsDisplay}</span>
                      </>
                    )}
                  </BreadcrumbPage>
                ) : (
                  <span className="text-text-tertiary">Loading...</span>
                )}
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <Outlet />
      </div>
    </SidebarInset>
  );
}

// Layout wrapper for Leader IC workspace routes - shows IC in breadcrumb
function LeaderICLayout() {
  return (
    <ProtectedRoute allowedRoles={['LEADER', 'ADMIN']}>
      <SidebarProvider>
        <AppSidebar />
        <ICProvider>
          <LeaderICLayoutContent />
        </ICProvider>
      </SidebarProvider>
    </ProtectedRoute>
  );
}

// Layout wrapper for Admin routes (requires isAdmin flag)
function AdminLayout() {
  return (
    <ProtectedRoute requireAdmin redirectTo="/admin/login">
      <AppShell title="Admin">
        <Outlet />
      </AppShell>
    </ProtectedRoute>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Root redirects to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Admin login (separate from regular login) */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* IC routes */}
      <Route element={<ICLayout />}>
        <Route path="/workspace" element={<WorkspacePage />} />
        <Route path="/workspace/thoughts/:id" element={<ThoughtPage />} />
        <Route path="/workspace/topics/:id" element={<TopicPage />} />
      </Route>

      {/* Leader routes - Team Board */}
      <Route element={<LeaderLayout />}>
        <Route path="/team" element={<TeamPage />} />
      </Route>

      {/* Leader routes - IC Workspace (with IC breadcrumb) */}
      <Route element={<LeaderICLayout />}>
        <Route path="/team/:icId" element={<ICWorkspacePage />} />
        <Route path="/team/:icId/thoughts/:id" element={<ThoughtPage />} />
        <Route path="/team/:icId/topics/:id" element={<TopicPage />} />
      </Route>

      {/* Meeting route (all authenticated users) */}
      <Route
        path="/meetings/:id"
        element={
          <ProtectedRoute>
            <AppShell title="Meeting">
              <MeetingPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* Admin routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="users" replace />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="relationships" element={<AdminRelationshipsPage />} />
        <Route path="labels" element={<AdminLabelsPage />} />
        <Route path="competencies" element={<AdminCompetenciesPage />} />
        <Route path="import" element={<AdminImportPage />} />
      </Route>

      {/* 404 catch-all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App() {
  return (
    <MantineProvider>
      <AuthProvider>
        <div className="min-h-screen bg-surface font-sans text-text-primary">
          <AppRoutes />
        </div>
      </AuthProvider>
    </MantineProvider>
  );
}

export default App;
