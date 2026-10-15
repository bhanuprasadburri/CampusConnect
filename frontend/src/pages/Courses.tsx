import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Subject } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight, BarChart3, BookOpen, BookText, Bookmark, Braces,
  ChevronDown, ChevronRight, Cpu, Database, Download, FileQuestion, FileText,
  GraduationCap, Link2, Monitor, Play, Search, Settings, Video,
} from 'lucide-react';

type ResourceType = 'ALL' | 'Notes' | 'E-Books' | 'Previous Year Questions' | 'Video Lectures' | 'Reference Links';
type ResourceCounts = { notes: number; books: number; questions: number; videos: number };

const resourceCounts: ResourceCounts[] = [
  { notes: 12, books: 8, questions: 6, videos: 4 },
  { notes: 10, books: 8, questions: 5, videos: 3 },
  { notes: 9, books: 5, questions: 4, videos: 3 },
  { notes: 10, books: 8, questions: 6, videos: 3 },
  { notes: 8, books: 4, questions: 5, videos: 2 },
  { notes: 7, books: 4, questions: 3, videos: 2 },
  { notes: 8, books: 5, questions: 4, videos: 3 },
  { notes: 6, books: 3, questions: 2, videos: 1 },
];
const subjectIcons = [Braces, Cpu, Database, Settings, Monitor, BookText, Braces, BarChart3];
const resourceTypes: ResourceType[] = ['ALL', 'Notes', 'E-Books', 'Previous Year Questions', 'Video Lectures', 'Reference Links'];
const typeLabels: Record<ResourceType, string> = {
  ALL: 'All Resources', Notes: 'Notes', 'E-Books': 'E-Books',
  'Previous Year Questions': 'Previous Year Questions', 'Video Lectures': 'Video Lectures', 'Reference Links': 'Reference Links',
};

