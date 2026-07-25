import React, { useState, useEffect } from "react";
import { Zap, Sun, Moon } from "lucide-react";

const Navbar = ({ onOpenAuth }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark" ? "dark" : "light";
    }
    return "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md transition-all duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group">
          <div className="p-2 sm:p-2.5 bg-linear-to-tr from-purple-600 via-violet-600 to-indigo-500 text-white rounded-xl sm:rounded-2xl shadow-sm shadow-purple-500/20 group-hover:scale-105 transition-transform duration-200 shrink-0">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <span className="text-lg sm:text-xl font-extrabold tracking-tight bg-linear-to-r from-purple-700 via-indigo-700 to-purple-900 dark:from-white dark:to-slate-200 bg-clip-text text-transparent truncate">
            TaskDock
          </span>
        </div>

        {/* Action Buttons Section */}
        <div className="flex items-center gap-1 sm:gap-2.5">
          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-150 active:scale-95 shrink-0"
          >
            {theme === "light" ? (
              <Moon className="w-4.5 h-4.5" />
            ) : (
              <Sun className="w-4.5 h-4.5 text-amber-400" />
            )}
          </button>

          {/* Log in Button */}
          <button
            onClick={() => onOpenAuth("login")}
            className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-all duration-150 whitespace-nowrap"
          >
            Log in
          </button>

          {/* Sign up Button */}
          <button
            onClick={() => onOpenAuth("signup")}
            className="text-xs sm:text-sm font-bold text-white bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-95 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl shadow-sm shadow-purple-500/20 hover:shadow-md hover:shadow-purple-500/30 transition-all duration-200 whitespace-nowrap"
          >
            Sign up
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
