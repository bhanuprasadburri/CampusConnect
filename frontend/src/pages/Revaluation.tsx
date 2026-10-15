import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarDays, FileCheck2, Info, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Revaluation: React.FC = () => {
  const { showToast } = useAuth();
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [reason, setReason] = useState('');

  const submitApplication = (event: React.FormEvent) => {
    event.preventDefault();
    if (!subject || !reason.trim()) {
      showToast('Select a subject and enter a reason to continue.');
      return;
    }
    showToast('Your revaluation application has been prepared. Submit it through the Examination Cell.');
  };

  return (
    <div className="exam-action-page">
      <header className="exam-action-page-header">
        <button className="exam-back-button" onClick={() => navigate('/examinations')}><ArrowLeft size={15} /> Examinations</button>
        <span className="exam-page-icon"><FileCheck2 size={22} /></span>
        <div><div className="exam-eyebrow"><span />Examination Center</div><h1>Apply for Revaluation</h1><p>Request a review of a published examination result.</p></div>
      </header>
      <div className="exam-revaluation-layout">
        <form className="card exam-revaluation-form" onSubmit={submitApplication}>
          <div className="exam-section-heading"><div><span className="exam-section-icon"><FileCheck2 size={16} /></span><span><h2>Revaluation Application</h2><p>Complete the details below to prepare your request.</p></span></div></div>
          <label htmlFor="revaluation-subject">Subject requiring revaluation</label>
          <select id="revaluation-subject" value={subject} onChange={(event) => setSubject(event.target.value)}>
            <option value="">Select a subject</option>
            <option value="CSE101">CSE101 · Data Structures & Algorithms</option>
            <option value="CSE102">CSE102 · Web Technologies</option>
            <option value="CSE103">CSE103 · Database Management Systems</option>
          </select>
          <label htmlFor="revaluation-reason">Reason for request</label>
          <textarea id="revaluation-reason" rows={5} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Briefly explain why you are requesting a review." />
          <button className="exam-revaluation-submit" type="submit"><Send size={14} /> Prepare Application</button>
          <p className="exam-action-page-note">This demo prepares the application details locally. Final submission and payment are handled by the Examination Cell.</p>
        </form>
        <aside className="card exam-revaluation-info">
          <div className="exam-side-heading"><Info size={16} /><h2>Before you apply</h2></div>
          <div><CalendarDays size={15} /><span><strong>Check the application window</strong><small>Applications are accepted only during the announced period.</small></span></div>
          <div><FileCheck2 size={15} /><span><strong>Choose the correct subject</strong><small>Verify the course code against your published marksheet.</small></span></div>
          <div><Info size={15} /><span><strong>Keep your receipt</strong><small>Save the application reference after official submission.</small></span></div>
        </aside>
      </div>
    </div>
  );
};
