import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight, Recycle, Leaf, Zap, Droplets, Sun, Wind,
  Truck, Factory, Package, Wheat, Users, Globe, BarChart3,
  CheckCircle2, MapPin, Clock, Star, Shield, TrendingUp,
  Award, Play, ChevronRight, Sparkles, Gauge, Activity,
  Flame as FireIcon, Droplet as DropletIcon, Sprout, Circle,
  ChevronDown, Mail, Phone, Building2, Home, Battery, ChartBar,
  Gift, Recycle as RecycleIcon, Compass, Target, Eye,
  Filter, Layers, Boxes, ArrowDown, ArrowUp, CircleDot,
  Thermometer, Wind as WindIcon, Zap as ZapIcon, CloudSun,
  TreePine, Flower2, Factory as FactoryIcon, Warehouse,
  Building, LandPlot, Tractor, Bus, Car, Ship, Plane,
  Coffee, Utensils, Pizza, Apple, ShoppingBag, Store, Hotel,
  Heart, Handshake, Lightbulb, Rocket, ThumbsUp, Smile,
  Award as AwardIcon, Trophy, Medal, Crown, Star as StarIcon
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
const IMPACT_METRICS = [
  {
    value: 125000,
    suffix: "+",
    label: "Tons Diverted From Landfills",
    icon: Recycle,
    detail: "Enough to fill 50 Olympic swimming pools",
    color: "#34D399"
  },
  {
    value: 850,
    suffix: " GWh",
    label: "Clean Energy Generated",
    icon: Zap,
    detail: "Powering 150,000+ homes annually",
    color: "#F59E0B"
  },
  {
    value: 45000,
    suffix: "+",
    label: "Tons CO₂ Reduced",
    icon: Leaf,
    detail: "Equivalent to removing 10,000 cars",
    color: "#60A5FA"
  },
  {
    value: 2500,
    suffix: "+",
    label: "Partners Connected",
    icon: Users,
    detail: "Across 8 African countries",
    color: "#818CF8"
  }
];

const SDG_GOALS = [
  { number: 7, title: "Affordable & Clean Energy", icon: Zap, color: "#F59E0B", description: "Providing renewable energy access to communities across Africa." },
  { number: 9, title: "Industry, Innovation & Infrastructure", icon: Factory, color: "#F97316", description: "Building modern waste-to-energy infrastructure that drives sustainable industrialization." },
  { number: 11, title: "Sustainable Cities & Communities", icon: Building2, color: "#FBBF24", description: "Creating cleaner, greener urban environments through waste management." },
  { number: 12, title: "Responsible Consumption & Production", icon: Recycle, color: "#34D399", description: "Promoting circular economy principles and reducing waste." },
  { number: 13, title: "Climate Action", icon: Globe, color: "#60A5FA", description: "Reducing greenhouse gas emissions through waste conversion." },
  { number: 15, title: "Life on Land", icon: TreePine, color: "#34D399", description: "Protecting ecosystems by reducing landfill waste and pollution." }
];

const IMPACT_STORIES = [
  {
    title: "Kenya's First Large-Scale Biogas Plant",
    description: "ReVive Energy's biogas facility in Thika processes 100 tonnes of organic waste daily, powering 5,000 homes and creating 50 jobs.",
    image: "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?auto=format&fit=crop&w=800&q=85",
    metrics: ["100T/day", "5,000 homes", "50 jobs"],
    color: "#34D399"
  },
  {
    title: "Plastic Recycling Revolution",
    description: "Our Mombasa facility recycles 50,000 tonnes of plastic annually, creating 200 jobs and reducing ocean plastic pollution by 40%.",
    image: "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?auto=format&fit=crop&w=800&q=85",
    metrics: ["50K tonnes", "200 jobs", "40% reduction"],
    color: "#60A5FA"
  },
  {
    title: "Empowering Smallholder Farmers",
    description: "Over 1,200 farmers across Kenya now use our organic fertilizer, increasing crop yields by 30% and reducing chemical fertilizer use.",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=85",
    metrics: ["1,200 farmers", "30% yield", "8 counties"],
    color: "#F59E0B"
  }
];

const ENVIRONMENTAL_IMPACT = [
  {
    icon: TreePine,
    label: "Trees Saved",
    value: "750,000",
    description: "Equivalent to preserving 750,000 trees annually"
  },
  {
    icon: DropletIcon,
    label: "Water Saved",
    value: "12M",
    description: "Liters of water saved through recycling processes"
  },
  {
    icon: Wind,
    label: "Air Quality Improvement",
    value: "45%",
    description: "Reduction in air pollutants in partner communities"
  },
  {
    icon: Heart,
    label: "Lives Impacted",
    value: "500K+",
    description: "People benefiting from clean energy and cleaner environments"
  }
];

