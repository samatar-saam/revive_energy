import { useEffect, useState } from "react";
import {
  Truck,
  MapPin,
  Package,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  Navigation,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function ActiveDeliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  const fetchDeliveries = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/transporter/accepted-jobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to load active deliveries");

      const data = await res.json();
      const jobs = Array.isArray(data) ? data : data.jobs || [];

      const active = jobs.filter((job) =>
        ["accepted", "picked_up", "in_transit"].includes(job.status)
      );

      setDeliveries(active);
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

      const res = await fetch(`${API_URL}/transporter/jobs/${jobId}/${action}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to update delivery status");

      await fetchDeliveries();
    } catch (err) {
      setError(err.message || "Could not update delivery");
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

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
    <div className="space-y-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Active Deliveries</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track jobs currently accepted, picked up, or in transit.
            </p>
          </div>

          <button
            onClick={fetchDeliveries}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
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

      {deliveries.length === 0 ? (
        <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <Truck className="mx-auto h-16 w-16 text-[#11402D]" />
          <h2 className="mt-4 text-xl font-bold text-gray-900">
            No active deliveries
          </h2>
          <p className="mx-auto mt-2 max-w-md text-gray-500">
            Accepted jobs will appear here once you start working on them.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {deliveries.map((job) => (
            <div
              key={job.id}
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
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
                      Status: {formatStatus(job.status)}
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {formatStatus(job.status)}
                </span>
              </div>

              <div className="mt-5 space-y-3">
                <Info icon={Package} label="Quantity" value={job.quantity || "Not specified"} />
                <Info icon={MapPin} label="Pickup Location" value={job.pickup_location || "Not specified"} />
                <Info icon={MapPin} label="Delivery Location" value={job.delivery_location || "Not specified"} />
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <button
                  onClick={() => updateStatus(job.id, "picked-up")}
                  disabled={updatingId === job.id || job.status !== "accepted"}
                  className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Picked Up
                </button>

                <button
                  onClick={() => updateStatus(job.id, "in-transit")}
                  disabled={updatingId === job.id || job.status !== "picked_up"}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#11402D] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  <Navigation className="h-4 w-4" />
                  In Transit
                </button>

                <button
                  onClick={() => updateStatus(job.id, "delivered")}
                  disabled={updatingId === job.id || job.status !== "in_transit"}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4" />
                  Delivered
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-gray-50 p-4">
      <Icon className="mt-0.5 h-5 w-5 text-[#11402D]" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          {label}
        </p>
        <p className="mt-1 text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function formatStatus(status) {
  if (!status) return "Unknown";
  return status.replaceAll("_", " ");
}