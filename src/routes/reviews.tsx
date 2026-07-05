import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Star, Sparkles } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardBody, Badge } from "@/components/ui-kit";
import { ratingTrend } from "@/lib/mock-data";
import { useData } from "@/lib/app-store";

export const Route = createFileRoute("/reviews")({
  component: ReviewsPage,
});

const tone: Record<string, "success" | "warning" | "default"> = {
  Posted: "success",
  Clicked: "default",
  Opened: "warning",
};

const draftVariations = [
  `"Had a wonderful dinner at Spice Route Kitchen last weekend. The paneer tikka was perfectly smoky and the staff was warm and attentive. Loved the cozy ambience — will definitely be back with friends. ⭐⭐⭐⭐⭐"`,
  `"Absolutely loved the weekend brunch! Pancakes were fluffy, the filter coffee hit just right, and the service was quick. Great value too. Highly recommend for a lazy Sunday. ⭐⭐⭐⭐⭐"`,
  `"Went for a birthday celebration and the team made it super special. Chef sent out a complimentary dessert and the biryani was outstanding. Warm hospitality — 10/10. ⭐⭐⭐⭐⭐"`,
  `"Consistent quality every visit. Fresh ingredients, clean space and a menu that has something for everyone. Our go-to spot for family dinners. ⭐⭐⭐⭐⭐"`,
];

function ReviewsPage() {
  const { reviewRequests, addReviewRequest, customers } = useData();
  const [variant, setVariant] = useState(0);
  const [target, setTarget] = useState(customers[0]?.name || "");
  return (
    <AppShell title="Google Reviews">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <div className="text-xs text-muted-foreground font-medium">Current Google Rating</div>
          <div className="mt-2 flex items-center gap-2">
            <div className="text-4xl font-bold">4.6</div>
            <div className="flex text-gold">
              {[1,2,3,4,5].map((i) => <Star key={i} className="h-4 w-4 fill-current" />)}
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">312</span> total reviews · <span className="text-emerald-600 font-semibold">+18 this month</span>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Rating trend" description="12-month rating & review volume" />
          <CardBody className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ratingTrend} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                <YAxis domain={[3.8, 5]} tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="rating" stroke="var(--color-gold)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3 mt-6">
        <Card className="lg:col-span-2">
          <CardHeader title="Review requests" description="Recent outreach" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground bg-muted/40">
                <tr>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Date Sent</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {reviewRequests.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-5 py-3 font-medium">{r.customer}</td>
                    <td className="px-5 py-3 text-muted-foreground">{r.sent}</td>
                    <td className="px-5 py-3"><Badge tone={tone[r.status]}>{r.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader title="Generate review draft" action={<Sparkles className="h-4 w-4 text-gold" />} />
          <CardBody className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Suggest a review draft your customer can personalize before posting.
            </p>
            <div>
              <label className="block text-xs font-medium mb-1">Send to</label>
              <select value={target} onChange={(e) => setTarget(e.target.value)} className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
                {customers.slice(0, 20).map((c) => <option key={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="rounded-lg bg-muted/40 p-3 text-sm">{draftVariations[variant]}</div>
            <div className="flex gap-2">
              <button
                onClick={() => setVariant((v) => (v + 1) % draftVariations.length)}
                className="flex-1 h-10 rounded-lg border border-border text-xs font-semibold"
              >Regenerate</button>
              <button
                onClick={() => {
                  if (!target) { toast.error("Pick a customer"); return; }
                  addReviewRequest(target);
                  toast.success(`Review draft sent to ${target}`);
                }}
                className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-xs font-semibold"
              >Send to customer</button>
            </div>
          </CardBody>
        </Card>
      </div>
    </AppShell>
  );
}
