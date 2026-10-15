import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Project } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight, Award, BookOpen, BriefcaseBusiness, CalendarDays, CheckCircle2, ChevronRight,
  Clock3, Code2, ExternalLink, Github, Globe2, Layers, Lightbulb, Link2, Linkedin, Plus,
  Rocket, Smartphone, Users, UserRoundCheck, X,
} from 'lucide-react';

type ProjectTab = 'PROJECTS' | 'PORTFOLIO';
type PortfolioLinks = { website: string; github: string; linkedin: string };
const defaultPortfolioLinks: PortfolioLinks = { website: '', github: 'https://github.com/bhanuprasadburri', linkedin: '' };

const projectStatusLabel = (status: Project['status']) => ({
  PROPOSED: 'Planned', FACULTY_REVIEW: 'Ongoing', IN_PROGRESS: 'In Progress', SUBMITTED: 'Completed', APPROVED: 'Completed',
}[status]);

const projectProgress = (status: Project['status']) => ({
  PROPOSED: 15, FACULTY_REVIEW: 35, IN_PROGRESS: 60, SUBMITTED: 100, APPROVED: 100,
}[status]);

const statusTone = (status: Project['status']) => ({
  PROPOSED: 'planned', FACULTY_REVIEW: 'ongoing', IN_PROGRESS: 'progress', SUBMITTED: 'completed', APPROVED: 'completed',
}[status]);

