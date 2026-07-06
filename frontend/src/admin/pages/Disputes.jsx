// src/admin/pages/Disputes.jsx
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
  Plus,
  Minus,
  Shield,
  User,
  Truck,
  Building2,
  Calendar,
  DollarSign,
  Upload,
  MessageSquare,
  History,
  Zap,
  Ban,
  Flag,
  Check,
  Send,
  Download,
  Image,
  Link,
  ArrowUpRight,
} from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper functions (moved outside for reuse)
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount || 0);
}

function formatDate(date) {
  return date ? new Date(date).toLocaleString() : 'N/A';
}

function getStatusBadge(status) {
  const map = {
    open: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    under_investigation: 'bg-blue-50 text-blue-700 border-blue-200',
    awaiting_response: 'bg-purple-50 text-purple-700 border-purple-200',
    resolved: 'bg-green-50 text-green-700 border-green-200',
    closed: 'bg-gray-50 text-gray-700 border-gray-200',
    refunded: 'bg-red-50 text-red-700 border-red-200',
  };
  return map[status] || 'bg-gray-50 text-gray-700 border-gray-200';
}

function getEscrowBadge(status) {
  const map = {
    held: 'bg-blue-50 text-blue-700 border-blue-200',
    frozen: 'bg-red-50 text-red-700 border-red-200',
    released: 'bg-green-50 text-green-700 border-green-200',
    refunded: 'bg-gray-50 text-gray-700 border-gray-200',
  };
  return map[status] || 'bg-gray-50 text-gray-700 border-gray-200';
}

