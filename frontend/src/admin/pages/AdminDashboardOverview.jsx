import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ArrowRight,
  BarChart3,
  FileText,
  Settings,
  Shield,
  Zap,
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

const COLORS = ['#11402D', '#9CF06B', '#16A34A', '#60A5FA', '#F59E0B', '#8B5CF6'];

export default function AdminDashboardOverview() {
  const navigate = useNavigate();
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
      // ─── Use ADMIN endpoints ──────────────────────────────
      const [
        usersRes,
        listingsRes,
        paymentsRes,
        collectionsRes,
      ] = await Promise.all([
        fetch(`${API_URL}/admin/users?per_page=100`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/admin/waste-sources`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/admin/payments?per_page=100`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/admin/collections?per_page=100`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      // Check for auth errors
      if (usersRes.status === 401 || usersRes.status === 403) {
        throw new Error('Session expired. Please login again.');
      }

      // ─── Parse responses ──────────────────────────────────
      const usersData = usersRes.ok ? await usersRes.json() : { data: [] };
      const listingsData = listingsRes.ok ? await listingsRes.json() : [];
      const paymentsData = paymentsRes.ok ? await paymentsRes.json() : { data: [] };
      const collectionsData = collectionsRes.ok ? await collectionsRes.json() : { data: [] };

      // Extract arrays (admin endpoints often return { data: [...] })
      const users = usersData.data || usersData || [];
      const listings = listingsData.data || listingsData || [];
      const payments = paymentsData.data || paymentsData || [];
      const collections = collectionsData.data || collectionsData || [];

      // ─── Stats ──────────────────────────────────────────────
      const totalUsers = users.length;
      const totalListings = listings.length;
      const totalPayments = payments.length;
      const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const totalWaste = listings.reduce((sum, l) => sum + (l.quantity || 0), 0);
      const activeJobs = collections.filter(c => c.status !== 'completed' && c.status !== 'cancelled').length;

      // ─── Waste by category ──────────────────────────────────
      const categoryMap = {};
      listings.forEach(l => {
        const cat = l.type || l.category || 'other';
        categoryMap[cat] = (categoryMap[cat] || 0) + 1;
      });
      let wasteByCategory = Object.entries(categoryMap).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }));
      if (wasteByCategory.length === 0) {
        wasteByCategory = [{ name: 'No Data', value: 1 }];
      }

      // ─── Revenue trend (last 7 days) ──────────────────────
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

      // ─── Collection trend (instead of transport) ──────────
      const transportTrend = days.map(day => {
        const dayCollections = collections.filter(c => c.created_at && c.created_at.startsWith(day));
        return {
          day: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
          created: dayCollections.length,
          completed: dayCollections.filter(c => c.status === 'completed' || c.status === 'delivered').length,
        };
      });

      // ─── Recent payments ────────────────────────────────────
      const recentPayments = payments.slice(0, 5).map(p => ({
        id: p.id,
        receipt: p.mpesa_receipt || p.receipt_number || `#${p.id}`,
        amount: p.amount || 0,
        status: p.status || 'pending',
        date: p.created_at,
      }));

      // ─── Recent listings ────────────────────────────────────
      const recentListings = listings.slice(0, 5).map(l => ({
        id: l.id,
        supplier: l.supplier_name || 'Unknown',
        waste: l.name || l.waste_type,
        status: l.status,
        date: l.created_at,
      }));

      // ─── Notifications (mock – replace with real endpoint) ──
      const notifications = [
        { id: 1, title: 'Payment Received', message: 'KES 15,000 from Producer #12', time: '2 min ago', type: 'success' },
        { id: 2, title: 'Transport Assigned', message: 'Job #45 assigned to Transporter #8', time: '15 min ago', type: 'info' },
        { id: 3, title: 'New Supplier Registered', message: 'Green Waste Ltd joined the platform', time: '1h ago', type: 'success' },
        { id: 4, title: 'Waste Request Approved', message: 'Request #120 approved by supplier', time: '3h ago', type: 'info' },
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

  // ─── Quick actions ─────────────────────────────────────────────
  const quickActions = [
    { label: 'View Users', icon: Users, path: '/admin/users', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
    { label: 'Payments', icon: CreditCard, path: '/admin/payments', color: 'bg-green-50 text-green-600 hover:bg-green-100' },
    { label: 'Reports', icon: BarChart3, path: '/admin/analytics', color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
    { label: 'Settings', icon: Settings, path: '/admin/settings', color: 'bg-gray-50 text-gray-600 hover:bg-gray-100' },
  ];

  // ─── Loading / Error states ────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#11402D] border-t-[#9CF06B] rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500 font-display">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 font-display">Unable to load dashboard</h3>
          <p className="text-gray-500 mt-2">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-6 py-2 bg-[#11402D] text-white rounded-xl hover:bg-[#0E2A1C] transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { stats, revenueTrend, wasteByCategory, transportTrend, recentPayments, recentListings, notifications } = data;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Inter']">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono-cw { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* ─── Header ────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-[#0E2A1C]">
              Good Morning, Admin 👋
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Here’s what’s happening on your platform today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4 text-gray-500" />
            </button>
            <button className="relative p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition">
              <Bell className="w-4 h-4 text-gray-500" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500" />
            </button>
            <button className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition">
              <Mail className="w-4 h-4 text-gray-500" />
            </button>
            <button className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-[#11402D] px-4 py-2 text-sm font-bold text-white hover:bg-[#0E2A1C] transition">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* ─── Stats (5 cards) ───────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard icon={Users} label="Users" value={stats.totalUsers} color="blue" />
          <StatCard icon={Package} label="Listings" value={stats.totalListings} color="green" />
          <StatCard icon={CreditCard} label="Payments" value={stats.totalPayments} color="purple" />
          <StatCard icon={DollarSign} label="Revenue" value={`KES ${(stats.totalRevenue / 1000).toFixed(0)}K`} color="gold" />
          <StatCard icon={Truck} label="Active Jobs" value={stats.activeJobs} color="indigo" />
        </div>

        {/* ─── Charts Row ────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-display font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#11402D]" /> Revenue Trend (7d)
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `KES ${v/1000}k`} />
                <Tooltip formatter={(v) => `KES ${v.toLocaleString()}`} />
                <Area type="monotone" dataKey="revenue" stroke="#11402D" fill="#11402D" fillOpacity={0.12} name="Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-display font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-[#11402D]" /> Waste by Category
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={wasteByCategory} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2} dataKey="value" label={({ name }) => name}>
                  {wasteByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ─── Transport Chart ───────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-display font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#11402D]" /> Transport Activity (7d)
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={transportTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="created" stroke="#11402D" name="Created" strokeWidth={2} />
              <Line type="monotone" dataKey="completed" stroke="#9CF06B" name="Completed" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ─── Recent Activity & Quick Actions ──────────────────── */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Payments */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <h4 className="font-display font-semibold text-gray-900">Recent Payments</h4>
              <button
                onClick={() => navigate('/admin/payments')}
                className="text-xs text-[#11402D] hover:underline flex items-center gap-1"
              >
                View All <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {recentPayments.map(p => (
                <div key={p.id} className="px-5 py-3 hover:bg-gray-50 transition flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.receipt}</p>
                    <p className="text-xs text-gray-400">{p.date ? new Date(p.date).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">KES {p.amount.toLocaleString()}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
              {recentPayments.length === 0 && (
                <div className="px-5 py-6 text-center text-sm text-gray-400">No recent payments</div>
              )}
            </div>
          </div>

          {/* Recent Listings */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <h4 className="font-display font-semibold text-gray-900">Recent Listings</h4>
              <button
                onClick={() => navigate('/admin/waste-listings')}
                className="text-xs text-[#11402D] hover:underline flex items-center gap-1"
              >
                View All <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {recentListings.map(l => (
                <div key={l.id} className="px-5 py-3 hover:bg-gray-50 transition flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{l.waste}</p>
                    <p className="text-xs text-gray-400">by {l.supplier}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${l.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {l.status}
                    </span>
                  </div>
                </div>
              ))}
              {recentListings.length === 0 && (
                <div className="px-5 py-6 text-center text-sm text-gray-400">No recent listings</div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h4 className="font-display font-semibold text-gray-900 mb-3">⚡ Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.path)}
                    className={`flex items-center gap-2 p-3 rounded-xl ${action.color} transition text-sm font-medium`}
                  >
                    <Icon className="w-4 h-4" />
                    {action.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="bg-[#11402D]/5 rounded-xl p-3 flex items-center gap-3">
                <Shield className="w-5 h-5 text-[#11402D]" />
                <div>
                  <p className="text-sm font-semibold text-[#0E2A1C]">All systems operational</p>
                  <p className="text-xs text-gray-500">100% uptime over last 24h</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Notifications Bar ─────────────────────────────────── */}
        {notifications.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-display font-semibold text-gray-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#11402D]" /> Notifications
              </h4>
              <button className="text-xs text-[#11402D] hover:underline">Mark all read</button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {notifications.map(n => (
                <div key={n.id} className="flex items-start gap-2 p-2 rounded-xl hover:bg-gray-50 transition">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${n.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{n.title}</p>
                    <p className="text-xs text-gray-500">{n.message}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Footer ────────────────────────────────────────────── */}
        <div className="text-center text-xs text-gray-400 border-t border-gray-200 pt-4 mt-4 font-mono-cw">
          ReVive Energy Admin · v1.0 · <span className="inline-block w-2 h-2 rounded-full bg-green-500 ml-1" /> All systems operational
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card Component ──────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    gold: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  };
  const style = colorMap[color] || colorMap.blue;

  return (
    <div className={`bg-white rounded-2xl p-4 shadow-sm border ${style}`}>
      <div className="flex items-center justify-between">
        <div className={`w-9 h-9 rounded-xl bg-white flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${style.split(' ')[1]}`} />
        </div>
      </div>
      <p className="mt-2 font-display text-xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}