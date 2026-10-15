import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Notice } from '../types';
import { Bell, CalendarDays, Tag, AlertCircle, FileText, Megaphone, ArrowRight, Download, MapPin, Clock3, Headphones, Image, Users } from 'lucide-react';

const events = [
  { id: 'ai-talk', day: '25', month: 'Oct', year: '2026', title: 'Technical Talk on “Future of AI”', time: '10:00 AM – 12:00 PM', place: 'Seminar Hall', kind: 'Technical', color: 'blue', description: 'An invited technical session exploring current applications and research directions in artificial intelligence. Students can attend the talk and join the Q&A.' },
  { id: 'cultural-fest', day: '27', month: 'Oct', year: '2026', title: 'Cultural Fest · Aagaman', time: '04:00 PM – 09:00 PM', place: 'College Ground', kind: 'Cultural', color: 'rose', description: 'An evening of student performances, music, cultural activities, and campus community events.' },
  { id: 'placement-workshop', day: '30', month: 'Oct', year: '2026', title: 'Placement Readiness Workshop', time: '10:30 AM – 01:00 PM', place: 'Auditorium', kind: 'Career', color: 'green', description: 'A practical workshop covering resume reviews, interview preparation, and campus recruitment readiness.' },
  { id: 'sports-day', day: '03', month: 'Nov', year: '2026', title: 'Annual Sports Day', time: '08:00 AM – 05:00 PM', place: 'Sports Complex', kind: 'Sports', color: 'blue', description: 'A full day of track, field, and team competitions for students across the college.' },
];

export const Notices: React.FC = () => {
  const navigate = useNavigate();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'notices' | 'events'>('notices');

  useEffect(() => {
    apiClient.getNotices().then(setNotices).catch((err) => console.error('Failed to load notices', err)).finally(() => setLoading(false));
  }, []);

  const filteredNotices = useMemo(() => notices.filter((n) => {
    const matchesCat = categoryFilter === 'ALL' || n.category.toUpperCase() === categoryFilter;
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  }), [notices, categoryFilter, search]);

  if (loading) return <div className="page-loading">Loading official notices & events...</div>;
  return <div className="portal-page notices-page">
    <header className="portal-hero notices-hero"><div className="portal-hero-icon"><Megaphone /></div><div><span className="portal-breadcrumb">Dashboard　›　Campus Life</span><h1>Notices & Events</h1><p>Stay updated with the latest college notices, circulars and upcoming events.</p></div><div className="hero-art notices-art"><Megaphone/><FileText/></div></header>
    <div className={`notices-layout ${activeTab === 'notices' ? 'notices-only' : ''}`}><main className="notices-main">
      <nav className="portal-tabs"><button className={activeTab === 'notices' ? 'active' : ''} onClick={() => setActiveTab('notices')}><FileText/> Notices <span>{notices.length}</span></button><button className={activeTab === 'events' ? 'active' : ''} onClick={() => setActiveTab('events')}><CalendarDays/> Events <span>{events.length}</span></button></nav>
      {activeTab === 'notices' ? <section className="portal-card notice-list-card"><div className="portal-section-head"><div><span className="section-icon"><FileText/></span><div><h2>Latest Notices</h2><p>Official updates from college departments</p></div></div><span className="soft-count">{filteredNotices.length} notices</span></div><div className="notice-controls"><input aria-label="Search notices" placeholder="Search notices..." value={search} onChange={(e) => setSearch(e.target.value)}/><select aria-label="Filter notice category" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}><option value="ALL">All Categories</option><option value="ACADEMIC">Academic</option><option value="EXAMINATION">Examination</option><option value="PLACEMENT">Placement</option><option value="GENERAL">General</option></select></div>
        <div className="notice-list">{filteredNotices.map((n) => <article className={`notice-item priority-${n.priority.toLowerCase()}`} key={n.id}><span className={`notice-category ${n.category.toLowerCase()}`}><Tag size={13}/>{n.category}</span><div className="notice-item-main"><h3>{n.title}</h3><p>{n.content}</p><div className="notice-meta"><span><CalendarDays/>{n.formattedDate}</span><span><Users/>By: College Administration</span></div></div><div className="notice-attachment"><span className="pdf-mark"><FileText/></span><div><strong>Official Notice</strong><small>{n.priority} priority</small></div></div></article>)}{!filteredNotices.length && <div className="empty-state"><Bell/><strong>No notices match your search</strong><span>Try another keyword or category.</span></div>}</div>
        <div className="notice-support-strip"><span className="section-icon"><Headphones/></span><div><strong>Questions about a notice?</strong><p>Contact the relevant department or reach out to Student Support.</p></div><button className="solid-button" onClick={() => navigate('/messages')}>Contact Support <ArrowRight/></button></div>
      </section> : <section className="portal-card events-list-card"><div className="portal-section-head"><div><span className="section-icon"><CalendarDays/></span><div><h2>College Events</h2><p>Upcoming activities and important dates</p></div></div></div><div className="event-grid">{events.map((ev) => <article className="event-large" key={ev.id}><div className={`event-date ${ev.color}`}><strong>{ev.day}</strong><span>{ev.month}</span></div><div><span className={`event-kind ${ev.color}`}>{ev.kind}</span><h3>{ev.title}</h3><p><Clock3/>{ev.time}</p><p><MapPin/>{ev.place}</p></div><button className="table-action" onClick={() => navigate(`/notices/events/${ev.id}`)}>Event Details <ArrowRight/></button></article>)}</div></section>}
    </main>{activeTab === 'events' && <aside className="notices-aside"><section className="portal-card upcoming-events"><div className="portal-section-head"><div><span className="section-icon"><CalendarDays/></span><h2>Upcoming Events</h2></div><button className="link-button" onClick={() => document.querySelector('.events-list-card')?.scrollIntoView({ behavior: 'smooth' })}>View All <ArrowRight/></button></div>{events.map((ev) => <button className="upcoming-event upcoming-event-button" key={ev.id} onClick={() => navigate(`/notices/events/${ev.id}`)}><span className={`event-date ${ev.color}`}><strong>{ev.day}</strong><span>{ev.month}</span></span><span><strong>{ev.title}</strong><small>{ev.time} · {ev.place}</small><i className={`event-kind ${ev.color}`}>{ev.kind}</i></span></button>)}</section>
      <section className="events-promo"><div><span className="section-icon"><CalendarDays/></span><h3>Be part of exciting events</h3><p>Make your college life more memorable.</p><button className="solid-button" onClick={() => setActiveTab('events')}>Explore Events <ArrowRight/></button></div><div className="promo-calendar"><CalendarDays/></div></section>
      <section className="portal-card"><div className="portal-section-head"><div><span className="section-icon"><Tag/></span><h2>Quick Links</h2></div></div>{[{icon:CalendarDays,title:'Academic Calendar',path:'/timetable'},{icon:FileText,title:'Exam Circulars',path:'/examinations'},{icon:Image,title:'Event Gallery',path:'/notices/gallery'},{icon:Users,title:'Student Clubs',path:'/notices/clubs'}].map(({icon:Icon,title,path}) => <button className="quick-link-row" key={title} onClick={() => navigate(path)}><span><Icon/></span>{title}<ArrowRight/></button>)}</section>
      <section className="notice-stay-informed"><span><Bell/></span><div><strong>Stay Informed</strong><p>Never miss an important update.</p></div></section>
    </aside>}</div>
  </div>;
};

