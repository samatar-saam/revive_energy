// src/users/pages/supplier/MyWasteListings.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';   // ✅ Added missing import
import {
  Package,
  Edit,
  Trash2,
  Eye,
  Plus,
  AlertCircle,
  RefreshCw,
  X,
  MapPin,
  Building2,
  Calendar,
  Clock,
  User,
  Phone,
  Tag,
  FileText,
  Loader,
  CheckCircle,
  DollarSign,
  Truck,
} from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const MyWasteListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  
  // ─── Modal states ────────────────────────────────────────
  const [selectedListing, setSelectedListing] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ─── Edit form state ──────────────────────────────────────
  const [editForm, setEditForm] = useState({
    waste_type: '',
    quantity: '',
    unit: 'kg',
    location: '',
    pickup_address: '',
    description: '',
  });

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_URL}/supplier/listings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch listings');
      const data = await response.json();
      setListings(data);
    } catch (err) {
      console.error('Fetch listings error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedListing) return;
    setDeleteLoading(selectedListing.id);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/supplier/listings/${selectedListing.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete');
      
      setListings(listings.filter((l) => l.id !== selectedListing.id));
      toast.success('Listing deleted successfully');
      setShowDeleteModal(false);
      setSelectedListing(null);
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete listing. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!selectedListing) return;
    setEditLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        waste_type: editForm.waste_type,
        quantity: parseFloat(editForm.quantity),
        unit: editForm.unit,
        location: editForm.location,
        pickup_address: editForm.pickup_address,
        description: editForm.description,
      };

      const response = await fetch(`${API_URL}/supplier/listings/${selectedListing.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to update listing');
      
      // Update local state
      setListings(listings.map(l => 
        l.id === selectedListing.id ? { ...l, ...payload } : l
      ));
      toast.success('Listing updated successfully');
      setShowEditModal(false);
      setSelectedListing(null);
    } catch (err) {
      console.error('Edit error:', err);
      toast.error('Failed to update listing. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  const openViewModal = (listing) => {
    setSelectedListing(listing);
    setShowViewModal(true);
  };

  const openEditModal = (listing) => {
    // Only allow editing if status is 'available' or 'cancelled'
    if (listing.status !== 'available' && listing.status !== 'cancelled') {
      toast.warning('Cannot edit a listing that is already requested or assigned.');
      return;
    }
    setSelectedListing(listing);
    setEditForm({
      waste_type: listing.waste_type || '',
      quantity: listing.quantity || '',
      unit: listing.unit || 'kg',
      location: listing.location || '',
      pickup_address: listing.pickup_address || '',
      description: listing.description || '',
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (listing) => {
    if (listing.status !== 'available' && listing.status !== 'cancelled') {
      toast.warning('Cannot delete a listing that is already requested or assigned.');
      return;
    }
    setSelectedListing(listing);
    setShowDeleteModal(true);
  };

  const closeModals = () => {
    setShowViewModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedListing(null);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      available: 'bg-green-100 text-green-700',
      requested: 'bg-yellow-100 text-yellow-700',
      assigned: 'bg-blue-100 text-blue-700',
      collected: 'bg-purple-100 text-purple-700',
      delivered: 'bg-indigo-100 text-indigo-700',
      completed: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleDateString('en-KE', {
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
          <p className="mt-4 text-gray-500">Loading your listings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-2xl mx-auto">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="font-display text-xl font-bold text-red-700">Unable to Load Listings</h3>
        <p className="text-red-600 mt-2">{error}</p>
        <button
          onClick={fetchListings}
          className="mt-6 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">My Waste Listings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your waste listings</p>
        </div>
        <Link
          to="/dashboard/post-waste"
          className="flex items-center gap-2 px-4 py-2 bg-[#11402D] text-white rounded-xl text-sm font-medium hover:bg-[#0E2A1C] transition"
        >
          <Plus className="w-4 h-4" />
          Post New Waste
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <h3 className="font-display text-lg font-semibold text-gray-700">No listings yet</h3>
          <p className="text-gray-500 text-sm mt-1">Post your first waste listing to get started.</p>
          <Link
            to="/dashboard/post-waste"
            className="inline-block mt-4 px-6 py-2 bg-[#11402D] text-white rounded-xl text-sm font-medium hover:bg-[#0E2A1C] transition"
          >
            Post Waste
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Waste Type</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Quantity</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Location</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {listings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 sm:px-6 py-3 text-sm font-mono text-gray-500">#{listing.id}</td>
                    <td className="px-4 sm:px-6 py-3 font-medium text-gray-900">{listing.waste_type}</td>
                    <td className="px-4 sm:px-6 py-3 text-sm text-gray-700 hidden md:table-cell">
                      {listing.quantity} {listing.unit || 'kg'}
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-sm text-gray-600 hidden lg:table-cell">{listing.location}</td>
                    <td className="px-4 sm:px-6 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(listing.status)}`}>
                        {listing.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openViewModal(listing)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-500 hover:text-[#11402D]"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(listing)}
                          disabled={listing.status !== 'available' && listing.status !== 'cancelled'}
                          className={`p-1.5 rounded-lg transition ${
                            listing.status === 'available' || listing.status === 'cancelled'
                              ? 'hover:bg-gray-100 text-gray-500 hover:text-blue-600'
                              : 'text-gray-300 cursor-not-allowed'
                          }`}
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(listing)}
                          disabled={listing.status !== 'available' && listing.status !== 'cancelled'}
                          className={`p-1.5 rounded-lg transition ${
                            listing.status === 'available' || listing.status === 'cancelled'
                              ? 'hover:bg-gray-100 text-gray-500 hover:text-red-600'
                              : 'text-gray-300 cursor-not-allowed'
                          }`}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── View Modal ────────────────────────────────────────── */}
      {showViewModal && selectedListing && (
        <ViewModal listing={selectedListing} onClose={closeModals} formatDate={formatDate} />
      )}

      {/* ─── Edit Modal ────────────────────────────────────────── */}
      {showEditModal && selectedListing && (
        <EditModal
          listing={selectedListing}
          editForm={editForm}
          setEditForm={setEditForm}
          onClose={closeModals}
          onSave={handleEdit}
          loading={editLoading}
        />
      )}

      {/* ─── Delete Modal ──────────────────────────────────────── */}
      {showDeleteModal && selectedListing && (
        <DeleteModal
          listing={selectedListing}
          onClose={closeModals}
          onConfirm={handleDelete}
          loading={deleteLoading === selectedListing.id}
        />
      )}
    </div>
  );
};

