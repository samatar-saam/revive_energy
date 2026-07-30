import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import wasteToEnergyImage from "../assets/waste-to-energy.jpg";
import biogasImage from "../assets/biogas.jpg";
import electricityImage from "../assets/electricity.jpg";
import fertilizerImage from "../assets/fertilizer.jpg";
import biocharImage from "../assets/biochar.jpg";
import biomassFuelImage from "../assets/biomass-fuel.jpg";
import recycledPlasticImage from "../assets/recycled-plastic.jpg";

// Import process videos
import biogasProcessVideo from "../assets/videos/biogas-process.mp4";
import electricityProcessVideo from "../assets/videos/electricity-process.mp4";
import fertilizerProcessVideo from "../assets/videos/fertilizer-process.mp4";
import biocharProcessVideo from "../assets/videos/biochar-process.mp4";
import biomassProcessVideo from "../assets/videos/biomass-fuel.jpg.mp4";
import recyclingProcessVideo from "../assets/videos/recycling-process.mp4";
import {
  ArrowRight, Recycle, Leaf, Zap, Flame, Droplets, Sun, Wind,
  Truck, Factory, Package, Wheat, Users, Globe, BarChart3,
  CheckCircle2, MapPin, Clock, Star, Shield, TrendingUp,
  Award, Play, ChevronRight, Sparkles, Gauge, Activity,
   Droplet as DropletIcon, Sprout, Circle,
  ChevronDown, Mail, Phone, Building2, Home, Battery, ChartBar,
  Gift, Recycle as RecycleIcon, Compass, Target, Eye,
  Filter, Layers, Boxes, ArrowDown, ArrowUp, CircleDot,
  Thermometer, Wind as WindIcon, Zap as ZapIcon, CloudSun,
  TreePine, Flower2, Factory as FactoryIcon, Warehouse,
  Building, LandPlot, Tractor, Bus, Car, Ship, Plane,
  Wifi, Cpu, Cctv, Coffee, Utensils, Pizza, Apple,
  ShoppingBag, Store, Hotel, Home as HomeIcon, Briefcase,
  Volume2, VolumeX, Pause
} from "lucide-react";

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
  {
    id: 1,
    title: "Biogas",
    icon: Flame,
    image: biogasImage,
    description: "Produced from organic waste, food waste, animal manure, and agricultural residue through anaerobic digestion.",
    uses: ["Cooking gas", "Industrial heating", "Electricity generation", "Vehicle fuel"],
    benefits: ["Reduces methane emissions", "Replaces fossil fuels", "Renewable energy source"],
    color: "#F59E0B",
    stat: "85% Efficiency"
  },
  {
    id: 2,
    title: "Electricity",
    icon: Zap,
    image: electricityImage,
    description: "Generated through advanced waste conversion technologies including gasification and pyrolysis.",
    uses: ["Homes", "Industries", "Commercial facilities", "Electric vehicles"],
    benefits: ["Renewable energy", "Grid support", "Energy independence"],
    color: "#60A5FA",
    stat: "850 GWh Produced"
  },
  {
    id: 3,
    title: "Organic Fertilizer",
    icon: Leaf,
    image: fertilizerImage,
    description: "Nutrient-rich digestate produced from processed organic waste, perfect for soil regeneration.",
    uses: ["Farms", "Greenhouses", "Landscaping", "Urban gardens"],
    benefits: ["Improves soil fertility", "Reduces chemical fertilizer use", "Increases crop yields"],
    color: "#34D399",
    stat: "5,000+ Tons/Year"
  },
  {
    id: 4,
    title: "Biochar",
    icon: DropletIcon,
    image: biocharImage,
    description: "Carbon-rich material created from biomass through pyrolysis, capturing carbon for centuries.",
    uses: ["Agriculture", "Carbon sequestration", "Soil improvement", "Water filtration"],
    benefits: ["Captures carbon", "Improves crop yields", "Enhances soil health"],
    color: "#8B5CF6",
    stat: "10,000+ Tons Sequestered"
  },
  {
    id: 5,
    title: "Biomass Fuel",
    icon: Flame,
    image: biomassFuelImage,
    description: "High-density fuel produced from agricultural and industrial waste, offering clean combustion.",
    uses: ["Boilers", "Industrial energy", "Heating systems", "Power plants"],
    benefits: ["Renewable fuel source", "Waste reduction", "Carbon neutral"],
    color: "#F97316",
    stat: "95% Carbon Neutral"
  },
  {
    id: 6,
    title: "Recycled Plastic Products",
    icon: RecycleIcon,
    image: recycledPlasticImage,
    description: "Recovered plastics converted into durable, high-quality products through advanced recycling.",
    uses: ["Furniture", "Construction materials", "Packaging", "Consumer goods"],
    benefits: ["Reduces plastic pollution", "Conserves resources", "Circular economy"],
    color: "#818CF8",
    stat: "50,000+ Tons Recycled"
  }
];

