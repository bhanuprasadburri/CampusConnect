import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../api/client';
import { PlacementDrive, PlacementApplication } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight, Award, BookOpen, BriefcaseBusiness, Building2, Check, CheckCircle2,
  ChevronRight, CircleHelp, Clock3, Code2, ExternalLink, FileText, Link2, Rocket,
  Send, Sparkles, Target, Users,
} from 'lucide-react';

const packageValue = (value: string) => Number(value.match(/[\d.]+/)?.[0] ?? 0);
const packageLabel = (value: number) => value ? `₹ ${value.toFixed(1)} LPA` : '—';
const dateLabel = (value: string) => new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export const Placements: React.FC = () => {
  const navigate = useNavigate();
  const { studentProfile, showToast } = useAuth();
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [applications, setApplications] = useState<PlacementApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingDriveId, setApplyingDriveId] = useState<string | null>(null);

  const fetchPlacements = async () => {
    try {
      const [driveData, applicationData] = await Promise.all([apiClient.getPlacementDrives(), apiClient.getMyPlacementApplications()]);
      setDrives(driveData);
      setApplications(applicationData);
    } catch (err) { console.error('Failed to load placement drives', err); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchPlacements(); }, []);

  const handleApply = async (drive: PlacementDrive) => {
    if (!drive.eligible) { showToast('You do not meet the minimum CGPA or branch criteria for this drive.'); return; }
    navigate(`/placements/apply/${drive.id}`);
  };

  const highestPackage = useMemo(() => Math.max(0, ...drives.map((drive) => packageValue(drive.packageLpa))), [drives]);
  const averagePackage = useMemo(() => drives.length ? drives.reduce((sum, drive) => sum + packageValue(drive.packageLpa), 0) / drives.length : 0, [drives]);
  const eligibleCount = drives.filter((drive) => drive.eligible).length;
  const activeApplicationCount = applications.filter((application) => application.status === 'SHORTLISTED' || application.status === 'INTERVIEW').length;

  if (loading) return <div className="placements-loading">Loading placement opportunities...</div>;

  const resources = [
    { title: 'Resume Building', text: 'Tips, templates and sample resumes.', icon: FileText, tone: 'blue' },
    { title: 'Aptitude Preparation', text: 'Practice sets, formulas and short tricks.', icon: Sparkles, tone: 'purple' },
    { title: 'Interview Preparation', text: 'Common questions and interview tips.', icon: Users, tone: 'green' },
    { title: 'Company Profiles', text: 'Learn about recruiters and their roles.', icon: Building2, tone: 'orange' },
    { title: 'Placement Guidelines', text: 'Rules, process and important dates.', icon: BookOpen, tone: 'pink' },
  ];

  return <div className="placements-page">
    <div className="placements-breadcrumb"><span>Dashboard</span><ChevronRight size={13} /><strong>Placements</strong></div>
    <div className="placements-layout">
      <main className="placements-main">
        <header className="placements-hero"><span className="placements-hero-icon"><BriefcaseBusiness size={23} /></span><div><h1>Placements</h1><p>Your career journey starts here. Explore opportunities, prepare well and get placed!</p></div><div className="placements-hero-art"><BookOpen size={36} /><BriefcaseBusiness size={44} /><span /></div></header>

        <section className="placements-stat-grid">
          <article className="placement-stat blue"><span><Users size={19} /></span><div><small>Active Drives</small><strong>{drives.length}</strong><em>Recruiters hiring</em></div></article>
          <article className="placement-stat green"><span><BriefcaseBusiness size={19} /></span><div><small>Eligible Drives</small><strong>{eligibleCount}</strong><em>Based on your profile</em></div></article>
          <article className="placement-stat purple"><span><Target size={19} /></span><div><small>Highest Package</small><strong>{packageLabel(highestPackage)}</strong><em>Current opportunities</em></div></article>
          <article className="placement-stat orange"><span><Award size={19} /></span><div><small>Average Package</small><strong>{packageLabel(averagePackage)}</strong><em>Across active drives</em></div></article>
        </section>

        <section className="card placement-drives-section">
          <div className="placement-section-header"><div><span><Send size={16} /></span><div><h2>Recent Drive Updates</h2><p>Explore current opportunities and application status.</p></div></div><button onClick={() => document.getElementById('placement-drive-table')?.scrollIntoView({ behavior: 'smooth' })}>View All <ArrowRight size={12} /></button></div>
          <div className="placement-table-scroll" id="placement-drive-table"><table className="placement-table"><thead><tr><th>Company</th><th>Role</th><th>Eligibility</th><th>CTC</th><th>Last Date</th><th>Status</th><th>Action</th></tr></thead><tbody>
            {drives.map((drive, index) => <tr key={drive.id}>
              <td><button className="placement-company placement-company-button" onClick={() => navigate(`/placements/company/${drive.id}`)}><span className={`placement-company-logo company-tone-${index % 6}`}>{drive.companyName.slice(0, 2).toUpperCase()}</span><strong>{drive.companyName}</strong></button></td>
              <td>{drive.jobRole}</td>
              <td><div className="placement-eligibility">B.Tech ({drive.eligibleBranches})</div><small>Min CGPA: {drive.minCgpa}</small></td>
              <td><strong className="placement-package">{drive.packageLpa}</strong></td>
              <td>{dateLabel(drive.deadline)}</td>
              <td><span className={`placement-status ${drive.applied ? 'applied' : drive.eligible ? 'active' : 'upcoming'}`}><i />{drive.applied ? drive.applicationStatus || 'Applied' : drive.eligible ? 'Active' : 'Upcoming'}</span></td>
              <td>{drive.applied ? <button className="placement-applied-button" disabled><Check size={12} />Applied</button> : <button className="placement-apply-button" disabled={!drive.eligible || applyingDriveId === drive.id} onClick={() => handleApply(drive)}><Send size={11} />Apply Now</button>}</td>
            </tr>)}
            {drives.length === 0 && <tr><td colSpan={7} className="placement-empty">No placement drives are available right now.</td></tr>}
          </tbody></table></div>
        </section>

        <section className="card placement-resources-section"><div className="placement-section-header"><div><span><BookOpen size={17} /></span><div><h2>Placement Resources</h2><p>Prepare with practical tools and career guidance.</p></div></div></div><div className="placement-resource-grid">{resources.map(({ title, text, icon: Icon, tone }) => <button className="placement-resource-card" key={title} onClick={() => navigate(`/placements/resources/${encodeURIComponent(title.toLowerCase().replace(/\s+/g, '-'))}`)}><span className={`placement-resource-icon ${tone}`}><Icon size={17} /></span><strong>{title}</strong><small>{text}</small><ArrowRight size={13} /></button>)}</div></section>

        <section className="card placement-applications-section"><div className="placement-section-header"><div><span><Clock3 size={17} /></span><div><h2>My Applications</h2><p>Track the status of your placement applications.</p></div></div></div><div className="placement-table-scroll"><table className="placement-table"><thead><tr><th>Company</th><th>Role</th><th>Package</th><th>Applied On</th><th>Status</th><th>Remarks</th></tr></thead><tbody>{applications.length === 0 ? <tr><td colSpan={6} className="placement-empty">You haven’t submitted any placement applications yet.</td></tr> : applications.map((application) => <tr key={application.id}><td><strong>{application.companyName}</strong></td><td>{application.jobRole}</td><td><strong className="placement-package">{application.packageLpa}</strong></td><td>{dateLabel(application.appliedAt)}</td><td><span className="placement-status active"><i />{application.status}</span></td><td>{application.remarks || 'Under review'}</td></tr>)}</tbody></table></div></section>
      </main>

      <aside className="placements-rail">
        <section className="card placement-highlights"><div className="placement-rail-heading"><span><Award size={16} /></span><h2>Placement Highlights</h2></div><ul><li><CheckCircle2 size={15} />Top Recruiters: {drives.slice(0, 4).map((drive) => drive.companyName).join(', ') || 'New opportunities coming soon'}.</li><li><CheckCircle2 size={15} />Highest Package: {packageLabel(highestPackage)}</li><li><CheckCircle2 size={15} />Average Package: {packageLabel(averagePackage)}</li><li><CheckCircle2 size={15} />{eligibleCount} drives match your current profile.</li><li><CheckCircle2 size={15} />Opportunities across multiple roles and domains.</li></ul><blockquote><span>“</span><strong>Dream. Prepare. Get Placed.</strong><Target size={24} /></blockquote></section>

        <section className="card placement-quick-links"><div className="placement-rail-heading"><span><Link2 size={16} /></span><h2>Quick Links</h2></div>{[
          ['Placement Cell Website', 'https://www.naukri.com/campus'], ['Official Job Portal', 'https://www.linkedin.com/jobs/'], ['Naukri Campus', 'https://www.naukri.com'], ['LinkedIn Jobs', 'https://www.linkedin.com/jobs/'], ['LeetCode Practice', 'https://leetcode.com'],
        ].map(([label, href]) => <a key={label} href={href} target="_blank" rel="noreferrer"><span><ExternalLink size={12} /></span>{label}<ExternalLink size={11} /></a>)}</section>

        <section className="placements-profile-card"><div><Sparkles size={21} /><strong>Stay consistent,<br />keep learning, and<br />create your own opportunities.</strong></div><Rocket size={27} /></section>
      </aside>
    </div>

    <div className="placement-footer-note"><CircleHelp size={14} />Eligibility uses your current branch and CGPA ({studentProfile?.cgpa ?? '—'}). Contact the placement cell if your profile needs an update.<span>{activeApplicationCount} active application{activeApplicationCount === 1 ? '' : 's'}</span></div>
  </div>;
};

