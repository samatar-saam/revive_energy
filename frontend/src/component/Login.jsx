// Login.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Recycle,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Truck,
  ShieldCheck,
  Headphones,
  Leaf,
  Zap,
  Users,
  Globe,
  CheckCircle,
  Factory,
  Building2,
  MapPin,
  Hotel,
  Store,
  Wheat,
  Utensils,
  Flame,
  Building,
  Package,
  Truck as TruckIcon,
  Landmark,
  Building as BuildingIcon
} from "lucide-react";

const USERS_API = "http://localhost:5000/users";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [selectedRole, setSelectedRole] = useState("waste-supplier");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
    }
    if (location.state?.email) {
      setFormData(prev => ({ ...prev, email: location.state.email }));
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleChange = (e) => {
    setError("");
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Please enter both email and password");
      toast.error("Please enter both email and password");
      return;
    }

    if (!formData.email.includes("@") || !formData.email.includes(".")) {
      setError("Please enter a valid email address");
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(USERS_API);
      if (!response.ok) {
        throw new Error("Failed to connect to database");
      }

      const users = await response.json();
      
      const foundUser = users.find(
        (user) => user.email.toLowerCase() === formData.email.toLowerCase()
      );

      if (!foundUser) {
        setError("No account found with this email");
        toast.error("No account found with this email. Please sign up first.");
        setIsSubmitting(false);
        return;
      }

      if (foundUser.password !== formData.password) {
        setError("Incorrect password");
        toast.error("Incorrect password. Please try again.");
        setIsSubmitting(false);
        return;
      }

      if (foundUser.status !== "active") {
        setError("Your account is not active. Please contact support.");
        toast.error("Your account is not active. Please contact support.");
        setIsSubmitting(false);
        return;
      }

      if (selectedRole) {
        foundUser.role = selectedRole;
        const updateResponse = await fetch(`${USERS_API}/${foundUser.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: selectedRole }),
        });
        if (!updateResponse.ok) {
          console.warn("Failed to update user role");
        }
      }

      const { password, ...userWithoutPassword } = foundUser;
      localStorage.setItem("user", JSON.stringify(userWithoutPassword));
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("loginTime", new Date().toISOString());
      localStorage.setItem("role", selectedRole);

      const roleRoutes = {
        "waste-supplier": "/supplier/dashboard",
        "energy-producer": "/producer/dashboard",
        "transport-partner": "/transport/dashboard",
      };

      toast.success(`Welcome back, ${foundUser.firstName || "Partner"}!`);

      const redirectUrl = sessionStorage.getItem("redirectAfterLogin");
      
      setTimeout(() => {
        if (redirectUrl) {
          sessionStorage.removeItem("redirectAfterLogin");
          navigate(redirectUrl);
        } else {
          const dashboardPath = roleRoutes[selectedRole] || "/";
          navigate(dashboardPath);
        }
      }, 1500);

    } catch (error) {
      console.error("Login error:", error);
      setError("Login failed. Please try again.");
      toast.error("Login failed. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleOptions = [
    {
      id: "waste-supplier",
      icon: Building2,
      label: "Waste Supplier",
      description: "Hotels, Farms, Markets, Factories, Restaurants",
      color: "#34D399",
      subTypes: ["Hotels", "Farms", "Markets", "Factories", "Restaurants"]
    },
    {
      id: "energy-producer",
      icon: Zap,
      label: "Energy Producer",
      description: "Biogas Plants, Recycling Companies, WtE Plants",
      color: "#F59E0B",
      subTypes: ["Biogas Plants", "Recycling Companies", "Biomass Companies", "Waste-to-Energy Plants"]
    },
    {
      id: "transport-partner",
      icon: TruckIcon,
      label: "Transport Partner",
      description: "Logistics Companies, Truck Owners, Collection Agents",
      color: "#60A5FA",
      subTypes: ["Logistics Companies", "Truck Owners", "Collection Agents"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4 pt-12 pb-10" style={{ fontFamily: "'Inter', sans-serif" }}>
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
        {/* Left Side - Green Gradient Brand Section */}
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
                Welcome Back
              </p>
              <h1 className="font-display mt-4 text-4xl font-bold leading-tight">
                Transform Waste.
                <br />
                <span className="text-[#9CF06B]">Create Value.</span>
              </h1>
              <p className="mt-5 text-green-200 text-base leading-7 max-w-lg">
                Access your account to track waste collections, manage partnerships, 
                and monitor your environmental impact with ReVive Energy.
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="relative z-10 grid grid-cols-2 gap-4 mt-8">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm border border-white/20">
              <p className="font-display text-2xl font-bold">1,200+</p>
              <p className="text-sm text-green-200">Active Partners</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm border border-white/20">
              <p className="font-display text-2xl font-bold">125K+</p>
              <p className="text-sm text-green-200">Tons Processed</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm border border-white/20">
              <p className="font-display text-2xl font-bold">85K+</p>
              <p className="text-sm text-green-200">MWh Generated</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm border border-white/20">
              <p className="font-display text-2xl font-bold">24/7</p>
              <p className="text-sm text-green-200">Support</p>
            </div>
          </div>

          {/* Features */}
          <div className="relative z-10 mt-6 space-y-2.5">
            <div className="flex items-center gap-3 text-sm text-green-200">
              <Truck className="w-4 h-4" />
              <span>Free collection for qualified partners</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-green-200">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified waste streams & processing</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-green-200">
              <Headphones className="w-4 h-4" />
              <span>24/7 customer support</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-green-200">
              <Leaf className="w-4 h-4" />
              <span>Real-time carbon impact tracking</span>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
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
              <p className="font-mono-cw text-xs text-green-600 mt-1 tracking-wider">TRANSFORMING WASTE</p>
            </div>

            <p className="font-mono-cw text-sm font-semibold tracking-[0.2em] text-green-600 uppercase">
              Login
            </p>
            <h2 className="font-display mt-2 text-3xl font-bold text-slate-900">
              Welcome back!
            </h2>
            <p className="mt-2 text-slate-500 leading-6">
              Please enter your details to access your account.
            </p>

            {/* Login As - Role Selection */}
            <div className="mt-6">
              <label className="font-display block text-sm font-semibold text-slate-700 mb-3">
                Login As
              </label>
              <div className="grid grid-cols-3 gap-2">
                {roleOptions.map((role) => {
                  const Icon = role.icon;
                  const isActive = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRole(role.id)}
                      className={`p-3 rounded-xl text-center transition-all duration-200 ${
                        isActive
                          ? "bg-[#11402D] text-white shadow-md ring-2 ring-[#9CF06B]"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <Icon className={`w-5 h-5 mx-auto mb-1 ${
                        isActive ? "text-[#9CF06B]" : "text-gray-500"
                      }`} />
                      <div className={`font-display text-[10px] font-bold ${
                        isActive ? "text-white" : "text-gray-600"
                      }`}>
                        {role.label.split(" ")[0]}
                      </div>
                      <div className={`font-mono-cw text-[8px] ${
                        isActive ? "text-white/60" : "text-gray-400"
                      }`}>
                        {role.label.split(" ").slice(1).join(" ")}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Role Subtypes */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {roleOptions.find(r => r.id === selectedRole)?.subTypes.map((sub, i) => (
                <span key={i} className="font-mono-cw text-[9px] font-medium bg-[#F6F8F4] text-[#5A7060] px-2 py-1 rounded-full border border-[#11402D]/5">
                  {sub}
                </span>
              ))}
            </div>

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              {/* Email Field */}
              <div>
                <label className="font-display block text-sm font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:ring-2 focus-within:ring-green-500 transition">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                    className="w-full bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="font-display block text-sm font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:ring-2 focus-within:ring-green-500 transition">
                  <Lock className="w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
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

              {/* Forgot Password */}
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="font-display text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              {error && (
                <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0E2A1C] to-[#11402D] px-5 py-3.5 font-display font-semibold text-white shadow-lg hover:from-[#1a5c3e] hover:to-[#0E2A1C] transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying credentials...
                  </>
                ) : (
                  <>
                    Login
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-6 space-y-3">
              <p className="font-display text-sm text-slate-600 text-center">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-semibold text-green-600 hover:text-green-700"
                >
                  Create one
                </Link>
              </p>
              
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-px h-4 bg-slate-200" />
                  <span className="text-xs text-slate-400">or</span>
                  <div className="w-px h-4 bg-slate-200" />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/signup/waste-supplier"
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#11402D] hover:text-[#0E2A1C] transition-colors group"
                >
                  <Landmark className="w-4 h-4 text-[#11402D] group-hover:text-[#0E2A1C] transition-colors" />
                  Join as Waste Supplier
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <span className="text-slate-300 hidden sm:inline">|</span>
                <Link
                  to="/signup/energy-producer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#11402D] hover:text-[#0E2A1C] transition-colors group"
                >
                  <Recycle className="w-4 h-4 text-[#11402D] group-hover:text-[#0E2A1C] transition-colors" />
                  Join as Energy Producer
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;