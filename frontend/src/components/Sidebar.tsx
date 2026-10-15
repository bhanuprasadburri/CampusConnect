import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  User,
  GraduationCap,
  CalendarCheck,
  Calendar,
  FileSpreadsheet,
  CheckSquare,
  BookOpen,
  Code,
  Layers,
  Briefcase,
  CreditCard,
  Bell,
  HelpCircle,
  LogOut,
  Building2,
  Users,
  ClipboardList,
  Wallet,
  Receipt,
  FileText,
  CalendarDays,
  FolderOpen,
  Settings,
  BarChart3,
  X,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const isParent = user?.role === 'ROLE_PARENT';

  const studentNavItems = [
    { to: '/', label: 'Dashboard', icon: Home },
    { to: '/profile', label: 'My Profile', icon: User },
    { to: '/academics', label: 'Academic Overview', icon: GraduationCap },
    { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
    { to: '/timetable', label: 'Timetable', icon: Calendar },
    { to: '/examinations', label: 'Examinations', icon: FileSpreadsheet },
    { to: '/assignments', label: 'Assignments', icon: CheckSquare },
    { to: '/courses', label: 'Study Materials', icon: BookOpen },
    { to: '/projects', label: 'Projects & Innovation', icon: Layers },
    { to: '/placements', label: 'Placements & Careers', icon: Briefcase },
    { to: '/fees', label: 'Fee Payments', icon: CreditCard },
    { to: '/notices', label: 'Notices & Events', icon: Bell },
    { to: '/services', label: 'Campus Services', icon: Building2 },
    { to: '/coding', label: 'Coding Practice', icon: Code },
    { to: '/messages', label: 'Messages & Helpdesk', icon: HelpCircle },
  ];
  const parentNavItems = [
    { to: '/parent', label: 'Dashboard', icon: Home },
    { group: 'My Ward' },
    { to: '/parent/ward', label: 'Student Profile', icon: User },
    { to: '/parent/switch-ward', label: 'Switch Ward', icon: Users },
    { group: 'Academics' },
    { to: '/parent/attendance', label: 'Attendance', icon: CalendarCheck },
    { to: '/parent/marks', label: 'Internal Marks', icon: BarChart3 },
    { to: '/parent/results', label: 'Results & Grade Cards', icon: FileText },
    { group: 'Examinations' },
    { to: '/parent/exams', label: 'Exam Schedule', icon: Calendar },
    { group: 'Fees & Payments' },
    { to: '/parent/fees', label: 'Fee Details', icon: Wallet },
    { to: '/parent/pay-fees', label: 'Pay Fees', icon: CreditCard },
    { to: '/parent/payments', label: 'Payment History', icon: Receipt },
    { to: '/parent/notices', label: 'Notices', icon: Bell },
    { to: '/parent/notifications', label: 'Notifications', icon: HelpCircle },
    { to: '/parent/calendar', label: 'Academic Calendar', icon: CalendarDays },
    { to: '/parent/documents', label: 'Documents', icon: FolderOpen },
    { group: 'Requests' },
    { to: '/parent/requests', label: 'Leave / Applications', icon: ClipboardList },
    { to: '/parent/settings', label: 'Settings', icon: Settings },
  ];
  const navItems = isParent ? parentNavItems : studentNavItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`} id="sidebar">
      <div className="brand">
        <div className="brand-left">
          <div className="brand-symbol" title="CampusConnect">
            <GraduationCap size={22} aria-hidden="true" />
          </div>
          {!isCollapsed && (
            <div className="brand-text">
              <strong>CampusConnect</strong>
              <small>Learn · Innovate · Build</small>
            </div>
          )}
        </div>

        <div className="brand-actions">
          {onToggleCollapse && (
            <button
              type="button"
              className="sidebar-collapse-toggle-btn"
              onClick={onToggleCollapse}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
          )}

          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close sidebar"
            title="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="label">{isParent ? 'Parent Portal' : 'Student Workspace'}</div>
      )}

      <nav className="sidebar-nav">
        {navItems.map((item, index) => {
          if ('group' in item) {
            if (isCollapsed) return <div className="nav-group-divider" key={`${item.group}-${index}`} />;
            return <div className="nav-group-label" key={`${item.group}-${index}`}>{item.group}</div>;
          }
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/' || item.to === '/parent'}
              className={({ isActive }) => `nav ${isActive ? 'active' : ''} ${isCollapsed ? 'nav-collapsed' : ''}`}
              onClick={onClose}
              title={isCollapsed ? item.label : undefined}
              data-tooltip={item.label}
            >
              <span className="nav-icon"><Icon size={18} /></span>
              {!isCollapsed && <span className="nav-text">{item.label}</span>}
            </NavLink>
          );
        })}

        <button
          className={`nav logout-btn ${isCollapsed ? 'nav-collapsed' : ''}`}
          onClick={handleLogout}
          title={isCollapsed ? 'Logout' : undefined}
          data-tooltip="Logout"
        >
          <span className="nav-icon"><LogOut size={18} /></span>
          {!isCollapsed && <span className="nav-text">Logout</span>}
        </button>
      </nav>

      {!isCollapsed && (
        <div className="sidefoot">
          {isParent ? <>Supporting student<br />success together</> : <>Better learning<br />Brighter future</>}
        </div>
      )}
    </aside>
  );
};
