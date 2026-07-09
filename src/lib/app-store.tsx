import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  customers as seedCustomers,
  campaigns as seedCampaigns,
  socialPosts as seedSocialPosts,
  offers as seedOffers,
  staff as seedStaff,
  reviewRequests as seedReviewRequests,
  plans as seedPlans,
  segments as seedSegments,
  business as seedBusiness,
  type Customer,
  type Campaign,
  type SocialPost,
  type Offer,
  type Segment,
} from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";
import type { Session, User } from "@supabase/supabase-js";

export type { Campaign, SocialPost, Offer, Segment };
export type Staff = (typeof seedStaff)[number];
export type ReviewRequest = (typeof seedReviewRequests)[number];
export type Plan = (typeof seedPlans)[number];

// ---------- Auth ----------
type ProfileStatus = "pending" | "approved" | "rejected";
type AuthCtx = {
  user: User | null;
  session: Session | null;
  status: ProfileStatus | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
};
const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<ProfileStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfileStatus = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("status")
      .eq("id", userId)
      .single();
    setStatus((data?.status as ProfileStatus) ?? "pending");
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) await fetchProfileStatus(data.session.user.id);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        await fetchProfileStatus(newSession.user.id);
      } else {
        setStatus(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const value: AuthCtx = {
    user,
    session,
    status,
    loading,
    signUp: async (email, password) => {
      const { error } = await supabase.auth.signUp({ email, password });
      return { error: error?.message ?? null };
    },
    login: async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message ?? null };
    },
    logout: async () => {
      await supabase.auth.signOut();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside AuthProvider");
  return ctx;
}
// ---------- Helpers ----------
export function countMatching(customers: Customer[], seg: Segment): number {
  return customers.filter((c) =>
    seg.ruleType === "visits" ? c.visits >= seg.threshold : c.totalSpend >= seg.threshold
  ).length;
}

// ---------- Data ----------
type DataCtx = {
  customers: Customer[];
  addCustomer: (c: Partial<Customer> & { name: string }) => Customer;
  updateCustomer: (id: string, patch: Partial<Customer>) => void;

  campaigns: Campaign[];
  addCampaign: (c: Partial<Campaign> & { name?: string }) => Campaign;
  updateCampaign: (id: string, patch: Partial<Campaign>) => void;
  runCampaign: (id: string) => number;

  socialPosts: SocialPost[];
  addSocialPost: (p: Partial<SocialPost> & { day: string; time: string; channel: "Instagram" | "Facebook"; caption: string; status: SocialPost["status"] }) => SocialPost;
  updateSocialPost: (id: string, patch: Partial<SocialPost>) => void;
  deleteSocialPost: (id: string) => void;

  offers: Offer[];
  launchOffer: (o: Partial<Offer> & { name: string; type: string }) => void;
  updateOffer: (id: string, patch: Partial<Offer>) => void;

  segments: Segment[];
  addSegment: (s: Omit<Segment, "id">) => Segment;
  updateSegment: (id: string, patch: Partial<Segment>) => void;
  deleteSegment: (id: string) => void;

  staffList: Staff[];
  addStaff: (s: Omit<Staff, "id">) => void;

  reviewRequests: ReviewRequest[];
  addReviewRequest: (customer: string) => void;

  plans: Plan[];
  setCurrentPlan: (name: string) => void;

  business: typeof seedBusiness;
  updateBusiness: (patch: Partial<typeof seedBusiness>) => void;
};
const DataContext = createContext<DataCtx | null>(null);

let idCounter = 1000;
const nextId = (prefix: string) => `${prefix}${++idCounter}`;
// Supabase row (snake_case) ko Customer type (camelCase) mein convert karta hai
function fromDbCustomer(row: any): Customer {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    birthday: row.birthday,
    anniversary: row.anniversary,
    lastVisit: row.last_visit,
    totalSpend: row.total_spend,
    visits: row.visits,
    status: row.status,
    tier: row.tier,
    points: row.points,
    notes: row.notes,
    history: row.history || [],
  };
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("customers")
      .select("*")
      .eq("business_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setCustomers(data.map(fromDbCustomer));
      });
  }, [user]);
  const [campaigns, setCampaigns] = useState<Campaign[]>(seedCampaigns);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>(seedSocialPosts);
  const [offers, setOffers] = useState<Offer[]>(seedOffers);
  const [segments, setSegments] = useState<Segment[]>(seedSegments);
  const [staffList, setStaffList] = useState<Staff[]>(seedStaff);
  const [reviewRequests, setReviewRequests] = useState<ReviewRequest[]>(seedReviewRequests);
  const [plans, setPlans] = useState<Plan[]>(seedPlans);
  const [business, setBusiness] = useState(seedBusiness);

  const value: DataCtx = {
   customers,
    addCustomer: (c) => {
      const nc: Customer = {
        id: nextId("c"),
        name: c.name || "New Customer",
        phone: c.phone || "",
        email: c.email || "",
        birthday: c.birthday || "",
        anniversary: c.anniversary || "",
        lastVisit: "Just added",
        totalSpend: 0,
        visits: 0,
        status: "New",
        tier: "Silver",
        points: 0,
        notes: c.notes || "",
        history: [],
      };
      setCustomers((prev) => [nc, ...prev]);
      if (user) {
        supabase
          .from("customers")
          .insert({
            business_id: user.id,
            name: nc.name,
            phone: nc.phone,
            email: nc.email,
            birthday: nc.birthday,
            anniversary: nc.anniversary,
            last_visit: nc.lastVisit,
            total_spend: nc.totalSpend,
            visits: nc.visits,
            status: nc.status,
            tier: nc.tier,
            points: nc.points,
            notes: nc.notes,
            history: nc.history,
          })
          .select()
          .single()
          .then(({ data }) => {
            if (data) {
              setCustomers((prev) =>
                prev.map((c) => (c.id === nc.id ? fromDbCustomer(data) : c))
              );
            }
          });
      }
      return nc;
    },
    updateCustomer: (id, patch) => {
      setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
      const dbPatch: any = {};
      if (patch.name !== undefined) dbPatch.name = patch.name;
      if (patch.phone !== undefined) dbPatch.phone = patch.phone;
      if (patch.email !== undefined) dbPatch.email = patch.email;
      if (patch.birthday !== undefined) dbPatch.birthday = patch.birthday;
      if (patch.anniversary !== undefined) dbPatch.anniversary = patch.anniversary;
      if (patch.lastVisit !== undefined) dbPatch.last_visit = patch.lastVisit;
      if (patch.totalSpend !== undefined) dbPatch.total_spend = patch.totalSpend;
      if (patch.visits !== undefined) dbPatch.visits = patch.visits;
      if (patch.status !== undefined) dbPatch.status = patch.status;
      if (patch.tier !== undefined) dbPatch.tier = patch.tier;
      if (patch.points !== undefined) dbPatch.points = patch.points;
      if (patch.notes !== undefined) dbPatch.notes = patch.notes;
      if (patch.history !== undefined) dbPatch.history = patch.history;
      if (Object.keys(dbPatch).length > 0) {
        supabase.from("customers").update(dbPatch).eq("id", id);
      }
    },
    campaigns,
    addCampaign: (c) => {
      const nc: Campaign = {
        id: nextId("cam"),
        name: c.name || "New campaign",
        trigger: c.trigger || "Inactive 30 days",
        offer: c.offer || "20% off",
        message: c.message || "",
        image: c.image || "",
        matched: c.matched ?? 30,
        status: c.status || "Active",
        sent: 0, opened: 0, redeemed: 0, returned: 0,
        audience: c.audience || ["All customers"],
        runStatus: c.runStatus || "Idle",
      };
      setCampaigns((prev) => [nc, ...prev]);
      return nc;
    },
    updateCampaign: (id, patch) =>
      setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c))),
    runCampaign: (id) => {
      let count = 0;
      setCampaigns((prev) => prev.map((c) => {
        if (c.id !== id) return c;
        count = c.matched || 45;
        const delivered = Math.max(0, count - Math.round(count * 0.05));
        const opened = Math.round(delivered * 0.62);
        const redeemed = Math.round(opened * 0.34);
        return {
          ...c,
          sent: c.sent + count,
          runStatus: "Sent",
          lastRunCount: count,
          results: { delivered, opened, redeemed },
        };
      }));
      return count;
    },

    socialPosts,
    addSocialPost: (p) => {
      const np: SocialPost = {
        id: nextId("p"),
        image: "", link: "", versions: [],
        ...p,
      };
      setSocialPosts((prev) => [...prev, np]);
      return np;
    },
    updateSocialPost: (id, patch) =>
      setSocialPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p))),
    deleteSocialPost: (id) =>
      setSocialPosts((prev) => prev.filter((p) => p.id !== id)),

    offers,
    launchOffer: (o) =>
      setOffers((prev) => [{
        description: "", reward: "",
        audience: o.audience || ["All customers"],
        ...o,
        id: nextId("o"),
        status: o.status || "Active",
        redemptions: o.redemptions ?? 0,
      } as Offer, ...prev]),
    updateOffer: (id, patch) =>
      setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o))),

    segments,
    addSegment: (s) => {
      const ns: Segment = { id: nextId("seg"), ...s };
      setSegments((prev) => [...prev, ns]);
      return ns;
    },
    updateSegment: (id, patch) =>
      setSegments((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s))),
    deleteSegment: (id) =>
      setSegments((prev) => prev.filter((s) => s.id !== id)),

    staffList,
    addStaff: (s) => setStaffList((prev) => [...prev, { ...s, id: nextId("st") }]),

    reviewRequests,
    addReviewRequest: (customer) =>
      setReviewRequests((prev) => [{ id: nextId("r"), customer, sent: "Just now", status: "Opened" }, ...prev]),

    plans,
    setCurrentPlan: (name) => {
      setPlans((prev) => prev.map((p) => ({ ...p, current: p.name === name })));
      setBusiness((prev) => ({ ...prev, plan: name }));
    },

    business,
    updateBusiness: (patch) => setBusiness((prev) => ({ ...prev, ...patch })),
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData outside DataProvider");
  return ctx;
}
