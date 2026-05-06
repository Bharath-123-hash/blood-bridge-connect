import { ReactNode } from "react";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-secondary to-background flex items-center justify-center p-0 md:p-6">
      <div className="w-full md:w-[420px] md:h-[860px] md:rounded-[3rem] bg-background md:shadow-[var(--shadow-float)] md:border-[10px] md:border-foreground/90 overflow-hidden relative flex flex-col min-h-screen md:min-h-0">
        {/* status bar */}
        <div className="hidden md:flex items-center justify-between px-8 pt-3 pb-1 text-xs font-semibold text-foreground/80">
          <span>9:41</span>
          <span className="flex gap-1 items-center">
            <span className="h-2 w-2 rounded-full bg-foreground/80" />
            <span className="h-2 w-2 rounded-full bg-foreground/80" />
            <span className="h-2 w-3 rounded-sm bg-foreground/80" />
          </span>
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden">{children}</div>
      </div>
    </div>
  );
}
