// src/admin/pages/Impact.jsx
import React, { useState, useEffect } from "react";
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
  Droplets,
  TreePine,
  Factory,
  Sparkles,
  MapPin,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// ─── Register Chart.js components ──────────────────────────────
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ─── Africa Map Component (SVG-based) ─────────────────────────
const AfricaMap = ({ countries }) => {
  const [mapData, setMapData] = useState(null);
  const [loadingMap, setLoadingMap] = useState(true);

  useEffect(() => {
    const fetchMap = async () => {
      try {
        const res = await fetch(
          "https://raw.githubusercontent.com/geohacker/africa/master/africa.geojson"
        );
        const json = await res.json();
        setMapData(json);
      } catch (err) {
        console.error("Map fetch error:", err);
      } finally {
        setLoadingMap(false);
      }
    };
    fetchMap();
  }, []);

  return (
    <div className="relative w-full h-full bg-[#F6F8F4] rounded-2xl overflow-hidden">
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/8/86/Africa_%28orthographic_projection%29.svg"
        alt="Africa map"
        className="w-full h-full object-contain opacity-50"
      />
      {countries.map(({ name, lat, lng, count }) => {
        // Rough projection – adjust if needed
        const x = ((lng + 20) / 50) * 100;
        const y = ((lat - 35) / -40) * 100;
        const radius = Math.min(30, Math.max(6, 6 + count / 50));
        const isKenya = name === "Kenya";

        return (
          <div
            key={name}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            {/* ─── Kenya gets a bright green glow + pulse ─── */}
            {isKenya && (
              <div
                className="absolute rounded-full border-2 border-[#9CF06B] animate-ping"
                style={{
                  width: radius * 3,
                  height: radius * 3,
                  opacity: 0.3,
                }}
              />
            )}
            <div
              className={`rounded-full border-2 border-white shadow-lg transition-all hover:scale-125 cursor-pointer ${
                isKenya ? "bg-[#9CF06B] shadow-[0_0_20px_rgba(156,240,107,0.6)]" : "bg-[#11402D]"
              }`}
              style={{
                width: radius,
                height: radius,
                opacity: isKenya ? 1 : 0.3 + Math.min(0.6, count / 100),
              }}
            />
            <span
              className={`text-[10px] font-bold mt-1 whitespace-nowrap px-1.5 py-0.5 rounded ${
                isKenya
                  ? "text-[#11402D] bg-[#9CF06B]"
                  : "text-[#0A1A0F] bg-white/80"
              }`}
            >
              {name} ({count})
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────
const Impact = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [impactData, setImpactData] = useState({
    stats: {
      totalUsers: 0,
      totalWasteDiverted: 0,
      totalEnergyGenerated: 0,
      totalCarbonOffset: 0,
      activeFacilities: 0,
      activePartners: 0,
    },
    chartData: [],
  });

  // ─── Fetch real data from backend ─────────────────────────────
  useEffect(() => {
    const fetchImpactData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/admin/impact/data`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch impact data");
        const data = await res.json();
        setImpactData(data);
      } catch (err) {
        console.error("Impact fetch error:", err);
        setError(err.message);
        // ─── Fallback: hardcoded data ──────────────────────────
        setImpactData({
          stats: {
            totalUsers: 1200,
            totalWasteDiverted: 2400000,
            totalEnergyGenerated: 850000,
            totalCarbonOffset: 125000,
            activeFacilities: 41,
            activePartners: 1200,
          },
          chartData: [
            { month: "Jan 2026", users: 50, waste: 150, energy: 50 },
            { month: "Feb 2026", users: 80, waste: 220, energy: 80 },
            { month: "Mar 2026", users: 120, waste: 320, energy: 120 },
            { month: "Apr 2026", users: 180, waste: 450, energy: 180 },
            { month: "May 2026", users: 250, waste: 580, energy: 220 },
            { month: "Jun 2026", users: 320, waste: 680, energy: 280 },
            { month: "Jul 2026", users: 400, waste: 820, energy: 380 },
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchImpactData();
  }, []);

  // ─── Simulate active countries ──────────────────────────────
  const activeCountries = [
    { name: "Kenya", lat: -1.2921, lng: 36.8219, count: 360 },
    { name: "Nigeria", lat: 9.082, lng: 8.6753, count: 300 },
    { name: "South Africa", lat: -30.5595, lng: 22.9375, count: 240 },
    { name: "Ghana", lat: 7.9465, lng: -1.0232, count: 120 },
    { name: "Tanzania", lat: -6.369, lng: 34.8888, count: 96 },
    { name: "Uganda", lat: 1.3733, lng: 32.2903, count: 60 },
    { name: "Ethiopia", lat: 9.145, lng: 40.4897, count: 24 },
  ];

  // ─── Prepare chart data ──────────────────────────────────────
  const chartLabels = impactData.chartData.map((item) => item.month);
  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "New Users",
        data: impactData.chartData.map((item) => item.users),
        backgroundColor: "#11402D",
        borderRadius: 4,
      },
      {
        label: "Waste (tonnes)",
        data: impactData.chartData.map((item) => item.waste),
        backgroundColor: "#9CF06B",
        borderRadius: 4,
      },
      {
        label: "Energy (GWh)",
        data: impactData.chartData.map((item) => item.energy),
        backgroundColor: "#F59E0B",
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          boxWidth: 12,
          padding: 12,
          font: { size: 11 },
        },
      },
      tooltip: {
        backgroundColor: "white",
        titleColor: "#0A1A0F",
        bodyColor: "#0A1A0F",
        borderColor: "#E5EDE8",
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 9 } },
      },
      y: {
        grid: { color: "#f0f0f0" },
        ticks: { font: { size: 9 } },
      },
    },
  };

  // ─── Build impact stats ──────────────────────────────────────
  const { stats } = impactData;

  const impactStats = [
    {
      value: stats.totalWasteDiverted ? (stats.totalWasteDiverted / 1000000).toFixed(1) + "M" : "0",
      label: "tonnes diverted from landfill every year",
      icon: Recycle,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      value: stats.totalEnergyGenerated ? (stats.totalEnergyGenerated / 1000).toFixed(1) + " GWh" : "0 GWh",
      label: "clean energy generated annually",
      icon: Zap,
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      value: stats.totalWasteDiverted && stats.totalWasteDiverted > 0 ? "92%" : "N/A",
      label: "average waste diversion rate",
      icon: Droplets,
      color: "bg-blue-50 text-blue-600",
    },
    {
      value: stats.activeFacilities || "0",
      label: "active facilities worldwide",
      icon: Globe,
      color: "bg-purple-50 text-purple-600",
    },
    {
      value: stats.activePartners || "0",
      label: "active partners",
      icon: Users,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      value: stats.totalCarbonOffset ? (stats.totalCarbonOffset / 1000).toFixed(1) + "K+" : "0",
      label: "tons of CO₂ offset",
      icon: Leaf,
      color: "bg-green-50 text-green-600",
    },
  ];

  // ─── Impact Categories ──────────────────────────────────────
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

  // ─── Milestones ──────────────────────────────────────────────
  const milestones = [
    { year: "2026", event: "First facility commissioned in Nairobi, Kenya" },
    { year: "2026", event: "Expanded to 12 facilities across East Africa" },
    { year: "2026", event: "Reached 500,000 tonnes of waste processed" },
    { year: "2026", event: "Launched ReVive Energy platform connecting 800+ partners" },
    { year: "2026", event: "1 million tonnes diverted – milestone achieved" },
  ];

  // ─── Benefits ────────────────────────────────────────────────
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

  // ─── Animation variants ─────────────────────────────────────
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#11402D] border-t-[#9CF06B] rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500 font-display">Loading impact data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Inter'] text-[#0A1A0F]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .shadow-soft { box-shadow: 0 2px 15px -3px rgba(0,0,0,0.05), 0 1px 4px -2px rgba(0,0,0,0.02); }
        .shadow-card { box-shadow: 0 4px 20px -6px rgba(0,0,0,0.06), 0 2px 8px -4px rgba(0,0,0,0.02); }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 space-y-12 sm:space-y-16">
        {/* ─── Hero ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-3 sm:space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#11402D]/10 text-[#11402D] text-sm font-semibold">
            <Leaf className="w-4 h-4" />
            Our Impact
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#0A1A0F] tracking-tight">
            Turning Waste Into <span className="text-[#11402D]">Change</span>
          </h1>
          <p className="text-[#5A7060] max-w-2xl mx-auto text-sm sm:text-base lg:text-lg leading-relaxed px-4 sm:px-0">
            Every tonne of waste we process creates clean energy, reduces emissions, and builds a more sustainable future.
            Here's how we're making a difference.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#11402D] text-white font-bold text-sm hover:bg-[#0E2A1C] transition shadow-lg shadow-[#11402D]/20"
            >
              Join Us <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/solutions"
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full border border-[#E5EDE8] bg-white text-[#0A1A0F] font-medium text-sm hover:bg-[#F6F8F4] transition shadow-soft"
            >
              Explore Solutions
            </Link>
          </div>
        </motion.div>

        {/* ─── Impact Stats ────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4"
        >
          {impactStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="bg-white rounded-xl sm:rounded-2xl border border-[#E5EDE8] p-3 sm:p-4 shadow-soft text-center hover:shadow-card transition-all duration-300"
              >
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl ${stat.color} flex items-center justify-center mx-auto mb-1.5 sm:mb-2`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <p className="font-display text-base sm:text-2xl font-bold text-[#0A1A0F]">{stat.value}</p>
                <p className="text-[10px] sm:text-xs text-[#5A7060] mt-0.5 sm:mt-1 leading-tight">{stat.label}</p>
              </motion.div>
            );
          })}
        </motion.section>

        {/* ─── African Map Section ────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-2xl sm:rounded-3xl border border-[#E5EDE8] p-4 sm:p-6 lg:p-8 shadow-card"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-[#0A1A0F] flex items-center gap-2">
                <MapPin className="w-6 h-6 text-[#11402D]" />
                Active Partners Across Africa
              </h3>
              <p className="text-xs sm:text-sm text-[#5A7060]">
                Showing active partners by country (size reflects partner count)
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#5A7060]">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#11402D] opacity-30" /> 10+
              </span>
              <span className="flex items-center gap-1">
                <span className="w-5 h-5 rounded-full bg-[#11402D] opacity-50" /> 50+
              </span>
              <span className="flex items-center gap-1">
                <span className="w-7 h-7 rounded-full bg-[#11402D] opacity-80" /> 100+
              </span>
            </div>
          </div>

          <div className="w-full h-[400px] sm:h-[500px] relative">
            <AfricaMap countries={activeCountries} />
          </div>
          <div className="mt-3 text-center text-[10px] sm:text-xs text-[#5A7060]">
            🌍 Data reflects active partners on the ReVive Energy platform
          </div>
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
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0A1A0F]">
              Our Four Pillars of Impact
            </h2>
            <p className="text-[#5A7060] max-w-xl mx-auto mt-2 text-sm sm:text-base">
              We focus on waste diversion, clean energy, carbon reduction, and community development.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="bg-white rounded-xl sm:rounded-2xl border border-[#E5EDE8] p-5 sm:p-6 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl ${category.color} flex items-center justify-center mb-3 sm:mb-4`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h3 className="font-display font-bold text-base sm:text-lg text-[#0A1A0F]">{category.title}</h3>
                  <p className="text-sm text-[#5A7060] mt-2 leading-relaxed">{category.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* ─── Chart Section ──────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-2xl sm:rounded-3xl border border-[#E5EDE8] p-4 sm:p-6 lg:p-8 shadow-card"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-[#0A1A0F]">Our Growth</h3>
              <p className="text-xs sm:text-sm text-[#5A7060]">Monthly new users, waste diverted (tonnes), and energy generated (GWh)</p>
            </div>
          </div>

          <div className="h-[250px] sm:h-[300px]">
            <Bar data={chartData} options={chartOptions} />
          </div>
          <div className="mt-3 sm:mt-4 text-center text-[10px] sm:text-xs text-[#5A7060]">
            📊 Data updated in real-time from the platform
          </div>
        </motion.section>

        {/* ─── Benefits ────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="space-y-6"
        >
          <div className="text-center">
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0A1A0F]">
              Why Impact Matters
            </h2>
            <p className="text-[#5A7060] max-w-xl mx-auto mt-2 text-sm sm:text-base">
              Our work goes beyond numbers – it's about building a cleaner, healthier planet.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white rounded-xl sm:rounded-2xl border border-[#E5EDE8] p-5 sm:p-6 shadow-soft text-center hover:shadow-card transition-all duration-300"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#9CF06B]/20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#11402D]" />
                  </div>
                  <h3 className="font-display font-bold text-base sm:text-lg text-[#0A1A0F]">{benefit.title}</h3>
                  <p className="text-sm text-[#5A7060] mt-2 leading-relaxed">{benefit.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* ─── Milestones ────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-white rounded-2xl sm:rounded-3xl border border-[#E5EDE8] p-5 sm:p-6 lg:p-8 shadow-card"
        >
          <h3 className="font-display text-xl sm:text-2xl font-bold text-[#0A1A0F] text-center mb-6">Our Journey</h3>
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-[#11402D]/20" />
            <div className="space-y-5 sm:space-y-6">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-start gap-4 sm:gap-6">
                  <div className="relative z-10">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#11402D] flex items-center justify-center text-white font-bold text-[10px] sm:text-xs">
                      {milestone.year.slice(2)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="font-display font-bold text-base sm:text-lg text-[#0A1A0F]">{milestone.year}</span>
                      <span className="text-sm text-[#5A7060]">{milestone.event}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ─── CTA ────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#0E2A1C] to-[#11402D] p-6 sm:p-8 lg:p-12 text-white shadow-2xl border border-white/10"
        >
          <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 rounded-full blur-3xl pointer-events-none" style={{ background: '#9CF06B0A' }} />
          <div className="absolute bottom-0 left-0 w-36 sm:w-48 h-36 sm:h-48 rounded-full blur-2xl pointer-events-none" style={{ background: '#11402D40' }} />

          <div className="relative max-w-3xl mx-auto text-center space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/10 text-white text-xs sm:text-sm font-semibold border border-white/10">
              <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Make a Difference
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight">
              Join the <span className="text-[#9CF06B]">Movement</span> for a Cleaner World
            </h2>
            <p className="text-white/70 text-sm sm:text-base lg:text-lg max-w-lg mx-auto">
              Every partner, every tonne, every watt makes a difference. Start your journey with ReVive Energy today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2 sm:pt-4">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-4 rounded-full bg-[#9CF06B] text-[#0A1A0F] font-bold text-sm sm:text-base hover:bg-[#8CE05A] transition-all shadow-lg shadow-[#9CF06B]/30"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-4 rounded-full border border-white/30 text-white font-semibold text-sm sm:text-base hover:bg-white/10 transition-all"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </motion.section>
      </div>

      <footer className="bg-[#0E2A1C] text-white pt-12 sm:pt-14 lg:pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 pb-10 sm:pb-12 border-b border-white/10">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#9CF06B]/15 flex items-center justify-center">
                  <Recycle className="w-5 h-5 text-[#9CF06B]" />
                </div>
                <span className="font-display text-xl font-semibold">ReVive Energy</span>
              </div>
              <p className="text-white/50 text-sm leading-relaxed max-w-sm">
                Designing and operating waste-to-energy infrastructure that turns disposal problems into clean energy opportunities.
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
                      <a href="#" className="hover:text-[#9CF06B] transition-colors">{link}</a>
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