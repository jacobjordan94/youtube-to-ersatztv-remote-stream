import { Button } from '@/components/ui/button';
import { YOUTUBE_URL_PATTERNS } from '@youtube-to-ersatztv/shared';
import { Loader2 } from 'lucide-react';
import { UrlInput } from './UrlInput';
import { PasteButton } from './PasteButton';
import ApplicationHeader from './ApplicationHeader';

interface InputScreenProps {
  url: string;
  onUrlChange: (url: string) => void;
  onPlaylistDetected: (isPlaylist: boolean) => void;
  onConvert: () => Promise<void>;
  error: string | null;
  loading: boolean;
}

export function InputScreen({
  url,
  onUrlChange,
  onPlaylistDetected,
  onConvert,
  error,
  loading,
}: InputScreenProps) {
  // Function to detect if URL is a playlist
  const detectUrlType = (inputUrl: string) => {
    if (!inputUrl.trim()) {
      onPlaylistDetected(false);
      return;
    }

    const playlistMatch = inputUrl.match(YOUTUBE_URL_PATTERNS.PLAYLIST);
    onPlaylistDetected(!!playlistMatch);
  };

  // Handle URL changes and detect playlist
  const handleUrlChange = (newUrl: string) => {
    onUrlChange(newUrl);
    detectUrlType(newUrl);
  };

  // Handle paste from clipboard
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const trimmedText = text.trim();
      onUrlChange(trimmedText);
      detectUrlType(trimmedText);
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConvert();
  };

  return (
    <>
      <ApplicationHeader />
      <div className="bg-neutral-900 rounded-lg shadow-lg p-8 mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="flex gap-2">
              <div className="flex-1">
                <UrlInput url={url} onUrlChange={handleUrlChange} disabled={loading} />
              </div>
              <div className="flex">
                <PasteButton onPaste={handlePaste} disabled={loading} className="mt-[22px]" />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Go'
            )}
          </Button>
        </form>
      </div>
    </>
  );
}
