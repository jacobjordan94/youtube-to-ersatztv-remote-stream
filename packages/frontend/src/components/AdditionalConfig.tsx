import { Separator } from './ui/separator';
import { AdditionalFieldsConfig } from './AdditionalFieldsConfig';
import { FilenameFormatSelect } from './FilenameFormatSelect';
import type { FilenameFormat } from '@/types/config';

interface AdditionalConfigProps {
  // Additional fields props
  includeTitle: boolean;
  includeDescription: boolean;
  descriptionFormat: 'string' | 'folded' | 'literal';
  onIncludeTitleChange: (checked: boolean) => void;
  onIncludeDescriptionChange: (checked: boolean) => void;
  onDescriptionFormatChange: (format: 'string' | 'folded' | 'literal') => void;

  // Filename format props
  filenameFormat: FilenameFormat;
  onFilenameFormatChange: (format: FilenameFormat) => void;
  isPlaylist: boolean;

  disabled: boolean;
}

export function AdditionalConfig({
  includeTitle,
  includeDescription,
  descriptionFormat,
  onIncludeTitleChange,
  onIncludeDescriptionChange,
  onDescriptionFormatChange,
  filenameFormat,
  onFilenameFormatChange,
  isPlaylist,
  disabled,
}: AdditionalConfigProps) {
  return (
    <div className="additional-options flex flex-row gap-4 items-stretch">
      <div className="flex-1">
        <AdditionalFieldsConfig
          includeTitle={includeTitle}
          includeDescription={includeDescription}
          descriptionFormat={descriptionFormat}
          onIncludeTitleChange={onIncludeTitleChange}
          onIncludeDescriptionChange={onIncludeDescriptionChange}
          onDescriptionFormatChange={onDescriptionFormatChange}
        />
      </div>
      <div className="flex items-stretch">
        <Separator orientation="vertical" className="bg-gray-600" />
      </div>
      <div className="flex-1">
        <FilenameFormatSelect
          filenameFormat={filenameFormat}
          onFilenameFormatChange={onFilenameFormatChange}
          isPlaylist={isPlaylist}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
