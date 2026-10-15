import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { Attendance } from './pages/Attendance';
import { Timetable } from './pages/Timetable';
import { Academics } from './pages/Academics';
import { Examinations } from './pages/Examinations';
import { ExamSeating } from './pages/ExamSeating';
import { Revaluation } from './pages/Revaluation';
import { Assignments } from './pages/Assignments';
import { Courses } from './pages/Courses';
import { SubjectMaterials } from './pages/SubjectMaterials';
import { ResourceLibrary } from './pages/ResourceLibrary';
import { Projects, ProjectDetailsPage, ProjectEditorPage } from './pages/Projects';
import { Placements, PlacementApplyPage, PlacementResourcePage, CompanyProfilePage } from './pages/Placements';
import { Fees, FeeStandalonePage } from './pages/Fees';
import { Notices, EventDetailsPage, NoticeQuickPage } from './pages/Notices';
import { Services, ServiceDetailPage, ServiceRequestChooserPage } from './pages/Services';
import { Messages } from './pages/Messages';
import { Coding, CodingSubPage } from './pages/Coding';

const CodingWorkspacePage = React.lazy(() =>
  import('./pages/CodingWorkspace').then((module) => ({ default: module.CodingWorkspacePage }))
);
import { ParentPortal } from './pages/ParentPortal';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute allowedRoles={['ROLE_STUDENT']} />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/timetable" element={<Timetable />} />
              <Route path="/academics" element={<Academics />} />
              <Route path="/examinations" element={<Examinations />} />
              <Route path="/examinations/revaluation" element={<Revaluation />} />
              <Route path="/examinations/seating" element={<ExamSeating />} />
              <Route path="/assignments" element={<Assignments />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/resources/:resourceType" element={<ResourceLibrary />} />
              <Route path="/courses/:subjectId" element={<SubjectMaterials />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/new" element={<ProjectEditorPage />} />
              <Route path="/projects/:projectId/edit" element={<ProjectEditorPage />} />
              <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />
              <Route path="/placements" element={<Placements />} />
              <Route path="/placements/apply/:driveId" element={<PlacementApplyPage />} />
              <Route path="/placements/resources/:resourceSlug" element={<PlacementResourcePage />} />
              <Route path="/placements/company/:driveId" element={<CompanyProfilePage />} />
              <Route path="/fees" element={<Fees />} />
              <Route path="/fees/:feePage" element={<FeeStandalonePage />} />
              <Route path="/notices" element={<Notices />} />
              <Route path="/notices/events/:eventId" element={<EventDetailsPage />} />
              <Route path="/notices/:quickPage" element={<NoticeQuickPage />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/new" element={<ServiceRequestChooserPage />} />
              <Route path="/services/:serviceId" element={<ServiceDetailPage />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/coding" element={<Coding />} />
              <Route
                path="/coding/editor"
                element={
                  <React.Suspense fallback={<div className="page-loading">Loading workspace…</div>}>
                    <CodingWorkspacePage />
                  </React.Suspense>
                }
              />
              <Route path="/coding/:pageSlug" element={<CodingSubPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['ROLE_PARENT']} />}>
            <Route element={<Layout />}>
              <Route path="/parent/*" element={<ParentPortal />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
