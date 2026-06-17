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
  MapPin
} from "lucide-react";

const USERS_API = "http://localhost:5000/users";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
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

      const { password, ...userWithoutPassword } = foundUser;
      localStorage.setItem("user", JSON.stringify(userWithoutPassword));
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("loginTime", new Date().toISOString());

      toast.success(`Welcome back, ${foundUser.firstName || "Partner"}!`);

      const redirectUrl = sessionStorage.getItem("redirectAfterLogin");
      
      setTimeout(() => {
        if (redirectUrl) {
          sessionStorage.removeItem("redirectAfterLogin");
          navigate(redirectUrl);
        } else {
          navigate("/");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4 pt-24 pb-10">
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
              <span className="font-semibold text-lg">ReVive Energy</span>
            </div>

            <div className="mt-16">
              <p className="text-sm uppercase tracking-[0.25em] text-green-200">
                Welcome Back
              </p>
              <h1 className="mt-4 text-4xl font-bold leading-tight">
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
          <div className="relative z-10 grid grid-cols-2 gap-4 mt-12">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm border border-white/20">
              <p className="text-2xl font-bold">1,200+</p>
              <p className="text-sm text-green-200">Active Partners</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm border border-white/20">
              <p className="text-2xl font-bold">125K+</p>
              <p className="text-sm text-green-200">Tons Processed</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm border border-white/20">
              <p className="text-2xl font-bold">85K+</p>
              <p className="text-sm text-green-200">MWh Generated</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm border border-white/20">
              <p className="text-2xl font-bold">24/7</p>
              <p className="text-sm text-green-200">Support</p>
            </div>
          </div>

          {/* Features */}
          <div className="relative z-10 mt-8 space-y-3">
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
            <div className="lg:hidden mb-8 text-center">
              <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0E2A1C] to-[#11402D] flex items-center justify-center text-white shadow-lg">
                <Recycle className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                Re<span className="text-green-600">V</span>ive{" "}
                <span className="text-green-600">Energy</span>
              </h1>
              <p className="text-xs text-green-600 mt-1 tracking-wider">TRANSFORMING WASTE</p>
            </div>

            <p className="text-sm font-semibold tracking-[0.2em] text-green-600 uppercase">
              Login
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">
              Welcome back!
            </h2>
            <p className="mt-3 text-slate-500 leading-6">
              Please enter your details to access your account and start transforming waste into value.
            </p>

            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
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
                <label className="block text-sm font-medium text-slate-700 mb-2">
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
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
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
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0E2A1C] to-[#11402D] px-5 py-3.5 font-semibold text-white shadow-lg hover:from-[#1a5c3e] hover:to-[#0E2A1C] transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
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
            
            <p className="mt-8 text-sm text-slate-600 text-center">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-green-600 hover:text-green-700"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;