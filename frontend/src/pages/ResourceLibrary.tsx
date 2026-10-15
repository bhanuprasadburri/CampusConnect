import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Subject } from '../types';
import { ArrowLeft, ArrowRight, BookOpen, ChevronRight, FileQuestion, FileText, Link2, Search } from 'lucide-react';

const libraries: Record<string, { title: string; description: string; query: string; icon: typeof BookOpen }> = {
  'previous-year-questions': { title: 'Previous Year Question Papers', description: 'Find past papers and practice questions organized by subject.', query: 'previous year question papers', icon: FileQuestion },
  'e-books': { title: 'E-Books Library', description: 'Browse recommended digital textbooks and course references.', query: 'e-books textbooks', icon: BookOpen },
  'reference-links': { title: 'Subject Reference Links', description: 'Explore curated reference material for your enrolled subjects.', query: 'reference links', icon: Link2 },
};

export const ResourceLibrary: React.FC = () => {
  const { resourceType = '' } = useParams<{ resourceType: string }>();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const library = libraries[resourceType];
  const Icon = library?.icon ?? FileText;

  useEffect(() => {
    apiClient.getCourses().then(setSubjects).catch((error) => console.error('Failed to load resource library', error)).finally(() => setLoading(false));
  }, []);

  const searchUrl = useMemo(() => (subject: Subject) => `https://drive.google.com/drive/search?q=${encodeURIComponent(`${subject.code} ${subject.name} ${library?.query ?? 'study resources'}`)}`, [library]);

  if (loading) return <div className="subject-materials-loading">Loading resource library...</div>;
  if (!library) return <section className="card subject-materials-not-found"><h1>Resource page not found</h1><p>This resource category is unavailable.</p><Link className="btn primary" to="/courses">Back to Study Materials</Link></section>;

  return <div className="subject-materials-page">
    <div className="materials-breadcrumb"><Link to="/dashboard">Dashboard</Link><ChevronRight size={13} /><Link to="/courses">Study Materials</Link><ChevronRight size={13} /><strong>{library.title}</strong></div>
    <header className="subject-materials-hero">
      <Link className="subject-materials-back" to="/courses" aria-label="Back to study materials"><ArrowLeft size={16} /></Link>
      <div className="subject-materials-book-icon"><Icon size={24} /></div>
      <div className="subject-materials-heading"><span>RESOURCE LIBRARY</span><h1>{library.title}</h1><p>{library.description}</p></div>
    </header>
    <div className="subject-materials-section-title"><div><h2>Browse by subject</h2><p>Select a subject to search its resources in Google Drive.</p></div><span>{subjects.length} subjects</span></div>
    <section className="resource-library-grid">
      {subjects.map((subject) => <article className="card resource-library-card" key={subject.id}>
        <div className="resource-library-icon"><Icon size={18} /></div>
        <div><h3>{subject.name}</h3><p>{subject.code} · Semester {subject.semester} · {subject.credits} credits</p></div>
        <a href={searchUrl(subject)} target="_blank" rel="noreferrer"><Search size={13} />Search Google Drive<ArrowRight size={13} /></a>
      </article>)}
      {subjects.length === 0 && <div className="materials-empty"><BookOpen size={22} /><strong>No subjects found</strong><span>Your enrolled subjects will appear here.</span></div>}
    </section>
  </div>;
};
