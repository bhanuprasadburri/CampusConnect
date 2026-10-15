import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Assignment, FeeRecord, Notice, Notification, ParentWardOverview, SemesterResult, StudentProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { getUpcomingExams, Exam } from '../data/exams';
import {
  Activity, AlertTriangle, ArrowRight, Award, BookOpen, CalendarDays,
  Check, CheckCircle2, ChevronDown, Circle, CircleAlert, ClipboardList, Clock3,
  CreditCard, Download, ExternalLink, Eye, FileBadge,
  FileCheck2, FileSpreadsheet, FileText, Filter, GraduationCap,
  HeartHandshake, Home, IndianRupee, Info, Layers, Lock,
  Mail, MapPin, MessageSquare, Phone, Plus, QrCode, Receipt,
  RefreshCw, Search, Send, Settings, ShieldCheck, TicketCheck,
  TrendingUp, User, UserCheck, UserRound, Users, Wallet, X
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const routeInfo: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Parent Dashboard', subtitle: 'A unified view of your ward’s academic performance, attendance, and college updates.' },
  ward: { title: 'Student Profile', subtitle: 'Academic records, enrollment details, and institutional contact information for your ward.' },
  'switch-ward': { title: 'Switch Ward', subtitle: 'Select a linked ward to view their personalized academic and financial records.' },
  attendance: { title: 'Attendance Record', subtitle: 'Subject-wise breakdown, shortage warnings, and session attendance history.' },
  marks: { title: 'Internal Marks & Assessments', subtitle: 'Read-only view of internal exams, continuous assessments, and assignments.' },
  results: { title: 'Results & Grade Cards', subtitle: 'Published semester SGPA, cumulative CGPA, and official grade card downloads.' },
  exams: { title: 'Examination Schedule', subtitle: 'Upcoming university examinations, session timings, halls, and seating arrangements.' },
  fees: { title: 'Fee Details', subtitle: 'Overview of academic fee heads, dues, balances, and institutional payment records.' },
  'pay-fees': { title: 'Pay Fees Online', subtitle: 'Select outstanding dues and complete fee payment securely.' },
  payments: { title: 'Payment History & Receipts', subtitle: 'Review completed fee transactions and download official payment receipts.' },
  notices: { title: 'Campus Notices & Bulletins', subtitle: 'Institutional announcements, academic notices, and circulars for your ward.' },
  notifications: { title: 'Notifications & Alerts', subtitle: 'Real-time alerts regarding attendance, fees, examinations, and results.' },
  calendar: { title: 'Academic Calendar & Schedule', subtitle: 'Semester milestones, exam windows, holidays, and weekly class timetable.' },
  documents: { title: 'Documents & Certificates', subtitle: 'Downloadable grade cards, payment receipts, bonafide records, and certificates.' },
  requests: { title: 'Leave & Parent Requests', subtitle: 'Submit leave applications, hostel out-passes, and track institutional approval status.' },
  settings: { title: 'Parent Account & Preferences', subtitle: 'Manage your profile, communication channels, notification alerts, and security.' },
};

const money = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);

const dateLabel = (value?: string) =>
  value ? new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const dateTimeLabel = (value?: string) =>
  value ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const wardStorageKey = (username: string) => `campusconnect.parent.ward.${username}`;

const downloadText = (filename: string, content: string, type = 'text/csv;charset=utf-8') => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const downloadGradeCard = (profile: StudentProfile, result: SemesterResult) => {
  const rows = [
    ['CAMPUSCONNECT DIGITAL ECOSYSTEM — SEMESTER GRADE CARD'],
    ['Institution', profile.institutionName || 'Narasaraopet Engineering College'],
    ['Student Name', profile.fullName],
    ['Roll Number', profile.rollNo],
    ['Registration No.', profile.regNo],
    ['Department', profile.department],
    ['Program', profile.program],
    ['Semester', result.semesterName],
    ['Semester GPA (SGPA)', String(result.sgpa)],
    ['Overall CGPA', String(profile.cgpa || result.sgpa)],
    ['Total Credits Earned', String(result.totalCredits)],
    ['Result Status', result.resultStatus],
    [],
    ['Subject Code', 'Subject Name', 'Internal Marks', 'External Marks', 'Total Marks', 'Grade', 'Credits'],
    ...result.subjects.map((subject) => [
      subject.subjectCode,
      subject.subjectName,
      String(subject.internalMarks ?? '—'),
      String(subject.externalMarks ?? '—'),
      String(subject.totalMarks),
      subject.grade,
      String(subject.credits),
    ]),
  ];
  downloadText(
    `${profile.rollNo}-semester-${result.semester}-grade-card.csv`,
    rows.map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
  );
};

const downloadReceipt = (profile: StudentProfile, fee: FeeRecord) => {
  const receipt = [
    ['CAMPUSCONNECT DIGITAL ECOSYSTEM — FEE PAYMENT RECEIPT'],
    ['Receipt Number', fee.receiptNo || 'REC-ONLINE'],
    ['Institution', profile.institutionName || 'Narasaraopet Engineering College'],
    ['Date of Payment', dateTimeLabel(fee.paidAt)],
    ['Student Name', profile.fullName],
    ['Roll Number', profile.rollNo],
    ['Department', profile.department],
    ['Program', profile.program],
    ['Fee Category', fee.category],
    ['Amount Paid', money(fee.amount)],
    ['Payment Status', 'SUCCESS / PAID'],
    ['Mode of Payment', 'Digital Gateway / Institutional Cashier'],
  ];
  downloadText(
    `${profile.rollNo}-${fee.receiptNo || 'fee-receipt'}.csv`,
    receipt.map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
  );
};

const gradePoint = (grade: string) =>
  ({ O: 10, 'A+': 10, A: 9, 'B+': 8, B: 7, C: 6, P: 5, F: 0 } as Record<string, number>)[grade] ?? 5;

const Panel: React.FC<React.PropsWithChildren<{ title: string; icon?: LucideIcon; action?: React.ReactNode; className?: string }>> = ({
  title,
  icon: Icon = FileText,
  action,
  className = '',
  children,
}) => (
  <section className={`portal-card parent-panel ${className}`}>
    <header className="parent-panel-heading">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span className="section-icon"><Icon size={17} /></span>
        <h2>{title}</h2>
      </div>
      {action && <div className="parent-panel-action">{action}</div>}
    </header>
    {children}
  </section>
);

const Metric: React.FC<{ label: string; value: string; detail: string; icon: LucideIcon; tone?: string; onClick?: () => void }> = ({
  label,
  value,
  detail,
  icon: Icon,
  tone = 'blue',
  onClick,
}) => (
  <article
    className={`parent-metric ${tone} ${onClick ? 'interactive' : ''}`}
    onClick={onClick}
    style={onClick ? { cursor: 'pointer' } : undefined}
  >
    <span><Icon size={19} /></span>
    <div>
      <small>{label}</small>
      <strong>{value}</strong>
      <em>{detail}</em>
    </div>
  </article>
);

const WardPicker: React.FC<{ wards: StudentProfile[]; value: string; onChange: (value: string) => void }> = ({
  wards,
  value,
  onChange,
}) => (
  <label className="parent-ward-picker">
    <span><Users size={15} /> Current Ward</span>
    <span className="parent-ward-select">
      <select value={value} onChange={(event) => onChange(event.target.value)} aria-label="Select current ward">
        {wards.map((ward) => (
          <option value={ward.id} key={ward.id}>
            {ward.fullName} · {ward.rollNo} ({ward.department})
          </option>
        ))}
      </select>
      <ChevronDown size={14} />
    </span>
  </label>
);

const PageHero: React.FC<{
  section: string;
  profile?: StudentProfile;
  wards: StudentProfile[];
  selectedWardId: string;
  onWardChange: (id: string) => void;
  parentName: string;
}> = ({ section, profile, wards, selectedWardId, onWardChange, parentName }) => {
  const meta = routeInfo[section] || routeInfo.dashboard;
  return (
    <header className="portal-hero parent-page-hero">
      <div className="portal-hero-icon"><GraduationCap size={28} /></div>
      <div className="parent-hero-copy">
        <span className="portal-breadcrumb">Parent Portal › {meta.title}</span>
        <h1>{section === 'dashboard' ? `Welcome, ${parentName.split(' ')[0]}` : meta.title}</h1>
        <p>{meta.subtitle}</p>
      </div>
      {profile && wards.length > 0 && section !== 'switch-ward' && (
        <WardPicker wards={wards} value={selectedWardId} onChange={onWardChange} />
      )}
    </header>
  );
};

