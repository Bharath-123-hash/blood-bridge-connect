import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { BloodDrop } from "@/components/BloodDrop";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { bloodGroups, BloodGroup, COOLDOWN_DAYS, daysSince } from "@/lib/blood";
import { ArrowLeft, Heart, LogOut, Loader2, Save, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/lib/theme-context";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "My Profile · Rakta-Seva Connect" }] }),
});

function ProfilePage() {
  const nav = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", blood_group: "" as BloodGroup | "",
    phone: "", area: "", last_donation_date: "", available: true, donation_count: 0,
    age: "" as string, gender: "" as "" | "Male" | "Female" | "Other",
    notify_push: true, notify_sms: false,
  });

  useEffect(() => { if (!authLoading && !user) nav({ to: "/auth" }); }, [user, authLoading, nav]);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (data) {
        setForm({
          name: data.name || "",
          blood_group: (data.blood_group as BloodGroup) || "",
          phone: data.phone || "",
          area: data.area || "",
          last_donation_date: data.last_donation_date || "",
          available: data.available,
          donation_count: data.donation_count,
          age: (data as any).age != null ? String((data as any).age) : "",
          gender: ((data as any).gender as "Male" | "Female" | "Other") || "",
          notify_push: (data as any).notify_push ?? true,
          notify_sms: (data as any).notify_sms ?? false,
        });
      }
      setLoading(false);
    })();
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      name: form.name,
      blood_group: form.blood_group || null,
      phone: form.phone || null,
      area: form.area || null,
      last_donation_date: form.last_donation_date || null,
      available: form.available,
      donation_count: form.donation_count,
      age: form.age ? parseInt(form.age, 10) : null,
      gender: form.gender || null,
      notify_push: form.notify_push,
      notify_sms: form.notify_sms,
    } as any).eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile saved!");
  };

  const cooldown = daysSince(form.last_donation_date);
  const eligible = cooldown >= COOLDOWN_DAYS;

  if (loading || !user) {
    return <Layout><div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div></Layout>;
  }

  return (
    <Layout>
      <header className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => nav({ to: "/" })} className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-xl font-black flex-1">My Profile</h1>
        <button onClick={async () => { await signOut(); nav({ to: "/auth" }); }}
          className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
          <LogOut className="h-4 w-4" />
        </button>
      </header>

      <section className="px-5">
        <div className="rounded-3xl p-5 text-primary-foreground relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary-foreground/20 backdrop-blur flex items-center justify-center text-2xl font-black">
              {(form.name[0] || "U").toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-lg truncate">{form.name || "Set your name"}</p>
              <p className="text-xs opacity-80 truncate">{user.email}</p>
            </div>
            {form.blood_group && <BloodDrop group={form.blood_group} size="sm" />}
          </div>

          <div className="grid grid-cols-3 gap-2 mt-5">
            <Stat label="Donations" value={String(form.donation_count)} />
            <Stat label="Lives Saved" value={String(form.donation_count * 3)} />
            <Stat label="Status" value={eligible ? "Ready" : `${COOLDOWN_DAYS - cooldown}d`} />
          </div>
        </div>
      </section>

      <section className="px-5 mt-5">
        <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3">
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${form.available ? "bg-success/15" : "bg-muted"}`}>
            <Heart className={`h-5 w-5 ${form.available ? "text-success" : "text-muted-foreground"}`} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm">{form.available ? "Available to Donate" : "Unavailable"}</p>
            <p className="text-[11px] text-muted-foreground">Toggle off after donating</p>
          </div>
          <button onClick={() => setForm((f) => ({ ...f, available: !f.available }))}
            className={`relative h-7 w-12 rounded-full transition-colors ${form.available ? "bg-success" : "bg-muted"}`}>
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-card transition-transform ${form.available ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>
      </section>

      <section className="px-5 mt-5 space-y-4">
        <Field label="Full Name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Blood Group</label>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {bloodGroups.map((g) => (
              <button key={g} onClick={() => setForm((f) => ({ ...f, blood_group: g }))}
                className={`py-2.5 rounded-xl font-black text-xs transition-all ${
                  form.blood_group === g ? "bg-primary text-primary-foreground" : "bg-card border border-border"
                }`}>{g}</button>
            ))}
          </div>
        </div>
        <Field label="Phone (hidden until you accept)" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} placeholder="+91 9XXXXXXXXX" />
        <Field label="Area / Locality" value={form.area} onChange={(v) => setForm((f) => ({ ...f, area: v }))} placeholder="e.g. Kasba Bawada" />
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Last Donation Date</label>
          <input type="date" value={form.last_donation_date} onChange={(e) => setForm((f) => ({ ...f, last_donation_date: e.target.value }))}
            className="w-full mt-2 px-4 py-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Age</label>
            <input type="number" min={18} max={65} value={form.age} onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
              placeholder="18 - 65"
              className="w-full mt-2 px-4 py-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Gender</label>
            <div className="grid grid-cols-3 gap-1.5 mt-2">
              {(["Male", "Female", "Other"] as const).map((g) => (
                <button key={g} type="button" onClick={() => setForm((f) => ({ ...f, gender: g }))}
                  className={`py-2.5 rounded-xl font-bold text-[11px] transition-all ${
                    form.gender === g ? "bg-primary text-primary-foreground" : "bg-card border border-border"
                  }`}>{g[0]}</button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Notifications</label>
          <div className="mt-2 bg-card rounded-2xl border border-border divide-y divide-border">
            <ToggleRow label="Push alerts" desc="Real-time SOS in &lt;5s"
              value={form.notify_push} onChange={(v) => setForm((f) => ({ ...f, notify_push: v }))} />
            <ToggleRow label="SMS fallback" desc="If push fails"
              value={form.notify_sms} onChange={(v) => setForm((f) => ({ ...f, notify_sms: v }))} />
          </div>
        </div>

        <button onClick={save} disabled={saving}
          className="w-full py-4 rounded-2xl text-primary-foreground font-black flex items-center justify-center gap-2"
          style={{ background: "var(--gradient-emergency)", boxShadow: "var(--shadow-emergency)" }}>
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          Save Profile
        </button>
      </section>

      <div className="h-6" />
    </Layout>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full mt-2 px-4 py-3 rounded-xl bg-card border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary" />
    </div>
  );
}

function ToggleRow({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-3 p-3">
      <div className="flex-1">
        <p className="font-bold text-sm">{label}</p>
        <p className="text-[11px] text-muted-foreground" dangerouslySetInnerHTML={{ __html: desc }} />
      </div>
      <button onClick={() => onChange(!value)} type="button"
        className={`relative h-7 w-12 rounded-full transition-colors ${value ? "bg-success" : "bg-muted"}`}>
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-card transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} />
      </button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-primary-foreground/15 backdrop-blur rounded-xl p-2.5 text-center">
      <p className="text-lg font-black">{value}</p>
      <p className="text-[10px] opacity-80">{label}</p>
    </div>
  );
}
