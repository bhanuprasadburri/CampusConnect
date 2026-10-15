import React, { useEffect, useRef, useState } from 'react';
import { apiClient } from '../api/client';
import { SemesterResult } from '../types';
import { useAuth } from '../context/AuthContext';
import { Award, CheckCircle, Download } from 'lucide-react';

const pdfSafe = (value: string | number) => String(value)
  .replace(/[^\x20-\x7E]/g, '?')
  .replace(/([\\()])/g, '\\$1');

const createMarksheetPdf = (student: { fullName: string; rollNo: string; department: string }, result: SemesterResult) => {
  const commands: string[] = [];
  const text = (x: number, y: number, value: string | number, size = 10, font = 'F1') => {
    commands.push(`BT /${font} ${size} Tf ${x} ${y} Td (${pdfSafe(value)}) Tj ET`);
  };

  text(45, 750, 'CampusConnect', 20, 'F2');
  text(45, 725, 'STUDENT MARKSHEET', 14, 'F2');
  text(45, 695, `Student: ${student.fullName}`);
  text(360, 695, `Roll No: ${student.rollNo}`);
  text(45, 678, `Department: ${student.department}`);
  text(360, 678, `Semester: ${result.semesterName || result.semester}`);
  text(45, 650, `SGPA: ${result.sgpa.toFixed(2)} / 10`);
  text(210, 650, `Credits: ${result.totalCredits}`);
  text(360, 650, `Result: ${result.resultStatus}`);
  commands.push('45 632 m 567 632 l S');

  text(45, 612, 'Course Code', 9, 'F2');
  text(125, 612, 'Subject', 9, 'F2');
  text(325, 612, 'Internal', 9, 'F2');
  text(380, 612, 'External', 9, 'F2');
  text(440, 612, 'Total', 9, 'F2');
  text(490, 612, 'Grade', 9, 'F2');
  text(535, 612, 'Cr.', 9, 'F2');

  result.subjects.forEach((subject, index) => {
    const y = 590 - index * 24;
    text(45, y, subject.subjectCode, 8);
    text(125, y, subject.subjectName.slice(0, 32), 8);
    text(325, y, subject.internalMarks ?? '-', 8);
    text(380, y, subject.externalMarks ?? '-', 8);
    text(440, y, subject.totalMarks, 8);
    text(490, y, subject.grade, 8);
    text(535, y, subject.credits, 8);
  });

  const content = commands.join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 6 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => { pdf += `${String(offset).padStart(10, '0')} 00000 n \n`; });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const url = URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `CampusConnect_Semester_${result.semester}_Marksheet.pdf`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const Academics: React.FC = () => {
  const { studentProfile, showToast } = useAuth();
  const [results, setResults] = useState<SemesterResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const marksheetRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (selectedSemester !== null) {
      marksheetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedSemester]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await apiClient.getAcademicResults();
        setResults(res);
      } catch (err) {
        console.error('Failed to load academic results', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  if (loading) {
    return <div style={{ padding: '30px' }}>Loading academic records...</div>;
  }

  const currentSemData = results.find((r) => r.semester === selectedSemester);

  return (
    <div className="academics-page">
      <div className="portal-hero">
        <div className="hero-copy">
          <div className="eyebrow">CampusConnect / Academics</div>
          <h1>Academic Overview & Results</h1>
          <p>Consolidated view of your semester results, SGPA history, and official marks.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            if (!currentSemData) {
              showToast('Select a semester with View Marksheet first.');
              return;
            }
            createMarksheetPdf({
              fullName: studentProfile?.fullName || 'Student',
              rollNo: studentProfile?.rollNo || '',
              department: studentProfile?.department || '',
            }, currentSemData);
            showToast(`Semester ${currentSemData.semester} marksheet downloaded.`);
          }}
        >
          <Download size={15} />
          Download Transcript
        </button>
      </div>

      {/* CGPA Summary Metrics */}
      <div className="metrics academics-metrics">
        <div className="metric">
          <span className="metric-label">Cumulative GPA (CGPA)</span>
          <strong className="metric-value primary">{studentProfile?.cgpa || '8.45'} / 10.0</strong>
          <small className="metric-sub">Classification: First Class with Distinction</small>
        </div>
        <div className="metric">
          <span className="metric-label">Total Earned Credits</span>
          <strong className="metric-value">88 Credits</strong>
          <small className="metric-sub">Across completed 4 Semesters</small>
        </div>
        <div className="metric">
          <span className="metric-label">Current Standing</span>
          <strong className="metric-value success">0 Active Backlogs</strong>
          <small className="metric-sub">All registered subjects cleared</small>
        </div>
      </div>

      {/* Semester Results Table */}
      <section className="card academics-sem-card">
        <div className="head">
          <h2>Semester Performance History</h2>
        </div>
        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>Semester</th>
                <th>SGPA</th>
                <th>Credits Registered</th>
                <th>Result Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {results.map((sem) => {
                const isSelected = selectedSemester === sem.semester;
                return (
                  <tr
                    key={sem.semester}
                    className={isSelected ? 'row-selected' : ''}
                  >
                    <td><strong>Semester {sem.semester}</strong></td>
                    <td>
                      <strong className="sgpa-highlight">{sem.sgpa.toFixed(2)}</strong>
                    </td>
                    <td>{sem.totalCredits} Credits</td>
                    <td>
                      <span className="badge success">
                        <CheckCircle size={12} />
                        {sem.resultStatus}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className={`table-action ${isSelected ? 'primary' : ''}`}
                        onClick={() => setSelectedSemester(sem.semester)}
                      >
                        {isSelected ? 'Viewing Marksheet' : 'View Marksheet'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Subject Marksheet Details for Selected Semester */}
      {currentSemData && (
        <section className="card marksheet-card" ref={marksheetRef}>
          <div className="head">
            <div>
              <h2>Detailed Marksheet — Semester {currentSemData.semester}</h2>
              <p>Official course breakdown and evaluated grading</p>
            </div>
            <span className="marksheet-sgpa-pill">
              SGPA: <strong>{currentSemData.sgpa.toFixed(2)}</strong>
            </span>
          </div>

          <div className="tablewrap">
            <table>
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Subject Name</th>
                  <th>Internal</th>
                  <th>External</th>
                  <th>Total Marks</th>
                  <th>Grade</th>
                  <th>Credits</th>
                </tr>
              </thead>
              <tbody>
                {currentSemData.subjects.map((sub) => (
                  <tr key={sub.id}>
                    <td><strong className="code-tag">{sub.subjectCode}</strong></td>
                    <td style={{ fontWeight: 600 }}>{sub.subjectName}</td>
                    <td>{sub.internalMarks ?? '—'} / 30</td>
                    <td>{sub.externalMarks ?? '—'} / 70</td>
                    <td><strong>{sub.totalMarks} / 100</strong></td>
                    <td>
                      <span className="badge primary grade-badge">
                        <Award size={12} />
                        {sub.grade}
                      </span>
                    </td>
                    <td>{sub.credits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};
