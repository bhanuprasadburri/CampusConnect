import React, { useEffect, useMemo, useState } from 'react';
import { apiClient } from '../api/client';
import { AttendanceSummary, AttendanceRecord } from '../types';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, CalendarDays, CheckCircle, ChevronLeft, ChevronRight, CircleCheck, CircleX, Clock3, Info } from 'lucide-react';

const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export const Attendance: React.FC = () => {
  const { studentProfile } = useAuth();
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => dateKey(new Date()));

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        const [sumRes, histRes] = await Promise.all([
          apiClient.getAttendanceSummary(),
          apiClient.getAttendanceHistory(),
        ]);
        setSummary(sumRes);
        setHistory(histRes);

      } catch (err) {
        console.error('Failed to load attendance data', err);
      } finally {
        setLoading(false);
      }
    };
    loadAttendance();
  }, []);

  const recordsByDate = useMemo(() => {
    const grouped = new Map<string, AttendanceRecord[]>();
    history.forEach((record) => {
      const key = record.sessionDate.slice(0, 10);
      grouped.set(key, [...(grouped.get(key) || []), record]);
    });
    return grouped;
  }, [history]);

  if (loading || !summary) {
    return <div style={{ padding: '30px' }}>Loading attendance calendar...</div>;
  }

  const isShortage = summary.overallPercentage < 75;
  const presentCount = history.filter((record) => record.status === 'PRESENT').length;
  const absentCount = history.filter((record) => record.status === 'ABSENT').length;
  const onDutyCount = history.filter((record) => record.status === 'ON_DUTY').length;
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingCells = Array.from({ length: firstOffset }, () => null);
  const monthDays = Array.from({ length: daysInMonth }, (_, index) => index + 1);
  const trailingCount = (7 - ((leadingCells.length + monthDays.length) % 7)) % 7;
  const calendarCells: Array<number | null> = [
    ...leadingCells,
    ...monthDays,
    ...Array.from({ length: trailingCount }, () => null),
  ];
  const selectedRecords = [...(recordsByDate.get(selectedDate) || [])].sort((a, b) => a.periodNumber - b.periodNumber);
  const visibleRecords = selectedRecords.filter((record) =>
    (subjectFilter === 'ALL' || record.subjectCode === subjectFilter) &&
    (statusFilter === 'ALL' || record.status === statusFilter)
  );
  const selectedDateLabel = new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
  const selectedDateShort = new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  const selectedDayShort = new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short' });

  const changeMonth = (amount: number) => {
    setVisibleMonth(new Date(year, month + amount, 1));
  };

  return (
    <div className="attendance-page">
      <div className="portal-hero attendance-heading">
        <div className="attendance-heading-main">
          <div className="hero-copy">
            <div className="eyebrow">CampusConnect / Academics</div>
            <h1>Attendance</h1>
            <p>Track your class attendance and stay on top of your academic journey.</p>
          </div>
        </div>
        {studentProfile && (
          <div className="attendance-student-card">
            <small>STUDENT RECORD</small>
            <div className="attendance-student-info">
              <div className="attendance-student-avatar">
                {studentProfile.profilePhotoUrl ? (
                  <img src={studentProfile.profilePhotoUrl} alt="" />
                ) : (
                  `${studentProfile.firstName[0]}${studentProfile.lastName[0]}`
                )}
              </div>
              <div>
                <strong>{studentProfile.fullName}</strong>
                <span>{studentProfile.program} · {studentProfile.department} | Year {studentProfile.currentYear} · Sem {studentProfile.currentSemester}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {isShortage && (
        <div className="attendance-alert">
          <AlertTriangle size={20} />
          <span><strong>Attendance Shortage Alert:</strong> Your overall attendance is below the mandatory 75% threshold.</span>
        </div>
      )}

      <div className="attendance-stat-grid">
        <div className="attendance-stat-card overall">
          <div className="attendance-ring" style={{ '--percent': `${summary.overallPercentage}%` } as React.CSSProperties}>
            <span>{summary.overallPercentage}%</span>
          </div>
          <div className="attendance-stat-copy">
            <span>Overall Attendance</span>
            <strong>{summary.totalAttended} / {summary.totalConducted} Classes</strong>
            <small>{summary.totalMissed} classes missed</small>
          </div>
        </div>
        <div className="attendance-stat-card present">
          <span className="attendance-stat-icon"><CircleCheck size={22} /></span>
          <div className="attendance-stat-copy"><span>Present</span><strong>{presentCount}</strong><small>Classes</small></div>
        </div>
        <div className="attendance-stat-card absent">
          <span className="attendance-stat-icon"><CircleX size={22} /></span>
          <div className="attendance-stat-copy"><span>Absent</span><strong>{absentCount}</strong><small>Classes</small></div>
        </div>
        <div className="attendance-stat-card onduty">
          <span className="attendance-stat-icon"><Clock3 size={22} /></span>
          <div className="attendance-stat-copy"><span>On Duty</span><strong>{onDutyCount}</strong><small>Classes</small></div>
        </div>
      </div>

      <div className="attendance-overview-layout">
        <section className="card attendance-subject-card">
          <div className="head">
            <h2>Subject-wise Attendance</h2>
            <span className="attendance-subject-period">This Semester</span>
          </div>
          <div className="attendance-subject-heading">
            <h3>Course</h3>
            <span>This month: {summary.monthlyPercentage}% overall</span>
          </div>
          <div className="attendance-subject-list">
            {summary.subjectAttendance.map((subject) => (
              <div key={subject.subjectId} className="attendance-subject-row">
                <div className="attendance-subject-info">
                  <div>
                    <strong>{subject.subjectName}</strong>
                    <small>{subject.subjectCode} · {subject.totalAttended}/{subject.totalConducted} attended</small>
                  </div>
                  <b style={{ color: subject.percentage < 75 ? '#dc2626' : '#1767c2' }}>{subject.percentage}%</b>
                </div>
                <div className="attendance-progress"><span style={{ width: `${subject.percentage}%`, background: subject.percentage < 75 ? '#ef4444' : undefined }} /></div>
              </div>
            ))}
          </div>
        </section>

      <section className="card attendance-calendar-card">
        <div className="attendance-calendar-header">
          <div>
            <h2>Attendance Overview</h2>
            <span className="attendance-calendar-subtitle">Select a date to view recorded classes</span>
          </div>
          <div className="attendance-month-picker">
            <CalendarDays size={14} />
            <strong>{visibleMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</strong>
            <div className="attendance-month-controls">
              <button className="btn" aria-label="Previous month" onClick={() => changeMonth(-1)}><ChevronLeft size={15} /></button>
              <button className="btn" aria-label="Next month" onClick={() => changeMonth(1)}><ChevronRight size={15} /></button>
            </div>
          </div>
        </div>

        <div className="attendance-calendar-grid">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="attendance-weekday">{day}</div>
          ))}
          {calendarCells.map((day, index) => {
            if (day === null) return <div key={`empty-${index}`} className="attendance-day-empty" />;
            const key = dateKey(new Date(year, month, day));
            const records = recordsByDate.get(key) || [];
            const allPresent = records.length > 0 && records.every((record) => record.status === 'PRESENT');
            const hasPresent = records.some((record) => record.status === 'PRESENT');
            const dayStatus = allPresent ? 'present' : hasPresent ? 'mixed' : records.length ? 'absent' : 'no-record';
            const selected = selectedDate === key;
            return (
              <button
                key={key}
                className={`attendance-day ${dayStatus} ${selected ? 'selected' : ''}`}
                onClick={() => setSelectedDate(key)}
                aria-label={`${key}${records.length ? `, ${records.filter((record) => record.status === 'PRESENT').length} of ${records.length} periods present` : ', no attendance recorded'}`}
                aria-pressed={selected}
              >
                <span className="attendance-day-number">{day}</span>
                {records.length > 0 && (
                  <span className="attendance-day-meta">
                    {records.filter((record) => record.status === 'PRESENT').length}/{records.length} present
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="attendance-legend">
          <span><i className="legend-dot present" /> All present</span>
          <span><i className="legend-dot mixed" /> Mixed</span>
          <span><i className="legend-dot absent" /> No periods present</span>
        </div>
      </section>
      </div>

      <div className="attendance-details-layout">
      <section className="card attendance-date-card">
        <div className="head">
          <div>
            <h2>{selectedDate === dateKey(new Date()) ? "Today's Attendance Details" : 'Detailed Attendance'}</h2>
            <span className="attendance-detail-date">{selectedDateLabel}</span>
          </div>
          <div className="attendance-detail-controls">
            <select aria-label="Filter by subject" value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value)}>
              <option value="ALL">All Subjects</option>
              {summary.subjectAttendance.map((subject) => <option key={subject.subjectCode} value={subject.subjectCode}>{subject.subjectName}</option>)}
            </select>
            <select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="ALL">All Status</option>
              <option value="PRESENT">Present</option>
              <option value="ABSENT">Absent</option>
              <option value="ON_DUTY">On Duty</option>
              <option value="LATE">Late</option>
            </select>
          </div>
        </div>
        {selectedRecords.length === 0 ? (
          <p className="attendance-empty">No attendance has been recorded for this date.</p>
        ) : (
          <div className="tablewrap">
            <table className="attendance-date-table">
              <thead>
                <tr><th>Date</th><th>Day</th><th>Subject</th><th>Period</th><th>Status</th><th>Remarks</th></tr>
              </thead>
              <tbody>
                {visibleRecords.map((record) => (
                  <tr key={record.id}>
                    <td><strong>{selectedDateShort}</strong></td>
                    <td>{selectedDayShort}</td>
                    <td>{record.subjectName} <span className="attendance-course-code">({record.subjectCode})</span></td>
                    <td>Period {record.periodNumber}</td>
                    <td>
                      <span className={`status-badge ${record.status === 'PRESENT' ? 'live' : record.status === 'ABSENT' ? 'due' : 'next'}`}>
                        {record.status === 'PRESENT' && <CheckCircle size={11} />}
                        {record.status}
                      </span>
                    </td>
                    <td className="attendance-remarks">{record.remarks || '—'}</td>
                  </tr>
                ))}
                {visibleRecords.length === 0 && <tr><td colSpan={6} className="attendance-filter-empty">No records match these filters.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <aside className="card attendance-quick-info">
        <h2><Info size={15} /> Quick Info</h2>
        <dl>
          <div><dt>Total Classes</dt><dd>{summary.totalConducted}</dd></div>
          <div><dt>Attended</dt><dd>{summary.totalAttended}</dd></div>
          <div><dt>Missed</dt><dd>{summary.totalMissed}</dd></div>
          <div><dt>On Duty</dt><dd>{onDutyCount}</dd></div>
        </dl>
        <div className="attendance-rules">
          <strong><Info size={12} /> Attendance Rules</strong>
          <ul>
            <li>Minimum 75% attendance is required to be eligible for examinations.</li>
            <li>Contact your class coordinator if a record needs correction.</li>
          </ul>
        </div>
      </aside>
      </div>
    </div>
  );
};
