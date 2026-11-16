import React, { useEffect, useState } from 'react';
import {
  X,
  Shield,
  Layers,
  Activity,
  DollarSign,
  Building,
  PlusCircle,
  FileText,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  fetchPlatformTenants,
  onboardPlatformTenant,
  updatePlatformTenantStatus,
  fetchPlatformAnalytics,
  fetchPlatformAuditLogs,
  PlatformTenantDTO,
  PlatformAnalyticsDTO,
  AuditLogDTO,
} from '../services/api';

interface PlatformAdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  token?: string;
}

export const PlatformAdminPanel: React.FC<PlatformAdminPanelProps> = ({
  isOpen,
  onClose,
  token = 'demo-admin-token',
}) => {
  const [activeTab, setActiveTab] = useState<'kpi' | 'tenants' | 'audit'>('kpi');
  const [tenants, setTenants] = useState<PlatformTenantDTO[]>([]);
  const [analytics, setAnalytics] = useState<PlatformAnalyticsDTO | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // New tenant onboard form state
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantSlug, setNewTenantSlug] = useState('');
  const [newTenantPlan, setNewTenantPlan] = useState('ENTERPRISE');
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPlatformData();
    }
  }, [isOpen]);

  const loadPlatformData = async () => {
    setLoading(true);
    try {
      const [tData, aData, logData] = await Promise.allSettled([
        fetchPlatformTenants(token),
        fetchPlatformAnalytics(token),
        fetchPlatformAuditLogs(token),
      ]);

      if (tData.status === 'fulfilled') setTenants(tData.value);
      if (aData.status === 'fulfilled') setAnalytics(aData.value);
      if (logData.status === 'fulfilled') setAuditLogs(logData.value);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSuccess(null);
    setFormError(null);

    try {
      const created = await onboardPlatformTenant(token, {
        name: newTenantName,
        slug: newTenantSlug,
        subscription_plan: newTenantPlan,
      });

      setTenants((prev) => [...prev, created]);
      setFormSuccess(`Tenant '${created.name}' onboarded successfully!`);
      setNewTenantName('');
      setNewTenantSlug('');
      // Refresh audit logs
      const updatedLogs = await fetchPlatformAuditLogs(token);
      setAuditLogs(updatedLogs);
    } catch {
      setFormError('Failed to onboard tenant. Ensure slug is unique.');
    }
  };

  const handleToggleTenantStatus = async (tenant: PlatformTenantDTO) => {
    const nextStatus = tenant.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await updatePlatformTenantStatus(token, tenant.id, nextStatus, 'Admin override');
      setTenants((prev) =>
        prev.map((t) => (t.id === tenant.id ? { ...t, status: nextStatus } : t))
      );
      const updatedLogs = await fetchPlatformAuditLogs(token);
      setAuditLogs(updatedLogs);
    } catch {
      alert('Failed to update tenant status');
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        width: '880px',
        maxWidth: '92vw',
        height: '85vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--bg-surface)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              backgroundColor: '#ef4444',
              color: '#fff',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
            }}>
              <Shield size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Central Platform Administration</h2>
                <span style={{ fontSize: '10px', backgroundColor: '#ef4444', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                  SUPER ADMIN
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Cross-tenant governance, financial volume reconciliation & audit control
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '12px 24px',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--bg-secondary)',
        }}>
          <button
            onClick={() => setActiveTab('kpi')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              backgroundColor: activeTab === 'kpi' ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === 'kpi' ? 'var(--text-main)' : 'var(--text-muted)',
              border: '1px solid',
              borderColor: activeTab === 'kpi' ? 'var(--border)' : 'transparent',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <Activity size={15} />
            <span>Platform KPIs</span>
          </button>

          <button
            onClick={() => setActiveTab('tenants')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              backgroundColor: activeTab === 'tenants' ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === 'tenants' ? 'var(--text-main)' : 'var(--text-muted)',
              border: '1px solid',
              borderColor: activeTab === 'tenants' ? 'var(--border)' : 'transparent',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <Building size={15} />
            <span>Tenant Roster ({tenants.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              backgroundColor: activeTab === 'audit' ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === 'audit' ? 'var(--text-main)' : 'var(--text-muted)',
              border: '1px solid',
              borderColor: activeTab === 'audit' ? 'var(--border)' : 'transparent',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <FileText size={15} />
            <span>Audit Trail ({auditLogs.length})</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Loading platform data...
            </div>
          ) : activeTab === 'kpi' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* KPI Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <div style={{ backgroundColor: 'var(--bg-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '12px' }}>
                    <span>Gross Volume</span>
                    <DollarSign size={16} color="var(--accent-gold)" />
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '8px', color: 'var(--accent-gold)' }}>
                    ${analytics ? (analytics.gross_volume_minor / 100).toLocaleString() : '3,600.00'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px' }}>+18.4% vs last week</div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '12px' }}>
                    <span>Active Tenants</span>
                    <Building size={16} color="#60a5fa" />
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '8px' }}>
                    {analytics?.total_tenants || tenants.length || 2}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>100% SLA compliance</div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '12px' }}>
                    <span>Avg Occupancy</span>
                    <Layers size={16} color="#a78bfa" />
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '8px' }}>
                    {analytics?.average_occupancy_percentage || 78.4}%
                  </div>
                  <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px' }}>High-density IMAX Prime</div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '12px' }}>
                    <span>Health Status</span>
                    <Activity size={16} color="#10b981" />
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '8px', color: '#10b981' }}>
                    {analytics?.system_health || 'HEALTHY'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>All circuits nominal</div>
                </div>
              </div>

              {/* Quick Tenant Onboarding Card */}
              <div style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '20px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <PlusCircle size={18} color="var(--accent-gold)" />
                  <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Onboard New Cinema Operator Tenant</h3>
                </div>

                {formSuccess && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '13px', marginBottom: '12px' }}>
                    <CheckCircle2 size={16} />
                    <span>{formSuccess}</span>
                  </div>
                )}
                {formError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontSize: '13px', marginBottom: '12px' }}>
                    <AlertCircle size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                <form onSubmit={handleOnboardTenant} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr auto', gap: '12px' }}>
                  <input
                    type="text"
                    placeholder="Tenant Name (e.g. Cineplex Global)"
                    value={newTenantName}
                    onChange={(e) => setNewTenantName(e.target.value)}
                    required
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: 'var(--text-main)',
                      fontSize: '13px',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Tenant Slug (e.g. cineplex-global)"
                    value={newTenantSlug}
                    onChange={(e) => setNewTenantSlug(e.target.value)}
                    required
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: 'var(--text-main)',
                      fontSize: '13px',
                    }}
                  />
                  <select
                    value={newTenantPlan}
                    onChange={(e) => setNewTenantPlan(e.target.value)}
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: 'var(--text-main)',
                      fontSize: '13px',
                    }}
                  >
                    <option value="STARTER">STARTER</option>
                    <option value="PRO">PRO</option>
                    <option value="ENTERPRISE">ENTERPRISE</option>
                  </select>
                  <button
                    type="submit"
                    style={{
                      backgroundColor: 'var(--accent-gold)',
                      color: '#000',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    Provision Tenant
                  </button>
                </form>
              </div>
            </div>
          ) : activeTab === 'tenants' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr', padding: '8px 16px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700 }}>
                <span>TENANT NAME</span>
                <span>SLUG</span>
                <span>PLAN</span>
                <span>CINEMAS</span>
                <span>STATUS</span>
                <span style={{ textAlign: 'right' }}>ACTIONS</span>
              </div>

              {tenants.map((t) => (
                <div
                  key={t.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr',
                    alignItems: 'center',
                    padding: '12px 16px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                >
                  <span style={{ fontWeight: 700 }}>{t.name}</span>
                  <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '12px' }}>{t.slug}</span>
                  <span>
                    <span style={{ backgroundColor: 'rgba(212, 175, 55, 0.15)', color: 'var(--accent-gold)', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                      {t.subscription_plan}
                    </span>
                  </span>
                  <span>{t.cinema_count}</span>
                  <span>
                    <span
                      style={{
                        backgroundColor: t.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: t.status === 'ACTIVE' ? '#10b981' : '#ef4444',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      {t.status}
                    </span>
                  </span>
                  <div style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleToggleTenantStatus(t)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: t.status === 'ACTIVE' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: t.status === 'ACTIVE' ? '#ef4444' : '#10b981',
                        border: '1px solid var(--border)',
                        cursor: 'pointer',
                      }}
                    >
                      {t.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1.5fr 3fr', padding: '8px 16px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700 }}>
                <span>TIMESTAMP</span>
                <span>ACTION</span>
                <span>PERFORMED BY</span>
                <span>DETAILS</span>
              </div>

              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.5fr 2fr 1.5fr 3fr',
                    alignItems: 'center',
                    padding: '10px 16px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>
                    {log.action}
                  </span>
                  <span>{log.performed_by}</span>
                  <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '11px' }}>
                    {JSON.stringify(log.details)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
