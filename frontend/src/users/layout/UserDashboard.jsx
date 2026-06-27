// src/users/layout/UserDashboard.jsx
import { NavLink, useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  CreditCard,
  Bell,
  LogOut,
  Search,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Store,
  Recycle,
  Truck,
  DollarSign,
  FileText,
  ClipboardList,
  Trash2,
  MapPin,
  CheckCircle,
  MessageCircle,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

import SupplierDashboardContent from "../pages/supplier/SupplierDashboardContent";
import ProducerDashboardContent from "../pages/producer/ProducerDashboardContent";
import TransportDashboardContent from "../pages/transporter/TransportDashboardContent";

export default function UserDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userName, setUserName] = useState("ReVive User");
  const [userRole, setUserRole] = useState(null); // start as null
  const [loading, setLoading] = useState(true); // add loading state

  useEffect(() => {
    const userData = localStorage.getItem("user");

    if (!userData) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const user = JSON.parse(userData);

      setUserName(
        user.businessName ||
          user.business_name ||
          user.full_name ||
          user.firstName ||
          user.name ||
          "ReVive User"
      );

      // ─── Normalize role ──────────────────────────────────────
      const rawRole = user.role || user.user_role || "supplier";
      const roleMap = {
        "waste-supplier": "supplier",
        "energy-producer": "producer",
        "transport-partner": "transporter",
        supplier: "supplier",
        producer: "producer",
        transporter: "transporter",
      };
      const normalizedRole = roleMap[rawRole] || "supplier";
      setUserRole(normalizedRole);
    } catch (error) {
      console.error("Error parsing user data:", error);
      navigate("/login", { replace: true });
    } finally {
      setLoading(false); // loading complete
    }
  }, [navigate]);

  const getRoleLabel = () => {
    if (userRole === "producer") return "Energy Producer";
    if (userRole === "transporter") return "Transport Partner";
    return "Waste Supplier";
  };

  const getNavItems = () => {
    // Common items (Settings removed)
    const commonItems = [
      { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, end: true },
      { name: "Payments", path: "/dashboard/payments", icon: CreditCard },
      { name: "Invoices", path: "/dashboard/invoices", icon: FileText },
      { name: "Notifications", path: "/dashboard/notifications", icon: Bell },
      { name: "Messages", path: "/dashboard/messages", icon: MessageCircle },
      { name: "Profile", path: "/dashboard/profile", icon: User },
    ];

    if (userRole === "producer") {
      return [
        ...commonItems,
        { name: "Marketplace", path: "/dashboard/marketplace", icon: Store },
        { name: "My Requests", path: "/dashboard/my-requests", icon: ClipboardList },
        { name: "Incoming Deliveries", path: "/dashboard/incoming-deliveries", icon: Truck },
      ];
    }
    if (userRole === "transporter") {
      return [
        ...commonItems,
        { name: "Available Jobs", path: "/dashboard/jobs", icon: ClipboardList },
        { name: "Accepted Jobs", path: "/dashboard/accepted-jobs", icon: CheckCircle },
        { name: "Active Deliveries", path: "/dashboard/deliveries", icon: Truck },
        { name: "Route Tracking", path: "/dashboard/routes", icon: MapPin },
        { name: "Earnings", path: "/dashboard/earnings", icon: DollarSign },
      ];
    }
    // Supplier default
    return [
      ...commonItems,
      { name: "Post Waste", path: "/dashboard/post-waste", icon: Trash2 },
      { name: "My Listings", path: "/dashboard/listings", icon: Package },
      { name: "Collection Requests", path: "/dashboard/requests", icon: ClipboardList },
      { name: "Collection Tracking", path: "/dashboard/tracking", icon: Truck },
    ];
  };

  const renderDashboardContent = () => {
    if (userRole === "producer") return <ProducerDashboardContent />;
    if (userRole === "transporter") return <TransportDashboardContent />;
    return <SupplierDashboardContent />; // supplier or fallback
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "Dashboard Overview";
    if (path.includes("/marketplace")) return "Marketplace";
    if (path.includes("/my-requests")) return "My Requests";
    if (path.includes("/incoming-deliveries")) return "Incoming Deliveries";
    if (path.includes("/post-waste")) return "Post Waste";
    if (path.includes("/listings")) return "My Listings";
    if (path.includes("/requests")) return "Collection Requests";
    if (path.includes("/tracking")) return "Collection Tracking";
    if (path.includes("/accepted-jobs")) return "Accepted Jobs";
    if (path.includes("/jobs")) return "Available Jobs";
    if (path.includes("/deliveries")) return "Active Deliveries";
    if (path.includes("/routes")) return "Route Tracking";
    if (path.includes("/earnings")) return "Earnings";
    if (path.includes("/payments")) return "Payments";
    if (path.includes("/invoices")) return "Invoices";
    if (path.includes("/messages")) return "Messages";
    if (path.includes("/notifications")) return "Notifications";
    if (path.includes("/profile")) return "Profile";
    return "User Dashboard";
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("loginTime");
    navigate("/login", { replace: true });
  };

  const sidebarWidth = isCollapsed ? "w-20" : "w-72";
  const mainMargin = isCollapsed ? "lg:ml-20" : "lg:ml-72";
  const navItems = getNavItems();

  // ─── Show loading spinner while determining role ────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#11402D] border-t-[#9CF06B] rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-screen overflow-hidden bg-gray-50"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono-cw { font-family: 'JetBrains Mono', monospace; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #999; }
        * { scrollbar-width: thin; scrollbar-color: #ccc transparent; }
      `}</style>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full flex-col bg-gradient-to-b from-[#0E2A1C] to-[#11402D] text-white transition-all duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${sidebarWidth}`}
      >
        <div className="shrink-0 border-b border-white/10 px-5 py-4">
          <div className="flex items-center justify-between">
            {!isCollapsed ? (
              <div>
                <div className="flex items-center gap-2">
                  <Recycle className="h-7 w-7 text-[#9CF06B]" />
                  <h1 className="font-display text-xl font-black tracking-tight">
                    Re<span className="text-[#9CF06B]">V</span>ive
                  </h1>
                </div>
                <p className="font-mono-cw mt-0.5 text-xs text-white/50">
                  {getRoleLabel()}
                </p>
              </div>
            ) : (
              <Recycle className="mx-auto h-7 w-7 text-[#9CF06B]" />
            )}

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 lg:block"
              >
                {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 lg:hidden"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  title={isCollapsed ? item.name : ""}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-[#9CF06B]/20 text-[#9CF06B] shadow-lg"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    } ${isCollapsed ? "justify-center" : ""}`
                  }
                >
                  <Icon size={isCollapsed ? 20 : 18} className="shrink-0" />
                  {!isCollapsed && <span className="font-display">{item.name}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="shrink-0 border-t border-white/10 p-3">
          {!isCollapsed && (
            <div className="mb-3 rounded-xl bg-white/5 p-3">
              <p className="font-mono-cw text-[10px] uppercase tracking-wider text-white/40">
                Logged in as
              </p>
              <p className="font-display mt-0.5 text-sm font-semibold text-white">
                {userName}
              </p>
              <p className="mt-0.5 text-[10px] text-[#9CF06B]">{getRoleLabel()}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/20 px-3 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500 hover:text-white"
          >
            <LogOut size={16} />
            {!isCollapsed && <span className="font-display">Logout</span>}
          </button>
        </div>
      </aside>

      <div className={`flex h-full flex-col transition-all duration-300 ${mainMargin}`}>
        <header className="shrink-0 border-b border-gray-200 bg-white/95 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 lg:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 lg:hidden"
              >
                <Menu size={18} />
              </button>
              <div>
                <h2 className="font-display text-lg font-black text-gray-900 lg:text-xl">
                  {getPageTitle()}
                </h2>
                <p className="text-xs text-gray-500">
                  Welcome back, {userName.split(" ")[0]} · {getRoleLabel()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative hidden sm:block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="h-9 w-48 rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none transition focus:border-green-500 focus:bg-white lg:w-64"
                />
              </div>
              <NavLink
                to="/dashboard/messages"
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50"
              >
                <MessageCircle size={16} />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-green-500" />
              </NavLink>
              <NavLink
                to="/dashboard/notifications"
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50"
              >
                <Bell size={16} />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
              </NavLink>
              <NavLink
                to="/dashboard/profile"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50"
              >
                <User size={16} />
              </NavLink>
              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-lg transition hover:scale-[1.02] hover:bg-red-700"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6">
          {location.pathname === "/dashboard" ? renderDashboardContent() : <Outlet />}
        </main>

        <footer className="shrink-0 border-t border-gray-200 bg-white px-4 py-2 lg:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <Recycle size={12} className="text-[#0E2A1C]" />
              <p>© 2026 ReVive Energy.</p>
            </div>
            <div className="flex items-center gap-3">
              <NavLink to="/dashboard/profile" className="transition hover:text-[#0E2A1C]">
                Profile
              </NavLink>
              {/* Settings link removed to avoid errors */}
              <span className="font-mono-cw text-[10px]">v2.0.0</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}