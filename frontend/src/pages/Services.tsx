import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../api/client';
import { ServiceRequest } from '../types';
import { useAuth } from '../context/AuthContext';
import { Building2, FileText, FileSpreadsheet, User, BookOpen, Home, MessageSquare, CheckCircle, Clock, Plus, X, ArrowRight, Headphones, ShieldCheck, CalendarDays, Bus, Monitor, HeartPulse, Users, Wrench, Link2, Mail, Phone, ArrowLeft, Check } from 'lucide-react';

const services = [
  { title: 'Certificates', type: 'BONAFIDE', dept: 'Academic Affairs', desc: 'Bonafide, character, fee receipt and other official certificates.', action: 'Apply Now', icon: FileText, color: 'blue' },
  { title: 'Grievances & Complaints', type: 'GRIEVANCE', dept: 'Dean Student Affairs', desc: 'Report an issue and keep track of its resolution.', action: 'Raise Complaint', icon: Headphones, color: 'rose' },
  { title: 'Service Requests', type: 'OTHER', dept: 'Administrative Office', desc: 'Request ID card, hostel support, lab access and more.', action: 'Submit Request', icon: Wrench, color: 'green' },
  { title: 'Student Welfare', type: 'OTHER', dept: 'Student Welfare Office', desc: 'Find information about scholarships and student support.', action: 'View Details', icon: Users, color: 'purple' },
  { title: 'Academic Support', type: 'TRANSCRIPT', dept: 'Examination Section', desc: 'Request transcripts or get academic assistance.', action: 'Explore', icon: BookOpen, color: 'orange' },
  { title: 'Health & Medical', type: 'OTHER', dept: 'Student Health Centre', desc: 'Medical care, insurance and emergency support.', action: 'View Details', icon: HeartPulse, color: 'rose' },
  { title: 'IT Support', type: 'OTHER', dept: 'IT Helpdesk', desc: 'Get help with lab access, software and network issues.', action: 'Get Help', icon: Monitor, color: 'cyan' },
  { title: 'Facilities Booking', type: 'OTHER', dept: 'Campus Administration', desc: 'Request rooms, auditoriums and sports facilities.', action: 'Book Now', icon: CalendarDays, color: 'blue' },
  { title: 'Transport Services', type: 'OTHER', dept: 'Transport Office', desc: 'Check bus routes, passes and transport updates.', action: 'View Routes', icon: Bus, color: 'purple' },
  { title: 'Hostel Services', type: 'HOSTEL', dept: 'Hostel Administration', desc: 'Room allocation, hostel maintenance and outpasses.', action: 'View Details', icon: Home, color: 'green' },
  { title: 'Official Transcripts', type: 'TRANSCRIPT', dept: 'Examination Section', desc: 'Request consolidated semester marks transcripts.', action: 'Request Record', icon: FileSpreadsheet, color: 'blue' },
  { title: 'ID Card Re-issue', type: 'ID_CARD', dept: 'Administrative Office', desc: 'Apply for a replacement institutional student ID.', action: 'Apply Now', icon: User, color: 'orange' },
];
const serviceSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const Services: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try { setRequests(await apiClient.getServiceRequests()); }
    catch (err) { console.error('Failed to load service requests', err); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchRequests(); }, []);

  if (loading) return <div className="page-loading">Loading campus services...</div>;
  const openRequest = (service: typeof services[number]) => navigate(`/services/${serviceSlug(service.title)}`);
  return <div className="portal-page services-page"><div className="services-layout services-no-aside"><main className="services-main"><header className="portal-hero services-hero"><div className="portal-hero-icon"><Building2/></div><div><span className="portal-breadcrumb">Dashboard　›　Campus Services</span><h1>Campus Services</h1><p>Access essential services and facilities for a smooth campus experience.</p></div><div className="hero-art services-art"><Building2/><span>＋</span></div></header>
    <div className="service-shortcuts">{[{title:'Apply for Certificate',desc:'Get your certificates online',service:'Certificates',icon:FileText,color:'blue'},{title:'Complaint / Grievance',desc:'Raise and track a complaint',service:'Grievances & Complaints',icon:MessageSquare,color:'green'},{title:'Service Requests',desc:'Request campus services',service:'Service Requests',icon:Wrench,color:'purple'},{title:'Student Support',desc:'Get help when you need it',service:'Student Welfare',icon:Users,color:'orange'}].map(({title,desc,service,icon:Icon,color}) => <button key={title} className="shortcut-card" onClick={() => navigate(`/services/${serviceSlug(service)}`)}><span className={`service-icon ${color}`}><Icon/></span><strong>{title}</strong><small>{desc}</small></button>)}</div>
    <section className="portal-card service-requests-history"><div className="portal-section-head"><div><span className="section-icon"><FileText/></span><div><h2>My Service Requests</h2><p>Track application status and department responses</p></div></div><button className="solid-button" onClick={() => navigate('/services/new')}><Plus/> New Request</button></div><div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>Service Type</th><th>Department</th><th>Details</th><th>Applied Date</th><th>Status</th><th>Response</th></tr></thead><tbody>{requests.map((r) => <tr key={r.id}><td><strong>{r.requestType.replace(/_/g,' ')}</strong></td><td>{r.department}</td><td className="request-description">{r.description}</td><td>{new Date(r.createdAt).toLocaleDateString()}</td><td><span className={`portal-pill ${r.status === 'RESOLVED' ? 'success' : 'warning'}`}>{r.status === 'RESOLVED' ? <CheckCircle size={13}/> : <Clock size={13}/>} {r.status}</span></td><td>{r.resolutionRemarks || 'Under review'}</td></tr>)}{!requests.length && <tr><td colSpan={6} className="empty-row">No service requests yet. Submit a request to see its progress here.</td></tr>}</tbody></table></div></section>
    </main></div>
  </div>;
};

