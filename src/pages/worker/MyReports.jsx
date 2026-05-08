import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ReportDetailsModal from '../../components/worker/ReportDetailsModal';
import { STATUS_COLORS, STATUS_LABELS, SEVERITY_COLORS, SEVERITY_LABELS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import incidentService from '../../services/incidentService';
import useDebounce from '../../hooks/useDebounce';
import { Search, Filter, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: '',                           label: 'All Status' },
  { value: 'draft',                      label: 'Draft' },
  { value: 'submitted',                  label: 'Submitted' },
  { value: 'under_review',               label: 'Under Review' },
  { value: 'forwarded_to_safety_officer',label: 'Approved' },
  { value: 'investigating',              label: 'Being Investigated' },
  { value: 'resolved',                   label: 'Resolved' },
  { value: 'closed',                     label: 'Closed' },
  { value: 'rejected',                   label: 'Rejected' },
];

const SEVERITY_OPTIONS = [
  { value: '',         label: 'All Severity' },
  { value: 'low',      label: 'Low' },
  { value: 'medium',   label: 'Medium' },
  { value: 'high',     label: 'High' },
  { value: 'critical', label: 'Critical' },
];

// ── Status banner shown at top when rejected or approved ──────────────────────
const StatusBanner = ({ status, rejectionReason }) => {
  if (status === 'rejected') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
        <span className="text-2xl">❌</span>
        <div>
          <p className="font-semibold text-red-700 text-sm">Report Rejected by Supervisor</p>
          {rejectionReason && (
            <p className="text-red-600 text-sm mt-1">Reason: {rejectionReason}</p>
          )}
        </div>
      </div>
    );
  }
  if (status === 'forwarded_to_safety_officer') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
        <span className="text-2xl">✅</span>
        <div>
          <p className="font-semibold text-green-700 text-sm">Report Approved by Supervisor</p>
          <p className="text-green-600 text-sm mt-1">Your report has been forwarded to the Safety Officer for investigation.</p>
        </div>
      </div>
    );
  }
  return null;
};

const MyReports = () => {
  const navigate = useNavigate();
  const [reports, setReports]           = useState([]);
  const [pagination, setPagination]     = useState({ total: 0, pages: 1 });
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverity]   = useState('');
  const [selectedIncident, setSelected] = useState(null);
  const [page, setPage]                 = useState(1);
  const [error, setError]               = useState('');

  const debouncedSearch = useDebounce(search, 400);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 10 };
      if (statusFilter)   params.status   = statusFilter;
      if (severityFilter) params.severity = severityFilter;
      const res = await incidentService.getMyReports(params);
      setReports(res.data.incidents || []);
      setPagination(res.data.pagination || { total: 0, pages: 1 });
    } catch (err) {
      setError('Failed to load reports');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, severityFilter]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const filtered = reports.filter((r) =>
    r.incidentId?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    r.description?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  // Count rejected and approved for notification
  const rejectedCount  = reports.filter(r => r.status === 'rejected').length;
  const approvedCount  = reports.filter(r => r.status === 'forwarded_to_safety_officer').length;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" text="Loading reports..." />
    </div>
  );

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">My Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">{pagination.total} total reports</p>
        </div>
        <button
          onClick={() => navigate('/worker/report')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + New Report
        </button>
      </div>

      {/* Notification banners — show if any rejected or approved */}
      {rejectedCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <span className="text-xl">❌</span>
          <div>
            <p className="font-semibold text-red-700 text-sm">
              {rejectedCount} report{rejectedCount > 1 ? 's' : ''} rejected by supervisor
            </p>
            <p className="text-red-600 text-xs mt-0.5">Click on the report to see the rejection reason.</p>
          </div>
        </div>
      )}
      {approvedCount > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <span className="text-xl">✅</span>
          <div>
            <p className="font-semibold text-green-700 text-sm">
              {approvedCount} report{approvedCount > 1 ? 's' : ''} approved & forwarded to Safety Officer
            </p>
            <p className="text-green-600 text-xs mt-0.5">Your report is being investigated.</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500"
          />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 bg-white">
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={severityFilter} onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 bg-white">
          {SEVERITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Filter size={36} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No reports found</p>
            <button onClick={() => navigate('/worker/report')}
              className="mt-3 text-sm text-blue-600 hover:underline">
              Create your first report
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Incident ID</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Type</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Severity</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Supervisor Decision</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Date</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((r) => (
                    <tr key={r._id}
                      className={`hover:bg-gray-50 ${r.status === 'rejected' ? 'bg-red-50/30' : r.status === 'forwarded_to_safety_officer' ? 'bg-green-50/30' : ''}`}>
                      <td className="px-4 py-3 font-medium text-gray-800">{r.incidentId}</td>
                      <td className="px-4 py-3 text-gray-600 capitalize">{r.incidentType?.replace('_', ' ')}</td>
                      <td className="px-4 py-3">
                        <Badge label={SEVERITY_LABELS[r.severity]} colorClass={SEVERITY_COLORS[r.severity]} />
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          label={STATUS_LABELS[r.status] || r.status}
                          colorClass={STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-600'}
                        />
                      </td>
                      <td className="px-4 py-3">
                        {r.status === 'rejected' && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-red-500 text-xs font-medium">❌ Rejected</span>
                          </div>
                        )}
                        {r.status === 'forwarded_to_safety_officer' && (
                          <span className="text-green-600 text-xs font-medium">✅ Approved</span>
                        )}
                        {!['rejected','forwarded_to_safety_officer'].includes(r.status) && (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(r.createdAt)}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => setSelected(r)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                          <Eye size={16} className="text-gray-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-50">
              {filtered.map((r) => (
                <div key={r._id}
                  className={`p-4 flex items-center justify-between ${r.status === 'rejected' ? 'bg-red-50/40' : r.status === 'forwarded_to_safety_officer' ? 'bg-green-50/40' : ''}`}>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-gray-800">{r.incidentId}</span>
                    <div className="flex gap-2 flex-wrap">
                      <Badge label={SEVERITY_LABELS[r.severity]} colorClass={SEVERITY_COLORS[r.severity]} />
                      <Badge
                        label={STATUS_LABELS[r.status] || r.status}
                        colorClass={STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-600'}
                      />
                    </div>
                    {r.status === 'rejected' && (
                      <span className="text-xs text-red-500 font-medium">❌ Rejected by supervisor</span>
                    )}
                    {r.status === 'forwarded_to_safety_officer' && (
                      <span className="text-xs text-green-600 font-medium">✅ Approved by supervisor</span>
                    )}
                    <span className="text-xs text-gray-400">{formatDate(r.createdAt)}</span>
                  </div>
                  <button onClick={() => setSelected(r)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <Eye size={16} className="text-gray-500" />
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Page {page} of {pagination.pages} • {pagination.total} total
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(page - 1)} disabled={page === 1}
                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40">
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={() => setPage(page + 1)} disabled={page === pagination.pages}
                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Report Details Modal — pass rejection reason */}
      <ReportDetailsModal
        isOpen={!!selectedIncident}
        onClose={() => setSelected(null)}
        incident={selectedIncident}
      />
    </div>
  );
};

export default MyReports;