export const Courses: React.FC = () => {
  const { showToast } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [resourceType, setResourceType] = useState<ResourceType>('ALL');
  const [semester, setSemester] = useState('ALL');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setCourses(await apiClient.getCourses());
      } catch (err) {
        console.error('Failed to load courses', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const semesters = useMemo(() => [...new Set(courses.map((course) => course.semester))].sort((a, b) => a - b), [courses]);
  const filteredCourses = courses.filter((course) => {
    const searchMatch = `${course.name} ${course.code} ${course.facultyName}`.toLowerCase().includes(search.trim().toLowerCase());
    const semesterMatch = semester === 'ALL' || course.semester === Number(semester);
    return searchMatch && semesterMatch;
  });

  const openResource = (label: string, subject?: Subject) => {
    showToast(subject ? `Opening ${label} for ${subject.name}.` : `Opening ${label}.`);
  };

  const openGoogleDrive = (subject: Subject) => {
    const query = encodeURIComponent(`${subject.code} ${subject.name} study materials`);
    window.location.assign(`https://drive.google.com/drive/search?q=${query}`);
  };

  if (loading) return <div className="materials-loading">Loading study materials...</div>;

  return (
    <div className="materials-page">
      <div className="materials-breadcrumb"><span>Dashboard</span><ChevronRight size={13} /><strong>Study Materials</strong></div>

      <header className="materials-hero">
        <div className="materials-hero-icon"><BookOpen size={25} /></div>
        <div><h1>Study Materials</h1><p>Access notes, e-books, previous year questions and other resources to help you learn and grow.</p></div>
        <div className="materials-hero-art" aria-hidden="true"><BookOpen size={34} /><Monitor size={48} /><span /></div>
      </header>

      <div className="materials-layout">
        <main className="materials-main">
          <section className="card materials-toolbar">
            <div className="materials-tabs" role="tablist" aria-label="Resource categories">
              {resourceTypes.map((type) => <button key={type} role="tab" aria-selected={resourceType === type} className={resourceType === type ? 'active' : ''} onClick={() => setResourceType(type)}>{typeLabels[type]}</button>)}
            </div>
            <div className="materials-filters">
              <label className="materials-search"><Search size={16} /><input aria-label="Search materials" placeholder="Search subject or topic..." value={search} onChange={(event) => setSearch(event.target.value)} /></label>
              <label className="materials-select"><select aria-label="Filter by semester" value={semester} onChange={(event) => setSemester(event.target.value)}><option value="ALL">All Semesters</option>{semesters.map((value) => <option key={value} value={value}>Semester {value}</option>)}</select><ChevronDown size={14} /></label>
              <label className="materials-select"><select aria-label="Filter by resource type" value={resourceType} onChange={(event) => setResourceType(event.target.value as ResourceType)}><option value="ALL">All Types</option>{resourceTypes.slice(1).map((type) => <option key={type} value={type}>{typeLabels[type]}</option>)}</select><ChevronDown size={14} /></label>
            </div>
          </section>

          <div className="materials-section-heading"><div><BookOpen size={17} /><h2>Subjects</h2></div><span>{filteredCourses.length} Subjects</span></div>
          <section className="materials-subject-grid" aria-label="Study materials by subject">
            {filteredCourses.map((course, index) => {
              const counts = resourceCounts[index % resourceCounts.length];
              const SubjectIcon = subjectIcons[index % subjectIcons.length];
              const resourceSummary = [
                { type: 'Notes' as const, count: counts.notes, icon: FileText },
                { type: 'E-Books' as const, count: counts.books, icon: BookOpen },
                { type: 'Previous Year Questions' as const, count: counts.questions, icon: FileQuestion },
                { type: 'Video Lectures' as const, count: counts.videos, icon: Play },
                { type: 'Reference Links' as const, count: 2, icon: Link2 },
              ].filter((item) => resourceType === 'ALL' || item.type === resourceType);
              return <article className="card materials-subject-card" key={course.id}>
                <div className={`materials-subject-icon subject-tone-${index % 8}`}><SubjectIcon size={23} /></div>
                <div className="materials-subject-copy"><h3>{course.name}</h3><p>{course.code}<i />Year {Math.ceil(course.semester / 2)}<i />{course.credits} Credits</p></div>
                <button className="materials-subject-arrow" aria-label={`Open ${course.name} materials page`} onClick={() => navigate(`/courses/${encodeURIComponent(course.id)}`)}><ChevronRight size={16} /></button>
                <div className="materials-resource-meta">{resourceSummary.map(({ type, count, icon: Icon }) => <button key={type} onClick={() => openResource(type.toLowerCase(), course)}><Icon size={12} />{count} {type === 'E-Books' ? 'E-Books' : type === 'Notes' ? 'Notes' : type === 'Previous Year Questions' ? 'PYQs' : type === 'Video Lectures' ? 'Videos' : 'Links'}</button>)}</div>
                <button className="materials-view-button" onClick={() => openGoogleDrive(course)}>View Materials</button>
              </article>;
            })}
            {filteredCourses.length === 0 && <div className="materials-empty"><BookOpen size={23} /><strong>No subjects found</strong><span>Try a different search or semester.</span></div>}
          </section>
        </main>

        <aside className="materials-sidebar">
          <section className="card materials-quick-stats"><div className="materials-side-title"><BarChart3 size={16} /><h2>Quick Stats</h2></div><div className="materials-stat-grid">
            <div className="materials-stat blue"><FileText size={18} /><strong>60</strong><span>Total Resources</span></div>
            <div className="materials-stat green"><BookOpen size={18} /><strong>{courses.length}</strong><span>Subjects</span></div>
            <div className="materials-stat purple"><FileText size={18} /><strong>32</strong><span>Notes</span></div>
            <div className="materials-stat orange"><BookOpen size={18} /><strong>18</strong><span>E-Books</span></div>
          </div></section>

          <section className="card materials-popular"><div className="materials-side-title"><Download size={16} /><h2>Popular Downloads</h2></div>{[
            ['Data Structures Notes (PDF)', 'CSE301', '2.4 MB'],
            ['DBMS Important Questions (PDF)', 'CSE301', '1.8 MB'],
            ['OS Study Material (PDF)', 'CSE303', '2.1 MB'],
            ['Network Topologies (PDF)', 'CSE304', '1.2 MB'],
            ['Python Programming Notes (PDF)', 'CSE306', '2.8 MB'],
          ].map(([title, code, size], index) => <a className="materials-download-row" key={title} href={`https://drive.google.com/drive/search?q=${encodeURIComponent(`${code} ${title}`)}`}><b>{index + 1}</b><span><strong>{title}</strong><small>{code}　·　{size}</small></span><Download size={12} /></a>)}</section>

          <section className="card materials-useful-links"><div className="materials-side-title"><Link2 size={16} /><h2>Useful Links</h2></div>{[
            { label: 'Previous Year Question Papers', icon: FileQuestion, to: '/resources/previous-year-questions' },
            { label: 'NPTEL Video Lectures', icon: Video, href: 'https://nptel.ac.in/courses' },
            { label: 'E-Books Library', icon: BookOpen, to: '/resources/e-books' },
            { label: 'Subject Reference Links', icon: Bookmark, to: '/resources/reference-links' },
          ].map(({ label, icon: Icon, to, href }) => href
            ? <a className="materials-useful-link" href={href} target="_blank" rel="noreferrer" key={label}><span><Icon size={12} /></span>{label}<ArrowRight size={12} /></a>
            : <Link className="materials-useful-link" to={to!} key={label}><span><Icon size={12} /></span>{label}<ArrowRight size={12} /></Link>)}</section>

          <section className="materials-quote-card"><GraduationCap size={27} /><strong>Small steps every day<br />lead to big results.</strong><i /><span aria-hidden="true">🌱</span></section>
        </aside>
      </div>
    </div>
  );
};
