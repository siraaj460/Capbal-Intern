import React from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { BookMarked, LayoutDashboard, Library, Sparkles, BarChart3, Mic, Layers, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/library", label: "Library", icon: Library },
  { to: "/flashcards", label: "Flashcards", icon: Layers },
  { to: "/voice-qa", label: "Voice Q&A", icon: Mic },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

export default function Layout() {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-background paper-grain">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <BookMarked className="w-4.5 h-4.5 text-primary-foreground" strokeWidth={2} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-accent" />
            </div>
            <div className="leading-tight">
              <div className="font-serif text-lg font-semibold tracking-tight">Mine</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground -mt-0.5">Study Atelier</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {nav.map((n) => {
              const Icon = n.icon;
              const active = location.pathname === n.to;
              return (
                <NavLink
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "px-3.5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {n.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/library?upload=1"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Material</span>
            </Link>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition-all shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden border-t border-border/60 overflow-x-auto">
          <div className="flex items-center gap-1 px-4 py-2">
            {nav.map((n) => {
              const Icon = n.icon;
              const active = location.pathname === n.to;
              return (
                <NavLink
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 whitespace-nowrap",
                    active ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  )}
                >
                  <Icon className="w-3 h-3" />
                  {n.label}
                </NavLink>
              );
            })}
            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 whitespace-nowrap text-muted-foreground"
            >
              <LogOut className="w-3 h-3" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-10 py-10">
        <Outlet />
      </main>

      <footer className="border-t border-border/60 mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground font-serif italic">
            "The mind is not a vessel to be filled, but a fire to be kindled."
          </p>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Mine · Educational AI
          </p>
        </div>
      </footer>
    </div>
  );
}
