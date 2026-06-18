// SignupEnergyProducer.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Recycle,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  Phone,
  Building2,
  MapPin,
  Zap,
  Factory,
  ShieldCheck,
  Headphones,
  Leaf,
  Users,
  Globe,
  CheckCircle,
  Award,
  Building,
  Package,
  Calendar,
  Clock,
  Star,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Check,
  X,
  Plus,
  Minus,
  Home,
  Briefcase,
  Landmark,
  TreePine,
  Droplets,
  Flame,
  ShoppingBag,
  Coffee,
  Apple,
  Wind,
  Sun,
  Battery,
  Gauge
} from "lucide-react";

const USERS_API = "http://localhost:5000/users";

export default function SignupEnergyProducer() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    companyName: "",
    companyType: "",
    email: "",
    phone: "",
    location: "",
    address: "",
    energyTypes: [],
    capacity: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedEnergyTypes, setSelectedEnergyTypes] = useState([]);

  const companyTypes = [
    { id: "biogas-plant", label: "Biogas Plant", icon: Flame, color: "#F59E0B" },
    { id: "recycling-company", label: "Recycling Company", icon: Recycle, color: "#818CF8" },
    { id: "biomass-company", label: "Biomass Company", icon: TreePine, color: "#34D399" },
    { id: "wte-plant", label: "Waste-to-Energy Plant", icon: Zap, color: "#FB923C" },
    { id: "composting", label: "Composting Facility", icon: Leaf, color: "#34D399" },
    { id: "biofuel", label: "Biofuel Producer", icon: Droplets, color: "#F97316" },
  ];

  const energyTypeOptions = [
    { id: "biogas", label: "Biogas Production", icon: Flame, color: "#F59E0B" },
    { id: "electricity", label: "Electricity Generation", icon: Zap, color: "#60A5FA" },
    { id: "fertilizer", label: "Organic Fertilizer", icon: Leaf, color: "#34D399" },
    { id: "biochar", label: "Biochar Production", icon: TreePine, color: "#8B5CF6" },
    { id: "biomass-fuel", label: "Biomass Fuel", icon: Droplets, color: "#F97316" },
    { id: "recycling", label: "Plastic Recycling", icon: Recycle, color: "#818CF8" },
    { id: "compost", label: "Composting", icon: Leaf, color: "#34D399" },
    { id: "wte", label: "Waste-to-Energy", icon: Zap, color: "#FB923C" },
  ];

  const capacityOptions = [
    "1-10 tonnes/day",
    "11-50 tonnes/day",
    "51-100 tonnes/day",
    "101-500 tonnes/day",
    "500+ tonnes/day"
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const toggleEnergyType = (typeId) => {
    setSelectedEnergyTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
    setFormData(prev => ({
      ...prev,
      energyTypes: selectedEnergyTypes.includes(typeId)
        ? selectedEnergyTypes.filter(id => id !== typeId)
        : [...selectedEnergyTypes, typeId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.companyName.trim()) {
      toast.error("Please enter your company name");
      return;
    }

    if (!formData.companyType) {
      toast.error("Please select your company type");
      return;
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (selectedEnergyTypes.length === 0) {
      toast.error("Please select at least one energy type");
      return;
    }

    if (!formData.agreeTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    try {
      setIsSubmitting(true);

      // Check if user exists
      const checkResponse = await fetch(USERS_API);
      const existingUsers = await checkResponse.json();
      
      const userExists = existingUsers.some(
        user => user.email?.toLowerCase() === formData.email.toLowerCase()
      );

      if (userExists) {
        toast.error("Email already exists. Please login instead.");
        setIsSubmitting(false);
        return;
      }

      const newUser = {
        id: Date.now().toString(),
        companyName: formData.companyName,
        companyType: formData.companyType,
        email: formData.email.toLowerCase(),
        phone: formData.phone || "",
        location: formData.location || "",
        address: formData.address || "",
        energyTypes: selectedEnergyTypes,
        capacity: formData.capacity || "",
        role: "energy-producer",
        status: "active",
        createdAt: new Date().toISOString(),
        password: formData.password,
      };

      const response = await fetch(USERS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        throw new Error("Failed to create account");
      }

      toast.success("Account created successfully! Please login.");

      navigate("/login", {
        state: {
          message: "Account created successfully! Please login.",
          email: formData.email,
        },
      });

    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Failed to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !formData.companyName.trim()) {
      toast.error("Please enter your company name");
      return;
    }
    if (step === 1 && !formData.companyType) {
      toast.error("Please select your company type");
      return;
    }
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4 py-10" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        .font-display {
          font-family: 'Space Grotesk', sans-serif;
        }

        .font-mono-cw {
          font-family: 'JetBrains Mono', monospace;
        }
      `}</style>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <div className="w-full max-w-6xl grid lg:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden border border-green-100">
        {/* Left Side - Brand Section */}
        <div className="hidden lg:flex relative bg-gradient-to-br from-[#0E2A1C] via-[#11402D] to-[#1a5c3e] p-10 text-white flex-col justify-between">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm border border-white/20">
              <Recycle className="w-6 h-6" />
              <span className="font-display font-semibold text-lg">ReVive Energy</span>
            </div>

            <div className="mt-12">
              <p className="font-mono-cw text-sm uppercase tracking-[0.25em] text-green-200">
                Join as Energy Producer
              </p>
              <h1 className="font-display mt-4 text-4xl font-bold leading-tight">
                Power Clean
                <br />
                <span className="text-[#9CF06B]">Energy Solutions.</span>
              </h1>
              <p className="mt-5 text-green-200 text-base leading-7 max-w-lg">
                Join ReVive Energy as an energy producer and start transforming waste into clean, renewable energy.
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-3 text-sm text-green-200">
              <CheckCircle className="w-4 h-4 text-[#9CF06B]" />
              <span>Access to verified waste feedstock</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-green-200">
              <CheckCircle className="w-4 h-4 text-[#9CF06B]" />
              <span>Carbon credit generation opportunities</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-green-200">
              <CheckCircle className="w-4 h-4 text-[#9CF06B]" />
              <span>Real-time impact tracking & reporting</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-green-200">
              <CheckCircle className="w-4 h-4 text-[#9CF06B]" />
              <span>24/7 customer support</span>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="p-6 sm:p-10 lg:p-14 flex items-center">
          <div className="w-full max-w-md mx-auto">
            {/* Mobile Logo */}
            <div className="lg:hidden mb-6 text-center">
              <div className="mx-auto mb-3 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0E2A1C] to-[#11402D] flex items-center justify-center text-white shadow-lg">
                <Zap className="w-7 h-7" />
              </div>
              <h1 className="font-display text-2xl font-bold text-slate-900">
                Re<span className="text-green-600">V</span>ive{" "}
                <span className="text-green-600">Energy</span>
              </h1>
              <p className="font-mono-cw text-xs text-green-600 mt-1 tracking-wider">ENERGY PRODUCER</p>
            </div>

            <p className="font-mono-cw text-sm font-semibold tracking-[0.2em] text-green-600 uppercase">
              Step {step} of 3
            </p>
            <h2 className="font-display mt-2 text-3xl font-bold text-slate-900">
              {step === 1 ? "Company Details" : step === 2 ? "Energy Types" : "Account Setup"}
            </h2>
            <p className="mt-2 text-slate-500 leading-6">
              {step === 1 ? "Tell us about your company" : step === 2 ? "What energy do you produce?" : "Create your account"}
            </p>

            {/* Progress Bar */}
            <div className="mt-6 flex gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1 rounded-full flex-1 transition-all ${
                    s <= step ? "bg-[#11402D]" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Step 1: Company Details */}
              {step === 1 && (
                <>
                  <div>
                    <label className="font-display block text-sm font-semibold text-slate-700 mb-1.5">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="Your Company Name"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-green-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-display block text-sm font-semibold text-slate-700 mb-1.5">
                      Company Type <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {companyTypes.map((type) => {
                        const Icon = type.icon;
                        const isSelected = formData.companyType === type.id;
                        return (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, companyType: type.id }))}
                            className={`p-3 rounded-xl text-center transition-all ${
                              isSelected
                                ? "bg-[#11402D] text-white shadow-md ring-2 ring-[#9CF06B]"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            <Icon className={`w-5 h-5 mx-auto mb-1 ${
                              isSelected ? "text-[#9CF06B]" : "text-gray-500"
                            }`} />
                            <div className={`font-display text-[10px] font-bold ${
                              isSelected ? "text-white" : "text-gray-600"
                            }`}>
                              {type.label}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="font-display block text-sm font-semibold text-slate-700 mb-1.5">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="City, County"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-green-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-display block text-sm font-semibold text-slate-700 mb-1.5">
                      Facility Capacity
                    </label>
                    <div className="relative">
                      <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select
                        name="capacity"
                        value={formData.capacity}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-green-500 transition appearance-none"
                      >
                        <option value="">Select capacity</option>
                        {capacityOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-display block text-sm font-semibold text-slate-700 mb-1.5">
                      Address
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Street, Building"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-green-500 transition"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={nextStep}
                    className="w-full py-3 rounded-xl bg-[#11402D] text-white font-display font-bold text-sm hover:bg-[#0E2A1C] transition-all"
                  >
                    Continue <ArrowRight className="w-4 h-4 inline" />
                  </button>
                </>
              )}

              {/* Step 2: Energy Types */}
              {step === 2 && (
                <>
                  <div>
                    <label className="font-display block text-sm font-semibold text-slate-700 mb-3">
                      Select Energy Types <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {energyTypeOptions.map((type) => {
                        const Icon = type.icon;
                        const isSelected = selectedEnergyTypes.includes(type.id);
                        return (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => toggleEnergyType(type.id)}
                            className={`p-3 rounded-xl text-center transition-all border-2 ${
                              isSelected
                                ? "border-[#11402D] bg-[#11402D]/5"
                                : "border-slate-200 bg-white hover:border-[#11402D]/30"
                            }`}
                          >
                            <Icon className={`w-5 h-5 mx-auto mb-1 ${
                              isSelected ? "text-[#11402D]" : "text-slate-400"
                            }`} />
                            <div className={`font-display text-[10px] font-bold ${
                              isSelected ? "text-[#11402D]" : "text-slate-600"
                            }`}>
                              {type.label}
                            </div>
                            {isSelected && (
                              <Check className="w-3 h-3 mx-auto mt-1 text-[#34D399]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-slate-400 mt-2 text-center">
                      {selectedEnergyTypes.length} energy types selected
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-display font-bold text-sm hover:bg-slate-50 transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="flex-1 py-3 rounded-xl bg-[#11402D] text-white font-display font-bold text-sm hover:bg-[#0E2A1C] transition-all"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {/* Step 3: Account Setup */}
              {step === 3 && (
                <>
                  <div>
                    <label className="font-display block text-sm font-semibold text-slate-700 mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-green-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-display block text-sm font-semibold text-slate-700 mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+254 700 123 456"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-green-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-display block text-sm font-semibold text-slate-700 mb-1.5">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Min. 6 characters"
                        className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-green-500 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="font-display block text-sm font-semibold text-slate-700 mb-1.5">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-green-500 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-slate-300 text-[#11402D] focus:ring-[#11402D]"
                    />
                    <label className="text-sm text-slate-600">
                      I agree to the{" "}
                      <Link to="/terms" className="text-[#11402D] font-semibold hover:underline">
                        Terms & Conditions
                      </Link>
                    </label>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-display font-bold text-sm hover:bg-slate-50 transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-3 rounded-xl bg-[#11402D] text-white font-display font-bold text-sm hover:bg-[#0E2A1C] transition-all disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2" />
                          Creating...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>

            <p className="mt-6 font-display text-sm text-slate-600 text-center">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-green-600 hover:text-green-700"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}