import { Separator } from './ui/separator';
import { AdditionalFieldsConfig } from './AdditionalFieldsConfig';
import { FilenameFormatSelect } from './FilenameFormatSelect';
import type { FilenameFormat } from '@/types/config';

interface AdditionalConfigProps {
  // Additional fields props
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

  // Filename format props
  filenameFormat: FilenameFormat;
  onFilenameFormatChange: (format: FilenameFormat) => void;
  isPlaylist: boolean;

  disabled: boolean;
}

export function AdditionalConfig({
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
          includePlot={includePlot}
          plotFormat={plotFormat}
          includeYear={includeYear}
          includeContentRating={includeContentRating}
          contentRating={contentRating}
          onIncludeTitleChange={onIncludeTitleChange}
          onIncludePlotChange={onIncludePlotChange}
          onPlotFormatChange={onPlotFormatChange}
          onIncludeYearChange={onIncludeYearChange}
          onIncludeContentRatingChange={onIncludeContentRatingChange}
          onContentRatingChange={onContentRatingChange}
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
