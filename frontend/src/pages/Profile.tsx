import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { ShieldAlert, X } from 'lucide-react';

export const Profile: React.FC = () => {
  const { studentProfile, showToast } = useAuth();
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Correction request state
  const [correctionField, setCorrectionField] = useState('Full Name');
  const [requestedValue, setRequestedValue] = useState('');
  const [reason, setReason] = useState('');

  if (!studentProfile) {
    return <div style={{ padding: '30px' }}>Loading profile...</div>;
  }

  const handleCorrectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestedValue.trim() || !reason.trim()) {
      showToast('Please fill all required correction fields');
      return;
    }
    setLoading(true);
    try {
      await apiClient.submitCorrectionRequest({
        fieldName: correctionField,
        requestedValue,
        reason,
      });
      setIsCorrectionModalOpen(false);
      setRequestedValue('');
      setReason('');
      showToast('Correction request submitted to Department Office for review');
    } catch (err) {
      console.error(err);
      showToast('Failed to submit correction request');
    } finally {
      setLoading(false);
    }
  };

  const initials = `${studentProfile.firstName[0]}${studentProfile.lastName[0]}`;

  return (
    <div className="profile-page">
      <div className="portal-hero">
        <div className="hero-copy">
          <div className="eyebrow">CampusConnect / Student</div>
          <h1>My Profile</h1>
          <p>Review your student records and manage personal contact details.</p>
        </div>
        <button
          className="btn btn-warning"
          onClick={() => setIsCorrectionModalOpen(true)}
        >
          <ShieldAlert size={15} />
          Request Record Correction
        </button>
      </div>

      <div className="profilegrid">
        {/* Left Profile Summary Card */}
        <section className="card profilebox">
          <div className="bigavatar">
            {studentProfile.profilePhotoUrl ? (
              <img src={studentProfile.profilePhotoUrl} alt={`${studentProfile.fullName} profile`} />
            ) : initials}
          </div>
          <h2 className="profile-name">{studentProfile.fullName}</h2>
          <p className="profile-meta">
            {studentProfile.program} · {studentProfile.department}
          </p>
          <p className="profile-meta-sub">
            Year {studentProfile.currentYear} · Section {studentProfile.section}
          </p>

          <div className="profile-verify-box">
            <span className="badge success">Profile 95% Verified</span>
            <div className="progress">
              <span style={{ width: '95%' }}></span>
            </div>
          </div>

          <div className="profile-standing">
            <div className="profile-standing-title">
              Academic Standing
            </div>
            <div className="profile-standing-row">
              <span>CGPA</span>
              <strong className="profile-cgpa">{studentProfile.cgpa}</strong>
            </div>
          </div>
        </section>

        {/* Right Details Card */}
        <section className="card profile-records-card">
          <div className="head">
            <h2>Personal & Academic Records</h2>
          </div>

          <div className="fields profile-fields-grid">
              <div className="field">
                <label>FULL NAME (OFFICIAL)</label>
                <input value={studentProfile.fullName} readOnly style={{ background: '#f1f5f9' }} />
              </div>

              <div className="field">
                <label>INSTITUTIONAL EMAIL</label>
                <input value={studentProfile.email} readOnly style={{ background: '#f1f5f9' }} />
              </div>

              <div className="field">
                <label>ROLL NUMBER</label>
                <input value={studentProfile.rollNo} readOnly style={{ background: '#f1f5f9' }} />
              </div>

              <div className="field">
                <label>REGISTRATION NUMBER</label>
                <input value={studentProfile.regNo} readOnly style={{ background: '#f1f5f9' }} />
              </div>

              <div className="field">
                <label>DEPARTMENT</label>
                <input value={studentProfile.department} readOnly style={{ background: '#f1f5f9' }} />
              </div>

              <div className="field">
                <label>ACADEMIC YEAR & SEMESTER</label>
                <input
                  value={`2025–26 · Semester ${studentProfile.currentSemester}`}
                  readOnly
                  style={{ background: '#f1f5f9' }}
                />
              </div>

              <div className="field">
                <label>STUDENT MOBILE NUMBER</label>
                <input
                  value={studentProfile.phone || ''}
                  readOnly
                  style={{ background: '#f1f5f9' }}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="field">
                <label>PARENT / GUARDIAN NAME</label>
                <input value={studentProfile.guardianName || 'Not recorded'} readOnly style={{ background: '#f1f5f9' }} />
              </div>

              <div className="field">
                <label>GUARDIAN MOBILE NUMBER</label>
                <input
                  value={studentProfile.guardianPhone || ''}
                  readOnly
                  style={{ background: '#f1f5f9' }}
                  placeholder="+91 98765 00000"
                />
              </div>

              <div className="field">
                <label>GUARDIAN EMAIL</label>
                <input
                  value={studentProfile.guardianEmail || ''}
                  readOnly
                  style={{ background: 'var(--surface-sub)' }}
                  placeholder="parent@example.com"
                />
              </div>
            </div>
        </section>
      </div>

      {/* Record Correction Request Modal */}
      {isCorrectionModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Request Official Record Correction</h2>
              <button className="modal-close" onClick={() => setIsCorrectionModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCorrectionSubmit} className="entity-form" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="field">
                <label>FIELD REQUIRING CORRECTION</label>
                <select
                  value={correctionField}
                  onChange={(e) => setCorrectionField(e.target.value)}
                >
                  <option value="Full Name">Full Name</option>
                  <option value="Email">Email</option>
                  <option value="Mobile Number">Mobile Number</option>
                  <option value="Registration Number">Registration Number</option>
                  <option value="Department">Department</option>
                  <option value="Date of Birth">Date of Birth</option>
                  <option value="Parent / Guardian Name">Parent / Guardian Name</option>
                </select>
              </div>

              <div className="field">
                <label>PROPOSED CORRECT VALUE</label>
                <input
                  required
                  placeholder="Enter the correct value as per certificates"
                  value={requestedValue}
                  onChange={(e) => setRequestedValue(e.target.value)}
                />
              </div>

              <div className="field">
                <label>REASON & CERTIFICATE DETAILS</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide justification and 10th / Intermediate certificate reference number..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsCorrectionModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit to Department Office'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
