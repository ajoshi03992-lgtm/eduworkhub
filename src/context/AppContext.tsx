import React, { createContext, useContext, useEffect, useMemo, useReducer, useCallback } from 'react';
import type {
  User,
  Teacher,
  Task,
  Submission,
  FacultyDocument,
  ActivityLogEntry,
  AppNotification,
  AttendanceRecord,
  AcademicRecord,
  SyllabusProgress,
  StudentPerformanceRecord,
  AuditLogEntry,
  TaskTemplate,
  Role,
  TaskCategory,
  TaskPriority,
  RecurrenceRule,
  ReportType,
  ReportFilters,
  GeneratedReport,
  ToastMessage,
  DocumentCategory,
} from '../types';
import { generateSeed } from '../data/seed';
import { makeId, isoDate, TODAY } from '../lib/utils';

export interface AppState {
  today: string;
  hod: User;
  currentUser: User | null;
  teachers: Teacher[];
  tasks: Task[];
  submissions: Submission[];
  documents: FacultyDocument[];
  activities: ActivityLogEntry[];
  notifications: AppNotification[];
  attendance: AttendanceRecord[];
  academicRecords: AcademicRecord[];
  syllabusProgress: SyllabusProgress[];
  studentPerformance: StudentPerformanceRecord[];
  auditLog: AuditLogEntry[];
  taskTemplates: TaskTemplate[];
  generatedReports: GeneratedReport[];
  toasts: ToastMessage[];
}

const STORAGE_KEY = 'eduworkhub-state-v2';

function freshState(): AppState {
  const seed = generateSeed();
  return {
    today: isoDate(TODAY),
    hod: seed.hod,
    currentUser: null,
    teachers: seed.teachers,
    tasks: seed.tasks,
    submissions: seed.submissions,
    documents: seed.documents,
    activities: seed.activities,
    notifications: seed.notifications,
    attendance: seed.attendance,
    academicRecords: seed.academicRecords,
    syllabusProgress: seed.syllabusProgress,
    studentPerformance: seed.studentPerformance,
    auditLog: seed.auditLog,
    taskTemplates: seed.taskTemplates,
    generatedReports: [],
    toasts: [],
  };
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshState();
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed.teachers || !parsed.hod) return freshState();
    return { ...parsed, toasts: [] };
  } catch {
    return freshState();
  }
}

