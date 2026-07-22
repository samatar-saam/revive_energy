import React, { useState, useEffect, useRef } from "react";
import energyFacilityImage from "../assets/energy-facility.jpg";
import renewableFieldImage from "../assets/renewable-field.jpg";
import {
  Recycle,
  Zap,
  Leaf,
  Globe,
  ArrowRight,
  Wind,
  Flame,
  Droplets,
  BarChart3,
  MapPin,
  ChevronRight,
  Sun,
  Truck,
  Home,
  Building2,
  Landmark,
  Clock,
  Mail,
  Phone,
  MessageSquare,
  Calculator,
  Plus,
  X,
  Star, // ← added for testimonials
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Custom WhatsApp SVG Icon ──────────────────────────────────
const WhatsAppIcon = ({ className, color = "#25D366" }) => (
  <svg
    viewBox="0 0 24 24"
    fill={color}
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.229-1.392-.191-1.887-.423-.5-1.01-.77-1.357-.918z"/>
    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.537 3.66 1.468 5.15L2.09 21.91l4.76-1.378A9.94 9.94 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.69 0-3.25-.525-4.535-1.422l-.325-.196-2.83.82.84-2.788-.207-.34A8.044 8.044 0 0 1 4 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
  </svg>
);

/* ══════════════════════════════════════════════════════════════
   ANIMATED TRUCK SVGs — one unique truck per stage
   Each SVG shows: the truck body + its unique cargo bed
══════════════════════════════════════════════════════════════ */

/* Stage 0 — Household: truck loaded with household waste bags */
const TruckHousehold = ({ size = 80 }) => (
  <svg width={size} height={size * 0.65} viewBox="0 0 120 78" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Cab */}
    <rect x="72" y="28" width="42" height="36" rx="4" fill="#11402D"/>
    <rect x="80" y="32" width="28" height="18" rx="2" fill="#9CF06B" opacity="0.9"/>
    <rect x="82" y="34" width="8" height="8" rx="1" fill="white" opacity="0.4"/>
    <rect x="8" y="28" width="66" height="36" rx="3" fill="#1a5c3e"/>
    <ellipse cx="24" cy="44" rx="10" ry="13" fill="#4ade80" opacity="0.85"/>
    <rect x="21" y="31" width="6" height="4" rx="1" fill="#16a34a"/>
    <ellipse cx="40" cy="46" rx="9" ry="11" fill="#86efac" opacity="0.9"/>
    <rect x="37" y="35" width="6" height="4" rx="1" fill="#4ade80"/>
    <ellipse cx="56" cy="44" rx="9" ry="12" fill="#4ade80" opacity="0.8"/>
    <rect x="53" y="32" width="6" height="4" rx="1" fill="#16a34a"/>
    <line x1="8" y1="48" x2="72" y2="48" stroke="#9CF06B" strokeWidth="1.5" strokeDasharray="4,3"/>
    <circle cx="28" cy="66" r="10" fill="#0A1A0F" stroke="#9CF06B" strokeWidth="2"/>
    <circle cx="28" cy="66" r="4" fill="#9CF06B"/>
    <circle cx="92" cy="66" r="10" fill="#0A1A0F" stroke="#9CF06B" strokeWidth="2"/>
    <circle cx="92" cy="66" r="4" fill="#9CF06B"/>
    <rect x="110" y="40" width="4" height="10" rx="2" fill="#5A7060"/>
    <ellipse cx="112" cy="39" rx="4" ry="2" fill="#9CF06B" opacity="0.5"/>
    <rect x="10" y="30" width="44" height="12" rx="2" fill="#0A1A0F" opacity="0.7"/>
    <text x="32" y="40" textAnchor="middle" fontSize="7" fill="#9CF06B" fontFamily="monospace" fontWeight="bold">WASTE</text>
  </svg>
);

