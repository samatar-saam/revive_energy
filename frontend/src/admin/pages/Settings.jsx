// src/admin/pages/Settings.jsx
import React, { useState, useEffect } from 'react';
import {
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Globe,
  Users,
  CreditCard,
  Mail,
  Shield,
  Key,
  DollarSign,
  Percent,
  Phone,
  Building2,
  MapPin,
  Clock,
  Zap,
  Truck,
  Leaf,
} from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({});
  const [formData, setFormData] = useState({});

  const getToken = () => localStorage.getItem('token');

  // ─── Fetch settings ──────────────────────────────────────────
  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        setError('Not authenticated. Please login.');
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) {
        setError('Session expired. Please login again.');
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setSettings(data);
      setFormData(data);
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError(err.message);
      toast.error(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // ─── Handle form changes ────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // ─── Save settings ───────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`${API_URL}/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Save failed');
      }

      toast.success('Settings saved successfully');
      setSettings(formData);
    } catch (err) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // ─── Reset to saved settings ────────────────────────────────
  const handleReset = () => {
    setFormData(settings);
    toast.info('Settings reset to saved values');
  };

  // ─── Tab content ─────────────────────────────────────────────
  const renderGeneral = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
        <input
          type="text"
          name="site_name"
          value={formData.site_name || ''}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Site URL</label>
        <input
          type="text"
          name="site_url"
          value={formData.site_url || ''}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
        <input
          type="email"
          name="support_email"
          value={formData.support_email || ''}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
        <input
          type="text"
          name="contact_phone"
          value={formData.contact_phone || ''}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Default Location</label>
        <input
          type="text"
          name="default_location"
          value={formData.default_location || ''}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Nairobi, Kenya"
        />
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Mode</label>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="maintenance_mode"
            checked={formData.maintenance_mode || false}
            onChange={handleChange}
            className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
          />
          <span className="text-sm text-gray-600">Enable maintenance mode (only admins can access)</span>
        </div>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Allow New Registrations</label>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="allow_registration"
            checked={formData.allow_registration !== false}
            onChange={handleChange}
            className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
          />
          <span className="text-sm text-gray-600">Enable public registration</span>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Require Email Verification</label>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="require_email_verification"
            checked={formData.require_email_verification !== false}
            onChange={handleChange}
            className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
          />
          <span className="text-sm text-gray-600">Users must verify email before login</span>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Default User Role</label>
        <select
          name="default_user_role"
          value={formData.default_user_role || 'supplier'}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="supplier">Supplier</option>
          <option value="producer">Producer</option>
          <option value="transporter">Transporter</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code Expiry (minutes)</label>
        <input
          type="number"
          name="verification_code_expiry"
          value={formData.verification_code_expiry || 10}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
          min="1"
          max="60"
        />
      </div>
    </div>
  );

  const renderPayment = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Platform Commission (%)</label>
        <input
          type="number"
          name="platform_commission_rate"
          value={formData.platform_commission_rate || 5}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
          step="0.1"
          min="0"
          max="100"
        />
        <p className="text-xs text-gray-500 mt-1">Percentage taken from each transaction</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
        <select
          name="currency"
          value={formData.currency || 'KES'}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="KES">Kenyan Shilling (KES)</option>
          <option value="USD">US Dollar (USD)</option>
          <option value="EUR">Euro (EUR)</option>
          <option value="GBP">British Pound (GBP)</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">M-PESA Environment</label>
        <select
          name="mpesa_environment"
          value={formData.mpesa_environment || 'sandbox'}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="sandbox">Sandbox (Testing)</option>
          <option value="production">Production</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">M-PESA Shortcode</label>
        <input
          type="text"
          name="mpesa_shortcode"
          value={formData.mpesa_shortcode || ''}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">M-PESA Consumer Key</label>
        <input
          type="text"
          name="mpesa_consumer_key"
          value={formData.mpesa_consumer_key || ''}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">M-PESA Consumer Secret</label>
        <input
          type="text"
          name="mpesa_consumer_secret"
          value={formData.mpesa_consumer_secret || ''}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">M-PESA Passkey</label>
        <input
          type="text"
          name="mpesa_passkey"
          value={formData.mpesa_passkey || ''}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">M-PESA Callback URL</label>
        <input
          type="text"
          name="mpesa_callback_url"
          value={formData.mpesa_callback_url || ''}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
    </div>
  );

  const renderEmail = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Server</label>
        <input
          type="text"
          name="mail_server"
          value={formData.mail_server || ''}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
          placeholder="smtp.gmail.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
        <input
          type="number"
          name="mail_port"
          value={formData.mail_port || 587}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Username</label>
        <input
          type="text"
          name="mail_username"
          value={formData.mail_username || ''}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Password</label>
        <input
          type="password"
          name="mail_password"
          value={formData.mail_password || ''}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Default Sender Email</label>
        <input
          type="email"
          name="mail_default_sender"
          value={formData.mail_default_sender || ''}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Use TLS</label>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="mail_use_tls"
            checked={formData.mail_use_tls !== false}
            onChange={handleChange}
            className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
          />
          <span className="text-sm text-gray-600">Enable TLS encryption</span>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Allow 2FA</label>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="allow_2fa"
            checked={formData.allow_2fa || false}
            onChange={handleChange}
            className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
          />
          <span className="text-sm text-gray-600">Enable two-factor authentication</span>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label>
        <input
          type="number"
          name="session_timeout"
          value={formData.session_timeout || 60}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
          min="5"
          max="1440"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Max Login Attempts</label>
        <input
          type="number"
          name="max_login_attempts"
          value={formData.max_login_attempts || 5}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
          min="1"
          max="20"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password Minimum Length</label>
        <input
          type="number"
          name="password_min_length"
          value={formData.password_min_length || 8}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
          min="6"
          max="30"
        />
      </div>
    </div>
  );

  // ─── Tabs ─────────────────────────────────────────────────────
  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#11402D] border-t-[#9CF06B] rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500 font-display">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 font-display">Unable to load settings</h3>
          <p className="text-gray-500 mt-2">{error}</p>
          <button
            onClick={fetchSettings}
            className="mt-4 px-6 py-2 bg-[#11402D] text-white rounded-xl hover:bg-[#0E2A1C] transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Inter']">
      {/* ─── Fonts ────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono-cw { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* ─── Header ────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl lg:text-3xl font-bold text-gray-900">Settings</h2>
            <p className="text-sm text-gray-500 mt-1">Manage platform configuration and preferences</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#11402D] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#0E2A1C] transition disabled:opacity-70"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* ─── Tabs ───────────────────────────────────────────────── */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-xl transition ${
                    activeTab === tab.id
                      ? 'bg-white text-[#11402D] border-b-2 border-[#11402D]'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-display">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* ─── Content ───────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {activeTab === 'general' && renderGeneral()}
          {activeTab === 'users' && renderUserManagement()}
          {activeTab === 'payment' && renderPayment()}
          {activeTab === 'email' && renderEmail()}
          {activeTab === 'security' && renderSecurity()}
        </div>
      </div>
    </div>
  );
}