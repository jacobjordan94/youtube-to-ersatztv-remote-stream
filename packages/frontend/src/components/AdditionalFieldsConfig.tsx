import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AdditionalFieldsConfigProps {
  includeTitle: boolean;
  includePlot: boolean;
  plotFormat: 'string' | 'folded' | 'literal';
  includeYear: boolean;
  includeContentRating: boolean;
  contentRating: string;
  onIncludeTitleChange: (checked: boolean) => void;
  onIncludePlotChange: (checked: boolean) => void;
  onPlotFormatChange: (format: 'string' | 'folded' | 'literal') => void;
  onIncludeYearChange: (checked: boolean) => void;
  onIncludeContentRatingChange: (checked: boolean) => void;
  onContentRatingChange: (value: string) => void;
}

export function AdditionalFieldsConfig({
  includeTitle,
  includePlot,
  plotFormat,
  includeYear,
  includeContentRating,
  contentRating,
  onIncludeTitleChange,
  onIncludePlotChange,
  onPlotFormatChange,
  onIncludeYearChange,
  onIncludeContentRatingChange,
  onContentRatingChange,
}: AdditionalFieldsConfigProps) {
  return (
    <div>
      <Label className="text-sm text-white font-medium mb-3 block">Additional Fields</Label>
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="includeTitle"
            checked={includeTitle}
            onCheckedChange={(checked) => onIncludeTitleChange(checked === true)}
          />
          <label
            htmlFor="includeTitle"
            className="text-sm text-white font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Add title
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="includePlot"
            checked={includePlot}
            onCheckedChange={(checked) => onIncludePlotChange(checked === true)}
          />
          <label
            htmlFor="includePlot"
            className="text-sm text-white font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Add plot
            <span className="text-xs text-gray-400 ml-1">(from video description)</span>
          </label>
        </div>

        {/* Plot Format Selector - shown when includePlot is true */}
        {includePlot && (
          <div className="ml-6 space-y-2">
            <Label htmlFor="plotFormat" className="text-xs text-gray-300">
              Plot Format
            </Label>
            <Select
              value={plotFormat}
              onValueChange={(value) => onPlotFormatChange(value as typeof plotFormat)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="literal">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Literal (|) - Recommended</span>
                    <span className="text-xs text-gray-400">
                      Preserves line breaks and formatting
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="folded">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Folded (&gt;)</span>
                    <span className="text-xs text-gray-400">Converts line breaks to spaces</span>
                  </div>
                </SelectItem>
                <SelectItem value="string">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">String</span>
                    <span className="text-xs text-gray-400">Compact quoted format</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-300">
              Choose how multi-line plots are formatted in YAML
            </p>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox
            id="includeYear"
            checked={includeYear}
            onCheckedChange={(checked) => onIncludeYearChange(checked === true)}
          />
          <label
            htmlFor="includeYear"
            className="text-sm text-white font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Add year
            <span className="text-xs text-gray-400 ml-1">(from publish date)</span>
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="includeContentRating"
            checked={includeContentRating}
            onCheckedChange={(checked) => onIncludeContentRatingChange(checked === true)}
          />
          <label
            htmlFor="includeContentRating"
            className="text-sm text-white font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Add content rating
          </label>
        </div>

        {/* Content Rating Input - shown when includeContentRating is true */}
        {includeContentRating && (
          <div className="ml-6 space-y-2">
            <Label htmlFor="contentRating" className="text-xs text-gray-300">
              Content Rating
            </Label>
            <Input
              id="contentRating"
              value={contentRating}
              onChange={(e) => onContentRatingChange(e.target.value)}
              placeholder="e.g., TV-G, PG-13, TV-MA"
              className="w-full"
            />
            <p className="text-xs text-gray-300">Enter the content rating for this video</p>
          </div>
        )}
      </div>
    </div>
  );
}
