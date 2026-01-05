import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { PlaylistVideo } from '@youtube-to-ersatztv/shared';
import type { ConfigSettings } from '@/types/config';

interface SettingsModeToggleProps {
  settingsMode: 'global' | 'per-file';
  onModeToggle: (mode: 'global' | 'per-file') => void;

  // Per-file mode state
  applySettingsToNew: boolean;
  visitedFiles: Set<number>;
  playlistVideos: PlaylistVideo[];
  perFileSettings: Map<number, ConfigSettings>;
  onApplySettingsToNewChange: (checked: boolean) => void;

  // Per-file actions
  onApplyCurrentToUnvisited: () => void;
  onApplyCurrentToAll: () => void;
  onResetAll: () => void;
}

export function SettingsModeToggle({
  settingsMode,
  onModeToggle,
  applySettingsToNew,
  visitedFiles,
  playlistVideos,
  onApplySettingsToNewChange,
  onApplyCurrentToUnvisited,
  onApplyCurrentToAll,
  onResetAll,
}: SettingsModeToggleProps) {
  const unvisitedCount = playlistVideos.filter((_, index) => !visitedFiles.has(index)).length;

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <Label className="text-sm text-white font-medium">Settings Mode</Label>
          <p className="text-xs text-gray-400 mt-1">
            {settingsMode === 'global'
              ? 'Same configuration applies to all videos'
              : 'Customize each video individually'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={settingsMode === 'global' ? 'default' : 'outline'}
            onClick={() => onModeToggle('global')}
            className="text-sm"
          >
            Global Settings
          </Button>
          <Button
            variant={settingsMode === 'per-file' ? 'default' : 'outline'}
            onClick={() => onModeToggle('per-file')}
            className="text-sm"
          >
            Per-File Settings
          </Button>
        </div>
      </div>

      {/* Per-file options */}
      {settingsMode === 'per-file' && (
        <div className="pt-3 border-t border-gray-700 space-y-3">
          <div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="applySettingsToNew"
                checked={applySettingsToNew}
                onCheckedChange={(checked) => onApplySettingsToNewChange(checked === true)}
                disabled={unvisitedCount === 0}
              />
              <label
                htmlFor="applySettingsToNew"
                className="text-sm text-white font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Apply current settings to unvisited files while navigating
              </label>
            </div>
            <p className="text-xs text-gray-400 mt-2 ml-6">
              When enabled, current settings will be applied when navigating to a new file. When
              disabled, each file starts with its original settings. This option becomes disabled
              after all files have been visited.
            </p>
          </div>

          <div className="flex gap-2 border-t border-gray-700 pt-2">
            <div className="flex-1">
              <Button
                onClick={onApplyCurrentToUnvisited}
                variant="outline"
                size="sm"
                className="w-full"
                disabled={unvisitedCount === 0}
              >
                Apply Current Settings to Unvisited
              </Button>
            </div>
            <div className="flex-1">
              <Button onClick={onApplyCurrentToAll} variant="outline" size="sm" className="w-full">
                Apply Current Settings to All Files
              </Button>
            </div>
            <div className="flex-1">
              <Button onClick={onResetAll} variant="outline" size="sm" className="w-full">
                Reset All
              </Button>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">{unvisitedCount} unvisited file(s)</p>
        </div>
      )}
    </div>
  );
}
