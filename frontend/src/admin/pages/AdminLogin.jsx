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
  Sparkles,
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
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        if (user.role === "admin") {
          navigate("/admin");
        }
      } catch (e) {
        // invalid data, stay on login
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
      const toastId = toast.loading("Logging in as Admin...");

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

      if (data.user.role !== "admin") {
        throw new Error("Access denied. Admin only.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.update(toastId, {
        render: "Welcome Admin! 🎉",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-start sm:items-center justify-center px-4 py-10 overflow-y-auto relative">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
          .font-display { font-family: 'Space Grotesk', sans-serif; }
          .font-mono-cw { font-family: 'JetBrains Mono', monospace; }

          /* Was capped at max-height:90vh with a hidden scrollbar, which silently
             clipped content on shorter screens. Now it just grows naturally and
             the page itself scrolls (see the min-h-screen wrapper above). */
          .admin-scroll { scroll-behavior: smooth; }

          .Toastify__toast {
            font-family: 'Inter', sans-serif !important;
            border-radius: 12px !important;
            box-shadow: 0 10px 40px rgba(0,0,0,0.12) !important;
          }
          .Toastify__toast--success {
            background: linear-gradient(135deg, #0E2A1C, #11402D) !important;
          }
          .Toastify__toast--error {
            background: linear-gradient(135deg, #7f1d1d, #991b1b) !important;
          }
          .Toastify__toast--info {
            background: linear-gradient(135deg, #1e3a5f, #1a4a7a) !important;
          }
          .Toastify__toast--warning {
            background: linear-gradient(135deg, #78350f, #92400e) !important;
          }
          .Toastify__progress-bar {
            background: #9CF06B !important;
          }

          /* ── Left panel ── */
          .left-panel {
            position: relative;
            overflow: hidden;
            border-radius: 2rem;
            background: linear-gradient(145deg, #0E2A1C 0%, #1a5c3e 100%);
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.6);
          }
          .left-panel::before {
            content: '';
            position: absolute;
            inset: -2px;
            border-radius: 2rem;
            padding: 2px;
            background: conic-gradient(from 120deg, #9CF06B, #34D399, #9CF06B, #34D399);
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            animation: borderSpin 6s linear infinite;
            pointer-events: none;
            z-index: 0;
          }
          @keyframes borderSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .left-panel-inner {
            position: relative;
            z-index: 2;
            padding: 2rem 1.75rem 1.75rem 1.75rem;
            backdrop-filter: blur(2px);
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }

          .blob-decoration {
            position: absolute;
            right: -10%;
            top: -10%;
            width: 60%;
            height: 60%;
            background: radial-gradient(circle at 70% 30%, rgba(156, 240, 107, 0.3), rgba(52, 211, 153, 0.1) 60%, transparent 80%);
            border-radius: 50%;
            filter: blur(80px);
            z-index: 1;
            pointer-events: none;
            animation: blobMove 12s ease-in-out infinite alternate;
          }
          @keyframes blobMove {
            0% { transform: translate(0, 0) scale(1); }
            100% { transform: translate(10%, 10%) scale(1.3); }
          }

          .orb-1 {
            position: absolute;
            bottom: 20%;
            left: -10%;
            width: 40%;
            height: 40%;
            background: radial-gradient(circle, rgba(156, 240, 107, 0.15), transparent 70%);
            border-radius: 50%;
            filter: blur(60px);
            animation: orbFloat 8s ease-in-out infinite alternate;
          }
          .orb-2 {
            position: absolute;
            top: 30%;
            right: -5%;
            width: 30%;
            height: 30%;
            background: radial-gradient(circle, rgba(52, 211, 153, 0.12), transparent 70%);
            border-radius: 50%;
            filter: blur(50px);
            animation: orbFloat 10s ease-in-out infinite alternate-reverse;
          }
          @keyframes orbFloat {
            0% { transform: translate(0, 0) scale(1); }
            100% { transform: translate(-10%, -10%) scale(1.2); }
          }

          .glass-stat {
            background: rgba(255,255,255,0.08);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255,255,255,0.15);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: default;
          }
          .glass-stat:hover {
            background: rgba(255,255,255,0.15);
            transform: translateY(-4px) scale(1.02);
            border-color: rgba(156, 240, 107, 0.4);
            box-shadow: 0 8px 30px -8px rgba(156, 240, 107, 0.2);
          }

          .feature-item {
            background: rgba(255,255,255,0.05);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(255,255,255,0.08);
            transition: all 0.2s ease;
          }
          .feature-item:hover {
            background: rgba(255,255,255,0.1);
            border-color: rgba(156, 240, 107, 0.3);
            transform: translateX(4px);
            box-shadow: 0 4px 20px -8px rgba(156, 240, 107, 0.1);
          }

          .right-panel {
            background: white;
            border-radius: 2rem;
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.02);
          }

          /* Form fields — professional, understated, matches the main Login page */
          .input-field {
            transition: border-color 0.15s ease, box-shadow 0.15s ease;
          }
          .input-field:hover {
            border-color: #CBD5E1;
          }
          .input-field:focus-within {
            border-color: #11402D;
            box-shadow: 0 0 0 3px rgba(17, 64, 45, 0.08);
          }
          .input-field:focus-within:hover {
            border-color: #11402D;
          }

          .btn-primary {
            background: #11402D;
            transition: background-color 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease;
          }
          .btn-primary:hover:not(:disabled) {
            background: #0E2A1C;
            box-shadow: 0 4px 14px -4px rgba(17, 64, 45, 0.35);
          }
          .btn-primary:active:not(:disabled) {
            background: #0A2115;
            transform: scale(0.99);
          }
          .btn-primary:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }
          .btn-primary:focus-visible {
            outline: none;
            box-shadow: 0 0 0 3px rgba(17, 64, 45, 0.25);
          }
        `}
      </style>

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

      <div className="w-full max-w-5xl grid lg:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden border border-green-100/50 right-panel">
        {/* ─── Left Brand Section ── */}
        <div className="hidden lg:flex left-panel">
          <div className="left-panel-inner">
            <div className="blob-decoration" />
            <div className="orb-1" />
            <div className="orb-2" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm border border-white/20 transition-all hover:bg-white/15">
                <Shield className="w-6 h-6 text-[#9CF06B]" />
                <span className="font-display font-semibold text-lg text-white">Admin Portal</span>
                <Sparkles className="w-4 h-4 text-[#9CF06B] animate-pulse" />
              </div>
              <div className="mt-8">
                <p className="font-mono-cw text-sm uppercase tracking-[0.25em] text-[#9CF06B]">Secure Access</p>
                <h1 className="font-display mt-3 text-3xl font-bold leading-tight text-white">
                  Admin<br /><span className="text-[#9CF06B]">Dashboard</span>
                </h1>
                <p className="mt-5 text-green-200 text-base leading-7 max-w-lg">
                  Manage users, monitor waste collections, track energy production,
                  and oversee platform operations from one central dashboard.
                </p>
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-2 gap-3 mt-6">
              <div className="glass-stat rounded-2xl p-4 border border-white/20">
                <p className="font-display text-2xl font-bold text-white">1,240+</p>
                <p className="text-sm text-[#9CF06B]">Total Users</p>
              </div>
              <div className="glass-stat rounded-2xl p-4 border border-white/20">
                <p className="font-display text-2xl font-bold text-white">318+</p>
                <p className="text-sm text-[#9CF06B]">Companies</p>
              </div>
              <div className="glass-stat rounded-2xl p-4 border border-white/20">
                <p className="font-display text-2xl font-bold text-white">89</p>
                <p className="text-sm text-[#9CF06B]">Transporters</p>
              </div>
              <div className="glass-stat rounded-2xl p-4 border border-white/20">
                <p className="font-display text-2xl font-bold text-white">42</p>
                <p className="text-sm text-[#9CF06B]">Processing Plants</p>
              </div>
            </div>

            <div className="relative z-10 mt-4 space-y-2">
              <div className="feature-item flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/90">
                <Shield className="w-4 h-4 text-[#9CF06B]" />
                <span>Two‑factor authentication</span>
              </div>
              <div className="feature-item flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/90">
                <Lock className="w-4 h-4 text-[#9CF06B]" />
                <span>Encrypted data transmission</span>
              </div>
              <div className="feature-item flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/90">
                <CheckCircle className="w-4 h-4 text-[#9CF06B]" />
                <span>Real‑time security monitoring</span>
              </div>
              <div className="feature-item flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/90">
                <Users className="w-4 h-4 text-[#9CF06B]" />
                <span>Full user management</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Right Login Form ── */}
        <div className="p-6 sm:p-8 lg:p-10 flex items-center admin-scroll">
          <div className="w-full max-w-md mx-auto">
            <div className="lg:hidden mb-6 text-center">
              <div className="mx-auto mb-3 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0E2A1C] to-[#11402D] flex items-center justify-center text-white shadow-lg">
                <Shield className="w-7 h-7 text-[#9CF06B]" />
              </div>
              <h1 className="font-display text-2xl font-bold text-slate-900">Admin Portal</h1>
              <p className="font-mono-cw text-xs text-green-600 mt-1 tracking-wider">SECURE ACCESS</p>
            </div>

            <p className="text-xs font-semibold tracking-[0.2em] text-[#11402D] uppercase">Admin Login</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Welcome back</h2>
            <p className="mt-1.5 text-sm text-slate-500 leading-6">Enter your admin credentials to access the dashboard.</p>

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
                  Admin Email
                </label>
                <div className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 input-field">
                  <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <input
                    type="email"
                    name="email"
                    placeholder="admin@reviveenergy.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                    className="w-full bg-transparent outline-none text-slate-700 placeholder:text-slate-400 text-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Password
                  </label>
                  <Link to="/admin/forgot-password" className="text-xs font-semibold text-[#11402D] hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 input-field">
                  <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                    className="w-full bg-transparent outline-none text-slate-700 placeholder:text-slate-400 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 flex-shrink-0"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg btn-primary px-5 py-3 text-sm font-semibold text-white"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                    Verifying...
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
              <Link to="/" className="font-semibold text-[#11402D] hover:underline inline-flex items-center gap-1 transition-colors">
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