// src/admin/pages/Reviews.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Star,
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Eye,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  User,
  Mail,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Reviews() {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRating, setFilterRating] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);

  // ─── Modal states ────────────────────────────────────────────
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  const getToken = () => localStorage.getItem('token');

  // ─── Fetch reviews ──────────────────────────────────────────
  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        setError('Not authenticated. Please login.');
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/admin/reviews`, {
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
      setReviews(data);
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError(err.message);
      toast.error(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // ─── Filtering & pagination ──────────────────────────────────
  const filteredReviews = useMemo(() => {
    let filtered = [...reviews];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (r) =>
          r.comment?.toLowerCase().includes(q) ||
          r.reviewer_name?.toLowerCase().includes(q) ||
          r.reviewee_name?.toLowerCase().includes(q) ||
          r.id?.toString().includes(q)
      );
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter((r) => r.status === filterStatus);
    }
    if (filterRating !== 'all') {
      filtered = filtered.filter((r) => r.rating === parseInt(filterRating));
    }
    return filtered;
  }, [reviews, searchQuery, filterStatus, filterRating]);

  const totalPages = Math.ceil(filteredReviews.length / pageSize);
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // ─── Stats ────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = reviews.length;
    const avgRating = reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / total || 0;
    const pending = reviews.filter((r) => r.status === 'pending').length;
    const approved = reviews.filter((r) => r.status === 'approved').length;
    const rejected = reviews.filter((r) => r.status === 'rejected').length;
    return { total, avgRating, pending, approved, rejected };
  }, [reviews]);

  const getStatusBadge = (status) => {
    const map = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
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
  const openView = (review) => {
    setSelectedReview(review);
    setShowViewModal(true);
  };

  const closeModals = () => {
    setShowViewModal(false);
    setSelectedReview(null);
  };

  const handleDelete = async (review) => {
    if (!confirm(`Are you sure you want to delete this review?`)) return;
    try {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`${API_URL}/admin/reviews/${review.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Delete failed');
      }

      toast.success('Review deleted successfully');
      fetchReviews();
    } catch (err) {
      toast.error(err.message || 'Failed to delete review');
    }
  };

  const handleUpdateStatus = async (review, status) => {
    try {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`${API_URL}/admin/reviews/${review.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Update failed');
      }

      toast.success(`Review ${status} successfully`);
      fetchReviews();
    } catch (err) {
      toast.error(err.message || 'Failed to update review');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#11402D] border-t-[#9CF06B] rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900">Unable to load reviews</h3>
          <p className="text-gray-500 mt-2">{error}</p>
          <button
            onClick={fetchReviews}
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
        <StatCard label="Total Reviews" value={stats.total} icon={MessageSquare} color="blue" />
        <StatCard label="Avg Rating" value={stats.avgRating.toFixed(1)} icon={Star} color="yellow" />
        <StatCard label="Pending" value={stats.pending} icon={Clock} color="yellow" />
        <StatCard label="Approved" value={stats.approved} icon={CheckCircle} color="green" />
      </div>

      {/* ─── Toolbar ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by comment or user..."
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
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>

          <div className="relative">
            <Star className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="appearance-none rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-8 text-sm outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Ratings</option>
              <option value="1">1 Star</option>
              <option value="2">2 Stars</option>
              <option value="3">3 Stars</option>
              <option value="4">4 Stars</option>
              <option value="5">5 Stars</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <button
          onClick={fetchReviews}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* ─── Table ───────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {paginatedReviews.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-700">No reviews found</h3>
            <p className="text-sm text-gray-500">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Reviewer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Reviewed</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Rating</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Comment</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-4 py-3 font-mono text-sm text-gray-500">#{review.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{review.reviewer_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{review.reviewee_name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-0.5">
                        {renderStars(review.rating)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-[150px]">
                      {review.comment}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadge(review.status)}`}>
                        {review.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(review.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openView(review)}
                          className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-[#11402D]"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {review.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(review, 'approved')}
                              className="rounded-lg p-1.5 text-green-400 transition hover:bg-gray-100 hover:text-green-600"
                              title="Approve"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(review, 'rejected')}
                              className="rounded-lg p-1.5 text-red-400 transition hover:bg-gray-100 hover:text-red-600"
                              title="Reject"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(review)}
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
            Showing {Math.min(filteredReviews.length, (currentPage - 1) * pageSize + 1)} to{' '}
            {Math.min(filteredReviews.length, currentPage * pageSize)} of {filteredReviews.length} entries
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
      {showViewModal && selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Review Details</h2>
                <p className="text-sm text-gray-500">ID #{selectedReview.id}</p>
              </div>
              <button onClick={closeModals} className="rounded-xl p-2 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Reviewer</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{selectedReview.reviewer_name}</p>
                  <p className="text-xs text-gray-500">{selectedReview.reviewer_email}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Reviewed User</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{selectedReview.reviewee_name}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-semibold uppercase text-gray-400">Rating</p>
                  <div className="flex items-center gap-0.5 mt-1">
                    {renderStars(selectedReview.rating)}
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-semibold uppercase text-gray-400">Comment</p>
                  <p className="mt-1 text-sm text-gray-700">{selectedReview.comment}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Status</p>
                  <span className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadge(selectedReview.status)}`}>
                    {selectedReview.status || 'pending'}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Date</p>
                  <p className="mt-1 text-sm text-gray-700">{formatDate(selectedReview.created_at)}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              {selectedReview.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedReview, 'approved');
                      closeModals();
                    }}
                    className="rounded-xl bg-green-600 px-6 py-2.5 font-bold text-white hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedReview, 'rejected');
                      closeModals();
                    }}
                    className="rounded-xl bg-red-600 px-6 py-2.5 font-bold text-white hover:bg-red-700"
                  >
                    Reject
                  </button>
                </>
              )}
              <button onClick={closeModals} className="rounded-xl bg-[#11402D] px-6 py-2.5 font-bold text-white hover:bg-[#0E2A1C]">
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
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    green: 'bg-green-50 text-green-600 border-green-100',
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