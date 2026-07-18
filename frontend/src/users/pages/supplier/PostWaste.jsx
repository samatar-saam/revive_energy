// src/users/pages/supplier/PostWaste.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  MapPin,
  FileText,
  Upload,
  X,
  Calendar,
  Clock,
  Phone,
  User,
  Building2,
  Tag,
  Info,
  ChevronRight,
  ChevronLeft,
  Loader,
  CheckCircle,
  AlertCircle,
  Trash2,
  Edit,
  Eye,
  Shield,
  Award,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function PostWaste() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    waste_type: "",
    category: "",
    quantity: "",
    unit: "kg",
    location: "",
    pickup_address: "",
    pickup_date: "",
    pickup_time: "",
    availability_window: "business_hours",
    description: "",
    image_url: "",
    special_handling: "",
    contact_person: "",
    contact_phone: "",
    additional_notes: "",
  });

  // ─── Load user data ──────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const userData = JSON.parse(stored);
        setUser(userData);
        setFormData((prev) => ({
          ...prev,
          contact_person: userData.full_name || "",
          contact_phone: userData.phone || "",
        }));
      } catch {
        // ignore
      }
    }
  }, []);

  // ─── Validation ──────────────────────────────────────────────
  const validateField = (name, value) => {
    switch (name) {
      case "waste_type":
        return value.trim() ? "" : "Waste type is required";
      case "category":
        return value ? "" : "Category is required";
      case "quantity":
        return value && Number(value) > 0 ? "" : "Valid quantity is required";
      case "location":
        return value.trim() ? "" : "Location is required";
      case "pickup_address":
        return value.trim() ? "" : "Pickup address is required";
      case "pickup_date":
        return value ? "" : "Pickup date is required";
      case "pickup_time":
        return value ? "" : "Pickup time is required";
      default:
        return "";
    }
  };

  const validateStep = (stepNumber) => {
    const errors = {};
    let fields = [];

    if (stepNumber === 1) {
      fields = ["waste_type", "category", "quantity"];
    } else if (stepNumber === 2) {
      fields = ["location", "pickup_address", "pickup_date", "pickup_time"];
    }

    fields.forEach((field) => {
      const err = validateField(field, formData[field]);
      if (err) errors[field] = err;
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, value);
    if (err) {
      setFormErrors((prev) => ({ ...prev, [name]: err }));
    } else {
      setFormErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    setFormErrors((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
  };

  // ─── Image handling ──────────────────────────────────────────
  const handleImage = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
      setFormData((prev) => ({ ...prev, image_url: e.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e) => {
    handleImage(e.target.files?.[0]);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleImage(e.dataTransfer.files?.[0]);
  };

  const removeImage = () => {
    setImagePreview("");
    setFormData((prev) => ({ ...prev, image_url: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ─── Navigation ──────────────────────────────────────────────
  const nextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 3));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ─── Submit ──────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2)) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("You are not logged in.");

      const payload = {
        waste_type: formData.waste_type.trim(),
        category: formData.category,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        location: formData.location.trim(),
        pickup_address: formData.pickup_address.trim(),
        pickup_date: formData.pickup_date,
        pickup_time: formData.pickup_time,
        availability_window: formData.availability_window,
        description: formData.description.trim(),
        image_url: formData.image_url,
        special_handling: formData.special_handling.trim(),
        contact_person: formData.contact_person.trim(),
        contact_phone: formData.contact_phone.trim(),
        additional_notes: formData.additional_notes.trim(),
      };

      const response = await fetch(`${API_URL}/supplier/listings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to create waste listing.");

      setSuccess("✅ Waste listing created successfully! Redirecting...");
      setTimeout(() => navigate("/dashboard/listings"), 1500);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Helper: input classes ──────────────────────────────────
  const inputClass = (field) =>
    `w-full rounded-xl border bg-gray-50 px-4 py-3 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-[#9CF06B] ${
      formErrors[field] && touched[field] ? "border-red-500 ring-2 ring-red-100" : "border-gray-200"
    }`;

  const iconInputClass = (field) =>
    `w-full rounded-xl border bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-[#9CF06B] ${
      formErrors[field] && touched[field] ? "border-red-500 ring-2 ring-red-100" : "border-gray-200"
    }`;

  // ─── Waste type options ──────────────────────────────────────
  const wasteTypes = [
    "Organic Waste",
    "Food Waste",
    "Agricultural Waste",
    "Plastic Waste",
    "Paper & Cardboard",
    "Industrial Waste",
    "E-Waste",
    "Textile Waste",
    "Construction Waste",
    "Biomass Waste",
    "Mixed Waste",
    "Other",
  ];

  // ─── Render ──────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 font-sans">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate("/dashboard/listings")}
          className="rounded-xl p-2 transition hover:bg-gray-100"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Post Waste Listing</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Add waste details so energy producers can request it. Pricing is automatically calculated.
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="mb-8 flex items-center gap-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition ${
                item === step
                  ? "bg-[#11402D] text-white ring-4 ring-[#9CF06B]/30"
                  : item < step
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {item < step ? <CheckCircle className="h-4 w-4" /> : item}
            </div>
            {item < 3 && (
              <div
                className={`h-1 w-14 rounded-full transition ${
                  item < step ? "bg-[#11402D]" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Form */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} noValidate>
          {step === 1 && (
            <div className="space-y-5">
              {/* Waste Type & Category */}
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Waste Type"
                  error={touched.waste_type && formErrors.waste_type}
                  required
                >
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <select
                      name="waste_type"
                      value={formData.waste_type}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={iconInputClass("waste_type")}
                    >
                      <option value="">Select waste type</option>
                      {wasteTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </Field>

                <Field
                  label="Category"
                  error={touched.category && formErrors.category}
                  required
                >
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={iconInputClass("category")}
                    >
                      <option value="">Select category</option>
                      <option value="food_waste">Food Waste</option>
                      <option value="agricultural">Agricultural Waste</option>
                      <option value="plastic">Plastic Waste</option>
                      <option value="industrial">Industrial Waste</option>
                      <option value="biomass">Biomass Waste</option>
                      <option value="mixed">Mixed Waste</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </Field>
              </div>

              {/* Quantity & Unit */}
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Quantity"
                  error={touched.quantity && formErrors.quantity}
                  required
                >
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="500"
                    min="0.01"
                    step="0.01"
                    className={inputClass("quantity")}
                  />
                </Field>

                <Field label="Unit">
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className={inputClass("unit")}
                  >
                    <option value="kg">Kilograms</option>
                    <option value="tons">Tons</option>
                    <option value="cubic_metres">Cubic Metres</option>
                  </select>
                </Field>
              </div>

              {/* Pricing info */}
              <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
                <p className="font-medium">💡 Platform Pricing</p>
                <p className="mt-1 text-xs leading-relaxed">
                  The platform automatically calculates the <strong>waste value</strong> and{" "}
                  <strong>transport fee</strong> based on the waste type and quantity.
                  <br />
                  A <strong>5% platform fee</strong> is added to the total.
                </p>
              </div>

              <button
                type="button"
                onClick={nextStep}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#11402D] py-3.5 font-bold text-white transition hover:bg-[#0E2A1C] focus:outline-none focus:ring-4 focus:ring-[#9CF06B]/50"
              >
                Continue <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              {/* Location & Pickup Address */}
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Location"
                  error={touched.location && formErrors.location}
                  required
                >
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Nairobi, Kenya"
                      className={iconInputClass("location")}
                    />
                  </div>
                </Field>

                <Field
                  label="Pickup Address"
                  error={touched.pickup_address && formErrors.pickup_address}
                  required
                >
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      name="pickup_address"
                      value={formData.pickup_address}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Street, building, gate"
                      className={iconInputClass("pickup_address")}
                    />
                  </div>
                </Field>
              </div>

              {/* Pickup Date & Time */}
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Pickup Date"
                  error={touched.pickup_date && formErrors.pickup_date}
                  required
                >
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      name="pickup_date"
                      value={formData.pickup_date}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      min={new Date().toISOString().split("T")[0]}
                      className={iconInputClass("pickup_date")}
                    />
                  </div>
                </Field>

                <Field
                  label="Pickup Time"
                  error={touched.pickup_time && formErrors.pickup_time}
                  required
                >
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="time"
                      name="pickup_time"
                      value={formData.pickup_time}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={iconInputClass("pickup_time")}
                    />
                  </div>
                </Field>
              </div>

              {/* Availability Window */}
              <Field label="Availability Window">
                <select
                  name="availability_window"
                  value={formData.availability_window}
                  onChange={handleChange}
                  className={inputClass("availability_window")}
                >
                  <option value="business_hours">Business Hours (8AM – 6PM)</option>
                  <option value="extended">Extended Hours (6AM – 10PM)</option>
                  <option value="24_7">24/7</option>
                  <option value="weekdays_only">Weekdays Only</option>
                  <option value="weekends_only">Weekends Only</option>
                  <option value="by_appointment">By Appointment</option>
                </select>
              </Field>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-100 py-3.5 font-semibold text-gray-700 transition hover:bg-gray-200"
                >
                  <ChevronLeft className="h-5 w-5" /> Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#11402D] py-3.5 font-bold text-white transition hover:bg-[#0E2A1C] focus:outline-none focus:ring-4 focus:ring-[#9CF06B]/50"
                >
                  Continue <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              {/* Description */}
              <Field label="Description">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe the waste quality, source, condition, and any important details..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-[#9CF06B]"
                />
              </Field>

              {/* Special Handling & Contact */}
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Special Handling">
                  <div className="relative">
                    <Info className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      name="special_handling"
                      value={formData.special_handling}
                      onChange={handleChange}
                      placeholder="e.g. Needs sealed bags"
                      className={iconInputClass("special_handling")}
                    />
                  </div>
                </Field>

                <Field label="Contact Person">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      name="contact_person"
                      value={formData.contact_person}
                      onChange={handleChange}
                      placeholder="Contact name"
                      className={iconInputClass("contact_person")}
                    />
                  </div>
                </Field>
              </div>

              {/* Contact Phone & Additional Notes */}
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Contact Phone">
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      name="contact_phone"
                      value={formData.contact_phone}
                      onChange={handleChange}
                      placeholder="+254 700 000 000"
                      className={iconInputClass("contact_phone")}
                    />
                  </div>
                </Field>

                <Field label="Additional Notes">
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      name="additional_notes"
                      value={formData.additional_notes}
                      onChange={handleChange}
                      placeholder="Extra details"
                      className={iconInputClass("additional_notes")}
                    />
                  </div>
                </Field>
              </div>

              {/* Image Upload */}
              <Field label="Waste Image">
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                  }}
                  className={`relative rounded-2xl border-2 border-dashed p-6 text-center transition ${
                    isDragging ? "border-[#11402D] bg-green-50" : "border-gray-300 bg-gray-50"
                  }`}
                >
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Waste preview"
                        className="max-h-56 rounded-xl object-contain"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white transition hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="mx-auto mb-3 h-10 w-10 text-gray-400" />
                      <p className="text-sm text-gray-500">
                        Drag and drop an image or click to upload
                      </p>
                      <p className="mt-1 text-xs text-gray-400">PNG or JPG, max 5MB</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                </div>
              </Field>

              {/* Status messages */}
              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-100 py-3.5 font-semibold text-gray-700 transition hover:bg-gray-200"
                >
                  <ChevronLeft className="h-5 w-5" /> Back
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#11402D] py-3.5 font-bold text-white transition hover:bg-[#0E2A1C] disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Create Listing
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

// ─── Field component ──────────────────────────────────────────
function Field({ label, error, required, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}