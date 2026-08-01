// src/component/Login.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
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
  Building2,
  MapPin,
  Utensils,
  Factory,
  Package,
  Landmark,
  User,
  Phone,
  Briefcase,
  AlertCircle,
  X,
  Check,
  Apple,
  ShoppingBag,
  TreePine,
  Droplets,
  Gauge,
  Navigation,
  Award,
  RefreshCw,
  Clock,
  Globe,
  Users,
  Sparkles,
} from "lucide-react";

// ─── Import the Forgot Password Modal ─────────────────────────
import ForgotPasswordModal from "./ForgotPasswordModal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [showSignup, setShowSignup] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState("waste-supplier");
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [signupError, setSignupError] = useState("");

  const [signupData, setSignupData] = useState({
    full_name: "",
    business_name: "",
    business_type: "",
    location: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    wasteTypes: [],
    energyTypes: [],
    vehicleTypes: [],
    capacity: "",
    fleetSize: "",
    coverageArea: "",
    licenseNumber: "",
    referralCode: "",
    country: "KE",
    termsAccepted: false,
  });

  const [emailCode, setEmailCode] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [emailTimer, setEmailTimer] = useState(0);
  const [resendEmailDisabled, setResendEmailDisabled] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // ─── Forgot Password Modal ────────────────────────────────
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const roleOptions = [
    {
      id: "waste-supplier",
      icon: Building2,
      label: "Waste Supplier",
      description: "Hotels, Farms, Markets, Factories, Restaurants",
      businessTypes: ["Hotel", "Farm", "Market", "Factory", "Restaurant", "Other"],
    },
    {
      id: "energy-producer",
      icon: Zap,
      label: "Energy Producer",
      description: "Biogas Plants, Recycling Companies, WtE Plants",
      businessTypes: [
        "Biogas Plant",
        "Recycling Company",
        "Biomass Company",
        "Waste-to-Energy Plant",
        "Other",
      ],
    },
    {
      id: "transport-partner",
      icon: Truck,
      label: "Transport Partner",
      description: "Logistics Companies, Truck Owners, Collection Agents",
      businessTypes: ["Logistics Company", "Truck Owner", "Collection Agent", "Other"],
    },
  ];

  const wasteTypeOptions = [
    { id: "food-waste", label: "Food Waste", icon: Utensils },
    { id: "fruit-vegetable", label: "Fruit & Vegetable", icon: Apple },
    { id: "market-waste", label: "Market Waste", icon: ShoppingBag },
    { id: "agricultural", label: "Agricultural Waste", icon: Leaf },
    { id: "plastic", label: "Plastic Waste", icon: Recycle },
    { id: "paper", label: "Paper & Cardboard", icon: Package },
    { id: "organic", label: "Organic Waste", icon: Leaf },
    { id: "industrial", label: "Industrial Waste", icon: Factory },
  ];

  const energyTypeOptions = [
    { id: "biogas", label: "Biogas Production", icon: Zap },
    { id: "electricity", label: "Electricity Generation", icon: Zap },
    { id: "fertilizer", label: "Organic Fertilizer", icon: Leaf },
    { id: "biochar", label: "Biochar Production", icon: TreePine },
    { id: "biomass-fuel", label: "Biomass Fuel", icon: Droplets },
    { id: "recycling", label: "Plastic Recycling", icon: Recycle },
    { id: "compost", label: "Composting", icon: Leaf },
    { id: "wte", label: "Waste-to-Energy", icon: Zap },
  ];

  const vehicleTypeOptions = [
    { id: "pickup", label: "Pickup Truck", icon: Truck },
    { id: "box-truck", label: "Box Truck", icon: Package },
    { id: "tipper", label: "Tipper", icon: Truck },
    { id: "reefer", label: "Refrigerated", icon: Truck },
    { id: "flatbed", label: "Flatbed", icon: Truck },
    { id: "van", label: "Van", icon: Truck },
  ];

  const capacityOptions = [
    "1-10 tonnes/day",
    "11-50 tonnes/day",
    "51-100 tonnes/day",
    "101-500 tonnes/day",
    "500+ tonnes/day",
  ];

  const fleetSizeOptions = ["1-2", "3-5", "6-10", "11-20", "20+"];

  const countryOptions = [
    { code: "KE", name: "Kenya" },
    { code: "UG", name: "Uganda" },
    { code: "TZ", name: "Tanzania" },
    { code: "RW", name: "Rwanda" },
    { code: "ET", name: "Ethiopia" },
    { code: "NG", name: "Nigeria" },
    { code: "ZA", name: "South Africa" },
    { code: "GH", name: "Ghana" },
  ];

  const currentRole =
    roleOptions.find((role) => role.id === selectedRole) || roleOptions[0];

  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
    }
    if (location.state?.email) {
      setLoginData((prev) => ({
        ...prev,
        email: location.state.email,
      }));
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    let interval;
    if (emailTimer > 0) {
      interval = setInterval(() => {
        setEmailTimer((prev) => prev - 1);
      }, 1000);
    } else if (emailTimer === 0 && emailCodeSent) {
      setResendEmailDisabled(false);
    }
    return () => clearInterval(interval);
  }, [emailTimer, emailCodeSent]);

  const resetSignupState = () => {
    setStep(1);
    setSignupError("");
    setEmailCode("");
    setEmailVerified(false);
    setEmailCodeSent(false);
    setEmailTimer(0);
    setResendEmailDisabled(false);
    setIsSendingEmail(false);
    setSignupData({
      full_name: "",
      business_name: "",
      business_type: "",
      location: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      wasteTypes: [],
      energyTypes: [],
      vehicleTypes: [],
      capacity: "",
      fleetSize: "",
      coverageArea: "",
      licenseNumber: "",
      referralCode: "",
      country: "KE",
      termsAccepted: false,
    });
  };

  const openSignup = (role) => {
    resetSignupState();
    setSelectedRole(role);
    setShowSignup(true);
  };

  const closeSignup = () => {
    setShowSignup(false);
    resetSignupState();
  };

  const handleLoginChange = (e) => {
    setLoginError("");
    setLoginData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSignupChange = (e) => {
    setSignupError("");
    const { name, value, type, checked } = e.target;
    setSignupData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const toggleSelection = (arrayKey, id) => {
    setSignupData((prev) => {
      const current = Array.isArray(prev[arrayKey]) ? prev[arrayKey] : [];
      const updated = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];
      return {
        ...prev,
        [arrayKey]: updated,
      };
    });
  };

  const nextStep = () => {
    if (step === 1) {
      if (!signupData.full_name.trim()) {
        setSignupError("Full name is required");
        toast.error("Full name is required");
        return;
      }
      if (!signupData.business_name.trim()) {
        setSignupError("Business name is required");
        toast.error("Business name is required");
        return;
      }
      if (!signupData.business_type) {
        setSignupError("Business type is required");
        toast.error("Business type is required");
        return;
      }
      if (!signupData.country) {
        setSignupError("Country is required");
        toast.error("Country is required");
        return;
      }
    }

    if (step === 2) {
      const wasteLen = signupData.wasteTypes.length;
      const energyLen = signupData.energyTypes.length;
      const vehicleLen = signupData.vehicleTypes.length;

      if (selectedRole === "waste-supplier" && wasteLen === 0) {
        setSignupError("Select at least one waste type");
        toast.error("Select at least one waste type");
        return;
      }
      if (selectedRole === "energy-producer" && energyLen === 0) {
        setSignupError("Select at least one energy type");
        toast.error("Select at least one energy type");
        return;
      }
      if (selectedRole === "transport-partner" && vehicleLen === 0) {
        setSignupError("Select at least one vehicle type");
        toast.error("Select at least one vehicle type");
        return;
      }
    }

    if (step === 3) {
      if (!signupData.email || !signupData.email.includes("@")) {
        setSignupError("Valid email is required");
        toast.error("Valid email is required");
        return;
      }
      if (!signupData.phone.trim()) {
        setSignupError("Phone number is required");
        toast.error("Phone number is required");
        return;
      }
      if (signupData.password.length < 6) {
        setSignupError("Password must be at least 6 characters");
        toast.error("Password must be at least 6 characters");
        return;
      }
      if (signupData.password !== signupData.confirmPassword) {
        setSignupError("Passwords do not match");
        toast.error("Passwords do not match");
        return;
      }
    }

    if (step === 4 && !signupData.termsAccepted) {
      setSignupError("You must accept the terms and conditions");
      toast.error("You must accept the terms and conditions");
      return;
    }

    setSignupError("");
    setStep((prev) => Math.min(prev + 1, 5));
  };

  const prevStep = () => {
    setSignupError("");
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const sendEmailCode = async () => {
    if (!signupData.email || !signupData.email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!signupData.phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    setIsSendingEmail(true);
    const toastId = toast.loading("Sending verification code...");

    try {
      const res = await fetch(`${API_URL}/register/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: signupData.email,
          phone: signupData.phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send verification email");

      setEmailCodeSent(true);
      setEmailTimer(60);
      setResendEmailDisabled(true);

      toast.update(toastId, {
        render: "Verification code sent to your email 📧",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (err) {
      toast.update(toastId, {
        render: err.message || "Failed to send verification code",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const verifyEmailCode = async () => {
    if (emailCode.length !== 6) {
      toast.error("Enter the 6‑digit verification code");
      return;
    }

    const toastId = toast.loading("Verifying email...");

    try {
      const res = await fetch(`${API_URL}/register/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: signupData.email,
          code: emailCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid verification code");

      setEmailVerified(true);

      toast.update(toastId, {
        render: "Email verified successfully! ✅",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (err) {
      toast.update(toastId, {
        render: err.message || "Email verification failed",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    }
  };

  const completeSignup = async () => {
    if (!emailVerified) {
      toast.error("Please verify your email first");
      return;
    }

    setIsSigningUp(true);
    const toastId = toast.loading("Creating your account...");

    try {
      const payload = {
        ...signupData,
        role: selectedRole,
        waste_types: signupData.wasteTypes.join(","),
        energy_types: signupData.energyTypes.join(","),
        vehicle_types: signupData.vehicleTypes.join(","),
        capacity: signupData.capacity || "",
        fleet_size: signupData.fleetSize || "",
        coverage_area: signupData.coverageArea || "",
        license_number: signupData.licenseNumber || "",
        referral_code: signupData.referralCode || "",
        country: signupData.country,
      };

      const res = await fetch(`${API_URL}/register/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      // ─── Send welcome email ────────────────
      try {
        await fetch(`${API_URL}/send-welcome-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: signupData.email,
            full_name: signupData.full_name,
            role: selectedRole,
          }),
        });
      } catch (emailErr) {
        console.error("Failed to send welcome email:", emailErr);
      }

      toast.update(toastId, {
        render: "Account created successfully! 🎉 Please login.",
        type: "success",
        isLoading: false,
        autoClose: 4000,
      });

      setShowSignup(false);
      setLoginData((prev) => ({
        ...prev,
        email: signupData.email,
      }));
      resetSignupState();
    } catch (err) {
      toast.update(toastId, {
        render: err.message || "Registration failed",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!loginData.email.trim() || !loginData.password.trim()) {
      setLoginError("Please enter both email and password");
      toast.error("Please enter both email and password");
      return;
    }

    setIsSubmitting(true);
    setLoginError("");
    const toastId = toast.loading("Logging in...");

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("loginTime", new Date().toISOString());

      toast.update(toastId, {
        render: `Welcome ${data.user.full_name}! 🎉`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      const redirectMap = {
        supplier: "/dashboard",
        producer: "/dashboard",
        transporter: "/dashboard",
        admin: "/admin",
      };

      setTimeout(() => {
        navigate(redirectMap[data.user.role] || "/dashboard");
      }, 800);
    } catch (err) {
      setLoginError(err.message);
      toast.update(toastId, {
        render: err.message || "Login failed",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    toast.info("Redirecting to Google...");
    window.location.href = `${API_URL}/google-auth`;
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, "");
    if (!value) {
      const newCode = emailCode.split("");
      newCode[index] = "";
      setEmailCode(newCode.join(""));
      return;
    }
    const newCode = emailCode.split("");
    newCode[index] = value[0];
    setEmailCode(newCode.join(""));
    const nextInput = document.getElementById(`email-code-${index + 1}`);
    if (nextInput) nextInput.focus();
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      const prevInput = document.getElementById(`email-code-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const renderRoleSpecificFields = () => {
    const isSelected = (arrayKey, id) => signupData[arrayKey].includes(id);

    if (selectedRole === "waste-supplier") {
      return (
        <>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-2.5">
            Select Waste Types *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {wasteTypeOptions.map((type) => {
              const Icon = type.icon;
              const selected = isSelected("wasteTypes", type.id);
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => toggleSelection("wasteTypes", type.id)}
                  className={`chip-option relative flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center ${
                    selected
                      ? "border-[#11402D] bg-[#11402D]/[0.04]"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${selected ? "text-[#11402D]" : "text-slate-400"}`}
                  />
                  <span
                    className={`text-xs font-medium leading-tight ${
                      selected ? "text-[#11402D]" : "text-slate-600"
                    }`}
                  >
                    {type.label}
                  </span>
                  {selected && (
                    <Check className="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-[#11402D]" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      );
    }

    if (selectedRole === "energy-producer") {
      return (
        <>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-2.5">
            Select Energy Types *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {energyTypeOptions.map((type) => {
              const Icon = type.icon;
              const selected = isSelected("energyTypes", type.id);
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => toggleSelection("energyTypes", type.id)}
                  className={`chip-option relative flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center ${
                    selected
                      ? "border-[#11402D] bg-[#11402D]/[0.04]"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${selected ? "text-[#11402D]" : "text-slate-400"}`}
                  />
                  <span
                    className={`text-xs font-medium leading-tight ${
                      selected ? "text-[#11402D]" : "text-slate-600"
                    }`}
                  >
                    {type.label}
                  </span>
                  {selected && (
                    <Check className="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-[#11402D]" />
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-5">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
              Facility Capacity
            </label>
            <div className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 input-field">
              <Gauge className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <select
                name="capacity"
                value={signupData.capacity}
                onChange={handleSignupChange}
                className="w-full bg-transparent outline-none text-slate-700 text-sm"
              >
                <option value="">Select capacity</option>
                {capacityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </>
      );
    }

    return (
      <>
        <div className="mb-5">
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
            Fleet Size
          </label>
          <div className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 input-field">
            <Gauge className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <select
              name="fleetSize"
              value={signupData.fleetSize}
              onChange={handleSignupChange}
              className="w-full bg-transparent outline-none text-slate-700 text-sm"
            >
              <option value="">Select fleet size</option>
              {fleetSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option} vehicles
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-2.5">
          Vehicle Types *
        </label>
        <div className="grid grid-cols-2 gap-2">
          {vehicleTypeOptions.map((type) => {
            const Icon = type.icon;
            const selected = isSelected("vehicleTypes", type.id);
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => toggleSelection("vehicleTypes", type.id)}
                className={`chip-option relative flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center ${
                  selected
                    ? "border-[#11402D] bg-[#11402D]/[0.04]"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${selected ? "text-[#11402D]" : "text-slate-400"}`}
                />
                <span
                  className={`text-xs font-medium leading-tight ${
                    selected ? "text-[#11402D]" : "text-slate-600"
                  }`}
                >
                  {type.label}
                </span>
                {selected && (
                  <Check className="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-[#11402D]" />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-5">
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
            Coverage Area
          </label>
          <div className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 input-field">
            <Navigation className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              name="coverageArea"
              value={signupData.coverageArea}
              onChange={handleSignupChange}
              placeholder="e.g. Nairobi, Mombasa, Garissa"
              className="w-full bg-transparent outline-none text-slate-700 placeholder:text-slate-400 text-sm"
            />
          </div>
        </div>

        <div className="mt-5">
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
            License / Permit Number
          </label>
          <div className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 input-field">
            <Award className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              name="licenseNumber"
              value={signupData.licenseNumber}
              onChange={handleSignupChange}
              placeholder="Enter license number"
              className="w-full bg-transparent outline-none text-slate-700 placeholder:text-slate-400 text-sm"
            />
          </div>
        </div>
      </>
    );
  };

  const Step1 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
          Full Name *
        </label>
        <div className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 input-field">
          <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            name="full_name"
            placeholder="Enter your full name"
            value={signupData.full_name}
            onChange={handleSignupChange}
            autoComplete="off"
            className="w-full bg-transparent outline-none text-slate-700 placeholder:text-slate-400 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
          Business / Organization Name *
        </label>
        <div className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 input-field">
          <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            name="business_name"
            placeholder="Enter your business name"
            value={signupData.business_name}
            onChange={handleSignupChange}
            autoComplete="off"
            className="w-full bg-transparent outline-none text-slate-700 placeholder:text-slate-400 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
          Business Type *
        </label>
        <div className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 input-field">
          <Briefcase className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            name="business_type"
            value={signupData.business_type}
            onChange={handleSignupChange}
            className="w-full bg-transparent outline-none text-slate-700 text-sm"
          >
            <option value="">Select business type</option>
            {currentRole.businessTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
          Country *
        </label>
        <div className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 input-field">
          <Globe className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            name="country"
            value={signupData.country}
            onChange={handleSignupChange}
            className="w-full bg-transparent outline-none text-slate-700 text-sm"
          >
            {countryOptions.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
          Location
        </label>
        <div className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 input-field">
          <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            name="location"
            placeholder="Enter your city or region"
            value={signupData.location}
            onChange={handleSignupChange}
            autoComplete="off"
            className="w-full bg-transparent outline-none text-slate-700 placeholder:text-slate-400 text-sm"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={nextStep}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg btn-primary px-5 py-3 text-sm font-semibold text-white"
      >
        Continue <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );

  const Step2 = () => (
    <div>
      {renderRoleSpecificFields()}
      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={prevStep}
          className="btn-secondary flex-1 py-3 rounded-lg border border-slate-300 text-slate-600 text-sm font-semibold"
        >
          Back
        </button>
        <button
          type="button"
          onClick={nextStep}
          className="flex-1 py-3 rounded-lg btn-primary text-sm font-semibold text-white"
        >
          Continue
        </button>
      </div>
    </div>
  );

  const Step3 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
          Email Address *
        </label>
        <div className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 input-field">
          <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={signupData.email}
            onChange={handleSignupChange}
            autoComplete="off"
            className="w-full bg-transparent outline-none text-slate-700 placeholder:text-slate-400 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
          Phone Number *
        </label>
        <div className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 input-field">
          <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="tel"
            name="phone"
            placeholder="+254712345678"
            value={signupData.phone}
            onChange={handleSignupChange}
            autoComplete="off"
            className="w-full bg-transparent outline-none text-slate-700 placeholder:text-slate-400 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
          Password *
        </label>
        <div className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 input-field">
          <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Minimum 6 characters"
            value={signupData.password}
            onChange={handleSignupChange}
            minLength={6}
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

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
          Confirm Password *
        </label>
        <div className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 input-field">
          <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm your password"
            value={signupData.confirmPassword}
            onChange={handleSignupChange}
            autoComplete="new-password"
            className="w-full bg-transparent outline-none text-slate-700 placeholder:text-slate-400 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
          Referral Code (optional)
        </label>
        <div className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 input-field">
          <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            name="referralCode"
            placeholder="Enter referral code if any"
            value={signupData.referralCode}
            onChange={handleSignupChange}
            autoComplete="off"
            className="w-full bg-transparent outline-none text-slate-700 placeholder:text-slate-400 text-sm"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={prevStep}
          className="btn-secondary flex-1 py-3 rounded-lg border border-slate-300 text-slate-600 text-sm font-semibold"
        >
          Back
        </button>
        <button
          type="button"
          onClick={nextStep}
          className="flex-1 py-3 rounded-lg btn-primary text-sm font-semibold text-white"
        >
          Continue
        </button>
      </div>
    </div>
  );

  const Step4 = () => (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3.5">
        <input
          type="checkbox"
          name="termsAccepted"
          checked={signupData.termsAccepted}
          onChange={handleSignupChange}
          className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#11402D] focus:ring-[#11402D] flex-shrink-0"
        />
        <div>
          <label className="text-sm leading-relaxed text-slate-700">
            I agree to the{" "}
            <a href="/terms" className="font-medium text-[#11402D] hover:underline" target="_blank" rel="noopener noreferrer">
              Terms & Conditions
            </a>{" "}
            and{" "}
            <a href="/privacy" className="font-medium text-[#11402D] hover:underline" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>
          </label>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={prevStep}
          className="btn-secondary flex-1 py-3 rounded-lg border border-slate-300 text-slate-600 text-sm font-semibold"
        >
          Back
        </button>
        <button
          type="button"
          onClick={nextStep}
          className="flex-1 py-3 rounded-lg btn-primary text-sm font-semibold text-white"
        >
          Continue
        </button>
      </div>
    </div>
  );

  const Step5 = () => (
    <div className="space-y-4 text-center">
      <div className="flex justify-center">
        <div className="w-14 h-14 rounded-full bg-[#11402D]/[0.06] flex items-center justify-center">
          <Mail className="w-6 h-6 text-[#11402D]" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-slate-900">Verify Your Email</h3>
        <p className="text-slate-500 text-sm mt-1">
          We will send a 6‑digit code to <span className="font-semibold text-slate-700">{signupData.email}</span>
        </p>
      </div>

      {emailCodeSent && (
        <div className="flex justify-center gap-2">
          {[...Array(6)].map((_, index) => (
            <input
              key={index}
              id={`email-code-${index}`}
              type="text"
              maxLength="1"
              value={emailCode[index] || ""}
              onChange={(e) => handleOtpChange(e, index)}
              onKeyDown={(e) => handleOtpKeyDown(e, index)}
              autoComplete="off"
              className="otp-box w-12 h-14 text-center text-xl font-semibold border border-slate-300 rounded-lg bg-white focus:outline-none"
            />
          ))}
        </div>
      )}

      {emailCodeSent && (
        <div className="flex justify-center items-center gap-1.5 text-xs font-medium text-slate-500">
          <Clock className="w-3.5 h-3.5" />
          <span>
            Code expires in {Math.floor(emailTimer / 60)}:
            {(emailTimer % 60).toString().padStart(2, "0")}
          </span>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => {
            if (!emailCodeSent) {
              sendEmailCode();
            } else if (!emailVerified) {
              verifyEmailCode();
            }
          }}
          disabled={isSendingEmail || emailVerified}
          className={`flex-1 inline-flex items-center justify-center py-3 rounded-lg text-sm font-semibold transition-colors ${
            isSendingEmail
              ? "bg-slate-200 text-slate-500 cursor-not-allowed"
              : emailVerified
              ? "bg-emerald-600 text-white"
              : "btn-primary text-white"
          }`}
        >
          {isSendingEmail ? (
            <>
              <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin mr-2" />
              Sending...
            </>
          ) : !emailCodeSent ? (
            "Send Code"
          ) : emailVerified ? (
            "Verified ✅"
          ) : (
            "Verify Code"
          )}
        </button>

        {emailCodeSent && !emailVerified && (
          <button
            type="button"
            disabled={resendEmailDisabled || isSendingEmail}
            onClick={sendEmailCode}
            className="btn-secondary py-3 px-4 rounded-lg border border-slate-300 text-slate-600 text-sm font-semibold disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {emailVerified && (
        <button
          type="button"
          onClick={completeSignup}
          disabled={isSigningUp}
          className="w-full inline-flex items-center justify-center py-3 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-70"
        >
          {isSigningUp ? (
            <>
              <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin mr-2" />
              Creating...
            </>
          ) : (
            "Create Account"
          )}
        </button>
      )}
    </div>
  );

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-start sm:items-center justify-center px-4 py-8 overflow-y-auto relative"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

          .font-display { font-family: 'Space Grotesk', sans-serif; }
          .font-mono-cw { font-family: 'JetBrains Mono', monospace; }

          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          /* Was capped at max-height:90vh with a hidden scrollbar, which silently
             clipped content on shorter screens. Now it just grows naturally and
             the page itself scrolls (see the min-h-screen wrapper below). */
          .signup-scroll { scroll-behavior: smooth; }

          /* ── Toastify styling ── */
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

          /* Blob decoration */
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

          /* Additional floating orbs */
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

          /* Form fields — professional, understated */
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

          /* Custom select arrow so dropdowns match the rest of the form
             instead of falling back to the OS-default arrow. */
          .right-panel select {
            -webkit-appearance: none;
            appearance: none;
            background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none' stroke='%2394A3B8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 8l5 5 5-5'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 0.125rem center;
            background-size: 1rem;
            padding-right: 1.5rem;
          }
          .right-panel select::-ms-expand { display: none; }

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
          .btn-primary:focus-visible,
          .btn-secondary:focus-visible,
          .btn-role:focus-visible {
            outline: none;
            box-shadow: 0 0 0 3px rgba(17, 64, 45, 0.25);
          }

          .btn-secondary {
            transition: border-color 0.15s ease, background-color 0.15s ease, transform 0.1s ease;
          }
          .btn-secondary:hover {
            border-color: #CBD5E1;
            background: #F8FAFC;
          }
          .btn-secondary:active {
            transform: scale(0.99);
          }

          .btn-role {
            transition: border-color 0.15s ease, background-color 0.15s ease, transform 0.1s ease;
          }
          .btn-role:hover {
            border-color: #11402D;
            background: rgba(17, 64, 45, 0.04);
          }
          .btn-role:active {
            transform: scale(0.99);
          }

          .chip-option {
            transition: border-color 0.15s ease, background-color 0.15s ease, transform 0.1s ease;
          }
          .chip-option:hover {
            border-color: #CBD5E1;
          }
          .chip-option:active {
            transform: scale(0.98);
          }

          .otp-box {
            transition: border-color 0.15s ease, box-shadow 0.15s ease;
          }
          .otp-box:focus {
            border-color: #11402D;
            box-shadow: 0 0 0 3px rgba(17, 64, 45, 0.1);
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
        {/* ─── Left Panel (World‑class design) ─────────────────────── */}
        <div className="hidden lg:flex left-panel">
          <div className="left-panel-inner">
            {/* Decorative blobs */}
            <div className="blob-decoration" />
            <div className="orb-1" />
            <div className="orb-2" />

            {/* Content */}
            <div>
              <div className="inline-flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm border border-white/20 relative z-10 transition-all hover:bg-white/15">
                <Recycle className="w-6 h-6 text-[#9CF06B]" />
                <span className="font-display font-semibold text-lg text-white">ReVive Energy</span>
                <Sparkles className="w-4 h-4 text-[#9CF06B] animate-pulse" />
              </div>
              <div className="mt-8 relative z-10">
                <p className="font-mono-cw text-sm uppercase tracking-[0.25em] text-[#9CF06B]">
                  {showSignup ? `Join as ${currentRole.label}` : "Welcome Back"}
                </p>
                <h1 className="font-display mt-3 text-3xl font-bold leading-tight text-white">
                  {showSignup ? "Create Your Account." : "Transform Waste."}
                  <br />
                  <span className="text-[#9CF06B]">
                    {showSignup ? "Start Making Impact." : "Create Value."}
                  </span>
                </h1>
                <p className="mt-5 text-green-200 text-base leading-7 max-w-lg">
                  {showSignup
                    ? `Join ReVive Energy as a ${currentRole.label} and start making a difference.`
                    : "Access your account to track waste collections, manage partnerships, and monitor your environmental impact."}
                </p>
              </div>
            </div>

            {/* Stats grid – glassmorphic */}
            <div className="grid grid-cols-2 gap-3 mt-6 relative z-10">
              <div className="glass-stat rounded-2xl p-4 border border-white/20">
                <p className="font-display text-2xl font-bold text-white">1,200+</p>
                <p className="text-sm text-[#9CF06B]">Active Partners</p>
              </div>
              <div className="glass-stat rounded-2xl p-4 border border-white/20">
                <p className="font-display text-2xl font-bold text-white">125K+</p>
                <p className="text-sm text-[#9CF06B]">Tons Processed</p>
              </div>
              <div className="glass-stat rounded-2xl p-4 border border-white/20">
                <p className="font-display text-2xl font-bold text-white">85K+</p>
                <p className="text-sm text-[#9CF06B]">MWh Generated</p>
              </div>
              <div className="glass-stat rounded-2xl p-4 border border-white/20">
                <p className="font-display text-2xl font-bold text-white">24/7</p>
                <p className="text-sm text-[#9CF06B]">Support</p>
              </div>
            </div>

            {/* Feature list – glassmorphic */}
            <div className="mt-4 space-y-2 relative z-10">
              <div className="feature-item flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/90">
                <Truck className="w-4 h-4 text-[#9CF06B]" />
                <span>Free collection for qualified partners</span>
              </div>
              <div className="feature-item flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/90">
                <ShieldCheck className="w-4 h-4 text-[#9CF06B]" />
                <span>Verified waste streams & processing</span>
              </div>
              <div className="feature-item flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/90">
                <Headphones className="w-4 h-4 text-[#9CF06B]" />
                <span>24/7 customer support</span>
              </div>
              <div className="feature-item flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/90">
                <Leaf className="w-4 h-4 text-[#9CF06B]" />
                <span>Real‑time carbon impact tracking</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Right Panel ────────────────────────────────────── */}
        <div className="p-6 sm:p-8 lg:p-10 flex items-center signup-scroll">
          <div className="w-full max-w-md mx-auto">
            <div className="lg:hidden mb-6 text-center">
              <div className="mx-auto mb-3 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0E2A1C] to-[#11402D] flex items-center justify-center text-white shadow-lg">
                <Recycle className="w-7 h-7" />
              </div>
              <h1 className="font-display text-2xl font-bold text-slate-900">
                Re<span className="text-green-600">V</span>ive <span className="text-green-600">Energy</span>
              </h1>
              <p className="font-mono-cw text-xs text-green-600 mt-1 tracking-wider">TRANSFORMING WASTE</p>
            </div>

            {!showSignup ? (
              <>
                <p className="text-xs font-semibold tracking-[0.2em] text-[#11402D] uppercase">Login</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">Welcome back</h2>
                <p className="mt-1.5 text-sm text-slate-500 leading-6">Please enter your details to access your account.</p>

                <form onSubmit={handleLogin} autoComplete="off" className="mt-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
                      Email Address
                    </label>
                    <div className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 input-field">
                      <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={loginData.email}
                        onChange={handleLoginChange}
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
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-xs font-semibold text-[#11402D] hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 input-field">
                      <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        required
                        autoComplete="new-password"
                        className="w-full bg-transparent outline-none text-slate-700 placeholder:text-slate-400 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {loginError && (
                    <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {loginError}
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
                        <span>Login</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-7">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-px flex-1 bg-slate-200" />
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                      Don't have an account?
                    </p>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>
                  <div className="grid gap-2.5">
                    <button
                      onClick={() => openSignup("waste-supplier")}
                      className="btn-role flex items-center gap-3 text-sm font-medium text-slate-700 px-4 py-3 rounded-lg border border-slate-200"
                    >
                      <Landmark className="w-4 h-4 text-[#11402D] flex-shrink-0" />
                      Join as Waste Supplier
                    </button>
                    <button
                      onClick={() => openSignup("energy-producer")}
                      className="btn-role flex items-center gap-3 text-sm font-medium text-slate-700 px-4 py-3 rounded-lg border border-slate-200"
                    >
                      <Zap className="w-4 h-4 text-[#11402D] flex-shrink-0" />
                      Join as Energy Producer
                    </button>
                    <button
                      onClick={() => openSignup("transport-partner")}
                      className="btn-role flex items-center gap-3 text-sm font-medium text-slate-700 px-4 py-3 rounded-lg border border-slate-200"
                    >
                      <Truck className="w-4 h-4 text-[#11402D] flex-shrink-0" />
                      Join as Transport Partner
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.2em] text-[#11402D] uppercase">
                      Step {step} of 5
                    </p>
                    <h2 className="text-xl font-bold text-slate-900 mt-1">
                      {step === 1 ? "Business Details" :
                       step === 2 ? "Specialization" :
                       step === 3 ? "Account Setup" :
                       step === 4 ? "Terms & Conditions" :
                       "Email Verification"}
                    </h2>
                    <p className="text-slate-500 text-sm mt-0.5">
                      {step === 1 ? "Tell us about your business" :
                       step === 2 ? "Select your specialty" :
                       step === 3 ? "Create your credentials" :
                       step === 4 ? "Review our policies" :
                       "Verify your email address"}
                    </p>
                  </div>
                  <button onClick={closeSignup} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors flex-shrink-0">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex gap-1.5 mb-6">
                  {[1,2,3,4,5].map((item) => (
                    <div
                      key={item}
                      className={`h-1 rounded-full flex-1 transition-colors ${
                        item <= step ? "bg-[#11402D]" : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>

                {signupError && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-600 flex items-center gap-2 mb-5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {signupError}
                  </div>
                )}

                <form onSubmit={(e) => e.preventDefault()}>
                  {step === 1 && Step1()}
                  {step === 2 && Step2()}
                  {step === 3 && Step3()}
                  {step === 4 && Step4()}
                  {step === 5 && Step5()}
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ─── Forgot Password Modal ───────────────────────────── */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        prefilledEmail={loginData.email}
      />
    </div>
  );
}

export default Login;