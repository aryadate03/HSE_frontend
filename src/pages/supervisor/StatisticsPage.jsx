import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend, LineChart, Line,
} from 'recharts';
import { supervisorAPI } from '../../services/api';
import Loader from '../../components/common/Loader';
import { useToast } from '../../context/ToastContext';
import { TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const COLORS = ['#3b82f6', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

const ChartCard = ({ title, sub, children }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
    <div className="mb-4">
      <h3 className="text-sm font-bold text-gray-800">{title}</h3>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
    {children}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 shadow-lg rounded-lg px-3 py-2 text-xs">
      <p className="text-gray-500 mb-1">{label}</p>
      <p className="text-gray-800 font-bold">{payload[0].value}</p>
    </div>
  );
};

const StatisticsPage = () => {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await supervisorAPI.getStatistics();
        setStats(data.data);
      } catch {
        toast.error('Failed to load statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader size="lg" text="Loading statistics…" />
    </div>
  );

  if (!stats) return null;

  const { statusBreakdown, priorityBreakdown, typeBreakdown, monthlyTrend, avgResolutionDays } = stats;

  const KPI_CARDS = [
    {
      label: 'Total Incidents',
      value: statusBreakdown.reduce((a, b) => a + b.count, 0),
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
    },
    {
      label: 'Avg. Days to Review',
      value: avgResolutionDays || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      border: 'border-yellow-100',
    },
    {
      label: 'Critical Incidents',
      value: priorityBreakdown.find((p) => p._id === 'critical')?.count || 0,
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-100',
    },
    {
      label: 'Resolved',
      value: statusBreakdown.find((s) => s._id === 'resolved')?.count || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-100',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6 space-y-5">

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Statistics</h2>
        <p className="text-sm text-gray-500 mt-0.5">Incident trends and analytics overview.</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map((k) => (
          <div key={k.label} className={`bg-white rounded-xl border ${k.border} shadow-sm p-4`}>
            <div className={`w-10 h-10 ${k.bg} rounded-xl flex items-center justify-center mb-3`}>
              <k.icon size={20} className={k.color} />
            </div>
            <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
            <p className="text-xs text-gray-500 mt-1 font-medium">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Monthly trend */}
        <ChartCard title="Monthly Trend" sub="Incidents per month (last 6 months)">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2.5}
                dot={{ fill: '#3b82f6', r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Status breakdown */}
        <ChartCard title="Status Breakdown" sub="All incidents by current status">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusBreakdown} dataKey="count" nameKey="_id"
                cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={3}>
                {statusBreakdown.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val, name) => [val, name.charAt(0).toUpperCase() + name.slice(1)]}
                contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12, color: '#1e293b' }}
              />
              <Legend
                formatter={(val) => val.charAt(0).toUpperCase() + val.slice(1)}
                iconSize={8}
                wrapperStyle={{ fontSize: 11, color: '#64748b' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Priority breakdown */}
        <ChartCard title="Priority Distribution" sub="Incidents by assigned priority">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={priorityBreakdown} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="_id" tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
                axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                formatter={(val, name, props) => [val, props.payload._id]}
                contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12, color: '#1e293b' }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {priorityBreakdown.map((entry, i) => {
                  const colorMap = { low: '#22c55e', medium: '#f59e0b', high: '#f97316', critical: '#ef4444' };
                  return <Cell key={i} fill={colorMap[entry._id] || '#3b82f6'} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Type breakdown */}
        <ChartCard title="Incident Types" sub="Last 30 days">
          {typeBreakdown.length > 0 ? (
            <div className="space-y-3 mt-1">
              {typeBreakdown.slice(0, 6).map((t, i) => {
                const max = typeBreakdown[0]?.count || 1;
                const pct = Math.round((t.count / max) * 100);
                return (
                  <div key={t._id} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-28 truncate shrink-0 capitalize">
                      {t._id?.replace(/_/g, ' ')}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }}
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-700 w-6 text-right">{t.count}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-sm text-gray-400">
              No data available
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
};

export default StatisticsPage;