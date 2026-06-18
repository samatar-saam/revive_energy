import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  ArrowRight, CheckCircle2, Leaf, Recycle, Zap, 
  ClipboardList, Search, Truck, Factory, Zap as ZapIcon,
  Award, TrendingUp, Users, Globe, Shield, Clock,
  Play, ChevronRight, Sparkles, MapPin, Star, Phone,
  Mail, Building2, Package, FlaskConical, BarChart3,
  Droplets, Sun, Wind, Trash2, Timer, Trophy, RefreshCw,
  X, Check, AlertCircle, Gauge, Target, Medal, Crown,
  RefreshCcw, Info, HelpCircle
} from "lucide-react";

/* ─── ANIMATED COUNTER ─── */
function Counter({ to, suffix = "", prefix = "" }) {
  const nodeRef = useRef(null);
  const [val, setVal] = useState(0);
  useEffect(() => {
    const el = nodeRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const duration = 2000;
        const step = (timestamp) => {
          if (!start) start = timestamp;
          const progress = Math.min((timestamp - start) / duration, 1);
          setVal(Math.floor(progress * to));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={nodeRef}>{prefix}{val}{suffix}</span>;
}

/* ─── REALISTIC WASTE SORTING GAME DATA ─── */
const WASTE_ITEMS = [
  // Organic
  { id: 1, name: "Banana Peel", category: "organic", icon: "🍌", color: "#34D399", description: "Biodegradable kitchen waste" },
  { id: 2, name: "Apple Core", category: "organic", icon: "🍎", color: "#34D399", description: "Fruit waste, compostable" },
  { id: 3, name: "Eggshells", category: "organic", icon: "🥚", color: "#34D399", description: "Calcium-rich compost material" },
  { id: 4, name: "Coffee Grounds", category: "organic", icon: "☕", color: "#34D399", description: "Used coffee, great for compost" },
  { id: 5, name: "Vegetable Peels", category: "organic", icon: "🥕", color: "#34D399", description: "Compostable vegetable waste" },
  // Plastic
  { id: 6, name: "Plastic Bottle", category: "plastic", icon: "🧴", color: "#60A5FA", description: "PET plastic, recyclable" },
  { id: 7, name: "Plastic Bag", category: "plastic", icon: "🛍️", color: "#60A5FA", description: "LDPE plastic, recyclable" },
  { id: 8, name: "Plastic Container", category: "plastic", icon: "📦", color: "#60A5FA", description: "HDPE plastic, recyclable" },
  { id: 9, name: "Straw", category: "plastic", icon: "🥤", color: "#60A5FA", description: "PP plastic, recycle if clean" },
  { id: 10, name: "Shampoo Bottle", category: "plastic", icon: "🧴", color: "#60A5FA", description: "HDPE, rinse before recycling" },
  // Paper
  { id: 11, name: "Cardboard Box", category: "paper", icon: "📦", color: "#FBBF24", description: "Corrugated cardboard, recyclable" },
  { id: 12, name: "Newspaper", category: "paper", icon: "📰", color: "#FBBF24", description: "Mixed paper, recyclable" },
  { id: 13, name: "Magazine", category: "paper", icon: "📖", color: "#FBBF24", description: "Glossy paper, recyclable" },
  { id: 14, name: "Envelope", category: "paper", icon: "✉️", color: "#FBBF24", description: "Paper, remove plastic windows" },
  { id: 15, name: "Office Paper", category: "paper", icon: "📄", color: "#FBBF24", description: "White paper, fully recyclable" },
  // Glass
  { id: 16, name: "Glass Jar", category: "glass", icon: "🫙", color: "#F59E0B", description: "Glass, 100% recyclable" },
  { id: 17, name: "Glass Bottle", category: "glass", icon: "🍾", color: "#F59E0B", description: "Glass, rinse before recycling" },
  { id: 18, name: "Wine Bottle", category: "glass", icon: "🍷", color: "#F59E0B", description: "Glass, remove cork before recycle" },
  // Metal
  { id: 19, name: "Aluminum Can", category: "metal", icon: "🥫", color: "#9CA3AF", description: "Aluminum, 100% recyclable" },
  { id: 20, name: "Tin Can", category: "metal", icon: "🥫", color: "#9CA3AF", description: "Steel, rinse before recycling" },
  { id: 21, name: "Metal Lid", category: "metal", icon: "🔘", color: "#9CA3AF", description: "Metal, recyclable with steel" },
  // E-Waste
  { id: 22, name: "Phone Battery", category: "ewaste", icon: "🔋", color: "#EF4444", description: "Lithium-ion, hazardous waste" },
  { id: 23, name: "Old Phone", category: "ewaste", icon: "📱", color: "#EF4444", description: "E-waste, recycle responsibly" },
  // Textiles
  { id: 24, name: "Cotton T-Shirt", category: "textile", icon: "👕", color: "#8B5CF6", description: "Textile, donate or recycle" },
  { id: 25, name: "Denim Jeans", category: "textile", icon: "👖", color: "#8B5CF6", description: "Textile, donate or recycle" },
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

/* ─── ADVANCED WASTE SORTING GAME ─── */
function WasteSortingGame() {
  const [currentItems, setCurrentItems] = useState([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState("playing");
  const [feedback, setFeedback] = useState(null);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalWrong, setTotalWrong] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const [selectedBin, setSelectedBin] = useState(null);
  const [comboCount, setComboCount] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [showHint, setShowHint] = useState(false);

  // Initialize game
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
    setGameState("playing");
    setSelectedBin(null);
    setTotalItems(prev => prev + selected.length);
  };

  const handleSort = (categoryId) => {
    if (gameState === "complete" || currentItemIndex >= currentItems.length) return;
    
    const item = currentItems[currentItemIndex];
    if (!item) return;

    const isCorrect = item.category === categoryId;
    setSelectedBin(categoryId);
    
    if (isCorrect) {
      const bonus = Math.floor(streak / 3) + 1;
      const points = 10 + (streak * 2) + (bonus * 5);
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
      setComboCount(prev => prev + 1);
      setTotalCorrect(prev => prev + 1);
      if (streak + 1 > bestStreak) setBestStreak(streak + 1);
      
      let message = `✓ Perfect! +${points} points`;
      if (streak >= 5) message += ` 🔥 ${streak+1}x streak!`;
      if (streak >= 10) message += ` 🏆 Legendary!`;
      
      setFeedback({ type: "correct", message });
      
      setTimeout(() => {
        if (currentItemIndex + 1 >= currentItems.length) {
          setLevel(prev => prev + 1);
          setTimeout(() => {
            startNewRound();
          }, 800);
        } else {
          setCurrentItemIndex(prev => prev + 1);
        }
        setFeedback(null);
        setSelectedBin(null);
      }, 500);
    } else {
      setStreak(0);
      setComboCount(0);
      setTotalWrong(prev => prev + 1);
      const correctCategory = CATEGORIES.find(c => c.id === item.category);
      setFeedback({ 
        type: "wrong", 
        message: `✗ ${item.name} belongs in ${correctCategory?.name || 'Unknown'}` 
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
    setComboCount(0);
    setShowComplete(false);
    setGameState("playing");
    startNewRound();
  };

  const getLevelEmoji = () => {
    if (level <= 3) return "🌱";
    if (level <= 6) return "🌿";
    if (level <= 9) return "🌳";
    if (level <= 12) return "🌟";
    return "🏆";
  };

  const getCurrentItem = () => {
    if (currentItemIndex < currentItems.length) {
      return currentItems[currentItemIndex];
    }
    return null;
  };

  const currentItem = getCurrentItem();
  const progress = currentItems.length > 0 ? ((currentItemIndex) / currentItems.length) * 100 : 0;
  const totalAttempts = totalCorrect + totalWrong;
  const accuracyRate = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-[#11402D]/5">
      {/* Game Header */}
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

      {/* Game Area */}
      <div className="p-8 bg-[#F6F8F4]">
        {showComplete ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#9CF06B] to-[#34D399] flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <h3 className="font-display font-bold text-3xl text-[#0A1A0F] mb-2">Level Complete!</h3>
            <p className="text-[#5A7060] mb-8">Great job! Here's your performance:</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
              <div className="bg-white rounded-xl p-5 border border-[#11402D]/5 shadow-sm">
                <div className="font-display text-3xl font-bold text-[#11402D]">{score}</div>
                <div className="text-xs text-[#5A7060] mt-1">Total Score</div>
              </div>
              <div className="bg-white rounded-xl p-5 border border-[#34D399]/20 shadow-sm">
                <div className="font-display text-3xl font-bold text-[#34D399]">{totalCorrect}</div>
                <div className="text-xs text-[#5A7060] mt-1">Correct</div>
              </div>
              <div className="bg-white rounded-xl p-5 border border-[#EF4444]/20 shadow-sm">
                <div className="font-display text-3xl font-bold text-[#EF4444]">{totalWrong}</div>
                <div className="text-xs text-[#5A7060] mt-1">Wrong</div>
              </div>
              <div className="bg-white rounded-xl p-5 border border-[#F59E0B]/20 shadow-sm">
                <div className="font-display text-3xl font-bold text-[#F59E0B]">{bestStreak}</div>
                <div className="text-xs text-[#5A7060] mt-1">Best Streak</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetGame}
                className="inline-flex items-center gap-2 bg-[#11402D] text-white font-display font-bold px-8 py-3.5 rounded-full text-sm shadow-lg hover:shadow-xl transition-all"
              >
                <RefreshCw className="w-4 h-4" /> Play Again
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowComplete(false)}
                className="inline-flex items-center gap-2 border-2 border-[#11402D]/20 text-[#11402D] font-display font-bold px-8 py-3.5 rounded-full text-sm hover:bg-[#11402D]/5 transition-all"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Progress Bar */}
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

            {/* Current Item */}
            {currentItem && (
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
            )}

            {/* Feedback */}
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
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

            {/* Bins Grid */}
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

            {/* Game Stats */}
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
        )}
      </div>
    </div>
  );
}

/* ─── STEPS DATA ─── */
const STEPS = [
  {
    id: 1,
    number: "01",
    title: "Assessment & Consultation",
    subtitle: "Understanding Your Waste Stream",
    description: "Our experts conduct a comprehensive waste audit to analyze your current waste streams, volumes, and disposal costs.",
    icon: ClipboardList,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=85",
    duration: "2-3 weeks"
  },
  {
    id: 2,
    number: "02",
    title: "Custom Solution Design",
    subtitle: "Engineering Your System",
    description: "Our engineering team designs a tailored solution that matches your waste characteristics, space constraints, and energy requirements.",
    icon: Search,
    image: "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?auto=format&fit=crop&w=1200&q=85",
    duration: "4-6 weeks"
  },
  {
    id: 3,
    number: "03",
    title: "Installation & Integration",
    subtitle: "Bringing Your System to Life",
    description: "Professional installation and seamless integration with your existing operations, with minimal disruption to your daily activities.",
    icon: Truck,
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=85",
    duration: "8-12 weeks"
  },
  {
    id: 4,
    number: "04",
    title: "Monitoring & Optimization",
    subtitle: "Maximum Performance",
    description: "Continuous monitoring and optimization ensures your system operates at peak efficiency with maximum returns.",
    icon: BarChart3,
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=85",
    duration: "Ongoing"
  }
];

const TESTIMONIALS = [
  {
    quote: "The waste assessment revealed opportunities we never knew existed. Within 6 months, we cut disposal costs by 60% and started generating revenue from biogas.",
    name: "Sarah Mbeki",
    role: "Operations Director, Nairobi Breweries",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&q=80"
  },
  {
    quote: "The integration was seamless. Our team was trained and the system was operational within weeks. The energy savings alone have been transformative.",
    name: "James Ochieng",
    role: "Plant Manager, Great Lakes Farms",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80"
  },
  {
    quote: "From assessment to installation, the ReVive team was professional and supportive. We've now achieved our sustainability targets ahead of schedule.",
    name: "Amina Diallo",
    role: "Sustainability Lead, Mombasa Port Authority",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80"
  }
];

/* ─── STEP CARD ─── */
function StepCard({ step, index, isActive, setActive }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      onClick={() => setActive(step.id)}
      className={`cursor-pointer transition-all duration-500 ${
        isActive ? 'lg:col-span-2' : 'lg:col-span-1'
      }`}
    >
      <div className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full border ${
        isActive ? 'border-[#11402D] shadow-xl' : 'border-[#11402D]/5'
      }`}>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              isActive ? 'bg-[#11402D]' : 'bg-[#11402D]/5'
            }`}>
              <step.icon className={`w-6 h-6 transition-all ${
                isActive ? 'text-[#9CF06B]' : 'text-[#11402D]'
              }`} />
            </div>
            <div>
              <span className="font-mono-cw text-xs font-bold text-[#11402D]">Step {step.number}</span>
              <h3 className="font-display font-bold text-[#0A1A0F]">{step.title}</h3>
            </div>
          </div>
          
          <p className={`text-sm leading-relaxed mb-4 transition-all ${
            isActive ? 'text-[#0A1A0F]' : 'text-[#5A7060]'
          }`}>
            {step.description}
          </p>
          
          <div className={`flex items-center gap-2 text-xs text-[#5A7060] ${
            isActive ? 'block' : 'hidden'
          }`}>
            <Clock className="w-3 h-3" />
            <span>Typical duration: {step.duration}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── MAIN HOW IT WORKS PAGE ─── */
export default function HowItWorksPage() {
  const [activeStep, setActiveStep] = useState(1);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div className="min-h-screen bg-[#F6F8F4] text-[#142019] overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        .font-display {
          font-family: 'Space Grotesk', sans-serif;
        }

        .font-mono-cw {
          font-family: 'JetBrains Mono', monospace;
        }
      `}</style>

      {/* ============ HERO SECTION ============ */}
      <section className="relative min-h-[55vh] flex items-center bg-white pt-0">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-10 w-96 h-96 bg-[#9CF06B]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-[#11402D]/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-8 lg:py-12">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-[#0E2A1C] leading-[1.1] tracking-tight mb-6">
              From waste to
              <span className="relative inline-block mx-3">
                <span className="relative z-10 text-[#11402D]">value.</span>
                <svg className="absolute -bottom-2 left-0 w-full" height="10" viewBox="0 0 300 10" preserveAspectRatio="none">
                  <path d="M2 6C60 2 240 2 298 6" stroke="#9CF06B" strokeWidth="5" strokeLinecap="round" fill="none" />
                </svg>
              </span>
            </h1>
            
            <p className="text-xl text-[#142019]/65 leading-relaxed max-w-2xl mb-8">
              A proven 4-step process that transforms your waste challenges into sustainable opportunities — from assessment to ongoing optimization.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                className="bg-[#11402D] text-white font-display font-bold px-8 py-3 rounded-full text-sm shadow-lg flex items-center gap-2"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                className="border-2 border-[#11402D]/20 text-[#11402D] font-display font-bold px-8 py-3 rounded-full text-sm flex items-center gap-2"
              >
                Contact Sales
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ STEPS OVERVIEW ============ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="flex justify-center mb-6">
              <div className="w-12 h-px bg-[#11402D]" />
            </div>
            <p className="font-mono-cw text-sm uppercase tracking-wider text-[#11402D]/80 mb-3">
              The Process
            </p>
            <h2 className="font-display text-4xl sm:text-5xl text-[#0E2A1C] mb-4">
              Simple 4-Step Process
            </h2>
            <p className="text-lg text-[#142019]/65">
              From assessment to optimization — we're with you every step of the way
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-4 gap-4">
            {STEPS.map((step, i) => (
              <StepCard 
                key={step.id}
                step={step}
                index={i}
                isActive={activeStep === step.id}
                setActive={setActiveStep}
              />
            ))}
          </div>

          {/* Active step detail */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="mt-8 bg-[#F6F8F4] rounded-2xl overflow-hidden shadow-lg border border-[#11402D]/5"
            >
              <div className="grid lg:grid-cols-2 gap-0">
                <div className="p-8 lg:p-10 bg-white">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-display text-2xl font-bold text-[#9CF06B]">Step {STEPS[activeStep-1].number}</span>
                    <span className="w-px h-6 bg-[#11402D]/10" />
                    <span className="font-mono-cw text-sm font-medium text-[#5A7060]">{STEPS[activeStep-1].duration}</span>
                  </div>
                  <h3 className="font-display text-2xl lg:text-3xl text-[#0E2A1C] mb-2">
                    {STEPS[activeStep-1].title}
                  </h3>
                  <p className="text-[#5A7060] mb-6 text-sm leading-relaxed">
                    {STEPS[activeStep-1].subtitle}
                  </p>
                  <p className="text-[#142019]/65 leading-relaxed">
                    {STEPS[activeStep-1].description}
                  </p>
                </div>
                <div className="relative h-64 lg:h-auto overflow-hidden">
                  <img 
                    src={STEPS[activeStep-1].image} 
                    alt={STEPS[activeStep-1].title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-[#0B2417]/30 via-transparent to-transparent" />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ============ WASTE SORTING GAME SECTION ============ */}
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
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 mb-4 shadow-sm border border-[#11402D]/5">
              <Target className="w-4 h-4 text-[#11402D]" />
              <span className="font-mono-cw text-xs font-bold tracking-wider text-[#11402D] uppercase">Learn & Play</span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl text-[#0E2A1C] mb-4">
              Test Your Waste Sorting Skills
            </h2>
            <p className="text-lg text-[#142019]/65">
              Master the art of waste sorting. Tap the correct bin for each item and build your streak!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <WasteSortingGame />
          </motion.div>

          <div className="mt-8 text-center max-w-3xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 border border-[#11402D]/5 shadow-sm">
                <div className="text-2xl mb-1">♻️</div>
                <div className="font-display font-bold text-xs text-[#0E2A1C]">7 Categories</div>
                <div className="text-[10px] text-[#142019]/55">Learn to sort</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-[#11402D]/5 shadow-sm">
                <div className="text-2xl mb-1">🏆</div>
                <div className="font-display font-bold text-xs text-[#0E2A1C]">Score & Streaks</div>
                <div className="text-[10px] text-[#142019]/55">Build combos</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-[#11402D]/5 shadow-sm">
                <div className="text-2xl mb-1">📈</div>
                <div className="font-display font-bold text-xs text-[#0E2A1C]">Accuracy Tracking</div>
                <div className="text-[10px] text-[#142019]/55">See improvement</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-[#11402D]/5 shadow-sm">
                <div className="text-2xl mb-1">💡</div>
                <div className="font-display font-bold text-xs text-[#0E2A1C]">Learn as you play</div>
                <div className="text-[10px] text-[#142019]/55">Educational & fun</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ KEY BENEFITS ============ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="flex justify-center mb-6">
              <div className="w-12 h-px bg-[#11402D]" />
            </div>
            <h2 className="font-display text-4xl sm:text-5xl text-[#0E2A1C] mb-4">
              Why Choose Our Process
            </h2>
            <p className="text-lg text-[#142019]/65">
              Designed for maximum value creation with minimal disruption
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: "Fast Implementation",
                desc: "From assessment to operation in as little as 12 weeks"
              },
              {
                icon: Shield,
                title: "Minimal Disruption",
                desc: "Seamless integration with your existing operations"
              },
              {
                icon: Award,
                title: "Guaranteed ROI",
                desc: "Proven returns with our performance guarantee"
              },
              {
                icon: Users,
                title: "Expert Support",
                desc: "Dedicated team available 24/7 for your needs"
              },
              {
                icon: Globe,
                title: "Scalable Solutions",
                desc: "Grow your system as your needs evolve"
              },
              {
                icon: TrendingUp,
                title: "Continuous Optimization",
                desc: "Ongoing improvements for maximum value"
              }
            ].map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#F6F8F4] rounded-2xl p-6 text-center hover:shadow-xl transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#11402D] flex items-center justify-center mx-auto mb-4 group-hover:bg-[#0E2A1C] transition-colors">
                  <benefit.icon className="w-6 h-6 text-[#9CF06B]" />
                </div>
                <h3 className="font-display font-bold text-[#0E2A1C] mb-2">{benefit.title}</h3>
                <p className="text-sm text-[#142019]/55">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ IMPACT STATS ============ */}
      <section className="py-20 bg-[#0E2A1C]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 98, suffix: "%", label: "Client Satisfaction" },
              { value: 125, suffix: "+", label: "Projects Completed" },
              { value: 85, suffix: "%", label: "Efficiency Rate" },
              { value: 12, suffix: "wks", label: "Avg. Time to Deploy" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="font-display text-3xl md:text-4xl font-bold text-[#9CF06B] mb-2">
                  <Counter to={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-white/60">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="flex justify-center mb-6">
              <div className="w-12 h-px bg-[#11402D]" />
            </div>
            <h2 className="font-display text-4xl sm:text-5xl text-[#0E2A1C] mb-4">
              What Our Clients Say
            </h2>
            <p className="text-lg text-[#142019]/65">
              Real experiences from real partners
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#F6F8F4] rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all border border-[#11402D]/5"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-display font-bold text-[#0E2A1C] text-sm">{testimonial.name}</h4>
                    <p className="text-xs text-[#142019]/55">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-sm text-[#142019]/55 leading-relaxed italic">
                  "{testimonial.quote}"
                </p>
                <div className="mt-4 flex gap-0.5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-[#9CF06B] text-[#9CF06B]" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA SECTION ============ */}
      <section className="py-20 bg-[#0E2A1C]">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 rounded-full bg-[#9CF06B]/10 flex items-center justify-center mx-auto mb-6">
              <Phone className="w-8 h-8 text-[#9CF06B]" />
            </div>
            <h2 className="font-display text-3xl sm:text-4xl text-white mb-4">
              Ready to start your journey?
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto mb-8">
              Book a free consultation with our waste-to-value experts and discover how much value you're leaving on the table.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                className="bg-[#9CF06B] text-[#0E2A1C] font-display font-bold px-8 py-3 rounded-full text-sm shadow-lg flex items-center gap-2"
              >
                Schedule a Consultation <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                className="border-2 border-white/20 text-white font-display font-bold px-8 py-3 rounded-full text-sm flex items-center gap-2"
              >
                <Mail className="w-4 h-4" /> Contact Sales
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}