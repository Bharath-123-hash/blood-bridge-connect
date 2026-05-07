import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Droplet, Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({ meta: [{ title: "Sign In · Rakta-Seva Connect" }] }),
});

function AuthPage() {
  const nav = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) nav({ to: "/" }); }, [user, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = mode === "signin"
      ? await signIn(email, password)
      : await signUp(email, password, name);
    setLoading(false);
    if (error) toast.error(error);
    else {
      toast.success(mode === "signin" ? "Welcome back!" : "Account created!");
      nav({ to: "/" });
    }
  };

  return (
    <PhoneFrame>
      <div className="min-h-full flex flex-col" style={{ background: "var(--gradient-hero)" }}>
        <div className="px-6 pt-16 text-primary-foreground">
          <div className="h-14 w-14 rounded-2xl bg-primary-foreground/15 backdrop-blur flex items-center justify-center mb-4">
            <Droplet className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-black leading-tight">Rakta-Seva<br />Connect</h1>
          <p className="text-sm opacity-80 mt-2">A life-saving bridge for emergency blood needs.</p>
        </div>

        <form onSubmit={submit} className="flex-1 mt-10 bg-card rounded-t-3xl p-6 flex flex-col gap-4">
          <div className="flex bg-secondary rounded-xl p-1">
            {(["signin", "signup"] as const).map((m) => (
              <button
                type="button"
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                  mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                {m === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {mode === "signup" && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
              <input
                required value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Rohan Desai"
                className="w-full mt-1.5 px-4 py-3 rounded-xl bg-secondary text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full mt-1.5 px-4 py-3 rounded-xl bg-secondary text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</label>
              {mode === "signin" && (
                <button
                  type="button"
                  onClick={async () => {
                    if (!email) { toast.error("Enter your email first"); return; }
                    const { error } = await supabase.auth.resetPasswordForEmail(email, {
                      redirectTo: `${window.location.origin}/reset-password`,
                    });
                    if (error) toast.error(error.message);
                    else toast.success("Password reset link sent to your email");
                  }}
                  className="text-[11px] font-bold text-primary hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <input
              type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full mt-1.5 px-4 py-3 rounded-xl bg-secondary text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="mt-2 w-full py-4 rounded-2xl text-primary-foreground font-black tracking-wide flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: "var(--gradient-emergency)", boxShadow: "var(--shadow-emergency)" }}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "signin" ? "Sign In" : "Create Account"}
          </button>

          <p className="text-[11px] text-center text-muted-foreground mt-2">
            By continuing you agree to share blood-donation related alerts. Your phone number stays private.
          </p>
        </form>
      </div>
    </PhoneFrame>
  );
}
