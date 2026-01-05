import { useState, useEffect } from 'react';
import type { PlaylistVideo } from '@youtube-to-ersatztv/shared';
import type { ConversionResult } from '@/types/conversion';
import type { ConfigSettings, SettingsMode, FilenameFormat } from '@/types/config';
import type { VideoMetadata } from '@/types/metadata';
import type { DownloadMethod } from '@/components/YamlPreview';
import { generateYaml } from '@/utils/yaml';
import { downloadFile } from '@/utils/download';
import { downloadAsZip, downloadAsQueue, downloadCurrent } from '@/utils/download-playlist';
import { formatFilename } from '@/utils/filename';
import { BackButton } from './BackButton';
import { SettingsModeToggle } from './SettingsModeToggle';
import { YamlPreview } from './YamlPreview';
import { ConfigurationPanel } from './ConfigurationPanel';
import { ModeChangeDialog } from './ModeChangeDialog';
import { ResetAllDialog } from './ResetAllDialog';

interface ConfigScreenProps {
  onBack: () => void;
  isPlaylist: boolean;
  conversionResult: ConversionResult;
}

export function ConfigScreen({ onBack, isPlaylist, conversionResult }: ConfigScreenProps) {
  // Configuration state - all settings
  const [durationMode, setDurationMode] = useState<'none' | 'custom' | 'api' | 'api-padded'>(
    conversionResult.initialSettings.durationMode
  );
  const [customDuration, setCustomDuration] = useState(
    conversionResult.initialSettings.customDuration
  );
  const [paddingInterval, setPaddingInterval] = useState(
    conversionResult.initialSettings.paddingInterval
  );
  const [durationError, setDurationError] = useState<string | null>(null);
  const [livestreamDuration, setLivestreamDuration] = useState(
    conversionResult.initialSettings.livestreamDuration
  );
  const [customLivestreamDuration, setCustomLivestreamDuration] = useState(
    conversionResult.initialSettings.customLivestreamDuration
  );
  const [livestreamDurationError, setLivestreamDurationError] = useState<string | null>(null);
  const [includeTitle, setIncludeTitle] = useState(conversionResult.initialSettings.includeTitle);
  const [includeDescription, setIncludeDescription] = useState(
    conversionResult.initialSettings.includeDescription
  );
  const [descriptionFormat, setDescriptionFormat] = useState<'string' | 'folded' | 'literal'>(
    conversionResult.initialSettings.descriptionFormat
  );
  const [scriptOptions, setScriptOptions] = useState(
    conversionResult.initialSettings.scriptOptions
  );
  const [filenameFormat, setFilenameFormat] = useState<FilenameFormat>(
    conversionResult.initialSettings.filenameFormat
  );

  // Video/playlist display state
  const [yamlPreview, setYamlPreview] = useState<string | null>(conversionResult.firstVideo.yaml);
  const [videoTitle, setVideoTitle] = useState<string | null>(conversionResult.firstVideo.title);
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(
    conversionResult.firstVideo.metadata
  );
  const [playlistVideos, setPlaylistVideos] = useState<PlaylistVideo[]>(conversionResult.videos);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);

  // Playlist mode state
  const [settingsMode, setSettingsMode] = useState<SettingsMode>('global');
  const [perFileSettings, setPerFileSettings] = useState<Map<number, ConfigSettings>>(new Map());
  const [originalSettings] = useState<Map<number, ConfigSettings>>(() => {
    const map = new Map<number, ConfigSettings>();
    conversionResult.videos.forEach((_, index) => {
      map.set(index, conversionResult.initialSettings);
    });
    return map;
  });
  const [visitedFiles, setVisitedFiles] = useState<Set<number>>(new Set([0]));
  const [applySettingsToNew, setApplySettingsToNew] = useState(false);

  // Dialog state
  const [showModeChangeDialog, setShowModeChangeDialog] = useState(false);
  const [showResetAllDialog, setShowResetAllDialog] = useState(false);

  // Get current configuration settings
  const getCurrentSettings = (): ConfigSettings => ({
    durationMode,
    customDuration,
    paddingInterval,
    scriptOptions,
    livestreamDuration,
    customLivestreamDuration,
    includeTitle,
    includeDescription,
    descriptionFormat,
    filenameFormat,
  });

  // Apply configuration settings
  const applySettings = (settings: ConfigSettings) => {
    setDurationMode(settings.durationMode);
    setCustomDuration(settings.customDuration);
    setPaddingInterval(settings.paddingInterval);
    setScriptOptions(settings.scriptOptions);
    setLivestreamDuration(settings.livestreamDuration);
    setCustomLivestreamDuration(settings.customLivestreamDuration);
    setIncludeTitle(settings.includeTitle);
    setIncludeDescription(settings.includeDescription);
    setDescriptionFormat(settings.descriptionFormat);
    setFilenameFormat(settings.filenameFormat);
  };

  // Save current settings for current video (per-file mode only)
  const saveCurrentPerFileSettings = () => {
    if (settingsMode === 'per-file' && playlistVideos.length > 0) {
      const newSettings = new Map(perFileSettings);
      newSettings.set(selectedVideoIndex, getCurrentSettings());
      setPerFileSettings(newSettings);
    }
  };

  // Load settings for current video (per-file mode only)
  const loadPerFileSettings = (index: number) => {
    if (settingsMode === 'per-file') {
      const hasVisited = visitedFiles.has(index);
      const settings = perFileSettings.get(index);

      if (settings) {
        // File has custom settings saved, apply them
        applySettings(settings);
      } else if (!hasVisited) {
        // First time visiting this file
        if (applySettingsToNew) {
          // Apply current settings to new file
          // Settings will be auto-saved by the auto-save useEffect
        } else {
          // Reset to original settings for this file
          const originalFileSettings = originalSettings.get(index);
          if (originalFileSettings) {
            applySettings(originalFileSettings);
          }
        }
      }
      // If no saved settings and already visited, keep current settings

      // Mark file as visited
      setVisitedFiles((prev) => new Set(prev).add(index));
    }
  };

  // Auto-save current settings in per-file mode when settings change
  useEffect(() => {
    if (settingsMode === 'per-file' && playlistVideos.length > 0) {
      const newSettings = new Map(perFileSettings);
      newSettings.set(selectedVideoIndex, getCurrentSettings());
      setPerFileSettings(newSettings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    durationMode,
    customDuration,
    paddingInterval,
    scriptOptions,
    livestreamDuration,
    customLivestreamDuration,
    includeTitle,
    includeDescription,
    descriptionFormat,
    settingsMode,
    filenameFormat,
  ]);

  // Regenerate YAML when duration or script settings change
  useEffect(() => {
    if (playlistVideos.length > 0) {
      let updatedVideos: PlaylistVideo[];

      if (settingsMode === 'global') {
        // Global mode: apply current settings to all videos
        const currentSettings = getCurrentSettings();
        updatedVideos = playlistVideos.map((video, index) => {
          const cleanUrl = `https://youtube.com/watch?v=${video.metadata.videoId}`;
          const newYaml = generateYaml(
            {
              title: video.metadata.title,
              description: video.metadata.description,
              duration: video.metadata.duration,
              isLive: video.metadata.isLive,
              videoUrl: cleanUrl,
            },
            currentSettings
          );
          const filename = formatFilename(
            video.metadata.title,
            currentSettings.filenameFormat,
            index
          );
          return {
            ...video,
            yaml: newYaml,
            filename: `${filename}.yml`,
          };
        });
      } else {
        // Per-file mode: apply per-file settings to each video
        updatedVideos = playlistVideos.map((video, index) => {
          const cleanUrl = `https://youtube.com/watch?v=${video.metadata.videoId}`;
          const settings = perFileSettings.get(index) || getCurrentSettings();
          const newYaml = generateYaml(
            {
              title: video.metadata.title,
              description: video.metadata.description,
              duration: video.metadata.duration,
              isLive: video.metadata.isLive,
              videoUrl: cleanUrl,
            },
            settings
          );
          const filename = formatFilename(video.metadata.title, settings.filenameFormat, index);
          return {
            ...video,
            yaml: newYaml,
            filename: `${filename}.yml`,
          };
        });
      }

      setPlaylistVideos(updatedVideos);
      // Update the currently displayed YAML
      setYamlPreview(updatedVideos[selectedVideoIndex].yaml);
    } else if (videoMetadata) {
      // Single video mode
      const newYaml = generateYaml(videoMetadata, getCurrentSettings());
      setYamlPreview(newYaml);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    durationMode,
    customDuration,
    paddingInterval,
    scriptOptions,
    livestreamDuration,
    customLivestreamDuration,
    includeTitle,
    includeDescription,
    descriptionFormat,
    settingsMode,
    perFileSettings,
    filenameFormat,
  ]);

  // Reset duration mode if playlist detected and custom duration is selected
  useEffect(() => {
    if (isPlaylist && durationMode === 'custom') {
      setDurationMode('none');
    }
  }, [isPlaylist, durationMode]);

  // Download handlers
  const handleDownload = () => {
    if (!yamlPreview || !videoTitle) return;

    const filename = formatFilename(videoTitle, filenameFormat);
    downloadFile(yamlPreview, `${filename}.yml`);
  };

  const handlePlaylistDownload = async (method: DownloadMethod) => {
    if (playlistVideos.length === 0) return;

    if (method === 'current') {
      downloadCurrent(playlistVideos[selectedVideoIndex]);
    } else if (method === 'zip') {
      await downloadAsZip(playlistVideos);
    } else if (method === 'queue') {
      await downloadAsQueue(playlistVideos);
    }
  };

  // Mode toggle handlers
  const handleModeToggle = (newMode: SettingsMode) => {
    // If switching FROM per-file TO global, warn about discarding settings
    if (settingsMode === 'per-file' && newMode === 'global' && perFileSettings.size > 0) {
      setShowModeChangeDialog(true);
    } else {
      setSettingsMode(newMode);

      // If switching TO per-file, initialize state
      if (newMode === 'per-file') {
        const newSettings = new Map<number, ConfigSettings>();
        newSettings.set(selectedVideoIndex, getCurrentSettings());
        setPerFileSettings(newSettings);
        setVisitedFiles(new Set([selectedVideoIndex]));
      }
    }
  };

  const confirmModeChange = () => {
    setSettingsMode('global');
    setPerFileSettings(new Map());
    setVisitedFiles(new Set());
    setApplySettingsToNew(false);
    setShowModeChangeDialog(false);
  };

  const cancelModeChange = () => {
    setShowModeChangeDialog(false);
  };

  const handleResetAll = () => {
    // Reset all files to their original settings
    const newPerFileSettings = new Map();
    const newVisitedFiles = new Set<number>();

    // Apply original settings to all files
    playlistVideos.forEach((_, index) => {
      const originalFileSettings = originalSettings.get(index);
      if (originalFileSettings) {
        newPerFileSettings.set(index, originalFileSettings);
      }
    });

    // Keep current file as visited
    newVisitedFiles.add(selectedVideoIndex);

    // Apply original settings for current file
    const currentFileOriginalSettings = originalSettings.get(selectedVideoIndex);
    if (currentFileOriginalSettings) {
      applySettings(currentFileOriginalSettings);
    }

    setPerFileSettings(newPerFileSettings);
    setVisitedFiles(newVisitedFiles);
    setShowResetAllDialog(false);
  };

  const cancelResetAll = () => {
    setShowResetAllDialog(false);
  };

  const handlePlaylistVideoChange = (index: number) => {
    if (index < 0 || index >= playlistVideos.length) return;

    // Save current settings before switching
    saveCurrentPerFileSettings();

    setSelectedVideoIndex(index);
    const selectedVideo = playlistVideos[index];
    setYamlPreview(selectedVideo.yaml);
    setVideoTitle(selectedVideo.metadata.title);
    const cleanUrl = `https://youtube.com/watch?v=${selectedVideo.metadata.videoId}`;
    setVideoMetadata({
      title: selectedVideo.metadata.title,
      description: selectedVideo.metadata.description,
      duration: selectedVideo.metadata.duration,
      isLive: selectedVideo.metadata.isLive,
      videoUrl: cleanUrl,
    });

    // Load settings for new video
    loadPerFileSettings(index);
  };

  const handleApplyCurrentToUnvisited = () => {
    const currentSettings = getCurrentSettings();
    const newPerFileSettings = new Map(perFileSettings);
    const newVisitedFiles = new Set(visitedFiles);

    // Apply current settings to all unvisited files
    playlistVideos.forEach((_, index) => {
      if (!visitedFiles.has(index)) {
        newPerFileSettings.set(index, currentSettings);
        newVisitedFiles.add(index);
      }
    });

    setPerFileSettings(newPerFileSettings);
    setVisitedFiles(newVisitedFiles);
  };

  const handleApplyCurrentToAll = () => {
    const currentSettings = getCurrentSettings();
    const newPerFileSettings = new Map();
    const newVisitedFiles = new Set<number>();

    // Apply current settings to ALL files
    playlistVideos.forEach((_, index) => {
      newPerFileSettings.set(index, currentSettings);
      newVisitedFiles.add(index);
    });

    setPerFileSettings(newPerFileSettings);
    setVisitedFiles(newVisitedFiles);
  };

  return (
    <>
      <BackButton onBack={onBack} />

      {yamlPreview && videoTitle && (
        <>
          {/* Mode Toggle - Only in playlist mode */}
          {isPlaylist && (
            <SettingsModeToggle
              settingsMode={settingsMode}
              onModeToggle={handleModeToggle}
              applySettingsToNew={applySettingsToNew}
              visitedFiles={visitedFiles}
              playlistVideos={playlistVideos}
              perFileSettings={perFileSettings}
              onApplySettingsToNewChange={setApplySettingsToNew}
              onApplyCurrentToUnvisited={handleApplyCurrentToUnvisited}
              onApplyCurrentToAll={handleApplyCurrentToAll}
              onResetAll={() => setShowResetAllDialog(true)}
            />
          )}

          <YamlPreview
            yaml={yamlPreview}
            filename={
              isPlaylist && playlistVideos[selectedVideoIndex]
                ? playlistVideos[selectedVideoIndex].filename
                : `${formatFilename(videoTitle || '', filenameFormat)}.yml`
            }
            playlistVideos={isPlaylist ? playlistVideos : undefined}
            selectedVideoIndex={selectedVideoIndex}
            onVideoChange={handlePlaylistVideoChange}
            visitedFiles={settingsMode === 'per-file' ? visitedFiles : undefined}
          />
        </>
      )}

      <ConfigurationPanel
        videoTitle={videoTitle}
        playlistVideos={playlistVideos}
        selectedVideoIndex={selectedVideoIndex}
        settingsMode={settingsMode}
        livestreamDuration={livestreamDuration}
        customLivestreamDuration={customLivestreamDuration}
        livestreamDurationError={livestreamDurationError}
        onLivestreamDurationChange={setLivestreamDuration}
        onCustomLivestreamDurationChange={setCustomLivestreamDuration}
        onLivestreamDurationError={setLivestreamDurationError}
        durationMode={durationMode}
        customDuration={customDuration}
        paddingInterval={paddingInterval}
        durationError={durationError}
        isPlaylist={isPlaylist}
        onDurationModeChange={setDurationMode}
        onCustomDurationChange={setCustomDuration}
        onPaddingIntervalChange={setPaddingInterval}
        onDurationError={setDurationError}
        isLive={isPlaylist ? null : (videoMetadata?.isLive ?? null)}
        scriptOptions={scriptOptions}
        onScriptOptionsChange={setScriptOptions}
        includeTitle={includeTitle}
        includeDescription={includeDescription}
        descriptionFormat={descriptionFormat}
        onIncludeTitleChange={setIncludeTitle}
        onIncludeDescriptionChange={setIncludeDescription}
        onDescriptionFormatChange={setDescriptionFormat}
        filenameFormat={filenameFormat}
        onFilenameFormatChange={setFilenameFormat}
        onVideoChange={handlePlaylistVideoChange}
        onDownload={handleDownload}
        onPlaylistDownload={handlePlaylistDownload}
        disabled={false}
      />

      <ModeChangeDialog
        open={showModeChangeDialog}
        onConfirm={confirmModeChange}
        onCancel={cancelModeChange}
      />

      <ResetAllDialog
        open={showResetAllDialog}
        onConfirm={handleResetAll}
        onCancel={cancelResetAll}
      />
    </>
  );
}
