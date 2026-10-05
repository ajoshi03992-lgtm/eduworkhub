import type {
  Teacher,
  Task,
  TaskCategory,
  TaskPriority,
  TaskStatus,
  Submission,
  FacultyDocument,
  ActivityLogEntry,
  ActivityCategory,
  AppNotification,
  AttendanceRecord,
  AcademicRecord,
  SyllabusProgress,
  StudentPerformanceRecord,
  AuditLogEntry,
  TaskTemplate,
  User,
} from '../types';
import {
  SUBJECTS,
  CLASS_DIVISIONS,
  DESIGNATIONS,
  AVATAR_COLORS,
  TEACHER_NAMES,
  TASK_TITLE_POOL,
  ACTIVITY_TITLES,
  DOCUMENT_STRUCTURE,
  FILE_TYPES,
  REVIEW_REJECT_COMMENTS,
} from './pools';
import { mulberry32, pick, pickMany, randInt, makeId, resetIdCounter, TODAY, isoDate, addDays } from '../lib/utils';

const TASK_CATEGORIES: TaskCategory[] = [
  'Academic',
  'Department',
  'Administrative',
  'Student Activity',
  'Documentation',
  'Examination',
  'Event',
  'Other',
];

const PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High', 'Urgent'];

export interface SeedData {
  hod: User;
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
}

const HOD: User = {
  id: 'user-hod-1',
  name: 'Dr. Meera Mehta',
  email: 'hod@abccollege.edu',
  role: 'HOD',
  employeeId: 'CS-001',
  department: 'Computer Science',
  designation: 'Head of Department, Professor',
  avatarColor: '#16294F',
  joinDate: '2014-06-12',
  phone: '+91 98220 11234',
};

const TASK_TEMPLATES: TaskTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Monthly Attendance Report',
    category: 'Administrative',
    description: 'Consolidated subject-wise attendance for the month across all divisions.',
    defaultPriority: 'Medium',
    requiresFile: true,
    suggestedRecurrence: { frequency: 'Monthly', dayOfMonth: 5, label: '5th of every month' },
  },
  {
    id: 'tpl-2',
    name: 'Internal Assessment Report',
    category: 'Examination',
    description: 'Marks and analysis for the internal assessment conducted for the subject.',
    defaultPriority: 'High',
    requiresFile: true,
  },
  {
    id: 'tpl-3',
    name: 'Lesson Plan',
    category: 'Academic',
    description: 'Unit-wise lesson plan mapped to syllabus for the semester.',
    defaultPriority: 'Medium',
    requiresFile: true,
  },
  {
    id: 'tpl-4',
    name: 'Result Analysis',
    category: 'Examination',
    description: 'Pass percentage, average marks and remedial plan for a conducted assessment.',
    defaultPriority: 'High',
    requiresFile: true,
  },
  {
    id: 'tpl-5',
    name: 'Question Paper Submission',
    category: 'Examination',
    description: 'Moderated question paper with answer key for the scheduled examination.',
    defaultPriority: 'Urgent',
    requiresFile: true,
  },
  {
    id: 'tpl-6',
    name: 'Department Activity Report',
    category: 'Department',
    description: 'Summary of department-level activity, events and committee work.',
    defaultPriority: 'Low',
    requiresFile: true,
  },
  {
    id: 'tpl-7',
    name: 'Event Report',
    category: 'Event',
    description: 'Report covering an organised event, workshop or guest lecture.',
    defaultPriority: 'Medium',
    requiresFile: true,
  },
  {
    id: 'tpl-8',
    name: 'Student Performance Report',
    category: 'Student Activity',
    description: 'Class-wise student performance overview with mentorship notes.',
    defaultPriority: 'Medium',
    requiresFile: true,
  },
];

// Explicit, brief-specified stats for the four fully-detailed teachers.
const FEATURED_STATS: Record<string, { assigned: number; completed: number; pending: number; overdue: number; subjects: string[] }> = {
  'Rahul Sharma': { assigned: 28, completed: 25, pending: 2, overdue: 1, subjects: ['DBMS', 'Operating Systems'] },
  'Priya Patil': { assigned: 24, completed: 23, pending: 1, overdue: 0, subjects: ['Java'] },
  'Amit Joshi': { assigned: 31, completed: 26, pending: 3, overdue: 2, subjects: ['Python'] },
  'Sneha Kulkarni': { assigned: 27, completed: 25, pending: 2, overdue: 0, subjects: ['Data Structures'] },
};

