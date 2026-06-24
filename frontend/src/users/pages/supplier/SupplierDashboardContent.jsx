import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Truck,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye,
  DollarSign,
  FileText,
  Calendar,
  MapPin
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SupplierDashboardContent = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      myListings: 0,
      collectionRequests: 0,
      pendingCollections: 0,
      completedCollections: 0,
    },
    recentListings: [],
    upcomingPickups: [],
    notifications: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_URL}/supplier/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to load dashboard');
      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#11402D] border-t-[#9CF06B] rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Loading supplier dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-2xl mx-auto">
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

  const { stats, recentListings, upcomingPickups, notifications } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <Package className="w-6 h-6 text-emerald-600" />
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">{stats.myListings}</span>
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-gray-900">{stats.myListings}</p>
          <p className="text-sm text-gray-500">My Listings</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <Truck className="w-6 h-6 text-blue-600" />
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{stats.collectionRequests}</span>
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-gray-900">{stats.collectionRequests}</p>
          <p className="text-sm text-gray-500">Collection Requests</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <Clock className="w-6 h-6 text-yellow-600" />
            <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">{stats.pendingCollections}</span>
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-gray-900">{stats.pendingCollections}</p>
          <p className="text-sm text-gray-500">Pending Collections</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">{stats.completedCollections}</span>
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-gray-900">{stats.completedCollections}</p>
          <p className="text-sm text-gray-500">Completed Collections</p>
        </div>
      </div>

      {/* Recent Listings & Upcoming Pickups */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-gray-900">Recent Waste Listings</h3>
            <Link to="/dashboard/listings" className="text-sm text-[#11402D] hover:underline">View All</Link>
          </div>
          {recentListings.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">No listings yet.</p>
          ) : (
            <div className="space-y-3">
              {recentListings.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">{item.waste_type}</p>
                    <p className="text-sm text-gray-500">{item.quantity} {item.unit || 'kg'} • {item.location}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    item.status === 'available' ? 'bg-green-100 text-green-700' :
                    item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-gray-900">Upcoming Pickups</h3>
            <Link to="/dashboard/collections" className="text-sm text-[#11402D] hover:underline">View All</Link>
          </div>
          {upcomingPickups.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">No upcoming pickups.</p>
          ) : (
            <div className="space-y-3">
              {upcomingPickups.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <Calendar className="w-5 h-5 text-[#11402D]" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.waste_type}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {item.location}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium text-gray-900">{item.pickup_date}</p>
                    <p className="text-xs text-gray-500">{item.pickup_time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-display font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link to="/dashboard/post-waste" className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition">
            <Plus className="w-5 h-5 text-emerald-600" />
            <span className="font-medium text-gray-900 text-sm">Post Waste</span>
          </Link>
          <Link to="/dashboard/requests" className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition">
            <Eye className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-900 text-sm">View Requests</span>
          </Link>
          <Link to="/dashboard/tracking" className="flex items-center gap-3 p-4 rounded-xl bg-yellow-50 hover:bg-yellow-100 transition">
            <Truck className="w-5 h-5 text-yellow-600" />
            <span className="font-medium text-gray-900 text-sm">Track Collection</span>
          </Link>
          <Link to="/dashboard/payments" className="flex items-center gap-3 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="font-medium text-gray-900 text-sm">View Payments</span>
          </Link>
        </div>
      </div>

      {/* Notifications (optional) */}
      {notifications && notifications.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-display font-semibold text-gray-900 mb-4">Recent Notifications</h3>
          <div className="space-y-2">
            {notifications.slice(0, 3).map((n) => (
              <div key={n.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                <div className="mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{n.title}</p>
                  <p className="text-sm text-gray-500">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
          <Link to="/dashboard/notifications" className="mt-3 inline-block text-sm text-[#11402D] hover:underline">
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
};

export default SupplierDashboardContent;