import { Outlet } from "react-router-dom";import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useState, useRef, useEffect, useMemo } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  UserPlus,
  Menu,
  Bell,
  User,
  ChevronDown,
  LogOut,
  Settings,
  FolderKanban,
  ClipboardCheck,
  Clock3,
  CalendarClock,
  FilePlus2,
  FileText,
  List,
  PlusCircle,
  CalendarPlus,
  History,
} from "lucide-react";
import jwtDecode from "jwt-decode";



function Layout({ children }) {
  const location = useLocation();
  const dropdownRef = useRef(null);

  /* ---------------- THEME LOGIC ---------------- */

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  /* ---------------- UI STATE ---------------- */

  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  /* ---------------- AUTH ---------------- */

  const token = localStorage.getItem("token");

  const user = useMemo(() => {
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return {
        name: decoded.name,
        role:
          decoded[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ],
      };
    } catch {
      localStorage.removeItem("token");
      return null;
    }
  }, [token]);

  useEffect(() => {
    if (!token) window.location.href = "/login";
  }, [token]);

  /* ---------------- CLICK OUTSIDE ---------------- */

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ---------------- SIDEBAR MENU ITEM ---------------- */

  const menuItem = (path, label, Icon) => (
    <Link
      to={path}
      className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm transition ${
        location.pathname === path
          ? "bg-blue-100 text-blue-700 font-medium border-l-4 border-blue-600"
          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
      }`}
    >
      <Icon size={18} />
      {!collapsed && <span>{label}</span>}
    </Link>
  );

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? "w-20" : "w-64"
        } bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-4 transition-all duration-300 shadow-sm flex flex-col`}
      >
        <div className="flex justify-between items-center mb-8">
          {!collapsed && (
            <h2 className="text-lg font-semibold">Admin Dashboard</h2>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-500 hover:text-blue-600 transition"
          >
            <Menu size={20} />
          </button>
        </div>

       <nav className="space-y-2">
  {user?.role === "Admin" &&
    menuItem("/dashboard", "Dashboard", LayoutDashboard)}
  {user?.role === "Admin" &&
    menuItem("/appointments", "Appointments", CalendarDays)}
    {user?.role === "Admin" &&
    menuItem("/admin/register-staff", "Add new Staff", UserPlus)}
  {user?.role === "Admin" &&
    menuItem("/admin/admin-leaves", "Approve Leaves", ClipboardCheck)}
  {user?.role === "Admin" &&
    menuItem("/admin/categories", "Categories", FolderKanban)}
  
  {user?.role === "Admin" &&
    menuItem("/admin/add-service", "Add Services", PlusCircle)}
  {user?.role === "Admin" &&
    menuItem("/services", "View Services", List)}

  {user?.role === "Staff" &&
    menuItem("/staff/today", "Today's Appointments", Clock3)}
  {user?.role === "Staff" &&
    menuItem("/staff/upcoming", "Upcoming Appointments", CalendarClock)}
  {user?.role === "Staff" &&
    menuItem("/staff/apply-leave", "Apply Leave", FilePlus2)}
  {user?.role === "Staff" &&
    menuItem("/staff/my-leaves", "My Leaves", FileText)}

 {user?.role === "Customer" &&
  menuItem("/customer/dashboard", "Dashboard", LayoutDashboard)}
{user?.role === "Customer" &&
  menuItem("/customer/book-appointment", "Book Appointment", CalendarPlus)}
</nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col transition-all duration-300">
        
        {/* Top Navbar */}
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-8 py-4 flex justify-between items-center shadow-sm transition-colors duration-300">
          
          <h1 className="text-lg font-semibold">
            {location.pathname.substring(1).charAt(0).toUpperCase() +
              location.pathname.substring(2)}
          </h1>

          <div className="flex items-center gap-6 relative">
            
            {/* Notifications */}
            <button className="relative text-slate-600 dark:text-slate-300 hover:text-blue-600 transition">
              <Bell size={20} />
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] px-1.5 rounded-full">
                2
              </span>
            </button>

            {/* Profile */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 hover:text-blue-600 transition"
              >
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {user?.name?.charAt(0) || "A"}
                </div>
                {!collapsed && <ChevronDown size={16} />}
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden z-50">
                  
                  {/* User Info */}
                  <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-semibold truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-indigo-600 font-medium">
                      {user?.role}
                    </p>
                  </div>

                  <button className="flex items-center gap-2 w-full px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                    <User size={16} /> Profile
                  </button>

                  <button className="flex items-center gap-2 w-full px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                    <Settings size={16} /> Settings
                  </button>

                  {/* Theme Toggle */}
                 {/* Theme Toggle Switch */}
<div className="flex items-center justify-between px-4 py-3">
  <div className="flex items-center gap-2 text-sm font-medium">
    {theme === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode"}
  </div>

  <button
    onClick={toggleTheme}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
      theme === "dark" ? "bg-blue-600" : "bg-slate-300"
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
        theme === "dark" ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
</div>

                  <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>

                  <button
                    onClick={() => {
                      localStorage.removeItem("token");
                      window.location.href = "/login";
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-700 transition"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-8 space-y-8 transition-colors duration-300">
        
  <Outlet />

        </main>
      </div>
    </div>
  );
}

export default Layout;