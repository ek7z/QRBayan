import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import {
  LogOut,
  LayoutDashboard,
  History,
  CreditCard,
  ShieldCheck,
  Link2,
  Gift,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Utility QR", path: "/utility-qr", icon: Link2 },
    { label: "Free Tasks", path: "/tasks", icon: Gift },
    { label: "History", path: "/history", icon: History },
    { label: "Buy Credits", path: "/buy-credits", icon: CreditCard },
  ];

  if (user?.role === "admin") {
    navItems.push({ label: "Admin Panel", path: "/admin", icon: ShieldCheck });
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
      <aside className="hidden h-screen w-72 shrink-0 border-r border-slate-800/60 bg-slate-900/70 md:flex md:flex-col">
        <div className="p-6 border-b border-slate-800/60">
          <Link to="/dashboard" className="block">
            <div className="flex h-16 w-full items-center justify-center overflow-hidden rounded-2xl bg-white px-3 shadow-lg shadow-blue-900/20">
              <img
                src="/1.png"
                alt="QRBayan"
                className="h-full w-full object-contain"
              />
            </div>
            <p className="mt-3 text-xs text-slate-500">Merchant dashboard</p>
          </Link>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
          <p className="px-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-3">
            Navigation
          </p>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`mb-1 flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-500/10 text-white border border-blue-500/20"
                    : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-200 border border-transparent"
                }`}
              >
                <item.icon
                  className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-slate-500"}`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-800/60 p-4">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-sm font-semibold text-white">
              {user?.email?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.email?.split("@")[0]}
              </p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-2xl px-3 py-3 text-sm text-slate-400 transition-colors hover:bg-slate-800/70 hover:text-red-400"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800/50">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="flex min-w-0 flex-1 items-center">
            <div className="flex h-10 w-36 max-w-full items-center justify-center overflow-hidden rounded-xl bg-white px-2">
              <img
                src="/1.png"
                alt="QRBayan"
                className="h-full w-full object-contain"
              />
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-slate-400 hover:text-white"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {mobileOpen && (
          <div className="px-4 pb-4 border-t border-slate-800/50">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                    isActive
                      ? "bg-blue-500/10 text-white"
                      : "text-slate-400 hover:bg-slate-800/70 hover:text-white"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 mt-2 w-full"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        )}
      </div>

      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="min-h-full bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_35%)] pt-16 md:pt-0 p-5 md:p-8 lg:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
