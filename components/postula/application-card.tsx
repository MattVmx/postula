import { CalendarDays, ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ApplicationStatus, TrackedApplication } from "@/lib/application-utils";
import { statusOrder, type Locale, type Translation } from "@/lib/postula-config";

type ApplicationCardProps = {
  item: TrackedApplication;
  locale: Locale;
  t: Translation;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
};

export function ApplicationCard({
  item,
  locale,
  t,
  onStatusChange,
}: ApplicationCardProps) {
  return (
    <article className="group rounded-[18px] border border-border bg-card p-4 shadow-[0_16px_50px_rgb(0_0_0/12%)] transition hover:-translate-y-0.5 hover:border-primary/30">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-xs font-bold text-secondary-foreground ring-1 ring-inset ring-border">
          {item.accent}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">{item.company}</p>
          <h4 className="mt-0.5 text-[15px] font-semibold leading-5 text-foreground">
            {item.role}
          </h4>
        </div>
        {item.url && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button asChild variant="ghost" size="icon-xs">
                <a href={item.url} target="_blank" rel="noreferrer">
                  <ExternalLink />
                  <span className="sr-only">{t.openRole}</span>
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t.openRole}</TooltipContent>
          </Tooltip>
        )}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{item.location}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {item.skills.map((skill) => (
          <Badge key={skill} variant="secondary" className="font-normal">
            {skill}
          </Badge>
        ))}
      </div>
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{t.profileMatch}</span>
          <span className="font-semibold text-primary">{item.match}%</span>
        </div>
        <Progress
          value={item.match}
          className="h-1.5 bg-secondary [&_[data-slot=progress-indicator]]:bg-primary"
        />
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3">
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarDays className="size-3.5" />
          {item.date[locale]}
        </span>
        <Select
          value={item.status}
          onValueChange={(value) => onStatusChange(item.id, value as ApplicationStatus)}
        >
          <SelectTrigger
            size="sm"
            aria-label={t.form.status}
            className="h-7 max-w-[125px] border-0 bg-secondary px-2 text-xs shadow-none"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOrder.map((status) => (
              <SelectItem key={status} value={status}>
                {t.status[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </article>
  );
}
