import React from 'react';
import { Film, ShieldCheck, User, LogOut, Building, Ticket, Shield } from 'lucide-react';

interface HeaderProps {
  currentUser: { name: string; email: string; role: string; tenant?: string } | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenTickets?: () => void;
  onOpenPlatformAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenTickets,
  onOpenPlatformAdmin,
}) => {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 32px',
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          backgroundColor: 'var(--accent-gold)',
          color: '#000',
          padding: '8px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Film size={22} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '0.5px' }}>
            CINE<span style={{ color: 'var(--accent-gold)' }}>VERSE 3D</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Apex Grand Cinema • Auditorium 1
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#10b981' }}>
          <ShieldCheck size={16} />
          <span>Real-time Inventory Lock</span>
        </div>

        {onOpenTickets && (
          <button
            onClick={onOpenTickets}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-main)',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Ticket size={15} color="var(--accent-gold)" />
            <span>My Tickets</span>
          </button>
        )}

        {currentUser && currentUser.role === 'PLATFORM_ADMIN' && onOpenPlatformAdmin && (
          <button
            onClick={onOpenPlatformAdmin}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              color: '#ef4444',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Shield size={15} />
            <span>Platform Admin</span>
          </button>
        )}

        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', fontWeight: 700 }}>
                {currentUser.name}
              </div>
              <div style={{
                fontSize: '11px',
                color: currentUser.role === 'PLATFORM_ADMIN' ? '#ef4444' : 'var(--accent-gold)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                justifyContent: 'flex-end',
              }}>
                {currentUser.tenant && <Building size={12} />}
                <span>{currentUser.tenant || currentUser.role}</span>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Sign Out"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                color: '#ef4444',
                padding: '8px',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-main)',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            <User size={16} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