const WASTE_TYPES = [
  { type: "Organic Waste", icon: Leaf, color: "#34D399", outcomes: ["Biogas", "Fertilizer", "Electricity"], description: "Food waste, market waste, restaurant waste, household organics" },
  { type: "Agricultural Waste", icon: Wheat, color: "#F59E0B", outcomes: ["Biomass Fuel", "Biochar", "Electricity"], description: "Crop residue, manure, husks, stover, bagasse" },
  { type: "Plastic Waste", icon: Recycle, color: "#818CF8", outcomes: ["Recycled Products"], description: "PET, HDPE, LDPE, PP, PS, PVC" },
  { type: "Industrial Waste", icon: Factory, color: "#F97316", outcomes: ["Biomass Energy", "Recycled Materials"], description: "Manufacturing byproducts, scrap, industrial biomass" },
  { type: "Municipal Waste", icon: Building2, color: "#60A5FA", outcomes: ["Electricity", "Recovered Resources"], description: "Household waste, commercial waste, institutional waste" },
];

const IMPACT_STATS = [
  { value: 125000, suffix: "+", label: "Tons Diverted From Landfills", icon: Recycle, detail: "Enough to fill 50 Olympic swimming pools" },
  { value: 850, suffix: " GWh", label: "Clean Energy Generated", icon: Zap, detail: "Powering 150,000+ homes annually" },
  { value: 45000, suffix: "+", label: "Tons CO₂ Reduced", icon: Leaf, detail: "Equivalent to removing 10,000 cars" },
  { value: 2500, suffix: "+", label: "Partners Connected", icon: Users, detail: "Across 8 African countries" },
];

const JOURNEY_STEPS = [
  { title: "Waste Sources", icon: Package, color: "#34D399", desc: "Homes, businesses, farms, and industries generate waste" },
  { title: "Collection", icon: Truck, color: "#60A5FA", desc: "Certified partners collect and transport waste streams" },
  { title: "Transportation", icon: MapPin, color: "#F59E0B", desc: "Optimized routes ensure efficient delivery" },
  { title: "Processing Plant", icon: Factory, color: "#818CF8", desc: "Advanced sorting, treatment, and conversion" },
  { title: "Energy Recovery", icon: Zap, color: "#9CF06B", desc: "Waste is converted into clean energy and products" },
  { title: "Final Products", icon: Recycle, color: "#11402D", desc: "Biogas, electricity, fertilizer, and recycled materials" },
];

