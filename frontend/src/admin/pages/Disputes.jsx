// src/pages/admin/Disputes.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  RefreshCw,
  Filter,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  HelpCircle,
  TrendingUp,
  Scale,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [updating, setUpdating] = useState(null);

  const token = localStorage.getItem("token");

  const fetchDisputes = async (status = "") => {
    setLoading(true);
    setError(null);
    try {
      const url = status
        ? `${API_URL}/admin/disputes?status=${status}`
        : `${API_URL}/admin/disputes`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 403) throw new Error("Unauthorized – admin access required");
        throw new Error("Failed to fetch disputes");
      }
      const data = await res.json();
      setDisputes(data.disputes || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateDisputeStatus = async (id, newStatus) => {
    setUpdating(id);
    try {
      const res = await fetch(`${API_URL}/admin/disputes/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Update failed");
      await fetchDisputes(statusFilter);
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(null);
    }
  };

  useEffect(() => {
    fetchDisputes(statusFilter);
  }, [statusFilter]);

  const getStatusBadge = (status) => {
    const styles = {
      open: "bg-yellow-100 text-yellow-800 border-yellow-200",
      under_investigation: "bg-blue-100 text-blue-800 border-blue-200",
      awaiting_response: "bg-purple-100 text-purple-800 border-purple-200",
      resolved: "bg-green-100 text-green-800 border-green-200",
      closed: "bg-gray-100 text-gray-800 border-gray-200",
      refunded: "bg-indigo-100 text-indigo-800 border-indigo-200",
    };
    const labelMap = {
      open: "Open",
      under_investigation: "Under Investigation",
      awaiting_response: "Awaiting Response",
      resolved: "Resolved",
      closed: "Closed",
      refunded: "Refunded",
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
          styles[status] || styles.open
        }`}
      >
        {labelMap[status] || status}
      </span>
    );
  };

  const getEscrowBadge = (status) => {
    const styles = {
      held: "bg-gray-100 text-gray-700",
      frozen: "bg-red-100 text-red-700",
      released: "bg-green-100 text-green-700",
      refunded: "bg-indigo-100 text-indigo-700",
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[status] || styles.held}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-KE", {
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

  if (loading && disputes.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <RefreshCw className="w-10 h-10 text-[#11402D] animate-spin" />
          <p className="mt-4 text-gray-600">Loading disputes...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0E2A1C] flex items-center gap-2">
            <Scale className="w-6 h-6 text-[#11402D]" />
            Disputes
          </h1>
          <p className="text-sm text-gray-500">Manage and resolve payment disputes</p>
        </div>
        <button
          onClick={() => fetchDisputes(statusFilter)}
          className="mt-3 md:mt-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium hover:bg-gray-50 transition"
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
          <option value="open">Open</option>
          <option value="under_investigation">Under Investigation</option>
          <option value="awaiting_response">Awaiting Response</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
          <option value="refunded">Refunded</option>
        </select>
        <div className="ml-auto text-sm text-gray-500">
          {disputes.length} dispute{disputes.length !== 1 && "s"}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 mb-6">
          {error}
        </div>
      )}

      {disputes.length === 0 && !loading && !error ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Scale className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700">No disputes found</h3>
            <p className="text-gray-500 text-sm">
              {statusFilter
                ? `No ${statusFilter} disputes match your filter.`
                : "All disputes will appear here once opened."}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((dispute) => (
            <motion.div
              key={dispute.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Summary row */}
              <div
                className="p-5 flex flex-wrap items-center justify-between cursor-pointer hover:bg-gray-50/50 transition"
                onClick={() => toggleExpand(dispute.id)}
              >
                <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <span className="font-medium text-[#0E2A1C]">
                        #{dispute.id}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      KES {dispute.amount?.toFixed(2) || "—"}
                    </div>
                  </div>
                  <div className="truncate text-sm text-gray-600">
                    <User className="w-3.5 h-3.5 inline mr-1" />
                    {dispute.producer_name || "Producer"} vs{" "}
                    {dispute.supplier_name || "Supplier"}
                  </div>
                  <div>
                    {getStatusBadge(dispute.status)}
                    <span className="ml-2 text-xs text-gray-400">
                      Escrow: {getEscrowBadge(dispute.escrow_status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    {formatDate(dispute.created_at)}
                  </div>
                </div>
                <div className="ml-4 text-gray-400">
                  {expandedId === dispute.id ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </div>

              {/* Expanded details */}
              {expandedId === dispute.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-gray-100 p-5 bg-gray-50/50"
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Reason</h4>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">
                        {dispute.reason || "No reason provided"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Timeline</h4>
                      <ul className="space-y-1 text-sm text-gray-600 max-h-32 overflow-y-auto">
                        {dispute.timeline && dispute.timeline.length > 0 ? (
                          dispute.timeline.map((entry, idx) => (
                            <li key={idx} className="border-b border-gray-100 py-1">
                              <span className="text-xs text-gray-400">
                                {formatDate(entry.timestamp)}
                              </span>
                              : {entry.description}
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-400">No timeline entries</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {dispute.evidence && dispute.evidence.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Evidence</h4>
                      <div className="flex flex-wrap gap-2">
                        {dispute.evidence.map((file, idx) => (
                          <a
                            key={idx}
                            href={file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[#11402D] hover:underline flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3" />
                            Evidence #{idx + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status update */}
                  <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-gray-200 pt-4">
                    <span className="text-sm font-medium text-gray-700">Update status:</span>
                    <select
                      value={dispute.status}
                      onChange={(e) => updateDisputeStatus(dispute.id, e.target.value)}
                      disabled={updating === dispute.id}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-green-500 bg-white disabled:opacity-60"
                    >
                      <option value="open">Open</option>
                      <option value="under_investigation">Under Investigation</option>
                      <option value="awaiting_response">Awaiting Response</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                    {updating === dispute.id && (
                      <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />
                    )}
                    <button
                      onClick={() => window.open(`mailto:${dispute.producer_email || ""}`)}
                      className="ml-auto inline-flex items-center gap-1 text-sm text-[#11402D] hover:underline"
                      disabled={!dispute.producer_email}
                    >
                      Contact Producer
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}