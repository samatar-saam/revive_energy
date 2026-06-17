import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  ArrowRight, CheckCircle2, Globe, Leaf, Recycle, Zap, Users, 
  Award, Heart, Target, Eye, TrendingUp, Shield, Truck, Factory,
  Wind, Droplets, Sun, Building2, MapPin, Clock, Star, Quote,
  Play, ChevronRight, 
} from "lucide-react";

/* ─── ANIMATED COUNTER ─── */
function Counter({ to, decimals = 0, prefix = "", suffix = "" }) {
  const nodeRef = useRef(null);
  const inViewRef = useRef(false);
  const [val, setVal] = useState(0);
  useEffect(() => {
    const el = nodeRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !inViewRef.current) {
        inViewRef.current = true;
        let start = 0;
        const duration = 2000;
        const step = (timestamp) => {
          if (!start) start = timestamp;
          const progress = Math.min((timestamp - start) / duration, 1);
          const current = Math.floor(progress * to);
          setVal(current);
          if (progress < 1) requestAnimationFrame(step);
          else setVal(to);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={nodeRef}>{prefix}{val}{suffix}</span>;
}

/* ─── TEAM MEMBERS ─── */
const TEAM = [
  { name: "Dr. Sarah Mbeki", role: "CEO & Co-Founder", image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80", bio: "Former UNEP advisor with 15+ years in circular economy" },
  { name: "James Ochieng", role: "CTO & Co-Founder", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80", bio: "Ex-Tesla energy systems engineer, waste-to-energy specialist" },
  { name: "Dr. Amina Diallo", role: "Head of Impact", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80", bio: "PhD in Environmental Economics, carbon markets expert" },
  { name: "Michael Njoroge", role: "Director of Operations", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80", bio: "20 years logistics experience across East Africa" },
];

/* ─── MILESTONES ─── */
const MILESTONES = [
  { year: "2020", title: "Company Founded", desc: "ReVive Energy launched in Nairobi, Kenya", icon: Star },
  { year: "2021", title: "First Facility", desc: "Opened first waste-to-energy plant in Thika", icon: Factory },
  { year: "2022", title: "Regional Expansion", desc: "Expanded to Uganda and Tanzania", icon: Globe },
  { year: "2023", title: "Carbon Credits", desc: "Issued first verified carbon credits", icon: Leaf },
  { year: "2024", title: "1M Tonnes", desc: "Surpassed 1 million tonnes recovered", icon: Award },
  { year: "2025", title: "Global Recognition", desc: "Named Africa's Green Energy Leader", icon: Trophy },
];

/* ─── VALUES ─── */
const VALUES = [
  { icon: Leaf, title: "Sustainability First", desc: "Every decision prioritizes environmental impact alongside business growth.", color: "#34D399" },
  { icon: Users, title: "Community Centered", desc: "We work with local communities to create shared value and opportunity.", color: "#60A5FA" },
  { icon: Shield, title: "Radical Transparency", desc: "All impact data is verified and publicly available quarterly.", color: "#9CF06B" },
  { icon: Zap, title: "Innovation Driven", desc: "We constantly push the boundaries of waste-to-energy technology.", color: "#F59E0B" },
  { icon: Heart, title: "People First", desc: "Our team's safety and growth are foundational to our success.", color: "#E879F9" },
  { icon: Globe, title: "Systems Thinking", desc: "We see waste as part of a larger ecosystem, not an endpoint.", color: "#38BDF8" },
];

/* ─── PARTNERS ─── */
const PARTNERS = [
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/2048px-BMW.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Samsung_Logo.svg/2560px-Samsung_Logo.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/2560px-Google_2015_logo.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/2560px-IBM_logo.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/2560px-Netflix_2015_logo.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/2560px-Google_2015_logo.svg.png",
];

function Trophy() {
  return <Award className="w-6 h-6" />;
}

/* ─── MAIN ABOUT PAGE ─── */
export default function AboutPage() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  
  return (
    <div className="min-h-screen bg-white overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        .font-serif-display { font-family: 'DM Serif Display', serif; }
        .font-space { font-family: 'Space Grotesk', sans-serif; }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .float { animation: float 6s ease-in-out infinite; }
        @keyframes slow-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .slow-spin { animation: slow-spin 30s linear infinite; }
      `}</style>

      {/* ============ HERO SECTION - NO BACKGROUND, MOVED UP ============ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white pt-0">
        {/* Animated background elements - subtle */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#9CF06B]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#11402D]/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-[#9CF06B]/5 rounded-full slow-spin" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-[#11402D]/5 rounded-full slow-spin" style={{ animationDirection: "reverse", animationDuration: "40s" }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-12 lg:py-16">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Main Headline */}
            <h1 className="font-serif-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl text-[#0A1A0F] leading-[1.1] tracking-tight mb-6">
              Turning Africa's waste into
              <span className="relative inline-block mx-3">
                <span className="relative z-10" style={{ color: "#11402D" }}>Africa's power.</span>
                <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 400 12" preserveAspectRatio="none">
                  <path d="M2 6C80 2 320 2 398 6" stroke="#9CF06B" strokeWidth="6" strokeLinecap="round" fill="none" />
                </svg>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl text-[#5A7060] leading-relaxed max-w-2xl mx-auto mb-10">
              We're on a mission to build the most advanced waste-to-energy network in emerging markets — creating value from what others discard.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 justify-center mb-16">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 bg-[#11402D] text-white font-black px-8 py-4 rounded-full text-sm hover:bg-[#0C2F20] transition-colors shadow-xl"
              >
                Our Mission <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 border-2 border-[#11402D]/20 text-[#11402D] font-black px-8 py-4 rounded-full text-sm hover:border-[#11402D] hover:bg-[#11402D]/5 transition-all"
              >
                Watch Our Story <Play className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-[#11402D]/10">
              {[
                { val: 5, suffix: "+", label: "Years of Impact", prefix: "" },
                { val: 1250000, suffix: "+", label: "Tonnes Recovered", prefix: "" },
                { val: 850, suffix: " GWh", label: "Clean Energy", prefix: "" },
                { val: 2500, suffix: "+", label: "Jobs Created", prefix: "" },
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="text-center"
                >
                  <div className="font-space text-3xl md:text-4xl font-bold text-[#11402D]">
                    <Counter to={stat.val} suffix={stat.suffix} prefix={stat.prefix} />
                  </div>
                  <div className="text-xs text-[#5A7060] font-medium mt-1 uppercase tracking-wide">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          style={{ opacity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] text-[#5A7060] uppercase tracking-widest font-bold">Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-[#11402D]/20 rounded-full flex justify-center">
            <motion.div 
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-[#11402D] rounded-full mt-2"
            />
          </div>
        </motion.div>
      </section>

      {/* ============ MISSION & VISION SECTION ============ */}
      <section className="py-24 lg:py-32 bg-gradient-to-b from-white to-[#F6F8F4]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Mission */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative group"
            >
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-[#9CF06B]/10 rounded-2xl group-hover:scale-110 transition-transform duration-500" />
              <div className="relative z-10 bg-white rounded-3xl p-8 lg:p-10 shadow-xl border border-[#11402D]/5">
                <div className="w-16 h-16 rounded-2xl bg-[#11402D] flex items-center justify-center mb-6">
                  <Target className="w-8 h-8 text-[#9CF06B]" />
                </div>
                <h2 className="font-serif-display text-3xl lg:text-4xl text-[#0A1A0F] mb-4">Our Mission</h2>
                <p className="text-lg text-[#5A7060] leading-relaxed mb-6">
                  To transform waste management across Africa by building world-class infrastructure that converts discarded materials into clean energy, creating economic opportunity and environmental restoration.
                </p>
                <div className="flex items-center gap-2 text-[#11402D] font-semibold">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>100% circular by 2030</span>
                </div>
              </div>
            </motion.div>

            {/* Vision */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative group"
            >
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#9CF06B]/10 rounded-2xl group-hover:scale-110 transition-transform duration-500" />
              <div className="relative z-10 bg-[#0A1A0F] rounded-3xl p-8 lg:p-10 shadow-xl">
                <div className="w-16 h-16 rounded-2xl bg-[#9CF06B] flex items-center justify-center mb-6">
                  <Eye className="w-8 h-8 text-[#0A1A0F]" />
                </div>
                <h2 className="font-serif-display text-3xl lg:text-4xl text-white mb-4">Our Vision</h2>
                <p className="text-lg text-white/60 leading-relaxed mb-6">
                  A future where no waste goes to landfill — where every discarded resource becomes a source of energy, jobs, and sustainable prosperity for communities across Africa and beyond.
                </p>
                <div className="flex items-center gap-2 text-[#9CF06B] font-semibold">
                  <Globe className="w-5 h-5" />
                  <span>Clean energy for 10 million homes by 2030</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ IMPACT IMAGE SHOWCASE ============ */}
      <section className="py-16 bg-[#0A1A0F]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1200&q=85",
              "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=85",
              "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1200&q=85",
            ].map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="relative overflow-hidden rounded-2xl group cursor-pointer"
              >
                <img src={img} alt="Impact" className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1A0F] via-transparent to-transparent opacity-60" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ OUR VALUES ============ */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-[#11402D]/5 rounded-full px-4 py-2 mb-6">
              <Heart className="w-4 h-4 text-[#11402D]" />
              <span className="text-xs font-black tracking-wider text-[#11402D] uppercase">What We Believe</span>
            </div>
            <h2 className="font-serif-display text-4xl lg:text-5xl text-[#0A1A0F] mb-4">Our Core Values</h2>
            <p className="text-lg text-[#5A7060]">The principles that guide every decision we make.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUES.map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ y: -8 }}
                className="bg-[#F6F8F4] rounded-2xl p-8 transition-all duration-300 hover:shadow-xl"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: `${value.color}15` }}>
                  <value.icon className="w-6 h-6" style={{ color: value.color }} />
                </div>
                <h3 className="font-bold text-xl text-[#0A1A0F] mb-3">{value.title}</h3>
                <p className="text-[#5A7060] leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ MILESTONES TIMELINE ============ */}
      <section className="py-24 lg:py-32 bg-[#F6F8F4]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 mb-6 shadow-sm">
              <Award className="w-4 h-4 text-[#11402D]" />
              <span className="text-xs font-black tracking-wider text-[#11402D] uppercase">Our Journey</span>
            </div>
            <h2 className="font-serif-display text-4xl lg:text-5xl text-[#0A1A0F] mb-4">Key Milestones</h2>
            <p className="text-lg text-[#5A7060]">From startup to industry leader — our path to impact.</p>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-0 lg:left-1/2 top-0 bottom-0 w-px bg-[#11402D]/10 lg:transform lg:-translate-x-px" />
            
            <div className="space-y-12">
              {MILESTONES.map((milestone, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className={`relative flex flex-col lg:flex-row items-start gap-6 ${
                    i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  }`}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-0 lg:left-1/2 w-4 h-4 rounded-full bg-[#9CF06B] border-4 border-white shadow-lg transform -translate-x-2 lg:-translate-x-1/2" />
                  
                  {/* Content */}
                  <div className={`w-full lg:w-[calc(50%-40px)] ${i % 2 === 0 ? 'lg:pr-12' : 'lg:pl-12 lg:ml-auto'}`}>
                    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="font-space text-3xl font-bold text-[#9CF06B]">{milestone.year}</span>
                        <milestone.icon className="w-5 h-5 text-[#11402D]" />
                      </div>
                      <h3 className="font-bold text-lg text-[#0A1A0F] mb-2">{milestone.title}</h3>
                      <p className="text-[#5A7060] text-sm">{milestone.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ TEAM SECTION ============ */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-[#11402D]/5 rounded-full px-4 py-2 mb-6">
              <Users className="w-4 h-4 text-[#11402D]" />
              <span className="text-xs font-black tracking-wider text-[#11402D] uppercase">Leadership</span>
            </div>
            <h2 className="font-serif-display text-4xl lg:text-5xl text-[#0A1A0F] mb-4">Meet Our Team</h2>
            <p className="text-lg text-[#5A7060]">Passionate experts driving change across the continent.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <div className="relative overflow-hidden rounded-2xl mb-4">
                  <img src={member.image} alt={member.name} className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A1A0F]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-xs leading-relaxed">{member.bio}</p>
                  </div>
                </div>
                <h3 className="font-bold text-[#0A1A0F] text-lg">{member.name}</h3>
                <p className="text-[#11402D] text-sm font-semibold">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PARTNERS SECTION ============ */}
      <section className="py-16 bg-[#F6F8F4]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h3 className="font-bold text-xl text-[#5A7060] uppercase tracking-wider">Trusted by Industry Leaders</h3>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            {PARTNERS.map((logo, i) => (
              <motion.img
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                src={logo}
                alt="Partner"
                className="opacity-40 hover:opacity-70 transition-opacity h-8 object-contain"
              />
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA SECTION ============ */}
      <section className="py-24 lg:py-32 bg-[#0A1A0F]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="w-20 h-20 rounded-full bg-[#9CF06B]/10 flex items-center justify-center mx-auto mb-8">
              <Recycle className="w-10 h-10 text-[#9CF06B]" />
            </div>
            <h2 className="font-serif-display text-4xl lg:text-6xl text-white leading-tight mb-6">
              Join us in building<br />a circular future.
            </h2>
            <p className="text-xl text-white/50 leading-relaxed mb-10 max-w-2xl mx-auto">
              Whether you're a waste producer, energy buyer, or investor — there's a place for you in our ecosystem.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 bg-[#9CF06B] text-[#0A1A0F] font-black px-8 py-4 rounded-full text-sm hover:bg-[#8AE05A] transition-colors"
              >
                Become a Partner <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 border-2 border-white/20 text-white font-black px-8 py-4 rounded-full text-sm hover:bg-white/10 transition-all"
              >
                Contact Us
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-[#0A1A0F] border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#11402D] flex items-center justify-center">
                <Recycle className="w-5 h-5 text-[#9CF06B]" />
              </div>
              <span className="font-bold text-white text-lg">ReVive Energy</span>
            </div>
            
            <div className="flex gap-6 text-xs text-white/30">
              <a href="#" className="hover:text-white/60 transition-colors">Privacy</a>
              <a href="#" className="hover:text-white/60 transition-colors">Terms</a>
              <a href="#" className="hover:text-white/60 transition-colors">Careers</a>
            </div>
          </div>
          <div className="text-center text-white/20 text-xs mt-8">
            © 2026 ReVive Energy. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}