const PROCESS_VIDEOS = [
  {
    id: 1,
    title: "How Biogas is Made",
    subtitle: "From organic waste to renewable energy",
    video: biogasProcessVideo,
    description: "Watch the complete process of converting organic waste into biogas through anaerobic digestion.",
    steps: [
      "Organic waste collection and sorting",
      "Anaerobic digestion process",
      "Biogas capture and purification",
      "Storage and distribution"
    ],
    stats: ["85% Efficiency", "120m³/T Biogas", "3x Faster than composting"],
    color: "#F59E0B",
    category: "Biogas"
  },
  {
    id: 2,
    title: "How Electricity is Generated",
    subtitle: "Waste-to-energy power generation",
    video: electricityProcessVideo,
    description: "See how advanced waste conversion technologies generate clean electricity.",
    steps: [
      "Waste feedstock preparation",
      "Gasification process",
      "Energy recovery",
      "Grid integration"
    ],
    stats: ["850 GWh Produced", "150,000 Homes", "24/7 Supply"],
    color: "#60A5FA",
    category: "Electricity"
  },
  {
    id: 3,
    title: "How Organic Fertilizer is Produced",
    subtitle: "Nutrient-rich soil regeneration",
    video: fertilizerProcessVideo,
    description: "Discover how organic waste becomes premium fertilizer for farms and gardens.",
    steps: [
      "Digestate collection",
      "Nutrient concentration",
      "Quality testing",
      "Packaging and distribution"
    ],
    stats: ["5,000+ Tons/Year", "30% Yield Increase", "100% Organic"],
    color: "#34D399",
    category: "Fertilizer"
  },
  {
    id: 4,
    title: "How Biochar is Created",
    subtitle: "Carbon sequestration through pyrolysis",
    video: biocharProcessVideo,
    description: "Learn how biomass is transformed into biochar, capturing carbon for centuries.",
    steps: [
      "Biomass preparation",
      "Pyrolysis process",
      "Carbon activation",
      "Soil application"
    ],
    stats: ["10,000+ Tons", "Carbon Captured", "50% Yield Boost"],
    color: "#8B5CF6",
    category: "Biochar"
  },
  {
    id: 5,
    title: "How Biomass Fuel is Made",
    subtitle: "Clean energy from agricultural waste",
    video: biomassProcessVideo,
    description: "Watch agricultural and industrial waste become high-density biomass fuel.",
    steps: [
      "Agricultural waste collection",
      "Drying and processing",
      "Briquetting",
      "Quality assurance"
    ],
    stats: ["95% Carbon Neutral", "Zero Waste", "5,000+ Tons"],
    color: "#F97316",
    category: "Biomass Fuel"
  },
  {
    id: 6,
    title: "How Plastic is Recycled",
    subtitle: "Turning waste plastic into valuable products",
    video: recyclingProcessVideo,
    description: "See the advanced recycling process that transforms plastic waste into new products.",
    steps: [
      "Plastic sorting and cleaning",
      "Shredding and melting",
      "Pelletizing",
      "Product manufacturing"
    ],
    stats: ["50,000+ Tons", "100% Recyclable", "8 Products Made"],
    color: "#818CF8",
    category: "Recycling"
  }
];

