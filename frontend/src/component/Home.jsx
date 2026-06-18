import React from "react";
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
} from "lucide-react";
import { motion } from "framer-motion";

export default function ReViveEnergyHomepage() {
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
    {
      value: "2.4M",
      label: "tonnes diverted from landfill every year",
    },
    {
      value: "850 GWh",
      label: "clean energy generated annually",
    },
    {
      value: "92%",
      label: "average waste diversion rate",
    },
    {
      value: "41",
      label: "active facilities worldwide",
    },
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

  const route = [
    { x: 10, y: 50, name: "Household Pickup", icon: "🏠" },
    { x: 30, y: 30, name: "Recycling companies", icon: "🏢" },
    { x: 60, y: 70, name: "Community Center", icon: "🏛️" },
    { x: 85, y: 40, name: "Recycling Plant", icon: "♻️" }
  ];

  // Marquee items data
  const marqueeItems = [
    { icon: "🗑️", label: "Organic Waste" },
    { icon: "🌾", label: "Agricultural Waste" },
    { icon: "♻️", label: "Plastic Waste" },
    { icon: "🏭", label: "Industrial Waste" },
    { icon: "🪵", label: "Biomass Waste" },
  ];

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

      {/* HERO - moved up significantly with minimal top padding */}
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
              <button className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#11402D] text-white font-semibold text-sm sm:text-[15px] hover:bg-[#0C2F20] transition-colors flex items-center justify-center gap-2 shadow-[0_8px_24px_-8px_rgba(17,64,45,0.5)]">
                Explore Our Facilities
                <ArrowRight className="w-4 h-4" />
              </button>

              <button className="w-full sm:w-auto px-7 py-3.5 rounded-full border border-[#142019]/15 font-semibold text-sm sm:text-[15px] hover:border-[#11402D]/40 hover:bg-white transition-colors">
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
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ IMPACT STATS ============ */}
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

      {/* ============ MARQUEE SECTION ============ */}
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
            {/* Gradient overlays for smooth edges */}
            <div className="absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-[#F6F8F4] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-[#F6F8F4] to-transparent z-10 pointer-events-none" />

            {/* Marquee Track */}
            <div className="marquee-track flex items-center gap-6">
              {/* First set of items */}
              {marqueeItems.map((item, index) => (
                <React.Fragment key={`first-${index}`}>
                  <div className="flex-shrink-0 bg-white rounded-2xl p-6 w-48 sm:w-56 shadow-sm hover:shadow-md transition-shadow duration-300 border border-[#11402D]/5">
                    <div className="text-5xl sm:text-6xl text-center mb-3">
                      {item.icon}
                    </div>
                    <p className="font-display font-semibold text-sm sm:text-base text-[#0E2A1C] text-center">
                      {item.label}
                    </p>
                  </div>
                  {/* Separator Dot */}
                  {index < marqueeItems.length - 1 && (
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#11402D]/30" />
                  )}
                </React.Fragment>
              ))}

              {/* Duplicate set for seamless loop */}
              {marqueeItems.map((item, index) => (
                <React.Fragment key={`second-${index}`}>
                  <div className="flex-shrink-0 bg-white rounded-2xl p-6 w-48 sm:w-56 shadow-sm hover:shadow-md transition-shadow duration-300 border border-[#11402D]/5">
                    <div className="text-5xl sm:text-6xl text-center mb-3">
                      {item.icon}
                    </div>
                    <p className="font-display font-semibold text-sm sm:text-base text-[#0E2A1C] text-center">
                      {item.label}
                    </p>
                  </div>
                  {index < marqueeItems.length - 1 && (
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#11402D]/30" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ PROCESS - The ReVive Route ============ */}
      <section
        id="process"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-12 lg:py-16"
      >
        {/* Section Header */}
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

        {/* Process Steps - 4 columns */}
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

        {/* Large Live Route Tracking Card - Using Framer Motion */}
        <div className="w-full bg-white rounded-3xl shadow-2xl border border-[#142019]/10 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-[#0E2A1C] to-[#11402D] px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-[#9CF06B]" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-xl text-white">
                    Live Route Tracking
                  </h3>
                  <p className="text-xs text-white/50">Real-time waste collection monitoring</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                <span className="text-xs text-white/70">Active Route</span>
              </div>
            </div>
          </div>

          {/* Map Area - Using Framer Motion for truck animation */}
          <div className="relative w-full h-[500px] bg-gradient-to-br from-green-50 to-white overflow-hidden">
            {/* Background Map Pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#10b981" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" />
              </svg>
            </div>

            {/* Route Points */}
            {route.map((point, index) => (
              <motion.div
                key={point.name}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                style={{ left: `${point.x}%`, top: `${point.y}%` }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div className="relative">
                  <motion.div
                    className="w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center text-2xl border-4 border-[#11402D]"
                    whileHover={{ scale: 1.1 }}
                    animate={{ 
                      boxShadow: [
                        "0 10px 30px -10px rgba(17, 64, 45, 0.3)",
                        "0 20px 40px -10px rgba(17, 64, 45, 0.5)",
                        "0 10px 30px -10px rgba(17, 64, 45, 0.3)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className="text-2xl">{point.icon}</span>
                  </motion.div>
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-[#11402D] whitespace-nowrap">
                    {point.name}
                  </div>
                  <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-[10px] text-gray-500 whitespace-nowrap">
                    {index === 0 ? "2.4 tons collected" : index === 1 ? "Sorting in progress" : index === 2 ? "Collection hub" : "Processing facility"}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Route Line - SVG with animated dash */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <motion.path
                d="M 10 50 Q 20 40 30 30 Q 45 50 60 70 Q 72 55 85 40"
                stroke="#11402D"
                strokeWidth="0.8"
                fill="none"
                strokeDasharray="2,2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 3, ease: "easeInOut" }}
              />
              <motion.path
                d="M 10 50 Q 20 40 30 30 Q 45 50 60 70 Q 72 55 85 40"
                stroke="#9CF06B"
                strokeWidth="0.5"
                fill="none"
                strokeDasharray="3,3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 3, ease: "easeInOut", delay: 0.5 }}
              />
            </svg>

            {/* Animated Truck using Framer Motion */}
            <motion.div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
              animate={{
                left: ["10%", "30%", "60%", "85%"],
                top: ["50%", "30%", "70%", "40%"]
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <motion.div
                className="relative"
                animate={{ rotate: [0, -5, 5, -3, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                {/* Truck SVG */}
                <div className="bg-white shadow-xl rounded-full p-2 border-2 border-[#9CF06B]">
                  <Truck className="w-8 h-8 text-[#11402D]" />
                </div>
                
                {/* Exhaust Animation */}
                <motion.div
                  className="absolute -left-2 top-1"
                  animate={{ opacity: [0.2, 0.6, 0.2], scale: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                >
                  <div className="w-2 h-2 bg-gray-400 rounded-full opacity-50"></div>
                </motion.div>
                
                {/* Trail effect */}
                <motion.div
                  className="absolute -top-1 -left-1 w-10 h-10 rounded-full bg-[#9CF06B]/20"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </motion.div>
            </motion.div>

            {/* Live dots at route points */}
            {route.map((point, index) => (
              <motion.div
                key={`dot-${index}`}
                className="absolute h-2 w-2 rounded-full bg-[#9CF06B] z-10"
                style={{ left: `${point.x}%`, top: `${point.y}%` }}
                animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.3 }}
              />
            ))}
          </div>

          {/* Bottom Status Bar */}
          <div className="bg-white border-t border-[#142019]/10 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#0E2A1C]">
                Live Collection Status
              </p>
              <p className="text-xs text-gray-500">
                Truck moving along optimized route • ETA to processing: 24 minutes
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                <span className="text-xs text-gray-600">Collected</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#9CF06B] animate-pulse"></span>
                <span className="text-xs text-gray-600">In Transit</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                <span className="text-xs text-gray-600">Processing</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                <span className="text-xs text-gray-600">Completed</span>
              </div>
            </div>
          </div>
        </div>
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

          <button className="flex items-center gap-2 font-semibold text-[#11402D] group">
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

      {/* TESTIMONIAL */}
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
            <button className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white text-[#0E2A1C] font-semibold text-sm sm:text-[15px] hover:bg-[#F5F4F0] transition-colors flex items-center justify-center gap-2">
              Schedule a Consultation
              <ArrowRight className="w-4 h-4" />
            </button>

            <button className="w-full sm:w-auto px-7 py-3.5 rounded-full border border-white/30 text-white font-semibold text-sm sm:text-[15px] hover:bg-white/10 transition-colors">
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