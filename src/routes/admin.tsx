import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { useAuth } from "@/lib/auth-context";
import { useIsAdmin } from "@/lib/use-role";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ShieldCheck,
  Users,
  Siren,
  Droplet,
  CheckCircle2,
  Loader2,
  Search,
  Check,
  X,
  ArrowLeft,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { bloodGroups, type BloodGroup } from "@/lib/blood";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin · Rakta-Seva Connect" }] }),
});

type Profile = {
  id: string;
  name: string;
  blood_group: BloodGroup | null;
  area: string | null;
  available: boolean;
  donation_count: number;
  phone: string | null;
};

type Request = {
  id: string;
  hospital: string;
  blood_group: BloodGroup;
  units: number;
  urgency: string;
  area: string | null;
  status: string;
  created_at: string;
  contact_name: string | null;
  contact_phone: string | null;
};

function AdminPage() {
  const nav = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const [tab, setTab] = useState<"overview" | "requests" | "donors">("overview");

  useEffect(() => {
    if (!authLoading && !user) nav({ to: "/auth" });
  }, [authLoading, user, nav]);

  if (authLoading || roleLoading) {
    return (
      <PhoneFrame>
        <div className="min-h-full flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </PhoneFrame>
    );
  }

  if (!isAdmin) {
    return (
      <PhoneFrame>
        <div className="min-h-full flex flex-col items-center justify-center p-6 text-center gap-4">
          <ShieldCheck className="h-12 w-12 text-muted-foreground" />
          <h1 className="text-xl font-black">Admin access only</h1>
          <p className="text-sm text-muted-foreground max-w-xs">
            Your account doesn't have admin privileges. Ask an existing admin to grant you the role.
          </p>
          <Link to="/" className="text-primary font-bold text-sm">
            ← Back to home
          </Link>
        </div>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <div className="min-h-full flex flex-col bg-background">
        <header
          className="px-5 pt-12 pb-5 text-primary-foreground"
          style={{ background: "var(--gradient-hero)" }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => nav({ to: "/" })}
              className="h-9 w-9 rounded-full bg-primary-foreground/15 backdrop-blur flex items-center justify-center"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-2xl font-black leading-tight">Admin</h1>
              <p className="text-xs opacity-80">Manage donors, requests, and analytics</p>
            </div>
          </div>

          <div className="mt-5 flex bg-primary-foreground/15 backdrop-blur rounded-xl p-1">
            {(["overview", "requests", "donors"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                  tab === t ? "bg-card text-foreground" : "text-primary-foreground/80"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </header>

        <main className="flex-1 p-5">
          {tab === "overview" && <Overview />}
          {tab === "requests" && <RequestsTab />}
          {tab === "donors" && <DonorsTab />}
        </main>
      </div>
    </PhoneFrame>
  );
}

/* ---------- Overview ---------- */

function Overview() {
  const [stats, setStats] = useState({ donors: 0, active: 0, completed: 0, groups: 0 });
  const [groupData, setGroupData] = useState<{ group: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [donorsRes, requestsRes, responsesRes] = await Promise.all([
        supabase.from("profiles").select("blood_group"),
        supabase.from("emergency_requests").select("status"),
        supabase.from("donor_responses").select("status"),
      ]);

      const donors = donorsRes.data ?? [];
      const requests = requestsRes.data ?? [];
      const responses = responsesRes.data ?? [];

      const counts: Record<string, number> = {};
      bloodGroups.forEach((g) => (counts[g] = 0));
      donors.forEach((d) => {
        if (d.blood_group && counts[d.blood_group] !== undefined) counts[d.blood_group]++;
      });

      setStats({
        donors: donors.length,
        active: requests.filter((r) => r.status === "open" || r.status === "approved").length,
        completed: responses.filter((r) => r.status === "donated").length,
        groups: Object.values(counts).filter((n) => n > 0).length,
      });
      setGroupData(bloodGroups.map((g) => ({ group: g, count: counts[g] })));
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const cards = [
    { label: "Total Donors", value: stats.donors, Icon: Users, tint: "text-primary" },
    { label: "Active Requests", value: stats.active, Icon: Siren, tint: "text-emergency" },
    { label: "Completed Donations", value: stats.completed, Icon: CheckCircle2, tint: "text-green-600" },
    { label: "Blood Groups Live", value: stats.groups, Icon: Droplet, tint: "text-primary" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        {cards.map(({ label, value, Icon, tint }) => (
          <div
            key={label}
            className="rounded-2xl bg-card border border-border p-4 shadow-sm"
          >
            <Icon className={`h-5 w-5 ${tint}`} />
            <div className="mt-3 text-2xl font-black">{value}</div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-1">
              {label}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-card border border-border p-4 shadow-sm">
        <h2 className="text-sm font-black mb-3">Donors by blood group</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={groupData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="group" tick={{ fontSize: 11 }} stroke="currentColor" />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="currentColor" />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ---------- Requests ---------- */

function RequestsTab() {
  const [items, setItems] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("emergency_requests")
      .select("*")
      .order("created_at", { ascending: false });
    setItems((data as Request[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (q) {
        const hay = `${r.hospital} ${r.area ?? ""} ${r.blood_group} ${r.contact_name ?? ""}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [items, q, status]);

  const setStatusFor = async (id: string, next: string) => {
    const { error } = await supabase
      .from("emergency_requests")
      .update({ status: next })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Marked ${next}`);
    setItems((arr) => arr.map((r) => (r.id === id ? { ...r, status: next } : r)));
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search hospital, area, group…"
          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {["all", "open", "approved", "rejected", "fulfilled", "closed"].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize whitespace-nowrap ${
              status === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-10">No requests found.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="rounded-2xl bg-card border border-border p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-black">{r.blood_group}</span>
                    <span className="text-xs text-muted-foreground">× {r.units} units</span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        r.status === "open"
                          ? "bg-emergency/15 text-emergency"
                          : r.status === "approved"
                            ? "bg-primary/15 text-primary"
                            : r.status === "rejected"
                              ? "bg-muted text-muted-foreground"
                              : "bg-green-600/15 text-green-700"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <p className="text-sm font-bold mt-1 truncate">{r.hospital}</p>
                  {r.area && <p className="text-xs text-muted-foreground">{r.area}</p>}
                  {r.contact_name && (
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {r.contact_name} · {r.contact_phone}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setStatusFor(r.id, "approved")}
                  disabled={r.status === "approved"}
                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5" /> Approve
                </button>
                <button
                  onClick={() => setStatusFor(r.id, "rejected")}
                  disabled={r.status === "rejected"}
                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-secondary text-foreground text-xs font-bold disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Donors ---------- */

function DonorsTab() {
  const [items, setItems] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [group, setGroup] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("id,name,blood_group,area,available,donation_count,phone")
      .order("donation_count", { ascending: false });
    setItems((data as Profile[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((p) => {
      if (group !== "all" && p.blood_group !== group) return false;
      if (q) {
        const hay = `${p.name} ${p.area ?? ""} ${p.phone ?? ""}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [items, q, group]);

  const toggleAvailable = async (p: Profile) => {
    const next = !p.available;
    const { error } = await supabase
      .from("profiles")
      .update({ available: next })
      .eq("id", p.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(next ? "Marked available" : "Marked unavailable");
    setItems((arr) => arr.map((x) => (x.id === p.id ? { ...x, available: next } : x)));
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, area, phone…"
          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {["all", ...bloodGroups].map((g) => (
          <button
            key={g}
            onClick={() => setGroup(g)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
              group === g ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-10">No donors found.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl bg-card border border-border p-3 shadow-sm flex items-center gap-3"
            >
              <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary text-sm">
                {p.blood_group ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{p.name || "Unnamed"}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {p.area ?? "No area"} · {p.donation_count} donations
                </p>
              </div>
              <button
                onClick={() => toggleAvailable(p)}
                className={`text-[10px] font-bold px-2.5 py-1.5 rounded-full ${
                  p.available
                    ? "bg-green-600/15 text-green-700"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {p.available ? "Available" : "Unavailable"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
