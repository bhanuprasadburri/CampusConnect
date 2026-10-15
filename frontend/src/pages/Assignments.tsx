import React, { useEffect, useMemo, useState } from 'react';
import { apiClient } from '../api/client';
import { Assignment } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight, BookOpen, Braces, CalendarDays, Check, CheckCircle2, CheckSquare,
  ChevronLeft, ChevronRight, CircleAlert, Clock3, Code2, Database, ExternalLink,
  FileText, Laptop, Lightbulb, Monitor, Network, Rocket, Search, Settings, UploadCloud, X,
} from 'lucide-react';

type AssignmentStatus = 'PENDING' | 'SUBMITTED' | 'OVERDUE' | 'GRADED';
type AssignmentTab = 'ALL' | 'SUBMITTED' | 'PENDING';
const pageSize = 7;

const getAssignmentStatus = (assignment: Assignment, today: Date): Exclude<AssignmentStatus, 'ALL'> => {
  if (assignment.submissionStatus === 'GRADED') return 'GRADED';
  if (assignment.submitted) return 'SUBMITTED';
  const due = new Date(assignment.dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today ? 'OVERDUE' : 'PENDING';
};

const getAssignmentType = (assignment: Assignment) => {
  const text = `${assignment.title} ${assignment.description}`.toLowerCase();
  if (/lab|sql|database/.test(text)) return 'Lab';
  if (/project|website|application/.test(text)) return 'Project';
  if (/report|diagram/.test(text)) return 'Report';
  if (/code|program|algorithm|sorting|search/.test(text)) return 'Programming';
  return 'Theory';
};

const formatDate = (dateValue: string) => new Date(dateValue).toLocaleDateString('en-GB', {
  day: '2-digit', month: 'short', year: 'numeric',
});

const getDueNote = (dateValue: string, today: Date) => {
  const due = new Date(dateValue);
  due.setHours(0, 0, 0, 0);
  const days = Math.round((due.getTime() - today.getTime()) / 86_400_000);
  if (days < 0) return `${Math.abs(days)} day${days === -1 ? '' : 's'} overdue`;
  if (days === 0) return 'Due today';
  return `${days} day${days === 1 ? '' : 's'} left`;
};

export const Assignments: React.FC = () => {
  const { showToast } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [fileUrl, setFileUrl] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [assignmentTab, setAssignmentTab] = useState<AssignmentTab>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchAssignments = async () => {
    try {
      setAssignments(await apiClient.getAssignments());
    } catch (err) {
      console.error('Failed to load assignments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssignments(); }, []);

  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);
  const statusFor = (assignment: Assignment) => getAssignmentStatus(assignment, today);
  const submittedCount = assignments.filter((assignment) => statusFor(assignment) === 'SUBMITTED' || statusFor(assignment) === 'GRADED').length;
  const overdueCount = assignments.filter((assignment) => statusFor(assignment) === 'OVERDUE').length;
  const pendingCount = assignments.filter((assignment) => statusFor(assignment) === 'PENDING').length;

  const sortedAssignments = [...assignments].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const displayedAssignments = sortedAssignments
    .filter((assignment) => assignmentTab === 'ALL'
      || (assignmentTab === 'SUBMITTED' && (statusFor(assignment) === 'SUBMITTED' || statusFor(assignment) === 'GRADED'))
      || (assignmentTab === 'PENDING' && (statusFor(assignment) === 'PENDING' || statusFor(assignment) === 'OVERDUE')))
    .filter((assignment) => `${assignment.title} ${assignment.subjectName} ${assignment.subjectCode} ${assignment.description}`.toLowerCase().includes(search.trim().toLowerCase()));
  const pageCount = Math.max(1, Math.ceil(displayedAssignments.length / pageSize));
  const visibleAssignments = displayedAssignments.slice((page - 1) * pageSize, page * pageSize);
  const openDeadlines = assignments
    .filter((assignment) => statusFor(assignment) === 'PENDING' || statusFor(assignment) === 'OVERDUE')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const upcomingDeadlines = openDeadlines.filter((assignment) => statusFor(assignment) === 'PENDING'
    && new Date(assignment.dueDate).getTime() - today.getTime() <= 7 * 86_400_000).slice(0, 2);
  const showDeadlineAssignment = (assignment: Assignment) => {
    setAssignmentTab('ALL');
    setSearch('');
    const index = sortedAssignments.findIndex((item) => item.id === assignment.id);
    setPage(Math.floor(index / pageSize) + 1);
    window.setTimeout(() => document.getElementById(`assignment-${assignment.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
  };

  const handleSubmitAssignment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedAssignment || !fileUrl.trim()) {
      showToast('Please provide a submission link or file URL.');
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.submitAssignment(selectedAssignment.id, { fileUrl, remarks });
      showToast(`Assignment "${selectedAssignment.title}" submitted successfully.`);
      setSelectedAssignment(null);
      setFileUrl('');
      setRemarks('');
      await fetchAssignments();
    } catch (err) {
      console.error('Failed to submit assignment', err);
      showToast('Failed to submit assignment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="assignment-loading">Loading assignments…</div>;

  return (
    <div className="assignments-page">
      <header className="assignment-hero">
        <div className="assignment-hero-copy">
          <div className="assignment-hero-icon"><FileText size={23} /></div>
        <div><div className="assignment-eyebrow">Dashboard　›　Assignments</div><h1>Assignments</h1><p>View, download and submit your assignments here.</p></div>
        </div>
        <div className="assignment-hero-art" aria-hidden="true"><BookOpen className="assignment-art-book" size={48} /><Laptop className="assignment-art-laptop" size={76} /><span /></div>
      </header>

      <div className="assignment-stats">
        <div className="assignment-stat total"><span className="assignment-stat-icon"><FileText size={19} /></span><span><small>Total Assignments</small><strong>{assignments.length}</strong><em>This Semester</em></span></div>
        <div className="assignment-stat submitted"><span className="assignment-stat-icon"><Check size={19} /></span><span><small>Submitted</small><strong>{submittedCount}</strong><em>{assignments.length ? Math.round(submittedCount / assignments.length * 100) : 0}% Completed</em></span></div>
        <div className="assignment-stat pending"><span className="assignment-stat-icon"><Clock3 size={19} /></span><span><small>Pending</small><strong>{pendingCount}</strong><em>{assignments.length ? Math.round(pendingCount / assignments.length * 100) : 0}% Remaining</em></span></div>
        <div className="assignment-stat overdue"><span className="assignment-stat-icon"><CalendarDays size={19} /></span><span><small>Upcoming Deadlines</small><strong>{upcomingDeadlines.length}</strong><em>Next 7 Days</em></span></div>
      </div>

      <div className="assignment-content-grid">
        <section className="card assignment-list-card" id="assignment-list">
          <div className="assignment-list-heading">
            <div className="assignment-tabs" role="tablist" aria-label="Assignment status">
              {([['ALL', 'All Assignments'], ['SUBMITTED', 'Submitted'], ['PENDING', 'Pending']] as const).map(([tab, label]) => <button key={tab} role="tab" aria-selected={assignmentTab === tab} className={assignmentTab === tab ? 'active' : ''} onClick={() => { setAssignmentTab(tab); setPage(1); }}>{label}</button>)}
            </div>
            <label className="assignment-search"><Search size={14} /><input aria-label="Search assignments" placeholder="Search assignments..." value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></label>
          </div>
          <div className="assignment-card-list">
              {visibleAssignments.map((assignment, index) => {
                const status = statusFor(assignment);
                const submitted = assignment.submitted;
                const icons = [Code2, Database, Braces, Monitor, Settings, Network];
                const AssignmentIcon = icons[index % icons.length];
                return <article className="assignment-item" id={`assignment-${assignment.id}`} key={assignment.id}>
                  <span className={`assignment-item-icon tone-${index % 6}`}><AssignmentIcon size={20} /></span>
                  <div className="assignment-item-copy">
                    <strong>{assignment.title}</strong><span>{assignment.subjectName} ({assignment.subjectCode})</span>
                    <p>{assignment.description}</p>
                    <div className="assignment-item-meta"><span><CalendarDays size={11} />Due: {formatDate(assignment.dueDate)}</span><span><CheckCircle2 size={11} />Marks: {assignment.maxMarks ?? 10}</span><span><FileText size={11} />{assignment.submissionFileUrl ? '1 File' : 'No files'}</span></div>
                  </div>
                  <div className="assignment-item-action"><span className={`assignment-status ${status.toLowerCase()}`}><i />{status === 'PENDING' ? 'Pending' : status === 'OVERDUE' ? 'Late' : 'Submitted'}</span>
                    {submitted && assignment.submissionFileUrl ? <a className="assignment-action-button" href={assignment.submissionFileUrl} target="_blank" rel="noreferrer"><ExternalLink size={12} />View Submission</a> : <button className={`assignment-action-button ${status === 'OVERDUE' ? 'submit-overdue' : ''}`} onClick={() => setSelectedAssignment(assignment)}><UploadCloud size={12} />Submit Now</button>}
                  </div>
                  <ChevronRight className="assignment-item-chevron" size={16} />
                </article>;
              })}
              {visibleAssignments.length === 0 && <div className="assignment-empty-state"><BookOpen size={20} /><strong>No assignments available</strong><span>Your assignments will appear here.</span></div>}
          </div>
          <footer className="assignment-table-footer"><span>Showing {displayedAssignments.length ? (page - 1) * pageSize + 1 : 0} - {Math.min(page * pageSize, displayedAssignments.length)} of {displayedAssignments.length} assignments</span><div><button aria-label="Previous page" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}><ChevronLeft size={14} /></button><strong>{page}</strong><button aria-label="Next page" disabled={page >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}><ChevronRight size={14} /></button></div></footer>
        </section>

        <aside className="assignment-side-column">

          <section className="card assignment-status-card">
            <div className="assignment-side-heading"><h2>Assignment Status</h2></div>
            <div className="assignment-status-overview"><div className="assignment-donut" style={{ background: `conic-gradient(#12ad87 0 ${assignments.length ? submittedCount / assignments.length * 100 : 0}%, #e9eff8 ${assignments.length ? submittedCount / assignments.length * 100 : 0}% 100%)` }}><div><strong>{submittedCount}/{assignments.length}</strong><span>Submitted</span></div></div><div className="assignment-status-legend"><span><i className="submitted-dot" />Submitted <strong>{submittedCount}</strong></span><span><i className="pending-dot" />Pending <strong>{pendingCount}</strong></span><span><i className="late-dot" />Late <strong>{overdueCount}</strong></span></div></div>
          </section>

          <section className="card assignment-deadlines-card">
            <div className="assignment-side-heading"><Clock3 size={15} /><h2>Upcoming Deadlines</h2><button onClick={() => { setAssignmentTab('ALL'); setSearch(''); setPage(1); document.getElementById('assignment-list')?.scrollIntoView({ behavior: 'smooth' }); }}>View All</button></div>
            {upcomingDeadlines.length === 0 ? <p className="assignment-no-deadlines">You are all caught up. No pending deadlines.</p> : upcomingDeadlines.map((assignment, index) => {
              const status = statusFor(assignment);
              return <button className="assignment-deadline-row" key={assignment.id} onClick={() => showDeadlineAssignment(assignment)}>
                <i className={`deadline-dot dot-${index} ${status === 'OVERDUE' ? 'overdue' : ''}`} /><span><strong>{assignment.subjectName} <small>- {assignment.title}</small></strong><em className={status === 'OVERDUE' ? 'overdue' : ''}>{formatDate(assignment.dueDate)} ({getDueNote(assignment.dueDate, today)})</em></span><ChevronRight size={12} />
              </button>;
            })}
            <button className="assignment-deadlines-link" onClick={() => document.getElementById('assignment-list')?.scrollIntoView({ behavior: 'smooth' })}>View All <ArrowRight size={11} /></button>
          </section>

          <section className="card assignment-guidelines"><div className="assignment-side-heading"><CircleAlert size={15} /><h2>Assignment Guidelines</h2></div><ul><li>Submit assignments in the given format (PDF / DOC).</li><li>Late submissions may attract penalty marks.</li><li>Ensure the file name follows RollNo_Subject_Assignment.</li><li>For any issues, contact your faculty or class coordinator.</li></ul></section>

          <section className="assignment-tip-card"><span><Lightbulb size={21} /></span><p>Small steps every day<br /><strong>lead to big results.</strong></p><Rocket size={24} /></section>
        </aside>
      </div>

      {selectedAssignment && <div className="modal-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedAssignment(null); }}>
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="assignment-submit-title">
          <div className="modal-header"><h2 id="assignment-submit-title">Submit Assignment</h2><button className="modal-close" aria-label="Close" onClick={() => setSelectedAssignment(null)}><X size={20} /></button></div>
          <p className="assignment-modal-summary"><strong>{selectedAssignment.title}</strong><br />{selectedAssignment.subjectName} · Due {formatDate(selectedAssignment.dueDate)}</p>
          <form onSubmit={handleSubmitAssignment} className="assignment-submit-form">
            <div className="field"><label htmlFor="assignment-url">SUBMISSION URL / GITHUB REPOSITORY / DRIVE LINK</label><input id="assignment-url" type="url" required placeholder="https://github.com/username/project" value={fileUrl} onChange={(event) => setFileUrl(event.target.value)} /></div>
            <div className="field"><label htmlFor="assignment-remarks">SUBMISSION REMARKS / NOTES FOR FACULTY</label><textarea id="assignment-remarks" rows={3} placeholder="Briefly describe your solution or add a note..." value={remarks} onChange={(event) => setRemarks(event.target.value)} /></div>
            <div className="assignment-modal-actions"><button type="button" className="btn" onClick={() => setSelectedAssignment(null)}>Cancel</button><button type="submit" className="btn primary" disabled={submitting}><UploadCloud size={14} />{submitting ? 'Submitting...' : 'Confirm Submission'}</button></div>
          </form>
        </div>
      </div>}
    </div>
  );
};
