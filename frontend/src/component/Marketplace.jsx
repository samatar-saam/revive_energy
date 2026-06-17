import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Search, SlidersHorizontal, Recycle, Leaf, Zap, 
  Truck, Factory, Package, Wheat, MapPin, Clock, Star, 
  Shield, TrendingUp, Users, Globe, BarChart3, CheckCircle2,
  Bookmark, Share2, Building2, Wind, Droplets, Award, Gauge,
  ChevronDown, X, Filter, Grid3x3, List, TrendingDown,
  Sparkles, Flame, Droplet, Sun, Compass, Filter as FilterIcon
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
  { id: "all", name: "All Categories", icon: Recycle, color: "#11402D" },
  { id: "organic", name: "Organic Waste", icon: Leaf, color: "#34D399" },
  { id: "plastic", name: "Plastic Recycling", icon: Recycle, color: "#60A5FA" },
  { id: "agricultural", name: "Agricultural", icon: Wheat, color: "#F59E0B" },
  { id: "industrial", name: "Industrial", icon: Factory, color: "#818CF8" },
  { id: "energy", name: "Energy Producers", icon: Zap, color: "#FB923C" },
  { id: "logistics", name: "Logistics", icon: Truck, color: "#38BDF8" },
];

const LISTINGS = [
  {
    id: 1,
    type: "Organic Waste",
    title: "Premium Restaurant Food Waste",
    volume: "500 kg/day",
    location: "Nairobi CBD",
    frequency: "Daily",
    verified: true,
    rating: 4.9,
    reviews: 38,
    tags: ["Pre-sorted", "Restaurant Grade"],
    price: "KES 2,500/t",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=85",
    badge: "High Demand",
    badgeColor: "#9CF06B",
    category: "organic",
    supplier: "Fresh Foods Ltd",
    available: "500 kg",
    co2Saved: "2.4 tCO₂e"
  },
  {
    id: 2,
    type: "Agricultural Waste",
    title: "Maize Stover — Bulk Available",
    volume: "2 tonnes/wk",
    location: "Nakuru County",
    frequency: "Weekly",
    verified: true,
    rating: 4.7,
    reviews: 22,
    tags: ["Dry", "High Calorific"],
    price: "KES 1,800/t",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=85",
    badge: "Seasonal",
    badgeColor: "#F59E0B",
    category: "agricultural",
    supplier: "Green Farms Co",
    available: "2 tonnes",
    co2Saved: "3.8 tCO₂e"
  },
  {
    id: 3,
    type: "Plastic Recycling",
    title: "Mixed PET & HDPE Collection",
    volume: "1,200 kg",
    location: "Mombasa Port",
    frequency: "Bi-weekly",
    verified: true,
    rating: 4.8,
    reviews: 51,
    tags: ["PET #1", "HDPE #2", "Sorted"],
    price: "KES 3,200/t",
    image: "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?auto=format&fit=crop&w=600&q=85",
    badge: "Verified",
    badgeColor: "#818CF8",
    category: "plastic",
    supplier: "EcoPlast Recyclers",
    available: "1,200 kg",
    co2Saved: "5.6 tCO₂e"
  },
  {
    id: 4,
    type: "Industrial Waste",
    title: "Sawmill Biomass & Wood Chips",
    volume: "5 tonnes/mo",
    location: "Eldoret Town",
    frequency: "Monthly",
    verified: false,
    rating: 4.5,
    reviews: 14,
    tags: ["Dry", "Low Ash"],
    price: "KES 4,100/t",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=85",
    badge: "New",
    badgeColor: "#38BDF8",
    category: "industrial",
    supplier: "TimberTech Ltd",
    available: "5 tonnes",
    co2Saved: "7.2 tCO₂e"
  },
  {
    id: 5,
    type: "Organic Waste",
    title: "Hotel & Resort Food Waste",
    volume: "800 kg/wk",
    location: "Diani Beach",
    frequency: "Daily",
    verified: true,
    rating: 4.9,
    reviews: 66,
    tags: ["Wet Organic", "Pre-crushed"],
    price: "KES 2,100/t",
    image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=85",
    badge: "Top Rated",
    badgeColor: "#9CF06B",
    category: "organic",
    supplier: "Coastal Resorts Ltd",
    available: "800 kg",
    co2Saved: "1.8 tCO₂e"
  },
  {
    id: 6,
    type: "Energy Producer",
    title: "Biogas Offtake — Grid Connected",
    volume: "12 m³/day",
    location: "Thika Road",
    frequency: "Continuous",
    verified: true,
    rating: 5.0,
    reviews: 29,
    tags: ["Upgraded", "Grid-tied"],
    price: "KES 6,800/m³",
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=85",
    badge: "Featured",
    badgeColor: "#FB923C",
    category: "energy",
    supplier: "Renewable Power Co",
    available: "12 m³",
    co2Saved: "4.2 tCO₂e"
  },
];

