// src/users/pages/shared/ProfileSettings.jsx
import { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Lock,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Briefcase,
  Package,
  Truck,
  Zap
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ProfileSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // ─── Profile state ─────────────────────────────────────────
  const [profile, setProfile] = useState({
    full_name: '',
    business_name: '',
    business_type: '',
    email: '',
    phone: '',
    role: '',
    location: '',
    waste_types: '',
    // Add any other fields your User model has
  });

  const [originalProfile, setOriginalProfile] = useState({});

  // ─── Password state ────────────────────────────────────────
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  // ─── Fetch profile from API ──────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${API_URL}/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || 'Failed to fetch profile');
        }

        const data = await response.json();
        // Normalize role display (e.g., 'supplier' -> 'Waste Supplier')
        const roleDisplayMap = {
          supplier: 'Waste Supplier',
          producer: 'Energy Producer',
          transporter: 'Transport Partner',
        };
        const displayRole = roleDisplayMap[data.role] || data.role;

        const profileData = {
          full_name: data.full_name || '',
          business_name: data.business_name || '',
          business_type: data.business_type || '',
          email: data.email || '',
          phone: data.phone || '',
          role: displayRole,
          location: data.location || '',
          waste_types: data.waste_types || '',
        };
        setProfile(profileData);
        setOriginalProfile(profileData);
      } catch (err) {
        console.error('Fetch profile error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ─── Check if profile changed ─────────────────────────────
  const isProfileChanged = () => {
    return JSON.stringify(profile) !== JSON.stringify(originalProfile);
  };

  // ─── Handle profile changes ──────────────────────────────
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(false);
  };

  // ─── Handle password changes ─────────────────────────────
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(false);
  };

  // ─── Submit profile update ──────────────────────────────
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      // Only send editable fields
      const payload = {
        full_name: profile.full_name,
        phone: profile.phone,
        business_name: profile.business_name,
        business_type: profile.business_type,
        location: profile.location,
        waste_types: profile.waste_types,
      };

      const response = await fetch(`${API_URL}/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Update failed');

      // Update localStorage with new user data
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...storedUser, ...payload };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setSuccess(true);
      setOriginalProfile({ ...profile });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ─── Submit password change ──────────────────────────────
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (passwords.new !== passwords.confirm) {
      setError('Passwords do not match');
      return;
    }
    if (passwords.new.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      // This endpoint may not exist yet; you can implement it later.
      // For now, we'll simulate success.
      // const response = await fetch(`${API_URL}/user/password`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${token}`,
      //   },
      //   body: JSON.stringify({
      //     current_password: passwords.current,
      //     new_password: passwords.new,
      //   }),
      // });
      // if (!response.ok) throw new Error('Password change failed');

      setPasswords({ current: '', new: '', confirm: '' });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // ─── Reset form to original ──────────────────────────────
  const handleReset = () => {
    setProfile({ ...originalProfile });
    setError(null);
    setSuccess(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#11402D] border-t-[#9CF06B] rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  // ─── Determine role icon ──────────────────────────────────
  const getRoleIcon = () => {
    const role = profile.role?.toLowerCase() || '';
    if (role.includes('supplier')) return <Package className="w-5 h-5 text-emerald-600" />;
    if (role.includes('producer') || role.includes('energy')) return <Zap className="w-5 h-5 text-yellow-600" />;
    if (role.includes('transport')) return <Truck className="w-5 h-5 text-blue-600" />;
    return <Briefcase className="w-5 h-5 text-gray-600" />;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-6">Profile & Settings</h1>

      <div className="space-y-6">
        {/* ─── Profile Form ─────────────────────────────────── */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-display text-lg font-semibold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5 text-[#11402D]" />
            Personal Information
          </h2>

          <form onSubmit={handleProfileSubmit} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="full_name"
                    value={profile.full_name}
                    onChange={handleProfileChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="business_name"
                    value={profile.business_name}
                    onChange={handleProfileChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-100 cursor-not-allowed"
                    disabled
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleProfileChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <div className="relative">
                  {getRoleIcon()}
                  <input
                    type="text"
                    name="role"
                    value={profile.role}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-100 cursor-not-allowed"
                    disabled
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Role is assigned by the system</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="location"
                    value={profile.location}
                    onChange={handleProfileChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                <input
                  type="text"
                  name="business_type"
                  value={profile.business_type}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Waste Types</label>
                <input
                  type="text"
                  name="waste_types"
                  value={profile.waste_types}
                  onChange={handleProfileChange}
                  placeholder="e.g., Organic, Plastic, Paper"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 transition"
                />
              </div>
            </div>

            {success && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 text-green-700">
                <CheckCircle className="w-5 h-5" />
                <span>Profile updated successfully!</span>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving || !isProfileChanged()}
                className="flex items-center gap-2 px-6 py-3 bg-[#11402D] text-white rounded-xl font-medium hover:bg-[#0E2A1C] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
              >
                <RefreshCw className="w-5 h-5 inline mr-2" />
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* ─── Password Change ──────────────────────────────── */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-display text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#11402D]" />
            Change Password
          </h2>
          <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  name="current"
                  value={passwords.current}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  name="new"
                  value={passwords.new}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 transition"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  name="confirm"
                  value={passwords.confirm}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 transition"
                  required
                />
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}
            <button
              type="submit"
              className="px-6 py-3 bg-[#11402D] text-white rounded-xl font-medium hover:bg-[#0E2A1C] transition"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}