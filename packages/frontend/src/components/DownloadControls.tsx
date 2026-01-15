import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from './ui/separator';
import { Download, ChevronDown } from 'lucide-react';
import type { PlaylistVideo } from '@youtube-to-ersatztv/shared';
import type { DownloadMethod } from '@/components/YamlPreview';

interface DownloadControlsProps {
  playlistVideos: PlaylistVideo[];
  includeThumbnail: boolean;
  onDownload: () => void;
  onPlaylistDownload: (method: DownloadMethod) => void;
}

export function DownloadControls({
  playlistVideos,
  includeThumbnail,
  onDownload,
  onPlaylistDownload,
}: DownloadControlsProps) {
  const isSingleVideo = playlistVideos.length <= 1;

  // Single video mode WITHOUT thumbnail - simple button
  if (isSingleVideo && !includeThumbnail) {
    return (
      <Button onClick={onDownload} className="w-full">
        <Download className="w-4 h-4 mr-2" />
        Download File
      </Button>
    );
  }

  // Single video mode WITH thumbnail - dropdown
  if (isSingleVideo && includeThumbnail) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Download
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuItem onClick={() => onPlaylistDownload('current-queue')}>
            <div className="flex flex-col">
              <span className="font-medium">Download file and thumbnail</span>
              <span className="text-xs text-gray-400">Downloads as separate files</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onPlaylistDownload('current-zip')}>
            <div className="flex flex-col">
              <span className="font-medium">Download all as zip</span>
              <span className="text-xs text-gray-400">YAML and thumbnail in one archive</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Playlist mode WITHOUT thumbnail
  if (!includeThumbnail) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Download
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => onPlaylistDownload('current')}>
            <div className="flex flex-col">
              <span className="font-medium">Download Current File</span>
              <span className="text-xs text-gray-400">Download only this video</span>
            </div>
          </DropdownMenuItem>
          <Separator className="my-1" />
          <DropdownMenuItem onClick={() => onPlaylistDownload('zip')}>
            <div className="flex flex-col">
              <span className="font-medium">Download All as ZIP</span>
              <span className="text-xs text-gray-400">All files in one archive</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onPlaylistDownload('queue')}>
            <div className="flex flex-col">
              <span className="font-medium">Download All as Queue</span>
              <span className="text-xs text-gray-400">Files download one after another</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Playlist mode WITH thumbnail
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="w-full">
          <Download className="w-4 h-4 mr-2" />
          Download
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuItem onClick={() => onPlaylistDownload('current-queue')}>
          <div className="flex flex-col">
            <span className="font-medium">Download current file and thumbnail</span>
            <span className="text-xs text-gray-400">Downloads as separate files</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onPlaylistDownload('current-zip')}>
          <div className="flex flex-col">
            <span className="font-medium">Download current file and thumbnail (zip)</span>
            <span className="text-xs text-gray-400">Current YAML and thumbnail in one archive</span>
          </div>
        </DropdownMenuItem>
        <Separator className="my-1" />
        <DropdownMenuItem onClick={() => onPlaylistDownload('zip')}>
          <div className="flex flex-col">
            <span className="font-medium">Download All as ZIP</span>
            <span className="text-xs text-gray-400">All files and thumbnails in one archive</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onPlaylistDownload('queue')}>
          <div className="flex flex-col">
            <span className="font-medium">Download All as Queue</span>
            <span className="text-xs text-gray-400">All files download one after another</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
