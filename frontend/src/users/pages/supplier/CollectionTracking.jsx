// src/users/pages/supplier/CollectionTracking.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  Eye,
  Filter,
  Search
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CollectionTracking = () => {
  const [collections, setCollections] = useState([]);
  const [filteredCollections, setFilteredCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    filterCollections();
  }, [collections, searchQuery, filterStatus]);

  const fetchCollections = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_URL}/supplier/collections`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch collections');
      const data = await response.json();
      setCollections(data);
      setFilteredCollections(data);
    } catch (err) {
      console.error('Fetch collections error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterCollections = () => {
    let filtered = [...collections];

    if (filterStatus !== 'all') {
      filtered = filtered.filter((c) => c.status === filterStatus);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (c) =>
          c.waste_type?.toLowerCase().includes(q) ||
          c.pickup_location?.toLowerCase().includes(q) ||
          c.delivery_location?.toLowerCase().includes(q) ||
          c.transporter_name?.toLowerCase().includes(q)
      );
    }

    setFilteredCollections(filtered);
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
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'open':
      case 'accepted':
        return <Clock className="w-4 h-4" />;
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
          <p className="mt-4 text-gray-500">Loading collections...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-2xl mx-auto">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="font-display text-xl font-bold text-red-700">Unable to Load Collections</h3>
        <p className="text-red-600 mt-2">{error}</p>
        <button
          onClick={fetchCollections}
          className="mt-6 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  const statusOptions = [
    'all',
    'open',
    'accepted',
    'picked_up',
    'in_transit',
    'delivered',
    'completed',
    'cancelled',
  ];

  return (
    <div className="space-y-6 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Collection Tracking</h1>
          <p className="text-sm text-gray-500 mt-1">Track all your waste collections</p>
        </div>
        <button
          onClick={fetchCollections}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by waste, location, transporter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-green-500 transition text-sm"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-9 pr-8 py-2 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-green-500 transition appearance-none text-sm"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <span className="text-sm text-gray-500 whitespace-nowrap">
            {filteredCollections.length} of {collections.length}
          </span>
        </div>
      </div>

      {filteredCollections.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
          <Truck className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <h3 className="font-display text-lg font-semibold text-gray-700">No collections found</h3>
          <p className="text-gray-500 text-sm mt-1">
            {searchQuery || filterStatus !== 'all'
              ? 'Try adjusting your filters or search.'
              : 'You have no collection jobs yet.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Waste Type</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Quantity</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Pickup → Delivery</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden xl:table-cell">Transporter</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCollections.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 sm:px-6 py-3 text-sm font-mono text-gray-500">#{c.id}</td>
                    <td className="px-4 sm:px-6 py-3 font-medium text-gray-900">{c.waste_type}</td>
                    <td className="px-4 sm:px-6 py-3 text-sm text-gray-700 hidden md:table-cell">
                      {c.quantity} kg
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-sm text-gray-600 hidden lg:table-cell">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {c.pickup_location} → {c.delivery_location}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-sm text-gray-600 hidden xl:table-cell">
                      {c.transporter_name || 'Not assigned'}
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-sm text-gray-500 hidden sm:table-cell">
                      {formatDate(c.created_at)}
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                          c.status
                        )}`}
                      >
                        {getStatusIcon(c.status)}
                        {c.status.replace('_', ' ')}
                      </span>
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
};

export default CollectionTracking;