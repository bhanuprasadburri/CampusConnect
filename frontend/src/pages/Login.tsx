import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) navigate(user?.role === 'ROLE_PARENT' ? '/parent' : '/', { replace: true });
  }, [isAuthenticated, user?.role, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(username, password);
      const signedInUser = JSON.parse(localStorage.getItem('user') || '{}');
      navigate(signedInUser.role === 'ROLE_PARENT' ? '/parent' : '/', { replace: true });
    } catch (err: any) {
      const responseMessage = err.response?.data?.message;
      setError(responseMessage || (
        err.response
          ? 'Login failed. Please check your credentials and try again.'
          : 'Unable to reach the server. Please make sure the backend is running and try again.'
      ));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: "linear-gradient(135deg, rgba(12, 37, 69, 0.84), rgba(16, 45, 82, 0.68)), url('/images/campus-generic.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '36px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div className="login-brand-symbol"><GraduationCap size={30} aria-hidden="true" /></div>
          <h1 style={{ fontSize: '22px', color: '#102d52', fontWeight: 800 }}>CampusConnect</h1>
          <p style={{ fontSize: '13px', color: '#71849c', marginTop: '4px' }}>
            Student &amp; Parent Portal
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            color: '#b91c1c',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#4b6788', marginBottom: '6px' }}>
              USERNAME OR EMAIL
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username or email"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  outline: 'none',
                  fontSize: '13px'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#4b6788', marginBottom: '6px' }}>
              PASSWORD
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '10px 40px 10px 38px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  outline: 'none',
                  fontSize: '13px'
                }}
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((visible) => !visible)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  display: 'grid',
                  placeItems: 'center',
                  padding: '4px',
                  border: 'none',
                  background: 'transparent',
                  color: '#64748b',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#1677f2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '8px',
              transition: 'background 0.2s'
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In to CampusConnect'}
          </button>

        </form>
      </div>
    </div>
  );
};
