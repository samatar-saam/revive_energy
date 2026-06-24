// src/users/pages/producer/IncomingDeliveries.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  Package,
  MapPin,
  Search,
  Filter,
  ChevronDown,
  RefreshCw,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Building2,
  Calendar
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function IncomingDeliveries() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchDeliveries();
  }, []);

  useEffect(() => {
    filterDeliveries();
  }, [deliveries, searchQuery, filterStatus]);

  const fetchDeliveries = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_URL}/producer/incoming-deliveries`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to load deliveries');
      }

      const data = await response.json();
      setDeliveries(data);
      setFilteredDeliveries(data);
    } catch (err) {
      console.error('Fetch deliveries error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterDeliveries = () => {
    let filtered = [...deliveries];

    if (filterStatus !== 'all') {
      filtered = filtered.filter((d) => d.status === filterStatus);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (d) =>
          d.waste_type?.toLowerCase().includes(q) ||
          d.supplier_name?.toLowerCase().includes(q) ||
          d.transporter_name?.toLowerCase().includes(q) ||
          d.pickup_location?.toLowerCase().includes(q)
      );
    }

    setFilteredDeliveries(filtered);
  };

  const getStatusBadge = (status) => {
    const map = {
      open: 'bg-gray-100 text-gray-700',
      accepted: 'bg-blue-100 text-blue-700',
      picked_up: 'bg-purple-100 text-purple-700',
      in_transit: 'bg-yellow-100 text-yellow-700',
      delivered: 'bg-green-100 text-green-700',
      completed: 'bg-indigo-100 text-indigo-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
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
          <p className="mt-4 text-gray-500">Loading deliveries...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center max-w-2xl mx-auto">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="font-display text-xl font-bold text-red-700">Unable to Load Deliveries</h3>
        <p className="text-red-600 mt-2">{error}</p>
        <button
          onClick={fetchDeliveries}
          className="mt-6 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  const statusOptions = ['all', 'open', 'accepted', 'picked_up', 'in_transit', 'delivered', 'completed', 'cancelled'];

  return (
    <div className="space-y-6 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Incoming Deliveries</h1>
          <p className="text-sm text-gray-500 mt-1">Track all waste deliveries coming to you</p>
        </div>
        <button
          onClick={fetchDeliveries}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">Total</p>
          <p className="font-display text-2xl font-bold text-gray-900">{deliveries.length}</p>
        </div>
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">In Transit</p>
          <p className="font-display text-2xl font-bold text-yellow-600">
            {deliveries.filter((d) => d.status === 'in_transit' || d.status === 'picked_up').length}
          </p>
        </div>
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">Delivered</p>
          <p className="font-display text-2xl font-bold text-green-600">
            {deliveries.filter((d) => d.status === 'delivered').length}
          </p>
        </div>
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">Completed</p>
          <p className="font-display text-2xl font-bold text-indigo-600">
            {deliveries.filter((d) => d.status === 'completed').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by waste, supplier, transporter..."
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
            {filteredDeliveries.length} of {deliveries.length}
          </span>
        </div>
      </div>

      {/* Deliveries Table */}
      {filteredDeliveries.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
          <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="font-display text-xl font-semibold text-gray-700">No deliveries found</h3>
          <p className="text-gray-500 mt-2">
            {searchQuery || filterStatus !== 'all'
              ? 'Try adjusting your filters or search.'
              : 'You have no incoming deliveries yet.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Waste Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Supplier</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden xl:table-cell">Transporter</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDeliveries.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-mono text-sm text-gray-500">#{d.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{d.waste_type}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 hidden md:table-cell">{d.quantity} kg</td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">{d.supplier_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden xl:table-cell">{d.transporter_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">{formatDate(d.created_at)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                          d.status
                        )}`}
                      >
                        {getStatusIcon(d.status)}
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/dashboard/deliveries/${d.id}`}
                        className="p-1.5 text-gray-400 hover:text-[#11402D] transition"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
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