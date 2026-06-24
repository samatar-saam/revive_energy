// src/users/pages/supplier/MyWasteListings.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Edit,
  Trash2,
  Eye,
  Plus,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const MyWasteListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);

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

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    setDeleteLoading(id);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/supplier/listings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete');
      setListings(listings.filter((l) => l.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete listing. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
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
                          onClick={() => {/* Implement edit modal */}}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-500 hover:text-blue-600"
                          title="Edit"
                          disabled={listing.status !== 'available' && listing.status !== 'cancelled'}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(listing.id)}
                          disabled={deleteLoading === listing.id}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-500 hover:text-red-600"
                          title="Delete"
                        >
                          {deleteLoading === listing.id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                        <Link
                          to={`/dashboard/listings/${listing.id}`}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-500 hover:text-[#11402D]"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyWasteListings;