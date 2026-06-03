import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiLayout, FiMap, FiLogOut, FiMenu, FiChevronLeft, 
  FiBell, FiLock, FiUserPlus, FiUser, FiInfo, FiChevronDown, FiFileText
} from "react-icons/fi";
import Logo from "./Logo";
import { useAuthSession } from "../../hooks/useAuthSession";

export default function AppLayout({ children, requiredRole = "" }) {
  const { isLoggedIn, user: sessionUser } = useAuthSession();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState({ name: "Guest", role: "Citizen" });
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/");
      return;
    }

    if (sessionUser?.must_change_password) {
      if (location.pathname !== "/change-password") {
        navigate("/change-password", { 
          state: { alert: "You are not authorized. You must change your password in order to get access to the system." } 
        });
        return;
      }
    }

    setUser(sessionUser);

    const role = String(sessionUser.role || "").toLowerCase();
    const reqRole = String(requiredRole || "").toLowerCase();
    if (reqRole) {
      const isAdminMatch = reqRole === "admin" && (role === "admin" || role === "ringmaster");
      const isStaffOrAdminMatch = reqRole === "stafforadmin" && (role === "admin" || role === "ringmaster" || role === "staff");
      const isDirectMatch = role === reqRole;
      if (!isAdminMatch && !isStaffOrAdminMatch && !isDirectMatch) {
        navigate("/");
      }
    }
  }, [navigate, requiredRole, isLoggedIn, sessionUser]);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/");
  };

  // Define Nav items based on role
  const getNavItems = () => {
    const role = String(user.role || "").toLowerCase();
    const common = [
      { path: "/change-password", label: "Security & Passwords", icon: <FiLock /> }
    ];

    if (user.must_change_password) {
      return common;
    }

    if (role === "admin" || role === "ringmaster") {
      return [
        { path: "/admin-dashboard", label: "Executive Admin Panel", icon: <FiLayout /> },
        { path: "/all-complaints", label: "All Complaints Ledger", icon: <FiFileText /> },
        { path: "/invite-staff", label: "Invite Civic Staff", icon: <FiUserPlus /> },
        ...common
      ];
    } else if (role === "staff") {
      return [
        { path: "/staff-dashboard", label: "Contractor Worklist", icon: <FiLayout /> },
        { path: "/all-complaints", label: "All Complaints Ledger", icon: <FiFileText /> },
        ...common
      ];
    } else {
      // Citizen default
      return [
        { path: "/citizen-dashboard", label: "My Grievances Console", icon: <FiLayout /> },
        { path: "/learn-more", label: "Information Guide", icon: <FiInfo /> },
        ...common
      ];
    }
  };

  const navItems = getNavItems();

  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path.includes("dashboard")) return "System Console / Overview";
    if (path.includes("invite-staff")) return "Civic Administration / Personnel Management";
    if (path.includes("change-password")) return "Account Security / Passwords";
    if (path.includes("learn-more")) return "Support / Platform Information";
    return "TattleTent / General Overview";
  };

  return (
    <div className="h-screen w-screen bg-slate-50 flex overflow-hidden font-sans">
      
      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            {/* Sidebar drawer content */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="relative flex flex-col w-[280px] h-full bg-slate-900 text-slate-200 z-50 shadow-2xl"
            >
              {/* Header */}
              <div className="h-24 flex items-center justify-between px-6 border-b border-slate-800/80 flex-shrink-0">
                <Logo showText={true} variant="dark" />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="text-slate-400 hover:text-white text-base w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center transition cursor-pointer"
                >
                  ✕
                </button>
              </div>
              {/* Navigation Tabs */}
              <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setMobileOpen(false);
                      }}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition select-none cursor-pointer ${
                        isActive
                          ? "bg-gradient-to-r from-primary-500 to-indigo-500 text-white shadow-lg shadow-primary-500/10 font-bold"
                          : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
              {/* Logout Footer */}
              <div className="p-4 border-t border-slate-800 bg-slate-950/40">
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition cursor-pointer"
                >
                  <FiLogOut className="text-lg" />
                  <span>Logout Account</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden md:flex flex-col h-screen bg-slate-900 text-slate-200 border-r border-slate-800 fixed left-0 top-0 z-20 flex-shrink-0"
      >
        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3.5 top-8 w-7 h-7 bg-primary-500 hover:bg-primary-600 rounded-full flex items-center justify-center text-white border border-slate-700 shadow-md hover:scale-105 active:scale-95 transition z-30"
        >
          <FiChevronLeft className={`transform transition ${collapsed ? "rotate-180" : ""}`} />
        </button>

        {/* Sidebar Header Logo */}
        <div className={`h-24 flex items-center border-b border-slate-800/80 overflow-hidden transition-all duration-300 ${collapsed ? "justify-center px-2" : "justify-between px-6"}`}>
          <Logo showText={!collapsed} variant="dark" />
        </div>

        {/* Navigation Tabs */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition select-none ${
                  isActive
                    ? "bg-gradient-to-r from-primary-500 to-indigo-500 text-white shadow-lg shadow-primary-500/10 font-bold"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                }`}
                title={collapsed ? item.label : ""}
              >
                <span className="text-lg">{item.icon}</span>
                {!collapsed && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {item.label}
                  </motion.span>
                )}
              </button>
            );
          })}
        </div>

        {/* Logout Footer Row */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition ${
              collapsed ? "justify-center" : ""
            }`}
            title={collapsed ? "Logout" : ""}
          >
            <FiLogOut className="text-lg" />
            {!collapsed && <span>Logout Account</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden relative h-full transition-all duration-300 ease-in-out ${collapsed ? "md:pl-[80px]" : "md:pl-[280px]"}`}>
        
        {/* Sticky Top Navbar */}
        <header className="h-20 bg-white border-b border-slate-100 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 flex-shrink-0 bg-white/95 backdrop-blur-md">
          {/* Left Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200 transition focus:outline-none"
              title="Open Menu"
            >
              <FiMenu className="text-base" />
            </button>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block sm:inline">
              {getBreadcrumbs()}
            </span>
          </div>

          {/* Right Header Navigation Panel */}
          <div className="flex items-center gap-5 relative">
            
            {/* Bell Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                }}
                className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-100 transition relative"
              >
                <FiBell className="text-lg" />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2.5 w-80 bg-white rounded-2xl shadow-strong border border-slate-100 p-4 z-50"
                  >
                    <h4 className="font-bold text-sm text-slate-800 border-b border-slate-50 pb-2 mb-2">
                      Recent Activity
                    </h4>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      <div className="flex items-start gap-2.5 text-xs text-slate-600">
                        <span className="text-emerald-500 text-sm">🔔</span>
                        <p>Welcome to <strong>TattleTent</strong>! Set up your civic profile to get started.</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-3 pl-3 pr-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 transition"
              >
                <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm select-none">
                  {String(user.name || "G")[0].toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-slate-800 leading-tight line-clamp-1">{user.name}</p>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{user.role}</p>
                </div>
                <FiChevronDown className="text-slate-400 text-xs" />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2.5 w-56 bg-white rounded-2xl shadow-strong border border-slate-100 overflow-hidden z-50"
                  >
                    <div className="p-3 border-b border-slate-50 bg-slate-50/50 text-left">
                      <p className="text-xs font-bold text-slate-800">{user.name}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{user.email}</p>
                    </div>
                    <div className="p-1.5 space-y-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate("/change-password");
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition flex items-center gap-2"
                      >
                        <FiLock /> Change Password
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 hover:text-red-600 transition flex items-center gap-2"
                      >
                        <FiLogOut /> Logout Account
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Scrollable Page Body Canvas */}
        <main className="flex-1 overflow-y-auto focus:outline-none relative">
          <div className="absolute inset-0 grid-mesh-bg opacity-30 pointer-events-none z-0"></div>
          <div className="relative z-10 w-full">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
