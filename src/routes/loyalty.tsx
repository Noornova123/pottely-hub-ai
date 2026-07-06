import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Sparkles, Pencil, Send, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardBody, Badge } from "@/components/ui-kit";
import { loyaltyTiers } from "@/lib/mock-data";
import { useData, type Offer } from "@/lib/app-store";

export const Route = createFileRoute("/loyalty")({
  component: LoyaltyPage,
});

const suggestions = [
  { segment: "Gold tier · Inactive 21-45 days", name: "Free dessert + 15% off", type: "Combo", description: "Complimentary dessert plus 15% off the bill for Gold members returning after a break.", reward: "Free dessert + 15% off", reason: "Avg spend ₹1,240 · 82% redeem free-dessert offers.", winback: 31 },
  { segment: "Silver tier · Weekends only", name: "Buy 1 Main Get 1 Free", type: "BOGO", description: "Weekend-only BOGO on all main courses for Silver members.", reward: "1 free main course", reason: "Weekend Silver members visit 2.4x when BOGO runs.", winback: 26 },
  { segment: "Platinum · Birthdays this month", name: "Complimentary chef's tasting", type: "Gift", description: "5-course chef's tasting on the house for Platinum birthday members.", reward: "Free chef's tasting", reason: "Platinum birthday recipients bring 3.1 guests on average.", winback: 44 },
  { segment: "Lost customers · 90+ days", name: "₹300 cashback on ₹999", type: "Cashback", description: "₹300 cashback for lapsed customers on any order over ₹999.", reward: "₹300 cashback", reason: "Cashback wins back 18% of lapsed customers in this segment.", winback: 18 },
];

type EditForm = { name: string; description: string; reward: string };

