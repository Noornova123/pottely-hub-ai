import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Sparkles, Pencil, X, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardBody, Badge } from "@/components/ui-kit";
import { loyaltyTiers } from "@/lib/mock-data";
import { useData, countMatching, type Offer, type Segment } from "@/lib/app-store";
import { AudiencePicker } from "@/components/audience-picker";

export const Route = createFileRoute("/loyalty")({
  component: LoyaltyPage,
});

const suggestions = [
  { segment: "Gold tier · Inactive 21-45 days", name: "Free dessert + 15% off", type: "Combo", description: "Complimentary dessert plus 15% off the bill for Gold members returning after a break.", reward: "Free dessert + 15% off", reason: "Avg spend ₹1,240 · 82% redeem free-dessert offers.", winback: 31 },
  { segment: "Silver tier · Weekends only", name: "Buy 1 Main Get 1 Free", type: "BOGO", description: "Weekend-only BOGO on all main courses for Silver members.", reward: "1 free main course", reason: "Weekend Silver members visit 2.4x when BOGO runs.", winback: 26 },
  { segment: "Platinum · Birthdays this month", name: "Complimentary chef's tasting", type: "Gift", description: "5-course chef's tasting on the house for Platinum birthday members.", reward: "Free chef's tasting", reason: "Platinum birthday recipients bring 3.1 guests on average.", winback: 44 },
  { segment: "Lost customers · 90+ days", name: "₹300 cashback on ₹999", type: "Cashback", description: "₹300 cashback for lapsed customers on any order over ₹999.", reward: "₹300 cashback", reason: "Cashback wins back 18% of lapsed customers in this segment.", winback: 18 },
  { segment: "New customers · First month", name: "20% off second visit", type: "Discount", description: "Bring first-timers back with a 20% off welcome offer.", reward: "20% off next bill", reason: "First-month offers double the odds of a second visit.", winback: 37 },
];

type EditForm = { name: string; description: string; reward: string; audience: string[] };

