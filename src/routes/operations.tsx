import { createFileRoute } from "@tanstack/react-router";
import { useState, Fragment } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, Badge } from "@/components/ui-kit";
import { bills, bookings } from "@/lib/mock-data";
import { useData } from "@/lib/app-store";

export const Route = createFileRoute("/operations")({
  component: OperationsPage,
});

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hours = ["09:00", "11:00", "13:00", "15:00", "17:00", "19:00", "21:00"];

function OperationsPage() {
  const { staffList, addStaff } = useData();
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("Employee");
  return (
    <AppShell title="Business Operations">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Staff & employees"
            action={
              <button onClick={() => setShow(true)} className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">
                <Plus className="h-3.5 w-3.5" /> Add Staff
              </button>
            }
          />
          <div className="divide-y divide-border">
            {staffList.map((s) => (
              <div key={s.id} className="p-4 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  {s.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{s.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{s.phone}</div>
                </div>
                <Badge tone={s.role === "Owner" ? "gold" : "muted"}>{s.role}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Billing log" description="Recent bills" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground bg-muted/40">
                <tr>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((b) => (
                  <tr key={b.id} className="border-t border-border">
                    <td className="px-5 py-3 font-medium">{b.customer}</td>
                    <td className="px-5 py-3 font-semibold">₹{b.amount.toLocaleString()}</td>
                    <td className="px-5 py-3 text-muted-foreground">{b.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="Appointments / Bookings" description="This week" />
        <div className="overflow-x-auto p-5">
          <div className="min-w-[720px] grid grid-cols-[80px_repeat(7,minmax(0,1fr))] gap-2">
            <div />
            {days.map((d) => (
              <div key={d} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center py-2">{d}</div>
            ))}
            {hours.map((h) => (
              <Fragment key={h}>
                <div className="text-xs text-muted-foreground py-2 pr-2 text-right">{h}</div>
                {days.map((d) => {
                  const b = bookings.find((x) => x.day === d && x.time === h);
                  return (
                    <div key={d + h} className="min-h-[52px] rounded-lg border border-dashed border-border bg-muted/20 p-1.5">
                      {b && (
                        <div className="rounded-md bg-primary/10 border border-primary/20 p-1.5 text-[10px]">
                          <div className="font-semibold text-primary truncate">{b.customer}</div>
                          <div className="text-muted-foreground truncate">{b.service}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>
      </Card>

      {show && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/40 p-4" onClick={() => setShow(false)}>
          <div className="bg-card rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Add Staff</h3>
              <button onClick={() => setShow(false)}><X className="h-5 w-5" /></button>
            </div>
            <form className="mt-4 space-y-3" onSubmit={(e) => { e.preventDefault(); setShow(false); }}>
              <Field label="Full name" />
              <Field label="Phone" />
              <div>
                <label className="block text-xs font-medium mb-1">Role</label>
                <select className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
                  <option>Owner</option><option>Manager</option><option>Employee</option>
                </select>
              </div>
              <button type="submit" className="w-full h-10 rounded-lg bg-primary text-primary-foreground font-semibold text-sm mt-2">Save</button>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Field({ label }: { label: string }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1">{label}</label>
      <input className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm" />
    </div>
  );
}
