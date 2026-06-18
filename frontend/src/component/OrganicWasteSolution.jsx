import { useState, useEffect, useRef } from "react";
import organicWasteImage from "../assets/organic-waste.jpg.jpeg";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  ArrowRight, CheckCircle2, Leaf, Recycle, Zap, 
  TrendingUp, Users, Globe, Shield, Clock, MapPin, Star,
  Play, ChevronRight, Sparkles, Package, FlaskConical,
  Droplets, Sun, Wind, Truck, Factory, Award, BarChart3,
  Phone, Mail, Utensils, Apple, Coffee, Pizza, Fish,
  Flame, Gauge, Activity, 
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
const BENEFITS = [
  {
    icon: TrendingUp,
    title: "Reduce Disposal Costs",
    desc: "Cut waste disposal expenses by up to 60% with on-site processing",
    stat: "Save 60%"
  },
  {
    icon: Zap,
    title: "Generate Clean Energy",
    desc: "Convert organic waste into biogas for cooking, heating, and electricity",
    stat: "15 MWh/day"
  },
  {
    icon: Leaf,
    title: "Create Organic Fertilizer",
    desc: "Produce nutrient-rich digestate for agriculture and landscaping",
    stat: "High Quality"
  },
  {
    icon: Shield,
    title: "Meet Sustainability Goals",
    desc: "Achieve ESG targets and generate verified carbon offsets",
    stat: "100% Compliant"
  }
];

const PROCESS_STEPS = [
  {
    icon: Utensils,
    title: "Collection & Sorting",
    desc: "Organic waste is collected and sorted to remove contaminants",
    details: "Food, market, hotel & restaurant waste"
  },
  {
    icon: FlaskConical,
    title: "Anaerobic Digestion",
    desc: "Waste is broken down in oxygen-free tanks by microorganisms",
    details: "85-90% conversion efficiency"
  },
  {
    icon: Flame,
    title: "Biogas Production",
    desc: "Methane-rich biogas is captured and upgraded for energy use",
    details: "Up to 120m³ per tonne"
  },
];

const CASE_STUDIES = [
  {
    name: "Nairobi Central Market",
    location: "Nairobi, Kenya",
    wasteType: "Market Food Waste",
    reduction: "85%",
    energySaved: "2.4M kWh",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=85"
  },
  {
    name: "Safari Park Hotel",
    location: "Nairobi, Kenya",
    wasteType: "Hotel Kitchen Waste",
    reduction: "78%",
    energySaved: "1.8M kWh",
    image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=85"
  },
  {
    name: "Mombasa Fish Market",
    location: "Mombasa, Kenya",
    wasteType: "Fish & Seafood Waste",
    reduction: "92%",
    energySaved: "3.1M kWh",
    image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=800&q=85"
  }
];

const TESTIMONIALS = [
  {
    quote: "ReVive Energy helped us turn our food waste problem into a sustainable solution. We now generate biogas for our kitchens and save thousands on disposal costs.",
    name: "Grace Muthoni",
    role: "Operations Manager, Safari Park Hotel",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&q=80"
  },
  {
    quote: "The organic fertilizer from our digester has improved our farm yields significantly. We're closing the loop from plate to farm.",
    name: "David Ochieng",
    role: "Farm Director, Green Valley Farms",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80"
  }
];

