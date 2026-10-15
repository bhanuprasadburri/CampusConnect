import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sidebar_collapsed');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('sidebar_collapsed', JSON.stringify(next));
      } catch (err) {
        console.error('Failed to save sidebar state:', err);
      }
      return next;
    });
  };

  return (
    <div className={`app ${isCollapsed ? 'sidebar-is-collapsed' : ''}`}>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      />
      <div
        className={`overlay ${sidebarOpen ? 'show' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />
      <main className={`main ${isCollapsed ? 'collapsed' : ''}`}>
        <Topbar onToggleMenu={() => setSidebarOpen(!sidebarOpen)} />
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