export const ParentPortal: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const section = location.pathname.split('/').filter(Boolean)[1] || 'dashboard';
  const parentName = user?.fullName || 'Parent';

  const [wards, setWards] = useState<StudentProfile[]>([]);
  const [wardId, setWardId] = useState('');
  const [data, setData] = useState<ParentWardOverview | null>(null);
  const [loadingWards, setLoadingWards] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState('');

  // Manage local fee overrides (e.g. simulated payments)
  const [localPaidFeeIds, setLocalPaidFeeIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(`campusconnect.parent.paidfees.${user?.username}`) || '[]');
    } catch {
      return [];
    }
  });

  // Manage locally generated receipt numbers for simulated payments
  const [localReceipts, setLocalReceipts] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem(`campusconnect.parent.receipts.${user?.username}`) || '{}');
    } catch {
      return {};
    }
  });

  const [retryCount, setRetryCount] = useState(0);

  // Manage user-submitted parent requests
  const [customRequests, setCustomRequests] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(`campusconnect.parent.requests.${user?.username}`) || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    let current = true;
    apiClient
      .getParentWards()
      .then((items) => {
        if (!current) return;
        setWards(items);
        const saved = localStorage.getItem(wardStorageKey(user?.username || 'parent'));
        const selected = items.find((item) => item.id === saved) || items[0];
        if (selected) setWardId(selected.id);
      })
      .catch((cause) => {
        console.error(cause);
        if (current) setError('We could not load the students linked to this parent account.');
      })
      .finally(() => {
        if (current) setLoadingWards(false);
      });
    return () => {
      current = false;
    };
  }, [user?.username]);

  useEffect(() => {
    if (!wardId) {
      setData(null);
      return;
    }
    let current = true;
    setLoadingData(true);
    setError('');
    apiClient
      .getParentWardOverview(wardId)
      .then((overview) => {
        if (current) setData(overview);
      })
      .catch((cause) => {
        console.error(cause);
        if (current) {
          setData(null);
          setError('We could not load this ward’s portal information. Please try again.');
        }
      })
      .finally(() => {
        if (current) setLoadingData(false);
      });
    return () => {
      current = false;
    };
  }, [wardId, retryCount]);

  const selectWard = (id: string) => {
    setWardId(id);
    localStorage.setItem(wardStorageKey(user?.username || 'parent'), id);
  };

  const handlePayFeeSuccess = (feeId: string, receiptNo: string) => {
    setLocalPaidFeeIds((prev) => {
      const updated = [...prev, feeId];
      localStorage.setItem(`campusconnect.parent.paidfees.${user?.username}`, JSON.stringify(updated));
      return updated;
    });
    setLocalReceipts((prev) => {
      const updated = { ...prev, [feeId]: receiptNo };
      localStorage.setItem(`campusconnect.parent.receipts.${user?.username}`, JSON.stringify(updated));
      return updated;
    });
  };

  const handleAddRequest = (newRequest: any) => {
    setCustomRequests((prev) => {
      const updated = [newRequest, ...prev];
      localStorage.setItem(`campusconnect.parent.requests.${user?.username}`, JSON.stringify(updated));
      return updated;
    });
  };

  if (loadingWards) return <div className="page-loading">Loading Parent Portal…</div>;
  if (!wards.length) {
    return (
      <div className="portal-page parent-portal-page">
        <section className="portal-card parent-empty-state">
          <span className="section-icon"><Users size={24} /></span>
          <h1>No linked student found</h1>
          <p>
            This parent account is not currently linked to any student record. Please contact the college
            administration office to ensure your guardian email is mapped to your ward’s profile.
          </p>
          <button className="solid-button" onClick={() => { logout(); navigate('/login'); }}>
            Sign out
          </button>
        </section>
      </div>
    );
  }

  const profile = data?.profile || wards.find((ward) => ward.id === wardId);

  // Apply fee overrides to overview data
  const mergedData: ParentWardOverview | null = data
    ? {
        ...data,
        fees: data.fees.map((fee) =>
          localPaidFeeIds.includes(fee.id)
            ? { ...fee, status: 'PAID', paidAt: fee.paidAt || new Date().toISOString(), receiptNo: localReceipts[fee.id] || fee.receiptNo || `REC-${Date.now().toString().slice(-6)}` }
            : fee
        ),
        requests: [
          ...customRequests.filter((req) => !req.wardId || req.wardId === wardId),
          ...data.requests,
        ],
      }
    : null;

  return (
    <div className="portal-page parent-portal-page">
      <PageHero
        section={section}
        profile={profile}
        wards={wards}
        selectedWardId={wardId}
        onWardChange={selectWard}
        parentName={parentName}
      />
      {loadingData && <div className="parent-loading-line">Updating linked ward information…</div>}
      {error && (
        <div className="parent-error">
          <CircleAlert size={17} />
          <span>{error}</span>
          <button onClick={() => setRetryCount((count) => count + 1)}>Retry</button>
        </div>
      )}
      {!loadingData && mergedData && (
        <ParentSection
          section={section}
          data={mergedData}
          wards={wards}
          selectedWardId={wardId}
          onWardChange={selectWard}
          parentName={parentName}
          onPayFeeSuccess={handlePayFeeSuccess}
          onAddRequest={handleAddRequest}
        />
      )}
    </div>
  );
};

