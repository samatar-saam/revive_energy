import { useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight, CheckCircle2, Mail, Phone, MapPin, Clock,
  Send, MessageSquare, User, Building2, Globe,  ChevronRight,
  Headphones, Award, Users, Zap, Leaf, Recycle
} from "lucide-react";

/* ─── MAIN CONTACT PAGE ─── */
export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        subject: "",
        message: ""
      });
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      details: ["+254 700 123 456", "+254 700 123 457"],
      action: "Call us →"
    },
    {
      icon: Mail,
      title: "Email",
      details: ["info@reviveenergy.com", "support@reviveenergy.com"],
      action: "Send email →"
    },
    {
      icon: MapPin,
      title: "Office",
      details: ["Nairobi, Kenya", "Westlands, 8th Floor"],
      action: "Get directions →"
    },
    {
      icon: Clock,
      title: "Working Hours",
      details: ["Mon - Fri: 8:00 - 18:00", "Sat: 9:00 - 13:00"],
      action: "Book appointment →"
    }
  ];



  return (
    <div className="min-h-screen bg-white overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;700;800;900&display=swap');
        .font-serif-display { font-family: 'DM Serif Display', serif; }
      `}</style>

      {/* ============ HERO SECTION - NO SPACE, MOVED UP ============ */}
      <section className="relative min-h-[45vh] flex items-center bg-white pt-0">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-10 w-96 h-96 bg-[#9CF06B]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-[#11402D]/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-8 lg:py-12">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="font-serif-display text-5xl sm:text-6xl lg:text-7xl text-[#0A1A0F] leading-[1.1] tracking-tight mb-6">
              Let's
              <span className="relative inline-block mx-3">
                <span className="relative z-10 text-[#11402D]">connect.</span>
                <svg className="absolute -bottom-2 left-0 w-full" height="10" viewBox="0 0 300 10" preserveAspectRatio="none">
                  <path d="M2 6C60 2 240 2 298 6" stroke="#9CF06B" strokeWidth="5" strokeLinecap="round" fill="none" />
                </svg>
              </span>
            </h1>
            
            <p className="text-xl text-[#5A7060] leading-relaxed max-w-2xl mx-auto">
              Have questions about our solutions? Need a custom proposal? Our team is here to help you turn waste into value.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ============ CONTACT INFO CARDS ============ */}
      <section className="py-12 bg-[#F6F8F4]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-4 gap-4">
            {contactInfo.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-xl transition-all border border-[#11402D]/5 group"
              >
                <div className="w-12 h-12 rounded-full bg-[#11402D] flex items-center justify-center mx-auto mb-4 group-hover:bg-[#0A1A0F] transition-colors">
                  <item.icon className="w-6 h-6 text-[#9CF06B]" />
                </div>
                <h3 className="font-bold text-[#0A1A0F] text-center mb-2">{item.title}</h3>
                {item.details.map((detail, j) => (
                  <p key={j} className="text-sm text-[#5A7060] text-center">{detail}</p>
                ))}
                <button className="text-xs font-semibold text-[#11402D] mt-3 hover:text-[#0A1A0F] transition-colors flex items-center justify-center gap-1 mx-auto">
                  {item.action}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CONTACT FORM & MAP ============ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-3"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-px bg-[#11402D]" />
                <span className="text-xs font-bold tracking-wider text-[#11402D] uppercase">Get in Touch</span>
              </div>
              <h2 className="font-serif-display text-3xl sm:text-4xl text-[#0A1A0F] mb-4">
                Send us a message
              </h2>
              <p className="text-[#5A7060] mb-8">
                Fill in the form below and our team will get back to you within 24 hours.
              </p>

              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#9CF06B]/10 border border-[#9CF06B] rounded-2xl p-8 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-[#9CF06B] flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-[#11402D]" />
                  </div>
                  <h3 className="font-bold text-xl text-[#0A1A0F] mb-2">Message Sent!</h3>
                  <p className="text-[#5A7060]">Thank you for reaching out. We'll get back to you shortly.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-[#0A1A0F] mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A7060]" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#11402D]/10 focus:border-[#11402D] focus:ring-2 focus:ring-[#11402D]/10 transition-all bg-[#F6F8F4]"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#0A1A0F] mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A7060]" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#11402D]/10 focus:border-[#11402D] focus:ring-2 focus:ring-[#11402D]/10 transition-all bg-[#F6F8F4]"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-[#0A1A0F] mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A7060]" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#11402D]/10 focus:border-[#11402D] focus:ring-2 focus:ring-[#11402D]/10 transition-all bg-[#F6F8F4]"
                          placeholder="+254 700 123 456"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#0A1A0F] mb-2">
                        Company
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A7060]" />
                        <input
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#11402D]/10 focus:border-[#11402D] focus:ring-2 focus:ring-[#11402D]/10 transition-all bg-[#F6F8F4]"
                          placeholder="Company Name"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0A1A0F] mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-[#11402D]/10 focus:border-[#11402D] focus:ring-2 focus:ring-[#11402D]/10 transition-all bg-[#F6F8F4]"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0A1A0F] mb-2">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="5"
                      className="w-full px-4 py-3 rounded-xl border border-[#11402D]/10 focus:border-[#11402D] focus:ring-2 focus:ring-[#11402D]/10 transition-all bg-[#F6F8F4] resize-none"
                      placeholder="Tell us about your waste management needs..."
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                      isSubmitting ? 'bg-[#5A7060]' : 'bg-[#11402D] hover:bg-[#0A1A0F]'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin">⟳</span>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message <Send className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </form>
              )}
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <div className="bg-[#F6F8F4] rounded-2xl p-8 sticky top-8">
                <h3 className="font-bold text-lg text-[#0A1A0F] mb-6">Quick Connect</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-sm text-[#11402D] mb-2">Emergency Support</h4>
                    <p className="text-sm text-[#5A7060]">24/7 support for urgent issues</p>
                    <a href="tel:+254700123456" className="text-[#11402D] font-bold text-sm block mt-1">
                      +254 700 123 456
                    </a>
                  </div>

                  <div className="border-t border-[#11402D]/10 pt-6">
                    <h4 className="font-semibold text-sm text-[#11402D] mb-2">Sales Inquiries</h4>
                    <p className="text-sm text-[#5A7060]">For sales and partnership</p>
                    <a href="mailto:sales@reviveenergy.com" className="text-[#11402D] font-bold text-sm block mt-1">
                      sales@reviveenergy.com
                    </a>
                  </div>

                  

                  <div className="border-t border-[#11402D]/10 pt-6">
                    <div className="bg-[#11402D] rounded-xl p-4 text-white text-center">
                      <Recycle className="w-8 h-8 text-[#9CF06B] mx-auto mb-2" />
                      <p className="text-sm font-semibold">Free Waste Assessment</p>
                      <p className="text-xs text-white/60 mt-1">Book a consultation today</p>
                      <button className="mt-3 text-xs font-bold text-[#11402D] bg-[#9CF06B] px-4 py-2 rounded-full hover:bg-[#8AE05A] transition-colors">
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ MAP SECTION ============ */}
      <section className="py-24 bg-[#F6F8F4]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <div className="flex justify-center mb-6">
              <div className="w-12 h-px bg-[#11402D]" />
            </div>
            <h2 className="font-serif-display text-3xl sm:text-4xl text-[#0A1A0F] mb-4">
              Find Us Here
            </h2>
            <p className="text-lg text-[#5A7060]">
              Visit our headquarters in Nairobi, Kenya
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-2xl overflow-hidden shadow-xl border border-[#11402D]/5"
          >
            {/* Google Maps Embed */}
            <div className="w-full h-[450px] bg-[#F6F8F4]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d255282.3585374525!2d36.6821976484375!3d-1.3028611!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f1172d84d49a7%3A0xf7cf0254b297924c!2sNairobi%2C%20Kenya!5e0!3m2!1sen!2s!4v1700000000000"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="ReVive Energy Location"
              />
            </div>
            
            {/* Map Overlay Card */}
            <div className="absolute bottom-6 left-6 right-6 md:right-auto md:max-w-xs">
              <div className="bg-white rounded-xl shadow-xl p-5 border border-[#11402D]/5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#11402D] flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[#9CF06B]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0A1A0F] text-sm">ReVive Energy Headquarters</h4>
                    <p className="text-xs text-[#5A7060] mt-1">
                      Westlands Business Park, 8th Floor<br />
                      Nairobi, Kenya
                    </p>
                    <div className="flex gap-3 mt-2">
                      <a 
                        href="https://maps.google.com/maps?daddr=Westlands+Business+Park+Nairobi+Kenya" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#11402D] text-xs font-semibold hover:text-[#0A1A0F] transition-colors flex items-center gap-1"
                      >
                        Get Directions <ArrowRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ CTA SECTION ============ */}
      <section className="py-20 bg-[#11402D]">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 rounded-full bg-[#9CF06B]/10 flex items-center justify-center mx-auto mb-6">
              <Headphones className="w-8 h-8 text-[#9CF06B]" />
            </div>
            <h2 className="font-serif-display text-3xl sm:text-4xl text-white mb-4">
              Need immediate assistance?
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto mb-8">
              Our team is ready to help. Reach out and we'll respond within 24 hours.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                className="bg-[#9CF06B] text-[#11402D] font-bold px-8 py-3 rounded-full text-sm shadow-lg flex items-center gap-2"
              >
                <Phone className="w-4 h-4" /> Call Now
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                className="border-2 border-white/20 text-white font-bold px-8 py-3 rounded-full text-sm flex items-center gap-2"
              >
                <Mail className="w-4 h-4" /> Email Us
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}