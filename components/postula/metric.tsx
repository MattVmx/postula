import type { ReactNode } from "react";

type MetricProps = {
  label: string;
  value: string;
  note: string;
  icon: ReactNode;
};

export function Metric({ label, value, note, icon }: MetricProps) {
  return (
    <article className="relative overflow-hidden rounded-[20px] border border-border bg-card p-5">
      <div className="absolute -right-8 -top-8 size-24 rounded-full bg-primary/[0.05] blur-xl" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-[-0.04em]">{value}</p>
          <p className="mt-2 text-xs text-muted-foreground">{note}</p>
        </div>
        <span className="grid size-9 place-items-center rounded-xl bg-secondary text-primary [&_svg]:size-4">
          {icon}
        </span>
      </div>
    </article>
  );
}