const FEATURED_STATS = [
  { value: 1240, label: "Active Suppliers", icon: Users },
  { value: 3500, label: "Live Listings", icon: Package },
  { value: 98, label: "Match Rate %", icon: Target },
  { value: 48, label: "Matched Today", icon: TrendingUp },
];

/* ─── LISTING CARD ─── */
function ListingCard({ item, i }) {
  const [saved, setSaved] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ delay: i * 0.07, duration: 0.65, ease: [0.22, 0.61, 0.36, 1] }}
      whileHover={{ y: -8 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-[#11402D]/5 group"
    >
      <div className="relative h-48 overflow-hidden">
        <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1A0F]/70 via-transparent to-transparent" />
        
        <div className="absolute top-3 left-3">
          <span className="text-[10px] font-black px-2.5 py-1 rounded-full tracking-wider backdrop-blur-sm"
            style={{ background: item.badgeColor + "22", color: item.badgeColor, border: `1px solid ${item.badgeColor}44` }}>
            {item.badge}
          </span>
        </div>
        
        <button onClick={() => setSaved(!saved)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 backdrop-blur flex items-center justify-center hover:bg-black/50 transition-colors">
          <Bookmark className={`w-4 h-4 ${saved ? "fill-[#9CF06B] text-[#9CF06B]" : "text-white/70"}`} />
        </button>
        
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur rounded-full px-2.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: item.badgeColor }} />
          <span className="text-[8px] font-bold text-white uppercase tracking-wider">{item.type}</span>
        </div>
        
        {item.verified && (
          <div className="absolute bottom-3 right-3">
            <Shield className="w-4 h-4 text-[#9CF06B] fill-[#9CF06B]/20" />
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-[#0A1A0F] text-sm leading-snug mb-2 line-clamp-2">{item.title}</h3>
        
        <div className="flex flex-wrap gap-1.5 mb-3">
          {item.tags.map((t, j) => (
            <span key={j} className="text-[8px] font-bold uppercase tracking-wider bg-[#F6F8F4] text-[#5A7060] px-2 py-0.5 rounded-full border border-black/5">{t}</span>
          ))}
        </div>
        
        <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 mb-3 text-[11px] text-[#5A7060]">
          <span className="flex items-center gap-1.5"><Package className="w-3 h-3" />{item.volume}</span>
          <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" />{item.frequency}</span>
          <span className="flex items-center gap-1.5 col-span-2 truncate"><MapPin className="w-3 h-3 flex-shrink-0" />{item.location}</span>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-[#11402D]/10 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-[11px] font-bold text-[#0A1A0F]">{item.rating}</span>
            <span className="text-[10px] text-[#5A7060]">({item.reviews})</span>
          </div>
          <span className="text-xs font-black text-[#11402D]">{item.price}</span>
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="w-full py-2.5 rounded-xl text-[11px] font-black tracking-wide text-white flex items-center justify-center gap-1.5 transition-all hover:opacity-90"
          style={{ background: "#11402D" }}>
          View Deal <ArrowRight className="w-3.5 h-3.5" />
        </motion.button>
      </div>
    </motion.div>
  );
}

function Target(props) {
  return <div {...props} />;
}

/* ─── MAIN MARKETPLACE PAGE ─── */
export default function MarketplacePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("trending");
  
  const { scrollYProgress } = useScroll();
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const filteredListings = LISTINGS.filter(item => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;700;800;900&display=swap');
        .font-serif-display { font-family: 'DM Serif Display', serif; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      {/* ── SCROLL PROGRESS ── */}
      <motion.div className="fixed top-0 left-0 h-0.5 bg-[#9CF06B] z-50 origin-left"
        style={{ width: progressWidth }} />

      {/* ============ HERO SECTION ============ */}
      <section className="relative min-h-[40vh] flex items-center bg-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-10 w-96 h-96 bg-[#9CF06B]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-[#11402D]/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-12">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-8 h-px bg-[#11402D]" />
              <span className="text-xs font-bold tracking-wider text-[#11402D] uppercase">Marketplace</span>
            </div>
            
            <h1 className="font-serif-display text-5xl sm:text-6xl lg:text-7xl text-[#0A1A0F] leading-[1.1] tracking-tight mb-4">
              Where waste finds
              <span className="relative inline-block mx-3">
                <span className="relative z-10 text-[#11402D]">value.</span>
                <svg className="absolute -bottom-2 left-0 w-full" height="10" viewBox="0 0 300 10" preserveAspectRatio="none">
                  <path d="M2 6C60 2 240 2 298 6" stroke="#9CF06B" strokeWidth="5" strokeLinecap="round" fill="none" />
                </svg>
              </span>
            </h1>
            
            <p className="text-lg text-[#5A7060] leading-relaxed max-w-2xl">
              Discover verified waste streams, energy opportunities, and circular partnerships — in Africa's leading waste-to-value exchange.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ============ STATS BANNER ============ */}
      <section className="bg-[#11402D] py-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {FEATURED_STATS.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-2xl md:text-3xl font-bold text-[#9CF06B]">
                  <Counter to={stat.value} />
                </div>
                <div className="text-xs text-white/50 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SEARCH & FILTERS ============ */}
      <section className="py-6 bg-[#F6F8F4] border-b border-[#11402D]/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="flex-1 w-full relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A7060]" />
              <input
                type="text"
                placeholder="Search waste streams, suppliers, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#11402D]/10 focus:border-[#11402D] focus:ring-2 focus:ring-[#11402D]/10 transition-all bg-white text-sm"
              />
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-white rounded-xl border border-[#11402D]/10 p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-[#11402D] text-white" : "text-[#5A7060] hover:text-[#11402D]"}`}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-[#11402D] text-white" : "text-[#5A7060] hover:text-[#11402D]"}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            
            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-[#11402D] text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-[#0A1A0F] transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
          </div>
          
          {/* Expanded Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-[#11402D]/10">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-[#0A1A0F] uppercase tracking-wider">Sort By</label>
                      <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full mt-1 p-2 rounded-lg border border-[#11402D]/10 bg-white text-sm"
                      >
                        <option value="trending">Trending</option>
                        <option value="newest">Newest</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="rating">Highest Rated</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#0A1A0F] uppercase tracking-wider">Min Rating</label>
                      <select className="w-full mt-1 p-2 rounded-lg border border-[#11402D]/10 bg-white text-sm">
                        <option value="0">Any Rating</option>
                        <option value="4">4+ Stars</option>
                        <option value="4.5">4.5+ Stars</option>
                        <option value="4.8">4.8+ Stars</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#0A1A0F] uppercase tracking-wider">Verified Only</label>
                      <div className="flex items-center gap-4 mt-1">
                        <label className="flex items-center gap-2 text-sm text-[#5A7060]">
                          <input type="radio" name="verified" value="all" defaultChecked className="text-[#11402D]" />
                          All
                        </label>
                        <label className="flex items-center gap-2 text-sm text-[#5A7060]">
                          <input type="radio" name="verified" value="verified" className="text-[#11402D]" />
                          Verified Only
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ============ CATEGORIES ============ */}
      <section className="py-6 bg-white border-b border-[#11402D]/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    isActive 
                      ? "bg-[#11402D] text-white shadow-lg" 
                      : "bg-[#F6F8F4] text-[#5A7060] hover:bg-[#11402D]/10"
                  }`}
                >
                  <Icon className="w-4 h-4" style={{ color: isActive ? "#9CF06B" : cat.color }} />
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ LISTINGS GRID ============ */}
      <section className="py-12 bg-[#F6F8F4]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-xl text-[#0A1A0F]">
                {filteredListings.length} Listings Found
              </h2>
              <p className="text-sm text-[#5A7060]">Showing verified waste streams and opportunities</p>
            </div>
            <span className="text-xs text-[#5A7060]">Last updated: 2 min ago</span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {filteredListings.map((item, i) => (
                <ListingCard key={item.id} item={item} i={i} />
              ))}
            </AnimatePresence>
          </div>

          {filteredListings.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 rounded-full bg-[#11402D]/5 flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-[#5A7060]" />
              </div>
              <h3 className="font-bold text-xl text-[#0A1A0F] mb-2">No listings found</h3>
              <p className="text-[#5A7060]">Try adjusting your search or filters</p>
            </motion.div>
          )}

          {/* Load More */}
          {filteredListings.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-12 text-center"
            >
              <button className="inline-flex items-center gap-2 border-2 border-[#11402D]/12 text-[#11402D] font-black px-8 py-3.5 rounded-xl text-sm hover:bg-[#11402D] hover:text-white hover:border-[#11402D] transition-all">
                Load More Listings <ChevronDown className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* ============ CTA SECTION ============ */}
      <section className="py-16 bg-[#11402D]">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 rounded-full bg-[#9CF06B]/10 flex items-center justify-center mx-auto mb-6">
              <Recycle className="w-8 h-8 text-[#9CF06B]" />
            </div>
            <h2 className="font-serif-display text-3xl sm:text-4xl text-white mb-4">
              Ready to list your waste stream?
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto mb-8">
              Join Africa's leading waste-to-value marketplace. Connect with verified buyers and turn your waste into revenue.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                className="bg-[#9CF06B] text-[#11402D] font-bold px-8 py-3 rounded-full text-sm shadow-lg flex items-center gap-2"
              >
                List Your Waste <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                className="border-2 border-white/20 text-white font-bold px-8 py-3 rounded-full text-sm flex items-center gap-2"
              >
                Learn More
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}