type Action =
  | { type: 'LOGIN'; user: User }
  | { type: 'LOGOUT' }
  | { type: 'ADD_TEACHER'; teacher: Teacher }
  | { type: 'UPDATE_TEACHER'; id: string; patch: Partial<Teacher> }
  | { type: 'CREATE_TASK'; task: Task; notifications: AppNotification[]; audit: AuditLogEntry }
  | { type: 'START_TASK'; taskId: string }
  | {
      type: 'SUBMIT_WORK';
      taskId: string;
      submission: Submission;
      isNewSubmission: boolean;
      document: FacultyDocument;
      activity: ActivityLogEntry;
      notification: AppNotification;
      audit: AuditLogEntry;
    }
  | {
      type: 'REVIEW_SUBMISSION';
      submissionId: string;
      taskId: string;
      decision: 'Approved' | 'Rejected';
      updatedSubmission: Submission;
      reviewActivity: ActivityLogEntry;
      notification: AppNotification;
      audit: AuditLogEntry;
    }
  | { type: 'ADD_ACTIVITY'; activity: ActivityLogEntry }
  | { type: 'ADD_DOCUMENT'; document: FacultyDocument }
  | { type: 'MARK_NOTIFICATION_READ'; id: string }
  | { type: 'MARK_ALL_READ'; userId: string }
  | { type: 'ADD_REPORT'; report: GeneratedReport; audit: AuditLogEntry; notification: AppNotification }
  | { type: 'ADD_ATTENDANCE'; record: AttendanceRecord }
  | { type: 'ADD_ACADEMIC_RECORD'; record: AcademicRecord }
  | { type: 'ADD_PERFORMANCE'; record: StudentPerformanceRecord }
  | { type: 'PUSH_TOAST'; toast: ToastMessage }
  | { type: 'DISMISS_TOAST'; id: string }
  | { type: 'RESET_DEMO' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, currentUser: action.user };
    case 'LOGOUT':
      return { ...state, currentUser: null };
    case 'ADD_TEACHER':
      return { ...state, teachers: [action.teacher, ...state.teachers] };
    case 'UPDATE_TEACHER':
      return {
        ...state,
        teachers: state.teachers.map((t) => (t.id === action.id ? { ...t, ...action.patch } : t)),
      };
    case 'CREATE_TASK':
      return {
        ...state,
        tasks: [action.task, ...state.tasks],
        notifications: [...action.notifications, ...state.notifications],
        auditLog: [action.audit, ...state.auditLog],
      };
    case 'START_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.taskId ? { ...t, status: 'In Progress', updatedAt: new Date().toISOString() } : t)),
      };
    case 'SUBMIT_WORK': {
      const submissions = action.isNewSubmission
        ? [action.submission, ...state.submissions]
        : state.submissions.map((s) => (s.id === action.submission.id ? action.submission : s));
      return {
        ...state,
        submissions,
        tasks: state.tasks.map((t) =>
          t.id === action.taskId ? { ...t, status: 'Under Review', updatedAt: new Date().toISOString() } : t,
        ),
        documents: [action.document, ...state.documents],
        activities: [action.activity, ...state.activities],
        notifications: [action.notification, ...state.notifications],
        auditLog: [action.audit, ...state.auditLog],
      };
    }
    case 'REVIEW_SUBMISSION':
      return {
        ...state,
        submissions: state.submissions.map((s) => (s.id === action.submissionId ? action.updatedSubmission : s)),
        tasks: state.tasks.map((t) =>
          t.id === action.taskId ? { ...t, status: action.decision, updatedAt: new Date().toISOString() } : t,
        ),
        activities: [action.reviewActivity, ...state.activities],
        notifications: [action.notification, ...state.notifications],
        auditLog: [action.audit, ...state.auditLog],
      };
    case 'ADD_ACTIVITY':
      return { ...state, activities: [action.activity, ...state.activities] };
    case 'ADD_DOCUMENT':
      return { ...state, documents: [action.document, ...state.documents] };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) => (n.id === action.id ? { ...n, read: true } : n)),
      };
    case 'MARK_ALL_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) => (n.userId === action.userId ? { ...n, read: true } : n)),
      };
    case 'ADD_REPORT':
      return {
        ...state,
        generatedReports: [action.report, ...state.generatedReports],
        auditLog: [action.audit, ...state.auditLog],
        notifications: [action.notification, ...state.notifications],
      };
    case 'ADD_ATTENDANCE':
      return { ...state, attendance: [action.record, ...state.attendance] };
    case 'ADD_ACADEMIC_RECORD':
      return { ...state, academicRecords: [action.record, ...state.academicRecords] };
    case 'ADD_PERFORMANCE':
      return { ...state, studentPerformance: [action.record, ...state.studentPerformance] };
    case 'PUSH_TOAST':
      return { ...state, toasts: [...state.toasts, action.toast] };
    case 'DISMISS_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };
    case 'RESET_DEMO':
      return freshState();
    default:
      return state;
  }
}

export interface CreateTaskInput {
  title: string;
  description: string;
  instructions?: string;
  category: TaskCategory;
  priority: TaskPriority;
  assignedTeacherIds: string[];
  startDate: string;
  deadline: string;
  requiresFile: boolean;
  recurring?: RecurrenceRule;
  templateId?: string;
}

