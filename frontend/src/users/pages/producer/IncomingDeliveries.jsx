// src/users/pages/producer/IncomingDeliveries.jsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  Marker,
  Popup,
  Polyline,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import {
  Truck,
  MapPin,
  Package,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  Clock,
  ShieldCheck,
  CreditCard,
  Building2,
  User,
  Search,
  Eye,
  X,
  Calendar,
  Phone,
  Navigation,
  Check,
  AlertTriangle,
  Download,
  Star,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ─── Leaflet icon fix ──────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const transporterIcon = new L.DivIcon({
  className: "",
  html: `
    <div style="
      width:42px;
      height:42px;
      border-radius:50%;
      background:#11402D;
      color:white;
      display:flex;
      align-items:center;
      justify-content:center;
      border:4px solid white;
      box-shadow:0 5px 15px rgba(0,0,0,.25);
      font-size:20px;
    ">
      🚚
    </div>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 21],
});

const pickupIcon = new L.DivIcon({
  className: "",
  html: `
    <div style="
      width:34px;
      height:34px;
      border-radius:50%;
      background:#f59e0b;
      color:white;
      display:flex;
      align-items:center;
      justify-content:center;
      border:3px solid white;
      box-shadow:0 4px 12px rgba(0,0,0,.2);
      font-size:15px;
    ">
      P
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const destinationIcon = new L.DivIcon({
  className: "",
  html: `
    <div style="
      width:34px;
      height:34px;
      border-radius:50%;
      background:#2563eb;
      color:white;
      display:flex;
      align-items:center;
      justify-content:center;
      border:3px solid white;
      box-shadow:0 4px 12px rgba(0,0,0,.2);
      font-size:15px;
    ">
      D
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

// ─── Helpers ──────────────────────────────────────────────────
function formatDate(isoString) {
  if (!isoString) return "N/A";
  return new Date(isoString).toLocaleDateString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(amount) {
  return `KSh ${Number(amount || 0).toLocaleString("en-KE")}`;
}

function getStatusBadge(status) {
  const map = {
    open: "bg-yellow-100 text-yellow-700",
    accepted: "bg-blue-100 text-blue-700",
    picked_up: "bg-purple-100 text-purple-700",
    in_transit: "bg-indigo-100 text-indigo-700",
    delivered: "bg-green-100 text-green-700",
    awaiting_confirmation: "bg-orange-100 text-orange-700",
    completed: "bg-gray-100 text-gray-700",
    cancelled: "bg-red-100 text-red-700",
  };
  return map[status] || "bg-gray-100 text-gray-700";
}

function getStatusLabel(status) {
  const map = {
    open: "Awaiting Pickup",
    accepted: "Assigned",
    picked_up: "Picked Up",
    in_transit: "In Transit",
    delivered: "Delivered",
    awaiting_confirmation: "Awaiting Confirmation",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return map[status] || status;
}

function RecenterMap({ currentLocation, pickup, delivery }) {
  const map = useMap();
  useEffect(() => {
    const points = [];
    if (currentLocation) {
      points.push([currentLocation.latitude, currentLocation.longitude]);
    }
    if (pickup?.latitude != null && pickup?.longitude != null) {
      points.push([pickup.latitude, pickup.longitude]);
    }
    if (delivery?.latitude != null && delivery?.longitude != null) {
      points.push([delivery.latitude, delivery.longitude]);
    }
    if (points.length === 1) {
      map.setView(points[0], 14);
    } else if (points.length > 1) {
      map.fitBounds(points, { padding: [40, 40] });
    }
  }, [map, currentLocation, pickup, delivery]);
  return null;
}

export default function IncomingDeliveries() {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const getToken = () => localStorage.getItem("token");

  const fetchDeliveries = async () => {
    setLoading(true);
    setError("");

    try {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(`${API_URL}/producer/incoming-deliveries`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to load incoming deliveries");

      const jobs = Array.isArray(data) ? data : data.data || [];
      setDeliveries(jobs);
    } catch (err) {
      setError(err.message || "Something went wrong");
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
      filtered = filtered.filter((d) => d.status === filterStatus);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((d) =>
        [
          d.waste_type,
          d.supplier_name,
          d.transporter_name,
          d.pickup_location,
          d.delivery_location,
          d.id,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }
    return filtered;
  }, [deliveries, searchQuery, filterStatus]);

  const stats = useMemo(() => {
    const total = deliveries.length;
    const inTransit = deliveries.filter((d) => d.status === "in_transit").length;
    const awaitingPickup = deliveries.filter((d) => d.status === "open" || d.status === "accepted").length;
    const delivered = deliveries.filter((d) => d.status === "delivered" || d.status === "completed").length;
    return { total, inTransit, awaitingPickup, delivered };
  }, [deliveries]);

  const openDetails = (delivery) => {
    setSelectedDelivery(delivery);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDelivery(null);
  };

  // ─── Action Handlers ──────────────────────────────────────────

  const handleTrackLive = (deliveryId) => {
    navigate(`/dashboard/routes/${deliveryId}`);
  };

  const handleContact = (phone) => {
    if (!phone) {
      toast.info("No phone number available.");
      return;
    }
    const cleanPhone = phone.replace(/\s/g, "").replace(/^0/, "254");
    window.location.href = `tel:${cleanPhone}`;
  };

  const handleChat = (deliveryId, transporterId) => {
    if (!transporterId) {
      toast.info("Transporter not assigned yet.");
      return;
    }
    navigate(`/dashboard/messages?transporter=${transporterId}&job=${deliveryId}`);
  };

  const handleConfirmDelivery = async (deliveryId) => {
    setActionLoading(true);
    try {
      const token = getToken();
      
      let res = await fetch(`${API_URL}/producer/deliveries/${deliveryId}/confirm`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok && res.status === 404) {
        res = await fetch(`${API_URL}/tracking/jobs/${deliveryId}/confirm`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "awaiting_confirmation" }),
        });
      }

      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to confirm delivery. Please try again.");
      }

      toast.success("✅ Delivery confirmed! Admin will release payment shortly.");
      await fetchDeliveries();
      closeModal();
    } catch (err) {
      toast.error(err.message || "Failed to confirm delivery. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReportIssue = (deliveryId) => {
    navigate(`/dashboard/support?type=delivery&id=${deliveryId}&reason=delivery_issue`);
    toast.info("Opening support ticket for this delivery...");
    closeModal();
  };

  const handleDownloadReceipt = async (deliveryId) => {
    setActionLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/producer/deliveries/${deliveryId}/receipt`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const altRes = await fetch(`${API_URL}/payments/receipt/${deliveryId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!altRes.ok) {
          throw new Error("Failed to generate receipt");
        }
        const data = await altRes.json();
        toast.success("Receipt ready!");
        console.log("Receipt data:", data);
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${deliveryId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Receipt downloaded!");
    } catch (err) {
      toast.error(err.message || "Could not download receipt");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRateSupplier = async (deliveryId, supplierId, rating) => {
    if (!supplierId) {
      toast.error("Unable to identify supplier for rating.");
      return;
    }

    setActionLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/ratings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          supplier_id: supplierId,
          delivery_id: deliveryId,
          rating: rating,
          review: `Rating ${rating} stars for delivery #${deliveryId}`,
        }),
      });

      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        const altRes = await fetch(`${API_URL}/supplier/${supplierId}/rate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rating, delivery_id: deliveryId }),
        });
        if (!altRes.ok) {
          throw new Error(data.message || "Failed to submit rating");
        }
      }

      toast.success(`⭐ ${rating} star rating submitted!`);
    } catch (err) {
      toast.error(err.message || "Failed to submit rating");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-[#11402D] border-t-[#9CF06B]" />
          <p className="mt-4 text-sm text-gray-500">Loading incoming deliveries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Inter']">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono-cw { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
        {/* ─── Header ───────────────────────────────────────────── */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="font-display text-2xl lg:text-3xl font-bold text-[#0E2A1C]">Incoming Deliveries</h1>
              <p className="mt-1 text-sm text-[#5A7060]">
                Track every paid waste shipment from pickup until delivery.
              </p>
            </div>
            <button
              onClick={fetchDeliveries}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* ─── Stats ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat label="Total Deliveries" value={stats.total} icon={Package} />
          <Stat label="In Transit" value={stats.inTransit} icon={Navigation} color="text-indigo-600" />
          <Stat label="Awaiting Pickup" value={stats.awaitingPickup} icon={Clock} color="text-yellow-600" />
          <Stat label="Delivered" value={stats.delivered} icon={CheckCircle} color="text-green-600" />
        </div>

        {/* ─── Search & Filter ──────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by waste type, supplier, transporter..."
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              <option value="open">Awaiting Pickup</option>
              <option value="accepted">Assigned</option>
              <option value="picked_up">Picked Up</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="awaiting_confirmation">Awaiting Confirmation</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        {!error && filteredDeliveries.length === 0 && (
          <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <Truck className="mx-auto h-16 w-16 text-[#11402D]" />
            <h2 className="mt-4 font-display text-xl font-bold text-gray-900">No incoming deliveries</h2>
            <p className="mx-auto mt-2 max-w-md text-[#5A7060]">
              Once you pay for an approved waste request, it will appear here for live tracking.
            </p>
          </div>
        )}

        {/* ─── Table ────────────────────────────────────────────── */}
        {filteredDeliveries.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Waste Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Supplier</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Transporter</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Pickup</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Destination</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Created</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDeliveries.map((delivery) => (
                    <tr key={delivery.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-4 py-3 font-mono-cw text-sm text-gray-500">#{delivery.id}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{delivery.waste_type}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{delivery.supplier_name || "Unknown"}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{delivery.transporter_name || "Not assigned"}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{delivery.quantity} {delivery.unit || "kg"}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{delivery.pickup_location || "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{delivery.delivery_location || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${getStatusBadge(delivery.status)}`}>
                          {getStatusLabel(delivery.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(delivery.created_at)}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => openDetails(delivery)}
                          className="p-1.5 text-gray-400 hover:text-[#11402D] transition rounded-lg hover:bg-gray-100"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ─── Detail Modal ──────────────────────────────────────── */}
      {showModal && selectedDelivery && (
        <DetailModal
          delivery={selectedDelivery}
          onClose={closeModal}
          onTrackLive={handleTrackLive}   // kept for other buttons? Actually we'll not use it in the modal.
          onContact={handleContact}
          onChat={handleChat}
          onConfirmDelivery={handleConfirmDelivery}
          onReport={handleReportIssue}
          onDownloadReceipt={handleDownloadReceipt}
          onRate={handleRateSupplier}
          actionLoading={actionLoading}
        />
      )}
    </div>
  );
}

