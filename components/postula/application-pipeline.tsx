import { Check, Plus, Search } from "lucide-react";

import { ApplicationCard } from "@/components/postula/application-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ApplicationStatus, TrackedApplication } from "@/lib/application-utils";
import {
  statusOrder,
  statusTone,
  type Locale,
  type Translation,
} from "@/lib/postula-config";

type ApplicationPipelineProps = {
  applications: TrackedApplication[];
  locale: Locale;
  statusFilter: ApplicationStatus | "all";
  onFilterChange: (status: ApplicationStatus | "all") => void;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onAddToStatus: (status: ApplicationStatus) => void;
  t: Translation;
};

export function ApplicationPipeline({
  applications,
  locale,
  statusFilter,
  onFilterChange,
  onStatusChange,
  onAddToStatus,
  t,
}: ApplicationPipelineProps) {
  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{t.pipeline}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t.attention(applications.length)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(value) => onFilterChange(value as ApplicationStatus | "all")}
          >
            <SelectTrigger aria-label={t.filter} className="w-[165px] bg-secondary/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.all}</SelectItem>
              {statusOrder.map((status) => (
                <SelectItem key={status} value={status}>
                  {t.status[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge
            variant="outline"
            className="hidden h-9 border-border px-3 text-muted-foreground sm:inline-flex"
          >
            <Check className="size-3.5" /> {t.updated}
          </Badge>
        </div>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-3">
        {statusOrder.map((status) => {
          const items = applications.filter((application) => application.status === status);
          return (
            <section
              key={status}
              className="rounded-[22px] border border-border bg-secondary/20 p-3"
            >
              <header className="flex items-center justify-between px-2 py-2.5">
                <div className="flex items-center gap-2.5">
                  <span className={`size-2 rounded-full ${statusTone[status]}`} />
                  <h3 className="text-sm font-semibold">{t.status[status]}</h3>
                </div>
                <span className="grid size-6 place-items-center rounded-full bg-secondary text-xs text-muted-foreground">
                  {items.length}
                </span>
              </header>
              <div className="space-y-3 pt-1">
                {items.map((item) => (
                  <ApplicationCard
                    key={item.id}
                    item={item}
                    locale={locale}
                    t={t}
                    onStatusChange={onStatusChange}
                  />
                ))}
                {items.length === 0 && (
                  <Empty className="min-h-48 border border-dashed border-border bg-card/35 p-5">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Search />
                      </EmptyMedia>
                      <EmptyTitle className="text-base">{t.noResults}</EmptyTitle>
                      <EmptyDescription>{t.noResultsDescription}</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )}
                <Button
                  variant="ghost"
                  className="h-11 w-full rounded-2xl border border-dashed border-border text-muted-foreground"
                  onClick={() => onAddToStatus(status)}
                >
                  <Plus className="size-4" /> {t.addTo}{" "}
                  {t.status[status].toLocaleLowerCase()}
                </Button>
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
