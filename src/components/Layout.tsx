import { ReactNode } from "react";
import { PhoneFrame } from "./PhoneFrame";
import { BottomNav } from "./BottomNav";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <PhoneFrame>
      <div className="flex flex-col min-h-full">
        <main className="flex-1">{children}</main>
        <BottomNav />
      </div>
    </PhoneFrame>
  );
}
