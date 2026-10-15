import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Clock3, MapPin, TicketCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUpcomingExams } from '../data/exams';

export const ExamSeating: React.FC = () => {
  const { studentProfile } = useAuth();
  const navigate = useNavigate();
  const exams = getUpcomingExams().slice(0, 3);

  return (
    <div className="exam-action-page">
      <header className="exam-action-page-header">
        <button className="exam-back-button" onClick={() => navigate('/examinations')}><ArrowLeft size={15} /> Examinations</button>
        <span className="exam-page-icon"><MapPin size={22} /></span>
        <div><div className="exam-eyebrow"><span />Examination Center</div><h1>Exam Seating Arrangement</h1><p>Your allotted examination rooms and seat numbers.</p></div>
      </header>
      <section className="card exam-candidate-summary">
        <div><small>Candidate</small><strong>{studentProfile?.fullName || 'Student Name'}</strong></div>
        <div><small>Roll Number</small><strong>{studentProfile?.rollNo || 'Not set'}</strong></div>
        <div><small>Program / Section</small><strong>{studentProfile?.program || 'B.Tech'} · {studentProfile?.section || 'CSE'}</strong></div>
      </section>
      <section className="exam-seating-list">
        {exams.map((exam, index) => (
          <article className="card exam-seating-card" key={exam.code}>
            <div className={`exam-seat-subject-icon shade-${index}`}><TicketCheck size={20} /></div>
            <div className="exam-seat-subject"><small>{exam.code} · {exam.type}</small><h2>{exam.subject}</h2><span><CalendarDays size={13} />{exam.date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}<Clock3 size={13} />{exam.start} – {exam.end}</span></div>
            <div className="exam-seat-room"><small>Examination Room</small><strong><MapPin size={14} />{exam.room}</strong></div>
            <div className="exam-seat-number"><small>Seat Number</small><strong>{exam.seat}</strong></div>
          </article>
        ))}
      </section>
      <p className="exam-action-page-note">Please confirm the room and seat assignment on your official hall ticket before the examination.</p>
    </div>
  );
};
