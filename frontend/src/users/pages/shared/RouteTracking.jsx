// src/users/pages/shared/RouteTracking.jsx
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  Crosshair,
  LoaderCircle,
  MapPin,
  Navigation,
  Phone,
  RefreshCw,
  Route,
  ShieldCheck,
  Truck,
  User,
  Wifi,
  WifiOff,
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

// ─── Helpers ────────────────────────────────────────────────────
function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function normalizeRole(role) {
  const map = {
    "transport-partner": "transporter",
    transporter: "transporter",
    supplier: "supplier",
    "waste-supplier": "supplier",
    producer: "producer",
    "energy-producer": "producer",
    admin: "admin",
  };
  return map[role] || role;
}

function formatStatus(status) {
  if (!status) return "Unknown";
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(value) {
  if (!value) return "Not available";
  return new Date(value).toLocaleString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isAtLeastStatus(currentStatus, targetStatus) {
  const order = [
    "open",
    "accepted",
    "heading_to_pickup",
    "arrived_at_pickup",
    "picked_up",
    "in_transit",
    "arrived_at_destination",
    "awaiting_confirmation",
    "completed",
  ];
  const currentIndex = order.indexOf(currentStatus);
  const targetIndex = order.indexOf(targetStatus);
  if (currentIndex === -1 || targetIndex === -1) return false;
  return currentIndex >= targetIndex;
}

// ─── Map Re-center component ──────────────────────────────────
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

// ─── Job List Component ────────────────────────────────────────
function JobList({ jobs, loading, onSelect, onRefresh, error }) {
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoaderCircle className="h-12 w-12 animate-spin text-[#11402D]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
        <AlertCircle className="mx-auto h-14 w-14 text-red-500" />
        <h2 className="mt-4 text-xl font-bold text-red-700">Unable to Load Jobs</h2>
        <p className="mt-2 text-sm text-red-600">{error}</p>
        <button
          onClick={onRefresh}
          className="mt-6 rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-gray-200 bg-white p-12 text-center shadow-sm">
        <Route className="mx-auto h-16 w-16 text-[#11402D]" />
        <h2 className="mt-4 text-xl font-bold text-gray-900">No Active Jobs</h2>
        <p className="mt-2 text-sm text-gray-500">
          You don't have any jobs available for live tracking at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job) => (
        <div
          key={job.job_id}
          className="cursor-pointer rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          onClick={() => onSelect(job.job_id)}
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-gray-900">{job.waste_type}</h3>
              <p className="text-sm text-gray-500">Job #{job.job_id}</p>
            </div>
            <span className="rounded-full bg-[#E8F5EE] px-3 py-1 text-xs font-semibold text-[#11402D]">
              {formatStatus(job.status)}
            </span>
          </div>
          <div className="mt-3 space-y-1 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>{job.pickup_location?.name || "Pickup"}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>{job.delivery_location?.name || "Delivery"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-gray-400" />
              <span>{job.transporter?.name || "No transporter assigned"}</span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="font-medium text-[#11402D]">Track</span>
            <Navigation className="h-4 w-4 text-[#11402D]" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────
export default function RouteTracking() {
  // ─── All useState hooks (always in this order) ─────────────
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [history, setHistory] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState(null);
  const [sharingLocation, setSharingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // ─── All useRef hooks ──────────────────────────────────────
  const watcherRef = useRef(null);
  const latestSentAtRef = useRef(0);

  // ─── All useMemo hooks (BEFORE any early return) ──────────
  const user = useMemo(() => getStoredUser(), []);
  const userRole = normalizeRole(user?.role || "");
  const isTransporter = userRole === "transporter";

  // Compute route positions from history (safe even if empty)
  const routePositions = useMemo(
    () =>
      history
        .filter((point) => point.latitude != null && point.longitude != null)
        .map((point) => [point.latitude, point.longitude]),
    [history]
  );

  // Next action based on current status
  const nextAction = useMemo(() => {
    const status = tracking?.status;
    const actions = {
      accepted: { label: "Start Trip to Pickup", nextStatus: "heading_to_pickup" },
      heading_to_pickup: { label: "Mark Arrived at Pickup", nextStatus: "arrived_at_pickup" },
      arrived_at_pickup: { label: "Confirm Waste Pickup", nextStatus: "picked_up" },
      picked_up: { label: "Start Delivery", nextStatus: "in_transit" },
      in_transit: { label: "Mark Arrived at Destination", nextStatus: "arrived_at_destination" },
      arrived_at_destination: { label: "Confirm Handover", nextStatus: "awaiting_confirmation" },
    };
    return actions[status] || null;
  }, [tracking]);

  // ─── Helper function to get token ──────────────────────────
  const getToken = () => localStorage.getItem("token");

  // ─── All useCallback hooks ──────────────────────────────────
  const fetchActiveJobs = useCallback(async () => {
    setJobsLoading(true);
    setJobsError(null);
    try {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");
      const response = await fetch(`${API_URL}/tracking/jobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Failed to load jobs");
      setJobs(data.jobs || []);
    } catch (err) {
      setJobsError(err.message);
    } finally {
      setJobsLoading(false);
    }
  }, []);

  const fetchTracking = useCallback(
    async (silent = false) => {
      if (!selectedJobId) return;
      if (!silent) setLoading(true);
      else setRefreshing(true);
      setError(null);

      try {
        const token = getToken();
        if (!token) throw new Error("You are not authenticated");
        const response = await fetch(`${API_URL}/tracking/jobs/${selectedJobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || "Unable to load tracking");
        setTracking(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedJobId]
  );

  const fetchHistory = useCallback(async () => {
    if (!selectedJobId) return;
    try {
      const token = getToken();
      if (!token) return;
      const response = await fetch(`${API_URL}/tracking/jobs/${selectedJobId}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => []);
      if (response.ok) setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Route history error:", err);
    }
  }, [selectedJobId]);

  const sendLocation = useCallback(
    async (position) => {
      try {
        const currentTime = Date.now();
        if (currentTime - latestSentAtRef.current < 8000) return;
        latestSentAtRef.current = currentTime;

        const token = getToken();
        const payload = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          speed: position.coords.speed != null ? position.coords.speed * 3.6 : 0,
          heading: position.coords.heading || 0,
          accuracy: position.coords.accuracy || 0,
        };
        const response = await fetch(`${API_URL}/tracking/jobs/${selectedJobId}/location`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || "Unable to share location");
        setLocationError(null);
        setTracking((prev) =>
          prev
            ? {
                ...prev,
                current_location: {
                  ...payload,
                  updated_at: new Date().toISOString(),
                },
              }
            : prev
        );
      } catch (err) {
        setLocationError(err.message);
      }
    },
    [selectedJobId]
  );

  // ─── All useEffect hooks ────────────────────────────────────
  // Load jobs when no job selected; load tracking when a job is selected
  useEffect(() => {
    if (!selectedJobId) {
      fetchActiveJobs();
      setTracking(null);
      setHistory([]);
      setError(null);
      return;
    }
    fetchTracking();
    fetchHistory();
  }, [selectedJobId, fetchTracking, fetchHistory, fetchActiveJobs]);

  // Auto-refresh every 5 seconds when tracking a job
  useEffect(() => {
    if (!selectedJobId) return;
    const interval = window.setInterval(() => {
      fetchTracking(true);
      fetchHistory();
    }, 5000);
    return () => window.clearInterval(interval);
  }, [selectedJobId, fetchTracking, fetchHistory]);

  // Clean up geolocation watcher
  useEffect(() => {
    return () => {
      if (watcherRef.current !== null) {
        navigator.geolocation.clearWatch(watcherRef.current);
      }
    };
  }, []);

  // ─── Action handlers (defined after hooks) ──────────────────
  const startLocationSharing = () => {
    if (!navigator.geolocation) {
      toast.error("Your device does not support GPS");
      return;
    }
    if (!isTransporter) {
      toast.error("Only the transporter can share location");
      return;
    }
    setLocationError(null);
    setSharingLocation(true);
    watcherRef.current = navigator.geolocation.watchPosition(
      sendLocation,
      (geoError) => {
        setSharingLocation(false);
        let message = "Unable to access your location";
        if (geoError.code === geoError.PERMISSION_DENIED) {
          message = "Location permission was denied";
        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
          message = "Your current location is unavailable";
        } else if (geoError.code === geoError.TIMEOUT) {
          message = "Location request timed out";
        }
        setLocationError(message);
        toast.error(message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );
    toast.success("Live location sharing started");
  };

  const stopLocationSharing = () => {
    if (watcherRef.current !== null) {
      navigator.geolocation.clearWatch(watcherRef.current);
      watcherRef.current = null;
    }
    setSharingLocation(false);
    toast.info("Live location sharing stopped");
  };

  const updateStatus = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/tracking/jobs/${selectedJobId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Unable to update status");
      toast.success(`Status changed to ${formatStatus(newStatus)}`);
      setTracking(data.job);
      if (newStatus === "heading_to_pickup" && !sharingLocation) {
        startLocationSharing();
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const selectJob = (id) => {
    if (!id || isNaN(Number(id))) {
      toast.error("Invalid job selected");
      return;
    }
    setSelectedJobId(id);
  };

  const goBackToList = () => {
    setSelectedJobId(null);
    if (sharingLocation) stopLocationSharing();
  };

  const handleRefresh = () => {
    if (selectedJobId) {
      fetchTracking(true);
      fetchHistory();
    } else {
      fetchActiveJobs();
    }
  };

  // ─── Compute map data (safe even if tracking is null) ──────
  const currentPosition =
    tracking?.current_location?.latitude != null &&
    tracking?.current_location?.longitude != null
      ? [tracking.current_location.latitude, tracking.current_location.longitude]
      : null;

  const pickupPosition =
    tracking?.pickup_location?.latitude != null &&
    tracking?.pickup_location?.longitude != null
      ? [tracking.pickup_location.latitude, tracking.pickup_location.longitude]
      : null;

  const deliveryPosition =
    tracking?.delivery_location?.latitude != null &&
    tracking?.delivery_location?.longitude != null
      ? [tracking.delivery_location.latitude, tracking.delivery_location.longitude]
      : null;

  const mapCenter =
    currentPosition || pickupPosition || deliveryPosition || [-1.286389, 36.817223];

  // ─── Conditional rendering (AFTER all hooks) ────────────────

  // 1. Job list view
  if (!selectedJobId) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Route Tracking</h1>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
          <JobList
            jobs={jobs}
            loading={jobsLoading}
            error={jobsError}
            onSelect={selectJob}
            onRefresh={fetchActiveJobs}
          />
        </div>
      </div>
    );
  }

  // 2. Loading state for tracking
  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <LoaderCircle className="mx-auto h-12 w-12 animate-spin text-[#11402D]" />
          <p className="mt-4 text-sm text-gray-500">Loading live route...</p>
        </div>
      </div>
    );
  }

  // 3. Error state
  if (error) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
        <AlertCircle className="mx-auto h-14 w-14 text-red-500" />
        <h2 className="mt-4 text-xl font-bold text-red-700">Unable to Load Route</h2>
        <p className="mt-2 text-sm text-red-600">{error}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => fetchTracking()}
            className="rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white hover:bg-red-700"
          >
            Try Again
          </button>
          <button
            onClick={goBackToList}
            className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 font-semibold text-gray-700 hover:bg-gray-50"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // 4. Live tracking view
  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header with Back button */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <button
              onClick={goBackToList}
              className="rounded-xl border border-gray-200 bg-white p-2 text-gray-600 shadow-sm hover:bg-gray-50"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">Live Route Tracking</h1>
                <span className="rounded-full bg-[#E8F5EE] px-3 py-1 text-xs font-semibold text-[#11402D]">
                  {formatStatus(tracking?.status)}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Job #{tracking?.job_id} · {tracking?.waste_type}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
            {isTransporter && !sharingLocation && (
              <button
                onClick={startLocationSharing}
                className="inline-flex items-center gap-2 rounded-xl bg-[#11402D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0E2A1C]"
              >
                <Navigation className="h-4 w-4" />
                Share Location
              </button>
            )}
            {isTransporter && sharingLocation && (
              <button
                onClick={stopLocationSharing}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                <WifiOff className="h-4 w-4" />
                Stop Sharing
              </button>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            icon={Clock}
            label="Estimated Arrival"
            value={tracking?.eta_minutes != null ? `${tracking.eta_minutes} min` : "Calculating"}
          />
          <SummaryCard
            icon={Route}
            label="Distance Remaining"
            value={tracking?.distance_remaining_km != null ? `${tracking.distance_remaining_km} km` : "Unavailable"}
          />
          <SummaryCard
            icon={Truck}
            label="Current Speed"
            value={tracking?.current_location?.speed ? `${Math.round(tracking.current_location.speed)} km/h` : "0 km/h"}
          />
          <SummaryCard
            icon={sharingLocation ? Wifi : Crosshair}
            label="Tracking Status"
            value={sharingLocation ? "Sharing Live" : tracking?.current_location?.updated_at ? "Receiving" : "Waiting"}
          />
        </div>

        {locationError && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {locationError}
          </div>
        )}

        {/* Map & Sidebar */}
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
              <div>
                <h2 className="font-bold text-gray-900">Live Map</h2>
                <p className="text-xs text-gray-500">
                  Updated {formatDate(tracking?.current_location?.updated_at)}
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                Live
              </span>
            </div>
            <div className="h-[520px]">
              <MapContainer center={mapCenter} zoom={13} scrollWheelZoom className="h-full w-full">
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <RecenterMap
                  currentLocation={tracking?.current_location}
                  pickup={tracking?.pickup_location}
                  delivery={tracking?.delivery_location}
                />
                {pickupPosition && (
                  <Marker position={pickupPosition} icon={pickupIcon}>
                    <Popup>
                      <strong>Pickup Location</strong>
                      <br />
                      {tracking?.pickup_location?.name}
                    </Popup>
                  </Marker>
                )}
                {deliveryPosition && (
                  <Marker position={deliveryPosition} icon={destinationIcon}>
                    <Popup>
                      <strong>Delivery Location</strong>
                      <br />
                      {tracking?.delivery_location?.name}
                    </Popup>
                  </Marker>
                )}
                {currentPosition && (
                  <Marker position={currentPosition} icon={transporterIcon}>
                    <Popup>
                      <strong>{tracking?.transporter?.name}</strong>
                      <br />
                      Vehicle is currently here
                    </Popup>
                  </Marker>
                )}
                {routePositions.length > 1 && (
                  <Polyline
                    positions={routePositions}
                    pathOptions={{ color: "#11402D", weight: 5, opacity: 0.8 }}
                  />
                )}
              </MapContainer>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="font-bold text-gray-900">Driver Information</h2>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E8F5EE] text-[#11402D]">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{tracking?.transporter?.name}</p>
                  <p className="text-xs text-gray-500">Assigned transporter</p>
                </div>
              </div>
              <InfoRow label="Phone" value={tracking?.transporter?.phone} />
              <InfoRow label="Vehicle" value={tracking?.transporter?.vehicle_type} />
              <InfoRow label="Registration" value={tracking?.transporter?.vehicle_number} />
              {tracking?.transporter?.phone && (
                <a
                  href={`tel:${tracking.transporter.phone}`}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#11402D] py-2.5 text-sm font-semibold text-white hover:bg-[#0E2A1C]"
                >
                  <Phone className="h-4 w-4" />
                  Call Driver
                </a>
              )}
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="font-bold text-gray-900">Delivery Details</h2>
              <InfoRow label="Waste Type" value={tracking?.waste_type} />
              <InfoRow label="Quantity" value={`${tracking?.quantity || 0} ${tracking?.unit || "kg"}`} />
              <InfoRow label="Supplier" value={tracking?.supplier?.name} />
              <InfoRow label="Producer" value={tracking?.producer?.name} />
              <div className="mt-4 rounded-2xl bg-blue-50 p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                  <ShieldCheck className="h-4 w-4" />
                  Escrow Protected
                </div>
                <p className="mt-1 text-xs text-blue-600">
                  Payment remains secured until delivery is confirmed.
                </p>
              </div>
            </div>

            {isTransporter && nextAction && (
              <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="font-bold text-gray-900">Update Delivery</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Current status: {formatStatus(tracking?.status)}
                </p>
                <button
                  onClick={() => updateStatus(nextAction.nextStatus)}
                  disabled={updatingStatus}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#11402D] py-3 text-sm font-bold text-white hover:bg-[#0E2A1C] disabled:opacity-60"
                >
                  {updatingStatus ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  {nextAction.label}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Delivery Progress</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3 lg:grid-cols-6">
            <TimelineStep
              title="Accepted"
              complete={isAtLeastStatus(tracking?.status, "accepted")}
              date={tracking?.created_at}
            />
            <TimelineStep
              title="Heading to Pickup"
              complete={isAtLeastStatus(tracking?.status, "heading_to_pickup")}
              date={tracking?.timeline?.tracking_started_at}
            />
            <TimelineStep
              title="Arrived at Pickup"
              complete={isAtLeastStatus(tracking?.status, "arrived_at_pickup")}
              date={tracking?.timeline?.arrived_pickup_at}
            />
            <TimelineStep
              title="Picked Up"
              complete={isAtLeastStatus(tracking?.status, "picked_up")}
              date={tracking?.timeline?.picked_up_at}
            />
            <TimelineStep
              title="In Transit"
              complete={isAtLeastStatus(tracking?.status, "in_transit")}
            />
            <TimelineStep
              title="At Destination"
              complete={isAtLeastStatus(tracking?.status, "arrived_at_destination")}
              date={tracking?.timeline?.arrived_destination_at}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Subcomponents ──────────────────────────────────────────────

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-[#E8F5EE] p-3 text-[#11402D]">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="mt-1 font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="mt-4 flex items-start justify-between gap-4 border-b border-gray-100 pb-3 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-right text-sm font-medium text-gray-800">
        {value || "Not available"}
      </span>
    </div>
  );
}

function TimelineStep({ title, complete, date }) {
  return (
    <div className="relative">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-full ${
          complete ? "bg-[#11402D] text-white" : "bg-gray-100 text-gray-400"
        }`}
      >
        {complete ? <CheckCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
      </div>
      <p className="mt-3 text-sm font-semibold text-gray-800">{title}</p>
      <p className="mt-1 text-xs text-gray-400">
        {date ? formatDate(date) : complete ? "Completed" : "Waiting"}
      </p>
    </div>
  );
}