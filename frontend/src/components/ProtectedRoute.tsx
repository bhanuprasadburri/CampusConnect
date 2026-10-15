import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute: React.FC<{ allowedRoles?: string[] }> = ({ allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '100vh', color: '#1677f2', fontWeight: 600 }}>
        Loading CampusConnect...
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role || '')) {
    if (user?.role === 'ROLE_PARENT') return <Navigate to="/parent" replace />;
    if (user?.role === 'ROLE_STUDENT') return <Navigate to="/" replace />;
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};
