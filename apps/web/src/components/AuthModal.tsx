import React, { useState } from 'react';
import { X, Lock, Mail, User } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; email: string; role: string; tenant?: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess({
      name: fullName || 'Customer User',
      email: email || 'customer@example.com',
      role: 'CUSTOMER',
    });
    onClose();
  };

  const handleQuickLogin = (role: 'OPERATOR' | 'ADMIN') => {
    if (role === 'OPERATOR') {
      onLoginSuccess({
        name: 'Apex Cinema Manager',
        email: 'operator@apexcinemas.com',
        role: 'OPERATOR_ADMIN',
        tenant: 'Apex Cinemas International',
      });
    } else {
      onLoginSuccess({
        name: 'Platform Administrator',
        email: 'admin@platform.com',
        role: 'PLATFORM_ADMIN',
      });
    }
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        width: '420px',
        padding: '28px',
        position: 'relative',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        {/* Title */}
        <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: 800 }}>
          {mode === 'LOGIN' ? 'Welcome Back' : 'Create an Account'}
        </h2>
        <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: 'var(--text-muted)' }}>
          Access your bookings, cinema administration, and 3D seat holds.
        </p>

        {/* Quick Demo Logins */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>
            Quick Demo Logins (Sprint 2 RBAC)
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleQuickLogin('OPERATOR')}
              style={{
                flex: 1,
                padding: '6px 10px',
                fontSize: '12px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                color: 'var(--text-main)',
                borderRadius: '6px',
              }}
            >
              Cinema Operator
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('ADMIN')}
              style={{
                flex: 1,
                padding: '6px 10px',
                fontSize: '12px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                color: 'var(--text-main)',
                borderRadius: '6px',
              }}
            >
              Platform Admin
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {mode === 'REGISTER' && (
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Full Name
              </label>
              <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0 10px' }}>
                <User size={16} color="#9ca3af" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    color: '#fff',
                    padding: '10px',
                    outline: 'none',
                    fontSize: '14px',
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0 10px' }}>
              <Mail size={16} color="#9ca3af" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  padding: '10px',
                  outline: 'none',
                  fontSize: '14px',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0 10px' }}>
              <Lock size={16} color="#9ca3af" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  padding: '10px',
                  outline: 'none',
                  fontSize: '14px',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            style={{
              marginTop: '10px',
              backgroundColor: 'var(--accent-gold)',
              color: '#000',
              fontWeight: 700,
              padding: '12px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            {mode === 'LOGIN' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
          {mode === 'LOGIN' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={() => setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-gold)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {mode === 'LOGIN' ? 'Sign Up' : 'Log In'}
          </button>
        </div>
      </div>
    </div>
  );
};