export const EventDetailsPage: React.FC = () => {
  const { eventId } = useParams(); const navigate = useNavigate(); const event = events.find((item) => item.id === eventId);
  if (!event) return <section className="portal-card entity-page"><h1>Event not found</h1><button className="solid-button" onClick={() => navigate('/notices')}>Back to Notices &amp; Events</button></section>;
  return <div className="portal-page entity-page"><button className="back-link" onClick={() => navigate('/notices')}>‹　Back to Notices &amp; Events</button><header className="portal-hero"><div className="portal-hero-icon"><CalendarDays/></div><div><span className="portal-breadcrumb">Notices &amp; Events　›　Event Details</span><h1>{event.title}</h1><p>{event.kind} event · {event.day} {event.month} {event.year}</p></div></header><div className="event-detail-layout"><section className="portal-card event-detail-main"><span className={`event-kind ${event.color}`}>{event.kind}</span><h2>About this event</h2><p>{event.description}</p><div className="project-detail-grid"><div className="project-detail-field"><small>DATE</small><strong>{event.day} {event.month} {event.year}</strong></div><div className="project-detail-field"><small>TIME</small><strong>{event.time}</strong></div><div className="project-detail-field"><small>VENUE</small><strong>{event.place}</strong></div><div className="project-detail-field"><small>ORGANIZED BY</small><strong>Campus Events Committee</strong></div></div></section><section className="portal-card event-detail-action"><span className="section-icon"><CalendarDays/></span><h2>Plan to attend</h2><p>Check the college announcements for any schedule or venue updates before the event.</p><button className="solid-button" onClick={() => navigate('/notices')}>Browse Notices <ArrowRight/></button></section></div></div>;
};

export const NoticeQuickPage: React.FC = () => {
  const { quickPage = '' } = useParams(); const navigate = useNavigate();
  const isGallery = quickPage === 'gallery';
  const title = isGallery ? 'Campus Event Gallery' : 'Student Clubs';
  const summary = isGallery ? 'Explore highlights and activities from the campus events calendar.' : 'Discover student communities and find events to participate in.';
  return <div className="portal-page entity-page"><button className="back-link" onClick={() => navigate('/notices')}>‹　Back to Notices &amp; Events</button><header className="portal-hero"><div className="portal-hero-icon">{isGallery ? <Image/> : <Users/>}</div><div><span className="portal-breadcrumb">Notices &amp; Events　›　Campus Life</span><h1>{title}</h1><p>{summary}</p></div></header><section className="portal-card"><div className="portal-section-head"><div><span className="section-icon"><CalendarDays/></span><div><h2>{isGallery ? 'Campus Events' : 'Upcoming Club Activities'}</h2><p>Event information available in the college portal</p></div></div></div><div className="event-grid">{events.map((event) => <article className="event-large" key={event.id}><div className={`event-date ${event.color}`}><strong>{event.day}</strong><span>{event.month}</span></div><div><span className={`event-kind ${event.color}`}>{isGallery ? event.kind : 'Open to students'}</span><h3>{event.title}</h3><p><MapPin/>{event.place}</p></div><button className="table-action" onClick={() => navigate(`/notices/events/${event.id}`)}>View Details <ArrowRight/></button></article>)}</div></section></div>;
};
