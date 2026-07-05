import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Area, AreaChart,
} from "recharts";
import { Sparkles, ArrowUpRight, TrendingUp, Repeat, Check } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardBody, Metric } from "@/components/ui-kit";
import { dashboardMetrics, aiSuggestions, revenueTrend } from "@/lib/mock-data";
import { useData } from "@/lib/app-store";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const { addCampaign, addReviewRequest, customers } = useData();
  const [handled, setHandled] = useState<Record<string, number>>({});

  const handleSuggestion = (s: typeof aiSuggestions[number]) => {
    if (handled[s.id]) { toast.info(`${s.action} — already applied`); return; }
    if (s.action === "Run Campaign") {
      addCampaign({ name: "Weekend Winback", trigger: "Inactive 30 days", offer: "20% off next visit" });
      toast.success("Campaign launched · sent to 45 customers");
      setHandled((h) => ({ ...h, [s.id]: 45 }));
    } else if (s.action === "Send Requests") {
      customers.slice(0, 20).forEach((c) => addReviewRequest(c.name));
      toast.success("Review requests sent to 20 customers");
      setHandled((h) => ({ ...h, [s.id]: 20 }));
    } else if (s.action === "Send Offers") {
      toast.success("Birthday offers sent to 4 customers");
      setHandled((h) => ({ ...h, [s.id]: 4 }));
    } else if (s.action === "Review Draft") {
      addCampaign({ name: "Diwali Festival Campaign", trigger: "All active customers", offer: "Diwali festival treat 🎉" });
      toast.success("Diwali draft approved & scheduled for 890 customers");
      setHandled((h) => ({ ...h, [s.id]: 890 }));
    }
  };

  return (
    <AppShell title="Dashboard">
      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {dashboardMetrics.map((m) => (
          <Metric key={m.label} {...m} />
        ))}
      </div>

      {/* AI + Chart */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Revenue — last 30 days"
            description="Daily revenue with rolling trend"
            action={
              <div className="hidden sm:flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                <TrendingUp className="h-3.5 w-3.5" /> +8.1% vs prev.
              </div>
            }
          />
          <CardBody className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="AI Suggestions"
            description="Ready to run"
            action={<Sparkles className="h-4 w-4 text-gold" />}
          />
          <CardBody className="space-y-3">
            {aiSuggestions.map((s) => {
              const done = handled[s.id];
              return (
                <div key={s.id} className="p-3 rounded-lg border border-border bg-background">
                  <div className="text-sm font-semibold">{s.title}</div>
                  <p className="text-xs text-muted-foreground mt-1">{s.detail}</p>
                  {done ? (
                    <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                      <Check className="h-3 w-3" /> Applied · {done} customers
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSuggestion(s)}
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      {s.action} <ArrowUpRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </CardBody>
        </Card>
      </div>

      {/* Small widgets */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatWidget
          icon={<Repeat className="h-4 w-4" />}
          label="Repeat Customer Rate"
          value="68%"
          hint="+4.2% from last month"
        />
        <StatWidget
          icon={<TrendingUp className="h-4 w-4" />}
          label="Recovery Rate"
          value="34%"
          hint="Inactive → returning"
        />
        <Card className="p-5">
          <div className="text-xs text-muted-foreground font-medium">Quick actions</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link to="/campaigns" className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-primary-foreground">New campaign</Link>
            <Link to="/customers" className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border">Add customer</Link>
            <Link to="/social" className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border">Schedule post</Link>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function StatWidget({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
        <span className="grid h-6 w-6 place-items-center rounded-md bg-primary/10 text-primary">{icon}</span>
        {label}
      </div>
      <div className="mt-3 text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{hint}</div>
    </Card>
  );
}