/* ─── MAIN IMPACT PAGE ─── */
export default function ImpactPage() {
  const { scrollYProgress } = useScroll();
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const [activeStory, setActiveStory] = useState(0);

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
      `}</style>

      {/* ── SCROLL PROGRESS ── */}
      <motion.div className="fixed top-0 left-0 h-0.5 bg-[#9CF06B] z-50 origin-left"
        style={{ width: progressWidth }} />

      {/* ============ HERO SECTION ============ */}
      <section className="relative min-h-[55vh] flex items-center bg-white pt-0">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-10 w-96 h-96 bg-[#9CF06B]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-[#11402D]/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-8 lg:py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-[#0E2A1C] leading-[1.1] tracking-tight mb-6">
                Creating Impact
                <span className="relative inline-block mx-3">
                  <span className="relative z-10 text-[#11402D]">Together.</span>
                  <svg className="absolute -bottom-2 left-0 w-full" height="10" viewBox="0 0 300 10" preserveAspectRatio="none">
                    <path d="M2 6C60 2 240 2 298 6" stroke="#9CF06B" strokeWidth="5" strokeLinecap="round" fill="none" />
                  </svg>
                </span>
              </h1>

              <p className="text-xl text-[#142019]/65 leading-relaxed max-w-lg mb-8">
                ReVive Energy is committed to creating lasting environmental and social impact across Africa — one tonne of waste at a time.
              </p>

              <div className="flex flex-wrap gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="bg-[#11402D] text-white font-display font-bold px-8 py-3 rounded-full text-sm shadow-lg flex items-center gap-2"
                >
                  Explore Our Impact <ArrowRight className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="border-2 border-[#11402D]/20 text-[#11402D] font-display font-bold px-8 py-3 rounded-full text-sm flex items-center gap-2"
                >
                  Download Report
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
                  src="https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=85"
                  alt="Impact"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B2417]/50 via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-xl p-4 border border-[#11402D]/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#11402D] flex items-center justify-center">
                    <Globe className="w-5 h-5 text-[#9CF06B]" />
                  </div>
                  <div>
                    <div className="font-display font-bold text-[#0E2A1C]">UN SDGs Aligned</div>
                    <div className="text-xs text-[#5A7060]">6 sustainable goals impacted</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ IMPACT METRICS ============ */}
      <section className="py-24 bg-[#0E2A1C]">
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
              Our Impact
            </p>
            <h2 className="font-display text-4xl sm:text-5xl text-white mb-4">
              The Numbers Behind Our Mission
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              Real change measured in real numbers — our impact speaks for itself.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {IMPACT_METRICS.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center bg-white/5 rounded-2xl p-6 backdrop-blur border border-white/10 hover:bg-white/10 transition-all group"
                >
                  <div className="w-14 h-14 rounded-full bg-[#9CF06B]/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
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

      {/* ============ SDG GOALS ============ */}
      <section className="py-24 bg-white">
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
              UN Sustainable Development Goals
            </p>
            <h2 className="font-display text-4xl sm:text-5xl text-[#0E2A1C] mb-4">
              Aligned with Global Goals
            </h2>
            <p className="text-lg text-[#142019]/65">
              Our work directly contributes to achieving the United Nations Sustainable Development Goals.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SDG_GOALS.map((goal, i) => {
              const Icon = goal.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-[#F6F8F4] rounded-2xl p-6 hover:shadow-xl transition-all border border-[#11402D]/5 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                      style={{ background: `${goal.color}15` }}>
                      <Icon className="w-6 h-6" style={{ color: goal.color }} />
                    </div>
                    <div>
                      <div className="font-mono-cw text-xs font-bold text-[#11402D]">SDG {goal.number}</div>
                      <h3 className="font-display font-bold text-[#0E2A1C] text-sm">{goal.title}</h3>
                      <p className="text-xs text-[#142019]/55 mt-1">{goal.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ IMPACT STORIES ============ */}
      <section className="py-24 bg-[#F6F8F4]">
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
              Real Stories
            </p>
            <h2 className="font-display text-4xl sm:text-5xl text-[#0E2A1C] mb-4">
              Impact in Action
            </h2>
            <p className="text-lg text-[#142019]/65">
              See how our work is transforming communities and environments across Africa.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {IMPACT_STORIES.map((story, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-[#11402D]/5 group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img src={story.image} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B2417]/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-display font-bold text-lg">{story.title}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-sm text-[#142019]/55 leading-relaxed mb-4">{story.description}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {story.metrics.map((metric, j) => (
                      <div key={j} className="text-center bg-[#F6F8F4] rounded-lg p-2">
                        <div className="font-mono-cw text-xs font-bold text-[#11402D]">{metric}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ENVIRONMENTAL IMPACT ============ */}
      <section className="py-24 bg-white">
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
              Environmental Impact
            </p>
            <h2 className="font-display text-4xl sm:text-5xl text-[#0E2A1C] mb-4">
              Beyond Carbon Reduction
            </h2>
            <p className="text-lg text-[#142019]/65">
              Our impact extends beyond carbon reduction to create lasting environmental benefits.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {ENVIRONMENTAL_IMPACT.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center bg-[#F6F8F4] rounded-2xl p-6 hover:shadow-xl transition-all border border-[#11402D]/5 group"
                >
                  <div className="w-14 h-14 rounded-full bg-[#11402D]/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7 text-[#11402D]" />
                  </div>
                  <div className="font-display text-3xl font-bold text-[#11402D] mb-1">{item.value}</div>
                  <div className="font-bold text-[#0E2A1C] text-sm mb-1">{item.label}</div>
                  <p className="text-xs text-[#142019]/55">{item.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ COMMUNITY IMPACT ============ */}
      <section className="py-24 bg-[#0E2A1C]">
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
              Community Impact
            </p>
            <h2 className="font-display text-4xl sm:text-5xl text-white mb-4">
              Building Stronger Communities
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              Our work creates jobs, empowers local economies, and builds resilience in the communities we serve.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Users, value: "500+", label: "Direct Jobs Created", detail: "In recycling and energy facilities" },
              { icon: AwardIcon, value: "200+", label: "Training Programs", detail: "For local workforce development" },
              { icon: Handshake, value: "2,500+", label: "Partners Engaged", detail: "Across the value chain" },
              { icon: Rocket, value: "50+", label: "SMEs Supported", detail: "In waste management and recycling" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center bg-white/5 rounded-2xl p-6 backdrop-blur border border-white/10 hover:bg-white/10 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#9CF06B]/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-[#9CF06B]" />
                  </div>
                  <div className="font-display text-2xl font-bold text-[#9CF06B] mb-1">{item.value}</div>
                  <div className="text-sm text-white/60 font-medium">{item.label}</div>
                  <div className="text-xs text-white/30 mt-1">{item.detail}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ CERTIFICATIONS ============ */}
      <section className="py-24 bg-white">
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
              Recognized Excellence
            </p>
            <h2 className="font-display text-4xl sm:text-5xl text-[#0E2A1C] mb-4">
              Certifications & Recognition
            </h2>
            <p className="text-lg text-[#142019]/65">
              Our commitment to quality and sustainability is recognized by leading global organizations.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: "ISO 14001", desc: "Environmental Management", color: "#34D399" },
              { icon: Award, title: "B-Corp Certified", desc: "Social & Environmental Performance", color: "#F59E0B" },
              { icon: Medal, title: "Gold Standard", desc: "Carbon Credit Certification", color: "#60A5FA" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[#F6F8F4] rounded-2xl p-8 text-center hover:shadow-xl transition-all border border-[#11402D]/5 group"
                >
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"
                    style={{ background: `${item.color}15` }}>
                    <Icon className="w-8 h-8" style={{ color: item.color }} />
                  </div>
                  <h3 className="font-display font-bold text-[#0E2A1C] text-lg">{item.title}</h3>
                  <p className="text-sm text-[#142019]/55 mt-1">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ CTA SECTION ============ */}
      <section className="py-20 bg-[#0E2A1C]">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-20 h-20 rounded-full bg-[#9CF06B]/10 flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-[#9CF06B]" />
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-white mb-4">
              Join Our Impact Journey
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto mb-8">
              Become part of the solution. Partner with ReVive Energy to create lasting environmental and social impact across Africa.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="bg-[#9CF06B] text-[#0E2A1C] font-display font-bold px-8 py-4 rounded-full text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                Partner With Us <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="border-2 border-white/20 text-white font-display font-bold px-8 py-4 rounded-full text-sm hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <Phone className="w-4 h-4" /> Contact Us
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-[#0E2A1C] text-white pt-14 sm:pt-16 pb-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
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
                Transforming waste into clean energy, fertilizer, and sustainable products for a circular economy across Africa.
              </p>
            </div>

            {[
              ["Company", ["About Us", "Careers", "Impact", "Resources"]],
              ["Solutions", ["Organic Waste", "Plastic Recycling", "Industrial Waste", "Agricultural Waste"]],
              ["Connect", ["info@reviveenergy.com", "+254 700 123 456", "Privacy Policy", "Terms of Service"]],
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
              <a href="#" className="hover:text-[#9CF06B] transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-[#9CF06B] transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}