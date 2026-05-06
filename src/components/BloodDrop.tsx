export function BloodDrop({ group, size = "md" }: { group: string; size?: "sm" | "md" | "lg" }) {
  const dim = size === "sm" ? "h-10 w-10 text-xs" : size === "lg" ? "h-16 w-16 text-lg" : "h-12 w-12 text-sm";
  return (
    <div
      className={`${dim} relative flex items-center justify-center font-black text-primary-foreground shrink-0`}
      style={{
        background: "var(--gradient-emergency)",
        borderRadius: "50% 50% 50% 0",
        transform: "rotate(-45deg)",
        boxShadow: "var(--shadow-emergency)",
      }}
    >
      <span style={{ transform: "rotate(45deg)" }}>{group}</span>
    </div>
  );
}
