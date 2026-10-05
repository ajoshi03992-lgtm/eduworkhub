// ============================================================================
// EduWorkHub — Core Data Model
// ----------------------------------------------------------------------------
// These interfaces describe the shape of every domain entity in the system.
// In this demo they are served by mock services backed by localStorage, but
// the shapes are written to map directly onto a future REST/GraphQL API and
// a relational schema (see services/README notes in each service file).
// ============================================================================

export type Role = 'HOD' | 'TEACHER' | 'SUPER_ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  employeeId: string;
  department: string;
  designation: string;
  avatarColor: string;
  phone?: string;
  joinDate: string; // ISO date
  // NOTE (future backend): passwords are never modeled/stored client-side.
  // A real implementation authenticates via a JWT-issuing /auth/login
  // endpoint; the client only ever holds a short-lived access token.
}

export interface Teacher extends User {
  role: 'TEACHER';
  subjects: string[];
  classes: string[];
  status: 'Active' | 'On Leave' | 'Inactive';
  currentStatus: 'Active' | 'Needs Attention';
  stats: {
    assigned: number;
    completed: number;
    pending: number;
    overdue: number;
    documents: number;
    activities: number;
    completionRate: number;
  };
}

export type TaskCategory =
  | 'Academic'
  | 'Department'
  | 'Administrative'
  | 'Student Activity'
  | 'Documentation'
  | 'Examination'
  | 'Event'
  | 'Other';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type TaskStatus =
  | 'Assigned'
  | 'In Progress'
  | 'Submitted'
  | 'Under Review'
  | 'Approved'
  | 'Rejected'
  | 'Overdue';

export interface RecurrenceRule {
  frequency: 'Weekly' | 'Monthly' | 'Quarterly';
  dayOfMonth?: number;
  label: string; // e.g. "5th of every month"
}

export interface Task {
  id: string;
  title: string;
  description: string;
  instructions?: string;
  category: TaskCategory;
  priority: TaskPriority;
  assignedTeacherIds: string[];
  assignedBy: string; // HOD user id
  startDate: string;
  deadline: string;
  requiresFile: boolean;
  status: TaskStatus;
  recurring?: RecurrenceRule;
  templateId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionVersion {
  version: number;
  submittedAt: string;
  fileName: string;
  fileType: string;
  fileSizeKb: number;
  remarks?: string;
  outcome: 'Pending' | 'Approved' | 'Rejected';
  reviewComment?: string;
  reviewedAt?: string;
}

export interface Submission {
  id: string;
  taskId: string;
  teacherId: string;
  versions: SubmissionVersion[];
  currentVersion: number;
  status: 'Under Review' | 'Approved' | 'Rejected';
}

export type DocumentCategory =
  | 'Academic'
  | 'Department'
  | 'Administrative'
  | 'Examination'
  | 'Events'
  | 'Student Activities'
  | 'Other';

export interface DocumentSubFolder {
  Academic: 'Lesson Plans' | 'Attendance' | 'Question Papers' | 'Assignments' | 'Result Analysis';
  Department: 'Meeting Reports' | 'Event Reports' | 'Committee Documents';
}

export interface FacultyDocument {
  id: string;
  name: string;
  category: DocumentCategory;
  subFolder?: string;
  teacherId: string;
  fileType: 'PDF' | 'DOCX' | 'XLSX' | 'PPTX' | 'JPG' | 'PNG';
  sizeKb: number;
  uploadedAt: string;
  relatedTaskId?: string;
}

export type ActivityCategory =
  | 'Lecture'
  | 'Evaluation'
  | 'Meeting'
  | 'Documentation'
  | 'Report'
  | 'Other';

export interface ActivityLogEntry {
  id: string;
  teacherId: string;
  title: string;
  category: ActivityCategory;
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  relatedSubject?: string;
  hasAttachment?: boolean;
  remarks?: string;
  createdAt: string;
}

export type NotificationType =
  | 'task_assigned'
  | 'deadline_reminder'
  | 'submission_approved'
  | 'submission_rejected'
  | 'new_comment'
  | 'work_overdue'
  | 'report_generated'
  | 'new_submission';

export interface AppNotification {
  id: string;
  userId: string; // recipient
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  linkTaskId?: string;
  linkTeacherId?: string;
}

export interface AttendanceRecord {
  id: string;
  teacherId: string;
  date: string;
  subject: string;
  className: string;
  division: string;
  totalStudents: number;
  present: number;
  absent: number;
}

export interface AcademicRecord {
  id: string;
  teacherId: string;
  subject: string;
  classDivision: string;
  lectureDate: string;
  topicCovered: string;
  lectureType: 'Theory' | 'Practical' | 'Tutorial';
  syllabusUnit: string;
  hours: number;
  remarks?: string;
}

export interface SyllabusProgress {
  subject: string;
  teacherId: string;
  units: { name: string; percent: number }[];
  overall: number;
}

export interface StudentPerformanceRecord {
  id: string;
  teacherId: string;
  className: string;
  subject: string;
  assessment: string;
  totalStudents: number;
  passed: number;
  failed: number;
  averageMarks: number;
  highest: number;
  lowest: number;
  date: string;
}

export type ReportType =
  | 'Department Summary'
  | 'Teacher Work Report'
  | 'Task Completion Report'
  | 'Pending Work Report'
  | 'Overdue Work Report'
  | 'Academic Activity Report'
  | 'Document Submission Report'
  | 'Attendance Report'
  | 'Student Performance Report'
  | 'Monthly Department Report';

export interface ReportFilters {
  teacherId?: string;
  category?: string;
  status?: string;
  subject?: string;
  fromDate?: string;
  toDate?: string;
}

export interface GeneratedReport {
  id: string;
  type: ReportType;
  filters: ReportFilters;
  generatedAt: string;
  generatedBy: string;
  periodLabel: string;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  entityType: 'Task' | 'Submission' | 'Teacher' | 'Document' | 'Report' | 'Activity';
  entityLabel: string;
  timestamp: string;
}

export interface TaskTemplate {
  id: string;
  name: string;
  category: TaskCategory;
  description: string;
  defaultPriority: TaskPriority;
  requiresFile: boolean;
  suggestedRecurrence?: RecurrenceRule;
}

export interface ToastMessage {
  id: string;
  variant: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
}
