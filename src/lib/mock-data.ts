// Central mock data for the POTTELY dashboard demo.

export const business = {
  name: "Spice Route Kitchen",
  category: "Restaurant",
  plan: "Growth",
};

export const dashboardMetrics = [
  { label: "Today's Revenue", value: "₹18,420", delta: "+12.4%", positive: true },
  { label: "Monthly Revenue", value: "₹4,86,300", delta: "+8.1%", positive: true },
  { label: "New Customers", value: "142", delta: "+22", positive: true },
  { label: "Returning Customers", value: "318", delta: "+5.6%", positive: true },
  { label: "Lost Customers", value: "47", delta: "-3", positive: true },
  { label: "Google Rating", value: "4.6", delta: "+0.2", positive: true },
  { label: "Reviews Received", value: "312", delta: "+18", positive: true },
  { label: "Loyalty Members", value: "1,204", delta: "+46", positive: true },
];

export const aiSuggestions = [
  {
    id: "s1",
    title: "45 customers inactive for 30 days",
    detail: "Send a Weekend Offer to bring them back this Saturday.",
    action: "Run Campaign",
  },
  {
    id: "s2",
    title: "20 customers eligible for review request",
    detail: "They visited in the last 3 days and haven't left a Google review.",
    action: "Send Requests",
  },
  {
    id: "s3",
    title: "Birthday offers pending for 4 customers",
    detail: "Personal birthday message with 20% off dessert combo.",
    action: "Send Offers",
  },
  {
    id: "s4",
    title: "Festival campaign ready — Diwali",
    detail: "Preview drafted for 890 customers. Boost repeat visits by 18%.",
    action: "Review Draft",
  },
];

export const revenueTrend = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  revenue: 12000 + Math.round(Math.sin(i / 3) * 3500 + Math.random() * 4200 + i * 120),
}));

export const engagementTrend = Array.from({ length: 12 }, (_, i) => ({
  week: `W${i + 1}`,
  reach: 800 + i * 60 + Math.round(Math.random() * 200),
  engagement: 80 + i * 8 + Math.round(Math.random() * 40),
  followers: 1200 + i * 45,
}));

export type CustomerStatus = "New" | "Active" | "VIP" | "Inactive" | "Lost";
export type LoyaltyTier = "Silver" | "Gold" | "Platinum" | "VIP";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  birthday: string;
  anniversary: string;
  lastVisit: string;
  totalSpend: number;
  visits: number;
  status: CustomerStatus;
  tier: LoyaltyTier;
  points: number;
  notes: string;
  history: { date: string; item: string; amount: number }[];
}

const firstNames = ["Aarav", "Meera", "Rohan", "Isha", "Vikram", "Priya", "Kabir", "Ananya", "Dev", "Sara", "Arjun", "Zoya", "Manav", "Riya", "Neel", "Tara"];
const lastNames = ["Sharma", "Patel", "Iyer", "Khan", "Reddy", "Menon", "Gupta", "Nair", "Bose", "Kapoor"];
const statuses: CustomerStatus[] = ["New", "Active", "VIP", "Inactive", "Lost"];
const tiers: LoyaltyTier[] = ["Silver", "Gold", "Platinum", "VIP"];

export const customers: Customer[] = Array.from({ length: 24 }, (_, i) => {
  const name = `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`;
  const status = statuses[i % statuses.length];
  const tier = tiers[i % tiers.length];
  const visits = 3 + (i % 18);
  const spend = 1500 + i * 480 + (i % 5) * 900;
  return {
    id: `c${i + 1}`,
    name,
    phone: `+91 9${(800000000 + i * 12345).toString().slice(0, 9)}`,
    email: `${name.toLowerCase().replace(" ", ".")}@mail.com`,
    birthday: `${(i % 28) + 1} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i % 12]}`,
    anniversary: `${(i % 27) + 1} ${["Feb","Apr","Jun","Aug","Oct","Dec"][i % 6]}`,
    lastVisit: `${(i % 60) + 1} days ago`,
    totalSpend: spend,
    visits,
    status,
    tier,
    points: visits * 45,
    notes: i % 3 === 0 ? "Prefers window seat. Loves paneer tikka." : "",
    history: Array.from({ length: 4 }, (_, j) => ({
      date: `${j * 12 + 3} ${["Jan","Feb","Mar","Apr"][j]}`,
      item: ["Dinner for 2", "Lunch combo", "Weekend brunch", "Family dinner"][j],
      amount: 800 + j * 320 + i * 20,
    })),
  };
});

export const campaigns = [
  {
    id: "cam1",
    name: "30-day Inactive Winback",
    trigger: "Inactive 30 days",
    offer: "20% off next visit",
    matched: 45,
    status: "Active" as const,
    sent: 320, opened: 214, redeemed: 82, returned: 58,
  },
  {
    id: "cam2",
    name: "60-day Reactivation",
    trigger: "Inactive 60 days",
    offer: "Free dessert combo",
    matched: 27,
    status: "Active" as const,
    sent: 190, opened: 108, redeemed: 41, returned: 29,
  },
  {
    id: "cam3",
    name: "90-day Last Chance",
    trigger: "Inactive 90 days",
    offer: "₹300 cashback",
    matched: 14,
    status: "Paused" as const,
    sent: 84, opened: 39, redeemed: 12, returned: 8,
  },
  {
    id: "cam4",
    name: "Birthday Delight",
    trigger: "Birthday this week",
    offer: "Complimentary dessert",
    matched: 12,
    status: "Active" as const,
    sent: 46, opened: 44, redeemed: 31, returned: 28,
  },
];