function buildTeacher(rand: () => number, name: string, index: number): Teacher {
  const featured = FEATURED_STATS[name];
  const subjects = featured ? featured.subjects : pickMany(rand, [...SUBJECTS], randInt(rand, 1, 2));
  const classes = pickMany(rand, CLASS_DIVISIONS, randInt(rand, 1, 2));
  const designation = index < 3 ? 'Professor' : index < 10 ? 'Associate Professor' : pick(rand, DESIGNATIONS);
  const onLeave = !featured && rand() < 0.06;

  const assigned = featured ? featured.assigned : randInt(rand, 16, 30);
  const overdue = featured ? featured.overdue : rand() < 0.35 ? randInt(rand, 1, 3) : 0;
  const pending = featured ? featured.pending : randInt(rand, 0, 3);
  const completed = featured ? featured.completed : Math.max(assigned - overdue - pending, 0);
  const completionRate = assigned > 0 ? Math.round((completed / assigned) * 100) : 100;

  return {
    id: makeId('teacher'),
    name: `Prof. ${name}`,
    email: `${name.toLowerCase().split(' ')[0]}@abccollege.edu`,
    role: 'TEACHER',
    employeeId: `CS-1${(index + 4).toString().padStart(2, '0')}`,
    department: 'Computer Science',
    designation,
    avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
    phone: `+91 9${randInt(rand, 100000000, 999999999)}`,
    joinDate: isoDate(addDays(TODAY, -randInt(rand, 400, 4000))),
    subjects,
    classes,
    status: onLeave ? 'On Leave' : 'Active',
    currentStatus: overdue > 0 || completionRate < 88 ? 'Needs Attention' : 'Active',
    stats: {
      assigned,
      completed,
      pending,
      overdue,
      documents: randInt(rand, 20, 70),
      activities: randInt(rand, 60, 160),
      completionRate,
    },
  };
}

function buildTasksForTeacher(rand: () => number, teacher: Teacher): Task[] {
  const tasks: Task[] = [];
  const { assigned, completed, pending, overdue } = teacher.stats;
  const inProgress = Math.max(0, Math.floor(pending / 2));
  const stillAssigned = Math.max(0, pending - inProgress);

  const push = (status: TaskStatus, daysAgoRange: [number, number], deadlineOffsetRange: [number, number]) => {
    const category = pick(rand, TASK_CATEGORIES);
    const title = pick(rand, TASK_TITLE_POOL[category]);
    const created = addDays(TODAY, -randInt(rand, daysAgoRange[0], daysAgoRange[1]));
    const deadline = addDays(created, randInt(rand, deadlineOffsetRange[0], deadlineOffsetRange[1]));
    tasks.push({
      id: makeId('task'),
      title,
      description: `${title} for ${teacher.subjects[0] ?? 'the department'}, covering the current academic cycle.`,
      instructions: 'Attach the supporting file and add remarks describing scope covered before submitting.',
      category,
      priority: pick(rand, PRIORITIES),
      assignedTeacherIds: [teacher.id],
      assignedBy: HOD.id,
      startDate: isoDate(created),
      deadline: isoDate(deadline),
      requiresFile: true,
      status,
      createdAt: created.toISOString(),
      updatedAt: created.toISOString(),
    });
  };

  for (let i = 0; i < completed; i++) push('Approved', [10, 75], [3, 10]);
  for (let i = 0; i < overdue; i++) push('Overdue', [8, 30], [-10, -1]);
  for (let i = 0; i < stillAssigned; i++) push('Assigned', [0, 5], [3, 14]);
  for (let i = 0; i < inProgress; i++) push('In Progress', [1, 6], [2, 10]);

  // top up in the unlikely event rounding left the total short
  while (tasks.length < assigned) push('Assigned', [0, 4], [4, 12]);

  return tasks.slice(0, assigned);
}

function buildActivitiesForTeacher(rand: () => number, teacher: Teacher, count: number): ActivityLogEntry[] {
  const cats: ActivityCategory[] = ['Lecture', 'Evaluation', 'Meeting', 'Documentation', 'Report', 'Other'];
  const out: ActivityLogEntry[] = [];
  for (let i = 0; i < count; i++) {
    const category = pick(rand, cats);
    const title = pick(rand, ACTIVITY_TITLES[category]);
    const daysAgo = randInt(rand, 0, 21);
    const date = addDays(TODAY, -daysAgo);
    const startHour = randInt(rand, 8, 16);
    out.push({
      id: makeId('act'),
      teacherId: teacher.id,
      title,
      category,
      description: `${title} — ${teacher.subjects[0] ?? 'General'} (${pick(rand, teacher.classes)})`,
      date: isoDate(date),
      startTime: `${startHour.toString().padStart(2, '0')}:${pick(rand, ['00', '15', '30', '45'])}`,
      endTime: `${(startHour + 1).toString().padStart(2, '0')}:${pick(rand, ['00', '15', '30', '45'])}`,
      relatedSubject: pick(rand, teacher.subjects.length ? teacher.subjects : [...SUBJECTS]),
      hasAttachment: rand() < 0.3,
      createdAt: date.toISOString(),
    });
  }
  return out.sort((a, b) => (a.date < b.date ? 1 : -1));
}

