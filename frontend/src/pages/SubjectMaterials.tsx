import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Subject } from '../types';
import { ArrowLeft, ArrowRight, BookOpen, BookText, CheckCircle2, ChevronRight, Download, FileQuestion, FileText, Link2, Play, UserRound } from 'lucide-react';

const resourceKinds = [
  { title: 'Lecture Notes', type: 'notes', count: 8, description: 'Topic-wise class notes and revision summaries.', icon: FileText, tone: 'blue' },
  { title: 'E-Books', type: 'ebooks', count: 5, description: 'Recommended textbooks and digital references.', icon: BookOpen, tone: 'green' },
  { title: 'Previous Year Questions', type: 'question papers', count: 4, description: 'Past examination papers and practice questions.', icon: FileQuestion, tone: 'purple' },
  { title: 'Video Lectures', type: 'video lectures', count: 3, description: 'Recorded lectures and topic explainers.', icon: Play, tone: 'orange' },
  { title: 'Reference Links', type: 'reference links', count: 2, description: 'Useful external references for this subject.', icon: Link2, tone: 'teal' },
  { title: 'Study Guides', type: 'study guides', count: 3, description: 'Structured guides for assignments and exams.', icon: BookText, tone: 'pink' },
];

const driveUrl = (subject: Subject, type: string) => {
  const query = encodeURIComponent(`${subject.code} ${subject.name} ${type}`);
  return `https://drive.google.com/drive/search?q=${query}`;
};

export const SubjectMaterials: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.getCourses().then(setSubjects).catch((error) => console.error('Failed to load subject materials', error)).finally(() => setLoading(false));
  }, []);

  const subject = subjects.find((item) => item.id === subjectId || item.code === subjectId);

  if (loading) return <div className="subject-materials-loading">Loading subject materials...</div>;
  if (!subject) return <section className="card subject-materials-not-found"><BookOpen size={28} /><h1>Subject not found</h1><p>This subject is not available in your current course list.</p><button className="btn primary" onClick={() => navigate('/courses')}><ArrowLeft size={14} />Back to Study Materials</button></section>;

  return (
    <div className="subject-materials-page">
      <div className="materials-breadcrumb"><Link to="/dashboard">Dashboard</Link><ChevronRight size={13} /><Link to="/courses">Study Materials</Link><ChevronRight size={13} /><strong>{subject.name}</strong></div>
      <header className="subject-materials-hero">
        <button className="subject-materials-back" onClick={() => navigate('/courses')} aria-label="Back to all subjects"><ArrowLeft size={16} /></button>
        <div className="subject-materials-book-icon"><BookOpen size={24} /></div>
        <div className="subject-materials-heading"><span>SUBJECT RESOURCE CENTER</span><h1>{subject.name}</h1><p>Browse course resources, revision materials and references.</p></div>
        <div className="subject-materials-course-meta"><span>{subject.code}</span><span>Semester {subject.semester}</span><span>{subject.credits} Credits</span></div>
      </header>

      <section className="subject-materials-faculty card"><div><UserRound size={16} /><span>Course faculty</span><strong>{subject.facultyName || 'Faculty to be announced'}</strong></div><span className="subject-materials-live"><CheckCircle2 size={13} />Resources available</span></section>

      <div className="subject-materials-section-title"><div><h2>Resources for this subject</h2><p>Choose a resource category to find materials in Google Drive.</p></div><span>{resourceKinds.reduce((total, item) => total + item.count, 0)} resources</span></div>
      <section className="subject-resource-grid">
        {resourceKinds.map(({ title, type, count, description, icon: Icon, tone }) => <article className="card subject-resource-card" key={type}>
          <div className={`subject-resource-icon ${tone}`}><Icon size={20} /></div>
          <div className="subject-resource-copy"><h3>{title}</h3><p>{description}</p><span>{count} resources</span></div>
          <a className="subject-resource-open" href={driveUrl(subject, type)} target="_blank" rel="noreferrer"><Download size={13} />Open in Drive<ArrowRight size={13} /></a>
        </article>)}
      </section>

      <footer className="subject-materials-footer"><BookOpen size={16} /><p>Need something specific? Search by <strong>{subject.code}</strong> in your college Google Drive.</p><a href={driveUrl(subject, 'all study materials')} target="_blank" rel="noreferrer">Search Drive <ArrowRight size={13} /></a></footer>
    </div>
  );
};
