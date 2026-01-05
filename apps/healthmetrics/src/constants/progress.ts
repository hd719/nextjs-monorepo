import type { DateRangeOption } from "@/types/progress";

export const DATE_RANGE_OPTIONS: DateRangeOption[] = [
  { value: "7d", label: "1W" },
  { value: "30d", label: "1M" },
  { value: "90d", label: "3M" },
  { value: "180d", label: "6M" },
  { value: "365d", label: "1Y" },
  { value: "all", label: "All" },
];
