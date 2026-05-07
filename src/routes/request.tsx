import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { bloodGroups, BloodGroup } from "@/lib/blood";
import { ArrowLeft, Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/request")({
  component: RequestPage,
  head: () => ({ meta: [{ title: "Raise Emergency · Rakta-Seva Connect" }] }),
});

function RequestPage() {
  const nav = useNavigate();
  const { user, loading } = useAuth();
  const [group, setGroup] = useState<BloodGroup>("O-");
  const [units, setUnits] = useState(1);
  const [hospital, setHospital] = useState("");
  const [area, setArea] = useState("");
  const [patient, setPatient] = useState("");
  const [urgency, setUrgency] = useState<"Critical" | "High" | "Moderate">("High");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (!loading && !user) nav({ to: "/auth" }); }, [user, loading, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    const { data, error } = await supabase.from("emergency_requests").insert({
      requester_id: user.id,
      hospital, blood_group: group, units, patient_info: patient || null,
      urgency, area: area || null, contact_name: contactName || null,
      contact_phone: contactPhone || null,
    }).select().single();
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("🚨 Alert broadcasted to nearby donors!");
    nav({ to: "/alert/$id", params: { id: data.id } });
  };

  if (!user) return <Layout><div className="p-6"><Loader2 className="animate-spin" /></div></Layout>;

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

      <form onSubmit={submit} className="px-5 pb-8 space-y-5">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Blood Group Needed</label>
          <div className="grid grid-cols-4 gap-2 mt-3">
            {bloodGroups.map((g) => (
              <button type="button" key={g} onClick={() => setGroup(g)}
                className={`py-3 rounded-xl font-black text-sm transition-all ${
                  group === g ? "bg-primary text-primary-foreground shadow-[var(--shadow-emergency)] scale-105"
                  : "bg-card border border-border text-foreground"
                }`}>{g}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Urgency</label>
          <div className="grid grid-cols-3 gap-2 mt-3">
            {(["Critical", "High", "Moderate"] as const).map((u) => (
              <button type="button" key={u} onClick={() => setUrgency(u)}
                className={`py-2.5 rounded-xl font-bold text-xs transition-all ${
                  urgency === u
                    ? u === "Critical" ? "bg-emergency text-emergency-foreground"
                    : u === "High" ? "bg-warning text-warning-foreground"
                    : "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-foreground"
                }`}>{u}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Units Required</label>
          <div className="flex items-center gap-3 mt-3 bg-card rounded-xl border border-border p-2">
            <button type="button" onClick={() => setUnits(Math.max(1, units - 1))} className="h-10 w-10 rounded-lg bg-secondary font-bold">−</button>
            <div className="flex-1 text-center">
              <span className="text-2xl font-black">{units}</span>
              <span className="text-xs text-muted-foreground ml-1">unit{units > 1 ? "s" : ""}</span>
            </div>
            <button type="button" onClick={() => setUnits(units + 1)} className="h-10 w-10 rounded-lg bg-primary text-primary-foreground font-bold">+</button>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Hospital</label>
          <div className="flex gap-2 overflow-x-auto -mx-5 px-5 mt-2 pb-1">
            {["CPR Hospital", "Aster Aadhar", "D.Y. Patil Hospital", "Apple Saraswati", "City Hospital"].map((h) => (
              <button key={h} type="button" onClick={() => setHospital(h)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                  hospital === h ? "bg-primary text-primary-foreground" : "bg-card border border-border"
                }`}>{h}</button>
            ))}
          </div>
          <input value={hospital} onChange={(e) => setHospital(e.target.value)} required placeholder="Or type hospital name"
            className="w-full mt-2 px-4 py-3 rounded-xl bg-card border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <Field label="Area / Locality" value={area} onChange={setArea} placeholder="e.g. Shivaji Peth, Kolhapur" />
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Patient Condition</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {["Trauma — RTA", "Surgery — Cardiac", "Postpartum Hemorrhage", "Thalassemia", "Cancer/Chemo", "Dengue"].map((p) => (
              <button key={p} type="button" onClick={() => setPatient(p)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                  patient === p ? "bg-primary text-primary-foreground" : "bg-card border border-border"
                }`}>{p}</button>
            ))}
          </div>
          <input value={patient} onChange={(e) => setPatient(e.target.value)} placeholder="Or type condition (optional)"
            className="w-full mt-2 px-4 py-3 rounded-xl bg-card border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <Field label="Contact Person" value={contactName} onChange={setContactName} placeholder="e.g. Dr. Kamble" />
        <Field label="Contact Phone" value={contactPhone} onChange={setContactPhone} placeholder="+91 9XXXXXXXXX" />

        <button type="submit" disabled={submitting || !hospital}
          className="w-full py-4 rounded-2xl text-primary-foreground font-black tracking-wide flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ background: "var(--gradient-emergency)", boxShadow: "var(--shadow-emergency)" }}>
          {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
          {submitting ? "Broadcasting..." : "Push Emergency Alert"}
        </button>
        <p className="text-[11px] text-center text-muted-foreground">
          Reaches all eligible {group} donors instantly via real-time push.
        </p>
      </form>
    </Layout>
  );
}

function Field({ label, value, onChange, required, placeholder }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} required={required} placeholder={placeholder}
        className="w-full mt-2 px-4 py-3 rounded-xl bg-card border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary" />
    </div>
  );
}
