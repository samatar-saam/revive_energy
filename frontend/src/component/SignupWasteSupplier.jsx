// SignupWasteSupplier.jsx
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
  Hotel,
  Store,
  Wheat,
  Factory,
  Utensils,
  Truck,
  ShieldCheck,
  Headphones,
  Leaf,
  Zap,
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
  Apple
} from "lucide-react";

const USERS_API = "http://localhost:5000/users";

export default function SignupWasteSupplier() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    email: "",
    phone: "",
    location: "",
    address: "",
    wasteTypes: [],
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedWasteTypes, setSelectedWasteTypes] = useState([]);

  const businessTypes = [
    { id: "hotel", label: "Hotel", icon: Hotel, color: "#34D399" },
    { id: "restaurant", label: "Restaurant", icon: Utensils, color: "#F59E0B" },
    { id: "market", label: "Market", icon: Store, color: "#60A5FA" },
    { id: "farm", label: "Farm", icon: Wheat, color: "#34D399" },
    { id: "factory", label: "Factory", icon: Factory, color: "#F97316" },
    { id: "institution", label: "Institution", icon: Building, color: "#818CF8" },
  ];

  const wasteTypeOptions = [
    { id: "food-waste", label: "Food Waste", icon: Utensils, color: "#34D399" },
    { id: "fruit-vegetable", label: "Fruit & Vegetable", icon: Apple, color: "#34D399" },
    { id: "market-waste", label: "Market Waste", icon: ShoppingBag, color: "#F59E0B" },
    { id: "agricultural", label: "Agricultural Waste", icon: Wheat, color: "#F59E0B" },
    { id: "plastic", label: "Plastic Waste", icon: Recycle, color: "#818CF8" },
    { id: "paper", label: "Paper & Cardboard", icon: Package, color: "#60A5FA" },
    { id: "organic", label: "Organic Waste", icon: Leaf, color: "#34D399" },
    { id: "industrial", label: "Industrial Waste", icon: Factory, color: "#F97316" },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const toggleWasteType = (typeId) => {
    setSelectedWasteTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
    setFormData(prev => ({
      ...prev,
      wasteTypes: selectedWasteTypes.includes(typeId)
        ? selectedWasteTypes.filter(id => id !== typeId)
        : [...selectedWasteTypes, typeId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.businessName.trim()) {
      toast.error("Please enter your business name");
      return;
    }

    if (!formData.businessType) {
      toast.error("Please select your business type");
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

    if (selectedWasteTypes.length === 0) {
      toast.error("Please select at least one waste type");
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
        businessName: formData.businessName,
        businessType: formData.businessType,
        email: formData.email.toLowerCase(),
        phone: formData.phone || "",
        location: formData.location || "",
        address: formData.address || "",
        wasteTypes: selectedWasteTypes,
        role: "waste-supplier",
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
    if (step === 1 && !formData.businessName.trim()) {
      toast.error("Please enter your business name");
      return;
    }
    if (step === 1 && !formData.businessType) {
      toast.error("Please select your business type");
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
                Join as Waste Supplier
              </p>
              <h1 className="font-display mt-4 text-4xl font-bold leading-tight">
                Turn Waste Into
                <br />
                <span className="text-[#9CF06B]">Revenue.</span>
              </h1>
              <p className="mt-5 text-green-200 text-base leading-7 max-w-lg">
                Join ReVive Energy as a waste supplier and start transforming your waste streams into valuable resources.
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-3 text-sm text-green-200">
              <CheckCircle className="w-4 h-4 text-[#9CF06B]" />
              <span>Free waste collection for qualified partners</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-green-200">
              <CheckCircle className="w-4 h-4 text-[#9CF06B]" />
              <span>Verified waste streams & processing</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-green-200">
              <CheckCircle className="w-4 h-4 text-[#9CF06B]" />
              <span>Real-time carbon impact tracking</span>
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
                <Recycle className="w-7 h-7" />
              </div>
              <h1 className="font-display text-2xl font-bold text-slate-900">
                Re<span className="text-green-600">V</span>ive{" "}
                <span className="text-green-600">Energy</span>
              </h1>
              <p className="font-mono-cw text-xs text-green-600 mt-1 tracking-wider">WASTE SUPPLIER</p>
            </div>

            <p className="font-mono-cw text-sm font-semibold tracking-[0.2em] text-green-600 uppercase">
              Step {step} of 3
            </p>
            <h2 className="font-display mt-2 text-3xl font-bold text-slate-900">
              {step === 1 ? "Business Details" : step === 2 ? "Waste Types" : "Account Setup"}
            </h2>
            <p className="mt-2 text-slate-500 leading-6">
              {step === 1 ? "Tell us about your business" : step === 2 ? "What waste do you generate?" : "Create your account"}
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
              {/* Step 1: Business Details */}
              {step === 1 && (
                <>
                  <div>
                    <label className="font-display block text-sm font-semibold text-slate-700 mb-1.5">
                      Business Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        placeholder="Your Business Name"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-green-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-display block text-sm font-semibold text-slate-700 mb-1.5">
                      Business Type <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {businessTypes.map((type) => {
                        const Icon = type.icon;
                        const isSelected = formData.businessType === type.id;
                        return (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, businessType: type.id }))}
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

              {/* Step 2: Waste Types */}
              {step === 2 && (
                <>
                  <div>
                    <label className="font-display block text-sm font-semibold text-slate-700 mb-3">
                      Select Waste Types <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {wasteTypeOptions.map((type) => {
                        const Icon = type.icon;
                        const isSelected = selectedWasteTypes.includes(type.id);
                        return (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => toggleWasteType(type.id)}
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
                      {selectedWasteTypes.length} waste types selected
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