const officialCompanySites: Record<string, { url: string; summary: string; focus: string }> = {
  'tcs': { url: 'https://www.tcs.com/who-we-are', summary: 'Tata Consultancy Services is a technology partner serving organizations worldwide.', focus: 'Technology services · Consulting · Digital transformation' },
  'infosys': { url: 'https://www.infosys.com/about.html', summary: 'Infosys is a global digital services and consulting company.', focus: 'Digital services · Consulting · Cloud and AI' },
  'tech mahindra': { url: 'https://www.techmahindra.com/about-us/', summary: 'Tech Mahindra is a global consulting services and systems integration company.', focus: 'IT services · Engineering · Network and digital solutions' },
};

export const PlacementApplyPage: React.FC = () => {
  const { driveId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useAuth();
  const [drive, setDrive] = useState<PlacementDrive | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => { apiClient.getPlacementDrives().then((items) => setDrive(items.find((item) => item.id === driveId) || null)).catch(console.error).finally(() => setLoading(false)); }, [driveId]);
  const submit = async () => {
    if (!drive || !confirmed) return;
    if (!drive.eligible) { showToast('You are not eligible for this placement drive.'); return; }
    setSubmitting(true);
    try { await apiClient.applyForDrive(drive.id); showToast('Your placement application has been submitted.'); navigate('/placements'); }
    catch (error: any) { showToast(error.response?.data?.message || 'Application could not be submitted.'); }
    finally { setSubmitting(false); }
  };
  if (loading) return <div className="page-loading">Loading application details...</div>;
  if (!drive) return <section className="portal-card entity-page"><h1>Placement drive not found</h1><button className="solid-button" onClick={() => navigate('/placements')}>Back to Placements</button></section>;
  return <div className="portal-page entity-page"><button className="back-link" onClick={() => navigate('/placements')}>‹　Back to Placements</button><header className="portal-hero"><div className="portal-hero-icon"><BriefcaseBusiness/></div><div><span className="portal-breadcrumb">Placements &amp; Careers　›　Application</span><h1>Apply for {drive.companyName}</h1><p>Review this role and confirm your application details.</p></div></header><div className="placement-application-layout"><section className="portal-card"><div className="entity-form-heading"><h2>Role Details</h2><p>Use the company profile link to confirm employer information.</p></div><div className="project-detail-grid"><div className="project-detail-field"><small>COMPANY</small><strong>{drive.companyName}</strong></div><div className="project-detail-field"><small>POSITION</small><strong>{drive.jobRole}</strong></div><div className="project-detail-field"><small>PACKAGE</small><strong>{drive.packageLpa}</strong></div><div className="project-detail-field"><small>APPLICATION DEADLINE</small><strong>{dateLabel(drive.deadline)}</strong></div><div className="project-detail-field"><small>ELIGIBLE BRANCHES</small><strong>{drive.eligibleBranches}</strong></div><div className="project-detail-field"><small>MINIMUM CGPA</small><strong>{drive.minCgpa}</strong></div><div className="project-detail-field wide-field"><small>ROLE SUMMARY</small><p>{drive.description || 'Review the company profile for role information.'}</p></div></div></section><section className="portal-card application-submit-card"><span className={`placement-status ${drive.eligible ? 'active' : 'upcoming'}`}><i/>{drive.eligible ? 'Eligible to apply' : 'Not eligible'}</span><h2>Application confirmation</h2><p>Your application will be recorded in the placement portal for this drive.</p><label className="application-consent"><input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)}/><span>I confirm that my student profile and application details are accurate.</span></label><button className="solid-button" disabled={!confirmed || !drive.eligible || submitting || drive.applied} onClick={submit}><Send/>{drive.applied ? 'Already Applied' : submitting ? 'Submitting...' : 'Submit Application'}</button>{!drive.eligible && <small>Eligibility is calculated from your branch and CGPA in the student profile.</small>}</section></div></div>;
};