/* ─── VIDEO CARD COMPONENT ─── */
function VideoCard({ item, index }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleVideoClick = () => {
    togglePlay();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -8 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-[#11402D]/5 group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div 
        className="relative h-64 overflow-hidden bg-[#0A1A0F] cursor-pointer"
        onClick={handleVideoClick}
      >
        <video
          ref={videoRef}
          src={item.video}
          className="w-full h-full object-cover"
          playsInline
          preload="metadata"
          muted={isMuted}
          onClick={handleVideoClick}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1A0F]/80 via-transparent to-transparent pointer-events-none" />
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4 pointer-events-none">
          <span className="text-[10px] font-bold px-3 py-1.5 rounded-full backdrop-blur-sm border"
            style={{ 
              background: `${item.color}22`, 
              color: item.color,
              borderColor: `${item.color}44`
            }}
          >
            {item.category}
          </span>
        </div>
        
        {/* Play/Pause Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {!isPlaying ? (
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center border-2 border-white/40 transition-transform group-hover:scale-110 pointer-events-auto">
              <Play className="w-10 h-10 text-white ml-1" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center border-2 border-white/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
              <Pause className="w-10 h-10 text-white" />
            </div>
          )}
        </div>
        
        {/* Title Overlay */}
        <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
          <h3 className="text-white font-bold text-xl font-display">{item.title}</h3>
          <p className="text-white/70 text-sm">{item.subtitle}</p>
        </div>

        {/* Sound Control */}
        <button
          onClick={toggleMute}
          className={`absolute bottom-4 right-4 w-8 h-8 rounded-full bg-black/50 backdrop-blur flex items-center justify-center transition-opacity z-10 ${
            showControls || isPlaying ? 'opacity-100' : 'opacity-0'
          } hover:bg-black/70`}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-white" />
          ) : (
            <Volume2 className="w-4 h-4 text-white" />
          )}
        </button>
      </div>
      
      <div className="p-6">
        <p className="text-sm text-[#5A7060] leading-relaxed mb-4">{item.description}</p>
        
        <div className="mb-4">
          <div className="text-xs font-bold text-[#11402D] uppercase tracking-wider mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Process Steps
          </div>
          <div className="space-y-1.5">
            {item.steps.map((step, j) => (
              <div key={j} className="flex items-center gap-2 text-xs text-[#5A7060]">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: item.color }} />
                {step}
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {item.stats.map((stat, j) => (
            <div key={j} className="text-center bg-[#F6F8F4] rounded-lg p-2">
              <div className="text-xs font-bold text-[#11402D]">{stat}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── MAIN PAGE ─── */
export default function EnergyProductsPage() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const [activeProduct, setActiveProduct] = useState(0);
  const [showAllProducts, setShowAllProducts] = useState(false);

  const displayedProducts = showAllProducts ? ENERGY_PRODUCTS : ENERGY_PRODUCTS.slice(0, 3);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const navigateTo = (path) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-[#F6F8F4] text-[#142019] overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        .font-display {
          font-family: 'Space Grotesk', sans-serif;
        }

        .font-mono-cw {
          font-family: 'JetBrains Mono', monospace;
        }

        .shadow-glow { box-shadow: 0 0 40px rgba(156, 240, 107, 0.15); }
        .gradient-text { background: linear-gradient(135deg, #11402D, #9CF06B); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      `}</style>

      {/* ── SCROLL PROGRESS ── */}
      <motion.div className="fixed top-0 left-0 h-0.5 bg-[#9CF06B] z-50 origin-left"
        style={{ width: progressWidth }} />

      {/* ============ HERO SECTION – SHORTER & TWO IMAGES ============ */}
      <section id="hero" className="relative bg-white pt-6 pb-14 lg:pt-8 lg:pb-16 overflow-hidden">
        {/* ambient depth */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 right-0 w-[36rem] h-[36rem] bg-[#9CF06B]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -left-24 w-[28rem] h-[28rem] bg-[#11402D]/8 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-12 gap-y-6 lg:gap-x-8 items-start">

            {/* ── LEFT: headline & pitch ── */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-4"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-[#11402D]/15 bg-white px-4 py-1.5 mb-6 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#11402D]" />
                <span className="text-xs font-semibold text-[#11402D]">Natural Waste Technologies</span>
              </div>

              <h1 className="font-display text-5xl sm:text-6xl leading-[1.05] tracking-tight mb-6">
                <span className="block text-[#0E2A1C]">From Waste To</span>
                <span className="block gradient-text">Valuable Energy</span>
                <span className="block text-[#0E2A1C]">Smart Living</span>
              </h1>

              <div className="flex items-center gap-3 mb-7">
                {[
                  { icon: Recycle, label: "Circular by design" },
                  { icon: Gauge, label: "High efficiency" },
                  { icon: Shield, label: "Certified process" },
                ].map((item) => (
                  <div key={item.label} className="group relative">
                    <div className="w-12 h-12 rounded-full bg-white border border-[#11402D]/10 shadow-sm flex items-center justify-center hover:border-[#11402D]/30 hover:shadow-md transition-all">
                      <item.icon className="w-5 h-5 text-[#11402D]" />
                    </div>
                    <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 whitespace-nowrap text-[10px] font-medium text-white bg-[#0E2A1C] px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mb-6">
                <div className="w-8 h-px bg-[#11402D]/25 mt-2.5 flex-shrink-0" />
                <p className="text-sm text-[#142019]/60 leading-relaxed">
                  High-efficiency conversion turns organic, agricultural, and municipal waste into biogas, electricity, and fertilizer — with live monitoring at every stage and zero waste sent to landfill.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => scrollToSection('products')}
                  className="group bg-[#11402D] text-white font-bold px-7 py-3 rounded-full text-sm shadow-lg shadow-[#11402D]/20 hover:shadow-xl transition-shadow flex items-center gap-2"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigateTo('/partners')}
                  className="border-2 border-[#11402D]/15 text-[#11402D] font-bold px-7 py-3 rounded-full text-sm hover:bg-[#11402D]/[0.04] hover:border-[#11402D]/30 transition-colors"
                >
                  Explore
                </motion.button>
              </div>
            </motion.div>

            {/* ── CENTER: photo collage ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="lg:col-span-5 relative px-4 sm:px-6"
            >
              {/* organic blob accents */}
              <svg viewBox="0 0 200 200" className="absolute -top-10 -left-8 sm:-top-14 sm:-left-12 w-40 h-40 sm:w-56 sm:h-56 -z-10">
                <path
                  fill="#9CF06B"
                  fillOpacity="0.4"
                  d="M52.4,-62.3C66.5,-53.5,75.9,-36.6,78.7,-19.1C81.6,-1.6,78.8,16.5,70.1,31.2C61.3,45.9,46.5,57.2,30.4,64.2C14.2,71.2,-3.4,73.9,-20.6,70.4C-37.9,66.9,-54.9,57.2,-65.6,42.7C-76.4,28.2,-80.9,8.9,-77.8,-8.7C-74.7,-26.3,-64,-42.3,-50,-51.6C-36,-60.9,-18,-63.5,0.6,-64.3C19.2,-65.1,38.4,-71,52.4,-62.3Z"
                  transform="translate(100 100)"
                />
              </svg>
              <svg viewBox="0 0 200 200" className="absolute -bottom-10 -right-6 sm:-bottom-14 sm:-right-10 w-36 h-36 sm:w-48 sm:h-48 -z-10">
                <path
                  fill="#11402D"
                  fillOpacity="0.16"
                  d="M60.9,-70.7C77.4,-59.6,88,-38.6,89.6,-18.1C91.2,2.5,83.8,22.6,71.6,38.5C59.5,54.4,42.6,66,23.9,72.6C5.2,79.2,-15.4,80.7,-33.4,74.3C-51.4,68,-66.9,53.7,-75.8,36.2C-84.7,18.6,-87,-2.3,-81.1,-20.4C-75.2,-38.6,-61,-54.1,-44.5,-64.9C-28,-75.7,-9.2,-81.9,9.1,-82.3C27.4,-82.8,44.4,-81.7,60.9,-70.7Z"
                  transform="translate(100 100) scale(0.85)"
                />
              </svg>

              {/* shadow */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-2 w-[70%] h-10 bg-[#0E2A1C]/25 blur-2xl rounded-full -z-10" />

              {/* MAIN IMAGE – waste to energy */}
              <div className="relative rounded-[1.75rem] overflow-hidden aspect-[3/4] sm:aspect-[3/4] shadow-2xl ring-1 ring-black/5">
                <img src={wasteToEnergyImage} alt="Waste to energy facility" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B2417]/70 via-[#0B2417]/10 to-transparent" />

                {/* bottom stat card */}
                <div className="absolute bottom-6 left-6 right-24 sm:right-28 bg-white/10 backdrop-blur-xl rounded-2xl px-4 py-3.5 border border-white/25 shadow-lg">
                  <div className="font-display text-2xl font-bold text-white tabular-nums">
                    <Counter to={125000} suffix="+" />
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#9CF06B]">Tons Diverted</div>
                  <div className="text-[11px] text-white/60 mt-1 leading-snug">Driving a smarter future with clean, reliable energy.</div>
                </div>
              </div>

              {/* floating badges */}
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="absolute left-0 sm:-left-4 top-10 bg-white/70 backdrop-blur-xl rounded-full pl-3 pr-4 py-2 flex items-center gap-2 border border-white/60 shadow-xl"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34D399] opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#34D399]" />
                </span>
                <span className="text-xs font-semibold text-[#0E2A1C] whitespace-nowrap">85% Diversion Rate</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.52, duration: 0.5 }}
                className="absolute left-3 sm:-left-1 top-28 bg-white/65 backdrop-blur-xl rounded-full pl-3 pr-4 py-2 flex items-center gap-2 border border-white/60 shadow-xl"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA]" />
                <span className="text-xs font-semibold text-[#0E2A1C] whitespace-nowrap">Live Monitoring</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.64, duration: 0.5 }}
                className="absolute left-6 sm:left-3 top-[11rem] bg-white/60 backdrop-blur-xl rounded-full pl-3 pr-4 py-2 flex items-center gap-2 border border-white/60 shadow-xl"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                <span className="text-xs font-semibold text-[#0E2A1C] whitespace-nowrap">Certified Process</span>
              </motion.div>

              {/* pill row */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-3"
              >
                <span className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-full shadow-xl px-4 py-2 text-xs font-semibold text-[#0E2A1C] flex items-center gap-1.5 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#11402D]" /> Waste Collection
                </span>
                <span className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-full shadow-xl px-4 py-2 text-xs font-semibold text-[#0E2A1C] flex items-center gap-1.5 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9CF06B]" /> Clean Energy
                </span>
              </motion.div>
            </motion.div>

            {/* ── RIGHT: journey copy + secondary panel with new image ── */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="lg:col-span-3 flex flex-col gap-4"
            >
              <div>
                <h2 className="font-display text-2xl font-bold text-[#0E2A1C] leading-snug mb-3">
                  Start Your Journey Here
                </h2>
                <p className="text-sm text-[#142019]/55 leading-relaxed">
                  Take the first step toward a cleaner, smarter future. Discover how waste-to-energy solutions can cut costs, power your community, and support a greener continent — starting today.
                </p>
              </div>

              {/* SECONDARY IMAGE – biogas plant (different image) */}
              <div className="relative rounded-[1.75rem] overflow-hidden shadow-xl ring-1 ring-black/5 aspect-[3/4]">
                <img
                  src={biogasImage}
                  alt="Biogas plant"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: "center" }}
                />
                <div className="absolute inset-0 bg-[#0E2A1C]/35" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B2417]/80 via-transparent to-transparent" />

                <div className="absolute top-4 left-4 bg-white/60 backdrop-blur-xl border border-white/50 rounded-full shadow-lg px-3 py-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#11402D]" />
                  <span className="text-[11px] font-semibold text-[#0E2A1C]">Our Network</span>
                </div>
                <div className="absolute top-4 right-4 flex gap-1">
                  {[0, 1, 2].map((d) => (
                    <span key={d} className={`w-1.5 h-1.5 rounded-full ${d === 0 ? "bg-white" : "bg-white/40"}`} />
                  ))}
                </div>

                <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-xl rounded-lg px-3.5 py-3 border border-white/25 shadow-lg">
                  <div className="font-display text-xl font-bold text-white tabular-nums">
                    <Counter to={2500} suffix="+" />
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#9CF06B]">Partners Connected</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ WASTE TO PRODUCT JOURNEY ============ */}
      <section className="py-24 bg-white" id="journey">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="flex justify-center mb-6">
              <div className="w-12 h-px bg-[#11402D]" />
            </div>
            <p className="font-mono-cw text-sm uppercase tracking-wider text-[#11402D]/80 mb-3">
              The Journey
            </p>
            <h2 className="font-display text-4xl sm:text-5xl text-[#0E2A1C] mb-4">
              Waste To Product Journey
            </h2>
            <p className="text-lg text-[#142019]/65">
              Every tonne of waste follows a clear path to becoming a valuable resource, creating a truly circular economy.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {JOURNEY_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-[#F6F8F4] rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border border-[#11402D]/5 group relative"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110"
                      style={{ background: `${step.color}15` }}>
                      <Icon className="w-6 h-6" style={{ color: step.color }} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#11402D] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: step.color }} />
                        Step {i + 1} of {JOURNEY_STEPS.length}
                      </div>
                      <h3 className="font-display font-bold text-[#0E2A1C] text-lg">{step.title}</h3>
                      <p className="text-sm text-[#142019]/55 mt-1">{step.desc}</p>
                    </div>
                  </div>
                  {i < JOURNEY_STEPS.length - 1 && (
                    <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                      <ArrowRight className="w-5 h-5 text-[#11402D]/20" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ ENERGY PRODUCTS ============ */}
      <section className="py-24 bg-[#F6F8F4]" id="products">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="flex justify-center mb-6">
              <div className="w-12 h-px bg-[#11402D]" />
            </div>
            <p className="font-mono-cw text-sm uppercase tracking-wider text-[#11402D]/80 mb-3">
              Our Products
            </p>
            <h2 className="font-display text-4xl sm:text-5xl text-[#0E2A1C] mb-4">
              Energy Products Produced
            </h2>
            <p className="text-lg text-[#142019]/65">
              From waste comes value — discover the comprehensive range of products we create every day.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedProducts.map((product, i) => {
              const Icon = product.icon;
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -12 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all border border-[#11402D]/5 group"
                >
                  <div className="relative h-52 overflow-hidden">
                    <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B2417]/70 via-transparent to-transparent" />
                    <div className="absolute top-4 left-4">
                      <div className="w-12 h-12 rounded-xl bg-[#11402D] flex items-center justify-center">
                        <Icon className="w-6 h-6 text-[#9CF06B]" />
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-display font-bold text-2xl">{product.title}</h3>
                      <div className="text-white/60 text-sm">{product.stat}</div>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-[#142019]/65 leading-relaxed mb-4">{product.description}</p>
                    
                    <div className="mb-4">
                      <div className="text-xs font-bold text-[#11402D] uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Target className="w-3.5 h-3.5" />
                        Uses
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {product.uses.map((use, j) => (
                          <span key={j} className="text-xs bg-[#F6F8F4] px-3 py-1.5 rounded-full text-[#142019]/55">{use}</span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs font-bold text-[#11402D] uppercase tracking-wider mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Benefits
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {product.benefits.map((benefit, j) => (
                          <span key={j} className="text-xs bg-[#9CF06B]/10 text-[#11402D] px-3 py-1.5 rounded-full flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3" /> {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* View All / Show Less Button */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <button
              onClick={() => setShowAllProducts(!showAllProducts)}
              className="inline-flex items-center gap-2 border-2 border-[#11402D]/12 text-[#11402D] font-display font-bold px-8 py-3.5 rounded-full text-sm hover:bg-[#11402D] hover:text-white hover:border-[#11402D] transition-all"
            >
              {showAllProducts ? (
                <>Show Less <ArrowUp className="w-4 h-4" /></>
              ) : (
                <>View All Products <ChevronDown className="w-4 h-4" /></>
              )}
            </button>
          </motion.div>
        </div>
      </section>

      {/* ============ WASTE TYPES TABLE ============ */}
      <section className="py-24 bg-white" id="waste-types">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="flex justify-center mb-6">
              <div className="w-12 h-px bg-[#11402D]" />
            </div>
            <p className="font-mono-cw text-sm uppercase tracking-wider text-[#11402D]/80 mb-3">
              Waste Mapping
            </p>
            <h2 className="font-display text-4xl sm:text-5xl text-[#0E2A1C] mb-4">
              Waste Types & Outcomes
            </h2>
            <p className="text-lg text-[#142019]/65">
              Every waste stream has a purpose — here's what they become through our advanced processing.
            </p>
          </motion.div>

          <div className="bg-[#F6F8F4] rounded-2xl overflow-hidden shadow-xl border border-[#11402D]/5">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#11402D]">
                    <th className="px-6 py-5 text-left text-sm font-bold text-white">Waste Type</th>
                    <th className="px-6 py-5 text-left text-sm font-bold text-white">Description</th>
                    <th className="px-6 py-5 text-left text-sm font-bold text-white">Outcomes</th>
                    <th className="px-6 py-5 text-left text-sm font-bold text-white">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {WASTE_TYPES.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <motion.tr
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08 }}
                        className={`border-b border-[#11402D]/5 hover:bg-white/50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-[#F6F8F4]'}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${item.color}15` }}>
                              <Icon className="w-5 h-5" style={{ color: item.color }} />
                            </div>
                            <span className="font-display font-bold text-[#0E2A1C]">{item.type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#142019]/55">{item.description}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {item.outcomes.map((outcome, j) => (
                              <span key={j} className="text-xs bg-[#9CF06B]/10 text-[#11402D] px-3 py-1.5 rounded-full font-medium">
                                {outcome}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#34D399] bg-[#34D399]/10 px-3 py-1.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
                            Processing Active
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PROCESS VIDEOS ============ */}
      <section className="py-24 bg-[#F6F8F4]" id="videos">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="flex justify-center mb-6">
              <div className="w-12 h-px bg-[#11402D]" />
            </div>
            <p className="font-mono-cw text-sm uppercase tracking-wider text-[#11402D]/80 mb-3">
              How It's Made
            </p>
            <h2 className="font-display text-4xl sm:text-5xl text-[#0E2A1C] mb-4">
              Watch the Process
            </h2>
            <p className="text-lg text-[#142019]/65">
              See how we transform waste into valuable products through advanced technology.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROCESS_VIDEOS.map((item, i) => (
              <VideoCard key={item.id} item={item} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ============ IMPACT STATS ============ */}
      <section className="py-24 bg-[#0E2A1C] text-white" id="impact">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <div className="flex justify-center mb-6">
              <div className="w-12 h-px bg-[#9CF06B]/30" />
            </div>
            <p className="font-mono-cw text-sm uppercase tracking-wider text-[#9CF06B]/70 mb-3">
              Environmental Impact
            </p>
            <h2 className="font-display text-4xl sm:text-5xl text-white mb-4">
              The Numbers Behind Our Mission
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              Real change measured in real numbers — our impact speaks for itself.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {IMPACT_STATS.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center bg-white/5 rounded-2xl p-6 backdrop-blur border border-white/10 hover:bg-white/10 transition-all"
                >
                  <div className="w-14 h-14 rounded-full bg-[#9CF06B]/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-[#9CF06B]" />
                  </div>
                  <div className="font-display text-4xl md:text-5xl font-bold text-[#9CF06B] mb-2">
                    <Counter to={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm text-white/60 font-medium">{stat.label}</div>
                  <div className="text-xs text-white/30 mt-1">{stat.detail}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ CIRCULAR ECONOMY DIAGRAM ============ */}
      <section className="py-24 bg-white" id="circular">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="flex justify-center mb-6">
              <div className="w-12 h-px bg-[#11402D]" />
            </div>
            <p className="font-mono-cw text-sm uppercase tracking-wider text-[#11402D]/80 mb-3">
              The System
            </p>
            <h2 className="font-display text-4xl sm:text-5xl text-[#0E2A1C] mb-4">
              The Circular Economy
            </h2>
            <p className="text-lg text-[#142019]/65">
              A closed-loop system where waste becomes value, again and again — creating lasting environmental and economic impact.
            </p>
          </motion.div>

          <div className="relative py-12">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[95%] h-[95%] rounded-full border-2 border-[#11402D]/20" />
              <div className="absolute w-[75%] h-[75%] rounded-full border-2 border-[#11402D]/15" />
              <div className="absolute w-[55%] h-[55%] rounded-full border-2 border-[#11402D]/10" />
              <div className="absolute w-[35%] h-[35%] rounded-full border-2 border-[#11402D]/5" />
            </div>

            <div className="relative grid grid-cols-2 md:grid-cols-3 gap-6 z-10">
              {[
                { title: "Waste Producers", icon: Building2, color: "#11402D", desc: "Homes, Businesses, Farms" },
                { title: "Collection", icon: Truck, color: "#11402D", desc: "Certified Logistics" },
                { title: "Processing", icon: Factory, color: "#11402D", desc: "Advanced Technology" },
                { title: "Energy Products", icon: Zap, color: "#11402D", desc: "Clean Power & Materials" },
                { title: "Communities", icon: Users, color: "#11402D", desc: "Homes & Industries" },
                { title: "New Resources", icon: Recycle, color: "#11402D", desc: "Circular Value" },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-2xl transition-all border-2 border-[#11402D]/10 group"
                  >
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 transition-all group-hover:scale-110"
                      style={{ background: `${item.color}10`, border: `3px solid ${item.color}` }}>
                      <Icon className="w-7 h-7" style={{ color: item.color }} />
                    </div>
                    <h3 className="font-display font-bold text-[#0E2A1C] text-sm">{item.title}</h3>
                    <p className="text-xs text-[#142019]/55 mt-1">{item.desc}</p>
                    <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-[#11402D]">
                      <Circle className="w-1.5 h-1.5 fill-[#11402D]" />
                      Step {i + 1}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="flex justify-center gap-6 mt-8">
              <div className="flex items-center gap-2 text-xs text-[#11402D] bg-[#11402D]/5 border border-[#11402D]/20 px-4 py-2 rounded-full font-display font-medium">
                <ArrowRight className="w-4 h-4 text-[#11402D]" />
                <span>Continuous Circular Flow</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA SECTION ============ */}
      <section className="py-24 bg-[#0E2A1C]" id="cta">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-20 h-20 rounded-full bg-[#9CF06B]/10 flex items-center justify-center mx-auto mb-6">
              <Recycle className="w-10 h-10 text-[#9CF06B]" />
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-white mb-4">
              Turn Waste Into Opportunity
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto mb-8">
              Join ReVive Energy and become part of a cleaner, greener, and more sustainable future. Together, we can transform Africa's waste into value.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigateTo('/marketplace')}
                className="bg-[#9CF06B] text-[#0E2A1C] font-display font-bold px-8 py-4 rounded-full text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                Join Marketplace <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => scrollToSection('footer')}
                className="border-2 border-white/20 text-white font-display font-bold px-8 py-4 rounded-full text-sm hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <Phone className="w-4 h-4" /> Contact Us
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      <footer id="footer" className="bg-[#0E2A1C] text-white pt-14 sm:pt-16 pb-8">
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
                      <a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }} className="hover:text-[#9CF06B] transition-colors">
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
              <a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }} className="hover:text-[#9CF06B] transition-colors">
                Privacy Policy
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }} className="hover:text-[#9CF06B] transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}