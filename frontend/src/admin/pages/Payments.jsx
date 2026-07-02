// src/admin/pages/Payments.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  CreditCard,
  Users,
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Shield,
  RefreshCw,
  Calendar,
  FileText,
} from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Payments() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);

  // ─── Modal states ────────────────────────────────────────────
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const getToken = () => localStorage.getItem('token');

  // ─── Fetch payments ──────────────────────────────────────────
  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        setError('Not authenticated. Please login.');
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/admin/payments`, {
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

      const responseData = await res.json();
      const data = responseData.data || responseData;
      setPayments(data);
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError(err.message);
      toast.error(err.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // ─── Filtering & pagination ──────────────────────────────────
  const filteredPayments = useMemo(() => {
    let filtered = [...payments];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.id?.toString().includes(q) ||
          p.transaction_id?.toLowerCase().includes(q) ||
          p.receipt_number?.toLowerCase().includes(q) ||
          p.payer_name?.toLowerCase().includes(q) ||
          p.supplier_name?.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter((p) => p.status === filterStatus);
    }
    return filtered;
  }, [payments, searchQuery, filterStatus]);

  const totalPages = Math.ceil(filteredPayments.length / pageSize);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // ─── Stats ────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = payments.length;
    const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const pending = payments.filter((p) => p.status === 'pending').length;
    const completed = payments.filter((p) => p.status === 'completed' || p.status === 'paid').length;
    const failed = payments.filter((p) => p.status === 'failed' || p.status === 'cancelled').length;
    return { total, totalAmount, pending, completed, failed };
  }, [payments]);

  const getStatusBadge = (status) => {
    const map = {
      pending: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      paid: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-700',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-KE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount || 0);
  };

  // ─── Handlers ─────────────────────────────────────────────────
  const openView = (payment) => {
    setSelectedPayment(payment);
    setShowViewModal(true);
  };

  const closeModals = () => {
    setShowViewModal(false);
    setSelectedPayment(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#11402D] border-t-[#9CF06B] rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Loading payments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900">Unable to load payments</h3>
          <p className="text-gray-500 mt-2">{error}</p>
          <button
            onClick={fetchPayments}
            className="mt-4 px-6 py-2 bg-[#11402D] text-white rounded-xl hover:bg-[#0E2A1C] transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Stats Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Payments" value={stats.total} icon={CreditCard} color="blue" />
        <StatCard label="Total Amount" value={formatCurrency(stats.totalAmount)} icon={DollarSign} color="green" />
        <StatCard label="Pending" value={stats.pending} icon={Clock} color="yellow" />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle} color="green" />
      </div>

      {/* ─── Toolbar ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID, transaction, receipt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-8 text-sm outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <button
          onClick={fetchPayments}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* ─── Table ───────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {paginatedPayments.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-700">No payments found</h3>
            <p className="text-sm text-gray-500">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Payer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Supplier</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Receipt</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-4 py-3 font-mono text-sm text-gray-500">#{payment.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(payment.amount)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{payment.payer_name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{payment.supplier_name || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadge(payment.status)}`}>
                        {payment.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{payment.receipt_number || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(payment.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openView(payment)}
                          className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-[#11402D]"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Pagination ──────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {Math.min(filteredPayments.length, (currentPage - 1) * pageSize + 1)} to{' '}
            {Math.min(filteredPayments.length, currentPage * pageSize)} of {filteredPayments.length} entries
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`rounded-xl px-3 py-1 text-sm font-medium ${
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

      {/* ─── View Modal ──────────────────────────────────────────── */}
      {showViewModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Payment Details</h2>
                <p className="text-sm text-gray-500">ID #{selectedPayment.id}</p>
              </div>
              <button onClick={closeModals} className="rounded-xl p-2 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Amount</p>
                  <p className="mt-1 text-lg font-bold text-gray-900">{formatCurrency(selectedPayment.amount)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Status</p>
                  <span className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadge(selectedPayment.status)}`}>
                    {selectedPayment.status || 'pending'}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Payer</p>
                  <p className="mt-1 text-sm text-gray-700">{selectedPayment.payer_name || '—'}</p>
                  <p className="text-sm text-gray-500">{selectedPayment.payer_email || ''}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Supplier</p>
                  <p className="mt-1 text-sm text-gray-700">{selectedPayment.supplier_name || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Producer</p>
                  <p className="mt-1 text-sm text-gray-700">{selectedPayment.producer_name || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Transporter</p>
                  <p className="mt-1 text-sm text-gray-700">{selectedPayment.transporter_name || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Transaction ID</p>
                  <p className="mt-1 text-sm text-gray-700">{selectedPayment.transaction_id || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Receipt Number</p>
                  <p className="mt-1 text-sm text-gray-700">{selectedPayment.receipt_number || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Payment Method</p>
                  <p className="mt-1 text-sm text-gray-700">{selectedPayment.payment_method || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">MPESA Receipt</p>
                  <p className="mt-1 text-sm text-gray-700">{selectedPayment.mpesa_receipt || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Created</p>
                  <p className="mt-1 text-sm text-gray-700">{formatDate(selectedPayment.created_at)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Completed</p>
                  <p className="mt-1 text-sm text-gray-700">{formatDate(selectedPayment.completed_at)}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={closeModals} className="rounded-xl bg-[#11402D] px-6 py-2.5 font-bold text-white hover:bg-[#0E2A1C]">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    gray: 'bg-gray-50 text-gray-600 border-gray-100',
  };
  const style = colorMap[color] || colorMap.blue;

  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border ${style}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl ${style}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}