// src/admin/pages/Payments.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  DollarSign,
  CreditCard,
  Wallet,
  TrendingUp,
  CheckCircle,
  Clock,
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Download,
  FileText,
  Check,
  X,
  RefreshCw,
  AlertCircle,
  ArrowUpDown,
  Calendar,
  Users,
  Truck,
  Package,
  Receipt,
  Shield,
  ArrowRight,
  AlertTriangle,
  User,
} from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── Helper functions ───────────────────────────────────────────
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(amount || 0);
}

function formatDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-KE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusBadge(status) {
  const map = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    released: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    failed: 'bg-rose-50 text-rose-700 border-rose-200',
    refunded: 'bg-slate-50 text-slate-700 border-slate-200',
  };
  return map[status] || 'bg-slate-50 text-slate-700 border-slate-200';
}

function getEscrowBadge(escrowStatus, paymentStatus, isReadyForRelease) {
  if (isReadyForRelease) {
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  }
  const map = {
    held: 'bg-blue-50 text-blue-700 border-blue-200',
    released: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    refunded: 'bg-slate-50 text-slate-700 border-slate-200',
    waiting: 'bg-amber-50 text-amber-700 border-amber-200',
  };
  return map[escrowStatus] || 'bg-slate-50 text-slate-700 border-slate-200';
}

function getEscrowLabel(escrowStatus, isReadyForRelease) {
  if (isReadyForRelease) return 'Ready to Release';
  const map = {
    held: 'Held',
    released: 'Released',
    refunded: 'Refunded',
    waiting: 'Waiting',
  };
  return map[escrowStatus] || 'Unknown';
}