const resourceContent: Record<string, { title: string; intro: string; sections: { heading: string; body: string; bullets: string[] }[] }> = {
  'resume-building': { title: 'Resume Building', intro: 'Create a clear, role-focused resume that makes your skills and project work easy to review.', sections: [{ heading: 'Resume checklist', body: 'Keep the document concise and tailored to the role you are applying for.', bullets: ['Lead with your education, relevant skills, and strongest projects.', 'Describe your contribution and measurable outcomes for each project.', 'Use consistent dates, headings, and readable formatting.', 'Proofread contact details and links before submitting.'] }, { heading: 'Recommended structure', body: 'Use a simple order that helps recruiters scan your profile.', bullets: ['Contact and portfolio links', 'Education and relevant coursework', 'Technical skills', 'Projects and internships', 'Achievements and certifications'] }] },
  'aptitude-preparation': { title: 'Aptitude Preparation', intro: 'Build accuracy and speed through short, focused practice sessions.', sections: [{ heading: 'Core areas', body: 'Rotate through the common screening categories and review mistakes after each set.', bullets: ['Quantitative aptitude: percentages, ratios, averages, and time-work.', 'Logical reasoning: sequences, arrangements, and deductions.', 'Verbal ability: reading comprehension, grammar, and vocabulary.', 'Track both time per question and accuracy.'] }, { heading: 'Practice routine', body: 'Use timed practice, then revisit the questions you missed.', bullets: ['Start untimed to learn the method.', 'Move to short timed sets.', 'Keep an error log with the corrected approach.', 'Repeat weak topics later in the week.'] }] },
  'interview-preparation': { title: 'Interview Preparation', intro: 'Prepare concise examples that connect your skills to the role requirements.', sections: [{ heading: 'Technical interview', body: 'Explain your reasoning clearly and validate your solution with examples.', bullets: ['Review core language and data structure fundamentals.', 'Practise explaining project architecture and your own contribution.', 'Talk through edge cases before coding.', 'Ask clarifying questions when requirements are unclear.'] }, { heading: 'Behavioral interview', body: 'Use specific examples to show how you work with others and learn.', bullets: ['Prepare examples of a challenge, action, and outcome.', 'Be direct about what you personally delivered.', 'Share how you respond to feedback and setbacks.'] }] },
  'company-profiles': { title: 'Company Profiles', intro: 'Explore the companies currently sharing opportunities with your college.', sections: [{ heading: 'Official employer information', body: 'Open each organization’s official website to review its services, locations, values, and current company information.', bullets: ['Compare the role description with the official careers page.', 'Use only the placement portal link when submitting your application.', 'Verify current job details and deadlines against the active campus drive.'] }] },
  'placement-guidelines': { title: 'Placement Guidelines', intro: 'A practical checklist for participating in campus recruitment.', sections: [{ heading: 'Before applying', body: 'Check each drive carefully and keep your student profile current.', bullets: ['Review branch, CGPA, and other eligibility requirements.', 'Apply before the deadline shown in the portal.', 'Keep your resume and contact information up to date.'] }, { heading: 'During recruitment', body: 'Follow the placement office instructions for every selection stage.', bullets: ['Attend scheduled tests and interviews on time.', 'Use official channels for drive updates.', 'Contact the placement cell if your application status appears incorrect.'] }] },
};

