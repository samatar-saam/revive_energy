// src/admin/pages/PricingSettings.jsx
import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Wallet,
  CreditCard,
  Clock,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  History,
  RotateCcw,
  Eye,
  X,
  Calendar,
  User,
  Edit,
  Zap,
  Truck,
  Leaf,
} from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function PricingSettings() {
  // ─── State ──────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({});
  const [originalSettings, setOriginalSettings] = useState({});
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [previewChanges, setPreviewChanges] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({});

  const getToken = () => localStorage.getItem('token');

  // ─── Fetch settings ────────────────────────────────────────────
  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }
      const res = await fetch(`${API_URL}/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSettings(data);
      setOriginalSettings(data);
      setPendingChanges({});
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const token = getToken();
      if (!token) return;
      const res = await fetch(`${API_URL}/admin/settings/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (e) {
      console.error('History error:', e);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchHistory();
  }, []);

  // ─── Handle changes ────────────────────────────────────────────
  const handleChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    // Track pending changes
    if (originalSettings[key] !== value) {
      setPendingChanges({ ...pendingChanges, [key]: value });
    } else {
      const { [key]: _, ...rest } = pendingChanges;
      setPendingChanges(rest);
    }
  };

  const handleSwitchChange = (key) => {
    handleChange(key, !settings[key]);
  };

  // ─── Save settings ─────────────────────────────────────────────
  const handleSave = async () => {
    setShowConfirm(true);
  };

  const confirmSave = async () => {
    setSaving(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Save failed');
      }
      toast.success('Settings saved successfully');
      setOriginalSettings(settings);
      setPendingChanges({});
      setShowConfirm(false);
      fetchHistory();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(originalSettings);
    setPendingChanges({});
    toast.info('Reset to last saved values');
  };

  // ─── Format helpers ────────────────────────────────────────────
  const formatDate = (d) => d ? new Date(d).toLocaleString() : 'N/A';
  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount || 0);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchSettings} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pricing Settings</h2>
          <p className="text-sm text-gray-500">Control all platform fees and configurations</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm"
          >
            <History className="h-4 w-4" /> {showHistory ? 'Hide History' : 'View History'}
          </button>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-xl bg-[#11402D] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#0E2A1C] transition shadow-sm disabled:opacity-70"
          >
            <Save className="h-4 w-4" /> Save Settings
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Platform Fee" value={`${settings.platform_fee || 0}%`} icon={DollarSign} color="green" />
        <StatCard label="Transport Commission" value={`${settings.transport_commission || 0}%`} icon={Truck} color="blue" />
        <StatCard label="Withdrawal Fee" value={formatCurrency(settings.withdrawal_fee)} icon={Wallet} color="orange" />
        <StatCard label="Carbon Credit Commission" value={`${settings.carbon_credit_commission || 0}%`} icon={Leaf} color="green" />
        <StatCard label="VAT Rate" value={`${settings.vat_rate || 0}%`} icon={CreditCard} color="purple" />
        <StatCard label="Last Updated" value={formatDate(settings.updated_at)} icon={Clock} color="gray" />
      </div>

      {/* Settings Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-8">
        <h3 className="font-semibold text-gray-700">Platform Fee Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Platform Fee (%)</label>
            <input
              type="number"
              step="0.01"
              value={settings.platform_fee || 0}
              onChange={(e) => handleChange('platform_fee', parseFloat(e.target.value))}
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-400 mt-1">Percentage taken from each transaction</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Transport Commission (%)</label>
            <input
              type="number"
              step="0.01"
              value={settings.transport_commission || 0}
              onChange={(e) => handleChange('transport_commission', parseFloat(e.target.value))}
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Withdrawal Fee (KES)</label>
            <input
              type="number"
              step="1"
              value={settings.withdrawal_fee || 0}
              onChange={(e) => handleChange('withdrawal_fee', parseFloat(e.target.value))}
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Minimum Withdrawal (KES)</label>
            <input
              type="number"
              step="1"
              value={settings.min_withdrawal || 0}
              onChange={(e) => handleChange('min_withdrawal', parseFloat(e.target.value))}
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Maximum Withdrawal (KES)</label>
            <input
              type="number"
              step="1"
              value={settings.max_withdrawal || 0}
              onChange={(e) => handleChange('max_withdrawal', parseFloat(e.target.value))}
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Carbon Credit Commission (%)</label>
            <input
              type="number"
              step="0.01"
              value={settings.carbon_credit_commission || 0}
              onChange={(e) => handleChange('carbon_credit_commission', parseFloat(e.target.value))}
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">VAT Rate (%)</label>
            <input
              type="number"
              step="0.01"
              value={settings.vat_rate || 0}
              onChange={(e) => handleChange('vat_rate', parseFloat(e.target.value))}
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Escrow Holding Period (days)</label>
            <input
              type="number"
              step="1"
              value={settings.escrow_holding_period || 7}
              onChange={(e) => handleChange('escrow_holding_period', parseInt(e.target.value))}
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Late Payment Penalty (%)</label>
            <input
              type="number"
              step="0.01"
              value={settings.late_payment_penalty || 0}
              onChange={(e) => handleChange('late_payment_penalty', parseFloat(e.target.value))}
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <h3 className="font-semibold text-gray-700 mb-4">Features & Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'auto_release_escrow', label: 'Auto Release Escrow' },
              { key: 'auto_refund_expired', label: 'Auto Refund Expired Payments' },
              { key: 'allow_manual_withdrawal', label: 'Allow Manual Withdrawal' },
              { key: 'maintenance_mode', label: 'Maintenance Mode' },
              { key: 'email_notifications', label: 'Email Notifications' },
              { key: 'sms_notifications', label: 'SMS Notifications' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-700">{label}</span>
                <button
                  onClick={() => handleSwitchChange(key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${settings[key] ? 'bg-[#11402D]' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${settings[key] ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* History Section */}
      {showHistory && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Change History</h3>
          {history.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No changes logged yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-500">User</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-500">Field</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-500">Old Value</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-500">New Value</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map((h, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition">
                      <td className="px-4 py-2 text-sm">{h.user_name}</td>
                      <td className="px-4 py-2 text-sm">{h.field}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">{h.old_value}</td>
                      <td className="px-4 py-2 text-sm font-medium text-[#11402D]">{h.new_value}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">{formatDate(h.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Preview Changes Modal */}
      {previewChanges && Object.keys(pendingChanges).length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Preview Changes</h3>
              <button onClick={() => setPreviewChanges(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <div className="space-y-2">
              {Object.entries(pendingChanges).map(([key, newVal]) => (
                <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">{key}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 line-through">{originalSettings[key]}</span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-bold text-[#11402D]">{newVal}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setPreviewChanges(false)} className="rounded-xl bg-[#11402D] px-6 py-2.5 text-white font-bold hover:bg-[#0E2A1C]">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Save Confirmation */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900">Confirm Save</h3>
            <p className="text-sm text-gray-600 mt-2">Are you sure you want to save these changes? This will update all platform settings.</p>
            <div className="mt-4 max-h-48 overflow-y-auto space-y-1">
              {Object.entries(pendingChanges).map(([key, val]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-gray-500">{key}</span>
                  <span className="font-medium">{val}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowConfirm(false)} className="flex-1 rounded-xl border border-gray-200 py-2.5 font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={confirmSave} disabled={saving} className="flex-1 rounded-xl bg-[#11402D] py-2.5 font-bold text-white hover:bg-[#0E2A1C] disabled:opacity-70">
                {saving ? 'Saving...' : 'Confirm Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Reusable sub-components (simplified) ──────────────────────

function StatCard({ label, value, icon: Icon, color }) {
  const colorMap = {
    green: 'bg-green-50 text-green-600 border-green-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    gray: 'bg-gray-50 text-gray-600 border-gray-100',
  };
  const style = colorMap[color] || colorMap.blue;
  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border ${style}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl ${style}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#11402D] border-t-[#9CF06B] rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-gray-500">Loading...</p>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900">Unable to load</h3>
        <p className="text-gray-500 mt-2">{message}</p>
        <button onClick={onRetry} className="mt-4 px-6 py-2 bg-[#11402D] text-white rounded-xl hover:bg-[#0E2A1C] transition">Try Again</button>
      </div>
    </div>
  );
}