export default function Payments() {
  // ─── State ──────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [escrowStats, setEscrowStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterEscrow, setFilterEscrow] = useState('all');
  const [filterReady, setFilterReady] = useState('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);

  // Sorting
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // UI State
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [showReleaseConfirm, setShowReleaseConfirm] = useState(false);
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);
  const [showNotConfirmedModal, setShowNotConfirmedModal] = useState(false);
  const [notConfirmedPayment, setNotConfirmedPayment] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const getToken = () => localStorage.getItem('token');

  // ─── Data fetching ─────────────────────────────────────────────
  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        setError('Not authenticated. Please login.');
        setLoading(false);
        return;
      }

      const params = new URLSearchParams({
        page: currentPage,
        per_page: pageSize,
        sort_field: sortField,
        sort_order: sortOrder,
      });
      if (searchQuery) params.append('search', searchQuery);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterEscrow !== 'all') params.append('escrow_status', filterEscrow);
      if (filterDateFrom) params.append('date_from', filterDateFrom);
      if (filterDateTo) params.append('date_to', filterDateTo);

      const res = await fetch(`${API_URL}/admin/payments?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) {
        setError('Session expired. Please login again.');
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setPayments(data.data || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError(err.message);
      toast.error(err.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, sortField, sortOrder, searchQuery, filterStatus, filterEscrow, filterDateFrom, filterDateTo]);

  const fetchEscrowStats = async () => {
    try {
      const token = getToken();
      if (!token) return;
      const res = await fetch(`${API_URL}/admin/payments/escrow-stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEscrowStats(data);
      }
    } catch (e) {
      console.error('Escrow stats error:', e);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const token = getToken();
      if (!token) return;
      const res = await fetch(`${API_URL}/admin/payments/activity`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRecentActivity(data.slice(0, 5));
      }
    } catch (e) {
      console.error('Activity error:', e);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchEscrowStats();
    fetchRecentActivity();
  }, [fetchPayments]);

  // ─── Compute readiness and eligibility ──────────────────────
  const isReadyForRelease = (payment) => {
    return payment.escrow_status === 'held' && 
           (payment.status === 'paid' || payment.status === 'completed');
  };

  // ─── Apply filters ──────────────────────────────────────────────
  const filteredPayments = useMemo(() => {
    let filtered = payments;

    if (filterReady === 'ready') {
      filtered = filtered.filter(p => isReadyForRelease(p));
    } else if (filterReady === 'not_ready') {
      filtered = filtered.filter(p => !isReadyForRelease(p));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p => 
        (p.id && p.id.toString().includes(q)) ||
        (p.producer_name && p.producer_name.toLowerCase().includes(q)) ||
        (p.supplier_name && p.supplier_name.toLowerCase().includes(q)) ||
        (p.transporter_name && p.transporter_name.toLowerCase().includes(q) && p.transporter_name !== 'Not assigned') ||
        (p.mpesa_receipt && p.mpesa_receipt.toLowerCase().includes(q)) ||
        (p.receipt_number && p.receipt_number.toLowerCase().includes(q))
      );
    }

    return filtered;
  }, [payments, filterReady, searchQuery]);

  // ─── Actions ──────────────────────────────────────────────────
  const handleRelease = async (paymentId) => {
    setActionLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/admin/payments/${paymentId}/release`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.code === 'producer_not_confirmed') {
          const payment = payments.find(p => p.id === paymentId);
          setNotConfirmedPayment(payment || { id: paymentId });
          setShowNotConfirmedModal(true);
          setShowReleaseConfirm(false);
          return;
        }
        throw new Error(data.message || 'Release failed');
      }

      toast.success('Payment released successfully');
      setShowReleaseConfirm(false);
      fetchPayments();
      fetchEscrowStats();
      fetchRecentActivity();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefund = async (paymentId) => {
    setActionLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/admin/payments/${paymentId}/refund`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Refund failed');
      }
      toast.success('Payment refunded successfully');
      setShowRefundConfirm(false);
      fetchPayments();
      fetchEscrowStats();
      fetchRecentActivity();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const downloadReceipt = async (paymentId) => {
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/admin/payments/${paymentId}/receipt`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to download receipt');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${paymentId}.pdf`;
      a.click();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const downloadInvoice = async (paymentId) => {
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/admin/payments/${paymentId}/invoice`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to download invoice');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${paymentId}.pdf`;
      a.click();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // ─── Compute summary stats ────────────────────────────────────
  const stats = useMemo(() => {
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const successful = payments.filter(p => p.status === 'completed' || p.status === 'paid').length;
    const pending = payments.filter(p => p.status === 'pending').length;
    const platformEarnings = payments.reduce((sum, p) => sum + (p.platform_fee || 0), 0);
    const readyToRelease = payments.filter(p => isReadyForRelease(p)).length;
    return { totalRevenue, successful, pending, platformEarnings, readyToRelease };
  }, [payments]);

  // ─── Helper: display transporter name ─────────────────────────
  const getTransporterDisplay = (payment) => {
    if (!payment.transporter_name || payment.transporter_name === 'Not assigned' || payment.transporter_name === '—') {
      return 'Not assigned';
    }
    return payment.transporter_name;
  };

  // ─── Loading / Error states ────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#11402D] border-t-[#9CF06B] rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500 font-display">Loading payments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 font-display">Unable to load payments</h3>
          <p className="text-gray-500 mt-2">{error}</p>
          <button
            onClick={() => fetchPayments()}
            className="mt-4 px-6 py-2 bg-[#11402D] text-white rounded-xl hover:bg-[#0E2A1C] transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Inter']">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono-cw { font-family: 'JetBrains Mono', monospace; }
        .shadow-soft { box-shadow: 0 2px 15px -3px rgba(0,0,0,0.05), 0 1px 4px -2px rgba(0,0,0,0.02); }
        .shadow-card { box-shadow: 0 4px 20px -6px rgba(0,0,0,0.06), 0 2px 8px -4px rgba(0,0,0,0.02); }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>

      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* ─── Header ────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl lg:text-3xl font-bold text-gray-900">Payments Management</h2>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
              Monitor producer payments, escrow balances, supplier payouts, transporter payouts, refunds, and platform revenue.
            </p>
          </div>
          <button
            onClick={() => { fetchPayments(); fetchEscrowStats(); fetchRecentActivity(); }}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-soft"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* ─── Summary Cards ────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            label="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon={DollarSign}
            color="green"
            trend="+12.5%"
          />
          <StatCard
            label="Escrow Balance"
            value={formatCurrency(escrowStats?.held || 0)}
            icon={Wallet}
            color="blue"
            subtitle="Held in escrow"
          />
          <StatCard
            label="Platform Earnings"
            value={formatCurrency(stats.platformEarnings)}
            icon={TrendingUp}
            color="orange"
          />
          <StatCard
            label="Successful Payments"
            value={stats.successful}
            icon={CheckCircle}
            color="emerald"
            subtitle={`${stats.pending} pending`}
          />
          <StatCard
            label="Ready to Release"
            value={stats.readyToRelease}
            icon={Check}
            color="indigo"
            subtitle="Awaiting admin action"
          />
        </div>

        {/* ─── Escrow Summary Bar ────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-8 flex-wrap">
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Held</span>
              <p className="font-display text-xl font-bold text-blue-600">{formatCurrency(escrowStats?.held || 0)}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Released</span>
              <p className="font-display text-xl font-bold text-emerald-600">{formatCurrency(escrowStats?.released || 0)}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Refunded</span>
              <p className="font-display text-xl font-bold text-slate-600">{formatCurrency(escrowStats?.refunded || 0)}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Platform Fees</span>
              <p className="font-display text-xl font-bold text-amber-600">{formatCurrency(escrowStats?.platform_fees || 0)}</p>
            </div>
          </div>
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            All amounts in KES
          </div>
        </div>

        {/* ─── Recent Activity ───────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-gray-700 flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4" /> Recent Activity
            </h3>
            <span className="text-xs text-gray-400">Last 5 events</span>
          </div>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-3">No recent activity</p>
          ) : (
            <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{activity.event}</p>
                    <p className="text-xs text-gray-400">{activity.description}</p>
                  </div>
                  <span className="text-xs font-mono-cw text-gray-400">{formatDate(activity.timestamp)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── Filters ────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by receipt, producer, supplier, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/60 py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#11402D]/20 focus:border-[#11402D] transition"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#11402D]/20"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
              <select
                value={filterEscrow}
                onChange={(e) => setFilterEscrow(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#11402D]/20"
              >
                <option value="all">All Escrow</option>
                <option value="held">Held</option>
                <option value="released">Released</option>
                <option value="refunded">Refunded</option>
                <option value="waiting">Waiting</option>
              </select>
              <select
                value={filterReady}
                onChange={(e) => setFilterReady(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#11402D]/20"
              >
                <option value="all">All</option>
                <option value="ready">Ready to Release</option>
                <option value="not_ready">Not Ready</option>
              </select>
              <div className="flex items-center gap-1">
                <input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#11402D]/20 w-36"
                  placeholder="From"
                />
                <span className="text-gray-400">—</span>
                <input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#11402D]/20 w-36"
                  placeholder="To"
                />
              </div>
              <button
                onClick={() => { setCurrentPage(1); fetchPayments(); }}
                className="rounded-xl bg-[#11402D] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#0E2A1C] transition shadow-soft"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* ─── Table ───────────────────────────────────────────────── */}
        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-card">
          <table className="w-full min-w-[1400px]">
            <thead className="bg-gray-50/80 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase text-gray-500 cursor-pointer hover:text-gray-700 transition" onClick={() => handleSort('id')}>
                  ID {sortField === 'id' && <ArrowUpDown className="inline h-3 w-3 ml-1" />}
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase text-gray-500">Producer</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase text-gray-500">Supplier</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase text-gray-500">Transporter</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase text-gray-500">Waste</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase text-gray-500">Qty</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase text-gray-500">Amount</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase text-gray-500">Transport</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase text-gray-500">Platform</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase text-gray-500">Total</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase text-gray-500">Receipt</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase text-gray-500">Escrow</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase text-gray-500">Date</th>
                <th className="px-4 py-3.5 text-center text-xs font-semibold uppercase text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="15" className="px-4 py-12 text-center text-gray-500">No payments found</td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const ready = isReadyForRelease(p);
                  const isHeldAndPaid = p.escrow_status === 'held' && (p.status === 'paid' || p.status === 'completed');
                  const transporterDisplay = getTransporterDisplay(p);
                  
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/60 transition">
                      <td className="px-4 py-3 font-mono-cw text-sm text-gray-500">#{p.id}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-700">{p.producer_name || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{p.supplier_name || '—'}</td>
                      <td className="px-4 py-3 text-sm">
                        {transporterDisplay === 'Not assigned' ? (
                          <span className="inline-flex items-center gap-1 text-gray-400">
                            <User className="w-3 h-3" />
                            Not assigned
                          </span>
                        ) : (
                          <span className="text-gray-700">{transporterDisplay}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{p.waste_type || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{p.quantity || 0} {p.unit || 'kg'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(p.waste_amount)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(p.transport_fee)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(p.platform_fee)}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{formatCurrency(p.total_amount || p.amount)}</td>
                      <td className="px-4 py-3 text-sm font-mono-cw text-gray-500">{p.mpesa_receipt || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium border ${getEscrowBadge(p.escrow_status, p.status, ready)}`}>
                            {getEscrowLabel(p.escrow_status, ready)}
                          </span>
                          {ready && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200">
                              <Check className="w-3 h-3" />
                              Ready
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium border ${getStatusBadge(p.status)}`}>
                          {p.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono-cw text-gray-500">{formatDate(p.created_at)}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => { setSelectedPayment(p); setShowDetailDrawer(true); }}
                            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-[#11402D]"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => downloadReceipt(p.id)}
                            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-blue-600"
                            title="Download Receipt"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => downloadInvoice(p.id)}
                            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-purple-600"
                            title="Download Invoice"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                          {isHeldAndPaid && (
                            <button
                              onClick={() => { setSelectedPayment(p); setShowReleaseConfirm(true); }}
                              className="rounded-lg p-1.5 text-emerald-500 transition hover:bg-gray-100 hover:text-emerald-700"
                              title="Release Payment"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          {p.escrow_status === 'held' && !isHeldAndPaid && (
                            <button
                              onClick={() => { setSelectedPayment(p); setShowRefundConfirm(true); }}
                              className="rounded-lg p-1.5 text-red-400 transition hover:bg-gray-100 hover:text-red-600"
                              title="Refund Payment"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ─── Pagination ────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-soft px-4 py-3">
            <p className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`rounded-xl px-3 py-1.5 text-sm font-medium ${
                    page === currentPage
                      ? 'bg-[#11402D] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ─── Detail Drawer ────────────────────────────────────── */}
        {showDetailDrawer && selectedPayment && (
          <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/30 backdrop-blur-sm">
            <div className="relative h-full w-full max-w-2xl bg-white shadow-2xl overflow-y-auto animate-slide-in-right">
              <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-gray-900">Payment Details</h2>
                <button onClick={() => setShowDetailDrawer(false)} className="rounded-xl p-2 hover:bg-gray-100 transition">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-400">Payment ID</p>
                    <p className="mt-1 font-mono-cw text-sm">#{selectedPayment.id}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-400">Total Amount</p>
                    <p className="mt-1 font-display text-2xl font-bold text-gray-900">{formatCurrency(selectedPayment.total_amount || selectedPayment.amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-400">Status</p>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium border ${getStatusBadge(selectedPayment.status)}`}>
                      {selectedPayment.status || 'pending'}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-400">Escrow</p>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium border ${getEscrowBadge(selectedPayment.escrow_status, selectedPayment.status, isReadyForRelease(selectedPayment))}`}>
                      {getEscrowLabel(selectedPayment.escrow_status, isReadyForRelease(selectedPayment))}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-400">Method</p>
                    <p className="mt-1 text-sm capitalize">{selectedPayment.payment_method || 'mpesa'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-400">Receipt</p>
                    <p className="mt-1 font-mono-cw text-sm">{selectedPayment.mpesa_receipt || '—'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-semibold uppercase text-gray-400">Date</p>
                    <p className="mt-1 font-mono-cw text-sm">{formatDate(selectedPayment.created_at)}</p>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="font-display font-semibold text-gray-700 mb-3">Participants</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-400">Producer</p>
                      <p className="mt-1 text-sm font-medium">{selectedPayment.producer_name || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-400">Supplier</p>
                      <p className="mt-1 text-sm font-medium">{selectedPayment.supplier_name || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-400">Transporter</p>
                      <p className="mt-1 text-sm font-medium">
                        {selectedPayment.transporter_name && selectedPayment.transporter_name !== 'Not assigned' 
                          ? selectedPayment.transporter_name 
                          : 'Not assigned'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="font-display font-semibold text-gray-700 mb-3">Waste Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-400">Type</p>
                      <p className="mt-1 text-sm">{selectedPayment.waste_type || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-400">Quantity</p>
                      <p className="mt-1 text-sm">{selectedPayment.quantity || 0} {selectedPayment.unit || 'kg'}</p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="font-display font-semibold text-gray-700 mb-3">Amount Breakdown</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Waste Amount</span>
                      <span className="font-medium">{formatCurrency(selectedPayment.waste_amount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Transport Fee</span>
                      <span className="font-medium">{formatCurrency(selectedPayment.transport_fee)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Platform Fee</span>
                      <span className="font-medium">{formatCurrency(selectedPayment.platform_fee)}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-gray-200 pt-2 font-bold">
                      <span>Total</span>
                      <span>{formatCurrency(selectedPayment.total_amount || selectedPayment.amount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Release Confirmation ────────────────────────────── */}
        {showReleaseConfirm && selectedPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-50 rounded-xl">
                  <Check className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-display text-lg font-bold text-gray-900">Release Payment</h3>
              </div>
              <p className="text-sm text-gray-600">
                Are you sure you want to release <strong>{formatCurrency(selectedPayment.total_amount || selectedPayment.amount)}</strong> from escrow to the supplier?
                This action cannot be undone.
              </p>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowReleaseConfirm(false)} className="flex-1 rounded-xl border border-gray-200 py-2.5 font-medium text-gray-700 hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button onClick={() => handleRelease(selectedPayment.id)} disabled={actionLoading} className="flex-1 rounded-xl bg-emerald-600 py-2.5 font-bold text-white hover:bg-emerald-700 disabled:opacity-70 transition">
                  {actionLoading ? 'Releasing...' : 'Release Payment'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Refund Confirmation ──────────────────────────────── */}
        {showRefundConfirm && selectedPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-rose-50 rounded-xl">
                  <X className="w-6 h-6 text-rose-600" />
                </div>
                <h3 className="font-display text-lg font-bold text-gray-900">Refund Payment</h3>
              </div>
              <p className="text-sm text-gray-600">
                Are you sure you want to refund <strong>{formatCurrency(selectedPayment.total_amount || selectedPayment.amount)}</strong> to the producer?
                This action cannot be undone.
              </p>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowRefundConfirm(false)} className="flex-1 rounded-xl border border-gray-200 py-2.5 font-medium text-gray-700 hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button onClick={() => handleRefund(selectedPayment.id)} disabled={actionLoading} className="flex-1 rounded-xl bg-rose-600 py-2.5 font-bold text-white hover:bg-rose-700 disabled:opacity-70 transition">
                  {actionLoading ? 'Refunding...' : 'Refund Payment'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Not Confirmed Modal ────────────────────────────── */}
        {showNotConfirmedModal && notConfirmedPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-50 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-display text-lg font-bold text-gray-900">Cannot Release – Not Confirmed</h3>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  <strong>Producer has not marked this delivery as confirmed yet.</strong>
                </p>
                <p>
                  The transporter has delivered the waste, but the producer hasn't confirmed that they received it.
                  The payment will remain in escrow until the producer confirms delivery.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-xs text-amber-800">
                    <span className="font-bold">Current status:</span> {notConfirmedPayment.current_status_label || 'Awaiting confirmation'}
                  </p>
                </div>
                <p className="text-xs text-gray-400">
                  If the producer is unresponsive, you may need to reach out to them directly.
                </p>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowNotConfirmedModal(false)}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Got it
                </button>
                <button
                  onClick={() => {
                    setShowNotConfirmedModal(false);
                    setSelectedPayment(notConfirmedPayment);
                    setShowDetailDrawer(true);
                  }}
                  className="flex-1 rounded-xl bg-[#11402D] py-2.5 font-bold text-white hover:bg-[#0E2A1C] transition"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Stat Card Component ──────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, subtitle, trend }) {
  const colorMap = {
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  };
  const style = colorMap[color] || colorMap.blue;

  return (
    <div className={`bg-white rounded-2xl p-5 shadow-card border ${style} transition hover:shadow-lg`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="font-display text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          {trend && (
            <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-600 mt-1">
              <ArrowRight className="w-3 h-3 rotate-45" />
              {trend}
            </span>
          )}
        </div>
        <div className={`p-3 rounded-xl ${style}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}