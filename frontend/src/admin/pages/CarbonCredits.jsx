// src/admin/pages/CarbonCredits.jsx
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
  Award,
  Leaf,
  TrendingUp,
  RefreshCw,
  Calendar,
  FileText,
} from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function CarbonCredits() {
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);

  // ─── Modal states ────────────────────────────────────────────
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // ─── Edit form ───────────────────────────────────────────────
  const [editForm, setEditForm] = useState({
    project_name: '',
    amount: '',
    status: 'issued',
    description: '',
  });
  const [editErrors, setEditErrors] = useState({});

  // ─── Add form ─────────────────────────────────────────────────
  const [addForm, setAddForm] = useState({
    project_name: '',
    amount: '',
    status: 'issued',
    description: '',
  });
  const [addErrors, setAddErrors] = useState({});

  const getToken = () => localStorage.getItem('token');

  // ─── Fetch carbon credits ────────────────────────────────────
  const fetchCredits = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        setError('Not authenticated. Please login.');
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/admin/carbon-credits`, {
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
      setCredits(data);
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError(err.message);
      toast.error(err.message || 'Failed to load carbon credits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, []);

  // ─── Filtering & pagination ──────────────────────────────────
  const filteredCredits = useMemo(() => {
    let filtered = [...credits];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (c) =>
          c.project_name?.toLowerCase().includes(q) ||
          c.serial_number?.toLowerCase().includes(q) ||
          c.id?.toString().includes(q)
      );
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter((c) => c.status === filterStatus);
    }
    return filtered;
  }, [credits, searchQuery, filterStatus]);

  const totalPages = Math.ceil(filteredCredits.length / pageSize);
  const paginatedCredits = filteredCredits.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // ─── Stats ────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = credits.length;
    const totalAmount = credits.reduce((sum, c) => sum + (c.amount || 0), 0);
    const issued = credits.filter((c) => c.status === 'issued').length;
    const retired = credits.filter((c) => c.status === 'retired').length;
    const expired = credits.filter((c) => c.status === 'expired').length;
    return { total, totalAmount, issued, retired, expired };
  }, [credits]);

  const getStatusBadge = (status) => {
    const map = {
      issued: 'bg-green-100 text-green-700',
      retired: 'bg-blue-100 text-blue-700',
      expired: 'bg-gray-100 text-gray-700',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-KE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    return new Intl.NumberFormat('en-KE', {
      maximumFractionDigits: 2,
    }).format(num);
  };

  // ─── Handlers ─────────────────────────────────────────────────
  const openView = (credit) => {
    setSelectedCredit(credit);
    setShowViewModal(true);
  };

  const openEdit = (credit) => {
    setSelectedCredit(credit);
    setEditForm({
      project_name: credit.project_name || '',
      amount: credit.amount || '',
      status: credit.status || 'issued',
      description: credit.description || '',
    });
    setEditErrors({});
    setShowEditModal(true);
  };

  const openAdd = () => {
    setAddForm({
      project_name: '',
      amount: '',
      status: 'issued',
      description: '',
    });
    setAddErrors({});
    setShowAddModal(true);
  };

  const closeModals = () => {
    setShowViewModal(false);
    setShowEditModal(false);
    setShowAddModal(false);
    setSelectedCredit(null);
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
        project_name: editForm.project_name,
        amount: parseFloat(editForm.amount) || 0,
        status: editForm.status,
        description: editForm.description,
      };

      const res = await fetch(`${API_URL}/admin/carbon-credits/${selectedCredit.id}`, {
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

      toast.success('Carbon credit updated successfully');
      setShowEditModal(false);
      fetchCredits();
    } catch (err) {
      toast.error(err.message || 'Failed to update carbon credit');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!addForm.project_name.trim()) errors.project_name = 'Project name is required';
    if (!addForm.amount || isNaN(addForm.amount) || parseFloat(addForm.amount) <= 0) {
      errors.amount = 'Valid amount is required';
    }
    if (Object.keys(errors).length > 0) {
      setAddErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');

      const payload = {
        project_name: addForm.project_name,
        amount: parseFloat(addForm.amount) || 0,
        status: addForm.status,
        description: addForm.description,
      };

      const res = await fetch(`${API_URL}/admin/carbon-credits`, {
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

      toast.success('Carbon credit created successfully');
      setShowAddModal(false);
      fetchCredits();
    } catch (err) {
      toast.error(err.message || 'Failed to create carbon credit');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (credit) => {
    if (!confirm(`Are you sure you want to delete this carbon credit (${credit.project_name})?`)) return;
    try {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`${API_URL}/admin/carbon-credits/${credit.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Delete failed');
      }

      toast.success('Carbon credit deleted successfully');
      fetchCredits();
    } catch (err) {
      toast.error(err.message || 'Failed to delete carbon credit');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#11402D] border-t-[#9CF06B] rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Loading carbon credits...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900">Unable to load carbon credits</h3>
          <p className="text-gray-500 mt-2">{error}</p>
          <button
            onClick={fetchCredits}
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
        <StatCard label="Total Credits Issued" value={stats.total} icon={Award} color="blue" />
        <StatCard label="Available" value={stats.issued} icon={CheckCircle} color="green" />
        <StatCard label="Retired" value={stats.retired} icon={Leaf} color="purple" />
        <StatCard label="Total CO₂ (kg)" value={formatNumber(stats.totalAmount)} icon={TrendingUp} color="orange" />
      </div>

      {/* ─── Toolbar ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by project or serial..."
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
              <option value="issued">Issued</option>
              <option value="retired">Retired</option>
              <option value="expired">Expired</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-[#11402D] px-4 py-2 text-sm font-bold text-white hover:bg-[#0E2A1C] transition"
        >
          <Plus className="h-4 w-4" />
          Issue Credit
        </button>
      </div>

      {/* ─── Table ───────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {paginatedCredits.length === 0 ? (
          <div className="p-12 text-center">
            <Award className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-700">No carbon credits found</h3>
            <p className="text-sm text-gray-500">Try adjusting your filters or issue a new credit.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Project</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Amount (kg CO₂)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Issued</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Expiry</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedCredits.map((credit) => (
                  <tr key={credit.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-4 py-3 font-mono text-sm text-gray-500">#{credit.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{credit.project_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatNumber(credit.amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadge(credit.status)}`}>
                        {credit.status || 'issued'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(credit.issuance_date)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(credit.expiry_date)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openView(credit)}
                          className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-[#11402D]"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEdit(credit)}
                          className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-blue-600"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(credit)}
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
            Showing {Math.min(filteredCredits.length, (currentPage - 1) * pageSize + 1)} to{' '}
            {Math.min(filteredCredits.length, currentPage * pageSize)} of {filteredCredits.length} entries
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
      {showViewModal && selectedCredit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Carbon Credit Details</h2>
                <p className="text-sm text-gray-500">ID #{selectedCredit.id}</p>
              </div>
              <button onClick={closeModals} className="rounded-xl p-2 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Project</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{selectedCredit.project_name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Amount</p>
                  <p className="mt-1 text-sm text-gray-700">{formatNumber(selectedCredit.amount)} kg CO₂</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Status</p>
                  <span className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadge(selectedCredit.status)}`}>
                    {selectedCredit.status || 'issued'}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Serial Number</p>
                  <p className="mt-1 text-sm text-gray-700">{selectedCredit.serial_number || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Issuance Date</p>
                  <p className="mt-1 text-sm text-gray-700">{formatDate(selectedCredit.issuance_date)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Expiry Date</p>
                  <p className="mt-1 text-sm text-gray-700">{formatDate(selectedCredit.expiry_date)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-semibold uppercase text-gray-400">Description</p>
                  <p className="mt-1 text-sm text-gray-700">{selectedCredit.description || '—'}</p>
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
      {showEditModal && selectedCredit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Edit Carbon Credit</h2>
                <p className="text-sm text-gray-500">ID #{selectedCredit.id}</p>
              </div>
              <button onClick={closeModals} className="rounded-xl p-2 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Project Name *</label>
                  <input
                    type="text"
                    name="project_name"
                    value={editForm.project_name}
                    onChange={handleEditChange}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount (kg CO₂) *</label>
                  <input
                    type="number"
                    name="amount"
                    step="0.01"
                    value={editForm.amount}
                    onChange={handleEditChange}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="status"
                    value={editForm.status}
                    onChange={handleEditChange}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="issued">Issued</option>
                    <option value="retired">Retired</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    rows="3"
                    value={editForm.description}
                    onChange={handleEditChange}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                  />
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
                <h2 className="text-xl font-bold text-gray-900">Issue Carbon Credit</h2>
                <p className="text-sm text-gray-500">Create a new carbon credit</p>
              </div>
              <button onClick={closeModals} className="rounded-xl p-2 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Project Name *</label>
                  <input
                    type="text"
                    name="project_name"
                    value={addForm.project_name}
                    onChange={handleAddChange}
                    className={`mt-1 w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 ${
                      addErrors.project_name ? 'border-red-500' : 'border-gray-200'
                    }`}
                    required
                  />
                  {addErrors.project_name && <p className="mt-1 text-xs text-red-500">{addErrors.project_name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount (kg CO₂) *</label>
                  <input
                    type="number"
                    name="amount"
                    step="0.01"
                    value={addForm.amount}
                    onChange={handleAddChange}
                    className={`mt-1 w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 ${
                      addErrors.amount ? 'border-red-500' : 'border-gray-200'
                    }`}
                    required
                  />
                  {addErrors.amount && <p className="mt-1 text-xs text-red-500">{addErrors.amount}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="status"
                    value={addForm.status}
                    onChange={handleAddChange}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="issued">Issued</option>
                    <option value="retired">Retired</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    rows="3"
                    value={addForm.description}
                    onChange={handleAddChange}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModals} className="flex-1 rounded-xl border border-gray-200 py-2.5 font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 rounded-xl bg-[#11402D] py-2.5 font-bold text-white hover:bg-[#0E2A1C] disabled:opacity-70">
                  {submitting ? 'Creating...' : 'Issue Credit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Stat Card Component ────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
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