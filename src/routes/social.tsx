import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Instagram, Facebook, Sparkles, Plus, X, Upload, MessageCircle, LinkIcon, MoreVertical, Trash2, CalendarClock, RotateCcw, History } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardBody, Badge } from "@/components/ui-kit";
import { engagementTrend } from "@/lib/mock-data";
import { useData, type SocialPost } from "@/lib/app-store";
import { AudiencePicker } from "@/components/audience-picker";

export const Route = createFileRoute("/social")({
  component: SocialPage,
});

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const aiCaptions = [
  "🍳 Weekend brunch is back! Fluffy pancakes, filter coffee & 20% off till Sunday noon. Tag a friend who needs this ✨",
  "Rainy day = biryani day 🌧️ Get our signature dum biryani with a free gulab jamun this weekend only.",
  "Date night, sorted 💛 Two-course tasting menu + a glass of wine at ₹1,499 for two. Book by Friday.",
  "Meet the team behind the magic ✨ Chef Rohan shares his monsoon menu inspiration — swipe to see.",
  "Monday blues? We've got mango lassi + samosas at ₹149 all day. Grab a table, we'll handle the rest.",
  "Fresh from the tandoor 🔥 Our new kebab platter is here — hand-marinated, slow-grilled, worth the trip.",
];

function templateSVG(label: string, from: string, to: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 120'><defs><linearGradient id='g' x1='0' x2='1' y1='0' y2='1'><stop offset='0' stop-color='${from}'/><stop offset='1' stop-color='${to}'/></linearGradient></defs><rect width='200' height='120' fill='url(%23g)'/><text x='100' y='68' font-family='Inter,sans-serif' font-size='16' font-weight='700' fill='white' text-anchor='middle'>${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${svg.replace(/#/g, "%23")}`;
}
const templates = [
  { id: "t1", label: "WEEKEND OFFER", url: templateSVG("WEEKEND OFFER", "#1F3A5F", "#3B6AA6") },
  { id: "t2", label: "FREE DESSERT", url: templateSVG("FREE DESSERT", "#C9922B", "#F1C265") },
  { id: "t3", label: "BOGO", url: templateSVG("BOGO", "#7C3AED", "#EC4899") },
  { id: "t4", label: "FESTIVAL", url: templateSVG("FESTIVAL", "#DC2626", "#F59E0B") },
  { id: "t5", label: "BIRTHDAY", url: templateSVG("BIRTHDAY", "#0EA5E9", "#22D3EE") },
];

type EditorState = {
  editingId: string | null;
  day: string;
  time: string;
  channel: "Instagram" | "Facebook";
  caption: string;
  media: { url: string; type: "image" | "video" } | null;
  link: string;
  versions: string[];
};

const emptyEditor = (): EditorState => ({
  editingId: null, day: "Mon", time: "10:00", channel: "Instagram",
  caption: aiCaptions[0], media: null, link: "", versions: [],
});

