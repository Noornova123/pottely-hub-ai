import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/app-store";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

const ADMIN_EMAIL = "noornova000@gmail.com";

type Profile = {
  id: string;
  email: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

function AdminPage() {
  const { user, loading } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [fetching, setFetching] = useState(true);

  const loadProfiles = async () => {
    setFetching(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Failed to load users");
    } else {
      setProfiles(data as Profile[]);
    }
    setFetching(false);
  };

  useEffect(() => {
    if (user?.email === ADMIN_EMAIL) {
      loadProfiles();
    }
  }, [user]);

  if (loading) return null;
  if (!user || user.email !== ADMIN_EMAIL) return <Navigate to="/" />;

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase.from("profiles").update({ status }).eq("id", id);
    if (error) {
      toast.error("Update failed");
    } else {
      toast.success(`User ${status}`);
      loadProfiles();
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin — User Approvals</h1>

      {fetching ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : profiles.length === 0 ? (
        <p className="text-sm text-muted-foreground">No users yet.</p>
      ) : (
        <div className="space-y-3">
          {profiles.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border bg-card"
            >
              <div>
                <div className="font-semibold text-sm">{p.email}</div>
                <div className="text-xs text-muted-foreground">
                  Status: <span className="font-medium">{p.status}</span> ·{" "}
                  {new Date(p.created_at).toLocaleString()}
                </div>
              </div>
              <div className="flex gap-2">
                {p.status !== "approved" && (
                  <button
                    onClick={() => updateStatus(p.id, "approved")}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:opacity-90"
                  >
                    Approve
                  </button>
                )}
                {p.status !== "rejected" && (
                  <button
                    onClick={() => updateStatus(p.id, "rejected")}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-600 text-white hover:opacity-90"
                  >
                    Reject
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
