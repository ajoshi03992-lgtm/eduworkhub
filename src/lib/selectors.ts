import type { Task, Teacher } from '../types';
import type { AppState } from '../context/AppContext';

export function tasksForTeacher(state: AppState, teacherId: string): Task[] {
  return state.tasks.filter((t) => t.assignedTeacherIds.includes(teacherId));
}

export function teacherLiveStats(state: AppState, teacher: Teacher) {
  const tasks = tasksForTeacher(state, teacher.id);
  const assigned = tasks.length;
  const completed = tasks.filter((t) => t.status === 'Approved').length;
  const overdue = tasks.filter((t) => t.status === 'Overdue').length;
  const pending = tasks.filter((t) =>
    ['Assigned', 'In Progress', 'Submitted', 'Under Review', 'Rejected'].includes(t.status),
  ).length;
  const completionRate = assigned > 0 ? Math.round((completed / assigned) * 100) : 100;
  const documents = state.documents.filter((d) => d.teacherId === teacher.id).length;
  const activities = state.activities.filter((a) => a.teacherId === teacher.id).length;
  return { assigned, completed, pending, overdue, completionRate, documents, activities };
}

export function departmentKpis(state: AppState) {
  const totals = state.teachers.reduce(
    (acc, t) => {
      const s = teacherLiveStats(state, t);
      acc.assigned += s.assigned;
      acc.completed += s.completed;
      acc.pending += s.pending;
      acc.overdue += s.overdue;
      return acc;
    },
    { assigned: 0, completed: 0, pending: 0, overdue: 0 },
  );
  const completionRate = totals.assigned > 0 ? Math.round((totals.completed / totals.assigned) * 100) : 100;
  const activeToday = state.teachers.filter((t) => t.status === 'Active').length;
  return {
    totalTeachers: state.teachers.length,
    activeToday,
    ...totals,
    completionRate,
  };
}

export function attentionItems(state: AppState) {
  const underReview = state.submissions.filter((s) => s.status === 'Under Review');
  const overdueTasks = state.tasks.filter((t) => t.status === 'Overdue');
  const rejectedAwaiting = state.submissions.filter((s) => s.status === 'Rejected');
  const approaching = state.tasks.filter((t) => {
    if (['Approved', 'Overdue'].includes(t.status)) return false;
    const days = Math.round((new Date(t.deadline).getTime() - new Date(state.today).getTime()) / 86400000);
    return days >= 0 && days <= 3;
  });
  const missingActivity = state.teachers.filter(
    (t) => !state.activities.some((a) => a.teacherId === t.id && a.date === state.today),
  );
  return {
    underReview,
    overdueTasks,
    rejectedAwaiting,
    approaching,
    missingActivity: missingActivity.slice(0, 1),
  };
}

export function unreadNotificationsFor(state: AppState, userId: string) {
  return state.notifications.filter((n) => n.userId === userId && !n.read);
}

export function notificationsFor(state: AppState, userId: string) {
  return state.notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