function buildDocumentsForTeacher(rand: () => number, teacher: Teacher, count: number): FacultyDocument[] {
  const categories = Object.keys(DOCUMENT_STRUCTURE) as (keyof typeof DOCUMENT_STRUCTURE)[];
  const out: FacultyDocument[] = [];
  for (let i = 0; i < count; i++) {
    const category = pick(rand, categories);
    const subFolder = pick(rand, DOCUMENT_STRUCTURE[category]);
    const fileType = pick(rand, [...FILE_TYPES]);
    const daysAgo = randInt(rand, 0, 60);
    out.push({
      id: makeId('doc'),
      name: `${subFolder} — ${teacher.subjects[0] ?? 'General'} ${isoDate(addDays(TODAY, -daysAgo)).slice(0, 7)}`,
      category,
      subFolder,
      teacherId: teacher.id,
      fileType,
      sizeKb: randInt(rand, 80, 4200),
      uploadedAt: addDays(TODAY, -daysAgo).toISOString(),
    });
  }
  return out;
}

function buildSyllabusProgress(rand: () => number, teacher: Teacher): SyllabusProgress[] {
  return teacher.subjects.map((subject) => {
    const isRahulDBMS = teacher.name.includes('Rahul') && subject === 'DBMS';
    const units = isRahulDBMS
      ? [
          { name: 'Unit 1', percent: 100 },
          { name: 'Unit 2', percent: 85 },
          { name: 'Unit 3', percent: 60 },
          { name: 'Unit 4', percent: 20 },
        ]
      : Array.from({ length: 4 }).map((_, i) => ({
          name: `Unit ${i + 1}`,
          percent: Math.max(10, 100 - i * randInt(rand, 12, 28)),
        }));
    const overall = Math.round(units.reduce((s, u) => s + u.percent, 0) / units.length);
    return { subject, teacherId: teacher.id, units, overall };
  });
}