/* Stage 1 — Recycling company: open-top truck with sorted recyclables */
const TruckSorting = ({ size = 80 }) => (
  <svg width={size} height={size * 0.65} viewBox="0 0 120 78" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="72" y="28" width="42" height="36" rx="4" fill="#1e3a8a"/>
    <rect x="80" y="32" width="28" height="18" rx="2" fill="#93c5fd" opacity="0.9"/>
    <rect x="82" y="34" width="8" height="8" rx="1" fill="white" opacity="0.4"/>
    <rect x="8" y="34" width="66" height="30" rx="2" fill="#1e40af"/>
    <rect x="12" y="36" width="14" height="22" rx="2" fill="#3b82f6"/>
    <rect x="14" y="38" width="4" height="4" rx="1" fill="#bfdbfe"/>
    <text x="19" y="54" textAnchor="middle" fontSize="5.5" fill="#dbeafe" fontFamily="monospace">PET</text>
    <rect x="30" y="36" width="14" height="22" rx="2" fill="#1d4ed8"/>
    <rect x="32" y="38" width="4" height="4" rx="1" fill="#bfdbfe"/>
    <text x="37" y="54" textAnchor="middle" fontSize="5.5" fill="#dbeafe" fontFamily="monospace">HDPE</text>
    <rect x="48" y="36" width="14" height="22" rx="2" fill="#2563eb"/>
    <rect x="50" y="38" width="4" height="4" rx="1" fill="#bfdbfe"/>
    <text x="55" y="54" textAnchor="middle" fontSize="5.5" fill="#dbeafe" fontFamily="monospace">PP</text>
    <text x="40" y="28" textAnchor="middle" fontSize="9" fill="#60a5fa">♻</text>
    <circle cx="28" cy="66" r="10" fill="#0A1A0F" stroke="#60a5fa" strokeWidth="2"/>
    <circle cx="28" cy="66" r="4" fill="#60a5fa"/>
    <circle cx="92" cy="66" r="10" fill="#0A1A0F" stroke="#60a5fa" strokeWidth="2"/>
    <circle cx="92" cy="66" r="4" fill="#60a5fa"/>
    <rect x="110" y="40" width="4" height="10" rx="2" fill="#5A7060"/>
    <rect x="8" y="34" width="66" height="4" rx="1" fill="#3b82f6" opacity="0.6"/>
    <rect x="10" y="30" width="54" height="12" rx="2" fill="#0A1A0F" opacity="0.7"/>
    <text x="37" y="40" textAnchor="middle" fontSize="7" fill="#60a5fa" fontFamily="monospace" fontWeight="bold">SORTED</text>
  </svg>
);

/* Stage 2 — Community centre: flat-bed with compressed bales */
const TruckBales = ({ size = 80 }) => (
  <svg width={size} height={size * 0.65} viewBox="0 0 120 78" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="72" y="28" width="42" height="36" rx="4" fill="#78350f"/>
    <rect x="80" y="32" width="28" height="18" rx="2" fill="#fcd34d" opacity="0.9"/>
    <rect x="82" y="34" width="8" height="8" rx="1" fill="white" opacity="0.4"/>
    <rect x="6" y="54" width="68" height="6" rx="2" fill="#92400e"/>
    <rect x="10" y="34" width="16" height="20" rx="3" fill="#d97706"/>
    <line x1="10" y1="41" x2="26" y2="41" stroke="#fef3c7" strokeWidth="1.5"/>
    <line x1="10" y1="47" x2="26" y2="47" stroke="#fef3c7" strokeWidth="1.5"/>
    <line x1="18" y1="34" x2="18" y2="54" stroke="#fef3c7" strokeWidth="1"/>
    <rect x="30" y="34" width="16" height="20" rx="3" fill="#b45309"/>
    <line x1="30" y1="41" x2="46" y2="41" stroke="#fef3c7" strokeWidth="1.5"/>
    <line x1="30" y1="47" x2="46" y2="47" stroke="#fef3c7" strokeWidth="1.5"/>
    <line x1="38" y1="34" x2="38" y2="54" stroke="#fef3c7" strokeWidth="1"/>
    <rect x="50" y="34" width="16" height="20" rx="3" fill="#d97706"/>
    <line x1="50" y1="41" x2="66" y2="41" stroke="#fef3c7" strokeWidth="1.5"/>
    <line x1="50" y1="47" x2="66" y2="47" stroke="#fef3c7" strokeWidth="1.5"/>
    <line x1="58" y1="34" x2="58" y2="54" stroke="#fef3c7" strokeWidth="1"/>
    <line x1="20" y1="34" x2="20" y2="60" stroke="#fbbf24" strokeWidth="2"/>
    <line x1="50" y1="34" x2="50" y2="60" stroke="#fbbf24" strokeWidth="2"/>
    <circle cx="28" cy="66" r="10" fill="#0A1A0F" stroke="#fcd34d" strokeWidth="2"/>
    <circle cx="28" cy="66" r="4" fill="#fcd34d"/>
    <circle cx="92" cy="66" r="10" fill="#0A1A0F" stroke="#fcd34d" strokeWidth="2"/>
    <circle cx="92" cy="66" r="4" fill="#fcd34d"/>
    <rect x="110" y="40" width="4" height="10" rx="2" fill="#5A7060"/>
    <rect x="10" y="30" width="50" height="12" rx="2" fill="#0A1A0F" opacity="0.7"/>
    <text x="35" y="40" textAnchor="middle" fontSize="7" fill="#fcd34d" fontFamily="monospace" fontWeight="bold">BALED</text>
  </svg>
);

