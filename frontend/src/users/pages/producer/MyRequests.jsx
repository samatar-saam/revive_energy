// src/users/pages/producer/MyRequests.jsx
import { useState, useEffect } from "react";
import {
  Package,
  Search,
  Filter,
  ChevronDown,
  RefreshCw,
  Eye,
  XCircle,
  AlertCircle,
  Clock,
  CheckCircle,
  CreditCard,
  X,
  Smartphone,
} from "lucide-react";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function MyRequests() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [cancelling, setCancelling] = useState(null);

  const [showPayModal, setShowPayModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, searchQuery, filterStatus]);

  const getToken = () => localStorage.getItem("token");

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`${API_URL}/producer/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to load requests");
      }

      const safeData = Array.isArray(data) ? data : [];
      setRequests(safeData);
      setFilteredRequests(safeData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = [...requests];

    if (filterStatus !== "all") {
      filtered = filtered.filter((r) => r.status === filterStatus);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (r) =>
          r.waste_type?.toLowerCase().includes(q) ||
          r.supplier_name?.toLowerCase().includes(q) ||
          r.id?.toString().includes(q)
      );
    }

    setFilteredRequests(filtered);
  };

  const handleCancel = async (requestId) => {
    if (!confirm("Are you sure you want to cancel this request?")) return;

    setCancelling(requestId);

    try {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`${API_URL}/producer/requests/${requestId}/cancel`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to cancel request");
      }

      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: "cancelled" } : r))
      );

      toast.success("Request cancelled successfully");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCancelling(null);
    }
  };

  const openPayModal = (req) => {
    setSelectedRequest(req);
    setPhoneNumber("");
    setShowPayModal(true);
  };

  const openDetailsModal = (req) => {
    setSelectedRequest(req);
    setShowDetailsModal(true);
  };

  const closeModals = () => {
    setShowPayModal(false);
    setShowDetailsModal(false);
  };

  const normalizePhone = (phone) => {
    if (!phone) return "";
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, "");
    // If it starts with 0, replace with 254
    if (cleaned.startsWith("0")) {
      cleaned = "254" + cleaned.substring(1);
    }
    // If it starts with 7 or 1 and length is 9, add 254
    if (cleaned.length === 9 && (cleaned.startsWith("7") || cleaned.startsWith("1"))) {
      cleaned = "254" + cleaned;
    }
    // If it already starts with 254, keep it
    if (cleaned.startsWith("254") && cleaned.length === 12) {
      return cleaned;
    }
    // If it's 10 digits and starts with 07 or 01, we already handled that
    return cleaned;
  };

  const calculateAmounts = (req) => {
    const quantity = Number(req.quantity || 0);

    const wasteAmount = req.waste_amount
      ? Number(req.waste_amount)
      : Math.max(quantity * 10, 500);

    const transportFee = req.transport_fee
      ? Number(req.transport_fee)
      : Math.max(quantity * 2, 300);

    const platformFee = req.platform_fee
      ? Number(req.platform_fee)
      : Math.round((wasteAmount + transportFee) * 0.05);

    const totalAmount = wasteAmount + transportFee + platformFee;

    return {
      wasteAmount,
      transportFee,
      platformFee,
      totalAmount,
    };
  };

  const handlePayment = async () => {
    if (!selectedRequest) return;

    const normalizedPhone = normalizePhone(phoneNumber);

    if (!normalizedPhone) {
      toast.error("Enter M-Pesa phone number");
      return;
    }

    if (!/^254(7|1)\d{8}$/.test(normalizedPhone)) {
      toast.error("Use a valid M-Pesa number like 0727568271 or 254727568271");
      return;
    }

    const { wasteAmount, transportFee, platformFee, totalAmount } =
      calculateAmounts(selectedRequest);

    setPaying(true);

    try {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");

      const payload = {
        request_id: selectedRequest.id,
        listing_id: selectedRequest.listing_id,
        supplier_id: selectedRequest.supplier_id,
        amount: totalAmount,           // total amount to pay
        waste_amount: wasteAmount,
        transport_fee: transportFee,
        platform_fee: platformFee,
        total_amount: totalAmount,
        phone: normalizedPhone,
        description: `Payment for ${selectedRequest.waste_type || "waste request"}`,
      };

      console.log("📤 Payment payload:", payload);

      const response = await fetch(`${API_URL}/payments/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      console.log("📥 Payment response:", response.status, data);

      if (!response.ok) {
        // If the backend returns a specific error message, use it
        throw new Error(data.message || data.error || "Payment failed");
      }

      toast.success(data.message || "Payment request sent. Check your phone.");
      setShowPayModal(false);
      await fetchRequests(); // refresh list
    } catch (err) {
      console.error("❌ Payment error:", err);
      toast.error(err.message);
    } finally {
      setPaying(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
      cancelled: "bg-gray-100 text-gray-700",
      paid: "bg-blue-100 text-blue-700",
      assigned: "bg-blue-100 text-blue-700",
      in_transit: "bg-purple-100 text-purple-700",
      delivered: "bg-indigo-100 text-indigo-700",
      completed: "bg-gray-100 text-gray-700",
    };

    return map[status] || "bg-gray-100 text-gray-700";
  };

  const getStatusIcon = (status) => {
    if (status === "pending") return <Clock className="h-4 w-4" />;
    if (status === "approved") return <CheckCircle className="h-4 w-4" />;
    if (status === "rejected" || status === "cancelled") return <XCircle className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  const formatDate = (isoString) => {
    if (!isoString) return "N/A";

    return new Date(isoString).toLocaleDateString("en-KE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const statusOptions = [
    "all",
    "pending",
    "approved",
    "paid",
    "rejected",
    "assigned",
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
          <p className="mt-4 text-gray-500">Loading your requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
        <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
        <h3 className="text-xl font-bold text-red-700">Unable to Load Requests</h3>
        <p className="mt-2 text-red-600">{error}</p>
        <button
          onClick={fetchRequests}
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
          <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your waste requests and pay once approved
          </p>
        </div>

        <button
          onClick={fetchRequests}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Total" value={requests.length} />
        <Stat label="Pending" value={requests.filter((r) => r.status === "pending").length} color="text-yellow-600" />
        <Stat label="Approved" value={requests.filter((r) => r.status === "approved").length} color="text-green-600" />
        <Stat label="Completed" value={requests.filter((r) => ["delivered", "completed"].includes(r.status)).length} color="text-indigo-600" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by waste type, supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="appearance-none rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-8 text-sm focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            {statusOptions.filter((s) => s !== "all").map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ").toUpperCase()}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>

        <span className="text-sm text-gray-500">
          {filteredRequests.length} of {requests.length}
        </span>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="rounded-3xl border border-gray-100 bg-white p-12 text-center shadow-sm">
          <Package className="mx-auto mb-4 h-16 w-16 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-700">No requests found</h3>
          <p className="mt-2 text-gray-500">You have not made any waste requests yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Waste Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Supplier</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm text-gray-500">#{req.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{req.waste_type}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {req.quantity} {req.unit || "kg"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{req.supplier_name || "Unknown"}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(req.created_at)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadge(req.status)}`}>
                        {getStatusIcon(req.status)}
                        {req.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {req.status === "approved" && (
                          <button
                            onClick={() => openPayModal(req)}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#11402D] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0E2A1C]"
                          >
                            <CreditCard className="h-3.5 w-3.5" />
                            Pay Now
                          </button>
                        )}

                        {req.status === "pending" && (
                          <button
                            onClick={() => handleCancel(req.id)}
                            disabled={cancelling === req.id}
                            className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 disabled:opacity-50"
                          >
                            {cancelling === req.id ? "..." : "Cancel"}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => openDetailsModal(req)}
                          className="p-1.5 text-gray-400 hover:text-[#11402D]"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
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

      {showPayModal && selectedRequest && (
        <PaymentModal
          request={selectedRequest}
          amounts={calculateAmounts(selectedRequest)}
          phoneNumber={phoneNumber}
          setPhoneNumber={setPhoneNumber}
          paying={paying}
          onClose={closeModals}
          onPay={handlePayment}
        />
      )}

      {showDetailsModal && selectedRequest && (
        <DetailsModal
          request={selectedRequest}
          amounts={calculateAmounts(selectedRequest)}
          onClose={closeModals}
          onPay={() => {
            setShowDetailsModal(false);
            openPayModal(selectedRequest);
          }}
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

function PaymentModal({ request, amounts, phoneNumber, setPhoneNumber, paying, onClose, onPay }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Pay for Waste Request</h2>
            <p className="text-sm text-gray-500">Payment will be held in escrow</p>
          </div>

          <button onClick={onClose} className="rounded-xl p-2 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 rounded-2xl bg-gray-50 p-4 text-sm">
          <Row label="Waste Type" value={request.waste_type} />
          <Row label="Supplier" value={request.supplier_name || "Unknown"} />
          <Row label="Quantity" value={`${request.quantity} ${request.unit || "kg"}`} />
          <Row label="Waste Amount" value={`KES ${amounts.wasteAmount.toLocaleString()}`} />
          <Row label="Transport Fee" value={`KES ${amounts.transportFee.toLocaleString()}`} />
          <Row label="Platform Fee" value={`KES ${amounts.platformFee.toLocaleString()}`} />
          <div className="border-t border-gray-200 pt-3">
            <Row label="Total Amount" value={`KES ${amounts.totalAmount.toLocaleString()}`} strong />
          </div>
        </div>

        <div className="mt-5">
          <label className="mb-1 block text-sm font-bold text-gray-700">M-Pesa Phone Number</label>
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
            <Smartphone className="h-4 w-4 text-gray-400" />
            <input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="2547XXXXXXXX"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        <button
          onClick={onPay}
          disabled={paying}
          className="mt-5 w-full rounded-xl bg-[#11402D] py-3 font-bold text-white hover:bg-[#0E2A1C] disabled:opacity-60"
        >
          {paying ? "Sending M-Pesa Prompt..." : "Confirm Payment"}
        </button>
      </div>
    </div>
  );
}

function DetailsModal({ request, amounts, onClose, onPay }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Request Details</h2>
            <p className="text-sm text-gray-500">Waste request information</p>
          </div>

          <button onClick={onClose} className="rounded-xl p-2 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 rounded-2xl bg-gray-50 p-4 text-sm">
          <Row label="Request ID" value={`#${request.id}`} />
          <Row label="Waste Type" value={request.waste_type} />
          <Row label="Supplier" value={request.supplier_name || "Unknown"} />
          <Row label="Supplier Location" value={request.supplier_location || "N/A"} />
          <Row label="Quantity" value={`${request.quantity} ${request.unit || "kg"}`} />
          <Row label="Status" value={request.status} />
          <Row label="Message" value={request.message || "No message"} />
          <Row label="Waste Amount" value={`KES ${amounts.wasteAmount.toLocaleString()}`} />
          <Row label="Transport Fee" value={`KES ${amounts.transportFee.toLocaleString()}`} />
          <Row label="Platform Fee" value={`KES ${amounts.platformFee.toLocaleString()}`} />
          <div className="border-t border-gray-200 pt-3">
            <Row label="Total Amount" value={`KES ${amounts.totalAmount.toLocaleString()}`} strong />
          </div>
        </div>

        {request.status === "approved" && (
          <button
            onClick={onPay}
            className="mt-5 w-full rounded-xl bg-[#11402D] py-3 font-bold text-white hover:bg-[#0E2A1C]"
          >
            Pay This Request
          </button>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, strong }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-gray-500">{label}</span>
      <span className={strong ? "font-bold text-gray-900" : "font-medium text-gray-800"}>
        {value}
      </span>
    </div>
  );
}