import { useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { Plus, Moon, Star, Loader2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSaveSleepEntry } from "@/hooks";
import { getFieldError } from "@/utils";
import { z } from "zod";

// Time picker options
const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] as const;
const PERIODS = ["AM", "PM"] as const;

// Custom validation for this form (12-hour format)
const logSleepSchema12h = z.object({
  bedtimeHour: z.number().min(1).max(12),
  bedtimeMinute: z.number().min(0).max(59),
  bedtimePeriod: z.enum(["AM", "PM"]),
  wakeTimeHour: z.number().min(1).max(12),
  wakeTimeMinute: z.number().min(0).max(59),
  wakeTimePeriod: z.enum(["AM", "PM"]),
  quality: z.number().min(1).max(5),
  notes: z.string(),
});

interface SleepFormData {
  bedtimeHour: number;
  bedtimeMinute: number;
  bedtimePeriod: "AM" | "PM";
  wakeTimeHour: number;
  wakeTimeMinute: number;
  wakeTimePeriod: "AM" | "PM";
  quality: number;
  notes: string;
}

// Convert 24h format (HH:MM) to 12h components
function parse24hTo12h(time: string): {
  hour: number;
  minute: number;
  period: "AM" | "PM";
} {
  const [h, m] = time.split(":").map(Number);
  const period: "AM" | "PM" = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return { hour, minute: m, period };
}