/* Stage 3 — Recycling plant: tanker / enclosed trailer with energy symbol */
const TruckEnergy = ({ size = 80 }) => (
  <svg width={size} height={size * 0.65} viewBox="0 0 120 78" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="72" y="20" width="44" height="44" rx="6" fill="#0A1A0F"/>
    <rect x="80" y="26" width="30" height="20" rx="3" fill="#9CF06B" opacity="0.95"/>
    <rect x="82" y="28" width="10" height="10" rx="1" fill="white" opacity="0.35"/>
    <ellipse cx="38" cy="44" rx="34" ry="22" fill="#11402D"/>
    <ellipse cx="38" cy="44" rx="30" ry="18" fill="#1a5c3e"/>
    <path d="M22 44 Q30 30 38 44 Q46 58 54 44" stroke="#9CF06B" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <path d="M20 50 Q30 36 38 50 Q46 64 56 50" stroke="#9CF06B" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5"/>
    <path d="M36 34 L30 46 L36 46 L32 58 L44 42 L38 42 L42 34 Z" fill="#9CF06B"/>
    <rect x="6" y="38" width="8" height="6" rx="1" fill="#0A1A0F"/>
    <rect x="6" y="48" width="8" height="6" rx="1" fill="#0A1A0F"/>
    <circle cx="24" cy="66" r="11" fill="#0A1A0F" stroke="#9CF06B" strokeWidth="2.5"/>
    <circle cx="24" cy="66" r="5" fill="#9CF06B"/>
    <circle cx="52" cy="66" r="11" fill="#0A1A0F" stroke="#9CF06B" strokeWidth="2.5"/>
    <circle cx="52" cy="66" r="5" fill="#9CF06B"/>
    <circle cx="94" cy="66" r="11" fill="#0A1A0F" stroke="#9CF06B" strokeWidth="2.5"/>
    <circle cx="94" cy="66" r="5" fill="#9CF06B"/>
    <rect x="112" y="36" width="5" height="14" rx="2" fill="#5A7060"/>
    <ellipse cx="114" cy="35" rx="5" ry="2.5" fill="#9CF06B" opacity="0.6"/>
    <rect x="8" y="30" width="52" height="13" rx="2" fill="#0A1A0F" opacity="0.75"/>
    <text x="34" y="40.5" textAnchor="middle" fontSize="7.5" fill="#9CF06B" fontFamily="monospace" fontWeight="bold">ENERGY ⚡</text>
  </svg>
);

/* TRUCK STAGES MAP */
const TRUCK_STAGES = [
  { Component: TruckHousehold, label: "Waste Loaded", color: "#4ade80", cargoDesc: "Full of household waste bags" },
  { Component: TruckSorting, label: "Sorted Materials", color: "#60a5fa", cargoDesc: "Carrying sorted plastic grades" },
  { Component: TruckBales, label: "Baled & Ready", color: "#fcd34d", cargoDesc: "Compressed bales for processing" },
  { Component: TruckEnergy, label: "Energy Delivery", color: "#9CF06B", cargoDesc: "Clean energy output — biogas & power" },
];

/* ── ROUTE WAYPOINTS (percent of svg viewport) ── */
const WAYPOINTS = [
  { x: 8,  y: 62, name: "Household Pickup",    icon: "🏠", detail: "2.4 t collected" },
  { x: 35, y: 30, name: "Recycling Companies", icon: "🏢", detail: "Sorting in progress" },
  { x: 62, y: 70, name: "Community Centre",    icon: "🏛️", detail: "Collection hub" },
  { x: 88, y: 35, name: "Recycling Plant",     icon: "♻️", detail: "Processing facility" },
];

/* Cubic bezier path through 4 waypoints */
const ROUTE_PATH = `
  M ${WAYPOINTS[0].x} ${WAYPOINTS[0].y}
  C ${WAYPOINTS[0].x + 12} ${WAYPOINTS[0].y - 18},
    ${WAYPOINTS[1].x - 10} ${WAYPOINTS[1].y + 15},
    ${WAYPOINTS[1].x} ${WAYPOINTS[1].y}
  C ${WAYPOINTS[1].x + 14} ${WAYPOINTS[1].y + 10},
    ${WAYPOINTS[2].x - 14} ${WAYPOINTS[2].y - 10},
    ${WAYPOINTS[2].x} ${WAYPOINTS[2].y}
  C ${WAYPOINTS[2].x + 12} ${WAYPOINTS[2].y - 18},
    ${WAYPOINTS[3].x - 14} ${WAYPOINTS[3].y + 15},
    ${WAYPOINTS[3].x} ${WAYPOINTS[3].y}
`;

