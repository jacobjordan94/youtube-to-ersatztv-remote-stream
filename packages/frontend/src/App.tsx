import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { convertVideo } from '@/services/api';
import { downloadFile } from '@/utils/download';
import { DEFAULT_SCRIPT_TEMPLATE } from '@youtube-to-ersatztv/shared';

function App() {
  const [url, setUrl] = useState('');
  const [includeDuration, setIncludeDuration] = useState(false);
  const [scriptOptions, setScriptOptions] = useState('--hls-use-mpegts');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [yamlPreview, setYamlPreview] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string | null>(null);

  const handleConvert = async () => {
    setError(null);
    setYamlPreview(null);
    setVideoTitle(null);

    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    setLoading(true);

    try {
      const response = await convertVideo({
        url: url.trim(),
        includeDuration,
        scriptOptions,
      });

      setYamlPreview(response.yaml);
      setVideoTitle(response.metadata.title);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!yamlPreview || !videoTitle) return;

    const sanitizedFilename = videoTitle
      .replace(/[^a-z0-9\s-]/gi, '')
      .replace(/\s+/g, '-')
      .toLowerCase()
      .substring(0, 200);

    downloadFile(yamlPreview, `${sanitizedFilename}.yml`);
  };

  const handleReset = () => {
    setUrl('');
    setIncludeDuration(false);
    setScriptOptions('--hls-use-mpegts');
    setError(null);
    setYamlPreview(null);
    setVideoTitle(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            YouTube to ErsatzTV Converter
          </h1>
          <p className="text-lg text-gray-600">
            Convert YouTube videos to ErsatzTV-compatible remote stream YAML files
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="space-y-6">
            <div>
              <Label htmlFor="url" className="text-base font-semibold mb-2 block">
                YouTube URL
              </Label>
              <Input
                id="url"
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
                className="text-base"
              />
              <p className="text-sm text-gray-500 mt-2">
                Enter a YouTube video URL (playlists not supported in MVP)
              </p>
            </div>

            <div>
              <Label className="text-base font-semibold mb-3 block">Configuration Options</Label>

              <div className="space-y-4 bg-gray-50 p-4 rounded-md">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeDuration"
                    checked={includeDuration}
                    onCheckedChange={(checked) => setIncludeDuration(checked as boolean)}
                    disabled={loading}
                  />
                  <Label
                    htmlFor="includeDuration"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Always include duration (even for VOD content)
                  </Label>
                </div>

                <div>
                  <Label htmlFor="scriptOptions" className="text-sm font-medium mb-2 block">
                    Script Options
                  </Label>
                  <Input
                    id="scriptOptions"
                    type="text"
                    value={scriptOptions}
                    onChange={(e) => setScriptOptions(e.target.value)}
                    disabled={loading}
                    placeholder="--hls-use-mpegts"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Default template: {DEFAULT_SCRIPT_TEMPLATE}
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={handleConvert} disabled={loading} className="flex-1">
                {loading ? 'Converting...' : 'Convert'}
              </Button>
              <Button onClick={handleReset} variant="outline" disabled={loading}>
                Reset
              </Button>
            </div>
          </div>
        </div>

        {yamlPreview && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">YAML Preview</h2>
              <Button onClick={handleDownload}>Download YAML</Button>
            </div>

            <div className="bg-gray-900 text-gray-100 p-6 rounded-md overflow-x-auto">
              <pre className="text-sm font-mono whitespace-pre">{yamlPreview}</pre>
            </div>

            {videoTitle && (
              <p className="mt-4 text-sm text-gray-600">
                Video: <span className="font-medium">{videoTitle}</span>
              </p>
            )}
          </div>
        )}

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            Built for{' '}
            <a
              href="https://ersatztv.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              ErsatzTV
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