function LoyaltyPage() {
  const { offers, launchOffer, updateOffer, customers } = useData();
  const [suggestIdx, setSuggestIdx] = useState(0);
  const s = suggestions[suggestIdx];

  // Edit modal state
  const [editing, setEditing] = useState<Offer | null>(null);
  const [form, setForm] = useState<EditForm>({ name: "", description: "", reward: "" });

  const openEdit = (o: Offer) => {
    setEditing(o);
    setForm({ name: o.name, description: o.description || "", reward: o.reward || "" });
  };
  const saveEdit = () => {
    if (!editing) return;
    updateOffer(editing.id, { name: form.name, description: form.description, reward: form.reward });
    toast.success(`Updated "${form.name}"`);
    setEditing(null);
  };

  // Loyalty rule builder
  const [ruleType, setRuleType] = useState<"visits" | "spend">("visits");
  const [threshold, setThreshold] = useState<number>(10);
  const [label, setLabel] = useState<string>("VIP");

  const matchingCount = useMemo(() => {
    return customers.filter((c) =>
      ruleType === "visits" ? c.visits >= threshold : c.totalSpend >= threshold
    ).length;
  }, [customers, ruleType, threshold]);

  const sendToMatching = () => {
    if (matchingCount === 0) { toast.error("No customers match this rule"); return; }
    const name = `${label} exclusive — ${ruleType === "visits" ? `${threshold}+ visits` : `₹${threshold}+ spend`}`;
    launchOffer({
      name,
      type: "Segment blast",
      description: `Sent to all ${label} customers (${ruleType === "visits" ? `≥${threshold} visits` : `≥₹${threshold} lifetime spend`}).`,
      reward: "Custom loyalty perk",
      redemptions: 0,
      status: "Active",
    });
    toast.success(`Offer sent to ${matchingCount} ${label}-tier customers`);
  };

  const launchSuggestion = () => {
    launchOffer({
      name: s.name,
      type: s.type,
      description: s.description,
      reward: s.reward,
    });
    toast.success(`Launched "${s.name}"`);
    setSuggestIdx((i) => (i + 1) % suggestions.length);
  };

  return (
    <AppShell title="Loyalty & Offers">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loyaltyTiers.map((t) => (
          <Card key={t.tier} className="p-5">
            <Badge tone="gold">{t.tier}</Badge>
            <div className="mt-4 text-3xl font-bold">{t.members}</div>
            <div className="text-xs text-muted-foreground">active members</div>
            <div className="mt-4 pt-4 border-t border-border space-y-1.5">
              <div className="text-xs"><span className="text-muted-foreground">Unlocks at:</span> <span className="font-semibold">{t.visits}+ visits</span></div>
              <div className="text-xs"><span className="text-muted-foreground">Reward:</span> <span className="font-semibold">{t.reward}</span></div>
            </div>
          </Card>
        ))}
      </div>

      {/* Loyalty Rule builder */}
      <Card className="mt-6">
        <CardHeader
          title="Loyalty rule"
          description="Auto-segment customers by visits or spend and send them a targeted offer"
        />
        <CardBody className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto] items-end">
          <div>
            <label className="block text-xs font-medium mb-1.5">Rule type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setRuleType("visits"); setThreshold(10); }}
                className={`h-10 rounded-lg border text-xs font-semibold ${ruleType === "visits" ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}
              >Visits</button>
              <button
                onClick={() => { setRuleType("spend"); setThreshold(5000); }}
                className={`h-10 rounded-lg border text-xs font-semibold ${ruleType === "spend" ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}
              >Total spend</button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5">
              {ruleType === "visits" ? "Minimum visits" : "Minimum spend (₹)"}
            </label>
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value) || 0)}
              className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5">Segment label</label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. VIP, Gold"
              className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
            />
          </div>
          <button
            onClick={sendToMatching}
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-gold text-gold-foreground text-sm font-semibold"
          >
            <Send className="h-3.5 w-3.5" /> Send to all matching
          </button>
          <div className="md:col-span-4 text-xs text-muted-foreground">
            <span className="font-semibold text-primary">{matchingCount}</span> of {customers.length} customers currently match{" "}
            <span className="font-medium text-foreground">
              {ruleType === "visits" ? `≥ ${threshold} visits` : `≥ ₹${threshold} lifetime spend`}
            </span>{" "}
            → tagged as <span className="font-semibold text-foreground">{label || "—"}</span>
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3 mt-6">
        <Card className="lg:col-span-2">
          <CardHeader title="Active offers" description="Currently running across channels" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground bg-muted/40">
                <tr>
                  <th className="px-5 py-3 font-medium">Offer</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Redemptions</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {offers.map((o) => (
                  <tr key={o.id} className="border-t border-border">
                    <td className="px-5 py-3">
                      <div className="font-medium">{o.name}</div>
                      {o.description && <div className="text-[11px] text-muted-foreground line-clamp-1">{o.description}</div>}
                    </td>
                    <td className="px-5 py-3"><Badge tone="muted">{o.type}</Badge></td>
                    <td className="px-5 py-3 font-semibold">{o.redemptions}</td>
                    <td className="px-5 py-3"><Badge tone={o.status === "Active" ? "success" : "warning"}>{o.status}</Badge></td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => openEdit(o)}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md border border-border"
                      >
                        <Pencil className="h-3 w-3" /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader title="AI Offer Suggestion" action={<Sparkles className="h-4 w-4 text-gold" />} />
          <CardBody className="space-y-3">
            <div className="text-xs text-muted-foreground">Segment</div>
            <div className="font-semibold">{s.segment}</div>
            <div className="rounded-lg bg-muted/40 p-3">
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Suggested offer</div>
              <div className="mt-1 font-bold text-primary">{s.name}</div>
              <div className="text-[11px] text-muted-foreground mt-1">{s.description}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Reasoning: {s.reason} Expected win-back rate: <span className="font-semibold text-emerald-600">{s.winback}%</span>.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  // Edit AI suggestion as a pending offer
                  setEditing({
                    id: "__ai__",
                    name: s.name,
                    type: s.type,
                    description: s.description,
                    reward: s.reward,
                    redemptions: 0,
                    status: "Active",
                  } as Offer);
                  setForm({ name: s.name, description: s.description, reward: s.reward });
                }}
                className="flex-1 h-10 rounded-lg border border-border text-sm font-semibold inline-flex items-center justify-center gap-1"
              >
                <Pencil className="h-3 w-3" /> Edit
              </button>
              <button
                onClick={launchSuggestion}
                className="flex-1 h-10 rounded-lg bg-gold text-gold-foreground text-sm font-semibold"
              >
                Launch offer
              </button>
            </div>
          </CardBody>
        </Card>
      </div>

      {editing && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/40 p-4" onClick={() => setEditing(null)}>
          <div className="bg-card rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">
                {editing.id === "__ai__" ? "Customize suggestion" : "Edit offer"}
              </h3>
              <button onClick={() => setEditing(null)}><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1">Title</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Description / message</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-y"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Reward</label>
                <input
                  value={form.reward}
                  onChange={(e) => setForm((f) => ({ ...f, reward: e.target.value }))}
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setEditing(null)} className="flex-1 h-10 rounded-lg border border-border text-sm font-semibold">Cancel</button>
                {editing.id === "__ai__" ? (
                  <button
                    onClick={() => {
                      launchOffer({ name: form.name, type: editing.type, description: form.description, reward: form.reward });
                      toast.success(`Launched "${form.name}"`);
                      setEditing(null);
                      setSuggestIdx((i) => (i + 1) % suggestions.length);
                    }}
                    className="flex-1 h-10 rounded-lg bg-gold text-gold-foreground text-sm font-semibold"
                  >Launch</button>
                ) : (
                  <button onClick={saveEdit} className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold">Save changes</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
