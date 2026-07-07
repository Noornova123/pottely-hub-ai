import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Sparkles, Upload, ImageIcon, Users } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardBody, Badge } from "@/components/ui-kit";
import { useData } from "@/lib/app-store";
import { AudiencePicker } from "@/components/audience-picker";

export const Route = createFileRoute("/campaigns")({
  component: CampaignsPage,
});

const triggers = ["15", "30", "45", "60", "90"];
const offerTypes = ["Discount", "Free Gift", "Festival Offer", "Birthday Offer"];

function templateSVG(label: string, from: string, to: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 120'><defs><linearGradient id='g' x1='0' x2='1' y1='0' y2='1'><stop offset='0' stop-color='${from}'/><stop offset='1' stop-color='${to}'/></linearGradient></defs><rect width='200' height='120' fill='url(%23g)'/><text x='100' y='68' font-family='Inter,sans-serif' font-size='16' font-weight='700' fill='white' text-anchor='middle'>${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${svg.replace(/#/g, "%23")}`;
}
const templates = [
  { id: "t1", label: "20% OFF", url: templateSVG("20% OFF", "#1F3A5F", "#3B6AA6") },
  { id: "t2", label: "FREE DESSERT", url: templateSVG("FREE DESSERT", "#C9922B", "#F1C265") },
  { id: "t3", label: "BOGO", url: templateSVG("BOGO", "#7C3AED", "#EC4899") },
  { id: "t4", label: "FESTIVAL", url: templateSVG("FESTIVAL", "#DC2626", "#F59E0B") },
  { id: "t5", label: "BIRTHDAY", url: templateSVG("BIRTHDAY", "#0EA5E9", "#22D3EE") },
];

function offerText(o: string) {
  return o === "Discount" ? "20% off" : o === "Free Gift" ? "a complimentary dessert" : o === "Birthday Offer" ? "a birthday surprise 🎂" : "a special festival treat 🎉";
}
function defaultMessage(o: string) {
  return `Hi {{name}}, we've missed you! Enjoy ${offerText(o)} on your next visit within 7 days. — Spice Route Kitchen`;
}

