export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  studentId?: string;
  institutionId?: string;
  institutionName?: string;
  fullName?: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: string;
  username: string;
  email: string;
  role: string;
  studentId: string;
  institutionId: string;
  institutionName: string;
  fullName: string;
}

export interface StudentProfile {
  id: string;
  rollNo: string;
  regNo: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  department: string;
  program: string;
  currentYear: number;
  currentSemester: number;
  section: string;
  phone?: string;
  cgpa: number;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
    profilePhotoUrl?: string;
    portfolioUrl?: string;
    githubUrl?: string;
    linkedinUrl?: string;
    institutionName: string;
  institutionCode: string;
}

export interface SubjectAttendance {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  totalConducted: number;
  totalAttended: number;
  percentage: number;
  status: string;
}

export interface AttendanceSummary {
  overallPercentage: number;
  totalConducted: number;
  totalAttended: number;
  totalMissed: number;
  monthlyPercentage: number;
  requirementNote: string;
  subjectAttendance: SubjectAttendance[];
}

export interface AttendanceRecord {
  id: string;
  subjectCode: string;
  subjectName: string;
  sessionDate: string;
  periodNumber: number;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_DUTY';
  remarks?: string;
}

export interface TimetableSlot {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  subjectCode: string;
  subjectName: string;
  roomNumber: string;
  facultyName: string;
  slotType: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  credits: number;
  semester: number;
  department: string;
  facultyName: string;
  icon: string;
}

export interface ExamResult {
  id: string;
  subjectCode: string;
  subjectName: string;
  semester: number;
  internalMarks?: number;
  externalMarks?: number;
  totalMarks: number;
  grade: string;
  credits: number;
  examSession?: string;
}

export interface SemesterResult {
  semester: number;
  semesterName: string;
  sgpa: number;
  totalCredits: number;
  resultStatus: string;
  subjects: ExamResult[];
}

export interface Assignment {
  id: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  title: string;
  description: string;
  dueDate: string;
  maxMarks: number;
  submitted: boolean;
  submissionStatus: 'PENDING' | 'SUBMITTED' | 'GRADED';
  submittedAt?: string;
  submissionFileUrl?: string;
  submissionRemarks?: string;
  marksObtained?: number;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  submissionDate: string;
  fileUrl: string;
  remarks?: string;
  status: string;
  marksObtained?: number;
}

export interface Project {
  id: string;
  title: string;
  domain: string;
  description: string;
  guideName?: string;
  teamMembers?: string;
  githubUrl?: string;
  demoUrl?: string;
  status: 'PROPOSED' | 'FACULTY_REVIEW' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED';
  createdAt: string;
}

export interface PlacementDrive {
  id: string;
  companyName: string;
  jobRole: string;
  packageLpa: string;
  minCgpa: number;
  eligibleBranches: string;
  deadline: string;
  status: string;
  companyLogo?: string;
  description?: string;
  eligible: boolean;
  applied: boolean;
  applicationStatus?: string;
}

export interface PlacementApplication {
  id: string;
  driveId: string;
  companyName: string;
  jobRole: string;
  packageLpa: string;
  appliedAt: string;
  status: string;
  remarks?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  publishedAt: string;
  formattedDate: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  category: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
  timeAgo: string;
}

export interface ServiceRequest {
  id: string;
  requestType: string;
  department: string;
  description: string;
  status: 'PENDING' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED';
  resolutionRemarks?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface FeeRecord {
  id: string;
  category: string;
  amount: number;
  dueDate: string;
  status: 'PAID' | 'DUE' | 'OVERDUE';
  receiptNo?: string;
  paidAt?: string;
}

export interface DashboardSummary {
  profile: StudentProfile;
  attendancePercentage: number;
  attendanceNote: string;
  cgpa: number;
  cgpaNote: string;
  pendingAssignments: number;
  assignmentNote: string;
  upcomingExamsCount: number;
  upcomingExamNote: string;
  semesterGpaHistory: number[];
  subjectPerformance: SubjectAttendance[];
  todayClasses: TimetableSlot[];
  latestNotices: Notice[];
  recentActivities: Notification[];
}

export interface ParentWardOverview {
  profile: StudentProfile;
  attendance: AttendanceSummary;
  attendanceHistory: AttendanceRecord[];
  results: SemesterResult[];
  assignments: Assignment[];
  fees: FeeRecord[];
  notices: Notice[];
  notifications: Notification[];
  timetable: TimetableSlot[];
  requests: ServiceRequest[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

// ---- Coding practice / code execution ----

export interface CodeExecutionRequest {
  sourceCode: string;
  programmingLanguage: string;
  standardInput?: string;
}

export interface CodeExecutionResult {
  output: string;
  compilationError: string;
  runtimeError: string;
  executionTime: string;
  compilationSuccessful: boolean;
}
