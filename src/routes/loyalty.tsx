import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardBody, Badge } from "@/components/ui-kit";
import { loyaltyTiers } from "@/lib/mock-data";
import { useData } from "@/lib/app-store";

export const Route = createFileRoute("/loyalty")({
  component: LoyaltyPage,
});

const suggestions = [
  { segment: "Gold tier · Inactive 21-45 days", name: "Free dessert + 15% off", type: "Combo", reason: "Avg spend ₹1,240 · 82% redeem free-dessert offers.", winback: 31 },
  { segment: "Silver tier · Weekends only", name: "Buy 1 Main Get 1 Free", type: "BOGO", reason: "Weekend Silver members visit 2.4x when BOGO runs.", winback: 26 },
  { segment: "Platinum · Birthdays this month", name: "Complimentary chef's tasting", type: "Gift", reason: "Platinum birthday recipients bring 3.1 guests on average.", winback: 44 },
  { segment: "Lost customers · 90+ days", name: "₹300 cashback on ₹999", type: "Cashback", reason: "Cashback wins back 18% of lapsed customers in this segment.", winback: 18 },
];

function LoyaltyPage() {
  const { offers, launchOffer } = useData();
  const [suggestIdx, setSuggestIdx] = useState(0);
  const s = suggestions[suggestIdx];

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
                </tr>
              </thead>
              <tbody>
                {offers.map((o) => (
                  <tr key={o.id} className="border-t border-border">
                    <td className="px-5 py-3 font-medium">{o.name}</td>
                    <td className="px-5 py-3"><Badge tone="muted">{o.type}</Badge></td>
                    <td className="px-5 py-3 font-semibold">{o.redemptions}</td>
                    <td className="px-5 py-3"><Badge tone={o.status === "Active" ? "success" : "warning"}>{o.status}</Badge></td>
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
              <p className="text-xs text-muted-foreground mt-2">
                Reasoning: {s.reason} Expected win-back rate: <span className="font-semibold text-emerald-600">{s.winback}%</span>.
              </p>
            </div>
            <button
              onClick={() => {
                launchOffer({ name: s.name, type: s.type });
                toast.success(`Launched "${s.name}"`);
                setSuggestIdx((i) => (i + 1) % suggestions.length);
              }}
              className="w-full h-10 rounded-lg bg-gold text-gold-foreground text-sm font-semibold"
            >
              Launch offer
            </button>
          </CardBody>
        </Card>
      </div>
    </AppShell>
  );
}
