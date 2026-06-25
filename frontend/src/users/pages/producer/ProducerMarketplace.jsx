// src/users/pages/producer/ProducerMarketplace.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Package,
  MapPin,
  Search,
  Filter,
  ChevronDown,
  RefreshCw,
  Plus,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  Building2,
  X,
  Truck,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function ProducerMarketplace() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [listings, setListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const [requesting, setRequesting] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);

  const getToken = () => localStorage.getItem("token");

  const fetchListings = async () => {
    setLoading(true);
    setError("");

    try {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`${API_URL}/producer/available-waste`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to load marketplace");
      }

      setListings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const locations = useMemo(() => {
    return [...new Set(listings.map((item) => item.location).filter(Boolean))];
  }, [listings]);

  const filteredListings = useMemo(() => {
    let filtered = [...listings];

    if (filterStatus !== "all") {
      filtered = filtered.filter((item) => item.status === filterStatus);
    }

    if (filterLocation !== "all") {
      filtered = filtered.filter((item) => item.location === filterLocation);
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
  }, [listings, searchQuery, filterStatus, filterLocation]);

  const estimateAmounts = (item) => {
    const quantity = Number(item.quantity || 0);

    const wasteAmount = item.waste_amount
      ? Number(item.waste_amount)
      : Math.max(quantity * 10, 500);

    const transportFee = item.transport_fee
      ? Number(item.transport_fee)
      : Math.max(quantity * 2, 300);

    const platformFee = Math.round((wasteAmount + transportFee) * 0.05);
    const totalAmount = wasteAmount + transportFee + platformFee;

    return {
      wasteAmount,
      transportFee,
      platformFee,
      totalAmount,
    };
  };

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
        body: JSON.stringify({
          message: "I would like to request this waste.",
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }

      toast.success("Waste request sent successfully");

      setListings((prev) =>
        prev.map((item) =>
          item.id === listingId ? { ...item, status: "requested" } : item
        )
      );

      setSelectedListing(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRequesting(null);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      available: "bg-green-100 text-green-700",
      requested: "bg-yellow-100 text-yellow-700",
      approved: "bg-emerald-100 text-emerald-700",
      assigned: "bg-blue-100 text-blue-700",
      collected: "bg-purple-100 text-purple-700",
      delivered: "bg-indigo-100 text-indigo-700",
      completed: "bg-gray-100 text-gray-700",
      cancelled: "bg-red-100 text-red-700",
    };

    return map[status] || "bg-gray-100 text-gray-700";
  };

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

  const statusOptions = ["all", "available", "requested", "approved", "assigned", "collected"];

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

  if (error) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
        <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
        <h3 className="text-xl font-bold text-red-700">Unable to Load Marketplace</h3>
        <p className="mt-2 text-red-600">{error}</p>
        <button
          onClick={fetchListings}
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
          <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
          <p className="mt-1 text-sm text-gray-500">
            Browse available waste and request supply from verified suppliers
          </p>
        </div>

        <button
          onClick={fetchListings}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Total Listings" value={listings.length} />
        <Stat label="Available" value={listings.filter((l) => l.status === "available").length} color="text-green-600" />
        <Stat label="Requested" value={listings.filter((l) => l.status === "requested").length} color="text-yellow-600" />
        <Stat label="Locations" value={locations.length} color="text-blue-600" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by waste type, location, supplier..."
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
                  {status.toUpperCase()}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>

          {locations.length > 0 && (
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="appearance-none rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-8 text-sm outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Locations</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          )}

          <span className="text-sm text-gray-500">
            {filteredListings.length} of {listings.length}
          </span>
        </div>
      </div>

      {filteredListings.length === 0 ? (
        <div className="rounded-3xl border border-gray-100 bg-white p-12 text-center shadow-sm">
          <Package className="mx-auto mb-4 h-16 w-16 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-700">No waste listings found</h3>
          <p className="mt-2 text-gray-500">Try adjusting your filters or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredListings.map((item) => {
            const amounts = estimateAmounts(item);

            return (
              <div
                key={item.id}
                className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-lg font-bold text-gray-900">
                      {item.waste_type}
                    </h4>
                    <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="h-3.5 w-3.5" />
                      {item.location}
                    </p>
                  </div>

                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${getStatusBadge(item.status)}`}>
                    {item.status || "unknown"}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-gray-700">
                  <Info icon={Package} label="Quantity" value={`${item.quantity} ${item.unit || "kg"}`} />
                  <Info icon={Building2} label="Supplier" value={item.supplier_name || "Unknown Supplier"} />
                  <Info icon={Clock} label="Listed" value={formatDate(item.created_at)} />
                  <Info icon={CreditCard} label="Estimated Total" value={formatCurrency(amounts.totalAmount)} strong />
                </div>

                <div className="mt-4 rounded-2xl bg-[#F4FBF6] p-3 text-xs text-gray-600">
                  <div className="flex items-center gap-2 font-semibold text-[#11402D]">
                    <ShieldCheck className="h-4 w-4" />
                    Payment protected by escrow
                  </div>
                  <p className="mt-1">
                    Supplier approval is required before payment. Transport starts after payment confirmation.
                  </p>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setSelectedListing(item)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Eye className="h-4 w-4" />
                    Details
                  </button>

                  {item.status === "available" ? (
                    <button
                      onClick={() => handleRequest(item.id)}
                      disabled={requesting === item.id}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#11402D] py-2 text-sm font-bold text-white hover:bg-[#0E2A1C] disabled:opacity-70"
                    >
                      {requesting === item.id ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          Request
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="flex flex-1 items-center justify-center rounded-xl bg-gray-50 py-2 text-sm text-gray-500">
                      Not available
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedListing && (
        <ListingDetailsModal
          listing={selectedListing}
          amounts={estimateAmounts(selectedListing)}
          requesting={requesting}
          onClose={() => setSelectedListing(null)}
          onRequest={() => handleRequest(selectedListing.id)}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
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

function Info({ icon: Icon, label, value, strong }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-gray-500">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      <span className={`truncate text-right ${strong ? "font-bold text-[#11402D]" : "font-medium text-gray-800"}`}>
        {value}
      </span>
    </div>
  );
}

function ListingDetailsModal({
  listing,
  amounts,
  requesting,
  onClose,
  onRequest,
  formatCurrency,
  formatDate,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{listing.waste_type}</h2>
            <p className="mt-1 text-sm text-gray-500">
              Listed on {formatDate(listing.created_at)}
            </p>
          </div>

          <button onClick={onClose} className="rounded-xl p-2 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-gray-50 p-4">
            <h3 className="mb-3 font-bold text-gray-900">Waste Information</h3>
            <div className="space-y-2 text-sm">
              <Row label="Quantity" value={`${listing.quantity} ${listing.unit || "kg"}`} />
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
                <Row label="Total Estimate" value={formatCurrency(amounts.totalAmount)} strong />
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
            Request waste first. After the supplier approves it, you will pay through M-Pesa from My Requests.
          </p>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 py-3 font-bold text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>

          {listing.status === "available" && (
            <button
              onClick={onRequest}
              disabled={requesting === listing.id}
              className="flex-1 rounded-xl bg-[#11402D] py-3 font-bold text-white hover:bg-[#0E2A1C] disabled:opacity-70"
            >
              {requesting === listing.id ? "Sending..." : "Request Waste"}
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