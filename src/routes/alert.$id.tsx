import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { BloodDrop } from "@/components/BloodDrop";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Siren, MapPin, Clock, X, Check, Loader2, Phone, User } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/alert/$id")({
  component: AlertPage,
  head: () => ({ meta: [{ title: "Emergency Alert · Rakta-Seva Connect" }] }),
});

interface Req {
  id: string; hospital: string; blood_group: string; units: number;
  urgency: string; area: string | null; patient_info: string | null;
  contact_name: string | null; contact_phone: string | null;
  created_at: string; requester_id: string; status: string;
}

function AlertPage() {
  const { id } = useParams({ from: "/alert/$id" });
  const nav = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [req, setReq] = useState<Req | null>(null);
  const [response, setResponse] = useState<"accepted" | "declined" | null>(null);
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => { if (!authLoading && !user) nav({ to: "/auth" }); }, [user, authLoading, nav]);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase.from("emergency_requests").select("*").eq("id", id).maybeSingle();
      setReq(data as Req | null);
      if (user) {
        const { data: r } = await supabase.from("donor_responses")
          .select("status").eq("request_id", id).eq("donor_id", user.id).maybeSingle();
        if (r) setResponse(r.status as "accepted" | "declined");
      }
    })();
  }, [id, user]);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const respond = async (status: "accepted" | "declined") => {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("donor_responses").upsert({
      request_id: id, donor_id: user.id, status,
    }, { onConflict: "request_id,donor_id" });
    setBusy(false);
    if (error) return toast.error(error.message);
    setResponse(status);
    toast.success(status === "accepted" ? "🙏 Hospital notified!" : "Response recorded");
  };

  if (!req) {
    return <PhoneFrame><div className="flex items-center justify-center h-[80vh]"><Loader2 className="animate-spin text-primary" /></div></PhoneFrame>;
  }

  const isOwner = user?.id === req.requester_id;

  return (
    <PhoneFrame>
      <div className="min-h-full text-primary-foreground flex flex-col" style={{ background: "var(--gradient-hero)" }}>
        <div className="px-6 pt-12 pb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-warning animate-blink" />
            <span className="text-[10px] font-black uppercase tracking-widest">{req.urgency} Priority</span>
          </div>
          <span className="text-xs font-mono opacity-80">{String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}</span>
        </div>

        <div className="flex-1 px-6 flex flex-col items-center justify-center text-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full animate-pulse-ring" />
            <div className="h-28 w-28 rounded-full bg-primary-foreground/15 backdrop-blur flex items-center justify-center">
              <Siren className="h-12 w-12" />
            </div>
          </div>

          <p className="mt-8 text-xs uppercase tracking-[0.25em] opacity-80">Blood needed</p>
          <div className="mt-3"><BloodDrop group={req.blood_group} size="lg" /></div>

          <h1 className="mt-6 text-3xl font-black leading-tight">{req.hospital}</h1>
          <p className="mt-1 text-sm opacity-90">{req.units} unit{req.units > 1 ? "s" : ""}{req.patient_info ? ` · ${req.patient_info}` : ""}</p>

          <div className="mt-5 flex items-center gap-4 text-xs opacity-90">
            {req.area && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{req.area}</span>}
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {timeAgo(req.created_at)}</span>
          </div>

          {(response === "accepted" || isOwner) && (req.contact_name || req.contact_phone) && (
            <div className="mt-6 w-full bg-primary-foreground/15 backdrop-blur rounded-2xl p-4 text-left">
              <p className="text-[10px] uppercase tracking-wider opacity-70 font-bold">Hospital Contact</p>
              {req.contact_name && <p className="text-sm font-bold mt-1 flex items-center gap-2"><User className="h-3.5 w-3.5" />{req.contact_name}</p>}
              {req.contact_phone && (
                <a href={`tel:${req.contact_phone}`} className="text-sm font-bold mt-1 flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" />{req.contact_phone}
                </a>
              )}
            </div>
          )}

          {!isOwner && (
            <p className="mt-6 text-xs opacity-75 max-w-[260px]">
              Your contact stays private. Only shared with the hospital after you tap Accept.
            </p>
          )}
        </div>

        {isOwner ? (
          <div className="p-5">
            <button onClick={() => nav({ to: "/" })} className="w-full py-4 rounded-2xl bg-primary-foreground text-primary font-black">
              Back to Home
            </button>
          </div>
        ) : response === null ? (
          <div className="p-5 grid grid-cols-2 gap-3">
            <button onClick={() => respond("declined")} disabled={busy}
              className="py-4 rounded-2xl bg-primary-foreground/15 backdrop-blur font-bold flex items-center justify-center gap-2">
              <X className="h-5 w-5" /> Decline
            </button>
            <button onClick={() => respond("accepted")} disabled={busy}
              className="py-4 rounded-2xl bg-primary-foreground text-primary font-black flex items-center justify-center gap-2">
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />} Accept
            </button>
          </div>
        ) : (
          <div className="p-5">
            <div className="rounded-2xl bg-primary-foreground/15 backdrop-blur p-5 text-center">
              <p className="font-black text-lg">{response === "accepted" ? "🙏 Thank you, Hero!" : "Response recorded"}</p>
              <p className="text-xs opacity-80 mt-1">
                {response === "accepted" ? "Hospital notified. Contact has been shared securely." : "We've notified the next nearest donor."}
              </p>
              <button onClick={() => nav({ to: "/" })} className="mt-4 w-full py-3 rounded-xl bg-primary-foreground text-primary font-bold text-sm">
                Back to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </PhoneFrame>
  );
}

function timeAgo(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}
