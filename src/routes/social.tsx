import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Instagram, Facebook, Sparkles, Plus, X, Upload, MessageCircle, LinkIcon } from "lucide-react";
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

const aiCaptions = [
  "🍳 Weekend brunch is back! Fluffy pancakes, filter coffee & 20% off till Sunday noon. Tag a friend who needs this ✨",
  "Rainy day = biryani day 🌧️ Get our signature dum biryani with a free gulab jamun this weekend only.",
  "Date night, sorted 💛 Two-course tasting menu + a glass of wine at ₹1,499 for two. Book by Friday.",
  "Meet the team behind the magic ✨ Chef Rohan shares his monsoon menu inspiration — swipe to see.",
];

function SocialPage() {
  const { socialPosts, addSocialPost, addCampaign } = useData();
  const [show, setShow] = useState(false);
  const [variant, setVariant] = useState(0);
  const [caption, setCaption] = useState(aiCaptions[0]);
  const [day, setDay] = useState("Mon");
  const [channel, setChannel] = useState<"Instagram" | "Facebook">("Instagram");
  const [time, setTime] = useState("10:00");
  const [media, setMedia] = useState<{ url: string; type: "image" | "video" } | null>(null);
  const [link, setLink] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const openModal = () => {
    setVariant(0);
    setCaption(aiCaptions[0]);
    setMedia(null);
    setLink("");
    setShow(true);
  };

  const onFile = (f: File | null) => {
    if (!f) return;
    const isImg = f.type.startsWith("image/");
    const isVid = f.type.startsWith("video/");
    if (!isImg && !isVid) { toast.error("Pick an image or video"); return; }
    const reader = new FileReader();
    reader.onload = () => setMedia({ url: String(reader.result), type: isImg ? "image" : "video" });
    reader.readAsDataURL(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onFile(e.dataTransfer.files?.[0] ?? null);
  };

  const regenerate = () => {
    const next = (variant + 1) % aiCaptions.length;
    setVariant(next);
    setCaption(aiCaptions[next]);
  };

  const schedule = () => {
    addSocialPost({
      day, time, channel,
      caption,
      status: "Scheduled",
      image: media?.type === "image" ? media.url : "",
      link,
    });
    toast.success(`Post scheduled for ${day} at ${time}`);
    setShow(false);
  };

  const sendAsWhatsApp = (postId: string) => {
    const p = socialPosts.find((x) => x.id === postId);
    if (!p) return;
    addCampaign({
      name: `WhatsApp: ${p.caption.slice(0, 30)}${p.caption.length > 30 ? "…" : ""}`,
      trigger: "Matching customers",
      offer: p.caption,
      message: p.caption + (p.link ? `\n\n${p.link}` : ""),
      image: p.image || "",
      matched: 156,
      status: "Active",
    });
    toast.success("This offer will also go out as a WhatsApp campaign to matching customers");
  };

  return (
    <AppShell title="Social Media">
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

      <Card className="mt-6">
        <CardHeader
          title="Weekly content calendar"
          description="Scheduled posts across your channels"
          action={
            <button onClick={openModal} className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">
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
                      {p.image ? (
                        <img src={p.image} alt="" className="mt-1 h-16 w-full rounded-md object-cover" />
                      ) : (
                        <div className="mt-1 h-16 rounded-md bg-gradient-to-br from-primary/20 to-gold/30" />
                      )}
                      <p className="mt-2 text-[11px] line-clamp-2">{p.caption}</p>
                      {p.link && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-primary truncate">
                          <LinkIcon className="h-2.5 w-2.5 flex-shrink-0" />
                          <span className="truncate">{p.link}</span>
                        </div>
                      )}
                      <div className="mt-2 flex items-center justify-between gap-1">
                        <Badge tone={p.status === "Scheduled" ? "success" : "muted"} className="text-[10px]">{p.status}</Badge>
                        <button
                          onClick={() => sendAsWhatsApp(p.id)}
                          title="Send as WhatsApp campaign too"
                          className="inline-flex items-center gap-1 rounded-md bg-emerald-50 text-emerald-700 px-1.5 py-0.5 text-[9px] font-semibold hover:bg-emerald-100"
                        >
                          <MessageCircle className="h-2.5 w-2.5" /> WA
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

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
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/40 p-4 overflow-y-auto" onClick={() => setShow(false)}>
          <div className="bg-card rounded-2xl w-full max-w-lg p-6 my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-gold" />
                <h3 className="font-bold text-lg">Create post</h3>
              </div>
              <button onClick={() => setShow(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-4 space-y-3">
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

              <div>
                <label className="block text-xs font-medium mb-1">Caption</label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-y"
                />
                <button
                  onClick={regenerate}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <Sparkles className="h-3 w-3" /> Regenerate caption with AI
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Photo or video</label>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDrop}
                  onClick={() => fileRef.current?.click()}
                  className="cursor-pointer rounded-lg border-2 border-dashed border-border p-4 text-center hover:bg-muted/40"
                >
                  {media ? (
                    media.type === "image" ? (
                      <img src={media.url} alt="preview" className="mx-auto max-h-40 rounded-md" />
                    ) : (
                      <video src={media.url} controls className="mx-auto max-h-40 rounded-md" />
                    )
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
                      <Upload className="h-5 w-5" />
                      <div>Drag & drop or click to upload</div>
                      <div className="text-[10px]">Images or video</div>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
                {media && (
                  <button onClick={() => setMedia(null)} className="mt-1 text-[11px] text-muted-foreground underline">Remove media</button>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Link (optional)</label>
                <input
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://menu.spiceroute.com"
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button onClick={() => setShow(false)} className="flex-1 h-10 rounded-lg border border-border text-sm font-semibold">Cancel</button>
                <button onClick={schedule} className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold">Schedule</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
