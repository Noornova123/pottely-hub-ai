import { Link, useRouterState, Navigate, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard, Users, Megaphone, Instagram, Gift, Star,
  Briefcase, BarChart3, Settings, Bell, Menu, X, Sparkles, LogOut,
} from "lucide-react";
import { useAuth, useData } from "@/lib/app-store";
import { toast } from "sonner";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/campaigns", label: "Retention", icon: Megaphone },
  { to: "/social", label: "Social Media", icon: Instagram },
  { to: "/loyalty", label: "Loyalty & Offers", icon: Gift },
  { to: "/reviews", label: "Google Reviews", icon: Star },
  { to: "/operations", label: "Operations", icon: Briefcase },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children, title }: { children: ReactNode; title: string }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, logout } = useAuth();
  const { business } = useData();
  const navigate = useNavigate();

  if (!user) return <Navigate to="/auth" />;

  const handleSignOut = () => {
    logout();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-sidebar text-sidebar-foreground transform transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gold text-gold-foreground font-black">
              P
            </div>
            <span className="text-lg font-bold tracking-tight">POTTELY</span>
          </Link>
          <button
            className="lg:hidden text-sidebar-foreground/70"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-4 py-2 text-[10px] uppercase tracking-widest text-sidebar-foreground/50">
          AI Growth Platform
        </div>
        <nav className="px-3 pb-6 space-y-1">
          {nav.map((n) => {
            const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{n.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-sidebar-accent/40 p-3 text-xs">
          <div className="flex items-center gap-2 font-semibold text-gold">
            <Sparkles className="h-3.5 w-3.5" /> {business.plan} plan
          </div>
          <p className="mt-1 text-sidebar-foreground/70">
            AI campaigns, unlimited customers, priority support.
          </p>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 h-16 bg-card/80 backdrop-blur border-b border-border">
          <div className="h-full grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-4 sm:px-6">
            <button
              className="lg:hidden text-foreground"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground truncate">
                {business.category} · {business.name}
              </div>
              <h1 className="text-base sm:text-lg font-semibold truncate">{title}</h1>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button className="relative grid h-9 w-9 place-items-center rounded-lg border border-border hover:bg-muted transition-colors">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-gold" />
              </button>
              <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-border">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  {business.name.charAt(0)}
                </div>
                <div className="text-xs">
                  <div className="font-semibold">Ravi Kumar</div>
                  <div className="text-muted-foreground">Owner</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
