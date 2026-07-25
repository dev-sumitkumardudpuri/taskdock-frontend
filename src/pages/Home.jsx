import React from "react";
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Move,
  Clock,
  UserCheck,
  Zap,
  Kanban,
  ShieldCheck,
} from "lucide-react";

const Home = ({ onOpenAuth }) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 sm:pt-12 sm:pb-24 lg:pt-20 lg:pb-32 bg-slate-50/50 dark:bg-slate-950/50 transition-colors duration-300">
      {/* Soft Background Mesh & Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 sm:h-125 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(147,51,234,0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(147,51,234,0.22),rgba(15,23,42,0))] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-40 sm:w-150 sm:h-75 bg-linear-to-tr from-purple-500/15 via-violet-500/10 to-indigo-500/15 blur-[80px] sm:blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Announcement Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-1.5 rounded-full bg-purple-50/90 dark:bg-purple-950/50 border border-purple-200/80 dark:border-purple-800/50 text-xs sm:text-sm font-semibold text-purple-800 dark:text-purple-300 shadow-xs backdrop-blur-md hover:border-purple-300 dark:hover:border-purple-700 transition-all cursor-default text-center">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400 animate-pulse shrink-0" />
            <span>TaskDock with Real-Time Socket Sync</span>
          </div>
        </div>

        {/* Big Heading & Subheading */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15] sm:leading-[1.12]">
            Manage Team Projects in <br className="hidden sm:inline" />
            <span className="bg-linear-to-r from-purple-700 via-violet-600 to-indigo-600 dark:from-purple-400 dark:via-violet-400 dark:to-indigo-300 bg-clip-text text-transparent">
              Real-Time
            </span>{" "}
            with TaskDock
          </h1>

          <p className="mt-4 sm:mt-6 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
            A visual Kanban platform built for modern teams with live sync and
            intuitive drag-and-drop workspace management.
          </p>

          {/* CTA Buttons */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 px-4 sm:px-0">
            <button
              onClick={() => onOpenAuth("signup")}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-base shadow-md shadow-purple-500/20 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5 active:scale-95"
            >
              <span>Start for Free</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Micro Trust Indicators */}
          <div className="mt-6 sm:mt-7 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            <span className="flex items-center gap-1.5 sm:gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> No
              credit card required
            </span>
            <span className="flex items-center gap-1.5 sm:gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />{" "}
              Instant Socket.io setup
            </span>
          </div>
        </div>

        <div className="mt-10 sm:mt-14 relative max-w-5xl mx-auto">
          {/* Main Board Container */}
          <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-3 sm:p-6 shadow-2xl shadow-purple-500/5 relative z-10 overflow-hidden">
            {/* Top Board Bar Mockup */}
            <div className="flex items-center justify-between gap-2 pb-3 sm:pb-4 mb-3 sm:mb-4 border-b border-slate-200/80 dark:border-slate-800/80">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-500/80 shrink-0" />
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500/80 shrink-0" />
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500/80 shrink-0" />
                <span className="ml-1 sm:ml-2 text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                  TaskDock Workspace / Marketing Launch Board
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-purple-600 text-[9px] sm:text-[10px] text-white flex items-center justify-center font-bold shadow-xs">
                  R
                </div>
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-indigo-600 text-[9px] sm:text-[10px] text-white flex items-center justify-center font-bold -ml-2 border-2 border-white dark:border-slate-900 shadow-xs">
                  A
                </div>
                <span className="text-[10px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 sm:px-2.5 py-0.5 rounded-full flex items-center gap-1 sm:gap-1.5 border border-emerald-200 dark:border-emerald-900/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />{" "}
                  Live
                </span>
              </div>
            </div>

            {/* Kanban Columns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 text-left">
              {/* Column 1: To Do */}
              <div className="bg-slate-100/60 dark:bg-slate-800/30 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-200/50 dark:border-slate-800/60">
                <div className="flex items-center justify-between mb-2.5 sm:mb-3 px-1">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    To Do (2)
                  </span>
                  <span className="text-xs text-slate-400 font-bold">+</span>
                </div>
                <div className="space-y-2.5 sm:space-y-3">
                  <div className="p-3 sm:p-3.5 bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/80 px-2 py-0.5 rounded-md">
                      Auth Flow
                    </span>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-2">
                      JWT & HttpOnly Cookie Setup
                    </p>
                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 2h left
                      </span>
                      <div className="w-5 h-5 rounded-full bg-purple-600 text-[9px] text-white flex items-center justify-center font-bold">
                        JD
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2: In Progress */}
              <div className="bg-slate-100/60 dark:bg-slate-800/30 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-200/50 dark:border-slate-800/60">
                <div className="flex items-center justify-between mb-2.5 sm:mb-3 px-1">
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    In Progress (1)
                  </span>
                </div>
                <div className="space-y-2.5 sm:space-y-3">
                  <div className="p-3 sm:p-3.5 bg-white dark:bg-slate-900 rounded-xl shadow-md border border-purple-500/40 relative">
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-md">
                      Sockets
                    </span>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-2">
                      Socket.io Room Broadcasting
                    </p>
                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-purple-600 dark:text-purple-400" />{" "}
                        Active
                      </span>
                      <div className="w-5 h-5 rounded-full bg-indigo-600 text-[9px] text-white flex items-center justify-center font-bold">
                        AK
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 3: Done */}
              <div className="bg-slate-100/60 dark:bg-slate-800/30 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-200/50 dark:border-slate-800/60">
                <div className="flex items-center justify-between mb-2.5 sm:mb-3 px-1">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Done (3)
                  </span>
                </div>
                <div className="space-y-2.5 sm:space-y-3">
                  <div className="p-3 sm:p-3.5 bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 opacity-80">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                      Design
                    </span>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-2 line-through">
                      Tailwind Navbar & Theme Setup
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Animated Badge */}
          <div className="hidden sm:flex absolute -top-5 -right-5 z-20 bg-white dark:bg-slate-900 p-3.5 rounded-2xl shadow-xl border border-purple-500/30 items-center gap-3 animate-bounce [animation-duration:3.5s]">
            <div className="p-2 bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 rounded-xl">
              <Move className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Task Moved Live
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Rahul updated 'Header Fix'
              </p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 sm:mt-28 max-w-5xl mx-auto" id="features">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Everything you need to ship faster
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400 text-xs sm:text-base">
              Powerful tools designed to keep your team aligned and productive.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-left">
            {/* Feature 1 */}
            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/5 transition-all hover:-translate-y-1 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 transition-transform duration-200">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-1.5 sm:mb-2">
                Live Collaboration
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Experience instant real-time updates across all devices powered
                by Socket.io web sockets.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/5 transition-all hover:-translate-y-1 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-violet-100 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 transition-transform duration-200">
                <Kanban className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-1.5 sm:mb-2">
                Visual Workflows
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Intuitive drag-and-drop Kanban boards to track project states
                and move tasks seamlessly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 transition-all hover:-translate-y-1 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 transition-transform duration-200">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-1.5 sm:mb-2">
                Role-Based Access
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Granular permission controls ensuring safe, secure, and
                organized workspaces for everyone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;
