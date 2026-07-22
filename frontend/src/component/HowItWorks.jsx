import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Recycle,
  Zap,
  Truck,
  UserPlus,
  FileCheck,
  MapPin,
  Building2,
  Users,
  ArrowRight,
  Leaf,
  Award,
  Clock,
  ShieldCheck,
  ChevronRight,
  Globe,
  Target,
  Check,
  X,
  RefreshCw,
  CheckCircle2,
  Gauge,
  Trophy,
  DollarSign,
} from "lucide-react";

// ─── WASTE SORTING GAME (embedded) ──────────────────────────
// ─── Waste items data ────────────────────────────────────────
const WASTE_ITEMS = [
  { id: 1, name: "Banana Peel", category: "organic", icon: "🍌", description: "Biodegradable kitchen waste" },
  { id: 2, name: "Apple Core", category: "organic", icon: "🍎", description: "Fruit waste, compostable" },
  { id: 3, name: "Eggshells", category: "organic", icon: "🥚", description: "Calcium-rich compost material" },
  { id: 4, name: "Coffee Grounds", category: "organic", icon: "☕", description: "Used coffee, great for compost" },
  { id: 5, name: "Vegetable Peels", category: "organic", icon: "🥕", description: "Compostable vegetable waste" },
  { id: 6, name: "Plastic Bottle", category: "plastic", icon: "🧴", description: "PET plastic, recyclable" },
  { id: 7, name: "Plastic Bag", category: "plastic", icon: "🛍️", description: "LDPE plastic, recyclable" },
  { id: 8, name: "Plastic Container", category: "plastic", icon: "📦", description: "HDPE plastic, recyclable" },
  { id: 9, name: "Straw", category: "plastic", icon: "🥤", description: "PP plastic, recycle if clean" },
  { id: 10, name: "Shampoo Bottle", category: "plastic", icon: "🧴", description: "HDPE, rinse before recycling" },
  { id: 11, name: "Cardboard Box", category: "paper", icon: "📦", description: "Corrugated cardboard, recyclable" },
  { id: 12, name: "Newspaper", category: "paper", icon: "📰", description: "Mixed paper, recyclable" },
  { id: 13, name: "Magazine", category: "paper", icon: "📖", description: "Glossy paper, recyclable" },
  { id: 14, name: "Envelope", category: "paper", icon: "✉️", description: "Paper, remove plastic windows" },
  { id: 15, name: "Office Paper", category: "paper", icon: "📄", description: "White paper, fully recyclable" },
  { id: 16, name: "Glass Jar", category: "glass", icon: "🫙", description: "Glass, 100% recyclable" },
  { id: 17, name: "Glass Bottle", category: "glass", icon: "🍾", description: "Glass, rinse before recycling" },
  { id: 18, name: "Wine Bottle", category: "glass", icon: "🍷", description: "Glass, remove cork before recycle" },
  { id: 19, name: "Aluminum Can", category: "metal", icon: "🥫", description: "Aluminum, 100% recyclable" },
  { id: 20, name: "Tin Can", category: "metal", icon: "🥫", description: "Steel, rinse before recycling" },
  { id: 21, name: "Metal Lid", category: "metal", icon: "🔘", description: "Metal, recyclable with steel" },
  { id: 22, name: "Phone Battery", category: "ewaste", icon: "🔋", description: "Lithium-ion, hazardous waste" },
  { id: 23, name: "Old Phone", category: "ewaste", icon: "📱", description: "E-waste, recycle responsibly" },
  { id: 24, name: "Cotton T-Shirt", category: "textile", icon: "👕", description: "Textile, donate or recycle" },
  { id: 25, name: "Denim Jeans", category: "textile", icon: "👖", description: "Textile, donate or recycle" },
];

