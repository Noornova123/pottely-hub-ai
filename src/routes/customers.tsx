import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Plus, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardBody, Badge } from "@/components/ui-kit";
import { customers, type Customer, type CustomerStatus, type LoyaltyTier } from "@/lib/mock-data";

export const Route = createFileRoute("/customers")({
  component: CustomersPage,
});

const statusTone: Record<CustomerStatus, "success" | "default" | "gold" | "warning" | "danger"> = {
  New: "success",
  Active: "default",
  VIP: "gold",
  Inactive: "warning",
  Lost: "danger",
};

function CustomersPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"All" | CustomerStatus>("All");
  const [tier, setTier] = useState<"All" | LoyaltyTier>("All");
  const [selected, setSelected] = useState<Customer | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const filtered = useMemo(() =>
    customers.filter((c) =>
      (status === "All" || c.status === status) &&
      (tier === "All" || c.tier === tier) &&
      (q === "" || c.name.toLowerCase().includes(q.toLowerCase()) || c.phone.includes(q)),
    ),
  [q, status, tier]);

  return (
    <AppShell title="Customers">
      <Card>
        <div className="p-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name or phone..."
              className="w-full h-10 pl-10 pr-3 rounded-lg border border-input bg-background text-sm"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as CustomerStatus | "All")}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          >
            {["All", "New", "Active", "VIP", "Inactive", "Lost"].map((s) => <option key={s}>{s}</option>)}
          </select>
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value as LoyaltyTier | "All")}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          >
            {["All", "Silver", "Gold", "Platinum", "VIP"].map((s) => <option key={s}>{s}</option>)}
          </select>
          <button
            onClick={() => setShowAdd(true)}
            className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Customer
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground bg-muted/40">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium">Last Visit</th>
                <th className="px-5 py-3 font-medium">Total Spend</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Loyalty Tier</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className="border-t border-border cursor-pointer hover:bg-muted/40"
                >
                  <td className="px-5 py-3 font-medium">{c.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{c.phone}</td>
                  <td className="px-5 py-3 text-muted-foreground">{c.lastVisit}</td>
                  <td className="px-5 py-3 font-semibold">₹{c.totalSpend.toLocaleString()}</td>
                  <td className="px-5 py-3"><Badge tone={statusTone[c.status]}>{c.status}</Badge></td>
                  <td className="px-5 py-3"><Badge tone="muted">{c.tier}</Badge></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-muted-foreground text-sm">No customers match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setSelected(null)}>
          <aside
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-card overflow-y-auto"
          >
            <div className="p-5 border-b border-border flex items-start justify-between">
              <div>
                <h2 className="font-bold text-lg">{selected.name}</h2>
                <p className="text-xs text-muted-foreground mt-1">{selected.phone} · {selected.email}</p>
                <div className="mt-3 flex gap-2">
                  <Badge tone={statusTone[selected.status]}>{selected.status}</Badge>
                  <Badge tone="gold">{selected.tier}</Badge>
                </div>
              </div>
              <button onClick={() => setSelected(null)}><X className="h-5 w-5" /></button>
            </div>

            <div className="p-5 grid grid-cols-3 gap-3">
              <Stat label="Total Spend" value={`₹${selected.totalSpend.toLocaleString()}`} />
              <Stat label="Visits" value={String(selected.visits)} />
              <Stat label="Points" value={String(selected.points)} />
            </div>

            <Section title="Personal">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <KV k="Birthday" v={selected.birthday} />
                <KV k="Anniversary" v={selected.anniversary} />
                <KV k="Last visit" v={selected.lastVisit} />
                <KV k="Loyalty tier" v={selected.tier} />
              </div>
            </Section>

            <Section title="Purchase history">
              <div className="space-y-2">
                {selected.history.map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/40">
                    <div>
                      <div className="font-medium">{h.item}</div>
                      <div className="text-xs text-muted-foreground">{h.date}</div>
                    </div>
                    <div className="font-semibold">₹{h.amount}</div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Notes">
              <p className="text-sm text-muted-foreground">
                {selected.notes || "No notes yet."}
              </p>
            </Section>
          </aside>
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/40 p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-card rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Add Customer</h3>
              <button onClick={() => setShowAdd(false)}><X className="h-5 w-5" /></button>
            </div>
            <form className="mt-4 space-y-3" onSubmit={(e) => { e.preventDefault(); setShowAdd(false); }}>
              {["Name", "Phone", "Email", "Birthday", "Anniversary"].map((f) => (
                <div key={f}>
                  <label className="block text-xs font-medium mb-1">{f}</label>
                  <input className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm" />
                </div>
              ))}
              <button type="submit" className="w-full h-10 rounded-lg bg-primary text-primary-foreground font-semibold text-sm mt-2">
                Save Customer
              </button>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-bold text-sm truncate">{value}</div>
    </div>
  );
}
function KV({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{k}</div>
      <div className="font-medium">{v}</div>
    </div>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-5 border-t border-border">
      <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">{title}</h4>
      {children}
    </div>
  );
}
