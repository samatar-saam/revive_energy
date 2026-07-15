import React, { useState } from "react";
import { motion } from "framer-motion";
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
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      console.error("Partnership form error:", error);
      alert(error.message || "There was an error submitting your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8F4] font-['Inter'] flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono-cw { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      {/* ─── HERO SECTION ─── MOVED HIGHER ────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0E2A1C] via-[#11402D] to-[#0E2A1C] pt-0 lg:pt-0 pb-6 lg:pb-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
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
                  onClick={() => document.getElementById("partner-form").scrollIntoView({ behavior: "smooth" })}
                  className="px-7 py-3.5 rounded-full bg-[#9CF06B] text-[#0E2A1C] font-semibold hover:bg-[#86D45E] transition flex items-center gap-2 shadow-lg"
                >
                  Apply Now <ArrowRight className="w-4 h-4" />
                </button>
                <button className="px-7 py-3.5 rounded-full border border-white/30 text-white font-semibold hover:bg-white/10 transition">
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

            {/* Right Image with Blob Shape */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 50 }}
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

      {/* ─── PARTNERSHIP FORM ────────────────────────────────────── */}
      <section id="partner-form" className="max-w-4xl mx-auto px-6 lg:px-10 py-16 lg:py-24 flex-1">
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 lg:p-12">
          <div className="text-center mb-8">
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-[#0E2A1C] mb-3">
              Partner With Us
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Complete the form below and our partnerships team will reach out within 2 business days.
            </p>
          </div>

          {submitSuccess ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="font-display text-xl font-bold text-green-800">Application Received!</h3>
              <p className="text-green-600 mt-2">
                Thank you for your interest. We'll review your application and get back to you shortly.
              </p>
            </div>
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
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500 transition"
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
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500 transition"
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
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500 transition"
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
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500 transition"
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
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500 transition bg-white"
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
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500 transition resize-y"
                />
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  required
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-[#11402D] focus:ring-green-500"
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
                className="w-full py-3.5 rounded-xl bg-[#11402D] text-white font-bold hover:bg-[#0E2A1C] transition disabled:opacity-60 flex items-center justify-center gap-2"
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
        </div>
      </section>

      {/* ─── TRUST INDICATORS ────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 lg:px-10 pb-16">
        <div className="bg-[#F4FBF6] rounded-2xl p-6 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#11402D]" />
            <span>100% secure</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#11402D]" />
            <span>1,200+ partners</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#11402D]" />
            <span>Fast response</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#11402D]" />
            <span>Verified impact</span>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ────────────────────────────────────────────────── */}
      <footer className="bg-[#0E2A1C] text-white pt-16 pb-8">
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