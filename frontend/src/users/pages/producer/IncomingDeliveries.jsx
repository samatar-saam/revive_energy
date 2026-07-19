// src/users/pages/producer/IncomingDeliveries.jsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import {
  Truck,
  Package,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  Clock,
  ShieldCheck,
  Building2,
  User,
  Search,
  Eye,
  X,
  Phone,
  Navigation,
  Check,
  AlertTriangle,
  Download,
  Star,
  MessageCircle,
  ArrowRight,
  Receipt,
  Printer,
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
      
      const res = await fetch(`${API_URL}/producer/deliveries/${deliveryId}/confirm`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

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

  // ─── ★★★ PROFESSIONAL RECEIPT (TOTAL ONLY) ★★★ ──────────────
  const handleDownloadReceipt = async (deliveryId) => {
    setActionLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/producer/deliveries/${deliveryId}/receipt`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to generate receipt");
      }

      const data = await res.json();
      const receipt = data.receipt || data;

      const receiptNumber = receipt.receipt_number || `REV-${Date.now()}`;
      const dateStr = receipt.date ? new Date(receipt.date).toLocaleString("en-KE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }) : "N/A";

      // Build QR code URL (optional)
      const qrData = receiptNumber;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(qrData)}`;

      const receiptHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Receipt #${receiptNumber}</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
              background: #f6f9fc;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              padding: 20px;
            }
            .receipt-container {
              max-width: 420px;
              width: 100%;
              background: #ffffff;
              border-radius: 20px;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08), 0 8px 24px rgba(0, 0, 0, 0.03);
              overflow: hidden;
              padding: 24px 20px;
            }
            .header {
              text-align: center;
              border-bottom: 1px solid #eaf0f5;
              padding-bottom: 16px;
              margin-bottom: 16px;
            }
            .header .brand {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
              font-size: 20px;
              font-weight: 700;
              color: #11402D;
            }
            .header .brand svg { width: 24px; height: 24px; }
            .header .sub {
              font-size: 12px;
              color: #5a7060;
              margin-top: 2px;
            }
            .header .contact {
              font-size: 11px;
              color: #8a9ba8;
              margin-top: 4px;
              line-height: 1.5;
            }
            .receipt-number {
              text-align: center;
              font-size: 12px;
              color: #8a9ba8;
              border-bottom: 1px solid #eaf0f5;
              padding-bottom: 12px;
              margin-bottom: 16px;
            }
            .details-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 6px 16px;
              background: #fafcfe;
              border-radius: 12px;
              padding: 12px 14px;
              margin-bottom: 16px;
            }
            .detail-item {
              display: flex;
              flex-direction: column;
            }
            .detail-item .label {
              font-size: 9px;
              text-transform: uppercase;
              letter-spacing: 0.4px;
              color: #8a9ba8;
              font-weight: 600;
            }
            .detail-item .value {
              font-size: 13px;
              font-weight: 500;
              color: #0e2a1c;
              margin-top: 1px;
            }
            .total-line {
              display: flex;
              justify-content: space-between;
              padding: 12px 0;
              border-top: 2px solid #11402D;
              margin-top: 8px;
              font-size: 16px;
              font-weight: 700;
              color: #0e2a1c;
            }
            .total-line .amount {
              color: #11402D;
              font-size: 20px;
            }
            .payment-details {
              border-top: 1px solid #eaf0f5;
              padding-top: 12px;
              margin-top: 12px;
              font-size: 11px;
              color: #5a7060;
              line-height: 1.8;
            }
            .payment-details .row {
              display: flex;
              justify-content: space-between;
            }
            .payment-details .row .label {
              color: #8a9ba8;
            }
            .payment-details .row .value {
              font-weight: 500;
              color: #0e2a1c;
            }
            .qr-section {
              display: flex;
              justify-content: center;
              border-top: 1px solid #eaf0f5;
              padding-top: 16px;
              margin-top: 16px;
            }
            .qr-section img {
              width: 80px;
              height: 80px;
              object-fit: contain;
            }
            .footer {
              text-align: center;
              border-top: 1px solid #eaf0f5;
              padding-top: 16px;
              margin-top: 16px;
              font-size: 10px;
              color: #8a9ba8;
              line-height: 1.6;
            }
            .footer .thanks {
              font-weight: 600;
              color: #0e2a1c;
              font-size: 12px;
            }
            .no-print {
              display: flex;
              gap: 8px;
              justify-content: center;
              border-top: 1px solid #eaf0f5;
              padding-top: 16px;
              margin-top: 16px;
            }
            .btn {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              gap: 4px;
              padding: 8px 16px;
              border-radius: 40px;
              font-size: 12px;
              font-weight: 600;
              border: none;
              cursor: pointer;
              transition: background 0.15s;
            }
            .btn-primary {
              background: #11402D;
              color: white;
            }
            .btn-primary:hover {
              background: #0e2a1c;
            }
            .btn-outline {
              background: white;
              color: #0e2a1c;
              border: 1px solid #d0d9df;
            }
            .btn-outline:hover {
              background: #f0f4f8;
            }
            @media print {
              body { background: white; padding: 0; }
              .receipt-container { box-shadow: none; border-radius: 0; padding: 16px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <!-- Header -->
            <div class="header">
              <div class="brand">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#11402D" stroke-width="2">
                  <path d="M3 12L5 10L7 12L9 10L11 12L13 10L15 12L17 10L19 12L21 10L23 12" stroke-linecap="round"/>
                  <circle cx="12" cy="12" r="10" />
                </svg>
                <span>ReVive Energy</span>
              </div>
              <div class="sub">Waste‑to‑Energy Platform</div>
              <div class="contact">1 Garissa University, Garissa<br />Tel: +254 727 568 271</div>
            </div>

            <!-- Receipt number & date -->
            <div class="receipt-number">
              Receipt #: ${receiptNumber} &nbsp;·&nbsp; ${dateStr}
            </div>

            <!-- Details Grid -->
            <div class="details-grid">
              <div class="detail-item">
                <span class="label">Waste Type</span>
                <span class="value">${receipt.waste_type || "N/A"}</span>
              </div>
              <div class="detail-item">
                <span class="label">Quantity</span>
                <span class="value">${receipt.quantity || 0} ${receipt.unit || "kg"}</span>
              </div>
              <div class="detail-item">
                <span class="label">Producer</span>
                <span class="value">${receipt.producer_name || "Unknown"}</span>
              </div>
              <div class="detail-item">
                <span class="label">Supplier</span>
                <span class="value">${receipt.supplier_name || "Unknown"}</span>
              </div>
              <div class="detail-item">
                <span class="label">Transporter</span>
                <span class="value">${receipt.transporter_name || "Unknown"}</span>
              </div>
              <div class="detail-item">
                <span class="label">Payment Method</span>
                <span class="value">${receipt.payment_method || "M‑Pesa"}</span>
              </div>
            </div>

            <!-- Total (only the amount paid) -->
            <div class="total-line">
              <span>Amount Paid</span>
              <span class="amount">${formatCurrency(receipt.total_paid || 0)}</span>
            </div>

            <!-- Payment details -->
            <div class="payment-details">
              <div class="row"><span class="label">Method</span><span class="value">${receipt.payment_method || "M‑Pesa"}</span></div>
              <div class="row"><span class="label">M‑Pesa Receipt</span><span class="value">${receipt.mpesa_receipt || "N/A"}</span></div>
              <div class="row"><span class="label">Status</span><span class="value" style="color:${receipt.status === "completed" || receipt.status === "released" ? "#11402D" : "#f59e0b"}">${receipt.status ? receipt.status.toUpperCase() : "N/A"}</span></div>
            </div>

            <!-- QR Code -->
            <div class="qr-section">
              <img src="${qrUrl}" alt="QR Code" />
            </div>

            <!-- Footer -->
            <div class="footer">
              <div class="thanks">THANK YOU</div>
              <div>Electronically generated receipt</div>
              <div>© ${new Date().getFullYear()} ReVive Energy</div>
            </div>

            <!-- Buttons (web only) -->
            <div class="no-print">
              <button class="btn btn-primary" onclick="window.print()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download Receipt
              </button>
              <button class="btn btn-outline" onclick="window.print()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M18 9h3v6H3V9h3"/><rect x="6" y="13" width="12" height="8" rx="1"/><line x1="9" y1="17" x2="15" y2="17"/></svg>
                Print
              </button>
            </div>
          </div>
        </body>
        </html>
      `;

      const newWindow = window.open('', '_blank', 'width=480,height=900');
      if (newWindow) {
        newWindow.document.write(receiptHtml);
        newWindow.document.close();
        toast.success("Receipt generated!");
      } else {
        toast.info("Please allow popups to view the receipt.");
      }
    } catch (err) {
      toast.error(err.message || "Could not download receipt");
    } finally {
      setActionLoading(false);
    }
  };

  // ─── RATE SUPPLIER ──────────────────────────────────────────
  const handleRateSupplier = async (deliveryId, supplierId, rating) => {
    if (!supplierId) {
      toast.error("Unable to identify supplier for rating.");
      return;
    }

    setActionLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/producer/deliveries/${deliveryId}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: rating,
          review: `Rating ${rating} stars for delivery #${deliveryId}`,
        }),
      });

      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to submit rating");
      }

      toast.success(`⭐ ${rating} star rating submitted!`);
      return true;
    } catch (err) {
      toast.error(err.message || "Failed to submit rating");
      return false;
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
          onTrackLive={handleTrackLive}
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

// ─── Detail Modal ─────────────────────────────────────────────

function DetailModal({
  delivery,
  onClose,
  onTrackLive,
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

  // ─── Fetch location data ──────────────────────────────────
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

  // ─── Call handlers ──────────────────────────────────────────
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

                  {/* Map */}
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