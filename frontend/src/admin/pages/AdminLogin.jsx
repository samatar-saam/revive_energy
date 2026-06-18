// AdminLogin.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Shield,
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
  Recycle
} from "lucide-react";

const ADMIN_CREDENTIALS = {
  email: "admin@reviveenergy.com",
  password: "admin123"
};

const ADMIN_API = "http://localhost:5000/admin";

function AdminLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if already logged in
    const adminSession = sessionStorage.getItem("adminSession");
    if (adminSession === "true") {
      navigate("/admin");
    }
  }, [navigate]);

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

      // Check against hardcoded credentials
      if (formData.email === ADMIN_CREDENTIALS.email && 
          formData.password === ADMIN_CREDENTIALS.password) {
        
        sessionStorage.setItem("adminSession", "true");
        sessionStorage.setItem("adminEmail", formData.email);

        toast.success("Welcome Admin!");
        
        setTimeout(() => {
          navigate("/admin");
        }, 1500);
        
        setIsSubmitting(false);
        return;
      }

      // Try API check
      try {
        const response = await fetch(ADMIN_API);
        if (response.ok) {
          const admins = await response.json();
          const foundAdmin = admins.find(
            (admin) => admin.email.toLowerCase() === formData.email.toLowerCase()
          );

          if (foundAdmin && foundAdmin.password === formData.password) {
            sessionStorage.setItem("adminSession", "true");
            sessionStorage.setItem("adminEmail", formData.email);

            toast.success("Welcome Admin!");
            
            setTimeout(() => {
              navigate("/admin");
            }, 1500);
            
            setIsSubmitting(false);
            return;
          }
        }
      } catch (apiError) {
        console.log("API check failed, using hardcoded credentials only");
      }

      setError("Invalid admin credentials");
      toast.error("Invalid email or password. Please try again.");
      setIsSubmitting(false);

    } catch (error) {
      console.error("Login error:", error);
      setError("Login failed. Please try again.");
      toast.error("Login failed. Please check your connection.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4 py-10">
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
              <Shield className="w-6 h-6 text-[#9CF06B]" />
              <span className="font-semibold text-lg">Admin Portal</span>
            </div>

            <div className="mt-12">
              <p className="text-sm uppercase tracking-[0.25em] text-green-200">
                Secure Access
              </p>
              <h1 className="mt-4 text-4xl font-bold leading-tight">
                Admin
                <br />
                <span className="text-[#9CF06B]">Dashboard</span>
              </h1>
              <p className="mt-5 text-green-200 text-base leading-7 max-w-lg">
                Manage users, monitor waste collections, track energy production, 
                and oversee platform operations from one central dashboard.
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="relative z-10 grid grid-cols-2 gap-4 mt-8">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm border border-white/20">
              <p className="text-2xl font-bold">1,240+</p>
              <p className="text-sm text-green-200">Total Users</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm border border-white/20">
              <p className="text-2xl font-bold">318+</p>
              <p className="text-sm text-green-200">Companies</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm border border-white/20">
              <p className="text-2xl font-bold">89</p>
              <p className="text-sm text-green-200">Transporters</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm border border-white/20">
              <p className="text-2xl font-bold">42</p>
              <p className="text-sm text-green-200">Processing Plants</p>
            </div>
          </div>

          {/* Features */}
          <div className="relative z-10 mt-6 space-y-2.5">
            <div className="flex items-center gap-3 text-sm text-green-200">
              <Shield className="w-4 h-4 text-[#9CF06B]" />
              <span>Two-factor authentication</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-green-200">
              <Lock className="w-4 h-4 text-[#9CF06B]" />
              <span>Encrypted data transmission</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-green-200">
              <CheckCircle className="w-4 h-4 text-[#9CF06B]" />
              <span>Real-time security monitoring</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-green-200">
              <Users className="w-4 h-4 text-[#9CF06B]" />
              <span>Full user management</span>
            </div>
          </div>
        </div>

        {/* Right Side - Admin Login Form */}
        <div className="p-6 sm:p-10 lg:p-14 flex items-center">
          <div className="w-full max-w-md mx-auto">
            {/* Mobile Logo */}
            <div className="lg:hidden mb-6 text-center">
              <div className="mx-auto mb-3 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0E2A1C] to-[#11402D] flex items-center justify-center text-white shadow-lg">
                <Shield className="w-7 h-7 text-[#9CF06B]" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                Admin Portal
              </h1>
              <p className="text-xs text-green-600 mt-1 tracking-wider">SECURE ACCESS</p>
            </div>

            <p className="text-sm font-semibold tracking-[0.2em] text-green-600 uppercase">
              Admin Login
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              Welcome back!
            </h2>
            <p className="mt-2 text-slate-500 leading-6">
              Enter your admin credentials to access the dashboard.
            </p>

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Admin Email
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:ring-2 focus-within:ring-green-500 transition">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    placeholder="admin@reviveenergy.com"
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
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
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

              {/* Demo Credentials Hint */}
              <div className="text-right">
                <span className="text-xs text-slate-400">
                  Demo: admin@reviveenergy.com / admin123
                </span>
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
                    Access Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
            
            <p className="mt-6 text-sm text-slate-600 text-center">
              <Link
                to="/"
                className="font-semibold text-green-600 hover:text-green-700 inline-flex items-center gap-1"
              >
                <Recycle className="w-4 h-4" />
                Back to ReVive Energy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;