/* ═══ ANIMATED ROUTE SECTION ═══════════════════════════════ */
function ReViveRoute() {
  const [truckProgress, setTruckProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [visitedStops, setVisitedStops] = useState(new Set([0]));
  const [isPlaying, setIsPlaying] = useState(true);
  const animRef = useRef(null);
  const startRef = useRef(null);
  const DURATION = 18000;

  useEffect(() => {
    if (!isPlaying) return;
    const tick = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = (ts - startRef.current) % DURATION;
      const progress = elapsed / DURATION;
      setTruckProgress(progress);

      const stageThresholds = [0, 0.3, 0.62, 0.9];
      let stage = 0;
      for (let i = stageThresholds.length - 1; i >= 0; i--) {
        if (progress >= stageThresholds[i]) { stage = i; break; }
      }
      setCurrentStage(stage);
      setVisitedStops(prev => {
        const next = new Set(prev);
        for (let i = 0; i <= stage; i++) next.add(i);
        return next;
      });
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(animRef.current); };
  }, [isPlaying]);

  const getTruckPos = (t) => {
    const segments = [
      [WAYPOINTS[0], WAYPOINTS[1]],
      [WAYPOINTS[1], WAYPOINTS[2]],
      [WAYPOINTS[2], WAYPOINTS[3]],
    ];
    const segLen = 1 / 3;
    const seg = Math.min(Math.floor(t / segLen), 2);
    const segT = (t - seg * segLen) / segLen;
    const ease = segT < 0.5 ? 2 * segT * segT : -1 + (4 - 2 * segT) * segT;
    const a = segments[seg][0];
    const b = segments[seg][1];
    return { x: a.x + (b.x - a.x) * ease, y: a.y + (b.y - a.y) * ease };
  };

  const truckPos = getTruckPos(Math.min(truckProgress, 0.99));
  const Stage = TRUCK_STAGES[currentStage];
  const TruckComponent = Stage.Component;

  return (
    <div className="w-full bg-white rounded-3xl shadow-2xl border border-[#E5EDE8] overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5EDE8]"
        style={{ background:"linear-gradient(135deg, #0A1A0F 60%, #11402D)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <Truck className="w-5 h-5 text-[#9CF06B]" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Live Route Tracking</h3>
            <p className="text-xs text-white/40">Real-time waste collection monitoring</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold"
            style={{ borderColor: Stage.color + "40", background: Stage.color + "15", color: Stage.color }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: Stage.color }} />
            {Stage.label}
          </div>
          <button onClick={() => { setIsPlaying(p => !p); if (!isPlaying) startRef.current = null; }}
            className="text-xs text-white/50 hover:text-white border border-white/15 px-3 py-1.5 rounded-full transition-colors">
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>
        </div>
      </div>

      <div className="relative w-full bg-gradient-to-br from-[#F0F8F2] to-[#F6F8F4]" style={{ height:"440px" }}>
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="rg" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M10 0L0 0 0 10" fill="none" stroke="#11402D" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#rg)"/>
        </svg>

        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d={ROUTE_PATH} stroke="#11402D" strokeWidth="0.5" fill="none"
            strokeDasharray="2,3" opacity="0.2"/>
          <motion.path d={ROUTE_PATH} stroke="#9CF06B" strokeWidth="1" fill="none"
            strokeLinecap="round"
            initial={{ pathLength:0 }} animate={{ pathLength: truckProgress }}
            transition={{ duration:0, ease:"linear" }}/>
          <motion.path d={ROUTE_PATH} stroke="#9CF06B" strokeWidth="2.5" fill="none"
            strokeLinecap="round" opacity="0.15"
            initial={{ pathLength:0 }} animate={{ pathLength: Math.max(0, truckProgress - 0.08) }}
            transition={{ duration:0, ease:"linear" }}/>
        </svg>

        {WAYPOINTS.map((wp, i) => {
          const visited = visitedStops.has(i);
          const isCurrent = currentStage === i;
          return (
            <motion.div key={i}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
              style={{ left:`${wp.x}%`, top:`${wp.y}%` }}
              initial={{ scale:0, opacity:0 }}
              animate={{ scale:1, opacity:1 }}
              transition={{ delay: i * 0.15, duration:0.5 }}>
              {isCurrent && (
                <motion.div className="absolute inset-0 -m-3 rounded-full border-2"
                  style={{ borderColor: TRUCK_STAGES[i].color }}
                  animate={{ scale:[1, 1.6, 1], opacity:[0.6, 0, 0.6] }}
                  transition={{ duration:1.8, repeat:Infinity }} />
              )}
              <motion.div
                animate={isCurrent ? { boxShadow:[`0 0 0 0px ${TRUCK_STAGES[i].color}40`, `0 0 0 8px ${TRUCK_STAGES[i].color}00`] } : {}}
                transition={{ duration:1.5, repeat:Infinity }}
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl border-4 shadow-xl"
                style={{
                  background: visited ? "#11402D" : "white",
                  borderColor: visited ? TRUCK_STAGES[Math.min(i, 3)].color : "#E5EDE8",
                }}>
                <span>{wp.icon}</span>
              </motion.div>
              <div className="absolute top-16 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
                <div className="text-xs font-bold text-[#0A1A0F] mb-0.5">{wp.name}</div>
                <div className="text-[10px] text-[#5A7060]">{wp.detail}</div>
                {visited && (
                  <div className="mt-1 text-[10px] font-bold rounded-full px-2 py-0.5 inline-block"
                    style={{ background: TRUCK_STAGES[Math.min(i,3)].color + "20", color: TRUCK_STAGES[Math.min(i,3)].color }}>
                    {TRUCK_STAGES[Math.min(i,3)].cargoDesc}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        <motion.div
          className="absolute z-20"
          style={{
            left:`${truckPos.x}%`,
            top:`${truckPos.y}%`,
            transform:"translate(-50%, -110%)",
          }}
          transition={{ duration:0, ease:"linear" }}>
          <AnimatePresence mode="wait">
            <motion.div key={currentStage}
              initial={{ opacity:0, y:-10, scale:0.85 }}
              animate={{ opacity:1, y:0, scale:1 }}
              exit={{ opacity:0, y:10, scale:0.85 }}
              transition={{ duration:0.4 }}>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-2 rounded-full opacity-20"
                style={{ background: Stage.color, filter:"blur(4px)" }} />
              <TruckComponent size={90} />
              <motion.div
                className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-black px-2.5 py-1 rounded-full"
                style={{ background: Stage.color, color:"#0A1A0F" }}
                animate={{ y:[0,-3,0] }} transition={{ duration:1.5, repeat:Infinity }}>
                {Stage.label}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="border-t border-[#E5EDE8] px-6 py-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#5A7060]">Journey progress</span>
          <div className="flex-1 h-1.5 rounded-full bg-[#E5EDE8] overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ background:"#9CF06B" }}
              animate={{ width:`${truckProgress * 100}%` }} transition={{ duration:0 }} />
          </div>
          <span className="text-xs font-mono font-bold text-[#11402D]">{Math.round(truckProgress * 100)}%</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {TRUCK_STAGES.map((s, i) => (
            <div key={i}
              className={`rounded-xl p-3 border transition-all ${
                i === currentStage
                  ? "border-[#9CF06B] bg-[#11402D]"
                  : visitedStops.has(i)
                  ? "border-[#E5EDE8] bg-[#F6F8F4]"
                  : "border-[#E5EDE8] bg-white opacity-40"
              }`}>
              <div className="text-[10px] font-black uppercase tracking-wider mb-1"
                style={{ color: i === currentStage ? "#9CF06B" : "#5A7060" }}>
                Stop {i + 1}
              </div>
              <div className={`text-xs font-bold ${i === currentStage ? "text-white" : "text-[#0A1A0F]"}`}>
                {WAYPOINTS[i].name.split(" ")[0]}
              </div>
              <div className={`text-[10px] mt-0.5 ${i === currentStage ? "text-white/60" : "text-[#5A7060]"}`}>
                {s.cargoDesc.split("—")[0].trim()}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[#E5EDE8] px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-[#F6F8F4]">
        <div>
          <p className="text-sm font-bold text-[#0A1A0F]">{Stage.cargoDesc}</p>
          <p className="text-xs text-[#5A7060]">
            {WAYPOINTS[Math.min(currentStage, 3)].name} → {currentStage < 3 ? WAYPOINTS[currentStage + 1].name : "Delivered"} • ETA: {Math.max(0, Math.round((1 - truckProgress) * 18))} min
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {[
            { dot:"#9CF06B",   label:"Active Route" },
            { dot:"#60a5fa",   label:"Sorted Materials" },
            { dot:"#fcd34d",   label:"Baled Cargo" },
            { dot:"#9CF06B",   label:"Energy Delivered" },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: s.dot }} />
              <span className="text-xs text-[#5A7060]">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────

export default function ReViveEnergyHomepage() {
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);

  const processSteps = [
    {
      icon: Truck,
      title: "Collection & Intake",
      desc: "Waste streams arrive from cities, hotels, factories, farms, and markets.",
    },
    {
      icon: Recycle,
      title: "Sorting & Recovery",
      desc: "Useful materials are separated before energy conversion begins.",
    },
    {
      icon: Flame,
      title: "Energy Conversion",
      desc: "Organic and residual waste is converted into clean usable energy.",
    },
    {
      icon: Zap,
      title: "Clean Energy Output",
      desc: "Power, gas, heat, and fertilizer are returned back to communities.",
    },
  ];

  const impactStats = [
    { value: "2.4M", label: "tonnes diverted from landfill every year" },
    { value: "850 GWh", label: "clean energy generated annually" },
    { value: "92%", label: "average waste diversion rate" },
    { value: "41", label: "active facilities worldwide" },
  ];

  const solutions = [
    {
      icon: Flame,
      title: "Thermal Conversion",
      desc: "Converts non-recyclable waste into electricity using controlled energy recovery systems.",
    },
    {
      icon: Droplets,
      title: "Anaerobic Digestion",
      desc: "Turns food, animal, and farm waste into biogas and organic fertilizer.",
    },
    {
      icon: Wind,
      title: "Landfill Gas Capture",
      desc: "Captures methane from landfills and converts it into power.",
    },
    {
      icon: Sun,
      title: "Hybrid Renewable Sites",
      desc: "Combines waste energy with solar and storage for stable clean power.",
    },
  ];

  const marqueeItems = [
    { icon: "🗑️", label: "Organic Waste" },
    { icon: "🌾", label: "Agricultural Waste" },
    { icon: "♻️", label: "Plastic Waste" },
    { icon: "🏭", label: "Industrial Waste" },
    { icon: "🪵", label: "Biomass Waste" },
  ];

  const quickActions = [
    { 
      icon: Mail, 
      label: "Email", 
      color: "#34D399",
      onClick: () => window.location.href = "mailto:samatar578@gmail.com"
    },
    { 
      icon: Phone, 
      label: "Call Us", 
      color: "#60A5FA",
      onClick: () => window.location.href = "tel:+254727568271"
    },
    { 
      icon: MessageSquare,
      label: "Live Chat", 
      color: "#3B82F6",
      onClick: () => alert("💬 Live chat coming soon! For now, please email us.")
    },
    { 
      icon: WhatsAppIcon,
      label: "WhatsApp", 
      color: "#25D366",
      onClick: () => window.open("https://wa.me/254727568271", "_blank")
    },
  ];

  // ─── NEW: Testimonials data ──────────────────────────────────
  const testimonials = [
    {
      quote:
        "The waste assessment revealed opportunities we never knew existed. Within 6 months, we cut disposal costs by 60% and started generating revenue from biogas.",
      name: "Sarah Mbeki",
      role: "Operations Director, Nairobi Breweries",
    },
    {
      quote:
        "The integration was seamless. Our team was trained and the system was operational within weeks. The energy savings alone have been transformative.",
      name: "James Ochieng",
      role: "Plant Manager, Great Lakes Farms",
    },
    {
      quote:
        "From assessment to installation, the ReVive team was professional and supportive. We've now achieved our sustainability targets ahead of schedule.",
      name: "Amina Diallo",
      role: "Sustainability Lead, Mombasa Port Authority",
    },
  ];

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8F4] text-[#142019] font-['Inter'] overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        .font-display {
          font-family: 'Space Grotesk', sans-serif;
        }

        .font-mono-cw {
          font-family: 'JetBrains Mono', monospace;
        }

        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .marquee-track {
          animation: marquee 25s linear infinite;
          width: max-content;
        }

        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* HERO */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-0 sm:pt-0 lg:pt-0 pb-14 sm:pb-16 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-6">
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[58px] leading-tight lg:leading-[1.08] font-semibold tracking-tight text-[#0E2A1C]">
              Every tonne of waste is a kilowatt{" "}
              <span className="relative inline-block text-[#11402D]">
                waiting to happen.
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  height="10"
                  viewBox="0 0 320 10"
                  preserveAspectRatio="none"
                  fill="none"
                >
                  <path
                    d="M2 8C60 2 260 2 318 8"
                    stroke="#9CF06B"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-[#142019]/65 max-w-xl leading-relaxed">
              ReVive Energy turns municipal, organic, and industrial waste into
              clean power, biogas, heat, and fertilizer — helping cities reduce
              landfill pollution while creating useful energy.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => scrollToSection("solutions")}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#11402D] text-white font-semibold text-sm sm:text-[15px] hover:bg-[#0C2F20] transition-colors flex items-center justify-center gap-2 shadow-[0_8px_24px_-8px_rgba(17,64,45,0.5)]"
              >
                Explore Our Facilities
                <ArrowRight className="w-4 h-4" />
              </button>

              <button 
                onClick={() => alert("📄 Impact report download will begin shortly.")}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full border border-[#142019]/15 font-semibold text-sm sm:text-[15px] hover:border-[#11402D]/40 hover:bg-white transition-colors"
              >
                Download Impact Report
              </button>
            </div>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-xl border-t border-[#142019]/10 pt-6">
              {impactStats.slice(0, 3).map((stat, index) => (
                <div key={index}>
                  <div className="font-display text-3xl font-semibold text-[#0E2A1C]">
                    {stat.value}
                  </div>
                  <p className="mt-1 text-sm text-[#142019]/55 leading-tight">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 w-full max-w-xl lg:max-w-none mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
              <div className="relative rounded-2xl overflow-hidden sm:row-span-2 h-[300px] sm:h-[400px] lg:h-[470px] group">
                <img
                  src="https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=900&q=80"
                  alt="Green restored landscape"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B2417]/75 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <p className="text-xs font-mono-cw uppercase tracking-wider text-[#9CF06B]">
                    Land restored
                  </p>
                  <h3 className="font-display text-xl font-semibold">
                    3,200 hectares reclaimed
                  </h3>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden h-[210px] sm:h-[190px] lg:h-[225px] group">
                <img
                  src={energyFacilityImage}
                  alt="Energy facility"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              <div className="relative rounded-2xl overflow-hidden h-[210px] sm:h-[190px] lg:h-[225px] group">
                <img
                  src={renewableFieldImage}
                  alt="Renewable energy field"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B2417]/50 via-transparent to-transparent" />
                
                <AnimatePresence>
                  {isQuickActionsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute bottom-16 right-4 flex flex-col items-end gap-3 z-20"
                    >
                      {quickActions.map((action, index) => {
                        const Icon = action.icon;
                        return (
                          <button
                            key={index}
                            onClick={action.onClick}
                            className="flex items-center gap-3 text-white hover:text-[#9CF06B] transition-colors group"
                          >
                            <span className="font-display text-sm font-medium text-white/90 group-hover:text-white">
                              {action.label}
                            </span>
                            <Icon className="w-6 h-6" style={{ color: action.color }} />
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
                  className={`absolute bottom-3 right-3 w-10 h-10 rounded-full bg-[#11402D] flex items-center justify-center shadow-lg hover:bg-[#0E2A1C] transition-all duration-300 z-10 ${
                    isQuickActionsOpen ? 'rotate-45' : ''
                  }`}
                >
                  {isQuickActionsOpen ? (
                    <X className="w-5 h-5 text-white" />
                  ) : (
                    <Plus className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* IMPACT STATS */}
      <section id="impact" className="bg-[#0E2A1C] text-white py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-xl">
            <p className="text-sm font-mono-cw uppercase tracking-wider text-[#9CF06B]/70 mb-3">
              Measured Impact
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[44px] font-semibold tracking-tight leading-tight">
              Numbers that replace landfill with clean energy.
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 rounded-2xl overflow-hidden">
            {impactStats.map((stat, index) => (
              <div key={index} className="bg-[#0E2A1C] p-7 sm:p-8 hover:bg-[#11402D] transition-colors">
                <div className="font-display text-4xl font-semibold text-[#9CF06B]">
                  {stat.value}
                </div>
                <p className="mt-3 text-sm text-white/55 leading-relaxed">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="bg-[#F6F8F4] py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#0E2A1C] tracking-tight">
              We Revive Energy From Waste Streams
            </h2>
            <p className="mt-3 text-lg text-[#142019]/65 max-w-2xl mx-auto">
              Transforming waste into clean energy, sustainable products, and a circular economy.
            </p>
          </div>
          <div className="relative overflow-hidden">
            <div className="absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-[#F6F8F4] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-[#F6F8F4] to-transparent z-10 pointer-events-none" />
            <div className="marquee-track flex items-center gap-12">
              {[...marqueeItems, ...marqueeItems].map((item, index) => (
                <div key={index} className="flex-shrink-0 flex items-center gap-3 text-[#0E2A1C]">
                  <span className="text-5xl sm:text-6xl">{item.icon}</span>
                  <span className="font-display font-semibold text-base sm:text-lg whitespace-nowrap">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS - The ReVive Route */}
      <section id="process" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-12 lg:py-16">
        <div className="mb-8">
          <p className="text-sm font-mono-cw uppercase tracking-wider text-[#11402D]/80 mb-3">
            The ReVive Route
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-[44px] font-semibold tracking-tight text-[#0E2A1C] leading-tight">
            From waste pickup to clean energy delivery.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#142019]/65 leading-relaxed max-w-2xl">
            Our platform connects homes, businesses, recycling companies,
            community centers, and processing plants through a smart moving
            logistics network.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {processSteps.map((step, index) => (
            <div key={index} className="flex gap-4 group">
              <div className="w-10 h-10 rounded-full border border-[#11402D]/25 flex items-center justify-center flex-shrink-0 group-hover:bg-[#0E2A1C] transition-colors">
                <step.icon className="w-5 h-5 text-[#11402D] group-hover:text-[#9CF06B] transition-colors" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-[#0E2A1C]">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm text-[#142019]/55 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── REPLACE THE STATIC MAP WITH THE ANIMATED ROUTE ── */}
        <ReViveRoute />
      </section>

      {/* SOLUTIONS */}
      <section id="solutions" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-20 lg:py-28">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <p className="text-sm font-mono-cw uppercase tracking-wider text-[#11402D]/60 mb-3">
              What We Build
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[44px] font-semibold tracking-tight text-[#0E2A1C] leading-tight">
              Conversion technology matched to every waste stream.
            </h2>
          </div>
          <button 
            onClick={() => scrollToSection("solutions")}
            className="flex items-center gap-2 font-semibold text-[#11402D] group"
          >
            View all technologies
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {solutions.map((card, index) => (
            <div key={index} className="bg-white rounded-2xl border border-[#142019]/10 p-7 hover:shadow-xl hover:shadow-[#11402D]/10 hover:-translate-y-1 transition-all duration-300">
              <div className="w-11 h-11 rounded-xl bg-[#9CF06B]/20 flex items-center justify-center mb-5">
                <card.icon className="w-5 h-5 text-[#11402D]" />
              </div>
              <h3 className="font-display font-semibold text-lg text-[#0E2A1C]">
                {card.title}
              </h3>
              <p className="mt-3 text-sm text-[#142019]/55 leading-relaxed">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SUSTAINABILITY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-14 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative rounded-3xl overflow-hidden h-[300px] sm:h-[380px] lg:h-[430px] order-2 lg:order-1">
            <img
              src="https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=1000&q=80"
              alt="Sorted recyclable materials"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0B2417]/45 to-transparent" />
            <div className="absolute top-5 left-5 right-5 sm:right-auto bg-white/95 backdrop-blur rounded-xl px-4 py-3 flex items-center gap-3">
              <Leaf className="w-5 h-5 text-[#11402D] flex-shrink-0" />
              <div>
                <p className="text-xs text-[#142019]/50 font-mono-cw">
                  Material recovery rate
                </p>
                <h3 className="font-display font-semibold text-[#0E2A1C]">
                  68% by volume
                </h3>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <p className="text-sm font-mono-cw uppercase tracking-wider text-[#11402D]/60 mb-3">
              Built for Compliance
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[44px] font-semibold tracking-tight text-[#0E2A1C] leading-tight">
              Cleaner than the regulations require.
            </h2>
            <p className="mt-6 text-base sm:text-lg text-[#142019]/65 leading-relaxed">
              Every ReVive Energy facility is designed with emissions
              monitoring, safe processing, community reporting, and long-term
              sustainability in mind.
            </p>
            <div className="mt-9 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                ["Emissions monitoring", "Real-time, public"],
                ["Flue gas treatment", "Multi-stage filtration"],
                ["Byproduct use", "Construction aggregate"],
                ["Community reporting", "Quarterly disclosures"],
              ].map(([label, value], index) => (
                <div key={index} className="border-l-2 border-[#9CF06B] pl-4">
                  <p className="text-sm text-[#142019]/45 font-mono-cw">
                    {label}
                  </p>
                  <h3 className="font-display font-semibold text-[#0E2A1C] mt-1">
                    {value}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* GLOBAL */}
      <section id="global" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-20 lg:py-28">
        <div className="bg-[#11402D] rounded-3xl px-6 sm:px-10 lg:px-14 py-12 sm:py-16 lg:py-20 text-white relative overflow-hidden">
          <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full border border-white/10" />
          <div className="absolute -right-10 -top-10 w-60 h-60 rounded-full border border-white/10" />
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm font-mono-cw uppercase tracking-wider text-[#9CF06B]/70 mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Global Operations
              </p>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-[44px] font-semibold tracking-tight leading-tight">
                Built locally, operated to one standard.
              </h2>
              <p className="mt-6 text-base sm:text-lg text-white/65 leading-relaxed max-w-xl">
                From Nairobi to Rotterdam, every ReVive Energy plant adapts to
                local waste needs, grid demands, and community priorities.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                ["East Africa", "9 facilities"],
                ["Western Europe", "14 facilities"],
                ["Southeast Asia", "11 facilities"],
                ["Latin America", "7 facilities"],
              ].map(([region, sites], index) => (
                <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
                  <MapPin className="w-4 h-4 text-[#9CF06B] mb-3" />
                  <h3 className="font-display font-semibold">{region}</h3>
                  <p className="text-sm text-white/50 mt-1">{sites}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── ★ NEW TESTIMONIALS SECTION ★ ────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-20 lg:py-24 bg-white">
        <div className="text-center mb-12">
          <p className="text-sm font-mono-cw uppercase tracking-wider text-[#11402D]/60 mb-3 flex items-center justify-center gap-2">
            <Star className="w-4 h-4" /> Testimonials
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-[44px] font-semibold tracking-tight text-[#0E2A1C] leading-tight">
            What Our <span className="text-[#11402D]">Partners</span> Say
          </h2>
          <p className="mt-3 text-lg text-[#142019]/65 max-w-2xl mx-auto">
            Real experiences from real partners
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-[#F6F8F4] rounded-2xl p-6 border border-[#11402D]/5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-[#9CF06B] text-[#9CF06B]" />
                ))}
              </div>
              <p className="text-sm text-[#142019]/55 leading-relaxed italic">"{t.quote}"</p>
              <div className="mt-4 pt-4 border-t border-[#11402D]/10">
                <p className="font-display font-semibold text-[#0E2A1C]">{t.name}</p>
                <p className="text-xs text-[#142019]/50">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── ORIGINAL TESTIMONIAL (kept unchanged) ────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-14 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 relative rounded-3xl overflow-hidden h-[260px] sm:h-[340px] lg:h-[370px]">
            <img
              src="https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=900&q=80"
              alt="Solar panel field"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="lg:col-span-7">
            <BarChart3 className="w-8 h-8 text-[#9CF06B] mb-6" />
            <blockquote className="font-display text-2xl sm:text-3xl font-medium text-[#0E2A1C] leading-relaxed">
              Partnering with ReVive Energy cut our landfill dependency by more
              than half while adding reliable clean power to the regional grid.
            </blockquote>
            <div className="mt-6 flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#11402D]/10 flex items-center justify-center font-display font-semibold text-[#11402D]">
                MO
              </div>
              <div>
                <h3 className="font-semibold text-[#0E2A1C]">Maria Oduya</h3>
                <p className="text-sm text-[#142019]/50">
                  Director of Sustainability, GreenGrid Co.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-14 sm:py-16 lg:py-24">
        <div className="rounded-3xl bg-[#0E2A1C] px-6 sm:px-10 lg:px-16 py-12 sm:py-16 lg:py-20 text-center">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white max-w-3xl mx-auto leading-tight">
            Ready to turn your city's waste into its next power source?
          </h2>
          <p className="mt-5 text-base sm:text-lg text-white/70 max-w-xl mx-auto">
            Talk to our infrastructure team about feasibility studies,
            financing models, and deployment timelines.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => scrollToSection("contact")}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white text-[#0E2A1C] font-semibold text-sm sm:text-[15px] hover:bg-[#F5F4F0] transition-colors flex items-center justify-center gap-2"
            >
              Schedule a Consultation
              <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => alert("📘 Brochure download will begin shortly.")}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full border border-white/30 text-white font-semibold text-sm sm:text-[15px] hover:bg-white/10 transition-colors"
            >
              Download Brochure
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0E2A1C] text-white pt-14 sm:pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#9CF06B]/15 flex items-center justify-center">
                  <Recycle className="w-5 h-5 text-[#9CF06B]" />
                </div>
                <span className="font-display text-xl font-semibold">
                  ReVive Energy
                </span>
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
              <a href="#" className="hover:text-[#9CF06B] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#9CF06B] transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}