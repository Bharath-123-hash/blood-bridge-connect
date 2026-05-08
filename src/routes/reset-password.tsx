import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Droplet, Loader2, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  head: () => ({ meta: [{ title: "Reset Password · Rakta-Seva Connect" }] }),
});

function ResetPasswordPage() {
  const nav = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Password updated!");
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
          <h1 className="text-3xl font-black leading-tight">Reset<br />Password</h1>
          <p className="text-sm opacity-80 mt-2">Enter a new password for your account.</p>
        </div>

        <form onSubmit={submit} className="flex-1 mt-10 bg-card rounded-t-3xl p-6 flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">New Password</label>
            <div className="relative mt-1.5">
              <input
                type={showPassword ? "text" : "password"} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-4 py-3 pr-12 rounded-xl bg-secondary text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button
            type="submit" disabled={loading}
            className="mt-2 w-full py-4 rounded-2xl text-primary-foreground font-black tracking-wide flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: "var(--gradient-emergency)", boxShadow: "var(--shadow-emergency)" }}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Update Password
          </button>
        </form>
      </div>
    </PhoneFrame>
  );
}
