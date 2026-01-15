import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ThumbnailResolution } from '@/types/config';

interface ThumbnailConfigProps {
  includeThumbnail: boolean;
  thumbnailResolution: ThumbnailResolution;
  onIncludeThumbnailChange: (checked: boolean) => void;
  onThumbnailResolutionChange: (resolution: ThumbnailResolution) => void;
}

export function ThumbnailConfig({
  includeThumbnail,
  thumbnailResolution,
  onIncludeThumbnailChange,
  onThumbnailResolutionChange,
}: ThumbnailConfigProps) {
  return (
    <div>
      <Label className="text-sm text-white font-medium mb-3 block">Thumbnail Options</Label>
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="includeThumbnail"
            checked={includeThumbnail}
            onCheckedChange={(checked) => onIncludeThumbnailChange(checked === true)}
          />
          <label
            htmlFor="includeThumbnail"
            className="text-sm text-white font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Include thumbnail
            <span className="text-xs text-gray-400 ml-1">(downloaded as separate image)</span>
          </label>
        </div>

        {includeThumbnail && (
          <div className="ml-6 space-y-2">
            <Label htmlFor="thumbnailResolution" className="text-xs text-gray-300">
              Resolution
            </Label>
            <Select
              value={thumbnailResolution}
              onValueChange={(value) => onThumbnailResolutionChange(value as ThumbnailResolution)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="highest">Highest available</SelectItem>
                <SelectItem value="maxres">≤ Max Resolution (1280x720)</SelectItem>
                <SelectItem value="standard">≤ Standard (640x480)</SelectItem>
                <SelectItem value="high">≤ High (480x360)</SelectItem>
                <SelectItem value="medium">≤ Medium (320x180)</SelectItem>
                <SelectItem value="default">≤ Default (120x90)</SelectItem>
                <SelectItem value="lowest">Lowest available</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
}
