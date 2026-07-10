// src/users/pages/transporter/RouteTracking.jsx
import { useEffect, useState } from "react";
import {
  MapPin,
  Truck,
  Navigation,
  Clock,
  CheckCircle,
  Route,
  RefreshCw,
  AlertCircle,
  Package,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function RouteTracking() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRoutes = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated. Please log in again.");

      const response = await fetch(`${API_URL}/transporter/accepted-jobs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log("RouteTracking API response:", data); // Debug log

      // Accept both { jobs: [...] } or raw array
      const jobs = Array.isArray(data) ? data : data.jobs || [];
      setRoutes(jobs);
    } catch (err) {
      console.error("RouteTracking fetch error:", err);
      setError(err.message || "Failed to load routes");
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-[#11402D] border-t-[#9CF06B]" />
          <p className="mt-4 text-gray-500">Loading routes...</p>
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
        {/* Header */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl lg:text-3xl font-bold text-[#0E2A1C]">Route Tracking</h1>
              <p className="text-sm text-[#5A7060] mt-1">Track all active transport routes.</p>
            </div>

            <button
              onClick={fetchRoutes}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        {!error && routes.length > 0 && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard title="Active Routes" value={routes.length} icon={Route} color="blue" />
            <StatCard
              title="In Transit"
              value={routes.filter((r) => r.status === "in_transit").length}
              icon={Truck}
              color="green"
            />
            <StatCard
              title="Picked Up"
              value={routes.filter((r) => r.status === "picked_up").length}
              icon={Package}
              color="yellow"
            />
            <StatCard
              title="Delivered"
              value={routes.filter((r) => r.status === "delivered").length}
              icon={CheckCircle}
              color="emerald"
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!error && routes.length === 0 && (
          <div className="rounded-3xl bg-white p-12 text-center border border-gray-100 shadow-sm">
            <Route className="mx-auto h-16 w-16 text-[#11402D]" />
            <h2 className="mt-4 font-display text-xl font-bold text-gray-900">No Active Routes</h2>
            <p className="mt-2 text-[#5A7060] max-w-md mx-auto">
              Accepted deliveries will appear here once you accept a job and start the delivery process.
            </p>
          </div>
        )}

        {/* Routes */}
        {!error && routes.length > 0 && (
          <div className="grid gap-5">
            {routes.map((route) => (
              <div
                key={route.id}
                className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h3 className="font-display font-bold text-lg text-gray-900">
                      {route.waste_type || "Transport Job"}
                    </h3>
                    <p className="text-sm text-[#5A7060]">Job #{route.id} · {route.quantity} {route.unit || "kg"}</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                    {route.status?.replaceAll("_", " ") || "Unknown"}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-5">
                  <InfoCard icon={MapPin} title="Pickup Location" value={route.pickup_location || "Not specified"} />
                  <InfoCard icon={MapPin} title="Delivery Location" value={route.delivery_location || "Not specified"} />
                </div>

                {/* Progress */}
                <div className="mt-6">
                  <h4 className="font-display font-semibold text-gray-700 mb-3">Delivery Progress</h4>
                  <div className="flex flex-wrap items-center gap-2">
                    <Step active={true} label="Accepted" />
                    <span className="text-gray-300">→</span>
                    <Step active={route.status !== "accepted"} label="Picked Up" />
                    <span className="text-gray-300">→</span>
                    <Step active={["in_transit", "delivered", "completed"].includes(route.status)} label="In Transit" />
                    <span className="text-gray-300">→</span>
                    <Step active={["delivered", "completed"].includes(route.status)} label="Delivered" />
                  </div>
                </div>

                {/* Map Placeholder */}
                <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                  <Navigation className="mx-auto h-10 w-10 text-[#11402D]" />
                  <h4 className="mt-3 font-display font-semibold text-gray-700">Live Route Map</h4>
                  <p className="mt-2 text-sm text-[#5A7060]">Google Maps / OpenStreetMap integration will appear here.</p>
                </div>

                {/* ETA */}
                <div className="mt-5 flex items-center gap-2 text-sm text-[#5A7060]">
                  <Clock className="w-4 h-4 text-[#11402D]" />
                  Estimated Arrival: {route.eta || "30 - 45 Minutes"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  const colorMap = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    yellow: "text-yellow-600 bg-yellow-50",
    emerald: "text-emerald-600 bg-emerald-50",
  };
  const style = colorMap[color] || colorMap.blue;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className={`rounded-xl p-2 ${style}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="font-display text-2xl font-bold text-gray-900">{value}</span>
      </div>
      <p className="mt-3 text-sm text-[#5A7060]">{title}</p>
    </div>
  );
}

function InfoCard({ icon: Icon, title, value }) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4">
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 text-[#11402D] mt-0.5" />
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-400">{title}</p>
          <p className="font-medium text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function Step({ active, label }) {
  return (
    <div
      className={`rounded-full px-4 py-2 text-sm font-medium ${
        active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
      }`}
    >
      {label}
    </div>
  );
}