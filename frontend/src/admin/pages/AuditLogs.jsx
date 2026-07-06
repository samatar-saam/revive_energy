// src/admin/pages/AuditLogs.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  X,
  User,
  Shield,
  Mail,
  Phone,
  MapPin,
  Monitor,
  Globe,
  Calendar,
  Download,
  FileSpreadsheet,
  File,
  Printer,
  Flag,
  AlertTriangle,
  Info,
  Check,
  DollarSign,
  Users,
} from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const EVENT_TYPES = [
  'user_login',
  'failed_login',
  'payment_created',
  'payment_released',
  'payment_refunded',
  'withdrawal_requested',
  'withdrawal_approved',
  'withdrawal_rejected',
  'user_created',
  'user_updated',
  'user_deleted',
  'listing_created',
  'listing_updated',
  'listing_deleted',
  'admin_login',
  'settings_updated',
  'dispute_created',
  'dispute_resolved',
];

export default function AuditLogs() {
  // ─── State ──────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({});
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [eventType, setEventType] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(20);

  // UI State
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const getToken = () => localStorage.getItem('token');

  // ─── Data fetching ─────────────────────────────────────────────
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }
      const params = new URLSearchParams({
        page: currentPage,
        per_page: pageSize,
        event_type: eventType !== 'all' ? eventType : '',
        search: searchQuery,
        date_from: dateFrom,
        date_to: dateTo,
      });
      const res = await fetch(`${API_URL}/admin/audit-logs?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setLogs(data.data || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, eventType, searchQuery, dateFrom, dateTo]);

  const fetchStats = async () => {
    try {
      const token = getToken();
      if (!token) return;
      const res = await fetch(`${API_URL}/admin/audit-logs/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error('Stats error:', e);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [fetchLogs]);

  // ─── Export functions ──────────────────────────────────────────
  const exportData = (format) => {
    toast.info(`Exporting as ${format}... (coming soon)`);
  };

  // ─── Helpers ──────────────────────────────────────────────────
  const formatDate = (date) =>
    date ? new Date(date).toLocaleString() : 'N/A';

  const getEventBadge = (event) => {
    if (event.includes('login')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (event.includes('failed')) return 'bg-red-50 text-red-700 border-red-200';
    if (event.includes('payment') || event.includes('withdrawal')) return 'bg-green-50 text-green-700 border-green-200';
    if (event.includes('user') || event.includes('listing')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (event.includes('admin') || event.includes('settings')) return 'bg-orange-50 text-orange-700 border-orange-200';
    if (event.includes('dispute')) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getStatusColor = (status) => {
    if (status === 'success') return 'text-green-600';
    if (status === 'warning') return 'text-yellow-600';
    if (status === 'error') return 'text-red-600';
    return 'text-blue-600';
  };

  // ─── Render ────────────────────────────────────────────────────
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={() => { fetchLogs(); fetchStats(); }} />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Inter']">
      {/* ─── Fonts ────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono-cw { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl lg:text-3xl font-bold text-gray-900">Audit Logs</h2>
            <p className="text-sm text-gray-500 mt-1">Track every action performed on the platform</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { fetchLogs(); fetchStats(); }} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm">
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
            <div className="flex gap-1">
              <button onClick={() => exportData('csv')} className="rounded-xl border border-gray-200 bg-white p-2 hover:bg-gray-50" title="Export CSV">
                <FileSpreadsheet className="h-4 w-4 text-gray-500" />
              </button>
              <button onClick={() => exportData('excel')} className="rounded-xl border border-gray-200 bg-white p-2 hover:bg-gray-50" title="Export Excel">
                <File className="h-4 w-4 text-gray-500" />
              </button>
              <button onClick={() => exportData('pdf')} className="rounded-xl border border-gray-200 bg-white p-2 hover:bg-gray-50" title="Export PDF">
                <FileText className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard label="Total Logs" value={stats.total || 0} icon={FileText} color="blue" />
          <StatCard label="Login Events" value={stats.login_events || 0} icon={User} color="blue" />
          <StatCard label="Payment Actions" value={stats.payment_actions || 0} icon={DollarSign} color="green" />
          <StatCard label="User Actions" value={stats.user_actions || 0} icon={Users} color="purple" />
          <StatCard label="Admin Actions" value={stats.admin_actions || 0} icon={Shield} color="orange" />
          <StatCard label="Security Events" value={stats.security_events || 0} icon={AlertCircle} color="red" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by user, email, IP, event ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Events</option>
              {EVENT_TYPES.map((e) => (
                <option key={e} value={e}>{e.replace(/_/g, ' ').toUpperCase()}</option>
              ))}
            </select>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={() => { setCurrentPage(1); fetchLogs(); }}
              className="rounded-xl bg-[#11402D] px-5 py-2 text-sm font-bold text-white hover:bg-[#0E2A1C] transition shadow-sm"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full min-w-[1200px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Log ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Event</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">IP</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Device</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Location</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.length === 0 ? (
                <tr><td colSpan="10" className="px-4 py-12 text-center text-gray-500">No logs found</td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-4 py-3 font-mono-cw text-sm text-gray-500">#{log.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{log.user_name || 'System'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium border ${getEventBadge(log.event)}`}>
                        {log.event.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-[150px]">{log.description}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{log.ip_address || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{log.device || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{log.location || '—'}</td>
                    <td className="px-4 py-3 text-sm font-mono-cw text-gray-500">{formatDate(log.created_at)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-sm font-medium ${getStatusColor(log.status)}`}>
                        {log.status === 'success' && <CheckCircle className="h-4 w-4" />}
                        {log.status === 'warning' && <AlertTriangle className="h-4 w-4" />}
                        {log.status === 'error' && <AlertCircle className="h-4 w-4" />}
                        {log.status === 'info' && <Info className="h-4 w-4" />}
                        {log.status || 'info'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => { setSelectedLog(log); setShowDetailModal(true); }}
                        className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-[#11402D]"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(p-1, 1))}
                disabled={currentPage === 1}
                className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(p+1, totalPages))}
                disabled={currentPage === totalPages}
                className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedLog && (
          <DetailModal log={selectedLog} onClose={() => setShowDetailModal(false)} />
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    red: 'bg-red-50 text-red-600 border-red-100',
  };
  const style = colorMap[color] || colorMap.blue;
  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border ${style}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl ${style}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="font-display text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#11402D] border-t-[#9CF06B] rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-gray-500 font-display">Loading...</p>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 font-display">Unable to load</h3>
        <p className="text-gray-500 mt-2">{message}</p>
        <button onClick={onRetry} className="mt-4 px-6 py-2 bg-[#11402D] text-white rounded-xl hover:bg-[#0E2A1C] transition">Try Again</button>
      </div>
    </div>
  );
}

function DetailModal({ log, onClose }) {
  const formatDate = (d) => d ? new Date(d).toLocaleString() : 'N/A';
  const getStatusColor = (status) => {
    if (status === 'success') return 'text-green-600';
    if (status === 'warning') return 'text-yellow-600';
    if (status === 'error') return 'text-red-600';
    return 'text-blue-600';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl font-bold text-gray-900">Log Details #{log.id}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><X className="h-5 w-5 text-gray-500" /></button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">Event</p>
              <p className="mt-1 text-sm font-medium">{log.event}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">Status</p>
              <span className={`inline-flex items-center gap-1 text-sm font-medium ${getStatusColor(log.status)}`}>
                {log.status || 'info'}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">User</p>
              <p className="mt-1 text-sm">{log.user_name || 'System'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">Role</p>
              <p className="mt-1 text-sm">{log.user_role || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">IP Address</p>
              <p className="mt-1 text-sm">{log.ip_address || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">Device</p>
              <p className="mt-1 text-sm">{log.device || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">Browser</p>
              <p className="mt-1 text-sm">{log.browser || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">Location</p>
              <p className="mt-1 text-sm">{log.location || '—'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-semibold uppercase text-gray-400">Description</p>
              <p className="mt-1 text-sm">{log.description}</p>
            </div>
          </div>

          {log.request_payload && (
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">Request Payload</p>
              <pre className="mt-1 p-2 bg-gray-50 rounded-xl text-xs overflow-x-auto">{JSON.stringify(log.request_payload, null, 2)}</pre>
            </div>
          )}
          {log.response_payload && (
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">Response Payload</p>
              <pre className="mt-1 p-2 bg-gray-50 rounded-xl text-xs overflow-x-auto">{JSON.stringify(log.response_payload, null, 2)}</pre>
            </div>
          )}
          {log.previous_values && (
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">Previous Values</p>
              <pre className="mt-1 p-2 bg-gray-50 rounded-xl text-xs overflow-x-auto">{JSON.stringify(log.previous_values, null, 2)}</pre>
            </div>
          )}
          {log.new_values && (
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">New Values</p>
              <pre className="mt-1 p-2 bg-gray-50 rounded-xl text-xs overflow-x-auto">{JSON.stringify(log.new_values, null, 2)}</pre>
            </div>
          )}
          <div className="border-t border-gray-100 pt-2 text-xs text-gray-400">
            Admin Responsible: {log.admin_name || '—'} &bull; Timestamp: {formatDate(log.created_at)}
          </div>
        </div>
      </div>
    </div>
  );
}