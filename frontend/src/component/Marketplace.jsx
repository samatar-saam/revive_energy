// src/pages/MarketplacePage.jsx
import { useState, useRef, useEffect, useMemo } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Search, Recycle, Leaf, Zap, Truck, Factory, Package,
  Building2, MapPin, AlertCircle, RefreshCw, Eye, Bookmark, Star,
  ChevronDown, Clock, Shield, Phone, Mail, X, Plus, Minus,
  Flame, Droplets, TreePine, Wheat as WheatIcon, Utensils, Coffee,
  ShoppingBag as ShoppingBagIcon, Home, Store, Hotel, Apple,
  Box, Warehouse, Landmark, Flower2, Building, Briefcase,
  Route, TrendingDown, Award as AwardIcon, Zap as ZapIcon, Leaf as LeafIcon,
  User, LogOut, Shield as ShieldIcon, Menu,
  CreditCard, ShieldCheck, ChevronLeft, ChevronRight, Grid3x3, List,
} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/* ─── ANIMATED COUNTER ─── */
function Counter({ to, suffix = "", prefix = "" }) {
  const nodeRef = useRef(null);
  const [val, setVal] = useState(0);
  useEffect(() => {
    const el = nodeRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const duration = 2000;
        const step = (timestamp) => {
          if (!start) start = timestamp;
          const progress = Math.min((timestamp - start) / duration, 1);
          setVal(Math.floor(progress * to));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={nodeRef}>{prefix}{val}{suffix}</span>;
}

/* ─── DATA ─── */
const ENERGY_PRODUCTS = [
  { title: "Biogas", icon: Flame, color: "#F59E0B", description: "Renewable energy from organic waste", benefits: "Reduces methane emissions, Replaces fossil fuels" },
  { title: "Electricity", icon: Zap, color: "#60A5FA", description: "Clean power from waste conversion", benefits: "Grid support, Energy independence" },
  { title: "Organic Fertilizer", icon: Leaf, color: "#34D399", description: "Nutrient-rich soil amendment", benefits: "Improves soil fertility, Reduces chemicals" },
  { title: "Biochar", icon: Droplets, color: "#8B5CF6", description: "Carbon-rich material for soil", benefits: "Captures carbon, Improves yields" },
  { title: "Biomass Fuel", icon: Flame, color: "#F97316", description: "Renewable fuel from biomass", benefits: "Waste reduction, Carbon neutral" },
  { title: "Recycled Products", icon: Recycle, color: "#818CF8", description: "Products from recycled materials", benefits: "Reduces pollution, Conserves resources" },
];

const HOW_IT_WORKS = [
  { step: 1, title: "Waste Generated", desc: "Businesses, farms, and households generate waste", icon: Package },
  { step: 2, title: "Listed on Marketplace", desc: "Suppliers post waste with details and location", icon: Store },
  { step: 3, title: "Transport Collected", desc: "Transporters find jobs and collect waste", icon: Truck },
  { step: 4, title: "Processing Plant Converts", desc: "Waste is processed using advanced technology", icon: Factory },
  { step: 5, title: "Energy Products Produced", desc: "Clean energy, fuel, and recycled products created", icon: Zap },
];

const CATEGORIES = [
  { id: "organic", name: "Organic Waste", icon: Leaf, color: "#34D399", bgColor: "#ECFDF5" },
  { id: "agricultural", name: "Agricultural Waste", icon: WheatIcon, color: "#F59E0B", bgColor: "#FFFBEB" },
  { id: "plastic", name: "Plastic Waste", icon: Recycle, color: "#818CF8", bgColor: "#EEF2FF" },
  { id: "industrial", name: "Industrial Waste", icon: Factory, color: "#F97316", bgColor: "#FFF7ED" },
  { id: "biomass", name: "Biomass & Wood", icon: TreePine, color: "#34D399", bgColor: "#ECFDF5" },
  { id: "municipal", name: "Municipal Waste", icon: Building2, color: "#60A5FA", bgColor: "#EFF6FF" },
];

/* ─── COMPONENTS ─── */
function CategoryCard({ category, onClick, isActive }) {
  const Icon = category.icon;
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 relative rounded-xl ${
        isActive
          ? "bg-[#11402D] text-white shadow-lg"
          : "hover:bg-[#F6F8F4] text-[#0E2A1C]/70"
      }`}
    >
      <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-[#9CF06B] rounded-r-full transition-all duration-200 ${
        isActive ? "opacity-100" : "opacity-0"
      }`} />
      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-[#9CF06B]" : "text-[#142019]/40"}`} />
      <span className="font-display text-sm flex-1 text-left">{category.name}</span>
    </button>
  );
}

function ListingCard({ item, i, onRequest, requesting, selected, onSelect, myRequests }) {
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  const userRequest = myRequests?.find(r => r.listing_id === item.id);
  const requestStatus = userRequest?.status || null;
  const canRequest = item.status === "available" && !requestStatus;

  const getRequestBadge = () => {
    if (!requestStatus) return null;
    const map = {
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
      paid: "bg-blue-100 text-blue-700",
      assigned: "bg-blue-100 text-blue-700",
      in_transit: "bg-purple-100 text-purple-700",
      delivered: "bg-indigo-100 text-indigo-700",
      completed: "bg-gray-100 text-gray-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return (
      <span className={`text-[10px] font-display font-black px-2.5 py-1 rounded-full ${map[requestStatus] || "bg-gray-100 text-gray-700"} border backdrop-blur-sm`}>
        {requestStatus.replace("_", " ")}
      </span>
    );
  };

  const formatCurrency = (amount) =>
    `KSh ${Number(amount || 0).toLocaleString("en-KE")}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.05 }}
      whileHover={{ y: -8 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-[#11402D]/5 group"
    >
      <div className="relative h-48 overflow-hidden cursor-pointer" onClick={() => onSelect(item)}>
        <img
          src={item.image_url || "https://images.unsplash.com/photo-1581092335871-4c4c8b7cfad9?auto=format&fit=crop&w=600&q=85"}
          alt={item.waste_type}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1581092335871-4c4c8b7cfad9?auto=format&fit=crop&w=600&q=85";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1A0F]/60 via-transparent to-transparent" />

        <div className="absolute top-3 left-3 flex gap-2">
          <span className="text-[10px] font-display font-black px-2.5 py-1 rounded-full bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/30 backdrop-blur-sm">
            {item.status || "Available"}
          </span>
          {requestStatus && getRequestBadge()}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); setSaved(!saved); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 backdrop-blur flex items-center justify-center hover:bg-black/50 transition-colors"
        >
          <Bookmark className={`w-4 h-4 ${saved ? "fill-[#9CF06B] text-[#9CF06B]" : "text-white/70"}`} />
        </button>

        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-display font-bold text-lg truncate">{item.waste_type}</h3>
          <p className="text-white/70 text-sm flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {item.location || "N/A"}
          </p>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#5A7060] truncate max-w-[100px]">{item.supplier_name || "Unknown"}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-display font-bold text-[#11402D]">
              {formatCurrency(item.total_amount || 30)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#5A7060] mb-3">
          <span className="flex items-center gap-1"><Package className="w-3 h-3" /> {item.quantity || 0} {item.unit || "kg"}</span>
          <span className="flex items-center gap-1"><Leaf className="w-3 h-3" /> {item.category || "General"}</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onSelect(item)}
            className="flex-1 py-2 rounded-xl text-xs font-display font-bold text-[#11402D] border border-[#11402D]/20 hover:bg-[#11402D]/5 transition-colors"
          >
            <Eye className="w-3 h-3 inline mr-1" /> Details
          </button>

          {canRequest ? (
            <button
              onClick={() => onRequest(item.id)}
              disabled={requesting === item.id}
              className="flex-1 py-2 rounded-xl text-xs font-display font-bold text-white bg-[#11402D] hover:bg-[#0A1A0F] transition-colors disabled:opacity-70"
            >
              {requesting === item.id ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mx-auto" />
              ) : (
                "Request"
              )}
            </button>
          ) : (
            <button
              onClick={() => navigate("/producer/requests")}
              className="flex-1 py-2 rounded-xl text-xs font-display font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              View Request
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ListingDetailsModal({ listing, onClose, onRequest, requesting, myRequests }) {
  const userRequest = myRequests?.find(r => r.listing_id === listing.id);
  const requestStatus = userRequest?.status || null;
  const canRequest = listing.status === "available" && !requestStatus;

  const formatCurrency = (amount) =>
    `KSh ${Number(amount || 0).toLocaleString("en-KE")}`;

  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    return new Date(isoString).toLocaleDateString("en-KE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const amounts = {
    wasteAmount: listing.waste_value || 10,
    transportFee: listing.transport_fee || 10,
    platformFee: listing.platform_fee || 10,
    totalAmount: listing.total_amount || 30,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{listing.waste_type}</h2>
            <p className="mt-1 text-sm text-gray-500">
              Listed by {listing.supplier_name || "Unknown Supplier"} on {formatDate(listing.created_at)}
            </p>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 rounded-2xl overflow-hidden bg-gray-100 h-48 flex items-center justify-center relative">
          <img
            src={listing.image_url || "https://images.unsplash.com/photo-1581092335871-4c4c8b7cfad9?auto=format&fit=crop&w=800&q=85"}
            alt={listing.waste_type}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1581092335871-4c4c8b7cfad9?auto=format&fit=crop&w=800&q=85";
            }}
          />
          {requestStatus && (
            <div className="absolute top-3 left-3">
              <span className="text-xs font-display font-black px-3 py-1.5 rounded-full bg-[#11402D]/80 text-white backdrop-blur-sm border border-white/20">
                {requestStatus.replace("_", " ")}
              </span>
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-gray-50 p-4">
            <h3 className="mb-3 font-bold text-gray-900">Waste Information</h3>
            <div className="space-y-2 text-sm">
              <Row label="Quantity" value={`${listing.quantity || 0} ${listing.unit || "kg"}`} />
              <Row label="Category" value={listing.category || "General"} />
              <Row label="Location" value={listing.location || "N/A"} />
              <Row label="Supplier" value={listing.supplier_name || "Unknown Supplier"} />
            </div>
          </div>

          <div className="rounded-2xl bg-[#F4FBF6] p-4">
            <h3 className="mb-3 font-bold text-gray-900">Estimated Payment</h3>
            <div className="space-y-2 text-sm">
              <Row label="Waste Amount" value={formatCurrency(amounts.wasteAmount)} />
              <Row label="Transport Fee" value={formatCurrency(amounts.transportFee)} />
              <Row label="Platform Fee" value={formatCurrency(amounts.platformFee)} />
              <div className="border-t border-green-100 pt-2">
                <Row label="Total Amount" value={formatCurrency(amounts.totalAmount)} strong />
              </div>
            </div>
          </div>
        </div>

        {listing.description && (
          <div className="mt-4 rounded-2xl border border-gray-100 p-4">
            <h3 className="mb-2 font-bold text-gray-900">Description</h3>
            <p className="text-sm text-gray-600">{listing.description}</p>
          </div>
        )}

        <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
          <div className="flex items-center gap-2 font-bold">
            <Truck className="h-4 w-4" />
            Workflow
          </div>
          <p className="mt-1">
            {requestStatus
              ? `You have already ${requestStatus} this request. Track it in "My Requests".`
              : "Request waste first. After the supplier approves it, you will pay through M-Pesa from My Requests."}
          </p>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 py-3 font-bold text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>

          {canRequest ? (
            <button
              onClick={() => onRequest(listing.id)}
              disabled={requesting === listing.id}
              className="flex-1 rounded-xl bg-[#11402D] py-3 font-bold text-white hover:bg-[#0E2A1C] disabled:opacity-70"
            >
              {requesting === listing.id ? "Sending..." : "Request Waste"}
            </button>
          ) : requestStatus && (
            <button
              onClick={() => window.location.href = "/producer/requests"}
              className="flex-1 rounded-xl bg-gray-200 py-3 font-bold text-gray-700 hover:bg-gray-300"
            >
              View Request
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, strong }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-gray-500">{label}</span>
      <span className={strong ? "font-bold text-[#11402D]" : "font-medium text-gray-800"}>
        {value}
      </span>
    </div>
  );
}

/* ─── MAIN MARKETPLACE PAGE ─── */
export default function MarketplacePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [listings, setListings] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllListings, setShowAllListings] = useState(false);
  const [requesting, setRequesting] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const { scrollYProgress } = useScroll();
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const getToken = () => localStorage.getItem("token");

  const fetchData = async () => {
    setLoading(true);
    setError("");

    // ─── Check if user is authenticated ─────────────────────
    const token = getToken();
    if (!token) {
      setError("Please log in to view the marketplace.");
      setLoading(false);
      return;
    }

    try {
      const [listingsRes, requestsRes] = await Promise.all([
        fetch(`${API_URL}/producer/available-waste`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/producer/requests`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const listingsData = await listingsRes.json().catch(() => ({}));
      const requestsData = await requestsRes.json().catch(() => ({}));

      if (listingsRes.status === 401 || listingsRes.status === 403) {
        setError("Your session has expired. Please log in again.");
        setLoading(false);
        return;
      }

      if (!listingsRes.ok) {
        throw new Error(listingsData.message || "Failed to load marketplace");
      }

      setListings(Array.isArray(listingsData) ? listingsData : []);
      setMyRequests(Array.isArray(requestsData) ? requestsData : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredListings = useMemo(() => {
    let filtered = [...listings];
    if (selectedCategory?.id !== "all") {
      const categoryMap = {
        organic: ["Organic Waste", "Food Waste", "Hotel Waste", "Restaurant Waste", "Market Waste", "Fruit Waste"],
        agricultural: ["Agricultural Waste", "Rice Husks", "Maize Stalks", "Sugarcane Bagasse", "Coffee Husks"],
        plastic: ["Plastic Waste", "PET Bottles", "Plastic Containers", "Plastic Bags"],
        industrial: ["Industrial Waste", "Scrap Metal", "Wood Chips", "Sawdust"],
        biomass: ["Biomass Waste", "Wood Chips", "Sawdust", "Biomass Pellets"],
        municipal: ["Municipal Waste", "Household Waste", "Commercial Waste"],
      };
      const keywords = categoryMap[selectedCategory.id] || [];
      if (keywords.length) {
        filtered = filtered.filter(item =>
          keywords.some(k => item.waste_type?.toLowerCase().includes(k.toLowerCase()))
        );
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (item) =>
          item.waste_type?.toLowerCase().includes(q) ||
          item.location?.toLowerCase().includes(q) ||
          item.supplier_name?.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [listings, selectedCategory, searchQuery]);

  const displayedListings = showAllListings ? filteredListings : filteredListings.slice(0, 6);

  const handleRequest = async (listingId) => {
    setRequesting(listingId);
    try {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`${API_URL}/producer/request-waste/${listingId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: "I would like to request this waste." }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }

      toast.success("Waste request sent successfully");
      await fetchData();
      setSelectedListing(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRequesting(null);
    }
  };

  // ─── Loading state ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-[#11402D] border-t-[#9CF06B]" />
          <p className="mt-4 text-gray-500">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  // ─── Error state ────────────────────────────────────────────
  if (error) {
    const isAuthError = error === "Please log in to view the marketplace." || error === "Your session has expired. Please log in again.";
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className={`mx-auto max-w-2xl rounded-3xl border ${isAuthError ? 'border-yellow-200 bg-yellow-50' : 'border-red-200 bg-red-50'} p-8 text-center`}>
          <AlertCircle className={`mx-auto mb-4 h-16 w-16 ${isAuthError ? 'text-yellow-500' : 'text-red-500'}`} />
          <h3 className={`text-xl font-bold ${isAuthError ? 'text-yellow-700' : 'text-red-700'}`}>
            {isAuthError ? 'Authentication Required' : 'Unable to Load Marketplace'}
          </h3>
          <p className={`mt-2 ${isAuthError ? 'text-yellow-600' : 'text-red-600'}`}>{error}</p>
          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            {isAuthError ? (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="rounded-xl bg-[#11402D] px-6 py-3 font-medium text-white hover:bg-[#0E2A1C]"
                >
                  Log In
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="rounded-xl border border-[#11402D] px-6 py-3 font-medium text-[#11402D] hover:bg-[#11402D]/5"
                >
                  Register
                </button>
              </>
            ) : (
              <button
                onClick={fetchData}
                className="rounded-xl bg-red-600 px-6 py-3 font-medium text-white hover:bg-red-700"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Main render ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F6F8F4] text-[#142019] overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono-cw { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      {/* Scroll progress */}
      <motion.div className="fixed top-0 left-0 h-0.5 bg-[#9CF06B] z-50 origin-left"
        style={{ width: progressWidth }} />

      {/* ─── HERO ─── */}
      <section className="relative min-h-[55vh] flex items-center bg-white pt-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-10 w-96 h-96 bg-[#9CF06B]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-[#11402D]/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-10 lg:py-14 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="w-8 h-px bg-[#11402D]" />
                <span className="font-mono-cw text-xs font-bold tracking-wider text-[#11402D] uppercase">Connecting Waste to Energy</span>
              </div>

              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-[#0E2A1C] leading-[1.1] tracking-tight mb-4">
                Connecting Waste Sources
                <br />
                <span className="relative inline-block">
                  <span className="relative z-10 text-[#11402D]">With Clean Energy</span>
                  <svg className="absolute -bottom-2 left-0 w-full" height="10" viewBox="0 0 450 10" preserveAspectRatio="none">
                    <path d="M2 6C80 2 370 2 448 6" stroke="#9CF06B" strokeWidth="5" strokeLinecap="round" fill="none" />
                  </svg>
                </span>
                <span className="text-[#11402D]">Producers</span>
              </h1>

              <p className="text-lg text-[#142019]/65 leading-relaxed max-w-lg mb-8">
                Transforming waste into valuable energy, fertilizer, biomass fuel, biochar, and recycled materials.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => document.getElementById("listings-section")?.scrollIntoView({ behavior: "smooth" })}
                  className="bg-[#11402D] text-white font-display font-bold px-8 py-3.5 rounded-full text-sm shadow-lg flex items-center gap-2"
                >
                  Browse Opportunities <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="border-2 border-[#11402D]/20 text-[#11402D] font-display font-bold px-8 py-3.5 rounded-full text-sm hover:border-[#11402D] hover:bg-[#11402D]/5 transition-all"
                >
                  Join Marketplace
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1581092335871-4c4c8b7cfad9?auto=format&fit=crop&w=1200&q=85"
                  alt="Waste to Energy"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B2417]/50 via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-xl p-4 border border-[#11402D]/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#11402D] flex items-center justify-center">
                    <Zap className="w-5 h-5 text-[#9CF06B]" />
                  </div>
                  <div>
                    <div className="font-display font-bold text-[#0E2A1C]">{listings.length} Listings</div>
                    <div className="text-xs text-[#5A7060]">Live across Africa</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="bg-[#0E2A1C] py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: listings.length, label: "Active Listings", icon: Package },
              { value: new Set(listings.map(l => l.supplier_id)).size, label: "Waste Suppliers", icon: Building2 },
              { value: 320, label: "Energy Producers", icon: Zap },
              { value: 150, label: "Transport Partners", icon: Truck },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <Icon className="w-6 h-6 text-[#9CF06B] mx-auto mb-2" />
                  <div className="font-display text-2xl md:text-3xl font-bold text-[#9CF06B]">
                    <Counter to={stat.value} />
                  </div>
                  <div className="font-display text-xs text-white/50 mt-1">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── SEARCH BAR ─── */}
      <section className="py-4 bg-white border-b border-[#11402D]/5 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#142019]/55" />
              <input
                type="text"
                placeholder="Search waste materials, opportunities, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#11402D]/10 focus:border-[#11402D] focus:ring-2 focus:ring-[#11402D]/10 transition-all bg-[#F6F8F4] text-sm"
              />
            </div>
            <button
              onClick={() => fetchData()}
              className="px-6 py-3 rounded-xl bg-[#11402D] text-white font-display font-bold text-sm flex items-center gap-2 whitespace-nowrap"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES & LISTINGS ─── */}
      <section id="listings-section" className="py-8 bg-[#F6F8F4]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <div className="lg:w-72 flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-sm border border-[#11402D]/5 overflow-hidden sticky top-28">
                <div className="p-4 border-b border-[#11402D]/5">
                  <h2 className="font-display font-bold text-[#0E2A1C]">Categories</h2>
                  <p className="text-xs text-[#142019]/55">Browse waste & opportunities</p>
                </div>
                <div className="py-2 max-h-[calc(100vh-250px)] overflow-y-auto">
                  {CATEGORIES.map((category) => (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      isActive={selectedCategory?.id === category.id}
                      onClick={() => setSelectedCategory(category)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Listings */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display font-bold text-xl text-[#0E2A1C]">
                    {selectedCategory?.name} • {filteredListings.length} Listings
                  </h2>
                  <p className="text-sm text-[#142019]/55">
                    {selectedCategory?.description || "All waste opportunities"}
                  </p>
                </div>
                <span className="font-mono-cw text-xs text-[#142019]/55">Updated: {new Date().toLocaleTimeString()}</span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedCategory?.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid md:grid-cols-2 xl:grid-cols-3 gap-5"
                >
                  {displayedListings.map((item, i) => (
                    <ListingCard
                      key={item.id}
                      item={item}
                      i={i}
                      onRequest={handleRequest}
                      requesting={requesting}
                      selected={selectedListing}
                      onSelect={setSelectedListing}
                      myRequests={myRequests}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>

              {filteredListings.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-[#11402D]/5 flex items-center justify-center mx-auto mb-4">
                    <Search className="w-10 h-10 text-[#142019]/55" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-[#0E2A1C] mb-2">No listings found</h3>
                  <p className="text-[#142019]/55">Try adjusting your search or category</p>
                </div>
              )}

              {filteredListings.length > 6 && !showAllListings && (
                <motion.div className="mt-8 text-center">
                  <button
                    onClick={() => setShowAllListings(true)}
                    className="inline-flex items-center gap-2 border-2 border-[#11402D]/12 text-[#11402D] font-display font-black px-8 py-3.5 rounded-xl text-sm hover:bg-[#11402D] hover:text-white hover:border-[#11402D] transition-all"
                  >
                    Load More Listings <ChevronDown className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <div className="flex justify-center mb-6">
              <div className="w-12 h-px bg-[#11402D]" />
            </div>
            <p className="font-mono-cw text-sm uppercase tracking-wider text-[#11402D]/80 mb-3">How It Works</p>
            <h2 className="font-display text-4xl sm:text-5xl text-[#0E2A1C] mb-4">From Waste to Value</h2>
            <p className="text-lg text-[#142019]/65">A simple process that turns waste into valuable energy</p>
          </motion.div>

          <div className="grid md:grid-cols-5 gap-4">
            {HOW_IT_WORKS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative text-center"
                >
                  <div className="bg-[#F6F8F4] rounded-2xl p-6 hover:shadow-xl transition-all group">
                    <div className="w-16 h-16 rounded-full bg-[#11402D] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-8 h-8 text-[#9CF06B]" />
                    </div>
                    <div className="font-mono-cw text-xs font-bold text-[#9CF06B] bg-[#11402D] inline-block px-2 py-0.5 rounded-full mb-2">
                      Step {step.step}
                    </div>
                    <h3 className="font-display font-bold text-[#0E2A1C] text-sm">{step.title}</h3>
                    <p className="text-xs text-[#142019]/55 mt-1">{step.desc}</p>
                  </div>
                  {i < HOW_IT_WORKS.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-5 h-5 text-[#11402D]/20" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── ENERGY PRODUCTS ─── */}
      <section className="py-16 bg-[#F6F8F4]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <div className="flex justify-center mb-6">
              <div className="w-12 h-px bg-[#11402D]" />
            </div>
            <p className="font-mono-cw text-sm uppercase tracking-wider text-[#11402D]/80 mb-3">What We Produce</p>
            <h2 className="font-display text-4xl sm:text-5xl text-[#0E2A1C] mb-4">Energy Products From Waste</h2>
            <p className="text-lg text-[#142019]/65">Different waste streams become valuable energy products</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {ENERGY_PRODUCTS.map((product, i) => {
              const Icon = product.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-white rounded-2xl p-6 hover:shadow-xl transition-all border border-[#11402D]/5 group"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                    style={{ background: `${product.color}15` }}>
                    <Icon className="w-6 h-6" style={{ color: product.color }} />
                  </div>
                  <h3 className="font-display font-bold text-[#0E2A1C] text-lg">{product.title}</h3>
                  <p className="text-sm text-[#142019]/55 mt-1">{product.description}</p>
                  <p className="text-xs text-[#11402D] font-medium mt-2">{product.benefits}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-20 h-20 rounded-full bg-[#9CF06B]/10 flex items-center justify-center mx-auto mb-6">
              <Recycle className="w-10 h-10 text-[#9CF06B]" />
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-[#0E2A1C] mb-4">
              Turn Waste Into Opportunity
            </h2>
            <p className="text-lg text-[#142019]/65 max-w-2xl mx-auto mb-8">
              Join thousands of partners building a cleaner, greener, and more sustainable future.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => navigate("/register")}
                className="bg-[#11402D] text-white font-display font-bold px-8 py-4 rounded-full text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                Join Marketplace <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => window.location.href = "tel:+254700123456"}
                className="border-2 border-[#11402D]/20 text-[#11402D] font-display font-bold px-8 py-4 rounded-full text-sm hover:border-[#11402D] hover:bg-[#11402D]/5 transition-all"
              >
                <Phone className="w-4 h-4" /> Contact Sales
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-[#0E2A1C] text-white pt-14 sm:pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#9CF06B]/15 flex items-center justify-center">
                  <Recycle className="w-5 h-5 text-[#9CF06B]" />
                </div>
                <span className="font-display text-xl font-semibold">ReVive Energy</span>
              </div>
              <p className="text-white/50 text-sm leading-relaxed max-w-sm">
                Designing and operating waste-to-energy infrastructure that
                turns disposal problems into clean energy opportunities.
              </p>
            </div>

            {[
              ["Company", ["About", "Careers", "Newsroom", "ESG Reports"]],
              ["Solutions", ["Thermal Conversion", "Anaerobic Digestion", "Landfill Gas", "Hybrid Sites"]],
              ["Resources", ["Case Studies", "White Papers", "Community Data", "Investor Center"]],
            ].map(([title, links], index) => (
              <div key={index}>
                <h3 className="font-display font-semibold mb-4">{title}</h3>
                <ul className="space-y-2.5 text-sm text-white/50">
                  {links.map((link, i) => (
                    <li key={i}>
                      <a href="#" className="hover:text-[#9CF06B] transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-white/40 text-center sm:text-left">
            <span>© 2026 ReVive Energy. All rights reserved.</span>
            <div className="flex flex-wrap justify-center gap-5">
              <a href="#" className="hover:text-[#9CF06B] transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-[#9CF06B] transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* ─── DETAILS MODAL ─── */}
      {selectedListing && (
        <ListingDetailsModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onRequest={handleRequest}
          requesting={requesting}
          myRequests={myRequests}
        />
      )}
    </div>
  );
}