export const socialPosts = [
  { id: "p1", day: "Mon", time: "10:00", channel: "Instagram", caption: "Weekend brunch is back — pillowy pancakes & bottomless chai ☕", status: "Scheduled" },
  { id: "p2", day: "Tue", time: "18:30", channel: "Facebook", caption: "Tuesday Tandoor Nights — 20% off starters after 7pm.", status: "Scheduled" },
  { id: "p3", day: "Wed", time: "12:00", channel: "Instagram", caption: "Meet Chef Rohan — the mind behind our monsoon menu.", status: "Draft" },
  { id: "p4", day: "Thu", time: "19:00", channel: "Instagram", caption: "Diwali Feast preview — book your table now.", status: "Scheduled" },
  { id: "p5", day: "Fri", time: "13:00", channel: "Facebook", caption: "Family lunch combo — feeds 4 at ₹899.", status: "Scheduled" },
  { id: "p6", day: "Sat", time: "20:00", channel: "Instagram", caption: "Weekend vibes with live acoustic sets 🎸", status: "Scheduled" },
  { id: "p7", day: "Sun", time: "11:00", channel: "Instagram", caption: "Sunday brunch — bring the family, we'll bring the mimosas.", status: "Draft" },
];

export const loyaltyTiers = [
  { tier: "Silver", visits: 3, reward: "5% off every visit", members: 612, color: "bg-slate-200 text-slate-700" },
  { tier: "Gold", visits: 8, reward: "10% off + free dessert", members: 384, color: "bg-amber-100 text-amber-800" },
  { tier: "Platinum", visits: 15, reward: "15% off + priority seating", members: 156, color: "bg-zinc-200 text-zinc-800" },
  { tier: "VIP", visits: 25, reward: "20% off + chef's tasting invite", members: 52, color: "bg-primary/10 text-primary" },
];

export const offers = [
  { id: "o1", name: "Weekend 20% off", type: "Flat Discount", redemptions: 214, status: "Active" },
  { id: "o2", name: "Buy 1 Pizza Get 1", type: "BOGO", redemptions: 98, status: "Active" },
  { id: "o3", name: "₹200 Cashback on ₹1000", type: "Cashback", redemptions: 141, status: "Active" },
  { id: "o4", name: "Family Combo ₹899", type: "Combo", redemptions: 76, status: "Paused" },
];

export const reviewRequests = [
  { id: "r1", customer: "Aarav Sharma", sent: "2 days ago", status: "Posted" },
  { id: "r2", customer: "Meera Patel", sent: "3 days ago", status: "Clicked" },
  { id: "r3", customer: "Rohan Iyer", sent: "4 days ago", status: "Opened" },
  { id: "r4", customer: "Isha Khan", sent: "5 days ago", status: "Posted" },
  { id: "r5", customer: "Vikram Reddy", sent: "6 days ago", status: "Opened" },
  { id: "r6", customer: "Priya Menon", sent: "1 week ago", status: "Posted" },
];

export const ratingTrend = Array.from({ length: 12 }, (_, i) => ({
  month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
  rating: 4.1 + Math.min(0.5, i * 0.05) + (i % 3 === 0 ? 0.05 : 0),
  reviews: 8 + i * 3,
}));

export const staff = [
  { id: "st1", name: "Ravi Kumar", role: "Owner", phone: "+91 98200 11111" },
  { id: "st2", name: "Neha Sharma", role: "Manager", phone: "+91 98200 22222" },
  { id: "st3", name: "Amit Verma", role: "Employee", phone: "+91 98200 33333" },
  { id: "st4", name: "Sonia Rao", role: "Employee", phone: "+91 98200 44444" },
];

export const bills = Array.from({ length: 10 }, (_, i) => ({
  id: `b${i + 1}`,
  customer: customers[i % customers.length].name,
  amount: 640 + i * 210,
  date: `${(i % 28) + 1} Oct 2025`,
}));

export const bookings = [
  { day: "Mon", time: "11:00", customer: "Meera Patel", service: "Table for 4" },
  { day: "Mon", time: "19:30", customer: "Aarav Sharma", service: "Anniversary — Table for 2" },
  { day: "Tue", time: "13:00", customer: "Rohan Iyer", service: "Business lunch — 6" },
  { day: "Wed", time: "20:00", customer: "Isha Khan", service: "Table for 2" },
  { day: "Thu", time: "18:00", customer: "Kabir Bose", service: "Birthday — 10" },
  { day: "Fri", time: "20:30", customer: "Ananya Nair", service: "Table for 4" },
  { day: "Sat", time: "12:30", customer: "Dev Kapoor", service: "Family brunch — 6" },
  { day: "Sat", time: "21:00", customer: "Sara Sharma", service: "Table for 2" },
  { day: "Sun", time: "13:00", customer: "Arjun Patel", service: "Sunday brunch — 8" },
];

export const plans = [
  {
    name: "Starter",
    price: "₹999",
    features: [
      "Up to 500 customers",
      "Basic retention campaigns",
      "1 social channel",
      "Google review requests",
      "Email support",
    ],
    current: false,
  },
  {
    name: "Growth",
    price: "₹2,499",
    features: [
      "Unlimited customers",
      "AI-powered campaigns & offers",
      "All social channels + auto-post",
      "Loyalty program (all tiers)",
      "Advanced reports & AI suggestions",
      "Priority WhatsApp support",
    ],
    current: true,
  },
];
