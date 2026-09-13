import type { Dispatch, FormEvent, ReactNode, SetStateAction } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import type { ApplicationStatus } from "@/lib/application-utils";
import {
  statusOrder,
  type ApplicationFormValues,
  type Translation,
} from "@/lib/postula-config";

type ApplicationFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: ApplicationFormValues;
  setForm: Dispatch<SetStateAction<ApplicationFormValues>>;
  error: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  t: Translation;
};

export function ApplicationFormDialog({
  open,
  onOpenChange,
  form,
  setForm,
  error,
  onSubmit,
  t,
}: ApplicationFormDialogProps) {
  const updateField = <Key extends keyof ApplicationFormValues>(
    field: Key,
    value: ApplicationFormValues[Key],
  ) => setForm((current) => ({ ...current, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="h-10 rounded-xl px-4 font-semibold">
          <Plus className="size-4" />
          <span className="hidden sm:inline">{t.newApplication}</span>
          <span className="sm:hidden">{t.shortNewApplication}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-border bg-popover sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t.form.title}</DialogTitle>
          <DialogDescription>{t.form.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.form.company} htmlFor="company">
              <Input
                id="company"
                value={form.company}
                onChange={(event) => updateField("company", event.target.value)}
                placeholder={t.form.companyPlaceholder}
                autoComplete="organization"
              />
            </Field>
            <Field label={t.form.role} htmlFor="role">
              <Input
                id="role"
                value={form.role}
                onChange={(event) => updateField("role", event.target.value)}
                placeholder={t.form.rolePlaceholder}
              />
            </Field>
          </div>
          <Field label={t.form.location} htmlFor="location">
            <Input
              id="location"
              value={form.location}
              onChange={(event) => updateField("location", event.target.value)}
              placeholder={t.form.locationPlaceholder}
            />
          </Field>
          <Field label={t.form.skills} htmlFor="skills">
            <Input
              id="skills"
              value={form.skills}
              onChange={(event) => updateField("skills", event.target.value)}
              placeholder={t.form.skillsPlaceholder}
            />
          </Field>
          <Field label={t.form.link} htmlFor="link">
            <Input
              id="link"
              value={form.url}
              onChange={(event) => updateField("url", event.target.value)}
              placeholder={t.form.linkPlaceholder}
              inputMode="url"
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>{t.form.status}</Label>
              <Select
                value={form.status}
                onValueChange={(value) => updateField("status", value as ApplicationStatus)}
              >
                <SelectTrigger className="w-full">
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
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <Label>{t.form.match}</Label>
                <span className="text-sm font-semibold text-primary">{form.match}%</span>
              </div>
              <Slider
                aria-label={t.form.match}
                min={1}
                max={100}
                step={1}
                value={[Number(form.match)]}
                onValueChange={(value) => updateField("match", String(value[0] ?? 80))}
              />
            </div>
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t.form.cancel}
            </Button>
            <Button type="submit">{t.form.save}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
