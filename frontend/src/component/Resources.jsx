import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FileText,
  BookOpen,
  FileCode,
  FileSpreadsheet,
  File,
  Search,
  ArrowRight,
  ChevronRight,
  Download,
  Eye,
  Filter,
  X,
  Globe,
  Users,
  Lightbulb,
  Award,
  BarChart3,
} from "lucide-react";

const Resources = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  // ─── Resource Data ──────────────────────────────────────────────
  const resources = [
    {
      id: 1,
      title: "Waste-to-Energy: A Comprehensive Guide",
      description: "Learn how waste-to-energy technology works, from collection to clean power generation.",
      category: "guides",
      type: "Guide",
      icon: BookOpen,
      link: "/resources/waste-to-energy-guide",
      downloads: 1240,
      date: "2024-01-15",
    },
    {
      id: 2,
      title: "Case Study: Nairobi Organic Waste Project",
      description: "How we partnered with local farms to turn organic waste into biogas and fertilizer.",
      category: "case-studies",
      type: "Case Study",
      icon: FileText,
      link: "/resources/nairobi-case-study",
      downloads: 876,
      date: "2024-02-20",
    },
    {
      id: 3,
      title: "Plastic Recycling: The ReVive Approach",
      description: "Our innovative methods for sorting, cleaning, and recycling plastic waste into new materials.",
      category: "white-papers",
      type: "White Paper",
      icon: FileCode,
      link: "/resources/plastic-recycling-whitepaper",
      downloads: 543,
      date: "2024-03-10",
    },
    {
      id: 4,
      title: "Biogas Production: Technical Standards",
      description: "Technical specifications and quality standards for biogas production from organic waste.",
      category: "reports",
      type: "Technical Report",
      icon: FileSpreadsheet,
      link: "/resources/biogas-standards",
      downloads: 321,
      date: "2024-04-05",
    },
    {
      id: 5,
      title: "Community Engagement Framework",
      description: "Best practices for engaging local communities in waste-to-energy projects.",
      category: "guides",
      type: "Guide",
      icon: Users,
      link: "/resources/community-engagement",
      downloads: 198,
      date: "2024-05-12",
    },
    {
      id: 6,
      title: "Carbon Offsets and Waste Management",
      description: "How waste-to-energy projects generate carbon credits and contribute to climate goals.",
      category: "white-papers",
      type: "White Paper",
      icon: Award,
      link: "/resources/carbon-offsets",
      downloads: 432,
      date: "2024-06-18",
    },
    {
      id: 7,
      title: "Annual Impact Report 2024",
      description: "Our comprehensive annual report on waste diverted, energy generated, and community impact.",
      category: "reports",
      type: "Report",
      icon: BarChart3,
      link: "/resources/annual-report-2024",
      downloads: 2150,
      date: "2024-07-01",
    },
    {
      id: 8,
      title: "Landfill Gas Capture: Feasibility Study",
      description: "A detailed feasibility study on capturing methane from landfills for energy production.",
      category: "case-studies",
      type: "Case Study",
      icon: FileText,
      link: "/resources/landfill-gas-study",
      downloads: 267,
      date: "2024-08-22",
    },
  ];

  // ─── Categories ──────────────────────────────────────────────────
  const categories = [
    { id: "all", label: "All Resources" },
    { id: "case-studies", label: "Case Studies" },
    { id: "white-papers", label: "White Papers" },
    { id: "guides", label: "Guides" },
    { id: "reports", label: "Reports" },
  ];

  // ─── Filtered Resources ─────────────────────────────────────────
  const filtered = resources.filter((resource) => {
    const matchesCategory = activeCategory === "all" || resource.category === activeCategory;
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // ─── Animation variants ─────────────────────────────────────────
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-12">
        {/* ─── Hero Section ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#11402D]/10 text-[#11402D] text-sm font-semibold">
            <File className="w-4 h-4" />
            Knowledge Hub
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0A1A0F] tracking-tight">
            Resources & <span className="text-[#11402D]">Insights</span>
          </h1>
          <p className="text-[#5A7060] max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Access our collection of case studies, white papers, guides, and reports to learn more about
            waste-to-energy, sustainability, and the circular economy.
          </p>
        </motion.div>

        {/* ─── Search & Filter ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-2xl border border-[#E5EDE8] p-4 shadow-soft flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A8BBB3]" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5EDE8] bg-[#F6F8F4] outline-none focus:ring-2 focus:ring-[#11402D]/20 focus:border-[#11402D] transition"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.id
                    ? "bg-[#11402D] text-white shadow-md"
                    : "bg-white border border-[#E5EDE8] text-[#5A7060] hover:bg-[#F6F8F4] hover:border-[#11402D]/30"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ─── Resource Grid ────────────────────────────────────── */}
        <motion.section
          initial="initial"
          animate="animate"
          variants={{
            animate: { transition: { staggerChildren: 0.06 } },
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <File className="w-12 h-12 text-[#A8BBB3] mx-auto mb-4" />
              <h3 className="font-display text-lg font-semibold text-[#0A1A0F]">No resources found</h3>
              <p className="text-[#5A7060] text-sm">Try adjusting your search or filter.</p>
            </div>
          ) : (
            filtered.map((resource) => {
              const Icon = resource.icon;
              return (
                <motion.div
                  key={resource.id}
                  variants={fadeInUp}
                  className="bg-white rounded-2xl border border-[#E5EDE8] p-6 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1 flex flex-col"
                >
                  <div className="flex items-start justify-between">
                    <div className={`p-2.5 rounded-xl bg-[#11402D]/10`}>
                      <Icon className="w-5 h-5 text-[#11402D]" />
                    </div>
                    <span className="text-xs font-medium text-[#11402D] bg-[#11402D]/10 px-2.5 py-1 rounded-full">
                      {resource.type}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-lg text-[#0A1A0F] mt-4 line-clamp-2">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-[#5A7060] mt-2 flex-1 line-clamp-3">
                    {resource.description}
                  </p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#E5EDE8]">
                    <div className="flex items-center gap-3 text-xs text-[#5A7060]">
                      <span className="flex items-center gap-1">
                        <Download className="w-3.5 h-3.5" /> {resource.downloads}
                      </span>
                      <span>•</span>
                      <span>{new Date(resource.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                    </div>
                    <Link
                      to={resource.link}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-[#11402D] hover:gap-2 transition-all"
                    >
                      {resource.type === "Report" || resource.type === "White Paper" ? "Download" : "Read More"}
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.section>

        {/* ─── CTA Section ────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0E2A1C] to-[#11402D] p-8 sm:p-12 text-white shadow-2xl border border-white/10"
        >
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ background: '#9CF06B0A' }} />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-2xl pointer-events-none" style={{ background: '#11402D40' }} />

          <div className="relative max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-semibold border border-white/10">
              <Lightbulb className="w-4 h-4" />
              Stay Informed
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Subscribe to Our <span className="text-[#9CF06B]">Resource Hub</span>
            </h2>
            <p className="text-white/70 text-base sm:text-lg max-w-lg mx-auto">
              Get the latest insights, case studies, and reports delivered straight to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-[#9CF06B] transition"
              />
              <button className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#9CF06B] text-[#0A1A0F] font-bold hover:bg-[#8CE05A] transition-all shadow-lg shadow-[#9CF06B]/30 whitespace-nowrap">
                Subscribe
              </button>
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

export default Resources;