export const ServiceRequestChooserPage: React.FC = () => {
  const navigate = useNavigate();
  return <div className="portal-page entity-page"><button className="back-link" onClick={() => navigate('/services')}><ArrowLeft/> Back to Campus Services</button><header className="portal-hero"><div className="portal-hero-icon"><FileText/></div><div><span className="portal-breadcrumb">Campus Services　›　New Request</span><h1>Choose a Service</h1><p>Select the service you need. We’ll open its request page next.</p></div></header><div className="service-grid service-chooser-grid">{services.map(({title,desc,icon:Icon,color}) => <button className="service-card service-chooser-card" key={title} onClick={() => navigate(`/services/${serviceSlug(title)}`)}><span className={`service-icon ${color}`}><Icon/></span><div><h3>{title}</h3><p>{desc}</p><span className="service-action">Select service <ArrowRight/></span></div></button>)}</div></div>;
};

export const ServiceDetailPage: React.FC = () => {
  const { serviceId = '' } = useParams();
  const navigate = useNavigate();
  const { showToast } = useAuth();
  const service = services.find((item) => serviceSlug(item.title) === serviceId);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  if (!service) return <section className="portal-card entity-page"><h1>Service not found</h1><button className="solid-button" onClick={() => navigate('/services')}>Back to Campus Services</button></section>;
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); if (!description.trim()) { showToast('Add details so the department can process your request.'); return; }
    setSubmitting(true);
    try { await apiClient.createServiceRequest({ requestType: service.type, department: service.dept, description }); showToast('Service request submitted successfully.'); navigate('/services'); }
    catch (error: any) { showToast(error.response?.data?.message || 'Unable to submit the service request.'); }
    finally { setSubmitting(false); }
  };
  const Icon = service.icon;
  return <div className="portal-page entity-page"><button className="back-link" onClick={() => navigate('/services')}><ArrowLeft/> Back to Campus Services</button><header className="portal-hero"><div className="portal-hero-icon"><Icon/></div><div><span className="portal-breadcrumb">Campus Services　›　Request</span><h1>{service.title}</h1><p>{service.desc}</p></div></header><div className="service-detail-layout"><section className="portal-card service-detail-info"><span className={`service-icon ${service.color}`}><Icon/></span><h2>{service.title}</h2><p>{service.desc}</p><div className="project-detail-field"><small>RESPONSIBLE DEPARTMENT</small><strong>{service.dept}</strong></div><div className="service-request-guidance"><h3>Before you submit</h3><ul><li>Include the purpose and any details the department needs.</li><li>Use the contact details in your student profile if follow-up is required.</li><li>You can track the request status from Campus Services.</li></ul></div></section><form className="portal-card entity-form service-detail-form" onSubmit={submit}><div className="entity-form-heading"><h2>Submit a Request</h2><p>Your request will be sent to {service.dept}.</p></div><label>SELECTED SERVICE<input value={service.title} readOnly/></label><label>DEPARTMENT<input value={service.dept} readOnly/></label><label>REQUEST DETAILS *<textarea required rows={7} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={`Describe your ${service.title.toLowerCase()} request, purpose, and any relevant details.`}/></label><div className="entity-form-actions"><button type="button" className="outline-button" onClick={() => navigate('/services/new')}>Choose another service</button><button type="submit" className="solid-button" disabled={submitting}><Check/>{submitting ? 'Submitting...' : 'Submit Request'}</button></div></form></div></div>;
};
