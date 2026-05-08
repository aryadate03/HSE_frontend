import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const TABS = ['workers', 'safety_officers'];

const MemberCard = ({ member, role }) => {
  const color   = role === 'worker' ? '#3b82f6' : '#10b981';
  const bgColor = role === 'worker' ? 'rgba(59,130,246,0.12)' : 'rgba(16,185,129,0.12)';
  const initial = member.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <div style={{
      background: 'white', borderRadius: '16px', padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      border: `1px solid ${color}30`,
      borderTop: `3px solid ${color}`,
      transition: 'box-shadow 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'}
    >
      {/* Avatar + Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '800', color, flexShrink: 0 }}>
          {initial}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: '700', color: '#1e293b', fontSize: '15px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.name}</p>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.email}</p>
          <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#94a3b8' }}>{member.department || 'No department'}</p>
        </div>
      </div>

      {/* Stats — only for workers */}
      {role === 'worker' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '14px', padding: '12px', background: '#f8fafc', borderRadius: '10px' }}>
          {[
            { label: 'Total',    value: member.incidentStats?.total    || 0, color: '#1e293b' },
            { label: 'Open',     value: member.incidentStats?.open     || 0, color: '#f59e0b' },
            { label: 'Resolved', value: member.incidentStats?.resolved || 0, color: '#10b981' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: s.color }}>{s.value}</p>
              <p style={{ margin: '2px 0 0', fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Contact */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {member.phone && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
            <span>📞</span> {member.phone}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
          <span>📅</span> Joined {new Date(member.createdAt).toLocaleDateString()}
        </div>
        {member.lastLogin && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#94a3b8' }}>
            <span>🕐</span> Last active {new Date(member.lastLogin).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Role badge */}
      <div style={{ marginTop: '14px' }}>
        <span style={{ background: bgColor, color, padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'capitalize' }}>
          {role === 'worker' ? '👷 Worker' : '🛡️ Safety Officer'}
        </span>
      </div>
    </div>
  );
};

const TeamPage = () => {
  const toast = useToast();
  const [workers, setWorkers]               = useState([]);
  const [safetyOfficers, setSafetyOfficers] = useState([]);
  const [loading, setLoading]               = useState(true);
  const [activeTab, setActiveTab]           = useState('workers');
  const [search, setSearch]                 = useState('');

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const [workersRes, soRes] = await Promise.all([
          api.get('/supervisor/team'),
          api.get('/supervisor/team/safety-officers').catch(() => ({ data: { data: [] } })),
        ]);
        setWorkers(workersRes.data.data || []);
        setSafetyOfficers(soRes.data.data || []);
      } catch {
        toast.error('Failed to load team members.');
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  const currentList = activeTab === 'workers' ? workers : safetyOfficers;
  const filtered = currentList.filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase()) ||
    (m.department || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '28px 32px', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: '0 0 4px' }}>My Team</h2>
          <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
            {workers.length} workers · {safetyOfficers.length} safety officers
          </p>
        </div>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '14px' }}>🔍</span>
          <input type="text" placeholder="Search team..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '36px', paddingRight: '14px', paddingTop: '10px', paddingBottom: '10px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', background: 'white', width: '220px' }} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', background: 'white', padding: '4px', borderRadius: '12px', border: '1px solid #e2e8f0', width: 'fit-content', marginBottom: '24px' }}>
        {[
          { key: 'workers',        label: `👷 Workers (${workers.length})` },
          { key: 'safety_officers',label: `🛡️ Safety Officers (${safetyOfficers.length})` },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s',
              background: activeTab === tab.key ? (tab.key === 'workers' ? '#3b82f6' : '#10b981') : 'transparent',
              color: activeTab === tab.key ? 'white' : '#64748b',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px', color: '#64748b' }}>⏳ Loading team...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
          <p style={{ fontSize: '36px', margin: '0 0 8px' }}>👥</p>
          <p style={{ margin: 0, fontWeight: '600', color: '#64748b' }}>No members found</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {filtered.map(member => (
            <MemberCard key={member._id} member={member} role={activeTab === 'workers' ? 'worker' : 'safety_officer'} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamPage;