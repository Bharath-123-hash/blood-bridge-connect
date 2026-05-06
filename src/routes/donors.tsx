import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { BloodDrop } from "@/components/BloodDrop";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { bloodGroups, BloodGroup, daysSince, COOLDOWN_DAYS } from "@/lib/blood";
import { ArrowLeft, MapPin, Search, Filter, EyeOff, Phone, Loader2 } from "lucide-react";

export const Route = createFileRoute("/donors")({
  component: DonorsPage,
  head: () => ({ meta: [{ title: "Donors Nearby · Rakta-Seva Connect" }] }),
});

interface Donor {
  id: string; name: string; blood_group: BloodGroup | null; phone: string | null;
  area: string | null; last_donation_date: string | null; available: boolean; donation_count: number;
}

function DonorsPage() {
  const nav = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [filter, setFilter] = useState<BloodGroup | "All">("All");
  const [search, setSearch] = useState("");
  const [donors, setDonors] = useState<Donor[]>([]);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (!authLoading && !user) nav({ to: "/auth" }); }, [user, authLoading, nav]);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const { data } = await supabase.from("profiles").select("*").neq("id", user.id);
      setDonors((data as Donor[]) || []);
      setLoading(false);
    })();
  }, [user]);

  const filtered = donors
    .filter((d) => filter === "All" || d.blood_group === filter)
    .filter((d) => !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.area?.toLowerCase().includes(search.toLowerCase()));

  if (!user) return null;

  return (
    <Layout>
      <header className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => nav({ to: "/" })} className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-black">Donor Registry</h1>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {donors.length} registered donors
          </p>
        </div>
      </header>

      <section className="px-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by area or name"
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
      </section>

      <section className="px-5 mt-4">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="h-3 w-3 text-muted-foreground" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Blood Group</span>
        </div>
        <div className="flex gap-2 overflow-x-auto -mx-5 px-5 pb-2">
          {(["All", ...bloodGroups] as const).map((g) => (
            <button key={g} onClick={() => setFilter(g)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                filter === g ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground"
              }`}>{g}</button>
          ))}
        </div>
      </section>

      <section className="px-5 mt-4 pb-6 space-y-3">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-center text-muted-foreground py-10">No donors match your filters yet.</p>
        ) : filtered.map((d) => {
          const cooldown = daysSince(d.last_donation_date);
          const inCooldown = cooldown < COOLDOWN_DAYS;
          const hidden = inCooldown || !d.available;
          return (
            <div key={d.id} className={`bg-card rounded-2xl p-4 border border-border ${hidden ? "opacity-60" : ""}`}>
              <div className="flex items-start gap-3">
                {d.blood_group ? <BloodDrop group={d.blood_group} /> : (
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">?</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-sm truncate">{d.name || "Donor"}</p>
                    {hidden ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground flex items-center gap-1 shrink-0">
                        <EyeOff className="h-3 w-3" />
                        {inCooldown ? `Cooldown` : "Paused"}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-success text-success-foreground shrink-0">
                        Available
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {d.area || "Location not set"} · {d.donation_count} donations
                  </p>

                  {!hidden && d.phone && (
                    <button onClick={() => setRevealed((s) => ({ ...s, [d.id]: true }))} disabled={revealed[d.id]}
                      className="mt-3 w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 bg-primary text-primary-foreground disabled:bg-success">
                      <Phone className="h-3 w-3" />
                      {revealed[d.id] ? d.phone : "Reveal Contact"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <p className="text-[11px] text-center text-muted-foreground pt-2">
          Donors who donated within {COOLDOWN_DAYS} days are auto-hidden 🛡️
        </p>
      </section>
    </Layout>
  );
}
