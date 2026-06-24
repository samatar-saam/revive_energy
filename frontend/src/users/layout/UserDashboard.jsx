// src/users/layout/UserDashboard.jsx
import { NavLink, useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  CreditCard,
  Bell,
  Settings,
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
  const [userRole, setUserRole] = useState("supplier");

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

      setUserRole(user.role || user.user_role || "supplier");
    } catch (error) {
      console.error("Error parsing user data:", error);
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const getRoleLabel = () => {
    if (userRole === "producer" || userRole === "energy-producer") {
      return "Energy Producer";
    }

    if (userRole === "transporter" || userRole === "transport-partner") {
      return "Transport Partner";
    }

    return "Waste Supplier";
  };

  const getNavItems = () => {
    if (userRole === "producer" || userRole === "energy-producer") {
      return [
        { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, end: true },
        { name: "Marketplace", path: "/dashboard/marketplace", icon: Store },
        { name: "My Requests", path: "/dashboard/my-requests", icon: ClipboardList },
        { name: "Incoming Deliveries", path: "/dashboard/incoming-deliveries", icon: Truck },
        { name: "Payments", path: "/dashboard/payments", icon: CreditCard },
        { name: "Invoices", path: "/dashboard/invoices", icon: FileText },
        { name: "Notifications", path: "/dashboard/notifications", icon: Bell },
        { name: "Messages", path: "/dashboard/messages", icon: MessageCircle },
        { name: "Profile", path: "/dashboard/profile", icon: User },
        { name: "Settings", path: "/dashboard/settings", icon: Settings },
      ];
    }

    if (userRole === "transporter" || userRole === "transport-partner") {
      return [
        { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, end: true },
        { name: "Available Jobs", path: "/dashboard/jobs", icon: ClipboardList },
        { name: "Accepted Jobs", path: "/dashboard/accepted-jobs", icon: CheckCircle },
        { name: "Active Deliveries", path: "/dashboard/deliveries", icon: Truck },
        { name: "Route Tracking", path: "/dashboard/routes", icon: MapPin },
        { name: "Earnings", path: "/dashboard/earnings", icon: DollarSign },
        { name: "Payments", path: "/dashboard/payments", icon: CreditCard },
        { name: "Invoices", path: "/dashboard/invoices", icon: FileText },
        { name: "Notifications", path: "/dashboard/notifications", icon: Bell },
        { name: "Messages", path: "/dashboard/messages", icon: MessageCircle },
        { name: "Profile", path: "/dashboard/profile", icon: User },
        { name: "Settings", path: "/dashboard/settings", icon: Settings },
      ];
    }

    return [
      { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, end: true },
      { name: "Post Waste", path: "/dashboard/post-waste", icon: Trash2 },
      { name: "My Listings", path: "/dashboard/listings", icon: Package },
      { name: "Collection Requests", path: "/dashboard/requests", icon: ClipboardList },
      { name: "Collection Tracking", path: "/dashboard/tracking", icon: Truck },
      { name: "Payments", path: "/dashboard/payments", icon: CreditCard },
      { name: "Invoices", path: "/dashboard/invoices", icon: FileText },
      { name: "Notifications", path: "/dashboard/notifications", icon: Bell },
      { name: "Messages", path: "/dashboard/messages", icon: MessageCircle },
      { name: "Profile", path: "/dashboard/profile", icon: User },
      { name: "Settings", path: "/dashboard/settings", icon: Settings },
    ];
  };

  const renderDashboardContent = () => {
    if (userRole === "producer" || userRole === "energy-producer") {
      return <ProducerDashboardContent />;
    }

    if (userRole === "transporter" || userRole === "transport-partner") {
      return <TransportDashboardContent />;
    }

    return <SupplierDashboardContent />;
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
    if (path.includes("/settings")) return "Settings";

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

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        .font-display {
          font-family: 'Space Grotesk', sans-serif;
        }

        .font-mono-cw {
          font-family: 'JetBrains Mono', monospace;
        }
      `}</style>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col bg-gradient-to-b from-[#0E2A1C] to-[#11402D] text-white transition-all duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${sidebarWidth}`}
      >
        <div className="shrink-0 border-b border-white/10 px-5 py-6">
          <div className="flex items-center justify-between">
            {!isCollapsed ? (
              <div>
                <div className="flex items-center gap-2">
                  <Recycle className="h-8 w-8 text-[#9CF06B]" />
                  <h1 className="font-display text-2xl font-black tracking-tight">
                    Re<span className="text-[#9CF06B]">V</span>ive
                  </h1>
                </div>
                <p className="font-mono-cw mt-1 text-xs text-white/50">
                  {getRoleLabel()}
                </p>
              </div>
            ) : (
              <Recycle className="mx-auto h-8 w-8 text-[#9CF06B]" />
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden rounded-xl p-2 text-white/60 transition hover:bg-white/10 lg:flex"
              >
                {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>

              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-xl p-2 text-white/60 transition hover:bg-white/10 lg:hidden"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-6">
          <nav className="space-y-1.5">
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
                    `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? "bg-[#9CF06B]/20 text-[#9CF06B] shadow-lg"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    } ${isCollapsed ? "justify-center" : ""}`
                  }
                >
                  <Icon size={isCollapsed ? 22 : 20} className="shrink-0" />
                  {!isCollapsed && <span className="font-display">{item.name}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="shrink-0 border-t border-white/10 p-4">
          {!isCollapsed && (
            <div className="mb-4 rounded-2xl bg-white/5 p-4">
              <p className="font-mono-cw text-xs uppercase tracking-wider text-white/40">
                Logged in as
              </p>
              <p className="font-display mt-1 font-semibold text-white">{userName}</p>
              <p className="mt-1 text-xs text-[#9CF06B]">{getRoleLabel()}</p>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500/20 px-3 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500 hover:text-white"
          >
            <LogOut size={18} />
            {!isCollapsed && <span className="font-display">Logout</span>}
          </button>
        </div>
      </aside>

      <div className={`transition-all duration-300 ${mainMargin}`}>
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur-xl">
          <div className="flex flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-700 lg:hidden"
              >
                <Menu size={20} />
              </button>

              <div>
                <h2 className="font-display text-2xl font-black text-gray-900 lg:text-3xl">
                  {getPageTitle()}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Welcome back, {userName.split(" ")[0]} · {getRoleLabel()}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search dashboard..."
                  className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm outline-none transition focus:border-green-500 focus:bg-white sm:w-80"
                />
              </div>

              <NavLink
                to="/dashboard/messages"
                className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50"
              >
                <MessageCircle size={18} />
                <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-green-500" />
              </NavLink>

              <NavLink
                to="/dashboard/notifications"
                className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50"
              >
                <Bell size={18} />
                <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-red-500" />
              </NavLink>

              <NavLink
                to="/dashboard/profile"
                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50"
              >
                <User size={18} />
              </NavLink>

              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-[1.02] hover:bg-red-700"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-90px)] p-5 lg:p-8">
          {location.pathname === "/dashboard" ? renderDashboardContent() : <Outlet />}
        </main>

        <footer className="border-t border-gray-200 bg-white px-5 py-4 lg:px-8">
          <div className="flex flex-col gap-3 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Recycle size={14} className="text-[#0E2A1C]" />
              <p>© 2026 ReVive Energy. Transforming Waste Into Clean Energy.</p>
            </div>

            <div className="flex items-center gap-4">
              <NavLink to="/dashboard/profile" className="transition hover:text-[#0E2A1C]">
                Profile
              </NavLink>
              <NavLink to="/dashboard/settings" className="transition hover:text-[#0E2A1C]">
                Settings
              </NavLink>
              <span className="font-mono-cw">v2.0.0</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}