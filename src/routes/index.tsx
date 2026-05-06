import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { BloodDrop } from "@/components/BloodDrop";
import { donors, emergencyRequests, isEligible, PROXIMITY_KM } from "@/lib/mock-data";
import { Bell, MapPin, Siren, ShieldCheck, Clock, ArrowRight, Activity } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Rakta-Seva Connect — Emergency Blood Donor Network" },
      { name: "description", content: "A life-saving bridge connecting hospitals to nearby voluntary blood donors in real time." },
    ],
  }),
});

function Index() {
  const nearby = donors.filter((d) => d.distanceKm <= PROXIMITY_KM && isEligible(d)).length;
  const live = emergencyRequests[0];

  return (
    <Layout>
      {/* Hero */}
      <section
        className="relative px-5 pt-8 pb-10 text-primary-foreground"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] opacity-80">Rakta-Seva</p>
            <h1 className="text-2xl font-black -mt-0.5">Connect</h1>
          </div>
          <button className="relative h-10 w-10 rounded-full bg-primary-foreground/15 backdrop-blur flex items-center justify-center">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-warning animate-blink" />
          </button>
        </div>

        <p className="text-sm opacity-90">Hello, Rohan 👋</p>
        <h2 className="text-3xl font-extrabold leading-tight mt-1">
          Be someone's <br />
          <span className="text-warning">Golden Hour.</span>
        </h2>

        <div className="mt-6 grid grid-cols-3 gap-2">
          <Stat label="Nearby Donors" value={String(nearby)} />
          <Stat label="Live Alerts" value={String(emergencyRequests.length)} />
          <Stat label="Lives Saved" value="142" />
        </div>
      </section>

      {/* Live emergency banner */}
      <section className="px-5 -mt-6 relative z-10">
        <Link
          to="/request"
          className="block bg-card rounded-2xl p-4 shadow-[var(--shadow-card)] border-2 border-primary/30"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="h-2 w-2 rounded-full bg-emergency animate-blink" />
            <span className="text-[10px] font-black uppercase tracking-wider text-primary">
              Live Emergency · {live.postedMinutesAgo}m ago
            </span>
          </div>
          <div className="flex items-center gap-3">
            <BloodDrop group={live.bloodGroup} />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">{live.hospital}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {live.distanceKm} km · {live.units} units
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-primary" />
          </div>
        </Link>
      </section>

      {/* Quick actions */}
      <section className="px-5 mt-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/request"
            className="rounded-2xl p-4 text-primary-foreground relative overflow-hidden"
            style={{ background: "var(--gradient-emergency)", boxShadow: "var(--shadow-emergency)" }}
          >
            <Siren className="h-6 w-6 mb-8" />
            <p className="font-bold text-sm">Raise SOS</p>
            <p className="text-[11px] opacity-80">Push alert in &lt;5s</p>
            <div className="absolute -right-4 -bottom-4 h-20 w-20 rounded-full bg-primary-foreground/10" />
          </Link>
          <Link to="/donors" className="rounded-2xl p-4 bg-card border border-border">
            <Activity className="h-6 w-6 mb-8 text-primary" />
            <p className="font-bold text-sm">Find Donors</p>
            <p className="text-[11px] text-muted-foreground">Within {PROXIMITY_KM} km</p>
          </Link>
        </div>
      </section>

      {/* Trust */}
      <section className="px-5 mt-6 mb-8">
        <div className="rounded-2xl bg-accent p-4 flex gap-3">
          <ShieldCheck className="h-5 w-5 text-accent-foreground shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-xs text-accent-foreground">Privacy first</p>
            <p className="text-[11px] text-accent-foreground/80 mt-0.5">
              Your number stays hidden until you accept a request. Auto-paused for 90 days after each donation.
            </p>
          </div>
        </div>
      </section>

      {/* Recent activity */}
      <section className="px-5 pb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Recent Requests</h3>
        <div className="space-y-2">
          {emergencyRequests.slice(0, 3).map((r) => (
            <div key={r.id} className="bg-card rounded-xl p-3 border border-border flex items-center gap-3">
              <BloodDrop group={r.bloodGroup} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{r.hospital}</p>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {r.postedMinutesAgo}m · {r.area}
                </p>
              </div>
              <UrgencyChip urgency={r.urgency} />
            </div>
          ))}
        </div>
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
    urgency === "Critical"
      ? "bg-emergency text-emergency-foreground"
      : urgency === "High"
      ? "bg-warning text-warning-foreground"
      : "bg-secondary text-secondary-foreground";
  return <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${cls}`}>{urgency}</span>;
}
