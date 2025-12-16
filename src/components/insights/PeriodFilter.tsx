import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PeriodFilter as PeriodFilterType, getPeriodLabel } from '@/lib/insights';
import { Calendar } from 'lucide-react';

interface PeriodFilterProps {
  value: PeriodFilterType;
  onChange: (value: PeriodFilterType) => void;
}

export const PeriodFilter = ({ value, onChange }: PeriodFilterProps) => {
  const periods: PeriodFilterType[] = ['7days', '30days', '90days'];

  return (
    <div className="flex items-center gap-2">
      <Calendar className="w-4 h-4 text-muted-foreground" />
      <Select value={value} onValueChange={(v) => onChange(v as PeriodFilterType)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Selecione o período" />
        </SelectTrigger>
        <SelectContent>
          {periods.map((period) => (
            <SelectItem key={period} value={period}>
              {getPeriodLabel(period)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
