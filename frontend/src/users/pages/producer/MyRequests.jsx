// src/users/pages/producer/MyRequests.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Search,
  Filter,
  ChevronDown,
  RefreshCw,
  Eye,
  XCircle,
  AlertCircle,
  Clock,
  CheckCircle,
  User,
  Building2,
  MapPin,
  Calendar
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function MyRequests() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, searchQuery, filterStatus]);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_URL}/producer/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to load requests');
      }

      const data = await response.json();
      setRequests(data);
      setFilteredRequests(data);
    } catch (err) {
      console.error('Fetch requests error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = [...requests];

    if (filterStatus !== 'all') {
      filtered = filtered.filter((r) => r.status === filterStatus);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (r) =>
          r.waste_type?.toLowerCase().includes(q) ||
          r.supplier_name?.toLowerCase().includes(q) ||
          r.id?.toString().includes(q)
      );
    }

    setFilteredRequests(filtered);
  };

  const handleCancel = async (requestId) => {
    if (!confirm('Are you sure you want to cancel this request?')) return;

    setCancelling(requestId);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_URL}/producer/requests/${requestId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to cancel request');
      }

      // Update local state
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId ? { ...r, status: 'cancelled' } : r
        )
      );
    } catch (err) {
      console.error('Cancel error:', err);
      alert(err.message);
    } finally {
      setCancelling(null);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      assigned: 'bg-blue-100 text-blue-700',
      in_transit: 'bg-purple-100 text-purple-700',
      delivered: 'bg-indigo-100 text-indigo-700',
      completed: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-gray-100 text-gray-700',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-KE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#11402D] border-t-[#9CF06B] rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Loading your requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center max-w-2xl mx-auto">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="font-display text-xl font-bold text-red-700">Unable to Load Requests</h3>
        <p className="text-red-600 mt-2">{error}</p>
        <button
          onClick={fetchRequests}
          className="mt-6 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  const statusOptions = [
    'all',
    'pending',
    'approved',
    'rejected',
    'assigned',
    'in_transit',
    'delivered',
    'completed',
    'cancelled',
  ];

  return (
    <div className="space-y-6 px-4">
      {/* ─── Header ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">My Requests</h1>
          <p className="text-sm text-gray-500 mt-1">Track all your waste requests</p>
        </div>
        <button
          onClick={fetchRequests}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* ─── Stats ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">Total</p>
          <p className="font-display text-2xl font-bold text-gray-900">{requests.length}</p>
        </div>
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">Pending</p>
          <p className="font-display text-2xl font-bold text-yellow-600">
            {requests.filter((r) => r.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">Approved</p>
          <p className="font-display text-2xl font-bold text-green-600">
            {requests.filter((r) => r.status === 'approved').length}
          </p>
        </div>
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">Delivered</p>
          <p className="font-display text-2xl font-bold text-indigo-600">
            {requests.filter((r) => r.status === 'delivered' || r.status === 'completed').length}
          </p>
        </div>
      </div>

      {/* ─── Filters & Search ────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by waste type, supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-green-500 transition text-sm"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-9 pr-8 py-2 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-green-500 transition appearance-none text-sm"
            >
              <option value="all">All Status</option>
              {statusOptions.filter((s) => s !== 'all').map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <span className="text-sm text-gray-500 whitespace-nowrap">
            {filteredRequests.length} of {requests.length}
          </span>
        </div>
      </div>

      {/* ─── Requests Table ──────────────────────────────────── */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="font-display text-xl font-semibold text-gray-700">No requests found</h3>
          <p className="text-gray-500 mt-2">
            {searchQuery || filterStatus !== 'all'
              ? 'Try adjusting your filters or search.'
              : 'You have not made any waste requests yet.'}
          </p>
          <Link
            to="/dashboard/marketplace"
            className="inline-block mt-4 px-6 py-2 bg-[#11402D] text-white rounded-xl text-sm font-medium hover:bg-[#0E2A1C] transition"
          >
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Waste Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Supplier
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-mono text-sm text-gray-500">#{req.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{req.waste_type}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 hidden md:table-cell">
                      {req.quantity} {req.unit || 'kg'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">
                      {req.supplier_name || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">
                      {formatDate(req.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                          req.status
                        )}`}
                      >
                        {getStatusIcon(req.status)}
                        {req.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {req.status === 'pending' && (
                          <button
                            onClick={() => handleCancel(req.id)}
                            disabled={cancelling === req.id}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition disabled:opacity-50"
                          >
                            {cancelling === req.id ? '...' : 'Cancel'}
                          </button>
                        )}
                        <Link
                          to={`/dashboard/requests/${req.id}`}
                          className="p-1.5 text-gray-400 hover:text-[#11402D] transition"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}