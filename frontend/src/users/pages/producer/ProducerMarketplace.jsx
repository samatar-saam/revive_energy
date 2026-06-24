// src/users/pages/producer/ProducerMarketplace.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  MapPin,
  Search,
  Filter,
  ChevronDown,
  RefreshCw,
  Plus,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Building2
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ProducerMarketplace() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [requesting, setRequesting] = useState(null);
  const [requestSuccess, setRequestSuccess] = useState(null);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    filterListings();
  }, [listings, searchQuery, filterStatus, filterLocation]);

  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_URL}/producer/available-waste`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to load listings');
      }

      const data = await response.json();
      setListings(data);
      setFilteredListings(data);

      // Extract unique locations for filter
      const uniqueLocations = [...new Set(data.map(item => item.location).filter(Boolean))];
      setLocations(uniqueLocations);
    } catch (err) {
      console.error('Fetch listings error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterListings = () => {
    let filtered = [...listings];

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((item) => item.status === filterStatus);
    }

    // Filter by location
    if (filterLocation !== 'all') {
      filtered = filtered.filter((item) => item.location === filterLocation);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (item) =>
          item.waste_type?.toLowerCase().includes(q) ||
          item.location?.toLowerCase().includes(q) ||
          item.supplier_name?.toLowerCase().includes(q)
      );
    }

    setFilteredListings(filtered);
  };

  const handleRequest = async (listingId) => {
    setRequesting(listingId);
    setRequestSuccess(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_URL}/producer/request-waste/${listingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: 'I would like to request this waste.' }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Request failed');

      setRequestSuccess(listingId);
      // Update the listing status locally (optional)
      setListings((prev) =>
        prev.map((item) =>
          item.id === listingId ? { ...item, status: 'requested' } : item
        )
      );
      setTimeout(() => setRequestSuccess(null), 3000);
    } catch (err) {
      console.error('Request error:', err);
      alert(err.message);
    } finally {
      setRequesting(null);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      available: 'bg-green-100 text-green-700',
      requested: 'bg-yellow-100 text-yellow-700',
      assigned: 'bg-blue-100 text-blue-700',
      collected: 'bg-purple-100 text-purple-700',
      delivered: 'bg-indigo-100 text-indigo-700',
      completed: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
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
          <p className="mt-4 text-gray-500">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center max-w-2xl mx-auto">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="font-display text-xl font-bold text-red-700">Unable to Load Marketplace</h3>
        <p className="text-red-600 mt-2">{error}</p>
        <button
          onClick={fetchListings}
          className="mt-6 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  const statusOptions = ['all', 'available', 'requested', 'assigned', 'collected'];

  return (
    <div className="space-y-6 px-4">
      {/* ─── Header ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Marketplace</h1>
          <p className="text-sm text-gray-500 mt-1">Browse available waste listings from suppliers</p>
        </div>
        <button
          onClick={fetchListings}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* ─── Stats ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">Total Listings</p>
          <p className="font-display text-2xl font-bold text-gray-900">{listings.length}</p>
        </div>
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">Available</p>
          <p className="font-display text-2xl font-bold text-green-600">
            {listings.filter((l) => l.status === 'available').length}
          </p>
        </div>
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">Requested</p>
          <p className="font-display text-2xl font-bold text-yellow-600">
            {listings.filter((l) => l.status === 'requested').length}
          </p>
        </div>
      </div>

      {/* ─── Filters & Search ────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by waste type, location, supplier..."
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

          {locations.length > 0 && (
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="pl-9 pr-8 py-2 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-green-500 transition appearance-none text-sm"
              >
                <option value="all">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          )}

          <span className="text-sm text-gray-500 whitespace-nowrap">
            {filteredListings.length} of {listings.length}
          </span>
        </div>
      </div>

      {/* ─── Listings Grid ───────────────────────────────────── */}
      {filteredListings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="font-display text-xl font-semibold text-gray-700">No waste listings found</h3>
          <p className="text-gray-500 mt-2">
            {searchQuery || filterStatus !== 'all' || filterLocation !== 'all'
              ? 'Try adjusting your filters or search.'
              : 'Check back later for new waste listings.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredListings.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-display font-semibold text-gray-900 truncate">
                    {item.waste_type}
                  </h4>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {item.location}
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(item.status)}`}>
                  {item.status || 'Unknown'}
                </span>
              </div>

              <div className="mt-3 space-y-1 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span>
                    {item.quantity} {item.unit || 'kg'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{item.supplier_name || 'Unknown supplier'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>Listed {formatDate(item.created_at)}</span>
                </div>
              </div>

              {item.status === 'available' ? (
                <button
                  onClick={() => handleRequest(item.id)}
                  disabled={requesting === item.id}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-[#11402D] text-white rounded-xl text-sm font-medium hover:bg-[#0E2A1C] transition disabled:opacity-70"
                >
                  {requesting === item.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Requesting...
                    </>
                  ) : requestSuccess === item.id ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Requested ✓
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Request Waste
                    </>
                  )}
                </button>
              ) : (
                <div className="mt-4 w-full py-2 text-center text-sm text-gray-500 bg-gray-50 rounded-xl">
                  {item.status === 'requested' ? 'Request pending' : `Status: ${item.status}`}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}