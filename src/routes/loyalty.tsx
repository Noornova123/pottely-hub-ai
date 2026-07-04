import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardBody, Badge } from "@/components/ui-kit";
import { loyaltyTiers, offers } from "@/lib/mock-data";

export const Route = createFileRoute("/loyalty")({
  component: LoyaltyPage,
});

function LoyaltyPage() {
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
            <div className="font-semibold">Gold tier · Inactive 21-45 days</div>
            <div className="rounded-lg bg-muted/40 p-3">
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Suggested offer</div>
              <div className="mt-1 font-bold text-primary">Free dessert + 15% off</div>
              <p className="text-xs text-muted-foreground mt-2">
                Reasoning: This segment has an avg spend of ₹1,240 and 82% redeem free-dessert offers.
                Expected win-back rate: <span className="font-semibold text-emerald-600">31%</span>.
              </p>
            </div>
            <button className="w-full h-10 rounded-lg bg-gold text-gold-foreground text-sm font-semibold">
              Launch offer
            </button>
          </CardBody>
        </Card>
      </div>
    </AppShell>
  );
}
