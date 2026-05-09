import { useEffect, useRef } from "react";
import { useAuth } from "./auth-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Auto-prompts the browser for location once per session (when user is signed in)
 * and saves the coordinates to the user's profile.
 */
export function useAutoGeolocation() {
  const { user } = useAuth();
  const askedRef = useRef(false);

  useEffect(() => {
    if (!user || askedRef.current) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    askedRef.current = true;

    // small delay so the UI mounts first
    const t = setTimeout(() => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          const { error } = await supabase
            .from("profiles")
            .update({ lat: latitude, lng: longitude })
            .eq("id", user.id);
          if (!error) toast.success("Location updated", { duration: 2000 });
        },
        () => {
          // user denied — silent
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 },
      );
    }, 1200);

    return () => clearTimeout(t);
  }, [user]);
}