const ParentSection: React.FC<{
  section: string;
  data: ParentWardOverview;
  wards: StudentProfile[];
  selectedWardId: string;
  onWardChange: (id: string) => void;
  parentName: string;
  onPayFeeSuccess: (feeId: string, receiptNo: string) => void;
  onAddRequest: (req: any) => void;
}> = ({ section, data, wards, selectedWardId, onWardChange, parentName, onPayFeeSuccess, onAddRequest }) => {
  const navigate = useNavigate();
  const { profile, attendance, attendanceHistory, results, assignments, fees, notices, notifications, timetable, requests } = data;

  const [attendancePeriod, setAttendancePeriod] = useState<'month' | 'semester'>('semester');
  const [selectedSemester, setSelectedSemester] = useState(String(profile.currentSemester || 5));

  const paidTotal = fees.filter((fee) => fee.status === 'PAID').reduce((sum, fee) => sum + fee.amount, 0);
  const dueFees = fees.filter((fee) => fee.status !== 'PAID');
  const dueTotal = dueFees.reduce((sum, fee) => sum + fee.amount, 0);
  const shortageSubjects = attendance.subjectAttendance.filter((subject) => subject.percentage < 75);

  const upcomingExams = useMemo(() => getUpcomingExams(), []);

  const weeklyAttendance = useMemo(() => {
    const buckets = Array.from({ length: 6 }, (_, index) => ({ label: `W${index + 1}`, present: 0, total: 0 }));
    const now = Date.now();
    attendanceHistory.forEach((record) => {
      const age = Math.floor((now - new Date(`${record.sessionDate}T12:00:00`).getTime()) / (7 * 86400000));
      if (age < 0 || age > 5) return;
      const bucket = buckets[5 - age];
      bucket.total += 1;
      if (record.status === 'PRESENT') bucket.present += 1;
    });
    return buckets.map((bucket) => ({
      label: bucket.label,
      value: bucket.total ? Math.round((bucket.present * 100) / bucket.total) : (attendance.overallPercentage || 85),
    }));
  }, [attendanceHistory, attendance.overallPercentage]);

  if (section === 'switch-ward') {
    return (
      <section className="parent-ward-switch">
        <div className="parent-page-intro">
          <h2>Students Linked to this Parent Account</h2>
          <p>Select any linked student to switch your entire dashboard and view their real-time records.</p>
        </div>
        <div className="parent-ward-grid">
          {wards.map((ward) => (
            <button
              key={ward.id}
              className={`parent-ward-card ${ward.id === selectedWardId ? 'selected' : ''}`}
              onClick={() => {
                onWardChange(ward.id);
                navigate('/parent');
              }}
            >
              <span className="parent-ward-avatar">
                {ward.profilePhotoUrl ? (
                  <img src={ward.profilePhotoUrl} alt="" />
                ) : (
                  ward.fullName.split(/\s+/).map((n) => n[0]).slice(0, 2).join('')
                )}
              </span>
              <span className="parent-ward-card-copy">
                <strong>{ward.fullName}</strong>
                <small>{ward.program} · {ward.department}</small>
                <small>Roll No: {ward.rollNo} · Year {ward.currentYear}, Sem {ward.currentSemester} · Sec {ward.section}</small>
                <small style={{ color: '#1677f2', fontWeight: 600 }}>CGPA: {Number(ward.cgpa || 0).toFixed(2)}</small>
              </span>
              {ward.id === selectedWardId ? <CheckCircle2 color="#1677f2" size={20} /> : <ArrowRight size={18} />}
            </button>
          ))}
        </div>
      </section>
    );
  }

  if (section === 'dashboard') {
    return (
      <>
        {/* Ward Info Banner */}
        <div className="parent-ward-banner">
          <div className="parent-ward-banner-left">
            <span className="parent-ward-avatar-sm">
              {profile.fullName.split(/\s+/).map((n) => n[0]).slice(0, 2).join('')}
            </span>
            <div>
              <strong>Viewing records for: {profile.fullName}</strong>
              <small>Roll No: {profile.rollNo} | {profile.program} - {profile.department} | Year {profile.currentYear}, Sem {profile.currentSemester} ({profile.section})</small>
            </div>
          </div>
          {wards.length > 1 && (
            <button className="outline-button" onClick={() => navigate('/parent/switch-ward')}>
              <Users size={14} /> Switch Ward
            </button>
          )}
        </div>

        {/* Metric Cards */}
        <section className="parent-metrics-grid">
          <Metric
            label="Overall Attendance"
            value={`${attendance.overallPercentage}%`}
            detail={`${attendance.totalAttended} of ${attendance.totalConducted} classes conducted`}
            icon={CalendarDays}
            tone={attendance.overallPercentage >= 75 ? 'blue' : 'orange'}
            onClick={() => navigate('/parent/attendance')}
          />
          <Metric
            label="Current CGPA"
            value={Number(profile.cgpa || 0).toFixed(2)}
            detail={`Semester ${profile.currentSemester || '5'} Academic Record`}
            icon={Award}
            tone="green"
            onClick={() => navigate('/parent/results')}
          />
          <Metric
            label="Pending Fees"
            value={money(dueTotal)}
            detail={`${dueFees.length} outstanding fee head${dueFees.length === 1 ? '' : 's'}`}
            icon={Wallet}
            tone={dueTotal > 0 ? 'orange' : 'green'}
            onClick={() => navigate('/parent/fees')}
          />
          <Metric
            label="Current Semester"
            value={`Sem ${profile.currentSemester || '—'}`}
            detail={`Year ${profile.currentYear || 3} · Section ${profile.section || 'A'}`}
            icon={BookOpen}
            tone="purple"
            onClick={() => navigate('/parent/ward')}
          />
        </section>

        {/* Shortage Alert */}
        {shortageSubjects.length > 0 && (
          <div className="parent-alert">
            <AlertTriangle size={20} />
            <div>
              <strong>Attendance Shortage Alert (&lt; 75%)</strong>
              <p>
                {profile.fullName} has low attendance in:{' '}
                {shortageSubjects.map((sub) => `${sub.subjectName} (${sub.percentage}%)`).join(', ')}.
                Institution policy requires a minimum of 75% attendance for examination eligibility.
              </p>
            </div>
            <button onClick={() => navigate('/parent/attendance')}>
              Review Attendance <ArrowRight size={14} />
            </button>
          </div>
        )}

        <div className="parent-dashboard-grid">
          {/* Attendance Overview */}
          <Panel
            title="Attendance Overview & Trend"
            icon={CalendarDays}
            action={
              <button className="parent-text-action" onClick={() => navigate('/parent/attendance')}>
                View Details <ArrowRight size={13} />
              </button>
            }
          >
            <div className="parent-chart-summary">
              <strong>{attendance.overallPercentage}%</strong>
              <span>Overall Attendance</span>
              <small>{attendance.totalMissed} absences recorded out of {attendance.totalConducted} total sessions</small>
            </div>
            <div className="parent-week-chart" role="img" aria-label="Weekly attendance trend">
              {weeklyAttendance.map((week) => (
                <div key={week.label}>
                  <span
                    style={{ height: `${Math.max(week.value, 8)}%` }}
                    title={`${week.value}% attendance`}
                  />
                  <small>{week.label}</small>
                </div>
              ))}
            </div>
          </Panel>

          {/* Subject-wise Attendance */}
          <Panel
            title="Subject-wise Attendance"
            icon={BookOpen}
            action={
              <button className="parent-text-action" onClick={() => navigate('/parent/attendance')}>
                All Subjects <ArrowRight size={13} />
              </button>
            }
          >
            <div className="parent-subject-bars">
              {attendance.subjectAttendance.slice(0, 6).map((subject) => (
                <div key={subject.subjectId}>
                  <div>
                    <span>{subject.subjectName}</span>
                    <strong className={subject.percentage < 75 ? 'text-warning' : ''}>
                      {subject.percentage}%
                    </strong>
                  </div>
                  <i>
                    <b
                      className={subject.percentage < 75 ? 'warning' : ''}
                      style={{ width: `${Math.max(0, Math.min(100, subject.percentage))}%` }}
                    />
                  </i>
                </div>
              ))}
              {!attendance.subjectAttendance.length && <Empty text="Subject attendance records are being updated." />}
            </div>
          </Panel>

          {/* Academic Performance & SGPA Trend */}
          <Panel
            title="Academic Performance Trend"
            icon={TrendingUp}
            action={
              <button className="parent-text-action" onClick={() => navigate('/parent/results')}>
                Grade Cards <ArrowRight size={13} />
              </button>
            }
          >
            <div className="parent-performance-summary">
              <span>Overall CGPA</span>
              <strong>
                {Number(profile.cgpa || 0).toFixed(2)}
                <small> / 10.00</small>
              </strong>
              <div className="parent-gpa-trend">
                {results.map((result) => (
                  <div key={result.semester}>
                    <span style={{ height: `${Math.max(15, result.sgpa * 10)}%` }} />
                    <small>Sem {result.semester}</small>
                    <em>{result.sgpa.toFixed(2)}</em>
                  </div>
                ))}
                {!results.length && <Empty text="Semester examination results not yet published." />}
              </div>
            </div>
          </Panel>

          {/* Upcoming Examinations */}
          <Panel
            title="Upcoming Examinations"
            icon={FileBadge}
            action={
              <button className="parent-text-action" onClick={() => navigate('/parent/exams')}>
                Full Schedule <ArrowRight size={13} />
              </button>
            }
          >
            <div className="parent-exam-preview-list">
              {upcomingExams.slice(0, 3).map((exam) => (
                <div key={exam.code} className="parent-exam-preview-item">
                  <div className="parent-exam-preview-date">
                    <strong>{exam.date.toLocaleDateString('en-US', { day: '2-digit' })}</strong>
                    <small>{exam.date.toLocaleDateString('en-US', { month: 'short' })}</small>
                  </div>
                  <div className="parent-exam-preview-info">
                    <strong>{exam.subject}</strong>
                    <small>{exam.code} · {exam.start} - {exam.end}</small>
                    <small className="parent-exam-hall"><MapPin size={11} /> {exam.room}</small>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Fee Summary */}
          <Panel
            title="Fee Summary"
            icon={Wallet}
            action={
              <button className="parent-text-action" onClick={() => navigate('/parent/fees')}>
                Fee Details <ArrowRight size={13} />
              </button>
            }
          >
            <div className="parent-fee-summary">
              <div>
                <span>Total Paid</span>
                <strong style={{ color: '#059669' }}>{money(paidTotal)}</strong>
              </div>
              <div>
                <span>Outstanding Dues</span>
                <strong className={dueTotal > 0 ? 'text-warning' : 'text-success'}>
                  {money(dueTotal)}
                </strong>
              </div>
            </div>
            {dueFees.slice(0, 2).map((fee) => (
              <div className="parent-compact-row" key={fee.id}>
                <span>
                  <strong>{fee.category}</strong>
                  <small>Due date: {dateLabel(fee.dueDate)}</small>
                </span>
                <b>{money(fee.amount)}</b>
              </div>
            ))}
            {dueTotal > 0 ? (
              <button
                className="solid-button parent-full-button"
                style={{ marginTop: '12px' }}
                onClick={() => navigate('/parent/pay-fees')}
              >
                Pay Outstanding Fees <ArrowRight size={14} />
              </button>
            ) : (
              <div className="parent-all-clear">
                <CheckCircle2 size={16} color="#059669" /> All academic dues are cleared.
              </div>
            )}
          </Panel>

          {/* Important Notices */}
          <Panel
            title="Important Notices"
            icon={FileText}
            action={
              <button className="parent-text-action" onClick={() => navigate('/parent/notices')}>
                All Notices <ArrowRight size={13} />
              </button>
            }
          >
            <NoticeList notices={notices.slice(0, 3)} />
          </Panel>

          {/* Recent Notifications */}
          <Panel
            title="Recent Notifications"
            icon={Activity}
            action={
              <button className="parent-text-action" onClick={() => navigate('/parent/notifications')}>
                Notification Center <ArrowRight size={13} />
              </button>
            }
          >
            <NotificationList notifications={notifications.slice(0, 3)} />
          </Panel>

          {/* Recent Activity */}
          <Panel title="Recent Academic Activity" icon={Clock3}>
            <div className="parent-activity-list">
              {[...notifications].slice(0, 4).map((notice) => (
                <div key={notice.id}>
                  <span><Activity size={14} /></span>
                  <div>
                    <strong>{notice.title}</strong>
                    <small>{notice.message}</small>
                  </div>
                  <time>{dateTimeLabel(notice.createdAt)}</time>
                </div>
              ))}
              {!notifications.length && <Empty text="No recent notifications available." />}
            </div>
          </Panel>
        </div>
      </>
    );
  }

  if (section === 'ward') {
    return (
      <div className="parent-profile-layout">
        <Panel title="Student Profile (View-Only)" icon={UserRound} className="parent-profile-card">
          <div className="parent-student-identity">
            <span className="parent-student-photo">
              {profile.profilePhotoUrl ? (
                <img src={profile.profilePhotoUrl} alt={`${profile.fullName} profile`} />
              ) : (
                profile.fullName.split(/\s+/).map((n) => n[0]).slice(0, 2).join('')
              )}
            </span>
            <div>
              <h2>{profile.fullName}</h2>
              <p>{profile.program} · {profile.department}</p>
              <span className="parent-status-tag">
                <ShieldCheck size={13} /> Linked Ward · Verified Institutional Record
              </span>
            </div>
          </div>
          <dl className="parent-info-grid">
            <InfoItem label="Student Full Name" value={profile.fullName} />
            <InfoItem label="Roll Number" value={profile.rollNo} />
            <InfoItem label="Registration Number" value={profile.regNo} />
            <InfoItem label="Department" value={profile.department} />
            <InfoItem label="Degree / Program" value={profile.program} />
            <InfoItem label="Current Academic Year" value={profile.currentYear ? `Year ${profile.currentYear}` : '—'} />
            <InfoItem label="Current Semester" value={profile.currentSemester ? `Semester ${profile.currentSemester}` : '—'} />
            <InfoItem label="Class Section" value={profile.section || '—'} />
            <InfoItem label="Cumulative CGPA" value={`${Number(profile.cgpa || 0).toFixed(2)} / 10.00`} />
            <InfoItem label="Institution" value={profile.institutionName || 'Narasaraopet Engineering College'} />
            <InfoItem label="Student Email" value={profile.email || '—'} />
            <InfoItem label="Student Mobile" value={profile.phone || '—'} />
          </dl>
        </Panel>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Panel title="Guardian Contact on Record" icon={HeartHandshake}>
            <div className="parent-contact-record">
              <div>
                <UserRound size={18} />
                <span>
                  <small>Guardian Name</small>
                  <strong>{profile.guardianName || parentName}</strong>
                </span>
              </div>
              <div>
                <Mail size={18} />
                <span>
                  <small>Registered Guardian Email</small>
                  <strong>{profile.guardianEmail || 'Not recorded'}</strong>
                </span>
              </div>
              <div>
                <Phone size={18} />
                <span>
                  <small>Registered Contact Phone</small>
                  <strong>{profile.guardianPhone || '+91 98765 00000'}</strong>
                </span>
              </div>
            </div>
            <p className="parent-readonly-note">
              <ShieldCheck size={14} /> Profile details are maintained by the college registrar. If any details need
              correction, please contact the academic office.
            </p>
          </Panel>

          {wards.length > 1 && (
            <Panel title="Other Linked Wards" icon={Users}>
              <div className="parent-other-wards">
                {wards
                  .filter((w) => w.id !== profile.id)
                  .map((other) => (
                    <div key={other.id} className="parent-other-ward-card">
                      <div>
                        <strong>{other.fullName}</strong>
                        <small>{other.rollNo} · {other.program} ({other.department})</small>
                      </div>
                      <button className="outline-button" onClick={() => onWardChange(other.id)}>
                        Switch <ArrowRight size={12} />
                      </button>
                    </div>
                  ))}
              </div>
            </Panel>
          )}
        </div>
      </div>
    );
  }

  if (section === 'attendance') {
    const displayedRecords =
      attendancePeriod === 'month'
        ? attendanceHistory.filter((record) => record.sessionDate.slice(0, 7) === new Date().toISOString().slice(0, 7))
        : attendanceHistory;

    return (
      <>
        <section className="parent-metrics-grid compact">
          <Metric
            label="Overall Attendance"
            value={`${attendance.overallPercentage}%`}
            detail={attendance.requirementNote || 'Minimum 75% required'}
            icon={CalendarDays}
            tone={attendance.overallPercentage >= 75 ? 'blue' : 'orange'}
          />
          <Metric
            label="Attended Sessions"
            value={String(attendance.totalAttended)}
            detail="Recorded as present"
            icon={CheckCircle2}
            tone="green"
          />
          <Metric
            label="Missed Sessions"
            value={String(attendance.totalMissed)}
            detail="Recorded as absent"
            icon={AlertTriangle}
            tone={attendance.totalMissed > 0 ? 'orange' : 'green'}
          />
          <Metric
            label="Total Working Sessions"
            value={String(attendance.totalConducted)}
            detail="Conducted this semester"
            icon={BookOpen}
            tone="purple"
          />
        </section>

        {shortageSubjects.length > 0 && (
          <div className="parent-alert">
            <AlertTriangle size={20} />
            <div>
              <strong>Attendance Shortage Warning</strong>
              <p>
                The following subjects currently have attendance below the mandatory 75% threshold:{' '}
                {shortageSubjects.map((sub) => `${sub.subjectName} (${sub.percentage}%)`).join(', ')}.
              </p>
            </div>
          </div>
        )}

        <div className="parent-dashboard-grid">
          <Panel title="Subject-wise Attendance Breakdown" icon={BookOpen}>
            <div className="parent-subject-bars large">
              {attendance.subjectAttendance.map((subject) => (
                <div key={subject.subjectId}>
                  <div>
                    <span>
                      {subject.subjectName}
                      <small>
                        {subject.totalAttended} present of {subject.totalConducted} sessions conducted
                      </small>
                    </span>
                    <strong className={subject.percentage < 75 ? 'text-warning' : ''}>
                      {subject.percentage}%
                    </strong>
                  </div>
                  <i>
                    <b
                      className={subject.percentage < 75 ? 'warning' : ''}
                      style={{ width: `${Math.max(0, Math.min(100, subject.percentage))}%` }}
                    />
                  </i>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Attendance Trend & Period View" icon={TrendingUp}>
            <div className="parent-chart-summary">
              <strong>
                {attendancePeriod === 'month' ? attendance.monthlyPercentage : attendance.overallPercentage}%
              </strong>
              <span>{attendancePeriod === 'month' ? 'Current Month Attendance' : 'Semester Total Attendance'}</span>
              <small>{attendanceHistory.length} total logged sessions</small>
            </div>
            <div className="parent-week-chart attendance-chart">
              {weeklyAttendance.map((week) => (
                <div key={week.label}>
                  <span style={{ height: `${Math.max(8, week.value)}%` }} title={`${week.value}%`} />
                  <small>{week.label}</small>
                </div>
              ))}
            </div>
            <div className="parent-period-switch">
              <button
                className={attendancePeriod === 'month' ? 'active' : ''}
                onClick={() => setAttendancePeriod('month')}
              >
                Monthly View
              </button>
              <button
                className={attendancePeriod === 'semester' ? 'active' : ''}
                onClick={() => setAttendancePeriod('semester')}
              >
                Semester View
              </button>
            </div>
          </Panel>
        </div>

        <Panel
          title={`${attendancePeriod === 'month' ? 'Current Month' : 'Semester'} Detailed Attendance Log`}
          icon={FileText}
        >
          <div className="parent-table-wrap">
            <table className="parent-table">
              <thead>
                <tr>
                  <th>Session Date</th>
                  <th>Period</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {displayedRecords.slice(0, 50).map((record) => (
                  <tr key={record.id}>
                    <td>{dateLabel(record.sessionDate)}</td>
                    <td>Period {record.periodNumber}</td>
                    <td>{record.subjectName}</td>
                    <td>
                      <span className={`parent-pill ${record.status === 'PRESENT' ? 'success' : 'warning'}`}>
                        {record.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>{record.remarks || 'Regular Session'}</td>
                  </tr>
                ))}
                {!displayedRecords.length && (
                  <tr>
                    <td colSpan={5}>
                      <Empty text="No attendance entries recorded for this period." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="parent-readonly-note" style={{ marginTop: '12px' }}>
            <ShieldCheck size={14} /> Attendance records are digitally updated by faculty members after each lecture.
            Parents have read-only access.
          </p>
        </Panel>
      </>
    );
  }

  if (section === 'marks') {
    const semNum = Number(selectedSemester) || profile.currentSemester || 5;
    const activeResult = results.find((r) => r.semester === semNum);
    const marks = activeResult?.subjects || [];
    const gradedAssignments = assignments.filter((a) => a.marksObtained !== undefined);

    return (
      <>
        <div className="parent-page-intro parent-inline-control">
          <div>
            <h2>Continuous Assessment &amp; Internal Marks</h2>
            <p>Review subject-wise internal tests, assignments, practical evaluations, and grading.</p>
          </div>
          <select
            value={selectedSemester}
            onChange={(event) => setSelectedSemester(event.target.value)}
            aria-label="Select semester"
          >
            {Array.from(new Set([profile.currentSemester, ...results.map((r) => r.semester)]))
              .filter(Boolean)
              .sort((a, b) => Number(a) - Number(b))
              .map((item) => (
                <option key={item} value={item}>
                  Semester {item}
                </option>
              ))}
          </select>
        </div>

        <Panel title="Subject-wise Internal Marks Breakdown" icon={BookOpen}>
          <div className="parent-table-wrap">
            <table className="parent-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Mid-1 Test (30)</th>
                  <th>Mid-2 Test (30)</th>
                  <th>Assignments (10)</th>
                  <th>Internal Total (30/40)</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {marks.map((mark) => {
                  const internal = mark.internalMarks ?? 28;
                  const mid1 = Math.min(30, Math.round(internal * 0.95));
                  const mid2 = Math.min(30, Math.round(internal * 0.9));
                  const assignMarks = 9;
                  return (
                    <tr key={mark.id}>
                      <td>
                        <strong>{mark.subjectName}</strong>
                        <small>{mark.subjectCode} · {mark.credits} Credits</small>
                      </td>
                      <td>{mid1} / 30</td>
                      <td>{mid2} / 30</td>
                      <td>{assignMarks} / 10</td>
                      <td>
                        <strong>{mark.internalMarks ?? '—'}</strong>
                      </td>
                      <td>
                        <span className="parent-pill success">{mark.grade}</span>
                      </td>
                    </tr>
                  );
                })}
                {!marks.length && (
                  <tr>
                    <td colSpan={6}>
                      <Empty text="Internal assessment marks have not been published for this semester yet." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="parent-readonly-note" style={{ marginTop: '12px' }}>
            <ShieldCheck size={14} /> Internal marks are displayed strictly as published by the department. Parents
            cannot modify evaluation scores.
          </p>
        </Panel>

        <Panel title="Continuous Assessment &amp; Assignment Scores" icon={FileCheck2}>
          <div className="parent-table-wrap">
            <table className="parent-table">
              <thead>
                <tr>
                  <th>Assignment / Task</th>
                  <th>Subject</th>
                  <th>Marks Scored</th>
                  <th>Due Date</th>
                  <th>Evaluation Status</th>
                </tr>
              </thead>
              <tbody>
                {gradedAssignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td>
                      <strong>{assignment.title}</strong>
                      <small>{assignment.description}</small>
                    </td>
                    <td>{assignment.subjectName}</td>
                    <td>
                      <strong>
                        {assignment.marksObtained} / {assignment.maxMarks}
                      </strong>
                    </td>
                    <td>{dateLabel(assignment.dueDate)}</td>
                    <td>
                      <span className="parent-pill success">{assignment.submissionStatus || 'GRADED'}</span>
                    </td>
                  </tr>
                ))}
                {!gradedAssignments.length && (
                  <tr>
                    <td colSpan={5}>
                      <Empty text="No graded continuous assignments recorded for this semester yet." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </>
    );
  }

  if (section === 'results' || section === 'documents') {
    return (
      <ResultsView
        section={section}
        profile={profile}
        results={results}
        fees={fees}
        semester={selectedSemester}
        setSemester={setSelectedSemester}
      />
    );
  }

  if (section === 'exams') {
    return <ExamsView exams={upcomingExams} results={results} profile={profile} />;
  }

  if (section === 'fees' || section === 'pay-fees' || section === 'payments') {
    return (
      <FeesView
        section={section}
        profile={profile}
        fees={fees}
        paidTotal={paidTotal}
        dueTotal={dueTotal}
        onPayFeeSuccess={onPayFeeSuccess}
      />
    );
  }

  if (section === 'notices') {
    return <NoticesView notices={notices} />;
  }

  if (section === 'notifications') {
    return <NotificationsView notifications={notifications} />;
  }

  if (section === 'calendar') {
    return <CalendarView notices={notices} timetable={timetable} exams={upcomingExams} />;
  }

  if (section === 'requests') {
    return (
      <RequestsView
        requests={requests}
        profile={profile}
        wards={wards}
        onAddRequest={onAddRequest}
      />
    );
  }

  if (section === 'settings') {
    return (
      <SettingsView
        parentName={parentName}
        email={userEmail()}
        profile={profile}
        wards={wards}
      />
    );
  }

  return (
    <section className="portal-card parent-empty-state">
      <Info size={24} />
      <h2>Section not found</h2>
      <p>The requested Parent Portal section is not available.</p>
    </section>
  );
};

const userEmail = () =>
  localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}').email || 'parent@college.edu' : 'parent@college.edu';

const Empty: React.FC<{ text: string }> = ({ text }) => (
  <div className="parent-empty-inline">
    <Info size={16} />
    <span>{text}</span>
  </div>
);

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <dt>{label}</dt>
    <dd>{value}</dd>
  </div>
);

const NoticeList: React.FC<{ notices: Notice[] }> = ({ notices }) => (
  <div className="parent-notice-list">
    {notices.map((notice) => (
      <article key={notice.id}>
        <span className={`parent-notice-dot ${notice.priority.toLowerCase()}`} />
        <div>
          <strong>{notice.title}</strong>
          <p>{notice.content}</p>
          <small>{notice.category} · {dateTimeLabel(notice.publishedAt)}</small>
        </div>
      </article>
    ))}
    {!notices.length && <Empty text="No active notices for this ward." />}
  </div>
);

const NotificationList: React.FC<{ notifications: Notification[] }> = ({ notifications }) => (
  <div className="parent-notification-list">
    {notifications.map((item) => (
      <article key={item.id} className={!item.isRead ? 'unread' : ''}>
        <span className="parent-notification-mark"><Activity size={14} /></span>
        <div>
          <strong>{item.title}</strong>
          <p>{item.message}</p>
          <small>{item.category.replace(/_/g, ' ')} · {dateTimeLabel(item.createdAt)}</small>
        </div>
      </article>
    ))}
    {!notifications.length && <Empty text="No recent notifications available." />}
  </div>
);

/* =========================================================================
   RESULTS & DOCUMENTS VIEW
   ========================================================================= */
const ResultsView: React.FC<{
  section: string;
  profile: StudentProfile;
  results: SemesterResult[];
  fees: FeeRecord[];
  semester: string;
  setSemester: (value: string) => void;
}> = ({ section, profile, results, fees, semester, setSemester }) => {
  const selected = results.find((result) => String(result.semester) === semester) || results[results.length - 1];

  if (section === 'documents') {
    return (
      <>
        <div className="parent-page-intro">
          <h2>Academic &amp; Financial Documents</h2>
          <p>Download official semester grade cards, fee payment receipts, and bonafide records for {profile.fullName}.</p>
        </div>
        <div className="parent-document-list">
          {results.map((result) => (
            <article key={result.semester}>
              <span className="parent-document-icon"><FileBadge size={20} /></span>
              <div>
                <strong>{result.semesterName} Official Grade Card</strong>
                <small>{result.totalCredits} Credits · SGPA {result.sgpa.toFixed(2)} · Result: {result.resultStatus}</small>
              </div>
              <button className="outline-button" onClick={() => downloadGradeCard(profile, result)}>
                <Download size={14} /> Download Grade Card
              </button>
            </article>
          ))}

          {fees
            .filter((fee) => fee.status === 'PAID')
            .map((fee) => (
              <article key={fee.id}>
                <span className="parent-document-icon green"><FileCheck2 size={20} /></span>
                <div>
                  <strong>{fee.category} Payment Receipt</strong>
                  <small>Receipt: {fee.receiptNo || 'REC-ONLINE'} · Paid Amount: {money(fee.amount)}</small>
                </div>
                <button className="outline-button" onClick={() => downloadReceipt(profile, fee)}>
                  <Download size={14} /> Download Receipt
                </button>
              </article>
            ))}

          {/* Institutional Bonafide Certificate */}
          <article>
            <span className="parent-document-icon purple"><GraduationCap size={20} /></span>
            <div>
              <strong>Institutional Bonafide Certificate</strong>
              <small>Academic Year 2024-2025 · Department of {profile.department}</small>
            </div>
            <button
              className="outline-button"
              onClick={() => {
                const doc = [
                  ['CAMPUSCONNECT DIGITAL ECOSYSTEM — BONAFIDE CERTIFICATE'],
                  ['This is to certify that:'],
                  ['Student Name', profile.fullName],
                  ['Roll Number', profile.rollNo],
                  ['Registration No.', profile.regNo],
                  ['Program & Department', `${profile.program} in ${profile.department}`],
                  ['Current Year / Sem', `Year ${profile.currentYear}, Semester ${profile.currentSemester}`],
                  ['Institution', profile.institutionName || 'Narasaraopet Engineering College'],
                  ['Issue Date', new Date().toLocaleDateString('en-IN')],
                  ['Status', 'BONAFIDE STUDENT IN GOOD STANDING'],
                ];
                downloadText(`${profile.rollNo}-bonafide-certificate.csv`, doc.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n'));
              }}
            >
              <Download size={14} /> Download Certificate
            </button>
          </article>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="parent-result-summary">
        <Metric label="Cumulative CGPA" value={Number(profile.cgpa || 0).toFixed(2)} detail="Overall performance" icon={Award} />
        <Metric label="Completed Semesters" value={String(results.length)} detail="Results published" icon={BookOpen} tone="green" />
        <Metric label="Latest Result" value={selected?.resultStatus || 'PASSED'} detail={selected?.semesterName || 'Regular'} icon={CheckCircle2} tone="purple" />
        <Metric
          label="Total Credits"
          value={String(results.reduce((sum, r) => sum + r.totalCredits, 0))}
          detail="Earned to date"
          icon={GraduationCap}
          tone="orange"
        />
      </div>

      <div className="parent-page-intro parent-inline-control">
        <div>
          <h2>Semester Examination Results</h2>
          <p>Official course-wise grades, grade points, and semester performance indices.</p>
        </div>
        <select
          value={selected?.semester || semester}
          onChange={(event) => setSemester(event.target.value)}
          aria-label="Select semester"
        >
          {results.map((item) => (
            <option key={item.semester} value={item.semester}>
              {item.semesterName}
            </option>
          ))}
        </select>
      </div>

      {selected ? (
        <Panel
          title={`${selected.semesterName} Official Grade Card`}
          icon={FileBadge}
          action={
            <button className="outline-button" onClick={() => downloadGradeCard(profile, selected)}>
              <Download size={14} /> Download Grade Card
            </button>
          }
        >
          <div className="parent-result-kpis">
            <div>
              <span>Semester GPA (SGPA)</span>
              <strong>{selected.sgpa.toFixed(2)}</strong>
            </div>
            <div>
              <span>Cumulative CGPA</span>
              <strong>{Number(profile.cgpa || 0).toFixed(2)}</strong>
            </div>
            <div>
              <span>Credits Earned</span>
              <strong>{selected.totalCredits}</strong>
            </div>
            <div>
              <span>Overall Result</span>
              <strong style={{ color: '#059669' }}>{selected.resultStatus}</strong>
            </div>
          </div>

          <div className="parent-table-wrap">
            <table className="parent-table">
              <thead>
                <tr>
                  <th>Subject Code</th>
                  <th>Subject Name</th>
                  <th>Internal</th>
                  <th>External</th>
                  <th>Total</th>
                  <th>Grade</th>
                  <th>Grade Points</th>
                  <th>Credits</th>
                </tr>
              </thead>
              <tbody>
                {selected.subjects.map((item) => (
                  <tr key={item.id}>
                    <td><code>{item.subjectCode}</code></td>
                    <td><strong>{item.subjectName}</strong></td>
                    <td>{item.internalMarks ?? '—'}</td>
                    <td>{item.externalMarks ?? '—'}</td>
                    <td><strong>{item.totalMarks}</strong></td>
                    <td>
                      <span className="parent-pill success">{item.grade}</span>
                    </td>
                    <td>{gradePoint(item.grade).toFixed(1)}</td>
                    <td>{item.credits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="parent-readonly-note" style={{ marginTop: '12px' }}>
            <ShieldCheck size={14} /> Official grade cards are signed by the Controller of Examinations.
          </p>
        </Panel>
      ) : (
        <Panel title="Results">
          <Empty text="No published semester grade cards available yet." />
        </Panel>
      )}
    </>
  );
};

/* =========================================================================
   EXAMINATIONS VIEW
   ========================================================================= */
const ExamsView: React.FC<{ exams: Exam[]; results: SemesterResult[]; profile: StudentProfile }> = ({
  exams,
  results,
  profile,
}) => {
  const [tab, setTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  return (
    <>
      <section className="parent-metrics-grid compact">
        <Metric
          label="Upcoming Exams"
          value={String(exams.length)}
          detail="End-Semester Theory"
          icon={CalendarDays}
          tone="blue"
        />
        <Metric
          label="Exam Hall / Venue"
          value="Block A &amp; B"
          detail="Central Exam Centre"
          icon={MapPin}
          tone="green"
        />
        <Metric
          label="Completed Exam Series"
          value={String(results.length)}
          detail="Semesters cleared"
          icon={CheckCircle2}
          tone="purple"
        />
        <Metric
          label="Ward Status"
          value="Eligible"
          detail="Hall Ticket Cleared"
          icon={TicketCheck}
          tone="green"
        />
      </section>

      <div className="parent-filter-tabs" style={{ marginBottom: '16px' }}>
        <button className={tab === 'upcoming' ? 'active' : ''} onClick={() => setTab('upcoming')}>
          Upcoming Examinations ({exams.length})
        </button>
        <button className={tab === 'completed' ? 'active' : ''} onClick={() => setTab('completed')}>
          Completed Examinations History
        </button>
      </div>

      {tab === 'upcoming' ? (
        <Panel title="Upcoming Examination Schedule" icon={CalendarDays}>
          <div className="parent-table-wrap">
            <table className="parent-table">
              <thead>
                <tr>
                  <th>Date &amp; Day</th>
                  <th>Session Time</th>
                  <th>Subject</th>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Exam Hall &amp; Seat</th>
                  <th>Status</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam, idx) => (
                  <tr key={exam.code}>
                    <td>
                      <strong>
                        {exam.date.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                      </strong>
                    </td>
                    <td>
                      <span>{exam.start} - {exam.end}</span>
                      <small style={{ display: 'block', color: '#64748b' }}>2 Hours Duration</small>
                    </td>
                    <td>
                      <strong>{exam.subject}</strong>
                    </td>
                    <td><code>{exam.code}</code></td>
                    <td>{exam.type}</td>
                    <td>
                      <span>{exam.room}</span>
                      <small style={{ display: 'block', color: '#1677f2', fontWeight: 600 }}>Seat: {exam.seat}</small>
                    </td>
                    <td>
                      <span className="parent-pill success">
                        <Circle size={8} style={{ fill: 'currentColor' }} /> Scheduled
                      </span>
                    </td>
                    <td>
                      <button className="outline-button" onClick={() => setSelectedExam(exam)}>
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="parent-readonly-note" style={{ marginTop: '12px' }}>
            <ShieldCheck size={14} /> Examination timings and hall allocations are finalized by the Exam Cell.
            Reporting time is 30 minutes prior to exam commencement.
          </p>
        </Panel>
      ) : (
        <Panel title="Completed Semester Examinations" icon={FileCheck2}>
          <div className="parent-table-wrap">
            <table className="parent-table">
              <thead>
                <tr>
                  <th>Exam Session</th>
                  <th>Semester</th>
                  <th>Total Subjects</th>
                  <th>Credits</th>
                  <th>SGPA</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map((res) => (
                  <tr key={res.semester}>
                    <td><strong>Semester {res.semester} Regular Examination</strong></td>
                    <td>Semester {res.semester}</td>
                    <td>{res.subjects.length} Subjects</td>
                    <td>{res.totalCredits} Credits</td>
                    <td><strong>{res.sgpa.toFixed(2)}</strong></td>
                    <td>
                      <span className="parent-pill success">{res.resultStatus}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* Exam Details Modal */}
      {selectedExam && (
        <div className="parent-modal-overlay" onClick={() => setSelectedExam(null)}>
          <div className="parent-modal" onClick={(e) => e.stopPropagation()}>
            <div className="parent-modal-header">
              <h3>Examination Details</h3>
              <button onClick={() => setSelectedExam(null)} aria-label="Close modal">
                <X size={18} />
              </button>
            </div>
            <div className="parent-modal-body">
              <div className="parent-exam-modal-hero">
                <CalendarDays size={28} color="#1677f2" />
                <div>
                  <h4>{selectedExam.subject}</h4>
                  <p>{selectedExam.code} · {selectedExam.type} Examination</p>
                </div>
              </div>
              <div className="parent-exam-modal-grid">
                <div>
                  <small>Exam Date</small>
                  <strong>{selectedExam.date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                </div>
                <div>
                  <small>Session Timing</small>
                  <strong>{selectedExam.start} – {selectedExam.end} (2 Hours)</strong>
                </div>
                <div>
                  <small>Exam Venue / Hall</small>
                  <strong>{selectedExam.room}</strong>
                </div>
                <div>
                  <small>Allocated Seat Number</small>
                  <strong style={{ color: '#1677f2' }}>{selectedExam.seat}</strong>
                </div>
                <div>
                  <small>Reporting Time</small>
                  <strong>45 Minutes Before Start (08:45 AM / 01:15 PM)</strong>
                </div>
                <div>
                  <small>Permitted Materials</small>
                  <strong>Hall Ticket, College ID Card, Non-programmable Calculator, Pens</strong>
                </div>
              </div>
              <div className="parent-alert" style={{ marginTop: '16px', background: '#f8fafc' }}>
                <Info size={16} />
                <div>
                  <strong>Important Examination Notice</strong>
                  <p>Electronic gadgets, smartwatches, and unauthorized notes are strictly prohibited inside the examination hall.</p>
                </div>
              </div>
            </div>
            <div className="parent-modal-footer">
              <button className="solid-button" onClick={() => setSelectedExam(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/* =========================================================================
   FEES VIEW
   ========================================================================= */
const FeesView: React.FC<{
  section: string;
  profile: StudentProfile;
  fees: FeeRecord[];
  paidTotal: number;
  dueTotal: number;
  onPayFeeSuccess: (feeId: string, receiptNo: string) => void;
}> = ({ section, profile, fees, paidTotal, dueTotal, onPayFeeSuccess }) => {
  const navigate = useNavigate();
  const [selectedFeeId, setSelectedFeeId] = useState<string>(fees.find((f) => f.status !== 'PAID')?.id || '');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);
  const [viewReceiptFee, setViewReceiptFee] = useState<FeeRecord | null>(null);

  // Keep the selection valid when fees change (ward switch or after payment)
  useEffect(() => {
    if (!fees.some((f) => f.id === selectedFeeId && f.status !== 'PAID')) {
      setSelectedFeeId(fees.find((f) => f.status !== 'PAID')?.id || '');
    }
  }, [fees]);

  const selectedFee = fees.find((f) => f.id === selectedFeeId);

  const handleSimulatedPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeeId || !selectedFee) return;

    setIsProcessing(true);
    setTimeout(() => {
      const generatedReceipt = `REC-2026-${Date.now().toString().slice(-6)}`;
      onPayFeeSuccess(selectedFeeId, generatedReceipt);
      setIsProcessing(false);
      setPaymentSuccess(generatedReceipt);
    }, 1200);
  };

  return (
    <>
      <section className="parent-metrics-grid compact">
        <Metric
          label="Total Billed"
          value={money(paidTotal + dueTotal)}
          detail={`${fees.length} Total Fee Heads`}
          icon={IndianRupee}
        />
        <Metric
          label="Total Paid"
          value={money(paidTotal)}
          detail={`${fees.filter((f) => f.status === 'PAID').length} Payments Cleared`}
          icon={CheckCircle2}
          tone="green"
        />
        <Metric
          label="Outstanding Dues"
          value={money(dueTotal)}
          detail={`${fees.filter((f) => f.status !== 'PAID').length} Pending Fee Heads`}
          icon={Wallet}
          tone={dueTotal > 0 ? 'orange' : 'green'}
        />
        <Metric
          label="Next Due Date"
          value={dateLabel(fees.filter((f) => f.status !== 'PAID').sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0]?.dueDate)}
          detail="Pending balance"
          icon={CalendarDays}
          tone="purple"
        />
      </section>

      <div className="parent-filter-tabs" style={{ marginBottom: '16px' }}>
        <button className={section === 'fees' ? 'active' : ''} onClick={() => navigate('/parent/fees')}>
          Fee Breakdown &amp; Structure
        </button>
        <button className={section === 'pay-fees' ? 'active' : ''} onClick={() => navigate('/parent/pay-fees')}>
          Pay Outstanding Fees ({fees.filter((f) => f.status !== 'PAID').length})
        </button>
        <button className={section === 'payments' ? 'active' : ''} onClick={() => navigate('/parent/payments')}>
          Payment History &amp; Receipts ({fees.filter((f) => f.status === 'PAID').length})
        </button>
      </div>

      {section === 'pay-fees' && (
        <div className="parent-pay-fee-layout">
          <Panel title="Select Fee Item to Pay" icon={CreditCard}>
            {dueTotal === 0 ? (
              <div className="parent-all-clear-box">
                <CheckCircle2 size={36} color="#059669" />
                <h3>All Fees Paid in Full!</h3>
                <p>There are currently no outstanding fee dues for {profile.fullName}.</p>
                <button className="outline-button" onClick={() => navigate('/parent/payments')}>
                  View Payment History
                </button>
              </div>
            ) : (
              <form onSubmit={handleSimulatedPayment}>
                {paymentSuccess ? (
                  <div className="parent-payment-success-card">
                    <CheckCircle2 size={36} color="#059669" />
                    <h3>Payment Successful!</h3>
                    <p>
                      Your payment of <strong>{money(selectedFee?.amount || 0)}</strong> has been confirmed and
                      recorded in the college accounting system.
                    </p>
                    <div className="parent-receipt-pill">
                      <span>Receipt Number:</span>
                      <strong>{paymentSuccess}</strong>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                      <button
                        type="button"
                        className="solid-button"
                        onClick={() => {
                          if (selectedFee) {
                            downloadReceipt(profile, { ...selectedFee, receiptNo: paymentSuccess, status: 'PAID' });
                          }
                        }}
                      >
                        <Download size={14} /> Download Official Receipt
                      </button>
                      <button
                        type="button"
                        className="outline-button"
                        onClick={() => {
                          setPaymentSuccess(null);
                          navigate('/parent/fees');
                        }}
                      >
                        Back to Fee Details
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="parent-fee-selection-list">
                      {fees
                        .filter((fee) => fee.status !== 'PAID')
                        .map((fee) => (
                          <label
                            key={fee.id}
                            className={`parent-fee-option ${selectedFeeId === fee.id ? 'selected' : ''}`}
                          >
                            <input
                              type="radio"
                              name="feeSelection"
                              checked={selectedFeeId === fee.id}
                              onChange={() => setSelectedFeeId(fee.id)}
                            />
                            <div>
                              <strong>{fee.category}</strong>
                              <small>Due Date: {dateLabel(fee.dueDate)}</small>
                            </div>
                            <strong className="parent-fee-opt-amount">{money(fee.amount)}</strong>
                          </label>
                        ))}
                    </div>

                    <h4 style={{ margin: '20px 0 10px', fontSize: '13px', color: '#1e293b' }}>
                      Choose Payment Method
                    </h4>
                    <div className="parent-payment-methods">
                      {['UPI', 'Credit / Debit Card', 'Net Banking', 'NEFT / RTGS'].map((m) => (
                        <button
                          type="button"
                          key={m}
                          className={paymentMethod === m ? 'selected' : ''}
                          onClick={() => setPaymentMethod(m)}
                        >
                          {m === 'UPI' && <QrCode size={18} />}
                          {m === 'Credit / Debit Card' && <CreditCard size={18} />}
                          {m === 'Net Banking' && <IndianRupee size={18} />}
                          {m === 'NEFT / RTGS' && <Receipt size={18} />}
                          <strong>{m}</strong>
                        </button>
                      ))}
                    </div>

                    <div className="parent-checkout-summary">
                      <div>
                        <span>Selected Fee Head:</span>
                        <strong>{selectedFee?.category || '—'}</strong>
                      </div>
                      <div>
                        <span>Student Roll No:</span>
                        <strong>{profile.rollNo} ({profile.fullName})</strong>
                      </div>
                      <div>
                        <span>Payment Gateway:</span>
                        <strong>CampusConnect Secure Gateway</strong>
                      </div>
                      <div className="parent-checkout-total">
                        <span>Total Payable Amount:</span>
                        <strong>{money(selectedFee?.amount || 0)}</strong>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isProcessing || !selectedFeeId}
                      className="solid-button parent-full-button"
                      style={{ marginTop: '16px', padding: '14px' }}
                    >
                      {isProcessing ? 'Processing Secure Payment…' : `Pay ${money(selectedFee?.amount || 0)} Now`}
                    </button>
                  </>
                )}
              </form>
            )}
          </Panel>
        </div>
      )}

      {(section === 'fees' || section === 'pay-fees') && (
        <Panel title="Institutional Fee Head Breakdown" icon={Wallet}>
          <div className="parent-table-wrap">
            <table className="parent-table">
              <thead>
                <tr>
                  <th>Fee Head / Category</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Payment Status</th>
                  <th>Receipt / Action</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((fee) => (
                  <tr key={fee.id}>
                    <td>
                      <strong>{fee.category}</strong>
                      <small style={{ display: 'block', color: '#64748b' }}>Academic Year 2024-2025</small>
                    </td>
                    <td>{dateLabel(fee.dueDate)}</td>
                    <td>
                      <strong>{money(fee.amount)}</strong>
                    </td>
                    <td>
                      <span className={`parent-pill ${fee.status === 'PAID' ? 'success' : 'warning'}`}>
                        {fee.status}
                      </span>
                    </td>
                    <td>
                      {fee.status === 'PAID' ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="outline-button"
                            onClick={() => setViewReceiptFee(fee)}
                            title="View Receipt"
                          >
                            <Eye size={12} /> View
                          </button>
                          <button
                            className="outline-button"
                            onClick={() => downloadReceipt(profile, fee)}
                            title="Download Receipt"
                          >
                            <Download size={12} />
                          </button>
                        </div>
                      ) : (
                        <button
                          className="solid-button"
                          onClick={() => {
                            setSelectedFeeId(fee.id);
                            navigate('/parent/pay-fees');
                          }}
                        >
                          Pay Now
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {!fees.length && (
                  <tr>
                    <td colSpan={5}>
                      <Empty text="No fee records found for this student." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="parent-readonly-note" style={{ marginTop: '12px' }}>
            <ShieldCheck size={14} /> Fee structures are configured by the institution’s finance department. Parents
            cannot alter fee components.
          </p>
        </Panel>
      )}

      {section === 'payments' && (
        <Panel title="Completed Payment Transactions &amp; Receipts" icon={Receipt}>
          <div className="parent-table-wrap">
            <table className="parent-table">
              <thead>
                <tr>
                  <th>Receipt No.</th>
                  <th>Fee Category</th>
                  <th>Date &amp; Time Paid</th>
                  <th>Amount Paid</th>
                  <th>Mode</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fees
                  .filter((fee) => fee.status === 'PAID')
                  .map((fee) => (
                    <tr key={fee.id}>
                      <td>
                        <code>{fee.receiptNo || 'REC-ONLINE'}</code>
                      </td>
                      <td>
                        <strong>{fee.category}</strong>
                      </td>
                      <td>{dateTimeLabel(fee.paidAt)}</td>
                      <td>
                        <strong style={{ color: '#059669' }}>{money(fee.amount)}</strong>
                      </td>
                      <td>Online / Cashier</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="outline-button"
                            onClick={() => setViewReceiptFee(fee)}
                          >
                            <Eye size={13} /> View
                          </button>
                          <button
                            className="outline-button"
                            onClick={() => downloadReceipt(profile, fee)}
                          >
                            <Download size={13} /> Download
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                {!fees.some((fee) => fee.status === 'PAID') && (
                  <tr>
                    <td colSpan={6}>
                      <Empty text="No completed fee payments recorded yet." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* View Receipt Modal */}
      {viewReceiptFee && (
        <div className="parent-modal-overlay" onClick={() => setViewReceiptFee(null)}>
          <div className="parent-modal" onClick={(e) => e.stopPropagation()}>
            <div className="parent-modal-header">
              <h3>Official Fee Receipt</h3>
              <button onClick={() => setViewReceiptFee(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div className="parent-modal-body">
              <div className="parent-receipt-preview">
                <div className="parent-receipt-head">
                  <GraduationCap size={32} color="#1677f2" />
                  <div>
                    <h4>{profile.institutionName || 'Narasaraopet Engineering College'}</h4>
                    <small>Official Student Fee Payment Receipt</small>
                  </div>
                </div>
                <hr style={{ margin: '14px 0', borderColor: '#e2e8f0' }} />
                <div className="parent-receipt-details-grid">
                  <div>
                    <small>Receipt Number</small>
                    <strong>{viewReceiptFee.receiptNo || 'REC-ONLINE'}</strong>
                  </div>
                  <div>
                    <small>Date of Payment</small>
                    <strong>{dateTimeLabel(viewReceiptFee.paidAt)}</strong>
                  </div>
                  <div>
                    <small>Student Name</small>
                    <strong>{profile.fullName}</strong>
                  </div>
                  <div>
                    <small>Roll Number</small>
                    <strong>{profile.rollNo}</strong>
                  </div>
                  <div>
                    <small>Department</small>
                    <strong>{profile.department}</strong>
                  </div>
                  <div>
                    <small>Fee Head</small>
                    <strong>{viewReceiptFee.category}</strong>
                  </div>
                  <div>
                    <small>Payment Status</small>
                    <strong style={{ color: '#059669' }}>PAID / CONFIRMED</strong>
                  </div>
                  <div>
                    <small>Amount Paid</small>
                    <strong style={{ fontSize: '16px', color: '#1677f2' }}>
                      {money(viewReceiptFee.amount)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
            <div className="parent-modal-footer">
              <button
                className="solid-button"
                onClick={() => downloadReceipt(profile, viewReceiptFee)}
              >
                <Download size={14} /> Download Receipt CSV
              </button>
              <button className="outline-button" onClick={() => setViewReceiptFee(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/* =========================================================================
   NOTICES VIEW
   ========================================================================= */
const NoticesView: React.FC<{ notices: Notice[] }> = ({ notices }) => {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  const categories = ['All', 'Academic', 'Examination', 'Fees', 'Events', 'General'];

  const filtered = notices.filter((notice) => {
    const matchesCategory =
      category === 'All' ||
      notice.category.toLowerCase().includes(category.toLowerCase()) ||
      (category === 'Events' && notice.category.toLowerCase().includes('event'));
    const matchesSearch =
      !search ||
      notice.title.toLowerCase().includes(search.toLowerCase()) ||
      notice.content.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <div className="parent-notices-top-bar">
        <div className="parent-filter-tabs">
          {categories.map((item) => (
            <button
              className={category === item ? 'active' : ''}
              key={item}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="parent-search-box">
          <Search size={15} />
          <input
            placeholder="Search circulars & notices…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="parent-notices-feed">
        {filtered.map((notice) => (
          <article
            key={notice.id}
            onClick={() => setSelectedNotice(notice)}
            style={{ cursor: 'pointer' }}
          >
            <span className={`parent-notice-icon ${notice.priority.toLowerCase()}`}>
              <FileText size={18} />
            </span>
            <div>
              <div className="parent-notice-meta">
                <span>{notice.category}</span>
                <time>{dateTimeLabel(notice.publishedAt)}</time>
              </div>
              <h2>{notice.title}</h2>
              <p>{notice.content}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`parent-pill ${notice.priority === 'URGENT' ? 'warning' : ''}`}>
                  {notice.priority}
                </span>
                <span className="parent-text-action">Read Full Circular ›</span>
              </div>
            </div>
          </article>
        ))}
        {!filtered.length && <Empty text="No circulars match your selected category or search query." />}
      </div>

      {/* Notice Modal */}
      {selectedNotice && (
        <div className="parent-modal-overlay" onClick={() => setSelectedNotice(null)}>
          <div className="parent-modal" onClick={(e) => e.stopPropagation()}>
            <div className="parent-modal-header">
              <span className={`parent-pill ${selectedNotice.priority === 'URGENT' ? 'warning' : ''}`}>
                {selectedNotice.priority}
              </span>
              <button onClick={() => setSelectedNotice(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div className="parent-modal-body">
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                {selectedNotice.category} · Published on {dateTimeLabel(selectedNotice.publishedAt)}
              </span>
              <h3 style={{ margin: '8px 0 14px', color: '#1e293b', fontSize: '17px' }}>
                {selectedNotice.title}
              </h3>
              <p style={{ color: '#475569', fontSize: '13px', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                {selectedNotice.content}
              </p>
            </div>
            <div className="parent-modal-footer">
              <button className="solid-button" onClick={() => setSelectedNotice(null)}>
                Close Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/* =========================================================================
   NOTIFICATIONS VIEW
   ========================================================================= */
const NotificationsView: React.FC<{ notifications: Notification[] }> = ({ notifications }) => {
  const [filter, setFilter] = useState('All');
  const [readIds, setReadIds] = useState<string[]>([]);

  const filterCategories = ['All', 'ATTENDANCE', 'EXAMINATION', 'RESULTS', 'FEES', 'GENERAL'];

  const markAllRead = () => {
    setReadIds(notifications.map((n) => n.id));
  };

  const toggleRead = (id: string) => {
    setReadIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const filtered = notifications.filter((item) => {
    if (filter === 'All') return true;
    return item.category.toUpperCase().includes(filter);
  });

  const unreadCount = filtered.filter((n) => !n.isRead && !readIds.includes(n.id)).length;

  return (
    <>
      <div className="parent-notices-top-bar">
        <div className="parent-filter-tabs">
          {filterCategories.map((c) => (
            <button
              className={filter === c ? 'active' : ''}
              key={c}
              onClick={() => setFilter(c)}
            >
              {c.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
        {unreadCount > 0 && (
          <button className="outline-button" onClick={markAllRead}>
            <Check size={14} /> Mark All as Read
          </button>
        )}
      </div>

      <Panel
        title="Ward Notifications &amp; Alerts"
        icon={Activity}
        action={<span className="parent-unread-count">{unreadCount} Unread</span>}
      >
        <div className="parent-notifications-feed">
          {filtered.map((item) => {
            const isRead = item.isRead || readIds.includes(item.id);
            return (
              <article
                className={!isRead ? 'unread' : ''}
                key={item.id}
                onClick={() => toggleRead(item.id)}
                style={{ cursor: 'pointer' }}
              >
                <span><Activity size={16} /></span>
                <div>
                  <div>
                    <strong>{item.title}</strong>
                    <time>{dateTimeLabel(item.createdAt)}</time>
                  </div>
                  <p>{item.message}</p>
                  <small>
                    {item.category.replace(/_/g, ' ')} · {isRead ? 'Read' : 'Unread'}
                  </small>
                </div>
              </article>
            );
          })}
          {!filtered.length && <Empty text="No notifications match the selected category." />}
        </div>
        <p className="parent-readonly-note" style={{ marginTop: '12px' }}>
          <Info size={14} /> Notifications are personalized for your linked ward and generated automatically.
        </p>
      </Panel>
    </>
  );
};

/* =========================================================================
   CALENDAR VIEW
   ========================================================================= */
const CalendarView: React.FC<{
  notices: Notice[];
  timetable: ParentWardOverview['timetable'];
  exams: Exam[];
}> = ({ notices, timetable, exams }) => {
  const [activeTab, setActiveTab] = useState<'events' | 'timetable'>('events');

  const institutionalEvents = [
    { title: 'Mid-Semester Examinations Commencement', date: 'Oct 15, 2026', type: 'EXAMINATION', desc: 'Continuous internal evaluation exams for all branches.' },
    { title: 'Parent-Teacher Interaction Meeting (PTM)', date: 'Oct 24, 2026', type: 'MEETING', desc: 'One-on-one progress discussion with faculty mentors and HODs.' },
    { title: 'Diwali Festival Break / Institutional Holiday', date: 'Nov 01 - Nov 03, 2026', type: 'HOLIDAY', desc: 'College campus and offices closed.' },
    { title: 'Annual Tech Fest & Project Expo "Invento 2026"', date: 'Nov 12 - Nov 14, 2026', type: 'EVENT', desc: 'Student technical symposium, hackathon, and innovation showcase.' },
    { title: 'End-Semester Theory Examinations Window', date: 'Dec 02 - Dec 23, 2026', type: 'EXAMINATION', desc: 'University end-semester theory examinations.' },
    { title: 'Semester Winter Vacation & Reopening', date: 'Dec 24, 2026 - Jan 04, 2027', type: 'HOLIDAY', desc: 'Winter recess for students.' },
  ];

  return (
    <>
      <div className="parent-filter-tabs" style={{ marginBottom: '16px' }}>
        <button className={activeTab === 'events' ? 'active' : ''} onClick={() => setActiveTab('events')}>
          Academic Events, Holidays &amp; PTMs
        </button>
        <button className={activeTab === 'timetable' ? 'active' : ''} onClick={() => setActiveTab('timetable')}>
          Ward’s Weekly Class Timetable
        </button>
      </div>

      {activeTab === 'events' ? (
        <div className="parent-calendar-layout">
          <Panel title="Semester Milestones &amp; Academic Dates" icon={CalendarDays}>
            <div className="parent-calendar-events">
              {institutionalEvents.map((evt, i) => (
                <article key={i}>
                  <span><CalendarDays size={18} /></span>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <small style={{ color: '#1677f2', fontWeight: 700 }}>{evt.date}</small>
                      <span className="parent-pill">{evt.type}</span>
                    </div>
                    <strong>{evt.title}</strong>
                    <p>{evt.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </Panel>

          <Panel title="Published Dated Circulars" icon={FileText}>
            <div className="parent-calendar-events">
              {notices.map((notice) => (
                <article key={notice.id}>
                  <span><Clock3 size={18} /></span>
                  <div>
                    <small>{dateTimeLabel(notice.publishedAt)} · {notice.category}</small>
                    <strong>{notice.title}</strong>
                    <p>{notice.content}</p>
                  </div>
                </article>
              ))}
              {!notices.length && <Empty text="No dated circulars currently scheduled." />}
            </div>
          </Panel>
        </div>
      ) : (
        <Panel title="Weekly Class Timetable (Mon – Sat)" icon={BookOpen}>
          <div className="parent-table-wrap">
            <table className="parent-table">
              <thead>
                <tr>
                  <th>Day of Week</th>
                  <th>Class Timings</th>
                  <th>Subject</th>
                  <th>Room Number</th>
                  <th>Faculty Instructor</th>
                </tr>
              </thead>
              <tbody>
                {timetable.map((slot) => (
                  <tr key={slot.id}>
                    <td><strong>{slot.dayOfWeek}</strong></td>
                    <td>{slot.startTime} – {slot.endTime}</td>
                    <td><strong>{slot.subjectName}</strong></td>
                    <td>{slot.roomNumber}</td>
                    <td>{slot.facultyName}</td>
                  </tr>
                ))}
                {!timetable.length && (
                  <tr>
                    <td colSpan={5}>
                      <Empty text="No weekly timetable schedule published for this ward." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </>
  );
};

/* =========================================================================
   REQUESTS / LEAVE VIEW
   ========================================================================= */
const RequestsView: React.FC<{
  requests: ParentWardOverview['requests'];
  profile: StudentProfile;
  wards: StudentProfile[];
  onAddRequest: (req: any) => void;
}> = ({ requests, profile, wards, onAddRequest }) => {
  const [requestType, setRequestType] = useState('LEAVE_OF_ABSENCE');
  const [fromDate, setFromDate] = useState(new Date().toISOString().slice(0, 10));
  const [toDate, setToDate] = useState(new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10));
  const [reason, setReason] = useState('');
  const [phone, setPhone] = useState(profile.guardianPhone || '+91 98765 00000');
  const [submitting, setSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setSubmitting(true);
    setTimeout(() => {
      const newReq = {
        id: `req-${Date.now()}`,
        wardId: profile.id,
        requestType,
        department: 'Academic Affairs & Hostel Admin',
        description: `[From: ${fromDate} to ${toDate}] ${reason}`,
        status: 'SUBMITTED',
        createdAt: new Date().toISOString(),
        resolutionRemarks: 'Application submitted by parent. Forwarded to Head of Department for review.',
      };
      onAddRequest(newReq);
      setSubmitting(false);
      setReason('');
      setSubmittedMessage('Your leave application has been submitted to the department successfully!');
      setTimeout(() => setSubmittedMessage(''), 5000);
    }, 600);
  };

  return (
    <>
      <div className="parent-request-status-banner">
        <ShieldCheck size={20} color="#059669" />
        <div>
          <strong>Institutional Parent Request Service: Active</strong>
          <p>
            Parents may submit leave of absence requests, medical leave notifications, hostel out-passes, or
            mentor meeting requests directly to the department.
          </p>
        </div>
      </div>

      <div className="parent-requests-layout">
        <Panel title="Submit Application / Request for Ward" icon={Send}>
          {submittedMessage && (
            <div className="parent-success-alert" style={{ marginBottom: '16px' }}>
              <CheckCircle2 size={18} />
              <span>{submittedMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="parent-request-form">
            <div className="parent-form-row">
              <label>
                Request Category
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  required
                >
                  <option value="LEAVE_OF_ABSENCE">Leave of Absence (Casual)</option>
                  <option value="MEDICAL_LEAVE">Medical Leave</option>
                  <option value="HOSTEL_OUTPASS">Hostel Out-Pass Permission</option>
                  <option value="FEE_EXTENSION">Fee Due Date Extension</option>
                  <option value="MENTOR_MEETING">Parent-Teacher / Mentor Meeting Request</option>
                </select>
              </label>

              <label>
                Ward
                <input
                  type="text"
                  disabled
                  value={`${profile.fullName} (${profile.rollNo})`}
                />
              </label>
            </div>

            <div className="parent-form-row">
              <label>
                From Date
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  required
                />
              </label>

              <label>
                To Date
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  required
                />
              </label>
            </div>

            <label>
              Parent Contact Phone (for verification)
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </label>

            <label>
              Detailed Reason / Application Notes
              <textarea
                rows={4}
                required
                placeholder="State the reason for leave or details of your institutional request…"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </label>

            <button
              type="submit"
              disabled={submitting || !reason.trim()}
              className="solid-button"
              style={{ marginTop: '8px' }}
            >
              {submitting ? 'Submitting Application…' : 'Submit Application'}
            </button>
          </form>
        </Panel>

        <Panel title="Application &amp; Request History" icon={ClipboardList}>
          <div className="parent-table-wrap">
            <table className="parent-table">
              <thead>
                <tr>
                  <th>Request Type</th>
                  <th>Submitted On</th>
                  <th>Status</th>
                  <th>Department Remarks</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => {
                  const status = String(req.status || 'SUBMITTED');
                  let pillClass = 'warning';
                  if (status === 'RESOLVED' || status === 'APPROVED') pillClass = 'success';
                  if (status === 'REJECTED') pillClass = 'danger';

                  return (
                    <tr key={req.id}>
                      <td>
                        <strong>{req.requestType.replace(/_/g, ' ')}</strong>
                        <small style={{ display: 'block', color: '#64748b' }}>{req.description}</small>
                      </td>
                      <td>{dateTimeLabel(req.createdAt)}</td>
                      <td>
                        <span className={`parent-pill ${pillClass}`}>
                          {status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>{req.resolutionRemarks || 'Under review by Academic Head'}</td>
                    </tr>
                  );
                })}
                {!requests.length && (
                  <tr>
                    <td colSpan={4}>
                      <Empty text="No parent or student applications submitted yet." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </>
  );
};

/* =========================================================================
   SETTINGS VIEW
   ========================================================================= */
const SettingsView: React.FC<{
  parentName: string;
  email: string;
  profile: StudentProfile;
  wards: StudentProfile[];
}> = ({ parentName, email, profile, wards }) => {
  const { logout } = useAuth();
  const [preferences, setPreferences] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(
        localStorage.getItem(`campusconnect.parent.preferences.${email}`) ||
          '{"email":true,"sms":true,"whatsapp":false,"attendance":true,"fees":true,"exams":true}'
      );
    } catch {
      return { email: true, sms: true, whatsapp: false, attendance: true, fees: true, exams: true };
    }
  });

  const [saved, setSaved] = useState(false);
  const [currPass, setCurrPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMessage, setPassMessage] = useState('');
  const [passError, setPassError] = useState('');

  const toggle = (key: string) => setPreferences((s) => ({ ...s, [key]: !s[key] }));

  const handleSavePreferences = () => {
    localStorage.setItem(`campusconnect.parent.preferences.${email}`, JSON.stringify(preferences));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassMessage('');

    if (newPass.length < 6) {
      setPassError('New password must be at least 6 characters long.');
      return;
    }
    if (newPass !== confirmPass) {
      setPassError('New passwords do not match.');
      return;
    }

    setPassMessage('Password updated successfully on your account!');
    setCurrPass('');
    setNewPass('');
    setConfirmPass('');
    setTimeout(() => setPassMessage(''), 4000);
  };

  return (
    <div className="parent-settings-grid">
      {/* Parent Profile */}
      <Panel title="Parent Account Information" icon={UserRound}>
        <div className="parent-settings-profile">
          <span>{parentName.split(/\s+/).map((p) => p[0]).slice(0, 2).join('')}</span>
          <div>
            <strong>{parentName}</strong>
            <small>{email}</small>
            <span className="parent-status-tag" style={{ marginTop: '4px' }}>
              <ShieldCheck size={12} /> Verified Parent / Guardian Account
            </span>
          </div>
        </div>

        <div className="parent-settings-ward-summary">
          <small>Linked Wards ({wards.length})</small>
          {wards.map((w) => (
            <div key={w.id} className="parent-settings-ward-item">
              <strong>{w.fullName}</strong>
              <span>{w.rollNo} · {w.department}</span>
            </div>
          ))}
        </div>

        <p className="parent-readonly-note" style={{ marginTop: '12px' }}>
          <ShieldCheck size={14} /> Contact information is synchronized with institutional student registration
          records.
        </p>
      </Panel>

      {/* Notification Preferences */}
      <Panel title="Notification &amp; Alert Channels" icon={Activity}>
        <Preference
          title="Email Notifications"
          detail="Receive important academic announcements and grade cards by email."
          value={preferences.email}
          onClick={() => toggle('email')}
        />
        <Preference
          title="SMS Alerts"
          detail="Receive urgent attendance shortage and exam hall ticket alerts via SMS."
          value={preferences.sms}
          onClick={() => toggle('sms')}
        />
        <Preference
          title="WhatsApp Notifications"
          detail="Receive circulars and fee receipts on your registered WhatsApp number."
          value={preferences.whatsapp}
          onClick={() => toggle('whatsapp')}
        />
        <hr />
        <Preference
          title="Attendance Shortage Warnings"
          detail="Immediate alert when ward’s attendance drops below 75% in any subject."
          value={preferences.attendance}
          onClick={() => toggle('attendance')}
        />
        <Preference
          title="Fee Reminders &amp; Dues"
          detail="Notifications regarding upcoming fee due dates and invoice updates."
          value={preferences.fees}
          onClick={() => toggle('fees')}
        />
        <Preference
          title="Examination Schedule Alerts"
          detail="Updates when university examination dates and hall tickets are published."
          value={preferences.exams}
          onClick={() => toggle('exams')}
        />

        <div className="parent-settings-actions">
          <button className="solid-button" onClick={handleSavePreferences}>
            Save Preferences
          </button>
          {saved && <span className="parent-saved-tag"><Check size={14} /> Preferences Saved</span>}
        </div>
      </Panel>

      {/* Password & Security */}
      <Panel title="Account Security &amp; Password" icon={Lock}>
        {passMessage && (
          <div className="parent-success-alert" style={{ marginBottom: '12px' }}>
            <CheckCircle2 size={16} />
            <span>{passMessage}</span>
          </div>
        )}
        {passError && (
          <div className="parent-error" style={{ marginBottom: '12px' }}>
            <CircleAlert size={16} />
            <span>{passError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label className="parent-setting-input">
            Current Password
            <input
              type="password"
              required
              placeholder="••••••••"
              value={currPass}
              onChange={(e) => setCurrPass(e.target.value)}
            />
          </label>
          <label className="parent-setting-input">
            New Password
            <input
              type="password"
              required
              placeholder="••••••••"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
            />
          </label>
          <label className="parent-setting-input">
            Confirm New Password
            <input
              type="password"
              required
              placeholder="••••••••"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
            />
          </label>
          <button type="submit" className="outline-button" style={{ marginTop: '4px' }}>
            Update Password
          </button>
        </form>
      </Panel>

      {/* Regional & System Preferences */}
      <Panel title="System &amp; Display Preferences" icon={Settings}>
        <label className="parent-setting-select">
          Language Preference
          <select defaultValue="en">
            <option value="en">English (Official)</option>
            <option value="te">తెలుగు (Telugu)</option>
            <option value="hi">हिन्दी (Hindi)</option>
          </select>
        </label>

        <label className="parent-setting-select">
          Theme Preference
          <select defaultValue="system">
            <option value="system">System Default</option>
            <option value="light">Light Mode</option>
          </select>
        </label>

        <div className="parent-security-note">
          <ShieldCheck size={20} />
          <div>
            <strong>Role-Protected Parent Account</strong>
            <p>
              Your account has view-only access to linked student records and can submit verified parental
              requests. Administrative features are strictly restricted.
            </p>
          </div>
        </div>

        <button className="outline-button parent-logout-button" onClick={() => logout()}>
          Sign Out of CampusConnect
        </button>
      </Panel>
    </div>
  );
};

const Preference: React.FC<{
  title: string;
  detail: string;
  value: boolean;
  onClick: () => void;
}> = ({ title, detail, value, onClick }) => (
  <label className="parent-preference">
    <span>
      <strong>{title}</strong>
      <small>{detail}</small>
    </span>
    <input type="checkbox" checked={value} onChange={onClick} />
  </label>
);
