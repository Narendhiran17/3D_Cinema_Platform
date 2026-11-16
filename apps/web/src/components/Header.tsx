import React from 'react';
import { Film, ShieldCheck, User } from 'lucide-react';

export const Header: React.FC = () => {
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#10b981' }}>
          <ShieldCheck size={16} />
          <span>Real-time Inventory Lock</span>
        </div>
        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          color: 'var(--text-main)',
          padding: '8px 16px',
        }}>
          <User size={16} />
          <span>Account</span>
        </button>
      </div>
    </header>
  );
};
