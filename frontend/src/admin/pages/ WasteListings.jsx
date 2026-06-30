// src/admin/pages/WasteListings.jsx
import { useState, useEffect, useMemo } from 'react';
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
  MapPin,
  Package,
  RefreshCw,
  User,
} from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function WasteListings() {
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);

  // ─── Modal states ────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [formData, setFormData] = useState({
    waste_type: '',
    category: '',
    quantity: '',
    unit: 'kg',
    location: '',
    pickup_address: '',
    description: '',
    status: 'available',
    supplier_id: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // ─── View modal ──────────────────────────────────────────────
  const [viewingListing, setViewingListing] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const getToken = () => localStorage.getItem('token');

  // ─── Fetch data ──────────────────────────────────────────────
  const fetchListings = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`${API_URL}/admin/waste-sources`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch waste listings');
      const data = await res.json();
      setListings(data);
    } catch (error) {
      console.error('Error fetching waste listings:', error);
      toast.error(error.message || 'Failed to load waste listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  // ─── Filtering & pagination ──────────────────────────────────
  const filteredListings = useMemo(() => {
    let filtered = [...listings];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.location.toLowerCase().includes(q) ||
          (l.supplier_name && l.supplier_name.toLowerCase().includes(q)) ||
          (l.category && l.category.toLowerCase().includes(q))
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((l) => l.status === filterStatus);
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter((l) => l.type === filterCategory);
    }

    return filtered;
  }, [listings, searchQuery, filterStatus, filterCategory]);

  const totalPages = Math.ceil(filteredListings.length / pageSize);
  const paginatedListings = filteredListings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // ─── Stats ────────────────────────────────────────────────────
  const stats = {
    total: listings.length,
    available: listings.filter((l) => l.status === 'available' || l.status === 'active').length,
    requested: listings.filter((l) => l.status === 'requested' || l.status === 'pending').length,
    assigned: listings.filter((l) => l.status === 'assigned' || l.status === 'collected').length,
    delivered: listings.filter((l) => l.status === 'delivered' || l.status === 'completed').length,
    cancelled: listings.filter((l) => l.status === 'cancelled' || l.status === 'inactive').length,
  };

  // ─── Handlers ─────────────────────────────────────────────────
  const handleAddNew = () => {
    setEditingListing(null);
    setFormData({
      waste_type: '',
      category: '',
      quantity: '',
      unit: 'kg',
      location: '',
      pickup_address: '',
      description: '',
      status: 'available',
      supplier_id: '',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleEdit = (listing) => {
    setEditingListing(listing);
    setFormData({
      waste_type: listing.name || '',
      category: listing.type || '',
      quantity: listing.quantity || '',
      unit: listing.unit || 'kg',
      location: listing.location || '',
      pickup_address: listing.pickup_address || '',
      description: listing.description || '',
      status: listing.status || 'available',
      supplier_id: listing.supplier_id || '',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this waste listing?')) return;
    try {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`${API_URL}/admin/waste-sources/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to delete');
      setListings((prev) => prev.filter((l) => l.id !== id));
      toast.success('Waste listing deleted successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to delete waste listing');
    }
  };

  const handleView = (listing) => {
    setViewingListing(listing);
    setShowViewModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.waste_type.trim()) errors.waste_type = 'Waste type is required';
    if (!formData.location.trim()) errors.location = 'Location is required';
    if (!formData.quantity || Number(formData.quantity) <= 0) errors.quantity = 'Valid quantity is required';
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');

      const payload = {
        name: formData.waste_type,
        type: formData.category,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        location: formData.location,
        pickup_address: formData.pickup_address,
        description: formData.description,
        status: formData.status,
        supplier_id: formData.supplier_id || 1,
      };

      const url = editingListing
        ? `${API_URL}/admin/waste-sources/${editingListing.id}`
        : `${API_URL}/admin/waste-sources`;
      const method = editingListing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save');
      const data = await res.json();

      toast.success(data.message || (editingListing ? 'Updated successfully' : 'Created successfully'));
      setShowModal(false);
      fetchListings(); // refresh list
    } catch (error) {
      toast.error(error.message || 'Failed to save waste listing');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      available: 'bg-green-100 text-green-700',
      active: 'bg-green-100 text-green-700',
      requested: 'bg-yellow-100 text-yellow-700',
      pending: 'bg-yellow-100 text-yellow-700',
      assigned: 'bg-blue-100 text-blue-700',
      collected: 'bg-purple-100 text-purple-700',
      delivered: 'bg-indigo-100 text-indigo-700',
      completed: 'bg-gray-100 text-gray-500',
      cancelled: 'bg-red-100 text-red-700',
      inactive: 'bg-gray-100 text-gray-500',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  };

  const getCategoryLabel = (category) => {
    const map = {
      organic: 'Organic',
      plastic: 'Plastic',
      agricultural: 'Agricultural',
      industrial: 'Industrial',
      glass: 'Glass',
      metal: 'Metal',
      paper: 'Paper',
      e_waste: 'E-Waste',
      mixed: 'Mixed',
      other: 'Other',
    };
    return map[category] || category || 'Other';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-KE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#11402D] border-t-[#9CF06B] rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Loading waste listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Stats Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total" value={stats.total} icon={Package} color="blue" />
        <StatCard label="Available" value={stats.available} icon={CheckCircle} color="green" />
        <StatCard label="Requested" value={stats.requested} icon={Clock} color="yellow" />
        <StatCard label="Assigned" value={stats.assigned} icon={Truck} color="purple" />
        <StatCard label="Delivered" value={stats.delivered} icon={CheckCircle} color="indigo" />
      </div>

      {/* ─── Toolbar ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, location, supplier..."
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
              <option value="available">Available</option>
              <option value="requested">Requested</option>
              <option value="assigned">Assigned</option>
              <option value="collected">Collected</option>
              <option value="delivered">Delivered</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>

          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="appearance-none rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-8 text-sm outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Categories</option>
              <option value="organic">Organic</option>
              <option value="plastic">Plastic</option>
              <option value="agricultural">Agricultural</option>
              <option value="industrial">Industrial</option>
              <option value="glass">Glass</option>
              <option value="metal">Metal</option>
              <option value="paper">Paper</option>
              <option value="e_waste">E-Waste</option>
              <option value="mixed">Mixed</option>
              <option value="other">Other</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <button
          onClick={handleAddNew}
          className="inline-flex items-center gap-2 rounded-xl bg-[#11402D] px-4 py-2 text-sm font-bold text-white hover:bg-[#0E2A1C] transition"
        >
          <Plus className="h-4 w-4" />
          Add New
        </button>
      </div>

      {/* ─── Table ───────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {paginatedListings.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-700">No waste listings found</h3>
            <p className="text-sm text-gray-500">Try adjusting your filters or add a new listing.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Waste Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Supplier</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Created</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedListings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-4 py-3 font-mono text-sm text-gray-500">#{listing.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{listing.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{getCategoryLabel(listing.type)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {listing.quantity || '—'} {listing.unit || 'kg'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{listing.location}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{listing.supplier_name || 'Unknown'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadge(listing.status)}`}>
                        {listing.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(listing.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleView(listing)}
                          className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-[#11402D]"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(listing)}
                          className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-blue-600"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(listing.id)}
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
            Showing {Math.min(filteredListings.length, (currentPage - 1) * pageSize + 1)} to{' '}
            {Math.min(filteredListings.length, currentPage * pageSize)} of {filteredListings.length} entries
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

      {/* ─── Add/Edit Modal ─────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingListing ? 'Edit Waste Listing' : 'Add Waste Listing'}
                </h2>
                <p className="text-sm text-gray-500">
                  {editingListing ? 'Update the waste listing details.' : 'Fill in the details to add a new waste listing.'}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="rounded-xl p-2 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Waste Type *</label>
                  <input
                    type="text"
                    name="waste_type"
                    value={formData.waste_type}
                    onChange={handleFormChange}
                    className={`mt-1 w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 ${
                      formErrors.waste_type ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="e.g. Organic Waste"
                  />
                  {formErrors.waste_type && <p className="mt-1 text-xs text-red-500">{formErrors.waste_type}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select category</option>
                    <option value="organic">Organic</option>
                    <option value="plastic">Plastic</option>
                    <option value="agricultural">Agricultural</option>
                    <option value="industrial">Industrial</option>
                    <option value="glass">Glass</option>
                    <option value="metal">Metal</option>
                    <option value="paper">Paper</option>
                    <option value="e_waste">E-Waste</option>
                    <option value="mixed">Mixed</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity *</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleFormChange}
                    step="0.01"
                    min="0"
                    className={`mt-1 w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 ${
                      formErrors.quantity ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="500"
                  />
                  {formErrors.quantity && <p className="mt-1 text-xs text-red-500">{formErrors.quantity}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unit</label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="kg">Kilograms</option>
                    <option value="tons">Tons</option>
                    <option value="cubic_metres">Cubic Metres</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="available">Available</option>
                    <option value="requested">Requested</option>
                    <option value="assigned">Assigned</option>
                    <option value="collected">Collected</option>
                    <option value="delivered">Delivered</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location *</label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleFormChange}
                      className={`w-full rounded-xl border pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 ${
                        formErrors.location ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="e.g. Nairobi, Kenya"
                    />
                  </div>
                  {formErrors.location && <p className="mt-1 text-xs text-red-500">{formErrors.location}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pickup Address</label>
                  <input
                    type="text"
                    name="pickup_address"
                    value={formData.pickup_address}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Street, building, gate"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows="3"
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  placeholder="Describe the waste"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-[#11402D] py-2.5 font-bold text-white hover:bg-[#0E2A1C] disabled:opacity-70"
                >
                  {submitting ? 'Saving...' : editingListing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── View Modal ──────────────────────────────────────────── */}
      {showViewModal && viewingListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Waste Listing Details</h2>
                <p className="text-sm text-gray-500">ID #{viewingListing.id}</p>
              </div>
              <button onClick={() => setShowViewModal(false)} className="rounded-xl p-2 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Waste Type</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{viewingListing.name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Category</p>
                  <p className="mt-1 text-sm text-gray-700">{getCategoryLabel(viewingListing.type)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Quantity</p>
                  <p className="mt-1 text-sm text-gray-700">
                    {viewingListing.quantity || '—'} {viewingListing.unit || 'kg'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Status</p>
                  <span className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadge(viewingListing.status)}`}>
                    {viewingListing.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Location</p>
                  <p className="mt-1 text-sm text-gray-700">{viewingListing.location}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Pickup Address</p>
                  <p className="mt-1 text-sm text-gray-700">{viewingListing.pickup_address || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Supplier</p>
                  <p className="mt-1 text-sm text-gray-700">{viewingListing.supplier_name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Created</p>
                  <p className="mt-1 text-sm text-gray-700">{formatDate(viewingListing.created_at)}</p>
                </div>
              </div>

              {viewingListing.description && (
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Description</p>
                  <p className="mt-1 text-sm text-gray-700">{viewingListing.description}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="rounded-xl bg-[#11402D] px-6 py-2.5 font-bold text-white hover:bg-[#0E2A1C]"
              >
                Close
              </button>
            </div>
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
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}