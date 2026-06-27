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
  AlertCircle,
  PieChart as PieChartIcon,
  BarChart3,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const COLORS = ['#11402D', '#34D399', '#FBBF24', '#EF4444', '#60A5FA', '#8B5CF6'];

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

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleDateString('en-KE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // ─── Chart Data ──────────────────────────────────────────────
  // Pie chart: request status distribution
  const requests = dashboardData.recent_requests || [];
  const statusCounts = requests.reduce((acc, req) => {
    acc[req.status] = (acc[req.status] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.keys(statusCounts).map((key) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: statusCounts[key],
  }));

  // If no data, show placeholder
  const hasPieData = pieData.length > 0;

  // Weekly activity – mock data (in real app, fetch from backend)
  const weeklyData = [
    { day: 'Mon', requests: 2, deliveries: 1 },
    { day: 'Tue', requests: 4, deliveries: 3 },
    { day: 'Wed', requests: 3, deliveries: 2 },
    { day: 'Thu', requests: 5, deliveries: 4 },
    { day: 'Fri', requests: 7, deliveries: 6 },
    { day: 'Sat', requests: 2, deliveries: 2 },
    { day: 'Sun', requests: 1, deliveries: 0 },
  ];

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
      {/* ─── STAT CARDS ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Package}
          label="Available Waste"
          value={available_waste_count}
          color="emerald"
          badge={available_waste_count}
        />
        <StatCard
          icon={Clock}
          label="My Requests"
          value={my_requests_count}
          color="blue"
          badge={my_requests_count}
        />
        <StatCard
          icon={Truck}
          label="Incoming Deliveries"
          value={incoming_deliveries_count}
          color="yellow"
          badge={incoming_deliveries_count}
        />
        <StatCard
          icon={CheckCircle}
          label="Completed Transactions"
          value={completed_transactions_count}
          color="green"
          badge={completed_transactions_count}
        />
      </div>

      {/* ─── CHARTS ROW ──────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pie Chart – Request Status Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-gray-900 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-[#11402D]" />
              Request Status Distribution
            </h3>
            <span className="text-xs text-gray-400">from recent requests</span>
          </div>
          {!hasPieData ? (
            <p className="text-gray-500 text-sm py-8 text-center">No request data to display</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name }) => name}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} requests`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bar Chart – Weekly Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#11402D]" />
              Weekly Activity
            </h3>
            <span className="text-xs text-gray-400">requests vs deliveries</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="requests" fill="#11402D" radius={[4, 4, 0, 0]} name="Requests" />
              <Bar dataKey="deliveries" fill="#34D399" radius={[4, 4, 0, 0]} name="Deliveries" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ─── TABLE: Recent Requests ────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-display font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#11402D]" />
            Recent Requests
          </h3>
          <Link to="/dashboard/my-requests" className="text-sm text-[#11402D] hover:underline">
            View All
          </Link>
        </div>
        {recent_requests.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No recent requests.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium">
                <tr>
                  <th className="px-6 py-3 text-left">Waste Type</th>
                  <th className="px-6 py-3 text-left hidden md:table-cell">Supplier</th>
                  <th className="px-6 py-3 text-left hidden lg:table-cell">Date</th>
                  <th className="px-6 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recent_requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-3 font-medium text-gray-900">{req.waste_type}</td>
                    <td className="px-6 py-3 text-gray-600 hidden md:table-cell">
                      {req.supplier_name || 'Unknown'}
                    </td>
                    <td className="px-6 py-3 text-gray-500 hidden lg:table-cell">
                      {formatDate(req.created_at)}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          req.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : req.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : req.status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
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

      {/* ─── QUICK ACTIONS ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-display font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <ActionButton
            to="/dashboard/marketplace"
            icon={Plus}
            label="Request Waste"
            color="emerald"
          />
          <ActionButton
            to="/dashboard/marketplace"
            icon={Eye}
            label="View Marketplace"
            color="blue"
          />
          <ActionButton
            to="/dashboard/incoming-deliveries"
            icon={Truck}
            label="Track Deliveries"
            color="yellow"
          />
          <ActionButton
            to="/dashboard/payments"
            icon={FileText}
            label="View Invoices"
            color="green"
          />
        </div>
      </div>

      {/* ─── NOTIFICATIONS ────────────────────────────────────────── */}
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
                  <p className="text-xs text-gray-400 mt-1">{formatDate(n.created_at)}</p>
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

// ─── Sub‑components ─────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, color, badge }) => {
  const colorMap = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-100' },
    green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' },
  };
  const style = colorMap[color] || colorMap.blue;

  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border ${style.border}`}>
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl ${style.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${style.text}`} />
        </div>
        {badge !== undefined && (
          <span className={`text-xs ${style.text} ${style.bg} px-2 py-1 rounded-full`}>
            {badge}
          </span>
        )}
      </div>
      <p className="mt-3 font-display text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
};

const ActionButton = ({ to, icon: Icon, label, color }) => {
  const colorMap = {
    emerald: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600',
    blue: 'bg-blue-50 hover:bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-600',
    green: 'bg-green-50 hover:bg-green-100 text-green-600',
  };
  const style = colorMap[color] || colorMap.blue;

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 p-4 rounded-xl ${style} transition`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium text-gray-900 text-sm">{label}</span>
    </Link>
  );
};

export default ProducerDashboardContent;