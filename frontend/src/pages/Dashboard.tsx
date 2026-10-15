import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { DashboardSummary } from '../types';
import {
  GraduationCap,
  CalendarCheck,
  CheckSquare,
  FileSpreadsheet,
  ArrowRight,
  Clock,
  Bell,
  BookOpen,
  Briefcase,
  Layers,
  CreditCard,
  Activity,
  CheckCircle2
} from 'lucide-react';

const toMinutes = (time: string) => {
  if (!time) return 0;
  const [clock, meridiem] = time.split(' ');
  let [hour, minute] = clock.split(':').map(Number);
  if (meridiem === 'PM' && hour !== 12) hour += 12;
  if (meridiem === 'AM' && hour === 12) hour = 0;
  return hour * 60 + (minute || 0);
};

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const clock = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(clock);
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await apiClient.getDashboard();
        setData(res);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const todaySlots = useMemo(() => {
    if (!data) return [];
    const todayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    return data.todayClasses
      .filter((slot) => slot.dayOfWeek.toUpperCase() === todayName)
      .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
  }, [data, now]);

  if (loading || !data) {
    return (
      <div className="empty-state">
        <div className="skeleton-hero skeleton-pulse" style={{ marginBottom: '20px' }}></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <div className="skeleton-card skeleton-pulse"></div>
          <div className="skeleton-card skeleton-pulse"></div>
          <div className="skeleton-card skeleton-pulse"></div>
          <div className="skeleton-card skeleton-pulse"></div>
        </div>
      </div>
    );
  }

  const { profile } = data;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  return (
    <div>
      {/* Hero Welcome Banner */}
      <div className="hero">
        <div className="hero-copy">
          <div className="eyebrow">Student Workspace · Academic Year 2025–26</div>
          <h1>
            Good Day,<br />
            {profile.fullName}
          </h1>
          <p>
            {profile.program} · {profile.department} &nbsp;|&nbsp; Year {profile.currentYear} · Semester {profile.currentSemester}
          </p>
          <div className="meta">
            <span>Roll No: <strong>{profile.rollNo}</strong></span>
            <span>Reg No: <strong>{profile.regNo}</strong></span>
            <span>Section: <strong>{profile.section}</strong></span>
          </div>
        </div>
        <figure className="hero-campus-photo">
          <img src="/images/campus-generic.jpg" alt="University campus building" />
          <blockquote>“Small steps every day lead to big results.”</blockquote>
        </figure>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats">
        <div className="stat">
          <div className="ico blue"><GraduationCap size={20} /></div>
          <div>
            <span className="stat-label">Attendance</span>
            <strong className="value">{data.attendancePercentage}%</strong>
            <span className="note">{data.attendanceNote}</span>
          </div>
        </div>

        <div className="stat">
          <div className="ico green"><CheckSquare size={20} /></div>
          <div>
            <span className="stat-label">CGPA Standing</span>
            <strong className="value">{data.cgpa}</strong>
            <span className="note">{data.cgpaNote}</span>
          </div>
        </div>

        <div className="stat">
          <div className="ico orange"><CalendarCheck size={20} /></div>
          <div>
            <span className="stat-label">Pending Tasks</span>
            <strong className="value">{data.pendingAssignments}</strong>
            <span className="note">{data.assignmentNote || 'Assignments due soon'}</span>
          </div>
        </div>

        <div className="stat">
          <div className="ico purple"><FileSpreadsheet size={20} /></div>
          <div>
            <span className="stat-label">Upcoming Exams</span>
            <strong className="value">{data.upcomingExamsCount}</strong>
            <span className="note">{data.upcomingExamNote || 'Scheduled sessions'}</span>
          </div>
        </div>
      </div>

      {/* Two-Column Grid */}
      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="dashboard-col">
          {/* Today's Schedule Card */}
          <section className="card">
            <div className="head">
              <h2>Today's Schedule ({now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })})</h2>
              <button className="link-button" onClick={() => navigate('/timetable')}>Full Timetable <ArrowRight size={14} /></button>
            </div>
            {todaySlots.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '12px 0' }}>No scheduled classes for today.</p>
            ) : (
              <div className="schedule-list">
                {todaySlots.map((slot, idx) => {
                  const startMin = toMinutes(slot.startTime);
                  const endMin = toMinutes(slot.endTime);
                  const isCurrent = nowMinutes >= startMin && nowMinutes < endMin;
                  return (
                    <div key={idx} className={`schedule-item ${isCurrent ? 'current' : ''}`}>
                      <div className="time">
                        <Clock size={14} />
                        <span>{slot.startTime} - {slot.endTime}</span>
                      </div>
                      <div className="subject">
                        <strong>{slot.subjectName}</strong>
                        <small>{slot.subjectCode} · Room {slot.roomNumber} · {slot.facultyName}</small>
                      </div>
                      {isCurrent && <span className="badge active">In Progress</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* SGPA Progression / Academic Overview */}
          <section className="card">
            <div className="head">
              <h2>SGPA Performance Trend</h2>
              <button className="link-button" onClick={() => navigate('/academics')}>View All Results <ArrowRight size={14} /></button>
            </div>
            <div className="trend-chart">
              {data.semesterGpaHistory?.map((sgpa, idx) => (
                <div key={idx} className="trend-bar-group">
                  <div className="trend-bar-wrap">
                    <div className="trend-bar" style={{ height: `${(sgpa / 10) * 100}%` }}>
                      <span>{sgpa.toFixed(2)}</span>
                    </div>
                  </div>
                  <small>Sem {idx + 1}</small>
                </div>
              ))}
            </div>
          </section>

          {/* Subject Performance Breakdown */}
          <section className="card">
            <div className="head">
              <h2>Subject Attendance Breakdown</h2>
              <button className="link-button" onClick={() => navigate('/attendance')}>Details <ArrowRight size={14} /></button>
            </div>
            <div className="attendance-subject-list">
              {data.subjectPerformance?.slice(0, 4).map((subj) => (
                <div key={subj.subjectId} className="attendance-subject-row">
                  <div className="attendance-subject-info">
                    <div>
                      <strong>{subj.subjectName}</strong>
                      <small>{subj.subjectCode} · {subj.totalAttended}/{subj.totalConducted} classes</small>
                    </div>
                    <span className={`badge ${subj.percentage < 75 ? 'danger' : 'success'}`}>{subj.percentage}%</span>
                  </div>
                  <div className="attendance-progress">
                    <span style={{ width: `${subj.percentage}%`, background: subj.percentage < 75 ? 'var(--danger)' : 'var(--primary)' }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="dashboard-col">
          {/* Important Notices */}
          <section className="card">
            <div className="head">
              <h2>Campus Notices</h2>
              <button className="link-button" onClick={() => navigate('/notices')}>All Notices <ArrowRight size={14} /></button>
            </div>
            {data.latestNotices?.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '12px 0' }}>No new notices posted.</p>
            ) : (
              <div className="notice-mini-list">
                {data.latestNotices?.map((n) => (
                  <div key={n.id} className="notice-mini-item" style={{ display: 'flex', gap: '10px', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <Bell size={16} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong style={{ fontSize: '13px', display: 'block', color: 'var(--text-primary)' }}>{n.title}</strong>
                      <small style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{n.formattedDate || n.publishedAt?.slice(0, 10)} · {n.category}</small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Recent Activity */}
          <section className="card">
            <div className="head">
              <h2>Recent Notifications</h2>
            </div>
            <div className="notice-mini-list">
              {data.recentActivities?.slice(0, 4).map((act) => (
                <div key={act.id} style={{ display: 'flex', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <Activity size={15} style={{ color: 'var(--secondary)', flexShrink: 0, marginTop: '3px' }} />
                  <div>
                    <strong style={{ fontSize: '12px', display: 'block', color: 'var(--text-primary)' }}>{act.title}</strong>
                    <small style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{act.message}</small>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Shortcuts */}
          <section className="card">
            <div className="head">
              <h2>Quick Actions</h2>
            </div>
            <div className="shortcuts-grid">
              <button className="shortcut-btn" onClick={() => navigate('/fees')}>
                <CreditCard size={18} />
                <span>Pay Fees</span>
              </button>
              <button className="shortcut-btn" onClick={() => navigate('/courses')}>
                <BookOpen size={18} />
                <span>Study Materials</span>
              </button>
              <button className="shortcut-btn" onClick={() => navigate('/placements')}>
                <Briefcase size={18} />
                <span>Job Drives</span>
              </button>
              <button className="shortcut-btn" onClick={() => navigate('/projects')}>
                <Layers size={18} />
                <span>Projects</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
