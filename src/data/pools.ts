import type { TaskCategory, ActivityCategory, DocumentCategory } from '../types';

export const SUBJECTS = [
  'DBMS',
  'Java',
  'Python',
  'Data Structures',
  'Operating Systems',
  'Computer Networks',
  'Web Development',
  'Software Engineering',
] as const;

export const CLASS_DIVISIONS = [
  'SE Div A',
  'SE Div B',
  'TE Div A',
  'TE Div B',
  'BE Div A',
  'BE Div B',
];

export const DESIGNATIONS = ['Assistant Professor', 'Associate Professor', 'Professor'];

export const AVATAR_COLORS = [
  '#16294F',
  '#2F6F5E',
  '#B45309',
  '#1D5B8F',
  '#7C4A9A',
  '#B91C1C',
  '#0E7490',
  '#4D5B7A',
];

// The four teachers with fully detailed, brief-specified stats.
export const FEATURED_TEACHER_NAMES = ['Rahul Sharma', 'Priya Patil', 'Amit Joshi', 'Sneha Kulkarni'];

export const TEACHER_NAMES = [
  'Rahul Sharma',
  'Priya Patil',
  'Amit Joshi',
  'Sneha Kulkarni',
  'Neha Deshmukh',
  'Akash Jadhav',
  'Pooja More',
  'Rohan Shinde',
  'Sakshi Pawar',
  'Vivek Kadam',
  'Kunal Bhosale',
  'Ananya Kulkarni',
  'Siddharth Rane',
  'Manasi Gokhale',
  'Tejas Patwardhan',
  'Ishani Deshpande',
  'Omkar Chavan',
  'Radhika Naik',
  'Yash Thakur',
  'Aditi Sawant',
  'Nikhil Gaikwad',
  'Shruti Joshi',
  'Varun Kale',
  'Pallavi Wagh',
  'Harshad Kambli',
  'Divya Apte',
  'Mandar Sathe',
  'Kavya Nikam',
  'Aarav Bhatt',
  'Simran Kaur',
  'Rutuja Shelke',
  'Prathamesh Jog',
];

export const TASK_TITLE_POOL: Record<TaskCategory, string[]> = {
  Academic: [
    'Lesson Plan Submission',
    'Unit Test Question Paper',
    'Lecture Notes Compilation',
    'Lab Manual Update',
    'Course File Preparation',
    'Tutorial Sheet Preparation',
  ],
  Department: [
    'Department Meeting Minutes',
    'Department Activity Report',
    'Faculty Development Plan Update',
    'Committee Status Update',
    'Infrastructure Requirement Note',
  ],
  Administrative: [
    'Monthly Attendance Report',
    'Leave Reconciliation Sheet',
    'Timetable Compliance Report',
    'Staff Workload Statement',
    'Biometric Attendance Audit',
  ],
  'Student Activity': [
    'Student Mentorship Log',
    'Technical Club Activity Report',
    'Industrial Visit Report',
    'Placement Readiness Update',
    'Student Counselling Summary',
  ],
  Documentation: [
    'NAAC Documentation Update',
    'Accreditation Evidence Upload',
    'Faculty Profile Update',
    'Research Publication Record',
    'Course Outcome Mapping Sheet',
  ],
  Examination: [
    'Internal Assessment Report',
    'Question Paper Submission',
    'Result Analysis Report',
    'Answer Sheet Moderation Summary',
    'Practical Exam Schedule Confirmation',
  ],
  Event: [
    'Technical Event Report',
    'Guest Lecture Coordination Report',
    'Workshop Feedback Summary',
    'Annual Gathering Duty Report',
    'Alumni Meet Summary',
  ],
  Other: [
    'Miscellaneous Compliance Task',
    'Ad-hoc Data Submission',
    'General Office Correspondence',
  ],
};

export const ACTIVITY_TITLES: Record<ActivityCategory, string[]> = {
  Lecture: [
    'DBMS Lecture Completed',
    'Java Practical Session Conducted',
    'Python Lab Session Completed',
    'Operating Systems Lecture Delivered',
    'Computer Networks Tutorial Conducted',
    'Web Development Lab Session',
    'Software Engineering Lecture Completed',
    'Data Structures Doubt Session',
  ],
  Evaluation: [
    'Assignment Evaluation Completed',
    'Internal Assessment Checked',
    'Practical Exam Evaluated',
    'Answer Sheets Moderated',
    'Viva Voce Conducted',
  ],
  Meeting: [
    'Department Meeting Attended',
    'Parent-Teacher Meeting Conducted',
    'Committee Meeting Attended',
    'Placement Coordination Meeting',
  ],
  Documentation: [
    'Attendance Updated',
    'Course File Updated',
    'Lesson Plan Documented',
    'Student Records Updated',
  ],
  Report: [
    'Internal Assessment Report Uploaded',
    'Department Activity Report Submitted',
    'Monthly Report Submitted',
    'Result Analysis Uploaded',
  ],
  Other: ['Student Counselling Session', 'Industrial Visit Coordination', 'Library Duty Completed'],
};

export const DOCUMENT_STRUCTURE: Record<DocumentCategory, string[]> = {
  Academic: ['Lesson Plans', 'Attendance', 'Question Papers', 'Assignments', 'Result Analysis'],
  Department: ['Meeting Reports', 'Event Reports', 'Committee Documents'],
  Administrative: ['Compliance Sheets', 'Leave Records'],
  Examination: ['Question Papers', 'Answer Key', 'Result Sheets'],
  Events: ['Event Reports', 'Photographs', 'Feedback Forms'],
  'Student Activities': ['Mentorship Logs', 'Club Reports'],
  Other: ['General'],
};

export const FILE_TYPES = ['PDF', 'DOCX', 'XLSX', 'PPTX', 'JPG', 'PNG'] as const;

export const REVIEW_REJECT_COMMENTS = [
  'Please update the Division B attendance section and resubmit.',
  'Kindly attach the missing signature page before resubmission.',
  'The syllabus coverage table is incomplete — please add Unit 4 details.',
  'Marks entered for two students do not match the answer sheets. Please recheck.',
  'Please use the latest report template shared in the department drive.',
];
