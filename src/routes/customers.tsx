import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Search, Plus, X, Pencil } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Card, Badge } from "@/components/ui-kit";
import { type Customer, type CustomerStatus, type LoyaltyTier } from "@/lib/mock-data";
import { useData } from "@/lib/app-store";

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

type FormShape = {
  name: string; phone: string; email: string; birthday: string; anniversary: string;
  totalSpend: string; visits: string; status: CustomerStatus; tier: LoyaltyTier; points: string; notes: string;
};
const emptyForm: FormShape = {
  name: "", phone: "", email: "", birthday: "", anniversary: "",
  totalSpend: "0", visits: "0", status: "New", tier: "Silver", points: "0", notes: "",
};

function CustomersPage() {
  const { customers, addCustomer, updateCustomer } = useData();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"All" | CustomerStatus>("All");
  const [tier, setTier] = useState<"All" | LoyaltyTier>("All");
  const [selected, setSelected] = useState<Customer | null>(null);
  const [purchaseForm, setPurchaseForm] = useState({ item: "", amount: "" });
  const [showForm, setShowForm] = useState<null | { mode: "add" } | { mode: "edit"; id: string }>(null);
  const [form, setForm] = useState<FormShape>(emptyForm);

  useEffect(() => {
    if (showForm?.mode === "edit") {
      const c = customers.find((x) => x.id === showForm.id);
      if (c) setForm({
        name: c.name, phone: c.phone, email: c.email, birthday: c.birthday, anniversary: c.anniversary,
        totalSpend: String(c.totalSpend), visits: String(c.visits), status: c.status, tier: c.tier,
        points: String(c.points), notes: c.notes,
      });
    } else if (showForm?.mode === "add") {
      setForm(emptyForm);
    }
  }, [showForm, customers]);

  const filtered = useMemo(() =>
    customers.filter((c) =>
      (status === "All" || c.status === status) &&
      (tier === "All" || c.tier === tier) &&
      (q === "" || c.name.toLowerCase().includes(q.toLowerCase()) || c.phone.includes(q)),
    ),
  [customers, q, status, tier]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    const payload = {
      ...form,
      totalSpend: Number(form.totalSpend) || 0,
      visits: Number(form.visits) || 0,
      points: Number(form.points) || 0,
    };
    if (showForm?.mode === "edit") {
      updateCustomer(showForm.id, payload);
      toast.success(`Updated ${form.name}`);
    } else {
      addCustomer(payload);
      toast.success(`${form.name} added to customers`);
    }
    setShowForm(null);
  };

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
          <select value={status} onChange={(e) => setStatus(e.target.value as CustomerStatus | "All")} className="h-10 rounded-lg border border-input bg-background px-3 text-sm">
            {["All", "New", "Active", "VIP", "Inactive", "Lost"].map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={tier} onChange={(e) => setTier(e.target.value as LoyaltyTier | "All")} className="h-10 rounded-lg border border-input bg-background px-3 text-sm">
            {["All", "Silver", "Gold", "Platinum", "VIP"].map((s) => <option key={s}>{s}</option>)}
          </select>
          <button
            onClick={() => setShowForm({ mode: "add" })}
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
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-t border-border hover:bg-muted/40">
                  <td className="px-5 py-3 font-medium cursor-pointer" onClick={() => setSelected(c)}>{c.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{c.phone}</td>
                  <td className="px-5 py-3 text-muted-foreground">{c.lastVisit}</td>
                  <td className="px-5 py-3 font-semibold">₹{c.totalSpend.toLocaleString()}</td>
                  <td className="px-5 py-3"><Badge tone={statusTone[c.status]}>{c.status}</Badge></td>
                  <td className="px-5 py-3"><Badge tone="muted">{c.tier}</Badge></td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => setShowForm({ mode: "edit", id: c.id })}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      <Pencil className="h-3 w-3" /> Edit
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-muted-foreground text-sm">No customers match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {selected && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setSelected(null)}>
          <aside onClick={(e) => e.stopPropagation()} className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-card overflow-y-auto">
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
                {selected.history.length === 0 && <p className="text-sm text-muted-foreground">No history yet.</p>}
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
              <form
                className="mt-3 grid grid-cols-3 gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!purchaseForm.item.trim() || !purchaseForm.amount) {
                    toast.error("Item and amount required");
                    return;
                  }
                  const amount = Number(purchaseForm.amount) || 0;
                  const dateLabel = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
                  const newHistory = [{ date: dateLabel, item: purchaseForm.item, amount }, ...selected.history];
                  updateCustomer(selected.id, {
                    history: newHistory,
                    totalSpend: selected.totalSpend + amount,
                    visits: selected.visits + 1,
                    lastVisit: "Just now",
                  });
                  setSelected({
                    ...selected,
                    history: newHistory,
                    totalSpend: selected.totalSpend + amount,
                    visits: selected.visits + 1,
                    lastVisit: "Just now",
                  });
                  setPurchaseForm({ item: "", amount: "" });
                  toast.success("Purchase added");
                }}
              >
                <input
                  placeholder="Item (e.g. Lunch combo)"
                  value={purchaseForm.item}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, item: e.target.value })}
                  className="col-span-2 h-9 rounded-lg border border-input bg-background px-2 text-sm"
                />
                <input
                  type="number"
                  placeholder="₹ amount"
                  value={purchaseForm.amount}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, amount: e.target.value })}
                  className="h-9 rounded-lg border border-input bg-background px-2 text-sm"
                />
                <button
                  type="submit"
                  className="col-span-3 h-9 rounded-lg bg-primary text-primary-foreground text-xs font-semibold"
                >
                  Add purchase
                </button>
              </form>
            </Section>
            <Section title="Notes">
              <p className="text-sm text-muted-foreground">{selected.notes || "No notes yet."}</p>
            </Section>
            <div className="p-5 border-t border-border">
              <button
                onClick={() => { setShowForm({ mode: "edit", id: selected.id }); setSelected(null); }}
                className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold"
              >Edit customer</button>
            </div>
          </aside>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/40 p-4" onClick={() => setShowForm(null)}>
          <div className="bg-card rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">{showForm.mode === "edit" ? "Edit customer" : "Add customer"}</h3>
              <button onClick={() => setShowForm(null)}><X className="h-5 w-5" /></button>
            </div>
            <form className="mt-4 space-y-3 max-h-[70vh] overflow-y-auto pr-1" onSubmit={submit}>
              {(["name","phone","email","birthday","anniversary"] as const).map((f) => (
                <div key={f}>
                  <label className="block text-xs font-medium mb-1 capitalize">{f}</label>
                  <input
                    value={form[f]}
                    onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                    className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Total Spend (₹)</label>
                  <input
                    type="number"
                    value={form.totalSpend}
                    onChange={(e) => setForm({ ...form, totalSpend: e.target.value })}
                    className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Visits</label>
                  <input
                    type="number"
                    value={form.visits}
                    onChange={(e) => setForm({ ...form, visits: e.target.value })}
                    className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as CustomerStatus })}
                    className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                  >
                    {["New", "Active", "VIP", "Inactive", "Lost"].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Loyalty Tier</label>
                  <select
                    value={form.tier}
                    onChange={(e) => setForm({ ...form, tier: e.target.value as LoyaltyTier })}
                    className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                  >
                    {["Silver", "Gold", "Platinum", "VIP"].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Points</label>
                <input
                  type="number"
                  value={form.points}
                  onChange={(e) => setForm({ ...form, points: e.target.value })}
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full h-20 rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none"
                />
              </div>
              <button type="submit" className="w-full h-10 rounded-lg bg-primary text-primary-foreground font-semibold text-sm mt-2">
                {showForm.mode === "edit" ? "Save changes" : "Save Customer"}
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
