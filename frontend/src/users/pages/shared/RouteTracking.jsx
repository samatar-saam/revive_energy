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
  CheckCircle2,
  Circle,
  Clock,
  Crosshair,
  Gauge,
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

// ─── Design tokens (injected once) ──────────────────────────────
const DESIGN_TOKENS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

  .rt-root {
    --canopy: #0F3D2B;
    --canopy-dark: #09241A;
    --canopy-tint: #E7F0EA;
    --mist: #F4F6F2;
    --paper: #FFFFFF;
    --ink: #1B231D;
    --slate: #6E7B71;
    --hairline: #E2E7DF;
    --amber: #DC9A3C;
    --amber-tint: #FBF0DC;
    --route: #3E6E86;
    --route-tint: #E4EEF1;
    --signal: #BD4438;
    --signal-tint: #FBE9E7;
    font-family: 'Inter', sans-serif;
    background: var(--mist);
    color: var(--ink);
  }
  .rt-root .font-display { font-family: 'Fraunces', serif; }
  .rt-root .font-mono { font-family: 'IBM Plex Mono', monospace; }

  @keyframes rt-fade-up {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .rt-animate { animation: rt-fade-up 0.5s ease both; }

  @keyframes rt-pulse-ring {
    0% { transform: scale(0.6); opacity: 0.55; }
    70% { transform: scale(1.6); opacity: 0; }
    100% { opacity: 0; }
  }
  .live-marker { position: relative; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; }
  .live-marker-pulse { position: absolute; inset: 0; border-radius: 50%; background: rgba(15,61,43,0.38); animation: rt-pulse-ring 2.2s ease-out infinite; }
  .live-marker-core { position: relative; z-index: 1; width: 42px; height: 42px; border-radius: 50%; background: #0F3D2B; color: #fff; display: flex; align-items: center; justify-content: center; border: 4px solid #fff; box-shadow: 0 8px 20px rgba(15,61,43,.35); font-size: 19px; }

  .rt-stamp {
    transform: rotate(-3deg);
    border-style: dashed;
  }

  @keyframes rt-dash {
    to { stroke-dashoffset: -24; }
  }
  .rt-rail-active-line { stroke-dasharray: 5 7; animation: rt-dash 1.4s linear infinite; }
`;

function useInjectedStyles() {
  useEffect(() => {
    if (document.getElementById("rt-design-tokens")) return;
    const style = document.createElement("style");
    style.id = "rt-design-tokens";
    style.innerHTML = DESIGN_TOKENS;
    document.head.appendChild(style);
  }, []);
}

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
    <div class="live-marker">
      <span class="live-marker-pulse"></span>
      <div class="live-marker-core">🚛</div>
    </div>
  `,
  iconSize: [56, 56],
  iconAnchor: [28, 28],
});

