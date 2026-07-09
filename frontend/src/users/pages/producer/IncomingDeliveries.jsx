// src/users/pages/producer/IncomingDeliveries.jsx
import { useState, useEffect, useMemo } from "react";
import {
  Search,
  RefreshCw,
  Bell,
  Truck,
  Package,
  Clock,
  CheckCircle,
  MapPin,
  User,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Shield,
  AlertCircle,
  Eye,
  X,
  Star,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  MoreHorizontal,
  Navigation,
  Camera,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  PhoneCall,
  Map,
  Car,
  User as UserIcon,
  Building2,
  CreditCard,
  ArrowRight,
  Award,
  Check,
  Loader2,
  Clock as ClockIcon,
  Truck as TruckIcon,
  MapPin as MapPinIcon,
  Navigation as NavigationIcon,
  CalendarDays,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-toastify";

// ─── Mock Data ────────────────────────────────────────────────
const MOCK_DELIVERIES = [
  {
    id: "TRK-2026-001",
    wasteType: "Organic Waste",
    category: "Food Waste",
    quantity: "500 kg",
    supplier: {
      name: "Hotel Paradise",
      phone: "+254 700 123 456",
      location: "Nairobi, Kenya",
    },
    producer: {
      name: "Green Energy Ltd",
      address: "Westlands, Nairobi",
    },
    transporter: {
      name: "John Kamau",
      phone: "+254 712 345 678",
      vehicle: "KCA 123A",
      vehicleType: "Refrigerated Truck",
      rating: 4.8,
      driverPhoto: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    pickup: "Nairobi, Kenya",
    destination: "Energy Plant, Nakuru",
    status: "in_transit",
    eta: "2h 15m",
    distance: "45 km",
    trackingNumber: "TRK-2026-001",
    amount: {
      wasteCost: 1000,
      transportFee: 500,
      platformFee: 300,
      total: 1800,
    },
    escrowStatus: "held",
    timeline: [
      { label: "Payment Completed", date: "2026-07-08 10:30", completed: true },
      { label: "Transporter Assigned", date: "2026-07-08 11:45", completed: true },
      { label: "Waste Picked Up", date: "2026-07-08 13:00", completed: true },
      { label: "In Transit", date: "2026-07-08 14:20", completed: true },
      { label: "Arrived", date: "Estimated 16:30", completed: false },
      { label: "Producer Confirmation", date: "Pending", completed: false },
      { label: "Escrow Released", date: "Pending", completed: false },
    ],
    location: { lat: -1.286389, lng: 36.817223 },
    speed: "45 km/h",
    lastUpdated: "2 min ago",
    deliveryPhotos: {
      before: "https://via.placeholder.com/100?text=Before",
      loaded: "https://via.placeholder.com/100?text=Loaded",
      arrival: "https://via.placeholder.com/100?text=Arrival",
      final: "https://via.placeholder.com/100?text=Final",
    },
  },
  {
    id: "TRK-2026-002",
    wasteType: "Agricultural Waste",
    category: "Rice Husks",
    quantity: "2 tons",
    supplier: {
      name: "Green Farms Ltd",
      phone: "+254 722 987 654",
      location: "Nakuru, Kenya",
    },
    producer: {
      name: "BioEnergy Corp",
      address: "Nakuru",
    },
    transporter: {
      name: "Mary Wanjiku",
      phone: "+254 734 567 890",
      vehicle: "KCB 456B",
      vehicleType: "Flatbed Truck",
      rating: 4.9,
      driverPhoto: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    pickup: "Nakuru, Kenya",
    destination: "Biogas Plant, Kisumu",
    status: "awaiting_pickup",
    eta: "Not assigned",
    distance: "0 km",
    trackingNumber: "TRK-2026-002",
    amount: {
      wasteCost: 2000,
      transportFee: 800,
      platformFee: 500,
      total: 3300,
    },
    escrowStatus: "held",
    timeline: [
      { label: "Payment Completed", date: "2026-07-09 08:00", completed: true },
      { label: "Transporter Assigned", date: "2026-07-09 09:30", completed: true },
      { label: "Waste Picked Up", date: "Pending", completed: false },
      { label: "In Transit", date: "Pending", completed: false },
    ],
    location: { lat: -0.303099, lng: 36.080026 },
    speed: "0 km/h",
    lastUpdated: "1 hour ago",
    deliveryPhotos: {
      before: "https://via.placeholder.com/100?text=Before",
      loaded: "https://via.placeholder.com/100?text=Loaded",
      arrival: "https://via.placeholder.com/100?text=Arrival",
      final: "https://via.placeholder.com/100?text=Final",
    },
  },
  {
    id: "TRK-2026-003",
    wasteType: "Plastic Waste",
    category: "PET Bottles",
    quantity: "1.2 tons",
    supplier: {
      name: "Coastal Bottlers",
      phone: "+254 711 222 333",
      location: "Mombasa, Kenya",
    },
    producer: {
      name: "RecycleTech",
      address: "Mombasa",
    },
    transporter: {
      name: "Peter Ochieng",
      phone: "+254 723 456 789",
      vehicle: "KCC 789C",
      vehicleType: "Container Truck",
      rating: 4.7,
      driverPhoto: "https://randomuser.me/api/portraits/men/45.jpg",
    },
    pickup: "Mombasa, Kenya",
    destination: "Recycling Plant, Nairobi",
    status: "completed",
    eta: "Delivered",
    distance: "0 km",
    trackingNumber: "TRK-2026-003",
    amount: {
      wasteCost: 1500,
      transportFee: 1200,
      platformFee: 400,
      total: 3100,
    },
    escrowStatus: "released",
    timeline: [
      { label: "Payment Completed", date: "2026-07-07 09:00", completed: true },
      { label: "Transporter Assigned", date: "2026-07-07 10:00", completed: true },
      { label: "Waste Picked Up", date: "2026-07-07 11:30", completed: true },
      { label: "In Transit", date: "2026-07-07 13:00", completed: true },
      { label: "Arrived", date: "2026-07-07 16:00", completed: true },
      { label: "Producer Confirmation", date: "2026-07-07 16:30", completed: true },
      { label: "Escrow Released", date: "2026-07-07 17:00", completed: true },
    ],
    location: { lat: -1.292066, lng: 36.821946 },
    speed: "0 km/h",
    lastUpdated: "Yesterday",
    deliveryPhotos: {
      before: "https://via.placeholder.com/100?text=Before",
      loaded: "https://via.placeholder.com/100?text=Loaded",
      arrival: "https://via.placeholder.com/100?text=Arrival",
      final: "https://via.placeholder.com/100?text=Final",
    },
  },
  {
    id: "TRK-2026-004",
    wasteType: "Biomass Waste",
    category: "Wood Chips",
    quantity: "3 tons",
    supplier: {
      name: "Timber Works Ltd",
      phone: "+254 733 888 999",
      location: "Kisumu, Kenya",
    },
    producer: {
      name: "Kisumu Energy",
      address: "Kisumu",
    },
    transporter: {
      name: "Grace Akinyi",
      phone: "+254 701 234 567",
      vehicle: "KCD 101D",
      vehicleType: "Tipper Truck",
      rating: 4.6,
      driverPhoto: "https://randomuser.me/api/portraits/women/68.jpg",
    },
    pickup: "Kisumu, Kenya",
    destination: "Kisumu Energy Plant",
    status: "picked_up",
    eta: "1h 30m",
    distance: "15 km",
    trackingNumber: "TRK-2026-004",
    amount: {
      wasteCost: 2500,
      transportFee: 600,
      platformFee: 350,
      total: 3450,
    },
    escrowStatus: "held",
    timeline: [
      { label: "Payment Completed", date: "2026-07-08 14:00", completed: true },
      { label: "Transporter Assigned", date: "2026-07-08 14:45", completed: true },
      { label: "Waste Picked Up", date: "2026-07-08 16:00", completed: true },
      { label: "In Transit", date: "Estimated 17:30", completed: false },
    ],
    location: { lat: -0.102188, lng: 34.761702 },
    speed: "30 km/h",
    lastUpdated: "5 min ago",
    deliveryPhotos: {
      before: "https://via.placeholder.com/100?text=Before",
      loaded: "https://via.placeholder.com/100?text=Loaded",
      arrival: "https://via.placeholder.com/100?text=Arrival",
      final: "https://via.placeholder.com/100?text=Final",
    },
  },
];

// ─── Status Helpers ────────────────────────────────────────────
const STATUS_MAP = {
  awaiting_pickup: { label: "Awaiting Pickup", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  assigned: { label: "Assigned", color: "bg-blue-100 text-blue-700 border-blue-200" },
  picked_up: { label: "Picked Up", color: "bg-purple-100 text-purple-700 border-purple-200" },
  in_transit: { label: "In Transit", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  arrived: { label: "Arrived", color: "bg-orange-100 text-orange-700 border-orange-200" },
  completed: { label: "Completed", color: "bg-green-100 text-green-700 border-green-200" },
};

// ─── Helper to format currency ────────────────────────────────
const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 }).format(amount);

// ─── Helper to format date ────────────────────────────────────
const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ─── Main Component ──────────────────────────────────────────────
export default function IncomingDeliveries() {
  const [loading, setLoading] = useState(true);
  const [deliveries, setDeliveries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Simulate data fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      setDeliveries(MOCK_DELIVERIES);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Filter and search
  const filteredDeliveries = useMemo(() => {
    let result = [...deliveries];
    if (filterStatus !== "all") {
      result = result.filter((d) => d.status === filterStatus);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (d) =>
          d.wasteType.toLowerCase().includes(q) ||
          d.supplier.name.toLowerCase().includes(q) ||
          d.transporter.name.toLowerCase().includes(q) ||
          d.trackingNumber.toLowerCase().includes(q) ||
          d.pickup.toLowerCase().includes(q) ||
          d.destination.toLowerCase().includes(q)
      );
    }
    return result;
  }, [deliveries, filterStatus, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const total = deliveries.length;
    const inTransit = deliveries.filter((d) => d.status === "in_transit").length;
    const awaitingPickup = deliveries.filter((d) => d.status === "awaiting_pickup").length;
    const deliveredToday = deliveries.filter(
      (d) => d.status === "completed" && new Date(d.timeline[0]?.date).toDateString() === new Date().toDateString()
    ).length;
    return { total, inTransit, awaitingPickup, deliveredToday };
  }, [deliveries]);

  // Refresh handler
  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      toast.success("Deliveries refreshed");
      setRefreshing(false);
    }, 1000);
  };

  // Open detail modal
  const openDetail = (delivery) => {
    setSelectedDelivery(delivery);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedDelivery(null);
  };

  // Action handlers (placeholder)
  const handleAction = (action, deliveryId) => {
    toast.info(`${action} action triggered for delivery #${deliveryId}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Inter']">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono-cw { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
        {/* ─── Header ──────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-[#0E2A1C]">Incoming Deliveries</h1>
            <p className="text-sm text-[#5A7060] mt-1">
              Track every paid waste shipment from pickup until delivery.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 sm:w-56 rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 text-gray-500 ${refreshing ? "animate-spin" : ""}`} />
            </button>
            <button className="relative p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition">
              <Bell className="h-4 w-4 text-gray-500" />
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500" />
            </button>
          </div>
        </div>

        {/* ─── Stats Cards ────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Deliveries"
            value={stats.total}
            icon={Package}
            color="blue"
            subtitle="All paid shipments"
          />
          <StatCard
            label="In Transit"
            value={stats.inTransit}
            icon={Truck}
            color="indigo"
            subtitle="Currently moving"
          />
          <StatCard
            label="Awaiting Pickup"
            value={stats.awaitingPickup}
            icon={Clock}
            color="yellow"
            subtitle="Ready for collection"
          />
          <StatCard
            label="Delivered Today"
            value={stats.deliveredToday}
            icon={CheckCircle}
            color="green"
            subtitle="Completed today"
          />
        </div>

        {/* ─── Filter Bar ────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-8 text-sm outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              <option value="awaiting_pickup">Awaiting Pickup</option>
              <option value="assigned">Assigned</option>
              <option value="picked_up">Picked Up</option>
              <option value="in_transit">In Transit</option>
              <option value="arrived">Arrived</option>
              <option value="completed">Completed</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
          <span className="text-sm text-gray-500">
            {filteredDeliveries.length} deliveries
          </span>
        </div>

        {/* ─── Deliveries Table ────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <LoadingSkeleton />
          ) : filteredDeliveries.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Tracking ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Waste Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Supplier</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Transporter</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Vehicle</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Pickup</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Destination</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">ETA</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDeliveries.map((delivery) => (
                    <tr key={delivery.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-4 py-3 font-mono-cw text-xs text-gray-500">{delivery.trackingNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{delivery.wasteType}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{delivery.supplier.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{delivery.transporter.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{delivery.transporter.vehicle}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{delivery.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{delivery.pickup}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{delivery.destination}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium border ${
                            STATUS_MAP[delivery.status]?.color || "bg-gray-100 text-gray-700 border-gray-200"
                          }`}
                        >
                          {STATUS_MAP[delivery.status]?.label || delivery.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{delivery.eta}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => openDetail(delivery)}
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
          )}
        </div>

        {/* ─── Footer ────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span className="font-mono-cw text-xs">Last synchronized: 2 min ago</span>
            <button
              onClick={handleRefresh}
              className="text-[#11402D] hover:underline flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </button>
          </div>
          <div>
            <span className="font-medium text-[#11402D]">{filteredDeliveries.length}</span> active deliveries
          </div>
        </div>
      </div>

      {/* ─── Detail Modal ────────────────────────────────────── */}
      {showModal && selectedDelivery && (
        <DetailModal delivery={selectedDelivery} onClose={closeModal} onAction={handleAction} />
      )}
    </div>
  );
}

