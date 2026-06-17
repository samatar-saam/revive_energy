// src/users/layout/UserDashboard.jsx
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  CreditCard,
  BarChart3,
  Star,
  Bell,
  Mail,
  LifeBuoy,
  Settings,
  LogOut,
  Search,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Store,
  Tag,
  Recycle,
  Truck,
  Factory,
  Leaf,
  Award,
  DollarSign,
  FileText,
  ClipboardList,
  Building2,
  Trash2,
  Calendar,
  MapPin,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  History,
  Headphones,
  MessageCircle,
  User
} from "lucide-react";
import { useEffect, useState } from "react";

export default function UserDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userName, setUserName] = useState("GreenLeaf Hotel");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserName(
          user.businessName ||
            user.firstName ||
            user.name ||
            "GreenLeaf Hotel"
        );
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, end: true },
    { name: "Request Pickup", path: "/dashboard/request-pickup", icon: Truck },
    { name: "Report Waste", path: "/dashboard/report-waste", icon: AlertCircle },
    { name: "My Collections", path: "/dashboard/collections", icon: ClipboardList },
    { name: "Waste History", path: "/dashboard/history", icon: History },
    { name: "Impact & Reports", path: "/dashboard/impact", icon: BarChart3 },
    { name: "Payments & Invoices", path: "/dashboard/payments", icon: CreditCard },
    { name: "Profile & Settings", path: "/dashboard/profile", icon: Settings },
    { name: "Support", path: "/dashboard/support", icon: LifeBuoy },
    { name: "Messages", path: "/dashboard/messages", icon: Mail },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("loginTime");
    navigate("/login", { replace: true });
  };

 const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "Dashboard Overview";
    if (path.includes("/request-pickup")) return "Request Pickup";
    if (path.includes("/report-waste")) return "Report Waste";
    if (path.includes("/collections")) return "My Collections";
    if (path.includes("/history")) return "Waste History";
    if (path.includes("/impact")) return "Impact & Reports";
    if (path.includes("/payments")) return "Payments & Invoices";
    if (path.includes("/profile")) return "Profile & Settings";
    if (path.includes("/support")) return "Customer Support";
    if (path.includes("/messages")) return "Messages";
    return "User Dashboard";
};

  const sidebarWidth = isCollapsed ? "w-20" : "w-72";
  const mainMargin = isCollapsed ? "lg:ml-20" : "lg:ml-72";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SCROLLABLE SIDEBAR - Dark Green Theme (matching AdminDashboard) */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col bg-gradient-to-b from-[#0E2A1C] to-[#11402D] text-white transition-all duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${sidebarWidth}`}
      >
        {/* LOGO */}
        <div className="shrink-0 border-b border-white/10 px-5 py-6">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div>
                <div className="flex items-center gap-2">
                  <Recycle className="w-8 h-8 text-[#9CF06B]" />
                  <h1 className="text-2xl font-black tracking-tight">
                    Re<span className="text-[#9CF06B]">V</span>ive
                  </h1>
                </div>
                <p className="mt-1 text-xs text-white/50">User Dashboard</p>
              </div>
            )}
            {isCollapsed && (
              <div className="mx-auto">
                <Recycle className="w-8 h-8 text-[#9CF06B]" />
              </div>
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

        {/* NAVIGATION SCROLL AREA */}
        <div className="sidebar-scroll flex-1 overflow-y-auto px-3 py-6">
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
                  <Icon size={isCollapsed ? 22 : 20} className="flex-shrink-0" />
                  {!isCollapsed && <span>{item.name}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>

       

        {/* SIDEBAR BOTTOM - Logout button with same styling as AdminDashboard */}
        <div className="shrink-0 border-t border-white/10 p-4">
          {!isCollapsed && (
            <div className="mb-4 rounded-2xl bg-white/5 p-4">
              {/* <p className="text-xs uppercase tracking-wider text-white/40">
                Logged in as
              </p> */}
              <p className="mt-1 font-semibold text-white">{userName}</p>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500/20 px-3 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500 hover:text-white"
          >
            <LogOut size={18} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className={`transition-all duration-300 ${mainMargin}`}>
        {/* TOPBAR - Matching AdminDashboard style */}
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
                <h2 className="text-2xl lg:text-3xl font-black text-gray-900">
                  {getPageTitle()}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Welcome back, {userName.split(' ')[0]}
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
                className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition"
              >
                <MessageCircle size={18} />
                <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-green-500" />
              </NavLink>

              <button className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-700">
                <Bell size={18} />
                <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-red-500" />
              </button>

              <NavLink
                to="/dashboard/profile"
                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition"
              >
                <User size={18} />
              </NavLink>

              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-red-700 hover:scale-[1.02]"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="min-h-[calc(100vh-90px)] p-5 lg:p-8">
          <Outlet />
        </main>

        {/* FOOTER - Matching AdminDashboard style */}
        <footer className="border-t border-gray-200 bg-white px-5 py-4 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <Recycle size={14} className="text-[#0E2A1C]" />
              <p>© 2026 ReVive Energy. Transforming Waste Into Clean Energy.</p>
            </div>
            <div className="flex items-center gap-4">
              <NavLink to="/dashboard/support" className="hover:text-[#0E2A1C] transition">Support</NavLink>
              <NavLink to="/dashboard/profile" className="hover:text-[#0E2A1C] transition">Settings</NavLink>
              <span>v2.0.0</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}