// src/admin/pages/Withdrawals.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  Search,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Clock,
  User,
  Building2,
  Mail,
  Phone,
} from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminWithdrawals() {
  const [loading, setLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [actionLoading, setActionLoading] = useState(false);

  const getToken = () => localStorage.getItem('token');

  const fetchWithdrawals = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');
      const res = await fetch(`${API_URL}/admin/withdrawals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setWithdrawals(data.data || []);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleAction = async (id, action) => {
    if (!confirm(`Are you sure you want to ${action} this withdrawal?`)) return;
    setActionLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/admin/withdrawals/${id}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to ${action} withdrawal`);
      toast.success(`Withdrawal ${action}ed successfully`);
      fetchWithdrawals();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let result = withdrawals;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(w =>
        w.user_name?.toLowerCase().includes(q) ||
        w.business_name?.toLowerCase().includes(q) ||
        w.email?.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== 'all') {
      result = result.filter(w => w.status === filterStatus);
    }
    return result;
  }, [withdrawals, searchQuery, filterStatus]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount || 0);

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';

  const getStatusBadge = (status) => {
    const map = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      approved: 'bg-green-50 text-green-700 border-green-200',
      rejected: 'bg-red-50 text-red-700 border-red-200',
      completed: 'bg-blue-50 text-blue-700 border-blue-200',
    };
    return map[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchWithdrawals} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Withdrawal Requests</h2>
          <p className="text-sm text-gray-500">Approve or reject withdrawal requests from suppliers and transporters</p>
        </div>
        <button onClick={fetchWithdrawals} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by user, business, email..."
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
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full min-w-[900px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Method</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Requested</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.length === 0 ? (
              <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-500">No withdrawal requests</td></tr>
            ) : (
              paginated.map(w => (
                <tr key={w.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-4 py-3 font-mono text-sm text-gray-500">#{w.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{w.user_name}<br/><span className="text-xs text-gray-400">{w.email}</span></td>
                  <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(w.amount)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">{w.payment_method || 'Bank'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium border ${getStatusBadge(w.status)}`}>
                      {w.status || 'pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(w.created_at)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {w.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAction(w.id, 'approve')}
                            disabled={actionLoading}
                            className="rounded-lg p-1.5 text-green-600 hover:bg-green-50 disabled:opacity-50"
                            title="Approve"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleAction(w.id, 'reject')}
                            disabled={actionLoading}
                            className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50"
                            title="Reject"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      {w.status === 'approved' && (
                        <button
                          onClick={() => handleAction(w.id, 'complete')}
                          disabled={actionLoading}
                          className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                          title="Mark as Completed"
                        >
                          <Clock className="h-5 w-5" />
                        </button>
                      )}
                    </div>
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
            <button onClick={() => setCurrentPage(p => Math.max(p-1,1))} disabled={currentPage===1} className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-50">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => setCurrentPage(p => Math.min(p+1,totalPages))} disabled={currentPage===totalPages} className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-50">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center"><div className="w-16 h-16 border-4 border-[#11402D] border-t-[#9CF06B] rounded-full animate-spin mx-auto" /><p className="mt-4 text-gray-500">Loading withdrawals...</p></div>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900">Unable to load withdrawals</h3>
        <p className="text-gray-500 mt-2">{message}</p>
        <button onClick={onRetry} className="mt-4 px-6 py-2 bg-[#11402D] text-white rounded-xl hover:bg-[#0E2A1C] transition">Try Again</button>
      </div>
    </div>
  );
}