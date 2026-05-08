import { FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color, textColor }) => (
  <div className="bg-gray-900 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon size={20} className={textColor} />
    </div>
    <div>
      <p className="text-2xl font-black text-white">{value ?? 0}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  </div>
);

const StatsCards = ({ stats }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <StatCard label="Total Reports"  value={stats?.total}     icon={FileText}      color="bg-yellow-400/20" textColor="text-yellow-400" />
    <StatCard label="Submitted"      value={stats?.submitted} icon={Clock}         color="bg-blue-400/20"   textColor="text-blue-400" />
    <StatCard label="Resolved"       value={stats?.resolved}  icon={CheckCircle}   color="bg-green-400/20"  textColor="text-green-400" />
    <StatCard label="Drafts"         value={stats?.drafts}    icon={AlertTriangle} color="bg-gray-400/20"   textColor="text-gray-400" />
  </div>
);
export default StatsCards;