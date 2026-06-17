import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Search, Download, BookOpen, FileText, Video, 
  Users, Globe, BarChart3, CheckCircle2, Clock, MapPin,
  Star, Shield, TrendingUp, Award, Play, ChevronDown,
  Filter, Grid3x3, List, Sparkles, Lightbulb, Library,
  Newspaper, Mic, Podcast, MessageCircle, Share2, Bookmark,
  Calendar, User, Eye, ThumbsUp, ChevronRight, ExternalLink,
  File, Image, Music, Film, Book, GraduationCap, PenTool
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
  { id: "all", name: "All Resources", icon: Library },
  { id: "guides", name: "Guides & Reports", icon: BookOpen },
  { id: "case-studies", name: "Case Studies", icon: FileText },
  { id: "videos", name: "Videos", icon: Play },
  { id: "webinars", name: "Webinars", icon: Video },
  { id: "blogs", name: "Blog Posts", icon: Newspaper },
  { id: "podcasts", name: "Podcasts", icon: Podcast },
];

const RESOURCES = [
  {
    id: 1,
    type: "guides",
    title: "Complete Guide to Waste-to-Energy",
    description: "A comprehensive guide covering all aspects of waste-to-energy conversion, from assessment to implementation.",
    image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=85",
    author: "Dr. Sarah Mbeki",
    date: "June 15, 2026",
    readTime: "15 min read",
    downloads: 1240,
    views: 4500,
    rating: 4.9,
    tags: ["Waste-to-Energy", "Comprehensive", "Beginner"],
    featured: true,
    icon: BookOpen,
    color: "#34D399"
  },
  {
    id: 2,
    type: "case-studies",
    title: "Nairobi Breweries: Zero Waste Journey",
    description: "How Nairobi Breweries achieved zero waste to landfill through our organic waste processing solution.",
    image: "https://images.unsplash.com/photo-1562408590-e32931084e23?auto=format&fit=crop&w=800&q=85",
    author: "James Ochieng",
    date: "June 12, 2026",
    readTime: "10 min read",
    downloads: 890,
    views: 3200,
    rating: 4.8,
    tags: ["Case Study", "Success Story", "Organic"],
    featured: true,
    icon: FileText,
    color: "#60A5FA"
  },
  {
    id: 3,
    type: "videos",
    title: "How Anaerobic Digestion Works",
    description: "Animated explanation of the anaerobic digestion process and how it converts organic waste into biogas.",
    image: "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?auto=format&fit=crop&w=800&q=85",
    author: "Dr. Amina Diallo",
    date: "June 10, 2026",
    readTime: "8 min watch",
    downloads: 560,
    views: 2800,
    rating: 4.7,
    tags: ["Video", "Education", "Anaerobic"],
    featured: false,
    icon: Play,
    color: "#FB923C"
  },
  {
    id: 4,
    type: "webinars",
    title: "Circular Economy Masterclass",
    description: "Recorded webinar on implementing circular economy principles in African manufacturing and agriculture.",
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=85",
    author: "Michael Njoroge",
    date: "June 8, 2026",
    readTime: "45 min watch",
    downloads: 430,
    views: 1900,
    rating: 4.9,
    tags: ["Webinar", "Circular Economy", "Masterclass"],
    featured: false,
    icon: Video,
    color: "#818CF8"
  },
  {
    id: 5,
    type: "blogs",
    title: "The Future of Plastic Recycling in Africa",
    description: "Exploring innovations and opportunities in plastic recycling across the continent.",
    image: "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?auto=format&fit=crop&w=800&q=85",
    author: "Grace Muthoni",
    date: "June 5, 2026",
    readTime: "7 min read",
    downloads: 320,
    views: 2100,
    rating: 4.6,
    tags: ["Plastic", "Recycling", "Innovation"],
    featured: false,
    icon: Newspaper,
    color: "#F59E0B"
  },
  {
    id: 6,
    type: "podcasts",
    title: "Waste to Wealth: African Stories",
    description: "Podcast series featuring entrepreneurs and innovators turning waste into valuable products.",
    image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=800&q=85",
    author: "Sarah Mbeki & Guests",
    date: "June 3, 2026",
    readTime: "30 min listen",
    downloads: 780,
    views: 3400,
    rating: 4.8,
    tags: ["Podcast", "Stories", "Entrepreneurship"],
    featured: false,
    icon: Podcast,
    color: "#A78BFA"
  },
  {
    id: 7,
    type: "guides",
    title: "Carbon Credits 101",
    description: "Understanding carbon credits: How they work, how to generate them, and their value in waste management.",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=85",
    author: "Dr. Amina Diallo",
    date: "May 28, 2026",
    readTime: "12 min read",
    downloads: 2100,
    views: 5600,
    rating: 4.9,
    tags: ["Carbon Credits", "Finance", "ESG"],
    featured: false,
    icon: BookOpen,
    color: "#34D399"
  },
  {
    id: 8,
    type: "case-studies",
    title: "Mombasa Port: Reducing Marine Plastic",
    description: "How Mombasa Port Authority reduced plastic pollution through our recycling partnership.",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=85",
    author: "James Ochieng",
    date: "May 25, 2026",
    readTime: "8 min read",
    downloads: 670,
    views: 2800,
    rating: 4.7,
    tags: ["Case Study", "Plastic", "Marine"],
    featured: false,
    icon: FileText,
    color: "#60A5FA"
  }
];