export const PlacementResourcePage: React.FC = () => {
  const { resourceSlug = '' } = useParams();
  const navigate = useNavigate();
  const content = resourceContent[resourceSlug];
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  useEffect(() => { if (resourceSlug === 'company-profiles') apiClient.getPlacementDrives().then(setDrives).catch(console.error); }, [resourceSlug]);
  if (!content) return <section className="portal-card entity-page"><h1>Resource not found</h1><button className="solid-button" onClick={() => navigate('/placements')}>Back to Placements</button></section>;
  return <div className="portal-page entity-page"><button className="back-link" onClick={() => navigate('/placements')}>‹　Back to Placements</button><header className="portal-hero"><div className="portal-hero-icon"><BookOpen/></div><div><span className="portal-breadcrumb">Placements &amp; Careers　›　Resources</span><h1>{content.title}</h1><p>{content.intro}</p></div></header>{resourceSlug === 'company-profiles' && <section className="company-profile-grid">{drives.map((drive) => { const company = officialCompanySites[drive.companyName.toLowerCase()]; return <article className="portal-card company-profile-card" key={drive.id}><span className="placement-company-logo">{drive.companyName.slice(0,2).toUpperCase()}</span><h2>{drive.companyName}</h2><p>{company?.summary || drive.description || 'Review the official company profile and the campus role details.'}</p><small>Current campus role: {drive.jobRole}</small>{company && <a href={company.url} target="_blank" rel="noreferrer">Official company profile <ExternalLink size={14}/></a>}<button className="outline-button" onClick={() => navigate(`/placements/company/${drive.id}`)}>View Drive Profile <ArrowRight/></button></article>; })}</section>}{content.sections.map((section) => <section className="portal-card career-resource-section" key={section.heading}><h2>{section.heading}</h2><p>{section.body}</p><ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul></section>)}</div>;
};

