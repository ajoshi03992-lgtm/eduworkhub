import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  BookOpenCheck,
  FolderOpen,
  FileCheck2,
  BarChart3,
  Bell,
  History,
  Settings,
  ListChecks,
  CalendarCheck2,
  FileBarChart,
  UserCircle2,
} from 'lucide-react';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

export const HOD_NAV: NavItem[] = [
  { label: 'Dashboard', to: '/hod/dashboard', icon: LayoutDashboard },
  { label: 'Teachers', to: '/hod/teachers', icon: Users },
  { label: 'Work Management', to: '/hod/work', icon: ClipboardList },
  { label: 'Academic Work', to: '/hod/academic-work', icon: BookOpenCheck },
  { label: 'Documents', to: '/hod/documents', icon: FolderOpen },
  { label: 'Submissions', to: '/hod/submissions', icon: FileCheck2 },
  { label: 'Reports & Analytics', to: '/hod/reports', icon: BarChart3 },
  { label: 'Notifications', to: '/hod/notifications', icon: Bell },
  { label: 'Activity Log', to: '/hod/activity-log', icon: History },
  { label: 'Settings', to: '/hod/settings', icon: Settings },
];

export const TEACHER_NAV: NavItem[] = [
  { label: 'Dashboard', to: '/teacher/dashboard', icon: LayoutDashboard },
  { label: 'My Work', to: '/teacher/my-work', icon: ListChecks },
  { label: 'My Tasks', to: '/teacher/tasks', icon: ClipboardList },
  { label: 'Academic Work', to: '/teacher/academic-work', icon: BookOpenCheck },
  { label: 'Documents', to: '/teacher/documents', icon: FolderOpen },
  { label: 'Daily Activity', to: '/teacher/daily-activity', icon: CalendarCheck2 },
  { label: 'Submissions', to: '/teacher/submissions', icon: FileCheck2 },
  { label: 'Notifications', to: '/teacher/notifications', icon: Bell },
  { label: 'My Reports', to: '/teacher/reports', icon: FileBarChart },
  { label: 'Profile', to: '/teacher/profile', icon: UserCircle2 },
];