// ─── View Details Modal ──────────────────────────────────────────
const ViewModal = ({ listing, onClose, formatDate }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-xl font-bold text-gray-900">Waste Listing Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Image */}
          {listing.image_url && (
            <div className="rounded-2xl overflow-hidden bg-gray-100 h-48 flex items-center justify-center">
              <img
                src={listing.image_url}
                alt={listing.waste_type}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `
                    <div class="flex flex-col items-center justify-center text-gray-400 w-full h-full">
                      <Package class="w-16 h-16 mb-2" />
                      <span class="text-sm">No image available</span>
                    </div>
                  `;
                }}
              />
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Detail label="Waste Type" value={listing.waste_type} />
              <Detail label="Category" value={listing.category || 'General'} />
              <Detail label="Quantity" value={`${listing.quantity} ${listing.unit || 'kg'}`} />
              <Detail label="Location" value={listing.location || 'N/A'} />
              <Detail label="Pickup Address" value={listing.pickup_address || 'N/A'} />
            </div>
            <div className="space-y-2">
              <Detail label="Status" value={listing.status} badge />
              <Detail label="Created" value={formatDate(listing.created_at)} />
              <Detail label="Price per unit" value={`KES ${listing.price_per_unit || 0}`} />
              <Detail label="Transport rate" value={`KES ${listing.transport_rate_per_unit || 0}`} />
              <Detail label="Waste Value" value={`KES ${listing.waste_value || 0}`} />
              <Detail label="Total Amount" value={`KES ${listing.total_amount || 0}`} strong />
            </div>
          </div>

          {listing.description && (
            <div className="border-t border-gray-100 pt-4">
              <h4 className="font-semibold text-gray-700 mb-1">Description</h4>
              <p className="text-sm text-gray-600">{listing.description}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 font-semibold text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Edit Modal ──────────────────────────────────────────────────
const EditModal = ({ listing, editForm, setEditForm, onClose, onSave, loading }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-xl font-bold text-gray-900">Edit Listing</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={onSave} className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Waste Type *</label>
              <input
                type="text"
                name="waste_type"
                value={editForm.waste_type}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
              <input
                type="number"
                name="quantity"
                value={editForm.quantity}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select
                name="unit"
                value={editForm.unit}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="tons">Tons</option>
                <option value="cubic_metres">Cubic Metres</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <input
                type="text"
                name="location"
                value={editForm.location}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Address</label>
            <input
              type="text"
              name="pickup_address"
              value={editForm.pickup_address}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              rows="3"
              value={editForm.description}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-[#11402D] text-white font-semibold hover:bg-[#0E2A1C] transition disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Delete Modal ──────────────────────────────────────────────────
const DeleteModal = ({ listing, onClose, onConfirm, loading }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Delete Listing</h3>
          <p className="text-sm text-gray-500 mt-2">
            Are you sure you want to delete the listing "<strong>{listing.waste_type}</strong>"?
            This action cannot be undone.
          </p>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 font-semibold text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Helper Components ──────────────────────────────────────────
const Detail = ({ label, value, badge, strong }) => {
  if (badge) {
    return (
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">{label}</span>
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700`}>
          {value}
        </span>
      </div>
    );
  }
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm ${strong ? 'font-bold text-[#11402D]' : 'text-gray-800'}`}>
        {value}
      </span>
    </div>
  );
};

export default MyWasteListings;