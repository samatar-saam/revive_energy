// frontend/src/pages/Signup.jsx
import { useState } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
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
  Briefcase,
  CheckCircle,
  AlertCircle,
  Truck,
  Zap,
  Building
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

function Signup() {
  const navigate = useNavigate();
  const { role } = useParams(); // Get role from URL: /signup/waste-supplier
  
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: role || "waste-supplier",
    business_name: "",
    business_type: "",
    location: "",
    waste_types: ""
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const roleOptions = {
    "waste-supplier": {
      label: "Waste Supplier",
      icon: Building,
      description: "Hotels, Farms, Markets, Factories, Restaurants",
      businessTypes: ["Hotel", "Farm", "Market", "Factory", "Restaurant", "Other"]
    },
    "energy-producer": {
      label: "Energy Producer",
      icon: Zap,
      description: "Biogas Plants, Recycling Companies, WtE Plants",
      businessTypes: ["Biogas Plant", "Recycling Company", "Biomass Company", "Waste-to-Energy Plant", "Other"]
    },
    "transport-partner": {
      label: "Transport Partner",
      icon: Truck,
      description: "Logistics Companies, Truck Owners, Collection Agents",
      businessTypes: ["Logistics Company", "Truck Owner", "Collection Agent", "Other"]
    }
  };

  const currentRole = roleOptions[formData.role] || roleOptions["waste-supplier"];

  const handleChange = (e) => {
    setError("");
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validation
    if (!formData.full_name.trim()) {
      setError("Full name is required");
      toast.error("Full name is required");
      return;
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      setError("Valid email is required");
      toast.error("Valid email is required");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }

    if (!formData.phone.trim()) {
      setError("Phone number is required");
      toast.error("Phone number is required");
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare data for API
      const userData = {
        full_name: formData.full_name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim(),
        role: formData.role,
        business_name: formData.business_name.trim() || "",
        business_type: formData.business_type || "",
        location: formData.location.trim() || "",
        waste_types: formData.waste_types || ""
      };

      console.log("Sending data:", userData); // Debug log

      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      console.log("Response:", data); // Debug log

      if (response.ok) {
        setSuccess(true);
        toast.success("Account created successfully!");
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/login", {
            state: {
              message: "Account created! Please login.",
              email: formData.email
            }
          });
        }, 2000);
      } else {
        setError(data.message || "Registration failed");
        toast.error(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError("Connection error. Please check your server.");
      toast.error("Connection error. Please check your server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4 py-8">
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

      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-green-100 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-3 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0E2A1C] to-[#11402D] flex items-center justify-center text-white shadow-lg">
            <Recycle className="w-7 h-7" />
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Create Your Account
          </h1>
          <p className="mt-1 text-slate-500">
            Join as a <span className="font-semibold text-[#11402D]">{currentRole.label}</span>
          </p>
          <p className="text-sm text-slate-400">{currentRole.description}</p>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="font-display text-xl font-bold text-slate-900">Account Created!</h2>
            <p className="text-slate-500 mt-2">Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="font-display block text-sm font-semibold text-slate-700 mb-1.5">
                Full Name *
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:ring-2 focus-within:ring-green-500 transition">
                <User className="w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="full_name"
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="font-display block text-sm font-semibold text-slate-700 mb-1.5">
                Email Address *
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:ring-2 focus-within:ring-green-500 transition">
                <Mail className="w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="font-display block text-sm font-semibold text-slate-700 mb-1.5">
                Phone Number *
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:ring-2 focus-within:ring-green-500 transition">
                <Phone className="w-5 h-5 text-slate-400" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="font-display block text-sm font-semibold text-slate-700 mb-1.5">
                Password *
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:ring-2 focus-within:ring-green-500 transition">
                <Lock className="w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="font-display block text-sm font-semibold text-slate-700 mb-1.5">
                Confirm Password *
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:ring-2 focus-within:ring-green-500 transition">
                <Lock className="w-5 h-5 text-slate-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Business Name */}
            <div>
              <label className="font-display block text-sm font-semibold text-slate-700 mb-1.5">
                Business/Organization Name
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:ring-2 focus-within:ring-green-500 transition">
                <Building2 className="w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="business_name"
                  placeholder="Enter your business name"
                  value={formData.business_name}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Business Type */}
            <div>
              <label className="font-display block text-sm font-semibold text-slate-700 mb-1.5">
                Business Type
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:ring-2 focus-within:ring-green-500 transition">
                <Briefcase className="w-5 h-5 text-slate-400" />
                <select
                  name="business_type"
                  value={formData.business_type}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none text-slate-700"
                >
                  <option value="">Select business type</option>
                  {currentRole.businessTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="font-display block text-sm font-semibold text-slate-700 mb-1.5">
                Location
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:ring-2 focus-within:ring-green-500 transition">
                <MapPin className="w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="location"
                  placeholder="Enter your location (city, region)"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Waste Types (for waste suppliers) */}
            {formData.role === "waste-supplier" && (
              <div>
                <label className="font-display block text-sm font-semibold text-slate-700 mb-1.5">
                  Types of Waste You Supply
                </label>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:ring-2 focus-within:ring-green-500 transition">
                  <Recycle className="w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="waste_types"
                    placeholder="e.g. Organic, Plastic, Paper, Glass"
                    value={formData.waste_types}
                    onChange={handleChange}
                    className="w-full bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0E2A1C] to-[#11402D] px-5 py-3.5 font-display font-semibold text-white shadow-lg hover:from-[#1a5c3e] hover:to-[#0E2A1C] transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="font-display text-sm text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-green-600 hover:text-green-700">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;