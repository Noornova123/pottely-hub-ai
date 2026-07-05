import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  customers as seedCustomers,
  campaigns as seedCampaigns,
  socialPosts as seedSocialPosts,
  offers as seedOffers,
  staff as seedStaff,
  reviewRequests as seedReviewRequests,
  plans as seedPlans,
  business as seedBusiness,
  type Customer,
} from "@/lib/mock-data";

// ---------- Auth ----------
type AuthUser = { email: string; name: string };
type AuthCtx = {
  user: AuthUser | null;
  login: (email: string, password: string) => void;
  logout: () => void;
};
const AuthContext = createContext<AuthCtx | null>(null);
const AUTH_KEY = "pottely.auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(AUTH_KEY) : null;
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);
  const value = useMemo<AuthCtx>(() => ({
    user,
    login: (email) => {
      const u = { email, name: email.split("@")[0] || "Owner" };
      setUser(u);
      try { window.localStorage.setItem(AUTH_KEY, JSON.stringify(u)); } catch {}
    },
    logout: () => {
      setUser(null);
      try { window.localStorage.removeItem(AUTH_KEY); } catch {}
    },
  }), [user]);
  if (!ready) return null;
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside AuthProvider");
  return ctx;
}

// ---------- Data ----------
export type Campaign = (typeof seedCampaigns)[number];
export type SocialPost = (typeof seedSocialPosts)[number];
export type Offer = (typeof seedOffers)[number];
export type Staff = (typeof seedStaff)[number];
export type ReviewRequest = (typeof seedReviewRequests)[number];
export type Plan = (typeof seedPlans)[number];

type DataCtx = {
  customers: Customer[];
  addCustomer: (c: Omit<Customer, "id" | "history" | "points" | "visits" | "totalSpend" | "tier" | "status"> & Partial<Customer>) => Customer;
  updateCustomer: (id: string, patch: Partial<Customer>) => void;

  campaigns: Campaign[];
  addCampaign: (c: Omit<Campaign, "id" | "sent" | "opened" | "redeemed" | "returned" | "matched" | "status"> & Partial<Campaign>) => Campaign;
  updateCampaign: (id: string, patch: Partial<Campaign>) => void;
  runCampaign: (id: string) => number;

  socialPosts: SocialPost[];
  addSocialPost: (p: Omit<SocialPost, "id">) => void;

  offers: Offer[];
  launchOffer: (o: Omit<Offer, "id" | "status" | "redemptions">) => void;

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

export function DataProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(seedCustomers);
  const [campaigns, setCampaigns] = useState<Campaign[]>(seedCampaigns);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>(seedSocialPosts);
  const [offers, setOffers] = useState<Offer[]>(seedOffers);
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
      return nc;
    },
    updateCustomer: (id, patch) =>
      setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c))),

    campaigns,
    addCampaign: (c) => {
      const nc: Campaign = {
        id: nextId("cam"),
        name: c.name || "New campaign",
        trigger: c.trigger || "Inactive 30 days",
        offer: c.offer || "20% off",
        matched: 30,
        status: "Active",
        sent: 0, opened: 0, redeemed: 0, returned: 0,
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
        return { ...c, sent: c.sent + count };
      }));
      return count;
    },

    socialPosts,
    addSocialPost: (p) =>
      setSocialPosts((prev) => [...prev, { ...p, id: nextId("p") }]),

    offers,
    launchOffer: (o) =>
      setOffers((prev) => [{ ...o, id: nextId("o"), status: "Active", redemptions: 0 }, ...prev]),

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
