import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  Building2,
  Hotel,
  Factory,
  ShoppingBag,
  Hospital,
  School,
  Landmark,
  Recycle,
  Zap,
  Leaf,
  Users,
  Award,
  Star,
  MapPin,
  CheckCircle,
  TrendingUp,
  Globe,
  Handshake,
  Truck,
  Package,
  Phone,
  Mail,
  Calendar,
  ChevronRight,
  Heart
} from "lucide-react";

export default function PartnersPage() {
  const [activeTab, setActiveTab] = useState("all");

  const partnerCategories = [
    { id: "all", name: "All Partners" },
    { id: "waste-producers", name: "Waste Producers" },
    { id: "recyclers", name: "Recyclers & Processors" },
    { id: "energy", name: "Energy Companies" },
    { id: "logistics", name: "Logistics Partners" },
  ];

  const partners = [
    {
      id: 1,
      name: "Nairobi Serena Hotel",
      category: "waste-producers",
      type: "Hotel",
      description: "Premium hotel chain diverting food waste to biogas production.",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400",
      logo: "🏨",
      location: "Nairobi, Kenya",
      since: "2021",
      wasteType: "Food Waste",
      impact: "2,400 tons diverted",
      verified: true,
      rating: 4.9
    },
    {
      id: 2,
      name: "Kenya Power",
      category: "energy",
      type: "Energy Company",
      description: "National utility company purchasing renewable energy from waste.",
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400",
      logo: "⚡",
      location: "Nairobi, Kenya",
      since: "2020",
      wasteType: "Multiple Streams",
      impact: "45 MW capacity",
      verified: true,
      rating: 4.8
    },
    {
      id: 3,
      name: "Green Valley Farms",
      category: "waste-producers",
      type: "Farm",
      description: "Agricultural waste supplier for biogas and fertilizer production.",
      image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400",
      logo: "🌾",
      location: "Nakuru, Kenya",
      since: "2022",
      wasteType: "Crop Residue",
      impact: "8,500 tons processed",
      verified: true,
      rating: 4.7
    },
    {
      id: 4,
      name: "Eco Recycling Ltd",
      category: "recyclers",
      type: "Recycler",
      description: "Plastic recycling facility processing PET and HDPE waste.",
      image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400",
      logo: "♻️",
      location: "Mombasa, Kenya",
      since: "2021",
      wasteType: "Plastic",
      impact: "5,200 tons recycled",
      verified: true,
      rating: 4.9
    },
    {
      id: 5,
      name: "City Market",
      category: "waste-producers",
      type: "Market",
      description: "Major fresh produce market supplying organic waste.",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400",
      logo: "🛒",
      location: "Nairobi, Kenya",
      since: "2020",
      wasteType: "Organic Waste",
      impact: "3,600 tons diverted",
      verified: true,
      rating: 4.6
    },
    {
      id: 6,
      name: "Kibera Biogas Plant",
      category: "energy",
      type: "Biogas Producer",
      description: "Community biogas facility processing urban organic waste.",
      image: "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=400",
      logo: "🔥",
      location: "Nairobi, Kenya",
      since: "2019",
      wasteType: "Organic Waste",
      impact: "2.4 MW generated",
      verified: true,
      rating: 4.8
    },
    {
      id: 7,
      name: "Thika Textile Mills",
      category: "waste-producers",
      type: "Factory",
      description: "Textile manufacturer with industrial waste recovery program.",
      image: "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=400",
      logo: "🏭",
      location: "Thika, Kenya",
      since: "2022",
      wasteType: "Textile Waste",
      impact: "1,800 tons recycled",
      verified: true,
      rating: 4.5
    },
    {
      id: 8,
      name: "Kisumu Waste Solutions",
      category: "recyclers",
      type: "Waste Management",
      description: "Integrated waste management and recycling facility.",
      image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400",
      logo: "🗑️",
      location: "Kisumu, Kenya",
      since: "2021",
      wasteType: "Mixed Waste",
      impact: "12,000 tons processed",
      verified: true,
      rating: 4.7
    }
  ];

  const filteredPartners = activeTab === "all" 
    ? partners 
    : partners.filter(p => p.category === activeTab);

  const stats = [
    { value: "1,200+", label: "Active Partners", icon: Users, color: "green" },
    { value: "47", label: "Counties Served", icon: MapPin, color: "blue" },
    { value: "125K+", label: "Tons Processed", icon: Package, color: "emerald" },
    { value: "98%", label: "Partner Satisfaction", icon: Star, color: "yellow" },
  ];

  const benefits = [
    {
      icon: TrendingUp,
      title: "Revenue Growth",
      description: "Turn waste disposal costs into new revenue streams."
    },
    {
      icon: Leaf,
      title: "Environmental Impact",
      description: "Reduce carbon footprint and achieve sustainability goals."
    },
    {
      icon: Users,
      title: "Network Access",
      description: "Connect with vetted buyers and sellers across the ecosystem."
    },
    {
      icon: Award,
      title: "Certification",
      description: "Receive verified impact certificates and ESG reporting."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F6F8F4] font-['Inter'] overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono-cw { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      {/* HERO SECTION - NO BACKGROUND */}
      <section className="relative py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full mb-6">
              <Handshake className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700 font-mono-cw">OUR NETWORK</span>
            </div>
            <h1 className="font-display text-4xl lg:text-5xl xl:text-6xl font-bold text-[#0E2A1C] mb-4 leading-tight">
              Join the Circular Economy
              <br />
              <span className="text-[#11402D]">Partner Ecosystem</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
              Connect with 1,200+ verified partners across Kenya — from waste producers
              to recyclers and energy companies. Turn waste into value together.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button className="px-7 py-3.5 rounded-full bg-[#11402D] text-white font-semibold hover:bg-[#0E2A1C] transition flex items-center gap-2">
                Become a Partner <ArrowRight className="w-4 h-4" />
              </button>
              <button className="px-7 py-3.5 rounded-full border border-gray-300 text-gray-700 font-semibold hover:border-green-600 hover:text-green-600 transition">
                View Partner Directory
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
                <div className={`w-10 h-10 rounded-xl bg-${stat.color}-100 flex items-center justify-center mx-auto mb-3`}>
                  <Icon className={`w-5 h-5 text-${stat.color}-600`} />
                </div>
                <div className="font-display text-2xl font-bold text-[#0E2A1C]">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Partner Categories Tabs */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
        <div className="flex flex-wrap gap-3 mb-8 border-b border-gray-200 pb-4">
          {partnerCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeTab === cat.id
                  ? "bg-[#11402D] text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Partners Grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPartners.map((partner) => (
            <div
              key={partner.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={partner.image}
                  alt={partner.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <div className="text-2xl">{partner.logo}</div>
                </div>
                {partner.verified && (
                  <div className="absolute top-3 right-3 bg-green-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Verified
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-display font-semibold text-lg text-[#0E2A1C]">{partner.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{partner.rating}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <MapPin className="w-3 h-3" />
                  <span>{partner.location}</span>
                  <span className="text-gray-300">•</span>
                  <span>Partner since {partner.since}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{partner.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{partner.type}</span>
                  <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full">{partner.wasteType}</span>
                </div>
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-green-600">{partner.impact}</span>
                  <button className="text-green-600 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                    Connect <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white py-20 mt-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full mb-4">
              <Award className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700">WHY PARTNER WITH US</span>
            </div>
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-[#0E2A1C] mb-4">
              Benefits of Joining ReVive Energy
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Become part of Kenya's leading circular economy network
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div key={idx} className="bg-[#F6F8F4] rounded-2xl p-6 text-center hover:shadow-md transition">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-lg text-[#0E2A1C] mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-500">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#0E2A1C] rounded-3xl p-8 text-white">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-6">
                <Quote className="w-6 h-6 text-[#9CF06B]" />
              </div>
              <p className="text-lg leading-relaxed mb-6">
                "Partnering with ReVive Energy transformed our waste management. We've reduced landfill costs by 60% and created a new revenue stream from our food waste."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="font-bold">JD</span>
                </div>
                <div>
                  <p className="font-semibold">John Doe</p>
                  <p className="text-sm text-white/50">Facility Manager, Nairobi Serena Hotel</p>
                </div>
              </div>
            </div>
            <div className="bg-[#11402D] rounded-3xl p-8 text-white">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-6">
                <Quote className="w-6 h-6 text-[#9CF06B]" />
              </div>
              <p className="text-lg leading-relaxed mb-6">
                "The platform gave us access to consistent, high-quality organic waste feedstock for our biogas plant. It's been a game-changer for our operations."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="font-bold">SM</span>
                </div>
                <div>
                  <p className="font-semibold">Sarah Mwangi</p>
                  <p className="text-sm text-white/50">Operations Director, Kibera Biogas Plant</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
        <div className="rounded-3xl bg-[#0E2A1C] px-8 sm:px-16 py-14 lg:py-20 text-center">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white max-w-2xl mx-auto leading-tight">
            Ready to Join the Network?
          </h2>
          <p className="mt-5 text-white/70 text-lg max-w-lg mx-auto">
            Become part of Kenya's leading circular economy platform and turn waste into value.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <button className="px-8 py-3.5 rounded-full bg-white text-[#0E2A1C] font-semibold hover:bg-gray-100 transition flex items-center gap-2">
              Become a Partner <ArrowRight className="w-4 h-4" />
            </button>
            <button className="px-8 py-3.5 rounded-full border border-white/30 text-white font-semibold hover:bg-white/10 transition">
              Contact Partnerships
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

// Quote icon component
function Quote(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 2 0 .5 1 0 2-2 2 0 4 0 6z" />
      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1.5 0 .5 1 0 2-2 2 0 4 0 6z" />
    </svg>
  );
}