import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import {
  ArrowRight,
  Handshake,
  Leaf,
  Shield,
  Users,
  Mail,
  Phone,
  Building2,
  MapPin,
  CheckCircle,
  Award,
  Globe,
  Send,
  Star,
  Clock,
  TrendingUp,
  Truck,
  Recycle,
  Factory,
  Landmark,
  School,
  HeartHandshake,
  ChevronDown,
  Quote,
} from "lucide-react";

// ─── Import local hero image ──────────────────────────────────
import heroImage from "../assets/hero.png";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function PartnersPage() {
  const [formData, setFormData] = useState({
    organizationName: "",
    contactName: "",
    email: "",
    phone: "",
    organizationType: "",
    wasteTypes: [],
    message: "",
    agreeTerms: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const organizationTypes = [
    "Waste Producer (Hotel, Restaurant, Farm, Market)",
    "Recycling / Processing Company",
    "Energy Producer (Biogas, Waste-to-Energy)",
    "Logistics / Transport Company",
    "Government / County Agency",
    "NGO / Non-Profit",
    "Research / Academic Institution",
    "Investor / Funder",
    "Other",
  ];

  const wasteTypeOptions = [
    "Food Waste",
    "Agricultural Waste",
    "Plastic Waste",
    "Paper & Cardboard",
    "Organic Waste",
    "Industrial Waste",
    "E-Waste",
    "Textile Waste",
    "Construction Waste",
  ];

  const benefits = [
    {
      icon: <TrendingUp className="w-6 h-6 text-[#9CF06B]" />,
      title: "Revenue Growth",
      desc: "Turn waste into new revenue streams through our circular economy marketplace.",
    },
    {
      icon: <Shield className="w-6 h-6 text-[#9CF06B]" />,
      title: "Verified Trust",
      desc: "All partners are vetted and escrow payments ensure secure transactions.",
    },
    {
      icon: <Leaf className="w-6 h-6 text-[#9CF06B]" />,
      title: "Environmental Impact",
      desc: "Track and report your carbon savings with our transparent impact dashboard.",
    },
    {
      icon: <Users className="w-6 h-6 text-[#9CF06B]" />,
      title: "Network Access",
      desc: "Connect with 1,200+ partners across the entire waste-to-value chain.",
    },
  ];

  const steps = [
    { icon: <Handshake className="w-6 h-6" />, title: "Apply", desc: "Submit your partnership application with your organization details." },
    { icon: <Shield className="w-6 h-6" />, title: "Verify", desc: "Our team reviews and verifies your credentials within 2 days." },
    { icon: <Globe className="w-6 h-6" />, title: "Connect", desc: "Get access to the platform, listings, and partner network." },
    { icon: <Award className="w-6 h-6" />, title: "Grow", desc: "Start transacting, tracking impact, and scaling your operations." },
  ];

  const partnerTypes = [
    { icon: <Building2 className="w-8 h-8" />, title: "Waste Producers", desc: "Hotels, farms, restaurants, and markets" },
    { icon: <Recycle className="w-8 h-8" />, title: "Recyclers", desc: "Plastic, paper, organic, and e‑waste processors" },
    { icon: <Factory className="w-8 h-8" />, title: "Energy Producers", desc: "Biogas, waste‑to‑energy, and biofuel plants" },
    { icon: <Truck className="w-8 h-8" />, title: "Logistics", desc: "Transport and collection services" },
    { icon: <Landmark className="w-8 h-8" />, title: "Government", desc: "County agencies and regulatory bodies" },
    { icon: <School className="w-8 h-8" />, title: "Research", desc: "Academic and innovation institutions" },
  ];

  const testimonials = [
    {
      quote: "ReVive Energy has transformed our waste management. We now turn food waste into biogas, saving 40% on energy costs.",
      name: "Grace Mwangi",
      title: "Operations Director, Green Valley Farms",
    },
    {
      quote: "The partnership platform connected us with reliable organic waste suppliers, boosting our recycling capacity by 200%.",
      name: "James Ochieng",
      title: "CEO, EcoCycle Ltd",
    },
    {
      quote: "As a county government, we've streamlined waste collection and created new green jobs through the ReVive network.",
      name: "Dr. Susan Kiprop",
      title: "County Environment Executive, Kisumu",
    },
  ];

  const faqs = [
    {
      q: "Who can become a partner?",
      a: "Any organization involved in waste production, recycling, energy generation, logistics, research, or policy – from SMEs to large enterprises and government agencies.",
    },
    {
      q: "How long does the verification process take?",
      a: "We review applications within 2 business days. Once verified, you gain immediate access to the platform and partner network.",
    },
    {
      q: "What types of waste are accepted?",
      a: "We cover a wide range including food, agricultural, plastic, paper, organic, industrial, e‑waste, textile, and construction waste.",
    },
    {
      q: "Is there a fee to join?",
      a: "Joining the platform is free. Transaction fees apply only when you successfully complete deals through our escrow system.",
    },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleWasteTypeToggle = (type) => {
    setFormData((prev) => ({
      ...prev,
      wasteTypes: prev.wasteTypes.includes(type)
        ? prev.wasteTypes.filter((t) => t !== type)
        : [...prev.wasteTypes, type],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/contact/partnership`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Submission failed");
      }

      setSubmitSuccess(true);
      setFormData({
        organizationName: "",
        contactName: "",
        email: "",
        phone: "",
        organizationType: "",
        wasteTypes: [],
        message: "",
        agreeTerms: false,
      });
      setTimeout(() => setSubmitSuccess(false), 6000);
    } catch (error) {
      console.error("Partnership form error:", error);
      alert(error.message || "There was an error submitting your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  // Scroll-to-section helper
  const scrollToForm = () => {
    document.getElementById("partner-form").scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#F6F8F4] font-['Inter'] flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono-cw { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0E2A1C] via-[#11402D] to-[#0E2A1C] pt-8 pb-16 lg:pt-12 lg:pb-24">
        {/* Animated blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#9CF06B]/10 blur-3xl animate-pulse" />
          <div className="absolute bottom-[-30%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#9CF06B]/5 blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10 mb-6">
                <Handshake className="w-4 h-4 text-[#9CF06B]" />
                <span className="text-sm font-semibold text-white font-mono-cw">PARTNER WITH US</span>
              </div>

              <h1 className="font-display text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-4">
                Turn Waste into <br />
                <span className="text-[#9CF06B]">Shared Value</span>
              </h1>

              <p className="text-lg text-white/70 max-w-xl leading-relaxed mb-8">
                Join Kenya's leading circular economy platform. Connect with verified
                partners across the waste-to-energy value chain — from producers to
                recyclers, energy companies, and logistics providers.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={scrollToForm}
                  className="px-8 py-4 rounded-full bg-[#9CF06B] text-[#0E2A1C] font-semibold hover:bg-[#86D45E] transition flex items-center gap-2 shadow-lg shadow-[#9CF06B]/20"
                >
                  Apply Now <ArrowRight className="w-4 h-4" />
                </button>
                <button className="px-8 py-4 rounded-full border border-white/30 text-white font-semibold hover:bg-white/10 transition">
                  Learn More
                </button>
              </div>

              <div className="mt-10 flex flex-wrap gap-6">
                <div className="flex items-center gap-2 text-white/80">
                  <CheckCircle className="w-5 h-5 text-[#9CF06B]" />
                  <span className="text-sm">Verified partners</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Shield className="w-5 h-5 text-[#9CF06B]" />
                  <span className="text-sm">Secure escrow payments</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Leaf className="w-5 h-5 text-[#9CF06B]" />
                  <span className="text-sm">Impact reporting</span>
                </div>
              </div>
            </motion.div>

            {/* Right Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 40 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:flex relative justify-center"
            >
              <div className="relative">
                <div className="absolute -inset-4 rounded-full bg-[#9CF06B]/20 blur-3xl" />
                <div className="relative rounded-[40%_60%_55%_45%/45%_40%_60%_55%] overflow-hidden shadow-2xl border-4 border-white/20">
                  <img
                    src={heroImage}
                    alt="Partnership illustration"
                    className="h-[400px] lg:h-[450px] w-full object-cover"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── STATS ────────────────────────────────────────────────── */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: "Partners", value: "1,200+", icon: <Users className="w-6 h-6 text-[#11402D]" /> },
              { label: "Waste Diverted (tons)", value: "500K+", icon: <Recycle className="w-6 h-6 text-[#11402D]" /> },
              { label: "Energy Produced (MWh)", value: "45K+", icon: <Factory className="w-6 h-6 text-[#11402D]" /> },
              { label: "Jobs Created", value: "2,300+", icon: <Award className="w-6 h-6 text-[#11402D]" /> },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center"
              >
                <div className="mb-2">{stat.icon}</div>
                <div className="font-display text-2xl lg:text-3xl font-bold text-[#0E2A1C]">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BENEFITS ─────────────────────────────────────────────── */}
      <section className="py-16 lg:py-24 bg-[#F6F8F4]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-[#0E2A1C] mb-3">
              Why Partner With Us
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Unlock new revenue streams, reduce environmental impact, and join a
              growing community of changemakers.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition"
              >
                <div className="w-12 h-12 rounded-full bg-[#11402D]/10 flex items-center justify-center mb-4">
                  {benefit.icon}
                </div>
                <h3 className="font-display text-lg font-semibold text-[#0E2A1C] mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ────────────────────────────────────────── */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-[#0E2A1C] mb-3">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From application to impact – join our ecosystem in four simple steps.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="relative flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-full bg-[#11402D] text-white flex items-center justify-center text-xl font-display font-bold mb-4 relative">
                  {step.icon}
                  {idx < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 left-full w-full h-0.5 bg-[#11402D]/20 -translate-y-1/2" />
                  )}
                </div>
                <h3 className="font-display text-lg font-semibold text-[#0E2A1C] mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PARTNER TYPES ────────────────────────────────────────── */}
      <section className="py-16 lg:py-24 bg-[#F6F8F4]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-[#0E2A1C] mb-3">
              Who Can Partner?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We work with organizations across the entire circular economy spectrum.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {partnerTypes.map((type, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-[#11402D] transition group cursor-pointer"
              >
                <div className="text-[#11402D] group-hover:text-[#9CF06B] transition mb-4">
                  {type.icon}
                </div>
                <h3 className="font-display text-lg font-semibold text-[#0E2A1C] mb-1">
                  {type.title}
                </h3>
                <p className="text-sm text-gray-500">{type.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ────────────────────────────────────────── */}
      <section className="py-16 lg:py-24 bg-[#0E2A1C] text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-3">
              What Our Partners Say
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Real stories from organizations transforming waste into value.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition"
              >
                <Quote className="w-8 h-8 text-[#9CF06B] opacity-50 mb-4" />
                <p className="text-sm leading-relaxed mb-4 text-white/80">"{t.quote}"</p>
                <div>
                  <p className="font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-white/50">{t.title}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PARTNERSHIP FORM ────────────────────────────────────── */}
      <section id="partner-form" className="py-16 lg:py-24 bg-[#F6F8F4]">
        <div className="max-w-4xl mx-auto px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 lg:p-12"
          >
            <div className="text-center mb-8">
              <h2 className="font-display text-3xl lg:text-4xl font-bold text-[#0E2A1C] mb-3">
                Start Your Partnership Journey
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Complete the form below and our partnerships team will reach out within 2 business days.
              </p>
            </div>

            {submitSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center"
              >
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="font-display text-2xl font-bold text-green-800">Application Received!</h3>
                <p className="text-green-600 mt-2 max-w-sm mx-auto">
                  Thank you for your interest. We'll review your application and get back to you shortly.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#0E2A1C] mb-1.5">
                      Organization Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="organizationName"
                      value={formData.organizationName}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Green Valley Farms"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#11402D] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0E2A1C] mb-1.5">
                      Contact Person <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleChange}
                      required
                      placeholder="Full name"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#11402D] transition"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#0E2A1C] mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="you@organization.com"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#11402D] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0E2A1C] mb-1.5">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="+254 712 345 678"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#11402D] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0E2A1C] mb-1.5">
                    Organization Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="organizationType"
                    value={formData.organizationType}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#11402D] transition bg-white"
                  >
                    <option value="">Select your organization type</option>
                    {organizationTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0E2A1C] mb-2">
                    Waste Types (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {wasteTypeOptions.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleWasteTypeToggle(type)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition border ${
                          formData.wasteTypes.includes(type)
                            ? "bg-[#11402D] text-white border-[#11402D]"
                            : "bg-white text-gray-700 border-gray-200 hover:border-[#11402D] hover:text-[#11402D]"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0E2A1C] mb-1.5">
                    Message / Additional Details
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Tell us about your organization, your goals, and how you'd like to partner with us."
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#11402D] transition resize-y"
                  />
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    required
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-[#11402D] focus:ring-[#11402D]"
                  />
                  <label className="text-sm text-gray-600">
                    I agree to the{" "}
                    <a href="/terms" className="text-[#11402D] hover:underline" target="_blank">
                      Terms & Conditions
                    </a>{" "}
                    and{" "}
                    <a href="/privacy" className="text-[#11402D] hover:underline" target="_blank">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl bg-[#11402D] text-white font-bold hover:bg-[#0E2A1C] transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Handshake className="w-5 h-5" />
                      Submit Partnership Application
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-gray-400 mt-4">
                  We'll get back to you within 2 business days. Your information is secure and will not be shared.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-[#0E2A1C] mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600">Everything you need to know about partnering with us.</p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                viewport={{ once: true }}
                className="border border-gray-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-gray-50 transition"
                >
                  <span className="font-semibold text-[#0E2A1C]">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#11402D] transition-transform ${
                      activeFaq === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {activeFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="px-5 pb-5 text-sm text-gray-600 leading-relaxed"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ───────────────────────────────────────────── */}
      <section className="py-16 lg:py-24 bg-[#0E2A1C] text-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              Ready to Make an Impact?
            </h2>
            <p className="text-white/60 max-w-xl mx-auto mb-8">
              Join Kenya's fastest-growing circular economy network. Start turning waste into value today.
            </p>
            <button
              onClick={scrollToForm}
              className="px-10 py-4 rounded-full bg-[#9CF06B] text-[#0E2A1C] font-bold hover:bg-[#86D45E] transition inline-flex items-center gap-2 shadow-lg shadow-[#9CF06B]/20"
            >
              Apply Now <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER (unchanged but kept) ────────────────────────── */}
      <footer className="bg-[#0E2A1C] text-white pt-16 pb-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#9CF06B]/15 flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-[#9CF06B]" />
                </div>
                <span className="font-display text-xl font-semibold">ReVive Energy</span>
              </div>
              <p className="text-white/50 text-sm leading-relaxed max-w-sm">
                Turning waste into clean energy and value for communities across Kenya.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-display font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2.5 text-sm text-white/50">
                <li><a href="/dashboard" className="hover:text-[#9CF06B] transition-colors">Dashboard</a></li>
                <li><a href="/marketplace" className="hover:text-[#9CF06B] transition-colors">Marketplace</a></li>
                <li><a href="/partners" className="hover:text-[#9CF06B] transition-colors">Partners</a></li>
                <li><a href="/support" className="hover:text-[#9CF06B] transition-colors">Support</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-display font-semibold mb-4">Contact</h3>
              <ul className="space-y-2.5 text-sm text-white/50">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#9CF06B]" />
                  <a href="mailto:partnerships@revive-energy.com" className="hover:text-[#9CF06B] transition-colors">
                    partnerships@revive-energy.com
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#9CF06B]" />
                  <a href="tel:+254700000000" className="hover:text-[#9CF06B] transition-colors">
                    +254 700 000 000
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#9CF06B]" />
                  <span>Nairobi, Kenya</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-white/40 text-center sm:text-left">
            <span>© 2026 ReVive Energy. All rights reserved.</span>
            <div className="flex flex-wrap justify-center gap-5">
              <a href="/privacy" className="hover:text-[#9CF06B] transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-[#9CF06B] transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}