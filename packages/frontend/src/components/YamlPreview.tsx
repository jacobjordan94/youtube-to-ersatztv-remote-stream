import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from './ui/button';
import { Copy, Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export type DownloadMethod = 'zip' | 'queue' | 'current';

interface PlaylistVideo {
  metadata: {
    title: string;
    videoId: string;
    description: string;
    duration: string;
    isLive: boolean;
  };
  yaml: string;
}

interface YamlPreviewProps {
  yaml: string;
  filename: string;
  playlistVideos?: PlaylistVideo[];
  selectedVideoIndex?: number;
  onVideoChange?: (index: number) => void;
  visitedFiles?: Set<number>;
}

export function YamlPreview({
  yaml,
  filename,
  playlistVideos,
  selectedVideoIndex = 0,
  onVideoChange,
  visitedFiles
}: YamlPreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(yaml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = yaml.split('\n');
  const isPlaylist = playlistVideos && playlistVideos.length > 0;

  return (
    <div className="bg-transparent rounded-lg shadow-lg overflow-hidden">
      {/* Editor Header */}
      <div className="bg-neutral-900 text-gray-100 px-4 py-3 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center flex-1 min-w-0">
          {isPlaylist ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 text-sm font-mono text-gray-300 hover:text-white transition-colors cursor-pointer bg-transparent border-none outline-none focus:outline-none">
                  <span className="truncate">{filename}</span>
                  <ChevronDown className="w-4 h-4 flex-shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-96 max-h-96 overflow-y-auto">
                {playlistVideos.map((video, index) => {
                  const isVisited = visitedFiles?.has(index) ?? true;
                  return (
                    <DropdownMenuItem
                      key={index}
                      onClick={() => onVideoChange?.(index)}
                      className={selectedVideoIndex === index ? 'bg-gray-700' : ''}
                    >
                      <div className="flex items-center gap-2 w-full">
                        {!isVisited && (
                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" title="Unvisited" />
                        )}
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="font-medium truncate">
                            {index + 1}. {video.metadata.title}
                          </span>
                          <span className="text-xs text-gray-400">
                            {video.metadata.duration} {video.metadata.isLive ? '• Live' : ''}
                          </span>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <span className="text-sm font-mono text-gray-300">{filename}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleCopy}
            variant="ghost"
            size="sm"
            className="text-gray-300 hover:text-white hover:bg-gray-700"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div>
        {/* Code Content */}
          <SyntaxHighlighter
            language="yaml"
            style={vscDarkPlus}
            showLineNumbers={true}
            wrapLines={true}
            customStyle={{
              margin: 0,
              padding: '1rem 1rem',
              background: '#1e1e1e',
              fontSize: '0.875rem',
              lineHeight: '1.5rem',
              width: '100%',
            }}
            codeTagProps={{
              style: {
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              },
            }}
          >
            {yaml}
          </SyntaxHighlighter>
      </div>

      {/* Footer Info */}
      <div className="bg-neutral-900 text-gray-400 px-4 py-2 text-xs font-mono border-t border-gray-700 flex justify-between items-center">
        <span>YAML</span>
        <span>{lines.length} lines</span>
      </div>
    </div>
  );
}
