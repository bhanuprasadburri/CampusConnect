import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Exam, getUpcomingExams } from '../data/exams';
import { downloadHallTicketPdf } from '../utils/hallTicket';
import {
  ArrowRight, CalendarDays, Check, ChevronRight, Circle,
  ClipboardCheck, Clock3, Download, FileCheck2, FileText, MapPin,
  Megaphone, Percent, TicketCheck, Zap,
} from 'lucide-react';

const formatDate = (date: Date, options: Intl.DateTimeFormatOptions) => date.toLocaleDateString('en-US', options);

export const Examinations: React.FC = () => {
  const { studentProfile, showToast } = useAuth();
  const navigate = useNavigate();
  const [semester, setSemester] = useState(studentProfile?.currentSemester ?? 1);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  const exams = getUpcomingExams();

  const initials = studentProfile?.fullName?.split(' ').map((part) => part[0]).slice(0, 2).join('') || 'ST';

  const downloadHallTicket = () => {
    if (!studentProfile) {
      showToast('Student profile is required to generate your hall ticket.');
      return;
    }
    downloadHallTicketPdf({
      fullName: studentProfile.fullName,
      rollNo: studentProfile.rollNo,
      department: studentProfile.department,
      program: studentProfile.program,
      semester: studentProfile.currentSemester,
    }, exams);
    showToast('Hall ticket downloaded.');
  };

  return (
    <div className="exam-page">
      <header className="exam-page-heading">
          <div className="exam-heading-title">
            <span className="exam-page-icon"><FileCheck2 size={22} /></span>
            <div>
              <div className="exam-eyebrow"><span />CampusConnect <b>/</b> Academics</div>
              <h1>Examinations</h1>
              <p>View your exam schedule, hall tickets, results and other examination details.</p>
            </div>
          </div>
          <div className="exam-heading-profile"><small>Student</small><div className="exam-heading-profile-row"><span className="exam-student-avatar">{initials}</span><div><strong>{studentProfile?.fullName || 'Student Name'}</strong><span>{studentProfile?.program || 'B.Tech'} - {studentProfile?.department || 'CSE'} | Year {studentProfile?.currentYear || 3} - Semester {studentProfile?.currentSemester || semester}</span></div><b><small>Roll No.</small>{studentProfile?.rollNo || 'Not set'}</b></div></div>
      </header>

      <div className="exam-body-grid">
      <main className="exam-main-column">
        <div className="exam-stat-grid">
          <button className="exam-stat-card upcoming" onClick={() => document.getElementById('exam-upcoming')?.scrollIntoView({ behavior: 'smooth' })}>
            <span className="exam-stat-icon"><CalendarDays size={20} /></span><span className="exam-stat-copy"><small>Upcoming Exams</small><strong>{exams.length}</strong><em>View Schedule <ArrowRight size={11} /></em></span>
          </button>
          <button className="exam-stat-card completed" onClick={() => navigate('/academics')}>
            <span className="exam-stat-icon"><Check size={20} /></span><span className="exam-stat-copy"><small>Completed Exams</small><strong>5</strong><em>View Results <ArrowRight size={11} /></em></span>
          </button>
          <button className="exam-stat-card hall" onClick={downloadHallTicket}>
            <span className="exam-stat-icon"><TicketCheck size={20} /></span><span className="exam-stat-copy"><small>Hall Ticket</small><strong>Available</strong><em>Download <ArrowRight size={11} /></em></span>
          </button>
          <button className="exam-stat-card performance" onClick={() => navigate('/academics')}>
            <span className="exam-stat-icon"><Percent size={20} /></span><span className="exam-stat-copy"><small>Overall Performance</small><strong>78.4%</strong><em>View Details <ArrowRight size={11} /></em></span>
          </button>
        </div>

        <section className="card exam-section" id="exam-upcoming">
          <div className="exam-section-heading">
            <div className="exam-upcoming-title"><span className="exam-section-icon"><CalendarDays size={16} /></span><span><h2>Upcoming Examinations</h2><p>Your next exam dates and details</p></span></div>
            <div className="exam-section-actions"><span className="exam-count-pill">{exams.length} upcoming</span><button onClick={() => showToast(`Showing all ${exams.length} examinations for this semester.`)}>View All <ArrowRight size={11} /></button></div>
          </div>
          <div className="exam-upcoming-table">
            <div className="exam-table-head"><span>Date</span><span>Time</span><span>Subject</span><span>Code</span><span>Type</span><span>Status</span><span>Action</span></div>
            {exams.map((exam, index) => (
              <article className="exam-upcoming-row" key={exam.code}>
                <div className={`exam-date-tile color-${index}`}><strong>{formatDate(exam.date, { day: '2-digit' })}</strong><small>{formatDate(exam.date, { month: 'short', year: 'numeric' })}</small></div>
                <div className="exam-time-cell"><strong>{exam.start} - {exam.end}</strong><small>2 Hours</small></div>
                <strong className="exam-subject-name">{exam.subject}</strong><span className="exam-code">{exam.code}</span><span className="exam-type">{exam.type}</span>
                <span className="exam-status upcoming"><Circle size={8} /> Upcoming</span><button className="exam-outline-button" onClick={() => setSelectedExam(exam)}>View Details</button>
              </article>
            ))}
          </div>
        </section>

        <section className="card exam-section exam-schedule-section">
          <div className="exam-section-heading"><div><CalendarDays size={16} /><h2>Exam Schedule</h2></div><span className="exam-academic-year">{exams[0]?.date.getFullYear()} - {(exams[0]?.date.getFullYear() ?? new Date().getFullYear()) + 1}</span></div>
          <div className="exam-semester-tabs" role="tablist" aria-label="Select semester">
            {Array.from({ length: 6 }, (_, index) => index + 1).map((value) => <button key={value} className={semester === value ? 'active' : ''} role="tab" aria-selected={semester === value} onClick={() => setSemester(value)}>Semester {value}</button>)}
          </div>
          <div className="exam-schedule-table">
            <div className="exam-schedule-head"><span>Date</span><span>Time</span><span>Subject</span><span>Code</span><span>Type</span><span>Status</span><span>Action</span></div>
            {exams.map((exam) => <div className="exam-schedule-row" key={exam.code}>
              <strong>{formatDate(exam.date, { day: '2-digit', month: 'short', year: 'numeric' })}</strong><span>{exam.start} - {exam.end}</span><strong className="exam-schedule-subject">{exam.subject}</strong><span>{exam.code}</span><span>{exam.type}</span><span className="exam-status scheduled"><Check size={9} /> Scheduled</span><button className="exam-view-button" onClick={() => setSelectedExam(exam)}>View</button>
            </div>)}
          </div>
        </section>
      </main>

      <aside className="exam-side-column">

        <section className="card exam-quick-actions">
          <div className="exam-side-heading"><Zap size={16} /><h2>Quick Actions</h2></div>
          <div className="exam-action-grid">
            <button className="purple" onClick={downloadHallTicket}><span><Download size={17} /></span>Download<br />Hall Ticket<ArrowRight size={12} /></button>
            <button className="blue" onClick={() => navigate('/examinations/revaluation')}><span><CalendarDays size={17} /></span>Apply for<br />Revaluation<ArrowRight size={12} /></button>
            <button className="green" onClick={() => navigate('/academics')}><span><FileText size={17} /></span>View Results<ArrowRight size={12} /></button>
            <button className="orange" onClick={() => navigate('/examinations/seating')}><span><ClipboardCheck size={17} /></span>Exam Seating<br />Arrangement<ArrowRight size={12} /></button>
          </div>
        </section>

        <section className="card exam-notices">
          <div className="exam-side-heading"><Megaphone size={16} /><h2>Notices & Announcements</h2><button onClick={() => showToast('You are viewing the latest examination notices.')}>View All</button></div>
          {[
            ['Exam schedule released', 'Examination Cell', '2 days ago'],
            ['Hall tickets available for download', 'Examination Cell', '3 days ago'],
            ['Read examination instructions before your exam', 'Examination Cell', '1 week ago'],
            ['Revaluation application window', 'Examination Cell', '1 week ago'],
          ].map(([title, author, age], index) => <button className="exam-notice-row" key={title} onClick={() => showToast(title)}><i className={`notice-dot dot-${index}`} /><span><strong>{title}</strong><small>{author} Â· {age}</small></span><ChevronRight size={13} /></button>)}
        </section>

        <section className="card exam-prep-card">
          <div className="exam-side-heading"><ClipboardCheck size={16} /><h2>Exam Day Checklist</h2></div>
          <p className="exam-prep-intro">A quick reminder before you head to the examination hall.</p>
          <div className="exam-prep-item"><span><Check size={11} /></span><div><strong>Hall ticket</strong><small>Download and bring a printed copy.</small></div></div>
          <div className="exam-prep-item"><span><Check size={11} /></span><div><strong>Student ID</strong><small>Carry your valid college identity card.</small></div></div>
          <div className="exam-prep-item"><span><Clock3 size={11} /></span><div><strong>Arrive early</strong><small>Reach your room 30 minutes before start.</small></div></div>
          <button className="exam-checklist-button" onClick={downloadHallTicket}><Download size={13} /> Get Hall Ticket <ArrowRight size={12} /></button>
        </section>
      </aside>
      </div>

      {selectedExam && <div className="exam-modal-backdrop" onClick={() => setSelectedExam(null)} role="presentation"><section className="card exam-detail-modal" role="dialog" aria-modal="true" aria-labelledby="exam-detail-title" onClick={(event) => event.stopPropagation()}>
        <div className="exam-detail-heading"><span><FileCheck2 size={18} /></span><button aria-label="Close details" onClick={() => setSelectedExam(null)}>x</button></div>
        <h2 id="exam-detail-title">{selectedExam.subject}</h2><p>{selectedExam.code} Â· {selectedExam.type}</p>
        <div className="exam-detail-line"><CalendarDays size={15} />{formatDate(selectedExam.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
        <div className="exam-detail-line"><Clock3 size={15} />{selectedExam.start} - {selectedExam.end}</div>
        <div className="exam-detail-line"><MapPin size={15} />{selectedExam.room}</div>
        <div className="exam-seat-info"><span>Seat number</span><strong>{selectedExam.seat}</strong></div>
        <button className="exam-detail-download" onClick={downloadHallTicket}><Download size={14} />Download Hall Ticket</button>
      </section></div>}
    </div>
  );
};
