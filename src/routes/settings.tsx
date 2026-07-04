import { createFileRoute } from "@tanstack/react-router";
import { Check, Upload } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardBody, Badge } from "@/components/ui-kit";
import { plans, business } from "@/lib/mock-data";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AppShell title="Settings & Plans">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Business profile" description="Update your business details" />
          <CardBody className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary text-primary-foreground text-2xl font-black">
                {business.name.charAt(0)}
              </div>
              <button className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-border text-xs font-semibold">
                <Upload className="h-3.5 w-3.5" /> Upload logo
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Business name" value={business.name} />
              <div>
                <label className="block text-xs font-medium mb-1.5">Category</label>
                <select defaultValue={business.category} className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
                  {["Restaurant", "Salon", "Clinic", "Gym", "Retail", "Other"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <Field label="Phone" value="+91 98200 11111" />
              <Field label="Email" value="hello@spiceroute.com" />
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1.5">Address</label>
                <textarea rows={2} defaultValue="12, MG Road, Bengaluru, KA 560001" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
              </div>
            </div>
            <button className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold">Save changes</button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Account" />
          <CardBody className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Owner</span>
              <span className="font-semibold">Ravi Kumar</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Team members</span>
              <span className="font-semibold">4</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Timezone</span>
              <span className="font-semibold">Asia / Kolkata</span>
            </div>
            <button className="w-full mt-3 h-10 rounded-lg border border-border text-sm font-semibold">Sign out</button>
          </CardBody>
        </Card>
      </div>

      <div className="mt-8">
        <div className="mb-4">
          <h2 className="font-bold text-lg">Subscription plan</h2>
          <p className="text-sm text-muted-foreground">Choose the plan that fits your growth stage.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {plans.map((p) => (
            <Card key={p.name} className={`p-6 ${p.current ? "ring-2 ring-primary" : ""}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">{p.name}</h3>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{p.price}</span>
                    <span className="text-sm text-muted-foreground">/month</span>
                  </div>
                </div>
                {p.current && <Badge tone="success">Current Plan</Badge>}
              </div>
              <ul className="mt-5 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`mt-6 w-full h-10 rounded-lg text-sm font-semibold ${
                  p.current ? "border border-border" : "bg-gold text-gold-foreground"
                }`}
                disabled={p.current}
              >
                {p.current ? "Current plan" : "Upgrade"}
              </button>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5">{label}</label>
      <input defaultValue={value} className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm" />
    </div>
  );
}