export default function Disputes() {
  // ─── State ──────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [disputes, setDisputes] = useState([]);
  const [stats, setStats] = useState({});
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);

  // UI State
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [actionConfirm, setActionConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState(null);

  const getToken = () => localStorage.getItem('token');

  // ─── Data fetching ─────────────────────────────────────────────
  const fetchDisputes = useCallback(async () => {
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
        status: filterStatus !== 'all' ? filterStatus : '',
        search: searchQuery,
      });
      const res = await fetch(`${API_URL}/admin/disputes?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setDisputes(data.data || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterStatus, searchQuery]);

  const fetchStats = async () => {
    try {
      const token = getToken();
      if (!token) return;
      const res = await fetch(`${API_URL}/admin/disputes/stats`, {
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
    fetchDisputes();
    fetchStats();
  }, [fetchDisputes]);

  // ─── Actions ──────────────────────────────────────────────────
  const handleAction = async (disputeId, action, payload = {}) => {
    setActionLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/admin/disputes/${disputeId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, ...payload }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Action failed');
      }
      toast.success(`Action "${action}" performed successfully`);
      setActionConfirm(null);
      fetchDisputes();
      fetchStats();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={() => { fetchDisputes(); fetchStats(); }} />;

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
            <h2 className="font-display text-2xl lg:text-3xl font-bold text-gray-900">Disputes Management</h2>
            <p className="text-sm text-gray-500 mt-1">Resolve conflicts between suppliers, producers, and transporters</p>
          </div>
          <button
            onClick={() => { fetchDisputes(); fetchStats(); }}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard label="Total Disputes" value={stats.total || 0} icon={AlertCircle} color="blue" />
          <StatCard label="Open" value={stats.open || 0} icon={Clock} color="yellow" />
          <StatCard label="Under Investigation" value={stats.under_investigation || 0} icon={Search} color="blue" />
          <StatCard label="Resolved" value={stats.resolved || 0} icon={CheckCircle} color="green" />
          <StatCard label="Refunded" value={stats.refunded || 0} icon={DollarSign} color="red" />
          <StatCard label="Escrow Frozen" value={stats.frozen_escrow || 0} icon={Ban} color="red" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ID, producer, supplier, transporter, payment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="under_investigation">Under Investigation</option>
              <option value="awaiting_response">Awaiting Response</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
              <option value="refunded">Refunded</option>
            </select>
            <button
              onClick={() => { setCurrentPage(1); fetchDisputes(); }}
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
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Payment</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Producer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Supplier</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Transporter</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Waste</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Reason</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Escrow</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Date</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {disputes.length === 0 ? (
                <tr><td colSpan="11" className="px-4 py-12 text-center text-gray-500">No disputes found</td></tr>
              ) : (
                disputes.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-4 py-3 font-mono-cw text-sm text-gray-500">#{d.id}</td>
                    <td className="px-4 py-3 font-mono-cw text-sm text-gray-500">#{d.payment_id}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{d.producer_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{d.supplier_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{d.transporter_name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{d.waste_type}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-[120px]">{d.reason}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium border ${getStatusBadge(d.status)}`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium border ${getEscrowBadge(d.escrow_status)}`}>
                        {d.escrow_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono-cw text-gray-500">{formatDate(d.created_at)}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => { setSelectedDispute(d); setShowDetailDrawer(true); }}
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

        {/* Detail Drawer */}
        {showDetailDrawer && selectedDispute && (
          <DetailDrawer
            dispute={selectedDispute}
            onClose={() => setShowDetailDrawer(false)}
            onAction={(action, payload) => {
              setActionConfirm({ disputeId: selectedDispute.id, action, payload });
            }}
            onViewEvidence={(evidence) => {
              setSelectedEvidence(evidence);
              setShowEvidenceModal(true);
            }}
          />
        )}

        {/* Action Confirmation Modal */}
        {actionConfirm && (
          <ConfirmationModal
            title={`Confirm ${actionConfirm.action}`}
            message={`Are you sure you want to "${actionConfirm.action}" on dispute #${actionConfirm.disputeId}?`}
            onConfirm={() => handleAction(actionConfirm.disputeId, actionConfirm.action, actionConfirm.payload)}
            onCancel={() => setActionConfirm(null)}
            loading={actionLoading}
          />
        )}

        {/* Evidence Modal */}
        {showEvidenceModal && selectedEvidence && (
          <EvidenceModal evidence={selectedEvidence} onClose={() => setShowEvidenceModal(false)} />
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    green: 'bg-green-50 text-green-600 border-green-100',
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

function ConfirmationModal({ title, message, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <h3 className="font-display text-lg font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-2">{message}</p>
        <div className="flex gap-3 mt-6">
          <button onClick={onCancel} className="flex-1 rounded-xl border border-gray-200 py-2.5 font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 rounded-xl bg-[#11402D] py-2.5 font-bold text-white hover:bg-[#0E2A1C] disabled:opacity-70">
            {loading ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailDrawer({ dispute, onClose, onAction, onViewEvidence }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/30">
      <div className="relative h-full w-full max-w-2xl bg-white shadow-2xl overflow-y-auto animate-slide-in-right">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-gray-900">Dispute Details #{dispute.id}</h2>
          <button onClick={onClose} className="rounded-xl p-2 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          {/* Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">Status</p>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium border ${getStatusBadge(dispute.status)}`}>
                {dispute.status}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">Escrow</p>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium border ${getEscrowBadge(dispute.escrow_status)}`}>
                {dispute.escrow_status}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">Payment ID</p>
              <p className="mt-1 font-mono-cw text-sm">#{dispute.payment_id}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">Amount</p>
              <p className="mt-1 font-medium">{formatCurrency(dispute.amount)}</p>
            </div>
          </div>

          {/* Participants */}
          <div className="border-t border-gray-100 pt-4">
            <h3 className="font-display font-semibold text-gray-700 mb-3">Participants</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-400">Producer</p>
                <p className="text-sm font-medium">{dispute.producer_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Supplier</p>
                <p className="text-sm font-medium">{dispute.supplier_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Transporter</p>
                <p className="text-sm font-medium">{dispute.transporter_name || '—'}</p>
              </div>
            </div>
          </div>

          {/* Complaint & Evidence */}
          <div className="border-t border-gray-100 pt-4">
            <h3 className="font-display font-semibold text-gray-700 mb-2">Complaint</h3>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-xl">{dispute.reason}</p>
            {dispute.evidence && dispute.evidence.length > 0 && (
              <div className="mt-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Evidence</h4>
                <div className="flex flex-wrap gap-2">
                  {dispute.evidence.map((ev, idx) => (
                    <button
                      key={idx}
                      onClick={() => onViewEvidence(ev)}
                      className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1 text-sm hover:bg-gray-50"
                    >
                      <FileText className="h-4 w-4" /> {ev.name || `File ${idx+1}`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Timeline */}
          {dispute.timeline && (
            <div className="border-t border-gray-100 pt-4">
              <h3 className="font-display font-semibold text-gray-700 mb-3">Timeline</h3>
              <div className="space-y-2">
                {dispute.timeline.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#11402D] mt-2" />
                    <div>
                      <p className="text-sm">{item.description}</p>
                      <p className="text-xs font-mono-cw text-gray-400">{formatDate(item.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="border-t border-gray-100 pt-4">
            <h3 className="font-display font-semibold text-gray-700 mb-3">Admin Actions</h3>
            <div className="flex flex-wrap gap-2">
              {dispute.status === 'open' && (
                <>
                  <button onClick={() => onAction('request_more_info')} className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" /> Request Info
                  </button>
                  <button onClick={() => onAction('freeze_escrow')} className="rounded-xl bg-red-100 text-red-700 px-4 py-2 text-sm hover:bg-red-200 flex items-center gap-1">
                    <Ban className="h-4 w-4" /> Freeze Escrow
                  </button>
                </>
              )}
              {dispute.escrow_status === 'frozen' && (
                <button onClick={() => onAction('release_escrow')} className="rounded-xl bg-green-100 text-green-700 px-4 py-2 text-sm hover:bg-green-200 flex items-center gap-1">
                  <Check className="h-4 w-4" /> Release Escrow
                </button>
              )}
              <button onClick={() => onAction('refund_producer')} className="rounded-xl bg-yellow-100 text-yellow-700 px-4 py-2 text-sm hover:bg-yellow-200 flex items-center gap-1">
                <DollarSign className="h-4 w-4" /> Refund Producer
              </button>
              <button onClick={() => onAction('reject')} className="rounded-xl bg-red-100 text-red-700 px-4 py-2 text-sm hover:bg-red-200 flex items-center gap-1">
                <X className="h-4 w-4" /> Reject
              </button>
              <button onClick={() => onAction('resolve')} className="rounded-xl bg-green-100 text-green-700 px-4 py-2 text-sm hover:bg-green-200 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" /> Resolve
              </button>
              <button onClick={() => onAction('close')} className="rounded-xl bg-gray-100 text-gray-700 px-4 py-2 text-sm hover:bg-gray-200 flex items-center gap-1">
                <X className="h-4 w-4" /> Close Case
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EvidenceModal({ evidence, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-bold text-gray-900">Evidence</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><X className="h-5 w-5 text-gray-500" /></button>
        </div>
        <div className="space-y-4">
          {evidence.url && (
            <div>
              <p className="text-sm font-medium text-gray-700">File</p>
              <a href={evidence.url} target="_blank" rel="noopener noreferrer" className="text-[#11402D] underline text-sm flex items-center gap-1">
                View File <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          )}
          {evidence.image && (
            <div>
              <p className="text-sm font-medium text-gray-700">Image</p>
              <img src={evidence.image} alt="evidence" className="max-h-64 rounded-xl border" />
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-700">Description</p>
            <p className="text-sm text-gray-600">{evidence.description || 'No description'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}