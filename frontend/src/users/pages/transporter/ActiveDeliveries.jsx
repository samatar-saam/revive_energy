import { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function ActiveDeliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchDeliveries = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(`${API_URL}/transporter/accepted-jobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));
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
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (jobId, action) => {
    setUpdatingId(jobId);
    setError("");

    try {
      const token = localStorage.getItem("token");
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

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const filteredDeliveries = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return deliveries;

    return deliveries.filter((delivery) =>
      [
        delivery.waste_type,
        delivery.pickup_location,
        delivery.delivery_location,
        delivery.supplier_name,
        delivery.producer_name,
        delivery.status,
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

  return (
    <div className="space-y-6 px-4">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Active Deliveries</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage live pickups, transit updates, and delivery completion.
            </p>
          </div>

          <button
            onClick={fetchDeliveries}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Active" value={deliveries.length} icon={Truck} />
        <Stat
          label="Picked Up"
          value={deliveries.filter((d) => d.status === "picked_up").length}
          icon={Package}
          color="text-blue-600"
        />
        <Stat
          label="In Transit"
          value={deliveries.filter((d) => d.status === "in_transit").length}
          icon={Navigation}
          color="text-purple-600"
        />
        <Stat
          label="Earnings"
          value={formatCurrency(deliveries.reduce((sum, d) => sum + getEarnings(d), 0))}
          icon={CreditCard}
          color="text-[#11402D]"
        />
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search active deliveries..."
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p className="font-medium">{error}</p>
          </div>
        </div>
      )}

      {filteredDeliveries.length === 0 ? (
        <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <Truck className="mx-auto h-16 w-16 text-[#11402D]" />
          <h2 className="mt-4 text-xl font-bold text-gray-900">No active deliveries</h2>
          <p className="mx-auto mt-2 max-w-md text-gray-500">
            Active jobs will appear here once you accept and start delivery work.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {filteredDeliveries.map((job) => {
            const action = nextAction(job.status);
            const ActionIcon = action?.icon;
            const earnings = getEarnings(job);

            return (
              <div
                key={job.id}
                className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#11402D]/10">
                      <Truck className="h-6 w-6 text-[#11402D]" />
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900">
                        {job.waste_type || "Active Delivery"}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Job #{job.id} · {formatStatus(job.status)}
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                    {formatStatus(job.status)}
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
                  <p className="mt-2 text-sm text-gray-600">
                    {job.pickup_location || "Pickup location"} → {job.delivery_location || "Delivery location"}
                  </p>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    <Phone className="h-4 w-4" />
                    Contact
                  </button>

                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    <Camera className="h-4 w-4" />
                    Proof
                  </button>

                  {action && (
                    <button
                      onClick={() => updateStatus(job.id, action.action)}
                      disabled={updatingId === job.id}
                      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white disabled:opacity-50 ${action.className}`}
                    >
                      <ActionIcon className="h-4 w-4" />
                      {updatingId === job.id ? "Updating..." : action.label}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, icon: Icon, color = "text-gray-900" }) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className={`mt-1 text-xl font-bold ${color}`}>{value}</p>
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

function formatStatus(status) {
  if (!status) return "Unknown";
  return status.replaceAll("_", " ");
}