import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LivestreamDurationSelectProps {
  livestreamDuration: string;
  customLivestreamDuration: string;
  livestreamDurationError: string | null;
  onLivestreamDurationChange: (value: string) => void;
  onCustomLivestreamDurationChange: (value: string) => void;
  onLivestreamDurationError: (error: string | null) => void;
  disabled: boolean;
}

export function LivestreamDurationSelect({
  livestreamDuration,
  customLivestreamDuration,
  livestreamDurationError,
  onLivestreamDurationChange,
  onCustomLivestreamDurationChange,
  onLivestreamDurationError,
  disabled,
}: LivestreamDurationSelectProps) {
  return (
    <div className="live-stream-options flex-1 space-y-4">
      <div>
        <Label htmlFor="livestreamDuration" className="text-sm text-white font-medium mb-2 block">
          Livestream Duration
        </Label>
        <Select
          value={livestreamDuration}
          onValueChange={(value: string) => {
            onLivestreamDurationChange(value);
            onLivestreamDurationError(null);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select livestream duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="00:00:00">Indefinitely (00:00:00)</SelectItem>
            <SelectItem value="00:15:00">15 minutes (00:15:00)</SelectItem>
            <SelectItem value="00:30:00">30 minutes (00:30:00)</SelectItem>
            <SelectItem value="00:45:00">45 minutes (00:45:00)</SelectItem>
            <SelectItem value="01:00:00">1 hour (01:00:00)</SelectItem>
            <SelectItem value="01:30:00">1 hour 30 minutes (01:30:00)</SelectItem>
            <SelectItem value="02:00:00">2 hours (02:00:00)</SelectItem>
            <SelectItem value="24:00:00">24 hours (24:00:00)</SelectItem>
            <SelectItem value="custom">Custom duration</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {livestreamDuration === 'custom' && (
        <div className="space-y-2">
          <Label htmlFor="customLivestreamDuration" className="text-sm text-white font-medium">
            Custom Livestream Duration (HH:MM:SS)
          </Label>
          <Input
            id="customLivestreamDuration"
            type="text"
            value={customLivestreamDuration}
            onChange={(e) => {
              onCustomLivestreamDurationChange(e.target.value);
              onLivestreamDurationError(null);
            }}
            onBlur={(e) => {
              const value = e.target.value;
              const regex = /^([0-9]{2}):([0-5][0-9]):([0-5][0-9])$/;
              if (!regex.test(value)) {
                onLivestreamDurationError('Duration must be in HH:MM:SS format (e.g., 01:23:45)');
              }
            }}
            disabled={disabled}
            placeholder="01:23:45"
            className="font-mono text-sm"
          />
          {livestreamDurationError && (
            <p className="text-xs text-red-400">{livestreamDurationError}</p>
          )}
        </div>
      )}
    </div>
  );
}
