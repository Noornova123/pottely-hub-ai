import { Check } from "lucide-react";
import { useData, countMatching } from "@/lib/app-store";

export const SPECIAL_AUDIENCES = ["All customers", "New / Uncategorized customers"] as const;

export function useAudienceOptions() {
  const { segments, customers } = useData();
  const options = [
    ...SPECIAL_AUDIENCES.map((name) => ({ name, count: name === "All customers" ? customers.length : Math.max(1, Math.round(customers.length * 0.18)) })),
    ...segments.map((s) => ({ name: s.name, count: countMatching(customers, s) })),
  ];
  return options;
}

export function AudiencePicker({
  value,
  onChange,
  label = "Send to",
}: {
  value: string[];
  onChange: (next: string[]) => void;
  label?: string;
}) {
  const options = useAudienceOptions();
  const toggle = (name: string) => {
    onChange(value.includes(name) ? value.filter((v) => v !== name) : [...value, name]);
  };
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5">{label} <span className="text-destructive">*</span></label>
      <div className="grid gap-1.5 max-h-44 overflow-auto rounded-lg border border-input bg-background p-2">
        {options.map((o) => {
          const active = value.includes(o.name);
          return (
            <button
              type="button"
              key={o.name}
              onClick={() => toggle(o.name)}
              className={`flex items-center justify-between px-2 py-1.5 rounded-md text-xs text-left ${active ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted"}`}
            >
              <span className="flex items-center gap-2">
                <span className={`h-4 w-4 rounded border flex items-center justify-center ${active ? "bg-primary border-primary text-primary-foreground" : "border-border"}`}>
                  {active && <Check className="h-3 w-3" />}
                </span>
                {o.name}
              </span>
              <span className="text-muted-foreground text-[10px]">{o.count} customers</span>
            </button>
          );
        })}
      </div>
      {value.length > 0 && (
        <div className="mt-1.5 text-[11px] text-muted-foreground">
          Selected: <span className="font-medium text-foreground">{value.join(", ")}</span>
        </div>
      )}
    </div>
  );
}
