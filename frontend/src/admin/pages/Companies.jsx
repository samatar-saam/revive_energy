// src/admin/pages/Companies.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Eye,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  Building2,
  Users,
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  UserCog,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Companies() {
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);

  // ─── Modal states ────────────────────────────────────────────
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // ─── Edit form ───────────────────────────────────────────────
  const [editForm, setEditForm] = useState({
    full_name: '',
    business_name: '',
    business_type: '',
    phone: '',
    location: '',
    role: 'supplier',
    account_status: 'active',
  });
  const [editErrors, setEditErrors] = useState({});

  // ─── Add form ─────────────────────────────────────────────────
  const [addForm, setAddForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    business_name: '',
    business_type: '',
    location: '',
    role: 'supplier',
    account_status: 'active',
  });
  const [addErrors, setAddErrors] = useState({});

  const getToken = () => localStorage.getItem('token');

  // ─── Fetch companies (users with business_name) ───────────────
  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        setError('Not authenticated. Please login.');
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/admin/users`, {
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

      const responseData = await res.json();
      const data = responseData.data || responseData;
      // Filter to users that have a business_name (i.e., companies)
      const companiesData = data.filter(user => user.business_name && user.business_name.trim() !== '');
      setCompanies(companiesData);
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError(err.message);
      toast.error(err.message || 'Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // ─── Filtering & pagination ──────────────────────────────────
  const filteredCompanies = useMemo(() => {
    let filtered = [...companies];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (c) =>
          c.business_name?.toLowerCase().includes(q) ||
          c.full_name?.toLowerCase().includes(q) ||
          c.business_type?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.location?.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter((c) => c.account_status === filterStatus);
    }
    return filtered;
  }, [companies, searchQuery, filterStatus]);

  const totalPages = Math.ceil(filteredCompanies.length / pageSize);
  const paginatedCompanies = filteredCompanies.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // ─── Stats ────────────────────────────────────────────────────
  const stats = useMemo(() => {
    return {
      total: companies.length,
      active: companies.filter((c) => c.account_status === 'verified' || c.account_status === 'active').length,
      pending: companies.filter((c) => c.account_status === 'pending').length,
      suspended: companies.filter((c) => c.account_status === 'suspended' || c.account_status === 'inactive').length,
    };
  }, [companies]);

  const getStatusBadge = (status) => {
    const map = {
      verified: 'bg-green-100 text-green-700',
      active: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      inactive: 'bg-gray-100 text-gray-500',
      suspended: 'bg-red-100 text-red-700',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  };

  const getRoleBadge = (role) => {
    const map = {
      supplier: 'bg-blue-100 text-blue-700',
      producer: 'bg-purple-100 text-purple-700',
      transporter: 'bg-orange-100 text-orange-700',
      admin: 'bg-red-100 text-red-700',
    };
    return map[role] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-KE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // ─── Handlers ─────────────────────────────────────────────────
  const openView = (company) => {
    setSelectedCompany(company);
    setShowViewModal(true);
  };

  const openEdit = (company) => {
    setSelectedCompany(company);
    setEditForm({
      full_name: company.full_name || '',
      business_name: company.business_name || '',
      business_type: company.business_type || '',
      phone: company.phone || '',
      location: company.location || '',
      role: company.role || 'supplier',
      account_status: company.account_status || 'active',
    });
    setEditErrors({});
    setShowEditModal(true);
  };

  const openAdd = () => {
    setAddForm({
      full_name: '',
      email: '',
      phone: '',
      password: '',
      business_name: '',
      business_type: '',
      location: '',
      role: 'supplier',
      account_status: 'active',
    });
    setAddErrors({});
    setShowAddModal(true);
  };

  const closeModals = () => {
    setShowViewModal(false);
    setShowEditModal(false);
    setShowAddModal(false);
    setSelectedCompany(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
    if (editErrors[name]) {
      setEditErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
    if (addErrors[name]) {
      setAddErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');

      const payload = {
        full_name: editForm.full_name,
        business_name: editForm.business_name,
        business_type: editForm.business_type,
        phone: editForm.phone,
        location: editForm.location,
        role: editForm.role,
        account_status: editForm.account_status,
      };

      const res = await fetch(`${API_URL}/admin/users/${selectedCompany.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Update failed');
      }

      toast.success('Company updated successfully');
      setShowEditModal(false);
      fetchCompanies();
    } catch (err) {
      toast.error(err.message || 'Failed to update company');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!addForm.full_name.trim()) errors.full_name = 'Full name is required';
    if (!addForm.email.trim()) errors.email = 'Email is required';
    if (!addForm.password || addForm.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (!addForm.phone.trim()) errors.phone = 'Phone is required';
    if (!addForm.business_name.trim()) errors.business_name = 'Business name is required';
    if (Object.keys(errors).length > 0) {
      setAddErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');

      const payload = {
        full_name: addForm.full_name,
        email: addForm.email,
        password: addForm.password,
        phone: addForm.phone,
        business_name: addForm.business_name,
        business_type: addForm.business_type,
        location: addForm.location,
        role: addForm.role,
        account_status: addForm.account_status,
      };

      const res = await fetch(`${API_URL}/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Creation failed');
      }

      toast.success('Company created successfully');
      setShowAddModal(false);
      fetchCompanies();
    } catch (err) {
      toast.error(err.message || 'Failed to create company');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (company) => {
    if (!confirm(`Are you sure you want to delete company "${company.business_name}"?`)) return;
    try {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`${API_URL}/admin/users/${company.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Delete failed');
      }

      toast.success('Company deleted successfully');
      fetchCompanies();
    } catch (err) {
      toast.error(err.message || 'Failed to delete company');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#11402D] border-t-[#9CF06B] rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Loading companies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900">Unable to load companies</h3>
          <p className="text-gray-500 mt-2">{error}</p>
          <button
            onClick={fetchCompanies}
            className="mt-4 px-6 py-2 bg-[#11402D] text-white rounded-xl hover:bg-[#0E2A1C] transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Stats Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Companies" value={stats.total} icon={Building2} color="blue" />
        <StatCard label="Active" value={stats.active} icon={CheckCircle} color="green" />
        <StatCard label="Pending" value={stats.pending} icon={Clock} color="yellow" />
        <StatCard label="Suspended" value={stats.suspended} icon={AlertCircle} color="gray" />
      </div>

      {/* ─── Toolbar ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, business, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-8 text-sm outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-[#11402D] px-4 py-2 text-sm font-bold text-white hover:bg-[#0E2A1C] transition"
        >
          <Plus className="h-4 w-4" />
          Add Company
        </button>
      </div>

      {/* ─── Table ───────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {paginatedCompanies.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-700">No companies found</h3>
            <p className="text-sm text-gray-500">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Business Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-4 py-3 font-mono text-sm text-gray-500">#{company.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{company.business_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{company.business_type || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{company.full_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{company.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{company.location || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadge(company.account_status)}`}>
                        {company.account_status || 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openView(company)}
                          className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-[#11402D]"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEdit(company)}
                          className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-blue-600"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(company)}
                          className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Pagination ──────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {Math.min(filteredCompanies.length, (currentPage - 1) * pageSize + 1)} to{' '}
            {Math.min(filteredCompanies.length, currentPage * pageSize)} of {filteredCompanies.length} entries
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`rounded-xl px-3 py-1 text-sm font-medium ${
                  page === currentPage
                    ? 'bg-[#11402D] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─── View Modal ──────────────────────────────────────────── */}
      {showViewModal && selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Company Details</h2>
                <p className="text-sm text-gray-500">ID #{selectedCompany.id}</p>
              </div>
              <button onClick={closeModals} className="rounded-xl p-2 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Business Name</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{selectedCompany.business_name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Business Type</p>
                  <p className="mt-1 text-sm text-gray-700">{selectedCompany.business_type || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Contact Person</p>
                  <p className="mt-1 text-sm text-gray-700">{selectedCompany.full_name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Role</p>
                  <span className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${getRoleBadge(selectedCompany.role)}`}>
                    {selectedCompany.role || 'unknown'}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Email</p>
                  <p className="mt-1 text-sm text-gray-700">{selectedCompany.email}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Phone</p>
                  <p className="mt-1 text-sm text-gray-700">{selectedCompany.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Location</p>
                  <p className="mt-1 text-sm text-gray-700">{selectedCompany.location || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Status</p>
                  <span className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadge(selectedCompany.account_status)}`}>
                    {selectedCompany.account_status || 'pending'}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Joined</p>
                  <p className="mt-1 text-sm text-gray-700">{formatDate(selectedCompany.created_at)}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={closeModals} className="rounded-xl bg-[#11402D] px-6 py-2.5 font-bold text-white hover:bg-[#0E2A1C]">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Edit Modal ──────────────────────────────────────────── */}
      {showEditModal && selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Edit Company</h2>
                <p className="text-sm text-gray-500">ID #{selectedCompany.id}</p>
              </div>
              <button onClick={closeModals} className="rounded-xl p-2 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Business Name *</label>
                  <input
                    type="text"
                    name="business_name"
                    value={editForm.business_name}
                    onChange={handleEditChange}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Business Type</label>
                  <input
                    type="text"
                    name="business_type"
                    value={editForm.business_type}
                    onChange={handleEditChange}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Person *</label>
                  <input
                    type="text"
                    name="full_name"
                    value={editForm.full_name}
                    onChange={handleEditChange}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleEditChange}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={editForm.location}
                    onChange={handleEditChange}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    name="role"
                    value={editForm.role}
                    onChange={handleEditChange}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="supplier">Supplier</option>
                    <option value="producer">Producer</option>
                    <option value="transporter">Transporter</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="account_status"
                    value={editForm.account_status}
                    onChange={handleEditChange}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="active">Active</option>
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModals} className="flex-1 rounded-xl border border-gray-200 py-2.5 font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 rounded-xl bg-[#11402D] py-2.5 font-bold text-white hover:bg-[#0E2A1C] disabled:opacity-70">
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Add Modal ───────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Add Company</h2>
                <p className="text-sm text-gray-500">Create a new company account</p>
              </div>
              <button onClick={closeModals} className="rounded-xl p-2 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Business Name *</label>
                  <input
                    type="text"
                    name="business_name"
                    value={addForm.business_name}
                    onChange={handleAddChange}
                    className={`mt-1 w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 ${
                      addErrors.business_name ? 'border-red-500' : 'border-gray-200'
                    }`}
                    required
                  />
                  {addErrors.business_name && <p className="mt-1 text-xs text-red-500">{addErrors.business_name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Business Type</label>
                  <input
                    type="text"
                    name="business_type"
                    value={addForm.business_type}
                    onChange={handleAddChange}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Person *</label>
                  <input
                    type="text"
                    name="full_name"
                    value={addForm.full_name}
                    onChange={handleAddChange}
                    className={`mt-1 w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 ${
                      addErrors.full_name ? 'border-red-500' : 'border-gray-200'
                    }`}
                    required
                  />
                  {addErrors.full_name && <p className="mt-1 text-xs text-red-500">{addErrors.full_name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={addForm.email}
                    onChange={handleAddChange}
                    className={`mt-1 w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 ${
                      addErrors.email ? 'border-red-500' : 'border-gray-200'
                    }`}
                    required
                  />
                  {addErrors.email && <p className="mt-1 text-xs text-red-500">{addErrors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone *</label>
                  <input
                    type="text"
                    name="phone"
                    value={addForm.phone}
                    onChange={handleAddChange}
                    className={`mt-1 w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 ${
                      addErrors.phone ? 'border-red-500' : 'border-gray-200'
                    }`}
                    required
                  />
                  {addErrors.phone && <p className="mt-1 text-xs text-red-500">{addErrors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={addForm.password}
                    onChange={handleAddChange}
                    className={`mt-1 w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 ${
                      addErrors.password ? 'border-red-500' : 'border-gray-200'
                    }`}
                    required
                    minLength={6}
                  />
                  {addErrors.password && <p className="mt-1 text-xs text-red-500">{addErrors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={addForm.location}
                    onChange={handleAddChange}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    name="role"
                    value={addForm.role}
                    onChange={handleAddChange}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="supplier">Supplier</option>
                    <option value="producer">Producer</option>
                    <option value="transporter">Transporter</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="account_status"
                    value={addForm.account_status}
                    onChange={handleAddChange}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="active">Active</option>
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModals} className="flex-1 rounded-xl border border-gray-200 py-2.5 font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 rounded-xl bg-[#11402D] py-2.5 font-bold text-white hover:bg-[#0E2A1C] disabled:opacity-70">
                  {submitting ? 'Creating...' : 'Create Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
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