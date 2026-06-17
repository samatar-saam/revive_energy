import React, { useEffect, useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";

const ReViveNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { name: "Home", href: "/", hasDropdown: false },
    { name: "Marketplace", href: "/marketplace", hasDropdown: false },
    {
      name: "Solutions",
      href: "/solutions",
      hasDropdown: true,
      dropdownItems: [
        { name: "Organic Waste", href: "/solutions/organic-waste", icon: "🌱" },
        { name: "Agricultural Waste", href: "/solutions/agricultural-waste", icon: "🌾" },
        { name: "Industrial Waste", href: "/solutions/industrial-waste", icon: "🏭" },
        { name: "Plastic Recycling", href: "/solutions/plastic-recycling", icon: "♻️" },
      ],
    },
    { name: "Impact", href: "/impact", hasDropdown: false },
    { name: "How It Works", href: "/how-it-works", hasDropdown: false },
    { name: "Partners", href: "/partners", hasDropdown: false },
    { name: "Resources", href: "/resources", hasDropdown: false },
    { name: "About", href: "/about", hasDropdown: false },
    { name: "Contact", href: "/contact", hasDropdown: false },
  ];

  // Calculate scroll progress
  useEffect(() => {
    const calculateScrollProgress = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const maxScroll = documentHeight - windowHeight;
      const progress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
      setScrollProgress(progress);
    };

    // Use requestAnimationFrame for smooth performance
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          calculateScrollProgress();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", calculateScrollProgress);
    
    // Initial calculation
    calculateScrollProgress();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", calculateScrollProgress);
    };
  }, []);

  // Reset scroll progress on route change
  useEffect(() => {
    setScrollProgress(0);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
        setOpenDropdown(null);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest(".dropdown-container")) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openDropdown]);

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
    setOpenDropdown(null);
  };

  return (
    <>
      {/* Scroll Progress Bar - Fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-[100] h-[2px] sm:h-[3px] bg-transparent overflow-hidden">
        <div
          className="h-full transition-all duration-200 ease-out"
          style={{
            width: `${scrollProgress}%`,
            background: "linear-gradient(90deg, #11402D, #9CF06B, #11402D)",
            boxShadow: "0 0 8px rgba(156, 240, 107, 0.5)",
          }}
        />
      </div>

      <nav
        className={`sticky top-0 z-50 w-full bg-[#F6F8F4] transition-all duration-300 ${
          scrolled
            ? "shadow-md border-b border-[#0E2A1C]/10"
            : "border-b border-[#0E2A1C]/10"
        }`}
      >
        <div className="mx-auto max-w-[1440px] px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex h-16 lg:h-20 items-center justify-between gap-3">
            {/* Logo */}
            <Link to="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 lg:h-16 lg:w-16 shrink-0 items-center justify-center">
                <img
                  src={logo}
                  alt="ReVive Energy Logo"
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="min-w-0 leading-tight">
                <h1 className="truncate text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-[#0E2A1C]">
                  Re<span className="text-[#11402D]">V</span>ive{" "}
                  <span className="text-[#11402D]">Energy</span>
                </h1>

                <p className="truncate text-[9px] sm:text-[10px] md:text-xs font-semibold uppercase italic tracking-wide text-[#11402D]">
                  TRANSFORMING WASTE
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden xl:flex items-center gap-1">
              {navLinks.map((link) => (
                <div key={link.name} className="relative dropdown-container">
                  {link.hasDropdown ? (
                    <>
                      <button
                        onClick={() =>
                          setOpenDropdown(
                            openDropdown === link.name ? null : link.name
                          )
                        }
                        className={`flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium transition ${
                          openDropdown === link.name
                            ? "bg-[#11402D]/10 text-[#11402D]"
                            : "text-[#0E2A1C]/80 hover:bg-[#11402D]/5 hover:text-[#11402D]"
                        }`}
                      >
                        {link.name}
                        <ChevronDown
                          className={`h-3.5 w-3.5 transition-transform duration-200 ${
                            openDropdown === link.name ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {openDropdown === link.name && (
                        <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-xl border border-[#0E2A1C]/10 bg-white py-2 shadow-lg">
                          <Link
                            to="/solutions"
                            className="group flex items-center gap-3 border-b border-[#0E2A1C]/10 px-4 py-2.5 text-sm font-semibold text-[#11402D] transition hover:bg-[#11402D]/5"
                            onClick={() => setOpenDropdown(null)}
                          >
                            <span className="text-lg">📋</span>
                            <span className="flex-1">All Solutions</span>
                            <span className="opacity-0 transition group-hover:opacity-100">
                              →
                            </span>
                          </Link>

                          {link.dropdownItems.map((item) => (
                            <Link
                              key={item.name}
                              to={item.href}
                              className="group flex items-center gap-3 px-4 py-2.5 text-sm text-[#0E2A1C]/80 transition hover:bg-[#11402D]/5 hover:text-[#11402D]"
                              onClick={() => setOpenDropdown(null)}
                            >
                              <span className="text-lg">{item.icon}</span>
                              <span className="flex-1">{item.name}</span>
                              <span className="opacity-0 transition group-hover:opacity-100">
                                →
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      to={link.href}
                      className="rounded-full px-3 py-2 text-sm font-medium text-[#0E2A1C]/80 transition hover:bg-[#11402D]/5 hover:text-[#11402D]"
                    >
                      {link.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Tablet Navigation */}
            <div className="hidden lg:flex xl:hidden items-center gap-1">
              {navLinks.slice(0, 5).map((link) => (
                <div key={link.name} className="relative dropdown-container">
                  {link.hasDropdown ? (
                    <>
                      <button
                        onClick={() =>
                          setOpenDropdown(
                            openDropdown === link.name ? null : link.name
                          )
                        }
                        className={`flex items-center gap-1 rounded-full px-2.5 py-2 text-sm font-medium transition ${
                          openDropdown === link.name
                            ? "bg-[#11402D]/10 text-[#11402D]"
                            : "text-[#0E2A1C]/80 hover:bg-[#11402D]/5 hover:text-[#11402D]"
                        }`}
                      >
                        {link.name}
                        <ChevronDown
                          className={`h-3.5 w-3.5 transition-transform duration-200 ${
                            openDropdown === link.name ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {openDropdown === link.name && (
                        <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-xl border border-[#0E2A1C]/10 bg-white py-2 shadow-lg">
                          <Link
                            to="/solutions"
                            className="group flex items-center gap-3 border-b border-[#0E2A1C]/10 px-4 py-2.5 text-sm font-semibold text-[#11402D] transition hover:bg-[#11402D]/5"
                            onClick={() => setOpenDropdown(null)}
                          >
                            <span className="text-lg">📋</span>
                            <span className="flex-1">All Solutions</span>
                            <span className="opacity-0 transition group-hover:opacity-100">
                              →
                            </span>
                          </Link>

                          {link.dropdownItems.map((item) => (
                            <Link
                              key={item.name}
                              to={item.href}
                              className="group flex items-center gap-3 px-4 py-2.5 text-sm text-[#0E2A1C]/80 transition hover:bg-[#11402D]/5 hover:text-[#11402D]"
                              onClick={() => setOpenDropdown(null)}
                            >
                              <span className="text-lg">{item.icon}</span>
                              <span className="flex-1">{item.name}</span>
                              <span className="opacity-0 transition group-hover:opacity-100">
                                →
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      to={link.href}
                      className="rounded-full px-2.5 py-2 text-sm font-medium text-[#0E2A1C]/80 transition hover:bg-[#11402D]/5 hover:text-[#11402D]"
                    >
                      {link.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Login */}
            <div className="hidden lg:flex shrink-0 items-center">
              <Link
                to="/login"
                className="rounded-full border border-[#0E2A1C]/20 px-4 xl:px-5 py-2 text-sm font-semibold text-[#0E2A1C] transition hover:border-[#11402D] hover:bg-[#11402D]/5"
              >
                Log in
              </Link>
            </div>

            {/* Mobile Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden rounded-xl p-2 text-[#0E2A1C]/70 transition hover:bg-[#11402D]/10 hover:text-[#11402D]"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <X className="h-7 w-7" strokeWidth={2.5} />
              ) : (
                <Menu className="h-7 w-7" strokeWidth={2.5} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen
              ? "max-h-[calc(100vh-4rem)] opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-[#0E2A1C]/10 bg-[#F6F8F4] px-4 py-3">
            {navLinks.map((link) => (
              <div key={link.name}>
                {link.hasDropdown ? (
                  <>
                    <button
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === link.name ? null : link.name
                        )
                      }
                      className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-[#0E2A1C]/80 transition hover:bg-[#11402D]/5 hover:text-[#11402D] sm:text-base"
                    >
                      <span>{link.name}</span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          openDropdown === link.name ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <div
                      className={`ml-4 overflow-hidden transition-all duration-300 ${
                        openDropdown === link.name
                          ? "max-h-96 opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <Link
                        to="/solutions"
                        className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold text-[#11402D] transition hover:bg-[#11402D]/5"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setOpenDropdown(null);
                        }}
                      >
                        <span className="text-base">📋</span>
                        <span>All Solutions</span>
                      </Link>

                      {link.dropdownItems.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-[#0E2A1C]/70 transition hover:bg-[#11402D]/5 hover:text-[#11402D]"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setOpenDropdown(null);
                          }}
                        >
                          <span className="text-base">{item.icon}</span>
                          <span>{item.name}</span>
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <Link
                    to={link.href}
                    className="block rounded-xl px-4 py-3 text-sm font-medium text-[#0E2A1C]/80 transition hover:bg-[#11402D]/5 hover:text-[#11402D] sm:text-base"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                )}
              </div>
            ))}

            <div className="mt-4 border-t border-[#0E2A1C]/10 pt-4">
              <Link
                to="/login"
                className="block w-full rounded-xl border border-[#0E2A1C]/20 px-4 py-3 text-center font-semibold text-[#0E2A1C] transition hover:bg-[#11402D]/5"
                onClick={() => setMobileMenuOpen(false)}
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default ReViveNavbar;