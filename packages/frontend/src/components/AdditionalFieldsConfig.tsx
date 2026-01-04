import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AdditionalFieldsConfigProps {
  includeTitle: boolean;
  includeDescription: boolean;
  descriptionFormat: 'string' | 'folded' | 'literal';
  onIncludeTitleChange: (checked: boolean) => void;
  onIncludeDescriptionChange: (checked: boolean) => void;
  onDescriptionFormatChange: (format: 'string' | 'folded' | 'literal') => void;
}

export function AdditionalFieldsConfig({
  includeTitle,
  includeDescription,
  descriptionFormat,
  onIncludeTitleChange,
  onIncludeDescriptionChange,
  onDescriptionFormatChange,
}: AdditionalFieldsConfigProps) {
  return (
    <div>
      <Label className="text-sm text-white font-medium mb-3 block">
        Additional Fields
      </Label>
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
            id="includeDescription"
            checked={includeDescription}
            onCheckedChange={(checked) => onIncludeDescriptionChange(checked === true)}
          />
          <label
            htmlFor="includeDescription"
            className="text-sm text-white font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Add description
          </label>
        </div>

        {/* Description Format Selector - shown when includeDescription is true */}
        {includeDescription && (
          <div className="ml-6 space-y-2">
            <Label htmlFor="descriptionFormat" className="text-xs text-gray-300">
              Description Format
            </Label>
            <Select
              value={descriptionFormat}
              onValueChange={(value) => onDescriptionFormatChange(value as typeof descriptionFormat)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="literal">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Literal (|) - Recommended</span>
                    <span className="text-xs text-gray-400">Preserves line breaks and formatting</span>
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
              Choose how multi-line descriptions are formatted in YAML
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
