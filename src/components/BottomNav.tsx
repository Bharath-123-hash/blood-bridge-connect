import { Link, useLocation } from "@tanstack/react-router";
import { Home, Siren, Users, User } from "lucide-react";

const items = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/request", label: "Request", Icon: Siren },
  { to: "/donors", label: "Donors", Icon: Users },
  { to: "/profile", label: "Profile", Icon: User },
];

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="sticky bottom-0 left-0 right-0 bg-card/95 backdrop-blur border-t border-border px-2 py-2 flex justify-around z-40">
      {items.map(({ to, label, Icon }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
              active ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Icon className={`h-5 w-5 ${active ? "scale-110" : ""}`} strokeWidth={active ? 2.5 : 2} />
            <span className="text-[10px] font-semibold">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
