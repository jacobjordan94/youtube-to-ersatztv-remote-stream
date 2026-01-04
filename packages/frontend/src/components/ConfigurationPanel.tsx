import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PlaylistVideo } from '@youtube-to-ersatztv/shared';
import type { DownloadMethod } from '@/components/YamlPreview';
import type { FilenameFormat } from '@/types/config';
import { DurationConfig } from './DurationConfig';
import { ScriptOptionsInput } from './ScriptOptionsInput';
import { AdditionalConfig } from './AdditionalConfig';
import { DownloadControls } from './DownloadControls';
import { formatFilename } from '@/utils/filename';

interface ConfigurationPanelProps {
  videoTitle: string | null;
  playlistVideos: PlaylistVideo[];
  selectedVideoIndex: number;
  settingsMode: 'global' | 'per-file';

  // Duration config props
  livestreamDuration: string;
  customLivestreamDuration: string;
  livestreamDurationError: string | null;
  onLivestreamDurationChange: (value: string) => void;
  onCustomLivestreamDurationChange: (value: string) => void;
  onLivestreamDurationError: (error: string | null) => void;
  durationMode: 'none' | 'custom' | 'api' | 'api-padded';
  customDuration: string;
  paddingInterval: number;
  durationError: string | null;
  isPlaylist: boolean;
  onDurationModeChange: (mode: 'none' | 'custom' | 'api' | 'api-padded') => void;
  onCustomDurationChange: (value: string) => void;
  onPaddingIntervalChange: (interval: number) => void;
  onDurationError: (error: string | null) => void;

  // Content type detection (null for playlist, boolean for single video)
  isLive: boolean | null;

  // Script options
  scriptOptions: string;
  onScriptOptionsChange: (value: string) => void;

  // Additional fields
  includeTitle: boolean;
  includeDescription: boolean;
  descriptionFormat: 'string' | 'folded' | 'literal';
  onIncludeTitleChange: (checked: boolean) => void;
  onIncludeDescriptionChange: (checked: boolean) => void;
  onDescriptionFormatChange: (format: 'string' | 'folded' | 'literal') => void;

  // Filename format
  filenameFormat: FilenameFormat;
  onFilenameFormatChange: (format: FilenameFormat) => void;

  // Navigation (per-file mode)
  onVideoChange: (index: number) => void;

  // Download
  onDownload: () => void;
  onPlaylistDownload: (method: DownloadMethod) => void;

  disabled: boolean;
}

export function ConfigurationPanel({
  videoTitle,
  playlistVideos,
  selectedVideoIndex,
  settingsMode,
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
  scriptOptions,
  onScriptOptionsChange,
  includeTitle,
  includeDescription,
  descriptionFormat,
  onIncludeTitleChange,
  onIncludeDescriptionChange,
  onDescriptionFormatChange,
  filenameFormat,
  onFilenameFormatChange,
  onVideoChange,
  onDownload,
  onPlaylistDownload,
  disabled,
}: ConfigurationPanelProps) {
  // Determine panel header title
  let panelTitle: string;
  if (playlistVideos.length === 0) {
    panelTitle = 'Configuration Options';
  } else if (settingsMode === 'global') {
    panelTitle = 'Configuration Options - Global';
  } else {
    const formatted = videoTitle
      ? formatFilename(videoTitle, filenameFormat)
      : 'unknown';
    panelTitle = `Configuration Options - ${formatted}.yml`;
  }

  return (
    <div className="bg-neutral-900 rounded-lg shadow-lg p-8 pt-4 mb-8 mt-4">
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-white font-semibold truncate leading-1">
              {panelTitle}
            </Label>
            {/* Navigation Buttons - Per-file mode only */}
            {playlistVideos.length > 0 && settingsMode === 'per-file' && (
              <div className="flex gap-2 ml-4">
                <Button
                  onClick={() => onVideoChange(selectedVideoIndex - 1)}
                  disabled={selectedVideoIndex === 0}
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-white"
                  title={selectedVideoIndex > 0 ? playlistVideos[selectedVideoIndex - 1].metadata.title : ''}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Prev
                </Button>
                <Button
                  onClick={() => onVideoChange(selectedVideoIndex + 1)}
                  disabled={selectedVideoIndex === playlistVideos.length - 1}
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-white"
                  title={selectedVideoIndex < playlistVideos.length - 1 ? playlistVideos[selectedVideoIndex + 1].metadata.title : ''}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
          <div className="space-y-4 bg-neutral-800 p-4 rounded-md">
            <DurationConfig
              livestreamDuration={livestreamDuration}
              customLivestreamDuration={customLivestreamDuration}
              livestreamDurationError={livestreamDurationError}
              onLivestreamDurationChange={onLivestreamDurationChange}
              onCustomLivestreamDurationChange={onCustomLivestreamDurationChange}
              onLivestreamDurationError={onLivestreamDurationError}
              durationMode={durationMode}
              customDuration={customDuration}
              paddingInterval={paddingInterval}
              durationError={durationError}
              isPlaylist={isPlaylist}
              isLive={isLive}
              onDurationModeChange={onDurationModeChange}
              onCustomDurationChange={onCustomDurationChange}
              onPaddingIntervalChange={onPaddingIntervalChange}
              onDurationError={onDurationError}
              disabled={disabled}
            />

            <ScriptOptionsInput
              scriptOptions={scriptOptions}
              onScriptOptionsChange={onScriptOptionsChange}
              disabled={disabled}
            />

            <AdditionalConfig
              includeTitle={includeTitle}
              includeDescription={includeDescription}
              descriptionFormat={descriptionFormat}
              onIncludeTitleChange={onIncludeTitleChange}
              onIncludeDescriptionChange={onIncludeDescriptionChange}
              onDescriptionFormatChange={onDescriptionFormatChange}
              filenameFormat={filenameFormat}
              onFilenameFormatChange={onFilenameFormatChange}
              isPlaylist={isPlaylist}
              disabled={disabled}
            />
          </div>
        </div>
        <div className="download-controls">
          <DownloadControls
            playlistVideos={playlistVideos}
            onDownload={onDownload}
            onPlaylistDownload={onPlaylistDownload}
          />
        </div>
      </div>
    </div>
  );
}
