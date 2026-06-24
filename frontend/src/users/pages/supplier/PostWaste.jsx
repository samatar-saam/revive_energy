// src/users/pages/supplier/PostWaste.jsx
import { useState, useRef } from "react";
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFormErrors((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
  };

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

    reader.onload = (event) => {
      const imageData = event.target.result;
      setImagePreview(imageData);
      setFormData((prev) => ({
        ...prev,
        image_url: imageData,
      }));
    };

    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e) => {
    handleImage(e.target.files?.[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleImage(e.dataTransfer.files?.[0]);
  };

  const removeImage = () => {
    setImagePreview("");
    setFormData((prev) => ({
      ...prev,
      image_url: "",
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateStep = (stepNumber) => {
    const errors = {};

    if (stepNumber === 1) {
      if (!formData.waste_type.trim()) errors.waste_type = "Waste type is required";
      if (!formData.category) errors.category = "Category is required";
      if (!formData.quantity || Number(formData.quantity) <= 0) {
        errors.quantity = "Valid quantity is required";
      }
    }

    if (stepNumber === 2) {
      if (!formData.location.trim()) errors.location = "Location is required";
      if (!formData.pickup_address.trim()) errors.pickup_address = "Pickup address is required";
      if (!formData.pickup_date) errors.pickup_date = "Pickup date is required";
      if (!formData.pickup_time) errors.pickup_time = "Pickup time is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(1) || !validateStep(2)) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You are not logged in.");
      }

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

      if (!response.ok) {
        throw new Error(data.message || "Failed to create waste listing.");
      }

      setSuccess("Waste listing created successfully. Redirecting...");

      setTimeout(() => {
        navigate("/dashboard/listings");
      }, 1500);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full rounded-xl border bg-gray-50 px-4 py-3 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-green-500 ${
      formErrors[field] ? "border-red-500 ring-2 ring-red-100" : "border-gray-200"
    }`;

  const iconInputClass = (field) =>
    `w-full rounded-xl border bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-green-500 ${
      formErrors[field] ? "border-red-500 ring-2 ring-red-100" : "border-gray-200"
    }`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate("/dashboard/listings")}
          className="rounded-xl p-2 transition hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>

        <div>
          <h1 className="text-2xl font-black text-gray-900">Post Waste Listing</h1>
          <p className="mt-1 text-sm text-gray-500">
            Add waste details so energy producers can request it.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-8 flex items-center gap-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                  item === step
                    ? "bg-[#11402D] text-white"
                    : item < step
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {item < step ? <CheckCircle className="h-4 w-4" /> : item}
              </div>

              {item < 3 && (
                <div
                  className={`h-1 w-14 rounded-full ${
                    item < step ? "bg-[#11402D]" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Waste Type" error={formErrors.waste_type}>
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      name="waste_type"
                      value={formData.waste_type}
                      onChange={handleChange}
                      placeholder="e.g. Organic Waste"
                      className={iconInputClass("waste_type")}
                    />
                  </div>
                </Field>

                <Field label="Category" error={formErrors.category}>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
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

              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Quantity" error={formErrors.quantity}>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
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

                <Field label="Availability Window">
                  <select
                    name="availability_window"
                    value={formData.availability_window}
                    onChange={handleChange}
                    className={inputClass("availability_window")}
                  >
                    <option value="business_hours">Business Hours</option>
                    <option value="any_time">Any Time</option>
                    <option value="custom">Custom</option>
                  </select>
                </Field>
              </div>

              <button
                type="button"
                onClick={nextStep}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#11402D] py-3.5 font-bold text-white transition hover:bg-[#0E2A1C]"
              >
                Continue <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Location" error={formErrors.location}>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Nairobi, Kenya"
                      className={iconInputClass("location")}
                    />
                  </div>
                </Field>

                <Field label="Pickup Address" error={formErrors.pickup_address}>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      name="pickup_address"
                      value={formData.pickup_address}
                      onChange={handleChange}
                      placeholder="Street, building, gate"
                      className={iconInputClass("pickup_address")}
                    />
                  </div>
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Pickup Date" error={formErrors.pickup_date}>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      name="pickup_date"
                      value={formData.pickup_date}
                      onChange={handleChange}
                      min={new Date().toISOString().split("T")[0]}
                      className={iconInputClass("pickup_date")}
                    />
                  </div>
                </Field>

                <Field label="Pickup Time" error={formErrors.pickup_time}>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="time"
                      name="pickup_time"
                      value={formData.pickup_time}
                      onChange={handleChange}
                      className={iconInputClass("pickup_time")}
                    />
                  </div>
                </Field>
              </div>

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
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#11402D] py-3.5 font-bold text-white transition hover:bg-[#0E2A1C]"
                >
                  Continue <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <Field label="Description">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Describe the waste quality, source, condition, and any important details..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-green-500"
                />
              </Field>

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
                        className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white"
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

              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  {success}
                </div>
              )}

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

function Field({ label, error, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-gray-700">
        {label}
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