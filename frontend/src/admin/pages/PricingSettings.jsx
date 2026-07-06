// src/admin/pages/PricingSettings.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  Truck,
  Wallet,
  Clock,
  Package,
  Calendar,
  Save,
  RefreshCw,
  AlertCircle,
  History,
  RotateCcw,
  Eye,
  X,
  Edit,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── Default waste types ────────────────────────────────────────
const DEFAULT_WASTE_TYPES = [
  'Organic Waste',
  'Food Waste',
  'Agricultural Waste',
  'Plastic',
  'Paper',
  'Glass',
  'Metal',
  'E-Waste',
  'Biomass',
  'Mixed Waste',
  'Industrial Waste',
];

// ─── Helper functions ──────────────────────────────────────────
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(amount || 0);
}

function formatDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-KE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusBadge(status) {
  const map = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-700',
  };
  return map[status] || 'bg-gray-100 text-gray-700';
}

export default function PricingSettings() {
  // ─── State ──────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState(null);
  const [originalSettings, setOriginalSettings] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({});
  const [editingWaste, setEditingWaste] = useState(null);
  const [showWasteModal, setShowWasteModal] = useState(false);
  const [wasteForm, setWasteForm] = useState({ type: '', price: '', status: 'active' });

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

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      // Ensure waste_pricing exists
      let wastePricing = data.waste_pricing;
      if (!wastePricing || typeof wastePricing === 'string') {
        try {
          wastePricing = wastePricing ? JSON.parse(wastePricing) : null;
        } catch {
          wastePricing = null;
        }
      }
      if (!wastePricing || !Array.isArray(wastePricing) || wastePricing.length === 0) {
        wastePricing = DEFAULT_WASTE_TYPES.map(type => ({
          waste_type: type,
          price_per_kg: 0,
          status: 'active',
        }));
      }
      // Make sure all default types exist
      const existingTypes = wastePricing.map(w => w.waste_type);
      for (const def of DEFAULT_WASTE_TYPES) {
        if (!existingTypes.includes(def)) {
          wastePricing.push({ waste_type: def, price_per_kg: 0, status: 'active' });
        }
      }
      // Reorder to match default order
      const ordered = [];
      for (const def of DEFAULT_WASTE_TYPES) {
        const found = wastePricing.find(w => w.waste_type === def);
        if (found) ordered.push(found);
      }
      wastePricing = ordered;

      const settingsData = { ...data, waste_pricing: wastePricing };
      setSettings(settingsData);
      setOriginalSettings(JSON.parse(JSON.stringify(settingsData)));
      setPendingChanges({});
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError(err.message);
      toast.error(err.message || 'Failed to load settings');
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

  // ─── Handle changes ──────────────────────────────────────────
  const handleChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    // Compare with original
    if (JSON.stringify(originalSettings[key]) !== JSON.stringify(value)) {
      setPendingChanges({ ...pendingChanges, [key]: value });
    } else {
      const { [key]: _, ...rest } = pendingChanges;
      setPendingChanges(rest);
    }
  };

  const handleSwitchChange = (key) => {
    handleChange(key, !settings[key]);
  };

  // ─── Waste pricing handlers ──────────────────────────────────
  const handleWasteEdit = (waste) => {
    setEditingWaste(waste);
    setWasteForm({
      type: waste.waste_type,
      price: waste.price_per_kg,
      status: waste.status,
    });
    setShowWasteModal(true);
  };

  const handleWasteSave = () => {
    if (!wasteForm.type.trim()) {
      toast.error('Waste type is required');
      return;
    }
    const price = parseFloat(wasteForm.price);
    if (isNaN(price) || price < 0) {
      toast.error('Please enter a valid price');
      return;
    }

    const updatedPricing = settings.waste_pricing.map(w =>
      w.waste_type === editingWaste.waste_type
        ? { ...w, waste_type: wasteForm.type, price_per_kg: price, status: wasteForm.status }
        : w
    );

    // If type changed, ensure no duplicates
    const finalPricing = [];
    const seen = new Set();
    for (const w of updatedPricing) {
      if (!seen.has(w.waste_type)) {
        seen.add(w.waste_type);
        finalPricing.push(w);
      }
    }

    const newSettings = { ...settings, waste_pricing: finalPricing };
    setSettings(newSettings);

    // Track change
    const oldItem = originalSettings.waste_pricing.find(w => w.waste_type === editingWaste.waste_type);
    const newItem = finalPricing.find(w => w.waste_type === wasteForm.type);
    if (JSON.stringify(oldItem) !== JSON.stringify(newItem)) {
      setPendingChanges({ ...pendingChanges, waste_pricing: finalPricing });
    }

    setShowWasteModal(false);
    setEditingWaste(null);
    toast.success('Waste pricing updated');
  };

  // ─── Save settings ────────────────────────────────────────────
  const handleSave = () => {
    setShowConfirm(true);
  };

  const confirmSave = async () => {
    setSaving(true);
    try {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');

      // Prepare payload: convert waste_pricing to JSON string
      const payload = { ...settings };
      payload.waste_pricing = JSON.stringify(payload.waste_pricing);

      const res = await fetch(`${API_URL}/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Save failed');
      }

      toast.success('Settings saved successfully');
      // Re-fetch to get updated timestamps, etc.
      await fetchSettings();
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
    setSettings(JSON.parse(JSON.stringify(originalSettings)));
    setPendingChanges({});
    toast.info('Reset to last saved values');
  };

  // ─── Preview changes ─────────────────────────────────────────
  const getChangedFields = () => {
    const changes = {};
    if (!settings || !originalSettings) return changes;
    for (const key in settings) {
      const oldVal = originalSettings[key];
      const newVal = settings[key];
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes[key] = newVal;
      }
    }
    return changes;
  };

  // ─── Stats ─────────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (!settings) return null;
    return {
      platformFee: settings.platform_fee || 0,
      transportFee: settings.transport_fee || 0,
      minWithdrawal: settings.min_withdrawal || 0,
      escrowDays: settings.escrow_holding_days || 7,
      activeWasteTypes: settings.waste_pricing?.filter(w => w.status === 'active').length || 0,
      lastUpdated: settings.updated_at,
    };
  }, [settings]);

  // ─── Loading / Error states ──────────────────────────────────
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

  if (!settings) return null;

  // ─── Render ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Inter']">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono-cw { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* ─── Header ────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl lg:text-3xl font-bold text-gray-900">Pricing Settings</h2>
            <p className="text-sm text-gray-500 mt-1">Configure platform fees, withdrawal limits, and waste pricing</p>
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
              onClick={() => setShowPreview(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm"
            >
              <Eye className="h-4 w-4" /> Preview
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-xl bg-[#11402D] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#0E2A1C] transition shadow-sm disabled:opacity-70"
            >
              <Save className="h-4 w-4" /> Save Changes
            </button>
          </div>
        </div>

        {/* ─── Stats Cards ────────────────────────────────────────── */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard label="Platform Fee" value={`${stats.platformFee}%`} icon={DollarSign} color="green" />
            <StatCard label="Transport Fee" value={`${stats.transportFee}%`} icon={Truck} color="blue" />
            <StatCard label="Min Withdrawal" value={formatCurrency(stats.minWithdrawal)} icon={Wallet} color="yellow" />
            <StatCard label="Escrow Holding" value={`${stats.escrowDays} days`} icon={Clock} color="purple" />
            <StatCard label="Active Waste Types" value={stats.activeWasteTypes} icon={Package} color="indigo" />
            <StatCard label="Last Updated" value={formatDate(stats.lastUpdated)} icon={Calendar} color="gray" />
          </div>
        )}

        {/* ─── Main Form ──────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Fixed Platform Fee (%)</label>
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
              <label className="block text-sm font-medium text-gray-700">Fixed Transport Fee (%)</label>
              <input
                type="number"
                step="0.01"
                value={settings.transport_fee || 0}
                onChange={(e) => handleChange('transport_fee', parseFloat(e.target.value))}
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
              <label className="block text-sm font-medium text-gray-700">Escrow Holding Period (days)</label>
              <input
                type="number"
                step="1"
                value={settings.escrow_holding_days || 7}
                onChange={(e) => handleChange('escrow_holding_days', parseInt(e.target.value))}
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="border-t border-gray-100 pt-6">
            <h3 className="font-display font-semibold text-gray-700 mb-4">Feature Toggles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { key: 'auto_release_escrow', label: 'Auto Release Escrow' },
                { key: 'manual_withdrawal', label: 'Manual Withdrawal' },
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

        {/* ─── Waste Pricing Table ───────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-gray-700">Waste Pricing Per KG</h3>
            <span className="text-xs text-gray-400">{settings.waste_pricing?.length || 0} waste types</span>
          </div>

          {settings.waste_pricing?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No waste pricing defined.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Waste Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Price Per KG (KES)</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {settings.waste_pricing.map((waste) => (
                    <tr key={waste.waste_type} className="hover:bg-gray-50/50 transition">
                      <td className="px-4 py-3 font-medium text-gray-900">{waste.waste_type}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(waste.price_per_kg)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(waste.status)}`}>
                          {waste.status || 'active'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleWasteEdit(waste)}
                          className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-blue-600"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ─── History Section ──────────────────────────────────── */}
        {showHistory && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-display font-semibold text-gray-700 mb-4">Change History</h3>
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
                        <td className="px-4 py-2 text-sm font-mono-cw text-gray-500">{formatDate(h.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ─── Waste Edit Modal ────────────────────────────────── */}
        {showWasteModal && editingWaste && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-bold text-gray-900">Edit Waste Pricing</h3>
                <button onClick={() => setShowWasteModal(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Waste Type</label>
                  <input
                    type="text"
                    value={wasteForm.type}
                    onChange={(e) => setWasteForm({ ...wasteForm, type: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price Per KG (KES)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={wasteForm.price}
                    onChange={(e) => setWasteForm({ ...wasteForm, price: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={wasteForm.status}
                    onChange={(e) => setWasteForm({ ...wasteForm, status: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowWasteModal(false)} className="flex-1 rounded-xl border border-gray-200 py-2.5 font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={handleWasteSave} className="flex-1 rounded-xl bg-[#11402D] py-2.5 font-bold text-white hover:bg-[#0E2A1C]">
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Save Confirmation Modal ──────────────────────────── */}
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
              <h3 className="font-display text-lg font-bold text-gray-900">Confirm Save</h3>
              <p className="text-sm text-gray-600 mt-2">Are you sure you want to save these changes?</p>
              <div className="mt-4 max-h-48 overflow-y-auto space-y-1">
                {Object.keys(getChangedFields()).length === 0 ? (
                  <p className="text-sm text-gray-500">No changes detected</p>
                ) : (
                  Object.entries(getChangedFields()).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-500">{key}</span>
                      <span className="font-medium">{typeof value === 'object' ? 'Updated' : value}</span>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowConfirm(false)} className="flex-1 rounded-xl border border-gray-200 py-2.5 font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={confirmSave} disabled={saving} className="flex-1 rounded-xl bg-[#11402D] py-2.5 font-bold text-white hover:bg-[#0E2A1C] disabled:opacity-70">
                  {saving ? 'Saving...' : 'Confirm Save'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Preview Drawer ──────────────────────────────────── */}
        {showPreview && (
          <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/30">
            <div className="relative h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto animate-slide-in-right">
              <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-gray-900">Preview Changes</h3>
                <button onClick={() => setShowPreview(false)} className="rounded-xl p-2 hover:bg-gray-100">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6">
                {Object.keys(getChangedFields()).length === 0 ? (
                  <p className="text-sm text-gray-500">No changes to preview</p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(getChangedFields()).map(([key, value]) => (
                      <div key={key} className="border-b border-gray-100 pb-3">
                        <p className="text-xs font-semibold uppercase text-gray-400">{key}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-gray-500 line-through">
                            {typeof originalSettings[key] === 'object'
                              ? JSON.stringify(originalSettings[key])
                              : originalSettings[key]}
                          </span>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-[#11402D]">
                            {typeof value === 'object' ? JSON.stringify(value) : value}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Subcomponents ──────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color }) {
  const colorMap = {
    green: 'bg-green-50 text-green-600 border-green-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
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
          <p className="font-display text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}