export function generateSeed(): SeedData {
  resetIdCounter();
  const rand = mulberry32(20260926);

  const teachers = TEACHER_NAMES.map((name, i) => buildTeacher(rand, name, i));

  const tasks: Task[] = [];
  teachers.forEach((t) => tasks.push(...buildTasksForTeacher(rand, t)));

  // A handful of explicit multi-teacher recurring tasks for the Recurring Tasks view.
  const recurringSeeds: { name: string; category: TaskCategory; teacherCount: number }[] = [
    { name: 'Monthly Attendance Report', category: 'Administrative', teacherCount: 8 },
    { name: 'Department Activity Report', category: 'Department', teacherCount: 6 },
    { name: 'Weekly Lab Utilization Log', category: 'Documentation', teacherCount: 5 },
  ];
  recurringSeeds.forEach((seedDef) => {
    const assignees = pickMany(rand, teachers, seedDef.teacherCount);
    const created = addDays(TODAY, -randInt(rand, 20, 40));
    tasks.push({
      id: makeId('task'),
      title: seedDef.name,
      description: `Recurring ${seedDef.name.toLowerCase()} collected from all assigned faculty.`,
      instructions: 'Submit using the standard department template. This task repeats automatically.',
      category: seedDef.category,
      priority: 'Medium',
      assignedTeacherIds: assignees.map((t) => t.id),
      assignedBy: HOD.id,
      startDate: isoDate(created),
      deadline: isoDate(addDays(TODAY, randInt(rand, 2, 12))),
      requiresFile: true,
      status: 'Assigned',
      recurring: { frequency: 'Monthly', dayOfMonth: 5, label: '5th of every month' },
      createdAt: created.toISOString(),
      updatedAt: created.toISOString(),
    });
  });

  // Submissions: derive from a sample of Approved / Overdue / In-review tasks so the
  // Submission Review + Version History views have realistic, connected content.
  const submissions: Submission[] = [];
  const reviewCandidates = tasks.filter((t) => t.status === 'Approved').slice(0, 26);
  reviewCandidates.forEach((task, idx) => {
    const teacherId = task.assignedTeacherIds[0];
    const submittedAt = addDays(new Date(task.createdAt), randInt(rand, 2, 6));
    const wasRejectedFirst = idx % 4 === 0;
    const versions = [];
    if (wasRejectedFirst) {
      versions.push({
        version: 1,
        submittedAt: submittedAt.toISOString(),
        fileName: `${task.title.replace(/\s+/g, '_')}_v1.pdf`,
        fileType: 'PDF',
        fileSizeKb: randInt(rand, 200, 3000),
        remarks: 'Initial submission for review.',
        outcome: 'Rejected' as const,
        reviewComment: pick(rand, REVIEW_REJECT_COMMENTS),
        reviewedAt: addDays(submittedAt, 1).toISOString(),
      });
    }
    const finalVersionNum = wasRejectedFirst ? 2 : 1;
    versions.push({
      version: finalVersionNum,
      submittedAt: addDays(submittedAt, wasRejectedFirst ? 2 : 0).toISOString(),
      fileName: `${task.title.replace(/\s+/g, '_')}_v${finalVersionNum}.pdf`,
      fileType: 'PDF',
      fileSizeKb: randInt(rand, 200, 3000),
      remarks: 'Updated as per review comments.',
      outcome: 'Approved' as const,
      reviewComment: 'Looks good. Approved.',
      reviewedAt: addDays(submittedAt, wasRejectedFirst ? 3 : 1).toISOString(),
    });
    submissions.push({
      id: makeId('sub'),
      taskId: task.id,
      teacherId,
      versions,
      currentVersion: finalVersionNum,
      status: 'Approved',
    });
  });

  // A few submissions awaiting review right now (for the "Requires Attention" queue).
  const underReviewCandidates = pickMany(
    rand,
    tasks.filter((t) => t.status === 'Assigned' || t.status === 'In Progress'),
    5,
  );
  underReviewCandidates.forEach((task) => {
    task.status = 'Under Review';
    const submittedAt = addDays(TODAY, -randInt(rand, 0, 2));
    submissions.push({
      id: makeId('sub'),
      taskId: task.id,
      teacherId: task.assignedTeacherIds[0],
      versions: [
        {
          version: 1,
          submittedAt: submittedAt.toISOString(),
          fileName: `${task.title.replace(/\s+/g, '_')}_v1.pdf`,
          fileType: 'PDF',
          fileSizeKb: randInt(rand, 200, 3000),
          remarks: 'Submitted for HOD review.',
          outcome: 'Pending',
        },
      ],
      currentVersion: 1,
      status: 'Under Review',
    });
  });

  // A few rejected-and-awaiting-resubmission submissions.
  const rejectedCandidates = pickMany(
    rand,
    tasks.filter((t) => t.status === 'In Progress'),
    3,
  );
  rejectedCandidates.forEach((task) => {
    task.status = 'Rejected';
    const submittedAt = addDays(TODAY, -randInt(rand, 3, 6));
    submissions.push({
      id: makeId('sub'),
      taskId: task.id,
      teacherId: task.assignedTeacherIds[0],
      versions: [
        {
          version: 1,
          submittedAt: submittedAt.toISOString(),
          fileName: `${task.title.replace(/\s+/g, '_')}_v1.pdf`,
          fileType: 'PDF',
          fileSizeKb: randInt(rand, 200, 3000),
          remarks: 'Submitted for review.',
          outcome: 'Rejected',
          reviewComment: pick(rand, REVIEW_REJECT_COMMENTS),
          reviewedAt: addDays(submittedAt, 1).toISOString(),
        },
      ],
      currentVersion: 1,
      status: 'Rejected',
    });
  });

  const documents: FacultyDocument[] = [];
  teachers.forEach((t) => documents.push(...buildDocumentsForTeacher(rand, t, randInt(rand, 3, 6))));

  const activities: ActivityLogEntry[] = [];
  teachers.forEach((t) => activities.push(...buildActivitiesForTeacher(rand, t, randInt(rand, 3, 8))));

  const notifications: AppNotification[] = [];
  const notifTeachers = teachers.slice(0, 8);
  notifTeachers.forEach((t, i) => {
    notifications.push({
      id: makeId('notif'),
      userId: t.id,
      type: 'task_assigned',
      title: 'New task assigned',
      message: `Dr. Meera Mehta assigned you a new task.`,
      createdAt: addDays(TODAY, -randInt(rand, 0, 5)).toISOString(),
      read: i > 3,
    });
  });
  notifications.push({
    id: makeId('notif'),
    userId: HOD.id,
    type: 'new_submission',
    title: 'New submissions waiting for review',
    message: '5 submissions are waiting for your review.',
    createdAt: addDays(TODAY, -1).toISOString(),
    read: false,
  });
  notifications.push({
    id: makeId('notif'),
    userId: HOD.id,
    type: 'work_overdue',
    title: 'Overdue tasks flagged',
    message: '12 tasks across the department are now overdue.',
    createdAt: addDays(TODAY, -2).toISOString(),
    read: false,
  });

  const attendance: AttendanceRecord[] = [];
  teachers.forEach((t) => {
    const rounds = randInt(rand, 1, 3);
    for (let i = 0; i < rounds; i++) {
      const total = randInt(rand, 45, 68);
      const present = randInt(rand, Math.round(total * 0.75), total);
      attendance.push({
        id: makeId('att'),
        teacherId: t.id,
        date: isoDate(addDays(TODAY, -randInt(rand, 0, 20))),
        subject: pick(rand, t.subjects.length ? t.subjects : [...SUBJECTS]),
        className: pick(rand, t.classes),
        division: pick(rand, ['A', 'B']),
        totalStudents: total,
        present,
        absent: total - present,
      });
    }
  });

  const academicRecords: AcademicRecord[] = [];
  const syllabusProgress: SyllabusProgress[] = [];
  teachers.forEach((t) => {
    syllabusProgress.push(...buildSyllabusProgress(rand, t));
    const rounds = randInt(rand, 2, 5);
    for (let i = 0; i < rounds; i++) {
      const subject = pick(rand, t.subjects.length ? t.subjects : [...SUBJECTS]);
      academicRecords.push({
        id: makeId('acad'),
        teacherId: t.id,
        subject,
        classDivision: pick(rand, t.classes),
        lectureDate: isoDate(addDays(TODAY, -randInt(rand, 0, 25))),
        topicCovered: `${subject} — Unit ${randInt(rand, 1, 4)} continuation`,
        lectureType: pick(rand, ['Theory', 'Practical', 'Tutorial']),
        syllabusUnit: `Unit ${randInt(rand, 1, 4)}`,
        hours: randInt(rand, 1, 3),
      });
    }
  });

  const studentPerformance: StudentPerformanceRecord[] = [];
  teachers.slice(0, 16).forEach((t) => {
    const total = randInt(rand, 45, 65);
    const failed = randInt(rand, 1, 10);
    const passed = total - failed;
    studentPerformance.push({
      id: makeId('perf'),
      teacherId: t.id,
      className: pick(rand, t.classes),
      subject: pick(rand, t.subjects.length ? t.subjects : [...SUBJECTS]),
      assessment: pick(rand, ['Unit Test 1', 'Unit Test 2', 'Internal Assessment 1', 'Internal Assessment 2']),
      totalStudents: total,
      passed,
      failed,
      averageMarks: randInt(rand, 55, 82),
      highest: randInt(rand, 88, 100),
      lowest: randInt(rand, 20, 45),
      date: isoDate(addDays(TODAY, -randInt(rand, 3, 40))),
    });
  });

  const auditLog: AuditLogEntry[] = [];
  tasks.slice(0, 60).forEach((task) => {
    const teacher = teachers.find((t) => t.id === task.assignedTeacherIds[0]);
    auditLog.push({
      id: makeId('audit'),
      actorId: HOD.id,
      actorName: HOD.name,
      action: `Assigned "${task.title}" to ${teacher?.name ?? 'faculty'}`,
      entityType: 'Task',
      entityLabel: task.title,
      timestamp: task.createdAt,
    });
    if (task.status === 'Approved' || task.status === 'Rejected') {
      auditLog.push({
        id: makeId('audit'),
        actorId: teacher?.id ?? '',
        actorName: teacher?.name ?? 'Faculty',
        action: `Uploaded submission for "${task.title}"`,
        entityType: 'Submission',
        entityLabel: task.title,
        timestamp: task.updatedAt,
      });
      auditLog.push({
        id: makeId('audit'),
        actorId: HOD.id,
        actorName: HOD.name,
        action: `${task.status === 'Approved' ? 'Approved' : 'Rejected'} submission for "${task.title}"`,
        entityType: 'Submission',
        entityLabel: task.title,
        timestamp: task.updatedAt,
      });
    }
  });
  auditLog.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));

  return {
    hod: HOD,
    teachers,
    tasks,
    submissions,
    documents,
    activities,
    notifications,
    attendance,
    academicRecords,
    syllabusProgress,
    studentPerformance,
    auditLog,
    taskTemplates: TASK_TEMPLATES,
  };
}
