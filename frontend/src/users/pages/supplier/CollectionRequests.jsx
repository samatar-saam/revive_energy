// src/users/pages/supplier/CollectionRequests.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  User,
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
  Search,
  Filter,
  Truck,
  MapPin,
  ThumbsUp,
  Phone,
  Building2,
  Navigation,
  X,
} from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CollectionRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [pickupApprovals, setPickupApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // ─── Modal state ──────────────────────────────────────────────
  const [showTransporterModal, setShowTransporterModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, searchQuery, filterStatus]);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      // ─── Fetch collection requests (WasteRequest) ──────────
      const reqRes = await fetch(`${API_URL}/supplier/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!reqRes.ok) throw new Error('Failed to fetch collection requests');
      const reqData = await reqRes.json();
      setRequests(reqData);
      setFilteredRequests(reqData);

      // ─── Fetch transport jobs for pickup approvals ──────────
      const jobRes = await fetch(`${API_URL}/supplier/collections`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!jobRes.ok) throw new Error('Failed to fetch transport jobs');
      const jobData = await jobRes.json();
      // Filter only jobs with status 'accepted'
      const acceptedJobs = jobData.filter(job => job.status === 'accepted');
      setPickupApprovals(acceptedJobs);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = [...requests];

    if (filterStatus !== 'all') {
      filtered = filtered.filter((r) => r.status === filterStatus);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (r) =>
          r.waste_type?.toLowerCase().includes(q) ||
          r.producer_name?.toLowerCase().includes(q) ||
          r.message?.toLowerCase().includes(q)
      );
    }

    setFilteredRequests(filtered);
  };

  const handleAction = async (requestId, action) => {
    if (!confirm(`Are you sure you want to ${action} this request?`)) return;

    setProcessing(requestId);
    try {
      const token = localStorage.getItem('token');
      const endpoint =
        action === 'approve'
          ? `${API_URL}/supplier/requests/${requestId}/approve`
          : `${API_URL}/supplier/requests/${requestId}/reject`;

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `Failed to ${action} request`);

      toast.success(`Request ${action}d successfully!`);
      await fetchAllData();
    } catch (err) {
      console.error('Action error:', err);
      toast.error(err.message);
    } finally {
      setProcessing(null);
    }
  };

  // ─── Open modal with transporter details ──────────────────────
  const openTransporterModal = (job) => {
    setSelectedJob(job);
    setShowTransporterModal(true);
  };

  // ─── Confirm pickup approval ──────────────────────────────────
  const confirmApprovePickup = async () => {
    if (!selectedJob) return;
    setProcessing(selectedJob.id);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/supplier/transport-jobs/${selectedJob.id}/approve-pickup`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to approve pickup');

      toast.success('Pickup approved! Transporter can now pick up.');
      setShowTransporterModal(false);
      setSelectedJob(null);
      await fetchAllData();
    } catch (err) {
      console.error('Approve pickup error:', err);
      toast.error(err.message);
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      assigned: 'bg-blue-100 text-blue-700',
      in_transit: 'bg-purple-100 text-purple-700',
      delivered: 'bg-indigo-100 text-indigo-700',
      completed: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-gray-100 text-gray-700',
      accepted: 'bg-blue-100 text-blue-700',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-KE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#11402D] border-t-[#9CF06B] rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-2xl mx-auto">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="font-display text-xl font-bold text-red-700">Unable to Load Data</h3>
        <p className="text-red-600 mt-2">{error}</p>
        <button
          onClick={fetchAllData}
          className="mt-6 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  const statusOptions = [
    'all',
    'pending',
    'approved',
    'rejected',
    'assigned',
    'in_transit',
    'delivered',
    'completed',
    'cancelled',
  ];

  return (
    <div className="space-y-6 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Collection Requests</h1>
          <p className="text-sm text-gray-500 mt-1">Manage waste requests and pickup approvals</p>
        </div>
        <button
          onClick={fetchAllData}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* ─── Pending Pickup Approvals ──────────────────────────────── */}
      {pickupApprovals.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-display text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Truck className="w-5 h-5 text-[#11402D]" />
            Pending Pickup Approvals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pickupApprovals.map((job) => (
              <div key={job.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-sm transition">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{job.waste_type}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {job.quantity} {job.unit || 'kg'} · {job.pickup_location}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Transporter: {job.transporter_name || 'Not assigned'}
                    </p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusBadge(job.status)}`}>
                    {job.status}
                  </span>
                </div>
                <button
                  onClick={() => openTransporterModal(job)}
                  disabled={processing === job.id}
                  className="mt-3 flex items-center gap-1.5 bg-[#11402D] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#0E2A1C] transition disabled:opacity-50"
                >
                  {processing === job.id ? (
                    <span className="flex items-center gap-1">Processing...</span>
                  ) : (
                    <>
                      <ThumbsUp className="w-4 h-4" />
                      Approve Pickup
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Filters ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by waste, producer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-green-500 transition text-sm"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-9 pr-8 py-2 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-green-500 transition appearance-none text-sm"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <span className="text-sm text-gray-500 whitespace-nowrap">
            {filteredRequests.length} of {requests.length}
          </span>
        </div>
      </div>

      {/* ─── Collection Requests Table ─────────────────────────────── */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <h3 className="font-display text-lg font-semibold text-gray-700">No requests found</h3>
          <p className="text-gray-500 text-sm mt-1">
            {searchQuery || filterStatus !== 'all'
              ? 'Try adjusting your filters or search.'
              : 'You have no collection requests yet.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Waste Type</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Producer</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Message</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 sm:px-6 py-3 text-sm font-mono text-gray-500">#{req.id}</td>
                    <td className="px-4 sm:px-6 py-3 font-medium text-gray-900">{req.waste_type}</td>
                    <td className="px-4 sm:px-6 py-3 text-sm text-gray-700 hidden md:table-cell">
                      {req.producer_name}
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-sm text-gray-500 hidden lg:table-cell max-w-[150px] truncate">
                      {req.message || '—'}
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-sm text-gray-500 hidden sm:table-cell">
                      {formatDate(req.created_at)}
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                          req.status
                        )}`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <div className="flex items-center gap-2">
                        {req.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleAction(req.id, 'approve')}
                              disabled={processing === req.id}
                              className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition disabled:opacity-50"
                            >
                              {processing === req.id ? '...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleAction(req.id, 'reject')}
                              disabled={processing === req.id}
                              className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition disabled:opacity-50"
                            >
                              {processing === req.id ? '...' : 'Reject'}
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">Processed</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Transporter Details Modal ────────────────────────────── */}
      {showTransporterModal && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-display text-xl font-bold text-gray-900">Transporter Details</h3>
              <button
                onClick={() => setShowTransporterModal(false)}
                className="rounded-xl p-2 hover:bg-gray-100 transition"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold">Waste Type</p>
                <p className="font-medium text-gray-900">{selectedJob.waste_type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold">Quantity</p>
                <p className="font-medium text-gray-900">{selectedJob.quantity} {selectedJob.unit || 'kg'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold">Pickup Location</p>
                <p className="font-medium text-gray-900">{selectedJob.pickup_location || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold">Delivery Location</p>
                <p className="font-medium text-gray-900">{selectedJob.delivery_location || '—'}</p>
              </div>

              <hr className="border-gray-200" />

              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold">Transporter</p>
                <div className="mt-2 space-y-2 bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#11402D]/10 flex items-center justify-center">
                      <Truck className="w-5 h-5 text-[#11402D]" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{selectedJob.transporter_name || 'Not assigned'}</p>
                      <p className="text-xs text-gray-500">Transporter ID: {selectedJob.transporter_id || '—'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-xs text-gray-400">Phone</span>
                      <p className="font-medium text-gray-800">{selectedJob.transporter_phone || '—'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">Vehicle Type</span>
                      <p className="font-medium text-gray-800">{selectedJob.vehicle_type || '—'}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-gray-400">Vehicle Number</span>
                      <p className="font-medium text-gray-800">{selectedJob.vehicle_number || '—'}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-gray-400">Coverage Area</span>
                      <p className="font-medium text-gray-800">{selectedJob.coverage_area || '—'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowTransporterModal(false)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmApprovePickup}
                disabled={processing === selectedJob.id}
                className="flex-1 rounded-xl bg-[#11402D] py-2.5 font-bold text-white hover:bg-[#0E2A1C] transition disabled:opacity-70"
              >
                {processing === selectedJob.id ? 'Processing...' : 'Approve Pickup'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionRequests;