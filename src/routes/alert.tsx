import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { BloodDrop } from "@/components/BloodDrop";
import { Siren, MapPin, Clock, X, Check } from "lucide-react";

export const Route = createFileRoute("/alert")({
  component: AlertPage,
  head: () => ({ meta: [{ title: "Incoming Emergency · Rakta-Seva Connect" }] }),
});

function AlertPage() {
  const nav = useNavigate();
  const [seconds, setSeconds] = useState(0);
  const [accepted, setAccepted] = useState<null | boolean>(null);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <PhoneFrame>
      <div
        className="min-h-full text-primary-foreground flex flex-col"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="px-6 pt-12 pb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-warning animate-blink" />
            <span className="text-[10px] font-black uppercase tracking-widest">High Priority Alert</span>
          </div>
          <span className="text-xs font-mono opacity-80">00:0{seconds}</span>
        </div>

        <div className="flex-1 px-6 flex flex-col items-center justify-center text-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full animate-pulse-ring" />
            <div className="h-28 w-28 rounded-full bg-primary-foreground/15 backdrop-blur flex items-center justify-center">
              <Siren className="h-12 w-12" />
            </div>
          </div>

          <p className="mt-8 text-xs uppercase tracking-[0.25em] opacity-80">Blood needed</p>
          <div className="mt-3"><BloodDrop group="O-" size="lg" /></div>

          <h1 className="mt-6 text-3xl font-black leading-tight">CPR Hospital</h1>
          <p className="mt-1 text-sm opacity-90">2 units · Trauma case · RTA</p>

          <div className="mt-5 flex items-center gap-4 text-xs opacity-90">
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> 2.1 km away</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Just now</span>
          </div>

          <p className="mt-8 text-xs opacity-75 max-w-[260px]">
            Your contact stays private. It is only shared with the hospital after you tap Accept.
          </p>
        </div>

        {accepted === null ? (
          <div className="p-5 grid grid-cols-2 gap-3">
            <button
              onClick={() => setAccepted(false)}
              className="py-4 rounded-2xl bg-primary-foreground/15 backdrop-blur font-bold flex items-center justify-center gap-2"
            >
              <X className="h-5 w-5" /> Decline
            </button>
            <button
              onClick={() => setAccepted(true)}
              className="py-4 rounded-2xl bg-primary-foreground text-primary font-black flex items-center justify-center gap-2"
            >
              <Check className="h-5 w-5" /> Accept
            </button>
          </div>
        ) : (
          <div className="p-5">
            <div className="rounded-2xl bg-primary-foreground/15 backdrop-blur p-5 text-center">
              <p className="font-black text-lg">{accepted ? "🙏 Thank you, Hero!" : "Response recorded"}</p>
              <p className="text-xs opacity-80 mt-1">
                {accepted
                  ? "Hospital has been notified. Your contact has been shared securely."
                  : "We've notified the next nearest donor."}
              </p>
              <button
                onClick={() => nav({ to: "/" })}
                className="mt-4 w-full py-3 rounded-xl bg-primary-foreground text-primary font-bold text-sm"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </PhoneFrame>
  );
}
