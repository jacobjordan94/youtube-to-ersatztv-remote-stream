import { useState } from 'react';
import type { PlaylistVideo } from '@youtube-to-ersatztv/shared';
import { convertVideo, convertPlaylist } from '@/services/api';
import { generateYaml } from '@/utils/yaml';
import { formatFilename } from '@/utils/filename';
import {
  validateYouTubeVideoUrl,
  validateYouTubePlaylistUrl,
  sanitizeScriptOptions,
} from '@/utils/validation';
import type { ConversionResult } from '@/types/conversion';
import type { ConfigSettings, AppScreen } from '@/types/config';
import { InputScreen } from './components/InputScreen';
import { ConfigScreen } from './components/ConfigScreen';
import { Footer } from './components/Footer';
import { AnimatePresence, motion } from 'motion/react';
import { BackButton } from './components/BackButton';

function App() {
  // Minimal shared state
  const [url, setUrl] = useState('');
  const [isPlaylist, setIsPlaylist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appScreen, setAppScreen] = useState<AppScreen>('input');
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);

  // Initial settings to use for conversion
  const getInitialSettings = (): ConfigSettings => ({
    durationMode: 'none',
    customDuration: '00:00:00',
    paddingInterval: 5,
    scriptOptions: '--hls-use-mpegts',
    livestreamDuration: '00:00:00',
    customLivestreamDuration: '00:00:00',
    includeTitle: false,
    includePlot: false,
    plotFormat: 'literal',
    includeYear: false,
    includeContentRating: false,
    contentRating: '',
    filenameFormat: 'compact',
    includeThumbnail: false,
    thumbnailResolution: 'highest',
  });

  const handleConvert = async () => {
    setError(null);

    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    // Validate URL based on type
    const validationResult = isPlaylist
      ? validateYouTubePlaylistUrl(url)
      : validateYouTubeVideoUrl(url);

    if (!validationResult.valid) {
      setError(validationResult.error || 'Invalid YouTube URL');
      return;
    }

    setLoading(true);

    try {
      const initialSettings = getInitialSettings();

      // Sanitize script options before sending to API
      const sanitizedScriptOptions = sanitizeScriptOptions(initialSettings.scriptOptions);

      if (isPlaylist) {
        // Handle playlist conversion
        const response = await convertPlaylist({
          url: url.trim(),
          durationMode: initialSettings.durationMode,
          scriptOptions: sanitizedScriptOptions,
          customDuration:
            initialSettings.durationMode === 'custom' ? initialSettings.customDuration : undefined,
          paddingInterval:
            initialSettings.durationMode === 'api-padded'
              ? initialSettings.paddingInterval
              : undefined,
        });

        if (response.videos.length === 0) {
          setError('No videos found in playlist');
          return;
        }

        // Set the first video as selected
        const firstVideo = response.videos[0];
        const cleanUrl = `https://youtube.com/watch?v=${firstVideo.metadata.videoId}`;
        const metadata = {
          title: firstVideo.metadata.title,
          description: firstVideo.metadata.description,
          duration: firstVideo.metadata.duration,
          isLive: firstVideo.metadata.isLive,
          videoUrl: cleanUrl,
          publishedAt: firstVideo.metadata.publishedAt,
          thumbnails: firstVideo.metadata.thumbnails,
        };

        // Generate initial YAML for first video
        const initialYaml = generateYaml(metadata, initialSettings);

        setConversionResult({
          videos: response.videos,
          firstVideo: {
            metadata,
            title: firstVideo.metadata.title,
            yaml: initialYaml,
          },
          initialSettings,
        });

        // Switch to config screen after successful fetch
        setAppScreen('config');
      } else {
        // Handle single video conversion
        const response = await convertVideo({
          url: url.trim(),
          durationMode: initialSettings.durationMode,
          scriptOptions: sanitizedScriptOptions,
          customDuration:
            initialSettings.durationMode === 'custom' ? initialSettings.customDuration : undefined,
          paddingInterval:
            initialSettings.durationMode === 'api-padded'
              ? initialSettings.paddingInterval
              : undefined,
        });

        // Store clean URL constructed from video ID
        const cleanUrl = `https://youtube.com/watch?v=${response.metadata.videoId}`;
        const metadata = {
          title: response.metadata.title,
          description: response.metadata.description,
          duration: response.metadata.duration,
          isLive: response.metadata.isLive,
          videoUrl: cleanUrl,
          publishedAt: response.metadata.publishedAt,
          thumbnails: response.metadata.thumbnails,
        };

        // Generate initial YAML
        const initialYaml = generateYaml(metadata, initialSettings);

        // Create a single-video "playlist" for consistency
        const singleVideoPlaylist: PlaylistVideo = {
          metadata: response.metadata,
          yaml: initialYaml,
          filename: `${formatFilename(response.metadata.title, initialSettings.filenameFormat)}.yml`,
        };

        setConversionResult({
          videos: [singleVideoPlaylist],
          firstVideo: {
            metadata,
            title: response.metadata.title,
            yaml: initialYaml,
          },
          initialSettings,
        });

        // Switch to config screen after successful fetch
        setAppScreen('config');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUrl('');
    setIsPlaylist(false);
    setError(null);
    setAppScreen('input');
    setConversionResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-neutral-700">
      <div className="container mx-auto px-4 pt-12 pb-4 max-w-4xl">
        <AnimatePresence mode="wait">
          {appScreen !== 'input' && conversionResult && (
            <motion.div
              className="fixed top-4 left-4 z-40"
              initial={{ x: -50 }}
              animate={{ x: 0 }}
              exit={{ y: -50 }}
            >
              <BackButton onBack={handleReset} />
            </motion.div>
          )}
          {appScreen === 'input' ? (
            <motion.div
              key="input-screen"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <InputScreen
                url={url}
                onUrlChange={setUrl}
                onPlaylistDetected={setIsPlaylist}
                onConvert={handleConvert}
                error={error}
                loading={loading}
              />
            </motion.div>
          ) : (
            conversionResult && (
              <motion.div
                key="result-screen"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <ConfigScreen isPlaylist={isPlaylist} conversionResult={conversionResult} />
              </motion.div>
            )
          )}
        </AnimatePresence>

        <Footer />
      </div>
    </div>
  );
}

export default App;
