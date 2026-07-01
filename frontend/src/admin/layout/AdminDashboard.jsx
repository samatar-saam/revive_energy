import { NavLink, Outlet, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    // Get admin name from localStorage (fallback to user data)
    const adminData = localStorage.getItem("admin");
    const userData = localStorage.getItem("user");

    if (adminData) {
      try {
        const admin = JSON.parse(adminData);
        setAdminName(
          admin.firstName ||
            admin.name ||
            admin.email?.split("@")[0] ||
            "Admin"
        );
      } catch (error) {
        console.error("Error parsing admin data:", error);
      }
    } else if (userData) {
      try {
        const user = JSON.parse(userData);
        setAdminName(user.full_name || user.name || "Admin");
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard, end: true },
    { name: "Waste Sources", path: "/admin/waste-sources", icon: Trash2 },
    { name: "Waste Listings", path: "/admin/waste-listings", icon: Package },
    { name: "Processing Plants", path: "/admin/processing-plants", icon: Factory },
    { name: "Transporters", path: "/admin/transporters", icon: Truck },
    { name: "Waste Collections", path: "/admin/collections", icon: ClipboardList },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Companies", path: "/admin/companies", icon: Building2 },
    { name: "Payments", path: "/admin/payments", icon: CreditCard },
    { name: "Analytics", path: "/admin/analytics", icon: BarChart3 },
    { name: "Impact Reports", path: "/admin/impact-reports", icon: Leaf },
    { name: "Carbon Credits", path: "/admin/carbon-credits", icon: Award },
    { name: "Reviews", path: "/admin/reviews", icon: Star },
    { name: "Support", path: "/admin/support", icon: LifeBuoy },
    { name: "Messages", path: "/admin/messages", icon: Mail },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ];

  // ✅ FIXED: Clear ALL auth-related keys and navigate to admin login
  const handleLogout = () => {
    // Remove all auth-related items
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("admin");
    localStorage.removeItem("isAdminAuthenticated");
    localStorage.removeItem("adminLoginTime");
    // Also remove any other potential keys
    localStorage.removeItem("adminName");
    localStorage.removeItem("userRole");
    // If you use sessionStorage, clear those too
    sessionStorage.removeItem("adminSession");
    sessionStorage.removeItem("authToken");

    // Redirect to admin login page (or home if you prefer)
    navigate("/adminlogin", { replace: true });
  };

  const sidebarWidth = isCollapsed ? "w-20" : "w-72";
  const mainMargin = isCollapsed ? "lg:ml-20" : "lg:ml-72";

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        .font-display {
          font-family: 'Space Grotesk', sans-serif;
        }

        .font-mono-cw {
          font-family: 'JetBrains Mono', monospace;
        }

        /* Thin scrollbar for modern browsers */
        ::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #999;
        }

        /* Firefox */
        * {
          scrollbar-width: thin;
          scrollbar-color: #ccc transparent;
        }
      `}</style>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR - Dark Green Theme */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col bg-gradient-to-b from-[#0E2A1C] to-[#11402D] text-white transition-all duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${sidebarWidth}`}
      >
        {/* LOGO */}
        <div className="shrink-0 border-b border-white/10 px-5 py-4">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div>
                <div className="flex items-center gap-2">
                  <Recycle className="h-7 w-7 text-[#9CF06B]" />
                  <h1 className="font-display text-xl font-black tracking-tight">
                    Re<span className="text-[#9CF06B]">V</span>ive
                  </h1>
                </div>
                <p className="font-mono-cw mt-0.5 text-xs text-white/50">Admin Dashboard</p>
              </div>
            )}
            {isCollapsed && (
              <div className="mx-auto">
                <Recycle className="h-7 w-7 text-[#9CF06B]" />
              </div>
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

        {/* NAVIGATION SCROLL AREA */}
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

        {/* SIDEBAR BOTTOM */}
        <div className="shrink-0 border-t border-white/10 p-3">
          {!isCollapsed && (
            <div className="mb-3 rounded-xl bg-white/5 p-3">
              <p className="font-mono-cw text-[10px] uppercase tracking-wider text-white/40">
                Logged in as
              </p>
              <p className="font-display mt-0.5 text-sm font-semibold text-white">
                {adminName}
              </p>
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

      {/* MAIN CONTENT */}
      <div className={`transition-all duration-300 ${mainMargin}`}>
        {/* TOPBAR */}
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur-xl">
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
                  Dashboard Overview
                </h2>
                <p className="text-xs text-gray-500">
                  Welcome back, {adminName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative hidden sm:block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search admin..."
                  className="h-9 w-48 rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none transition focus:border-green-500 focus:bg-white lg:w-64"
                />
              </div>

              <NavLink
                to="/admin/messages"
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50"
              >
                <Mail size={16} />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-green-500" />
              </NavLink>

              <NavLink
                to="/admin/notifications"
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50"
              >
                <Bell size={16} />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
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

        {/* MAIN CONTENT AREA */}
        <main className="min-h-[calc(100vh-70px)] overflow-y-auto bg-gray-50 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}