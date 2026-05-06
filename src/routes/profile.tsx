import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { BloodDrop } from "@/components/BloodDrop";
import { ArrowLeft, Award, Calendar, MapPin, Settings, ShieldCheck, Heart, ChevronRight } from "lucide-react";
import { COOLDOWN_DAYS } from "@/lib/mock-data";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "My Profile · Rakta-Seva Connect" }] }),
});

function ProfilePage() {
  const nav = useNavigate();
  const [available, setAvailable] = useState(true);
  const lastDonation = 132; // days ago

  return (
    <Layout>
      <header className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => nav({ to: "/" })} className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-xl font-black flex-1">My Profile</h1>
        <button className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
          <Settings className="h-4 w-4" />
        </button>
      </header>

      {/* Hero card */}
      <section className="px-5">
        <div
          className="rounded-3xl p-5 text-primary-foreground relative overflow-hidden"
          style={{ background: "var(--gradient-hero)" }}
        >
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary-foreground/20 backdrop-blur flex items-center justify-center text-2xl font-black">
              R
            </div>
            <div className="flex-1">
              <p className="font-black text-lg">Rohan Desai</p>
              <p className="text-xs opacity-80 flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Kasba Bawada, Kolhapur
              </p>
            </div>
            <BloodDrop group="A+" size="sm" />
          </div>

          <div className="grid grid-cols-3 gap-2 mt-5">
            <Stat label="Donations" value="9" />
            <Stat label="Lives Saved" value="27" />
            <Stat label="Rank" value="Gold" />
          </div>
        </div>
      </section>

      {/* Availability toggle */}
      <section className="px-5 mt-5">
        <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3">
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${available ? "bg-success/15" : "bg-muted"}`}>
            <Heart className={`h-5 w-5 ${available ? "text-success" : "text-muted-foreground"}`} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm">{available ? "Available to Donate" : "Unavailable"}</p>
            <p className="text-[11px] text-muted-foreground">Toggle off after donating</p>
          </div>
          <button
            onClick={() => setAvailable(!available)}
            className={`relative h-7 w-12 rounded-full transition-colors ${available ? "bg-success" : "bg-muted"}`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-card transition-transform ${
                available ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </section>

      {/* Cooldown progress */}
      <section className="px-5 mt-4">
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Donation Cooldown</p>
            <span className="text-[10px] font-bold text-success">Eligible ✓</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-primary">{lastDonation}</span>
            <span className="text-xs text-muted-foreground">days since last donation</span>
          </div>
          <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, (lastDonation / COOLDOWN_DAYS) * 100)}%`,
                background: "var(--gradient-emergency)",
              }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
            <Calendar className="h-3 w-3" /> Last donated · 24 Dec 2025
          </p>
        </div>
      </section>

      {/* Achievements */}
      <section className="px-5 mt-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Badges</h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Hero", color: "bg-emergency/15 text-emergency" },
            { label: "5+ Saves", color: "bg-success/15 text-success" },
            { label: "Verified", color: "bg-warning/15 text-warning-foreground" },
          ].map((b) => (
            <div key={b.label} className={`rounded-xl p-3 text-center ${b.color}`}>
              <Award className="h-5 w-5 mx-auto" />
              <p className="text-[11px] font-bold mt-1">{b.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Settings list */}
      <section className="px-5 mt-5 pb-6">
        <div className="bg-card rounded-2xl border border-border divide-y divide-border">
          {["Privacy & Visibility", "Notification Preferences", "Verified ID", "Help & Support"].map((item, i) => (
            <button key={item} className="w-full flex items-center gap-3 p-4 text-left">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium flex-1">{item}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </section>
    </Layout>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-primary-foreground/15 backdrop-blur rounded-xl p-2.5 text-center">
      <p className="text-xl font-black">{value}</p>
      <p className="text-[10px] opacity-80">{label}</p>
    </div>
  );
}
