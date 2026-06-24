import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Truck,
  Clock,
  CheckCircle,
  DollarSign,
  MapPin,
  Calendar,
  TrendingUp,
  Users,
  Plus,
  Eye,
  FileText,
  AlertCircle
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TransportDashboardContent = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    open_jobs_count: 0,
    accepted_jobs_count: 0,
    active_deliveries_count: 0,
    completed_deliveries_count: 0,
    open_jobs: [],
    accepted_jobs: [],
    active_deliveries: [],
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

      const response = await fetch(`${API_URL}/transporter/dashboard`, {
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
          <p className="mt-4 text-gray-500">Loading transport dashboard...</p>
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

  const {
    open_jobs_count,
    accepted_jobs_count,
    active_deliveries_count,
    completed_deliveries_count,
    open_jobs,
    accepted_jobs,
    active_deliveries,
    notifications
  } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <Package className="w-6 h-6 text-blue-600" />
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{open_jobs_count}</span>
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-gray-900">{open_jobs_count}</p>
          <p className="text-sm text-gray-500">Available Jobs</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <Clock className="w-6 h-6 text-yellow-600" />
            <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">{accepted_jobs_count}</span>
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-gray-900">{accepted_jobs_count}</p>
          <p className="text-sm text-gray-500">Accepted Jobs</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <Truck className="w-6 h-6 text-indigo-600" />
            <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">{active_deliveries_count}</span>
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-gray-900">{active_deliveries_count}</p>
          <p className="text-sm text-gray-500">Active Deliveries</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">{completed_deliveries_count}</span>
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-gray-900">{completed_deliveries_count}</p>
          <p className="text-sm text-gray-500">Completed Deliveries</p>
        </div>
      </div>

      {/* Jobs & Deliveries */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-gray-900">Open Jobs</h3>
            <Link to="/dashboard/jobs" className="text-sm text-[#11402D] hover:underline">View All</Link>
          </div>
          {open_jobs.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">No open jobs available.</p>
          ) : (
            <div className="space-y-3">
              {open_jobs.slice(0, 4).map((job) => (
                <div key={job.id} className="p-3 rounded-xl bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{job.waste_type}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {job.pickup_location} → {job.delivery_location}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-[#11402D]">{job.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-gray-900">Accepted Jobs</h3>
            <Link to="/dashboard/accepted-jobs" className="text-sm text-[#11402D] hover:underline">View All</Link>
          </div>
          {accepted_jobs.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">No accepted jobs yet.</p>
          ) : (
            <div className="space-y-3">
              {accepted_jobs.slice(0, 4).map((job) => (
                <div key={job.id} className="p-3 rounded-xl bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{job.waste_type}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {job.pickup_location} → {job.delivery_location}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      job.status === 'accepted' ? 'bg-yellow-100 text-yellow-700' :
                      job.status === 'picked_up' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {job.status}
                    </span>
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
          <Link to="/dashboard/jobs" className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition">
            <Plus className="w-5 h-5 text-emerald-600" />
            <span className="font-medium text-gray-900 text-sm">Accept Job</span>
          </Link>
          <Link to="/dashboard/deliveries" className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition">
            <Eye className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-900 text-sm">Track Delivery</span>
          </Link>
          <Link to="/dashboard/earnings" className="flex items-center gap-3 p-4 rounded-xl bg-yellow-50 hover:bg-yellow-100 transition">
            <DollarSign className="w-5 h-5 text-yellow-600" />
            <span className="font-medium text-gray-900 text-sm">View Earnings</span>
          </Link>
          <Link to="/dashboard/invoices" className="flex items-center gap-3 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition">
            <FileText className="w-5 h-5 text-green-600" />
            <span className="font-medium text-gray-900 text-sm">View Invoices</span>
          </Link>
        </div>
      </div>

      {/* Notifications (if you want to show them on the dashboard) */}
      {notifications && notifications.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-display font-semibold text-gray-900 mb-4">Recent Notifications</h3>
          <div className="space-y-2">
            {notifications.slice(0, 3).map((n) => (
              <div key={n.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                <div className="mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
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

export default TransportDashboardContent;