import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TopbarProps {
  onToggleMenu: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleMenu }) => {
  const { studentProfile, user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const isParent = user?.role === 'ROLE_PARENT';

  const initials = studentProfile
    ? `${studentProfile.firstName[0]}${studentProfile.lastName[0]}`
    : user?.fullName?.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
      || user?.username?.slice(0, 2).toUpperCase() || 'BP';

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return;
      if (isParent) {
        if (q.includes('ward') || q.includes('student') || q.includes('profile')) navigate('/parent/ward');
        else if (q.includes('attend')) navigate('/parent/attendance');
        else if (q.includes('mark')) navigate('/parent/marks');
        else if (q.includes('result') || q.includes('grade')) navigate('/parent/results');
        else if (q.includes('exam')) navigate('/parent/exams');
        else if (q.includes('fee') || q.includes('receipt') || q.includes('payment')) navigate('/parent/fees');
        else if (q.includes('notice')) navigate('/parent/notices');
        else if (q.includes('calendar')) navigate('/parent/calendar');
        else if (q.includes('document')) navigate('/parent/documents');
        else if (q.includes('request') || q.includes('leave')) navigate('/parent/requests');
        else navigate('/parent');
        return;
      }
      if (q.includes('attend')) navigate('/attendance');
      else if (q.includes('time') || q.includes('sched')) navigate('/timetable');
      else if (q.includes('exam') || q.includes('hall')) navigate('/examinations');
      else if (q.includes('assign')) navigate('/assignments');
      else if (q.includes('course') || q.includes('subject')) navigate('/courses');
      else if (q.includes('project')) navigate('/projects');
      else if (q.includes('place') || q.includes('job')) navigate('/placements');
      else if (q.includes('fee') || q.includes('receipt')) navigate('/fees');
      else if (q.includes('notice') || q.includes('event')) navigate('/notices');
      else if (q.includes('profile')) navigate('/profile');
      else if (q.includes('service') || q.includes('library')) navigate('/services');
      else navigate('/');
    }
  };

  return (
    <header className="topbar">
      <button className="menu-btn" onClick={onToggleMenu} aria-label="Toggle sidebar" title="Toggle sidebar">
        <Menu size={20} />
      </button>

      <div className="search">
        <Search size={16} />
        <input
          placeholder="Search courses, exams, assignments, notices, fees..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>

      <div className="topbar-actions">
        <button
          className="btn"
          onClick={() => navigate(isParent ? '/parent/notifications' : '/notices')}
          title="Notices & Notifications"
        >
          <Bell size={15} />
        </button>

        <div className="date-pill">
          <CalendarIcon size={14} color="#1677f2" />
          <span>{todayStr}</span>
        </div>

        <button
          className="avatar-btn"
          onClick={() => navigate(isParent ? '/parent/settings' : '/profile')}
          title={isParent ? 'Parent Settings' : 'My Profile'}
        >
          {studentProfile?.profilePhotoUrl ? (
            <img src={studentProfile.profilePhotoUrl} alt={`${studentProfile.fullName} profile`} />
          ) : initials}
        </button>
      </div>
    </header>
  );
};
