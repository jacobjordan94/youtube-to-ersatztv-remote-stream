import { Separator } from './ui/separator';
import { AdditionalFieldsConfig } from './AdditionalFieldsConfig';
import { FilenameFormatSelect } from './FilenameFormatSelect';
import { ThumbnailConfig } from './ThumbnailConfig';
import type { FilenameFormat, ThumbnailResolution } from '@/types/config';

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

  // Thumbnail props
  includeThumbnail: boolean;
  thumbnailResolution: ThumbnailResolution;
  onIncludeThumbnailChange: (checked: boolean) => void;
  onThumbnailResolutionChange: (resolution: ThumbnailResolution) => void;

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
  includeThumbnail,
  thumbnailResolution,
  onIncludeThumbnailChange,
  onThumbnailResolutionChange,
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
      <div className="flex-1 space-y-4">
        <FilenameFormatSelect
          filenameFormat={filenameFormat}
          onFilenameFormatChange={onFilenameFormatChange}
          isPlaylist={isPlaylist}
          disabled={disabled}
        />
        <ThumbnailConfig
          includeThumbnail={includeThumbnail}
          thumbnailResolution={thumbnailResolution}
          onIncludeThumbnailChange={onIncludeThumbnailChange}
          onThumbnailResolutionChange={onThumbnailResolutionChange}
        />
      </div>
    </div>
  );
}
