import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardBody } from "@/components/ui-kit";
import { revenueTrend, engagementTrend, campaigns } from "@/lib/mock-data";

export const Route = createFileRoute("/reports")({
  component: ReportsPage,
});

const tabs = ["Revenue", "Customer Growth", "Repeat Rate", "Campaign Performance", "Loyalty Usage"] as const;
type Tab = (typeof tabs)[number];

const ranges = ["Daily", "Weekly", "Monthly", "Yearly"] as const;

function ReportsPage() {
  const [tab, setTab] = useState<Tab>("Revenue");
  const [range, setRange] = useState<(typeof ranges)[number]>("Monthly");

  return (
    <AppShell title="Reports & Analytics">
      <Card>
        <div className="flex flex-wrap gap-2 p-4 border-b border-border">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-xs sm:text-sm font-semibold px-3 py-2 rounded-lg transition-colors ${
                tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="p-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold">{tab}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Aggregated view — mock data</p>
          </div>
          <div className="flex gap-1 p-1 rounded-lg bg-muted">
            {ranges.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-md ${range === r ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <CardBody className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {tab === "Campaign Performance" || tab === "Loyalty Usage" ? (
              <BarChart data={campaigns.map((c) => ({ name: c.name.split(" ")[0], value: tab === "Loyalty Usage" ? c.redeemed * 3 : c.returned }))}
                margin={{ left: -10, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart
                data={tab === "Revenue" ? revenueTrend : engagementTrend}
                margin={{ left: -10, right: 8, top: 8, bottom: 0 }}
              >
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey={tab === "Revenue" ? "day" : "week"} tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey={tab === "Revenue" ? "revenue" : tab === "Customer Growth" ? "followers" : "engagement"}
                  stroke="var(--color-primary)"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </CardBody>
      </Card>
    </AppShell>
  );
}