const QUICK_STATS = [
  { value: 45, suffix: "+", label: "Resources", icon: Library },
  { value: 25000, suffix: "+", label: "Downloads", icon: Download },
  { value: 125000, suffix: "+", label: "Views", icon: Eye },
  { value: 4.8, suffix: "★", label: "Average Rating", icon: Star },
];

/* ─── RESOURCE CARD ─── */
function ResourceCard({ resource, i }) {
  const [saved, setSaved] = useState(false);
  const Icon = resource.icon;

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
        <img src={resource.image} alt={resource.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1A0F]/70 via-transparent to-transparent" />
        
        {/* Type Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur rounded-full px-3 py-1.5">
          <Icon className="w-3.5 h-3.5" style={{ color: resource.color }} />
          <span className="text-[10px] font-bold text-white uppercase tracking-wider">
            {resource.type.replace("-", " ")}
          </span>
        </div>
        
        {/* Featured Badge */}
        {resource.featured && (
          <div className="absolute top-3 right-3">
            <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-[#9CF06B] text-[#0A1A0F]">
              Featured
            </span>
          </div>
        )}
        
        {/* Rating */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur rounded-full px-2.5 py-1">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-xs font-bold text-white">{resource.rating}</span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-[#0A1A0F] text-sm leading-snug mb-2 line-clamp-2">{resource.title}</h3>
        
        <p className="text-xs text-[#5A7060] leading-relaxed mb-3 line-clamp-2">{resource.description}</p>
        
        <div className="flex flex-wrap gap-1.5 mb-3">
          {resource.tags.map((tag, j) => (
            <span key={j} className="text-[8px] font-bold uppercase tracking-wider bg-[#F6F8F4] text-[#5A7060] px-2 py-0.5 rounded-full border border-black/5">{tag}</span>
          ))}
        </div>
        
        <div className="flex items-center justify-between text-[11px] text-[#5A7060] mb-3">
          <span className="flex items-center gap-1.5">
            <User className="w-3 h-3" />
            {resource.author}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            {resource.readTime}
          </span>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-[#11402D]/10">
          <div className="flex items-center gap-3 text-[11px] text-[#5A7060]">
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              {resource.downloads}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {resource.views}
            </span>
          </div>
          <button
            onClick={() => setSaved(!saved)}
            className="p-1.5 rounded-lg hover:bg-[#F6F8F4] transition-colors"
          >
            <Bookmark className={`w-4 h-4 ${saved ? "fill-[#11402D] text-[#11402D]" : "text-[#5A7060]"}`} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── MAIN RESOURCES PAGE ─── */
export default function ResourcesPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  
  const { scrollYProgress } = useScroll();
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const filteredResources = RESOURCES.filter(item => {
    const matchesCategory = activeCategory === "all" || item.type === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredResources = RESOURCES.filter(r => r.featured);

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
              <span className="text-xs font-bold tracking-wider text-[#11402D] uppercase">Resources</span>
            </div>
            
            <h1 className="font-serif-display text-5xl sm:text-6xl lg:text-7xl text-[#0A1A0F] leading-[1.1] tracking-tight mb-4">
              Learn, grow,
              <span className="relative inline-block mx-3">
                <span className="relative z-10 text-[#11402D]">sustain.</span>
                <svg className="absolute -bottom-2 left-0 w-full" height="10" viewBox="0 0 300 10" preserveAspectRatio="none">
                  <path d="M2 6C60 2 240 2 298 6" stroke="#9CF06B" strokeWidth="5" strokeLinecap="round" fill="none" />
                </svg>
              </span>
            </h1>
            
            <p className="text-lg text-[#5A7060] leading-relaxed max-w-2xl">
              Access our library of guides, case studies, videos, and insights to accelerate your circular economy journey.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ============ STATS BANNER ============ */}
      <section className="bg-[#11402D] py-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {QUICK_STATS.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-2xl md:text-3xl font-bold text-[#9CF06B]">
                  <Counter to={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs text-white/50 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURED RESOURCES ============ */}
      {featuredResources.length > 0 && (
        <section className="py-12 bg-[#F6F8F4]">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex items-center gap-3 mb-8">
              <Award className="w-6 h-6 text-[#11402D]" />
              <h2 className="font-bold text-xl text-[#0A1A0F]">Featured Resources</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-5">
              {featuredResources.map((resource, i) => {
                const Icon = resource.icon;
                return (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-[#11402D]/5 group"
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="relative md:w-1/3 h-48 md:h-auto overflow-hidden">
                        <img src={resource.image} alt={resource.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1A0F]/30 via-transparent to-transparent" />
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur rounded-full px-3 py-1.5">
                          <Icon className="w-3.5 h-3.5" style={{ color: resource.color }} />
                          <span className="text-[9px] font-bold text-white uppercase tracking-wider">
                            {resource.type.replace("-", " ")}
                          </span>
                        </div>
                      </div>
                      <div className="p-6 md:w-2/3 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-[#0A1A0F] text-lg mb-2">{resource.title}</h3>
                          <p className="text-sm text-[#5A7060] leading-relaxed mb-3">{resource.description}</p>
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {resource.tags.map((tag, j) => (
                              <span key={j} className="text-[8px] font-bold uppercase tracking-wider bg-[#F6F8F4] text-[#5A7060] px-2 py-0.5 rounded-full border border-black/5">{tag}</span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs text-[#5A7060]">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {resource.author}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {resource.readTime}
                            </span>
                          </div>
                          <button className="text-[#11402D] font-bold text-xs flex items-center gap-1 hover:gap-2 transition-all">
                            Read More <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ============ SEARCH & FILTERS ============ */}
      <section className="py-6 bg-white border-b border-[#11402D]/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="flex-1 w-full relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A7060]" />
              <input
                type="text"
                placeholder="Search resources, topics, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#11402D]/10 focus:border-[#11402D] focus:ring-2 focus:ring-[#11402D]/10 transition-all bg-[#F6F8F4] text-sm"
              />
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-[#F6F8F4] rounded-xl border border-[#11402D]/10 p-1">
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
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>
      </section>

      {/* ============ CATEGORIES ============ */}
      <section className="py-6 bg-[#F6F8F4] border-b border-[#11402D]/5">
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
                      : "bg-white text-[#5A7060] hover:bg-[#11402D]/10"
                  }`}
                >
                  <Icon className="w-4 h-4" style={{ color: isActive ? "#9CF06B" : "#11402D" }} />
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ RESOURCES GRID ============ */}
      <section className="py-12 bg-[#F6F8F4]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-xl text-[#0A1A0F]">
                {filteredResources.length} Resources Found
              </h2>
              <p className="text-sm text-[#5A7060]">Curated content to accelerate your circular economy journey</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {filteredResources.map((resource, i) => (
                <ResourceCard key={resource.id} resource={resource} i={i} />
              ))}
            </AnimatePresence>
          </div>

          {filteredResources.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 rounded-full bg-[#11402D]/5 flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-[#5A7060]" />
              </div>
              <h3 className="font-bold text-xl text-[#0A1A0F] mb-2">No resources found</h3>
              <p className="text-[#5A7060]">Try adjusting your search or filters</p>
            </motion.div>
          )}

          {/* Load More */}
          {filteredResources.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-12 text-center"
            >
              <button className="inline-flex items-center gap-2 border-2 border-[#11402D]/12 text-[#11402D] font-black px-8 py-3.5 rounded-xl text-sm hover:bg-[#11402D] hover:text-white hover:border-[#11402D] transition-all">
                Load More Resources <ChevronDown className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* ============ NEWSLETTER SECTION ============ */}
      <section className="py-16 bg-[#0A1A0F]">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
          
            <h2 className="font-serif-display text-3xl sm:text-4xl text-white mb-4">
              Stay Updated
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto mb-8">
              Subscribe to our newsletter for the latest resources, case studies, and insights on waste-to-value innovation.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
            
              <motion.button 
                whileHover={{ scale: 1.05 }}
                className="bg-[#9CF06B] text-[#11402D] font-bold px-8 py-3 rounded-full text-sm shadow-lg flex items-center gap-2"
              >
                Subscribe <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
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
              <Lightbulb className="w-8 h-8 text-[#9CF06B]" />
            </div>
            <h2 className="font-serif-display text-3xl sm:text-4xl text-white mb-4">
              Have a resource to share?
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto mb-8">
              Contribute to our knowledge hub. Share your expertise, case studies, and insights with our community.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                className="bg-[#9CF06B] text-[#11402D] font-bold px-8 py-3 rounded-full text-sm shadow-lg flex items-center gap-2"
              >
                Submit Resource <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                className="border-2 border-white/20 text-white font-bold px-8 py-3 rounded-full text-sm flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" /> Contact Team
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}