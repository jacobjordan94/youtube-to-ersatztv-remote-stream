import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { FilenameFormat } from '@/types/config';

interface FilenameFormatSelectProps {
  filenameFormat: FilenameFormat;
  onFilenameFormatChange: (format: FilenameFormat) => void;
  isPlaylist: boolean;
  disabled?: boolean;
}

export function FilenameFormatSelect({
  filenameFormat,
  onFilenameFormatChange,
  isPlaylist,
  disabled = false,
}: FilenameFormatSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="filename-format" className="text-white">
        Filename Format
      </Label>
      <Select value={filenameFormat} onValueChange={onFilenameFormatChange} disabled={disabled}>
        <SelectTrigger id="filename-format">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="original">Original (My Video Title.yml)</SelectItem>
          <SelectItem value="compact">Compact (my-video-title.yml)</SelectItem>
          <SelectItem value="kebab">Kebab-case (My-Video-Title.yml)</SelectItem>
          <SelectItem value="snake">Snake_case (my_video_title.yml)</SelectItem>
          {isPlaylist && (
            <>
              <SelectItem value="sequential-prefix">Sequential Prefix (001-title.yml)</SelectItem>
              <SelectItem value="sequential-suffix">Sequential Suffix (title-001.yml)</SelectItem>
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
