import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { BloodDrop } from "@/components/BloodDrop";
import { bloodGroups, emergencyRequests, BloodGroup } from "@/lib/mock-data";
import { ArrowLeft, MapPin, Clock, Phone, Zap } from "lucide-react";

export const Route = createFileRoute("/request")({
  component: RequestPage,
  head: () => ({ meta: [{ title: "Emergency Requests · Rakta-Seva Connect" }] }),
});

function RequestPage() {
  const nav = useNavigate();
  const [group, setGroup] = useState<BloodGroup>("O-");
  const [units, setUnits] = useState(1);
  const [hospital, setHospital] = useState("");
  const [sent, setSent] = useState(false);

  const submit = () => {
    if (!hospital) return;
    setSent(true);
    setTimeout(() => nav({ to: "/alert" }), 900);
  };

  return (
    <Layout>
      <header className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => nav({ to: "/" })} className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-black">Raise Emergency</h1>
          <p className="text-xs text-muted-foreground">Push alert to nearby donors</p>
        </div>
      </header>

      <section className="px-5">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Blood Group Needed</label>
        <div className="grid grid-cols-4 gap-2 mt-3">
          {bloodGroups.map((g) => (
            <button
              key={g}
              onClick={() => setGroup(g)}
              className={`py-3 rounded-xl font-black text-sm transition-all ${
                group === g
                  ? "bg-primary text-primary-foreground shadow-[var(--shadow-emergency)] scale-105"
                  : "bg-card border border-border text-foreground"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </section>

      <section className="px-5 mt-6">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Units Required</label>
        <div className="flex items-center gap-3 mt-3 bg-card rounded-xl border border-border p-2">
          <button onClick={() => setUnits(Math.max(1, units - 1))} className="h-10 w-10 rounded-lg bg-secondary font-bold">−</button>
          <div className="flex-1 text-center">
            <span className="text-2xl font-black">{units}</span>
            <span className="text-xs text-muted-foreground ml-1">unit{units > 1 ? "s" : ""}</span>
          </div>
          <button onClick={() => setUnits(units + 1)} className="h-10 w-10 rounded-lg bg-primary text-primary-foreground font-bold">+</button>
        </div>
      </section>

      <section className="px-5 mt-6">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Hospital / Location</label>
        <input
          value={hospital}
          onChange={(e) => setHospital(e.target.value)}
          placeholder="e.g. CPR Hospital, Kolhapur"
          className="w-full mt-3 px-4 py-3 rounded-xl bg-card border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </section>

      <section className="px-5 mt-8">
        <button
          onClick={submit}
          disabled={!hospital || sent}
          className="w-full py-4 rounded-2xl text-primary-foreground font-black tracking-wide flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ background: "var(--gradient-emergency)", boxShadow: "var(--shadow-emergency)" }}
        >
          <Zap className="h-5 w-5" />
          {sent ? "Broadcasting..." : "Push Emergency Alert"}
        </button>
        <p className="text-[11px] text-center text-muted-foreground mt-3">
          Alert reaches all eligible O- donors within 10 km in &lt;5 seconds.
        </p>
      </section>

      <section className="px-5 mt-8 pb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Active Requests</h3>
        <div className="space-y-3">
          {emergencyRequests.map((r) => (
            <div key={r.id} className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-start gap-3">
                <BloodDrop group={r.bloodGroup} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-sm truncate">{r.hospital}</p>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        r.urgency === "Critical"
                          ? "bg-emergency text-emergency-foreground animate-blink"
                          : r.urgency === "High"
                          ? "bg-warning text-warning-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {r.urgency}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{r.patient} · {r.units} units</p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{r.distanceKm} km</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{r.postedMinutesAgo}m ago</span>
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{r.contact}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
