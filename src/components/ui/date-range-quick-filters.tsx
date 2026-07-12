import { Button } from "@/components/ui/button";
import { type DatePreset, getDatePresetRange } from "@/lib/finance";

const presets: Array<{ value: DatePreset; label: string }> = [
  { value: "today", label: "Hoy" },
  { value: "week", label: "Esta semana" },
  { value: "month", label: "Este mes" },
  { value: "year", label: "Este año" },
  { value: "custom", label: "Personalizado" },
];

type DateRangeQuickFiltersProps = {
  activePreset: DatePreset;
  onPresetChange: (preset: DatePreset, range?: { startDate: string; endDate: string }) => void;
};

export function DateRangeQuickFilters({ activePreset, onPresetChange }: DateRangeQuickFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2" aria-label="Rangos rápidos">
      {presets.map((preset) => (
        <Button
          key={preset.value}
          type="button"
          variant={activePreset === preset.value ? "primary" : "secondary"}
          className="min-h-9 px-3 py-1.5"
          onClick={() => onPresetChange(preset.value, preset.value === "custom" ? undefined : getDatePresetRange(preset.value))}
        >
          {preset.label}
        </Button>
      ))}
    </div>
  );
}
