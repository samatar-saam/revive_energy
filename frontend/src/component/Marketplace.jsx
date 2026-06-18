import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Search, SlidersHorizontal, Recycle, Leaf, Zap, 
  Truck, Factory, Package, Wheat, Users, Globe, BarChart3, 
  CheckCircle2, Bookmark, Share2, Building2, Wind, Droplets, 
  Award, Gauge, ChevronDown, Filter, Grid3x3, List, 
  Star, MapPin, Clock, Shield, TrendingUp, Sparkles,
  Flame, Sun, Compass, Target, Phone, Mail, MessageCircle,
  Heart, ShoppingBag, Store, Tag, DollarSign, Calendar,
  Check, AlertCircle, Info, HelpCircle, ChevronLeft, ChevronRight,
  Plus, Minus, Eye, ThumbsUp, ThumbsDown, Share, Copy, Link,
  Navigation, CircleDot, Activity, Layers, Box, Warehouse,
  Landmark, TreePine, Flower2, Hotel, Utensils, Wheat as WheatIcon,
  Droplet,
  Building, Briefcase, Clipboard, Route, TrendingDown,
  Award as AwardIcon, Zap as ZapIcon, Leaf as LeafIcon,
  Menu, Home, User, LogOut, Shield as ShieldIcon,
  Coffee, Apple, ShoppingBag as ShoppingBagIcon
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
const CATEGORIES = [
  {
    id: "organic",
    name: "Organic Waste",
    icon: Leaf,
    color: "#34D399",
    bgColor: "#ECFDF5",
    description: "Food, hotel, restaurant & market waste",
    count: "340+",
    subcategories: [
      { id: "food-waste", name: "Food Waste", icon: Utensils, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80" },
      { id: "hotel-waste", name: "Hotel Waste", icon: Hotel, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80" },
      { id: "restaurant-waste", name: "Restaurant Waste", icon: Store, image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80" },
      { id: "market-waste", name: "Market Waste", icon: ShoppingBagIcon, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80" },
      { id: "fruit-waste", name: "Fruit Waste", icon: Apple, image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=400&q=80" },
    ]
  },
  {
    id: "agricultural",
    name: "Agricultural Waste",
    icon: WheatIcon,
    color: "#F59E0B",
    bgColor: "#FFFBEB",
    description: "Crop residue, husks, manure & farm waste",
    count: "280+",
    subcategories: [
      { id: "rice-husks", name: "Rice Husks", icon: WheatIcon, image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80" },
      { id: "maize-stalks", name: "Maize Stalks", icon: TreePine, image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=400&q=80" },
      { id: "sugarcane-bagasse", name: "Sugarcane Bagasse", icon: Package, image: "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?auto=format&fit=crop&w=400&q=80" },
      { id: "coffee-husks", name: "Coffee Husks", icon: Coffee, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80" },
    ]
  },
  {
    id: "plastic",
    name: "Plastic Waste",
    icon: Recycle,
    color: "#818CF8",
    bgColor: "#EEF2FF",
    description: "PET, HDPE, LDPE & mixed plastics",
    count: "210+",
    subcategories: [
      { id: "pet-bottles", name: "PET Bottles", icon: Recycle, image: "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?auto=format&fit=crop&w=400&q=80" },
      { id: "plastic-containers", name: "Plastic Containers", icon: Box, image: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=400&q=80" },
      { id: "plastic-bags", name: "Plastic Bags", icon: ShoppingBagIcon, image: "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?auto=format&fit=crop&w=400&q=80" },
    ]
  },
  {
    id: "industrial",
    name: "Industrial Waste",
    icon: Factory,
    color: "#F97316",
    bgColor: "#FFF7ED",
    description: "Manufacturing byproducts & scrap",
    count: "150+",
    subcategories: [
      { id: "scrap-metal", name: "Scrap Metal", icon: Factory, image: "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?auto=format&fit=crop&w=400&q=80" },
      { id: "wood-chips", name: "Wood Chips", icon: TreePine, image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80" },
      { id: "sawdust", name: "Sawdust", icon: Package, image: "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?auto=format&fit=crop&w=400&q=80" },
    ]
  },
  {
    id: "biomass",
    name: "Biomass & Wood",
    icon: TreePine,
    color: "#34D399",
    bgColor: "#ECFDF5",
    description: "Wood, forestry & biomass resources",
    count: "180+",
    subcategories: [
      { id: "wood-chips", name: "Wood Chips", icon: TreePine, image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80" },
      { id: "sawdust", name: "Sawdust", icon: Package, image: "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?auto=format&fit=crop&w=400&q=80" },
      { id: "biomass-pellets", name: "Biomass Pellets", icon: Flame, image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=400&q=80" },
    ]
  },
  {
    id: "municipal",
    name: "Municipal Waste",
    icon: Building2,
    color: "#60A5FA",
    bgColor: "#EFF6FF",
    description: "Household & commercial waste",
    count: "90+",
    subcategories: [
      { id: "household-waste", name: "Household Waste", icon: Home, image: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=400&q=80" },
      { id: "commercial-waste", name: "Commercial Waste", icon: Building2, image: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=400&q=80" },
    ]
  },
  {
    id: "energy",
    name: "Energy Producers",
    icon: Zap,
    color: "#FB923C",
    bgColor: "#FFF7ED",
    description: "Biogas plants, WtE facilities & more",
    count: "90+",
    subcategories: [
      { id: "biogas-plants", name: "Biogas Plants", icon: Zap, image: "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?auto=format&fit=crop&w=400&q=80" },
      { id: "wte-facilities", name: "WtE Facilities", icon: Factory, image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=400&q=80" },
    ]
  },
  {
    id: "transport",
    name: "Transport Jobs",
    icon: Truck,
    color: "#38BDF8",
    bgColor: "#F0F9FF",
    description: "Collection & logistics opportunities",
    count: "150+",
    subcategories: [
      { id: "collection-jobs", name: "Collection Jobs", icon: Truck, image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80" },
      { id: "logistics-routes", name: "Logistics Routes", icon: MapPin, image: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=400&q=80" },
    ]
  }
];

const LISTINGS = [
  {
    id: 1,
    type: "Organic Waste",
    title: "Premium Restaurant Food Waste",
    volume: "500 kg",
    location: "Nairobi, Kenya",
    supplier: "Hotel Paradise",
    supplierType: "Hotel",
    status: "Available",
    verified: true,
    rating: 4.9,
    reviews: 38,
    price: "KES 2,500/t",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=85",
    category: "organic",
    co2Saved: "2.4 tCO₂e",
    distance: "15 KM",
    description: "Premium quality food waste from top restaurants. Pre-sorted and ready for processing."
  },
  {
    id: 2,
    type: "Agricultural Waste",
    title: "Premium Rice Husks",
    volume: "2 Tons",
    location: "Nakuru, Kenya",
    supplier: "Green Farms Ltd.",
    supplierType: "Farm",
    status: "Available",
    verified: true,
    rating: 4.7,
    reviews: 22,
    price: "KES 1,800/t",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=85",
    category: "agricultural",
    co2Saved: "3.8 tCO₂e",
    distance: "20 KM",
    description: "High-quality rice husks from Nakuru farms. Dry, high calorific value."
  },
  {
    id: 3,
    type: "Plastic Waste",
    title: "Mixed PET & HDPE Bottles",
    volume: "1.2 Tons",
    location: "Mombasa, Kenya",
    supplier: "Coastal Bottlers",
    supplierType: "Recycling",
    status: "Available",
    verified: true,
    rating: 4.8,
    reviews: 51,
    price: "KES 3,200/t",
    image: "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?auto=format&fit=crop&w=600&q=85",
    category: "plastic",
    co2Saved: "5.6 tCO₂e",
    distance: "8 KM",
    description: "Sorted PET and HDPE bottles. Ready for recycling."
  },
  {
    id: 4,
    type: "Biomass Waste",
    title: "Wood Chips & Sawdust",
    volume: "3 Tons",
    location: "Kisumu, Kenya",
    supplier: "Timber Works Ltd.",
    supplierType: "Industrial",
    status: "Available",
    verified: true,
    rating: 4.6,
    reviews: 14,
    price: "KES 4,100/t",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=85",
    category: "biomass",
    co2Saved: "7.2 tCO₂e",
    distance: "25 KM",
    description: "Clean wood chips and sawdust from timber operations. Low ash content."
  },
  {
    id: 5,
    type: "Organic Waste",
    title: "Hotel Food Waste Collection",
    volume: "800 kg",
    location: "Mombasa, Kenya",
    supplier: "Coastal Resorts Ltd.",
    supplierType: "Hotel",
    status: "Available",
    verified: true,
    rating: 4.9,
    reviews: 66,
    price: "KES 2,100/t",
    image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=85",
    category: "organic",
    co2Saved: "1.8 tCO₂e",
    distance: "10 KM",
    description: "Premium food waste from beach resorts. Pre-crushed and ready for digestion."
  },
  {
    id: 6,
    type: "Industrial Waste",
    title: "Factory Scrap Metal",
    volume: "3 Tons",
    location: "Nakuru, Kenya",
    supplier: "Nakuru Industries",
    supplierType: "Factory",
    status: "Available",
    verified: true,
    rating: 4.5,
    reviews: 29,
    price: "KES 5,500/t",
    image: "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?auto=format&fit=crop&w=600&q=85",
    category: "industrial",
    co2Saved: "4.2 tCO₂e",
    distance: "12 KM",
    description: "Mixed scrap metal from manufacturing operations. Ready for recycling."
  }
];

const ENERGY_PRODUCTS = [
  { title: "Biogas", icon: Flame, color: "#F59E0B", description: "Renewable energy from organic waste", benefits: "Reduces methane emissions, Replaces fossil fuels" },
  { title: "Electricity", icon: Zap, color: "#60A5FA", description: "Clean power from waste conversion", benefits: "Grid support, Energy independence" },
  { title: "Organic Fertilizer", icon: Leaf, color: "#34D399", description: "Nutrient-rich soil amendment", benefits: "Improves soil fertility, Reduces chemicals" },
  { title: "Biochar", icon: Droplet, color: "#8B5CF6", description: "Carbon-rich material for soil", benefits: "Captures carbon, Improves yields" },
  { title: "Biomass Fuel", icon: Flame, color: "#F97316", description: "Renewable fuel from biomass", benefits: "Waste reduction, Carbon neutral" },
  { title: "Recycled Products", icon: Recycle, color: "#818CF8", description: "Products from recycled materials", benefits: "Reduces pollution, Conserves resources" },
];

const IMPACT_STATS = [
  { value: 125000, suffix: "+", label: "Tons Recovered", icon: Recycle, detail: "From landfills" },
  { value: 850, suffix: " GWh", label: "Energy Generated", icon: Zap, detail: "Clean power" },
  { value: 45000, suffix: "+", label: "Tons CO₂ Reduced", icon: Leaf, detail: "Annual reduction" },
  { value: 2500, suffix: "+", label: "Partners Connected", icon: Users, detail: "Across Africa" },
];

const STATS = [
  { value: 1250, label: "Active Listings", icon: Package },
  { value: 480, label: "Waste Suppliers", icon: Building2 },
  { value: 320, label: "Energy Producers", icon: Zap },
  { value: 150, label: "Transport Partners", icon: Truck },
];

const HOW_IT_WORKS = [
  { step: 1, title: "Waste Generated", desc: "Businesses, farms, and households generate waste", icon: Package },
  { step: 2, title: "Listed on Marketplace", desc: "Suppliers post waste with details and location", icon: Store },
  { step: 3, title: "Transport Collected", desc: "Transporters find jobs and collect waste", icon: Truck },
  { step: 4, title: "Processing Plant Converts", desc: "Waste is processed using advanced technology", icon: Factory },
  { step: 5, title: "Energy Products Produced", desc: "Clean energy, fuel, and recycled products created", icon: Zap },
];

/* ─── COMPONENTS ─── */
function ListingCard({ item, i }) {
  const [saved, setSaved] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.05 }}
      whileHover={{ y: -8 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-[#11402D]/5 group"
    >
      <div className="relative h-48 overflow-hidden">
        <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1A0F]/60 via-transparent to-transparent" />
        
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="text-[10px] font-display font-black px-2.5 py-1 rounded-full bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/30 backdrop-blur-sm">
            {item.status}
          </span>
          {item.verified && (
            <span className="text-[10px] font-display font-black px-2.5 py-1 rounded-full bg-[#818CF8]/20 text-[#818CF8] border border-[#818CF8]/30 backdrop-blur-sm">
              ✓ Verified
            </span>
          )}
        </div>
        
        <button 
          onClick={() => setSaved(!saved)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 backdrop-blur flex items-center justify-center hover:bg-black/50 transition-colors"
        >
          <Bookmark className={`w-4 h-4 ${saved ? "fill-[#9CF06B] text-[#9CF06B]" : "text-white/70"}`} />
        </button>
        
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-display font-bold text-lg">{item.title}</h3>
          <p className="text-white/70 text-sm flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {item.location} • {item.distance} away
          </p>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#5A7060]">{item.supplier}</span>
            <span className="text-[10px] font-mono-cw font-bold bg-[#F6F8F4] px-2 py-0.5 rounded-full text-[#5A7060]">
              {item.supplierType}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="font-display text-sm font-bold text-[#0A1A0F]">{item.rating}</span>
            <span className="text-xs text-[#5A7060]">({item.reviews})</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 text-xs text-[#5A7060] mb-3">
          <span className="flex items-center gap-1"><Package className="w-3 h-3" /> {item.volume}</span>
          <span className="flex items-center gap-1"><Leaf className="w-3 h-3" /> {item.co2Saved}</span>
          <span className="font-display font-bold text-[#11402D] ml-auto">{item.price}</span>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-2 rounded-xl text-xs font-display font-bold text-white bg-[#11402D] hover:bg-[#0A1A0F] transition-colors"
        >
          View Details
        </motion.button>
      </div>
    </motion.div>
  );
}

function CategoryCard({ category, onClick, isActive }) {
  const Icon = category.icon;
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 relative rounded-xl ${
        isActive 
          ? "bg-[#11402D] text-white shadow-lg" 
          : "hover:bg-[#F6F8F4] text-[#0E2A1C]/70"
      }`}
    >
      <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-[#9CF06B] rounded-r-full transition-all duration-200 ${
        isActive ? "opacity-100" : "opacity-0"
      }`} />
      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-[#9CF06B]" : "text-[#142019]/40"}`} />
      <span className="font-display text-sm flex-1 text-left">{category.name}</span>
      <span className={`text-xs font-mono-cw ${isActive ? "text-[#9CF06B]" : "text-[#142019]/30"}`}>
        {category.count}
      </span>
    </button>
  );
}

/* ─── MAIN MARKETPLACE PAGE ─── */
export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllListings, setShowAllListings] = useState(false);
  const [activeTab, setActiveTab] = useState("listings");
  const { scrollYProgress } = useScroll();
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const filteredListings = LISTINGS.filter(item => {
    const matchesCategory = selectedCategory?.id === "all" || item.category === selectedCategory?.id;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const displayedListings = showAllListings ? filteredListings : filteredListings.slice(0, 6);

  return (
    <div className="min-h-screen bg-[#F6F8F4] text-[#142019] overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono-cw { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      {/* ── SCROLL PROGRESS ── */}
      <motion.div className="fixed top-0 left-0 h-0.5 bg-[#9CF06B] z-50 origin-left"
        style={{ width: progressWidth }} />

      {/* ============ HERO SECTION ============ */}
      <section className="relative min-h-[55vh] flex items-center bg-white pt-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-10 w-96 h-96 bg-[#9CF06B]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-[#11402D]/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-10 lg:py-14 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="w-8 h-px bg-[#11402D]" />
                <span className="font-mono-cw text-xs font-bold tracking-wider text-[#11402D] uppercase">Connecting Waste to Energy</span>
              </div>

              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-[#0E2A1C] leading-[1.1] tracking-tight mb-4">
                Connecting Waste Sources
                <br />
                <span className="relative inline-block">
                  <span className="relative z-10 text-[#11402D]">With Clean Energy</span>
                  <svg className="absolute -bottom-2 left-0 w-full" height="10" viewBox="0 0 450 10" preserveAspectRatio="none">
                    <path d="M2 6C80 2 370 2 448 6" stroke="#9CF06B" strokeWidth="5" strokeLinecap="round" fill="none" />
                  </svg>
                </span>
                <span className="text-[#11402D]">Producers</span>
              </h1>

              <p className="text-lg text-[#142019]/65 leading-relaxed max-w-lg mb-8">
                Transforming waste into valuable energy, fertilizer, biomass fuel, biochar, and recycled materials.
              </p>

              <div className="flex flex-wrap gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="bg-[#11402D] text-white font-display font-bold px-8 py-3.5 rounded-full text-sm shadow-lg flex items-center gap-2"
                >
                  Browse Opportunities <ArrowRight className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="border-2 border-[#11402D]/20 text-[#11402D] font-display font-bold px-8 py-3.5 rounded-full text-sm hover:border-[#11402D] hover:bg-[#11402D]/5 transition-all"
                >
                  Join Marketplace
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1581092335871-4c4c8b7cfad9?auto=format&fit=crop&w=1200&q=85"
                  alt="Waste to Energy"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B2417]/50 via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-xl p-4 border border-[#11402D]/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#11402D] flex items-center justify-center">
                    <Zap className="w-5 h-5 text-[#9CF06B]" />
                  </div>
                  <div>
                    <div className="font-display font-bold text-[#0E2A1C]">1,250+ Listings</div>
                    <div className="text-xs text-[#5A7060]">Live across Africa</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section className="bg-[#0E2A1C] py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <Icon className="w-6 h-6 text-[#9CF06B] mx-auto mb-2" />
                  <div className="font-display text-2xl md:text-3xl font-bold text-[#9CF06B]">
                    <Counter to={stat.value} />
                  </div>
                  <div className="font-display text-xs text-white/50 mt-1">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ SEARCH BAR ============ */}
      <section className="py-4 bg-white border-b border-[#11402D]/5 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#142019]/55" />
              <input
                type="text"
                placeholder="Search waste materials, opportunities, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#11402D]/10 focus:border-[#11402D] focus:ring-2 focus:ring-[#11402D]/10 transition-all bg-[#F6F8F4] text-sm"
              />
            </div>
            <button className="px-6 py-3 rounded-xl bg-[#11402D] text-white font-display font-bold text-sm flex items-center gap-2 whitespace-nowrap">
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>
        </div>
      </section>

      {/* ============ CATEGORIES & LISTINGS ============ */}
      <section className="py-8 bg-[#F6F8F4]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Categories Sidebar */}
            <div className="lg:w-72 flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-sm border border-[#11402D]/5 overflow-hidden sticky top-28">
                <div className="p-4 border-b border-[#11402D]/5">
                  <h2 className="font-display font-bold text-[#0E2A1C]">Categories</h2>
                  <p className="text-xs text-[#142019]/55">Browse waste & opportunities</p>
                </div>
                <div className="py-2 max-h-[calc(100vh-250px)] overflow-y-auto">
                  {CATEGORIES.map((category) => (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      isActive={selectedCategory?.id === category.id}
                      onClick={() => setSelectedCategory(category)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Listings Area */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display font-bold text-xl text-[#0E2A1C]">
                    {selectedCategory?.name} • {filteredListings.length} Listings                  </h2>
                  <p className="text-sm text-[#142019]/55">{selectedCategory?.description}</p>
                </div>
                <span className="font-mono-cw text-xs text-[#142019]/55">Updated: 2 min ago</span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedCategory?.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid md:grid-cols-2 xl:grid-cols-3 gap-5"
                >
                  {displayedListings.map((item, i) => (
                    <ListingCard key={item.id} item={item} i={i} />
                  ))}
                </motion.div>
              </AnimatePresence>

              {filteredListings.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-[#11402D]/5 flex items-center justify-center mx-auto mb-4">
                    <Search className="w-10 h-10 text-[#142019]/55" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-[#0E2A1C] mb-2">No listings found</h3>
                  <p className="text-[#142019]/55">Try adjusting your search or category</p>
                </div>
              )}

              {filteredListings.length > 6 && !showAllListings && (
                <motion.div className="mt-8 text-center">
                  <button
                    onClick={() => setShowAllListings(true)}
                    className="inline-flex items-center gap-2 border-2 border-[#11402D]/12 text-[#11402D] font-display font-black px-8 py-3.5 rounded-xl text-sm hover:bg-[#11402D] hover:text-white hover:border-[#11402D] transition-all"
                  >
                    Load More Listings <ChevronDown className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <div className="flex justify-center mb-6">
              <div className="w-12 h-px bg-[#11402D]" />
            </div>
            <p className="font-mono-cw text-sm uppercase tracking-wider text-[#11402D]/80 mb-3">How It Works</p>
            <h2 className="font-display text-4xl sm:text-5xl text-[#0E2A1C] mb-4">
              From Waste to Value
            </h2>
            <p className="text-lg text-[#142019]/65">A simple process that turns waste into valuable energy</p>
          </motion.div>

          <div className="grid md:grid-cols-5 gap-4">
            {HOW_IT_WORKS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative text-center"
                >
                  <div className="bg-[#F6F8F4] rounded-2xl p-6 hover:shadow-xl transition-all group">
                    <div className="w-16 h-16 rounded-full bg-[#11402D] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-8 h-8 text-[#9CF06B]" />
                    </div>
                    <div className="font-mono-cw text-xs font-bold text-[#9CF06B] bg-[#11402D] inline-block px-2 py-0.5 rounded-full mb-2">
                      Step {step.step}
                    </div>
                    <h3 className="font-display font-bold text-[#0E2A1C] text-sm">{step.title}</h3>
                    <p className="text-xs text-[#142019]/55 mt-1">{step.desc}</p>
                  </div>
                  {i < HOW_IT_WORKS.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
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
      <section className="py-16 bg-[#F6F8F4]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <div className="flex justify-center mb-6">
              <div className="w-12 h-px bg-[#11402D]" />
            </div>
            <p className="font-mono-cw text-sm uppercase tracking-wider text-[#11402D]/80 mb-3">What We Produce</p>
            <h2 className="font-display text-4xl sm:text-5xl text-[#0E2A1C] mb-4">
              Energy Products From Waste
            </h2>
            <p className="text-lg text-[#142019]/65">Different waste streams become valuable energy products</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {ENERGY_PRODUCTS.map((product, i) => {
              const Icon = product.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-white rounded-2xl p-6 hover:shadow-xl transition-all border border-[#11402D]/5 group"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                    style={{ background: `${product.color}15` }}>
                    <Icon className="w-6 h-6" style={{ color: product.color }} />
                  </div>
                  <h3 className="font-display font-bold text-[#0E2A1C] text-lg">{product.title}</h3>
                  <p className="text-sm text-[#142019]/55 mt-1">{product.description}</p>
                  <p className="text-xs text-[#11402D] font-medium mt-2">{product.benefits}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ IMPACT STATS ============ */}
      <section className="py-20 bg-[#0E2A1C]">
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
            <p className="font-mono-cw text-sm uppercase tracking-wider text-[#9CF06B]/70 mb-3">Environmental Impact</p>
            <h2 className="font-display text-4xl sm:text-5xl text-white mb-4">
              Our Impact Together
            </h2>
            <p className="text-lg text-white/50">Real numbers showing our collective impact on the planet</p>
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
                  <Icon className="w-8 h-8 text-[#9CF06B] mx-auto mb-3" />
                  <div className="font-display text-3xl md:text-4xl font-bold text-[#9CF06B] mb-2">
                    <Counter to={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="font-display text-sm text-white/60">{stat.label}</div>
                  <div className="font-mono-cw text-xs text-white/30 mt-1">{stat.detail}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ CTA SECTION ============ */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-20 h-20 rounded-full bg-[#9CF06B]/10 flex items-center justify-center mx-auto mb-6">
              <Recycle className="w-10 h-10 text-[#9CF06B]" />
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-[#0E2A1C] mb-4">
              Turn Waste Into Opportunity
            </h2>
            <p className="text-lg text-[#142019]/65 max-w-2xl mx-auto mb-8">
              Join thousands of partners building a cleaner, greener, and more sustainable future.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="bg-[#11402D] text-white font-display font-bold px-8 py-4 rounded-full text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                Join Marketplace <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="border-2 border-[#11402D]/20 text-[#11402D] font-display font-bold px-8 py-4 rounded-full text-sm hover:border-[#11402D] hover:bg-[#11402D]/5 transition-all"
              >
                <Phone className="w-4 h-4" /> Contact Sales
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-[#0E2A1C] text-white pt-14 sm:pt-16 pb-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#11402D] flex items-center justify-center">
                  <Recycle className="w-5 h-5 text-[#9CF06B]" />
                </div>
                <span className="font-display font-bold text-lg">ReVive Energy</span>
              </div>
              <p className="text-white/50 text-sm leading-relaxed">
                Transforming waste into clean energy, fertilizer, and sustainable products for a circular economy across Africa.
              </p>
            </div>
            <div>
              <h4 className="font-display font-semibold text-sm mb-4">Solutions</h4>
              <ul className="space-y-2 text-sm text-white/40">
                <li><a href="#" className="hover:text-[#9CF06B] transition-colors">Organic Waste</a></li>
                <li><a href="#" className="hover:text-[#9CF06B] transition-colors">Plastic Recycling</a></li>
                <li><a href="#" className="hover:text-[#9CF06B] transition-colors">Industrial Waste</a></li>
                <li><a href="#" className="hover:text-[#9CF06B] transition-colors">Agricultural Waste</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-semibold text-sm mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-white/40">
                <li><a href="#" className="hover:text-[#9CF06B] transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-[#9CF06B] transition-colors">Impact</a></li>
                <li><a href="#" className="hover:text-[#9CF06B] transition-colors">Resources</a></li>
                <li><a href="#" className="hover:text-[#9CF06B] transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-semibold text-sm mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-white/40">
                <li><a href="#" className="hover:text-[#9CF06B] transition-colors flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> info@reviveenergy.com</a></li>
                <li><a href="#" className="hover:text-[#9CF06B] transition-colors flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> +254 700 123 456</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-white/30">
            <span>© 2026 ReVive Energy. All rights reserved.</span>
            <div className="flex gap-6">
              <a href="#" className="hover:text-[#9CF06B] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#9CF06B] transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-[#9CF06B] transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}