const CATEGORIES = [
  { id: "organic", name: "Organic", icon: "🌱", color: "#34D399", bg: "#ECFDF5", border: "#34D399", description: "Compostable waste" },
  { id: "plastic", name: "Plastic", icon: "🧴", color: "#60A5FA", bg: "#EFF6FF", border: "#60A5FA", description: "Recyclable plastics" },
  { id: "paper", name: "Paper", icon: "📄", color: "#FBBF24", bg: "#FFFBEB", border: "#FBBF24", description: "Recyclable paper" },
  { id: "glass", name: "Glass", icon: "🫙", color: "#F59E0B", bg: "#FFFBEB", border: "#F59E0B", description: "Recyclable glass" },
  { id: "metal", name: "Metal", icon: "🔩", color: "#9CA3AF", bg: "#F3F4F6", border: "#9CA3AF", description: "Recyclable metals" },
  { id: "ewaste", name: "E-Waste", icon: "💻", color: "#EF4444", bg: "#FEF2F2", border: "#EF4444", description: "Hazardous waste" },
  { id: "textile", name: "Textile", icon: "👕", color: "#8B5CF6", bg: "#F5F3FF", border: "#8B5CF6", description: "Donate or recycle" },
];

// ─── Game Component ────────────────────────────────────────────
function WasteSortingGame() {
  const [currentItems, setCurrentItems] = useState([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [feedback, setFeedback] = useState(null);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalWrong, setTotalWrong] = useState(0);
  const [selectedBin, setSelectedBin] = useState(null);

  useEffect(() => {
    startNewRound();
  }, []);

  const startNewRound = () => {
    const shuffled = [...WASTE_ITEMS].sort(() => Math.random() - 0.5);
    const levelCount = Math.min(6 + level * 2, 15);
    const selected = shuffled.slice(0, levelCount);
    setCurrentItems(selected);
    setCurrentItemIndex(0);
    setFeedback(null);
    setSelectedBin(null);
  };

  const handleSort = (categoryId) => {
    if (currentItemIndex >= currentItems.length) return;
    const item = currentItems[currentItemIndex];
    const isCorrect = item.category === categoryId;
    setSelectedBin(categoryId);

    if (isCorrect) {
      const bonus = Math.floor(streak / 3) + 1;
      const points = 10 + streak * 2 + bonus * 5;
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
      setTotalCorrect(prev => prev + 1);
      if (streak + 1 > bestStreak) setBestStreak(streak + 1);

      let message = `✓ Perfect! +${points} points`;
      if (streak >= 5) message += ` 🔥 ${streak + 1}x streak!`;
      if (streak >= 10) message += ` 🏆 Legendary!`;
      setFeedback({ type: "correct", message });

      setTimeout(() => {
        if (currentItemIndex + 1 >= currentItems.length) {
          setLevel(prev => prev + 1);
          setTimeout(() => startNewRound(), 800);
        } else {
          setCurrentItemIndex(prev => prev + 1);
        }
        setFeedback(null);
        setSelectedBin(null);
      }, 500);
    } else {
      setStreak(0);
      setTotalWrong(prev => prev + 1);
      const correctCategory = CATEGORIES.find(c => c.id === item.category);
      setFeedback({
        type: "wrong",
        message: `✗ ${item.name} belongs in ${correctCategory?.name || "Unknown"}`,
      });
      setTimeout(() => {
        setFeedback(null);
        setSelectedBin(null);
      }, 800);
    }
  };

  const resetGame = () => {
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setLevel(1);
    setTotalCorrect(0);
    setTotalWrong(0);
    setCurrentItems([]);
    setCurrentItemIndex(0);
    setFeedback(null);
    setSelectedBin(null);
    startNewRound();
  };

  const getLevelEmoji = () => {
    if (level <= 3) return "🌱";
    if (level <= 6) return "🌿";
    if (level <= 9) return "🌳";
    if (level <= 12) return "🌟";
    return "🏆";
  };

  const currentItem = currentItems[currentItemIndex] || null;
  const progress = currentItems.length > 0 ? (currentItemIndex / currentItems.length) * 100 : 0;
  const totalAttempts = totalCorrect + totalWrong;
  const accuracyRate = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-[#11402D]/5">
      <div className="bg-gradient-to-r from-[#11402D] to-[#0A1A0F] px-6 py-4 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#9CF06B]/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-[#9CF06B]" />
            </div>
            <div>
              <h3 className="font-display font-bold">Waste Sorting Challenge</h3>
              <p className="text-xs text-white/50">Sort waste into the correct bins</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="font-display text-2xl font-bold text-[#9CF06B]">{score}</div>
              <div className="text-[8px] text-white/40 uppercase tracking-wider">Score</div>
            </div>
            <div className="text-center">
              <div className="font-display text-2xl font-bold text-white">{streak}</div>
              <div className="text-[8px] text-white/40 uppercase tracking-wider">Streak</div>
            </div>
            <div className="text-center">
              <div className="font-display text-xl font-bold">
                {getLevelEmoji()} Lv.{level}
              </div>
              <div className="text-[8px] text-white/40 uppercase tracking-wider">Level</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 bg-[#F6F8F4]">
        {currentItems.length > 0 && currentItem ? (
          <>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-display text-sm font-medium text-[#0A1A0F]">
                  Sorting {currentItemIndex + 1} of {currentItems.length}
                </span>
                <span className="font-display text-sm font-medium text-[#11402D]">
                  Accuracy: {accuracyRate}%
                </span>
              </div>
              <div className="h-2 bg-white rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#9CF06B] to-[#34D399] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            <div className="text-center mb-8">
              <motion.div
                key={currentItem.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="inline-block"
              >
                <div className="w-32 h-32 rounded-2xl bg-white shadow-lg flex items-center justify-center mx-auto mb-3 border-2 border-[#11402D]/10">
                  <span className="text-6xl">{currentItem.icon}</span>
                </div>
                <p className="font-display font-bold text-lg text-[#0A1A0F]">{currentItem.name}</p>
                <p className="text-sm text-[#5A7060]">{currentItem.description}</p>
                <p className="text-xs text-[#5A7060] mt-1">Tap the correct bin below</p>
              </motion.div>
            </div>

            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-4 rounded-xl mb-6 text-center ${
                    feedback.type === "correct"
                      ? "bg-[#34D399]/10 border-2 border-[#34D399] text-[#34D399]"
                      : "bg-red-50 border-2 border-red-200 text-red-600"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {feedback.type === "correct" ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <X className="w-5 h-5" />
                    )}
                    <span className="font-display font-bold">{feedback.message}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <p className="font-display text-sm font-semibold text-[#0A1A0F] mb-4 text-center">
                Choose the correct bin:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                {CATEGORIES.map((category) => (
                  <motion.button
                    key={category.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSort(category.id)}
                    className={`relative rounded-2xl p-4 text-center transition-all ${
                      selectedBin === category.id
                        ? feedback?.type === "correct"
                          ? "ring-4 ring-[#34D399] bg-[#34D399]/10"
                          : "ring-4 ring-red-400 bg-red-50"
                        : "bg-white hover:shadow-lg border-2 border-[#11402D]/10 hover:border-[#11402D]/30"
                    }`}
                    style={{
                      borderColor: selectedBin === category.id ? category.border : undefined,
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2"
                      style={{ background: category.bg }}
                    >
                      <span className="text-2xl">{category.icon}</span>
                    </div>
                    <div className="font-display font-bold text-sm text-[#0A1A0F]">{category.name}</div>
                    <div className="text-[10px] text-[#5A7060] mt-1">{category.description}</div>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-[#11402D]/5">
                <Gauge className="w-4 h-4 text-[#11402D]" />
                <span className="font-mono-cw text-xs text-[#5A7060]">
                  {streak > 0 ? (
                    <>🔥 {streak} streak • {Math.floor(streak / 3) + 1}x bonus</>
                  ) : (
                    "💡 Build streaks for bonus points!"
                  )}
                </span>
              </div>
              <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-[#11402D]/5">
                <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
                <span className="font-mono-cw text-xs text-[#5A7060]">
                  ✓ {totalCorrect} correct
                </span>
              </div>
              <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-[#11402D]/5">
                <X className="w-4 h-4 text-[#EF4444]" />
                <span className="font-mono-cw text-xs text-[#5A7060]">
                  ✗ {totalWrong} wrong
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-[#9CF06B] mx-auto mb-4" />
            <h3 className="font-display font-bold text-2xl text-[#0A1A0F] mb-2">Level Complete!</h3>
            <p className="text-[#5A7060] mb-6">Great job! Ready for the next round?</p>
            <button
              onClick={resetGame}
              className="inline-flex items-center gap-2 bg-[#11402D] text-white font-display font-bold px-8 py-3 rounded-full text-sm shadow-lg hover:shadow-xl transition-all"
            >
              <RefreshCw className="w-4 h-4" /> Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── HOW IT WORKS PAGE ────────────────────────────────────────
const HowItWorks = () => {
  // ─── Step Data ──────────────────────────────────────────────
  const steps = [
    {
      id: 1,
      title: "Sign Up",
      description: "Choose your role – Waste Supplier, Energy Producer, or Transport Partner – and create your account.",
      icon: UserPlus,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      id: 2,
      title: "List or Request",
      description: "Suppliers list their waste materials. Producers request waste they need. Transporters find available jobs.",
      icon: FileCheck,
      color: "bg-blue-50 text-blue-600",
    },
    {
      id: 3,
      title: "Collection & Transport",
      description: "Transporters are assigned to jobs. Waste is collected from suppliers and delivered to producers safely.",
      icon: Truck,
      color: "bg-amber-50 text-amber-600",
    },
    {
      id: 4,
      title: "Processing & Energy",
      description: "Producers convert the waste into biogas, electricity, fertilizer, or other valuable outputs.",
      icon: Zap,
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      id: 5,
      title: "Payment & Impact",
      description: "Payments are released via secure escrow. Track your environmental impact in real-time.",
      icon: Award,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  // ─── Role Data ──────────────────────────────────────────────
  const roles = [
    {
      title: "Waste Supplier",
      icon: Building2,
      description:
        "Hotels, farms, factories, and markets list their organic, agricultural, and industrial waste for collection.",
      link: "/signup/waste-supplier",
      color: "border-emerald-200 hover:border-emerald-400",
    },
    {
      title: "Energy Producer",
      icon: Zap,
      description:
        "Biogas plants, recycling companies, and WtE facilities request waste materials to convert into clean energy.",
      link: "/signup/energy-producer",
      color: "border-amber-200 hover:border-amber-400",
    },
    {
      title: "Transport Partner",
      icon: Truck,
      description:
        "Logistics companies, truck owners, and collection agents deliver waste from suppliers to producers.",
      link: "/signup/transport-partner",
      color: "border-blue-200 hover:border-blue-400",
    },
  ];

  // ─── Benefits Data ──────────────────────────────────────────
  const benefits = [
    {
      icon: Leaf,
      title: "Eco-Friendly",
      description: "Divert waste from landfills and reduce greenhouse gas emissions.",
    },
    {
      icon: DollarSign,
      title: "Generate Revenue",
      description: "Turn your waste into profit or save on disposal costs.",
    },
    {
      icon: ShieldCheck,
      title: "Transparent Payments",
      description: "Secure escrow system ensures fair and timely payments for everyone.",
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Our team is always available to help with any questions or issues.",
    },
  ];

  // ─── Animation Variants ─────────────────────────────────────
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Inter'] text-[#0A1A0F]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono-cw { font-family: 'JetBrains Mono', monospace; }
        .shadow-soft { box-shadow: 0 2px 15px -3px rgba(0,0,0,0.05), 0 1px 4px -2px rgba(0,0,0,0.02); }
        .shadow-card { box-shadow: 0 4px 20px -6px rgba(0,0,0,0.06), 0 2px 8px -4px rgba(0,0,0,0.02); }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-16">
        {/* ─── Hero Section ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#11402D]/10 text-[#11402D] text-sm font-semibold">
            <Recycle className="w-4 h-4" />
            How It Works
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0A1A0F] tracking-tight">
            From Waste to <span className="text-[#11402D]">Value</span>
          </h1>
          <p className="text-[#5A7060] max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            ReVive Energy connects waste suppliers, energy producers, and transport partners
            to turn waste into clean energy – in just five simple steps.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#11402D] text-white font-bold hover:bg-[#0E2A1C] transition shadow-lg shadow-[#11402D]/20"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#E5EDE8] bg-white text-[#0A1A0F] font-medium hover:bg-[#F6F8F4] transition shadow-soft"
            >
              Talk to Sales
            </Link>
          </div>
        </motion.div>

        {/* ─── Steps Section ────────────────────────────────────── */}
        <motion.section
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-8"
        >
          <div className="text-center">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0A1A0F]">
              How ReVive Works
            </h2>
            <p className="text-[#5A7060] max-w-xl mx-auto mt-2">
              Join thousands of businesses already transforming waste into value.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.id}
                  variants={fadeInUp}
                  className="bg-white rounded-2xl border border-[#E5EDE8] p-6 shadow-soft text-center hover:shadow-card transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold text-[#11402D] mb-1">Step {step.id}</div>
                  <h3 className="font-display font-bold text-lg text-[#0A1A0F]">{step.title}</h3>
                  <p className="text-sm text-[#5A7060] mt-2 leading-relaxed">{step.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* ─── Who It's For (Roles) ────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-8"
        >
          <div className="text-center">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0A1A0F]">
              Who Is ReVive For?
            </h2>
            <p className="text-[#5A7060] max-w-xl mx-auto mt-2">
              ReVive connects three key players in the circular economy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((role, index) => {
              const Icon = role.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`bg-white rounded-2xl border-2 ${role.color} p-6 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#11402D]/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-[#11402D]" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-[#0A1A0F]">{role.title}</h3>
                  <p className="text-sm text-[#5A7060] mt-2 leading-relaxed">{role.description}</p>
                  <Link
                    to={role.link}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-[#11402D] mt-4 hover:gap-2 transition-all"
                  >
                    Join as a {role.title} <ChevronRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* ─── Benefits Section ──────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-8"
        >
          <div className="text-center">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0A1A0F]">
              Why Choose ReVive?
            </h2>
            <p className="text-[#5A7060] max-w-xl mx-auto mt-2">
              We make waste management simple, profitable, and sustainable.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white rounded-2xl border border-[#E5EDE8] p-6 shadow-soft text-center hover:shadow-card transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-full bg-[#9CF06B]/20 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-5 h-5 text-[#11402D]" />
                  </div>
                  <h3 className="font-display font-bold text-[#0A1A0F]">{benefit.title}</h3>
                  <p className="text-sm text-[#5A7060] mt-2 leading-relaxed">{benefit.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* ─── ★ WASTE SORTING GAME SECTION ★ ────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#11402D]/10 text-[#11402D] text-sm font-semibold mb-4">
              <Target className="w-4 h-4" />
              Learn & Play
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0A1A0F]">
              Test Your Waste Sorting Skills
            </h2>
            <p className="text-[#5A7060] max-w-xl mx-auto mt-2">
              Master the art of waste sorting. Tap the correct bin for each item and build your streak!
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <WasteSortingGame />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-6">
            <div className="bg-white rounded-xl p-4 border border-[#11402D]/5 shadow-sm text-center">
              <div className="text-2xl mb-1">♻️</div>
              <div className="font-display font-bold text-xs text-[#0A1A0F]">7 Categories</div>
              <div className="text-[10px] text-[#5A7060]">Learn to sort</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-[#11402D]/5 shadow-sm text-center">
              <div className="text-2xl mb-1">🏆</div>
              <div className="font-display font-bold text-xs text-[#0A1A0F]">Score & Streaks</div>
              <div className="text-[10px] text-[#5A7060]">Build combos</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-[#11402D]/5 shadow-sm text-center">
              <div className="text-2xl mb-1">📈</div>
              <div className="font-display font-bold text-xs text-[#0A1A0F]">Accuracy Tracking</div>
              <div className="text-[10px] text-[#5A7060]">See improvement</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-[#11402D]/5 shadow-sm text-center">
              <div className="text-2xl mb-1">💡</div>
              <div className="font-display font-bold text-xs text-[#0A1A0F]">Learn as you play</div>
              <div className="text-[10px] text-[#5A7060]">Educational & fun</div>
            </div>
          </div>
        </motion.section>

        {/* ─── CTA Section ────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0E2A1C] to-[#11402D] p-8 sm:p-12 text-white shadow-2xl border border-white/10"
        >
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ background: '#9CF06B0A' }} />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-2xl pointer-events-none" style={{ background: '#11402D40' }} />

          <div className="relative max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-semibold border border-white/10">
              <Globe className="w-4 h-4" />
              Join the Circular Economy
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Ready to <span className="text-[#9CF06B]">Transform Waste</span> into Value?
            </h2>
            <p className="text-white/70 text-base sm:text-lg max-w-lg mx-auto">
              Join ReVive Energy today and start making an impact – for your business and the planet.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#9CF06B] text-[#0A1A0F] font-bold text-sm sm:text-base hover:bg-[#8CE05A] transition-all shadow-lg shadow-[#9CF06B]/30"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/30 text-white font-semibold text-sm sm:text-base hover:bg-white/10 transition-all"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </motion.section>
      </div>
       <footer className="bg-[#0E2A1C] text-white pt-14 sm:pt-16 pb-8">
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

export default HowItWorks;