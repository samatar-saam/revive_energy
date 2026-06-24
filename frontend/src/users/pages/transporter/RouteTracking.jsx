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

      const response = await fetch(
        `${API_URL}/transporter/accepted-jobs`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load routes");
      }

      const data = await response.json();

      const jobs = Array.isArray(data)
        ? data
        : data.jobs || [];

      setRoutes(jobs);
    } catch (err) {
      setError(err.message);
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
          <p className="mt-4 text-gray-500">
            Loading routes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Route Tracking
            </h1>
            <p className="text-gray-500 mt-1">
              Track all active transport routes.
            </p>
          </div>

          <button
            onClick={fetchRoutes}
            className="flex items-center gap-2 rounded-xl border px-4 py-2 hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard
          title="Active Routes"
          value={routes.length}
          icon={Route}
          color="blue"
        />

        <StatCard
          title="In Transit"
          value={
            routes.filter(
              (r) => r.status === "in_transit"
            ).length
          }
          icon={Truck}
          color="green"
        />

        <StatCard
          title="Picked Up"
          value={
            routes.filter(
              (r) => r.status === "picked_up"
            ).length
          }
          icon={Package}
          color="yellow"
        />

        <StatCard
          title="Delivered"
          value={
            routes.filter(
              (r) => r.status === "delivered"
            ).length
          }
          icon={CheckCircle}
          color="emerald"
        />
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        </div>
      )}

      {/* Routes */}
      {routes.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center border border-gray-100">
          <Route className="mx-auto h-16 w-16 text-[#11402D]" />
          <h2 className="mt-4 text-xl font-bold">
            No Active Routes
          </h2>
          <p className="mt-2 text-gray-500">
            Accepted deliveries will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-5">
          {routes.map((route) => (
            <div
              key={route.id}
              className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    {route.waste_type}
                  </h3>

                  <p className="text-sm text-gray-500">
                    Quantity: {route.quantity}
                  </p>
                </div>

                <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                  {route.status?.replaceAll("_", " ")}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-5">
                <InfoCard
                  icon={MapPin}
                  title="Pickup Location"
                  value={route.pickup_location}
                />

                <InfoCard
                  icon={MapPin}
                  title="Delivery Location"
                  value={route.delivery_location}
                />
              </div>

              {/* Progress */}
              <div className="mt-6">
                <h4 className="font-semibold mb-3">
                  Delivery Progress
                </h4>

                <div className="flex flex-wrap items-center gap-2">
                  <Step
                    active={true}
                    label="Accepted"
                  />

                  <span>→</span>

                  <Step
                    active={
                      route.status === "picked_up" ||
                      route.status === "in_transit" ||
                      route.status === "delivered"
                    }
                    label="Picked Up"
                  />

                  <span>→</span>

                  <Step
                    active={
                      route.status === "in_transit" ||
                      route.status === "delivered"
                    }
                    label="In Transit"
                  />

                  <span>→</span>

                  <Step
                    active={
                      route.status === "delivered"
                    }
                    label="Delivered"
                  />
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                <Navigation className="mx-auto h-10 w-10 text-[#11402D]" />

                <h4 className="mt-3 font-semibold">
                  Live Route Map
                </h4>

                <p className="mt-2 text-sm text-gray-500">
                  Google Maps / OpenStreetMap integration
                  will appear here.
                </p>
              </div>

              {/* ETA */}
              <div className="mt-5 flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                Estimated Arrival: 30 - 45 Minutes
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <Icon className="h-6 w-6 text-[#11402D]" />
        <span className="text-2xl font-bold">
          {value}
        </span>
      </div>

      <p className="mt-3 text-sm text-gray-500">
        {title}
      </p>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  value,
}) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4">
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 text-[#11402D]" />
        <div>
          <p className="text-xs uppercase text-gray-400">
            {title}
          </p>
          <p className="font-medium text-gray-900">
            {value || "Not specified"}
          </p>
        </div>
      </div>
    </div>
  );
}

function Step({ active, label }) {
  return (
    <div
      className={`rounded-full px-4 py-2 text-sm font-medium ${
        active
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-500"
      }`}
    >
      {label}
    </div>
  );
}