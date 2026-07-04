import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardBody, Badge } from "@/components/ui-kit";
import { campaigns } from "@/lib/mock-data";

export const Route = createFileRoute("/campaigns")({
  component: CampaignsPage,
});

function CampaignsPage() {
  const [trigger, setTrigger] = useState("30");
  const [offer, setOffer] = useState("Discount");

  const previewMsg = `Hi {{name}}, we've missed you! Enjoy ${
    offer === "Discount" ? "20% off" : offer === "Free Gift" ? "a complimentary dessert" : offer === "Birthday Offer" ? "a birthday surprise 🎂" : "a special festival treat 🎉"
  } on your next visit within 7 days. — Spice Route Kitchen`;

  return (
    <AppShell title="Retention Campaigns">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Active campaigns" description="Automated rules currently running" />
          <div className="divide-y divide-border">
            {campaigns.map((c) => (
              <div key={c.id} className="p-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] items-center">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold">{c.name}</h4>
                    <Badge tone={c.status === "Active" ? "success" : "warning"}>{c.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Trigger: <span className="text-foreground font-medium">{c.trigger}</span> · Offer:{" "}
                    <span className="text-foreground font-medium">{c.offer}</span>
                  </p>
                  <p className="text-xs mt-1"><span className="font-semibold text-primary">{c.matched}</span> customers currently matched</p>
                </div>
                <div className="flex gap-2">
                  <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border">Edit</button>
                  <button className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-primary-foreground">Run now</button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Campaign builder" action={<Sparkles className="h-4 w-4 text-gold" />} />
          <CardBody className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5">Trigger — inactive days</label>
              <select value={trigger} onChange={(e) => setTrigger(e.target.value)} className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
                {["15", "30", "45", "60", "90"].map((d) => <option key={d} value={d}>{d} days</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">Offer type</label>
              <div className="grid grid-cols-2 gap-2">
                {["Discount", "Free Gift", "Festival Offer", "Birthday Offer"].map((o) => (
                  <button
                    key={o}
                    onClick={() => setOffer(o)}
                    className={`text-xs px-3 py-2 rounded-lg border ${offer === o ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}
                  >{o}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">Preview message</label>
              <div className="rounded-lg bg-muted/60 p-3 text-sm">{previewMsg}</div>
            </div>
            <button className="w-full h-10 rounded-lg bg-gold text-gold-foreground font-semibold text-sm">
              Create campaign
            </button>
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
                  <td className="px-5 py-3">{c.sent}</td>
                  <td className="px-5 py-3">{c.opened}</td>
                  <td className="px-5 py-3">{c.redeemed}</td>
                  <td className="px-5 py-3">{c.returned}</td>
                  <td className="px-5 py-3 font-semibold text-emerald-600">{Math.round((c.returned / c.sent) * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
