import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { BloodDrop } from "@/components/BloodDrop";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Bell, MapPin, Siren, ShieldCheck, Clock, ArrowRight, Activity, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Rakta-Seva Connect — Emergency Blood Donor Network" },
      { name: "description", content: "Real-time blood donor alerts. Be someone's Golden Hour." },
    ],
  }),
});

interface Req {
  id: string; hospital: string; blood_group: string; units: number;
  urgency: string; area: string | null; created_at: string; requester_id: string;
}

function Index() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [requests, setRequests] = useState<Req[]>([]);
  const [donorCount, setDonorCount] = useState(0);
  const [profile, setProfile] = useState<{ name: string; blood_group: string | null } | null>(null);

  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth" });
  }, [user, loading, nav]);

  useEffect(() => {
    if (!user) return;
    void load();
    const ch = supabase
      .channel("rt-requests")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "emergency_requests" }, (payload) => {
        const r = payload.new as Req;
        setRequests((cur) => [r, ...cur]);
        if (r.requester_id !== user.id) {
          toast.error(`🚨 ${r.urgency} alert: ${r.blood_group} needed at ${r.hospital}`, { duration: 8000 });
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  const load = async () => {
    const [{ data: reqs }, { count }, { data: prof }] = await Promise.all([
      supabase.from("emergency_requests").select("*").eq("status", "open").order("created_at", { ascending: false }).limit(10),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("available", true),
      supabase.from("profiles").select("name, blood_group").eq("id", user!.id).maybeSingle(),
    ]);
    setRequests((reqs as Req[]) || []);
    setDonorCount(count || 0);
    setProfile(prof);
  };

  if (loading || !user) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[80vh]">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const live = requests[0];

  return (
    <Layout>
      <section className="relative px-5 pt-8 pb-10 text-primary-foreground" style={{ background: "var(--gradient-hero)" }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] opacity-80">Rakta-Seva</p>
            <h1 className="text-2xl font-black -mt-0.5">Connect</h1>
          </div>
          <button className="relative h-10 w-10 rounded-full bg-primary-foreground/15 backdrop-blur flex items-center justify-center">
            <Bell className="h-5 w-5" />
            {requests.length > 0 && <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-warning animate-blink" />}
          </button>
        </div>

        <p className="text-sm opacity-90">Hello, {profile?.name?.split(" ")[0] || "Friend"} 👋</p>
        <h2 className="text-3xl font-extrabold leading-tight mt-1">
          Be someone's <br />
          <span className="text-warning">Golden Hour.</span>
        </h2>

        <div className="mt-6 grid grid-cols-3 gap-2">
          <Stat label="Available Donors" value={String(donorCount)} />
          <Stat label="Live Alerts" value={String(requests.length)} />
          <Stat label="Your Group" value={profile?.blood_group || "—"} />
        </div>
      </section>

      {live && (
        <section className="px-5 -mt-6 relative z-10">
          <div className="block bg-card rounded-2xl p-4 shadow-[var(--shadow-card)] border-2 border-primary/30">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-2 w-2 rounded-full bg-emergency animate-blink" />
              <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                Live Emergency · {timeAgo(live.created_at)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <BloodDrop group={live.blood_group} />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{live.hospital}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {live.area || "Nearby"} · {live.units} units
                </p>
              </div>
              <Link to="/alert/$id" params={{ id: live.id }}><ArrowRight className="h-5 w-5 text-primary" /></Link>
            </div>
          </div>
        </section>
      )}

      <section className="px-5 mt-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/request" className="rounded-2xl p-4 text-primary-foreground relative overflow-hidden"
            style={{ background: "var(--gradient-emergency)", boxShadow: "var(--shadow-emergency)" }}>
            <Siren className="h-6 w-6 mb-8" />
            <p className="font-bold text-sm">Raise SOS</p>
            <p className="text-[11px] opacity-80">Push alert in &lt;5s</p>
          </Link>
          <Link to="/donors" className="rounded-2xl p-4 bg-card border border-border">
            <Activity className="h-6 w-6 mb-8 text-primary" />
            <p className="font-bold text-sm">Find Donors</p>
            <p className="text-[11px] text-muted-foreground">Within 10 km</p>
          </Link>
        </div>
      </section>

      <section className="px-5 mt-6 mb-2">
        <div className="rounded-2xl bg-accent p-4 flex gap-3">
          <ShieldCheck className="h-5 w-5 text-accent-foreground shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-xs text-accent-foreground">Privacy first</p>
            <p className="text-[11px] text-accent-foreground/80 mt-0.5">
              Your phone stays hidden until you accept a request. Auto-paused for 90 days after each donation.
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 mt-6 pb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Active Requests</h3>
        {requests.length === 0 ? (
          <p className="text-sm text-muted-foreground bg-card rounded-xl p-4 border border-border">
            No active emergencies right now. Stay ready 🙏
          </p>
        ) : (
          <div className="space-y-2">
            {requests.slice(0, 5).map((r) => (
              <Link key={r.id} to="/alert/$id" params={{ id: r.id }}
                className="bg-card rounded-xl p-3 border border-border flex items-center gap-3">
                <BloodDrop group={r.blood_group} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{r.hospital}</p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {timeAgo(r.created_at)} · {r.area || "—"}
                  </p>
                </div>
                <UrgencyChip urgency={r.urgency} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-primary-foreground/15 backdrop-blur rounded-xl p-2.5">
      <p className="text-xl font-black">{value}</p>
      <p className="text-[10px] opacity-80 leading-tight">{label}</p>
    </div>
  );
}

function UrgencyChip({ urgency }: { urgency: string }) {
  const cls =
    urgency === "Critical" ? "bg-emergency text-emergency-foreground"
    : urgency === "High" ? "bg-warning text-warning-foreground"
    : "bg-secondary text-secondary-foreground";
  return <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${cls}`}>{urgency}</span>;
}

function timeAgo(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
