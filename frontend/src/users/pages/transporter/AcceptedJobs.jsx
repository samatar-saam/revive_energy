// src/users/pages/transporter/ActiveDeliveries.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Truck,
  MapPin,
  Package,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  Navigation,
  ShieldCheck,
  CreditCard,
  Building2,
  User,
  Search,
  Clock,
  Route,
  Camera,
  Phone,
  ArrowLeft,
} from "lucide-react";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function ActiveDeliveries() {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const getToken = () => localStorage.getItem("token");

  // ─── Role guard: only transporters can view this page ──────
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const allowedRoles = ["transporter", "transport-partner"];
        if (!allowedRoles.includes(user.role)) {
          toast.error("This page is for transporters only.");
          navigate("/dashboard/routes", { replace: true });
        }
      } catch {
        // ignore
      }
    }
  }, [navigate]);

  const fetchDeliveries = async () => {
    setLoading(true);
    setError("");

    try {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(`${API_URL}/transporter/accepted-jobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 403) {
        throw new Error("You are not authorized to view this page.");
      }

      if (!res.ok) throw new Error(data.message || "Failed to load active deliveries");

      const jobs = Array.isArray(data) ? data : data.jobs || [];
      setDeliveries(
        jobs.filter((job) =>
          ["accepted", "picked_up", "in_transit"].includes(job.status)
        )
      );
    } catch (err) {
      setError(err.message || "Something went wrong");
      setDeliveries([]);
      if (err.message.toLowerCase().includes("authorized")) {
        setTimeout(() => navigate("/dashboard/routes"), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (jobId, action) => {
    setUpdatingId(jobId);
    setError("");

    try {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(`${API_URL}/transporter/jobs/${jobId}/${action}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to update delivery status");

      toast.success("Delivery status updated");
      await fetchDeliveries();
    } catch (err) {
      toast.error(err.message || "Could not update delivery");
      setError(err.message || "Could not update delivery");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleContact = (job) => {
    const phone = job.supplier_phone || job.producer_phone;
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      toast.info("No phone number available for this job.");
    }
  };

  const handleProof = (job) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("proof_image", file);
      formData.append("job_id", job.id);

      try {
        const token = getToken();
        const res = await fetch(`${API_URL}/transporter/jobs/${job.id}/proof`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Upload failed");
        }
        toast.success("Proof uploaded successfully");
      } catch (err) {
        toast.error(err.message || "Failed to upload proof");
      }
    };
    input.click();
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const filteredDeliveries = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return deliveries;

    return deliveries.filter((job) =>
      [
        job.waste_type,
        job.pickup_location,
        job.delivery_location,
        job.supplier_name,
        job.producer_name,
        job.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [deliveries, searchQuery]);

  const formatCurrency = (amount) =>
    `KSh ${Number(amount || 0).toLocaleString("en-KE")}`;

  const getEarnings = (job) =>
    Number(job.transport_fee || job.estimated_earnings || job.earnings || 0);

  const getStatusBadge = (status) => {
    const map = {
      accepted: "bg-yellow-100 text-yellow-700",
      picked_up: "bg-blue-100 text-blue-700",
      in_transit: "bg-purple-100 text-purple-700",
      delivered: "bg-green-100 text-green-700",
      completed: "bg-gray-100 text-gray-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return map[status] || "bg-gray-100 text-gray-700";
  };

  const getStatusLabel = (status) => {
    const map = {
      accepted: "Accepted",
      picked_up: "Picked Up",
      in_transit: "In Transit",
      delivered: "Delivered",
      completed: "Completed",
      cancelled: "Cancelled",
    };
    return map[status] || status;
  };

  const nextAction = (status) => {
    if (status === "accepted") {
      return {
        label: "Mark Picked Up",
        action: "picked-up",
        className: "bg-blue-600 hover:bg-blue-700",
        icon: Package,
      };
    }
    if (status === "picked_up") {
      return {
        label: "Start Transit",
        action: "in-transit",
        className: "bg-[#11402D] hover:bg-[#0E2A1C]",
        icon: Navigation,
      };
    }
    if (status === "in_transit") {
      return {
        label: "Mark Delivered",
        action: "delivered",
        className: "bg-green-600 hover:bg-green-700",
        icon: CheckCircle,
      };
    }
    return null;
  };

  const stats = useMemo(() => {
    const active = deliveries.length;
    const pickedUp = deliveries.filter((d) => d.status === "picked_up").length;
    const inTransit = deliveries.filter((d) => d.status === "in_transit").length;
    const totalEarnings = deliveries.reduce((sum, d) => sum + getEarnings(d), 0);
    return { active, pickedUp, inTransit, totalEarnings };
  }, [deliveries]);

  // ─── Loading state ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-[#11402D] border-t-[#9CF06B]" />
          <p className="mt-4 text-sm text-gray-500">Loading active deliveries...</p>
        </div>
      </div>
    );
  }

  // ─── Error state ────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] px-4 py-8">
        <div className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto h-14 w-14 text-red-500" />
          <h2 className="mt-4 font-display text-xl font-bold text-red-700">Unable to Load</h2>
          <p className="mt-2 text-sm text-red-600">{error}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={fetchDeliveries}
              className="rounded-2xl bg-red-600 px-6 py-2.5 font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate("/dashboard/routes")}
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-300 bg-white px-6 py-2.5 font-semibold text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Go to Route Tracking
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main content ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Inter']">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono-cw { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
        {/* Header */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="font-display text-2xl lg:text-3xl font-bold text-[#0E2A1C]">Active Deliveries</h1>
              <p className="mt-1 text-sm text-[#5A7060]">
                Manage live pickups, transit updates, and delivery completion.
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

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat label="Active" value={stats.active} icon={Truck} />
          <Stat label="Picked Up" value={stats.pickedUp} icon={Package} color="text-blue-600" />
          <Stat label="In Transit" value={stats.inTransit} icon={Navigation} color="text-purple-600" />
          <Stat label="Earnings" value={formatCurrency(stats.totalEarnings)} icon={CreditCard} color="text-[#11402D]" />
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search active deliveries..."
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Empty state */}
        {filteredDeliveries.length === 0 && (
          <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <Truck className="mx-auto h-16 w-16 text-[#11402D]" />
            <h2 className="mt-4 font-display text-xl font-bold text-gray-900">No active deliveries</h2>
            <p className="mx-auto mt-2 max-w-md text-[#5A7060]">
              Active jobs will appear here once you accept and start delivery work.
            </p>
          </div>
        )}

        {/* Delivery Cards */}
        {filteredDeliveries.length > 0 && (
          <div className="grid gap-5 lg:grid-cols-2">
            {filteredDeliveries.map((job) => {
              const action = nextAction(job.status);
              const ActionIcon = action?.icon;
              const earnings = getEarnings(job);

              return (
                <div key={job.id} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#11402D]/10">
                        <Truck className="h-6 w-6 text-[#11402D]" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-gray-900">
                          {job.waste_type || "Active Delivery"}
                        </h3>
                        <p className="mt-1 text-sm text-[#5A7060]">
                          Job #{job.id} · {getStatusLabel(job.status)}
                        </p>
                      </div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusBadge(job.status)}`}>
                      {getStatusLabel(job.status)}
                    </span>
                  </div>

                  <div className="mt-4 rounded-2xl bg-green-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-green-700">
                      <ShieldCheck className="h-4 w-4" />
                      Payment Protected
                    </div>
                    <p className="mt-1 text-xs text-green-700">
                      Your transport earning is secured until the producer confirms delivery.
                    </p>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <Info icon={Package} label="Quantity" value={`${job.quantity || "N/A"} ${job.unit || "kg"}`} />
                    <Info icon={CreditCard} label="Expected Earnings" value={formatCurrency(earnings)} />
                    <Info icon={Building2} label="Supplier" value={job.supplier_name || "Unknown Supplier"} />
                    <Info icon={User} label="Producer" value={job.producer_name || "Unknown Producer"} />
                    <Info icon={MapPin} label="Pickup Location" value={job.pickup_location || "Not specified"} />
                    <Info icon={MapPin} label="Delivery Location" value={job.delivery_location || "Not specified"} />
                  </div>

                  <ProgressTimeline status={job.status} />

                  <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                      <Route className="h-4 w-4 text-[#11402D]" />
                      Route Preview
                    </div>
                    <p className="mt-2 text-sm text-[#5A7060]">
                      {job.pickup_location || "Pickup location"} → {job.delivery_location || "Delivery location"}
                    </p>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <button
                      onClick={() => handleContact(job)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                    >
                      <Phone className="h-4 w-4" />
                      Contact
                    </button>
                    <button
                      onClick={() => handleProof(job)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                    >
                      <Camera className="h-4 w-4" />
                      Proof
                    </button>
                    {action ? (
                      <button
                        onClick={() => updateStatus(job.id, action.action)}
                        disabled={updatingId === job.id}
                        className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white disabled:opacity-50 transition ${action.className}`}
                      >
                        <ActionIcon className="h-4 w-4" />
                        {updatingId === job.id ? "Updating..." : action.label}
                      </button>
                    ) : (
                      <div className="rounded-2xl bg-gray-100 px-4 py-3 text-center text-sm font-semibold text-gray-500">
                        No action
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Subcomponents ────────────────────────────────────────────

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

function Info({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-gray-50 p-4">
      <Icon className="mt-0.5 h-5 w-5 text-[#11402D]" />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
        <p className="mt-1 truncate text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function ProgressTimeline({ status }) {
  const steps = [
    { key: "accepted", label: "Accepted" },
    { key: "picked_up", label: "Picked Up" },
    { key: "in_transit", label: "In Transit" },
    { key: "delivered", label: "Delivered" },
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