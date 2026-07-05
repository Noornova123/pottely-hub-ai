import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/lib/app-store";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

const categories = ["Restaurant", "Salon", "Clinic", "Gym", "Retail", "Other"];

function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("demo@pottely.com");
  const [password, setPassword] = useState("demo1234");
  const navigate = useNavigate();
  const { user, login } = useAuth();

  if (user) return <Navigate to="/" />;

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-sidebar text-sidebar-foreground">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gold text-gold-foreground font-black">
            P
          </div>
          <span className="text-xl font-bold tracking-tight">POTTELY</span>
        </div>
        <div className="max-w-md space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-gold uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5" /> AI Growth Platform
          </div>
          <h2 className="text-4xl font-bold leading-tight">
            Grow your local business with AI that actually works.
          </h2>
          <p className="text-sidebar-foreground/70">
            Bring customers back, run smart campaigns, manage social, collect reviews and track
            growth — all in one clean dashboard.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4">
            {[
              ["+38%", "Repeat visits"],
              ["4.7★", "Google rating"],
              ["12hrs", "Saved / week"],
              ["1.2k+", "Local brands"],
            ].map(([v, l]) => (
              <div key={l} className="rounded-xl bg-sidebar-accent/40 p-4">
                <div className="text-2xl font-bold text-gold">{v}</div>
                <div className="text-xs text-sidebar-foreground/70">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-sidebar-foreground/50">© 2025 POTTELY. All rights reserved.</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground font-black">
              P
            </div>
            <span className="text-xl font-bold tracking-tight">POTTELY</span>
          </div>

          <h1 className="text-2xl font-bold">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "login"
              ? "Sign in to your growth dashboard."
              : "Start growing your business in minutes."}
          </p>

          <form
            className="mt-8 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/" });
            }}
          >
            {mode === "signup" && (
              <>
                <Field label="Business name" placeholder="Spice Route Kitchen" />
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5">Business category</label>
                    <select className="w-full h-10 rounded-lg border border-input bg-card px-3 text-sm">
                      {categories.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <Field label="Phone" placeholder="+91 98200 00000" />
                </div>
              </>
            )}
            <Field label="Email" type="email" placeholder="you@business.com" />
            <Field label="Password" type="password" placeholder="••••••••" />

            <button
              type="submit"
              className="w-full h-10 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              {mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground text-center">
            {mode === "login" ? "New to POTTELY?" : "Already have an account?"}{" "}
            <button
              className="font-semibold text-primary hover:underline"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
            >
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5">{label}</label>
      <input
        {...rest}
        className="w-full h-10 rounded-lg border border-input bg-card px-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/40"
      />
    </div>
  );
}
