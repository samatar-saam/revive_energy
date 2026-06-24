// src/users/pages/producer/ProducerDashboardContent.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Truck,
  Clock,
  CheckCircle,
  Zap,
  TrendingUp,
  DollarSign,
  FileText,
  Plus,
  Eye,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ProducerDashboardContent = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    available_waste_count: 0,
    my_requests_count: 0,
    incoming_deliveries_count: 0,
    completed_transactions_count: 0,
    available_waste: [],
    recent_requests: [],
    incoming_deliveries: [],
    notifications: [],
  });

  // ─── Fetch data from backend ──────────────────────────────
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_URL}/producer/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to load dashboard');
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Format date ────────────────────────────────────────────
  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-KE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // ─── Format time ────────────────────────────────────────────
  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-KE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ─── Loading state ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#11402D] border-t-[#9CF06B] rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Loading producer dashboard...</p>
        </div>
      </div>
    );
  }

  // ─── Error state ────────────────────────────────────────────
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center max-w-2xl mx-auto">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="font-display text-xl font-bold text-red-700">Unable to Load Dashboard</h3>
        <p className="text-red-600 mt-2">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-6 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  const {
    available_waste_count,
    my_requests_count,
    incoming_deliveries_count,
    completed_transactions_count,
    available_waste,
    recent_requests,
    incoming_deliveries,
    notifications,
  } = dashboardData;

  return (
    <div className="space-y-6">
      {/* ─── Stats Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <Package className="w-6 h-6 text-emerald-600" />
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              {available_waste_count}
            </span>
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-gray-900">
            {available_waste_count}
          </p>
          <p className="text-sm text-gray-500">Available Waste</p>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <Clock className="w-6 h-6 text-blue-600" />
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              {my_requests_count}
            </span>
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-gray-900">
            {my_requests_count}
          </p>
          <p className="text-sm text-gray-500">My Requests</p>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <Truck className="w-6 h-6 text-yellow-600" />
            <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
              {incoming_deliveries_count}
            </span>
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-gray-900">
            {incoming_deliveries_count}
          </p>
          <p className="text-sm text-gray-500">Incoming Deliveries</p>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              {completed_transactions_count}
            </span>
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-gray-900">
            {completed_transactions_count}
          </p>
          <p className="text-sm text-gray-500">Completed Transactions</p>
        </div>
      </div>

      {/* ─── Available Waste & Incoming Deliveries ──────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Available Waste */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-gray-900">Available Waste Near You</h3>
            <Link to="/dashboard/marketplace" className="text-sm text-[#11402D] hover:underline">
              View All
            </Link>
          </div>
          {available_waste.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">No available waste listed nearby.</p>
          ) : (
            <div className="space-y-3">
              {available_waste.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">{item.waste_type}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} {item.unit || 'kg'} • {item.location}
                    </p>
                  </div>
                  <button className="px-3 py-1 bg-[#11402D] text-white rounded-lg text-xs font-medium hover:bg-[#0E2A1C] transition">
                    Request
                  </button>
                </div>
              ))}
            </div>
          )}
          <Link to="/dashboard/marketplace" className="mt-4 inline-block text-sm text-[#11402D] font-medium hover:underline flex items-center gap-1">
            Browse more waste <Plus className="w-4 h-4" />
          </Link>
        </div>

        {/* Incoming Deliveries */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-gray-900">Incoming Deliveries</h3>
            <Link to="/dashboard/incoming-deliveries" className="text-sm text-[#11402D] hover:underline">
              View All
            </Link>
          </div>
          {incoming_deliveries.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">No incoming deliveries scheduled.</p>
          ) : (
            <div className="space-y-3">
              {incoming_deliveries.map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{item.waste_type}</p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} kg • {item.supplier_name || 'Unknown'}
                      </p>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {item.status || 'Scheduled'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(item.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Recent Requests ────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-gray-900">Recent Requests</h3>
          <Link to="/dashboard/my-requests" className="text-sm text-[#11402D] hover:underline">
            View All
          </Link>
        </div>
        {recent_requests.length === 0 ? (
          <p className="text-gray-500 text-sm py-4 text-center">No recent requests.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Waste Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Supplier
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recent_requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900">{req.waste_type}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">
                      {req.supplier_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden lg:table-cell">
                      {formatDate(req.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        req.status === 'approved' ? 'bg-green-100 text-green-700' :
                        req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Quick Actions ──────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-display font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            to="/dashboard/marketplace"
            className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition"
          >
            <Plus className="w-5 h-5 text-emerald-600" />
            <span className="font-medium text-gray-900 text-sm">Request Waste</span>
          </Link>
          <Link
            to="/dashboard/marketplace"
            className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition"
          >
            <Eye className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-900 text-sm">View Marketplace</span>
          </Link>
          <Link
            to="/dashboard/incoming-deliveries"
            className="flex items-center gap-3 p-4 rounded-xl bg-yellow-50 hover:bg-yellow-100 transition"
          >
            <Truck className="w-5 h-5 text-yellow-600" />
            <span className="font-medium text-gray-900 text-sm">Track Deliveries</span>
          </Link>
          <Link
            to="/dashboard/payments"
            className="flex items-center gap-3 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition"
          >
            <FileText className="w-5 h-5 text-green-600" />
            <span className="font-medium text-gray-900 text-sm">View Invoices</span>
          </Link>
        </div>
      </div>

      {/* ─── Notifications ───────────────────────────────────── */}
      {notifications && notifications.length > 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-gray-900">Recent Notifications</h3>
            <Link to="/dashboard/notifications" className="text-sm text-[#11402D] hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-2">
            {notifications.slice(0, 3).map((n) => (
              <div key={n.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                <div className="mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{n.title}</p>
                  <p className="text-sm text-gray-500">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(n.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProducerDashboardContent;