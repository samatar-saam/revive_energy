// src/admin/pages/PricingSettings.jsx
import React, { useState, useEffect } from 'react';
import {
  Save,
  RefreshCw,
  AlertCircle,
  DollarSign,
} from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function PricingSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
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
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

      toast.success('Pricing settings saved successfully');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#11402D] border-t-[#9CF06B] rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500 font-display">Loading pricing settings...</p>
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
            <p className="text-sm text-gray-500 mt-1">Configure fixed pricing for waste, platform fees, and transport</p>
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

        {/* ─── Pricing Form ───────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Waste Price (KES)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  name="waste_price"
                  value={formData.waste_price ?? 10}
                  onChange={handleChange}
                  step="0.5"
                  min="0"
                  className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Fixed price per unit of waste (default: 10 KES)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Platform Fee (KES)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  name="platform_fee"
                  value={formData.platform_fee ?? 10}
                  onChange={handleChange}
                  step="0.5"
                  min="0"
                  className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Fixed platform fee per transaction (default: 10 KES)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transport Fee (KES)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  name="transport_fee"
                  value={formData.transport_fee ?? 10}
                  onChange={handleChange}
                  step="0.5"
                  min="0"
                  className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Fixed transport fee per job (default: 10 KES)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}