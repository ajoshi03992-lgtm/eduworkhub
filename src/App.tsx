import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Login } from './pages/auth/Login';

import { HodDashboard } from './pages/hod/Dashboard';
import { Teachers } from './pages/hod/Teachers';
import { TeacherProfile } from './pages/hod/TeacherProfile';
import { WorkManagement } from './pages/hod/WorkManagement';
import { HodAcademicWork } from './pages/hod/AcademicWork';
import { HodDocuments } from './pages/hod/Documents';
import { Submissions } from './pages/hod/Submissions';
import { ReportsAnalytics } from './pages/hod/ReportsAnalytics';
import { HodNotifications } from './pages/hod/Notifications';
import { ActivityLogPage } from './pages/hod/ActivityLog';
import { HodSettings } from './pages/hod/Settings';

import { TeacherDashboard } from './pages/teacher/Dashboard';
import { MyWork } from './pages/teacher/MyWork';
import { MyTasks } from './pages/teacher/MyTasks';
import { TeacherTaskDetail } from './pages/teacher/TaskDetail';
import { TeacherAcademicWork } from './pages/teacher/AcademicWork';
import { TeacherDocuments } from './pages/teacher/Documents';
import { DailyActivity } from './pages/teacher/DailyActivity';
import { TeacherSubmissions } from './pages/teacher/Submissions';
import { TeacherNotifications } from './pages/teacher/Notifications';
import { MyReports } from './pages/teacher/MyReports';
import { Profile } from './pages/teacher/Profile';

function RootRedirect() {
  const { state } = useApp();
  if (!state.currentUser) return <Navigate to="/login" replace />;
  return <Navigate to={state.currentUser.role === 'HOD' ? '/hod/dashboard' : '/teacher/dashboard'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute role="HOD" />}>
        <Route element={<AppShell base="hod" />}>
          <Route path="/hod/dashboard" element={<HodDashboard />} />
          <Route path="/hod/teachers" element={<Teachers />} />
          <Route path="/hod/teachers/:id" element={<TeacherProfile />} />
          <Route path="/hod/work" element={<WorkManagement />} />
          <Route path="/hod/academic-work" element={<HodAcademicWork />} />
          <Route path="/hod/documents" element={<HodDocuments />} />
          <Route path="/hod/submissions" element={<Submissions />} />
          <Route path="/hod/reports" element={<ReportsAnalytics />} />
          <Route path="/hod/notifications" element={<HodNotifications />} />
          <Route path="/hod/activity-log" element={<ActivityLogPage />} />
          <Route path="/hod/settings" element={<HodSettings />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute role="TEACHER" />}>
        <Route element={<AppShell base="teacher" />}>
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/my-work" element={<MyWork />} />
          <Route path="/teacher/tasks" element={<MyTasks />} />
          <Route path="/teacher/tasks/:id" element={<TeacherTaskDetail />} />
          <Route path="/teacher/academic-work" element={<TeacherAcademicWork />} />
          <Route path="/teacher/documents" element={<TeacherDocuments />} />
          <Route path="/teacher/daily-activity" element={<DailyActivity />} />
          <Route path="/teacher/submissions" element={<TeacherSubmissions />} />
          <Route path="/teacher/notifications" element={<TeacherNotifications />} />
          <Route path="/teacher/reports" element={<MyReports />} />
          <Route path="/teacher/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