interface AppContextValue {
  state: AppState;
  login: (email: string, password: string, role: Role) => { ok: boolean; error?: string };
  logout: () => void;
  addTeacher: (input: Omit<Teacher, 'id' | 'role' | 'stats' | 'currentStatus'>) => void;
  updateTeacher: (id: string, patch: Partial<Teacher>) => void;
  deactivateTeacher: (id: string) => void;
  createTask: (input: CreateTaskInput) => void;
  startTask: (taskId: string) => void;
  submitWork: (taskId: string, teacherId: string, fileName: string, fileType: string, remarks: string) => void;
  reviewSubmission: (submissionId: string, decision: 'Approved' | 'Rejected', comment?: string) => void;
  addActivity: (input: Omit<ActivityLogEntry, 'id' | 'createdAt'>) => void;
  addDocument: (input: Omit<FacultyDocument, 'id' | 'uploadedAt'>) => void;
  markNotificationRead: (id: string) => void;
  markAllRead: (userId: string) => void;
  generateReport: (type: ReportType, filters: ReportFilters, periodLabel: string) => GeneratedReport;
  addAttendance: (input: Omit<AttendanceRecord, 'id'>) => void;
  addAcademicRecord: (input: Omit<AcademicRecord, 'id'>) => void;
  addPerformance: (input: Omit<StudentPerformanceRecord, 'id'>) => void;
  pushToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
  resetDemo: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    const { toasts, ...persisted } = state;
    void toasts;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
  }, [state]);

  const pushToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = makeId('toast');
    dispatch({ type: 'PUSH_TOAST', toast: { ...toast, id } });
    setTimeout(() => dispatch({ type: 'DISMISS_TOAST', id }), 4200);
  }, []);

  const dismissToast = useCallback((id: string) => dispatch({ type: 'DISMISS_TOAST', id }), []);

  const login = useCallback(
    (email: string, password: string, role: Role): { ok: boolean; error?: string } => {
      const normalizedEmail = email.trim().toLowerCase();
      if (role === 'HOD') {
        if (normalizedEmail === state.hod.email.toLowerCase() && password === 'hod123') {
          dispatch({ type: 'LOGIN', user: state.hod });
          return { ok: true };
        }
        return { ok: false, error: 'Invalid HOD email or password.' };
      }
      const teacher = state.teachers.find((t) => t.email.toLowerCase() === normalizedEmail);
      if (teacher && password === 'teacher123') {
        dispatch({ type: 'LOGIN', user: teacher });
        return { ok: true };
      }
      return { ok: false, error: 'Invalid teacher email or password.' };
    },
    [state.hod, state.teachers],
  );

  const logout = useCallback(() => dispatch({ type: 'LOGOUT' }), []);

  const addTeacher = useCallback((input: Omit<Teacher, 'id' | 'role' | 'stats' | 'currentStatus'>) => {
    const teacher: Teacher = {
      ...input,
      id: makeId('teacher'),
      role: 'TEACHER',
      currentStatus: 'Active',
      stats: { assigned: 0, completed: 0, pending: 0, overdue: 0, documents: 0, activities: 0, completionRate: 100 },
    };
    dispatch({ type: 'ADD_TEACHER', teacher });
    pushToast({ variant: 'success', title: 'Teacher added', description: `${teacher.name} can now sign in with the default password.` });
  }, [pushToast]);

  const updateTeacher = useCallback(
    (id: string, patch: Partial<Teacher>) => {
      dispatch({ type: 'UPDATE_TEACHER', id, patch });
      pushToast({ variant: 'success', title: 'Teacher profile updated' });
    },
    [pushToast],
  );

  const deactivateTeacher = useCallback(
    (id: string) => {
      const teacher = state.teachers.find((t) => t.id === id);
      dispatch({ type: 'UPDATE_TEACHER', id, patch: { status: teacher?.status === 'Inactive' ? 'Active' : 'Inactive' } });
      pushToast({ variant: 'info', title: teacher?.status === 'Inactive' ? 'Teacher reactivated' : 'Teacher deactivated' });
    },
    [state.teachers, pushToast],
  );

  const createTask = useCallback(
    (input: CreateTaskInput) => {
      const now = new Date().toISOString();
      const task: Task = {
        id: makeId('task'),
        title: input.title,
        description: input.description,
        instructions: input.instructions,
        category: input.category,
        priority: input.priority,
        assignedTeacherIds: input.assignedTeacherIds,
        assignedBy: state.hod.id,
        startDate: input.startDate,
        deadline: input.deadline,
        requiresFile: input.requiresFile,
        status: 'Assigned',
        recurring: input.recurring,
        templateId: input.templateId,
        createdAt: now,
        updatedAt: now,
      };
      const notifications: AppNotification[] = input.assignedTeacherIds.map((teacherId) => ({
        id: makeId('notif'),
        userId: teacherId,
        type: 'task_assigned',
        title: 'New task assigned',
        message: `${state.hod.name} assigned you "${task.title}", due ${task.deadline}.`,
        createdAt: now,
        read: false,
        linkTaskId: task.id,
      }));
      const teacherNames = input.assignedTeacherIds
        .map((id) => state.teachers.find((t) => t.id === id)?.name)
        .filter(Boolean)
        .join(', ');
      const audit: AuditLogEntry = {
        id: makeId('audit'),
        actorId: state.hod.id,
        actorName: state.hod.name,
        action: `Assigned "${task.title}" to ${teacherNames}`,
        entityType: 'Task',
        entityLabel: task.title,
        timestamp: now,
      };
      dispatch({ type: 'CREATE_TASK', task, notifications, audit });
      pushToast({
        variant: 'success',
        title: input.recurring ? 'Recurring task configured successfully.' : 'Task created and assigned',
        description: `"${task.title}" sent to ${input.assignedTeacherIds.length} teacher${input.assignedTeacherIds.length > 1 ? 's' : ''}.`,
      });
    },
    [state.hod, state.teachers, pushToast],
  );

  const startTask = useCallback(
    (taskId: string) => {
      dispatch({ type: 'START_TASK', taskId });
      pushToast({ variant: 'info', title: 'Task marked in progress' });
    },
    [pushToast],
  );

  const submitWork = useCallback(
    (taskId: string, teacherId: string, fileName: string, fileType: string, remarks: string) => {
      const now = new Date().toISOString();
      const task = state.tasks.find((t) => t.id === taskId);
      const teacher = state.teachers.find((t) => t.id === teacherId);
      const existing = state.submissions.find((s) => s.taskId === taskId && s.teacherId === teacherId);
      const nextVersion = existing ? existing.currentVersion + 1 : 1;
      const versionEntry = {
        version: nextVersion,
        submittedAt: now,
        fileName,
        fileType,
        fileSizeKb: Math.floor(200 + Math.random() * 2600),
        remarks,
        outcome: 'Pending' as const,
      };
      const submission: Submission = existing
        ? { ...existing, versions: [...existing.versions, versionEntry], currentVersion: nextVersion, status: 'Under Review' }
        : { id: makeId('sub'), taskId, teacherId, versions: [versionEntry], currentVersion: 1, status: 'Under Review' };

      const document: FacultyDocument = {
        id: makeId('doc'),
        name: fileName,
        category: (task?.category as unknown as DocumentCategory) ?? 'Other',
        teacherId,
        fileType: fileType as FacultyDocument['fileType'],
        sizeKb: versionEntry.fileSizeKb,
        uploadedAt: now,
        relatedTaskId: taskId,
      };
      const activity: ActivityLogEntry = {
        id: makeId('act'),
        teacherId,
        title: `${task?.title ?? 'Task'} Submitted`,
        category: 'Report',
        description: remarks || `Submitted work for "${task?.title ?? 'task'}".`,
        date: isoDate(new Date()),
        createdAt: now,
      };
      const notification: AppNotification = {
        id: makeId('notif'),
        userId: state.hod.id,
        type: 'new_submission',
        title: 'New submission received',
        message: `${teacher?.name ?? 'A teacher'} submitted "${task?.title ?? 'a task'}" for review.`,
        createdAt: now,
        read: false,
        linkTaskId: taskId,
        linkTeacherId: teacherId,
      };
      const audit: AuditLogEntry = {
        id: makeId('audit'),
        actorId: teacherId,
        actorName: teacher?.name ?? 'Faculty',
        action: `${existing ? 'Resubmitted' : 'Uploaded'} submission for "${task?.title ?? 'task'}"`,
        entityType: 'Submission',
        entityLabel: task?.title ?? 'Submission',
        timestamp: now,
      };
      dispatch({ type: 'SUBMIT_WORK', taskId, submission, isNewSubmission: !existing, document, activity, notification, audit });
      pushToast({ variant: 'success', title: 'Work submitted', description: 'Your submission is now with the HOD for review.' });
    },
    [state.tasks, state.teachers, state.submissions, state.hod, pushToast],
  );

  const reviewSubmission = useCallback(
    (submissionId: string, decision: 'Approved' | 'Rejected', comment?: string) => {
      const submission = state.submissions.find((s) => s.id === submissionId);
      if (!submission) return;
      const now = new Date().toISOString();
      const task = state.tasks.find((t) => t.id === submission.taskId);
      const teacher = state.teachers.find((t) => t.id === submission.teacherId);
      const updatedVersions = submission.versions.map((v, i) =>
        i === submission.versions.length - 1
          ? { ...v, outcome: decision, reviewComment: comment, reviewedAt: now }
          : v,
      );
      const updatedSubmission: Submission = { ...submission, versions: updatedVersions, status: decision };
      const notification: AppNotification = {
        id: makeId('notif'),
        userId: submission.teacherId,
        type: decision === 'Approved' ? 'submission_approved' : 'submission_rejected',
        title: decision === 'Approved' ? 'Submission approved' : 'Submission rejected',
        message:
          decision === 'Approved'
            ? `Your submission for "${task?.title ?? 'task'}" was approved.`
            : `Your submission for "${task?.title ?? 'task'}" was rejected: ${comment ?? 'Please review and resubmit.'}`,
        createdAt: now,
        read: false,
        linkTaskId: submission.taskId,
      };
      const audit: AuditLogEntry = {
        id: makeId('audit'),
        actorId: state.hod.id,
        actorName: state.hod.name,
        action: `${decision} submission from ${teacher?.name ?? 'faculty'} for "${task?.title ?? 'task'}"`,
        entityType: 'Submission',
        entityLabel: task?.title ?? 'Submission',
        timestamp: now,
      };
      const reviewActivity: ActivityLogEntry = {
        id: makeId('act'),
        teacherId: submission.teacherId,
        title: `${task?.title ?? 'Task'} ${decision}`,
        category: 'Report',
        description: comment,
        date: isoDate(new Date()),
        createdAt: now,
      };
      dispatch({
        type: 'REVIEW_SUBMISSION',
        submissionId,
        taskId: submission.taskId,
        decision,
        updatedSubmission,
        reviewActivity,
        notification,
        audit,
      });
      pushToast({
        variant: decision === 'Approved' ? 'success' : 'warning',
        title: decision === 'Approved' ? 'Submission approved' : 'Submission rejected',
      });
    },
    [state.submissions, state.tasks, state.teachers, state.hod, pushToast],
  );

  const addActivity = useCallback(
    (input: Omit<ActivityLogEntry, 'id' | 'createdAt'>) => {
      const activity: ActivityLogEntry = { ...input, id: makeId('act'), createdAt: new Date().toISOString() };
      dispatch({ type: 'ADD_ACTIVITY', activity });
      pushToast({ variant: 'success', title: 'Activity logged' });
    },
    [pushToast],
  );

  const addDocument = useCallback(
    (input: Omit<FacultyDocument, 'id' | 'uploadedAt'>) => {
      const document: FacultyDocument = { ...input, id: makeId('doc'), uploadedAt: new Date().toISOString() };
      dispatch({ type: 'ADD_DOCUMENT', document });
      pushToast({ variant: 'success', title: 'Document uploaded' });
    },
    [pushToast],
  );

  const markNotificationRead = useCallback((id: string) => dispatch({ type: 'MARK_NOTIFICATION_READ', id }), []);
  const markAllRead = useCallback((userId: string) => dispatch({ type: 'MARK_ALL_READ', userId }), []);

  const generateReport = useCallback(
    (type: ReportType, filters: ReportFilters, periodLabel: string): GeneratedReport => {
      const now = new Date().toISOString();
      const report: GeneratedReport = {
        id: makeId('report'),
        type,
        filters,
        generatedAt: now,
        generatedBy: state.hod.id,
        periodLabel,
      };
      const audit: AuditLogEntry = {
        id: makeId('audit'),
        actorId: state.hod.id,
        actorName: state.hod.name,
        action: `Generated "${type}"`,
        entityType: 'Report',
        entityLabel: type,
        timestamp: now,
      };
      const notification: AppNotification = {
        id: makeId('notif'),
        userId: state.hod.id,
        type: 'report_generated',
        title: 'Report generated',
        message: `${type} for ${periodLabel} is ready to download.`,
        createdAt: now,
        read: false,
      };
      dispatch({ type: 'ADD_REPORT', report, audit, notification });
      return report;
    },
    [state.hod],
  );

  const addAttendance = useCallback((input: Omit<AttendanceRecord, 'id'>) => {
    dispatch({ type: 'ADD_ATTENDANCE', record: { ...input, id: makeId('att') } });
    pushToast({ variant: 'success', title: 'Attendance recorded' });
  }, [pushToast]);

  const addAcademicRecord = useCallback((input: Omit<AcademicRecord, 'id'>) => {
    dispatch({ type: 'ADD_ACADEMIC_RECORD', record: { ...input, id: makeId('acad') } });
    pushToast({ variant: 'success', title: 'Academic work recorded' });
  }, [pushToast]);

  const addPerformance = useCallback((input: Omit<StudentPerformanceRecord, 'id'>) => {
    dispatch({ type: 'ADD_PERFORMANCE', record: { ...input, id: makeId('perf') } });
    pushToast({ variant: 'success', title: 'Performance record added' });
  }, [pushToast]);

  const resetDemo = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    dispatch({ type: 'RESET_DEMO' });
    pushToast({ variant: 'info', title: 'Demo data reset' });
  }, [pushToast]);

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      login,
      logout,
      addTeacher,
      updateTeacher,
      deactivateTeacher,
      createTask,
      startTask,
      submitWork,
      reviewSubmission,
      addActivity,
      addDocument,
      markNotificationRead,
      markAllRead,
      generateReport,
      addAttendance,
      addAcademicRecord,
      addPerformance,
      pushToast,
      dismissToast,
      resetDemo,
    }),
    [
      state,
      login,
      logout,
      addTeacher,
      updateTeacher,
      deactivateTeacher,
      createTask,
      startTask,
      submitWork,
      reviewSubmission,
      addActivity,
      addDocument,
      markNotificationRead,
      markAllRead,
      generateReport,
      addAttendance,
      addAcademicRecord,
      addPerformance,
      pushToast,
      dismissToast,
      resetDemo,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
