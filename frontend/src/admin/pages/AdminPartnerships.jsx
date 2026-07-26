// pages/admin/Partnerships.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Mail,
  Phone,
  Building2,
  User,
  Calendar,
  Tag,
  Check,
  X,
  AlertCircle,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ─── Toast Component ──────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Clock className="w-5 h-5 text-blue-500" />,
  };

  const bgColors = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    info: "bg-blue-50 border-blue-200",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${bgColors[type]} max-w-md`}
    >
      {icons[type]}
      <p className="text-sm font-medium text-gray-800 flex-1">{message}</p>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────
export default function AdminPartnerships() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null); // { id, action, name }

  const token = localStorage.getItem("token");

  // ─── Fetch applications ──────────────────────────────────────
  const fetchApplications = async (status = "") => {
    setLoading(true);
    setError(null);
    try {
      const url = status
        ? `${API_URL}/contact/partnerships?status=${status}`
        : `${API_URL}/contact/partnerships`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 403) throw new Error("Unauthorized – admin access required");
        throw new Error("Failed to fetch applications");
      }
      const data = await res.json();
      setApplications(data.applications || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Approve / Reject ──────────────────────────────────────
  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      const res = await fetch(`${API_URL}/contact/partnership/${id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ admin_notes: "" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Approval failed");
      setToast({ message: data.message || "Application approved successfully!", type: "success" });
      await fetchApplications(statusFilter);
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    } finally {
      setActionLoading(null);
      setConfirmModal(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      const res = await fetch(`${API_URL}/contact/partnership/${id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ admin_notes: "" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Rejection failed");
      setToast({ message: data.message || "Application rejected successfully.", type: "info" });
      await fetchApplications(statusFilter);
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    } finally {
      setActionLoading(null);
      setConfirmModal(null);
    }
  };

  // ─── Confirm Modal ──────────────────────────────────────────
  const ConfirmDialog = () => {
    if (!confirmModal) return null;
    const { id, action, name } = confirmModal;
    const isApprove = action === "approve";

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className={`p-3 rounded-xl ${isApprove ? "bg-green-50" : "bg-red-50"}`}>
              {isApprove ? (
                <ThumbsUp className="w-6 h-6 text-green-600" />
              ) : (
                <ThumbsDown className="w-6 h-6 text-red-600" />
              )}
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-gray-900">
                {isApprove ? "Approve" : "Reject"} Application
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {isApprove
                  ? `Are you sure you want to approve "${name}"? The applicant will receive a welcome email.`
                  : `Are you sure you want to reject "${name}"? The applicant will be notified.`}
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setConfirmModal(null)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => (isApprove ? handleApprove(id) : handleReject(id))}
              disabled={actionLoading === id}
              className={`flex-1 py-2.5 rounded-xl text-white font-bold transition disabled:opacity-60 ${
                isApprove
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {actionLoading === id ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : isApprove ? (
                "Approve"
              ) : (
                "Reject"
              )}
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  useEffect(() => {
    fetchApplications(statusFilter);
  }, [statusFilter]);

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      approved: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      reviewed: "bg-blue-100 text-blue-800 border-blue-200",
      contacted: "bg-purple-100 text-purple-800 border-purple-200",
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading && applications.length === 0) {
    return (
      <div className="min-h-screen bg-[#F6F8F4] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <RefreshCw className="w-10 h-10 text-[#11402D] animate-spin" />
          <p className="mt-4 text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8F4] font-['Inter']">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
      `}</style>

      {/* Toast notifications */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* Confirm Modal */}
      <AnimatePresence>{confirmModal && <ConfirmDialog />}</AnimatePresence>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-[#0E2A1C] flex items-center gap-3">
              <Building2 className="w-8 h-8 text-[#11402D]" />
              Partnership Applications
            </h1>
            <p className="text-gray-600 mt-1">
              Review and manage incoming partnership requests
            </p>
          </div>
          <button
            onClick={() => fetchApplications(statusFilter)}
            className="mt-4 md:mt-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium hover:bg-gray-50 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Filter className="w-4 h-4" />
            <span>Filter by status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-green-500 bg-white"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="reviewed">Reviewed</option>
            <option value="contacted">Contacted</option>
          </select>
          <div className="ml-auto text-sm text-gray-500">
            {applications.length} application{applications.length !== 1 && "s"}
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 mb-6">
            {error}
          </div>
        )}

        {/* Applications list */}
        {applications.length === 0 && !loading && !error ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700">No applications found</h3>
              <p className="text-gray-500 text-sm">
                {statusFilter
                  ? `No ${statusFilter} applications match your filter.`
                  : "Partnership applications will appear here once submitted."}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const isPending = app.status === "pending";

              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  {/* Summary row (always visible) */}
                  <div
                    className="p-5 flex flex-wrap items-center justify-between cursor-pointer hover:bg-gray-50/50 transition"
                    onClick={() => toggleExpand(app.id)}
                  >
                    <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="font-medium text-[#0E2A1C] truncate">
                            {app.organization_name}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <User className="w-3 h-3" />
                          {app.contact_name}
                        </div>
                      </div>
                      <div className="truncate text-sm text-gray-600">
                        <Mail className="w-3.5 h-3.5 inline mr-1" />
                        {app.email}
                      </div>
                      <div className="truncate text-sm text-gray-600">
                        <Phone className="w-3.5 h-3.5 inline mr-1" />
                        {app.phone}
                      </div>
                      <div>
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                          {app.organization_type}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(app.status)}
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(app.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 text-gray-400">
                      {expandedId === app.id ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </div>

                  {/* Expanded details */}
                  {expandedId === app.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-100 p-5 bg-gray-50/50"
                    >
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Waste Types</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {(app.waste_types || []).length > 0 ? (
                              app.waste_types.map((type, idx) => (
                                <span
                                  key={idx}
                                  className="bg-white border border-gray-200 px-2 py-0.5 rounded text-xs text-gray-700"
                                >
                                  {type}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-gray-400">Not specified</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Submitted</h4>
                          <p className="text-sm text-gray-600">{formatDate(app.created_at)}</p>
                          {app.updated_at && app.updated_at !== app.created_at && (
                            <p className="text-xs text-gray-400 mt-1">
                              Last updated: {formatDate(app.updated_at)}
                            </p>
                          )}
                        </div>
                      </div>

                      {app.message && (
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Message</h4>
                          <div className="bg-white rounded-xl border border-gray-200 p-3 text-sm text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto">
                            {app.message}
                          </div>
                        </div>
                      )}

                      {/* Action buttons for pending applications */}
                      {isPending && (
                        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-gray-200 pt-4">
                          <span className="text-sm font-medium text-gray-700">Actions:</span>
                          <button
                            onClick={() =>
                              setConfirmModal({
                                id: app.id,
                                action: "approve",
                                name: app.organization_name,
                              })
                            }
                            disabled={actionLoading === app.id}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition disabled:opacity-60"
                          >
                            <Check className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              setConfirmModal({
                                id: app.id,
                                action: "reject",
                                name: app.organization_name,
                              })
                            }
                            disabled={actionLoading === app.id}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition disabled:opacity-60"
                          >
                            <X className="w-4 h-4" />
                            Reject
                          </button>
                          {actionLoading === app.id && (
                            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                          )}
                        </div>
                      )}

                      {/* Contact actions */}
                      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-gray-200 pt-4">
                        <button
                          onClick={() => window.open(`mailto:${app.email}`)}
                          className="inline-flex items-center gap-1 text-sm text-[#11402D] hover:underline"
                        >
                          <Mail className="w-4 h-4" />
                          Email
                        </button>
                        <button
                          onClick={() => window.open(`tel:${app.phone}`)}
                          className="inline-flex items-center gap-1 text-sm text-[#11402D] hover:underline"
                        >
                          <Phone className="w-4 h-4" />
                          Call
                        </button>
                        <span className="ml-auto text-xs text-gray-400">
                          {app.status === "approved"
                            ? "✅ Approved – welcome email sent"
                            : app.status === "rejected"
                            ? "❌ Rejected – notification sent"
                            : "⏳ Pending review"}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}