const pickupIcon = new L.DivIcon({
  className: "",
  html: `
    <div style="
      width:32px;
      height:32px;
      border-radius:8px;
      background:#DC9A3C;
      color:white;
      display:flex;
      align-items:center;
      justify-content:center;
      border:3px solid white;
      box-shadow:0 4px 12px rgba(0,0,0,.2);
      font-size:13px;
      font-family:'IBM Plex Mono',monospace;
      font-weight:600;
      transform:rotate(45deg);
    "><span style="transform:rotate(-45deg)">P</span></div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const destinationIcon = new L.DivIcon({
  className: "",
  html: `
    <div style="
      width:32px;
      height:32px;
      border-radius:8px;
      background:#3E6E86;
      color:white;
      display:flex;
      align-items:center;
      justify-content:center;
      border:3px solid white;
      box-shadow:0 4px 12px rgba(0,0,0,.2);
      font-size:13px;
      font-family:'IBM Plex Mono',monospace;
      font-weight:600;
      transform:rotate(45deg);
    "><span style="transform:rotate(-45deg)">D</span></div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
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

function formatCoord(value) {
  if (value == null) return "—";
  return Number(value).toFixed(5);
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

function getStatusTone(status) {
  if (status === "completed") {
    return { bg: "var(--canopy-tint)", fg: "var(--canopy)", border: "var(--canopy)" };
  }
  if (status === "open" || !status) {
    return { bg: "#F1F2EF", fg: "var(--slate)", border: "var(--hairline)" };
  }
  return { bg: "var(--amber-tint)", fg: "#8A5C1E", border: "var(--amber)" };
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
        <LoaderCircle className="h-10 w-10 animate-spin text-[var(--canopy)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border p-8 text-center" style={{ background: "var(--signal-tint)", borderColor: "#EFC4BE" }}>
        <AlertCircle className="mx-auto h-12 w-12" style={{ color: "var(--signal)" }} />
        <h2 className="mt-4 font-display text-xl font-semibold" style={{ color: "var(--signal)" }}>Unable to load jobs</h2>
        <p className="mt-2 text-sm" style={{ color: "#8C382E" }}>{error}</p>
        <button
          onClick={onRefresh}
          className="mt-6 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ background: "var(--signal)" }}
        >
          Try again
        </button>
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border bg-[var(--paper)] p-12 text-center" style={{ borderColor: "var(--hairline)" }}>
        <Route className="mx-auto h-14 w-14" style={{ color: "var(--canopy)" }} />
        <h2 className="mt-4 font-display text-xl font-semibold">No active jobs</h2>
        <p className="mt-2 text-sm" style={{ color: "var(--slate)" }}>
          You don't have any jobs available for live tracking at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job, i) => {
        const tone = getStatusTone(job.status);
        return (
          <div
            key={job.job_id}
            className="rt-animate group cursor-pointer rounded-2xl border bg-[var(--paper)] p-6 transition hover:-translate-y-1 hover:shadow-[0_16px_32px_-16px_rgba(15,61,43,0.25)]"
            style={{ borderColor: "var(--hairline)", animationDelay: `${i * 40}ms` }}
            onClick={() => onSelect(job.job_id)}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-lg font-semibold leading-tight">{job.waste_type}</h3>
                <p className="font-mono mt-1 text-xs" style={{ color: "var(--slate)" }}>JOB #{job.job_id}</p>
              </div>
              <span
                className="whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide"
                style={{ background: tone.bg, color: tone.fg }}
              >
                {formatStatus(job.status)}
              </span>
            </div>
            <div className="mt-4 space-y-2 text-sm" style={{ color: "var(--ink)" }}>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" style={{ color: "var(--amber)" }} />
                <span className="truncate">{job.pickup_location?.name || "Pickup"}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" style={{ color: "var(--route)" }} />
                <span className="truncate">{job.delivery_location?.name || "Delivery"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 shrink-0" style={{ color: "var(--slate)" }} />
                <span className="truncate" style={{ color: "var(--slate)" }}>{job.transporter?.name || "No transporter assigned"}</span>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-1.5 text-sm font-semibold" style={{ color: "var(--canopy)" }}>
              Track live
              <Navigation className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Waybill route rail (signature element) ────────────────────
const RAIL_STEPS = [
  { key: "accepted", label: "Accepted" },
  { key: "heading_to_pickup", label: "Heading to Pickup" },
  { key: "arrived_at_pickup", label: "At Pickup" },
  { key: "picked_up", label: "Picked Up" },
  { key: "in_transit", label: "In Transit" },
  { key: "arrived_at_destination", label: "At Destination" },
];

function WaybillRail({ status, timeline, createdAt }) {
  const activeIndex = RAIL_STEPS.reduce(
    (acc, step, i) => (isAtLeastStatus(status, step.key) ? i : acc),
    -1
  );
  const dates = {
    accepted: createdAt,
    heading_to_pickup: timeline?.tracking_started_at,
    arrived_at_pickup: timeline?.arrived_pickup_at,
    picked_up: timeline?.picked_up_at,
    in_transit: null,
    arrived_at_destination: timeline?.arrived_destination_at,
  };

  return (
    <div className="overflow-x-auto pb-1">
      <div className="relative flex min-w-[720px] items-start justify-between px-2">
        <div className="absolute left-6 right-6 top-[15px] h-[2px]" style={{ background: "var(--hairline)" }} />
        <div
          className="absolute left-6 top-[15px] h-[2px] rt-rail-active-line"
          style={{
            width: activeIndex <= 0 ? "0%" : `calc(${(activeIndex / (RAIL_STEPS.length - 1)) * 100}% - 24px)`,
            stroke: "var(--canopy)",
            background: "repeating-linear-gradient(to right, var(--canopy) 0 6px, transparent 6px 11px)",
          }}
        />
        {RAIL_STEPS.map((step, i) => {
          const complete = i <= activeIndex;
          const isCurrent = i === activeIndex;
          return (
            <div key={step.key} className="relative z-10 flex w-full flex-col items-center text-center">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 bg-[var(--paper)] transition"
                style={{
                  borderColor: complete ? "var(--canopy)" : "var(--hairline)",
                  color: complete ? "var(--canopy)" : "var(--slate)",
                  boxShadow: isCurrent ? "0 0 0 4px var(--canopy-tint)" : "none",
                }}
              >
                {complete ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-3 w-3" />}
              </div>
              <p className="font-display mt-2 text-xs font-semibold leading-tight" style={{ color: complete ? "var(--ink)" : "var(--slate)" }}>
                {step.label}
              </p>
              <p className="font-mono mt-1 text-[10px]" style={{ color: "var(--slate)" }}>
                {dates[step.key] ? formatDate(dates[step.key]) : complete ? "Done" : "Pending"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Live telemetry ticker ──────────────────────────────────────
function TelemetryTicker({ location, sharing }) {
  const items = [
    { label: "LAT", value: formatCoord(location?.latitude) },
    { label: "LNG", value: formatCoord(location?.longitude) },
    { label: "SPEED", value: location?.speed != null ? `${Math.round(location.speed)} km/h` : "0 km/h" },
    { label: "HEADING", value: location?.heading != null ? `${Math.round(location.heading)}°` : "—" },
    { label: "ACCURACY", value: location?.accuracy != null ? `±${Math.round(location.accuracy)}m` : "—" },
  ];
  return (
    <div
      className="flex flex-wrap items-center gap-x-8 gap-y-2 rounded-2xl border px-5 py-3"
      style={{ borderColor: "var(--hairline)", background: "var(--canopy-dark)" }}
    >
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          {sharing && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: "#5FCB8E" }} />
          )}
          <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: sharing ? "#5FCB8E" : "#7C8B82" }} />
        </span>
        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-white/90">
          {sharing ? "Live feed" : "Standing by"}
        </span>
      </div>
      {items.map((item) => (
        <div key={item.label} className="flex items-baseline gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-wider text-white/45">{item.label}</span>
          <span className="font-mono text-[13px] font-medium text-white">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────
export default function RouteTracking() {
  useInjectedStyles();

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

  const statusTone = getStatusTone(tracking?.status);

  // ─── Conditional rendering (AFTER all hooks) ────────────────

  // 1. Job list view
  if (!selectedJobId) {
    return (
      <div className="rt-root min-h-screen p-4 sm:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--canopy)" }}>
                Fleet Operations
              </p>
              <h1 className="font-display mt-1 text-3xl font-semibold">Route Tracking</h1>
            </div>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 self-start rounded-full border bg-[var(--paper)] px-4 py-2 text-sm font-medium transition hover:bg-[var(--canopy-tint)]"
              style={{ borderColor: "var(--hairline)" }}
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
      <div className="rt-root flex min-h-screen items-center justify-center">
        <div className="text-center">
          <LoaderCircle className="mx-auto h-10 w-10 animate-spin" style={{ color: "var(--canopy)" }} />
          <p className="font-mono mt-4 text-xs uppercase tracking-widest" style={{ color: "var(--slate)" }}>
            Loading live route…
          </p>
        </div>
      </div>
    );
  }

  // 3. Error state
  if (error) {
    return (
      <div className="rt-root flex min-h-screen items-center justify-center p-4">
        <div className="mx-auto max-w-xl rounded-2xl border p-8 text-center" style={{ background: "var(--signal-tint)", borderColor: "#EFC4BE" }}>
          <AlertCircle className="mx-auto h-12 w-12" style={{ color: "var(--signal)" }} />
          <h2 className="font-display mt-4 text-xl font-semibold" style={{ color: "var(--signal)" }}>Unable to load route</h2>
          <p className="mt-2 text-sm" style={{ color: "#8C382E" }}>{error}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => fetchTracking()}
              className="rounded-full px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
              style={{ background: "var(--signal)" }}
            >
              Try again
            </button>
            <button
              onClick={goBackToList}
              className="rounded-full border bg-[var(--paper)] px-5 py-2.5 text-sm font-semibold hover:bg-[var(--mist)]"
              style={{ borderColor: "var(--hairline)" }}
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Live tracking view
  return (
    <div className="rt-root min-h-screen p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Waybill header */}
        <div className="rt-animate overflow-hidden rounded-3xl border bg-[var(--paper)]" style={{ borderColor: "var(--hairline)" }}>
          <div className="flex flex-col gap-5 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <button
                  onClick={goBackToList}
                  className="rounded-full border p-2 transition hover:bg-[var(--mist)]"
                  style={{ borderColor: "var(--hairline)" }}
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--slate)" }}>
                    Job #{tracking?.job_id} · {tracking?.waste_type}
                  </p>
                  <h1 className="font-display mt-1 text-2xl font-semibold sm:text-[28px]">
                    {tracking?.pickup_location?.name || "Pickup"}
                    <span className="mx-2 font-sans font-normal" style={{ color: "var(--slate)" }}>→</span>
                    {tracking?.delivery_location?.name || "Destination"}
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="rt-stamp rounded-lg border-2 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider"
                  style={{ color: statusTone.fg, borderColor: statusTone.border, background: statusTone.bg }}
                >
                  {formatStatus(tracking?.status)}
                </span>
              </div>
            </div>

            <WaybillRail status={tracking?.status} timeline={tracking?.timeline} createdAt={tracking?.created_at} />

            <div className="flex flex-wrap gap-2 border-t pt-4" style={{ borderColor: "var(--hairline)" }}>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-full border bg-[var(--paper)] px-4 py-2 text-sm font-medium transition hover:bg-[var(--mist)] disabled:opacity-50"
                style={{ borderColor: "var(--hairline)" }}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>
              {isTransporter && !sharingLocation && (
                <button
                  onClick={startLocationSharing}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                  style={{ background: "var(--canopy)" }}
                >
                  <Navigation className="h-4 w-4" />
                  Share Location
                </button>
              )}
              {isTransporter && sharingLocation && (
                <button
                  onClick={stopLocationSharing}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                  style={{ background: "var(--signal)" }}
                >
                  <WifiOff className="h-4 w-4" />
                  Stop Sharing
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Live telemetry ticker */}
        <TelemetryTicker location={tracking?.current_location} sharing={sharingLocation} />

        {locationError && (
          <div className="flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm" style={{ background: "var(--signal-tint)", borderColor: "#EFC4BE", color: "#8C382E" }}>
            <AlertCircle className="h-5 w-5 shrink-0" />
            {locationError}
          </div>
        )}

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
            icon={Gauge}
            label="Current Speed"
            value={tracking?.current_location?.speed ? `${Math.round(tracking.current_location.speed)} km/h` : "0 km/h"}
          />
          <SummaryCard
            icon={sharingLocation ? Wifi : Crosshair}
            label="Tracking Status"
            value={sharingLocation ? "Sharing Live" : tracking?.current_location?.updated_at ? "Receiving" : "Waiting"}
          />
        </div>

        {/* Map & Sidebar */}
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="overflow-hidden rounded-3xl border bg-[var(--paper)]" style={{ borderColor: "var(--hairline)" }}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4" style={{ borderColor: "var(--hairline)" }}>
              <div>
                <h2 className="font-display font-semibold">Live Map</h2>
                <p className="font-mono mt-0.5 text-xs" style={{ color: "var(--slate)" }}>
                  Updated {formatDate(tracking?.current_location?.updated_at)}
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: "var(--canopy-tint)", color: "var(--canopy)" }}>
                <span className="h-2 w-2 animate-pulse rounded-full" style={{ background: "var(--canopy)" }} />
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
                    pathOptions={{ color: "#0F3D2B", weight: 5, opacity: 0.8 }}
                  />
                )}
              </MapContainer>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-3xl border bg-[var(--paper)] p-5" style={{ borderColor: "var(--hairline)" }}>
              <h2 className="font-display font-semibold">Driver Information</h2>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "var(--canopy-tint)", color: "var(--canopy)" }}>
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold">{tracking?.transporter?.name}</p>
                  <p className="text-xs" style={{ color: "var(--slate)" }}>Assigned transporter</p>
                </div>
              </div>
              <InfoRow label="Phone" value={tracking?.transporter?.phone} />
              <InfoRow label="Vehicle" value={tracking?.transporter?.vehicle_type} />
              <InfoRow label="Registration" value={tracking?.transporter?.vehicle_number} mono />
              {tracking?.transporter?.phone && (
                <a
                  href={`tel:${tracking.transporter.phone}`}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                  style={{ background: "var(--canopy)" }}
                >
                  <Phone className="h-4 w-4" />
                  Call Driver
                </a>
              )}
            </div>

            <div className="rounded-3xl border bg-[var(--paper)] p-5" style={{ borderColor: "var(--hairline)" }}>
              <h2 className="font-display font-semibold">Delivery Details</h2>
              <InfoRow label="Waste Type" value={tracking?.waste_type} />
              <InfoRow label="Quantity" value={`${tracking?.quantity || 0} ${tracking?.unit || "kg"}`} mono />
              <InfoRow label="Supplier" value={tracking?.supplier?.name} />
              <InfoRow label="Producer" value={tracking?.producer?.name} />
              <div className="mt-4 rounded-2xl p-3" style={{ background: "var(--route-tint)" }}>
                <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--route)" }}>
                  <ShieldCheck className="h-4 w-4" />
                  Escrow Protected
                </div>
                <p className="mt-1 text-xs" style={{ color: "var(--route)" }}>
                  Payment remains secured until delivery is confirmed.
                </p>
              </div>
            </div>

            {isTransporter && nextAction && (
              <div className="rounded-3xl border bg-[var(--paper)] p-5" style={{ borderColor: "var(--hairline)" }}>
                <h2 className="font-display font-semibold">Update Delivery</h2>
                <p className="mt-1 text-sm" style={{ color: "var(--slate)" }}>
                  Current status: {formatStatus(tracking?.status)}
                </p>
                <button
                  onClick={() => updateStatus(nextAction.nextStatus)}
                  disabled={updatingStatus}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
                  style={{ background: "var(--canopy)" }}
                >
                  {updatingStatus ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  {nextAction.label}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Subcomponents ──────────────────────────────────────────────

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-3xl border bg-[var(--paper)] p-5" style={{ borderColor: "var(--hairline)" }}>
      <div className="flex items-center gap-3">
        <div className="rounded-2xl p-3" style={{ background: "var(--canopy-tint)", color: "var(--canopy)" }}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs" style={{ color: "var(--slate)" }}>{label}</p>
          <p className="font-display mt-1 text-lg font-semibold">{value}</p>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono }) {
  return (
    <div className="mt-4 flex items-start justify-between gap-4 border-b pb-3 last:border-0" style={{ borderColor: "var(--hairline)" }}>
      <span className="text-xs" style={{ color: "var(--slate)" }}>{label}</span>
      <span className={`text-right text-sm font-medium ${mono ? "font-mono" : ""}`}>
        {value || "Not available"}
      </span>
    </div>
  );
}