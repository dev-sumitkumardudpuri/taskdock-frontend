import React, { useState, useEffect, useRef } from "react";
import {
  Sun,
  Moon,
  LogOut,
  Settings,
  X,
  Edit2,
  Check,
  Building2,
  Menu,
} from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";

const getInitials = (name = "") => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
};

function TopBar({
  user,
  onLogout,
  onUserUpdate,
  currentWorkspaceName = "Tech Team",
  onlineUsers = [],
  onToggleSidebar,
}) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light",
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || "");
  const [loading, setLoading] = useState(false);

  const dropdownRef = useRef(null);
  const BACKEND_BASE =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) setNameInput(user.name);
  }, [user]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleSaveProfile = async () => {
    if (!nameInput.trim()) {
      toast.error("Name cannot be empty!");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${BACKEND_BASE}/api/auth/profile`,
        { name: nameInput.trim() },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          withCredentials: true,
        },
      );

      if (res.data.success) {
        toast.success("Profile updated!");
        localStorage.setItem("user", JSON.stringify(res.data.user));
        if (onUserUpdate) onUserUpdate(res.data.user);
        setIsEditing(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between sticky top-0 z-40 transition-colors">
        {/* Left: Workspace Indicator & Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden cursor-pointer"
            aria-label="Open Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="p-1.5 sm:p-2 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
            <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block leading-tight">
              Workspace
            </span>
            <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
              {currentWorkspaceName}
            </h2>
          </div>
        </div>

        {/* Right Elements */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {onlineUsers.length > 0 && (
            <div className="hidden sm:flex items-center -space-x-2 mr-2">
              {onlineUsers.slice(0, 4).map((u, idx) => (
                <div
                  key={u.id || u._id || idx}
                  title={`${u.name || "Member"} (Online)`}
                  className="relative w-8 h-8 rounded-full bg-indigo-600 text-white font-semibold text-xs flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-sm cursor-pointer hover:z-10 transition-transform hover:scale-110"
                >
                  {getInitials(u.name)}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"></span>
                </div>
              ))}
            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === "light" ? (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            )}
          </button>

          {/* User Profile Avatar & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 p-1 sm:p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-linear-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center shadow-md">
                {getInitials(user?.name)}
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-50">
                <div className="px-3.5 sm:px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                    {user?.name}
                  </p>
                  <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                    {user?.email}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setIsSettingsOpen(true);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Profile Settings</span>
                </button>

                <button
                  onClick={onLogout}
                  className="w-full px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-100 dark:border-slate-800 relative animate-in fade-in zoom-in-95 my-auto max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsSettingsOpen(false);
                setIsEditing(false);
              }}
              className="absolute right-3.5 top-3.5 sm:right-5 sm:top-5 p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-4 pr-6">
              Account Settings
            </h3>

            <div className="space-y-3.5 sm:space-y-4">
              <div className="flex items-center gap-3 sm:gap-4 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-indigo-600 text-white font-bold text-base sm:text-lg flex items-center justify-center shadow shrink-0">
                  {getInitials(user?.name)}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] sm:text-xs text-slate-400 block">
                    Account Role
                  </span>
                  <p className="text-xs sm:text-sm font-semibold capitalize text-slate-700 dark:text-slate-200 truncate">
                    {user?.role || "Member"}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className={`w-full px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm rounded-xl border transition-all ${
                    isEditing
                      ? "border-indigo-500 bg-white dark:bg-slate-900 ring-2 ring-indigo-500/20 text-slate-800 dark:text-slate-100"
                      : "border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 cursor-not-allowed"
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ""}
                  className="w-full px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/40 text-slate-400 cursor-not-allowed truncate"
                />
              </div>
            </div>

            <div className="mt-5 sm:mt-6 flex justify-end gap-2.5 sm:gap-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3.5 sm:px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-1.5 sm:gap-2 cursor-pointer transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setNameInput(user?.name || "");
                    }}
                    className="px-3.5 sm:px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="px-3.5 sm:px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1.5 sm:gap-2 disabled:opacity-50 cursor-pointer transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TopBar;
