import { Separator } from './ui/separator';
import { LivestreamDurationSelect } from './LivestreamDurationSelect';
import { VodDurationSelect } from './VodDurationSelect';

interface DurationConfigProps {
  // Livestream props
  livestreamDuration: string;
  customLivestreamDuration: string;
  livestreamDurationError: string | null;
  onLivestreamDurationChange: (value: string) => void;
  onCustomLivestreamDurationChange: (value: string) => void;
  onLivestreamDurationError: (error: string | null) => void;

  // VOD props
  durationMode: 'none' | 'custom' | 'api' | 'api-padded';
  customDuration: string;
  paddingInterval: number;
  durationError: string | null;
  isPlaylist: boolean;
  onDurationModeChange: (mode: 'none' | 'custom' | 'api' | 'api-padded') => void;
  onCustomDurationChange: (value: string) => void;
  onPaddingIntervalChange: (interval: number) => void;
  onDurationError: (error: string | null) => void;

  // Content type detection
  isLive: boolean | null; // null means playlist mode, boolean means single video mode

  disabled: boolean;
}

export function DurationConfig({
  livestreamDuration,
  customLivestreamDuration,
  livestreamDurationError,
  onLivestreamDurationChange,
  onCustomLivestreamDurationChange,
  onLivestreamDurationError,
  durationMode,
  customDuration,
  paddingInterval,
  durationError,
  isPlaylist,
  onDurationModeChange,
  onCustomDurationChange,
  onPaddingIntervalChange,
  onDurationError,
  isLive,
  disabled,
}: DurationConfigProps) {
  // In single content mode (isLive is not null), show only relevant options
  // isLive === true: show livestream options only
  // isLive === false: show VOD options only
  // isLive === null: playlist mode, show both options
  const showLivestreamOptions = isLive === null || isLive === true;
  const showVodOptions = isLive === null || isLive === false;
  const showSeparator = showLivestreamOptions && showVodOptions;

  return (
    <div className="duration-options flex flex-row gap-4 items-stretch">
      {showLivestreamOptions && (
        <LivestreamDurationSelect
          livestreamDuration={livestreamDuration}
          customLivestreamDuration={customLivestreamDuration}
          livestreamDurationError={livestreamDurationError}
          onLivestreamDurationChange={onLivestreamDurationChange}
          onCustomLivestreamDurationChange={onCustomLivestreamDurationChange}
          onLivestreamDurationError={onLivestreamDurationError}
          disabled={disabled}
        />
      )}
      {showSeparator && (
        <div className="flex items-stretch">
          <Separator orientation="vertical" className="bg-gray-600" />
        </div>
      )}
      {showVodOptions && (
        <VodDurationSelect
          durationMode={durationMode}
          customDuration={customDuration}
          paddingInterval={paddingInterval}
          durationError={durationError}
          isPlaylist={isPlaylist}
          onDurationModeChange={onDurationModeChange}
          onCustomDurationChange={onCustomDurationChange}
          onPaddingIntervalChange={onPaddingIntervalChange}
          onDurationError={onDurationError}
          disabled={disabled}
        />
      )}
    </div>
  );
}