function CampaignsPage() {
  const { campaigns, addCampaign, updateCampaign, runCampaign } = useData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState("30");
  const [offer, setOffer] = useState("Discount");
  const [message, setMessage] = useState(defaultMessage("Discount"));
  const [image, setImage] = useState<string>("");
  const [audience, setAudience] = useState<string[]>(["All customers"]);
  const fileRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setEditingId(null); setName(""); setTrigger("30"); setOffer("Discount");
    setMessage(defaultMessage("Discount")); setImage(""); setAudience(["All customers"]);
  };

  const startEdit = (id: string) => {
    const c = campaigns.find((x) => x.id === id);
    if (!c) return;
    setEditingId(id);
    setName(c.name);
    const t = c.trigger.match(/\d+/)?.[0] || "30";
    setTrigger(t);
    const matched = offerTypes.find((o) => c.offer.toLowerCase().includes(o.split(" ")[0].toLowerCase()));
    setOffer(matched || "Discount");
    setMessage(c.message || defaultMessage(matched || "Discount"));
    setImage(c.image || "");
    setAudience(c.audience && c.audience.length ? c.audience : ["All customers"]);
  };

  const pickOffer = (o: string) => {
    setOffer(o);
    setMessage((prev) => (prev.trim() === "" || offerTypes.some((t) => prev === defaultMessage(t))) ? defaultMessage(o) : prev);
  };

  const onFile = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) { toast.error("Please pick an image file"); return; }
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(f);
  };

  const submit = () => {
    if (audience.length === 0) { toast.error("Pick at least one audience"); return; }
    const finalName = name.trim() || `${trigger}-day ${offer}`;
    const payload = {
      name: finalName,
      trigger: `Inactive ${trigger} days`,
      offer: offerText(offer),
      message,
      image,
      audience,
    };
    if (editingId) {
      updateCampaign(editingId, payload);
      toast.success(`Updated "${finalName}"`);
    } else {
      addCampaign(payload);
      toast.success(`Campaign "${finalName}" created`);
    }
    resetForm();
  };

  const handleRun = (id: string) => {
    const c = campaigns.find((x) => x.id === id);
    if (!c || !c.audience || c.audience.length === 0) {
      toast.error("Pick an audience for this campaign first"); return;
    }
    updateCampaign(id, { runStatus: "Running" });
    setTimeout(() => {
      const count = runCampaign(id);
      toast.success(`Campaign sent to ${count} customers in ${c.audience!.join(", ")}`);
    }, 400);
  };

  return (
    <AppShell title="Retention Campaigns">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Active campaigns" description="Automated rules currently running" />
          <div className="divide-y divide-border">
            {campaigns.map((c) => (
              <div key={c.id} className={`p-5 grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] items-start ${editingId === c.id ? "bg-primary/5" : ""}`}>
                {c.image ? (
                  <img src={c.image} alt="" className="h-14 w-14 rounded-lg object-cover border border-border" />
                ) : (
                  <div className="h-14 w-14 rounded-lg bg-muted grid place-items-center text-muted-foreground">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold">{c.name}</h4>
                    <Badge tone={c.status === "Active" ? "success" : "warning"}>{c.status}</Badge>
                    {c.runStatus === "Running" && <Badge tone="warning">Running…</Badge>}
                    {c.runStatus === "Sent" && <Badge tone="success">Sent</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Trigger: <span className="text-foreground font-medium">{c.trigger}</span> · Offer:{" "}
                    <span className="text-foreground font-medium">{c.offer}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1">
                    <Users className="h-3 w-3" /> To: <span className="text-foreground font-medium">{c.audience?.join(", ") || "—"}</span>
                  </p>
                  {c.message && <p className="text-xs text-muted-foreground mt-1 line-clamp-2 italic">"{c.message}"</p>}
                  <p className="text-xs mt-1"><span className="font-semibold text-primary">{c.matched}</span> customers currently matched</p>
                  {c.runStatus === "Sent" && c.results && (
                    <div className="mt-2 rounded-md bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 px-2.5 py-1.5 text-[11px] text-emerald-800 dark:text-emerald-300">
                      Sent to <span className="font-semibold">{c.lastRunCount}</span> customers · Delivered: {c.results.delivered} · Opened: {c.results.opened} · Redeemed: {c.results.redeemed}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(c.id)} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border">Edit</button>
                  <button onClick={() => handleRun(c.id)} disabled={c.runStatus === "Running"} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-primary-foreground disabled:opacity-60">
                    {c.runStatus === "Running" ? "Running…" : c.runStatus === "Sent" ? "Run again" : "Run now"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title={editingId ? "Edit campaign" : "Campaign builder"} action={<Sparkles className="h-4 w-4 text-gold" />} />
          <CardBody className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5">Campaign name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Weekend Winback"
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">Trigger — inactive days</label>
              <select value={trigger} onChange={(e) => setTrigger(e.target.value)} className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
                {triggers.map((d) => <option key={d} value={d}>{d} days</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">Offer type</label>
              <div className="grid grid-cols-2 gap-2">
                {offerTypes.map((o) => (
                  <button key={o} onClick={() => pickOffer(o)}
                    className={`text-xs px-3 py-2 rounded-lg border ${offer === o ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}>{o}</button>
                ))}
              </div>
            </div>

            <AudiencePicker value={audience} onChange={setAudience} label="To" />

            <div>
              <label className="block text-xs font-medium mb-1.5">Preview message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-y"
              />
              <p className="text-[10px] text-muted-foreground mt-1">Use {"{{name}}"} for personalization.</p>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5">Attach image</label>
              <div className="grid grid-cols-5 gap-2">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setImage(t.url)}
                    className={`aspect-square rounded-md overflow-hidden border-2 ${image === t.url ? "border-primary" : "border-transparent"}`}
                    title={t.label}
                  >
                    <img src={t.url} alt={t.label} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
              <button
                onClick={() => fileRef.current?.click()}
                className="mt-2 w-full inline-flex items-center justify-center gap-2 h-9 rounded-lg border border-dashed border-border text-xs font-semibold"
              >
                <Upload className="h-3.5 w-3.5" /> Upload your own photo
              </button>
              {image && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={image} alt="preview" className="h-12 w-12 rounded-md object-cover border border-border" />
                  <button onClick={() => setImage("")} className="text-[11px] text-muted-foreground underline">Remove</button>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {editingId && (
                <button onClick={resetForm} className="flex-1 h-10 rounded-lg border border-border text-sm font-semibold">Cancel</button>
              )}
              <button onClick={submit} className="flex-1 h-10 rounded-lg bg-gold text-gold-foreground font-semibold text-sm">
                {editingId ? "Save changes" : "Create campaign"}
              </button>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="Results" description="Performance per campaign" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground bg-muted/40">
              <tr>
                <th className="px-5 py-3 font-medium">Campaign</th>
                <th className="px-5 py-3 font-medium">Sent to</th>
                <th className="px-5 py-3 font-medium">Sent</th>
                <th className="px-5 py-3 font-medium">Opened</th>
                <th className="px-5 py-3 font-medium">Redeemed</th>
                <th className="px-5 py-3 font-medium">Returned</th>
                <th className="px-5 py-3 font-medium">Conversion</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="px-5 py-3 font-medium">{c.name}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{c.audience?.join(", ") || "—"}</td>
                  <td className="px-5 py-3">{c.sent}</td>
                  <td className="px-5 py-3">{c.opened}</td>
                  <td className="px-5 py-3">{c.redeemed}</td>
                  <td className="px-5 py-3">{c.returned}</td>
                  <td className="px-5 py-3 font-semibold text-emerald-600">{c.sent ? Math.round((c.returned / c.sent) * 100) : 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