function SocialPage() {
  const { socialPosts, addSocialPost, updateSocialPost, deleteSocialPost, addCampaign } = useData();
  const [show, setShow] = useState(false);
  const [state, setState] = useState<EditorState>(emptyEditor());
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [waFor, setWaFor] = useState<SocialPost | null>(null);
  const [waAudience, setWaAudience] = useState<string[]>(["All customers"]);
  const [showHistory, setShowHistory] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const openNew = () => {
    const first = aiCaptions[Math.floor(Math.random() * aiCaptions.length)];
    setState({ ...emptyEditor(), caption: first, versions: [] });
    setShowHistory(false);
    setShow(true);
  };

  const openEdit = (p: SocialPost) => {
    if (p.status === "Posted") return;
    setState({
      editingId: p.id,
      day: p.day, time: p.time,
      channel: p.channel,
      caption: p.caption,
      media: p.image ? { url: p.image, type: "image" } : null,
      link: p.link || "",
      versions: p.versions || [],
    });
    setShowHistory(false);
    setShow(true);
  };

  const onFile = (f: File | null) => {
    if (!f) return;
    const isImg = f.type.startsWith("image/");
    const isVid = f.type.startsWith("video/");
    if (!isImg && !isVid) { toast.error("Pick an image or video"); return; }
    const reader = new FileReader();
    reader.onload = () => setState((s) => ({ ...s, media: { url: String(reader.result), type: isImg ? "image" : "video" } }));
    reader.readAsDataURL(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onFile(e.dataTransfer.files?.[0] ?? null);
  };

  const regenerate = () => {
    setState((s) => {
      const nextIdx = Math.floor(Math.random() * aiCaptions.length);
      const nextCap = aiCaptions[nextIdx] === s.caption
        ? aiCaptions[(nextIdx + 1) % aiCaptions.length]
        : aiCaptions[nextIdx];
      const versions = [s.caption, ...s.versions].slice(0, 5);
      return { ...s, caption: nextCap, versions };
    });
    toast.success("New AI caption generated");
  };

  const restoreVersion = (v: string) => {
    setState((s) => ({
      ...s,
      caption: v,
      versions: [s.caption, ...s.versions.filter((x) => x !== v)].slice(0, 5),
    }));
    setShowHistory(false);
  };

  const save = () => {
    const image = state.media?.type === "image" ? state.media.url : "";
    if (state.editingId) {
      updateSocialPost(state.editingId, {
        day: state.day, time: state.time, channel: state.channel,
        caption: state.caption, image, link: state.link, versions: state.versions,
      });
      toast.success("Post updated");
    } else {
      addSocialPost({
        day: state.day, time: state.time, channel: state.channel,
        caption: state.caption, status: "Scheduled",
        image, link: state.link, versions: state.versions,
      });
      toast.success(`Post scheduled for ${state.day} at ${state.time}`);
    }
    setShow(false);
  };

  const openWA = (p: SocialPost) => {
    setWaFor(p);
    setWaAudience(["All customers"]);
    setMenuFor(null);
  };

  const confirmWA = () => {
    if (!waFor) return;
    if (waAudience.length === 0) { toast.error("Pick at least one audience"); return; }
    addCampaign({
      name: `WhatsApp: ${waFor.caption.slice(0, 30)}${waFor.caption.length > 30 ? "…" : ""}`,
      trigger: "Manual send",
      offer: waFor.caption,
      message: waFor.caption + (waFor.link ? `\n\n${waFor.link}` : ""),
      image: waFor.image || "",
      matched: 156,
      status: "Active",
      audience: waAudience,
    });
    toast.success(`WhatsApp campaign queued for ${waAudience.join(", ")}`);
    setWaFor(null);
  };

  const statusTone = (s: SocialPost["status"]) =>
    s === "Posted" ? "success" : s === "Failed" ? "warning" : "default";

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
          description="Click any scheduled card to edit it"
          action={
            <button onClick={openNew} className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">
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
                  {posts.map((p) => {
                    const locked = p.status === "Posted";
                    return (
                      <div
                        key={p.id}
                        className={`relative rounded-lg bg-card border border-border p-2.5 ${!locked ? "cursor-pointer hover:border-primary/50" : "opacity-90"}`}
                        onClick={() => !locked && openEdit(p)}
                      >
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>{p.time}</span>
                          <div className="flex items-center gap-1">
                            <span>{p.channel === "Instagram" ? "IG" : "FB"}</span>
                            {!locked && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setMenuFor(menuFor === p.id ? null : p.id); }}
                                className="p-0.5 rounded hover:bg-muted"
                              >
                                <MoreVertical className="h-3 w-3" />
                              </button>
                            )}
                          </div>
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
                          <Badge tone={statusTone(p.status)} className="text-[10px]">{p.status}</Badge>
                          {!locked && (
                            <button
                              onClick={(e) => { e.stopPropagation(); openWA(p); }}
                              title="Send as WhatsApp campaign too"
                              className="inline-flex items-center gap-1 rounded-md bg-emerald-50 text-emerald-700 px-1.5 py-0.5 text-[9px] font-semibold hover:bg-emerald-100"
                            >
                              <MessageCircle className="h-2.5 w-2.5" /> WA
                            </button>
                          )}
                        </div>

                        {menuFor === p.id && (
                          <div
                            className="absolute z-20 right-2 top-6 w-36 rounded-md border border-border bg-card shadow-lg text-xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => { openEdit(p); setMenuFor(null); }}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted text-left"
                            >
                              <CalendarClock className="h-3 w-3" /> Reschedule
                            </button>
                            <button
                              onClick={() => { deleteSocialPost(p.id); setMenuFor(null); toast.success("Post deleted"); }}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted text-left text-destructive"
                            >
                              <Trash2 className="h-3 w-3" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
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
                <h3 className="font-bold text-lg">{state.editingId ? "Edit post" : "Create post"}</h3>
              </div>
              <button onClick={() => setShow(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium mb-1">Day</label>
                  <select value={state.day} onChange={(e) => setState((s) => ({ ...s, day: e.target.value }))} className="w-full h-10 rounded-lg border border-input bg-background px-2 text-sm">
                    {days.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Time</label>
                  <input value={state.time} onChange={(e) => setState((s) => ({ ...s, time: e.target.value }))} className="w-full h-10 rounded-lg border border-input bg-background px-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Channel</label>
                  <select value={state.channel} onChange={(e) => setState((s) => ({ ...s, channel: e.target.value as "Instagram" | "Facebook" }))} className="w-full h-10 rounded-lg border border-input bg-background px-2 text-sm">
                    <option>Instagram</option><option>Facebook</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Caption</label>
                <textarea
                  value={state.caption}
                  onChange={(e) => setState((s) => ({ ...s, caption: e.target.value }))}
                  rows={4}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-y"
                />
                <div className="mt-2 flex items-center gap-3">
                  <button
                    onClick={regenerate}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                  >
                    <RotateCcw className="h-3 w-3" /> Regenerate with AI
                  </button>
                  {state.versions.length > 0 && (
                    <button
                      onClick={() => setShowHistory((v) => !v)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                    >
                      <History className="h-3 w-3" /> Previous versions ({state.versions.length})
                    </button>
                  )}
                </div>
                {showHistory && state.versions.length > 0 && (
                  <div className="mt-2 rounded-lg border border-border bg-muted/30 p-2 space-y-1 max-h-40 overflow-auto">
                    {state.versions.map((v, i) => (
                      <button
                        key={i}
                        onClick={() => restoreVersion(v)}
                        className="w-full text-left text-xs p-2 rounded-md hover:bg-card border border-transparent hover:border-border"
                      >
                        <div className="text-[10px] uppercase text-muted-foreground mb-0.5">v{state.versions.length - i}</div>
                        <div className="line-clamp-2">{v}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Template gallery</label>
                <div className="grid grid-cols-5 gap-2">
                  {templates.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setState((s) => ({ ...s, media: { url: t.url, type: "image" } }))}
                      className={`aspect-square rounded-md overflow-hidden border-2 ${state.media?.url === t.url ? "border-primary" : "border-transparent"}`}
                      title={t.label}
                    >
                      <img src={t.url} alt={t.label} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Or upload your own photo/video</label>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDrop}
                  onClick={() => fileRef.current?.click()}
                  className="cursor-pointer rounded-lg border-2 border-dashed border-border p-4 text-center hover:bg-muted/40"
                >
                  {state.media ? (
                    state.media.type === "image" ? (
                      <img src={state.media.url} alt="preview" className="mx-auto max-h-40 rounded-md" />
                    ) : (
                      <video src={state.media.url} controls className="mx-auto max-h-40 rounded-md" />
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
                {state.media && (
                  <button onClick={() => setState((s) => ({ ...s, media: null }))} className="mt-1 text-[11px] text-muted-foreground underline">Remove media</button>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Link (optional)</label>
                <input
                  value={state.link}
                  onChange={(e) => setState((s) => ({ ...s, link: e.target.value }))}
                  placeholder="https://menu.spiceroute.com"
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button onClick={() => setShow(false)} className="flex-1 h-10 rounded-lg border border-border text-sm font-semibold">Cancel</button>
                <button onClick={save} className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold">
                  {state.editingId ? "Save changes" : "Schedule"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {waFor && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/40 p-4" onClick={() => setWaFor(null)}>
          <div className="bg-card rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-emerald-600" />
                <h3 className="font-bold text-lg">Send as WhatsApp campaign</h3>
              </div>
              <button onClick={() => setWaFor(null)}><X className="h-5 w-5" /></button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground line-clamp-3 italic">"{waFor.caption}"</p>
            <div className="mt-4">
              <AudiencePicker value={waAudience} onChange={setWaAudience} />
            </div>
            <div className="flex gap-2 pt-4">
              <button onClick={() => setWaFor(null)} className="flex-1 h-10 rounded-lg border border-border text-sm font-semibold">Cancel</button>
              <button onClick={confirmWA} className="flex-1 h-10 rounded-lg bg-emerald-600 text-white text-sm font-semibold">Send campaign</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