function LoyaltyPage() {
  const { offers, launchOffer, updateOffer, customers, segments, addSegment, updateSegment, deleteSegment } = useData();
  const [suggestIdx, setSuggestIdx] = useState(0);
  const s = suggestions[suggestIdx];

  // Offer edit modal
  const [editing, setEditing] = useState<Offer | null>(null);
  const [form, setForm] = useState<EditForm>({ name: "", description: "", reward: "", audience: ["All customers"] });

  const openEdit = (o: Offer) => {
    setEditing(o);
    setForm({
      name: o.name,
      description: o.description || "",
      reward: o.reward || "",
      audience: o.audience && o.audience.length ? o.audience : ["All customers"],
    });
  };
  const saveEdit = () => {
    if (!editing) return;
    if (form.audience.length === 0) { toast.error("Pick at least one audience"); return; }
    updateOffer(editing.id, { name: form.name, description: form.description, reward: form.reward, audience: form.audience });
    toast.success(`Updated "${form.name}"`);
    setEditing(null);
  };

  // Segment builder
  const [segRuleType, setSegRuleType] = useState<"visits" | "spend">("visits");
  const [segThreshold, setSegThreshold] = useState<number>(10);
  const [segName, setSegName] = useState<string>("");

  const previewCount = useMemo(() => {
    return countMatching(customers, { id: "_", name: "_", ruleType: segRuleType, threshold: segThreshold });
  }, [customers, segRuleType, segThreshold]);

  const createSegment = () => {
    if (!segName.trim()) { toast.error("Give the segment a name"); return; }
    addSegment({ name: segName.trim(), ruleType: segRuleType, threshold: segThreshold });
    toast.success(`Segment "${segName}" created — ${previewCount} customers match`);
    setSegName("");
  };

  const removeSegment = (seg: Segment) => {
    deleteSegment(seg.id);
    toast.success(`Segment "${seg.name}" removed`);
  };

  const updateSegField = (id: string, patch: Partial<Segment>) => {
    updateSegment(id, patch);
  };

  const regenerateSuggestion = () => {
    setSuggestIdx((i) => (i + 1) % suggestions.length);
    toast.success("New AI offer suggestion");
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

      {/* Customer Segments — definition only, no sending */}
      <Card className="mt-6">
        <CardHeader
          title="Customer Segments"
          description="Define audiences by visits or spend. Use them from Retention to send campaigns."
        />
        <CardBody className="space-y-5">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto] items-end">
            <div>
              <label className="block text-xs font-medium mb-1.5">Rule type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setSegRuleType("visits"); setSegThreshold(10); }}
                  className={`h-10 rounded-lg border text-xs font-semibold ${segRuleType === "visits" ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}
                >Visits</button>
                <button
                  onClick={() => { setSegRuleType("spend"); setSegThreshold(5000); }}
                  className={`h-10 rounded-lg border text-xs font-semibold ${segRuleType === "spend" ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}
                >Total spend</button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">
                {segRuleType === "visits" ? "Minimum visits" : "Minimum spend (₹)"}
              </label>
              <input
                type="number"
                value={segThreshold}
                onChange={(e) => setSegThreshold(Number(e.target.value) || 0)}
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">Segment name</label>
              <input
                value={segName}
                onChange={(e) => setSegName(e.target.value)}
                placeholder="e.g. Diwali Regulars"
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
              />
            </div>
            <button
              onClick={createSegment}
              className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-gold text-gold-foreground text-sm font-semibold"
            >
              <Plus className="h-3.5 w-3.5" /> Create segment
            </button>
            <div className="md:col-span-4 text-xs text-muted-foreground">
              Preview: <span className="font-semibold text-primary">{previewCount}</span> of {customers.length} customers match{" "}
              <span className="font-medium text-foreground">
                {segRuleType === "visits" ? `≥ ${segThreshold} visits` : `≥ ₹${segThreshold} lifetime spend`}
              </span>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Your segments</div>
            {segments.length === 0 ? (
              <div className="text-xs text-muted-foreground">No segments yet — create one above.</div>
            ) : (
              <div className="grid gap-2 md:grid-cols-2">
                {segments.map((seg) => {
                  const count = countMatching(customers, seg);
                  return (
                    <div key={seg.id} className="rounded-lg border border-border p-3 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <input
                            value={seg.name}
                            onChange={(e) => updateSegField(seg.id, { name: e.target.value })}
                            className="font-semibold text-sm bg-transparent border-b border-transparent hover:border-border focus:border-primary outline-none min-w-0"
                          />
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                          <select
                            value={seg.ruleType}
                            onChange={(e) => updateSegField(seg.id, { ruleType: e.target.value as "visits" | "spend" })}
                            className="rounded border border-border bg-background px-1 py-0.5"
                          >
                            <option value="visits">Visits ≥</option>
                            <option value="spend">Spend ₹ ≥</option>
                          </select>
                          <input
                            type="number"
                            value={seg.threshold}
                            onChange={(e) => updateSegField(seg.id, { threshold: Number(e.target.value) || 0 })}
                            className="w-20 rounded border border-border bg-background px-1 py-0.5"
                          />
                          <span className="inline-flex items-center gap-1 ml-auto text-primary font-semibold">
                            <Users className="h-3 w-3" /> {count}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeSegment(seg)}
                        className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive"
                        title="Delete segment"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            <p className="mt-3 text-[11px] text-muted-foreground">
              Sending offers happens in <span className="font-semibold">Retention</span> — segments here appear automatically in the "To" picker.
            </p>
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
                  <th className="px-5 py-3 font-medium">Sent to</th>
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
                    <td className="px-5 py-3 text-xs text-muted-foreground">{o.audience?.join(", ") || "—"}</td>
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
          <CardHeader
            title="AI Offer Suggestion"
            action={
              <button
                onClick={regenerateSuggestion}
                title="Regenerate"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <Sparkles className="h-3.5 w-3.5" /> Regenerate
              </button>
            }
          />
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
                  setEditing({
                    id: "__ai__",
                    name: s.name,
                    type: s.type,
                    description: s.description,
                    reward: s.reward,
                    redemptions: 0,
                    status: "Active",
                  } as Offer);
                  setForm({ name: s.name, description: s.description, reward: s.reward, audience: ["All customers"] });
                }}
                className="flex-1 h-10 rounded-lg border border-border text-sm font-semibold inline-flex items-center justify-center gap-1"
              >
                <Pencil className="h-3 w-3" /> Edit & launch
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">Pick an audience before launching — no blind sends.</p>
          </CardBody>
        </Card>
      </div>

      {editing && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/40 p-4 overflow-y-auto" onClick={() => setEditing(null)}>
          <div className="bg-card rounded-2xl w-full max-w-md p-6 my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">
                {editing.id === "__ai__" ? "Customize & launch" : "Edit offer"}
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

              <AudiencePicker value={form.audience} onChange={(a) => setForm((f) => ({ ...f, audience: a }))} label="To" />

              <div className="flex gap-2 pt-2">
                <button onClick={() => setEditing(null)} className="flex-1 h-10 rounded-lg border border-border text-sm font-semibold">Cancel</button>
                {editing.id === "__ai__" ? (
                  <button
                    onClick={() => {
                      if (form.audience.length === 0) { toast.error("Pick at least one audience"); return; }
                      launchOffer({ name: form.name, type: editing.type, description: form.description, reward: form.reward, audience: form.audience });
                      toast.success(`Launched "${form.name}" to ${form.audience.join(", ")}`);
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
