import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Instagram, Facebook, Sparkles, Plus, X } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardBody, Badge } from "@/components/ui-kit";
import { engagementTrend } from "@/lib/mock-data";
import { useData } from "@/lib/app-store";

export const Route = createFileRoute("/social")({
  component: SocialPage,
});

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const aiVariations = [
  {
    caption: "🍳 Weekend brunch is back! Fluffy pancakes, filter coffee & 20% off till Sunday noon. Tag a friend who needs this ✨",
    concept: "Overhead shot of pancakes with maple syrup drizzle, warm morning light, soft focus.",
  },
  {
    caption: "Rainy day = biryani day 🌧️ Get our signature dum biryani with a free gulab jamun this weekend only.",
    concept: "Steaming biryani handi opened at the table, moody warm lighting, close-up steam.",
  },
  {
    caption: "Date night, sorted 💛 Two-course tasting menu + a glass of wine at ₹1,499 for two. Book by Friday.",
    concept: "Two hands clinking wine glasses over candlelit table, shallow depth of field.",
  },
  {
    caption: "Meet the team behind the magic ✨ Chef Rohan shares his monsoon menu inspiration — swipe to see.",
    concept: "Chef portrait in the kitchen, natural light from the pass window, authentic behind-the-scenes vibe.",
  },
];

function SocialPage() {
  const { socialPosts, addSocialPost } = useData();
  const [show, setShow] = useState(false);
  const [variant, setVariant] = useState(0);
  const [day, setDay] = useState("Mon");
  const [channel, setChannel] = useState<"Instagram" | "Facebook">("Instagram");
  const [time, setTime] = useState("10:00");

  const current = aiVariations[variant];
  return (
    <AppShell title="Social Media">
      {/* Connected accounts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5 flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-pink-100 text-pink-600">
            <Instagram className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold">Instagram</div>
            <div className="text-xs text-muted-foreground truncate">@spiceroutekitchen · 12.4k followers</div>
          </div>
          <Badge tone="success">Connected</Badge>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-blue-100 text-blue-600">
            <Facebook className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold">Facebook</div>
            <div className="text-xs text-muted-foreground truncate">Spice Route Kitchen · 8.1k followers</div>
          </div>
          <Badge tone="success">Connected</Badge>
        </Card>
      </div>

      {/* Calendar */}
      <Card className="mt-6">
        <CardHeader
          title="Weekly content calendar"
          description="Scheduled posts across your channels"
          action={
            <button onClick={() => setShow(true)} className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">
              <Plus className="h-3.5 w-3.5" /> Generate New Post
            </button>
          }
        />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 p-5">
          {days.map((d) => {
            const posts = socialPosts.filter((p) => p.day === d);
            return (
              <div key={d} className="rounded-xl bg-muted/40 p-3 min-h-[180px]">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{d}</div>
                <div className="space-y-2">
                  {posts.map((p) => (
                    <div key={p.id} className="rounded-lg bg-card border border-border p-2.5">
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>{p.time}</span>
                        <span>{p.channel === "Instagram" ? "IG" : "FB"}</span>
                      </div>
                      <div className="mt-1 h-16 rounded-md bg-gradient-to-br from-primary/20 to-gold/30" />
                      <p className="mt-2 text-[11px] line-clamp-2">{p.caption}</p>
                      <Badge tone={p.status === "Scheduled" ? "success" : "muted"} className="mt-2 text-[10px]">{p.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Analytics */}
      <div className="grid gap-4 lg:grid-cols-3 mt-6">
        {[
          { label: "Reach (this month)", value: "42.8k", delta: "+18%" },
          { label: "Engagement", value: "3.6k", delta: "+9%" },
          { label: "Follower growth", value: "+540", delta: "+12%" },
        ].map((s) => (
          <Card key={s.label} className="p-5">
            <div className="text-xs text-muted-foreground font-medium">{s.label}</div>
            <div className="mt-2 flex items-end justify-between">
              <div className="text-2xl font-bold">{s.value}</div>
              <span className="text-xs font-semibold text-emerald-600">{s.delta}</span>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader title="Growth trend" description="Reach, engagement & followers" />
        <CardBody className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={engagementTrend} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="reach" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="engagement" stroke="var(--color-gold)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="followers" stroke="var(--color-chart-4)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>

      {show && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/40 p-4" onClick={() => setShow(false)}>
          <div className="bg-card rounded-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-gold" />
                <h3 className="font-bold text-lg">Generate a post with AI</h3>
              </div>
              <button onClick={() => setShow(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1">Occasion or offer</label>
                <input defaultValue="Weekend brunch — 20% off" className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium mb-1">Day</label>
                  <select value={day} onChange={(e) => setDay(e.target.value)} className="w-full h-10 rounded-lg border border-input bg-background px-2 text-sm">
                    {days.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Time</label>
                  <input value={time} onChange={(e) => setTime(e.target.value)} className="w-full h-10 rounded-lg border border-input bg-background px-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Channel</label>
                  <select value={channel} onChange={(e) => setChannel(e.target.value as "Instagram" | "Facebook")} className="w-full h-10 rounded-lg border border-input bg-background px-2 text-sm">
                    <option>Instagram</option><option>Facebook</option>
                  </select>
                </div>
              </div>
              <div className="rounded-lg bg-muted/60 p-4">
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Suggested caption</div>
                <p className="mt-2 text-sm">{current.caption}</p>
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mt-4">Image concept</div>
                <p className="mt-2 text-sm">{current.concept}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setVariant((v) => (v + 1) % aiVariations.length)}
                  className="flex-1 h-10 rounded-lg border border-border text-sm font-semibold"
                >Regenerate</button>
                <button
                  onClick={() => {
                    addSocialPost({ day, time, channel, caption: current.caption, status: "Scheduled" });
                    toast.success(`Post scheduled for ${day} at ${time}`);
                    setShow(false);
                    setVariant(0);
                  }}
                  className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold"
                >Schedule</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