// ─── Stat Card Component ──────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, subtitle }) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-100",
    green: "bg-green-50 text-green-600 border-green-100",
  };
  const style = colorMap[color] || colorMap.blue;

  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border ${style}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl ${style}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="font-display text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

// ─── Loading Skeleton ────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 animate-pulse">
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
          <div className="h-4 w-16 bg-gray-200 rounded"></div>
          <div className="h-4 w-20 bg-gray-200 rounded"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
          <div className="h-4 w-16 bg-gray-200 rounded"></div>
          <div className="h-4 w-12 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="py-16 text-center">
      <div className="w-24 h-24 rounded-full bg-[#11402D]/5 flex items-center justify-center mx-auto mb-4">
        <Truck className="w-12 h-12 text-[#11402D]/30" />
      </div>
      <h3 className="font-display text-xl font-semibold text-gray-700">No incoming deliveries yet</h3>
      <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
        Once you pay for an approved waste request, it will appear here for live tracking.
      </p>
      <button className="mt-6 inline-flex items-center gap-2 bg-[#11402D] text-white font-bold px-6 py-2.5 rounded-xl hover:bg-[#0E2A1C] transition">
        Browse Waste Listings
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────
function DetailModal({ delivery, onClose, onAction }) {
  const [activeTab, setActiveTab] = useState("tracking");
  const [expandedTimeline, setExpandedTimeline] = useState(false);

  // Mock map placeholder
  const MapPlaceholder = () => (
    <div className="relative w-full h-48 bg-gray-200 rounded-xl overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center text-gray-500 bg-gradient-to-br from-gray-100 to-gray-200">
        <MapPin className="h-8 w-8 text-gray-400 mr-2" />
        <span className="font-display text-sm">Live GPS Map</span>
      </div>
      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur rounded-lg px-3 py-1.5 text-xs shadow-md">
        <span className="font-mono-cw text-[#11402D]">📍 {delivery.location?.lat}, {delivery.location?.lng}</span>
      </div>
      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur rounded-lg px-3 py-1.5 text-xs shadow-md flex items-center gap-1">
        <Loader2 className="h-3 w-3 text-[#11402D] animate-spin" />
        <span className="font-mono-cw text-[#11402D]">Live</span>
      </div>
    </div>
  );

  const getStatusColor = (status) => {
    const map = {
      awaiting_pickup: "bg-yellow-100 text-yellow-700",
      assigned: "bg-blue-100 text-blue-700",
      picked_up: "bg-purple-100 text-purple-700",
      in_transit: "bg-indigo-100 text-indigo-700",
      arrived: "bg-orange-100 text-orange-700",
      completed: "bg-green-100 text-green-700",
    };
    return map[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/50 backdrop-blur-sm">
      <div className="relative h-full w-full max-w-5xl bg-white shadow-2xl overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-gray-900">Delivery Details</h2>
            <p className="text-sm text-gray-500 font-mono-cw">{delivery.trackingNumber}</p>
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
              <p className="font-display font-semibold">{delivery.wasteType}</p>
              <p className="text-xs text-gray-400 mt-1">Category: {delivery.category}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Quantity</p>
              <p className="font-display font-semibold">{delivery.quantity}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Status</p>
              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium border ${getStatusColor(delivery.status)}`}>
                {STATUS_MAP[delivery.status]?.label || delivery.status}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-400">ETA</p>
              <p className="font-display font-semibold">{delivery.eta}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-100">
            {["tracking", "details", "photos", "escrow"].map((tab) => (
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
                {/* Live tracking card */}
                <div className="bg-[#11402D]/5 rounded-2xl p-5 border border-[#11402D]/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <TruckIcon className="h-5 w-5 text-[#11402D]" />
                      <h3 className="font-display font-semibold text-[#0E2A1C]">Live Tracking</h3>
                    </div>
                    <span className="font-mono-cw text-xs text-[#11402D]">Updated {delivery.lastUpdated}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Driver</p>
                      <p className="font-medium">{delivery.transporter.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Vehicle</p>
                      <p className="font-medium">{delivery.transporter.vehicle}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Speed</p>
                      <p className="font-medium">{delivery.speed}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Distance Remaining</p>
                      <p className="font-medium">{delivery.distance}</p>
                    </div>
                  </div>
                  <MapPlaceholder />
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button className="bg-[#11402D] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#0E2A1C] flex items-center gap-2">
                      <NavigationIcon className="h-4 w-4" />
                      Track Live
                    </button>
                    <button className="border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                      <PhoneCall className="h-4 w-4" />
                      Call Driver
                    </button>
                    <button className="border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Chat
                    </button>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h3 className="font-display font-semibold text-gray-900 mb-3">Timeline</h3>
                  <div className="space-y-0 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 pl-6">
                    {delivery.timeline.map((item, idx) => (
                      <div key={idx} className="relative flex items-start gap-4 pb-4 last:pb-0">
                        <div className={`absolute left-[-6px] top-1.5 w-3 h-3 rounded-full border-2 ${item.completed ? "bg-[#11402D] border-[#11402D]" : "bg-white border-gray-300"}`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.date}</p>
                        </div>
                        {item.completed && <CheckCircle className="h-4 w-4 text-[#11402D] flex-shrink-0" />}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === "details" && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Supplier */}
                <div className="bg-gray-50 rounded-2xl p-4">
                  <h4 className="font-display font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Supplier
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-500">Name:</span> {delivery.supplier.name}</p>
                    <p><span className="text-gray-500">Phone:</span> {delivery.supplier.phone}</p>
                    <p><span className="text-gray-500">Location:</span> {delivery.supplier.location}</p>
                  </div>
                </div>

                {/* Producer */}
                <div className="bg-gray-50 rounded-2xl p-4">
                  <h4 className="font-display font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    Producer
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-500">Name:</span> {delivery.producer.name}</p>
                    <p><span className="text-gray-500">Address:</span> {delivery.producer.address}</p>
                  </div>
                </div>

                {/* Transporter */}
                <div className="bg-gray-50 rounded-2xl p-4 md:col-span-2">
                  <h4 className="font-display font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Transporter
                  </h4>
                  <div className="flex items-start gap-4">
                    <img
                      src={delivery.transporter.driverPhoto}
                      alt={delivery.transporter.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#11402D]/20"
                    />
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm flex-1">
                      <p><span className="text-gray-500">Driver:</span> {delivery.transporter.name}</p>
                      <p><span className="text-gray-500">Phone:</span> {delivery.transporter.phone}</p>
                      <p><span className="text-gray-500">Vehicle:</span> {delivery.transporter.vehicle}</p>
                      <p><span className="text-gray-500">Type:</span> {delivery.transporter.vehicleType}</p>
                      <p className="col-span-2"><span className="text-gray-500">Rating:</span> {delivery.transporter.rating} ⭐</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "photos" && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(delivery.deliveryPhotos).map(([key, url]) => (
                  <div key={key} className="bg-gray-100 rounded-xl overflow-hidden aspect-square">
                    <img src={url} alt={key} className="w-full h-full object-cover" />
                    <p className="text-center text-xs py-1 text-gray-500 capitalize">{key.replace("_", " ")}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "escrow" && (
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <h3 className="font-display font-semibold text-gray-900 mb-4">Escrow & Payment</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Waste Cost</span>
                      <span className="font-medium">{formatCurrency(delivery.amount.wasteCost)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Transport Fee</span>
                      <span className="font-medium">{formatCurrency(delivery.amount.transportFee)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Platform Fee</span>
                      <span className="font-medium">{formatCurrency(delivery.amount.platformFee)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-2">
                      <span>Total Paid</span>
                      <span>{formatCurrency(delivery.amount.total)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-start justify-center border-l border-gray-200 pl-6">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-[#11402D]" />
                      <span className="font-display font-semibold">
                        {delivery.escrowStatus === "held" ? "Money Held in Escrow" : "Escrow Released"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {delivery.escrowStatus === "held"
                        ? "Waiting for delivery confirmation"
                        : "Payment has been released to all parties"}
                    </p>
                    {delivery.escrowStatus === "released" && (
                      <div className="mt-3 space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-green-600">
                          <Check className="h-4 w-4" /> Supplier Paid
                        </div>
                        <div className="flex items-center gap-2 text-green-600">
                          <Check className="h-4 w-4" /> Transporter Paid
                        </div>
                        <div className="flex items-center gap-2 text-green-600">
                          <Check className="h-4 w-4" /> Platform Fee Collected
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-100 pt-6 flex flex-wrap gap-3">
            {delivery.status === "assigned" && (
              <>
                <button className="bg-[#11402D] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#0E2A1C] flex items-center gap-2">
                  <NavigationIcon className="h-4 w-4" />
                  Track Driver
                </button>
                <button className="border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Chat Driver
                </button>
              </>
            )}
            {["picked_up", "in_transit"].includes(delivery.status) && (
              <>
                <button className="bg-[#11402D] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#0E2A1C] flex items-center gap-2">
                  <NavigationIcon className="h-4 w-4" />
                  Track Live
                </button>
                <button className="border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  <PhoneCall className="h-4 w-4" />
                  Call Driver
                </button>
                <button className="border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Chat
                </button>
              </>
            )}
            {delivery.status === "arrived" && (
              <>
                <button className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-700 flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Accept Delivery
                </button>
                <button className="border border-red-300 text-red-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-50 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Report Issue
                </button>
              </>
            )}
            {delivery.status === "completed" && (
              <>
                <button className="bg-[#11402D] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#0E2A1C] flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download Receipt
                </button>
                <button className="border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Rate Supplier
                </button>
                <button className="border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Rate Transporter
                </button>
              </>
            )}
            <button onClick={onClose} className="ml-auto border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
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