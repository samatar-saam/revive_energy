// src/admin/pages/AdminDashboardOverview.jsx
import { useState, useEffect } from 'react';
import {
  Users,
  Package,
  CreditCard,
  TrendingUp,
  Truck,
  DollarSign,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Bell,
  Mail,
  Download,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const COLORS = ['#16a34a', '#22c55e', '#34d399', '#60a5fa', '#fbbf24', '#f59e0b', '#ef4444'];

export default function AdminDashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    stats: {
      totalUsers: 0,
      totalListings: 0,
      totalPayments: 0,
      totalRevenue: 0,
      totalWaste: 0,
      activeJobs: 0,
    },
    revenueTrend: [],
    wasteByCategory: [],
    transportTrend: [],
    recentPayments: [],
    recentListings: [],
    notifications: [],
  });

  const getToken = () => localStorage.getItem('token');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    const token = getToken();
    if (!token) {
      setError('Please login to view the dashboard');
      setLoading(false);
      return;
    }

    try {
      const [usersRes, listingsRes, paymentsRes, jobsRes] = await Promise.all([
        fetch(`${API_URL}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/admin/waste-sources`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/payments/my-payments`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/transporter/jobs`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (usersRes.status === 401 || usersRes.status === 403) {
        throw new Error('Session expired. Please login again.');
      }

      const users = usersRes.ok ? await usersRes.json() : [];
      const listings = listingsRes.ok ? await listingsRes.json() : [];
      const payments = paymentsRes.ok ? await paymentsRes.json() : [];
      const jobs = jobsRes.ok ? await jobsRes.json() : [];

      // ─── Compute stats ──────────────────────────────────
      const totalUsers = users.length;
      const totalListings = listings.length;
      const totalPayments = payments.length;
      const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const totalWaste = listings.reduce((sum, l) => sum + (l.quantity || 0), 0);
      const activeJobs = jobs.filter(j => j.status !== 'completed' && j.status !== 'cancelled').length;

      // ─── Waste by category ──────────────────────────────
      const categoryMap = {};
      listings.forEach(l => {
        const cat = l.type || 'other';
        categoryMap[cat] = (categoryMap[cat] || 0) + 1;
      });
      const wasteByCategory = Object.entries(categoryMap).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }));

      // ─── Revenue trend (last 7 days) ────────────────────
      const now = new Date();
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
      });
      const revenueTrend = days.map(day => {
        const dailyTotal = payments
          .filter(p => p.created_at && p.created_at.startsWith(day))
          .reduce((sum, p) => sum + (p.amount || 0), 0);
        return { day: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }), revenue: dailyTotal };
      });

      // ─── Transport trend ──────────────────────────────────
      const transportTrend = days.map(day => {
        const dayJobs = jobs.filter(j => j.created_at && j.created_at.startsWith(day));
        return {
          day: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
          created: dayJobs.length,
          completed: dayJobs.filter(j => j.status === 'completed' || j.status === 'delivered').length,
        };
      });

      // ─── Recent payments ──────────────────────────────────
      const recentPayments = payments.slice(0, 5).map(p => ({
        id: p.id,
        receipt: p.mpesa_receipt || p.receipt_number || `#${p.id}`,
        amount: p.amount || 0,
        status: p.status || 'pending',
        date: p.created_at,
      }));

      // ─── Recent listings ──────────────────────────────────
      const recentListings = listings.slice(0, 5).map(l => ({
        id: l.id,
        supplier: l.supplier_name || 'Unknown',
        waste: l.name,
        status: l.status,
        date: l.created_at,
      }));

      // ─── Notifications (mock – can be replaced with real endpoint) ──
      const notifications = [
        { id: 1, title: 'Payment Received', message: 'KES 15,000 from Producer #12', time: '2 min ago' },
        { id: 2, title: 'Transport Assigned', message: 'Job #45 assigned to Transporter #8', time: '15 min ago' },
        { id: 3, title: 'New Supplier Registered', message: 'Green Waste Ltd joined the platform', time: '1h ago' },
        { id: 4, title: 'Waste Request Approved', message: 'Request #120 approved by supplier', time: '3h ago' },
      ];

      setData({
        stats: {
          totalUsers,
          totalListings,
          totalPayments,
          totalRevenue,
          totalWaste,
          activeJobs,
        },
        revenueTrend,
        wasteByCategory,
        transportTrend,
        recentPayments,
        recentListings,
        notifications,
      });
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.message || 'Failed to load dashboard data');
      toast.error(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#16a34a] border-t-[#14532d] rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900">Unable to load dashboard</h3>
          <p className="text-gray-500 mt-2">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-6 py-2 bg-[#16a34a] text-white rounded-xl hover:bg-[#14532d] transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { stats, revenueTrend, wasteByCategory, transportTrend, recentPayments, recentListings, notifications } = data;

  return (
    <div className="space-y-6 p-4 lg:p-6 bg-gray-50 min-h-screen">
      {/* ─── Hero Header ────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Good Morning Admin 👋</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor platform performance and key metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchDashboardData} className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          <button className="relative p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition">
            <Bell className="w-4 h-4 text-gray-500" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500" />
          </button>
          <button className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition">
            <Mail className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* ─── 6 Key Stats ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Users} label="Total Users" value={stats.totalUsers} trend="+12%" color="emerald" />
        <StatCard icon={Package} label="Listings" value={stats.totalListings} trend="+8%" color="blue" />
        <StatCard icon={CreditCard} label="Payments" value={stats.totalPayments} trend="+15%" color="purple" />
        <StatCard icon={DollarSign} label="Revenue" value={`KES ${(stats.totalRevenue / 1000).toFixed(0)}K`} trend="+22%" color="gold" />
        <StatCard icon={Truck} label="Active Jobs" value={stats.activeJobs} trend="+5%" color="indigo" />
        <StatCard icon={TrendingUp} label="Waste (tons)" value={stats.totalWaste.toFixed(1)} trend="+18%" color="green" />
      </div>

      {/* ─── Charts Row ────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#16a34a]" /> Revenue Trend
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => `KES ${v.toLocaleString()}`} />
              <Area type="monotone" dataKey="revenue" stroke="#16a34a" fill="#16a34a" fillOpacity={0.15} name="Revenue" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#16a34a]" /> Waste by Category
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={wasteByCategory} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value" label={({ name }) => name}>
                {wasteByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ─── Transport Chart ──────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Truck className="w-5 h-5 text-[#16a34a]" /> Transport Activity
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={transportTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="created" stroke="#16a34a" name="Created" />
            <Line type="monotone" dataKey="completed" stroke="#34d399" name="Completed" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ─── Tables Row ────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Recent Payments</h3>
            <button className="text-sm text-[#16a34a] hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-2 text-left">Receipt</th>
                  <th className="px-4 py-2 text-left">Amount</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentPayments.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono text-xs">{p.receipt}</td>
                    <td className="px-4 py-2 font-semibold">KES {p.amount.toLocaleString()}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-500 text-xs">
                      {p.date ? new Date(p.date).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Listings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Recent Listings</h3>
            <button className="text-sm text-[#16a34a] hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-2 text-left">Supplier</th>
                  <th className="px-4 py-2 text-left">Waste</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentListings.map(l => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{l.supplier}</td>
                    <td className="px-4 py-2">{l.waste}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${l.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-500 text-xs">
                      {l.date ? new Date(l.date).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ─── Notifications & Quick Actions ──────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#16a34a]" /> Notifications
          </h3>
          <div className="space-y-2">
            {notifications.map(n => (
              <div key={n.id} className="flex items-start gap-3 p-2 rounded-xl hover:bg-gray-50">
                <div className="w-2 h-2 rounded-full bg-[#16a34a] mt-2" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">{n.title}</p>
                  <p className="text-xs text-gray-500">{n.message}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">⚡ Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Approve Companies', icon: CheckCircle, color: 'emerald' },
              { label: 'Verify Users', icon: Users, color: 'blue' },
              { label: 'View Reports', icon: Eye, color: 'purple' },
              { label: 'Export Data', icon: Download, color: 'gray' },
            ].map((action) => {
              const Icon = action.icon;
              const colorMap = {
                emerald: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
                blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
                purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
                gray: 'bg-gray-50 text-gray-600 hover:bg-gray-100',
              };
              return (
                <button key={action.label} className={`flex items-center gap-2 p-3 rounded-xl ${colorMap[action.color]} transition`}>
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Footer ──────────────────────────────────────────── */}
      <div className="text-center text-xs text-gray-400 border-t border-gray-200 pt-4 mt-4">
        ReVive Energy Admin · v1.0 · <span className="inline-block w-2 h-2 rounded-full bg-green-500 ml-1" /> All systems operational
      </div>
    </div>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, trend, color }) {
  const colorMap = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    gold: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    green: 'bg-green-50 text-green-600 border-green-100',
  };
  const style = colorMap[color] || colorMap.emerald;

  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border ${style}`}>
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${style.split(' ')[1]}`} />
        </div>
        {trend && <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{trend}</span>}
      </div>
      <p className="mt-2 font-display text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}