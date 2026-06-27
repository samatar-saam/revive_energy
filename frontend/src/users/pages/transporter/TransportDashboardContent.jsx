// src/users/pages/transporter/TransportDashboardContent.jsx
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
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
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
  AreaChart,
  Area,
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const COLORS = ['#11402D', '#34D399', '#60A5FA', '#FBBF24', '#F59E0B', '#EF4444'];

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

  // ─── Chart Data ──────────────────────────────────────────────
  // Pie chart: job status distribution
  const pieData = [
    { name: 'Open', value: dashboardData.open_jobs_count || 0 },
    { name: 'Accepted', value: dashboardData.accepted_jobs_count || 0 },
    { name: 'Active Deliveries', value: dashboardData.active_deliveries_count || 0 },
    { name: 'Completed', value: dashboardData.completed_deliveries_count || 0 },
  ].filter(d => d.value > 0);

  // Weekly activity – mock data (in a real app, fetch from backend)
  const weeklyData = [
    { day: 'Mon', jobs: 2, earnings: 1500 },
    { day: 'Tue', jobs: 4, earnings: 3200 },
    { day: 'Wed', jobs: 3, earnings: 2100 },
    { day: 'Thu', jobs: 5, earnings: 4500 },
    { day: 'Fri', jobs: 7, earnings: 6200 },
    { day: 'Sat', jobs: 2, earnings: 1800 },
    { day: 'Sun', jobs: 1, earnings: 900 },
  ];

  // Recent accepted jobs (for table)
  const recentJobs = dashboardData.accepted_jobs.slice(0, 5);

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
      {/* ─── STAT CARDS ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Package}
          label="Available Jobs"
          value={open_jobs_count}
          color="blue"
          badge={open_jobs_count}
        />
        <StatCard
          icon={Clock}
          label="Accepted Jobs"
          value={accepted_jobs_count}
          color="yellow"
          badge={accepted_jobs_count}
        />
        <StatCard
          icon={Truck}
          label="Active Deliveries"
          value={active_deliveries_count}
          color="indigo"
          badge={active_deliveries_count}
        />
        <StatCard
          icon={CheckCircle}
          label="Completed Deliveries"
          value={completed_deliveries_count}
          color="green"
          badge={completed_deliveries_count}
        />
      </div>

      {/* ─── CHARTS ROW ──────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pie Chart – Job Status Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-gray-900 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-[#11402D]" />
              Job Status Distribution
            </h3>
            <span className="text-xs text-gray-400">current status</span>
          </div>
          {pieData.length === 0 ? (
            <p className="text-gray-500 text-sm py-8 text-center">No job data to display</p>
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
                <Tooltip formatter={(value) => `${value} jobs`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Area/Bar Chart – Weekly Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#11402D]" />
              Weekly Activity
            </h3>
            <span className="text-xs text-gray-400">jobs accepted</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="jobs" fill="#11402D" radius={[4, 4, 0, 0]} name="Jobs Accepted" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ─── TABLE: Recent Accepted Jobs ────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-display font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#11402D]" />
            Recently Accepted Jobs
          </h3>
          <Link to="/dashboard/accepted-jobs" className="text-sm text-[#11402D] hover:underline">
            View All
          </Link>
        </div>
        {recentJobs.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No accepted jobs yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium">
                <tr>
                  <th className="px-6 py-3 text-left">Waste Type</th>
                  <th className="px-6 py-3 text-left">Quantity</th>
                  <th className="px-6 py-3 text-left">Route</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-3 font-medium text-gray-900">{job.waste_type}</td>
                    <td className="px-6 py-3 text-gray-700">{job.quantity}</td>
                    <td className="px-6 py-3 text-gray-700 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      {job.pickup_location} → {job.delivery_location}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        job.status === 'accepted' ? 'bg-yellow-100 text-yellow-700' :
                        job.status === 'picked_up' ? 'bg-blue-100 text-blue-700' :
                        job.status === 'in_transit' ? 'bg-indigo-100 text-indigo-700' :
                        job.status === 'delivered' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {new Date(job.created_at).toLocaleDateString()}
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
            to="/dashboard/jobs"
            icon={Plus}
            label="Accept Job"
            color="emerald"
          />
          <ActionButton
            to="/dashboard/deliveries"
            icon={Eye}
            label="Track Delivery"
            color="blue"
          />
          <ActionButton
            to="/dashboard/earnings"
            icon={DollarSign}
            label="View Earnings"
            color="yellow"
          />
          <ActionButton
            to="/dashboard/invoices"
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

// ─── Sub‑components ─────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, color, badge }) => {
  const colorMap = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-100' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
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

export default TransportDashboardContent;