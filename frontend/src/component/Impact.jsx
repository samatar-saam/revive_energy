import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Leaf,
  Zap,
  Globe,
  Award,
  Recycle,
  Truck,
  Users,
  BarChart3,
  ArrowRight,
  ChevronRight,
  Droplets,
  TreePine,
  Factory,
  Sparkles,
} from "lucide-react";

const Impact = () => {
  // ─── Impact Data ──────────────────────────────────────────────
  const impactStats = [
    {
      value: "2.4M",
      label: "tonnes diverted from landfill every year",
      icon: Recycle,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      value: "850 GWh",
      label: "clean energy generated annually",
      icon: Zap,
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      value: "92%",
      label: "average waste diversion rate",
      icon: Droplets,
      color: "bg-blue-50 text-blue-600",
    },
    {
      value: "41",
      label: "active facilities worldwide",
      icon: Globe,
      color: "bg-purple-50 text-purple-600",
    },
    {
      value: "1,200+",
      label: "active partners",
      icon: Users,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      value: "125K+",
      label: "tons of CO₂ offset",
      icon: Leaf,
      color: "bg-green-50 text-green-600",
    },
  ];

  // ─── Impact Categories ─────────────────────────────────────────
  const categories = [
    {
      title: "Waste Diversion",
      description: "We keep millions of tonnes of waste out of landfills every year, reducing methane emissions and pollution.",
      icon: Recycle,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Clean Energy Generation",
      description: "Our facilities convert waste into biogas, electricity, and heat – powering homes and businesses.",
      icon: Zap,
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Carbon Reduction",
      description: "By replacing fossil fuels and capturing methane, we’re actively reducing greenhouse gas emissions.",
      icon: Leaf,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Community Impact",
      description: "We create jobs, support local economies, and provide clean energy solutions to underserved areas.",
      icon: Users,
      color: "bg-blue-50 text-blue-600",
    },
  ];

  // ─── Milestones ────────────────────────────────────────────────
  const milestones = [
    { year: "2026", event: "First facility commissioned in Nairobi, Kenya" },
    { year: "2026", event: "Expanded to 12 facilities across East Africa" },
    { year: "2026", event: "Reached 500,000 tonnes of waste processed" },
    { year: "2026", event: "Launched ReVive Energy platform connecting 800+ partners" },
    { year: "2026", event: "1 million tonnes diverted – milestone achieved" },
  ];

  // ─── Benefits ──────────────────────────────────────────────────
  const benefits = [
    {
      icon: TreePine,
      title: "Reduced Landfill Waste",
      description: "Every tonne of waste processed is one less tonne in a landfill.",
    },
    {
      icon: Factory,
      title: "Lower Emissions",
      description: "Our processes are cleaner than traditional waste disposal methods.",
    },
    {
      icon: Sparkles,
      title: "Renewable Energy",
      description: "Clean, reliable power produced from waste that would otherwise go to waste.",
    },
    {
      icon: Award,
      title: "Certified Impact",
      description: "Our operations are independently verified and certified for sustainability.",
    },
  ];

  // ─── Chart Data ────────────────────────────────────────────────
  const chartData = [
    { year: "2020", diverted: 150, energy: 50 },
    { year: "2021", diverted: 320, energy: 120 },
    { year: "2022", diverted: 580, energy: 220 },
    { year: "2023", diverted: 820, energy: 380 },
    { year: "2024", diverted: 1200, energy: 560 },
  ];

  // ─── Animation variants ───────────────────────────────────────
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Inter'] text-[#0A1A0F]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono-cw { font-family: 'JetBrains Mono', monospace; }
        .shadow-soft { box-shadow: 0 2px 15px -3px rgba(0,0,0,0.05), 0 1px 4px -2px rgba(0,0,0,0.02); }
        .shadow-card { box-shadow: 0 4px 20px -6px rgba(0,0,0,0.06), 0 2px 8px -4px rgba(0,0,0,0.02); }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-16">
        {/* ─── Hero Section ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#11402D]/10 text-[#11402D] text-sm font-semibold">
            <Leaf className="w-4 h-4" />
            Our Impact
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0A1A0F] tracking-tight">
            Turning Waste Into <span className="text-[#11402D]">Change</span>
          </h1>
          <p className="text-[#5A7060] max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Every tonne of waste we process creates clean energy, reduces emissions, and builds a more sustainable future.
            Here’s how we’re making a difference.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#11402D] text-white font-bold hover:bg-[#0E2A1C] transition shadow-lg shadow-[#11402D]/20"
            >
              Join Us <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/solutions"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#E5EDE8] bg-white text-[#0A1A0F] font-medium hover:bg-[#F6F8F4] transition shadow-soft"
            >
              Explore Solutions
            </Link>
          </div>
        </motion.div>

        {/* ─── Impact Stats ──────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {impactStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="bg-white rounded-2xl border border-[#E5EDE8] p-4 shadow-soft text-center hover:shadow-card transition-all duration-300"
              >
                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mx-auto mb-2`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="font-display text-2xl font-bold text-[#0A1A0F]">{stat.value}</p>
                <p className="text-xs text-[#5A7060] mt-1 leading-tight">{stat.label}</p>
              </motion.div>
            );
          })}
        </motion.section>

        {/* ─── Impact Categories ────────────────────────────────── */}
        <motion.section
          initial="initial"
          animate="animate"
          variants={{
            animate: { transition: { staggerChildren: 0.1 } },
          }}
          className="space-y-6"
        >
          <div className="text-center">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0A1A0F]">
              Our Four Pillars of Impact
            </h2>
            <p className="text-[#5A7060] max-w-xl mx-auto mt-2">
              We focus on waste diversion, clean energy, carbon reduction, and community development.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="bg-white rounded-2xl border border-[#E5EDE8] p-6 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 rounded-2xl ${category.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-[#0A1A0F]">{category.title}</h3>
                  <p className="text-sm text-[#5A7060] mt-2 leading-relaxed">{category.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* ─── Chart Section ─────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-3xl border border-[#E5EDE8] p-6 sm:p-8 shadow-card"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-display text-2xl font-bold text-[#0A1A0F]">Our Growth</h3>
              <p className="text-sm text-[#5A7060]">Waste diverted (in thousands of tonnes) vs. Clean energy generated (in GWh)</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#11402D]" /> Waste Diverted
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#9CF06B]" /> Energy Generated
              </span>
            </div>
          </div>
          <div className="w-full h-64 relative">
            <div className="absolute inset-0 flex items-center justify-center text-[#5A7060]">
              <BarChart3 className="w-8 h-8 mr-2" />
              <span className="text-sm font-medium">Interactive chart coming soon</span>
            </div>
            {/* ─── You can replace the placeholder with a real chart using recharts ─── */}
            <div className="flex items-end h-full gap-4 px-4">
              {chartData.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-lg bg-[#9CF06B] transition-all duration-500"
                      style={{ height: `${(item.energy / 600) * 100}%`, minHeight: '8px' }}
                    />
                    <div
                      className="w-full rounded-t-lg bg-[#11402D] transition-all duration-500"
                      style={{ height: `${(item.diverted / 1400) * 100}%`, minHeight: '8px' }}
                    />
                  </div>
                  <span className="text-xs text-[#5A7060] mt-2">{item.year}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ─── Benefits / Why It Matters ────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="space-y-6"
        >
          <div className="text-center">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0A1A0F]">
              Why Impact Matters
            </h2>
            <p className="text-[#5A7060] max-w-xl mx-auto mt-2">
              Our work goes beyond numbers – it’s about building a cleaner, healthier planet.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white rounded-2xl border border-[#E5EDE8] p-6 shadow-soft text-center hover:shadow-card transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-full bg-[#9CF06B]/20 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-5 h-5 text-[#11402D]" />
                  </div>
                  <h3 className="font-display font-bold text-[#0A1A0F]">{benefit.title}</h3>
                  <p className="text-sm text-[#5A7060] mt-2 leading-relaxed">{benefit.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* ─── Milestones / Timeline ────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-white rounded-3xl border border-[#E5EDE8] p-6 sm:p-8 shadow-card"
        >
          <h3 className="font-display text-2xl font-bold text-[#0A1A0F] text-center mb-6">Our Journey</h3>
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-[#11402D]/20" />
            <div className="space-y-6">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-start gap-6">
                  <div className="relative z-10">
                    <div className="w-10 h-10 rounded-full bg-[#11402D] flex items-center justify-center text-white font-bold text-xs">
                      {milestone.year.slice(2)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-display font-bold text-lg text-[#0A1A0F]">{milestone.year}</span>
                      <span className="text-sm text-[#5A7060]">{milestone.event}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ─── CTA Section ────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0E2A1C] to-[#11402D] p-8 sm:p-12 text-white shadow-2xl border border-white/10"
        >
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ background: '#9CF06B0A' }} />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-2xl pointer-events-none" style={{ background: '#11402D40' }} />

          <div className="relative max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-semibold border border-white/10">
              <Globe className="w-4 h-4" />
              Make a Difference
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Join the <span className="text-[#9CF06B]">Movement</span> for a Cleaner World
            </h2>
            <p className="text-white/70 text-base sm:text-lg max-w-lg mx-auto">
              Every partner, every tonne, every watt makes a difference. Start your journey with ReVive Energy today.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#9CF06B] text-[#0A1A0F] font-bold text-sm sm:text-base hover:bg-[#8CE05A] transition-all shadow-lg shadow-[#9CF06B]/30"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/30 text-white font-semibold text-sm sm:text-base hover:bg-white/10 transition-all"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </motion.section>
      </div>
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
};

export default Impact;