// Convert 12h components to 24h format (HH:MM)
function convert12hTo24h(
  hour: number,
  minute: number,
  period: "AM" | "PM"
): string {
  let h = hour;
  if (period === "AM" && hour === 12) h = 0;
  else if (period === "PM" && hour !== 12) h = hour + 12;
  return `${h.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

interface InitialSleepData {
  bedtime: string; // HH:MM 24h format from DB
  wakeTime: string;
  quality: number;
  notes: string;
}

interface LogSleepDialogProps {
  userId: string;
  date?: string;
  initialData?: InitialSleepData;
  isEdit?: boolean;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export function LogSleepDialog({
  userId,
  date,
  initialData,
  isEdit = false,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onSuccess,
}: LogSleepDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const saveSleep = useSaveSleepEntry();

  // Support both controlled and uncontrolled modes
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen;

  // Calculate hours slept from 12h format
  const calculateHoursFrom12h = (
    bedH: number,
    bedM: number,
    bedP: "AM" | "PM",
    wakeH: number,
    wakeM: number,
    wakeP: "AM" | "PM"
  ) => {
    const bedtime = convert12hTo24h(bedH, bedM, bedP);
    const wakeTime = convert12hTo24h(wakeH, wakeM, wakeP);
    const [bed24H, bed24M] = bedtime.split(":").map(Number);
    const [wake24H, wake24M] = wakeTime.split(":").map(Number);

    let hours = wake24H - bed24H;
    let minutes = wake24M - bed24M;

    if (hours < 0) hours += 24;
    if (minutes < 0) {
      hours -= 1;
      minutes += 60;
    }

    return hours + minutes / 60;
  };

  // Parse initial data or use defaults (10:30 PM - 6:30 AM)
  const getDefaultValues = (): SleepFormData => {
    if (initialData) {
      const bed = parse24hTo12h(initialData.bedtime);
      const wake = parse24hTo12h(initialData.wakeTime);
      return {
        bedtimeHour: bed.hour,
        bedtimeMinute: bed.minute,
        bedtimePeriod: bed.period,
        wakeTimeHour: wake.hour,
        wakeTimeMinute: wake.minute,
        wakeTimePeriod: wake.period,
        quality: initialData.quality,
        notes: initialData.notes,
      };
    }
    return {
      bedtimeHour: 10,
      bedtimeMinute: 30,
      bedtimePeriod: "PM",
      wakeTimeHour: 6,
      wakeTimeMinute: 30,
      wakeTimePeriod: "AM",
      quality: 3,
      notes: "",
    };
  };

  const form = useForm({
    defaultValues: getDefaultValues(),
    validators: {
      onChange: logSleepSchema12h,
    },
    onSubmit: async ({ value }) => {
      const sleepDate = date || new Date().toISOString().split("T")[0];
      const bedtime24 = convert12hTo24h(
        value.bedtimeHour,
        value.bedtimeMinute,
        value.bedtimePeriod
      );
      const wakeTime24 = convert12hTo24h(
        value.wakeTimeHour,
        value.wakeTimeMinute,
        value.wakeTimePeriod
      );
      const hoursSlept = calculateHoursFrom12h(
        value.bedtimeHour,
        value.bedtimeMinute,
        value.bedtimePeriod,
        value.wakeTimeHour,
        value.wakeTimeMinute,
        value.wakeTimePeriod
      );

      await saveSleep.mutateAsync({
        userId,
        date: sleepDate,
        hoursSlept,
        quality: value.quality,
        bedtime: bedtime24,
        wakeTime: wakeTime24,
        notes: value.notes || undefined,
      });

      setOpen(false);
      onSuccess?.();
      form.reset();
    },
  });

  // Reset form when dialog opens with new initial data
  useEffect(() => {
    if (open && initialData) {
      const bed = parse24hTo12h(initialData.bedtime);
      const wake = parse24hTo12h(initialData.wakeTime);
      form.reset();
      form.setFieldValue("bedtimeHour", bed.hour);
      form.setFieldValue("bedtimeMinute", bed.minute);
      form.setFieldValue("bedtimePeriod", bed.period);
      form.setFieldValue("wakeTimeHour", wake.hour);
      form.setFieldValue("wakeTimeMinute", wake.minute);
      form.setFieldValue("wakeTimePeriod", wake.period);
      form.setFieldValue("quality", initialData.quality);
      form.setFieldValue("notes", initialData.notes);
    }
  }, [open, initialData, form]);

  // Helper to calculate hours from form values
  const getHoursFromValues = (values: SleepFormData) =>
    calculateHoursFrom12h(
      values.bedtimeHour,
      values.bedtimeMinute,
      values.bedtimePeriod,
      values.wakeTimeHour,
      values.wakeTimeMinute,
      values.wakeTimePeriod
    );

  const getQualityLabel = (q: number) => {
    switch (q) {
      case 1:
        return "Poor";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Very Good";
      case 5:
        return "Excellent";
      default:
        return "";
    }
  };

  // Default trigger button
  const defaultTrigger = (
    <Button className="sleep-log-button">
      {isEdit ? (
        <>
          <Edit2 className="w-4 h-4 mr-2" />
          Edit
        </>
      ) : (
        <>
          <Plus className="w-4 h-4 mr-2" />
          Log Sleep
        </>
      )}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger !== undefined ? (
        trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>{defaultTrigger}</DialogTrigger>
      )}
      <DialogContent
        className="sleep-dialog"
        closeOnOutsideClick={true}
        onClose={() => setOpen(false)}
      >
        <DialogHeader>
          <DialogTitle className="sleep-dialog-title">
            <Moon className="w-5 h-5 text-indigo-400" />
            {isEdit ? "Edit Sleep Log" : "Log Your Sleep"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Update your sleep entry for ${date || "this day"}`
              : `Record your sleep for ${date || "last night"}`}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="sleep-form"
        >
          {/* Bedtime Input */}
          <div className="sleep-form-field">
            <label className="sleep-form-label">Bedtime</label>
            <div className="sleep-time-picker">
              <form.Field name="bedtimeHour">
                {(field) => (
                  <Select
                    value={String(field.state.value)}
                    onValueChange={(val) => field.handleChange(Number(val))}
                  >
                    <SelectTrigger className="w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HOURS.map((h) => (
                        <SelectItem key={h} value={String(h)}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </form.Field>
              <span className="sleep-time-colon">:</span>
              <form.Field name="bedtimeMinute">
                {(field) => (
                  <Select
                    value={String(field.state.value)}
                    onValueChange={(val) => field.handleChange(Number(val))}
                  >
                    <SelectTrigger className="w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MINUTES.map((m) => (
                        <SelectItem key={m} value={String(m)}>
                          {m.toString().padStart(2, "0")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </form.Field>
              <form.Field name="bedtimePeriod">
                {(field) => (
                  <Select
                    value={field.state.value}
                    onValueChange={(val) =>
                      field.handleChange(val as "AM" | "PM")
                    }
                  >
                    <SelectTrigger className="w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PERIODS.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </form.Field>
            </div>
          </div>

          {/* Wake Time Input */}
          <div className="sleep-form-field">
            <label className="sleep-form-label">Wake Time</label>
            <div className="sleep-time-picker">
              <form.Field name="wakeTimeHour">
                {(field) => (
                  <Select
                    value={String(field.state.value)}
                    onValueChange={(val) => field.handleChange(Number(val))}
                  >
                    <SelectTrigger className="w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HOURS.map((h) => (
                        <SelectItem key={h} value={String(h)}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </form.Field>
              <span className="sleep-time-colon">:</span>
              <form.Field name="wakeTimeMinute">
                {(field) => (
                  <Select
                    value={String(field.state.value)}
                    onValueChange={(val) => field.handleChange(Number(val))}
                  >
                    <SelectTrigger className="w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MINUTES.map((m) => (
                        <SelectItem key={m} value={String(m)}>
                          {m.toString().padStart(2, "0")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </form.Field>
              <form.Field name="wakeTimePeriod">
                {(field) => (
                  <Select
                    value={field.state.value}
                    onValueChange={(val) =>
                      field.handleChange(val as "AM" | "PM")
                    }
                  >
                    <SelectTrigger className="w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PERIODS.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </form.Field>
            </div>
          </div>

          <form.Subscribe selector={(state) => state.values}>
            {(values) => {
              const hoursSlept = getHoursFromValues(values);
              return (
                <div className="sleep-hours-display">
                  <span className="sleep-hours-value">
                    {hoursSlept.toFixed(1)}
                  </span>
                  <span className="sleep-hours-label">hours of sleep</span>
                </div>
              );
            }}
          </form.Subscribe>

          {/* Quality Rating */}
          <form.Field name="quality">
            {(field) => (
              <div className="sleep-form-field">
                <label className="sleep-form-label">Sleep Quality</label>
                <div className="sleep-quality-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => field.handleChange(star)}
                      className={`sleep-star-button ${star <= field.state.value ? "sleep-star-active" : ""}`}
                    >
                      <Star
                        className={`w-6 h-6 ${star <= field.state.value ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`}
                      />
                    </button>
                  ))}
                </div>
                <span className="sleep-quality-label">
                  {getQualityLabel(field.state.value)}
                </span>
              </div>
            )}
          </form.Field>

          {/* Notes */}
          <form.Field name="notes">
            {(field) => (
              <div className="sleep-form-field">
                <label htmlFor={field.name} className="sleep-form-label">
                  Notes (optional)
                </label>
                <textarea
                  id={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="How did you feel? Any disruptions?"
                  className="sleep-form-textarea"
                  rows={2}
                />
                {field.state.meta.errors &&
                  field.state.meta.errors.length > 0 && (
                    <p className="util-field-error">
                      {getFieldError(field.state.meta.errors)}
                    </p>
                  )}
              </div>
            )}
          </form.Field>

          {/* Submit */}
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                className="sleep-submit-button"
                disabled={!canSubmit || saveSleep.isPending}
              >
                {isSubmitting || saveSleep.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : isEdit ? (
                  "Update Sleep Log"
                ) : (
                  "Save Sleep Log"
                )}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </DialogContent>
    </Dialog>
  );
}
