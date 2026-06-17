import React, { useState, useEffect } from "react";
import {
  Leaf,
  Zap,
  TrendingUp,
  Award,
  BarChart3,
  Globe,
  Users,
  Package,
  Truck,
  Factory,
  Recycle,
  CheckCircle,
  ArrowRight,
  Calendar,
  MapPin,
  Download,
  Share2,
  Heart,
  Clock,
  Flame,
  Droplets,
  Shield,
  Target,
  Eye,
  FileText,
  ChevronRight,
  Sparkles,
  Infinity,
  Wind,
  Sun,
  Droplet,
  TreePine,
  Building2,
  Home,
  Briefcase,
  GraduationCap,
  HandHeart,
  ThumbsUp,
  Play,
  Star,
  Quote
} from "lucide-react";

export default function ImpactPage() {
  const [animatedStats, setAnimatedStats] = useState({
    wasteDiverted: 0,
    energyGenerated: 0,
    co2Reduced: 0,
    partners: 0,
    treesPlanted: 0,
    jobsCreated: 0,
    householdsPowered: 0,
    waterSaved: 0
  });

  const stats = [
    { 
      id: "wasteDiverted", 
      value: 125000, 
      label: "Tons of Waste Diverted", 
      suffix: "+", 
      icon: Recycle,
      subtext: "Equivalent to 8,000 garbage trucks",
      color: "green",
      gradient: "from-green-500 to-emerald-500"
    },
    { 
      id: "energyGenerated", 
      value: 85000, 
      label: "MWh Clean Energy Generated", 
      suffix: "+", 
      icon: Zap,
      subtext: "Powering 25,000 homes annually",
      color: "yellow",
      gradient: "from-yellow-500 to-amber-500"
    },
    { 
      id: "co2Reduced", 
      value: 60000, 
      label: "Tons CO₂ Reduced", 
      suffix: "+", 
      icon: Leaf,
      subtext: "Equivalent to planting 1M trees",
      color: "emerald",
      gradient: "from-emerald-500 to-teal-500"
    },
    { 
      id: "partners", 
      value: 1200, 
      label: "Active Partners", 
      suffix: "+", 
      icon: Users,
      subtext: "Across 47 counties",
      color: "blue",
      gradient: "from-blue-500 to-cyan-500"
    },
    { 
      id: "treesPlanted", 
      value: 50000, 
      label: "Trees Planted", 
      suffix: "+", 
      icon: TreePine,
      subtext: "Through carbon offset programs",
      color: "teal",
      gradient: "from-teal-500 to-green-500"
    },
    { 
      id: "jobsCreated", 
      value: 350, 
      label: "Green Jobs Created", 
      suffix: "+", 
      icon: Briefcase,
      subtext: "Local employment opportunities",
      color: "purple",
      gradient: "from-purple-500 to-indigo-500"
    },
    { 
      id: "householdsPowered", 
      value: 25000, 
      label: "Households Powered", 
      suffix: "+", 
      icon: Home,
      subtext: "Clean energy for families",
      color: "orange",
      gradient: "from-orange-500 to-red-500"
    },
    { 
      id: "waterSaved", 
      value: 1800000, 
      label: "Liters of Water Saved", 
      suffix: "K+", 
      icon: Droplet,
      subtext: "In recycling processes",
      color: "cyan",
      gradient: "from-cyan-500 to-blue-500"
    }
  ];

  useEffect(() => {
    const animateValue = (start, end, duration, setter) => {
      let startTimestamp = null;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        let current = Math.floor(progress * (end - start) + start);
        setter(current);
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          setter(end);
        }
      };
      window.requestAnimationFrame(step);
    };

    animateValue(0, 125000, 2000, (val) => 
      setAnimatedStats(prev => ({ ...prev, wasteDiverted: val }))
    );
    animateValue(0, 85000, 2000, (val) => 
      setAnimatedStats(prev => ({ ...prev, energyGenerated: val }))
    );
    animateValue(0, 60000, 2000, (val) => 
      setAnimatedStats(prev => ({ ...prev, co2Reduced: val }))
    );
    animateValue(0, 1200, 2000, (val) => 
      setAnimatedStats(prev => ({ ...prev, partners: val }))
    );
    animateValue(0, 50000, 2000, (val) => 
      setAnimatedStats(prev => ({ ...prev, treesPlanted: val }))
    );
    animateValue(0, 350, 2000, (val) => 
      setAnimatedStats(prev => ({ ...prev, jobsCreated: val }))
    );
    animateValue(0, 25000, 2000, (val) => 
      setAnimatedStats(prev => ({ ...prev, householdsPowered: val }))
    );
    animateValue(0, 1800, 2000, (val) => 
      setAnimatedStats(prev => ({ ...prev, waterSaved: val }))
    );
  }, []);

  const liveMetrics = [
    { label: "Current Processing Rate", value: "12.5 tons/hr", icon: Package, trend: "+8%" },
    { label: "Active Collections", value: "47", icon: Truck, trend: "+3" },
    { label: "Energy Output Today", value: "284 MWh", icon: Zap, trend: "+12%" },
    { label: "CO₂ Saved Today", value: "164 tons", icon: Leaf, trend: "+5%" }
  ];

  const impactAreas = [
    {
      title: "Environmental Restoration",
      icon: TreePine,
      color: "green",
      gradient: "from-green-500 to-emerald-500",
      stats: [
        { label: "Landfill Space Saved", value: "850,000 m³", change: "+12%" },
        { label: "Water Pollution Reduced", value: "92%", change: "+5%" },
        { label: "Methane Emissions Avoided", value: "45,000 tons", change: "+18%" },
        { label: "Biodiversity Protected", value: "15,000 acres", change: "+7%" }
      ]
    },
    {
      title: "Economic Empowerment",
      icon: TrendingUp,
      color: "blue",
      gradient: "from-blue-500 to-cyan-500",
      stats: [
        { label: "Value Created", value: "KES 320M+", change: "+22%" },
        { label: "Cost Savings", value: "KES 180M+", change: "+15%" },
        { label: "Revenue Generated", value: "KES 95M+", change: "+28%" },
        { label: "Local Investment", value: "KES 50M+", change: "+10%" }
      ]
    },
    {
      title: "Social Development",
      icon: HandHeart,
      color: "purple",
      gradient: "from-purple-500 to-pink-500",
      stats: [
        { label: "Households Benefited", value: "25,000+", change: "+30%" },
        { label: "Communities Served", value: "127", change: "+12" },
        { label: "Training Programs", value: "48", change: "+6" },
        { label: "Women Empowered", value: "180+", change: "+15%" }
      ]
    }
  ];

  const testimonials = [
    {
      quote: "ReVive Energy has transformed how we handle waste. Our landfill costs dropped by 60% and we're now powering our facility with renewable energy.",
      author: "James Mwangi",
      role: "Facility Manager, Nairobi Serena Hotel",
      rating: 5,
      image: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      quote: "The carbon tracking dashboard helped us achieve our ESG targets six months early. Excellent platform with real impact data.",
      author: "Dr. Sarah Wanjiku",
      role: "Sustainability Director, GreenGrid Co.",
      rating: 5,
      image: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      quote: "Working with ReVive Energy opened new revenue streams from our agricultural waste. Best decision we made for our farm.",
      author: "Peter Ochieng",
      role: "Owner, Green Valley Farms",
      rating: 5,
      image: "https://randomuser.me/api/portraits/men/67.jpg"
    }
  ];

  const sdgGoals = [
    { goal: "SDG 7", title: "Affordable & Clean Energy", icon: Zap, progress: 85, description: "Expanding clean energy access" },
    { goal: "SDG 9", title: "Industry & Innovation", icon: Factory, progress: 78, description: "Sustainable infrastructure" },
    { goal: "SDG 11", title: "Sustainable Cities", icon: Building2, progress: 82, description: "Urban waste management" },
    { goal: "SDG 12", title: "Responsible Consumption", icon: Recycle, progress: 88, description: "Circular economy" },
    { goal: "SDG 13", title: "Climate Action", icon: Leaf, progress: 75, description: "Emission reduction" },
    { goal: "SDG 17", title: "Partnerships", icon: HandHeart, progress: 80, description: "Global collaboration" }
  ];

  const certifications = [
    { name: "ISO 14001", issuer: "Environmental Management", icon: Shield },
    { name: "Certified B Corp", issuer: "Social & Environmental Impact", icon: Award },
    { name: "Gold Standard", issuer: "Carbon Credits", icon: Leaf },
    { name: "UN Global Compact", issuer: "Sustainable Development", icon: Globe }
  ];

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-[#F6F8F4] text-[#142019] font-['Inter'] overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

      {/* Hero Section with Particle Effect */}
      <section className="relative bg-gradient-to-br from-[#0E2A1C] via-[#11402D] to-[#1a5c3e] text-white py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1920')] bg-cover bg-center" />
        </div>
        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-[#9CF06B] rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                opacity: 0.3 + Math.random() * 0.5
              }}
            />
          ))}
        </div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-[#9CF06B]" />
              <span className="text-sm font-semibold font-mono-cw">REAL-TIME IMPACT METRICS</span>
            </div>
            <h1 className="font-display text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight">
              Creating Measurable
              <br />
              <span className="text-[#9CF06B]">Environmental & Social Impact</span>
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Every ton of waste processed contributes to a cleaner environment,
              economic growth, and sustainable communities across Kenya.
            </p>
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center">
            <div className="w-1 h-2 bg-white/50 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Live Metrics Bar */}
      <section className="bg-white border-b border-gray-100 py-4 sticky top-20 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {liveMetrics.map((metric, idx) => {
              const Icon = metric.icon;
              return (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-mono-cw">{metric.label}</div>
                    <div className="font-display font-semibold text-[#0E2A1C]">{metric.value}</div>
                    <div className="text-[10px] text-green-600">{metric.trend}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Grid - 8 cards */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            const animatedValue = animatedStats[stat.id];
            const displayValue = stat.id === "waterSaved" 
              ? (animatedValue / 1000).toFixed(1) + "K"
              : formatNumber(animatedValue);
            return (
              <div
                key={idx}
                className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.gradient} opacity-5 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500`} />
                <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <div className="font-display text-3xl font-bold text-[#0E2A1C]">
                  {displayValue}
                  {stat.suffix}
                </div>
                <div className="text-sm font-medium text-gray-700 mt-2">{stat.label}</div>
                <div className="text-[11px] text-gray-400 mt-1">{stat.subtext}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Impact Areas - Enhanced */}
      <section className="bg-gradient-to-b from-white to-gray-50 py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full mb-4">
              <Target className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700">OUR IMPACT FRAMEWORK</span>
            </div>
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-[#0E2A1C] mb-4">
              Triple Bottom Line Impact
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our work creates value across environmental, economic, and social dimensions
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {impactAreas.map((area, idx) => {
              const Icon = area.icon;
              return (
                <div key={idx} className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${area.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-[#0E2A1C] mb-5">{area.title}</h3>
                  <div className="space-y-3">
                    {area.stats.map((stat, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-gray-600">{stat.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-green-600">{stat.value}</span>
                          <span className="text-[10px] text-green-500">{stat.change}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SDG Contribution - Enhanced */}
      <section className="bg-[#0E2A1C] text-white py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-4">
              <Globe className="w-4 h-4 text-[#9CF06B]" />
              <span className="text-sm font-semibold">UN SUSTAINABLE DEVELOPMENT GOALS</span>
            </div>
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              Contributing to Global Goals
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Our work directly supports multiple UN Sustainable Development Goals
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sdgGoals.map((goal, idx) => {
              const Icon = goal.icon;
              return (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#9CF06B]/20 flex items-center justify-center group-hover:scale-110 transition">
                      <Icon className="w-6 h-6 text-[#9CF06B]" />
                    </div>
                    <span className="text-xs font-mono-cw text-white/40">{goal.goal}</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{goal.title}</h3>
                  <p className="text-sm text-white/50 mb-4">{goal.description}</p>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/50">Progress</span>
                      <span className="text-[#9CF06B]">{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-[#9CF06B] h-2 rounded-full transition-all duration-1000" style={{ width: `${goal.progress}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl lg:text-3xl font-bold text-[#0E2A1C] mb-2">
              Certified Excellence
            </h2>
            <p className="text-gray-600">Recognized for our commitment to sustainability and impact</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {certifications.map((cert, idx) => {
              const Icon = cert.icon;
              return (
                <div key={idx} className="text-center group">
                  <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-3 group-hover:bg-green-200 transition">
                    <Icon className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-[#0E2A1C] text-sm">{cert.name}</h3>
                  <p className="text-xs text-gray-500">{cert.issuer}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#F6F8F4] py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full mb-4">
              <Quote className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700">PARTNER TESTIMONIALS</span>
            </div>
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-[#0E2A1C] mb-4">
              What Our Partners Say
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Real stories from businesses making a difference
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-2 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm italic mb-4 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="font-semibold text-green-600 text-sm">{testimonial.author.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#0E2A1C] text-sm">{testimonial.author}</h4>
                    <p className="text-xs text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 text-center">
          <div className="bg-gradient-to-r from-[#0E2A1C] to-[#11402D] rounded-3xl p-10 lg:p-16 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#9CF06B]/10" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-[#9CF06B]/10" />
            <div className="relative">
              <div className="w-20 h-20 mx-auto bg-[#9CF06B]/20 rounded-full flex items-center justify-center mb-6">
                <FileText className="w-10 h-10 text-[#9CF06B]" />
              </div>
              <h2 className="font-display text-3xl lg:text-4xl font-bold text-white mb-4">
                Ready to Make an Impact?
              </h2>
              <p className="text-white/70 mb-8 max-w-md mx-auto">
                Join our network of partners and start turning waste into value today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-3 bg-[#9CF06B] text-[#0E2A1C] font-semibold rounded-full hover:bg-[#8ae05a] transition-all hover:scale-105 flex items-center justify-center gap-2">
                  Get Started <ArrowRight className="w-4 h-4" />
                </button>
                <button className="px-8 py-3 border border-white/30 text-white font-semibold rounded-full hover:bg-white/10 transition-all hover:scale-105 flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Download Impact Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}