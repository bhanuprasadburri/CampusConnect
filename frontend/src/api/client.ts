import axios, { AxiosError } from 'axios';
import {
  ApiResponse,
  AuthResponse,
  CodeExecutionRequest,
  CodeExecutionResult,
  DashboardSummary,
  StudentProfile,
  AttendanceSummary,
  AttendanceRecord,
  TimetableSlot,
  Subject,
  SemesterResult,
  Assignment,
  AssignmentSubmission,
  Project,
  PlacementDrive,
  PlacementApplication,
  Notice,
  Notification,
  ServiceRequest,
  FeeRecord,
  ParentWardOverview
} from '../types';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to add JWT Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor for handling errors and session expiry
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const apiClient = {
  // 1. Authentication
  login: async (credentials: { username: string; password: string }): Promise<AuthResponse> => {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return res.data.data;
  },
  getCurrentProfile: async (): Promise<StudentProfile> => {
    const res = await api.get<ApiResponse<StudentProfile>>('/auth/me');
    return res.data.data;
  },
  getParentWards: async (): Promise<StudentProfile[]> => {
    const res = await api.get<ApiResponse<StudentProfile[]>>('/parent/wards');
    return res.data.data;
  },
  getParentWardOverview: async (wardId: string): Promise<ParentWardOverview> => {
    const res = await api.get<ApiResponse<ParentWardOverview>>(`/parent/wards/${wardId}/overview`);
    return res.data.data;
  },

  // 2. Dashboard & Profile
  getDashboard: async (): Promise<DashboardSummary> => {
    const res = await api.get<ApiResponse<DashboardSummary>>('/student/dashboard');
    return res.data.data;
  },
  getProfile: async (): Promise<StudentProfile> => {
    const res = await api.get<ApiResponse<StudentProfile>>('/student/profile');
    return res.data.data;
  },
  updateProfile: async (data: { phone?: string; guardianPhone?: string; guardianEmail?: string; profilePhotoUrl?: string; portfolioUrl?: string; githubUrl?: string; linkedinUrl?: string }): Promise<StudentProfile> => {
    const res = await api.put<ApiResponse<StudentProfile>>('/student/profile', data);
    return res.data.data;
  },
  submitCorrectionRequest: async (data: { fieldName: string; requestedValue: string; reason: string }): Promise<ServiceRequest> => {
    const res = await api.post<ApiResponse<ServiceRequest>>('/student/profile/correction-request', data);
    return res.data.data;
  },

  // 3. Attendance & Timetable
  getAttendanceSummary: async (): Promise<AttendanceSummary> => {
    const res = await api.get<ApiResponse<AttendanceSummary>>('/student/attendance/summary');
    return res.data.data;
  },
  getAttendanceHistory: async (): Promise<AttendanceRecord[]> => {
    const res = await api.get<ApiResponse<AttendanceRecord[]>>('/student/attendance/history');
    return res.data.data;
  },
  getTimetable: async (): Promise<TimetableSlot[]> => {
    const res = await api.get<ApiResponse<TimetableSlot[]>>('/student/timetable');
    return res.data.data;
  },
  getCourses: async (): Promise<Subject[]> => {
    const res = await api.get<ApiResponse<Subject[]>>('/student/courses');
    return res.data.data;
  },

  // 4. Academics, Assignments & Projects
  getAcademicResults: async (): Promise<SemesterResult[]> => {
    const res = await api.get<ApiResponse<SemesterResult[]>>('/student/academics/results');
    return res.data.data;
  },
  getAssignments: async (): Promise<Assignment[]> => {
    const res = await api.get<ApiResponse<Assignment[]>>('/student/assignments');
    return res.data.data;
  },
  submitAssignment: async (assignmentId: string, data: { fileUrl: string; remarks?: string }): Promise<AssignmentSubmission> => {
    const res = await api.post<ApiResponse<AssignmentSubmission>>(`/student/assignments/${assignmentId}/submit`, data);
    return res.data.data;
  },
  getProjects: async (): Promise<Project[]> => {
    const res = await api.get<ApiResponse<Project[]>>('/student/projects');
    return res.data.data;
  },
  createProject: async (data: { title: string; domain: string; description?: string; guideName?: string; teamMembers?: string; githubUrl?: string; demoUrl?: string }): Promise<Project> => {
    const res = await api.post<ApiResponse<Project>>('/student/projects', data);
    return res.data.data;
  },
  updateProject: async (projectId: string, data: { title?: string; domain?: string; description?: string; guideName?: string; teamMembers?: string; githubUrl?: string; demoUrl?: string; status?: string }): Promise<Project> => {
    const res = await api.put<ApiResponse<Project>>(`/student/projects/${projectId}`, data);
    return res.data.data;
  },

  // 5. Placements
  getPlacementDrives: async (): Promise<PlacementDrive[]> => {
    const res = await api.get<ApiResponse<PlacementDrive[]>>('/student/placements/drives');
    return res.data.data;
  },
  applyForDrive: async (driveId: string): Promise<PlacementApplication> => {
    const res = await api.post<ApiResponse<PlacementApplication>>(`/student/placements/apply/${driveId}`);
    return res.data.data;
  },
  getMyPlacementApplications: async (): Promise<PlacementApplication[]> => {
    const res = await api.get<ApiResponse<PlacementApplication[]>>('/student/placements/my-applications');
    return res.data.data;
  },

  // 6. Notices & Notifications
  getNotices: async (): Promise<Notice[]> => {
    const res = await api.get<ApiResponse<Notice[]>>('/student/notices');
    return res.data.data;
  },
  getNotifications: async (): Promise<Notification[]> => {
    const res = await api.get<ApiResponse<Notification[]>>('/student/notifications');
    return res.data.data;
  },
  markNotificationRead: async (notificationId: string): Promise<void> => {
    await api.patch<ApiResponse<void>>(`/student/notifications/${notificationId}/read`);
  },
  markAllNotificationsRead: async (): Promise<void> => {
    await api.post<ApiResponse<void>>('/student/notifications/mark-all-read');
  },

  // 7. Services & Fees
  getServiceRequests: async (): Promise<ServiceRequest[]> => {
    const res = await api.get<ApiResponse<ServiceRequest[]>>('/student/services/requests');
    return res.data.data;
  },
  createServiceRequest: async (data: { requestType: string; department: string; description: string }): Promise<ServiceRequest> => {
    const res = await api.post<ApiResponse<ServiceRequest>>('/student/services/requests', data);
    return res.data.data;
  },
  getFees: async (): Promise<FeeRecord[]> => {
    const res = await api.get<ApiResponse<FeeRecord[]>>('/student/fees');
    return res.data.data;
  },

  // 8. Coding Practice — secure code execution
  executeCode: async (request: CodeExecutionRequest): Promise<CodeExecutionResult> => {
    const res = await api.post<ApiResponse<CodeExecutionResult>>('/student/code/execute', request);
    return res.data.data;
  },
  getSupportedLanguages: async (): Promise<string[]> => {
    const res = await api.get<ApiResponse<string[]>>('/student/code/supported-languages');
    return res.data.data ?? [];
  }
};
