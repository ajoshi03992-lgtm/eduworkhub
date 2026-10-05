# EduWorkHub
### College Faculty Work Management & Reporting System

A production-styled demo for **ABC College of Science & Technology — Department of Computer Science**.
It shows how teacher work (academic, departmental, administrative, documentation) can be recorded,
submitted, reviewed and reported from one system, with the HOD getting a centralized overview.

Everything runs in the browser against a typed mock backend persisted in `localStorage`.
It is structured so a real API can replace the mock layer later.

## 1. Run the project

Requires Node.js 18+.

    npm install
    npm run dev          # open http://localhost:5173
    npm run build        # type-check + production build (dist/)
    npm run preview      # serve the production build

## 2. Demo credentials (demo only)

| Role    | Email                  | Password   |
|---------|------------------------|------------|
| HOD     | hod@abccollege.edu     | hod123     |
| Teacher | rahul@abccollege.edu   | teacher123 |

Other teachers sign in as Teacher with `<firstname>@abccollege.edu` / `teacher123`
(priya@, amit@, sneha@, neha@, akash@ ... abccollege.edu).
HOD > Settings > Reset Demo Data restores the original dataset.

## 3. End-to-end demo story

1. Sign in as HOD: dashboard KPIs, Requires Attention, Department Activity, Teacher Work Overview.
2. Teachers > Prof. Rahul Sharma: 360 profile.
3. Work Management > Create Task: "Internal Assessment Report" -> Rahul, deadline 30 Sep 2026
   (or Templates > Use Template).
4. Sign out, sign in as Rahul: "New task assigned" notification; open the task in My Tasks.
5. Attach any file, add remarks, Submit Work.
6. Sign in as HOD: new-submission notification; Submissions > Under Review.
7. Review > Reject with a comment ("Please update the Division B attendance section.").
8. Sign in as Rahul: see the rejection, resubmit (version 2).
9. Sign in as HOD: Approve. Task becomes Approved; dashboard counters update.
10. Reports & Analytics > Monthly Department Report > Generate > Preview > Download / Print PDF.

## 4. Technology

React 19, TypeScript (strict), Vite, Tailwind CSS v4, React Router v7, Recharts, lucide-react.

## 5. Project structure

    src/
      types/          Domain interfaces (User, Teacher, Task, Submission, Document, Activity,
                      Notification, AttendanceRecord, AcademicRecord, Report, AuditLogEntry ...)
      data/           pools.ts (name/title pools), seed.ts (deterministic seeded data generator)
      context/        AppContext.tsx - reducer store + localStorage persistence + actions
                      (login, createTask, submitWork, reviewSubmission, generateReport ...)
      lib/            selectors.ts (live derived stats), utils.ts (PRNG, dates, helpers)
      components/
        ui/           Button, Badge, Card, Modal, Form controls, Tabs, Dropdown, Toaster,
                      EmptyState, Skeletons, Avatar, StatCard, Alert
        layout/       Sidebar, Header, AppShell, GlobalSearch, ProtectedRoute, nav config
        shared/       ReportPreview (print-ready report document)
      pages/
        auth/         Login
        hod/          Dashboard, Teachers, TeacherProfile, WorkManagement, AcademicWork,
                      Documents, Submissions, ReportsAnalytics, Notifications, ActivityLog, Settings
        teacher/      Dashboard, MyWork, MyTasks, TaskDetail, AcademicWork, Documents,
                      DailyActivity, Submissions, Notifications, MyReports, Profile

## 6. Main features

- Role-based login (HOD / Teacher), remember me, forgot-password UI, loading + error states
- HOD dashboard: KPI cards, Requires Attention queue, activity feed, sortable teacher table
- Teacher 360 profile with syllabus progress, tasks, documents, filterable activity timeline
- Work Management: create/assign tasks, status views, recurring tasks, task templates
- Submission review: approve / reject (comment required), version history, resubmission
- Document repository with category / teacher / type filters
- Academic work, attendance and student performance views; teachers can record lectures
- Daily activity log feeding the HOD department feed
- Notifications with unread counts and mark-as-read
- Reports: 10 report types, print-ready preview, Download / Print PDF (browser print + print CSS),
  plus 8 Recharts analytics panels
- Audit log, global search, responsive layout (mobile drawer), skeleton/empty/toast states

## 7. Future backend integration plan

1. Replace the bodies of AppContext actions with REST/GraphQL calls; call sites stay unchanged.
2. Auth: JWT from POST /auth/login (short-lived access + refresh token), server-side password hashing.
3. Authorization: enforce HOD vs TEACHER on every mutating endpoint (e.g. approve/reject).
4. Files: signed-URL or multipart upload, server-side type/size validation, private object storage.
5. Persistence: `src/types` maps to relational tables (SubmissionVersion as a child table).
6. Reports: keep ReportDocument; feed it server-aggregated data at scale.
7. Real time: WebSockets/polling for notifications and the activity feed.

Demo credentials are for evaluation only.
