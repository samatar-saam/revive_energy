// src/admin/pages/Collections.jsx
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
  Truck,
  MapPin,
  Calendar,
  Package,
  User,
  Building2,
  Phone,
  Mail,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Collections() {
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);

  // ─── Modal states ────────────────────────────────────────────
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // ─── Edit form ───────────────────────────────────────────────
  const [editForm, setEditForm] = useState({
    waste_type: '',
    quantity: '',
    unit: 'kg',
    location: '',
    address: '',
    pickup_datetime: '',
    status: 'pending',
    contact_name: '',
    contact_phone: '',
    special_instructions: '',
  });
  const [editErrors, setEditErrors] = useState({});

  // ─── Add form ─────────────────────────────────────────────────
  const [addForm, setAddForm] = useState({
    waste_type: '',
    quantity: '',
    unit: 'kg',
    location: '',
    address: '',
    pickup_datetime: '',
    status: 'pending',
    contact_name: '',
    contact_phone: '',
    special_instructions: '',
    supplier_id: '',
  });
  const [addErrors, setAddErrors] = useState({});

  const getToken = () => localStorage.getItem('token');

  // ─── Fetch collections ────────────────────────────────────────
  const fetchCollections = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        setError('Not authenticated. Please login.');
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/admin/collections`, {
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
      setCollections(data);
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError(err.message);
      toast.error(err.message || 'Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  // ─── Filtering & pagination ──────────────────────────────────
  const filteredCollections = useMemo(() => {
    let filtered = [...collections];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (c) =>
          c.waste_type?.toLowerCase().includes(q) ||
          c.location?.toLowerCase().includes(q) ||
          c.supplier_name?.toLowerCase().includes(q) ||
          c.address?.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter((c) => c.status === filterStatus);
    }
    return filtered;
  }, [collections, searchQuery, filterStatus]);

  const totalPages = Math.ceil(filteredCollections.length / pageSize);
  const paginatedCollections = filteredCollections.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // ─── Stats ────────────────────────────────────────────────────
  const stats = useMemo(() => {
    return {
      total: collections.length,
      pending: collections.filter((c) => c.status === 'pending').length,
      completed: collections.filter((c) => c.status === 'completed').length,
      cancelled: collections.filter((c) => c.status === 'cancelled').length,
    };
  }, [collections]);

  const getStatusBadge = (status) => {
    const map = {
      pending: 'bg-yellow-100 text-yellow-700',
      assigned: 'bg-blue-100 text-blue-700',
      picked_up: 'bg-purple-100 text-purple-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-KE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ─── Handlers ─────────────────────────────────────────────────
  const openView = (collection) => {
    setSelectedCollection(collection);
    setShowViewModal(true);
  };

  const openEdit = (collection) => {
    setSelectedCollection(collection);
    setEditForm({
      waste_type: collection.waste_type || '',
      quantity: collection.quantity || '',
      unit: collection.unit || 'kg',
      location: collection.location || '',
      address: collection.address || '',
      pickup_datetime: collection.pickup_datetime
        ? new Date(collection.pickup_datetime).toISOString().slice(0, 16)
        : '',
      status: collection.status || 'pending',
      contact_name: collection.contact_name || '',
      contact_phone: collection.contact_phone || '',
      special_instructions: collection.special_instructions || '',
    });
    setEditErrors({});
    setShowEditModal(true);
  };

  const openAdd = () => {
    setAddForm({
      waste_type: '',
      quantity: '',
      unit: 'kg',
      location: '',
      address: '',
      pickup_datetime: '',
      status: 'pending',
      contact_name: '',
      contact_phone: '',
      special_instructions: '',
      supplier_id: '',
    });
    setAddErrors({});
    setShowAddModal(true);
  };

  const closeModals = () => {
    setShowViewModal(false);
    setShowEditModal(false);
    setShowAddModal(false);
    setSelectedCollection(null);
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
        waste_type: editForm.waste_type,
        quantity: parseFloat(editForm.quantity) || 0,
        unit: editForm.unit,
        location: editForm.location,
        address: editForm.address,
        pickup_datetime: editForm.pickup_datetime,
        status: editForm.status,
        contact_name: editForm.contact_name,
        contact_phone: editForm.contact_phone,
        special_instructions: editForm.special_instructions,
      };

      const res = await fetch(`${API_URL}/admin/collections/${selectedCollection.id}`, {
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

      toast.success('Collection updated successfully');
      setShowEditModal(false);
      fetchCollections();
    } catch (err) {
      toast.error(err.message || 'Failed to update collection');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!addForm.waste_type.trim()) errors.waste_type = 'Waste type is required';
    if (!addForm.quantity || isNaN(addForm.quantity)) errors.quantity = 'Valid quantity is required';
    if (!addForm.location.trim()) errors.location = 'Location is required';
    if (!addForm.pickup_datetime) errors.pickup_datetime = 'Pickup date is required';
    if (!addForm.supplier_id) errors.supplier_id = 'Supplier is required';
    if (Object.keys(errors).length > 0) {
      setAddErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');

      const payload = {
        waste_type: addForm.waste_type,
        quantity: parseFloat(addForm.quantity) || 0,
        unit: addForm.unit,
        location: addForm.location,
        address: addForm.address,
        pickup_datetime: addForm.pickup_datetime,
        status: addForm.status,
        contact_name: addForm.contact_name,
        contact_phone: addForm.contact_phone,
        special_instructions: addForm.special_instructions,
        supplier_id: parseInt(addForm.supplier_id),
      };

      const res = await fetch(`${API_URL}/admin/collections`, {
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

      toast.success('Collection created successfully');
      setShowAddModal(false);
      fetchCollections();
    } catch (err) {
      toast.error(err.message || 'Failed to create collection');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (collection) => {
    if (!confirm(`Are you sure you want to delete this collection (${collection.waste_type})?`)) return;
    try {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`${API_URL}/admin/collections/${collection.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Delete failed');
      }

      toast.success('Collection deleted successfully');
      fetchCollections();
    } catch (err) {
      toast.error(err.message || 'Failed to delete collection');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#11402D] border-t-[#9CF06B] rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Loading collections...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900">Unable to load collections</h3>
          <p className="text-gray-500 mt-2">{error}</p>
          <button
            onClick={fetchCollections}
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
        <StatCard label="Total Collections" value={stats.total} icon={Package} color="blue" />
        <StatCard label="Pending" value={stats.pending} icon={Clock} color="yellow" />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle} color="green" />
        <StatCard label="Cancelled" value={stats.cancelled} icon={AlertCircle} color="gray" />
      </div>

      {/* ─── Toolbar ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by waste type, location, supplier..."
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
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="picked_up">Picked Up</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-[#11402D] px-4 py-2 text-sm font-bold text-white hover:bg-[#0E2A1C] transition"
        >
          <Plus className="h-4 w-4" />
          Add Collection
        </button>
      </div>

      {/* ─── Table ───────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {paginatedCollections.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-700">No collections found</h3>
            <p className="text-sm text-gray-500">Try adjusting your filters or add a new collection.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Waste Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Supplier</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Pickup</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedCollections.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-4 py-3 font-mono text-sm text-gray-500">#{c.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{c.waste_type}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {c.quantity} {c.unit || 'kg'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.location}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.supplier_name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(c.pickup_datetime)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadge(c.status)}`}>
                        {c.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openView(c)}
                          className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-[#11402D]"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEdit(c)}
                          className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-blue-600"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c)}
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
            Showing {Math.min(filteredCollections.length, (currentPage - 1) * pageSize + 1)} to{' '}
            {Math.min(filteredCollections.length, currentPage * pageSize)} of {filteredCollections.length} entries
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
      {showViewModal && selectedCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Collection Details</h2>
                <p className="text-sm text-gray-500">ID #{selectedCollection.id}</p>
              </div>
              <button onClick={closeModals} className="rounded-xl p-2 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Waste Type</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{selectedCollection.waste_type}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Quantity</p>
                  <p className="mt-1 text-sm text-gray-700">
                    {selectedCollection.quantity} {selectedCollection.unit || 'kg'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Location</p>
                  <p className="mt-1 text-sm text-gray-700">{selectedCollection.location}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Address</p>
                  <p className="mt-1 text-sm text-gray-700">{selectedCollection.address || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Supplier</p>
                  <p className="mt-1 text-sm text-gray-700">{selectedCollection.supplier_name || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Pickup Date</p>
                  <p className="mt-1 text-sm text-gray-700">{formatDate(selectedCollection.pickup_datetime)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Status</p>
                  <span className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadge(selectedCollection.status)}`}>
                    {selectedCollection.status || 'pending'}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Contact</p>
                  <p className="mt-1 text-sm text-gray-700">{selectedCollection.contact_name || '—'}</p>
                  <p className="text-sm text-gray-600">{selectedCollection.contact_phone || '—'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-semibold uppercase text-gray-400">Special Instructions</p>
                  <p className="mt-1 text-sm text-gray-700">{selectedCollection.special_instructions || 'None'}</p>
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
      {showEditModal && selectedCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Edit Collection</h2>
                <p className="text-sm text-gray-500">ID #{selectedCollection.id}</p>
              </div>
              <button onClick={closeModals} className="rounded-xl p-2 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Waste Type *</label>
                  <input
                    type="text"
                    name="waste_type"
                    value={editForm.waste_type}
                    onChange={handleEditChange}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity *</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="quantity"
                      value={editForm.quantity}
                      onChange={handleEditChange}
                      className="mt-1 w-2/3 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                      required
                      step="0.1"
                    />
                    <select
                      name="unit"
                      value={editForm.unit}
                      onChange={handleEditChange}
                      className="mt-1 w-1/3 rounded-xl border border-gray-200 px-2 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="kg">kg</option>
                      <option value="tonnes">tonnes</option>
                      <option value="g">g</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={editForm.location}
                    onChange={handleEditChange}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={editForm.address}
                    onChange={handleEditChange}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pickup Date *</label>
                  <input
                    type="datetime-local"
                    name="pickup_datetime"
                    value={editForm.pickup_datetime}
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
                    <option value="pending">Pending</option>
                    <option value="assigned">Assigned</option>
                    <option value="picked_up">Picked Up</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                  <input
                    type="text"
                    name="contact_name"
                    value={editForm.contact_name}
                    onChange={handleEditChange}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
                  <input
                    type="text"
                    name="contact_phone"
                    value={editForm.contact_phone}
                    onChange={handleEditChange}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Special Instructions</label>
                  <textarea
                    name="special_instructions"
                    rows="3"
                    value={editForm.special_instructions}
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
                <h2 className="text-xl font-bold text-gray-900">Add Collection</h2>
                <p className="text-sm text-gray-500">Create a new waste collection request</p>
              </div>
              <button onClick={closeModals} className="rounded-xl p-2 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Waste Type *</label>
                  <input
                    type="text"
                    name="waste_type"
                    value={addForm.waste_type}
                    onChange={handleAddChange}
                    className={`mt-1 w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 ${
                      addErrors.waste_type ? 'border-red-500' : 'border-gray-200'
                    }`}
                    required
                  />
                  {addErrors.waste_type && <p className="mt-1 text-xs text-red-500">{addErrors.waste_type}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity *</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="quantity"
                      value={addForm.quantity}
                      onChange={handleAddChange}
                      className={`mt-1 w-2/3 rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 ${
                        addErrors.quantity ? 'border-red-500' : 'border-gray-200'
                      }`}
                      required
                      step="0.1"
                    />
                    <select
                      name="unit"
                      value={addForm.unit}
                      onChange={handleAddChange}
                      className="mt-1 w-1/3 rounded-xl border border-gray-200 px-2 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="kg">kg</option>
                      <option value="tonnes">tonnes</option>
                      <option value="g">g</option>
                    </select>
                  </div>
                  {addErrors.quantity && <p className="mt-1 text-xs text-red-500">{addErrors.quantity}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={addForm.location}
                    onChange={handleAddChange}
                    className={`mt-1 w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 ${
                      addErrors.location ? 'border-red-500' : 'border-gray-200'
                    }`}
                    required
                  />
                  {addErrors.location && <p className="mt-1 text-xs text-red-500">{addErrors.location}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={addForm.address}
                    onChange={handleAddChange}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pickup Date *</label>
                  <input
                    type="datetime-local"
                    name="pickup_datetime"
                    value={addForm.pickup_datetime}
                    onChange={handleAddChange}
                    className={`mt-1 w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 ${
                      addErrors.pickup_datetime ? 'border-red-500' : 'border-gray-200'
                    }`}
                    required
                  />
                  {addErrors.pickup_datetime && <p className="mt-1 text-xs text-red-500">{addErrors.pickup_datetime}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="status"
                    value={addForm.status}
                    onChange={handleAddChange}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="assigned">Assigned</option>
                    <option value="picked_up">Picked Up</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Supplier ID *</label>
                  <input
                    type="number"
                    name="supplier_id"
                    value={addForm.supplier_id}
                    onChange={handleAddChange}
                    className={`mt-1 w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 ${
                      addErrors.supplier_id ? 'border-red-500' : 'border-gray-200'
                    }`}
                    required
                    placeholder="User ID of supplier"
                  />
                  {addErrors.supplier_id && <p className="mt-1 text-xs text-red-500">{addErrors.supplier_id}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                  <input
                    type="text"
                    name="contact_name"
                    value={addForm.contact_name}
                    onChange={handleAddChange}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
                  <input
                    type="text"
                    name="contact_phone"
                    value={addForm.contact_phone}
                    onChange={handleAddChange}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Special Instructions</label>
                  <textarea
                    name="special_instructions"
                    rows="3"
                    value={addForm.special_instructions}
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
                  {submitting ? 'Creating...' : 'Create Collection'}
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