import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supervisorAPI } from '../../services/api';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import { useToast } from '../../context/ToastContext';
import { Search, SlidersHorizontal, X, ArrowUpDown, ArrowUp, ArrowDown, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

const STATUSES   = ['all', 'new', 'pending', 'reviewed', 'escalated', 'rejected', 'resolved'];
const PRIORITIES = ['all', 'critical', 'high', 'medium', 'low'];

const PRIORITY_STYLE = {
  critical: 'bg-red-100 text-red-700 border border-red-200',
  high:     'bg-orange-100 text-orange-700 border border-orange-200',
  medium:   'bg-yellow-100 text-yellow-700 border border-yellow-200',
  low:      'bg-green-100 text-green-700 border border-green-200',
};

const STATUS_STYLE = {
  new:         'bg-blue-100 text-blue-700 border border-blue-200',
  pending:     'bg-yellow-100 text-yellow-700 border border-yellow-200',
  reviewed:    'bg-purple-100 text-purple-700 border border-purple-200',
  escalated:   'bg-red-100 text-red-700 border border-red-200',
  rejected:    'bg-gray-100 text-gray-600 border border-gray-200',
  resolved:    'bg-green-100 text-green-700 border border-green-200',
  forwarded:   'bg-indigo-100 text-indigo-700 border border-indigo-200',
  investigating:'bg-cyan-100 text-cyan-700 border border-cyan-200',
};

const SortIcon = ({ field, current, order }) => {
  if (current !== field) return <ArrowUpDown size={13} className="text-gray-400 ml-1 inline" />;
  return order === 'asc'
    ? <ArrowUp size={13} className="text-blue-500 ml-1 inline" />
    : <ArrowDown size={13} className="text-blue-500 ml-1 inline" />;
};

const IncidentsPage = () => {
  const [incidents, setIncidents]   = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading]       = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters]       = useState({ status: 'all', priority: 'all', search: '', dateFrom: '', dateTo: '' });
  const [sort, setSort]             = useState({ field: 'createdAt', order: 'desc' });
  const [page, setPage]             = useState(1);
  const toast    = useToast();
  const navigate = useNavigate();

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, sortField: sort.field, sortOrder: sort.order, ...filters };
      const { data } = await supervisorAPI.getIncidents(params);
      setIncidents(data.data.incidents);
      setPagination(data.data.pagination);
    } catch {
      toast.error('Failed to load incidents.');
    } finally {
      setLoading(false);
    }
  }, [page, filters, sort]);

  useEffect(() => { fetchIncidents(); }, [fetchIncidents]);

  const handleSort = (field) => {
    setSort((prev) => ({ field, order: prev.field === field && prev.order === 'desc' ? 'asc' : 'desc' }));
    setPage(1);
  };

  const handleFilterChange = (key, val) => {
    setFilters((p) => ({ ...p, [key]: val }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ status: 'all', priority: 'all', search: '', dateFrom: '', dateTo: '' });
    setPage(1);
  };

  const hasActiveFilters = filters.status !== 'all' || filters.priority !== 'all' || filters.search || filters.dateFrom || filters.dateTo;

  const getLocation = (loc) => {
    if (!loc) return '—';
    if (typeof loc === 'string') return loc;
    return loc.manualAddress || loc.building || loc.zone || '—';
  };

  const sortableCols = ['title', 'location', 'priority', 'status', 'createdAt'];

  const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 bg-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 placeholder-gray-400 transition-colors';

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Team Reports</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {pagination.total} incident{pagination.total !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-colors
            ${showFilters || hasActiveFilters
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'}`}
        >
          <SlidersHorizontal size={15} />
          Filters
          {hasActiveFilters && (
            <span className="w-5 h-5 rounded-full bg-white text-blue-600 text-xs font-bold flex items-center justify-center">
              !
            </span>
          )}
        </button>
      </div>

      {/* Search bar — always visible */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 mb-4">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, description, location..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className={inputClass + ' pl-9'}
          />
          {filters.search && (
            <button onClick={() => handleFilterChange('search', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">Status</label>
              <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} className={inputClass}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">Priority</label>
              <select value={filters.priority} onChange={(e) => handleFilterChange('priority', e.target.value)} className={inputClass}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p === 'all' ? 'All Priorities' : p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">From Date</label>
              <input type="date" value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">To Date</label>
              <input type="date" value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)} className={inputClass} />
            </div>
          </div>
          {hasActiveFilters && (
            <button onClick={clearFilters}
              className="flex items-center gap-1.5 text-xs text-red-500 font-semibold hover:text-red-700 transition-colors">
              <X size={13} /> Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Active filter pills */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap mb-4">
          {filters.status !== 'all' && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
              Status: {filters.status}
              <button onClick={() => handleFilterChange('status', 'all')}><X size={11} /></button>
            </span>
          )}
          {filters.priority !== 'all' && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
              Priority: {filters.priority}
              <button onClick={() => handleFilterChange('priority', 'all')}><X size={11} /></button>
            </span>
          )}
          {filters.dateFrom && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
              From: {filters.dateFrom}
              <button onClick={() => handleFilterChange('dateFrom', '')}><X size={11} /></button>
            </span>
          )}
          {filters.dateTo && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
              To: {filters.dateTo}
              <button onClick={() => handleFilterChange('dateTo', '')}><X size={11} /></button>
            </span>
          )}
        </div>
      )}

      {/* Table card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader text="Loading incidents…" />
          </div>
        ) : incidents.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-600 font-semibold">No incidents found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="mt-3 text-xs text-blue-600 font-semibold hover:underline">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {[
                    { key: 'title',      label: 'Incident'  },
                    { key: 'reportedBy', label: 'Reporter'  },
                    { key: 'location',   label: 'Location'  },
                    { key: 'priority',   label: 'Priority'  },
                    { key: 'status',     label: 'Status'    },
                    { key: 'createdAt',  label: 'Date'      },
                  ].map((col) => (
                    <th key={col.key}
                      onClick={() => sortableCols.includes(col.key) && handleSort(col.key)}
                      className={`px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider select-none
                        ${sortableCols.includes(col.key) ? 'cursor-pointer hover:text-gray-800' : ''}`}>
                      {col.label}
                      {sortableCols.includes(col.key) && (
                        <SortIcon field={col.key} current={sort.field} order={sort.order} />
                      )}
                    </th>
                  ))}
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {incidents.map((inc, i) => (
                  <tr key={inc._id}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                    onClick={() => navigate(`/supervisor/incidents/${inc._id}`)}>

                    {/* Incident */}
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900 truncate max-w-[180px]">{inc.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 capitalize">{inc.type?.replace(/_/g, ' ')}</p>
                    </td>

                    {/* Reporter */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {inc.reportedBy?.name?.slice(0, 2).toUpperCase() || '??'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{inc.reportedBy?.name || '—'}</p>
                          <p className="text-xs text-gray-400 capitalize">{inc.reportedBy?.department || ''}</p>
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-600 truncate max-w-[120px]">{getLocation(inc.location)}</p>
                    </td>

                    {/* Priority */}
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${PRIORITY_STYLE[inc.priority] || 'bg-gray-100 text-gray-600'}`}>
                        {inc.priority}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLE[inc.status] || 'bg-gray-100 text-gray-600'}`}>
                        {inc.status?.replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-600 whitespace-nowrap">
                        {new Date(inc.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/supervisor/incidents/${inc._id}`)}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                      >
                        Review →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && incidents.length > 0 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">
              Showing <span className="font-semibold text-gray-700">
                {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)}
              </span> of <span className="font-semibold text-gray-700">{pagination.total}</span>
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed bg-white transition-colors"
              >
                <ChevronLeft size={13} /> Prev
              </button>
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const p = i + 1;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors
                      ${page === p ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'}`}>
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed bg-white transition-colors"
              >
                Next <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentsPage;