import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  ArrowRight, CheckCircle2, Leaf, Recycle, Zap, Factory, 
  Droplets, Wind, Sun, Truck, Package, Wheat, FlaskConical,
  Award, TrendingUp, Users, Globe, BarChart3, Shield,
  Play, ChevronRight, Sparkles, Clock, MapPin, Star
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

/* ─── SOLUTIONS DATA ─── */
const SOLUTIONS = [
  {
    id: 1,
    title: "Organic Waste Processing",
    subtitle: "Food & Agricultural Residue",
    description: "Convert food waste, crop residue, and animal manure into biogas and organic fertilizer through advanced anaerobic digestion.",
    longDescription: "Our anaerobic digestion technology processes organic waste streams at scale, producing renewable natural gas and high-quality digestate for agricultural use.",
    icon: Leaf,
    image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1200&q=85",
    stats: [
      { label: "Conversion Rate", value: "85%" },
      { label: "Daily Capacity", value: "100T" },
      { label: "Energy Output", value: "15MWh" },
    ],
  },
  {
    id: 2,
    title: "Plastic Recycling",
    subtitle: "PET, HDPE, LDPE & PP Streams",
    description: "Advanced sorting, washing, and processing of plastic waste into high-quality recycled materials for manufacturing.",
    icon: Recycle,
    image: "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?auto=format&fit=crop&w=1200&q=85",
    stats: [
      { label: "Recovery Rate", value: "92%" },
      { label: "Annual Capacity", value: "50kT" },
      { label: "CO₂ Saved", value: "120kT" },
    ],
  },
  {
    id: 3,
    title: "Industrial Waste-to-Energy",
    subtitle: "Manufacturing & Industrial Biomass",
    description: "Convert industrial byproducts, biomass, and manufacturing waste into heat, power, and steam for industrial processes.",
    icon: Factory,
    image: "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?auto=format&fit=crop&w=1200&q=85",
    stats: [
      { label: "Energy Recovery", value: "88%" },
      { label: "Payback Period", value: "3-5y" },
      { label: "ROI", value: "25%" },
    ],
  },
  {
    id: 4,
    title: "Agricultural Residue",
    subtitle: "Crop Residue & Animal Waste",
    description: "Sustainable solutions for farms and agribusinesses to process crop residue and animal waste into valuable products.",
    icon: Wheat,
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=85",
    stats: [
      { label: "Processing Speed", value: "50T/d" },
      { label: "Biogas Yield", value: "120m³/T" },
      { label: "Fertilizer Value", value: "$200/T" },
    ],
  }
];

const CASE_STUDIES = [
  { company: "Nairobi Breweries", wasteType: "Organic & Packaging", reduction: "78%", energySaved: "2.4M kWh", image: "https://images.unsplash.com/photo-1562408590-e32931084e23?auto=format&fit=crop&w=800&q=85" },
  { company: "Great Lakes Farms", wasteType: "Agricultural", reduction: "92%", energySaved: "1.8M kWh", image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=85" },
  { company: "Mombasa Port", wasteType: "Industrial", reduction: "65%", energySaved: "3.1M kWh", image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=85" },
];

/* ─── SOLUTION CARD COMPONENT ─── */
function SolutionCard({ solution, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -8 }}
      className="group cursor-pointer"
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full border border-[#11402D]/5">
        <div className="relative h-52 overflow-hidden">
          <img src={solution.image} alt={solution.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1A0F]/70 via-transparent to-transparent" />
          <div className="absolute top-4 left-4">
            <div className="w-10 h-10 rounded-xl bg-[#11402D] flex items-center justify-center">
              <solution.icon className="w-5 h-5 text-[#9CF06B]" />
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-white font-bold text-xl mb-1">{solution.title}</h3>
            <p className="text-white/70 text-sm">{solution.subtitle}</p>
          </div>
        </div>
        
        <div className="p-6">
          <p className="text-[#5A7060] text-sm leading-relaxed mb-4">{solution.description}</p>
          
          <div className="grid grid-cols-3 gap-3 mb-4 pt-3 border-t border-[#11402D]/10">
            {solution.stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="font-bold text-sm text-[#11402D]">{stat.value}</div>
                <div className="text-[10px] text-[#5A7060]">{stat.label}</div>
              </div>
            ))}
          </div>
          
          <motion.button 
            whileHover={{ x: 4 }}
            className="flex items-center gap-2 text-sm font-semibold text-[#11402D] mt-2"
          >
            Learn more <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── MAIN SOLUTIONS PAGE ─── */
export default function SolutionsPage() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;700;800;900&display=swap');
        .font-serif-display { font-family: 'DM Serif Display', serif; }
      `}</style>

      {/* ============ HERO SECTION ============ */}
      <section className="relative min-h-[65vh] flex items-center bg-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-10 w-96 h-96 bg-[#9CF06B]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-[#11402D]/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-16">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="w-8 h-px bg-[#11402D]" />
              <span className="text-xs font-bold tracking-wider text-[#11402D] uppercase">Our Solutions</span>
            </div>
            
            <h1 className="font-serif-display text-5xl sm:text-6xl lg:text-7xl text-[#0A1A0F] leading-[1.1] tracking-tight mb-6">
              Turn waste into
              <span className="relative inline-block mx-3">
                <span className="relative z-10 text-[#11402D]">revenue.</span>
                <svg className="absolute -bottom-2 left-0 w-full" height="10" viewBox="0 0 300 10" preserveAspectRatio="none">
                  <path d="M2 6C60 2 240 2 298 6" stroke="#9CF06B" strokeWidth="5" strokeLinecap="round" fill="none" />
                </svg>
              </span>
            </h1>
            
            <p className="text-xl text-[#5A7060] leading-relaxed max-w-2xl mb-8">
              Proven technologies that transform waste streams into clean energy, recycled materials, and valuable byproducts — customized for your industry.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                className="bg-[#11402D] text-white font-bold px-8 py-3 rounded-full text-sm shadow-lg flex items-center gap-2"
              >
                Explore Solutions <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                className="border-2 border-[#11402D]/20 text-[#11402D] font-bold px-8 py-3 rounded-full text-sm flex items-center gap-2"
              >
                Talk to Expert
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ COMPREHENSIVE WASTE SOLUTIONS - IMPROVED ============ */}
      <section className="py-24 bg-[#F6F8F4]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            {/* Decorative line */}
            <div className="flex justify-center mb-6">
              <div className="w-12 h-px bg-[#11402D]" />
            </div>
            
            <h2 className="font-serif-display text-4xl sm:text-5xl text-[#0A1A0F] mb-4">
              Comprehensive Waste Solutions
            </h2>
            
            <p className="text-lg text-[#5A7060]">
              End-to-end technology solutions for every waste stream
            </p>
            
            {/* Decorative element */}
            <div className="flex justify-center gap-1 mt-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#9CF06B]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#11402D]/30" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#11402D]/30" />
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {SOLUTIONS.map((solution, i) => (
              <SolutionCard 
                key={solution.id}
                solution={solution}
                index={i}
              />
            ))}
          </div>
          
          {/* View all link */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <motion.button 
              whileHover={{ x: 4 }}
              className="inline-flex items-center gap-2 text-[#11402D] font-semibold border-b-2 border-[#9CF06B] pb-1"
            >
              View all solutions <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ============ HOW IT WORKS SECTION ============ */}
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
            <h2 className="font-serif-display text-4xl sm:text-5xl text-[#0A1A0F] mb-4">
              How It Works
            </h2>
            <p className="text-lg text-[#5A7060]">
              Simple, transparent process from waste to value
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Assessment", desc: "Free waste audit and feasibility study" },
              { step: "02", title: "Design", desc: "Custom solution design for your needs" },
              { step: "03", title: "Implementation", desc: "Seamless installation and integration" },
              { step: "04", title: "Optimization", desc: "Ongoing support and performance monitoring" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center group"
              >
                <div className="w-16 h-16 rounded-full bg-[#11402D]/5 flex items-center justify-center mx-auto mb-4 group-hover:bg-[#11402D] transition-colors">
                  <span className="text-xl font-bold text-[#11402D] group-hover:text-[#9CF06B] transition-colors">{item.step}</span>
                </div>
                <h3 className="font-bold text-lg text-[#0A1A0F] mb-2">{item.title}</h3>
                <p className="text-sm text-[#5A7060]">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ IMPACT STATS ============ */}
      <section className="py-20 bg-[#11402D]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 1250000, suffix: "+", label: "Tonnes Processed" },
              { value: 850, suffix: " GWh", label: "Energy Generated" },
              { value: 450000, suffix: "T", label: "CO₂ Reduced" },
              { value: 98, suffix: "%", label: "Client Satisfaction" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-[#9CF06B] mb-2">
                  <Counter to={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-white/60">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CASE STUDIES ============ */}
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
            <h2 className="font-serif-display text-4xl sm:text-5xl text-[#0A1A0F] mb-4">
              Success Stories
            </h2>
            <p className="text-lg text-[#5A7060]">
              Real results from real clients across Africa
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {CASE_STUDIES.map((study, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-[#11402D]/5"
              >
                <div className="relative h-48 overflow-hidden">
                  <img src={study.image} alt={study.company} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A1A0F]/60 via-transparent to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg text-[#0A1A0F] mb-2">{study.company}</h3>
                  <p className="text-sm text-[#5A7060] mb-4">Waste Type: {study.wasteType}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-[#11402D]/10">
                    <div>
                      <div className="text-xs text-[#5A7060]">Waste Reduction</div>
                      <div className="font-bold text-[#11402D]">{study.reduction}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#5A7060]">Energy Saved</div>
                      <div className="font-bold text-[#11402D]">{study.energySaved}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ WHY CHOOSE US ============ */}
      <section className="py-24 bg-[#F6F8F4]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-px bg-[#11402D]" />
                <span className="text-xs font-bold tracking-wider text-[#11402D] uppercase">Why Choose Us</span>
              </div>
              <h2 className="font-serif-display text-4xl sm:text-5xl text-[#0A1A0F] mb-4">
                Transform waste into your advantage
              </h2>
              <p className="text-lg text-[#5A7060] leading-relaxed mb-8">
                Our solutions maximize value recovery while minimizing environmental impact.
              </p>
              
              <div className="space-y-4">
                {[
                  { title: "Reduce Costs", desc: "Lower disposal fees and generate new revenue" },
                  { title: "Carbon Credits", desc: "Generate verified carbon offsets" },
                  { title: "Energy Independence", desc: "Produce your own clean energy" },
                  { title: "EPR Compliance", desc: "Meet regulatory requirements easily" },
                ].map((benefit, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-3 p-4 bg-white rounded-xl border border-[#11402D]/5"
                  >
                    <CheckCircle2 className="w-5 h-5 text-[#11402D] flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-[#0A1A0F] text-sm mb-1">{benefit.title}</h4>
                      <p className="text-xs text-[#5A7060]">{benefit.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1581092335871-4c4c8b7cfad9?auto=format&fit=crop&w=1200&q=85"
                  alt="Technology"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1A0F]/50 via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-xl p-4 max-w-xs border border-[#11402D]/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#11402D] flex items-center justify-center">
                    <Award className="w-5 h-5 text-[#9CF06B]" />
                  </div>
                  <div>
                    <div className="font-bold text-[#0A1A0F]">98% Uptime</div>
                    <div className="text-xs text-[#5A7060]">Industry leading reliability</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ CTA SECTION ============ */}
      <section className="py-20 bg-[#11402D]">
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
              Ready to transform your waste stream?
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto mb-8">
              Schedule a free waste audit with our experts and discover how much value you're leaving on the table.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                className="bg-[#9CF06B] text-[#11402D] font-bold px-8 py-3 rounded-full text-sm shadow-lg"
              >
                Schedule Free Audit
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                className="border-2 border-white/20 text-white font-bold px-8 py-3 rounded-full text-sm"
              >
                Download Brochure
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}