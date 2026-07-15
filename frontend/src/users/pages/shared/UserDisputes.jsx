// src/users/pages/shared/UserDisputes.jsx
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Search,
  Plus,
  Eye,
  MessageCircle,
  FileText,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Lock,
  RefreshCw,
  Image,
  File,
  Upload,
  Download,
  Printer,
  Send,
  User,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// ─── API Base URL ──────────────────────────────────────────────
const API_URL =
  typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : typeof process !== "undefined" && process.env?.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL
    : "http://localhost:5000/api";

const API = axios.create({
  baseURL: API_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Toast component ────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: "bg-green-50 border-green-500 text-green-800",
    error: "bg-red-50 border-red-500 text-red-800",
    warning: "bg-yellow-50 border-yellow-500 text-yellow-800",
    info: "bg-blue-50 border-blue-500 text-blue-800",
  }[type] || "bg-gray-50 border-gray-500 text-gray-800";

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full p-4 rounded-lg border-l-4 shadow-lg ${bgColor} animate-slideIn`}>
      <div className="flex items-start">
        <div className="flex-1">{message}</div>
        <button onClick={onClose} className="ml-4 text-gray-500 hover:text-gray-700">
          <XCircle size={18} />
        </button>
      </div>
    </div>
  );
};

// ─── Helper: format date ──────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ─── Skeleton Loader ───────────────────────────────────────────
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
);

// ─── Main Component ────────────────────────────────────────────
const UserDisputes = () => {
  // ─── State ────────────────────────────────────────────────────
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    underReview: 0,
    resolved: 0,
    escrowHeld: 0,
    closed: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ status: "", escrow: "", role: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState(null);

  // ── Create form ──
  const [createForm, setCreateForm] = useState({
    paymentId: "",
    reason: "",
    description: "",
    priority: "medium",
    evidence: [],
  });
  const [createPreviewUrls, setCreatePreviewUrls] = useState([]);
  const [userPayments, setUserPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // ── View modal sub-states ──
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [resolutionForm, setResolutionForm] = useState({
    notes: "",
    decision: "",
    refundAmount: "",
    releasedAmount: "",
    finalStatus: "",
  });
  const [escrowStatus, setEscrowStatus] = useState({});

  // ── UI states ──
  const [toasts, setToasts] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // ─── API Calls ────────────────────────────────────────────────
  const fetchDisputes = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search: searchTerm || undefined,
        status: filters.status || undefined,
        escrow: filters.escrow || undefined,
        role: filters.role || undefined,
        page: currentPage,
        limit: pageSize,
      };
      const response = await API.get("/disputes", { params });
      const data = response.data;
      setDisputes(data.disputes || []);
      setStats(data.stats || { total: 0, open: 0, underReview: 0, resolved: 0, escrowHeld: 0, closed: 0 });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch disputes");
      addToast("error", "Failed to load disputes");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filters, currentPage, pageSize]);

  const fetchMyPayments = async () => {
    setLoadingPayments(true);
    try {
      const response = await API.get("/payments/my-payments");
      // Only show payments that are paid/completed and have an amount > 0
      const eligible = (response.data || []).filter(
        (p) => (p.status === "paid" || p.payment_status === "paid") && p.amount > 0
      );
      setUserPayments(eligible);
      if (eligible.length === 0) {
        addToast("info", "You have no completed payments to dispute.");
      }
    } catch (err) {
      addToast("error", "Failed to load your payments");
      setUserPayments([]);
    } finally {
      setLoadingPayments(false);
    }
  };

  const fetchDisputeDetails = async (id) => {
    try {
      const response = await API.get(`/disputes/${id}`);
      return response.data;
    } catch (err) {
      addToast("error", "Failed to load dispute details");
      return null;
    }
  };

  const createDispute = async (data) => {
    try {
      const response = await API.post("/disputes", data);
      addToast("success", "Dispute created successfully");
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create dispute";
      addToast("error", msg);
      throw err;
    }
  };

  const deleteDispute = async (id) => {
    if (!window.confirm("Are you sure you want to delete this dispute?")) return;
    try {
      await API.delete(`/disputes/${id}`);
      addToast("success", "Dispute deleted");
      fetchDisputes();
    } catch (err) {
      addToast("error", "Failed to delete dispute");
    }
  };

  const sendChatMessage = async (id, message) => {
    try {
      const response = await API.post(`/disputes/${id}/chat`, { message });
      setChatMessages((prev) => [...prev, response.data]);
      addToast("success", "Message sent");
    } catch (err) {
      addToast("error", "Failed to send message");
    }
  };

  const uploadEvidence = async (id, files) => {
    setUploading(true);
    try {
      const formData = new FormData();
      for (let file of files) {
        formData.append("evidence", file);
      }
      const response = await API.post(`/disputes/${id}/evidence`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setEvidenceFiles((prev) => [...prev, ...response.data.files]);
      addToast("success", "Evidence uploaded");
    } catch (err) {
      addToast("error", "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const resolveDispute = async (id, data) => {
    try {
      await API.post(`/disputes/${id}/resolve`, data);
      addToast("success", "Dispute resolved");
      fetchDisputes();
      if (viewModalOpen) fetchDisputeDetails(id).then(setSelectedDispute);
    } catch (err) {
      addToast("error", "Resolution failed");
    }
  };

  const releaseEscrow = async (id) => {
    try {
      await API.post(`/disputes/${id}/release`);
      addToast("success", "Escrow released");
      fetchDisputes();
    } catch (err) {
      addToast("error", "Release failed");
    }
  };

  const refundProducer = async (id) => {
    try {
      await API.post(`/disputes/${id}/refund`);
      addToast("success", "Refund processed");
      fetchDisputes();
    } catch (err) {
      addToast("error", "Refund failed");
    }
  };

  // ─── Toast helpers ────────────────────────────────────────────
  const addToast = (type, message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
  };
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // ─── Effects ──────────────────────────────────────────────────
  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      createPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [createPreviewUrls]);

  // ─── Handlers ─────────────────────────────────────────────────
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentSelect = (e) => {
    const paymentId = e.target.value;
    setCreateForm((prev) => ({ ...prev, paymentId }));
  };

  const handleCreateFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length) {
      const urls = files.map((file) => URL.createObjectURL(file));
      setCreatePreviewUrls((prev) => [...prev, ...urls]);
      setCreateForm((prev) => ({
        ...prev,
        evidence: [...prev.evidence, ...files],
      }));
    }
    e.target.value = "";
  };

  const removeCreateFile = (index) => {
    setCreateForm((prev) => ({
      ...prev,
      evidence: prev.evidence.filter((_, i) => i !== index),
    }));
    setCreatePreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createDispute(createForm);
      setCreateModalOpen(false);
      setCreateForm({ paymentId: "", reason: "", description: "", priority: "medium", evidence: [] });
      setCreatePreviewUrls([]);
      fetchDisputes();
    } catch (err) {
      // error already handled
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDispute = async (id) => {
    const data = await fetchDisputeDetails(id);
    if (data) {
      setSelectedDispute(data);
      setChatMessages(data.chat || []);
      setEvidenceFiles(data.evidence || []);
      setTimeline(data.timeline || []);
      setEscrowStatus(data.escrow || {});
      setResolutionForm({
        notes: data.resolution?.notes || "",
        decision: data.resolution?.decision || "",
        refundAmount: data.resolution?.refundAmount || "",
        releasedAmount: data.resolution?.releasedAmount || "",
        finalStatus: data.resolution?.finalStatus || "",
      });
      setViewModalOpen(true);
    }
  };

  const handleCloseView = () => {
    setViewModalOpen(false);
    setSelectedDispute(null);
    setChatMessages([]);
    setEvidenceFiles([]);
    setTimeline([]);
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage(selectedDispute.id, chatInput);
    setChatInput("");
  };

  const handleEvidenceUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length) uploadEvidence(selectedDispute.id, files);
    e.target.value = "";
  };

  const handleResolutionSave = async () => {
    await resolveDispute(selectedDispute.id, resolutionForm);
    const data = await fetchDisputeDetails(selectedDispute.id);
    if (data) setSelectedDispute(data);
  };

  const openCreateModal = () => {
    fetchMyPayments();
    setCreateModalOpen(true);
  };

  // ─── Render helpers ──────────────────────────────────────────
  const getStatusBadge = (status) => {
    const map = {
      open: "bg-yellow-100 text-yellow-800",
      under_review: "bg-blue-100 text-blue-800",
      awaiting_response: "bg-purple-100 text-purple-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800",
      refunded: "bg-indigo-100 text-indigo-800",
    };
    const label = status?.replace(/_/g, " ")?.toUpperCase() || status;
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || "bg-gray-100"}`}>{label}</span>;
  };

  const getEscrowBadge = (status) => {
    const map = {
      held: "bg-gray-100 text-gray-700",
      frozen: "bg-red-100 text-red-700",
      released: "bg-green-100 text-green-700",
      refunded: "bg-indigo-100 text-indigo-700",
    };
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${map[status] || "bg-gray-100"}`}>{status?.toUpperCase() || "—"}</span>;
  };

  // ─── Modals ────────────────────────────────────────────────────
  const CreateModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-fadeIn">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Dispute</h2>
          <button onClick={() => setCreateModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <XCircle size={24} />
          </button>
        </div>
        <form onSubmit={handleCreateSubmit}>
          <div className="space-y-4">
            {/* Payment selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Payment <span className="text-red-500">*</span>
              </label>
              {loadingPayments ? (
                <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                  <RefreshCw className="animate-spin" size={16} />
                  Loading your payments...
                </div>
              ) : userPayments.length === 0 ? (
                <div className="mt-1 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                  No eligible payments found. You need a completed payment to create a dispute.
                  <br />
                  <a href="/dashboard/marketplace" className="text-[#11402D] font-medium hover:underline">
                    Go to Marketplace →
                  </a>
                </div>
              ) : (
                <select
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#9CF06B] dark:bg-gray-800 dark:text-white"
                  value={createForm.paymentId}
                  onChange={handlePaymentSelect}
                  required
                >
                  <option value="">-- Select a payment --</option>
                  {userPayments.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.id} - KES {p.amount?.toFixed(2)} ({p.waste_type || "Waste"})
                    </option>
                  ))}
                </select>
              )}
              {createForm.paymentId && (
                <p className="mt-1 text-xs text-green-600">
                  ✓ Payment #{createForm.paymentId} selected
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="reason"
                required
                className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#9CF06B] dark:bg-gray-800 dark:text-white"
                value={createForm.reason}
                onChange={handleCreateInputChange}
                placeholder="e.g., Waste not delivered, Quality issue, Payment dispute"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <textarea
                name="description"
                rows="3"
                className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#9CF06B] dark:bg-gray-800 dark:text-white"
                value={createForm.description}
                onChange={handleCreateInputChange}
                placeholder="Provide details about the dispute..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
              <select
                name="priority"
                className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#9CF06B] dark:bg-gray-800 dark:text-white"
                value={createForm.priority}
                onChange={handleCreateInputChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Evidence (optional)</label>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <Upload size={16} className="mr-2" />
                  Choose Files
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleCreateFileChange}
                  />
                </label>
                {createForm.evidence.length > 0 && (
                  <span className="text-sm text-gray-500">{createForm.evidence.length} file(s) selected</span>
                )}
              </div>
              {createPreviewUrls.length > 0 && (
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {createPreviewUrls.map((url, idx) => (
                    <div key={idx} className="relative group border border-gray-200 rounded-lg overflow-hidden aspect-square">
                      <img src={url} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeCreateFile(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition"
                      >
                        <XCircle size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={() => setCreateModalOpen(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
              Cancel
            </button>
            <button type="submit" disabled={submitting || !createForm.paymentId} className="px-4 py-2 bg-[#11402D] text-white rounded-lg hover:bg-[#0E2A1C] disabled:opacity-50 flex items-center">
              {submitting ? <RefreshCw className="animate-spin mr-2" size={18} /> : <Plus size={18} className="mr-2" />}
              Create Dispute
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // ─── View Modal ──────────────────────────────────────────────────
  const ViewModal = () => {
    if (!selectedDispute) return null;
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isAdmin = user.role === "admin";

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto p-6 animate-fadeIn">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dispute #{selectedDispute.id}</h2>
              <div className="flex items-center space-x-2 mt-1">
                {getStatusBadge(selectedDispute.status)}
                <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(selectedDispute.createdAt)}</span>
              </div>
            </div>
            <button onClick={handleCloseView} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <XCircle size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Payment Details */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Payment Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-gray-500">Amount:</span>
                  <span className="font-medium">KES {selectedDispute.amount?.toFixed(2)}</span>
                  <span className="text-gray-500">Producer:</span>
                  <span>{selectedDispute.producer?.name || "—"}</span>
                  <span className="text-gray-500">Supplier:</span>
                  <span>{selectedDispute.supplier?.name || "—"}</span>
                  <span className="text-gray-500">Transporter:</span>
                  <span>{selectedDispute.transporter?.name || "—"}</span>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Timeline</h3>
                <div className="relative pl-4 border-l-2 border-[#11402D] dark:border-[#9CF06B] space-y-4">
                  {timeline.map((event, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-2 w-3 h-3 rounded-full bg-[#9CF06B] border-2 border-white dark:border-gray-900" />
                      <div className="ml-4">
                        <p className="text-sm text-gray-800 dark:text-gray-200">{event.description}</p>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span>{event.user}</span>
                          <span className="mx-1">·</span>
                          <span>{formatDate(event.timestamp)}</span>
                          {event.icon && <span className="ml-2">{event.icon}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evidence Gallery */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Evidence</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {evidenceFiles.map((file, idx) => (
                    <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-2 flex items-center justify-between">
                      <div className="flex items-center">
                        {file.type?.startsWith("image/") ? <Image size={20} className="text-[#11402D]" /> : <File size={20} className="text-gray-500" />}
                        <span className="ml-2 text-sm truncate">{file.name}</span>
                      </div>
                      <button className="text-gray-500 hover:text-gray-700">
                        <Download size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                {selectedDispute && (
                  <div className="mt-2">
                    <label className="cursor-pointer inline-flex items-center text-sm text-[#11402D] hover:text-[#0E2A1C]">
                      <Upload size={16} className="mr-1" />
                      Upload Evidence
                      <input type="file" multiple className="hidden" onChange={handleEvidenceUpload} />
                    </label>
                    {uploading && <RefreshCw className="animate-spin inline ml-2" size={16} />}
                  </div>
                )}
              </div>

              {/* Escrow Section */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Escrow</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-gray-500">Amount Held:</span>
                  <span>KES {escrowStatus.amountHeld?.toFixed(2) || "0.00"}</span>
                  <span className="text-gray-500">Platform Fee:</span>
                  <span>KES {escrowStatus.platformFee?.toFixed(2) || "0.00"}</span>
                  <span className="text-gray-500">Transport Fee:</span>
                  <span>KES {escrowStatus.transportFee?.toFixed(2) || "0.00"}</span>
                  <span className="text-gray-500">Supplier Amount:</span>
                  <span>KES {escrowStatus.supplierAmount?.toFixed(2) || "0.00"}</span>
                  <span className="text-gray-500">Status:</span>
                  {getEscrowBadge(escrowStatus.status)}
                </div>
                {isAdmin && escrowStatus.status === "held" && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={() => releaseEscrow(selectedDispute.id)} className="px-3 py-1 bg-[#11402D] text-white rounded-lg text-sm hover:bg-[#0E2A1C]">
                      Release Payment
                    </button>
                    <button onClick={() => refundProducer(selectedDispute.id)} className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
                      Refund Producer
                    </button>
                  </div>
                )}
                {!isAdmin && escrowStatus.status === "held" && (
                  <p className="text-sm text-gray-500 mt-2">Escrow is held pending admin review.</p>
                )}
              </div>

              {/* Admin Controls (only for admin) */}
              {isAdmin && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Admin Controls</h3>
                  <div className="flex flex-wrap gap-2">
                    <button className="px-3 py-1 bg-[#11402D] text-white rounded-lg text-sm hover:bg-[#0E2A1C]">Approve</button>
                    <button className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Reject</button>
                    <button className="px-3 py-1 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700">Escalate</button>
                    <button className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">Assign Moderator</button>
                    <button className="px-3 py-1 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700">Freeze</button>
                    <button className="px-3 py-1 bg-red-800 text-white rounded-lg text-sm hover:bg-red-900">Close</button>
                  </div>
                </div>
              )}

              {/* Resolution Section (admin only) */}
              {isAdmin && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Resolution</h3>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Resolution Notes"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white text-sm"
                      value={resolutionForm.notes}
                      onChange={(e) => setResolutionForm({ ...resolutionForm, notes: e.target.value })}
                    />
                    <select
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white text-sm"
                      value={resolutionForm.decision}
                      onChange={(e) => setResolutionForm({ ...resolutionForm, decision: e.target.value })}
                    >
                      <option value="">Select Decision</option>
                      <option value="refund">Refund</option>
                      <option value="release">Release Payment</option>
                      <option value="partial">Partial</option>
                    </select>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Refund Amount"
                        className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white text-sm"
                        value={resolutionForm.refundAmount}
                        onChange={(e) => setResolutionForm({ ...resolutionForm, refundAmount: e.target.value })}
                      />
                      <input
                        type="number"
                        placeholder="Released Amount"
                        className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white text-sm"
                        value={resolutionForm.releasedAmount}
                        onChange={(e) => setResolutionForm({ ...resolutionForm, releasedAmount: e.target.value })}
                      />
                    </div>
                    <button
                      onClick={handleResolutionSave}
                      className="w-full py-2 bg-[#11402D] text-white rounded-lg hover:bg-[#0E2A1C] transition"
                    >
                      Save Resolution
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right column: Chat */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 flex flex-col h-[500px]">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Live Chat</h3>
              <div className="flex-1 overflow-y-auto space-y-2 mb-3">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${msg.sender === "me" ? "bg-[#11402D] text-white" : "bg-gray-200 dark:bg-gray-700 dark:text-white"}`}>
                      <p>{msg.message}</p>
                      <span className="text-xs opacity-70">{formatDate(msg.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendChat} className="flex items-center space-x-2">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white text-sm"
                  placeholder="Type a message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <button type="submit" className="p-2 bg-[#11402D] text-white rounded-lg hover:bg-[#0E2A1C]">
                  <Send size={20} />
                </button>
              </form>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button onClick={handleCloseView} className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
              Close
            </button>
            <button className="px-4 py-2 bg-[#11402D] text-white rounded-lg hover:bg-[#0E2A1C] flex items-center">
              <Printer size={16} className="mr-1" />
              Print
            </button>
            <button className="px-4 py-2 bg-[#9CF06B] text-[#0E2A1C] rounded-lg hover:bg-[#86D45E] flex items-center">
              <Download size={16} className="mr-1" />
              Download PDF
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ─── Main Render ──────────────────────────────────────────────
  if (loading && !disputes.length) {
    return (
      <div className="min-h-screen bg-[#F6F8F4] dark:bg-gray-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8F4] dark:bg-gray-950 p-4 md:p-6 font-sans">
      {toasts.map((toast) => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
      ))}

      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 className="text-2xl md:text-3xl font-bold text-[#0E2A1C] dark:text-white">Disputes</h1>
            <button
              onClick={openCreateModal}
              className="mt-2 md:mt-0 inline-flex items-center px-4 py-2 bg-[#11402D] text-white rounded-lg hover:bg-[#0E2A1C] transition"
            >
              <Plus size={18} className="mr-2" />
              Create Dispute
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
            {[
              { label: "Total", value: stats.total, icon: AlertTriangle, color: "text-gray-400" },
              { label: "Open", value: stats.open, icon: Clock, color: "text-yellow-500" },
              { label: "Under Review", value: stats.underReview, icon: RefreshCw, color: "text-blue-500" },
              { label: "Resolved", value: stats.resolved, icon: CheckCircle, color: "text-green-500" },
              { label: "Escrow Held", value: stats.escrowHeld, icon: Lock, color: "text-purple-500" },
              { label: "Closed", value: stats.closed, icon: XCircle, color: "text-gray-500" },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">{stat.label}</span>
                    <Icon size={18} className={stat.color} />
                  </div>
                  <p className="text-2xl font-bold text-[#0E2A1C] dark:text-white">{stat.value}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mb-6 flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by payment ID, user, supplier, producer, status..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#9CF06B] outline-none"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="under_review">Under Review</option>
              <option value="awaiting_response">Waiting</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <select
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              value={filters.escrow}
              onChange={(e) => handleFilterChange("escrow", e.target.value)}
            >
              <option value="">Escrow Status</option>
              <option value="held">Held</option>
              <option value="frozen">Frozen</option>
              <option value="released">Released</option>
              <option value="refunded">Refunded</option>
            </select>
            <select
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              value={filters.role}
              onChange={(e) => handleFilterChange("role", e.target.value)}
            >
              <option value="">Role</option>
              <option value="producer">Producer</option>
              <option value="supplier">Supplier</option>
              <option value="transporter">Transporter</option>
            </select>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  {["ID", "Payment", "Producer", "Supplier", "Transporter", "Amount", "Status", "Escrow", "Created", "Actions"].map((header) => (
                    <th key={header} className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {disputes.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center">
                        <AlertTriangle size={40} className="text-gray-300 dark:text-gray-600 mb-2" />
                        <p>No disputes found</p>
                        <button onClick={openCreateModal} className="mt-2 text-[#11402D] hover:text-[#0E2A1C] text-sm font-medium">
                          Create Dispute
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  disputes.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition">
                      <td className="px-4 py-3 font-medium text-[#0E2A1C] dark:text-white">#{d.id}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{d.paymentId || "—"}</td>
                      <td className="px-4 py-3">{d.producer?.name || "—"}</td>
                      <td className="px-4 py-3">{d.supplier?.name || "—"}</td>
                      <td className="px-4 py-3">{d.transporter?.name || "—"}</td>
                      <td className="px-4 py-3 font-medium">KES {d.amount?.toFixed(2)}</td>
                      <td className="px-4 py-3">{getStatusBadge(d.status)}</td>
                      <td className="px-4 py-3">{getEscrowBadge(d.escrowStatus)}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{formatDate(d.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <button onClick={() => handleViewDispute(d.id)} className="text-[#11402D] hover:text-[#0E2A1C]" title="View">
                            <Eye size={16} />
                          </button>
                          <button className="text-gray-600 hover:text-gray-800" title="Chat">
                            <MessageCircle size={16} />
                          </button>
                          <button className="text-gray-600 hover:text-gray-800" title="Evidence">
                            <FileText size={16} />
                          </button>
                          <button onClick={() => deleteDispute(d.id)} className="text-red-600 hover:text-red-800" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>Showing {disputes.length} disputes</span>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
                Prev
              </button>
              <button className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setCurrentPage((p) => p + 1)}>
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {createModalOpen && <CreateModal />}
      {viewModalOpen && <ViewModal />}
    </div>
  );
};

export default UserDisputes;