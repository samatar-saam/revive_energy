import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
} from "lucide-react";

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
  });

  const [emailCode, setEmailCode] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [emailTimer, setEmailTimer] = useState(0);
  const [resendEmailDisabled, setResendEmailDisabled] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

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
    setSignupData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
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
        return;
      }

      if (!signupData.business_name.trim()) {
        setSignupError("Business name is required");
        return;
      }

      if (!signupData.business_type) {
        setSignupError("Business type is required");
        return;
      }
    }

    if (step === 2) {
      const wasteLen = signupData.wasteTypes.length;
      const energyLen = signupData.energyTypes.length;
      const vehicleLen = signupData.vehicleTypes.length;

      if (selectedRole === "waste-supplier" && wasteLen === 0) {
        setSignupError("Select at least one waste type");
        return;
      }

      if (selectedRole === "energy-producer" && energyLen === 0) {
        setSignupError("Select at least one energy type");
        return;
      }

      if (selectedRole === "transport-partner" && vehicleLen === 0) {
        setSignupError("Select at least one vehicle type");
        return;
      }
    }

    if (step === 3) {
      if (!signupData.email || !signupData.email.includes("@")) {
        setSignupError("Valid email is required");
        return;
      }

      if (!signupData.phone.trim()) {
        setSignupError("Phone number is required");
        return;
      }

      if (signupData.password.length < 6) {
        setSignupError("Password must be at least 6 characters");
        return;
      }

      if (signupData.password !== signupData.confirmPassword) {
        setSignupError("Passwords do not match");
        return;
      }
    }

    setSignupError("");
    setStep((prev) => Math.min(prev + 1, 4));
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

    try {
      const res = await fetch(`${API_URL}/register/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: signupData.email,
          phone: signupData.phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send verification email");
      }

      setEmailCodeSent(true);
      setEmailTimer(60);
      setResendEmailDisabled(true);
      toast.success("Verification code sent to your email");
    } catch (err) {
      toast.error(err.message || "Failed to send verification code");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const verifyEmailCode = async () => {
    if (emailCode.length !== 6) {
      toast.error("Enter the 6-digit verification code");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/register/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: signupData.email,
          code: emailCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid verification code");
      }

      setEmailVerified(true);
      toast.success("Email verified successfully");
    } catch (err) {
      toast.error(err.message || "Email verification failed");
    }
  };

  const completeSignup = async () => {
    if (!emailVerified) {
      toast.error("Please verify your email first");
      return;
    }

    setIsSigningUp(true);

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
      };

      const res = await fetch(`${API_URL}/register/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      toast.success("Account created successfully. Please login.");

      setShowSignup(false);
      setLoginData((prev) => ({
        ...prev,
        email: signupData.email,
      }));

      resetSignupState();
    } catch (err) {
      toast.error(err.message || "Registration failed");
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    setLoginError("");

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("loginTime", new Date().toISOString());

      toast.success(`Welcome ${data.user.full_name}!`);

      const redirectMap = {
        supplier: "/dashboard",
        producer: "/dashboard",
        transporter: "/dashboard",
        admin: "/admin",
      };

      navigate(redirectMap[data.user.role] || "/dashboard");
    } catch (err) {
      setLoginError(err.message);
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
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
    if (nextInput) {
      nextInput.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      const prevInput = document.getElementById(`email-code-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const renderRoleSpecificFields = () => {
    const isSelected = (arrayKey, id) => signupData[arrayKey].includes(id);

    if (selectedRole === "waste-supplier") {
      return (
        <>
          <label className="font-display block text-sm font-semibold text-slate-700 mb-3">
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
                  className={`p-3 rounded-xl text-center transition-all border-2 ${
                    selected
                      ? "border-[#11402D] bg-[#11402D]/5"
                      : "border-slate-200 bg-white hover:border-[#11402D]/30"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 mx-auto mb-1 ${
                      selected ? "text-[#11402D]" : "text-slate-400"
                    }`}
                  />

                  <div
                    className={`font-display text-[10px] font-bold ${
                      selected ? "text-[#11402D]" : "text-slate-600"
                    }`}
                  >
                    {type.label}
                  </div>

                  {selected && (
                    <Check className="w-3 h-3 mx-auto mt-1 text-[#34D399]" />
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
          <label className="font-display block text-sm font-semibold text-slate-700 mb-3">
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
                  className={`p-3 rounded-xl text-center transition-all border-2 ${
                    selected
                      ? "border-[#11402D] bg-[#11402D]/5"
                      : "border-slate-200 bg-white hover:border-[#11402D]/30"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 mx-auto mb-1 ${
                      selected ? "text-[#11402D]" : "text-slate-400"
                    }`}
                  />

                  <div
                    className={`font-display text-[10px] font-bold ${
                      selected ? "text-[#11402D]" : "text-slate-600"
                    }`}
                  >
                    {type.label}
                  </div>

                  {selected && (
                    <Check className="w-3 h-3 mx-auto mt-1 text-[#34D399]" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4">
            <label className="font-display block text-sm font-semibold text-slate-700 mb-1">
              Facility Capacity
            </label>

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
              <Gauge className="w-4 h-4 text-slate-400" />

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
        <div className="mb-4">
          <label className="font-display block text-sm font-semibold text-slate-700 mb-1">
            Fleet Size
          </label>

          <div className="relative">
            <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

            <select
              name="fleetSize"
              value={signupData.fleetSize}
              onChange={handleSignupChange}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-green-500 transition appearance-none"
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

        <label className="font-display block text-sm font-semibold text-slate-700 mb-3">
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
                className={`p-3 rounded-xl text-center transition-all border-2 ${
                  selected
                    ? "border-[#11402D] bg-[#11402D]/5"
                    : "border-slate-200 bg-white hover:border-[#11402D]/30"
                }`}
              >
                <Icon
                  className={`w-5 h-5 mx-auto mb-1 ${
                    selected ? "text-[#11402D]" : "text-slate-400"
                  }`}
                />

                <div
                  className={`font-display text-[10px] font-bold ${
                    selected ? "text-[#11402D]" : "text-slate-600"
                  }`}
                >
                  {type.label}
                </div>

                {selected && <Check className="w-3 h-3 mx-auto mt-1 text-[#34D399]" />}
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          <label className="font-display block text-sm font-semibold text-slate-700 mb-1">
            Coverage Area
          </label>

          <div className="relative">
            <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

            <input
              type="text"
              name="coverageArea"
              value={signupData.coverageArea}
              onChange={handleSignupChange}
              placeholder="e.g. Nairobi, Mombasa, Garissa"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-green-500 transition"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="font-display block text-sm font-semibold text-slate-700 mb-1">
            License / Permit Number
          </label>

          <div className="relative">
            <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

            <input
              type="text"
              name="licenseNumber"
              value={signupData.licenseNumber}
              onChange={handleSignupChange}
              placeholder="Enter license number"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-green-500 transition"
            />
          </div>
        </div>
      </>
    );
  };

  const Step1 = () => (
    <div className="space-y-4">
      <div>
        <label className="font-display block text-sm font-semibold text-slate-700 mb-1">
          Full Name *
        </label>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 focus-within:ring-2 focus-within:ring-green-500 transition">
          <User className="w-4 h-4 text-slate-400" />

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
        <label className="font-display block text-sm font-semibold text-slate-700 mb-1">
          Business / Organization Name *
        </label>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 focus-within:ring-2 focus-within:ring-green-500 transition">
          <Building2 className="w-4 h-4 text-slate-400" />

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
        <label className="font-display block text-sm font-semibold text-slate-700 mb-1">
          Business Type *
        </label>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 focus-within:ring-2 focus-within:ring-green-500 transition">
          <Briefcase className="w-4 h-4 text-slate-400" />

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
        <label className="font-display block text-sm font-semibold text-slate-700 mb-1">
          Location
        </label>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 focus-within:ring-2 focus-within:ring-green-500 transition">
          <MapPin className="w-4 h-4 text-slate-400" />

          <input
            type="text"
            name="location"
            placeholder="Enter your location"
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
        className="w-full py-3 rounded-xl bg-[#11402D] text-white font-display font-bold text-sm hover:bg-[#0E2A1C] transition-all"
      >
        Continue <ArrowRight className="w-4 h-4 inline" />
      </button>
    </div>
  );

  const Step2 = () => (
    <div>
      {renderRoleSpecificFields()}

      <div className="flex gap-3 mt-4">
        <button
          type="button"
          onClick={prevStep}
          className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-display font-bold text-sm hover:bg-slate-50 transition-all"
        >
          Back
        </button>

        <button
          type="button"
          onClick={nextStep}
          className="flex-1 py-3 rounded-xl bg-[#11402D] text-white font-display font-bold text-sm hover:bg-[#0E2A1C] transition-all"
        >
          Continue
        </button>
      </div>
    </div>
  );

  const Step3 = () => (
    <div className="space-y-4">
      <div>
        <label className="font-display block text-sm font-semibold text-slate-700 mb-1">
          Email Address *
        </label>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 focus-within:ring-2 focus-within:ring-green-500 transition">
          <Mail className="w-4 h-4 text-slate-400" />

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
        <label className="font-display block text-sm font-semibold text-slate-700 mb-1">
          Phone Number *
        </label>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 focus-within:ring-2 focus-within:ring-green-500 transition">
          <Phone className="w-4 h-4 text-slate-400" />

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
        <label className="font-display block text-sm font-semibold text-slate-700 mb-1">
          Password *
        </label>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 focus-within:ring-2 focus-within:ring-green-500 transition">
          <Lock className="w-4 h-4 text-slate-400" />

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
            className="text-slate-400 hover:text-slate-600"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <div>
        <label className="font-display block text-sm font-semibold text-slate-700 mb-1">
          Confirm Password *
        </label>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 focus-within:ring-2 focus-within:ring-green-500 transition">
          <Lock className="w-4 h-4 text-slate-400" />

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
          onClick={nextStep}
          className="flex-1 py-3 rounded-xl bg-[#11402D] text-white font-display font-bold text-sm hover:bg-[#0E2A1C] transition-all"
        >
          Continue
        </button>
      </div>
    </div>
  );

  const Step4 = () => (
    <div className="space-y-4 text-center">
      <div className="flex justify-center">
        <Mail className="w-16 h-16 text-[#11402D] bg-green-50 p-3 rounded-full" />
      </div>

      <h3 className="font-display text-xl font-bold">Verify Your Email</h3>

      <p className="text-slate-500 text-sm">
        We will send a 6-digit code to{" "}
        <strong>{signupData.email}</strong>
      </p>

      {emailCodeSent && (
        <div className="flex justify-center gap-2 my-4">
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
              className="w-12 h-14 text-center text-2xl font-bold border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          ))}
        </div>
      )}

      {emailCodeSent && (
        <div className="flex justify-center items-center gap-2 text-sm text-slate-500">
          <Clock className="w-4 h-4" />
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
          className={`flex-1 py-3 rounded-xl font-display font-bold text-sm transition-all ${
            isSendingEmail
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : emailVerified
              ? "bg-green-600 text-white"
              : "bg-[#11402D] text-white hover:bg-[#0E2A1C]"
          }`}
        >
          {isSendingEmail ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2" />
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
            className="py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-display font-bold text-sm hover:bg-slate-50 transition-all disabled:opacity-50"
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
          className="w-full py-3 rounded-xl bg-green-600 text-white font-display font-bold text-sm hover:bg-green-700 transition-all disabled:opacity-70"
        >
          {isSigningUp ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2" />
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
      className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4 py-8"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

          .font-display {
            font-family: 'Space Grotesk', sans-serif;
          }

          .font-mono-cw {
            font-family: 'JetBrains Mono', monospace;
          }
        `}
      </style>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <div className="w-full max-w-6xl grid lg:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden border border-green-100">
        <div className="hidden lg:flex relative bg-gradient-to-br from-[#0E2A1C] via-[#11402D] to-[#1a5c3e] p-10 text-white flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm border border-white/20">
              <Recycle className="w-6 h-6" />
              <span className="font-display font-semibold text-lg">
                ReVive Energy
              </span>
            </div>

            <div className="mt-12">
              <p className="font-mono-cw text-sm uppercase tracking-[0.25em] text-green-200">
                {showSignup ? `Join as ${currentRole.label}` : "Welcome Back"}
              </p>

              <h1 className="font-display mt-4 text-4xl font-bold leading-tight">
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

          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="rounded-2xl bg-white/10 p-4 border border-white/20">
              <p className="font-display text-2xl font-bold">1,200+</p>
              <p className="text-sm text-green-200">Active Partners</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 border border-white/20">
              <p className="font-display text-2xl font-bold">125K+</p>
              <p className="text-sm text-green-200">Tons Processed</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 border border-white/20">
              <p className="font-display text-2xl font-bold">85K+</p>
              <p className="text-sm text-green-200">MWh Generated</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 border border-white/20">
              <p className="font-display text-2xl font-bold">24/7</p>
              <p className="text-sm text-green-200">Support</p>
            </div>
          </div>

          <div className="mt-6 space-y-2.5">
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

        <div className="p-6 sm:p-10 lg:p-14 flex items-center max-h-[90vh] overflow-y-auto">
          <div className="w-full max-w-md mx-auto">
            <div className="lg:hidden mb-6 text-center">
              <div className="mx-auto mb-3 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0E2A1C] to-[#11402D] flex items-center justify-center text-white shadow-lg">
                <Recycle className="w-7 h-7" />
              </div>

              <h1 className="font-display text-2xl font-bold text-slate-900">
                Re<span className="text-green-600">V</span>ive{" "}
                <span className="text-green-600">Energy</span>
              </h1>

              <p className="font-mono-cw text-xs text-green-600 mt-1 tracking-wider">
                TRANSFORMING WASTE
              </p>
            </div>

            {!showSignup ? (
              <>
                <p className="font-mono-cw text-sm font-semibold tracking-[0.2em] text-green-600 uppercase">
                  Login
                </p>

                <h2 className="font-display mt-2 text-3xl font-bold text-slate-900">
                  Welcome back!
                </h2>

                <p className="mt-2 text-slate-500 leading-6">
                  Please enter your details to access your account.
                </p>

                <form onSubmit={handleLogin} className="mt-6 space-y-4">
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
                        value={loginData.email}
                        onChange={handleLoginChange}
                        required
                        autoComplete="email"
                        className="w-full bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
                      />
                    </div>
                  </div>

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
                        value={loginData.password}
                        onChange={handleLoginChange}
                        required
                        autoComplete="current-password"
                        className="w-full bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {loginError && (
                    <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {loginError}
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

                <div className="mt-4">
                  <button
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-white px-5 py-3 font-display font-medium text-slate-700 hover:bg-slate-50 transition-all"
                  >
                    Continue with Google
                  </button>
                </div>

                <div className="mt-6 space-y-3">
                  <p className="font-display text-sm text-slate-600 text-center">
                    Don't have an account?
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 flex-wrap">
                    <button
                      onClick={() => openSignup("waste-supplier")}
                      className="inline-flex items-center gap-2 text-sm font-medium text-[#11402D] hover:text-[#0E2A1C] transition-colors group px-4 py-2 rounded-xl border border-[#11402D]/20 hover:border-[#11402D]"
                    >
                      <Landmark className="w-4 h-4 text-[#11402D]" />
                      Join as Waste Supplier
                    </button>

                    <button
                      onClick={() => openSignup("energy-producer")}
                      className="inline-flex items-center gap-2 text-sm font-medium text-[#11402D] hover:text-[#0E2A1C] transition-colors group px-4 py-2 rounded-xl border border-[#11402D]/20 hover:border-[#11402D]"
                    >
                      <Zap className="w-4 h-4 text-[#11402D]" />
                      Join as Energy Producer
                    </button>

                    <button
                      onClick={() => openSignup("transport-partner")}
                      className="inline-flex items-center gap-2 text-sm font-medium text-[#11402D] hover:text-[#0E2A1C] transition-colors group px-4 py-2 rounded-xl border border-[#11402D]/20 hover:border-[#11402D]"
                    >
                      <Truck className="w-4 h-4 text-[#11402D]" />
                      Join as Transport Partner
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-mono-cw text-sm font-semibold tracking-[0.2em] text-green-600 uppercase">
                      Step {step} of 4
                    </p>

                    <h2 className="font-display text-2xl font-bold text-slate-900">
                      {step === 1
                        ? "Business Details"
                        : step === 2
                        ? "Role Details"
                        : step === 3
                        ? "Account Setup"
                        : "Email Verification"}
                    </h2>

                    <p className="text-slate-500 text-sm">
                      {step === 1
                        ? "Tell us about your business"
                        : step === 2
                        ? "Select your specialty"
                        : step === 3
                        ? "Create your credentials"
                        : "Verify your email address"}
                    </p>
                  </div>

                  <button
                    onClick={closeSignup}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>

                <div className="flex gap-2 mb-6">
                  {[1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className={`h-1 rounded-full flex-1 transition-all ${
                        item <= step ? "bg-[#11402D]" : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>

                {signupError && (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-600 flex items-center gap-2 mb-4">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {signupError}
                  </div>
                )}

                <form onSubmit={(e) => e.preventDefault()}>
                  {step === 1 && Step1()}
                  {step === 2 && Step2()}
                  {step === 3 && Step3()}
                  {step === 4 && Step4()}
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;