export const CompanyProfilePage: React.FC = () => {
  const { driveId } = useParams();
  const navigate = useNavigate();
  const [drive, setDrive] = useState<PlacementDrive | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { apiClient.getPlacementDrives().then((items) => setDrive(items.find((item) => item.id === driveId) || null)).catch(console.error).finally(() => setLoading(false)); }, [driveId]);
  if (loading) return <div className="page-loading">Loading company profile...</div>;
  if (!drive) return <section className="portal-card entity-page"><h1>Company profile not found</h1><button className="solid-button" onClick={() => navigate('/placements')}>Back to Placements</button></section>;
  const company = officialCompanySites[drive.companyName.toLowerCase()];
  return <div className="portal-page entity-page"><button className="back-link" onClick={() => navigate('/placements')}>‹　Back to Placements</button><header className="portal-hero"><div className="portal-hero-icon"><Building2/></div><div><span className="portal-breadcrumb">Placements &amp; Careers　›　Company Profile</span><h1>{drive.companyName}</h1><p>Official company information and the opportunity shared with your college.</p></div></header><div className="company-detail-layout"><section className="portal-card"><div className="company-profile-brand"><span className="placement-company-logo">{drive.companyName.slice(0,2).toUpperCase()}</span><div><small>OFFICIAL PROFILE</small><h2>{drive.companyName}</h2></div></div><p className="company-summary">{company?.summary || drive.description || 'Please use the employer’s verified official website for company information.'}</p>{company && <><div className="project-detail-field"><small>COMPANY FOCUS</small><strong>{company.focus}</strong></div><a className="solid-button official-company-link" href={company.url} target="_blank" rel="noreferrer">Visit official company profile <ExternalLink/></a></>}</section><section className="portal-card"><div className="entity-form-heading"><h2>Campus Opportunity</h2><p>Details from the active placement drive.</p></div><div className="project-detail-grid"><div className="project-detail-field"><small>POSITION</small><strong>{drive.jobRole}</strong></div><div className="project-detail-field"><small>PACKAGE</small><strong>{drive.packageLpa}</strong></div><div className="project-detail-field"><small>ELIGIBILITY</small><strong>{drive.eligibleBranches} · Minimum CGPA {drive.minCgpa}</strong></div><div className="project-detail-field"><small>DEADLINE</small><strong>{dateLabel(drive.deadline)}</strong></div><div className="project-detail-field wide-field"><small>ROLE DESCRIPTION</small><p>{drive.description || 'See the official employer careers page for role information.'}</p></div></div><button className="solid-button" disabled={!drive.eligible || drive.applied} onClick={() => navigate(`/placements/apply/${drive.id}`)}><Send/>{drive.applied ? 'Already Applied' : drive.eligible ? 'Apply Now' : 'Not Eligible'}</button></section></div></div>;
};