function Stat({ label, value, icon: Icon, color = "text-gray-900" }) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-[#5A7060]">{label}</p>
          <p className={`mt-1 font-display text-xl font-bold ${color}`}>{value}</p>
        </div>
        <Icon className={`h-7 w-7 ${color}`} />
      </div>
    </div>
  );
}

// ─── Detail Modal with Map ────────────────────────────────────

function DetailModal({
  delivery,
  onClose,
  onContact,
  onChat,
  onConfirmDelivery,
  onReport,
  onDownloadReceipt,
  onRate,
  actionLoading,
}) {
  const [activeTab, setActiveTab] = useState("tracking");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // ─── Map state ──────────────────────────────────────────────
  const [locationData, setLocationData] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);

  // ─── Fetch location data when modal opens ──────────────────
  useEffect(() => {
    if (delivery?.id) {
      fetchLocationData();
    }
  }, [delivery]);

  const fetchLocationData = async () => {
    setMapLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${API_URL}/tracking/jobs/${delivery.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setLocationData(data);
        toast.info("Location data refreshed");
      } else {
        toast.warning("Could not fetch location data");
      }
    } catch (err) {
      console.error("Failed to fetch location data:", err);
      toast.error("Error loading location data");
    } finally {
      setMapLoading(false);
    }
  };

  const handleRateSubmit = async (value) => {
    if (submitting || actionLoading) return;
    setSubmitting(true);
    try {
      await onRate(delivery.id, delivery.supplier_id, value);
      setRating(value);
    } catch (err) {
      // error handled inside onRate
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Map data ───────────────────────────────────────────────
  const currentPosition =
    locationData?.current_location?.latitude != null &&
    locationData?.current_location?.longitude != null
      ? [locationData.current_location.latitude, locationData.current_location.longitude]
      : null;

  const pickupPosition =
    delivery.pickup_latitude != null && delivery.pickup_longitude != null
      ? [delivery.pickup_latitude, delivery.pickup_longitude]
      : null;

  const deliveryPosition =
    delivery.delivery_latitude != null && delivery.delivery_longitude != null
      ? [delivery.delivery_latitude, delivery.delivery_longitude]
      : null;

  const mapCenter =
    currentPosition || pickupPosition || deliveryPosition || [-1.286389, 36.817223];

  // ─── Call Supplier Handler ────────────────────────────────────
  const handleCallSupplier = () => {
    const phone = delivery.supplier_phone || delivery.supplier?.phone;
    if (!phone) {
      toast.info("No phone number available for this supplier.");
      return;
    }
    const cleanPhone = phone.replace(/\s/g, "").replace(/^0/, "254");
    window.location.href = `tel:${cleanPhone}`;
  };

  const handleCallTransporter = () => {
    const phone = delivery.transporter_phone || delivery.transporter?.phone;
    if (!phone) {
      toast.info("No phone number available for this transporter.");
      return;
    }
    const cleanPhone = phone.replace(/\s/g, "").replace(/^0/, "254");
    window.location.href = `tel:${cleanPhone}`;
  };

  const steps = [
    { key: "open", label: "Awaiting Pickup" },
    { key: "accepted", label: "Assigned" },
    { key: "picked_up", label: "Picked Up" },
    { key: "in_transit", label: "In Transit" },
    { key: "delivered", label: "Delivered" },
    { key: "awaiting_confirmation", label: "Awaiting Confirmation" },
    { key: "completed", label: "Completed" },
  ];
  const currentIndex = steps.findIndex((s) => s.key === delivery.status);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/50 backdrop-blur-sm">
      <div className="relative h-full w-full max-w-5xl bg-white shadow-2xl overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-gray-900">Delivery Details</h2>
            <p className="text-sm text-gray-500 font-mono-cw">Job #{delivery.id}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Top info grid */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-2xl p-4">
            <div>
              <p className="text-xs text-gray-400">Waste Type</p>
              <p className="font-display font-semibold">{delivery.waste_type}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Quantity</p>
              <p className="font-display font-semibold">{delivery.quantity} {delivery.unit || "kg"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Status</p>
              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${getStatusBadge(delivery.status)}`}>
                {getStatusLabel(delivery.status)}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-400">Created</p>
              <p className="font-display font-semibold">{formatDate(delivery.created_at)}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-100">
            {["tracking", "details", "escrow"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-display font-medium border-b-2 transition ${
                  activeTab === tab
                    ? "border-[#11402D] text-[#11402D]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="space-y-6">
            {activeTab === "tracking" && (
              <>
                <div className="bg-[#11402D]/5 rounded-2xl p-5 border border-[#11402D]/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Truck className="h-5 w-5 text-[#11402D]" />
                      <h3 className="font-display font-semibold text-[#0E2A1C]">Live Tracking</h3>
                    </div>
                    {/* ─── Changed: Refresh button instead of navigate ─── */}
                    <button
                      onClick={fetchLocationData}
                      disabled={mapLoading}
                      className="bg-[#11402D] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#0E2A1C] transition flex items-center gap-1 disabled:opacity-50"
                    >
                      {mapLoading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Navigation className="h-3.5 w-3.5" />
                          Refresh Location
                        </>
                      )}
                    </button>
                  </div>

                  {/* ─── Map ────────────────────────────────────── */}
                  <div className="mt-3 h-64 rounded-xl overflow-hidden border border-gray-200">
                    {mapLoading ? (
                      <div className="flex items-center justify-center h-full bg-gray-100">
                        <div className="text-center">
                          <div className="w-8 h-8 border-4 border-[#11402D] border-t-[#9CF06B] rounded-full animate-spin mx-auto" />
                          <p className="mt-2 text-xs text-gray-500">Loading map...</p>
                        </div>
                      </div>
                    ) : (
                      <MapContainer center={mapCenter} zoom={13} scrollWheelZoom className="h-full w-full">
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <RecenterMap
                          currentLocation={locationData?.current_location}
                          pickup={delivery.pickup_location}
                          delivery={delivery.delivery_location}
                        />
                        {pickupPosition && (
                          <Marker position={pickupPosition} icon={pickupIcon}>
                            <Popup>
                              <strong>Pickup Location</strong>
                              <br />
                              {delivery.pickup_location?.name || "Pickup"}
                            </Popup>
                          </Marker>
                        )}
                        {deliveryPosition && (
                          <Marker position={deliveryPosition} icon={destinationIcon}>
                            <Popup>
                              <strong>Delivery Location</strong>
                              <br />
                              {delivery.delivery_location?.name || "Delivery"}
                            </Popup>
                          </Marker>
                        )}
                        {currentPosition && (
                          <Marker position={currentPosition} icon={transporterIcon}>
                            <Popup>
                              <strong>{delivery.transporter_name || "Transporter"}</strong>
                              <br />
                              Vehicle is currently here
                            </Popup>
                          </Marker>
                        )}
                      </MapContainer>
                    )}
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 inline-block bg-[#11402D] rounded-full" /> Transporter
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 inline-block bg-yellow-500 rounded-full" /> Pickup
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 inline-block bg-blue-500 rounded-full" /> Delivery
                      </span>
                    </div>
                    <span>
                      Updated {locationData?.current_location?.updated_at ? formatDate(locationData.current_location.updated_at) : "N/A"}
                    </span>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h3 className="font-display font-semibold text-gray-900 mb-3">Timeline</h3>
                  <div className="space-y-0 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 pl-6">
                    {steps.map((step, idx) => (
                      <div key={idx} className="relative flex items-start gap-4 pb-4 last:pb-0">
                        <div className={`absolute left-[-6px] top-1.5 w-3 h-3 rounded-full border-2 ${idx <= currentIndex ? "bg-[#11402D] border-[#11402D]" : "bg-white border-gray-300"}`} />
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${idx <= currentIndex ? "text-gray-900" : "text-gray-400"}`}>
                            {step.label}
                          </p>
                          {idx <= currentIndex && delivery.updated_at && (
                            <p className="text-xs text-gray-500">{formatDate(delivery.updated_at)}</p>
                          )}
                        </div>
                        {idx <= currentIndex && <CheckCircle className="h-4 w-4 text-[#11402D] flex-shrink-0" />}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === "details" && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-2xl p-4">
                  <h4 className="font-display font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Supplier
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-500">Name:</span> {delivery.supplier_name || "Unknown"}</p>
                    <p><span className="text-gray-500">Phone:</span> {delivery.supplier_phone || delivery.supplier?.phone || "N/A"}</p>
                    <p><span className="text-gray-500">Location:</span> {delivery.pickup_location || "N/A"}</p>
                    {(delivery.supplier_phone || delivery.supplier?.phone) && (
                      <button
                        onClick={handleCallSupplier}
                        className="mt-2 bg-[#11402D] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#0E2A1C] transition flex items-center gap-1"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        Call Supplier
                      </button>
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4">
                  <h4 className="font-display font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Transporter
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-500">Name:</span> {delivery.transporter_name || "Not assigned"}</p>
                    <p><span className="text-gray-500">Phone:</span> {delivery.transporter_phone || delivery.transporter?.phone || "N/A"}</p>
                    {(delivery.transporter_phone || delivery.transporter?.phone) && (
                      <button
                        onClick={handleCallTransporter}
                        className="mt-2 bg-[#11402D] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#0E2A1C] transition flex items-center gap-1"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        Call Transporter
                      </button>
                    )}
                  </div>
                </div>
                <div className="md:col-span-2 bg-gray-50 rounded-2xl p-4">
                  <h4 className="font-display font-semibold text-gray-900 mb-2">Route</h4>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Pickup:</span> {delivery.pickup_location || "—"}
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <div>
                      <span className="text-gray-500">Delivery:</span> {delivery.delivery_location || "—"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "escrow" && (
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <h3 className="font-display font-semibold text-gray-900 mb-4">Escrow & Payment</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Waste Cost</span>
                      <span className="font-medium">{formatCurrency(delivery.waste_amount ?? 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Transport Fee</span>
                      <span className="font-medium">{formatCurrency(delivery.transport_fee ?? 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Platform Fee</span>
                      <span className="font-medium">{formatCurrency(delivery.platform_fee ?? 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-2">
                      <span>Total Paid</span>
                      <span>{formatCurrency(delivery.total_amount ?? 0)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-start justify-center border-l border-gray-200 pl-6">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-[#11402D]" />
                      <span className="font-display font-semibold">Money Held in Escrow</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Waiting for delivery confirmation</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ─── Action Buttons ──────────────────────────────────── */}
          <div className="border-t border-gray-100 pt-6 flex flex-wrap gap-3">
            {delivery.status === "open" && (
              <>
                <button
                  onClick={handleCallSupplier}
                  className="bg-[#11402D] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#0E2A1C] transition flex items-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  Call Supplier
                </button>
                <button
                  onClick={fetchLocationData}
                  className="border border-[#11402D] text-[#11402D] px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#11402D] hover:text-white transition flex items-center gap-2"
                >
                  <Navigation className="h-4 w-4" />
                  Refresh Location
                </button>
              </>
            )}
            {["accepted", "picked_up", "in_transit"].includes(delivery.status) && (
              <>
                <button
                  onClick={fetchLocationData}
                  className="bg-[#11402D] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#0E2A1C] transition flex items-center gap-2"
                >
                  <Navigation className="h-4 w-4" />
                  Refresh Location
                </button>
                <button
                  onClick={() => onChat(delivery.id, delivery.transporter_id)}
                  className="border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat Driver
                </button>
                {(delivery.transporter_phone || delivery.transporter?.phone) && (
                  <button
                    onClick={handleCallTransporter}
                    className="border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    Call Driver
                  </button>
                )}
              </>
            )}
            {delivery.status === "delivered" && (
              <>
                <button
                  onClick={() => onConfirmDelivery(delivery.id)}
                  disabled={actionLoading}
                  className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Confirm Delivery
                    </>
                  )}
                </button>
                <button
                  onClick={() => onReport(delivery.id)}
                  className="border border-red-300 text-red-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-50 transition flex items-center gap-2"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Report Issue
                </button>
              </>
            )}
            {delivery.status === "awaiting_confirmation" && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-2 text-sm text-orange-700">
                Awaiting admin payment release
              </div>
            )}
            {delivery.status === "completed" && (
              <>
                <button
                  onClick={() => onDownloadReceipt(delivery.id)}
                  disabled={actionLoading}
                  className="bg-[#11402D] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#0E2A1C] transition flex items-center gap-2 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Download Receipt
                    </>
                  )}
                </button>
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-1.5">
                  <span className="text-sm text-gray-500">Rate:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRateSubmit(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      disabled={submitting || actionLoading}
                      className="focus:outline-none disabled:opacity-50"
                    >
                      <Star
                        className={`h-4 w-4 ${
                          (hoverRating || rating) >= star
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        } transition`}
                      />
                    </button>
                  ))}
                  {submitting && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#11402D] border-t-transparent" />
                  )}
                </div>
              </>
            )}
            <button onClick={onClose} className="ml-auto border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
              Close
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}