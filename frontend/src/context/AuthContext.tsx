import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, StudentProfile } from '../types';
import { apiClient } from '../api/client';
import { Info } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  studentProfile: StudentProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const refreshProfile = async () => {
    if (!token || user?.role === 'ROLE_PARENT') return;
    try {
      const profile = await apiClient.getCurrentProfile();
      setStudentProfile(profile);
    } catch (err) {
      console.error('Failed to load student profile', err);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      if (token && user?.role !== 'ROLE_PARENT') {
        try {
          const profile = await apiClient.getCurrentProfile();
          setStudentProfile(profile);
        } catch (e) {
          console.error('Auth verification failed', e);
          logout();
        }
      } else if (user?.role === 'ROLE_PARENT') setStudentProfile(null);
      setIsLoading(false);
    };

    initAuth();
  }, [token, user?.role]);

  const login = async (username: string, password: string) => {
    const res = await apiClient.login({ username, password });
    localStorage.setItem('token', res.token);
    const userInfo: User = {
      id: res.userId,
      username: res.username,
      email: res.email,
      role: res.role,
      studentId: res.studentId,
      institutionId: res.institutionId,
      institutionName: res.institutionName,
      fullName: res.fullName,
    };
    localStorage.setItem('user', JSON.stringify(userInfo));
    setToken(res.token);
    setUser(userInfo);
    showToast(`Welcome back, ${res.fullName}!`);
    if (res.role !== 'ROLE_PARENT') {
      try { setStudentProfile(await apiClient.getCurrentProfile()); }
      catch (err) { console.error('Failed to load student profile after login', err); }
    } else setStudentProfile(null);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setStudentProfile(null);
    showToast('Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        studentProfile,
        token,
        isAuthenticated: !!token,
        isLoading,
        toastMessage,
        showToast,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
      {toastMessage && <div className="toast show"><Info size={16} aria-hidden="true" /> {toastMessage}</div>}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
