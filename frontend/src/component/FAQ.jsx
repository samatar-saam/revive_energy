import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  ExternalLink,
  Recycle, // ← added for footer
} from "lucide-react";

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState(null);

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // ─── FAQ Data ──────────────────────────────────────────────
  const faqData = [
    {
      category: "General",
      questions: [
        {
          q: "What is ReVive Energy?",
          a: "ReVive Energy is a platform that connects waste suppliers, energy producers, and transport partners to turn waste into valuable energy. We facilitate the collection, transportation, and processing of organic and recyclable waste into biogas, electricity, and other forms of clean energy.",
        },
        {
          q: "How does the platform work?",
          a: "Waste suppliers list their waste materials, energy producers request waste they need, and transport partners handle the logistics. The platform manages payments, tracking, and compliance to ensure a smooth circular economy.",
        },
        {
          q: "Who can use ReVive Energy?",
          a: "Businesses and organizations that produce waste (hotels, farms, factories), energy producers (biogas plants, waste‑to‑energy facilities), and logistics companies can all join the platform.",
        },
      ],
    },
    {
      category: "Waste Collection",
      questions: [
        {
          q: "What types of waste are accepted?",
          a: "We accept organic waste (food, agricultural), plastics, paper, and other recyclable materials. Specific types depend on the needs of our energy producers – you can see the current requirements on the platform.",
        },
        {
          q: "How do I list my waste?",
          a: "After signing up as a waste supplier, you can create a waste listing by providing the type, quantity, location, and pickup details. Producers will then be able to request your waste.",
        },
        {
          q: "Is there a minimum quantity?",
          a: "Minimum quantities vary by waste type and location. You can check the requirements for each listing or contact our support team for assistance.",
        },
      ],
    },
    {
      category: "Payments",
      questions: [
        {
          q: "How are payments handled?",
          a: "All payments are made through our secure escrow system. The energy producer pays the amount into escrow, and the funds are released to the supplier and transporter once delivery is confirmed.",
        },
        {
          q: "What payment methods are supported?",
          a: "We currently support M‑Pesa, bank transfers, and mobile money options. More payment methods will be added in the future.",
        },
        {
          q: "Are there any fees?",
          a: "There is a small platform fee (typically 5–10%) that covers transaction costs, support, and platform development. The exact fee is shown before you confirm any transaction.",
        },
      ],
    },
    {
      category: "Transport",
      questions: [
        {
          q: "How do I become a transport partner?",
          a: "You can sign up as a transport partner on the platform. You'll need to provide your vehicle details, coverage area, and relevant licenses. Once approved, you can start accepting transport jobs.",
        },
        {
          q: "How are transport fees calculated?",
          a: "Transport fees are based on distance, waste volume, and vehicle type. The platform calculates an estimate, which you can accept or negotiate with the other parties.",
        },
        {
          q: "What if a delivery is delayed?",
          a: "We track all deliveries in real‑time. If a delay occurs, you can communicate with the other parties via the in‑app chat. In case of disputes, our support team will help resolve the issue.",
        },
      ],
    },
    {
      category: "Account & Security",
      questions: [
        {
          q: "How do I reset my password?",
          a: "On the login page, click 'Forgot password?' and follow the instructions to receive a password reset link via email.",
        },
        {
          q: "Is my data secure?",
          a: "Yes. We use encryption, secure APIs, and follow best practices to protect your personal and business data. We never share your data with third parties without your consent.",
        },
        {
          q: "Can I delete my account?",
          a: "Yes. In your profile settings, there is a 'Danger Zone' section where you can deactivate or permanently delete your account. Please note that deletion is irreversible.",
        },
      ],
    },
  ];

  // ─── Filtering ──────────────────────────────────────────────
  const filteredQuestions = useMemo(() => {
    let filtered = faqData;

    // Filter by category
    if (activeCategory !== "all") {
      filtered = filtered.filter(
        (section) => section.category.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.map((section) => ({
        ...section,
        questions: section.questions.filter(
          (item) =>
            item.q.toLowerCase().includes(query) ||
            item.a.toLowerCase().includes(query)
        ),
      }));
      // Remove sections with no matching questions
      filtered = filtered.filter((section) => section.questions.length > 0);
    }

    return filtered;
  }, [activeCategory, searchQuery]);

  // ─── Category tabs ──────────────────────────────────────────
  const categories = ["all", ...new Set(faqData.map((s) => s.category.toLowerCase()))];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Inter'] text-[#0A1A0F]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono-cw { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 lg:py-16 space-y-8">
        {/* ─── Header ────────────────────────────────────────── */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#11402D]/10 text-[#11402D] text-sm font-semibold">
            <HelpCircle className="w-4 h-4" />
            Frequently Asked Questions
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#0A1A0F] tracking-tight">
            How can we help?
          </h1>
          <p className="text-[#5A7060] max-w-2xl mx-auto text-base leading-relaxed">
            Find answers to the most common questions about ReVive Energy – from waste listing and payments to account management.
          </p>
        </div>

        {/* ─── Search ──────────────────────────────────────────── */}
        <div className="relative max-w-lg mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A8BBB3]" />
          <input
            type="text"
            placeholder="Search questions…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-[#E5EDE8] bg-white shadow-sm focus:ring-2 focus:ring-[#11402D]/20 focus:border-[#11402D] transition-all outline-none text-[#0A1A0F] placeholder:text-[#A8BBB3]"
          />
        </div>

        {/* ─── Category Tabs ──────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-[#11402D] text-white shadow-md"
                  : "bg-white border border-[#E5EDE8] text-[#5A7060] hover:bg-[#F6F8F4] hover:border-[#11402D]/30"
              }`}
            >
              {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* ─── Questions List ────────────────────────────────── */}
        <div className="space-y-8 mt-4">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-[#E5EDE8] shadow-sm">
              <HelpCircle className="w-12 h-12 text-[#A8BBB3] mx-auto mb-4" />
              <h3 className="font-display text-lg font-semibold text-[#0A1A0F]">
                No results found
              </h3>
              <p className="text-[#5A7060]">
                Try adjusting your search or browse the categories above.
              </p>
            </div>
          ) : (
            filteredQuestions.map((section, sectionIdx) => (
              <div key={sectionIdx} className="space-y-4">
                <h2 className="font-display text-2xl font-bold text-[#0A1A0F]">
                  {section.category}
                </h2>
                <div className="bg-white rounded-2xl border border-[#E5EDE8] shadow-sm divide-y divide-[#F0F5F2] overflow-hidden">
                  {section.questions.map((item, idx) => {
                    const globalIndex = sectionIdx * 100 + idx;
                    const isOpen = openIndex === globalIndex;
                    return (
                      <motion.div
                        key={idx}
                        initial={false}
                        className="transition-colors hover:bg-[#F6F8F4]/50"
                      >
                        <button
                          onClick={() => toggleQuestion(globalIndex)}
                          className="w-full flex items-center justify-between p-4 sm:p-5 text-left focus:outline-none gap-4"
                        >
                          <span className="font-medium text-[#0A1A0F] text-sm sm:text-base leading-relaxed">
                            {item.q}
                          </span>
                          <span className="flex-shrink-0 text-[#5A7060]">
                            {isOpen ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </span>
                        </button>
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 sm:px-5 pb-5 sm:pb-6 text-[#5A7060] text-sm leading-relaxed border-t border-[#F0F5F2] pt-4">
                                {item.a}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ─── Still have questions? ──────────────────────────── */}
        <div className="bg-gradient-to-br from-[#0E2A1C] to-[#11402D] rounded-3xl p-8 sm:p-10 text-white shadow-xl border border-white/10 mt-12">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="flex items-center justify-center gap-2 text-sm font-mono-cw uppercase tracking-widest text-[#9CF06B]">
              <MessageCircle className="w-4 h-4" />
              Need more help?
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-bold">
              Still have questions?
            </h3>
            <p className="text-white/60 text-sm leading-relaxed max-w-md mx-auto">
              Our support team is ready to assist you with any additional questions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <a
                href="/contact"
                className="inline-flex items-center gap-2 bg-[#9CF06B] text-[#0A1A0F] font-bold px-6 py-3 rounded-xl hover:bg-[#8CE05A] transition-colors"
              >
                Contact Support
                <ExternalLink className="w-4 h-4" />
              </a>
              <div className="flex items-center gap-4 text-sm text-white/50">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4" /> support@revive.energy
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4" /> +254 727 568 271
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── ★ FOOTER (added) ──────────────────────────────────── */}
      <footer className="bg-[#0E2A1C] text-white pt-14 sm:pt-16 pb-8 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#9CF06B]/15 flex items-center justify-center">
                  <Recycle className="w-5 h-5 text-[#9CF06B]" />
                </div>
                <span className="font-display text-xl font-semibold">
                  ReVive Energy
                </span>
              </div>
              <p className="text-white/50 text-sm leading-relaxed max-w-sm">
                Designing and operating waste-to-energy infrastructure that
                turns disposal problems into clean energy opportunities.
              </p>
            </div>

            {[
              ["Company", ["About", "Careers", "Newsroom", "ESG Reports"]],
              ["Solutions", ["Thermal Conversion", "Anaerobic Digestion", "Landfill Gas", "Hybrid Sites"]],
              ["Resources", ["Case Studies", "White Papers", "Community Data", "Investor Center"]],
            ].map(([title, links], index) => (
              <div key={index}>
                <h3 className="font-display font-semibold mb-4">{title}</h3>
                <ul className="space-y-2.5 text-sm text-white/50">
                  {links.map((link, i) => (
                    <li key={i}>
                      <a href="#" className="hover:text-[#9CF06B] transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-white/40 text-center sm:text-left">
            <span>© 2026 ReVive Energy. All rights reserved.</span>
            <div className="flex flex-wrap justify-center gap-5">
              <a href="#" className="hover:text-[#9CF06B] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#9CF06B] transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FAQ;