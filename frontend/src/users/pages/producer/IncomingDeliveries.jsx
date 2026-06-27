// src/users/pages/producer/IncomingDeliveries.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Truck,
  Package,
  MapPin,
  Search,
  Filter,
  ChevronDown,
  RefreshCw,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Building2,
  ShieldCheck,
  CreditCard,
  Route,
  X,
  Loader,
} from "lucide-react";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function IncomingDeliveries() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deliveries, setDeliveries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // ─── Modal states ────────────────────────────────────────
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const fetchDeliveries = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`${API_URL}/producer/incoming-deliveries`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to load deliveries");
      }

      setDeliveries(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const filteredDeliveries = useMemo(() => {
    let filtered = [...deliveries];

    if (filterStatus !== "all") {
      filtered = filtered.filter((item) => item.status === filterStatus);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((item) =>
        [
          item.waste_type,
          item.supplier_name,
          item.transporter_name,
          item.pickup_location,
          item.delivery_location,
          item.status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }

    return filtered;
  }, [deliveries, searchQuery, filterStatus]);

  const getStatusBadge = (status) => {
    const map = {
      open: "bg-gray-100 text-gray-700",
      accepted: "bg-blue-100 text-blue-700",
      picked_up: "bg-purple-100 text-purple-700",
      in_transit: "bg-yellow-100 text-yellow-700",
      delivered: "bg-green-100 text-green-700",
      completed: "bg-indigo-100 text-indigo-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return map[status] || "bg-gray-100 text-gray-700";
  };

  const getStatusIcon = (status) => {
    if (status === "delivered" || status === "completed") return <CheckCircle className="h-4 w-4" />;
    if (status === "cancelled") return <AlertCircle className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    return new Date(isoString).toLocaleDateString("en-KE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatStatus = (status) => {
    if (!status) return "Unknown";
    return status.replaceAll("_", " ");
  };

  const formatCurrency = (amount) =>
    `KSh ${Number(amount || 0).toLocaleString("en-KE")}`;

  // ─── Handlers ─────────────────────────────────────────────
  const openDetailsModal = (delivery) => {
    setSelectedDelivery(delivery);
    setShowDetailsModal(true);
  };

  const openConfirmModal = (delivery) => {
    setSelectedDelivery(delivery);
    setShowConfirmModal(true);
  };

  const closeModals = () => {
    setShowDetailsModal(false);
    setShowConfirmModal(false);
    setSelectedDelivery(null);
  };

  const handleConfirmDelivery = async () => {
    if (!selectedDelivery) return;
    setConfirming(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      const paymentId = selectedDelivery.payment_id;
      if (!paymentId) {
        throw new Error("No payment associated with this delivery");
      }

      const response = await fetch(`${API_URL}/payments/confirm-delivery/${paymentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to confirm delivery");
      }

      toast.success("Delivery confirmed! Escrow has been released.");
      setShowConfirmModal(false);
      await fetchDeliveries();
    } catch (err) {
      console.error("Confirm delivery error:", err);
      toast.error(err.message);
    } finally {
      setConfirming(false);
    }
  };

  const statusOptions = [
    "all",
    "open",
    "accepted",
    "picked_up",
    "in_transit",
    "delivered",
    "completed",
    "cancelled",
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-[#11402D] border-t-[#9CF06B]" />
          <p className="mt-4 text-gray-500">Loading deliveries...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
        <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
        <h3 className="text-xl font-bold text-red-700">Unable to Load Deliveries</h3>
        <p className="mt-2 text-red-600">{error}</p>
        <button
          onClick={fetchDeliveries}
          className="mt-6 rounded-xl bg-red-600 px-6 py-3 font-medium text-white hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Incoming Deliveries</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track deliveries after your payment is secured in escrow
          </p>
        </div>

        <button
          onClick={fetchDeliveries}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Total" value={deliveries.length} />
        <Stat
          label="In Transit"
          value={deliveries.filter((d) => d.status === "in_transit" || d.status === "picked_up").length}
          color="text-yellow-600"
        />
        <Stat
          label="Delivered"
          value={deliveries.filter((d) => d.status === "delivered").length}
          color="text-green-600"
        />
        <Stat
          label="Completed"
          value={deliveries.filter((d) => d.status === "completed").length}
          color="text-indigo-600"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by waste, supplier, transporter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-8 text-sm outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              {statusOptions.filter((s) => s !== "all").map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status).toUpperCase()}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>

          <span className="text-sm text-gray-500">
            {filteredDeliveries.length} of {deliveries.length}
          </span>
        </div>
      </div>

      {filteredDeliveries.length === 0 ? (
        <div className="rounded-3xl border border-gray-100 bg-white p-12 text-center shadow-sm">
          <Truck className="mx-auto mb-4 h-16 w-16 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-700">No deliveries found</h3>
          <p className="mt-2 text-gray-500">
            Your paid and assigned deliveries will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {filteredDeliveries.map((delivery) => (
            <div
              key={delivery.id}
              className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#11402D]/10">
                    <Truck className="h-6 w-6 text-[#11402D]" />
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900">
                      {delivery.waste_type || "Incoming Waste"}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Delivery #{delivery.id} · {formatDate(delivery.created_at)}
                    </p>
                  </div>
                </div>

                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${getStatusBadge(delivery.status)}`}>
                  {getStatusIcon(delivery.status)}
                  {formatStatus(delivery.status)}
                </span>
              </div>

              <div className="mt-4 rounded-2xl bg-green-50 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-green-700">
                  <ShieldCheck className="h-4 w-4" />
                  Escrow Secured
                </div>
                <p className="mt-1 text-xs text-green-700">
                  Supplier and transporter payments remain protected until delivery is confirmed.
                </p>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <Info icon={Package} label="Quantity" value={`${delivery.quantity || "N/A"} ${delivery.unit || "kg"}`} />
                <Info icon={CreditCard} label="Transport Fee" value={formatCurrency(delivery.transport_fee || delivery.estimated_earnings || 0)} />
                <Info icon={Building2} label="Supplier" value={delivery.supplier_name || "Unknown Supplier"} />
                <Info icon={User} label="Transporter" value={delivery.transporter_name || "Not assigned"} />
                <Info icon={MapPin} label="Pickup" value={delivery.pickup_location || "Not specified"} />
                <Info icon={MapPin} label="Delivery" value={delivery.delivery_location || "Not specified"} />
              </div>

              <ProgressTimeline status={delivery.status} />

              <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                  <Route className="h-4 w-4 text-[#11402D]" />
                  Delivery Route
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {delivery.pickup_location || "Pickup location"} → {delivery.delivery_location || "Delivery location"}
                </p>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => openDetailsModal(delivery)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50"
                >
                  <Eye className="h-4 w-4" />
                  Details
                </button>

                {delivery.status === "delivered" ? (
                  <button
                    onClick={() => openConfirmModal(delivery)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-sm font-bold text-white hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Confirm Delivery
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-100 py-3 text-sm font-bold text-gray-400"
                  >
                    Waiting
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Details Modal ──────────────────────────────────────── */}
      {showDetailsModal && selectedDelivery && (
        <DetailsModal
          delivery={selectedDelivery}
          onClose={closeModals}
          formatDate={formatDate}
          formatCurrency={formatCurrency}
          formatStatus={formatStatus}
        />
      )}

      {/* ─── Confirm Modal ──────────────────────────────────────── */}
      {showConfirmModal && selectedDelivery && (
        <ConfirmModal
          delivery={selectedDelivery}
          onClose={closeModals}
          onConfirm={handleConfirmDelivery}
          confirming={confirming}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
}

function Stat({ label, value, color = "text-gray-900" }) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-gray-50 p-4">
      <Icon className="mt-0.5 h-5 w-5 text-[#11402D]" />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          {label}
        </p>
        <p className="mt-1 truncate text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function ProgressTimeline({ status }) {
  const steps = [
    { key: "open", label: "Created" },
    { key: "accepted", label: "Assigned" },
    { key: "picked_up", label: "Picked Up" },
    { key: "in_transit", label: "In Transit" },
    { key: "delivered", label: "Delivered" },
    { key: "completed", label: "Confirmed" },
  ];

  const currentIndex = steps.findIndex((step) => step.key === status);

  return (
    <div className="mt-5 rounded-2xl border border-gray-100 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-800">
        <Clock className="h-4 w-4 text-[#11402D]" />
        Delivery Progress
      </div>

      <div className="flex flex-wrap gap-2">
        {steps.map((step, index) => {
          const active = index <= currentIndex;
          return (
            <div
              key={step.key}
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                active ? "bg-[#11402D] text-white" : "bg-gray-100 text-gray-400"
              }`}
            >
              {step.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Details Modal ──────────────────────────────────────────────
function DetailsModal({ delivery, onClose, formatDate, formatCurrency, formatStatus }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-xl font-bold text-gray-900">Delivery Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Detail label="Delivery ID" value={`#${delivery.id}`} />
              <Detail label="Waste Type" value={delivery.waste_type || "N/A"} />
              <Detail label="Quantity" value={`${delivery.quantity || "N/A"} ${delivery.unit || "kg"}`} />
              <Detail label="Status" value={formatStatus(delivery.status)} badge />
            </div>
            <div className="space-y-2">
              <Detail label="Supplier" value={delivery.supplier_name || "Unknown"} />
              <Detail label="Transporter" value={delivery.transporter_name || "Not assigned"} />
              <Detail label="Transport Fee" value={formatCurrency(delivery.transport_fee || 0)} />
              <Detail label="Date" value={formatDate(delivery.created_at)} />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h4 className="font-semibold text-gray-700 mb-2">Route</h4>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Pickup:</span> {delivery.pickup_location || "Not specified"}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Delivery:</span> {delivery.delivery_location || "Not specified"}
            </p>
          </div>

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
}

// ─── Confirm Modal ──────────────────────────────────────────────
function ConfirmModal({ delivery, onClose, onConfirm, confirming, formatCurrency }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Confirm Delivery</h3>
          <p className="text-sm text-gray-500 mt-2">
            Are you sure you want to confirm delivery of <strong>{delivery.waste_type}</strong>?
            <br />
            This will release escrow payments to the supplier and transporter.
          </p>
          <div className="mt-4 bg-gray-50 rounded-xl p-4 text-sm">
            <p className="font-semibold text-gray-700">Amount to be released:</p>
            <p className="text-2xl font-bold text-[#11402D] mt-1">
              {formatCurrency(delivery.transport_fee || 0)}
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 font-semibold text-gray-700 hover:bg-gray-50"
            disabled={confirming}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={confirming}
            className="flex-1 py-3 rounded-xl bg-[#11402D] text-white font-semibold hover:bg-[#0E2A1C] transition disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {confirming ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Confirming...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Confirm
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value, badge }) {
  if (badge) {
    return (
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">{label}</span>
        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          {value}
        </span>
      </div>
    );
  }
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm text-gray-800">{value}</span>
    </div>
  );
}