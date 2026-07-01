// src/admin/pages/AdminLogin.jsx
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
  Recycle,
  AlertCircle,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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
    // Check if already logged in as admin
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        if (user.role === "admin") {
          navigate("/admin");
        }
      } catch (e) {
        // Invalid data, stay on login
      }
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

    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // ─── Check role ──────────────────────────────────────
      if (data.user.role !== "admin") {
        throw new Error("Access denied. Admin only.");
      }

      // ─── Store credentials ───────────────────────────────
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Welcome Admin!");
      setTimeout(() => {
        navigate("/admin");
      }, 800);

    } catch (err) {
      console.error("Admin login error:", err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4 py-10">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
      `}</style>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />

      <div className="w-full max-w-6xl grid lg:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden border border-green-100">
        {/* Left Brand Section (unchanged) */}
        <div className="hidden lg:flex relative bg-gradient-to-br from-[#0E2A1C] via-[#11402D] to-[#1a5c3e] p-10 text-white flex-col justify-between">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm border border-white/20">
              <Shield className="w-6 h-6 text-[#9CF06B]" />
              <span className="font-semibold text-lg">Admin Portal</span>
            </div>
            <div className="mt-12">
              <p className="text-sm uppercase tracking-[0.25em] text-green-200">Secure Access</p>
              <h1 className="mt-4 text-4xl font-bold leading-tight">
                Admin<br /><span className="text-[#9CF06B]">Dashboard</span>
              </h1>
              <p className="mt-5 text-green-200 text-base leading-7 max-w-lg">
                Manage users, monitor waste collections, track energy production,
                and oversee platform operations from one central dashboard.
              </p>
            </div>
          </div>
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
          <div className="relative z-10 mt-6 space-y-2.5">
            <div className="flex items-center gap-3 text-sm text-green-200"><Shield className="w-4 h-4 text-[#9CF06B]" /><span>Two-factor authentication</span></div>
            <div className="flex items-center gap-3 text-sm text-green-200"><Lock className="w-4 h-4 text-[#9CF06B]" /><span>Encrypted data transmission</span></div>
            <div className="flex items-center gap-3 text-sm text-green-200"><CheckCircle className="w-4 h-4 text-[#9CF06B]" /><span>Real-time security monitoring</span></div>
            <div className="flex items-center gap-3 text-sm text-green-200"><Users className="w-4 h-4 text-[#9CF06B]" /><span>Full user management</span></div>
          </div>
        </div>

        {/* Right Login Form */}
        <div className="p-6 sm:p-10 lg:p-14 flex items-center">
          <div className="w-full max-w-md mx-auto">
            <div className="lg:hidden mb-6 text-center">
              <div className="mx-auto mb-3 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0E2A1C] to-[#11402D] flex items-center justify-center text-white shadow-lg">
                <Shield className="w-7 h-7 text-[#9CF06B]" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Portal</h1>
              <p className="text-xs text-green-600 mt-1 tracking-wider">SECURE ACCESS</p>
            </div>

            <p className="text-sm font-semibold tracking-[0.2em] text-green-600 uppercase">Admin Login</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Welcome back!</h2>
            <p className="mt-2 text-slate-500 leading-6">Enter your admin credentials to access the dashboard.</p>

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Admin Email</label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:ring-2 focus-within:ring-green-500 transition">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    placeholder=""
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                    className="w-full bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
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
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0E2A1C] to-[#11402D] px-5 py-3.5 font-semibold text-white shadow-lg hover:from-[#1a5c3e] hover:to-[#0E2A1C] transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Verifying...</>
                ) : (
                  <>Access Dashboard <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <p className="mt-6 text-sm text-slate-600 text-center">
              <Link to="/" className="font-semibold text-green-600 hover:text-green-700 inline-flex items-center gap-1">
                <Recycle className="w-4 h-4" /> Back to ReVive Energy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;