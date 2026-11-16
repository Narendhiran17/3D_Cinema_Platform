import React, { useState } from 'react';
import { X, Building, Plus, LayoutGrid, CheckCircle2 } from 'lucide-react';

interface OperatorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  tenantName: string;
}

interface CinemaBranch {
  id: string;
  name: string;
  city: string;
  auditoriumsCount: number;
  activeLayoutVersion: number;
}

export const OperatorPanel: React.FC<OperatorPanelProps> = ({ isOpen, onClose, tenantName }) => {
  const [branches, setBranches] = useState<CinemaBranch[]>([
    {
      id: 'cin-apex-001',
      name: 'Apex Grand Cinema - Manhattan Flagship',
      city: 'New York',
      auditoriumsCount: 8,
      activeLayoutVersion: 1,
    },
    {
      id: 'cin-apex-002',
      name: 'Apex Brooklyn Commons & IMAX',
      city: 'Brooklyn',
      auditoriumsCount: 6,
      activeLayoutVersion: 2,
    },
  ]);

  const [newBranchName, setNewBranchName] = useState('');
  const [newCity, setNewCity] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName || !newCity) return;

    const newBranch: CinemaBranch = {
      id: `cin-apex-${Date.now().toString().slice(-4)}`,
      name: newBranchName,
      city: newCity,
      auditoriumsCount: 4,
      activeLayoutVersion: 1,
    };

    setBranches([...branches, newBranch]);
    setNewBranchName('');
    setNewCity('');
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        width: '640px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '30px',
        position: 'relative',
        boxShadow: '0 25px 50px rgba(0,0,0,0.7)',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <Building size={22} color="var(--accent-gold)" />
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>
            Cinema Operator Management Console
          </h2>
        </div>
        <p style={{ margin: '0 0 24px 0', fontSize: '13px', color: 'var(--text-muted)' }}>
          Active Tenant Scope: <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>{tenantName}</span>
        </p>

        {/* Branch List */}
        <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 12px 0' }}>
          Configured Cinema Branches ({branches.length})
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
          {branches.map((b) => (
            <div
              key={b.id}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>{b.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Location: {b.city} • Auditoriums: {b.auditoriumsCount}
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'var(--bg-secondary)',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#38bdf8',
                border: '1px solid var(--border)',
              }}>
                <LayoutGrid size={14} />
                <span>Layout v{b.activeLayoutVersion} (Published)</span>
              </div>
            </div>
          ))}
        </div>

        {/* Add Branch Form */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '18px',
        }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 700 }}>
            Create New Cinema Branch
          </h4>
          <form onSubmit={handleAddBranch} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                required
                placeholder="Cinema Name (e.g. Apex Queens Square)"
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                style={{
                  flex: 2,
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  color: '#fff',
                  padding: '10px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
              <input
                type="text"
                required
                placeholder="City (e.g. Queens)"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                style={{
                  flex: 1,
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  color: '#fff',
                  padding: '10px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {isSuccess && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '13px' }}>
                  <CheckCircle2 size={16} />
                  <span>Branch and default Layout v1 created!</span>
                </div>
              )}
              {!isSuccess && <div />}

              <button
                type="submit"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'var(--accent-gold)',
                  color: '#000',
                  fontWeight: 700,
                  fontSize: '13px',
                  padding: '10px 18px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                <Plus size={16} />
                <span>Add Branch</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