/* ─── MAIN PAGE ─── */
export default function OrganicWasteSolution() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

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

      {/* ============ HERO SECTION - MOVED UP ============ */}
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
                Turn food waste into
                <span className="relative inline-block mx-3">
                  <span className="relative z-10 text-[#11402D]">energy.</span>
                  <svg className="absolute -bottom-2 left-0 w-full" height="10" viewBox="0 0 300 10" preserveAspectRatio="none">
                    <path d="M2 6C60 2 240 2 298 6" stroke="#9CF06B" strokeWidth="5" strokeLinecap="round" fill="none" />
                  </svg>
                </span>
              </h1>
              
              <p className="text-xl text-[#142019]/65 leading-relaxed mb-8">
                Transform food waste from hotels, restaurants, markets, and food processors into renewable energy and organic fertilizer — reducing costs and environmental impact.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  className="bg-[#11402D] text-white font-display font-bold px-8 py-3 rounded-full text-sm shadow-lg flex items-center gap-2"
                >
                  Request Free Assessment <ArrowRight className="w-4 h-4" />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  className="border-2 border-[#11402D]/20 text-[#11402D] font-display font-bold px-8 py-3 rounded-full text-sm flex items-center gap-2"
                >
                  Watch Video <Play className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-10 pt-8 border-t border-[#142019]/10">
                {[
                  { value: "85%", label: "Conversion Efficiency" },
                  { value: "120", label: "m³/T Biogas Yield" },
                  { value: "92%", label: "Waste Reduction" },
                ].map((stat, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="text-center"
                  >
                    <div className="font-display text-lg font-bold text-[#11402D]">{stat.value}</div>
                    <div className="text-xs text-[#142019]/55">{stat.label}</div>
                  </motion.div>
                ))}
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
                  src={organicWasteImage}
                  alt="Organic Waste"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B2417]/50 via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-xl p-4 border border-[#11402D]/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#11402D] flex items-center justify-center">
                    <Utensils className="w-5 h-5 text-[#9CF06B]" />
                  </div>
                  <div>
                    <div className="font-display font-bold text-[#0E2A1C]">500+ Tonnes</div>
                    <div className="text-xs text-[#5A7060]">Processed daily</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ OVERVIEW SECTION ============ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-px bg-[#11402D]" />
                <span className="font-mono-cw text-xs font-bold tracking-wider text-[#11402D] uppercase">Overview</span>
              </div>
              <h2 className="font-display text-4xl sm:text-5xl text-[#0E2A1C] mb-4">
                Food waste is a valuable resource
              </h2>
              <p className="text-lg text-[#142019]/65 leading-relaxed mb-6">
                Every year, millions of tonnes of organic waste end up in landfills, releasing methane and contributing to climate change. Our solutions capture this value.
              </p>
              <p className="text-[#142019]/65 leading-relaxed">
                We help hotels, restaurants, markets, food processors, and communities transform organic waste into biogas for cooking and electricity, high-quality organic fertilizer, and carbon credits.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { icon: Apple, label: "Food Waste", value: "Restaurants, Hotels" },
                { icon: Pizza, label: "Market Waste", value: "Fruits, Vegetables" },
                { icon: Coffee, label: "Processing Waste", value: "Juice, Brewing" },
                { icon: Fish, label: "Seafood Waste", value: "Fish, Shellfish" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[#F6F8F4] rounded-xl p-4 border border-[#11402D]/5 text-center hover:shadow-md transition-all"
                >
                  <item.icon className="w-8 h-8 text-[#11402D] mx-auto mb-2" />
                  <div className="font-display font-bold text-sm text-[#0E2A1C]">{item.label}</div>
                  <div className="text-xs text-[#142019]/55">{item.value}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ KEY BENEFITS ============ */}
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
            <h2 className="font-display text-4xl sm:text-5xl text-[#0E2A1C] mb-4">
              Why Process Organic Waste?
            </h2>
            <p className="text-lg text-[#142019]/65">
              Turn disposal costs into valuable resources
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {BENEFITS.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 hover:shadow-xl transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#11402D] flex items-center justify-center flex-shrink-0 group-hover:bg-[#0E2A1C] transition-colors">
                    <benefit.icon className="w-6 h-6 text-[#9CF06B]" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-display font-bold text-[#0E2A1C]">{benefit.title}</h3>
                      <span className="font-mono-cw text-xs font-bold text-[#11402D] bg-[#F6F8F4] px-2 py-0.5 rounded-full">
                        {benefit.stat}
                      </span>
                    </div>
                    <p className="text-sm text-[#142019]/55">{benefit.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
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
            <h2 className="font-display text-4xl sm:text-5xl text-[#0E2A1C] mb-4">
              How It Works
            </h2>
            <p className="text-lg text-[#142019]/65">
              Simple process from food waste to clean energy
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {PROCESS_STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative group"
              >
                <div className="bg-[#F6F8F4] rounded-2xl p-6 text-center hover:shadow-xl transition-all border border-[#11402D]/5">
                  <div className="w-16 h-16 rounded-full bg-[#11402D] flex items-center justify-center mx-auto mb-4 group-hover:bg-[#0E2A1C] transition-colors">
                    <step.icon className="w-8 h-8 text-[#9CF06B]" />
                  </div>
                  <div className="font-mono-cw inline-block text-xs font-bold text-[#9CF06B] bg-[#11402D] px-2 py-0.5 rounded-full mb-3">
                    Step {i + 1}
                  </div>
                  <h3 className="font-display font-bold text-[#0E2A1C] mb-2">{step.title}</h3>
                  <p className="text-sm text-[#142019]/55 mb-2">{step.desc}</p>
                  <p className="text-xs text-[#11402D] font-medium">{step.details}</p>
                </div>
                {i < PROCESS_STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-[#11402D]/20" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ IMPACT STATS ============ */}
      <section className="py-20 bg-[#0E2A1C]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 85000, suffix: "T", label: "Organic Waste Processed" },
              { value: 45, suffix: " GWh", label: "Energy Generated" },
              { value: 28000, suffix: "T", label: "CO₂ Reduced" },
              { value: 98, suffix: "%", label: "Conversion Rate" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="font-display text-3xl md:text-4xl font-bold text-[#9CF06B] mb-2">
                  <Counter to={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-white/60">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CASE STUDIES ============ */}
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
            <h2 className="font-display text-4xl sm:text-5xl text-[#0E2A1C] mb-4">
              Success Stories
            </h2>
            <p className="text-lg text-[#142019]/65">
              Real results from businesses and communities
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
                  <img src={study.image} alt={study.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B2417]/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-display font-bold text-lg">{study.name}</h3>
                    <p className="text-white/70 text-sm flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {study.location}
                    </p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-sm text-[#142019]/55 mb-4">Waste Type: {study.wasteType}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-[#11402D]/10">
                    <div>
                      <div className="text-xs text-[#142019]/55">Reduction</div>
                      <div className="font-display font-bold text-[#11402D]">{study.reduction}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#142019]/55">Energy Saved</div>
                      <div className="font-display font-bold text-[#11402D]">{study.energySaved}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
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
            <h2 className="font-display text-4xl sm:text-5xl text-[#0E2A1C] mb-4">
              What Our Clients Say
            </h2>
            <p className="text-lg text-[#142019]/65">
              Real experiences from our partners
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {TESTIMONIALS.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#F6F8F4] rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all border border-[#11402D]/5"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-display font-bold text-[#0E2A1C]">{testimonial.name}</h4>
                    <p className="text-sm text-[#142019]/55">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-[#142019]/55 leading-relaxed italic">
                  "{testimonial.quote}"
                </p>
                <div className="mt-4 flex gap-0.5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-[#9CF06B] text-[#9CF06B]" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FAQ SECTION ============ */}
      <section className="py-24 bg-[#F6F8F4]">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="flex justify-center mb-6">
              <div className="w-12 h-px bg-[#11402D]" />
            </div>
            <h2 className="font-display text-4xl sm:text-5xl text-[#0E2A1C] mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-[#142019]/65">
              Everything you need to know about organic waste solutions
            </p>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                q: "What types of organic waste can be processed?",
                a: "We process food waste from restaurants, hotels, and markets; fruit and vegetable waste; food processing byproducts; and other organic waste streams."
              },
              {
                q: "How much biogas can I generate from food waste?",
                a: "On average, one tonne of food waste can produce 100-150 cubic meters of biogas, depending on the composition and moisture content."
              },
              {
                q: "What is the ROI on an organic waste system?",
                a: "Most businesses see ROI within 3-5 years through reduced disposal costs, energy savings, and fertilizer production."
              },
              {
                q: "Can I use the biogas for cooking?",
                a: "Yes! Biogas can be used for cooking, heating, electricity generation, and even upgraded to biomethane for vehicle fuel."
              },
              {
                q: "Is the fertilizer safe for farming?",
                a: "Yes, the digestate is a high-quality organic fertilizer rich in nutrients. It's safe and effective for agricultural use."
              }
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-xl p-6 hover:shadow-md transition-all"
              >
                <h4 className="font-display font-bold text-[#0E2A1C] mb-2">{faq.q}</h4>
                <p className="text-sm text-[#142019]/55 leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
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
            <div className="w-16 h-16 rounded-full bg-[#9CF06B]/10 flex items-center justify-center mx-auto mb-6">
              <Leaf className="w-8 h-8 text-[#9CF06B]" />
            </div>
            <h2 className="font-display text-3xl sm:text-4xl text-white mb-4">
              Ready to turn your organic waste into value?
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto mb-8">
              Book a free waste assessment and discover how much value your organic waste can generate.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                className="bg-[#9CF06B] text-[#0E2A1C] font-display font-bold px-8 py-3 rounded-full text-sm shadow-lg flex items-center gap-2"
              >
                Schedule Free Assessment <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                className="border-2 border-white/20 text-white font-display font-bold px-8 py-3 rounded-full text-sm flex items-center gap-2"
              >
                <Phone className="w-4 h-4" /> Call an Expert
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}