export const Projects: React.FC = () => {
  const navigate = useNavigate();
  const { studentProfile, showToast, refreshProfile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tab, setTab] = useState<ProjectTab>('PROJECTS');
  const [title, setTitle] = useState('');
  const [domain, setDomain] = useState('IoT · Web Application');
  const [description, setDescription] = useState('');
  const [guideName, setGuideName] = useState('Prof. R. Kumar');
  const [teamMembers, setTeamMembers] = useState(studentProfile?.fullName || '');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [portfolioLinks, setPortfolioLinks] = useState<PortfolioLinks>(defaultPortfolioLinks);
  const [editingPortfolioLinks, setEditingPortfolioLinks] = useState(false);
  useEffect(() => {
    setPortfolioLinks({
      website: studentProfile?.portfolioUrl ?? '',
      github: studentProfile?.githubUrl ?? defaultPortfolioLinks.github,
      linkedin: studentProfile?.linkedinUrl ?? '',
    });
  }, [studentProfile?.portfolioUrl, studentProfile?.githubUrl, studentProfile?.linkedinUrl]);

  const fetchProjects = async () => {
    try { setProjects(await apiClient.getProjects()); }
    catch (err) { console.error('Failed to load projects', err); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchProjects(); }, []);

  const counts = useMemo(() => ({
    completed: projects.filter((project) => project.status === 'APPROVED' || project.status === 'SUBMITTED').length,
    inProgress: projects.filter((project) => project.status === 'IN_PROGRESS').length,
    planned: projects.filter((project) => project.status === 'PROPOSED').length,
    ongoing: projects.filter((project) => project.status === 'FACULTY_REVIEW').length,
  }), [projects]);
  const total = projects.length;
  const portfolioSkills = [...new Set(projects.flatMap((project) => project.domain.split(/[·,/|]+/).map((skill) => skill.trim()).filter(Boolean)))];
  const studentInitials = studentProfile?.fullName.split(/\s+/).slice(0, 2).map((part) => part[0]).join('') || 'ST';

  const savePortfolioLinks = async () => {
    const normalizedLinks = Object.fromEntries(Object.entries(portfolioLinks).map(([key, value]) => [key, value.trim()])) as PortfolioLinks;
    const urls = Object.values(normalizedLinks).filter(Boolean);
    if (urls.some((value) => { try { const url = new URL(value); return !['http:', 'https:'].includes(url.protocol); } catch { return true; } })) {
      showToast('Enter valid website links that start with https:// or http://.');
      return;
    }
    try {
      await apiClient.updateProfile({ portfolioUrl: normalizedLinks.website, githubUrl: normalizedLinks.github, linkedinUrl: normalizedLinks.linkedin });
      await refreshProfile();
      setPortfolioLinks(normalizedLinks);
      setEditingPortfolioLinks(false);
      showToast('Portfolio links saved to your student profile.');
    } catch (error) { console.error('Failed to save portfolio links', error); showToast('Unable to save portfolio links. Please try again.'); }
  };

  const handleCreateProject = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) { showToast('Project title is required'); return; }
    setSubmitting(true);
    try {
      await apiClient.createProject({ title, domain, description, guideName, teamMembers, githubUrl, demoUrl });
      showToast('Project proposal submitted to Department Committee for review!');
      setIsModalOpen(false); setTitle(''); setDescription(''); setGithubUrl(''); setDemoUrl('');
      await fetchProjects();
    } catch (err) { console.error(err); showToast('Failed to submit project proposal'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="projects-loading">Loading your projects...</div>;

  const renderProjectCard = (project: Project, index: number) => {
    const icon = index % 4 === 0 ? Lightbulb : index % 4 === 1 ? BriefcaseBusiness : index % 4 === 2 ? Code2 : Smartphone;
    const ProjectIcon = icon;
    return <article className="project-showcase-card card" key={project.id}>
      <div className={`project-showcase-icon project-tone-${index % 4}`}><ProjectIcon size={21} /></div>
      <div className="project-showcase-main">
        <div className="project-showcase-title"><h3>{project.title}</h3><span className={`project-status ${statusTone(project.status)}`}>{projectStatusLabel(project.status)}</span></div>
        <p>{project.description || 'Project details and progress will appear here.'}</p>
        <div className="project-facts"><span><Layers size={12} />Tech Stack: {project.domain || 'To be decided'}</span><span><CalendarDays size={12} />Started: {project.createdAt ? new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recently'}</span><span><Users size={12} />Team: {project.teamMembers || 'Individual project'}</span></div>
      </div>
      <div className="project-showcase-footer">
        <button className="project-outline-button" onClick={() => navigate(`/projects/${project.id}`)}>View Details</button>
        {project.status === 'IN_PROGRESS' || project.status === 'FACULTY_REVIEW' ? <div className="project-progress-block"><span>Progress</span><div><i style={{ width: `${projectProgress(project.status)}%` }} /></div><strong>{projectProgress(project.status)}%</strong></div> : <span className={`project-completion ${statusTone(project.status)}`}><CheckCircle2 size={14} />{projectStatusLabel(project.status)}</span>}
        <div className="project-external-links">{project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noreferrer" aria-label="Open GitHub repository"><Github size={14} /></a>}{project.demoUrl && <a href={project.demoUrl} target="_blank" rel="noreferrer" aria-label="Open project demo"><ExternalLink size={14} /></a>}</div>
      </div>
    </article>;
  };

  return <div className="projects-page">
    <div className="projects-breadcrumb"><span>Dashboard</span><ChevronRight size={13} /><strong>Projects &amp; Portfolio</strong></div>
    <header className="projects-hero">
      <div className="projects-hero-icon"><Code2 size={25} /></div>
      <div><h1>Projects &amp; Portfolio</h1><p>View your projects, track progress and showcase your work.</p></div>
      <div className="projects-hero-art"><BookOpen size={38} /><Code2 size={49} /><span /></div>
    </header>

    <div className={`projects-layout ${tab === 'PORTFOLIO' ? 'portfolio-layout' : ''}`}>
      <main className="projects-main">
        <section className="card projects-workspace">
          <div className="projects-tabs" role="tablist" aria-label="Project sections">
            <button role="tab" aria-selected={tab === 'PROJECTS'} className={tab === 'PROJECTS' ? 'active' : ''} onClick={() => setTab('PROJECTS')}><BriefcaseBusiness size={15} />My Projects</button>
            <button role="tab" aria-selected={tab === 'PORTFOLIO'} className={tab === 'PORTFOLIO' ? 'active' : ''} onClick={() => setTab('PORTFOLIO')}><UserRoundCheck size={15} />Portfolio</button>
          </div>
          {tab === 'PROJECTS' ? <div className="projects-tab-content">
            <div className="projects-section-heading"><div className="projects-section-heading-copy"><span><BriefcaseBusiness size={18} /></span><div><h2>My Projects</h2><p>Track your ongoing and completed projects.</p></div></div><button className="btn primary project-new-button" onClick={() => navigate('/projects/new')}><Plus size={15} />New Project</button></div>
            <div className="project-status-summary"><div><strong>{total}</strong><span>Total Projects</span></div><div><strong>{counts.inProgress}</strong><span>In Progress</span></div><div><strong>{counts.completed}</strong><span>Completed</span></div><div><strong>{counts.planned + counts.ongoing}</strong><span>Awaiting Review</span></div></div>
            <div className="project-showcase-grid">{projects.map(renderProjectCard)}{projects.length === 0 && <div className="projects-empty"><Rocket size={25} /><strong>No projects yet</strong><span>Start with a project idea and build your portfolio.</span><button className="btn primary" onClick={() => navigate('/projects/new')}><Plus size={14} />Create Project</button></div>}</div>
          </div> : <div className="projects-tab-content">
            <div className="student-portfolio-heading"><div><span>STUDENT PORTFOLIO</span><h2>Profile &amp; professional links</h2><p>Keep your academic profile and work links ready to share.</p></div><button className="project-outline-button" onClick={() => setEditingPortfolioLinks((editing) => !editing)}><Link2 size={13} />{editingPortfolioLinks ? 'Close Link Editor' : 'Edit Portfolio Links'}</button></div>
            <section className="student-profile-hero"><div className="student-profile-avatar">{studentProfile?.profilePhotoUrl ? <img src={studentProfile.profilePhotoUrl} alt="Student profile" /> : studentInitials}</div><div className="student-profile-main"><h3>{studentProfile?.fullName || 'Student Name'}</h3><p>{studentProfile?.program || 'Program not set'} · {studentProfile?.department || 'Department not set'}</p><div className="student-profile-tags"><span><Award size={12} />CGPA {studentProfile?.cgpa ?? '—'}</span><span><BriefcaseBusiness size={12} />Year {studentProfile?.currentYear ?? '—'}</span><span><BookOpen size={12} />Semester {studentProfile?.currentSemester ?? '—'}</span></div></div><div className="student-profile-roll"><small>ROLL NUMBER</small><strong>{studentProfile?.rollNo || 'Not provided'}</strong></div></section>

            {editingPortfolioLinks && <section className="portfolio-link-editor"><div><h3>Portfolio and social links</h3><p>Add the links you want recruiters and collaborators to see.</p></div><label>PORTFOLIO WEBSITE<input type="url" placeholder="https://your-portfolio.com" value={portfolioLinks.website} onChange={(event) => setPortfolioLinks((links) => ({ ...links, website: event.target.value }))} /></label><label>GITHUB PROFILE<input type="url" placeholder="https://github.com/username" value={portfolioLinks.github} onChange={(event) => setPortfolioLinks((links) => ({ ...links, github: event.target.value }))} /></label><label>LINKEDIN PROFILE<input type="url" placeholder="https://linkedin.com/in/username" value={portfolioLinks.linkedin} onChange={(event) => setPortfolioLinks((links) => ({ ...links, linkedin: event.target.value }))} /></label><div className="portfolio-editor-actions"><button type="button" className="project-outline-button" onClick={() => { setPortfolioLinks({ website: studentProfile?.portfolioUrl ?? '', github: studentProfile?.githubUrl ?? defaultPortfolioLinks.github, linkedin: studentProfile?.linkedinUrl ?? '' }); setEditingPortfolioLinks(false); }}>Cancel</button><button type="button" className="btn primary" onClick={savePortfolioLinks}>Save Links</button></div></section>}

            <div className="student-portfolio-grid"><section className="card student-details-card"><div className="portfolio-block-heading"><span><UserRoundCheck size={16} /></span><div><h3>Student Information</h3><p>Your academic and contact details</p></div></div><dl><div><dt>Full Name</dt><dd>{studentProfile?.fullName || 'Not provided'}</dd></div><div><dt>Email</dt><dd>{studentProfile?.email || 'Not provided'}</dd></div><div><dt>Phone</dt><dd>{studentProfile?.phone || 'Not provided'}</dd></div><div><dt>Roll Number</dt><dd>{studentProfile?.rollNo || 'Not provided'}</dd></div><div><dt>Registration Number</dt><dd>{studentProfile?.regNo || 'Not provided'}</dd></div><div><dt>Department</dt><dd>{studentProfile?.department || 'Not provided'}</dd></div><div><dt>Program</dt><dd>{studentProfile?.program || 'Not provided'}</dd></div><div><dt>Year / Semester</dt><dd>{studentProfile?.currentYear ?? '—'} / {studentProfile?.currentSemester ?? '—'}</dd></div><div><dt>Section</dt><dd>{studentProfile?.section || 'Not provided'}</dd></div><div><dt>CGPA</dt><dd>{studentProfile?.cgpa ?? '—'}</dd></div><div><dt>Institution</dt><dd>{studentProfile?.institutionName || 'Not provided'}</dd></div></dl></section>
              <div className="student-portfolio-side"><section className="card student-social-card"><div className="portfolio-block-heading"><span><Link2 size={16} /></span><div><h3>Portfolio &amp; Social Links</h3><p>Professional profiles and personal site</p></div></div><div className="student-social-links">{portfolioLinks.website && <a href={portfolioLinks.website} target="_blank" rel="noreferrer"><span><Globe2 size={15} /></span><div><small>PORTFOLIO WEBSITE</small><strong>{portfolioLinks.website.replace(/^https?:\/\//, '')}</strong></div><ExternalLink size={13} /></a>}{portfolioLinks.github && <a href={portfolioLinks.github} target="_blank" rel="noreferrer"><span><Github size={15} /></span><div><small>GITHUB</small><strong>{portfolioLinks.github.replace(/^https?:\/\//, '')}</strong></div><ExternalLink size={13} /></a>}{portfolioLinks.linkedin && <a href={portfolioLinks.linkedin} target="_blank" rel="noreferrer"><span><Linkedin size={15} /></span><div><small>LINKEDIN</small><strong>{portfolioLinks.linkedin.replace(/^https?:\/\//, '')}</strong></div><ExternalLink size={13} /></a>}{!portfolioLinks.website && !portfolioLinks.github && !portfolioLinks.linkedin && <p className="portfolio-no-links">Add your portfolio website and social profiles to make this section share-ready.</p>}</div>{!editingPortfolioLinks && <button className="portfolio-add-link" onClick={() => setEditingPortfolioLinks(true)}><Plus size={13} />Add your portfolio website or social link</button>}</section>
              <section className="card student-skills-card"><div className="portfolio-block-heading"><span><Code2 size={16} /></span><div><h3>Skills &amp; Technologies</h3><p>Based on your project work</p></div></div><div className="student-skill-tags">{portfolioSkills.length ? portfolioSkills.map((skill) => <span key={skill}>{skill}</span>) : <small>Add project tech stacks to show your skills here.</small>}</div></section></div></div>

            <section className="student-featured-projects"><div className="projects-section-heading"><div className="projects-section-heading-copy"><span><Rocket size={17} /></span><div><h2>Featured Projects</h2><p>Selected work from your project list.</p></div></div><button className="project-outline-button" onClick={() => setTab('PROJECTS')}>Manage Projects <ArrowRight size={12} /></button></div><div className="project-showcase-grid">{projects.slice(0, 2).map(renderProjectCard)}{projects.length === 0 && <p className="portfolio-no-links">No projects to feature yet. Create a project to start building your portfolio.</p>}</div></section>
          </div>}
        </section>
      </main>

      {tab === 'PROJECTS' && <aside className="projects-rail">
        <section className="card project-overview-card"><div className="project-rail-heading"><span><Award size={16} /></span><h2>Project Overview</h2></div><div className="project-overview-content"><div className="project-donut" style={{ background: `conic-gradient(#13a982 0 ${total ? counts.completed / total * 100 : 0}%, #477df4 ${total ? (counts.completed + counts.inProgress) / total * 100 : 0}%, #a84be0 ${total ? (counts.completed + counts.inProgress + counts.planned) / total * 100 : 0}%, #f39735 0)` }}><div><strong>{total}</strong><span>Total Projects</span></div></div><div className="project-status-legend"><span><i className="done" />Completed <b>{counts.completed}</b></span><span><i className="progress" />In Progress <b>{counts.inProgress}</b></span><span><i className="planned" />Planned <b>{counts.planned}</b></span><span><i className="ongoing" />Ongoing <b>{counts.ongoing}</b></span></div></div></section>

        <section className="card project-activity-card"><div className="project-rail-heading"><span><Clock3 size={16} /></span><h2>Recent Activity</h2><button onClick={() => showToast('Showing the latest activity for your projects.')}>View All</button></div>{projects.slice(0, 4).map((project, index) => <div className="project-activity-row" key={project.id}><i className={`activity-color-${index}`} /><div><strong>{project.status === 'IN_PROGRESS' ? 'Project updated' : project.status === 'APPROVED' || project.status === 'SUBMITTED' ? 'Project submitted' : 'Project added'}</strong><span>{project.title}</span><small>{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Recently'}</small></div></div>)}{projects.length === 0 && <p className="project-activity-empty">Your project activity will appear here.</p>}</section>

        <section className="card project-links-card"><div className="project-rail-heading"><span><Link2 size={16} /></span><h2>Project Resources</h2></div>{[
          ['GitHub', 'https://github.com'], ['Open Source Projects', 'https://github.com/topics'], ['Project Management Guide', 'https://www.atlassian.com/agile/project-management'], ['Developer Documentation', 'https://developer.mozilla.org'],
        ].map(([label, href]) => <a key={label} href={href} target="_blank" rel="noreferrer"><span><ExternalLink size={12} /></span>{label}<ExternalLink size={11} /></a>)}</section>
        <section className="project-quote-card"><Rocket size={24} /><strong>Your ideas can<br />build a better tomorrow.</strong><span>Keep building, keep growing.</span></section>
      </aside>}
    </div>

    {isModalOpen && <div className="modal-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsModalOpen(false); }}><div className="modal projects-modal" role="dialog" aria-modal="true" aria-labelledby="project-proposal-title">
      <div className="modal-header"><h2 id="project-proposal-title">Submit Project Proposal</h2><button className="modal-close" aria-label="Close" onClick={() => setIsModalOpen(false)}><X size={20} /></button></div>
      <form onSubmit={handleCreateProject} className="project-form">
        <div className="field"><label htmlFor="project-title">PROJECT TITLE</label><input id="project-title" required placeholder="e.g. AI-Based Student Analytics Engine" value={title} onChange={(event) => setTitle(event.target.value)} /></div>
        <div className="field"><label htmlFor="project-domain">PROJECT DOMAIN / TECHNOLOGY STACK</label><select id="project-domain" value={domain} onChange={(event) => setDomain(event.target.value)}><option value="IoT · Web Application">IoT &amp; Embedded Systems</option><option value="AI / Machine Learning">AI &amp; Machine Learning</option><option value="Full-Stack Cloud SaaS">Full-Stack Cloud / SaaS</option><option value="Mobile App Development">Mobile App Development</option><option value="Cybersecurity & Blockchain">Cybersecurity &amp; Blockchain</option></select></div>
        <div className="field"><label htmlFor="project-guide">FACULTY GUIDE</label><input id="project-guide" value={guideName} onChange={(event) => setGuideName(event.target.value)} placeholder="Faculty guide name" /></div>
        <div className="field"><label htmlFor="project-team">TEAM MEMBERS</label><input id="project-team" value={teamMembers} onChange={(event) => setTeamMembers(event.target.value)} placeholder="Names and roll numbers" /></div>
        <div className="field"><label htmlFor="project-description">ABSTRACT / PROBLEM STATEMENT</label><textarea id="project-description" rows={3} placeholder="Describe the problem, objectives and proposed solution..." value={description} onChange={(event) => setDescription(event.target.value)} /></div>
        <div className="field"><label htmlFor="project-github">GITHUB REPOSITORY LINK (OPTIONAL)</label><input id="project-github" type="url" placeholder="https://github.com/username/project" value={githubUrl} onChange={(event) => setGithubUrl(event.target.value)} /></div>
        <div className="field"><label htmlFor="project-demo">LIVE DEMO LINK (OPTIONAL)</label><input id="project-demo" type="url" placeholder="https://" value={demoUrl} onChange={(event) => setDemoUrl(event.target.value)} /></div>
        <div className="project-form-actions"><button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Cancel</button><button type="submit" className="btn primary" disabled={submitting}><Layers size={14} />{submitting ? 'Submitting...' : 'Submit Proposal'}</button></div>
      </form>
    </div></div>}
  </div>;
};

export const ProjectEditorPage: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useAuth();
  // `/projects/new` is a static route, so React Router does not populate
  // `projectId` there. Detect the route itself to render the blank create form.
  const creating = location.pathname.replace(/\/$/, '') === '/projects/new' || projectId === 'new';
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(!creating);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [domain, setDomain] = useState('Web Development');
  const [description, setDescription] = useState('');
  const [guideName, setGuideName] = useState('');
  const [teamMembers, setTeamMembers] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [status, setStatus] = useState<Project['status']>('PROPOSED');

  useEffect(() => {
    if (creating) return;
    apiClient.getProjects().then((projects) => {
      const found = projects.find((item) => item.id === projectId) || null;
      setProject(found);
      if (found) { setTitle(found.title); setDomain(found.domain); setDescription(found.description); setGuideName(found.guideName || ''); setTeamMembers(found.teamMembers || ''); setGithubUrl(found.githubUrl || ''); setDemoUrl(found.demoUrl || ''); setStatus(found.status); }
    }).catch((error) => { console.error(error); showToast('Could not load project details.'); }).finally(() => setLoading(false));
  }, [creating, projectId]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !description.trim()) { showToast('Project title and description are required.'); return; }
    setSaving(true);
    try {
      if (creating) await apiClient.createProject({ title, domain, description, guideName, teamMembers, githubUrl, demoUrl });
      else if (projectId) await apiClient.updateProject(projectId, { title, domain, description, guideName, teamMembers, githubUrl, demoUrl, status });
      showToast(creating ? 'Project proposal submitted.' : 'Project details updated.');
      navigate('/projects');
    } catch (error: any) { console.error(error); showToast(error.response?.data?.message || 'Unable to save project.'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="page-loading">Loading project...</div>;
  if (!creating && !project) return <section className="portal-card entity-page"><h1>Project not found</h1><button className="solid-button" onClick={() => navigate('/projects')}>Back to Projects</button></section>;
  return <div className="portal-page entity-page"><button className="back-link" onClick={() => navigate(creating ? '/projects' : `/projects/${projectId}`)}>‹　{creating ? 'Back to Projects' : 'Cancel editing'}</button><header className="portal-hero"><div className="portal-hero-icon"><Code2/></div><div><span className="portal-breadcrumb">Projects &amp; Innovation　›　{creating ? 'New Project' : 'Edit Project'}</span><h1>{creating ? 'Add a New Project' : 'Edit Project Details'}</h1><p>Document your idea, collaborators, technical approach, and project links.</p></div></header><form className="portal-card entity-form" onSubmit={submit}><div className="entity-form-heading"><h2>Project Information</h2><p>Fields marked with * are required.</p></div><div className="entity-form-grid"><label>PROJECT TITLE *<input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Smart Campus Navigation"/></label><label>DOMAIN / TECHNOLOGY STACK *<input required value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="React, Spring Boot, IoT..."/></label><label>FACULTY GUIDE<input value={guideName} onChange={(e) => setGuideName(e.target.value)} placeholder="Faculty guide name"/></label><label>TEAM MEMBERS<input value={teamMembers} onChange={(e) => setTeamMembers(e.target.value)} placeholder="Names and roll numbers"/></label>{!creating && <label>PROJECT STATUS<select value={status} onChange={(e) => setStatus(e.target.value as Project['status'])}><option value="PROPOSED">Proposed</option><option value="FACULTY_REVIEW">Faculty Review</option><option value="IN_PROGRESS">In Progress</option><option value="SUBMITTED">Submitted</option><option value="APPROVED">Approved</option></select></label>}<label className="wide-field">PROBLEM STATEMENT &amp; PROJECT DESCRIPTION *<textarea required rows={7} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the problem, goals, features, methodology and expected impact."/></label><label>GITHUB REPOSITORY<input type="url" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/you/project"/></label><label>LIVE DEMO / DOCUMENTATION<input type="url" value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)} placeholder="https://..."/></label></div><div className="entity-form-actions"><button type="button" className="outline-button" onClick={() => navigate(creating ? '/projects' : `/projects/${projectId}`)}>Cancel</button><button type="submit" className="solid-button" disabled={saving}><CheckCircle2/>{saving ? 'Saving...' : creating ? 'Submit Project' : 'Save Changes'}</button></div></form></div>;
};

export const ProjectDetailsPage: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { apiClient.getProjects().then((items) => setProject(items.find((item) => item.id === projectId) || null)).catch(console.error).finally(() => setLoading(false)); }, [projectId]);
  if (loading) return <div className="page-loading">Loading project details...</div>;
  if (!project) return <section className="portal-card entity-page"><h1>Project not found</h1><button className="solid-button" onClick={() => navigate('/projects')}>Back to Projects</button></section>;
  return <div className="portal-page entity-page"><button className="back-link" onClick={() => navigate('/projects')}>‹　Back to Projects</button><header className="portal-hero"><div className="portal-hero-icon"><Code2/></div><div><span className="portal-breadcrumb">Projects &amp; Innovation　›　Project Details</span><h1>{project.title}</h1><p>Complete project overview, collaborators, progress, and external links.</p></div></header><section className="portal-card project-detail-card"><div className="project-detail-top"><span className={`project-status ${statusTone(project.status)}`}>{projectStatusLabel(project.status)}</span><button className="solid-button" onClick={() => navigate(`/projects/${project.id}/edit`)}><Layers/> Edit Project</button></div><div className="project-detail-grid"><div className="project-detail-field"><small>PROJECT DOMAIN / TECH STACK</small><strong>{project.domain || 'Not specified'}</strong></div><div className="project-detail-field"><small>FACULTY GUIDE</small><strong>{project.guideName || 'Not assigned'}</strong></div><div className="project-detail-field"><small>TEAM MEMBERS</small><strong>{project.teamMembers || 'Individual project'}</strong></div><div className="project-detail-field"><small>STARTED</small><strong>{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Not available'}</strong></div><div className="project-detail-field wide-field"><small>PROJECT OVERVIEW</small><p>{project.description || 'No project description has been added.'}</p></div><div className="project-detail-field"><small>GITHUB REPOSITORY</small>{project.githubUrl ? <a href={project.githubUrl} target="_blank" rel="noreferrer">{project.githubUrl}</a> : <strong>Not added</strong>}</div><div className="project-detail-field"><small>LIVE DEMO / DOCUMENTATION</small>{project.demoUrl ? <a href={project.demoUrl} target="_blank" rel="noreferrer">{project.demoUrl}</a> : <strong>Not added</strong>}</div></div><section className="project-detail-progress"><div><span>Project progress</span><strong>{projectProgress(project.status)}%</strong></div><div><i style={{width:`${projectProgress(project.status)}%`}}/></div></section></section></div>;
};
