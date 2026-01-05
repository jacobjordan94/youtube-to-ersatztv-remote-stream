import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface VodDurationSelectProps {
  durationMode: 'none' | 'custom' | 'api' | 'api-padded';
  customDuration: string;
  paddingInterval: number;
  durationError: string | null;
  isPlaylist: boolean;
  onDurationModeChange: (mode: 'none' | 'custom' | 'api' | 'api-padded') => void;
  onCustomDurationChange: (value: string) => void;
  onPaddingIntervalChange: (interval: number) => void;
  onDurationError: (error: string | null) => void;
  disabled: boolean;
}

export function VodDurationSelect({
  durationMode,
  customDuration,
  paddingInterval,
  durationError,
  isPlaylist,
  onDurationModeChange,
  onCustomDurationChange,
  onPaddingIntervalChange,
  onDurationError,
  disabled,
}: VodDurationSelectProps) {
  return (
    <div className="vod-options flex-1 space-y-4">
      <div>
        <Label htmlFor="durationMode" className="text-sm text-white font-medium mb-2 block">
          VOD Duration
        </Label>
        <Select
          value={durationMode}
          onValueChange={(value: string) => {
            onDurationModeChange(value as typeof durationMode);
            onDurationError(null);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select duration mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No duration</SelectItem>
            <SelectItem value="custom" disabled={isPlaylist}>
              Custom duration (manual input)
            </SelectItem>
            <SelectItem value="api">Duration from YouTube</SelectItem>
            <SelectItem value="api-padded">Duration from YouTube (padded)</SelectItem>
          </SelectContent>
        </Select>
        {isPlaylist && (
          <p className="text-xs text-gray-300 mt-2">
            Custom duration is not available for playlists
          </p>
        )}
      </div>

      {durationMode === 'custom' && (
        <div className="space-y-2">
          <Label htmlFor="customDuration" className="text-sm text-white font-medium">
            Duration (HH:MM:SS)
          </Label>
          <Input
            id="customDuration"
            type="text"
            value={customDuration}
            onChange={(e) => {
              onCustomDurationChange(e.target.value);
              onDurationError(null);
            }}
            onBlur={(e) => {
              const value = e.target.value;
              const regex = /^([0-9]{2}):([0-5][0-9]):([0-5][0-9])$/;
              if (!regex.test(value)) {
                onDurationError('Duration must be in HH:MM:SS format (e.g., 01:23:45)');
              }
            }}
            disabled={disabled}
            placeholder="01:23:45"
            className="font-mono text-sm"
          />
          {durationError && <p className="text-xs text-red-400">{durationError}</p>}
        </div>
      )}

      {durationMode === 'api-padded' && (
        <div className="space-y-2">
          <Label htmlFor="paddingInterval" className="text-sm text-white font-medium">
            Padding Interval (minutes)
          </Label>
          <Select
            value={String(paddingInterval)}
            onValueChange={(value: string) => onPaddingIntervalChange(Number(value))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 (:00, :05, :10, :15, :20, etc.)</SelectItem>
              <SelectItem value="10">10 (:00, :10, :20, :30, :40, :50)</SelectItem>
              <SelectItem value="15">15 (:00, :15, :30, :45)</SelectItem>
              <SelectItem value="30">30 (:00, :30)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-300">
            Duration will be rounded up to the nearest {paddingInterval}-minute interval
          </p>
        </div>
      )}
    </div>
  );
}
